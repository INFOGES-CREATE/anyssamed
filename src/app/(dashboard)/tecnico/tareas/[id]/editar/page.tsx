// src/app/(dashboard)/secretaria/tareas/[id]/editar/page.tsx
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
  ArrowLeft,
  Stethoscope,
  FileSpreadsheet,
  Pill,
  PhoneOutgoing,
  PhoneIncoming,
  Save,
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

interface FormularioTarea {
  titulo: string;
  descripcion: string;
  prioridad: TareaPrioridad;
  estado: TareaEstado;
  tipo: string;
  id_centro: number | null;
  id_sucursal: number | null;
  fecha_limite: string | null;
  tags: string[];
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
// COMPONENTE PRINCIPAL (EDITAR TAREA)
// ========================================

const roleParam = "secretaria";
const roleLabel = "Secretaria";

export default function EditarTareaSecretariaPage() {
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
  const [guardando, setGuardando] = useState(false);

  

  // Datos tarea
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTareas | null>(
    null
  );
  const [historial, setHistorial] = useState<EventoHistorial[]>([]);

  // Catálogos
  const [centros, setCentros] = useState<CentroResumen[]>([]);
  const [sucursales, setSucursales] = useState<SucursalResumen[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>([]);

  // Formulario
  const [form, setForm] = useState<FormularioTarea | null>(null);
  const [formInicial, setFormInicial] = useState<FormularioTarea | null>(null);
  const [tieneCambios, setTieneCambios] = useState(false);
  const [nuevoTag, setNuevoTag] = useState("");

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );

  // UI
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

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
  // MENU DE NAVEGACIÓN
  // ========================================


  // ========================================
  // EFECTOS
  // ========================================

  // Fondo global
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

  // Cargar tarea, estadísticas y catálogos
  useEffect(() => {
    if (!usuario || !tareaId || Number.isNaN(tareaId)) return;

    const cargarTodo = async () => {
      try {
        setLoadingTarea(true);

        const [resTarea, resEst, resCatalogos, resHist] = await Promise.all([
          fetch(`/api/tareas/${tareaId}?rol=${roleParam}`, {
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
          // Ajusta esta ruta a tu API real de catálogos
          fetch(`/api/tareas/catalogos?rol=${roleParam}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }).catch(() => null),
          fetch(`/api/tareas/${tareaId}/historial`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }).catch(() => null),
        ]);

        const dataTarea = await resTarea.json().catch(() => ({}));
        if (!resTarea.ok || !dataTarea.success || !dataTarea.tarea) {
          console.error("No se pudo cargar la tarea", dataTarea);
        } else {
          const t = dataTarea.tarea as Tarea;
          setTarea(t);

          const baseForm: FormularioTarea = {
            titulo: t.titulo,
            descripcion: t.descripcion || "",
            prioridad: t.prioridad,
            estado: t.estado,
            tipo: t.tipo,
            id_centro: t.centro?.id_centro ?? null,
            id_sucursal: t.sucursal?.id_sucursal ?? null,
            fecha_limite: extraerFechaInput(t.fecha_limite),
            tags: Array.isArray(t.tags) ? t.tags : [],
          };

          setForm(baseForm);
          setFormInicial(baseForm);
          setTieneCambios(false);
        }

        const dataEst = await resEst.json().catch(() => ({}));
        if (resEst.ok && dataEst.success) {
          setEstadisticas(dataEst.estadisticas as EstadisticasTareas);
        }

        if (resCatalogos && resCatalogos.ok) {
          const dataCat = await resCatalogos.json().catch(() => ({}));
          if (dataCat.centros) setCentros(dataCat.centros as CentroResumen[]);
          if (dataCat.sucursales)
            setSucursales(dataCat.sucursales as SucursalResumen[]);
          if (dataCat.tipos)
            setTiposDisponibles(
              (dataCat.tipos as string[]).length
                ? (dataCat.tipos as string[])
                : []
            );
        } else {
          // Fallback: tipos desde tarea
          setTiposDisponibles((prev) =>
            prev.length || !tarea
              ? prev
              : [tarea.tipo || "secretaria"].filter(Boolean)
          );
        }

        if (resHist && resHist.ok) {
          const dataHist = await resHist.json().catch(() => ({}));
          if (dataHist.success && Array.isArray(dataHist.historial)) {
            setHistorial(dataHist.historial as EventoHistorial[]);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos de edición de tarea:", error);
      } finally {
        setLoadingTarea(false);
        setLoadingHistorial(false);
      }
    };

    cargarTodo();
  }, [usuario, tareaId]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!form || !formInicial) {
      setTieneCambios(false);
      return;
    }
    const a = JSON.stringify(form);
    const b = JSON.stringify(formInicial);
    setTieneCambios(a !== b);
  }, [form, formInicial]);

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

  const extraerFechaInput = (fecha: string | null): string | null => {
    if (!fecha) return null;
    // Si ya viene yyyy-mm-dd lo dejamos
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  const estaDeshabilitado = (campo: keyof FormularioTarea) => {
    // Si la tarea no se puede editar, todo deshabilitado
    if (tarea && tarea.puede_editar === false) return true;
    // Ejemplo: podrías bloquear algunos campos según estado
    if (tarea && tarea.estado === "completada") {
      if (campo === "prioridad" || campo === "estado" || campo === "fecha_limite")
        return false;
      return true;
    }
    return false;
  };

  const centroSeleccionado = useMemo(
    () =>
      centros.find((c) => c.id_centro === (form?.id_centro ?? undefined)) ||
      tarea?.centro ||
      null,
    [centros, form?.id_centro, tarea?.centro]
  );

  const sucursalesFiltradas = useMemo(() => {
    if (!form?.id_centro) return sucursales;
    return sucursales.filter((s) => s.id_centro === form.id_centro);
  }, [sucursales, form?.id_centro]);

  const handleChange = <K extends keyof FormularioTarea>(
    campo: K,
    valor: FormularioTarea[K]
  ) => {
    if (!form) return;
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [campo]: valor,
          }
        : prev
    );
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = nuevoTag.trim();
      if (!val || !form) return;
      if (form.tags.includes(val)) {
        setNuevoTag("");
        return;
      }
      setForm({ ...form, tags: [...form.tags, val] });
      setNuevoTag("");
    }
  };

  const eliminarTag = (tag: string) => {
    if (!form) return;
    setForm({
      ...form,
      tags: form.tags.filter((t) => t !== tag),
    });
  };

  const recargarTarea = async () => {
    if (!tareaId) return;
    try {
      setLoadingTarea(true);
      const res = await fetch(`/api/tareas/${tareaId}?rol=${roleParam}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.tarea) {
        const t = data.tarea as Tarea;
        setTarea(t);
        const baseForm: FormularioTarea = {
          titulo: t.titulo,
          descripcion: t.descripcion || "",
          prioridad: t.prioridad,
          estado: t.estado,
          tipo: t.tipo,
          id_centro: t.centro?.id_centro ?? null,
          id_sucursal: t.sucursal?.id_sucursal ?? null,
          fecha_limite: extraerFechaInput(t.fecha_limite),
          tags: Array.isArray(t.tags) ? t.tags : [],
        };
        setForm(baseForm);
        setFormInicial(baseForm);
        setTieneCambios(false);
      }
    } catch (error) {
      console.error("Error al recargar tarea:", error);
    } finally {
      setLoadingTarea(false);
    }
  };

  const guardarTarea = async () => {
    if (!tarea || !form) return;
    try {
      setGuardando(true);
      const res = await fetch(`/api/tareas/${tarea.id_tarea}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          titulo: form.titulo,
          descripcion: form.descripcion,
          prioridad: form.prioridad,
          estado: form.estado,
          tipo_tarea: form.tipo,
          id_centro: form.id_centro,
          id_sucursal: form.id_sucursal,
          fecha_limite: form.fecha_limite,
          tags: form.tags,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        alert("No se pudieron guardar los cambios de la tarea");
        return;
      }

      const tareaActualizada = (data.tarea as Tarea) ?? tarea;
      setTarea(tareaActualizada);

      const baseForm: FormularioTarea = {
        titulo: tareaActualizada.titulo,
        descripcion: tareaActualizada.descripcion || "",
        prioridad: tareaActualizada.prioridad,
        estado: tareaActualizada.estado,
        tipo: tareaActualizada.tipo,
        id_centro: tareaActualizada.centro?.id_centro ?? null,
        id_sucursal: tareaActualizada.sucursal?.id_sucursal ?? null,
        fecha_limite: extraerFechaInput(tareaActualizada.fecha_limite),
        tags: Array.isArray(tareaActualizada.tags)
          ? tareaActualizada.tags
          : [],
      };
      setForm(baseForm);
      setFormInicial(baseForm);
      setTieneCambios(false);

      // Recargar historial
      try {
        const resHist = await fetch(`/api/tareas/${tarea.id_tarea}/historial`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const dataHist = await resHist.json().catch(() => ({}));
        if (resHist.ok && dataHist.success && Array.isArray(dataHist.historial)) {
          setHistorial(dataHist.historial as EventoHistorial[]);
        }
      } catch (e) {
        console.error("Error al recargar historial:", e);
      }
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      alert("Ha ocurrido un error inesperado al guardar la tarea");
    } finally {
      setGuardando(false);
    }
  };

  const volverADetalle = () => {
    if (tarea) router.push(`/secretaria/tareas/${tarea.id_tarea}`);
    else router.push("/secretaria/tareas");
  };

  const volverALista = () => {
    if (tieneCambios && !guardando) {
      const ok = window.confirm(
        "Tienes cambios sin guardar. ¿Seguro que deseas salir sin guardar?"
      );
      if (!ok) return;
    }
    router.push("/secretaria/tareas");
  };

  // ========================================
  // RENDER LOADING / ACCESO
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
              <Edit className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Preparando editor de tareas...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Cargando datos de la tarea y tu sesión de secretaria
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
            No se pudo identificar el identificador de la tarea a editar.
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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={volverADetalle}
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al detalle
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-xl md:text-2xl font-black truncate ${tema.colores.texto}`}
                >
                  {tarea ? tarea.titulo : "Editar tarea"}
                </h2>
                {tieneCambios && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/40 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Cambios sin guardar
                  </span>
                )}
              </div>
              <p
                className={`text-xs md:text-sm ${tema.colores.textoSecundario}`}
              >
                {obtenerSaludo()}, {usuario.nombre}. Estás editando una tarea
                crítica para la gestión de tu centro.
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

            {/* Botón guardar */}
            <button
              onClick={guardarTarea}
              disabled={!tieneCambios || guardando || !form}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${
                tieneCambios
                  ? `${tema.colores.primario} text-white`
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              } ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {guardando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar cambios
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
        {/* Breadcrumb y acciones rápidas */}
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
              <span className={tema.colores.textoSecundario}>Editar</span>
            </div>
            <h2
              className={`text-3xl md:text-4xl font-black flex items-center gap-2 ${tema.colores.texto}`}
            >
              Editor inteligente de tareas
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </h2>
            <p className={tema.colores.textoSecundario}>
              Ajusta título, prioridad, estado, fechas, centro, sucursal y
              etiquetas sin perder el contexto clínico de la tarea.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={recargarTarea}
              disabled={loadingTarea}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingTarea ? "animate-spin" : ""
                }`}
              />
              Recargar desde servidor
            </button>
            <button
              onClick={guardarTarea}
              disabled={!tieneCambios || guardando || !form}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${
                tieneCambios
                  ? `${tema.colores.primario} text-white`
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              } ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-50`}
            >
              {guardando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar cambios
            </button>
          </div>
        </div>

        {/* Contenido: formulario + resumen/historial */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Columna principal: formulario */}
          <div className="xl:col-span-2 space-y-6">
            {/* Contenedor con borde gradiente premium */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500">
              <div
                className={`rounded-[1.4rem] p-6 md:p-7 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                {loadingTarea || !tarea || !form ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-6 w-48 bg-gray-500/20 rounded" />
                    <div className="h-10 w-full bg-gray-500/20 rounded" />
                    <div className="h-24 w-full bg-gray-500/20 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-gray-500/20 rounded" />
                      <div className="h-10 bg-gray-500/20 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-gray-500/20 rounded" />
                      <div className="h-10 bg-gray-500/20 rounded" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Encabezado del formulario */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
                          >
                            <ClipboardList className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                            <Edit className="w-3 h-3" />
                          </div>
                        </div>
                        <div>
                          <h3
                            className={`text-xl font-black flex items-center gap-2 ${tema.colores.texto}`}
                          >
                            Datos principales de la tarea
                            {tarea.puede_editar === false && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/40">
                                <Lock className="w-3 h-3" />
                                Solo lectura
                              </span>
                            )}
                          </h3>
                          <p
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Los cambios se registran en el historial interno
                            para auditoría y trazabilidad clínica.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-xs">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${obtenerColorEstado(
                            form.estado
                          )}`}
                        >
                          <Activity className="w-3 h-3" />
                          Estado actual:{" "}
                          <strong>{form.estado.toUpperCase()}</strong>
                        </span>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${obtenerColorPrioridad(
                            form.prioridad
                          )}`}
                        >
                          <Flame className="w-3 h-3" />
                          Prioridad:{" "}
                          <strong>{form.prioridad.toUpperCase()}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Campos principales */}
                    <div className="space-y-5">
                      {/* Título */}
                      <div className="space-y-1.5">
                        <label
                          className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                        >
                          Título de la tarea
                        </label>
                        <input
                          type="text"
                          value={form.titulo}
                          disabled={estaDeshabilitado("titulo")}
                          onChange={(e) =>
                            handleChange("titulo", e.target.value)
                          }
                          placeholder="Ej: Confirmar asistencia de pacientes crónicos a control médico"
                          className={`w-full px-4 py-3 rounded-xl text-sm ${
                            tema.colores.card
                          } ${tema.colores.borde} border ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                            estaDeshabilitado("titulo")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>

                      {/* Descripción */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                          >
                            Descripción detallada
                          </label>
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            Explica brevemente el contexto clínico y operativo
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={form.descripcion}
                          disabled={estaDeshabilitado("descripcion")}
                          onChange={(e) =>
                            handleChange("descripcion", e.target.value)
                          }
                          className={`w-full px-4 py-3 rounded-xl text-sm ${
                            tema.colores.card
                          } ${tema.colores.borde} border ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none ${
                            estaDeshabilitado("descripcion")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                          placeholder="Ej: Llamar a todos los pacientes con control de hipertensión programado esta semana y confirmar asistencia o reagendar en caso necesario."
                        />
                      </div>

                      {/* Tipo, prioridad, estado */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label
                            className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                          >
                            Tipo de tarea
                          </label>
                          <select
                            value={form.tipo}
                            disabled={estaDeshabilitado("tipo")}
                            onChange={(e) =>
                              handleChange("tipo", e.target.value)
                            }
                            className={`w-full px-3 py-2.5 rounded-xl text-sm ${
                              tema.colores.card
                            } ${tema.colores.borde} border ${
                              tema.colores.texto
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                              estaDeshabilitado("tipo")
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {tiposDisponibles.length === 0 && (
                              <option value={form.tipo}>{form.tipo}</option>
                            )}
                            {tiposDisponibles.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                          >
                            Prioridad
                          </label>
                          <select
                            value={form.prioridad}
                            disabled={estaDeshabilitado("prioridad")}
                            onChange={(e) =>
                              handleChange(
                                "prioridad",
                                e.target.value as TareaPrioridad
                              )
                            }
                            className={`w-full px-3 py-2.5 rounded-xl text-sm ${
                              tema.colores.card
                            } ${tema.colores.borde} border ${
                              tema.colores.texto
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                              estaDeshabilitado("prioridad")
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <option value="critica">Crítica</option>
                            <option value="urgente">Urgente</option>
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                          >
                            Estado
                          </label>
                          <select
                            value={form.estado}
                            disabled={estaDeshabilitado("estado")}
                            onChange={(e) =>
                              handleChange(
                                "estado",
                                e.target.value as TareaEstado
                              )
                            }
                            className={`w-full px-3 py-2.5 rounded-xl text-sm ${
                              tema.colores.card
                            } ${tema.colores.borde} border ${
                              tema.colores.texto
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                              estaDeshabilitado("estado")
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="en_revision">En revisión</option>
                            <option value="completada">Completada</option>
                            <option value="rechazada">Rechazada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </div>
                      </div>

                      {/* Centro / Sucursal / Fechas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label
                              className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                            >
                              Centro de salud asociado
                            </label>
                            <select
                              value={form.id_centro ?? ""}
                              disabled={estaDeshabilitado("id_centro")}
                              onChange={(e) =>
                                handleChange(
                                  "id_centro",
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null
                                )
                              }
                              className={`w-full px-3 py-2.5 rounded-xl text-sm ${
                                tema.colores.card
                              } ${tema.colores.borde} border ${
                                tema.colores.texto
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                estaDeshabilitado("id_centro")
                                  ? "opacity-70 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <option value="">
                                {centroSeleccionado
                                  ? centroSeleccionado.nombre
                                  : "Sin centro / Administrativo"}
                              </option>
                              {centros.map((c) => (
                                <option key={c.id_centro} value={c.id_centro}>
                                  {c.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label
                              className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                            >
                              Sucursal / Unidad
                            </label>
                            <select
                              value={form.id_sucursal ?? ""}
                              disabled={estaDeshabilitado("id_sucursal")}
                              onChange={(e) =>
                                handleChange(
                                  "id_sucursal",
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null
                                )
                              }
                              className={`w-full px-3 py-2.5 rounded-xl text-sm ${
                                tema.colores.card
                              } ${tema.colores.borde} border ${
                                tema.colores.texto
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                estaDeshabilitado("id_sucursal")
                                  ? "opacity-70 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <option value="">
                                {tarea.sucursal?.nombre ?? "Sin sucursal"}
                              </option>
                              {sucursalesFiltradas.map((s) => (
                                <option
                                  key={s.id_sucursal}
                                  value={s.id_sucursal}
                                >
                                  {s.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label
                              className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                            >
                              Fecha límite de la tarea
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={form.fecha_limite ?? ""}
                                disabled={estaDeshabilitado("fecha_limite")}
                                onChange={(e) =>
                                  handleChange(
                                    "fecha_limite",
                                    e.target.value || null
                                  )
                                }
                                className={`flex-1 px-3 py-2.5 rounded-xl text-sm ${
                                  tema.colores.card
                                } ${tema.colores.borde} border ${
                                  tema.colores.texto
                                } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                  estaDeshabilitado("fecha_limite")
                                    ? "opacity-70 cursor-not-allowed"
                                    : ""
                                }`}
                              />
                              {form.fecha_limite && (
                                <button
                                  type="button"
                                  disabled={estaDeshabilitado("fecha_limite")}
                                  onClick={() =>
                                    handleChange("fecha_limite", null)
                                  }
                                  className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs ${
                                    estaDeshabilitado("fecha_limite")
                                      ? "opacity-70 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  Limpiar
                                </button>
                              )}
                            </div>
                            <p
                              className={`text-[11px] ${tema.colores.textoSecundario}`}
                            >
                              Si no se define fecha límite, la tarea se
                              considerará abierta hasta su cierre manual.
                            </p>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className={tema.colores.textoSecundario}>
                                Creada el{" "}
                                <strong>
                                  {formatearFecha(tarea.fecha_creacion)}
                                </strong>
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                              >
                                <Clock className="w-3 h-3" />
                                Tarea #{tarea.id_tarea}
                              </span>
                            </div>
                            <span className={tema.colores.textoSecundario}>
                              Límite actual:{" "}
                              <strong>
                                {form.fecha_limite
                                  ? formatearFecha(form.fecha_limite)
                                  : "Sin fecha límite"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                          >
                            Etiquetas inteligentes
                          </label>
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            Usa etiquetas para agrupar tareas similares (ej:
                            crónicos, llamadas, laboratorio)
                          </span>
                        </div>
                        <div
                          className={`flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                        >
                          {form.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-indigo-500/10 border border-indigo-500/40 text-indigo-300"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => eliminarTag(tag)}
                                className="p-0.5 rounded-full hover:bg-indigo-500/40"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={nuevoTag}
                            disabled={estaDeshabilitado("descripcion")}
                            onChange={(e) => setNuevoTag(e.target.value)}
                            onKeyDown={handleTagsKeyDown}
                            placeholder={
                              form.tags.length === 0
                                ? "Escribe y presiona Enter para agregar..."
                                : "Agregar nueva etiqueta..."
                            }
                            className={`flex-1 min-w-[120px] bg-transparent outline-none border-none text-xs ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} ${
                              estaDeshabilitado("descripcion")
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pie formulario: acciones rápidas */}
            {tarea && (
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div className="text-xs">
                    <p className={tema.colores.texto}>
                      Todos los cambios quedan registrados en el historial de la
                      tarea para garantizar trazabilidad y seguridad clínica.
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Creador:{" "}
                      <strong>{tarea.creador.nombre_completo}</strong> ·
                      Responsable:{" "}
                      <strong>{tarea.responsable.nombre_completo}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={volverADetalle}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    <Eye className="w-3 h-3" />
                    Ver detalle
                  </button>
                  <button
                    onClick={guardarTarea}
                    disabled={!tieneCambios || guardando || !form}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                      tieneCambios
                        ? `${tema.colores.primario} text-white`
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    } ${tema.colores.sombra} disabled:opacity-50`}
                  >
                    {guardando ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Guardar ahora
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral: resumen y línea de tiempo */}
          <div className="space-y-6">
            {/* Resumen premium */}
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
                    <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                      Vista rápida del impacto de esta tarea
                    </p>
                  </div>
                </div>
                {tieneCambios && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/40">
                    Editando...
                  </span>
                )}
              </div>

              {tarea ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Estado actual
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${obtenerColorEstado(
                        form?.estado ?? tarea.estado
                      )}`}
                    >
                      {form?.estado === "completada" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : form?.estado === "pendiente" ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <Activity className="w-3 h-3" />
                      )}
                      {(form?.estado ?? tarea.estado)
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Prioridad
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${obtenerColorPrioridad(
                        form?.prioridad ?? tarea.prioridad
                      )}`}
                    >
                      <Flame className="w-3 h-3" />
                      {(form?.prioridad ?? tarea.prioridad).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>Centro</span>
                    <span className={`text-[11px] ${tema.colores.texto}`}>
                      {centroSeleccionado?.nombre ??
                        tarea.centro?.nombre ??
                        "Sin centro"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Sucursal
                    </span>
                    <span className={`text-[11px] ${tema.colores.texto}`}>
                      {sucursalesFiltradas.find(
                        (s) => s.id_sucursal === (form?.id_sucursal ?? -1)
                      )?.nombre ??
                        tarea.sucursal?.nombre ??
                        "Sin sucursal"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Creador
                    </span>
                    <span className={`text-[11px] ${tema.colores.texto}`}>
                      {tarea.creador.nombre_completo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Responsable
                    </span>
                    <span className={`text-[11px] ${tema.colores.texto}`}>
                      {tarea.responsable.nombre_completo}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-dashed border-white/10 space-y-2">
                    <p className={tema.colores.textoSecundario}>
                      Avance estimado
                    </p>
                    <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500"
                        style={{
                          width:
                            form?.estado === "completada"
                              ? "100%"
                              : form?.estado === "en_revision"
                              ? "75%"
                              : form?.estado === "en_progreso"
                              ? "50%"
                              : "20%",
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-right text-emerald-300">
                      {form?.estado === "completada"
                        ? "100% · Tarea finalizada"
                        : form?.estado === "en_revision"
                        ? "75% · En revisión"
                        : form?.estado === "en_progreso"
                        ? "50% · En ejecución"
                        : "20% · Planificación inicial"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-xs text-gray-400">
                  Cargando resumen...
                </div>
              )}
            </div>

            {/* Línea de tiempo / historial */}
            <div
              className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-[520px] overflow-hidden flex flex-col`}
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
                      Historial de cambios
                    </h3>
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Cada cambio queda registrado con fecha, usuario y acción
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    tarea &&
                    router.push(`/secretaria/tareas/${tarea.id_tarea}/historial`)
                  }
                  className={`text-[11px] font-semibold ${tema.colores.acento} hover:underline inline-flex items-center gap-1`}
                >
                  Ver historial completo
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loadingHistorial ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 flex justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-500/40 mt-2" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-40 bg-gray-500/20 rounded" />
                          <div className="h-3 w-24 bg-gray-500/20 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : historial && historial.length > 0 ? (
                  <div className="relative pl-3">
                    <div className="absolute left-[6px] top-1 bottom-1 w-px bg-gradient-to-b from-indigo-500/60 via-purple-500/60 to-emerald-500/40" />
                    <div className="space-y-4">
                      {historial.map((ev, idx) => (
                        <div key={ev.id_evento ?? idx} className="flex gap-3">
                          <div className="w-4 flex justify-center">
                            <div className="w-3 h-3 rounded-full bg-indigo-400 shadow ring-2 ring-indigo-500/40 mt-1" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-xs font-bold ${tema.colores.texto}`}
                              >
                                {ev.accion}
                              </p>
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
                            <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1">
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
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs">
                    <ClipboardCheck
                      className={`w-8 h-8 mx-auto mb-2 ${tema.colores.textoSecundario}`}
                    />
                    <p className={tema.colores.textoSecundario}>
                      Aún no hay movimientos registrados para esta tarea.
                    </p>
                  </div>
                )}
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
              © 2025 AnyssaMed · Editor de Tareas INFOGES (Secretaría).
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
