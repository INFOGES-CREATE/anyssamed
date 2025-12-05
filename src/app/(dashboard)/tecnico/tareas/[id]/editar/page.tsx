// src/app/(dashboard)/tecnico/tareas/[id]/editar/page.tsx
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
  Building2,
  Calendar,
  Check,
  UserCheck ,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardCheck,
  ClipboardList,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  HeartPulse,
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
  Save,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Trash,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
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
// COMPONENTE PRINCIPAL (EDITAR TAREA)
// ========================================

const roleParam = "tecnico";
const roleLabel = "tecnico";

export default function EditarTareatecnicoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const tareaId = idParam ? Number(idParam) : NaN;

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");

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

  // ========================================
  // EFECTOS
  // ========================================

  // Fondo global
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

  const estaDeshabilitado = (campo: keyof FormularioTarea) => {
    if (tarea && tarea.puede_editar === false) return true;
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
    if (tarea) router.push(`/tecnico/tareas/${tarea.id_tarea}`);
    else router.push("/tecnico/tareas");
  };

  const volverALista = () => {
    if (tieneCambios && !guardando) {
      const ok = window.confirm(
        "Tienes cambios sin guardar. ¿Seguro que deseas salir sin guardar?"
      );
      if (!ok) return;
    }
    router.push("/tecnico/tareas");
  };

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loadingUsuario || !usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        {/* Efectos de fondo */}
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
              className={`absolute inset-3 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
            >
              <Edit className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-5xl font-black mb-4 ${tema.colores.texto} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
          >
            Preparando Editor
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Cargando datos de la tarea...
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
          className={`max-w-md mx-auto p-10 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} text-center transform hover:scale-105 transition-all duration-300`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Tarea No Válida
          </h2>
          <p className={`${tema.colores.textoSecundario} mb-8`}>
            No se pudo identificar el identificador de la tarea a editar.
          </p>
          <button
            onClick={volverALista}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Mis Tareas
          </button>
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
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={volverADetalle}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} shadow-lg hover:scale-105 transition-all duration-300`}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-2xl md:text-3xl font-black truncate ${tema.colores.texto}`}
                >
                  {tarea ? tarea.titulo : "Editar Tarea"}
                </h2>
                {tieneCambios && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border-2 border-amber-500/60 animate-pulse shadow-lg shadow-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Cambios Sin Guardar
                  </span>
                )}
              </div>
              <p
                className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <Edit className="w-4 h-4" />
                {obtenerSaludo()}, {usuario.nombre}. Editando tarea #{tareaId}
              </p>
            </div>
          </div>

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

            {/* Botón guardar destacado */}
            <button
              onClick={guardarTarea}
              disabled={!tieneCambios || guardando || !form}
              className={`hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${
                tieneCambios
                  ? `bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-2xl shadow-emerald-500/50`
                  : `${tema.colores.secundario} ${tema.colores.texto} shadow-lg`
              } hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {guardando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Guardar Cambios
            </button>

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
            <span className={`font-bold ${tema.colores.texto}`}>
              Editar #{tareaId}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={`text-5xl md:text-6xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Editor Inteligente
                </span>
                <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              </h1>
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <Edit className="w-5 h-5 text-indigo-400" />
                Modificación avanzada con trazabilidad completa
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={recargarTarea}
                disabled={loadingTarea}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingTarea ? "animate-spin" : ""}`}
                />
                Recargar
              </button>
              <button
                onClick={guardarTarea}
                disabled={!tieneCambios || guardando || !form}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${
                  tieneCambios
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-2xl shadow-emerald-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto} shadow-lg`
                } hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {guardando ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        {/* Contenido: formulario + sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Columna principal: formulario */}
          <div className="xl:col-span-2 space-y-6">
            {/* Formulario Ultra Premium */}
            <div
              className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              {loadingTarea || !tarea || !form ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-6 w-48 bg-gray-500/20 rounded-xl" />
                  <div className="h-12 w-full bg-gray-500/20 rounded-xl" />
                  <div className="h-32 w-full bg-gray-500/20 rounded-xl" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-gray-500/20 rounded-xl" />
                    <div className="h-12 bg-gray-500/20 rounded-xl" />
                    <div className="h-12 bg-gray-500/20 rounded-xl" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Encabezado del formulario */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                        >
                          <ClipboardList className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl">
                          <Edit className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h3
                          className={`text-2xl font-black flex items-center gap-2 ${tema.colores.texto}`}
                        >
                          Datos de la Tarea
                          {tarea.puede_editar === false && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-gray-500/20 text-gray-400 border-2 border-gray-500/40">
                              <Lock className="w-3 h-3" />
                              Solo Lectura
                            </span>
                          )}
                        </h3>
                        <p
                          className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Todos los cambios quedan registrados para auditoría
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border-2 ${obtenerColorEstado(
                          form.estado
                        )}`}
                      >
                        <Activity className="w-4 h-4" />
                        {form.estado.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black border-2 ${obtenerColorPrioridad(
                          form.prioridad
                        )}`}
                      >
                        <Flame className="w-4 h-4" />
                        {form.prioridad.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Campos principales ULTRA PREMIUM */}
                  <div className="space-y-6">
                    {/* Título */}
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                      >
                        <Star className="w-4 h-4 text-amber-400" />
                        Título de la Tarea *
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={form.titulo}
                          disabled={estaDeshabilitado("titulo")}
                          onChange={(e) =>
                            handleChange("titulo", e.target.value)
                          }
                          placeholder="Ej: Confirmar asistencia de pacientes crónicos"
                          className={`w-full px-5 py-4 rounded-2xl text-base font-semibold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-lg group-hover:shadow-xl ${
                            estaDeshabilitado("titulo")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        />
                        {!estaDeshabilitado("titulo") && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <span className="text-xs text-emerald-400 font-bold">
                              ✓ Editando
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <FileText className="w-4 h-4 text-sky-400" />
                          Descripción Detallada *
                        </label>
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          {form.descripcion.length} caracteres
                        </span>
                      </div>
                      <div className="relative group">
                        <textarea
                          rows={5}
                          value={form.descripcion}
                          disabled={estaDeshabilitado("descripcion")}
                          onChange={(e) =>
                            handleChange("descripcion", e.target.value)
                          }
                          className={`w-full px-5 py-4 rounded-2xl text-sm ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 resize-none shadow-lg group-hover:shadow-xl ${
                            estaDeshabilitado("descripcion")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                          placeholder="Describe el contexto clínico y operativo de esta tarea. Incluye detalles importantes para su correcta ejecución..."
                        />
                      </div>
                    </div>

                    {/* Tipo, Prioridad, Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Layers className="w-4 h-4 text-purple-400" />
                          Tipo
                        </label>
                        <select
                          value={form.tipo}
                          disabled={estaDeshabilitado("tipo")}
                          onChange={(e) =>
                            handleChange("tipo", e.target.value)
                          }
                          className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
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

                      <div className="space-y-2">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Flame className="w-4 h-4 text-orange-400" />
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
                          className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                            estaDeshabilitado("prioridad")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="critica">🔴 Crítica</option>
                          <option value="urgente">🟠 Urgente</option>
                          <option value="alta">🟡 Alta</option>
                          <option value="media">🔵 Media</option>
                          <option value="baja">🟢 Baja</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Activity className="w-4 h-4 text-emerald-400" />
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
                          className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                            estaDeshabilitado("estado")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="pendiente">⏳ Pendiente</option>
                          <option value="en_progreso">🔄 En Progreso</option>
                          <option value="en_revision">👁 En Revisión</option>
                          <option value="completada">✅ Completada</option>
                          <option value="rechazada">❌ Rechazada</option>
                          <option value="cancelada">🚫 Cancelada</option>
                        </select>
                      </div>
                    </div>

                    {/* Centro / Sucursal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Building2 className="w-4 h-4 text-sky-400" />
                          Centro de Salud
                        </label>
                        <select
                          value={form.id_centro ?? ""}
                          disabled={estaDeshabilitado("id_centro")}
                          onChange={(e) => {
                            handleChange(
                              "id_centro",
                              e.target.value ? Number(e.target.value) : null
                            );
                            handleChange("id_sucursal", null);
                          }}
                          className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                            estaDeshabilitado("id_centro")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="">Sin centro / Administrativo</option>
                          {centros.map((c) => (
                            <option key={c.id_centro} value={c.id_centro}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <MapPin className="w-4 h-4 text-teal-400" />
                          Sucursal / Unidad
                        </label>
                        <select
                          value={form.id_sucursal ?? ""}
                          disabled={
                            estaDeshabilitado("id_sucursal") || !form.id_centro
                          }
                          onChange={(e) =>
                            handleChange(
                              "id_sucursal",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className={`w-full px-4 py-3 rounded-2xl text-sm font-bold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                            estaDeshabilitado("id_sucursal") || !form.id_centro
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="">Sin sucursal específica</option>
                          {sucursalesFiltradas.map((s) => (
                            <option key={s.id_sucursal} value={s.id_sucursal}>
                              {s.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Fecha Límite */}
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                      >
                        <Calendar className="w-4 h-4 text-rose-400" />
                        Fecha Límite
                      </label>
                      <div className="flex items-center gap-3">
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
                          className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold ${
                            tema.colores.card
                          } ${tema.colores.borde} border-2 ${
                            tema.colores.texto
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl ${
                            estaDeshabilitado("fecha_limite")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        />
                        {form.fecha_limite && !estaDeshabilitado("fecha_limite") && (
                          <button
                            type="button"
                            onClick={() => handleChange("fecha_limite", null)}
                            className={`px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-1`}
                      >
                        <Lightbulb className="w-3 h-3" />
                        {form.fecha_limite
                          ? `Límite: ${formatearFecha(form.fecha_limite)}`
                          : "Sin fecha límite definida"}
                      </p>
                    </div>

                    {/* Tags Ultra Premium */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          className={`text-sm font-black uppercase tracking-wide ${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Target className="w-4 h-4 text-indigo-400" />
                          Etiquetas Inteligentes
                        </label>
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          {form.tags.length} etiquetas
                        </span>
                      </div>
                      <div
                        className={`flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 min-h-[56px] shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/40 text-indigo-300 shadow-lg transform hover:scale-110 transition-all duration-200"
                          >
                            <span className="text-indigo-400">#</span>
                            {tag}
                            <button
                              type="button"
                              onClick={() => eliminarTag(tag)}
                              className="p-1 rounded-lg hover:bg-rose-500/30 transition-all duration-200"
                            >
                              <X className="w-3 h-3 text-rose-400" />
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
                              ? "Escribe y presiona Enter..."
                              : "Agregar etiqueta..."
                          }
                          className={`flex-1 min-w-[180px] bg-transparent outline-none border-none text-sm font-semibold ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} ${
                            estaDeshabilitado("descripcion")
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-1`}
                      >
                        <Sparkles className="w-3 h-3" />
                        Usa etiquetas como: crónicos, llamadas, urgente,
                        laboratorio, etc.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Panel de Información Adicional */}
            {tarea && (
              <div
                className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl`}
                  >
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                      Información de Trazabilidad
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Registro completo para auditoría clínica
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <User className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Creador
                      </p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {tarea.creador.nombre_completo}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        {tarea.creador.rol}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Responsable
                      </p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {tarea.responsable.nombre_completo}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        {tarea.responsable.rol}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Clock className="w-5 h-5 text-sky-400" />
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Fecha de Creación
                      </p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {formatearFecha(tarea.fecha_creacion)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Calendar className="w-5 h-5 text-rose-400" />
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Fecha Límite
                      </p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {form?.fecha_limite
                          ? formatearFecha(form.fecha_limite)
                          : "Sin límite"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        Progreso Estimado
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-400">
                      {form?.estado === "completada"
                        ? "100%"
                        : form?.estado === "en_revision"
                        ? "75%"
                        : form?.estado === "en_progreso"
                        ? "50%"
                        : "20%"}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-black/20 overflow-hidden mt-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 transition-all duration-1000 shadow-lg"
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
                </div>
              </div>
            )}

            {/* Botones de Acción Inferior */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={volverALista}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} shadow-lg hover:scale-105 transition-all duration-300`}
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar y Volver
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={volverADetalle}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} shadow-lg hover:scale-105 transition-all duration-300`}
                >
                  <Eye className="w-5 h-5" />
                  Ver Detalle
                </button>
                <button
                  onClick={guardarTarea}
                  disabled={!tieneCambios || guardando || !form}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm ${
                    tieneCambios
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-2xl shadow-emerald-500/50"
                      : `${tema.colores.secundario} ${tema.colores.texto} shadow-lg`
                  } hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {guardando ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>

          {/* Columna lateral: resumen y historial */}
          <div className="space-y-6">
            {/* Resumen Premium */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300 sticky top-28`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Resumen Ejecutivo
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Vista rápida de la tarea
                    </p>
                  </div>
                </div>
                {tieneCambios && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border-2 border-amber-500/60 animate-pulse shadow-lg">
                    Editando
                  </span>
                )}
              </div>

              {tarea && form ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                    <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                      Estado
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-2 ${obtenerColorEstado(
                        form.estado
                      )}`}
                    >
                      {form.estado === "completada" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : form.estado === "pendiente" ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <Activity className="w-3 h-3" />
                      )}
                      {form.estado.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                    <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                      Prioridad
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black border-2 ${obtenerColorPrioridad(
                        form.prioridad
                      )}`}
                    >
                      <Flame className="w-3 h-3" />
                      {form.prioridad.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                    <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                      Tipo
                    </span>
                    <span className={`text-xs font-black ${tema.colores.texto}`}>
                      {form.tipo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                    <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                      Centro
                    </span>
                    <span className={`text-xs font-black ${tema.colores.texto} truncate max-w-[150px]`}>
                      {centroSeleccionado?.nombre ?? "Sin centro"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                    <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                      Sucursal
                    </span>
                    <span className={`text-xs font-black ${tema.colores.texto} truncate max-w-[150px]`}>
                      {sucursalesFiltradas.find(
                        (s) => s.id_sucursal === form.id_sucursal
                      )?.nombre ?? "Sin sucursal"}
                    </span>
                  </div>

                  <div className="pt-4 border-t-2 border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        Progreso Visual
                      </span>
                      <span className="text-sm font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                        {form.estado === "completada"
                          ? "100%"
                          : form.estado === "en_revision"
                          ? "75%"
                          : form.estado === "en_progreso"
                          ? "50%"
                          : "20%"}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 transition-all duration-1000 shadow-lg"
                        style={{
                          width:
                            form.estado === "completada"
                              ? "100%"
                              : form.estado === "en_revision"
                              ? "75%"
                              : form.estado === "en_progreso"
                              ? "50%"
                              : "20%",
                        }}
                      />
                    </div>
                    <p className="text-xs text-emerald-300 mt-2 text-right font-semibold">
                      {form.estado === "completada"
                        ? "✓ Tarea Finalizada"
                        : form.estado === "en_revision"
                        ? "👁 En Revisión"
                        : form.estado === "en_progreso"
                        ? "🔄 En Ejecución"
                        : "⏳ Planificación"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
              )}
            </div>

            {/* Historial Ultra Premium */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} max-h-[600px] overflow-hidden flex flex-col transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Línea de Tiempo
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {historial.length} eventos registrados
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    tarea &&
                    router.push(`/tecnico/tareas/${tarea.id_tarea}/historial`)
                  }
                  className={`text-xs font-bold ${tema.colores.acento} hover:underline inline-flex items-center gap-1`}
                >
                  Ver Completo
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar-premium pr-2">
                {loadingHistorial ? (
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 flex justify-center">
                          <div className="w-3 h-3 rounded-full bg-gray-500/40 mt-2" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 bg-gray-500/20 rounded-xl" />
                          <div className="h-3 w-32 bg-gray-500/20 rounded-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : historial && historial.length > 0 ? (
                  <div className="relative pl-4">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/60 via-purple-500/60 to-emerald-500/40" />
                    <div className="space-y-5">
                      {historial.map((ev, idx) => (
                        <div key={ev.id_evento ?? idx} className="flex gap-4 group">
                          <div className="w-6 flex justify-center">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg ring-4 ring-indigo-500/20 mt-1 group-hover:scale-125 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm font-black ${tema.colores.texto}`}
                              >
                                {ev.accion}
                              </p>
                              <span
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                {formatearFechaHora(ev.fecha_hora)}
                              </span>
                            </div>
                            {ev.detalle && (
                              <p
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                {ev.detalle}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {ev.usuario && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/20">
                                  <User className="w-3 h-3" />
                                  {ev.usuario.nombre_completo}
                                </span>
                              )}
                              {ev.estado_anterior && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/40 text-rose-300">
                                  <ArrowDownRight className="w-3 h-3" />
                                  {ev.estado_anterior.replace("_", " ")}
                                </span>
                              )}
                              {ev.estado_nuevo && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
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
                  <div className="py-12 text-center">
                    <ClipboardCheck
                      className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                    />
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Sin movimientos registrados
                    </p>
                  </div>
                )}
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
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
            >
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                © 2025 AnyssaMed
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Editor Ultra Premium de Tareas · Secretaría INFOGES
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

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
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

        /* Efecto de brillo en inputs al enfocar */
        input:focus,
        textarea:focus,
        select:focus {
          position: relative;
        }

        input:focus::after,
        textarea:focus::after,
        select:focus::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(99, 102, 241, 0.3),
            transparent
          );
          animation: shine 2s infinite;
        }

        /* Scrollbar personalizado premium */
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

        /* Transiciones suaves globales */
        * {
          transition-property: background-color, border-color, color, fill,
            stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efecto de brillo en hover para cards */
        .group:hover .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.25);
        }

        /* Animación de guardado exitoso */
        @keyframes success-pulse {
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

        .save-success {
          animation: success-pulse 0.5s ease-in-out;
        }

        /* Efecto de escritura en inputs */
        input:not(:placeholder-shown),
        textarea:not(:placeholder-shown) {
          border-color: rgba(99, 102, 241, 0.5);
        }

        /* Hover mejorado para botones */
        button:not(:disabled):hover {
          filter: brightness(1.1);
        }

        /* Efecto de foco mejorado */
        input:focus,
        textarea:focus,
        select:focus {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

