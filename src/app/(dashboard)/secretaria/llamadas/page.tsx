// src/app/(dashboard)/secretaria/llamadas/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

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
  PhoneOff,
  CalendarClock,
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
} from "lucide-react";

import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ========================================
// TIPOS
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
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  secretaria?: {
    id_secretaria: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    jornada: "completa" | "media" | "parcial";
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    medicos_asignados: Array<{
      id_profesional: number;
      nombre_completo: string;
      especialidad: string;
      foto_url: string | null;
      es_principal: boolean;
    }>;
  };
}

interface LlamadaBase {
  id_llamada: number;
  tipo:
    | "confirmacion_cita"
    | "recordatorio"
    | "seguimiento"
    | "resultado"
    | "otro";
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    telefono: string | null;
    celular: string | null;
    whatsapp: string | null;
  };
  motivo: string;
  prioridad: "normal" | "alta" | "urgente";
  fecha_programada: string | null;
  intentos_realizados: number;
  notas: string | null;
}

interface LlamadaPendientePanel extends LlamadaBase {
  estado: "pendiente" | "en_progreso";
  canal_preferido?: "telefono" | "whatsapp" | "sms";
  medico?: {
    id_profesional: number;
    nombre_completo: string;
    especialidad: string;
  } | null;
  origen?: string | null; // Ej: "Cita 123"
}

interface LlamadaHistorial extends LlamadaBase {
  estado: "completada" | "no_contactado" | "rechazada";
  fecha_realizacion: string;
  resultado: string;
  usuario_registro: {
    id_usuario: number;
    nombre_completo: string;
  };
}

interface EstadisticasLlamadas {
  total_pendientes: number;
  total_en_progreso: number;
  total_hoy: number;
  total_exitosas_hoy: number;
  tasa_exito_hoy: number; // 0-100
  promedio_intentos: number;
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
// TEMAS (IGUAL QUE EN /secretaria/page.tsx)
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
// COMPONENTE PRINCIPAL - LLAMADAS
// ========================================

export default function SecretariaLlamadasPage() {
  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);

  // Data llamadas
  const [estadisticas, setEstadisticas] = useState<EstadisticasLlamadas | null>(
    null
  );
  const [llamadasPendientes, setLlamadasPendientes] = useState<
    LlamadaPendientePanel[]
  >([]);
  const [llamadasEnCurso, setLlamadasEnCurso] = useState<LlamadaPendientePanel[]>(
    []
  );
  const [historialLlamadas, setHistorialLlamadas] = useState<LlamadaHistorial[]>(
    []
  );
  const [llamadaSeleccionada, setLlamadaSeleccionada] =
    useState<LlamadaPendientePanel | LlamadaHistorial | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  // UI
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");

  // filtros de llamadas
  const [filtroEstado, setFiltroEstado] = useState<"pendientes" | "en_curso" | "todas">("pendientes");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [busquedaLlamadas, setBusquedaLlamadas] = useState("");

  // Para registrar resultado
  const [resultadoLlamada, setResultadoLlamada] = useState<string>("");
  const [notaResultado, setNotaResultado] = useState<string>("");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ DE NAVEGACIÓN (TAL CUAL TU DASHBOARD)
  // ========================================

  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/secretaria",
    },
    {
      titulo: "Agenda",
      icono: Calendar,
      url: "",
      badge: 0,
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        { titulo: "Nueva Cita", icono: CalendarPlus, url: "/secretaria/agenda/nueva" },
        { titulo: "Búsqueda Citas", icono: Search, url: "/secretaria/agenda/buscar" },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/secretaria/agenda/disponibilidad",
        },
      ],
    },
    {
      titulo: "Confirmaciones",
      icono: CheckSquare,
      url: "",
      badge: 0,
      submenu: [
        {
          titulo: "Pendientes",
          icono: Clock,
          url: "/secretaria/confirmaciones/pendientes",
        },
        {
          titulo: "Confirmadas",
          icono: CheckCircle2,
          url: "/secretaria/confirmaciones/confirmadas",
        },
        {
          titulo: "Cancelaciones",
          icono: X,
          url: "/secretaria/confirmaciones/cancelaciones",
        },
      ],
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "",
      badge: estadisticas?.total_pendientes || 0,
      submenu: [
        {
          titulo: "Por Realizar",
          icono: PhoneOutgoing,
          url: "/secretaria/llamadas",
        },
        {
          titulo: "Realizadas",
          icono: PhoneIncoming,
          url: "/secretaria/llamadas/historial",
        },
        {
          titulo: "Registro",
          icono: ClipboardList,
          url: "/secretaria/llamadas/registro",
        },
      ],
      // Marcamos esta sección como activa en esta página
      activo: true,
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "",
      badge: 0,
      submenu: [
        { titulo: "Todos", icono: Users, url: "/secretaria/pacientes" },
        {
          titulo: "Nuevo Paciente",
          icono: UserPlus,
          url: "/secretaria/pacientes/nuevo",
        },
        {
          titulo: "Búsqueda",
          icono: Search,
          url: "/secretaria/pacientes/buscar",
        },
        {
          titulo: "Atención Hoy",
          icono: CalendarCheck,
          url: "/secretaria/pacientes/hoy",
        },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/secretaria/medicos/disponibilidad",
        },
        { titulo: "Contacto", icono: Phone, url: "/secretaria/medicos/contacto" },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: "",
      badge: 0,
      submenu: [
        {
          titulo: "Programados",
          icono: Clock,
          url: "/secretaria/recordatorios/programados",
        },
        {
          titulo: "Enviados",
          icono: Send,
          url: "/secretaria/recordatorios/enviados",
        },
        {
          titulo: "Configuración",
          icono: Settings,
          url: "/secretaria/recordatorios/config",
        },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "",
      badge: 0,
      submenu: [
        { titulo: "Gestión", icono: FileSpreadsheet, url: "/secretaria/documentos" },
        {
          titulo: "Certificados",
          icono: Award,
          url: "/secretaria/documentos/certificados",
        },
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
        {
          titulo: "Órdenes",
          icono: ClipboardList,
          url: "/secretaria/documentos/ordenes",
        },
      ],
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "",
      badge: 0,
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
      badge: 0,
      submenu: [
        {
          titulo: "Sala Espera",
          icono: Clock,
          url: "/secretaria/telemedicina/espera",
        },
        {
          titulo: "Programadas",
          icono: CalendarCheck,
          url: "/secretaria/telemedicina/programadas",
        },
        {
          titulo: "Asistencia",
          icono: Settings,
          url: "/secretaria/telemedicina/asistencia",
        },
      ],
    },
    {
      titulo: "Tareas",
      icono: CheckSquare,
      url: "",
      badge: 0,
      submenu: [
        { titulo: "Todos Mis Tareas", icono: Square, url: "/secretaria/tareas" },
        {
          titulo: "Pendientes",
          icono: Square,
          url: "/secretaria/tareas/pendientes",
        },
        {
          titulo: "Completadas",
          icono: CheckSquare,
          url: "/secretaria/tareas/completadas",
        },
        { titulo: "Nueva Tarea", icono: Plus, url: "/secretaria/tareas/nueva" },
      ],
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "",
      submenu: [
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/" },
        { titulo: "Citas", icono: Calendar, url: "/secretaria/reportes/citas" },
        { titulo: "Llamadas", icono: Phone, url: "/secretaria/reportes/llamadas" },
        {
          titulo: "Rendimiento",
          icono: Target,
          url: "/secretaria/reportes/rendimiento",
        },
      ],
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "",
      submenu: [
        {
          titulo: "Información Personal",
          icono: User,
          url: "/secretaria/perfil",
        },
        { titulo: "Horarios", icono: Clock, url: "/secretaria/perfil/horarios" },
        {
          titulo: "Preferencias",
          icono: Settings,
          url: "/secretaria/perfil/preferencias",
        },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/" },
        {
          titulo: "Notificaciones",
          icono: Bell,
          url: "/secretaria/configuracion/notificaciones",
        },
        {
          titulo: "Seguridad",
          icono: Shield,
          url: "/secretaria/configuracion/seguridad",
        },
        {
          titulo: "Temas",
          icono: Sparkles,
          url: "/secretaria/configuracion/temas",
        },
      ],
    },
  ];

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarPanelLlamadas();
    }
  }, [usuario]);

  useEffect(() => {
    // refresco automático cada 3 min
    const interval = setInterval(() => {
      if (usuario?.secretaria) {
        cargarPanelLlamadas();
      }
    }, 180000);
    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const cargarPreferenciaTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.tema_color) {
          setTemaActual(data.tema_color);
          if (typeof window !== "undefined") {
            localStorage.setItem("tema_secretaria", data.tema_color);
          }
        }
      } catch (e) {
        console.error("No se pudo cargar la preferencia de tema:", e);
      }
    };
    cargarPreferenciaTema();
  }, []);

  // ========================================
  // CARGA DE DATOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoadingUsuario(true);
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

        if (Array.isArray(result.usuario.roles)) {
          result.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .trim()
                  .toUpperCase()
              );
            }
          });
        }

        const tieneRolSecretaria = rolesUsuario.some((rol) =>
          rol.includes("SECRETARIA")
        );

        if (!tieneRolSecretaria) {
          alert(
            `Acceso denegado. Este panel es solo para secretarias. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.secretaria) {
          alert(
            "Tu usuario tiene rol de SECRETARIA pero no está vinculado a un registro de secretaria. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoadingUsuario(false);
    }
  };

  const cargarPanelLlamadas = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingData(true);

      const res = await fetch(
        `/api/secretaria/llamadas/panel?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta panel llamadas:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setLlamadasPendientes(data.pendientes || []);
      setLlamadasEnCurso(data.en_progreso || []);
      setHistorialLlamadas(data.historial || []);

      // Si no hay llamada seleccionada, seleccionamos la primera pendiente
      if (!llamadaSeleccionada && (data.pendientes?.length || 0) > 0) {
        setLlamadaSeleccionada(data.pendientes[0]);
      }
    } catch (error) {
      console.error("Error al cargar panel de llamadas:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const registrarLlamada = async (idLlamada: number, resultado: string) => {
    try {
      const response = await fetch(
        `/api/secretaria/llamadas/${idLlamada}/registrar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            resultado,
            nota: notaResultado || null,
          }),
        }
      );

      if (!response.ok) {
        alert("Error al registrar la llamada");
        return;
      }

      alert("Llamada registrada exitosamente");
      setNotaResultado("");
      setResultadoLlamada("");
      await cargarPanelLlamadas();
    } catch (error) {
      console.error("Error al registrar llamada:", error);
      alert("Error al registrar la llamada");
    }
  };

  // ========================================
  // AUXILIARES
  // ========================================

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
      localStorage.setItem("tema_secretaria", nuevoTema);
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

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearHora = (fecha: string | null) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: Record<string, string> = {
      urgente: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      normal: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-200")
    );
  };

  const obtenerColorEstadoLlamada = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: Record<string, string> = {
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      en_progreso: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      completada: isDark
        ? "bg-green-500/20 text-green-300 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      no_contactado: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      rechazada: isDark
        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
        : "bg-rose-100 text-rose-800 border-rose-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const abrirWhatsApp = (numero: string | null) => {
    if (!numero) return;
    const limpio = numero.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${limpio}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const llamarTelefono = (numero: string | null) => {
    if (!numero) return;
    if (typeof window !== "undefined") {
      window.location.href = `tel:${numero}`;
    }
  };

  // ========================================
  // DERIVADOS / MEMO
  // ========================================

  const llamadasVisibles: (LlamadaPendientePanel | LlamadaHistorial)[] =
    useMemo(() => {
      let base: (LlamadaPendientePanel | LlamadaHistorial)[] = [];

      if (filtroEstado === "pendientes") {
        base = [...llamadasPendientes];
      } else if (filtroEstado === "en_curso") {
        base = [...llamadasEnCurso];
      } else {
        base = [...llamadasPendientes, ...llamadasEnCurso];
      }

      if (filtroTipo !== "todos") {
        base = base.filter((l) => l.tipo === filtroTipo);
      }

      if (filtroPrioridad !== "todas") {
        base = base.filter(
          (l) => l.prioridad.toLowerCase() === filtroPrioridad.toLowerCase()
        );
      }

      if (busquedaLlamadas.trim()) {
        const q = busquedaLlamadas.toLowerCase();
        base = base.filter((l) => {
          const nombre = l.paciente.nombre_completo.toLowerCase();
          const fono = (l.paciente.telefono || "").toLowerCase();
          const cel = (l.paciente.celular || "").toLowerCase();
          const mot = (l.motivo || "").toLowerCase();
          return (
            nombre.includes(q) || fono.includes(q) || cel.includes(q) || mot.includes(q)
          );
        });
      }

      return base;
    }, [
      llamadasPendientes,
      llamadasEnCurso,
      filtroEstado,
      filtroTipo,
      filtroPrioridad,
      busquedaLlamadas,
    ]);

  // Datos para gráfico (llamadas por hora) calculados desde historial
  const datosGraficoPorHora = useMemo(() => {
    const mapa: Record<
      string,
      { realizadas: number; exitosas: number }
    > = {};

    historialLlamadas.forEach((l) => {
      const fecha = l.fecha_realizacion || l.fecha_programada;
      if (!fecha) return;
      const d = new Date(fecha);
      const hora = `${d.getHours().toString().padStart(2, "0")}:00`;
      if (!mapa[hora]) {
        mapa[hora] = { realizadas: 0, exitosas: 0 };
      }
      mapa[hora].realizadas += 1;
      if (l.estado === "completada") {
        mapa[hora].exitosas += 1;
      }
    });

    return Object.entries(mapa)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([hora, v]) => ({
        hora,
        realizadas: v.realizadas,
        exitosas: v.exitosas,
      }));
  }, [historialLlamadas]);

  // Datos para gráfico de tipo de llamada
  const datosGraficoPorTipo = useMemo(() => {
    const mapa: Record<string, number> = {};
    [...llamadasPendientes, ...historialLlamadas].forEach((l) => {
      mapa[l.tipo] = (mapa[l.tipo] || 0) + 1;
    });

    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#22c55e",
      "#0ea5e9",
    ];

    return Object.entries(mapa).map(([tipo, cantidad], idx) => ({
      nombre:
        tipo === "confirmacion_cita"
          ? "Confirmación"
          : tipo.charAt(0).toUpperCase() + tipo.slice(1),
      valor: cantidad,
      color: colors[idx % colors.length],
    }));
  }, [llamadasPendientes, historialLlamadas]);

  // ========================================
  // RENDER - ESTADOS INICIALES
  // ========================================

  if (loadingUsuario) {
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
              <PhoneCall className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando módulo de llamadas...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu central telefónica inteligente
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.secretaria) {
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
            No tienes permisos para acceder a este módulo de llamadas.
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
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <PhoneCall className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Central de Llamadas
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto(!sidebarAbierto)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-colors ${
                !sidebarAbierto && "mx-auto mt-4"
              }`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                  sidebarAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, index) => {
              const isActive = item.activo;
              return (
                <div key={index} className="mb-1">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group text-left ${
                      isActive
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                    onClick={() => {
                      if (item.submenu && item.submenu.length > 0) {
                        setMenuExpandido(
                          menuExpandido === item.titulo ? null : item.titulo
                        );
                      } else if (item.url) {
                        if (typeof window !== "undefined") {
                          window.location.href = item.url;
                        }
                      }
                    }}
                    onMouseEnter={() => item.submenu && setSidebarAbierto(true)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icono
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActive ? "text-white" : tema.colores.acento
                        }`}
                      />
                      {sidebarAbierto && (
                        <span className="truncate">{item.titulo}</span>
                      )}
                    </div>

                    {sidebarAbierto && item.badge && item.badge > 0 && (
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}

                    {sidebarAbierto && item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          menuExpandido === item.titulo ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenú */}
                  {sidebarAbierto &&
                    item.submenu &&
                    menuExpandido === item.titulo && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.submenu.map((subitem, subindex) => (
                          <Link
                            key={subindex}
                            href={subitem.url}
                            target={subitem.target}
                            rel={subitem.rel}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                          >
                            <subitem.icono className="w-4 h-4" />
                            <span>{subitem.titulo}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </nav>

          {/* Usuario abajo */}
          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${tema.colores.texto}`}
                  >
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p
                    className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}
                  >
                    Secretaria
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
              >
                {usuario.foto_perfil_url ? (
                  <Image
                    src={usuario.foto_perfil_url}
                    alt={usuario.nombre}
                    width={48}
                    height={48}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda global */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar paciente, cita, teléfono, llamada..."
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busquedaGlobal && (
                <button
                  onClick={() => setBusquedaGlobal("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones header */}
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

            {/* Notificaciones (placeholder, mismo estilo) */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {/* Puedes conectar aquí tus notificaciones reales */}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                      >
                        Marcar todas leídas
                      </button>
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    <BellOff
                      className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                    />
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Conecta aquí tus notificaciones de llamadas
                    </p>
                  </div>
                </div>
              )}
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
                    Secretaria
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
                        Secretaria
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.secretaria.centro.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/secretaria/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/secretaria/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/secretaria/ayuda"
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
        {/* Saludo y cabecera del módulo */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">📞</span>
              </h2>
              <p
                className={`text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Central inteligente de llamadas ·{" "}
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={() => cargarPanelLlamadas()}
              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-emerald-400 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando información de llamadas...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI PRINCIPALES DE LLAMADAS */}
            {estadisticas && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Pendientes */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <PhoneOutgoing className="w-6 h-6 text-white" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.total_pendientes}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Llamadas Pendientes
                  </div>
                </div>

                {/* En curso */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <PhoneCall className="w-6 h-6 text-white" />
                    </div>
                    <Clock3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.total_en_progreso}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    En Curso
                  </div>
                </div>

                {/* Realizadas Hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <PhoneIncoming className="w-6 h-6 text-white" />
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.total_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Realizadas Hoy
                  </div>
                </div>

                {/* Tasa Éxito */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.tasa_exito_hoy.toFixed(1)}%
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Tasa de Éxito Hoy
                  </div>
                </div>
              </div>
            )}

            {/* FILTROS Y ACCIONES */}
            <div
              className={`rounded-2xl p-5 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  <span
                    className={`text-sm font-bold uppercase ${tema.colores.textoSecundario}`}
                  >
                    Filtros:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFiltroEstado("pendientes")}
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        filtroEstado === "pendientes"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.textoSecundario}`
                      }`}
                    >
                      Pendientes
                    </button>
                    <button
                      onClick={() => setFiltroEstado("en_curso")}
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        filtroEstado === "en_curso"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.textoSecundario}`
                      }`}
                    >
                      En Curso
                    </button>
                    <button
                      onClick={() => setFiltroEstado("todas")}
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        filtroEstado === "todas"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.textoSecundario}`
                      }`}
                    >
                      Todas
                    </button>
                  </div>

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="confirmacion_cita">Confirmación de cita</option>
                    <option value="recordatorio">Recordatorio</option>
                    <option value="seguimiento">Seguimiento</option>
                    <option value="resultado">Resultados</option>
                    <option value="otro">Otros</option>
                  </select>

                  <select
                    value={filtroPrioridad}
                    onChange={(e) => setFiltroPrioridad(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todas">Todas las prioridades</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:flex-none">
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                    />
                    <input
                      type="text"
                      placeholder="Buscar en cola de llamadas..."
                      value={busquedaLlamadas}
                      onChange={(e) => setBusquedaLlamadas(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                    />
                  </div>

                  <Link
                    href="/secretaria/reportes/llamadas"
                    className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ver Reportes
                  </Link>
                </div>
              </div>
            </div>

            {/* GRID PRINCIPAL: COLA + DETALLE + GRÁFICOS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* COLA DE LLAMADAS */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PhoneOutgoing className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Cola de llamadas
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {llamadasVisibles.length} llamadas en la vista actual
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => cargarPanelLlamadas()}
                    className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
                  {llamadasVisibles.length === 0 ? (
                    <div className="text-center py-16">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                      >
                        <PhoneOff className="w-12 h-12 text-white" />
                      </div>
                      <p
                        className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                      >
                        No hay llamadas en la cola
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Cuando el sistema genere llamadas pendientes, aparecerán aquí.
                      </p>
                    </div>
                  ) : (
                    llamadasVisibles.map((llamada) => (
                      <button
                        key={llamada.id_llamada}
                        type="button"
                        onClick={() => setLlamadaSeleccionada(llamada)}
                        className={`w-full text-left p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} ${
                          llamadaSeleccionada?.id_llamada === llamada.id_llamada
                            ? "ring-2 ring-emerald-500/80"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                              llamada.prioridad
                            )}`}
                          >
                            {llamada.tipo === "confirmacion_cita" && (
                              <CalendarCheck className="w-5 h-5" />
                            )}
                            {llamada.tipo === "recordatorio" && (
                              <Bell className="w-5 h-5" />
                            )}
                            {llamada.tipo === "seguimiento" && (
                              <Activity className="w-5 h-5" />
                            )}
                            {llamada.tipo === "resultado" && (
                              <FileText className="w-5 h-5" />
                            )}
                            {llamada.tipo === "otro" && (
                              <Phone className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {llamada.paciente.nombre_completo}
                                </p>
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  {llamada.motivo}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-bold border ${obtenerColorEstadoLlamada(
                                  (llamada as any).estado || "pendiente"
                                )}`}
                              >
                                {(llamada as any).estado || "pendiente"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                              <div className="flex items-center gap-2 text-xs">
                                {llamada.paciente.telefono && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {llamada.paciente.telefono}
                                  </span>
                                )}
                                {llamada.paciente.celular && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {llamada.paciente.celular}
                                  </span>
                                )}
                                {llamada.paciente.whatsapp && (
                                  <span className="inline-flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    WhatsApp
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px]">
                                <span
                                  className={`px-2 py-1 rounded-lg border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                >
                                  Próx: {formatearHora(llamada.fecha_programada)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-lg border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                >
                                  Intentos: {llamada.intentos_realizados}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* PANEL DETALLE LLAMADA */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <HeadsetIcon />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Detalle de llamada
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Gestiona en tiempo real la llamada seleccionada
                      </p>
                    </div>
                  </div>
                </div>

                {!llamadaSeleccionada ? (
                  <div className="text-center py-10">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <Phone className="w-10 h-10 text-white" />
                    </div>
                    <p
                      className={`text-lg font-bold mb-1 ${tema.colores.texto}`}
                    >
                      Selecciona una llamada de la lista
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Aquí verás todos los datos del paciente y podrás registrar
                      el resultado.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p
                        className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                      >
                        {llamadaSeleccionada.paciente.nombre_completo}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        {llamadaSeleccionada.motivo}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        className={`px-3 py-2 rounded-xl ${tema.colores.secundario}`}
                      >
                        <p
                          className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Tipo
                        </p>
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          {llamadaSeleccionada.tipo === "confirmacion_cita"
                            ? "Confirmación de cita"
                            : llamadaSeleccionada.tipo.charAt(0).toUpperCase() +
                              llamadaSeleccionada.tipo.slice(1)}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-xl ${tema.colores.secundario}`}
                      >
                        <p
                          className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Prioridad
                        </p>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                            llamadaSeleccionada.prioridad
                          )}`}
                        >
                          {llamadaSeleccionada.prioridad.toUpperCase()}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-xl ${tema.colores.secundario}`}
                      >
                        <p
                          className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Próxima llamada
                        </p>
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          {formatearFecha(llamadaSeleccionada.fecha_programada)}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-xl ${tema.colores.secundario}`}
                      >
                        <p
                          className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Intentos realizados
                        </p>
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          {llamadaSeleccionada.intentos_realizados}
                        </p>
                      </div>
                    </div>

                    {/* CONTACTO RÁPIDO */}
                    <div className="mb-4">
                      <p
                        className={`text-xs font-bold uppercase mb-2 ${tema.colores.textoSecundario}`}
                      >
                        Contacto
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {llamadaSeleccionada.paciente.telefono && (
                          <button
                            onClick={() =>
                              llamarTelefono(llamadaSeleccionada.paciente.telefono)
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:scale-105"
                          >
                            <Phone className="w-4 h-4" />
                            Llamar fijo
                          </button>
                        )}
                        {llamadaSeleccionada.paciente.celular && (
                          <button
                            onClick={() =>
                              llamarTelefono(llamadaSeleccionada.paciente.celular)
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:scale-105"
                          >
                            <PhoneCall className="w-4 h-4" />
                            Llamar celular
                          </button>
                        )}
                        {llamadaSeleccionada.paciente.whatsapp && (
                          <button
                            onClick={() =>
                              abrirWhatsApp(
                                llamadaSeleccionada.paciente.whatsapp ||
                                  llamadaSeleccionada.paciente.celular
                              )
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105"
                          >
                            <MessageSquare className="w-4 h-4" />
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>

                    {/* REGISTRO DE RESULTADO */}
                    <div className="mt-4">
                      <p
                        className={`text-xs font-bold uppercase mb-2 ${tema.colores.textoSecundario}`}
                      >
                        Registrar resultado
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          { value: "exitosa", label: "Exitosa", icon: CheckCircle2 },
                          { value: "no_contesta", label: "No contesta", icon: PhoneXIcon },
                          { value: "numero_incorrecto", label: "Número incorrecto", icon: AlertOctagon },
                          { value: "volver_a_llamar", label: "Volver a llamar", icon: Clock3 },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setResultadoLlamada(opt.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all duration-300 ${
                              resultadoLlamada === opt.value
                                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent`
                                : `${tema.colores.card} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                            }`}
                          >
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={4}
                        className={`w-full rounded-xl text-sm px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                        placeholder="Notas de la llamada (opcional)..."
                        value={notaResultado}
                        onChange={(e) => setNotaResultado(e.target.value)}
                      />

                      <button
                        disabled={!resultadoLlamada}
                        onClick={() =>
                          registrarLlamada(llamadaSeleccionada.id_llamada, resultadoLlamada)
                        }
                        className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${
                          resultadoLlamada
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]"
                            : "bg-gray-500/40 text-gray-300 cursor-not-allowed"
                        } transition-all duration-300`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Guardar resultado
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Llamadas por hora */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Llamadas por hora (hoy)
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Realizadas vs exitosas
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <RechartsBarChart data={datosGraficoPorHora}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="hora"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: 12,
                        padding: 12,
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="realizadas"
                      name="Realizadas"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="exitosas"
                      name="Exitosas"
                      fill="#16a34a"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribución por tipo */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Distribución por tipo
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Llamadas por motivo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="60%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={datosGraficoPorTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="valor"
                      >
                        {datosGraficoPorTipo.map((entry, index) => (
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
                    {datosGraficoPorTipo.map((item, index) => (
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
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Central de Llamadas.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v1.0.0
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
                className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
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

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
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

// Iconos auxiliares pequeños (solo UI, no toques nada de datos)
function HeadsetIcon() {
  return (
    <div className="relative">
      <HeadphonesMain />
    </div>
  );
}

function HeadphonesMain() {
  return (
    <svg
      className="w-6 h-6 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 13V11A8 8 0 0 1 20 11V13" />
      <rect x="2" y="13" width="4" height="7" rx="1" />
      <rect x="18" y="13" width="4" height="7" rx="1" />
      <path d="M9 20a3 3 0 0 0 6 0" />
    </svg>
  );
}

function PhoneXIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 3-6 6" />
      <path d="m15 3 6 6" />
      <path d="M5.5 10.5a16 16 0 0 0 8 8l2.5-2.5a1 1 0 0 1 1-.25 11.3 11.3 0 0 0 3.5.5 1 1 0 0 1 1 1V21a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.82-3.22A19.3 19.3 0 0 1 2 11.18 2 2 0 0 1 4 9h1.8a1 1 0 0 1 1 .75 11.3 11.3 0 0 0 .5 3.5 1 1 0 0 1-.25 1Z" />
    </svg>
  );
}
