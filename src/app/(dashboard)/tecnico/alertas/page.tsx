// src/app/(dashboard)/tecnico/alertas/page.tsx
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
  Calculator,
  CalendarCheck,
  CalendarClock,
  Headset,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Check,
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
  FileSpreadsheet,
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
  MoreVertical,
  Paperclip,
  Percent,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PieChart,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Stethoscope,
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
  BrainCircuit,
  Microscope,
  TestTube,
  Syringe,
  Ambulance,
  Building2,
  GraduationCap,
  Handshake,
  Rocket,
  CheckSquare,
  Square,
  Clock3,
  AlertOctagon,
  UserX,
  Wrench,
  Hammer,
  Cpu,
  HardDrive,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ========================================
// TIPOS DE DATOS - TÉCNICO / ALERTAS
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

interface AlertaTecnico {
  id_alerta: number;
  tipo: "equipo_falla" | "mantenimiento_vencido" | "ticket_urgente" | "equipo_critico";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
}

interface ResumenAlertas {
  total: number;
  activas: number;
  criticas: number;
  mantenimientoVencido: number;
}

// ========================================
// CONFIGURACIONES DE TEMAS
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
    nombre: "Azul Técnico",
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
    nombre: "Púrpura Industrial",
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
    nombre: "Verde Operacional",
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
// COMPONENTE PRINCIPAL ALERTAS
// ========================================

export default function AlertasTecnicoPage() {
  // ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);

  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vistaAlertas, setVistaAlertas] = useState<"activas" | "resueltas" | "todas">(
    "activas"
  );
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [soloNoLeidas, setSoloNoLeidas] = useState<boolean>(true);
  const [seccionActiva] = useState<string>("alertas");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

    const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ DE NAVEGACIÓN
  // ========================================

 
  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    // Tema guardado
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarAlertas();
    }
  }, [usuario]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.tecnico) {
        cargarAlertas();
      }
    }, 180000); // 3 min

    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // CARGA DE DATOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No hay sesión activa");
      }

      const result = await response.json();

      if (result.success && result.usuario) {
        const rolesUsuario: string[] = [];

        if (result.usuario.rol) {
          rolesUsuario.push(
            result.usuario.rol.nombre
              ?.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const tieneRolTecnico = rolesUsuario.some(
          (rol) => rol.includes("TECNICO") || rol.includes("SOPORTE")
        );

        if (!tieneRolTecnico) {
          alert(
            `Acceso denegado. Este panel es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
        setDisponibilidad(result.usuario.tecnico.disponibilidad);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingAlertas(true);

      const res = await fetch(
        `/api/tecnico/alertas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta Alertas Técnico:", data);
        return;
      }

      setAlertas(data.alertas || []);
    } catch (error) {
      console.error("Error al cargar alertas técnico:", error);
    } finally {
      setLoadingAlertas(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    try {
      const response = await fetch(
        `/api/tecnico/${usuario?.tecnico?.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (response.ok) {
        setDisponibilidad(nuevoEstado);
        alert(`Estado actualizado a: ${nuevoEstado}`);
      } else {
        alert("Error al actualizar disponibilidad");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      alert("Error al actualizar disponibilidad");
    }
  };

  const marcarComoLeida = async (idAlerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${idAlerta}/leer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        alert("No se pudo marcar la alerta como leída");
        return;
      }

      setAlertas((prev) =>
        prev.map((a) => (a.id_alerta === idAlerta ? { ...a, leida: true } : a))
      );
    } catch (error) {
      console.error("Error al marcar alerta como leída:", error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const res = await fetch(`/api/tecnico/alertas/marcar-todas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_tecnico: usuario?.tecnico?.id_tecnico,
        }),
      });

      if (!res.ok) {
        alert("No se pudieron marcar todas las alertas como leídas");
        return;
      }

      setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
      setSoloNoLeidas(false);
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
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
      console.error("No se pudo guardar preferencia en BD:", err);
    }
  };

  // ========================================
  // AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      critica: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/40"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-300 border-green-500/40"
        : "bg-green-100 text-green-800 border-green-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerIconoAlertaTipo = (tipo: AlertaTecnico["tipo"]) => {
    switch (tipo) {
      case "equipo_falla":
        return HardDrive;
      case "mantenimiento_vencido":
        return Wrench;
      case "ticket_urgente":
        return AlertOctagon;
      case "equipo_critico":
        return Cpu;
      default:
        return AlertCircle;
    }
  };

  // ========================================
  // DERIVADOS: RESÚMENES Y GRÁFICOS
  // ========================================

  const resumenAlertas: ResumenAlertas = useMemo(() => {
    const total = alertas.length;
    const activas = alertas.filter((a) => !a.leida).length;
    const criticas = alertas.filter((a) => a.prioridad === "critica" && !a.leida).length;
    const mantenimientoVencido = alertas.filter(
      (a) => a.tipo === "mantenimiento_vencido" && !a.leida
    ).length;

    return { total, activas, criticas, mantenimientoVencido };
  }, [alertas]);

  const alertasFiltradas = useMemo(() => {
    let data = [...alertas];

    // Vista (activas / resueltas / todas)
    if (vistaAlertas === "activas") {
      data = data.filter((a) => !a.leida);
    } else if (vistaAlertas === "resueltas") {
      data = data.filter((a) => a.leida);
    }

    // Filtro tipo
    if (filtroTipo !== "todos") {
      data = data.filter((a) => a.tipo === filtroTipo);
    }

    // Filtro prioridad
    if (filtroPrioridad !== "todas") {
      data = data.filter((a) => a.prioridad === filtroPrioridad);
    }

    // Solo no leídas
    if (soloNoLeidas) {
      data = data.filter((a) => !a.leida);
    }

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (a) =>
          a.titulo.toLowerCase().includes(q) ||
          a.descripcion.toLowerCase().includes(q) ||
          a.tipo.toLowerCase().includes(q) ||
          a.prioridad.toLowerCase().includes(q)
      );
    }

    // Ordenar por fecha (más reciente primero)
    data.sort(
      (a, b) =>
        new Date(b.fecha_creacion).getTime() -
        new Date(a.fecha_creacion).getTime()
    );

    return data;
  }, [alertas, vistaAlertas, filtroTipo, filtroPrioridad, soloNoLeidas, busqueda]);

  const datosPorPrioridad = useMemo(
    () => [
      {
        nombre: "Crítica",
        valor: alertas.filter((a) => a.prioridad === "critica").length,
        color: "#ef4444",
      },
      {
        nombre: "Alta",
        valor: alertas.filter((a) => a.prioridad === "alta").length,
        color: "#f97316",
      },
      {
        nombre: "Media",
        valor: alertas.filter((a) => a.prioridad === "media").length,
        color: "#eab308",
      },
      {
        nombre: "Baja",
        valor: alertas.filter((a) => a.prioridad === "baja").length,
        color: "#22c55e",
      },
    ],
    [alertas]
  );

  const datosPorTipo = useMemo(
    () => [
      {
        nombre: "Equipos en falla",
        valor: alertas.filter((a) => a.tipo === "equipo_falla").length,
      },
      {
        nombre: "Mantenimiento vencido",
        valor: alertas.filter((a) => a.tipo === "mantenimiento_vencido").length,
      },
      {
        nombre: "Tickets urgentes",
        valor: alertas.filter((a) => a.tipo === "ticket_urgente").length,
      },
      {
        nombre: "Equipos críticos",
        valor: alertas.filter((a) => a.tipo === "equipo_critico").length,
      },
    ],
    [alertas]
  );

  // ========================================
  // RENDER - LOADING / ACCESO
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <AlertOctagon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Centro de Alertas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Sincronizando alertas críticas de tu infraestructura...
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
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al centro de alertas técnicas.
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
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar alerta por título, tipo, prioridad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones Header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Selector de tema */}
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
                  Seleccionar Tema
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

            {/* Botón de alertas (notificaciones) */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <AlertCircle className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Últimas Alertas
                    </h3>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes alertas registradas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas
                        .slice(0, 5)
                        .sort(
                          (a, b) =>
                            new Date(b.fecha_creacion).getTime() -
                            new Date(a.fecha_creacion).getTime()
                        )
                        .map((alerta) => {
                          const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                          return (
                            <div
                              key={alerta.id_alerta}
                              className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                                !alerta.leida ? "bg-indigo-500/5" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                    alerta.prioridad
                                  )}`}
                                >
                                  <Icono className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                                  >
                                    {alerta.titulo}
                                  </p>
                                  <p
                                    className={`text-xs mb-1 ${tema.colores.textoSecundario}`}
                                  >
                                    {alerta.descripcion}
                                  </p>
                                  <p
                                    className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                                  >
                                    {formatearFecha(alerta.fecha_creacion)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera Servicio
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Técnico
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
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
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Ayuda</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
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

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">🚨</span>
              </h2>
              <p
                className={`text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Centro Avanzado de Alertas Técnicas
              </p>
              {usuario.tecnico && (
                <p
                  className={`text-sm font-semibold mt-2 ${tema.colores.textoSecundario} flex items-center gap-2`}
                >
                  <MapPin className="w-4 h-4" />
                  {(usuario.tecnico.centro?.nombre ?? "Centro no definido")} •{" "}
                  {(usuario.tecnico.area_tecnica ?? "Área no definida")}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <button
                onClick={cargarAlertas}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    loadingAlertas ? "animate-spin" : ""
                  }`}
                />
                Actualizar Alertas
              </button>
              <button
                onClick={marcarTodasComoLeidas}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        {/* Resumen superior */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <PieChart className="w-5 h-5 text-indigo-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Alertas Totales
            </div>
          </div>

          {/* Activas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertOctagon className="w-6 h-6 text-white" />
              </div>
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.activas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Activas Ahora
            </div>
          </div>

          {/* Críticas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.criticas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Críticas sin atender
            </div>
          </div>

          {/* Mantenimiento Vencido */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <CalendarClock className="w-5 h-5 text-amber-300" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.mantenimientoVencido}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Mantenciones Vencidas
            </div>
          </div>
        </div>

        {/* Filtros principales */}
        <div
          className={`rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-center justify-between ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVistaAlertas("activas")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                vistaAlertas === "activas"
                  ? "bg-red-600 text-white"
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Activas
            </button>
            <button
              onClick={() => setVistaAlertas("resueltas")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                vistaAlertas === "resueltas"
                  ? "bg-green-600 text-white"
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Resueltas
            </button>
            <button
              onClick={() => setVistaAlertas("todas")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                vistaAlertas === "todas"
                  ? "bg-indigo-600 text-white"
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              }`}
            >
              <Layers className="w-4 h-4" />
              Todas
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}
            >
              <option value="todos">Todos los tipos</option>
              <option value="equipo_falla">Equipo en falla</option>
              <option value="mantenimiento_vencido">Mantenimiento vencido</option>
              <option value="ticket_urgente">Ticket urgente</option>
              <option value="equipo_critico">Equipo crítico</option>
            </select>

            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}
            >
              <option value="todas">Todas las prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <button
              onClick={() => setSoloNoLeidas(!soloNoLeidas)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                soloNoLeidas
                  ? "bg-emerald-600 text-white"
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              }`}
            >
              <Eye className="w-4 h-4" />
              {soloNoLeidas ? "Solo no leídas" : "Incluir leídas"}
            </button>
          </div>
        </div>

        {/* Contenido principal: lista + gráficos */}
        {loadingAlertas ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando alertas técnicas...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Lista de alertas */}
            <div
              className={`lg:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <AlertOctagon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-black ${tema.colores.texto}`}
                    >
                      Alertas en Tiempo Real
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {alertasFiltradas.length} alertas según los filtros
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs">
                  <p className={tema.colores.textoSecundario}>
                    Total:{" "}
                    <span className="font-bold">{resumenAlertas.total}</span>
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Activas:{" "}
                    <span className="font-bold">
                      {resumenAlertas.activas}
                    </span>
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Última actualización:{" "}
                    <span className="font-bold">
                      {new Date().toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
                {alertasFiltradas.length === 0 ? (
                  <div className="text-center py-16">
                    <div
                      className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                    >
                      <AlertCircle className="w-12 h-12 text-white" />
                    </div>
                    <p
                      className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                    >
                      Sin alertas para los filtros actuales
                    </p>
                    <p
                      className={`text-sm ${tema.colores.textoSecundario}`}
                    >
                      Ajusta los filtros o espera nuevas alertas del sistema.
                    </p>
                  </div>
                ) : (
                  alertasFiltradas.map((alerta) => {
                    const Icono = obtenerIconoAlertaTipo(alerta.tipo);

                    return (
                      <div
                        key={alerta.id_alerta}
                        className={`p-5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} group`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icono */}
                          <div
                            className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                          >
                            <Icono className="w-8 h-8" />
                            {!alerta.leida && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info alerta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`text-lg font-black ${tema.colores.texto} mb-1`}
                                >
                                  {alerta.titulo}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                      alerta.prioridad
                                    )}`}
                                  >
                                    Prioridad: {alerta.prioridad}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                      alerta.leida
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                                        : "bg-red-500/10 text-red-400 border-red-500/40"
                                    }`}
                                  >
                                    {alerta.leida ? "Leída" : "No leída"}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                  >
                                    {alerta.tipo.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {formatearFecha(alerta.fecha_creacion)}
                              </p>
                            </div>

                            <p
                              className={`text-sm mb-3 ${tema.colores.textoSecundario}`}
                            >
                              {alerta.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                              {!alerta.leida && (
                                <button
                                  onClick={() => marcarComoLeida(alerta.id_alerta)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Marcar como leída
                                </button>
                              )}

                              {alerta.url_accion && (
                                <Link
                                  href={alerta.url_accion}
                                  className={`px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                                >
                                  <Eye className="w-4 h-4" />
                                  Ir a la acción
                                </Link>
                              )}

                              {!alerta.url_accion && (
                                <button
                                  className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                                >
                                  <ClipboardCheck className="w-4 h-4" />
                                  Ver detalles
                                </button>
                              )}

                              <button
                                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Panel lateral: gráficos y resumen */}
            <div className="space-y-6">
              {/* Gráfico prioridad */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Alertas por prioridad
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Distribución actual
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={220}>
                    <RechartsPieChart>
                      <Pie
                        data={datosPorPrioridad}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {datosPorPrioridad.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {datosPorPrioridad.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span
                            className={`text-sm font-semibold ${tema.colores.texto}`}
                          >
                            {item.nombre}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${tema.colores.acento}`}
                        >
                          {item.valor}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gráfico por tipo */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Alertas por tipo
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Equipos, tickets y mantenciones
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <RechartsBarChart data={datosPorTipo}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="nombre"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "11px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "11px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valor"
                      fill="#3b82f6"
                      name="Alertas"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className={`mt-12 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border py-6 px-8 ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed - Centro de Alertas Técnicas.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v4.0.0
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
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* ESTILOS GLOBALES */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: "Inter", "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          20% {
            transform: rotate(14deg);
          }
          30%,
          60%,
          90% {
            transform: rotate(-8deg);
          }
          40%,
          80% {
            transform: rotate(14deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .hidden.md\\:block {
            display: none;
          }

          .block.md\\:hidden {
            display: block;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (prefers-color-scheme: dark) {
          input,
          select,
          textarea {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
}
