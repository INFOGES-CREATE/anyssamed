// src/app/(dashboard)/secretaria/tareas/[id]/page.tsx
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
// COMPONENTE PRINCIPAL (DETALLE TAREA)
// ========================================

const roleParam = "secretaria";
const roleLabel = "Secretaria";

export default function DetalleTareaSecretariaPage() {
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
  const [temaActual, setTemaActual] = useState<TemaColor>("light");

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

  // Acciones UI
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [guardandoComentario, setGuardandoComentario] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [cambiandoPrioridad, setCambiandoPrioridad] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);

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
    if (pathname === "/secretaria") return "dashboard";
    if (pathname.startsWith("/secretaria/tareas")) return "tareas";
    if (pathname.startsWith("/secretaria/agenda")) return "agenda";
    if (pathname.startsWith("/secretaria/confirmaciones"))
      return "confirmaciones";
    if (pathname.startsWith("/secretaria/llamadas")) return "llamadas";
    if (pathname.startsWith("/secretaria/pacientes")) return "pacientes";
    if (pathname.startsWith("/secretaria/medicos")) return "medicos";
    if (pathname.startsWith("/secretaria/recordatorios"))
      return "recordatorios";
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
  // MENU DE NAVEGACIÓN ESPECÍFICO SECRETARIA
  // ========================================

 

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

  // Cargar tarea + estadísticas
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

    // TAREA + HISTORIAL + ADJUNTOS desde /api/tareas/[id]
    if (resT.ok && dataT.success && dataT.tarea) {
      const t = dataT.tarea as TareaDetalle;
      setTarea(t);

      // Historial y adjuntos siguen viniendo del detalle de tarea
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

    // ESTADÍSTICAS
    if (resE.ok && dataE.success) {
      setEstadisticas(dataE.estadisticas as EstadisticasTareas);
    }

    // COMENTARIOS SIEMPRE DESDE /api/tareas/[id]/comentarios
    if (resC.ok && dataC.success && Array.isArray(dataC.comentarios)) {
      setComentarios(dataC.comentarios as ComentarioTarea[]);
    } else if (resT.ok && dataT.success) {
      // Fallback por si algún día devuelves comentarios también en /api/tareas/[id]
      const t = dataT.tarea as TareaDetalle;
      setComentarios(
        (dataT.comentarios || t.comentarios || []) as ComentarioTarea[]
      );
    } else {
      setComentarios([]);
    }
  } catch (error) {
    console.error("Error al cargar detalle de tarea/estadísticas/comentarios:", error);
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

      setTarea((prev) =>
        prev ? { ...prev, estado: nuevoEstado } : prev
      );
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
      router.push("/secretaria/tareas");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    } finally {
      setEliminando(false);
    }
  };

  const irAEditar = () => {
    if (!tarea) return;
    router.push(`/secretaria/tareas/${tarea.id_tarea}/editar`);
  };

  const irAHistorial = () => {
    if (!tarea) return;
    router.push(`/secretaria/tareas/${tarea.id_tarea}/historial`);
  };

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loadingUsuario || (loadingTarea && !tarea)) {
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
            Cargando detalle de la tarea...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando la vista premium de gestión avanzada
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
            Debes iniciar sesión para acceder al detalle de tareas de
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
                placeholder="Buscar en tus tareas (usa CTRL+K en la vista general para ir rápido)"
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                readOnly
                onClick={() => router.push("/secretaria/tareas")}
              />
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
        {/* Encabezado detalle */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/secretaria/tareas")}
              className={`inline-flex items-center gap-2 px-3 py-1.5 mb-3 rounded-full text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <ArrowLeft className="w-3 h-3" />
              Volver a mis tareas
            </button>
            <h2
              className={`text-3xl md:text-4xl font-black mb-1 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">👋</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Vista premium de detalle de tarea · Rol:{" "}
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
              disabled={loadingTarea || loadingEstadisticas}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingTarea || loadingEstadisticas ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
            <button
              onClick={irAHistorial}
              disabled={!tarea}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50`}
            >
              <History className="w-4 h-4" />
              Ver historial
            </button>
            <button
              onClick={irAEditar}
              disabled={!tarea || !tarea.puede_editar}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-40`}
            >
              <Edit className="w-4 h-4" />
              Editar tarea
            </button>
          </div>
        </div>

        {/* Si no hay tarea */}
        {!loadingTarea && !tarea && (
          <div
            className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-10`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Tarea no encontrada
                </h3>
                <p className={tema.colores.textoSecundario}>
                  No pudimos encontrar la tarea solicitada. Es posible que haya
                  sido eliminada o que el enlace no sea válido.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/secretaria/tareas")}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al listado de tareas
            </button>
          </div>
        )}

        {/* Contenido cuando hay tarea */}
        {tarea && (
          <>
            {/* Hero + resumen */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Hero */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-semibold uppercase tracking-wide">
                      <CheckSquare2 className="w-3 h-3" />
                      <span>Tarea #{tarea.id_tarea}</span>
                      {tarea.es_favorita && (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          ·
                          <Star className="w-3 h-3 fill-amber-400" />
                          Favorita
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-2xl md:text-3xl font-black ${tema.colores.texto} break-words`}
                    >
                      {tarea.titulo}
                    </h3>
                    <p
                      className={`text-sm md:text-base ${tema.colores.textoSecundario} whitespace-pre-line`}
                    >
                      {tarea.descripcion_larga || tarea.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={toggleFavorita}
                      className={`p-2 rounded-full border ${tema.colores.borde} ${tema.colores.hover} ${tema.colores.sombra} transition-all hover:scale-110`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          tarea.es_favorita
                            ? "text-amber-400"
                            : tema.colores.textoSecundario
                        }`}
                        fill={tarea.es_favorita ? "currentColor" : "none"}
                      />
                    </button>

                    <div className="space-y-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                          tarea.prioridad
                        )}`}
                      >
                        <Flame className="w-3 h-3" />
                        {tarea.prioridad.toUpperCase()}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(
                          ["critica", "urgente", "alta", "media", "baja"] as TareaPrioridad[]
                        ).map((p) => (
                          <button
                            key={p}
                            onClick={() => cambiarPrioridad(p)}
                            disabled={cambiandoPrioridad}
                            className={`px-2 py-0.5 rounded-full text-[10px] border ${
                              tarea.prioridad === p
                                ? obtenerColorPrioridad(p)
                                : "bg-black/5 text-xs text-gray-400 border-transparent hover:border-white/20"
                            } disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-black/5 border border-white/5 ${tema.colores.textoSecundario}`}
                  >
                    <Activity className="w-3 h-3" />
                    Estado:
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full border ${obtenerColorEstado(
                        tarea.estado
                      )}`}
                    >
                      {tarea.estado.replace("_", " ").toUpperCase()}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-black/5 border border-white/5">
                    <UserCheck className="w-3 h-3" />
                    Responsable:
                    <span className="font-semibold">
                      {tarea.responsable.nombre_completo}
                    </span>
                    <span className="text-[10px] opacity-70">
                      ({tarea.responsable.rol})
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-black/5 border border-white/5">
                    <User className="w-3 h-3" />
                    Creador:
                    <span className="font-semibold">
                      {tarea.creador.nombre_completo}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-black/5 border border-white/5">
                    <MapPin className="w-3 h-3" />
                    {tarea.centro?.nombre || "Sin centro"}
                    {tarea.sucursal && (
                      <span className="text-[10px] opacity-70">
                        · {tarea.sucursal.nombre}
                      </span>
                    )}
                  </span>

                  <span className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-black/5 border border-white/5">
                    <Calendar className="w-3 h-3" />
                    Creada:{" "}
                    <span className="font-semibold">
                      {formatearFecha(tarea.fecha_creacion)}
                    </span>
                    <span className="opacity-60">·</span>
                    Límite:{" "}
                    <span className="font-semibold">
                      {formatearFecha(tarea.fecha_limite)}
                    </span>
                  </span>
                </div>

                {tarea.tags && tarea.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {tarea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen rápido */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Resumen de impacto
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Estado, riesgo y avance de esta tarea
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Estado actual
                    </span>
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
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Prioridad
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                        tarea.prioridad
                      )}`}
                    >
                      <Flame className="w-3 h-3" />
                      {tarea.prioridad.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Vencimiento
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-black/10`}
                    >
                      <CalendarClock className="w-3 h-3" />
                      {formatearFecha(tarea.fecha_limite)}
                    </span>
                  </div>

                  {progresoTarea && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Avance checklist
                        </span>
                        <span
                          className={`text-xs font-bold ${tema.colores.texto}`}
                        >
                          {progresoTarea.completadas}/{progresoTarea.total} ·{" "}
                          {progresoTarea.porcentaje}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${tema.colores.gradiente}`}
                          style={{
                            width: `${progresoTarea.porcentaje}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-black/5 p-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className={tema.colores.textoSecundario}>
                          Criticidad global
                        </span>
                        {obtenerIconoTendencia(
                          estadisticas?.criticas ?? 0
                        )}
                      </div>
                      <div
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        {estadisticas?.criticas ?? 0}
                      </div>
                      <span className="text-[10px] opacity-70">
                        Tareas críticas en tu bandeja
                      </span>
                    </div>

                    <div className="rounded-xl bg-black/5 p-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className={tema.colores.textoSecundario}>
                          Vencidas hoy
                        </span>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <div
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        {estadisticas?.vencidas ?? 0}
                      </div>
                      <span className="text-[10px] opacity-70">
                        Revisa fechas límite con prioridad
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Zona principal: descripción, checklist, historial y comentarios */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Columna izquierda (2/3) */}
              <div className="xl:col-span-2 space-y-6">
                {/* Descripción detallada */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                      >
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          Detalle funcional de la tarea
                        </h3>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Contexto ampliado para que cualquier persona entienda
                          qué hay que hacer
                        </p>
                      </div>
                    </div>
                  </div>

                  <p
                    className={`text-sm md:text-base leading-relaxed ${tema.colores.textoSecundario} whitespace-pre-line`}
                  >
                    {tarea.descripcion_larga || tarea.descripcion}
                  </p>
                </div>

                {/* Checklist / subtareas */}
                {tarea.subtareas && tarea.subtareas.length > 0 && (
                  <div
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                        >
                          <ClipboardCheck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3
                            className={`text-lg font-black ${tema.colores.texto}`}
                          >
                            Checklist operativo
                          </h3>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Marca los pasos completados para ver el avance en
                            tiempo real
                          </p>
                        </div>
                      </div>
                      {progresoTarea && (
                        <span
                          className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                        >
                          {progresoTarea.completadas}/{progresoTarea.total} pasos
                          completados
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {tarea.subtareas.map((s) => (
                        <button
                          key={s.id_subtarea}
                          onClick={() => marcarSubtarea(s, !s.completada)}
                          className={`w-full flex items-start gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                            s.completada
                              ? "bg-emerald-500/10 border border-emerald-500/40"
                              : "bg-black/5 border border-white/5 hover:border-indigo-400/60"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center ${
                              s.completada
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-gray-500/40"
                            }`}
                          >
                            {s.completada && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              s.completada
                                ? "line-through opacity-70"
                                : tema.colores.texto
                            }`}
                          >
                            {s.titulo}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historial */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                      >
                        <History className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          Línea de tiempo de cambios
                        </h3>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Seguimiento completo de quién hizo qué y cuándo
                        </p>
                      </div>
                    </div>
                  </div>

                  {historial.length === 0 ? (
                    <p className={tema.colores.textoSecundario}>
                      Aún no hay historial para esta tarea.
                    </p>
                  ) : (
                    <div className="relative pl-4 max-h-72 overflow-y-auto custom-scrollbar">
                      <div className="absolute left-1 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/70 via-indigo-500/20 to-transparent" />
                      <div className="space-y-4">
                        {historial.map((h) => (
                          <div
                            key={h.id_historial}
                            className="relative flex gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-md" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-sm font-semibold ${tema.colores.texto}`}
                                >
                                  {h.accion}
                                </p>
                                <span
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  {formatearFechaHora(h.fecha)}
                                </span>
                              </div>
                              <p
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                Por {h.usuario}
                              </p>
                              {h.detalle && (
                                <p className="text-xs mt-1 text-gray-400">
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

                {/* Comentarios */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                      >
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-black ${tema.colores.texto}`}
                        >
                          Conversación sobre la tarea
                        </h3>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Coordina con tu equipo sin salir del módulo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nuevo comentario */}
                  <div className="mb-4">
                    <div
                      className={`rounded-2xl border ${tema.colores.borde} ${tema.colores.card} p-3 flex gap-3`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold`}
                      >
                        {usuario.foto_perfil_url ? (
                          <Image
                            src={usuario.foto_perfil_url}
                            alt={usuario.nombre}
                            width={36}
                            height={36}
                            className="rounded-xl object-cover"
                          />
                        ) : (
                          `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <textarea
                          value={nuevoComentario}
                          onChange={(e) => setNuevoComentario(e.target.value)}
                          rows={2}
                          placeholder="Escribe un comentario para coordinar esta tarea..."
                          className={`w-full text-sm bg-transparent border-none outline-none resize-none ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Paperclip className="w-3 h-3" />
                            <span>Adjuntos desde la vista de documentos</span>
                          </div>
                          <button
                            onClick={agregarComentario}
                            disabled={
                              guardandoComentario ||
                              !nuevoComentario.trim().length
                            }
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {guardandoComentario && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Enviar comentario
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

{/* Lista de comentarios */}
{comentarios.length === 0 ? (
  <p className={tema.colores.textoSecundario}>
    Aún no hay comentarios. Inicia la conversación con tu equipo.
  </p>
) : (
  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
    {comentarios.map((c) => {
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
          className="flex gap-3 rounded-2xl bg-black/5 p-3"
        >
          {/* AVATAR */}
          <div
            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {autor.foto_perfil_url ? (
              <Image
                src={autor.foto_perfil_url}
                alt={autor.nombre_completo}
                width={32}
                height={32}
                className="rounded-xl object-cover"
              />
            ) : (
              iniciales
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Nombre y fecha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  {autor.nombre_completo}
                </p>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full bg-black/10 ${tema.colores.textoSecundario}`}
                >
                  {autor.rol}
                  {c.es_del_responsable && " · Responsable"}
                </span>
              </div>

              <span className={`text-[11px] ${tema.colores.textoSecundario}`}>
                {formatearFechaHora(c.fecha)}
              </span>
            </div>

            {/* Contenido */}
            <p className={`text-sm mt-1 ${tema.colores.textoSecundario}`}>
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

              {/* Columna derecha (metadatos y adjuntos) */}
              <div className="space-y-6">
                {/* Información de responsables */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Equipo asociado
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Personas clave involucradas en esta tarea
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className={tema.colores.texto}>Responsable</p>
                        <p className="font-semibold">
                          {tarea.responsable.nombre_completo}
                        </p>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          {tarea.responsable.rol}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className={tema.colores.texto}>Creador</p>
                        <p className="font-semibold">
                          {tarea.creador.nombre_completo}
                        </p>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          {tarea.creador.rol}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Centro y fechas */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Contexto asistencial
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Dónde se ejecuta esta tarea dentro de la red
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Centro de salud
                      </p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {tarea.centro?.nombre || "Sin centro asignado"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Sucursal / dispositivo
                      </p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {tarea.sucursal?.nombre || "Sin sucursal asignada"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-black/5 p-3">
                        <p className={tema.colores.textoSecundario}>
                          Fecha de creación
                        </p>
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          {formatearFecha(tarea.fecha_creacion)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black/5 p-3">
                        <p className={tema.colores.textoSecundario}>
                          Fecha límite
                        </p>
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          {formatearFecha(tarea.fecha_limite)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjuntos */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Paperclip className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Archivos adjuntos
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Documentos que respaldan esta tarea
                      </p>
                    </div>
                  </div>

                  {adjuntos.length === 0 ? (
                    <p className={tema.colores.textoSecundario}>
                      No hay archivos adjuntos registrados para esta tarea.
                    </p>
                  ) : (
                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto custom-scrollbar">
                      {adjuntos.map((a) => (
                        <a
                          key={a.id_adjunto}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-black/5 border border-white/5 hover:border-indigo-400/60 hover:bg-black/10 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <div className="min-w-0">
                              <p
                                className={`text-sm truncate ${tema.colores.texto}`}
                              >
                                {a.nombre_archivo}
                              </p>
                              <p
                                className={`text-[11px] ${tema.colores.textoSecundario}`}
                              >
                                {a.tipo} · Subido el{" "}
                                {formatearFecha(a.fecha_subida)}
                              </p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Acciones peligrosas */}
                <div
                  className={`rounded-2xl p-6 border border-red-500/40 bg-red-500/5 ${tema.colores.sombra}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <Trash className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-red-300">
                          Zona de acciones avanzadas
                        </h3>
                        <p className="text-[11px] text-red-200/80">
                          Eliminar la tarea la quitará de todos los paneles y
                          reportes.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalEliminarAbierto(true)}
                    disabled={!tarea.puede_eliminar}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all"
                  >
                    <Trash className="w-4 h-4" />
                    Eliminar tarea definitivamente
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Modal eliminar */}
        {modalEliminarAbierto && tarea && (
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
                  "{tarea.titulo}"
                </span>
                ? Esta acción no se puede deshacer y se sacará de todos los
                reportes.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setModalEliminarAbierto(false)}
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
              v1.0.0 PREMIUM · Detalle
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
