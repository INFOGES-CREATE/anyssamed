//src\app\(dashboard)\tecnico\configuracion\page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";


import Image from "next/image";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BellOff,
  Headset,
  Briefcase,
  Calendar,
  Calculator,
  CalendarCheck,
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
  Wrench,
  Hammer,
  Cpu,
  HardDrive,
  Zap as ZapIcon,
  AlertCircle as AlertCircleIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Save,
  Smartphone,
} from "lucide-react";

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
    } | null;
    es_global: boolean;
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

interface AlertaTecnico {
  id_alerta: number;
  tipo:
    | "equipo_falla"
    | "mantenimiento_vencido"
    | "ticket_urgente"
    | "equipo_critico";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
}

interface ConfigCentroTickets {
  id_config: number | null;
  id_centro: number;
  nombre_centro: string;
  habilitado: boolean;
  permite_tickets_pacientes: boolean;
  permite_tickets_internos: boolean;
  canales: {
    web: boolean;
    email: boolean;
    telefono: boolean;
    whatsapp: boolean;
    app_movil: boolean;
    kiosko: boolean;
  };
  tipos_activos: {
    soporte: boolean;
    mantenimiento: boolean;
    ingenieria: boolean;
    biomedico: boolean;
    infraestructura: boolean;
  };
  sla_minutos: {
    critica: number;
    alta: number;
    media: number;
    baja: number;
  };
  horario_operacion: {
    desde: string; // "HH:MM"
    hasta: string; // "HH:MM"
    permite_fuera_horario: boolean;
  };
  autoasignacion: {
    habilitada: boolean;
    max_tickets_abiertos: number;
  };
  notificaciones: {
    email_resumen_diario: boolean;
    alerta_ticket_critico: boolean;
    copia_jefatura: boolean;
    copia_mantencion: boolean;
  };
  ult_actualizacion: string | null;
}

type CanalId = keyof ConfigCentroTickets["canales"];
type TipoTicketId = keyof ConfigCentroTickets["tipos_activos"];

const CANALES_DEF: { id: CanalId; label: string; desc: string; icon: any }[] = [
  {
    id: "web",
    label: "Portal web del centro",
    desc: "Usuarios internos del centro crean tickets desde AnyssaMed / INFOGES.",
    icon: Globe,
  },
  {
    id: "email",
    label: "Correo electrónico",
    desc: "Tickets generados automáticamente desde una casilla de soporte.",
    icon: Mail,
  },
  {
    id: "telefono",
    label: "Llamadas telefónicas",
    desc: "Secretaría o call center ingresan tickets al recibir llamadas.",
    icon: PhoneCall,
  },
  {
    id: "whatsapp",
    label: "WhatsApp / Mensajería",
    desc: "Integración futura con WhatsApp Business u otros canales.",
    icon: MessageSquare,
  },
  {
    id: "app_movil",
    label: "App móvil",
    desc: "Creación de tickets desde aplicaciones móviles del centro.",
    icon: Smartphone,
  },
  {
    id: "kiosko",
    label: "Kiosko en el centro",
    desc: "Kiosko físico para que los funcionarios reporten incidencias.",
    icon: Building2,
  },
];

const TIPOS_TICKET_DEF: {
  id: TipoTicketId;
  label: string;
  desc: string;
  icon: any;
}[] = [
  {
    id: "soporte",
    label: "Soporte TI",
    desc: "Problemas de software, usuarios, red, impresoras, etc.",
    icon: Headset,
  },
  {
    id: "mantenimiento",
    label: "Mantenimiento general",
    desc: "Infraestructura, eléctricos, mobiliario, climatización.",
    icon: Wrench,
  },
  {
    id: "ingenieria",
    label: "Ingeniería / Proyectos",
    desc: "Cambios de arquitectura, nuevas instalaciones, upgrades.",
    icon: BrainCircuit,
  },
  {
    id: "biomedico",
    label: "Equipos biomédicos",
    desc: "Equipos médicos críticos, mantenciones y fallas.",
    icon: Microscope,
  },
  {
    id: "infraestructura",
    label: "Infraestructura TI",
    desc: "Servidores, comunicaciones, almacenamiento, respaldo.",
    icon: Database,
  },
];

// ========================================
// TEMAS
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
// HELPERS
// ========================================

function crearConfigPorDefecto(usuario: UsuarioSesion): ConfigCentroTickets {
  const now = new Date().toISOString();
  const centro = usuario.tecnico?.centro;

  return {
    id_config: null,
    id_centro: centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0,
    nombre_centro: centro?.nombre ?? "Centro sin nombre",
    habilitado: true,
    permite_tickets_pacientes: true,
    permite_tickets_internos: true,
    canales: {
      web: true,
      email: true,
      telefono: true,
      whatsapp: false,
      app_movil: false,
      kiosko: false,
    },
    tipos_activos: {
      soporte: true,
      mantenimiento: true,
      ingenieria: true,
      biomedico: false,
      infraestructura: true,
    },
    sla_minutos: {
      critica: 30,
      alta: 120,
      media: 480,
      baja: 1440,
    },
    horario_operacion: {
      desde: "08:00",
      hasta: "17:00",
      permite_fuera_horario: false,
    },
    autoasignacion: {
      habilitada: true,
      max_tickets_abiertos: 5,
    },
    notificaciones: {
      email_resumen_diario: true,
      alerta_ticket_critico: true,
      copia_jefatura: true,
      copia_mantencion: false,
    },
    ult_actualizacion: now,
  };
}

function formatearFecha(fecha: string) {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatearFechaSoloDia(fecha: string) {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const seccionActiva = "tickets";

// ========================================
// PAGE COMPONENT
// ========================================

export default function ConfiguracionCentroTecnicoPage() {
    
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("blue");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [configCentro, setConfigCentro] = useState<ConfigCentroTickets | null>(
    null
  );
  const [configOriginal, setConfigOriginal] =
    useState<ConfigCentroTickets | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState<string | null>(null);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);


  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const seccionActiva = "configuracion";

  const hayCambios = useMemo(() => {
    if (!configCentro || !configOriginal) return false;
    return JSON.stringify(configCentro) !== JSON.stringify(configOriginal);
  }, [configCentro, configOriginal]);

  const resumenCentro = useMemo(() => {
    if (!configCentro) {
      return {
        canalesActivos: 0,
        tiposActivos: 0,
        slaCritica: 0,
        slaMedia: 0,
        maxTickets: 0,
        notificacionesActivas: 0,
      };
    }

    const canalesActivos = Object.values(configCentro.canales).filter(Boolean).length;
    const tiposActivos = Object.values(configCentro.tipos_activos).filter(Boolean)
      .length;
    const notificacionesActivas = Object.values(configCentro.notificaciones).filter(
      Boolean
    ).length;

    return {
      canalesActivos,
      tiposActivos,
      slaCritica: configCentro.sla_minutos.critica,
      slaMedia: configCentro.sla_minutos.media,
      maxTickets: configCentro.autoasignacion.max_tickets_abiertos,
      notificacionesActivas,
    };
  }, [configCentro]);

  // MENÚ
  
   

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (saved && TEMAS[saved]) {
        setTemaActual(saved);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarContextoTecnico();
      cargarConfiguracionCentro();
    }
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    if (!mensajeConfig && !errorConfig) return;
    const timer = setTimeout(() => {
      setMensajeConfig(null);
      setErrorConfig(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mensajeConfig, errorConfig]);

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
            `Acceso denegado. Este módulo de configuración es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarContextoTecnico = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/dashboard?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta dashboard contexto:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setAlertas(data.alertas || []);
    } catch (err) {
      console.error("Error al cargar contexto técnico:", err);
    }
  };

  const cargarConfiguracionCentro = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingConfig(true);
      setErrorConfig(null);

      const idCentro =
        usuario.tecnico?.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/tickets/config/centro?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      const base = crearConfigPorDefecto(usuario);

      if (!res.ok || !data.success) {
        console.warn("No se encontró configuración, usando valores por defecto");
        setConfigCentro(base);
        setConfigOriginal(base);
        return;
      }

      const cfgServer = data.config || {};

      const cfg: ConfigCentroTickets = {
        ...base,
        ...cfgServer,
        canales: {
          ...base.canales,
          ...(cfgServer.canales || {}),
        },
        tipos_activos: {
          ...base.tipos_activos,
          ...(cfgServer.tipos_activos || {}),
        },
        sla_minutos: {
          ...base.sla_minutos,
          ...(cfgServer.sla_minutos || {}),
        },
        horario_operacion: {
          ...base.horario_operacion,
          ...(cfgServer.horario_operacion || {}),
        },
        autoasignacion: {
          ...base.autoasignacion,
          ...(cfgServer.autoasignacion || {}),
        },
        notificaciones: {
          ...base.notificaciones,
          ...(cfgServer.notificaciones || {}),
        },
      };

      setConfigCentro(cfg);
      setConfigOriginal(cfg);
    } catch (error) {
      console.error("Error al cargar configuración del centro:", error);
      setErrorConfig(
        "No se pudo cargar la configuración del centro. Usando valores por defecto."
      );
      if (usuario) {
        const base = crearConfigPorDefecto(usuario);
        setConfigCentro(base);
        setConfigOriginal(base);
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const response = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
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

  const actualizarSla = (
    prioridad: keyof ConfigCentroTickets["sla_minutos"],
    valor: string
  ) => {
    if (!configCentro) return;
    const num = parseInt(valor, 10);
    if (Number.isNaN(num) || num <= 0) return;

    setConfigCentro((prev) =>
      prev
        ? {
            ...prev,
            sla_minutos: {
              ...prev.sla_minutos,
              [prioridad]: num,
            },
          }
        : prev
    );
  };

  const actualizarMaxTickets = (valor: string) => {
    if (!configCentro) return;
    const num = parseInt(valor, 10);
    if (Number.isNaN(num) || num <= 0) return;

    setConfigCentro((prev) =>
      prev
        ? {
            ...prev,
            autoasignacion: {
              ...prev.autoasignacion,
              max_tickets_abiertos: num,
            },
          }
        : prev
    );
  };

  const guardarConfiguracionCentro = async () => {
    if (!configCentro || !usuario?.tecnico) return;

    try {
      setGuardandoConfig(true);
      setMensajeConfig(null);
      setErrorConfig(null);

      const metodo = configCentro.id_config ? "PUT" : "POST";

      const res = await fetch("/api/tecnico/tickets/config/centro", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configCentro,
          id_tecnico: usuario.tecnico.id_tecnico,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar configuración:", data);
        setErrorConfig(
          data?.message ||
            "No se pudo guardar la configuración. Inténtalo nuevamente."
        );
        return;
      }

      let nuevaConfig: ConfigCentroTickets = configCentro;

      if (data.config) {
        const base = crearConfigPorDefecto(usuario);
        nuevaConfig = {
          ...base,
          ...data.config,
          canales: {
            ...base.canales,
            ...(data.config.canales || {}),
          },
          tipos_activos: {
            ...base.tipos_activos,
            ...(data.config.tipos_activos || {}),
          },
          sla_minutos: {
            ...base.sla_minutos,
            ...(data.config.sla_minutos || {}),
          },
          horario_operacion: {
            ...base.horario_operacion,
            ...(data.config.horario_operacion || {}),
          },
          autoasignacion: {
            ...base.autoasignacion,
            ...(data.config.autoasignacion || {}),
          },
          notificaciones: {
            ...base.notificaciones,
            ...(data.config.notificaciones || {}),
          },
        };
      } else {
        nuevaConfig = {
          ...configCentro,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigCentro(nuevaConfig);
      setConfigOriginal(nuevaConfig);
      setMensajeConfig(
        `Configuración del centro "${nuevaConfig.nombre_centro}" guardada correctamente.`
      );
    } catch (error) {
      console.error("Error al guardar configuración del centro:", error);
      setErrorConfig(
        "Se produjo un error al guardar la configuración. Verifica la conexión."
      );
    } finally {
      setGuardandoConfig(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!configOriginal) return;
    setConfigCentro(configOriginal);
  };

  const restaurarRecomendados = () => {
    if (!usuario) return;
    const base = crearConfigPorDefecto(usuario);
    setConfigCentro(base);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorDisponibilidad = () => {
    if (disponibilidad === "disponible")
      return "bg-green-500/20 text-green-300 border-green-400/40";
    if (disponibilidad === "ocupado")
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
    return "bg-red-500/20 text-red-200 border-red-400/40";
  };

  // ========================================
  // ESTADOS ESPECIALES
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
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Configuración del Centro
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando los parámetros de tickets y canalización para tu centro...
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
            No tienes permisos para acceder a la configuración del centro técnico.
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
  // RENDER
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
                placeholder="Buscar opciones dentro de la configuración del centro..."
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
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
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

            {/* Alertas */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
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
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Alertas Activas
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
                        No tienes alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !alerta.leida ? "bg-indigo-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center ${alerta.prioridad === "critica"
                                  ? "bg-red-500/20 border border-red-400/40"
                                  : alerta.prioridad === "alta"
                                  ? "bg-orange-500/20 border border-orange-400/40"
                                  : alerta.prioridad === "media"
                                  ? "bg-yellow-500/20 border border-yellow-400/40"
                                  : "bg-emerald-500/20 border border-emerald-400/40"
                                }`}
                              >
                                <AlertCircleIcon className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {alerta.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {alerta.descripcion}
                              </p>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {alerta?.fecha_creacion
                                  ? formatearFecha(alerta.fecha_creacion)
                                  : "Sin fecha"}
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

            {/* Disponibilidad */}
            <div className="hidden lg:flex items-center gap-2">
              <span
  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${obtenerColorDisponibilidad()}`}
>
  Estado: {disponibilidad?.toUpperCase() ?? "NO DEFINIDO"}
</span>

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
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50`}
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
                      <span>Configuración del Centro</span>
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
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">🛠️</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Define cómo funciona el módulo de tickets en tu centro, sin afectar la
              configuración global del sistema.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
              >
                <Building2 className="w-3 h-3" />
                Centro actual:
                <span className={tema.colores.texto}>
                  {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
              >
                <MapPinIcon className="w-3 h-3" />
                {usuario.tecnico?.centro?.ciudad ?? "Sin ciudad"},{" "}
                {usuario.tecnico?.centro?.region ?? "Sin región"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={cargarConfiguracionCentro}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingConfig}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingConfig ? "animate-spin" : ""}`}
                />
                Recargar configuración
              </button>
              <button
                onClick={guardarConfiguracionCentro}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoConfig}
              >
                <Save className="w-4 h-4" />
                {guardandoConfig
                  ? "Guardando cambios..."
                  : "Guardar configuración del centro"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {configCentro?.ult_actualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Última actualización:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFecha(configCentro.ult_actualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  Esta configuración aún no se ha guardado en la base de datos.
                </p>
              )}
              {hayCambios && (
                <p className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Hay cambios sin guardar.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mensajes de guardado / error */}
        {(mensajeConfig || errorConfig) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 ${
              mensajeConfig
                ? "bg-emerald-500/10 border border-emerald-500/40"
                : "bg-red-500/10 border border-red-500/40"
            }`}
          >
            {mensajeConfig ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`text-sm ${
                mensajeConfig ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {mensajeConfig || errorConfig}
            </p>
          </div>
        )}

        {/* Resumen rápido del centro */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={Globe}
            titulo="Canales activos"
            valor={resumenCentro.canalesActivos}
            chip="Entradas de tickets"
            color="from-indigo-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={ClipboardList}
            titulo="Tipos de ticket"
            valor={resumenCentro.tiposActivos}
            chip="Categorías habilitadas"
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={Flame}
            titulo="SLA crítico (min)"
            valor={resumenCentro.slaCritica}
            chip="Respuesta máxima"
            color="from-red-500 to-orange-500"
          />
          <ResumenCard
            tema={tema}
            icono={Clock3}
            titulo="SLA medio (min)"
            valor={resumenCentro.slaMedia}
            chip="Incidencias normales"
            color="from-blue-500 to-indigo-500"
          />
          <ResumenCard
            tema={tema}
            icono={Target}
            titulo="Máx. tickets abiertos"
            valor={resumenCentro.maxTickets}
            chip="Autoasignación"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={Bell}
            titulo="Notificaciones activas"
            valor={resumenCentro.notificacionesActivas}
            chip="Alertas internas"
            color="from-amber-500 to-yellow-500"
          />
        </div>

        {/* Contenido principal de configuración */}
        {loadingConfig || !configCentro ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando parámetros específicos del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* ESTADO GENERAL */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Estado del módulo en este centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Habilita o restringe el uso de tickets solo para este centro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configCentro.habilitado}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev ? { ...prev, habilitado: e.target.checked } : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Habilitar módulo de tickets en este centro
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Si desmarcas esta opción, los funcionarios de este centro no
                        podrán crear nuevos tickets, pero el historial seguirá
                        disponible.
                      </p>
                    </div>
                  </label>

                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configCentro.permite_tickets_internos}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permite_tickets_internos: e.target.checked,
                                }
                              : prev
                          )
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Permitir tickets internos de funcionarios
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Funcionarios del centro (secretarías, jefaturas, etc.)
                          pueden crear tickets internos para infraestructura, TI, etc.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-emerald-500"
                        checked={configCentro.permite_tickets_pacientes}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permite_tickets_pacientes: e.target.checked,
                                }
                              : prev
                          )
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Permitir tickets originados por usuarios/pacientes
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          El centro podrá, en el futuro, recibir incidencias o
                          solicitudes de pacientes (por ejemplo sobre equipos,
                          accesos, etc.). Aún no conecta con el módulo de interacción
                          directa.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* CANALES */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Canales de recepción de tickets
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Habilita los canales por los que este centro acepta
                        incidencias.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {CANALES_DEF.map((canal) => (
                    <label
                      key={canal.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configCentro.canales[canal.id]}
                        onChange={() =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  canales: {
                                    ...prev.canales,
                                    [canal.id]: !prev.canales[canal.id],
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto} flex items-center gap-2`}
                        >
                          <canal.icon className="w-4 h-4" />
                          {canal.label}
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          {canal.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* TIPOS */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Tipos de tickets habilitados
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Define qué categorías están disponibles para este centro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {TIPOS_TICKET_DEF.map((tipo) => (
                    <label
                      key={tipo.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configCentro.tipos_activos[tipo.id]}
                        onChange={() =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  tipos_activos: {
                                    ...prev.tipos_activos,
                                    [tipo.id]: !prev.tipos_activos[tipo.id],
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto} flex items-center gap-2`}
                        >
                          <tipo.icon className="w-4 h-4" />
                          {tipo.label}
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          {tipo.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SLA + NOTIFICACIONES + AUTOASIGNACIÓN */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* SLA */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Clock3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Tiempos objetivo (SLA) por prioridad
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Define el tiempo máximo esperado de resolución en minutos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {(
                    [
                      { key: "critica", label: "Crítica", color: "text-red-400" },
                      { key: "alta", label: "Alta", color: "text-orange-400" },
                      { key: "media", label: "Media", color: "text-yellow-300" },
                      { key: "baja", label: "Baja", color: "text-emerald-300" },
                    ] as {
                      key: keyof ConfigCentroTickets["sla_minutos"];
                      label: string;
                      color: string;
                    }[]
                  ).map((sla) => (
                    <div
                      key={sla.key}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            sla.key === "critica"
                              ? "bg-red-400"
                              : sla.key === "alta"
                              ? "bg-orange-400"
                              : sla.key === "media"
                              ? "bg-yellow-300"
                              : "bg-emerald-300"
                          }`}
                        />
                        <span
                          className={`font-semibold ${tema.colores.texto} ${sla.color}`}
                        >
                          {sla.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          step={5}
                          value={configCentro.sla_minutos[sla.key]}
                          onChange={(e) => actualizarSla(sla.key, e.target.value)}
                          className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                        />
                        <span
                          className={`${tema.colores.textoSecundario} whitespace-nowrap`}
                        >
                          min
                        </span>
                      </div>
                    </div>
                  ))}

                  <p
                    className={`mt-3 text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Estos tiempos se utilizan para medir el cumplimiento de SLA a
                    nivel de centro. No modifican la lógica global del sistema, solo
                    las métricas de este establecimiento.
                  </p>
                </div>
              </div>

              {/* NOTIFICACIONES */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones internas del centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ajusta dónde y cómo se avisa sobre tickets de este centro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configCentro.notificaciones.email_resumen_diario}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  email_resumen_diario: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Enviar resumen diario por correo
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Resumen de tickets abiertos, en progreso y críticos al
                        correo configurado para el centro.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-red-500"
                      checked={configCentro.notificaciones.alerta_ticket_critico}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  alerta_ticket_critico: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Alertar de inmediato tickets críticos
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Al generarse un ticket crítico, se enviará una alerta
                        inmediata a los correos/jefaturas del centro.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configCentro.notificaciones.copia_jefatura}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  copia_jefatura: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Copia automática a jefatura
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Incluye siempre a la jefatura del centro en notificaciones
                        clave de tickets.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configCentro.notificaciones.copia_mantencion}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  copia_mantencion: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Copia al equipo de mantención comunal
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Solo afecta a este centro, para dar visibilidad al equipo
                        comunal de mantención, sin activar aún canales de atención
                        directa.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* AUTOASIGNACIÓN / HORARIO */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Autoasignación y horario del centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Controla la carga de trabajo del técnico y la ventana de
                        atención.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configCentro.autoasignacion.habilitada}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev
                            ? {
                                ...prev,
                                autoasignacion: {
                                  ...prev.autoasignacion,
                                  habilitada: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Habilitar autoasignación de tickets
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Permite que el sistema asigne automáticamente tickets a
                        técnicos disponibles de este centro según carga de trabajo.
                      </p>
                    </div>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Máximo de tickets abiertos por técnico
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={configCentro.autoasignacion.max_tickets_abiertos}
                        onChange={(e) => actualizarMaxTickets(e.target.value)}
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>tickets</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Horario operativo del centro para tickets:
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Desde
                        </span>
                        <input
                          type="time"
                          value={configCentro.horario_operacion.desde}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    horario_operacion: {
                                      ...prev.horario_operacion,
                                      desde: e.target.value,
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Hasta
                        </span>
                        <input
                          type="time"
                          value={configCentro.horario_operacion.hasta}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    horario_operacion: {
                                      ...prev.horario_operacion,
                                      hasta: e.target.value,
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configCentro.horario_operacion.permite_fuera_horario}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  horario_operacion: {
                                    ...prev.horario_operacion,
                                    permite_fuera_horario: e.target.checked,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Aceptar tickets fuera de horario
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Permite que se creen tickets fuera del horario, pero se
                          contabilizan para el siguiente día hábil del centro. Aún no
                          abre canales de atención directa con otras áreas.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* BARRA ACCIONES ABAJO */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm">
                <p className={tema.colores.textoSecundario}>
                  Esta página controla únicamente la{" "}
                  <span className={tema.colores.texto}>
                    configuración del módulo de tickets en tu centro
                  </span>
                  . No modifica la configuración general comunal ni los flujos de
                  interacción directa con el sistema o con el centro (eso se activará
                  más adelante).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={restaurarDesdeOriginal}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!hayCambios}
                >
                  Deshacer cambios
                </button>
                <button
                  onClick={restaurarRecomendados}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  Valores recomendados para este centro
                </button>
                <button
                  onClick={guardarConfiguracionCentro}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={!hayCambios || guardandoConfig}
                >
                  <Save className="w-4 h-4" />
                  {guardandoConfig ? "Guardando..." : "Guardar ahora"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <footer
          className={`transition-all duration-300 mt-10 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <p className={tema.colores.textoSecundario}>
                © 2025 AnyssaMed / INFOGES – Configuración de Centro.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Centro
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/ayuda"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
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

// ========================================
// COMPONENTE RESUMEN
// ========================================

function ResumenCard({
  tema,
  icono: Icono,
  titulo,
  valor,
  chip,
  color,
}: {
  tema: ConfiguracionTema;
  icono: any;
  titulo: string;
  valor: number;
  chip: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icono className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
        {isNaN(valor) ? 0 : valor}
      </div>
      <div
        className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
      >
        {titulo}
      </div>
      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${tema.colores.hover}`}
        >
          <ZapIcon className="w-3 h-3" />
          {chip}
        </span>
      </div>
    </div>
  );
}
