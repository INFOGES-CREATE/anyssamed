// src/app/(dashboard)/tecnico/equipos/alertas/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  Home,
  ArrowRight,
  Bell,
  Lightbulb,
  BellOff,
  BellRing,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardList,
  Cpu,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  HardDrive,
  Loader2,
  LogOut,
  Mail,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  User,
  Wrench,
  X,
  Zap,
  Radio,
  Volume2,
  VolumeX,
  Archive,
  Trash2,
  ExternalLink,
  MessageSquare,
  Phone,
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

type TipoAlerta =
  | "mantenimiento_vencido"
  | "mantenimiento_proximo"
  | "equipo_critico"
  | "falla_detectada"
  | "calibracion_requerida"
  | "repuesto_bajo_stock"
  | "ticket_sin_asignar"
  | "ticket_vencido"
  | "sistema"
  | "seguridad";

type PrioridadAlerta = "baja" | "media" | "alta" | "critica";

type EstadoAlerta = "activa" | "leida" | "en_proceso" | "resuelta" | "archivada";

interface AlertaTecnica {
  id_alerta: number;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  estado: EstadoAlerta;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_leida: string | null;
  fecha_resuelta: string | null;
  requiere_accion: boolean;
  accion_sugerida: string | null;
  id_equipo: number | null;
  equipo: {
    codigo_interno: string;
    nombre: string;
    tipo_equipo: string;
    centro: string;
    ubicacion: string;
  } | null;
  id_ticket: number | null;
  id_mantenimiento: number | null;
  asignado_a: number | null;
  tecnico_asignado: string | null;
  tiempo_respuesta_esperado_horas: number;
  tiempo_transcurrido_horas: number;
  url_accion: string | null;
  metadata: {
    dias_vencimiento?: number;
    costo_estimado?: number;
    impacto_operacional?: "bajo" | "medio" | "alto" | "critico";
    usuarios_afectados?: number;
    [key: string]: any;
  } | null;
}

interface ApiAlertasResponse {
  success: boolean;
  alertas?: AlertaTecnica[];
  error?: string;
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

// ================================
// TEMAS PREMIUM ULTRA
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
    icono: Cpu,
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
    icono: AlertTriangle,
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

export default function AlertasEquiposPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [errorAlertas, setErrorAlertas] = useState<string | null>(null);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [alertas, setAlertas] = useState<AlertaTecnica[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoAlerta | "todos">("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<
    PrioridadAlerta | "todos"
  >("todos");
  const [filtroEstado, setFiltroEstado] = useState<EstadoAlerta | "todos">(
    "todos"
  );
  const [soloCriticas, setSoloCriticas] = useState(false);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);

  const [alertaSeleccionada, setAlertaSeleccionada] =
    useState<AlertaTecnica | null>(null);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );

  const [sonidoActivo, setSonidoActivo] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ================================
  // EFECTOS: TEMA Y BODY
  // ================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem(
        "tema_tecnico"
      ) as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }

      const sonidoGuardado = localStorage.getItem("alertas_sonido");
      if (sonidoGuardado !== null) {
        setSonidoActivo(sonidoGuardado === "true");
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  // ================================
  // EFECTO: CARGAR SESIÓN
  // ================================

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

  // ================================
  // EFECTO: CARGAR ALERTAS
  // ================================

  const cargarAlertas = async () => {
    try {
      setLoadingAlertas(true);
      setErrorAlertas(null);

      const res = await fetch("/api/tecnico/alertas", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      let data: ApiAlertasResponse;
      try {
        data = (await res.json()) as ApiAlertasResponse;
      } catch {
        data = { success: false, error: "Respuesta inválida" };
      }

      if (!res.ok || !data.success || !data.alertas) {
        console.warn("No se pudieron cargar alertas desde la API.");
        setAlertas([]);
        if (data.error) setErrorAlertas(data.error);
        return;
      }

      // Reproducir sonido si hay alertas críticas nuevas
      if (sonidoActivo) {
        const alertasCriticasNuevas = data.alertas.filter(
          (a) =>
            a.prioridad === "critica" &&
            a.estado === "activa" &&
            !a.fecha_leida
        );
        if (alertasCriticasNuevas.length > 0) {
          reproducirSonidoAlerta();
        }
      }

      setAlertas(data.alertas);
    } catch (err) {
      console.error("Error al cargar alertas:", err);
      setAlertas([]);
      setErrorAlertas("No se pudo cargar el sistema de alertas.");
    } finally {
      setLoadingAlertas(false);
    }
  };

  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarAlertas();
    }
  }, [usuario]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico?.id_tecnico) return;

    const interval = setInterval(() => {
      cargarAlertas();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, usuario]);

  // ================================
  // FUNCIONES DE UTILIDAD
  // ================================

  const reproducirSonidoAlerta = () => {
    try {
      const audio = new Audio("/sounds/alert.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("No se pudo reproducir sonido:", e));
    } catch (e) {
      console.log("Audio no disponible:", e);
    }
  };

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

  const toggleSonido = () => {
    const nuevoEstado = !sonidoActivo;
    setSonidoActivo(nuevoEstado);
    if (typeof window !== "undefined") {
      localStorage.setItem("alertas_sonido", String(nuevoEstado));
    }
  };

  // ================================
  // ACCIONES DE ALERTAS
  // ================================

  const marcarComoLeida = async (id_alerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${id_alerta}/leer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        setAlertas((prev) =>
          prev.map((a) =>
            a.id_alerta === id_alerta
              ? { ...a, estado: "leida", fecha_leida: new Date().toISOString() }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const marcarComoResuelta = async (id_alerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${id_alerta}/resolver`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        setAlertas((prev) =>
          prev.map((a) =>
            a.id_alerta === id_alerta
              ? {
                  ...a,
                  estado: "resuelta",
                  fecha_resuelta: new Date().toISOString(),
                }
              : a
          )
        );
        if (alertaSeleccionada?.id_alerta === id_alerta) {
          setAlertaSeleccionada(null);
        }
      }
    } catch (err) {
      console.error("Error al resolver alerta:", err);
    }
  };

  const archivarAlerta = async (id_alerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${id_alerta}/archivar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        setAlertas((prev) =>
          prev.map((a) =>
            a.id_alerta === id_alerta ? { ...a, estado: "archivada" } : a
          )
        );
        if (alertaSeleccionada?.id_alerta === id_alerta) {
          setAlertaSeleccionada(null);
        }
      }
    } catch (err) {
      console.error("Error al archivar alerta:", err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const res = await fetch("/api/tecnico/alertas/leer-todas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        setAlertas((prev) =>
          prev.map((a) =>
            a.estado === "activa"
              ? { ...a, estado: "leida", fecha_leida: new Date().toISOString() }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err);
    }
  };

  // ================================
  // HELPERS
  // ================================

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const formatearFechaHora = (fecha: string | null) => {
    if (!fecha) return "Sin registro";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Sin registro";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const tiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const creacion = new Date(fecha);
    const diffMs = ahora.getTime() - creacion.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffDias > 0) return `Hace ${diffDias} día${diffDias > 1 ? "s" : ""}`;
    if (diffHoras > 0) return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
    if (diffMinutos > 0)
      return `Hace ${diffMinutos} minuto${diffMinutos > 1 ? "s" : ""}`;
    return "Justo ahora";
  };

  const obtenerBadgePrioridad = (prioridad: PrioridadAlerta) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (prioridad) {
      case "baja":
        return isDark
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20"
          : "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm";
      case "media":
        return isDark
          ? "bg-sky-500/20 text-sky-300 border border-sky-500/60 shadow-lg shadow-sky-500/20"
          : "bg-sky-50 text-sky-700 border border-sky-300 shadow-sm";
      case "alta":
        return isDark
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20"
          : "bg-amber-50 text-amber-700 border border-amber-300 shadow-sm";
      case "critica":
        return isDark
          ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-500/20 animate-pulse"
          : "bg-rose-50 text-rose-700 border border-rose-300 shadow-sm animate-pulse";
    }
  };

  const obtenerBadgeEstado = (estado: EstadoAlerta) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (estado) {
      case "activa":
        return isDark
          ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-500/20 animate-pulse"
          : "bg-rose-50 text-rose-700 border border-rose-300 shadow-sm animate-pulse";
      case "leida":
        return isDark
          ? "bg-sky-500/20 text-sky-300 border border-sky-500/60 shadow-lg shadow-sky-500/20"
          : "bg-sky-50 text-sky-700 border border-sky-300 shadow-sm";
      case "en_proceso":
        return isDark
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20"
          : "bg-amber-50 text-amber-700 border border-amber-300 shadow-sm";
      case "resuelta":
        return isDark
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20"
          : "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm";
      case "archivada":
        return isDark
          ? "bg-slate-500/20 text-slate-300 border border-slate-500/60 shadow-lg shadow-slate-500/20"
          : "bg-slate-50 text-slate-700 border border-slate-300 shadow-sm";
    }
  };

  const obtenerIconoTipo = (tipo: TipoAlerta) => {
    switch (tipo) {
      case "mantenimiento_vencido":
        return <CalendarClock className="w-5 h-5" />;
      case "mantenimiento_proximo":
        return <Calendar className="w-5 h-5" />;
      case "equipo_critico":
        return <AlertOctagon className="w-5 h-5" />;
      case "falla_detectada":
        return <AlertTriangle className="w-5 h-5" />;
      case "calibracion_requerida":
        return <Target className="w-5 h-5" />;
      case "repuesto_bajo_stock":
        return <Database className="w-5 h-5" />;
      case "ticket_sin_asignar":
        return <ClipboardList className="w-5 h-5" />;
      case "ticket_vencido":
        return <Clock className="w-5 h-5" />;
      case "sistema":
        return <Settings className="w-5 h-5" />;
      case "seguridad":
        return <Shield className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const obtenerColorTipo = (tipo: TipoAlerta) => {
    switch (tipo) {
      case "mantenimiento_vencido":
        return "from-rose-600 to-red-600";
      case "mantenimiento_proximo":
        return "from-amber-600 to-orange-600";
      case "equipo_critico":
        return "from-red-600 to-rose-600";
      case "falla_detectada":
        return "from-orange-600 to-red-600";
      case "calibracion_requerida":
        return "from-purple-600 to-pink-600";
      case "repuesto_bajo_stock":
        return "from-yellow-600 to-amber-600";
      case "ticket_sin_asignar":
        return "from-blue-600 to-cyan-600";
      case "ticket_vencido":
        return "from-rose-600 to-pink-600";
      case "sistema":
        return "from-gray-600 to-slate-600";
      case "seguridad":
        return "from-red-700 to-rose-700";
      default:
        return "from-indigo-600 to-purple-600";
    }
  };

  // ================================
  // FILTROS Y KPIs
  // ================================

  const alertasFiltradas = useMemo(() => {
    let lista = [...alertas];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (a) =>
          a.titulo.toLowerCase().includes(q) ||
          a.descripcion.toLowerCase().includes(q) ||
          a.equipo?.nombre.toLowerCase().includes(q) ||
          a.equipo?.codigo_interno.toLowerCase().includes(q)
      );
    }

    if (filtroTipo !== "todos") {
      lista = lista.filter((a) => a.tipo === filtroTipo);
    }

    if (filtroPrioridad !== "todos") {
      lista = lista.filter((a) => a.prioridad === filtroPrioridad);
    }

    if (filtroEstado !== "todos") {
      lista = lista.filter((a) => a.estado === filtroEstado);
    }

    if (soloCriticas) {
      lista = lista.filter((a) => a.prioridad === "critica");
    }

    if (soloNoLeidas) {
      lista = lista.filter((a) => a.estado === "activa" && !a.fecha_leida);
    }

    // Ordenar por prioridad y fecha
    lista.sort((a, b) => {
      const prioridadOrden = { critica: 4, alta: 3, media: 2, baja: 1 };
      const diffPrioridad =
        prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
      if (diffPrioridad !== 0) return diffPrioridad;

      return (
        new Date(b.fecha_creacion).getTime() -
        new Date(a.fecha_creacion).getTime()
      );
    });

    return lista;
  }, [
    alertas,
    busqueda,
    filtroTipo,
    filtroPrioridad,
    filtroEstado,
    soloCriticas,
    soloNoLeidas,
  ]);

  const kpis = useMemo(() => {
    const total = alertas.length;
    const activas = alertas.filter((a) => a.estado === "activa").length;
    const criticas = alertas.filter((a) => a.prioridad === "critica").length;
    const noLeidas = alertas.filter(
      (a) => a.estado === "activa" && !a.fecha_leida
    ).length;
    const enProceso = alertas.filter((a) => a.estado === "en_proceso").length;
    const resueltas = alertas.filter((a) => a.estado === "resuelta").length;
    const vencidas = alertas.filter(
      (a) =>
        a.tiempo_transcurrido_horas > a.tiempo_respuesta_esperado_horas &&
        a.estado !== "resuelta"
    ).length;

    return {
      total,
      activas,
      criticas,
      noLeidas,
      enProceso,
      resueltas,
      vencidas,
    };
  }, [alertas]);

  // ================================
  // ESTADOS DE CARGA
  // ================================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-rose-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 flex items-center justify-center shadow-2xl`}
            >
              <BellRing className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-4xl font-black mb-3 ${tema.colores.texto} animate-pulse`}
          >
            Cargando Sistema de Alertas
          </h2>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Verificando tu sesión de técnico...
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
            <div
              className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
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
              <AlertOctagon className="w-12 h-12 text-white" />
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
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
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
          {/* Búsqueda Premium */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:text-rose-500 transition-colors duration-300`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar alertas por título, descripción o equipo..."
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all duration-300 shadow-lg`}
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
                <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-xl bg-rose-500/10 backdrop-blur-sm border border-rose-500/30 animate-fadeIn">
                  <p className="text-xs text-rose-300 font-semibold">
                    🔍 {alertasFiltradas.length} alertas encontradas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones Premium */}
          <div className="flex items-center gap-3 ml-6">
            {/* Control de Sonido */}
            <button
              onClick={toggleSonido}
              className={`p-3 rounded-2xl ${
                sonidoActivo
                  ? "bg-gradient-to-r from-emerald-600 to-green-600"
                  : "bg-gray-600"
              } text-white transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              title={sonidoActivo ? "Sonido activado" : "Sonido desactivado"}
            >
              {sonidoActivo ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            {/* Auto-refresh */}
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`p-3 rounded-2xl ${
                autoRefresh
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                  : "bg-gray-600"
              } text-white transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              title={
                autoRefresh
                  ? "Auto-actualización activada"
                  : "Auto-actualización desactivada"
              }
            >
              <Radio
                className={`w-5 h-5 ${autoRefresh ? "animate-pulse" : ""}`}
              />
            </button>

            {/* Temas con animación */}
            <div className="relative group">
              <button
                className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Temas Premium
                  </p>
                </div>
                <div className="space-y-2">
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
            </div>

            {/* Notificaciones Premium con contador */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <BellRing className="w-5 h-5" />
                {kpis.criticas > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-red-500 border-2 border-white animate-ping" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-red-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                      {kpis.criticas}
                    </span>
                  </>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-3 w-96 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 animate-fadeIn max-h-[500px] overflow-y-auto custom-scrollbar-premium`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-5 h-5 text-rose-400 animate-pulse" />
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        Alertas Críticas
                      </p>
                    </div>
                    {kpis.criticas > 0 && (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white text-xs font-bold animate-pulse">
                        {kpis.criticas} críticas
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {alertas
                      .filter((a) => a.prioridad === "critica" && a.estado === "activa")
                      .slice(0, 5)
                      .map((a) => (
                        <div
                          key={a.id_alerta}
                          onClick={() => {
                            setAlertaSeleccionada(a);
                            setNotificacionesAbiertas(false);
                          }}
                          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-600 to-red-600 flex-shrink-0">
                              {obtenerIconoTipo(a.tipo)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-rose-300 truncate group-hover:text-rose-200">
                                {a.titulo}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
                                {a.descripcion}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-1">
                                {tiempoTranscurrido(a.fecha_creacion)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {kpis.criticas === 0 && (
                      <div className="py-8 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-emerald-400">
                          ¡Todo bajo control!
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          No hay alertas críticas activas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilidad Premium */}
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

            {/* Perfil Premium */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <div className="hidden md:block text-right">
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-lg font-bold shadow-xl`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={56}
                          height={56}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-base font-bold ${tema.colores.texto} truncate`}
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
                  <div className="space-y-1 text-xs">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <User className="w-4 h-4" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/20 text-xs font-bold transform hover:scale-105 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT ULTRA PREMIUM */}
      <main
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-28 px-8 pb-12 relative z-10`}
      >
        {/* Encabezado Ultra Premium con Animaciones */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs mb-2">
                <Link
                  href="/tecnico"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200 flex items-center gap-1`}
                >
                  <Home className="w-3 h-3" />
                  Dashboard Técnico
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href="/tecnico/equipos"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
                >
                  Equipos
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className={`font-bold ${tema.colores.texto} flex items-center gap-1`}>
                  <BellRing className="w-3 h-3 animate-pulse" />
                  Alertas
                </span>
              </div>
              <h1
                className={`text-4xl md:text-6xl font-black flex items-center gap-4 ${tema.colores.texto} mb-2`}
              >
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient">
                  Centro de Alertas
                </span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-2xl shadow-rose-500/50 animate-pulse">
                  ⚡ Ultra Premium
                </span>
              </h1>
              <p
                className={`text-sm md:text-base mt-2 ${tema.colores.textoSecundario} max-w-3xl`}
              >
                Sistema de monitoreo en tiempo real con alertas inteligentes,
                notificaciones automáticas y gestión completa de equipos críticos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tecnico/equipos"
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Equipos
              </Link>
              <button
                onClick={cargarAlertas}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingAlertas ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>
              {kpis.noLeidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white transform hover:scale-105 transition-all duration-300 shadow-xl`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar Todas como Leídas
                </button>
              )}
              <Link
                href="/tecnico/equipos/nuevo"
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
              >
                <Plus className="w-4 h-4" />
                Nuevo Equipo
              </Link>
              <button
                onClick={() =>
                  window.open("/api/tecnico/alertas/export-excel", "_blank")
                }
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {errorAlertas && (
            <div className="mt-3 flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">{errorAlertas}</span>
            </div>
          )}
        </div>

        {/* KPIs Ultra Premium con Animaciones Avanzadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-5 mb-8">
          {/* Total */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Total
                </p>
                <div className="p-2 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-all duration-300 group-hover:rotate-12">
                  <Bell className="w-5 h-5 text-indigo-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p
                className={`text-4xl font-black ${tema.colores.texto} mb-2 group-hover:scale-110 transition-transform duration-300`}
              >
                {kpis.total}
              </p>
              <p className="text-xs text-indigo-300 font-semibold">
                Alertas registradas
              </p>
            </div>
          </div>

          {/* Activas */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Activas
                </p>
                <div className="p-2 rounded-xl bg-rose-500/20 group-hover:bg-rose-500/40 transition-all duration-300 animate-pulse group-hover:rotate-12">
                  <AlertOctagon className="w-5 h-5 text-rose-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p className="text-4xl font-black text-rose-400 mb-2 group-hover:scale-110 transition-transform duration-300 animate-pulse">
                {kpis.activas}
              </p>
              <p className="text-xs text-rose-300 font-semibold">
                🚨 Requieren atención
              </p>
            </div>
          </div>

          {/* Críticas */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Críticas
                </p>
                <div className="p-2 rounded-xl bg-red-500/30 group-hover:bg-red-500/50 transition-all duration-300 animate-pulse group-hover:rotate-12">
                  <Flame className="w-5 h-5 text-red-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p className="text-4xl font-black text-red-400 mb-2 group-hover:scale-110 transition-transform duration-300 animate-pulse">
                {kpis.criticas}
              </p>
              <p className="text-xs text-red-300 font-semibold">
                🔥 Máxima prioridad
              </p>
            </div>
          </div>

          {/* No Leídas */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  No Leídas
                </p>
                <div className="p-2 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/40 transition-all duration-300 group-hover:rotate-12">
                  <Mail className="w-5 h-5 text-amber-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p className="text-4xl font-black text-amber-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                {kpis.noLeidas}
              </p>
              <p className="text-xs text-amber-200 font-semibold">
                📬 Pendientes de revisar
              </p>
            </div>
          </div>

          {/* En Proceso */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  En Proceso
                </p>
                <div className="p-2 rounded-xl bg-sky-500/20 group-hover:bg-sky-500/40 transition-all duration-300 group-hover:rotate-12">
                  <Activity className="w-5 h-5 text-sky-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p className="text-4xl font-black text-sky-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                {kpis.enProceso}
              </p>
              <p className="text-xs text-sky-200 font-semibold">
                ⚙️ En atención
              </p>
            </div>
          </div>

          {/* Resueltas */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Resueltas
                </p>
                <div className="p-2 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all duration-300 group-hover:rotate-12">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p className="text-4xl font-black text-emerald-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                {kpis.resueltas}
              </p>
              <p className="text-xs text-emerald-200 font-semibold">
                ✓ Completadas
              </p>
            </div>
          </div>

          {/* Vencidas */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Vencidas
                </p>
                <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/40 transition-all duration-300 animate-pulse group-hover:rotate-12">
                  <Clock className="w-5 h-5 text-purple-400 group-hover:animate-bounce" />
                </div>
              </div>
              <p className="text-4xl font-black text-purple-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                {kpis.vencidas}
              </p>
              <p className="text-xs text-purple-200 font-semibold">
                ⏰ Tiempo excedido
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal con filtros */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Panel de filtros lateral Ultra Premium */}
          <aside
            className={`xl:col-span-1 rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} h-fit sticky top-28 transform hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 flex items-center justify-center shadow-2xl animate-pulse`}
              >
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-base font-black ${tema.colores.texto}`}>
                  Filtros Inteligentes
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Personaliza tu vista
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Filtro Tipo */}
              <div>
                <label
                  className={`text-xs font-bold mb-3 block ${tema.colores.textoSecundario} uppercase tracking-wider`}
                >
                  🎯 Tipo de Alerta
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setFiltroTipo("todos")}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroTipo === "todos"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todos los Tipos
                  </button>
                  {[
                    { value: "mantenimiento_vencido", label: "🔴 Mant. Vencido", color: "from-rose-600 to-red-600" },
                    { value: "mantenimiento_proximo", label: "🟡 Mant. Próximo", color: "from-amber-600 to-orange-600" },
                    { value: "equipo_critico", label: "🚨 Equipo Crítico", color: "from-red-600 to-rose-600" },
                    { value: "falla_detectada", label: "⚠️ Falla Detectada", color: "from-orange-600 to-red-600" },
                    { value: "calibracion_requerida", label: "⚖️ Calibración", color: "from-purple-600 to-pink-600" },
                    { value: "repuesto_bajo_stock", label: "📦 Stock Bajo", color: "from-yellow-600 to-amber-600" },
                    { value: "ticket_sin_asignar", label: "📋 Ticket S/A", color: "from-blue-600 to-cyan-600" },
                    { value: "ticket_vencido", label: "⏰ Ticket Vencido", color: "from-rose-600 to-pink-600" },
                    { value: "sistema", label: "⚙️ Sistema", color: "from-gray-600 to-slate-600" },
                    { value: "seguridad", label: "🛡️ Seguridad", color: "from-red-700 to-rose-700" },
                  ].map((tipo) => (
                    <button
                      key={tipo.value}
                      onClick={() => setFiltroTipo(tipo.value as TipoAlerta)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 text-left ${
                        filtroTipo === tipo.value
                          ? `bg-gradient-to-r ${tipo.color} text-white shadow-lg`
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro Prioridad */}
              <div>
                <label
                  className={`text-xs font-bold mb-3 block ${tema.colores.textoSecundario} uppercase tracking-wider`}
                >
                  🎯 Nivel de Prioridad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroPrioridad("todos")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "todos"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("baja")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "baja"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🟢 Baja
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("media")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "media"
                        ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🟡 Media
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("alta")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "alta"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🟠 Alta
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("critica")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold col-span-2 transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "critica"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50 animate-pulse"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🔴 Crítica
                  </button>
                </div>
              </div>

              {/* Filtro Estado */}
              <div>
                <label
                  className={`text-xs font-bold mb-3 block ${tema.colores.textoSecundario} uppercase tracking-wider`}
                >
                  ⚡ Estado de Alerta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroEstado("todos")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "todos"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado("activa")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "activa"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50 animate-pulse"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🚨 Activa
                  </button>
                  <button
                    onClick={() => setFiltroEstado("leida")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "leida"
                        ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    👁️ Leída
                  </button>
                  <button
                    onClick={() => setFiltroEstado("en_proceso")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "en_proceso"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    ⚙️ En Proceso
                  </button>
                  <button
                    onClick={() => setFiltroEstado("resuelta")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "resuelta"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    ✓ Resuelta
                  </button>
                  <button
                    onClick={() => setFiltroEstado("archivada")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "archivada"
                        ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg shadow-slate-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    📁 Archivada
                  </button>
                </div>
              </div>

              {/* Toggles Especiales */}
              <div className="space-y-3">
                {/* Solo Críticas */}
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    soloCriticas
                      ? "bg-rose-500/20 border-2 border-rose-500/50"
                      : "bg-black/5 border-2 border-transparent"
                  } transition-all duration-300`}
                >
                  <div>
                    <label
                      className={`text-xs font-bold ${tema.colores.texto} block mb-1`}
                    >
                      🔥 Solo Críticas
                    </label>
                    <p className="text-[10px] text-gray-400">
                      Mostrar únicamente alertas críticas
                    </p>
                  </div>
                  <button
                    onClick={() => setSoloCriticas((v) => !v)}
                    className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                      soloCriticas
                        ? "bg-gradient-to-r from-rose-600 to-red-600 shadow-lg shadow-rose-500/50"
                        : "bg-slate-500/40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                        soloCriticas ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Solo No Leídas */}
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    soloNoLeidas
                      ? "bg-amber-500/20 border-2 border-amber-500/50"
                      : "bg-black/5 border-2 border-transparent"
                  } transition-all duration-300`}
                >
                  <div>
                    <label
                      className={`text-xs font-bold ${tema.colores.texto} block mb-1`}
                    >
                      📬 Solo No Leídas
                    </label>
                    <p className="text-[10px] text-gray-400">
                      Mostrar solo alertas pendientes
                    </p>
                  </div>
                  <button
                    onClick={() => setSoloNoLeidas((v) => !v)}
                    className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                      soloNoLeidas
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-500/50"
                        : "bg-slate-500/40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                        soloNoLeidas ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Botón Limpiar Filtros */}
              <button
                onClick={() => {
                  setBusqueda("");
                  setFiltroTipo("todos");
                  setFiltroPrioridad("todos");
                  setFiltroEstado("todos");
                  setSoloCriticas(false);
                  setSoloNoLeidas(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <X className="w-4 h-4" />
                Limpiar Todos los Filtros
              </button>
            </div>
          </aside>

          {/* Contenido principal - Lista y Detalle Ultra Premium */}
          <section className="xl:col-span-3 space-y-6">
            {/* Lista de Alertas Ultra Premium */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 animate-pulse">
                    <BellRing className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>
                      Centro de Alertas Activas
                    </p>
                    <p className="text-xs text-rose-300 font-semibold">
                      {alertasFiltradas.length} alertas encontradas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {kpis.criticas > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-500 border border-rose-300/50 animate-pulse">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {kpis.criticas} críticas
                      </span>
                    </div>
                  )}
                  {kpis.noLeidas > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50">
                      <span className="text-xs font-bold text-amber-300">
                        {kpis.noLeidas} no leídas
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {loadingAlertas ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-rose-500/30 border-t-transparent rounded-full animate-spin" />
                    <div
                      className={`absolute inset-2 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 flex items-center justify-center`}
                    >
                      <BellRing className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto} mb-2`}>
                    Cargando alertas...
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Obteniendo notificaciones en tiempo real
                  </p>
                </div>
              ) : alertasFiltradas.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 mx-auto flex items-center justify-center mb-4 shadow-2xl`}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <p className={`text-lg font-black ${tema.colores.texto} mb-2`}>
                    ¡Todo bajo control!
                  </p>
                  <p className={`text-sm ${tema.colores.textoSecundario} mb-4`}>
                    No hay alertas que coincidan con los filtros actuales
                  </p>
                  <button
                    onClick={() => {
                      setBusqueda("");
                      setFiltroTipo("todos");
                      setFiltroPrioridad("todos");
                      setFiltroEstado("todos");
                      setSoloCriticas(false);
                      setSoloNoLeidas(false);
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.primario} text-white font-bold transform hover:scale-105 transition-all duration-300 shadow-xl`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[800px] overflow-y-auto custom-scrollbar-premium pr-2">
                  {alertasFiltradas.map((alerta, idx) => (
                    <div
                      key={alerta.id_alerta}
                      onClick={() => {
                        setAlertaSeleccionada(alerta);
                        if (alerta.estado === "activa" && !alerta.fecha_leida) {
                          marcarComoLeida(alerta.id_alerta);
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 group ${
                        alertaSeleccionada?.id_alerta === alerta.id_alerta
                          ? `bg-gradient-to-r ${obtenerColorTipo(
                              alerta.tipo
                            )}/20 border-${obtenerColorTipo(alerta.tipo)}/50 shadow-2xl`
                          : `${tema.colores.card} ${tema.colores.borde} hover:border-rose-500/50`
                      }`}
                      style={{
                        animationDelay: `${idx * 50}ms`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icono de Tipo */}
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${obtenerColorTipo(
                            alerta.tipo
                          )} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                        >
                          <div className="text-white">
                            {obtenerIconoTipo(alerta.tipo)}
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`text-base font-black ${tema.colores.texto} mb-1 group-hover:text-rose-400 transition-colors duration-200`}
                              >
                                {alerta.titulo}
                              </h3>
                              <p
                                className={`text-sm ${tema.colores.textoSecundario} line-clamp-2`}
                              >
                                {alerta.descripcion}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold ${obtenerBadgePrioridad(
                                  alerta.prioridad
                                )} transform group-hover:scale-110 transition-all duration-300`}
                              >
                                {alerta.prioridad.toUpperCase()}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold ${obtenerBadgeEstado(
                                  alerta.estado
                                )} transform group-hover:scale-110 transition-all duration-300`}
                              >
                                {alerta.estado.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Información del Equipo */}
                          {alerta.equipo && (
                            <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-black/5">
                              <HardDrive className="w-4 h-4 text-indigo-400" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold ${tema.colores.texto} truncate`}>
                                  {alerta.equipo.nombre}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {alerta.equipo.codigo_interno} • {alerta.equipo.centro}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Metadata y Acciones */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                {tiempoTranscurrido(alerta.fecha_creacion)}
                              </span>
                              {alerta.tiempo_transcurrido_horas >
                                alerta.tiempo_respuesta_esperado_horas && (
                                <span className="flex items-center gap-1 text-rose-400 animate-pulse">
                                  <AlertTriangle className="w-3 h-3" />
                                  Tiempo excedido
                                </span>
                              )}
                              {alerta.requiere_accion && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <Target className="w-3 h-3" />
                                  Requiere acción
                                </span>
                              )}
                            </div>

                            {/* Botones de Acción Rápida */}
                            <div className="flex items-center gap-2">
                              {alerta.estado === "activa" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    marcarComoResuelta(alerta.id_alerta);
                                  }}
                                  className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all duration-200 transform hover:scale-110"
                                  title="Marcar como resuelta"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {alerta.url_accion && (
                                <Link
                                  href={alerta.url_accion}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all duration-200 transform hover:scale-110"
                                  title="Ir a la acción"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              )}
                              {alerta.estado !== "archivada" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archivarAlerta(alerta.id_alerta);
                                  }}
                                  className="p-2 rounded-xl bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 transition-all duration-200 transform hover:scale-110"
                                  title="Archivar"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de Detalle Ultra Premium */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>
                      Detalle de la Alerta
                    </p>
                    <p className="text-xs text-indigo-300 font-semibold">
                      Información completa y acciones disponibles
                    </p>
                  </div>
                </div>
                {alertaSeleccionada && (
                  <button
                    onClick={() => setAlertaSeleccionada(null)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 transition-all duration-200 group"
                  >
                    <X className="w-5 h-5 text-rose-400 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                )}
              </div>

              {alertaSeleccionada ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Header de la alerta */}
                  <div
                    className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r ${obtenerColorTipo(
                      alertaSeleccionada.tipo
                    )}/20 border-2 border-${obtenerColorTipo(
                      alertaSeleccionada.tipo
                    )}/50`}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${obtenerColorTipo(
                        alertaSeleccionada.tipo
                      )} flex items-center justify-center shadow-2xl`}
                    >
                      <div className="text-white">
                        {obtenerIconoTipo(alertaSeleccionada.tipo)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-black ${tema.colores.texto} mb-1`}
                      >
                        {alertaSeleccionada.titulo}
                      </h3>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario} mb-3`}
                      >
                        {alertaSeleccionada.descripcion}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerBadgePrioridad(
                            alertaSeleccionada.prioridad
                          )}`}
                        >
                          Prioridad {alertaSeleccionada.prioridad}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerBadgeEstado(
                            alertaSeleccionada.estado
                          )}`}
                        >
                          {alertaSeleccionada.estado.replace("_", " ")}
                        </span>
                        {alertaSeleccionada.requiere_accion && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-bold">
                            ⚠️ Requiere acción
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grid de información */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Información del Equipo */}
                    {alertaSeleccionada.equipo && (
                      <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          Equipo Relacionado
                        </p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Nombre:</span>
                            <span
                              className={`font-bold ${tema.colores.texto} text-right`}
                            >
                              {alertaSeleccionada.equipo.nombre}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Código:</span>
                            <span
                              className={`font-mono font-bold ${tema.colores.texto}`}
                            >
                              {alertaSeleccionada.equipo.codigo_interno}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tipo:</span>
                            <span className={`font-bold ${tema.colores.texto}`}>
                              {alertaSeleccionada.equipo.tipo_equipo}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Centro:</span>
                            <span
                              className={`font-bold ${tema.colores.texto} text-right`}
                            >
                              {alertaSeleccionada.equipo.centro}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Ubicación:</span>
                            <span
                              className={`font-bold ${tema.colores.texto} text-right`}
                            >
                              {alertaSeleccionada.equipo.ubicacion}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tiempos y Fechas */}
                    <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Tiempos y Fechas
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Creada:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {formatearFechaHora(alertaSeleccionada.fecha_creacion)}
                          </span>
                        </div>
                        {alertaSeleccionada.fecha_leida && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Leída:</span>
                            <span className={`font-bold ${tema.colores.texto}`}>
                              {formatearFechaHora(alertaSeleccionada.fecha_leida)}
                            </span>
                          </div>
                        )}
                        {alertaSeleccionada.fecha_resuelta && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Resuelta:</span>
                            <span className="font-bold text-emerald-400">
                              {formatearFechaHora(alertaSeleccionada.fecha_resuelta)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tiempo transcurrido:</span>
                          <span
                            className={`font-bold ${
                              alertaSeleccionada.tiempo_transcurrido_horas >
                              alertaSeleccionada.tiempo_respuesta_esperado_horas
                                ? "text-rose-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {alertaSeleccionada.tiempo_transcurrido_horas}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tiempo esperado:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {alertaSeleccionada.tiempo_respuesta_esperado_horas}h
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Técnico Asignado */}
                    {alertaSeleccionada.tecnico_asignado && (
                      <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Técnico Asignado
                        </p>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                          >
                            {alertaSeleccionada.tecnico_asignado
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${tema.colores.texto}`}>
                              {alertaSeleccionada.tecnico_asignado}
                            </p>
                            <p className="text-xs text-gray-400">
                              Responsable de la alerta
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {alertaSeleccionada.metadata && (
                      <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Información Adicional
                        </p>
                        <div className="space-y-2 text-xs">
                          {Object.entries(alertaSeleccionada.metadata).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-400 capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <span className={`font-bold ${tema.colores.texto}`}>
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acción Sugerida */}
                  {alertaSeleccionada.accion_sugerida && (
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Acción Sugerida
                      </p>
                      <p className={`text-sm ${tema.colores.texto}`}>
                        {alertaSeleccionada.accion_sugerida}
                      </p>
                    </div>
                  )}

                  {/* Acciones Rápidas */}
                  <div className="flex flex-wrap items-center gap-3">
                    {alertaSeleccionada.estado === "activa" && (
                      <button
                        onClick={() =>
                          marcarComoResuelta(alertaSeleccionada.id_alerta)
                        }
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Marcar como Resuelta
                      </button>
                    )}
                    {alertaSeleccionada.url_accion && (
                      <Link
                        href={alertaSeleccionada.url_accion}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.primario} text-white text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir a la Acción
                      </Link>
                    )}
                    {alertaSeleccionada.id_equipo && (
                      <Link
                        href={`/tecnico/equipos/${alertaSeleccionada.id_equipo}`}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <HardDrive className="w-4 h-4" />
                        Ver Equipo
                      </Link>
                    )}
                    {alertaSeleccionada.id_ticket && (
                      <Link
                        href={`/tecnico/tickets/${alertaSeleccionada.id_ticket}`}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <ClipboardList className="w-4 h-4" />
                        Ver Ticket
                      </Link>
                    )}
                    {alertaSeleccionada.estado !== "archivada" && (
                        <button
                        onClick={() =>
                          archivarAlerta(alertaSeleccionada.id_alerta)
                        }
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <Archive className="w-4 h-4" />
                        Archivar Alerta
                      </button>
                    )}
                    <button
                      onClick={() => {
                        window.open(
                          `/api/tecnico/alertas/${alertaSeleccionada.id_alerta}/pdf`,
                          "_blank"
                        );
                      }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <FileText className="w-4 h-4" />
                      Generar Reporte
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} mx-auto flex items-center justify-center mb-4 shadow-2xl animate-pulse`}
                  >
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <p className={`text-lg font-black ${tema.colores.texto} mb-2`}>
                    Selecciona una alerta
                  </p>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Haz clic en cualquier alerta de la lista para ver su
                    información completa y acciones disponibles
                  </p>
                </div>
              )}
            </div>

            {/* Panel de Estadísticas en Tiempo Real */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-lg font-black ${tema.colores.texto}`}>
                    Análisis en Tiempo Real
                  </p>
                  <p className="text-xs text-purple-300 font-semibold">
                    Métricas y tendencias del sistema de alertas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tasa de Resolución */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-emerald-400 uppercase">
                      Tasa de Resolución
                    </p>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black text-emerald-300 mb-1">
                    {kpis.total > 0
                      ? Math.round((kpis.resueltas / kpis.total) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-emerald-200">
                    {kpis.resueltas} de {kpis.total} alertas
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-black/20 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          kpis.total > 0
                            ? (kpis.resueltas / kpis.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Alertas Críticas Activas */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-rose-400 uppercase">
                      Críticas Activas
                    </p>
                    <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
                  </div>
                  <p className="text-3xl font-black text-rose-300 mb-1 animate-pulse">
                    {kpis.criticas}
                  </p>
                  <p className="text-xs text-rose-200">
                    Requieren atención inmediata
                  </p>
                  {kpis.criticas > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-rose-500/30 animate-pulse" />
                      <span className="text-[10px] text-rose-300 font-bold">
                        URGENTE
                      </span>
                    </div>
                  )}
                </div>

                {/* Tiempo de Respuesta */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-amber-400 uppercase">
                      Alertas Vencidas
                    </p>
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-3xl font-black text-amber-300 mb-1">
                    {kpis.vencidas}
                  </p>
                  <p className="text-xs text-amber-200">
                    Tiempo de respuesta excedido
                  </p>
                  {kpis.vencidas > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span className="text-[10px] text-amber-300 font-bold">
                        ATENCIÓN REQUERIDA
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfico de Distribución */}
              <div className="mt-6 p-4 rounded-2xl bg-black/5 border border-white/10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  📊 Distribución por Prioridad
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "Crítica",
                      count: alertas.filter((a) => a.prioridad === "critica")
                        .length,
                      color: "from-rose-500 to-red-500",
                      textColor: "text-rose-400",
                    },
                    {
                      label: "Alta",
                      count: alertas.filter((a) => a.prioridad === "alta")
                        .length,
                      color: "from-amber-500 to-orange-500",
                      textColor: "text-amber-400",
                    },
                    {
                      label: "Media",
                      count: alertas.filter((a) => a.prioridad === "media")
                        .length,
                      color: "from-sky-500 to-blue-500",
                      textColor: "text-sky-400",
                    },
                    {
                      label: "Baja",
                      count: alertas.filter((a) => a.prioridad === "baja")
                        .length,
                      color: "from-emerald-500 to-green-500",
                      textColor: "text-emerald-400",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${item.textColor}`}>
                          {item.label}
                        </span>
                        <span className={`text-xs font-bold ${item.textColor}`}>
                          {item.count} (
                          {kpis.total > 0
                            ? Math.round((item.count / kpis.total) * 100)
                            : 0}
                          %)
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-black/20 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 shadow-lg`}
                          style={{
                            width: `${
                              kpis.total > 0
                                ? (item.count / kpis.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Panel de Acceso Rápido a Gestión de Equipos */}
        <div className="mt-8">
          <div
            className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} relative overflow-hidden`}
          >
            {/* Fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-gradient" />
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl animate-pulse`}
                  >
                    <HardDrive className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto} mb-1`}>
                      Gestión Completa de Equipos
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Administra el inventario completo de equipos de tu centro con
                      operaciones CRUD avanzadas
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/tecnico/equipos"
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    <Eye className="w-5 h-5" />
                    Ver Todos los Equipos
                  </Link>
                  <Link
                    href="/tecnico/equipos/nuevo"
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.primario} text-white text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                  >
                    <Plus className="w-5 h-5" />
                    Registrar Nuevo Equipo
                  </Link>
                </div>
              </div>

              {/* Grid de acciones rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <Link
                  href="/tecnico/equipos/nuevo"
                  className={`p-4 rounded-2xl ${tema.colores.hover} border-2 ${tema.colores.borde} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 group-hover:rotate-12 transition-transform duration-300">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Crear Equipo
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Registra nuevos equipos en el inventario
                  </p>
                </Link>

                <Link
                  href="/tecnico/equipos"
                  className={`p-4 rounded-2xl ${tema.colores.hover} border-2 ${tema.colores.borde} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 group-hover:rotate-12 transition-transform duration-300">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Ver Equipos
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Consulta el inventario completo
                  </p>
                </Link>

                <button
                  onClick={() => {
                    // Lógica para editar equipos
                    alert("Selecciona un equipo desde el inventario para editarlo");
                  }}
                  className={`p-4 rounded-2xl ${tema.colores.hover} border-2 ${tema.colores.borde} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group text-left`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 group-hover:rotate-12 transition-transform duration-300">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Editar Equipos
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Actualiza información de equipos
                  </p>
                </button>

                <button
                  onClick={() => {
                    // Lógica para eliminar equipos
                    alert("Selecciona un equipo desde el inventario para eliminarlo");
                  }}
                  className={`p-4 rounded-2xl ${tema.colores.hover} border-2 ${tema.colores.borde} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group text-left`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 group-hover:rotate-12 transition-transform duration-300">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Eliminar Equipos
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Retira equipos del inventario
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Contacto Rápido */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Soporte Técnico */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-lg font-black ${tema.colores.texto}`}>
                  Soporte Técnico 24/7
                </p>
                <p className="text-xs text-indigo-300">
                  Asistencia inmediata para emergencias
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <a
                href="tel:+56912345678"
                className={`flex items-center gap-3 p-3 rounded-xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-200`}
              >
                <Phone className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    +56 9 1234 5678
                  </p>
                  <p className="text-xs text-gray-400">Línea directa</p>
                </div>
              </a>
              <a
                href="mailto:soporte@anyssamed.cl"
                className={`flex items-center gap-3 p-3 rounded-xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-200`}
              >
                <Mail className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    soporte@anyssamed.cl
                  </p>
                  <p className="text-xs text-gray-400">Email de soporte</p>
                </div>
              </a>
            </div>
          </div>

          {/* Centro de Ayuda */}
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-lg font-black ${tema.colores.texto}`}>
                  Centro de Ayuda
                </p>
                <p className="text-xs text-emerald-300">
                  Documentación y recursos
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/ayuda/alertas"
                className={`flex items-center gap-3 p-3 rounded-xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-200`}
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Guía de Alertas
                  </p>
                  <p className="text-xs text-gray-400">
                    Aprende a gestionar alertas
                  </p>
                </div>
              </Link>
              <Link
                href="/ayuda/equipos"
                className={`flex items-center gap-3 p-3 rounded-xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-200`}
              >
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Manual de Equipos
                  </p>
                  <p className="text-xs text-gray-400">
                    Gestión completa de inventario
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER ULTRA PREMIUM */}
      <footer
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t-2 py-8 px-8 mt-12 relative overflow-hidden`}
      >
        {/* Fondo animado del footer */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-gradient" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl animate-pulse`}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-lg font-black ${tema.colores.texto}`}>
                  © 2025 AnyssaMed
                </p>
                <p className="text-xs text-gray-400">
                  Sistema Ultra Premium de Alertas y Gestión de Equipos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <Link
                href="/ayuda"
                className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200 flex items-center gap-1`}
              >
                <FileText className="w-4 h-4" />
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200 flex items-center gap-1`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200 flex items-center gap-1`}
              >
                <FileText className="w-4 h-4" />
                Términos
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white font-bold">Sistema Activo</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                Versión del Sistema
              </p>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                v2.5.0 Ultra Premium
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                Última Actualización
              </p>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                {new Date().toLocaleDateString("es-CL")}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                Estado del Servicio
              </p>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                <p className="text-sm font-bold text-emerald-400">
                  Operativo 100%
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES ULTRA PREMIUM */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(244, 63, 94, 0.8);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
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
            rgba(244, 63, 94, 0.8),
            rgba(239, 68, 68, 0.8)
          );
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .custom-scrollbar-premium::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(244, 63, 94, 1),
            rgba(239, 68, 68, 1)
          );
        }

        /* Animación de entrada para las alertas */
        tbody tr,
        .space-y-3 > div {
          animation: fadeIn 0.3s ease-out backwards;
        }

        /* Efecto de brillo en hover */
        .group:hover .shadow-lg {
          box-shadow: 0 20px 25px -5px rgba(244, 63, 94, 0.3),
            0 10px 10px -5px rgba(244, 63, 94, 0.2);
        }

        /* Efecto de pulso para elementos críticos */
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Transiciones suaves para todos los elementos interactivos */
        button, a, input, select {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efecto de cristal (glassmorphism) */
        .backdrop-blur-sm {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .backdrop-blur-2xl {
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }

        /* Sombras dinámicas */
        .shadow-dynamic {
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        }

        /* Bordes brillantes */
        .border-glow {
          border: 2px solid transparent;
          background-clip: padding-box;
          position: relative;
        }

        .border-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.5), rgba(239, 68, 68, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        /* Animación de carga */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }

        /* Efecto de neón */
        .text-neon {
          text-shadow: 
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor;
        }

        /* Gradiente animado para textos */
        .text-gradient-animate {
          background: linear-gradient(
            90deg,
            #f43f5e,
            #ec4899,
            #8b5cf6,
            #3b82f6,
            #f43f5e
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 3s linear infinite;
        }

        /* Efecto de partículas */
        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10%, 90% {
            opacity: 1;
          }
          50% {
            transform: translate(100px, -100px) rotate(180deg);
          }
        }

        /* Optimización de rendimiento */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Mejora de accesibilidad */
        :focus-visible {
          outline: 2px solid rgba(244, 63, 94, 0.5);
          outline-offset: 2px;
        }

        /* Transiciones de página */
        .page-transition {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

                      

