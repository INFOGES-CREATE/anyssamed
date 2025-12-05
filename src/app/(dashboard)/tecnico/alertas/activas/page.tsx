// src/app/(dashboard)/tecnico/alertas/activas/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BellOff,
  BellRing,
  Box,
  CheckSquare,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  ClipboardCheck,
  Cloud,
  Cpu,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  Filter,
  Flame,
  Globe,
  HardDrive,
  Heart,
  HeartPulse,
  History,
  Home,
  Info,
  Layers,
  Lightbulb,
  LineChart,
  Link as LinkIcon,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Minimize2,
  Monitor,
  Moon,
  MoreVertical,
  Pause,
  Phone,
  PieChart,
  Play,
  Plus,
  Power,
  PowerOff,
  Printer,
  Radio,
  RefreshCw,
  RotateCw,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  SortAsc,
  SortDesc,
  Sparkles,
  Star,
  Sun,
  Target,
  Terminal,
  Thermometer,

  Trash2,
  TrendingDown,
  TrendingUp,
  Triangle,
  User,
  UserCheck,
  Users,
  Video,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";

// ========================================
// 🎨 TIPOS DE DATOS AVANZADOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green" | "cyberpunk" | "ocean" | "sunset";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  descripcion: string;
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
    success: string;
    warning: string;
    error: string;
    info: string;
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
  alertas_criticas: number;
  alertas_resueltas_hoy: number;
  equipos_monitoreados: number;
  incidentes_prevenidos: number;
  tiempo_respuesta_promedio: number;
  nivel_satisfaccion: number;
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
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico" | "sistemas" | "infraestructura";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "manana" | "tarde" | "noche" | "completo";
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
    tickets_resueltos: number;
    tiempo_promedio_resolucion: number;
    calificacion_promedio: number;
  };
}

interface AlertaActiva {
  id_alerta: number;
  tipo: "equipo_falla" | "mantenimiento_vencido" | "ticket_urgente" | "equipo_critico" | "sistema_caido" | "red_lenta" | "backup_fallido" | "seguridad_comprometida";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  fecha_actualizacion: string;
  leida: boolean;
  resuelta: boolean;
  url_accion: string | null;
  id_equipo: number | null;
  id_ticket: number | null;
  nombre_equipo: string | null;
  ubicacion: string | null;
  impacto_estimado: "bajo" | "medio" | "alto" | "critico";
  tiempo_estimado_resolucion: number | null;
  tiempo_transcurrido: number;
  asignado_a: number | null;
  nombre_asignado: string | null;
  tags: string[];
  metadata: any;
  usuarios_afectados: number;
  servicios_afectados: string[];
  nivel_urgencia: number;
  requiere_atencion_inmediata: boolean;
  puede_escalar: boolean;
  historial_acciones: AccionAlerta[];
}

interface AccionAlerta {
  id_accion: number;
  tipo: "comentario" | "asignacion" | "escalamiento" | "resolucion" | "pausa" | "reanudacion";
  descripcion: string;
  usuario: string;
  fecha: string;
}

interface FiltrosAvanzados {
  prioridad: string[];
  tipo: string[];
  impacto: string[];
  ubicacion: string;
  equipoNombre: string;
  tiempoMin: number;
  tiempoMax: number;
  usuariosAfectadosMin: number;
  soloNoLeidas: boolean;
  soloAsignadasAMi: boolean;
  ordenarPor: "fecha" | "prioridad" | "tiempo" | "impacto" | "usuarios";
  ordenDireccion: "asc" | "desc";
}

interface VistaAlerta {
  modo: "lista" | "tarjetas" | "tabla" | "kanban" | "timeline";
  densidad: "compacta" | "normal" | "espaciosa";
  agruparPor: "ninguno" | "prioridad" | "tipo" | "ubicacion" | "equipo";
}

// ========================================
// 🎨 CONFIGURACIONES DE TEMAS
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    descripcion: "Interfaz clara y moderna",
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
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    },
  },
  dark: {
    nombre: "Oscuro Premium",
    icono: Moon,
    descripcion: "Modo oscuro elegante",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
  },
  blue: {
    nombre: "Azul Técnico",
    icono: Wifi,
    descripcion: "Tema azul profesional",
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
      success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      info: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
  },
  purple: {
    nombre: "Púrpura Industrial",
    icono: Sparkles,
    descripcion: "Diseño moderno púrpura",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    },
  },
  green: {
    nombre: "Verde Operacional",
    icono: HeartPulse,
    descripcion: "Tema verde para monitoreo",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
  },
  cyberpunk: {
    nombre: "Cyberpunk Neon",
    icono: Zap,
    descripcion: "Estilo futurista",
    colores: {
      fondo: "from-black via-purple-950 to-pink-950",
      fondoSecundario: "bg-black",
      texto: "text-cyan-300",
      textoSecundario: "text-pink-400",
      primario: "bg-pink-600 hover:bg-pink-700",
      secundario: "bg-purple-900 hover:bg-purple-800",
      acento: "text-cyan-400",
      borde: "border-pink-500/30",
      sombra: "shadow-2xl shadow-pink-500/30",
      gradiente: "from-pink-500 via-purple-500 to-cyan-500",
      sidebar: "bg-black/95 backdrop-blur-xl border-pink-500/30",
      header: "bg-black/80 backdrop-blur-xl border-pink-500/30",
      card: "bg-purple-950/50 border-pink-500/30 hover:border-cyan-500/50",
      hover: "hover:bg-purple-900/50",
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
  },
  ocean: {
    nombre: "Océano Profundo",
    icono: Globe,
    descripcion: "Colores del océano",
    colores: {
      fondo: "from-blue-950 via-indigo-950 to-slate-950",
      fondoSecundario: "bg-blue-950",
      texto: "text-blue-100",
      textoSecundario: "text-blue-300",
      primario: "bg-blue-600 hover:bg-blue-700",
      secundario: "bg-slate-800 hover:bg-slate-700",
      acento: "text-blue-400",
      borde: "border-blue-800",
      sombra: "shadow-2xl shadow-blue-500/20",
      gradiente: "from-blue-500 via-indigo-500 to-purple-500",
      sidebar: "bg-blue-950/95 backdrop-blur-xl border-blue-800",
      header: "bg-blue-950/80 backdrop-blur-xl border-blue-800",
      card: "bg-slate-900/50 border-blue-800 hover:border-blue-500/50",
      hover: "hover:bg-slate-800",
      success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      info: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
  },
  sunset: {
    nombre: "Atardecer Cálido",
    icono: Sun,
    descripcion: "Tonos cálidos",
    colores: {
      fondo: "from-orange-950 via-red-950 to-pink-950",
      fondoSecundario: "bg-orange-900",
      texto: "text-orange-100",
      textoSecundario: "text-orange-300",
      primario: "bg-orange-600 hover:bg-orange-700",
      secundario: "bg-red-900 hover:bg-red-800",
      acento: "text-orange-400",
      borde: "border-orange-800",
      sombra: "shadow-2xl shadow-orange-500/20",
      gradiente: "from-orange-500 via-red-500 to-pink-500",
      sidebar: "bg-orange-950/95 backdrop-blur-xl border-orange-800",
      header: "bg-orange-950/80 backdrop-blur-xl border-orange-800",
      card: "bg-red-950/50 border-orange-800 hover:border-orange-500/50",
      hover: "hover:bg-red-900",
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    },
  },
};

// ========================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================

export default function AlertasActivasPage() {
  // 📊 ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [alertasActivas, setAlertasActivas] = useState<AlertaActiva[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaActiva | null>(null);
  
  // 🎨 ESTADOS DE UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [panelDetalleAbierto, setPanelDetalleAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");
  
  // 🔍 ESTADOS DE FILTROS Y VISTA
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({
    prioridad: [],
    tipo: [],
    impacto: [],
    ubicacion: "",
    equipoNombre: "",
    tiempoMin: 0,
    tiempoMax: 999999,
    usuariosAfectadosMin: 0,
    soloNoLeidas: false,
    soloAsignadasAMi: false,
    ordenarPor: "prioridad",
    ordenDireccion: "desc",
  });

  const [vista, setVista] = useState<VistaAlerta>({
    modo: "tarjetas",
    densidad: "normal",
    agruparPor: "prioridad",
  });

  // 📈 ESTADOS DE ACCIONES
  const [alertasSeleccionadas, setAlertasSeleccionadas] = useState<number[]>([]);
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervaloRefresh, setIntervaloRefresh] = useState(60000); // 1 minuto
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // 🔄 EFECTOS Y CICLO DE VIDA
  // ========================================

  useEffect(() => {
    cargarConfiguracionLocal();
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarAlertasActivas();
      cargarEstadisticas();
    }
  }, [usuario]);

  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico) return;

    const interval = setInterval(() => {
      cargarAlertasActivas();
      cargarEstadisticas();
    }, intervaloRefresh);

    return () => clearInterval(interval);
  }, [usuario, autoRefresh, intervaloRefresh]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // 📥 FUNCIONES DE CARGA DE DATOS
  // ========================================

  const cargarConfiguracionLocal = () => {
    if (typeof window === "undefined") return;

    const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
    if (temaGuardado && TEMAS[temaGuardado]) {
      setTemaActual(temaGuardado);
    }

    const vistaGuardada = localStorage.getItem("vista_alertas_activas");
    if (vistaGuardada) {
      try {
        setVista(JSON.parse(vistaGuardada));
      } catch (e) {
        console.error("Error al cargar vista:", e);
      }
    }
  };

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
          mostrarNotificacion(
            "error",
            "Acceso Denegado",
            `Este panel es solo para técnicos.`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          mostrarNotificacion(
            "error",
            "Configuración Incompleta",
            "Tu usuario no está vinculado a un registro de técnico."
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
      mostrarNotificacion("error", "Error de Sesión", "Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarAlertasActivas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingAlertas(true);

      const res = await fetch(
        `/api/tecnico/alertas/activas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar alertas activas:", data);
        return;
      }

      const nuevasAlertas = data.alertas || [];
      
      // Calcular tiempo transcurrido
      const alertasConTiempo = nuevasAlertas.map((alerta: any) => ({
        ...alerta,
        tiempo_transcurrido: calcularTiempoTranscurrido(alerta.fecha_creacion),
      }));

      setAlertasActivas(alertasConTiempo);
    } catch (error) {
      console.error("Error al cargar alertas activas:", error);
      mostrarNotificacion("error", "Error", "No se pudieron cargar las alertas activas");
    } finally {
      setLoadingAlertas(false);
    }
  };

  const cargarEstadisticas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/estadisticas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // ========================================
  // 🎬 ACCIONES DE USUARIO
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
        mostrarNotificacion(
          "success",
          "Disponibilidad Actualizada",
          `Tu estado cambió a: ${nuevoEstado}`
        );
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      mostrarNotificacion("error", "Error", "No se pudo actualizar tu disponibilidad");
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
        throw new Error("Error al marcar como leída");
      }

      setAlertasActivas((prev) =>
        prev.map((a) => (a.id_alerta === idAlerta ? { ...a, leida: true } : a))
      );

      mostrarNotificacion("success", "Alerta Marcada", "La alerta se marcó como leída");
    } catch (error) {
      console.error("Error al marcar alerta:", error);
      mostrarNotificacion("error", "Error", "No se pudo marcar la alerta");
    }
  };

  const resolverAlerta = async (idAlerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${idAlerta}/resolver`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al resolver alerta");
      }

      setAlertasActivas((prev) => prev.filter((a) => a.id_alerta !== idAlerta));

      mostrarNotificacion("success", "Alerta Resuelta", "La alerta se marcó como resuelta");
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al resolver alerta:", error);
      mostrarNotificacion("error", "Error", "No se pudo resolver la alerta");
    }
  };

  const asignarAlerta = async (idAlerta: number, idTecnico: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${idAlerta}/asignar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_tecnico: idTecnico }),
      });

      if (!res.ok) {
        throw new Error("Error al asignar alerta");
      }

      setAlertasActivas((prev) =>
        prev.map((a) =>
          a.id_alerta === idAlerta ? { ...a, asignado_a: idTecnico } : a
        )
      );

      mostrarNotificacion("success", "Alerta Asignada", "La alerta fue asignada correctamente");
    } catch (error) {
      console.error("Error al asignar alerta:", error);
      mostrarNotificacion("error", "Error", "No se pudo asignar la alerta");
    }
  };

  const escalarAlerta = async (idAlerta: number) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/${idAlerta}/escalar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error al escalar alerta");
      }

      mostrarNotificacion("success", "Alerta Escalada", "La alerta fue escalada a nivel superior");
      cargarAlertasActivas();
    } catch (error) {
      console.error("Error al escalar alerta:", error);
      mostrarNotificacion("error", "Error", "No se pudo escalar la alerta");
    }
  };

  const accionMasiva = async (accion: "leer" | "resolver" | "asignar", ids: number[]) => {
    try {
      const res = await fetch(`/api/tecnico/alertas/accion-masiva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accion,
          ids_alertas: ids,
          id_tecnico: usuario?.tecnico?.id_tecnico,
        }),
      });

      if (!res.ok) {
        throw new Error("Error en acción masiva");
      }

      mostrarNotificacion(
        "success",
        "Acción Masiva Completada",
        `Se procesaron ${ids.length} alertas correctamente`
      );

      setAlertasSeleccionadas([]);
      setModoSeleccionMultiple(false);
      cargarAlertasActivas();
    } catch (error) {
      console.error("Error en acción masiva:", error);
      mostrarNotificacion("error", "Error", "No se pudo completar la acción masiva");
    }
  };

  const exportarAlertas = async (formato: "csv" | "excel" | "pdf") => {
    try {
      mostrarNotificacion("info", "Exportando", `Generando archivo ${formato.toUpperCase()}...`);

      const res = await fetch(
        `/api/tecnico/alertas/activas/exportar?formato=${formato}&id_tecnico=${usuario?.tecnico?.id_tecnico}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Error al exportar");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alertas_activas_${new Date().toISOString().split("T")[0]}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      mostrarNotificacion("success", "Exportación Completa", "El archivo se descargó correctamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      mostrarNotificacion("error", "Error", "No se pudo exportar el archivo");
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

  const cambiarVista = (nuevaVista: Partial<VistaAlerta>) => {
    const vistaActualizada = { ...vista, ...nuevaVista };
    setVista(vistaActualizada);

    if (typeof window !== "undefined") {
      localStorage.setItem("vista_alertas_activas", JSON.stringify(vistaActualizada));
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

  // ========================================
  // 🔔 SISTEMA DE NOTIFICACIONES
  // ========================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "warning" | "info",
    titulo: string,
    mensaje: string
  ) => {
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    
    // Implementar sistema de toast real aquí
  };

  // ========================================
  // 🛠️ FUNCIONES AUXILIARES
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

  const formatearTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}m`;
    if (minutos < 1440) return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
    return `${Math.floor(minutos / 1440)}d ${Math.floor((minutos % 1440) / 60)}h`;
  };

  const calcularTiempoTranscurrido = (fechaCreacion: string): number => {
    const ahora = new Date().getTime();
    const creacion = new Date(fechaCreacion).getTime();
    return Math.floor((ahora - creacion) / (1000 * 60)); // minutos
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 6) return "Buenas madrugadas";
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = !["light"].includes(temaActual);
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

  const obtenerIconoAlertaTipo = (tipo: AlertaActiva["tipo"]) => {
    const iconos: { [key: string]: any } = {
      equipo_falla: HardDrive,
      mantenimiento_vencido: Wrench,
      ticket_urgente: AlertOctagon,
      equipo_critico: Cpu,
      sistema_caido: Server,
      red_lenta: WifiOff,
      backup_fallido: Database,
      seguridad_comprometida: ShieldAlert,
    };

    return iconos[tipo] || AlertCircle;
  };

  const obtenerColorImpacto = (impacto: string) => {
    const colores: { [key: string]: string } = {
      critico: "text-red-500",
      alto: "text-orange-500",
      medio: "text-yellow-500",
      bajo: "text-green-500",
    };

    return colores[impacto] || "text-gray-500";
  };

  const toggleSeleccionAlerta = (idAlerta: number) => {
    setAlertasSeleccionadas((prev) =>
      prev.includes(idAlerta)
        ? prev.filter((id) => id !== idAlerta)
        : [...prev, idAlerta]
    );
  };

  const seleccionarTodas = () => {
    if (alertasSeleccionadas.length === alertasFiltradas.length) {
      setAlertasSeleccionadas([]);
    } else {
      setAlertasSeleccionadas(alertasFiltradas.map((a) => a.id_alerta));
    }
  };

  // ========================================
  // 📊 DATOS DERIVADOS Y CÁLCULOS
  // ========================================

  const alertasFiltradas = useMemo(() => {
    let data = [...alertasActivas];

    // Filtro por prioridad
    if (filtros.prioridad.length > 0) {
      data = data.filter((a) => filtros.prioridad.includes(a.prioridad));
    }

    // Filtro por tipo
    if (filtros.tipo.length > 0) {
      data = data.filter((a) => filtros.tipo.includes(a.tipo));
    }

    // Filtro por impacto
    if (filtros.impacto.length > 0) {
      data = data.filter((a) => filtros.impacto.includes(a.impacto_estimado));
    }

    // Filtro por ubicación
    if (filtros.ubicacion) {
      data = data.filter((a) =>
        a.ubicacion?.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      );
    }

    // Filtro por equipo
    if (filtros.equipoNombre) {
      data = data.filter((a) =>
        a.nombre_equipo?.toLowerCase().includes(filtros.equipoNombre.toLowerCase())
      );
    }

    // Filtro por tiempo transcurrido
    data = data.filter(
      (a) =>
        a.tiempo_transcurrido >= filtros.tiempoMin &&
        a.tiempo_transcurrido <= filtros.tiempoMax
    );

    // Filtro por usuarios afectados
    data = data.filter((a) => a.usuarios_afectados >= filtros.usuariosAfectadosMin);

    // Solo no leídas
    if (filtros.soloNoLeidas) {
      data = data.filter((a) => !a.leida);
    }

    // Solo asignadas a mí
    if (filtros.soloAsignadasAMi) {
      data = data.filter((a) => a.asignado_a === usuario?.tecnico?.id_tecnico);
    }

    // Búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (a) =>
          a.titulo.toLowerCase().includes(q) ||
          a.descripcion.toLowerCase().includes(q) ||
          a.tipo.toLowerCase().includes(q) ||
          a.prioridad.toLowerCase().includes(q) ||
          a.nombre_equipo?.toLowerCase().includes(q) ||
          a.ubicacion?.toLowerCase().includes(q)
      );
    }

    // Ordenar
    data.sort((a, b) => {
      let comparacion = 0;

      switch (filtros.ordenarPor) {
        case "fecha":
          comparacion =
            new Date(b.fecha_creacion).getTime() -
            new Date(a.fecha_creacion).getTime();
          break;
        case "prioridad":
          const prioridades = { critica: 4, alta: 3, media: 2, baja: 1 };
          comparacion =
            prioridades[b.prioridad as keyof typeof prioridades] -
            prioridades[a.prioridad as keyof typeof prioridades];
          break;
        case "tiempo":
          comparacion = b.tiempo_transcurrido - a.tiempo_transcurrido;
          break;
        case "impacto":
          const impactos = { critico: 4, alto: 3, medio: 2, bajo: 1 };
          comparacion =
            impactos[b.impacto_estimado as keyof typeof impactos] -
            impactos[a.impacto_estimado as keyof typeof impactos];
          break;
        case "usuarios":
          comparacion = b.usuarios_afectados - a.usuarios_afectados;
          break;
      }

      return filtros.ordenDireccion === "asc" ? -comparacion : comparacion;
    });

    return data;
  }, [alertasActivas, filtros, busqueda, usuario]);

  const alertasAgrupadas = useMemo(() => {
    if (vista.agruparPor === "ninguno") {
      return { "Todas las alertas": alertasFiltradas };
    }

    const grupos: { [key: string]: AlertaActiva[] } = {};

    alertasFiltradas.forEach((alerta) => {
      let clave = "";

      switch (vista.agruparPor) {
        case "prioridad":
          clave = alerta.prioridad.toUpperCase();
          break;
        case "tipo":
          clave = alerta.tipo.replace("_", " ").toUpperCase();
          break;
        case "ubicacion":
          clave = alerta.ubicacion || "Sin ubicación";
          break;
        case "equipo":
          clave = alerta.nombre_equipo || "Sin equipo";
          break;
      }

      if (!grupos[clave]) {
        grupos[clave] = [];
      }
      grupos[clave].push(alerta);
    });

    return grupos;
  }, [alertasFiltradas, vista.agruparPor]);

  const resumenAlertas = useMemo(() => {
    return {
      total: alertasActivas.length,
      criticas: alertasActivas.filter((a) => a.prioridad === "critica").length,
      altas: alertasActivas.filter((a) => a.prioridad === "alta").length,
      medias: alertasActivas.filter((a) => a.prioridad === "media").length,
      bajas: alertasActivas.filter((a) => a.prioridad === "baja").length,
      noLeidas: alertasActivas.filter((a) => !a.leida).length,
      asignadasAMi: alertasActivas.filter(
        (a) => a.asignado_a === usuario?.tecnico?.id_tecnico
      ).length,
      requierenAtencionInmediata: alertasActivas.filter(
        (a) => a.requiere_atencion_inmediata
      ).length,
      tiempoPromedioTranscurrido:
        alertasActivas.reduce((sum, a) => sum + a.tiempo_transcurrido, 0) /
        (alertasActivas.length || 1),
      usuariosTotalesAfectados: alertasActivas.reduce(
        (sum, a) => sum + a.usuarios_afectados,
        0
      ),
    };
  }, [alertasActivas, usuario]);

  const datosPorPrioridad = useMemo(
    () => [
      {
        nombre: "Crítica",
        valor: resumenAlertas.criticas,
        color: "#ef4444",
      },
      {
        nombre: "Alta",
        valor: resumenAlertas.altas,
        color: "#f97316",
      },
      {
        nombre: "Media",
        valor: resumenAlertas.medias,
        color: "#eab308",
      },
      {
        nombre: "Baja",
        valor: resumenAlertas.bajas,
        color: "#22c55e",
      },
    ],
    [resumenAlertas]
  );

  // ========================================
  // 🎨 RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse`}
            >
              <AlertOctagon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Alertas Activas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Sincronizando alertas críticas en tiempo real...
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className="w-3 h-3 rounded-full bg-red-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
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
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a las alertas activas.
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
  // 🎨 RENDER PRINCIPAL
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
          {/* Breadcrumb y búsqueda */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/tecnico"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Link
                href="/tecnico/alertas"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
              >
                Alertas
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                Activas
              </span>
            </div>

            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar por título, equipo, ubicación, descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300`}
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
            {/* Auto-refresh */}
            <div className="relative group">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                  autoRefresh
                    ? `bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title={autoRefresh ? "Desactivar auto-actualización" : "Activar auto-actualización"}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? "animate-spin-slow" : ""}`} />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  ⚡ Auto-actualización
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setIntervaloRefresh(30000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 30000
                        ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    30 segundos
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(60000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 60000
                        ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    1 minuto
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(180000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 180000
                        ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    3 minutos
                  </button>
                  <button
                    onClick={() => setIntervaloRefresh(300000)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      intervaloRefresh === 300000
                        ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    5 minutos
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de tema */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 max-h-96 overflow-y-auto custom-scrollbar`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  🎨 Seleccionar Tema
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
                      <div className="text-left">
                        <p className="font-bold">{t.nombre}</p>
                        <p className="text-xs opacity-80">{t.descripcion}</p>
                      </div>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <BellRing className="w-5 h-5" />
                {resumenAlertas.noLeidas > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {resumenAlertas.noLeidas > 9 ? "9+" : resumenAlertas.noLeidas}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-[500px] overflow-hidden`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        🔔 Alertas No Leídas
                      </h3>
                      <button
                        onClick={() => setNotificacionesAbiertas(false)}
                        className={`p-1 rounded-lg ${tema.colores.hover}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {alertasActivas.filter((a) => !a.leida).length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle2
                          className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                        />
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          ✅ Todas las alertas están leídas
                        </p>
                      </div>
                    ) : (
                      <div className={`divide-y ${tema.colores.borde}`}>
                        {alertasActivas
                          .filter((a) => !a.leida)
                          .slice(0, 10)
                          .map((alerta) => {
                            const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                            return (
                              <div
                                key={alerta.id_alerta}
                                onClick={() => {
                                  marcarComoLeida(alerta.id_alerta);
                                  setAlertaSeleccionada(alerta);
                                  setPanelDetalleAbierto(true);
                                }}
                                className={`p-4 ${tema.colores.hover} transition-all cursor-pointer bg-red-500/5`}
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
                                      className={`text-xs mb-1 ${tema.colores.textoSecundario} line-clamp-2`}
                                    >
                                      {alerta.descripcion}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                                      >
                                        {formatearFecha(alerta.fecha_creacion)}
                                      </span>
                                      {alerta.nombre_equipo && (
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${tema.colores.info}`}
                                        >
                                          {alerta.nombre_equipo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Clock className="w-4 h-4" />
                Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <PowerOff className="w-4 h-4" />
                Fuera
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
                    {usuario.tecnico?.tipo_tecnico}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg`}
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
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg`}
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
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
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
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
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
                      href="/tecnico/estadisticas"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>Mis Estadísticas</span>
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

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-32 p-8 ${panelDetalleAbierto ? "mr-[500px]" : ""}`}
      >
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-pulse inline-block">🚨</span>
              </h2>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Centro de Gestión de Alertas Activas en Tiempo Real
              </p>
              {usuario.tecnico && (
                <div className="flex items-center gap-4 mt-3">
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
                  >
                    <MapPin className="w-4 h-4" />
                    {usuario.tecnico.centro?.nombre ?? "Centro no definido"} •{" "}
                    {usuario.tecnico.area_tecnica ?? "Área no definida"}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        disponibilidad === "disponible"
                          ? "bg-green-500 animate-pulse"
                          : disponibilidad === "ocupado"
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      {disponibilidad === "disponible"
                        ? "Disponible"
                        : disponibilidad === "ocupado"
                        ? "Ocupado"
                        : "Fuera de servicio"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cargarAlertasActivas()}
                  disabled={loadingAlertas}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loadingAlertas ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </button>

                <div className="relative group">
                  <button
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    <Download className="w-5 h-5" />
                    Exportar
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2`}
                  >
                    <button
                      onClick={() => exportarAlertas("csv")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => exportarAlertas("excel")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileText className="w-4 h-4" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => exportarAlertas("pdf")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <FileDown className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Total Activas */}
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
              {resumenAlertas.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Total Activas
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
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.criticas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Críticas
            </div>
          </div>

          {/* Altas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-orange-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.altas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Prioridad Alta
            </div>
          </div>

          {/* No Leídas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <BellRing className="w-5 h-5 text-purple-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.noLeidas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              No Leídas
            </div>
          </div>

          {/* Asignadas a mí */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.asignadasAMi}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Asignadas a Mí
            </div>
          </div>

          {/* Usuarios Afectados */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenAlertas.usuariosTotalesAfectados}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Usuarios Afectados
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div
          className={`rounded-2xl p-5 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Controles de vista */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Vista:
                </span>
                <button
                  onClick={() => cambiarVista({ modo: "tarjetas" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "tarjetas"
                      ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de tarjetas"
                >
                  <Box className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "lista" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "lista"
                      ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de lista"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => cambiarVista({ modo: "tabla" })}
                  className={`p-2 rounded-lg transition-all ${
                    vista.modo === "tabla"
                      ? `bg-gradient-to-r from-red-500 to-orange-500 text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  title="Vista de tabla"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Agrupar:
                </span>
                <select
                  value={vista.agruparPor}
                  onChange={(e) =>
                    cambiarVista({
                      agruparPor: e.target.value as VistaAlerta["agruparPor"],
                    })
                  }
                  className={`px-3 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
                >
                  <option value="ninguno">Sin agrupar</option>
                  <option value="prioridad">Por prioridad</option>
                  <option value="tipo">Por tipo</option>
                  <option value="ubicacion">Por ubicación</option>
                  <option value="equipo">Por equipo</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-500/10">
                <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                  Ordenar:
                </span>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      ordenarPor: e.target.value as FiltrosAvanzados["ordenarPor"],
                    })
                  }
                  className={`px-3 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold cursor-pointer`}
                >
                  <option value="prioridad">Prioridad</option>
                  <option value="fecha">Fecha</option>
                  <option value="tiempo">Tiempo transcurrido</option>
                  <option value="impacto">Impacto</option>
                  <option value="usuarios">Usuarios afectados</option>
                </select>
                <button
                  onClick={() =>
                    setFiltros({
                      ...filtros,
                      ordenDireccion: filtros.ordenDireccion === "asc" ? "desc" : "asc",
                    })
                  }
                  className={`p-2 rounded-lg transition-all ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  {filtros.ordenDireccion === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setModoSeleccionMultiple(!modoSeleccionMultiple)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  modoSeleccionMultiple
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Selección múltiple
              </button>

              {modoSeleccionMultiple && alertasSeleccionadas.length > 0 && (
                <>
                  <button
                    onClick={() => accionMasiva("leer", alertasSeleccionadas)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white shadow-lg`}
                  >
                    <Eye className="w-4 h-4" />
                    Marcar leídas ({alertasSeleccionadas.length})
                  </button>
                  <button
                    onClick={() => accionMasiva("resolver", alertasSeleccionadas)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 bg-green-600 hover:bg-green-700 text-white shadow-lg`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolver ({alertasSeleccionadas.length})
                  </button>
                </>
              )}

              <button
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                  mostrarFiltrosAvanzados
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros avanzados
              </button>
            </div>
          </div>

          {/* Filtros avanzados colapsables */}
          {mostrarFiltrosAvanzados && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    🎯 Prioridad
                  </label>
                  <div className="space-y-2">
                    {["critica", "alta", "media", "baja"].map((prioridad) => (
                      <label
                        key={prioridad}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.prioridad.includes(prioridad)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                prioridad: [...filtros.prioridad, prioridad],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                prioridad: filtros.prioridad.filter(
                                  (p) => p !== prioridad
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-sm font-semibold capitalize ${tema.colores.texto}`}
                        >
                          {prioridad}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    📋 Tipo de Alerta
                  </label>
                  <div className="space-y-2">
                    {[
                      "equipo_falla",
                      "mantenimiento_vencido",
                      "ticket_urgente",
                      "equipo_critico",
                    ].map((tipo) => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.tipo.includes(tipo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                tipo: [...filtros.tipo, tipo],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                tipo: filtros.tipo.filter((t) => t !== tipo),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          {tipo.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    📍 Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por ubicación..."
                    value={filtros.ubicacion}
                    onChange={(e) =>
                      setFiltros({ ...filtros, ubicacion: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    💻 Equipo
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por equipo..."
                    value={filtros.equipoNombre}
                    onChange={(e) =>
                      setFiltros({ ...filtros, equipoNombre: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    ⏱️ Tiempo transcurrido (min)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filtros.tiempoMin}
                      onChange={(e) =>
                        setFiltros({
                          ...filtros,
                          tiempoMin: parseInt(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                    <span className={tema.colores.texto}>-</span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filtros.tiempoMax === 999999 ? "" : filtros.tiempoMax}
                      onChange={(e) =>
                        setFiltros({
                          ...filtros,
                          tiempoMax: parseInt(e.target.value) || 999999,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}
                  >
                    👥 Usuarios afectados (mín)
                  </label>
                  <input
                    type="number"
                    placeholder="Mínimo de usuarios..."
                    value={filtros.usuariosAfectadosMin}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        usuariosAfectadosMin: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloNoLeidas}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloNoLeidas: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      👁️ Solo no leídas
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloAsignadasAMi}
                      onChange={(e) =>
                        setFiltros({ ...filtros, soloAsignadasAMi: e.target.checked })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                      👤 Solo asignadas a mí
                    </span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() =>
                      setFiltros({
                        prioridad: [],
                        tipo: [],
                        impacto: [],
                        ubicacion: "",
                        equipoNombre: "",
                        tiempoMin: 0,
                        tiempoMax: 999999,
                        usuariosAfectadosMin: 0,
                        soloNoLeidas: false,
                        soloAsignadasAMi: false,
                        ordenarPor: "prioridad",
                        ordenDireccion: "desc",
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido principal: Alertas */}
        {loadingAlertas ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-red-500 mx-auto mb-4" />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando alertas activas...
              </p>
            </div>
          </div>
        ) : alertasFiltradas.length === 0 ? (
          <div
            className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
              ✅ ¡Todo Bajo Control!
            </h3>
            <p className={`text-lg ${tema.colores.textoSecundario} mb-6`}>
              No hay alertas activas que coincidan con los filtros aplicados.
            </p>
            <button
              onClick={() => {
                setFiltros({
                  prioridad: [],
                  tipo: [],
                  impacto: [],
                  ubicacion: "",
                  equipoNombre: "",
                  tiempoMin: 0,
                  tiempoMax: 999999,
                  usuariosAfectadosMin: 0,
                  soloNoLeidas: false,
                  soloAsignadasAMi: false,
                  ordenarPor: "prioridad",
                  ordenDireccion: "desc",
                });
                setBusqueda("");
              }}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.primario} text-white hover:scale-105`}
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(alertasAgrupadas).map(([grupo, alertas]) => (
              <div key={grupo}>
                {vista.agruparPor !== "ninguno" && (
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      {grupo}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${tema.colores.info}`}
                    >
                      {alertas.length} alertas
                    </span>
                  </div>
                )}

                {/* Vista de tarjetas */}
                {vista.modo === "tarjetas" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {alertas.map((alerta) => {
                      const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                      const isSeleccionada = alertasSeleccionadas.includes(
                        alerta.id_alerta
                      );

                      return (
                        <div
                          key={alerta.id_alerta}
                          className={`rounded-2xl p-6 ${tema.colores.card} ${
                            tema.colores.borde
                          } border ${
                            tema.colores.sombra
                          } transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group ${
                            !alerta.leida ? "ring-2 ring-red-500/50" : ""
                          } ${
                            isSeleccionada ? "ring-2 ring-purple-500" : ""
                          } relative`}
                          onClick={() => {
                            if (modoSeleccionMultiple) {
                              toggleSeleccionAlerta(alerta.id_alerta);
                            } else {
                              setAlertaSeleccionada(alerta);
                              setPanelDetalleAbierto(true);
                            }
                          }}
                        >
                          {/* Checkbox selección múltiple */}
                          {modoSeleccionMultiple && (
                            <div className="absolute top-4 right-4 z-10">
                              <input
                                type="checkbox"
                                checked={isSeleccionada}
                                onChange={() => toggleSeleccionAlerta(alerta.id_alerta)}
                                className="w-5 h-5 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Icono */}
                            <div
                              className={`relative w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                            >
                              <Icono className="w-8 h-8" />
                              {!alerta.leida && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                  <Zap className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4
                                  className={`text-lg font-black ${tema.colores.texto} mb-1`}
                                >
                                  {alerta.titulo}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                    alerta.prioridad
                                  )}`}
                                >
                                  {alerta.prioridad.toUpperCase()}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ${tema.colores.info}`}
                                >
                                  {alerta.tipo.replace("_", " ")}
                                </span>
                                {alerta.requiere_atencion_inmediata && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-500/20 text-red-300 border-red-500/40 animate-pulse">
                                    ⚡ URGENTE
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-sm mb-3 ${tema.colores.textoSecundario} line-clamp-2`}
                              >
                                {alerta.descripcion}
                              </p>

                              <div className="space-y-2 mb-4">
                                {alerta.nombre_equipo && (
                                  <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-gray-500" />
                                    <span
                                      className={`text-xs font-semibold ${tema.colores.texto}`}
                                    >
                                      {alerta.nombre_equipo}
                                    </span>
                                  </div>
                                )}

                                {alerta.ubicacion && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span
                                      className={`text-xs font-semibold ${tema.colores.texto}`}
                                    >
                                      {alerta.ubicacion}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    Hace {formatearTiempo(alerta.tiempo_transcurrido)}
                                  </span>
                                </div>

                                {alerta.usuarios_afectados > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span
                                      className={`text-xs font-semibold ${tema.colores.texto}`}
                                    >
                                      {alerta.usuarios_afectados} usuarios afectados
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {!alerta.leida && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      marcarComoLeida(alerta.id_alerta);
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Leer
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resolverAlerta(alerta.id_alerta);
                                  }}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Resolver
                                </button>

                                {alerta.puede_escalar && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      escalarAlerta(alerta.id_alerta);
                                    }}
                                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 flex items-center gap-1 shadow-lg"
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                    Escalar
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAlertaSeleccionada(alerta);
                                    setPanelDetalleAbierto(true);
                                  }}
                                  className={`p-1.5 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vista de lista */}
                {vista.modo === "lista" && (
                  <div className="space-y-4">
                    {alertas.map((alerta) => {
                      const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                      const isSeleccionada = alertasSeleccionadas.includes(
                        alerta.id_alerta
                      );

                      return (
                        <div
                          key={alerta.id_alerta}
                          className={`rounded-xl p-4 ${tema.colores.card} ${
                            tema.colores.borde
                          } border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                            !alerta.leida ? "ring-2 ring-red-500/50" : ""
                          } ${isSeleccionada ? "ring-2 ring-purple-500" : ""}`}
                          onClick={() => {
                            if (modoSeleccionMultiple) {
                              toggleSeleccionAlerta(alerta.id_alerta);
                            } else {
                              setAlertaSeleccionada(alerta);
                              setPanelDetalleAbierto(true);
                            }
                          }}
                        >
                          <div className="flex items-center gap-4">
                            {modoSeleccionMultiple && (
                              <input
                                type="checkbox"
                                checked={isSeleccionada}
                                onChange={() => toggleSeleccionAlerta(alerta.id_alerta)}
                                className="w-5 h-5 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}

                            <div
                              className={`w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0`}
                            >
                              <Icono className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4
                                  className={`text-base font-bold ${tema.colores.texto}`}
                                >
                                  {alerta.titulo}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                    alerta.prioridad
                                  )}`}
                                >
                                  {alerta.prioridad}
                                </span>
                              </div>
                              <p
                                className={`text-sm ${tema.colores.textoSecundario} line-clamp-1`}
                              >
                                {alerta.descripcion}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                                  {formatearTiempo(alerta.tiempo_transcurrido)}
                                </p>
                                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                                  transcurrido
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {!alerta.leida && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      marcarComoLeida(alerta.id_alerta);
                                    }}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resolverAlerta(alerta.id_alerta);
                                  }}
                                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAlertaSeleccionada(alerta);
                                    setPanelDetalleAbierto(true);
                                  }}
                                  className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vista de tabla */}
                {vista.modo === "tabla" && (
                  <div
                    className={`rounded-2xl overflow-hidden ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`${tema.colores.secundario}`}>
                          <tr>
                            {modoSeleccionMultiple && (
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={
                                    alertasSeleccionadas.length === alertas.length &&
                                    alertas.length > 0
                                  }
                                  onChange={seleccionarTodas}
                                  className="w-5 h-5 rounded"
                                />
                              </th>
                            )}
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Estado
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Prioridad
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Título
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Tipo
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Equipo
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Tiempo
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Usuarios
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-bold uppercase ${tema.colores.texto}`}
                            >
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${tema.colores.borde}`}>
                          {alertas.map((alerta) => {
                            const Icono = obtenerIconoAlertaTipo(alerta.tipo);
                            const isSeleccionada = alertasSeleccionadas.includes(
                              alerta.id_alerta
                            );

                            return (
                              <tr
                                key={alerta.id_alerta}
                                className={`${tema.colores.hover} transition-colors cursor-pointer ${
                                  !alerta.leida ? "bg-red-500/5" : ""
                                } ${isSeleccionada ? "bg-purple-500/10" : ""}`}
                                onClick={() => {
                                  if (modoSeleccionMultiple) {
                                    toggleSeleccionAlerta(alerta.id_alerta);
                                  } else {
                                    setAlertaSeleccionada(alerta);
                                    setPanelDetalleAbierto(true);
                                  }
                                }}
                              >
                                {modoSeleccionMultiple && (
                                  <td className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={isSeleccionada}
                                      onChange={() =>
                                        toggleSeleccionAlerta(alerta.id_alerta)
                                      }
                                      className="w-5 h-5 rounded"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </td>
                                )}
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Icono className="w-5 h-5 text-red-500" />
                                    {!alerta.leida && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                                      alerta.prioridad
                                    )}`}
                                  >
                                    {alerta.prioridad}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <p
                                    className={`text-sm font-bold ${tema.colores.texto}`}
                                  >
                                    {alerta.titulo}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                                  >
                                    {alerta.tipo.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {alerta.nombre_equipo || "-"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {formatearTiempo(alerta.tiempo_transcurrido)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-semibold ${tema.colores.texto}`}
                                  >
                                    {alerta.usuarios_afectados}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {!alerta.leida && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          marcarComoLeida(alerta.id_alerta);
                                        }}
                                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                                        title="Marcar como leída"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resolverAlerta(alerta.id_alerta);
                                      }}
                                      className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-all"
                                      title="Resolver"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAlertaSeleccionada(alerta);
                                        setPanelDetalleAbierto(true);
                                      }}
                                      className={`p-1.5 rounded ${tema.colores.secundario} ${tema.colores.texto} transition-all`}
                                      title="Ver detalles"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginación (si es necesario) */}
        {alertasFiltradas.length > 0 && (
          <div
            className={`mt-8 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                Mostrando {alertasFiltradas.length} de {resumenAlertas.total} alertas
                activas
              </p>
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`px-4 py-2 font-bold ${tema.colores.texto}`}>
                  Página 1
                </span>
                <button
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          className={`mt-12 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border py-6 px-8 ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
              >
                <AlertOctagon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Centro de Alertas Activas Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Sistema de Monitoreo en Tiempo Real v4.5.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Lightbulb className="w-4 h-4" />
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <FileText className="w-4 h-4" />
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

          <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                🌐 Conectado desde: {usuario.tecnico?.region}
              </span>
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                ⏰ Zona horaria: {usuario.tecnico?.zona_horaria}
              </span>
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                🔄 Auto-refresh:{" "}
                {autoRefresh ? `${intervaloRefresh / 1000}s` : "Desactivado"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  disponibilidad === "disponible"
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : disponibilidad === "ocupado"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}
              >
                {disponibilidad === "disponible"
                  ? "✓ Disponible"
                  : disponibilidad === "ocupado"
                  ? "⏳ Ocupado"
                  : "✕ Fuera de servicio"}
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* PANEL LATERAL DE DETALLES */}
      {panelDetalleAbierto && alertaSeleccionada && (
        <div
          className={`fixed top-0 right-0 h-full w-[500px] ${tema.colores.card} ${tema.colores.borde} border-l ${tema.colores.sombra} z-50 overflow-y-auto custom-scrollbar transition-transform duration-300`}
        >
          <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <AlertOctagon className="w-6 h-6" />
                Detalles de Alerta
              </h3>
              <button
                onClick={() => setPanelDetalleAbierto(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border bg-white/20 text-white border-white/40`}
              >
                ID: {alertaSeleccionada.id_alerta}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorPrioridad(
                  alertaSeleccionada.prioridad
                )}`}
              >
                {alertaSeleccionada.prioridad.toUpperCase()}
              </span>
              {alertaSeleccionada.requiere_atencion_inmediata && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                  ⚡ URGENTE
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Título y descripción */}
            <div>
              <h4 className={`text-xl font-black mb-3 ${tema.colores.texto}`}>
                {alertaSeleccionada.titulo}
              </h4>
              <p className={`text-sm ${tema.colores.textoSecundario} leading-relaxed`}>
                {alertaSeleccionada.descripcion}
              </p>
            </div>

            {/* Información principal */}
            <div
              className={`rounded-xl p-4 ${tema.colores.secundario} space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  📋 Tipo de alerta
                </span>
                <span className={`text-sm font-bold ${tema.colores.texto}`}>
                  {alertaSeleccionada.tipo.replace("_", " ")}
                </span>
              </div>

              {alertaSeleccionada.nombre_equipo && (
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    💻 Equipo
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {alertaSeleccionada.nombre_equipo}
                  </span>
                </div>
              )}

              {alertaSeleccionada.ubicacion && (
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    📍 Ubicación
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    {alertaSeleccionada.ubicacion}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  ⏱️ Tiempo transcurrido
                </span>
                <span className={`text-sm font-bold ${tema.colores.texto}`}>
                  {formatearTiempo(alertaSeleccionada.tiempo_transcurrido)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  🎯 Impacto estimado
                </span>
                <span
                  className={`text-sm font-bold ${obtenerColorImpacto(
                    alertaSeleccionada.impacto_estimado
                  )}`}
                >
                  {alertaSeleccionada.impacto_estimado.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  👥 Usuarios afectados
                </span>
                <span className={`text-sm font-bold ${tema.colores.texto}`}>
                  {alertaSeleccionada.usuarios_afectados}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  📅 Fecha creación
                </span>
                <span className={`text-sm font-bold ${tema.colores.texto}`}>
                  {formatearFecha(alertaSeleccionada.fecha_creacion)}
                </span>
              </div>
            </div>

            {/* Servicios afectados */}
            {alertaSeleccionada.servicios_afectados &&
              alertaSeleccionada.servicios_afectados.length > 0 && (
                <div>
                  <h5
                    className={`text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <Server className="w-4 h-4" />
                    Servicios Afectados
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {alertaSeleccionada.servicios_afectados.map((servicio, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${tema.colores.warning}`}
                      >
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Tags */}
            {alertaSeleccionada.tags && alertaSeleccionada.tags.length > 0 && (
              <div>
                <h5
                  className={`text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
                >
                  🏷️ Tags
                </h5>
                <div className="flex flex-wrap gap-2">
                  {alertaSeleccionada.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${tema.colores.info}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de acciones */}
            {alertaSeleccionada.historial_acciones &&
              alertaSeleccionada.historial_acciones.length > 0 && (
                <div>
                  <h5
                    className={`text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <History className="w-4 h-4" />
                    Historial de Acciones
                  </h5>
                  <div className="space-y-3">
                    {alertaSeleccionada.historial_acciones.map((accion) => (
                      <div
                        key={accion.id_accion}
                        className={`p-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-bold ${tema.colores.texto}`}
                          >
                            {accion.tipo.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {formatearFecha(accion.fecha)}
                          </span>
                        </div>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          {accion.descripcion}
                        </p>
                        <p
                          className={`text-xs font-semibold mt-1 ${tema.colores.texto}`}
                        >
                          Por: {accion.usuario}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Acciones principales */}
            <div className="space-y-3">
              <h5
                className={`text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}
              >
                ⚡ Acciones Rápidas
              </h5>

              {!alertaSeleccionada.leida && (
                <button
                  onClick={() => {
                    marcarComoLeida(alertaSeleccionada.id_alerta);
                    setAlertaSeleccionada({
                      ...alertaSeleccionada,
                      leida: true,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <Eye className="w-5 h-5" />
                  Marcar como Leída
                </button>
              )}

              <button
                onClick={() => {
                  resolverAlerta(alertaSeleccionada.id_alerta);
                  setPanelDetalleAbierto(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Resolver Alerta
              </button>

              {alertaSeleccionada.puede_escalar && (
                <button
                  onClick={() => {
                    escalarAlerta(alertaSeleccionada.id_alerta);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <TrendingUp className="w-5 h-5" />
                  Escalar Alerta
                </button>
              )}

              <button
                onClick={() => {
                  asignarAlerta(
                    alertaSeleccionada.id_alerta,
                    usuario?.tecnico?.id_tecnico || 0
                  );
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg ${tema.colores.primario} text-white`}
              >
                <UserCheck className="w-5 h-5" />
                Asignarme esta Alerta
              </button>

              {alertaSeleccionada.url_accion && (
                <Link
                  href={alertaSeleccionada.url_accion}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Ir a la Acción
                </Link>
              )}
            </div>

            {/* Acciones secundarias */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <MessageSquare className="w-4 h-4" />
                Comentar
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>

            {/* Información adicional */}
            <div
              className={`rounded-xl p-4 ${tema.colores.info} border ${tema.colores.borde}`}
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                    💡 Información Importante
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Esta alerta requiere atención inmediata. Asegúrate de documentar
                    todas las acciones realizadas y notificar a los usuarios afectados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS GLOBALES PREMIUM */}
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
          font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        /* Scrollbar personalizado premium */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ef4444 0%, #f97316 100%);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #dc2626 0%, #ea580c 100%);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(239, 68, 68, 0.5) transparent;
          scrollbar-width: thin;
        }

        /* Animaciones premium */
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
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Gradientes animados */
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

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        /* Truncate text */
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hidden\\.md\\:block {
            display: none;
          }

          .block\\.md\\:hidden {
            display: block;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }

          .custom-scrollbar {
            overflow: visible !important;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          input,
          select,
          textarea {
            color-scheme: dark;
          }
        }

        /* Focus visible */
        *:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* Selection */
        ::selection {
          background-color: rgba(239, 68, 68, 0.3);
          color: inherit;
        }

        /* Placeholder */
        ::placeholder {
          opacity: 0.6;
        }

        /* Backdrop blur support */
        @supports (backdrop-filter: blur(10px)) {
          .backdrop-blur-xl {
            backdrop-filter: blur(20px);
          }
        }

        /* Animación de entrada */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
