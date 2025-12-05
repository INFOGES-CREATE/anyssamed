// src/app/(dashboard)/tecnico/tareas/completadas/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Bell,
  BellOff,
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
  Home,
  Layers,
  Loader2,
  LogOut,
  MapPin,
  Medal,
  MoreVertical,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  ThumbsUp,
  Trash,
  TrendingUp,
  Trophy,
  User,
  Users,
  X,
  Zap,
  Radio,
  Building2,
  BarChart3,
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

interface Tarea {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  prioridad: TareaPrioridad;
  estado: string;
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
  fecha_completada: string | null;
  tags: string[];
  puede_editar?: boolean;
  puede_cambiar_estado?: boolean;
  puede_eliminar?: boolean;
  tiempo_resolucion_horas?: number;
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
    icono: Activity,
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
// COMPONENTE PRINCIPAL
// ================================

export default function TareasCompletadasPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );

  const [busqueda, setBusqueda] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("todas"); // hoy, semana, mes, todas

  const [tareaMenuAbierta, setTareaMenuAbierta] = useState<number | null>(null);
  const [tareaAEliminar, setTareaAEliminar] = useState<Tarea | null>(null);
  const [eliminando, setEliminando] = useState(false);

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
        setLoadingSesion(true);
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
        setLoadingSesion(false);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const cargarTareas = async () => {
      try {
        setLoadingTareas(true);
        const res = await fetch(
          `/api/tareas?usuario=${usuario.id_usuario}&rol=tecnico&estado=completada`,
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

    cargarTareas();
  }, [usuario]);

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

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const map: Record<string, string> = {
      critica: isDark
        ? "bg-red-600/30 text-red-200 border-red-500/70 shadow-xl shadow-red-500/30"
        : "bg-red-100 text-red-800 border-red-400 shadow-md",
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

  const filtrarPorFecha = (tarea: Tarea) => {
    if (filtroFecha === "todas") return true;
    if (!tarea.fecha_completada) return false;

    const fechaCompletada = new Date(tarea.fecha_completada);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    switch (filtroFecha) {
      case "hoy":
        const inicioHoy = new Date(hoy);
        const finHoy = new Date(hoy);
        finHoy.setHours(23, 59, 59, 999);
        return fechaCompletada >= inicioHoy && fechaCompletada <= finHoy;

      case "semana":
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - 7);
        return fechaCompletada >= inicioSemana;

      case "mes":
        const inicioMes = new Date(hoy);
        inicioMes.setDate(hoy.getDate() - 30);
        return fechaCompletada >= inicioMes;

      default:
        return true;
    }
  };

  const tareasFiltradas = useMemo(() => {
    let resultado = [...tareas];

    if (filtroPrioridad !== "todas") {
      resultado = resultado.filter(
        (t) => t.prioridad.toLowerCase() === filtroPrioridad.toLowerCase()
      );
    }

    if (filtroCentro !== "todos") {
      const idCentro = Number(filtroCentro);
      resultado = resultado.filter((t) => t.centro?.id_centro === idCentro);
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

    // Ordenar por fecha de completada (más recientes primero)
    resultado.sort((a, b) => {
      const fechaA = a.fecha_completada
        ? new Date(a.fecha_completada).getTime()
        : 0;
      const fechaB = b.fecha_completada
        ? new Date(b.fecha_completada).getTime()
        : 0;
      return fechaB - fechaA;
    });

    return resultado;
  }, [tareas, filtroPrioridad, filtroCentro, filtroFecha, busqueda]);

  const centrosDisponibles = useMemo(() => {
    const mapa = new Map<number, { id_centro: number; nombre: string }>();
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

  const kpis = useMemo(() => {
    const total = tareas.length;
    const hoy = tareas.filter((t) => {
      if (!t.fecha_completada) return false;
      const fecha = new Date(t.fecha_completada);
      const hoyFecha = new Date();
      return (
        fecha.getDate() === hoyFecha.getDate() &&
        fecha.getMonth() === hoyFecha.getMonth() &&
        fecha.getFullYear() === hoyFecha.getFullYear()
      );
    }).length;

    const semana = tareas.filter((t) => {
      if (!t.fecha_completada) return false;
      const fecha = new Date(t.fecha_completada);
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      return fecha >= hace7Dias;
    }).length;

    const mes = tareas.filter((t) => {
      if (!t.fecha_completada) return false;
      const fecha = new Date(t.fecha_completada);
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return fecha >= hace30Dias;
    }).length;

    const tiemposResolucion = tareas
      .filter((t) => t.tiempo_resolucion_horas)
      .map((t) => t.tiempo_resolucion_horas!);

    const tiempoPromedio =
      tiemposResolucion.length > 0
        ? tiemposResolucion.reduce((a, b) => a + b, 0) /
          tiemposResolucion.length
        : 0;

    const criticas = tareas.filter((t) => t.prioridad === "critica").length;

    return { total, hoy, semana, mes, tiempoPromedio, criticas };
  }, [tareas]);

  const recargarTareas = async () => {
    if (!usuario) return;
    setLoadingTareas(true);

    try {
      const res = await fetch(
        `/api/tareas?usuario=${usuario.id_usuario}&rol=tecnico&estado=completada`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTareas((data.tareas || []) as Tarea[]);
      }
    } catch (error) {
      console.error("Error al recargar tareas:", error);
    } finally {
      setLoadingTareas(false);
    }
  };

  const irADetalle = (tarea: Tarea) => {
    router.push(`/tecnico/tareas/${tarea.id_tarea}`);
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
      setTareaAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    } finally {
      setEliminando(false);
    }
  };

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  // ================================
  // RENDER LOADING
  // ================================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-emerald-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500 flex items-center justify-center shadow-2xl`}
            >
              <CheckCircle2 className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-5xl font-black mb-4 ${tema.colores.texto} bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 bg-clip-text text-transparent`}
          >
            Cargando Tareas Completadas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu historial de éxitos...
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
              Acceso restringido
            </h2>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Este módulo es exclusivo para cuentas con rol <b>TÉCNICO</b>.
            </p>
            <Link
              href="/login"
              className={`mt-3 inline-flex items-center gap-2 px-8 py-4 rounded-2xl ${tema.colores.primario} text-white font-bold ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
            >
              <LogOut className="w-5 h-5" />
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // RENDER PRINCIPAL ULTRA PREMIUM
  // ================================

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} transition-all duration-700 relative overflow-hidden`}
    >
      {/* Efectos de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"
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
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:text-emerald-500 transition-colors duration-300`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar tareas completadas..."
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 shadow-lg`}
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
        {/* Breadcrumb y Título */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-3">
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
              Completadas
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className={`text-5xl md:text-6xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 bg-clip-text text-transparent">
                  Tareas Completadas
                </span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold uppercase tracking-wider shadow-2xl shadow-emerald-500/50">
                  <Trophy className="w-4 h-4 mr-1" />
                  {kpis.total} Logros
                </span>
              </h1>
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
              >
                <Award className="w-5 h-5 text-emerald-400" />
                Historial de tareas finalizadas exitosamente
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
                onClick={recargarTareas}
                disabled={loadingTareas}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingTareas ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>
              <Link
                href="/tecnico/tareas/nueva"
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.primario} text-white font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300`}
              >
                <Plus className="w-5 h-5" />
                Nueva Tarea
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs Ultra Premium */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-8">
          {/* Total */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.total}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Total Completadas
              </div>
            </div>
          </div>

          {/* Hoy */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.hoy}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                📅 Hoy
              </div>
            </div>
          </div>

          {/* Semana */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.semana}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                📊 Esta Semana
              </div>
            </div>
          </div>

          {/* Mes */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.mes}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                📈 Este Mes
              </div>
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.tiempoPromedio.toFixed(1)}h
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                ⏱ Tiempo Promedio
              </div>
            </div>
          </div>

          {/* Críticas Completadas */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
              </div>
              <div
                className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.criticas}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                🏆 Críticas Resueltas
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Ultra Premium */}
        <div
          className={`rounded-3xl p-6 mb-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-xl`}
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
                  Refina tu historial de tareas completadas
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFiltroPrioridad("todas");
                setFiltroCentro("todos");
                setFiltroFecha("todas");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todas">Todas las Prioridades</option>
                <option value="critica">🔴 Crítica</option>
                <option value="urgente">🟠 Urgente</option>
                <option value="alta">🟡 Alta</option>
                <option value="media">🔵 Media</option>
                <option value="baja">🟢 Baja</option>
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
                onChange={(e) => setFiltroCentro(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todos">Todos los Centros</option>
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
                <Calendar className="w-3 h-3" />
                Período
              </label>
              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl`}
              >
                <option value="todas">Todas las Fechas</option>
                <option value="hoy">📅 Hoy</option>
                <option value="semana">📊 Última Semana</option>
                <option value="mes">📈 Último Mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Tareas Completadas Ultra Premium */}
        <div
          className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl`}
              >
                <ClipboardCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3
                  className={`text-2xl font-black ${tema.colores.texto} flex items-center gap-2`}
                >
                  Historial de Éxitos
                  <span
                    className={`text-xs px-4 py-1.5 rounded-full ${tema.colores.secundario} ${tema.colores.texto} font-bold shadow-lg`}
                  >
                    {tareasFiltradas.length} tareas
                  </span>
                </h3>
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario} mt-1`}
                >
                  Registro completo de todas tus tareas finalizadas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <FileText className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={() =>
                  window.open(
                    "/api/tareas/export-excel?estado=completada",
                    "_blank"
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {loadingTareas ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-500/20" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/4 bg-gray-500/20 rounded-xl" />
                      <div className="h-4 w-full bg-gray-500/20 rounded-xl" />
                      <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-500/20 rounded-full" />
                        <div className="h-6 w-20 bg-gray-500/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tareasFiltradas.length === 0 ? (
            <div className="py-20 text-center">
              <div
                className={`w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl animate-pulse`}
              >
                <Trophy className="w-14 h-14 text-white" />
              </div>
              <p className={`text-2xl font-black ${tema.colores.texto} mb-3`}>
                Sin tareas completadas
              </p>
              <p className={`${tema.colores.textoSecundario} mb-8 text-lg`}>
                No hay tareas completadas que coincidan con los filtros
              </p>
              <Link
                href="/tecnico/tareas/pendientes"
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${tema.colores.primario} text-white font-bold ${tema.colores.sombra} hover:scale-105 transition-all duration-300 shadow-2xl`}
              >
                <CheckSquare2 className="w-5 h-5" />
                Ver Tareas Pendientes
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tareasFiltradas.map((tarea, idx) => (
                <div
                  key={tarea.id_tarea}
                  className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.hover} transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer relative overflow-hidden`}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                  onClick={() => irADetalle(tarea)}
                >
                  {/* Efecto de éxito */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-start gap-4 relative z-10">
                    {/* Icono de Completada */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0`}
                    >
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-xl font-black ${tema.colores.texto} mb-2 group-hover:text-emerald-400 transition-colors duration-200`}
                          >
                            {tarea.titulo}
                          </h4>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario} line-clamp-2 mb-3`}
                          >
                            {tarea.descripcion}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-4 py-2 rounded-2xl text-xs font-black border-2 ${obtenerColorPrioridad(
                              tarea.prioridad
                            )} transform group-hover:scale-110 transition-all duration-300 whitespace-nowrap`}
                          >
                            <Flame className="w-3 h-3 inline mr-1" />
                            {tarea.prioridad.toUpperCase()}
                          </span>
                          <span className="px-4 py-2 rounded-2xl text-xs font-black border-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            COMPLETADA
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/20">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span className="text-xs font-semibold">
                            {tarea.responsable.nombre_completo}
                          </span>
                        </div>
                        {tarea.centro && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/20">
                            <Building2 className="w-3 h-3 text-sky-400" />
                            <span className="text-xs font-semibold">
                              {tarea.centro.nombre}
                            </span>
                          </div>
                        )}
                        {tarea.fecha_completada && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-300">
                              Completada: {formatearFecha(tarea.fecha_completada)}
                            </span>
                          </div>
                        )}
                        {tarea.tiempo_resolucion_horas && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-300">
                              {tarea.tiempo_resolucion_horas.toFixed(1)}h
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/20">
                          <ClipboardList className="w-3 h-3 text-purple-400" />
                          <span className="text-xs font-semibold">
                            {tarea.tipo}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {tarea.tags && tarea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tarea.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/20"
                            >
                              #{tag}
                            </span>
                          ))}
                          {tarea.tags.length > 5 && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/20">
                              +{tarea.tags.length - 5} más
                            </span>
                          )}
                        </div>
                      )}

                     {/* Acciones */}
<div className="flex items-center gap-2">
  <button
    onClick={(e) => {
      e.stopPropagation();
      irADetalle(tarea);
    }}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl ${tema.colores.primario} text-white text-sm font-bold hover:scale-105 transition-all duration-300 shadow-xl`}
  >
    <Eye className="w-4 h-4" />
    Ver Detalle
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      // Compartir o celebrar
    }}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-bold hover:scale-105 transition-all duration-300 shadow-xl`}
  >
    <ThumbsUp className="w-4 h-4" />
    Celebrar
  </button>

  {/* MENÚ REEMPLAZADO POR BOTONES DIRECTOS */}
  <div className="flex items-center gap-2">

    <button
      onClick={(e) => {
        e.stopPropagation();
        irADetalle(tarea);
      }}
      className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold hover:scale-105 transition-all duration-300 shadow-lg`}
    >
      <Eye className="w-4 h-4" />
      Ver Detalle Completo
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        // Descargar reporte
      }}
      className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold hover:scale-105 transition-all duration-300 shadow-lg`}
    >
      <Download className="w-4 h-4" />
      Descargar Reporte
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        // Compartir / destacar
      }}
      className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold hover:scale-105 transition-all duration-300 shadow-lg`}
    >
      <Star className="w-4 h-4" />
      Marcar como Destacada
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        confirmarEliminarTarea(tarea);
      }}
      disabled={!tarea.puede_eliminar}
      className="flex items-center gap-3 px-5 py-2.5 rounded-2xl text-rose-400 hover:bg-rose-500/20 text-sm font-bold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Trash className="w-4 h-4" />
      Eliminar del Historial
    </button>

  </div>
</div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Logros y Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Logros Destacados */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl`}
              >
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                  Logros Destacados
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Tus mejores resultados
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <Medal className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Racha de Completadas
                    </p>
                    <p className="text-xs text-emerald-300">
                      {kpis.semana} tareas esta semana
                    </p>
                  </div>
                </div>
                <Star className="w-6 h-6 text-amber-400" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-sky-400" />
                  <div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Eficiencia
                    </p>
                    <p className="text-xs text-sky-300">
                      {kpis.tiempoPromedio.toFixed(1)}h promedio
                    </p>
                  </div>
                </div>
                <Award className="w-6 h-6 text-sky-400" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/30">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-rose-400" />
                  <div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Tareas Críticas
                    </p>
                    <p className="text-xs text-rose-300">
                      {kpis.criticas} resueltas
                    </p>
                  </div>
                </div>
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Gráfico de Rendimiento */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl`}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                  Rendimiento
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Análisis de productividad
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    Tareas Hoy
                  </span>
                  <span className="text-sm font-black text-emerald-400">
                    {kpis.hoy}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((kpis.hoy / kpis.total) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    Esta Semana
                  </span>
                  <span className="text-sm font-black text-sky-400">
                    {kpis.semana}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((kpis.semana / kpis.total) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    Este Mes
                  </span>
                  <span className="text-sm font-black text-purple-400">
                    {kpis.mes}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((kpis.mes / kpis.total) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t-2 border-white/10">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    Total Completadas
                  </span>
                  <span className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                    {kpis.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Eliminar */}
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
                  Eliminar del Historial
                </h3>
              </div>
              <p className={`text-base mb-6 ${tema.colores.textoSecundario}`}>
                ¿Estás seguro de que deseas eliminar la tarea{" "}
                <span className={`font-black ${tema.colores.texto}`}>
                  "{tareaAEliminar.titulo}"
                </span>{" "}
                del historial? Esta acción no se puede deshacer.
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
              className={`w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-xl`}
            >
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                © 2025 AnyssaMed
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Módulo Ultra Premium de Tareas Completadas
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

        /* Animación de entrada para tareas */
        .space-y-4 > div {
          animation: fadeIn 0.3s ease-out backwards;
        }

        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.8),
            rgba(5, 150, 105, 0.8)
          );
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 1),
            rgba(5, 150, 105, 1)
          );
        }

        /* Transiciones suaves */
        * {
          transition-property: background-color, border-color, color, fill,
            stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efecto de brillo en hover */
        .group:hover .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25);
        }

        /* Efecto de celebración */
        @keyframes celebrate {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(-5deg);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        .group:hover .trophy-icon {
          animation: celebrate 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

