// src/app/(dashboard)/tecnico/tareas/[id]/historial/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useParams } from "next/navigation";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BellOff,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  GitBranch,
  Hash,
  HeartPulse,
  History,
  Home,
  Layers,
  Lightbulb,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Moon,
  MoreVertical,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserCog,
  Users,
  X,
  Zap,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Repeat,
  RotateCcw,
  Share2,
  Workflow,
} from "lucide-react";

// ================================
// TIPOS
// ================================

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

interface NotificacionSistema {
  id_notificacion: number;
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
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
    foto_perfil_url?: string | null;
  } | null;
  estado_anterior?: TareaEstado | null;
  estado_nuevo?: TareaEstado | null;
  tipo_cambio?: string;
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

// ================================
// TEMAS ULTRA PREMIUM
// ================================

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
    nombre: "Azul Técnico Pro",
    icono: Zap,
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
    nombre: "Púrpura Industrial Elite",
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
    nombre: "Verde Operacional Pro",
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

// ================================
// CONSTANTES
// ================================

const roleParam = "tecnico";
const roleLabel = "Técnico";

// ================================
// COMPONENTE PRINCIPAL
// ================================

export default function HistorialTareaTecnicoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const tareaId = idParam ? Number(idParam) : NaN;

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");

  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingTarea, setLoadingTarea] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );
  const [historial, setHistorial] = useState<EventoHistorial[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroAccion, setFiltroAccion] = useState<string>("todos");
  const [filtroUsuario, setFiltroUsuario] = useState<number | "todos">("todos");
  const [filtroTipoCambio, setFiltroTipoCambio] =
    useState<TipoCambioHistorial>("todos");
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [soloCambiosEstado, setSoloCambiosEstado] = useState(false);

  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ================================
  // EFECTOS
  // ================================

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem(
        "tema_tecnico"
      ) as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingUsuario(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("No hay sesión activa");
        }

        const data = await res.json();
        if (!data.success || !data.usuario) {
          throw new Error("Sesión inválida");
        }

        const rolesUsuario: string[] = [];

        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const esTecnico = rolesUsuario.some((r) => r.includes("TECNICO"));

        if (!esTecnico) {
          alert(
            `Acceso denegado. Módulo exclusivo para TÉCNICOS.\nRoles actuales: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!data.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
        setDisponibilidad(data.usuario.tecnico.disponibilidad);
      } catch (err) {
        console.error("Error sesión técnico:", err);
        alert("Error al verificar sesión. Serás redirigido al login.");
        window.location.href = "/login";
      } finally {
        setLoadingUsuario(false);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    if (!usuario || !tareaId || Number.isNaN(tareaId)) return;

    const cargarTodo = async () => {
      try {
        setLoadingTarea(true);
        setLoadingHistorial(true);

        const [resTarea, resHist] = await Promise.all([
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
        ]);

        const dataTarea = await resTarea.json().catch(() => ({}));
        if (resTarea.ok && dataTarea.success && dataTarea.tarea) {
          setTarea(dataTarea.tarea as Tarea);
        }

        if (resHist && resHist.ok) {
          const dataHist = await resHist.json().catch(() => ({}));
          if (dataHist.success && Array.isArray(dataHist.historial)) {
            setHistorial(dataHist.historial as EventoHistorial[]);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoadingTarea(false);
        setLoadingHistorial(false);
      }
    };

    cargarTodo();
  }, [usuario, tareaId]);

  // ================================
  // FUNCIONES
  // ================================

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
      console.error("No se pudo guardar el tema en BD:", err);
    }
  };

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (!res.ok) {
        alert("No se pudo actualizar la disponibilidad.");
        return;
      }

      setDisponibilidad(nuevoEstado);
    } catch (err) {
      console.error("Error disponibilidad:", err);
      alert("Error al actualizar disponibilidad.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logout:", err);
    } finally {
      window.location.href = "/login";
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

  const formatearFechaHoraCompleta = (fecha: string) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  const volverALista = () => {
    router.push("/tecnico/tareas");
  };

  const irADetalle = () => {
    if (tarea) router.push(`/tecnico/tareas/${tarea.id_tarea}`);
    else if (!Number.isNaN(tareaId)) router.push(`/tecnico/tareas/${tareaId}`);
    else router.push("/tecnico/tareas");
  };

  const irAEditar = () => {
    if (tarea) router.push(`/tecnico/tareas/${tarea.id_tarea}/editar`);
    else if (!Number.isNaN(tareaId))
      router.push(`/tecnico/tareas/${tareaId}/editar`);
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
  const primerEvento = historialOrdenado[historialOrdenado.length - 1];
  const ultimoEvento = historialOrdenado[0];

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

  // ================================
  // RENDER LOADING
  // ================================

  if (loadingUsuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl`}
            >
              <History className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-5xl font-black mb-4 ${tema.colores.texto} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
          >
            Cargando Historial
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando línea de tiempo...
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
          className={`max-w-md w-full p-10 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
        >
          <div className="flex flex-col items-center text-center gap-5">
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-2 shadow-2xl animate-pulse`}
            >
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
              Acceso Restringido
            </h2>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Este módulo es exclusivo para cuentas con rol <b>TÉCNICO</b>.
            </p>
            <Link
              href="/login"
              className={`mt-3 inline-flex items-center gap-2 px-8 py-4 rounded-2xl ${tema.colores.primario} text-white font-bold ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
            >
              <LogOut className="w-5 h-5" />
              Ir al Login
            </Link>
          </div>
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
          className={`max-w-md mx-auto p-10 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} text-center transform hover:scale-105 transition-all duration-300`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Tarea No Válida
          </h2>
          <p className={`${tema.colores.textoSecundario} mb-8`}>
            No se pudo identificar la tarea para mostrar su historial.
          </p>
          <button
            onClick={volverALista}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Tareas
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // RENDER PRINCIPAL GIGANTE ULTRA PREMIUM
  // ================================

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} transition-all duration-700 relative overflow-hidden`}
    >
      {/* Efectos de fondo EXTRAORDINARIOS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
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
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:text-indigo-500 transition-colors duration-300`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en el historial: acción, usuario, detalle..."
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
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-5 space-y-2`}
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-xl`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      {t.nombre}
                    </span>
                    {temaActual === key && (
                      <Check className="w-5 h-5 animate-bounce" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg`}
              >
                <Bell className="w-5 h-5" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-ping" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xl">
                      {notificaciones.filter((n) => !n.leida).length}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Disponibilidad */}
            <div className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-black/10 backdrop-blur-sm">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "disponible"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "ocupado"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ⏸ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ⊗ Fuera
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Técnico {usuario.tecnico?.tipo_tecnico}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-sm font-bold shadow-xl ring-2 ring-white/20`}
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
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xl font-bold shadow-2xl`}
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
                        className={`text-xs ${tema.colores.textoSecundario} truncate`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          En línea
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <User className="w-5 h-5" />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <Settings className="w-5 h-5" />
                      Configuración
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/20 font-semibold transform hover:scale-105 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar Sesión
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
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-28 p-8 relative z-10`}
      >
        {/* Breadcrumb Ultra Premium */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/tecnico"
              className={`flex items-center gap-1 font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/tecnico/tareas"
              className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
            >
              Tareas
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/tecnico/tareas/${tareaId}`}
              className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
            >
              Tarea #{tareaId}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className={`font-bold ${tema.colores.texto}`}>
              Historial
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={`text-5xl md:text-6xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Historial Completo
                </span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow-2xl shadow-indigo-500/50">
                  <History className="w-4 h-4 mr-1" />
                  {totalEventos} Eventos
                </span>
              </h1>
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <Workflow className="w-5 h-5 text-indigo-400 animate-pulse" />
                Trazabilidad completa con auditoría profesional
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/tecnico/tareas"
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm shadow-lg hover:scale-105 transition-all duration-300`}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Link>
              <button
                onClick={recargarHistorial}
                disabled={loadingHistorial}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingHistorial ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </button>
              <button
                onClick={exportarHistorialJSON}
                disabled={historial.length === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.primario} text-white font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50`}
              >
                <Download className="w-5 h-5" />
                Exportar JSON
              </button>
            </div>
          </div>
        </div>

        {/* KPIs GIGANTES Ultra Premium */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
          {/* Total Eventos */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <History className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {totalEventos}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Total Eventos
              </div>
            </div>
          </div>

          {/* Cambios de Estado */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-pulse">
                  <Activity className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {totalCambiosEstado}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                🔄 Cambios Estado
              </div>
            </div>
          </div>

          {/* Creaciones */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {totalPorTipoCambio.creacion}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                ✨ Creaciones
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Edit className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {totalPorTipoCambio.contenido}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                📝 Contenido
              </div>
            </div>
          </div>

          {/* Asignaciones */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {totalPorTipoCambio.asignaciones}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                👥 Asignaciones
              </div>
            </div>
          </div>

          {/* Sistema */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {totalPorTipoCambio.sistema}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                🛡️ Sistema
              </div>
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Columna Izquierda: Resumen de Tarea */}
          <div className="space-y-6">
            {/* Resumen de Tarea */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                >
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                    Resumen de Tarea
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Datos clave del contexto
                  </p>
                </div>
              </div>

              {loadingTarea ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-40 bg-gray-500/20 rounded-xl" />
                  <div className="h-3 w-32 bg-gray-500/20 rounded-xl" />
                  <div className="h-3 w-full bg-gray-500/20 rounded-xl" />
                </div>
              ) : tarea ? (
                <div className="space-y-4">
                  <div>
                    <p
                      className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-1`}
                    >
                      Título
                    </p>
                    <p className={`text-base font-black ${tema.colores.texto}`}>
                      {tarea.titulo}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-1`}
                    >
                      Descripción
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      {tarea.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-2`}
                      >
                        Estado
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-2 ${obtenerColorEstado(
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

                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-2`}
                      >
                        Prioridad
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-2 ${obtenerColorPrioridad(
                          tarea.prioridad
                        )}`}
                      >
                        <Flame className="w-3 h-3" />
                        {tarea.prioridad.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-1`}
                      >
                        Centro
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {tarea.centro?.nombre ?? "Sin centro"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-1`}
                      >
                        Sucursal
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {tarea.sucursal?.nombre ?? "Sin sucursal"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-1`}
                      >
                        Creador
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {tarea.creador.nombre_completo}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-1`}
                      >
                        Responsable
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {tarea.responsable.nombre_completo}
                      </p>
                    </div>
                  </div>

                  {tarea.tags && tarea.tags.length > 0 && (
                    <div>
                      <p
                        className={`text-xs uppercase font-bold ${tema.colores.textoSecundario} mb-2`}
                      >
                        Etiquetas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tarea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/40 text-indigo-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={tema.colores.textoSecundario}>
                        Creada
                      </span>
                      <span className={`font-bold ${tema.colores.texto}`}>
                        {formatearFecha(tarea.fecha_creacion)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={tema.colores.textoSecundario}>
                        Límite
                      </span>
                      <span className={`font-bold ${tema.colores.texto}`}>
                        {tarea.fecha_limite
                          ? formatearFecha(tarea.fecha_limite)
                          : "Sin límite"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                </div>
              )}
            </div>

            {/* Métricas del Historial */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl`}
                >
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                    Métricas
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Análisis de eventos
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className={`text-xs font-bold ${tema.colores.texto}`}>
                      Usuarios Activos
                    </span>
                  </div>
                  <span className="text-lg font-black text-indigo-400">
                    {usuariosHistorial.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span className={`text-xs font-bold ${tema.colores.texto}`}>
                      Acciones Únicas
                    </span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">
                    {accionesDisponibles.length}
                  </span>
                </div>

                <div className="pt-3 border-t-2 border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Primer Evento
                    </span>
                    <span className={`font-bold ${tema.colores.texto}`}>
                      {primerEvento
                        ? formatearFechaHora(primerEvento.fecha_hora)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>
                      Último Evento
                    </span>
                    <span className={`font-bold ${tema.colores.texto}`}>
                      {ultimoEvento
                        ? formatearFechaHora(ultimoEvento.fecha_hora)
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-2xl`}
                >
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                    Acciones Rápidas
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Navegación inteligente
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={irADetalle}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-bold text-sm transform hover:scale-105 transition-all duration-200`}
                >
                  <Eye className="w-5 h-5" />
                  Ver Detalle de Tarea
                </button>
                <button
                  onClick={irAEditar}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-bold text-sm transform hover:scale-105 transition-all duration-200`}
                >
                  <Edit className="w-5 h-5" />
                  Editar Tarea
                </button>
                <button
                  onClick={exportarHistorialJSON}
                  disabled={historial.length === 0}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-bold text-sm transform hover:scale-105 transition-all duration-200 disabled:opacity-50`}
                >
                  <Download className="w-5 h-5" />
                  Descargar Historial
                </button>
              </div>
            </div>
          </div>

          {/* Columna Principal: Filtros + Timeline */}
          <div className="xl:col-span-2 space-y-6">
            {/* Filtros GIGANTES Ultra Premium */}
            <div
              className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-2xl`}
                  >
                    <Filter className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Filtros Avanzados
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Mostrando {historialFiltrado.length} de {totalEventos}{" "}
                      eventos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroAccion("todos");
                    setFiltroUsuario("todos");
                    setFiltroTipoCambio("todos");
                    setSoloCambiosEstado(false);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label
                    className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                  >
                    Acción
                  </label>
                  <select
                    value={filtroAccion}
                    onChange={(e) => setFiltroAccion(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-xl`}
                  >
                    <option value="todos">Todas las Acciones</option>
                    {accionesDisponibles.map((ac) => (
                      <option key={ac} value={ac}>
                        {ac}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario}`}
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
                    className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-xl`}
                  >
                    <option value="todos">Todos los Usuarios</option>
                    {usuariosHistorial.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    className={`text-xs font-bold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                  >
                    Orden
                  </label>
                  <button
                    onClick={() => setOrdenAscendente((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    <span>
                      {ordenAscendente ? "Antiguo → Reciente" : "Reciente → Antiguo"}
                    </span>
                    {ordenAscendente ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Filtros por Tipo de Cambio */}
              <div className="flex flex-wrap gap-2 mb-4">
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
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border-2 transition-all duration-300 transform hover:scale-105 ${
                        filtroTipoCambio === tipo
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-xl`
                          : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                      }`}
                    >
                      <Icono className="w-4 h-4" />
                      {labelMap[tipo]}
                      {tipo !== "todos" && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 font-black">
                          {totalPorTipoCambio[tipo]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Toggle Solo Cambios de Estado */}
              <div
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  soloCambiosEstado
                    ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                    : "bg-black/5 border-2 border-transparent"
                } transition-all duration-300 cursor-pointer`}
                onClick={() => setSoloCambiosEstado((v) => !v)}
              >
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    🔄 Solo Cambios de Estado
                  </p>
                  <p className="text-xs text-gray-400">
                    Filtrar únicamente transiciones de estado
                  </p>
                </div>
                <button
                  className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                    soloCambiosEstado
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/50"
                      : "bg-slate-500/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                      soloCambiosEstado ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Timeline GIGANTE Ultra Premium */}
            <div
              className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl`}
                  >
                    <Workflow className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      Línea de Tiempo
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Trazabilidad completa de eventos
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[800px] overflow-y-auto custom-scrollbar-premium pr-2">
                {loadingHistorial ? (
                  <div className="space-y-6 animate-pulse">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 flex justify-center">
                          <div className="w-4 h-4 rounded-full bg-gray-500/40 mt-2" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="h-5 w-48 bg-gray-500/20 rounded-xl" />
                          <div className="h-4 w-full bg-gray-500/20 rounded-xl" />
                          <div className="flex gap-2">
                            <div className="h-6 w-24 bg-gray-500/20 rounded-full" />
                            <div className="h-6 w-24 bg-gray-500/20 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : historialFiltrado.length === 0 ? (
                  <div className="py-20 text-center">
                    <div
                      className={`w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl animate-pulse`}
                    >
                      <ClipboardCheck className="w-14 h-14 text-white" />
                    </div>
                    <p
                      className={`text-2xl font-black ${tema.colores.texto} mb-3`}
                    >
                      Sin Eventos
                    </p>
                    <p className={`${tema.colores.textoSecundario} text-lg`}>
                      No hay eventos que coincidan con los filtros actuales
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-[15px] top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500/60 via-purple-500/60 to-emerald-500/40 rounded-full" />
                    <div className="space-y-6">
                      {historialFiltrado.map((ev, idx) => {
                        const tipoCambio = clasificarTipoCambio(ev);
                        const esCambioEstado =
                          tipoCambio === "estado" ||
                          ev.estado_anterior ||
                          ev.estado_nuevo;

                        return (
                          <div
                            key={ev.id_evento ?? idx}
                            className="flex gap-5 group"
                            style={{
                              animationDelay: `${idx * 50}ms`,
                            }}
                          >
                            <div className="w-8 flex justify-center">
                              <div
                                className={`w-5 h-5 rounded-full mt-2 shadow-xl ring-4 group-hover:scale-125 transition-transform duration-300 ${
                                  esCambioEstado
                                    ? "bg-gradient-to-br from-emerald-400 to-green-400 ring-emerald-500/40 animate-pulse"
                                    : tipoCambio === "creacion"
                                    ? "bg-gradient-to-br from-sky-400 to-blue-400 ring-sky-500/40"
                                    : tipoCambio === "asignaciones"
                                    ? "bg-gradient-to-br from-teal-400 to-cyan-400 ring-teal-500/40"
                                    : tipoCambio === "sistema"
                                    ? "bg-gradient-to-br from-purple-400 to-pink-400 ring-purple-500/40"
                                    : "bg-gradient-to-br from-amber-400 to-orange-400 ring-amber-500/40"
                                }`}
                              />
                            </div>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h4
                                      className={`text-lg font-black ${tema.colores.texto}`}
                                    >
                                      {ev.accion}
                                    </h4>
                                    {tipoCambio === "creacion" && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 border-2 border-sky-500/60 text-sky-300 shadow-lg">
                                        <Sparkles className="w-3 h-3" />
                                        CREACIÓN
                                      </span>
                                    )}
                                    {esCambioEstado && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 shadow-lg animate-pulse">
                                        <Activity className="w-3 h-3" />
                                        CAMBIO ESTADO
                                      </span>
                                    )}
                                  </div>

                                  {ev.detalle && (
                                    <p
                                      className={`text-sm ${tema.colores.textoSecundario} mb-3`}
                                    >
                                      {ev.detalle}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap items-center gap-2">
                                    {ev.usuario && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/20">
                                        {ev.usuario.foto_perfil_url ? (
                                          <Image
                                            src={ev.usuario.foto_perfil_url}
                                            alt={ev.usuario.nombre_completo}
                                            width={20}
                                            height={20}
                                            className="rounded-lg object-cover"
                                          />
                                        ) : (
                                          <User className="w-4 h-4 text-indigo-400" />
                                        )}
                                        <span className="text-xs font-semibold">
                                          {ev.usuario.nombre_completo}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          {ev.usuario.rol}
                                        </span>
                                      </div>
                                    )}

                                    {ev.estado_anterior && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/10 border-2 border-rose-500/40 text-rose-300">
                                        <ArrowDownRight className="w-3 h-3" />
                                        {ev.estado_anterior.replace("_", " ")}
                                      </span>
                                    )}

                                    {ev.estado_nuevo && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-300">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {ev.estado_nuevo.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p
                                    className={`text-xs ${tema.colores.textoSecundario} mb-1`}
                                  >
                                    {formatearFechaHora(ev.fecha_hora)}
                                  </p>
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                                  >
                                    <Clock className="w-3 h-3" />
                                    Evento #{ev.id_evento}
                                  </span>
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
            </div>

            {/* Panel de Información Legal */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Información de Trazabilidad
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Registro oficial para auditorías
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p className={tema.colores.textoSecundario}>
                  ✓ Este historial forma parte de la{" "}
                  <span className={`font-bold ${tema.colores.texto}`}>
                    trazabilidad oficial
                  </span>{" "}
                  del sistema INFOGES para auditorías internas y externas.
                </p>
                <p className={tema.colores.textoSecundario}>
                  ✓ Cada evento queda registrado con{" "}
                  <span className={`font-bold ${tema.colores.texto}`}>
                    fecha, hora, usuario y acción
                  </span>{" "}
                  ejecutada.
                </p>
                <p className={tema.colores.textoSecundario}>
                  ✓ Los eventos{" "}
                  <span className={`font-bold ${tema.colores.texto}`}>
                    no se pueden eliminar ni modificar
                  </span>{" "}
                  para garantizar integridad.
                </p>
                <p className={tema.colores.textoSecundario}>
                  ✓ Cumple con normativas de{" "}
                  <span className={`font-bold ${tema.colores.texto}`}>
                    seguridad clínica y protección de datos
                  </span>
                  .
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={irADetalle}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  <Eye className="w-5 h-5" />
                  Ver Tarea
                </button>
                <button
                  onClick={irAEditar}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl ${tema.colores.primario} text-white font-bold text-sm hover:scale-105 transition-all duration-300 shadow-xl`}
                >
                  <Edit className="w-5 h-5" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
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
              className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl`}
            >
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                © 2025 AnyssaMed
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Módulo Ultra Premium de Historial de Tareas · Técnico
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

      {/* ESTILOS GLOBALES GIGANTES ULTRA PREMIUM */}
      <style jsx global>{`
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
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes timeline-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) rotate(45deg);
          }
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

        /* Animación de entrada para eventos */
        .space-y-6 > div {
          animation: fadeIn 0.3s ease-out backwards;
        }

        /* Efecto de pulso en timeline */
        .group:hover .w-5.h-5.rounded-full {
          animation: timeline-pulse 1s ease-in-out infinite;
        }

        /* Scrollbar personalizado GIGANTE */
        .custom-scrollbar-premium::-webkit-scrollbar {
          width: 12px;
          height: 12px;
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

        /* Transiciones suaves globales */
        * {
          transition-property: background-color, border-color, color, fill,
            stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efecto de brillo en hover para cards */
        .group:hover .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.3);
        }

        /* Efecto de brillo en línea de tiempo */
        .relative.pl-6::before {
          content: "";
          position: absolute;
          left: 11px;
          top: 0;
          width: 8px;
          height: 100%;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(99, 102, 241, 0.3),
            transparent
          );
          animation: shine 3s infinite;
          pointer-events: none;
        }

        /* Hover mejorado para eventos */
        .group:hover {
          transform: translateX(4px);
        }

        /* Efecto de foco mejorado */
        select:focus,
        button:focus {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
        }

        /* Animación de carga */
        @keyframes loading-shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite,
            loading-shimmer 2s infinite;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(99, 102, 241, 0.1),
            transparent
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
}

