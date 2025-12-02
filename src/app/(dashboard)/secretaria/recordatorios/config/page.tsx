// src/app/(dashboard)/secretaria/recordatorios/config/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PhoneOff } from "lucide-react";

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
  };
}

interface NotificacionSecretaria {
  id_notificacion: number;
  tipo: "cita_nueva" | "cancelacion" | "urgente" | "mensaje" | "recordatorio";
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
  url_accion: string | null;
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
}

type CanalRecordatorio = "sms" | "whatsapp" | "email" | "llamada";

interface ResumenRecordatorios {
  pendientesHoy: number;
  enviadosHoy: number;
  fallidosHoy: number;
  automaticosActivos: number;
}

interface ConfiguracionRecordatorios {
  horas_antes_cita_sms: number;
  horas_antes_cita_whatsapp: number;
  horas_antes_cita_email: number;
  habilitar_sms: boolean;
  habilitar_whatsapp: boolean;
  habilitar_email: boolean;
  habilitar_llamadas_automaticas: boolean;
  dias_recordatorios_libres: number[]; // 1-7 (Lunes-Domingo)
}

interface PlantillaRecordatorio {
  id_plantilla: number;
  nombre: string;
  canal: CanalRecordatorio | "todos";
  mensaje: string;
  activo: boolean;
}

type ConfigBooleanKey =
  | "habilitar_sms"
  | "habilitar_whatsapp"
  | "habilitar_email"
  | "habilitar_llamadas_automaticas";

type ConfigHorasKey =
  | "horas_antes_cita_sms"
  | "horas_antes_cita_whatsapp"
  | "horas_antes_cita_email";

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
// DATOS DEMO
// ========================================

const CONFIG_RECORDATORIOS_DEFAULT: ConfiguracionRecordatorios = {
  horas_antes_cita_sms: 24,
  horas_antes_cita_whatsapp: 12,
  horas_antes_cita_email: 48,
  habilitar_sms: true,
  habilitar_whatsapp: true,
  habilitar_email: true,
  habilitar_llamadas_automaticas: false,
  dias_recordatorios_libres: [1, 2, 3, 4, 5], // Lunes a Viernes
};

const PLANTILLAS_POR_DEFECTO: PlantillaRecordatorio[] = [
  {
    id_plantilla: 1,
    nombre: "Cita médica estándar",
    canal: "whatsapp",
    mensaje:
      "👩‍⚕️ *Recordatorio de cita*:\nMañana tienes una atención en tu centro de salud. Por favor llega 10 minutos antes y trae tu carnet de identidad.",
    activo: true,
  },
  {
    id_plantilla: 2,
    nombre: "Control crónico",
    canal: "sms",
    mensaje:
      "Recordatorio: control de tu enfermedad crónica en el CESFAM. Si no puedes asistir, avisa llamando al centro.",
    activo: true,
  },
  {
    id_plantilla: 3,
    nombre: "Telemedicina",
    canal: "email",
    mensaje:
      "Recordatorio de tu consulta de telemedicina. Revisa el enlace enviado y conéctate 5 minutos antes de la hora.",
    activo: true,
  },
];

// ========================================
// UTILIDADES
// ========================================

function resolverCentroAsignado(usuario: any) {
  if (!usuario) return "Centro no asignado";

  if (usuario.secretaria?.centro?.nombre) {
    return usuario.secretaria.centro.nombre;
  }
  if (usuario.medico?.centro?.nombre) {
    return usuario.medico.centro.nombre;
  }
  if (usuario.administrativo?.centro?.nombre) {
    return usuario.administrativo.centro.nombre;
  }
  if (usuario.tecnico?.centro?.nombre) {
    return usuario.tecnico.centro.nombre;
  }
  if (usuario.profesional_salud?.centro?.nombre) {
    return usuario.profesional_salud.centro.nombre;
  }
  if (usuario.centro?.nombre) {
    return usuario.centro.nombre;
  }

  return "Centro no asignado";
}

const obtenerSaludo = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
};

const etiquetaCanal = (canal: CanalRecordatorio | "todos") => {
  if (canal === "todos") return "Todos los canales";
  if (canal === "whatsapp") return "WhatsApp";
  if (canal === "sms") return "SMS";
  if (canal === "email") return "Email";
  return "Llamada";
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function RecordatoriosConfigSecretariaPage() {
  // Sesión / usuario
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Tema
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // UI global
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>(
    []
  );

  // Config / resumen
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [resumenRecordatorios, setResumenRecordatorios] =
    useState<ResumenRecordatorios | null>(null);
  const [configuracionRecordatorios, setConfiguracionRecordatorios] =
    useState<ConfiguracionRecordatorios>(CONFIG_RECORDATORIOS_DEFAULT);
  const [plantillas, setPlantillas] =
    useState<PlantillaRecordatorio[]>(PLANTILLAS_POR_DEFECTO);

  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  // Plantillas - edición
  const [plantillaEnEdicion, setPlantillaEnEdicion] =
    useState<PlantillaRecordatorio | null>(null);

  const [formPlantillaNombre, setFormPlantillaNombre] = useState("");
  const [formPlantillaCanal, setFormPlantillaCanal] = useState<
    CanalRecordatorio | "todos"
  >("whatsapp");
  const [formPlantillaMensaje, setFormPlantillaMensaje] = useState("");
  const [formPlantillaActiva, setFormPlantillaActiva] = useState(true);

  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);

  // Menú de navegación
  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/secretaria",
    },
    {
      titulo: "Agenda",
      icono: Calendar,
      url: "/secretaria/agenda",
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        {
          titulo: "Nueva Cita",
          icono: CalendarPlus,
          url: "/secretaria/agenda/nueva",
        },
        {
          titulo: "Búsqueda Citas",
          icono: Search,
          url: "/secretaria/agenda/buscar",
        },
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
      url: "/secretaria/confirmaciones",
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "/secretaria/llamadas",
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "/secretaria/pacientes",
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
      url: "/secretaria/medicos",
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
      url: "/secretaria/recordatorios",
      badge: resumenRecordatorios?.pendientesHoy || 0,
      activo: true,
      submenu: [
        {
          titulo: "Programados",
          icono: Clock,
          url: "/secretaria/recordatorios",
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
      url: "/secretaria/documentos",
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "/secretaria/mensajes",
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "/secretaria/telemedicina",
    },
    {
      titulo: "Tareas",
      icono: CheckSquare,
      url: "/secretaria/tareas",
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "/secretaria/reportes",
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "/secretaria/perfil",
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "/secretaria/configuracion",
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
      cargarConfigRecordatorios();
      cargarNotificaciones();
    }
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
      } catch (error) {
        console.error("No se pudo cargar la preferencia de tema:", error);
      }
    };
    cargarPreferenciaTema();
  }, []);

  // ========================================
  // FUNCIONES - CARGA DE DATOS
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
            `Acceso denegado. Este módulo es solo para secretarias. Tus roles: ${rolesUsuario.join(
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
      setLoading(false);
    }
  };

  const cargarConfigRecordatorios = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingConfig(true);

      const res = await fetch(
        `/api/secretaria/recordatorios/dashboard?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setResumenRecordatorios(
          data.resumen || {
            pendientesHoy: data.pendientes_hoy || 0,
            enviadosHoy: data.enviados_hoy || 0,
            fallidosHoy: data.fallidos_hoy || 0,
            automaticosActivos: data.automaticos_activos || 0,
          }
        );
        setConfiguracionRecordatorios(
          data.configuracion || CONFIG_RECORDATORIOS_DEFAULT
        );
        setPlantillas(data.plantillas || PLANTILLAS_POR_DEFECTO);
      } else {
        setResumenRecordatorios({
          pendientesHoy: 0,
          enviadosHoy: 0,
          fallidosHoy: 0,
          automaticosActivos: 0,
        });
        setConfiguracionRecordatorios(CONFIG_RECORDATORIOS_DEFAULT);
        setPlantillas(PLANTILLAS_POR_DEFECTO);
      }
    } catch (error) {
      console.error("Error al cargar configuración de recordatorios:", error);
      setResumenRecordatorios({
        pendientesHoy: 0,
        enviadosHoy: 0,
        fallidosHoy: 0,
        automaticosActivos: 0,
      });
      setConfiguracionRecordatorios(CONFIG_RECORDATORIOS_DEFAULT);
      setPlantillas(PLANTILLAS_POR_DEFECTO);
    } finally {
      setLoadingConfig(false);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      const res = await fetch(
        "/api/secretaria/notificaciones?limit=10&solo_no_leidas=1",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && Array.isArray(data.notificaciones)) {
        setNotificaciones(data.notificaciones);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  // ========================================
  // FUNCIONES - ACCIONES
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
    } catch (error) {
      console.error("No se pudo guardar preferencia en BD:", error);
    }
  };

  const marcarNotificacionLeida = async (idNotificacion: number) => {
    try {
      await fetch(
        `/api/secretaria/notificaciones/${idNotificacion}/leer`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif.id_notificacion === idNotificacion
            ? { ...notif, leida: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const marcarTodasNotificacionesLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const toggleConfigBoolean = async (campo: ConfigBooleanKey) => {
    const nuevaConfiguracion: ConfiguracionRecordatorios = {
      ...configuracionRecordatorios,
      [campo]: !configuracionRecordatorios[campo],
    };

    setConfiguracionRecordatorios(nuevaConfiguracion);
    setGuardandoConfig(true);

    try {
      await fetch("/api/secretaria/recordatorios/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaConfiguracion),
      });
    } catch (error) {
      console.error("No se pudo guardar configuración:", error);
    } finally {
      setGuardandoConfig(false);
    }
  };

  const actualizarHorasAntes = async (
    campo: ConfigHorasKey,
    valor: number
  ) => {
    if (Number.isNaN(valor) || valor < 0) return;

    const nuevaConfiguracion: ConfiguracionRecordatorios = {
      ...configuracionRecordatorios,
      [campo]: valor,
    };

    setConfiguracionRecordatorios(nuevaConfiguracion);
    setGuardandoConfig(true);

    try {
      await fetch("/api/secretaria/recordatorios/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaConfiguracion),
      });
    } catch (error) {
      console.error("No se pudo guardar configuración:", error);
    } finally {
      setGuardandoConfig(false);
    }
  };

  const toggleDiaRecordatorio = async (diaNumero: number) => {
    const existe =
      configuracionRecordatorios.dias_recordatorios_libres.includes(
        diaNumero
      );

    const nuevosDias = existe
      ? configuracionRecordatorios.dias_recordatorios_libres.filter(
          (d) => d !== diaNumero
        )
      : [...configuracionRecordatorios.dias_recordatorios_libres, diaNumero];

    const nuevaConfiguracion: ConfiguracionRecordatorios = {
      ...configuracionRecordatorios,
      dias_recordatorios_libres: nuevosDias.sort((a, b) => a - b),
    };

    setConfiguracionRecordatorios(nuevaConfiguracion);
    setGuardandoConfig(true);

    try {
      await fetch("/api/secretaria/recordatorios/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaConfiguracion),
      });
    } catch (error) {
      console.error("No se pudo guardar configuración de días:", error);
    } finally {
      setGuardandoConfig(false);
    }
  };

  // Plantillas

  const limpiarFormularioPlantilla = () => {
    setPlantillaEnEdicion(null);
    setFormPlantillaNombre("");
    setFormPlantillaCanal("whatsapp");
    setFormPlantillaMensaje("");
    setFormPlantillaActiva(true);
  };

  const cargarPlantillaEnFormulario = (plantilla: PlantillaRecordatorio) => {
    setPlantillaEnEdicion(plantilla);
    setFormPlantillaNombre(plantilla.nombre);
    setFormPlantillaCanal(plantilla.canal);
    setFormPlantillaMensaje(plantilla.mensaje);
    setFormPlantillaActiva(plantilla.activo);
  };

  const guardarPlantilla = async (e: any) => {
    e.preventDefault();
    if (!formPlantillaNombre || !formPlantillaMensaje) {
      alert("Completa nombre y mensaje de la plantilla.");
      return;
    }

    const payload = {
      nombre: formPlantillaNombre,
      canal: formPlantillaCanal,
      mensaje: formPlantillaMensaje,
      activo: formPlantillaActiva,
    };

    setGuardandoPlantilla(true);

    try {
      let response;
      let data;

      if (plantillaEnEdicion) {
        response = await fetch(
          `/api/secretaria/recordatorios/plantillas/${plantillaEnEdicion.id_plantilla}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        data = await response.json().catch(() => ({}));

        if (!response.ok) {
          alert(data.message || "No se pudo actualizar la plantilla.");
          return;
        }

        setPlantillas((prev) =>
          prev.map((p) =>
            p.id_plantilla === plantillaEnEdicion.id_plantilla
              ? { ...p, ...payload }
              : p
          )
        );
      } else {
        response = await fetch(
          "/api/secretaria/recordatorios/plantillas",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        data = await response.json().catch(() => ({}));

        if (!response.ok) {
          alert(data.message || "No se pudo crear la plantilla.");
          return;
        }

        const nuevaPlantilla: PlantillaRecordatorio =
          data.plantilla || {
            id_plantilla: Date.now(),
            ...payload,
          };

        setPlantillas((prev) => [nuevaPlantilla, ...prev]);
      }

      limpiarFormularioPlantilla();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      alert("Ocurrió un error al guardar la plantilla.");
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const cambiarEstadoPlantilla = async (plantilla: PlantillaRecordatorio) => {
    const nuevoEstado = !plantilla.activo;
    setPlantillas((prev) =>
      prev.map((p) =>
        p.id_plantilla === plantilla.id_plantilla
          ? { ...p, activo: nuevoEstado }
          : p
      )
    );

    try {
      await fetch(
        `/api/secretaria/recordatorios/plantillas/${plantilla.id_plantilla}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ activo: nuevoEstado }),
        }
      );
    } catch (error) {
      console.error("No se pudo actualizar estado de plantilla:", error);
    }
  };

  const duplicarPlantilla = async (plantilla: PlantillaRecordatorio) => {
    const copiaBase = {
      nombre: `${plantilla.nombre} (copia)`,
      canal: plantilla.canal,
      mensaje: plantilla.mensaje,
      activo: plantilla.activo,
    };

    setGuardandoPlantilla(true);

    try {
      const response = await fetch(
        "/api/secretaria/recordatorios/plantillas",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(copiaBase),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.message || "No se pudo duplicar la plantilla.");
        return;
      }

      const nueva: PlantillaRecordatorio =
        data.plantilla || {
          id_plantilla: Date.now(),
          ...copiaBase,
        };

      setPlantillas((prev) => [nueva, ...prev]);
    } catch (error) {
      console.error("Error al duplicar plantilla:", error);
      alert("Ocurrió un error al duplicar la plantilla.");
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const eliminarPlantilla = async (plantilla: PlantillaRecordatorio) => {
    if (
      !confirm(
        `¿Eliminar la plantilla "${plantilla.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setPlantillas((prev) =>
      prev.filter((p) => p.id_plantilla !== plantilla.id_plantilla)
    );

    try {
      await fetch(
        `/api/secretaria/recordatorios/plantillas/${plantilla.id_plantilla}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("No se pudo eliminar plantilla:", error);
    }
  };

  const iconoCanal = (canal: CanalRecordatorio | "todos") => {
    if (canal === "sms") return <Phone className="w-4 h-4" />;
    if (canal === "whatsapp") return <MessageSquare className="w-4 h-4" />;
    if (canal === "email") return <Mail className="w-4 h-4" />;
    if (canal === "llamada") return <PhoneCall className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const obtenerColorChipDia = (activo: boolean) => {
    return activo
      ? "bg-indigo-500 text-white border-indigo-400"
      : `${tema.colores.card} ${tema.colores.textoSecundario}`;
  };

  // ========================================
  // RENDER - ESTADOS ESPECIALES
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando configuración de recordatorios
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Ajustando tus reglas automáticas y plantillas…
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
            No tienes permisos para acceder al módulo de configuración de
            recordatorios.
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
  // RENDER COMPLETO
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${
          tema.colores.sombra
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p
                    className={`text-xs font-semibold ${tema.colores.acento}`}
                  >
                    Recordatorios Inteligentes
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Bell className="w-6 h-6 text-white" />
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
            {menuItems.map((item, index) => (
              <div key={index} className="mb-1">
                <Link
                  href={item.url}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                    item.activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  onClick={() => {
                    if (item.submenu) {
                      setMenuExpandido(
                        menuExpandido === item.titulo ? null : item.titulo
                      );
                    }
                  }}
                  onMouseEnter={() => item.submenu && setSidebarAbierto(true)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icono
                      className={`w-5 h-5 flex-shrink-0 ${
                        item.activo ? "text-white" : tema.colores.acento
                      }`}
                    />
                    {sidebarAbierto && (
                      <span className="truncate">{item.titulo}</span>
                    )}
                  </div>

                  {sidebarAbierto && item.badge && item.badge > 0 && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.activo
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
                </Link>

                {sidebarAbierto &&
                  item.submenu &&
                  menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          href={subitem.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                        >
                          <subitem.icono className="w-4 h-4" />
                          <span>{subitem.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </nav>

          {/* Usuario bottom */}
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
                    Secretaria · {resolverCentroAsignado(usuario)}
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
        } ${tema.colores.header} ${tema.colores.borde} border-b ${
          tema.colores.sombra
        }`}
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
                placeholder="Buscar plantilla, canal o texto del mensaje..."
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

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
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
                        onClick={marcarTodasNotificacionesLeidas}
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
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
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes notificaciones nuevas.
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {notificaciones.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !notif.leida ? "bg-indigo-500/5" : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-500/10 border border-indigo-400/40">
                              <Bell className="w-5 h-5 text-indigo-300" />
                            </div>
                            <div className="flex-1 min-w-0">
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
                                {new Intl.DateTimeFormat("es-CL", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(new Date(notif.fecha_hora))}
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

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Título y resumen */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <Settings className="w-8 h-8 text-indigo-400" />
              </h2>
              <p
                className={`text-lg lg:text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Configura cómo, cuándo y por qué canal se enviarán los
                recordatorios.
              </p>
              <p
                className={`text-sm mt-1 ${tema.colores.textoSecundario} opacity-80`}
              >
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {resolverCentroAsignado(usuario)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={cargarConfigRecordatorios}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    loadingConfig ? "animate-spin" : ""
                  }`}
                />
                Actualizar configuración
              </button>
              <Link
                href="/secretaria/recordatorios"
                className={`flex items-center gap-2 px-5 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-semibold transition-all duration-300 hover:scale-105`}
              >
                <Bell className="w-4 h-4" />
                Ver recordatorios
              </Link>
            </div>
          </div>

          {resumenRecordatorios && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase ${tema.colores.textoSecundario}`}
                  >
                    Pendientes hoy
                  </span>
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <p
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {resumenRecordatorios.pendientesHoy}
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase ${tema.colores.textoSecundario}`}
                  >
                    Enviados hoy
                  </span>
                  <Send className="w-4 h-4 text-emerald-400" />
                </div>
                <p
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {resumenRecordatorios.enviadosHoy}
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase ${tema.colores.textoSecundario}`}
                  >
                    Fallidos hoy
                  </span>
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                </div>
                <p
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {resumenRecordatorios.fallidosHoy}
                </p>
              </div>
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase ${tema.colores.textoSecundario}`}
                  >
                    Flujos automáticos
                  </span>
                  <BrainCircuit className="w-4 h-4 text-indigo-300" />
                </div>
                <p
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {resumenRecordatorios.automaticosActivos}
                </p>
              </div>
            </div>
          )}
        </div>

        {loadingConfig ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando reglas automáticas y plantillas...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* CONFIG + PLANTILLAS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
              {/* Configuración automática */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Flujos automáticos de recordatorios
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Define cada cuántas horas y por qué canales se avisará a
                        los pacientes.
                      </p>
                    </div>
                  </div>
                  {guardandoConfig && (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando…
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* WhatsApp */}
                  <div
                    className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
                          <MessageSquare className="w-4 h-4 text-emerald-300" />
                        </div>
                        <span
                          className={`font-semibold ${tema.colores.texto}`}
                        >
                          WhatsApp antes de la cita
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          toggleConfigBoolean("habilitar_whatsapp")
                        }
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          configuracionRecordatorios.habilitar_whatsapp
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-500/30 text-gray-200"
                        }`}
                      >
                        {configuracionRecordatorios.habilitar_whatsapp
                          ? "ACTIVO"
                          : "INACTIVO"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className={tema.colores.textoSecundario}>
                        Enviar
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={
                          configuracionRecordatorios.horas_antes_cita_whatsapp
                        }
                        onChange={(e) =>
                          actualizarHorasAntes(
                            "horas_antes_cita_whatsapp",
                            Number(e.target.value)
                          )
                        }
                        className={`w-16 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>
                        horas antes.
                      </span>
                    </div>
                  </div>

                  {/* SMS */}
                  <div
                    className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-400/40">
                          <Phone className="w-4 h-4 text-amber-300" />
                        </div>
                        <span
                          className={`font-semibold ${tema.colores.texto}`}
                        >
                          SMS antes de la cita
                        </span>
                      </div>
                      <button
                        onClick={() => toggleConfigBoolean("habilitar_sms")}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          configuracionRecordatorios.habilitar_sms
                            ? "bg-amber-500 text-white"
                            : "bg-gray-500/30 text-gray-200"
                        }`}
                      >
                        {configuracionRecordatorios.habilitar_sms
                          ? "ACTIVO"
                          : "INACTIVO"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className={tema.colores.textoSecundario}>
                        Enviar
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={
                          configuracionRecordatorios.horas_antes_cita_sms
                        }
                        onChange={(e) =>
                          actualizarHorasAntes(
                            "horas_antes_cita_sms",
                            Number(e.target.value)
                          )
                        }
                        className={`w-16 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>
                        horas antes.
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div
                    className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center border border-sky-400/40">
                          <Mail className="w-4 h-4 text-sky-300" />
                        </div>
                        <span
                          className={`font-semibold ${tema.colores.texto}`}
                        >
                          Email antes de la cita
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          toggleConfigBoolean("habilitar_email")
                        }
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          configuracionRecordatorios.habilitar_email
                            ? "bg-sky-500 text-white"
                            : "bg-gray-500/30 text-gray-200"
                        }`}
                      >
                        {configuracionRecordatorios.habilitar_email
                          ? "ACTIVO"
                          : "INACTIVO"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className={tema.colores.textoSecundario}>
                        Enviar
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={
                          configuracionRecordatorios.horas_antes_cita_email
                        }
                        onChange={(e) =>
                          actualizarHorasAntes(
                            "horas_antes_cita_email",
                            Number(e.target.value)
                          )
                        }
                        className={`w-16 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>
                        horas antes.
                      </span>
                    </div>
                  </div>

                  {/* Llamadas automáticas */}
                  <div
                    className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-400/40">
                          <PhoneCall className="w-4 h-4 text-violet-300" />
                        </div>
                        <span
                          className={`font-semibold ${tema.colores.texto}`}
                        >
                          Llamadas automáticas
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          toggleConfigBoolean(
                            "habilitar_llamadas_automaticas"
                          )
                        }
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          configuracionRecordatorios.habilitar_llamadas_automaticas
                            ? "bg-violet-500 text-white"
                            : "bg-gray-500/30 text-gray-200"
                        }`}
                      >
                        {configuracionRecordatorios.habilitar_llamadas_automaticas
                          ? "ACTIVO"
                          : "INACTIVO"}
                      </button>
                    </div>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Para resultados críticos o urgentes, el sistema puede
                      marcar automáticamente para que la secretaria contacte al
                      paciente.
                    </p>
                  </div>
                </div>

                {/* Días hábiles */}
                <div
                  className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <p
                    className={`text-xs font-semibold mb-3 ${tema.colores.textoSecundario}`}
                  >
                    Días hábiles para enviar recordatorios:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {["L", "M", "X", "J", "V", "S", "D"].map((dia, index) => {
                      const numero = index + 1;
                      const activo =
                        configuracionRecordatorios.dias_recordatorios_libres.includes(
                          numero
                        );
                      return (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => toggleDiaRecordatorio(numero)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${obtenerColorChipDia(
                            activo
                          )} transition-all duration-200 hover:scale-105`}
                        >
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                  <p
                    className={`text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Solo se enviarán recordatorios en los días marcados. Útil
                    para no molestar fines de semana o festivos.
                  </p>
                </div>
              </div>

              {/* Plantillas */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Plantillas de mensajes
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Diseña mensajes estándar para cada canal.
                      </p>
                    </div>
                  </div>
                  {guardandoPlantilla && (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  )}
                </div>

                {/* Lista de plantillas */}
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1 mb-4">
                  {plantillas
                    .filter((p) => {
                      if (!busqueda) return true;
                      const q = busqueda.toLowerCase();
                      return (
                        p.nombre.toLowerCase().includes(q) ||
                        p.mensaje.toLowerCase().includes(q) ||
                        etiquetaCanal(p.canal).toLowerCase().includes(q)
                      );
                    })
                    .map((p) => (
                      <div
                        key={p.id_plantilla}
                        className={`flex items-start gap-3 p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition-all duration-200`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                            p.activo
                              ? "border-emerald-400/60 bg-emerald-500/10"
                              : "border-gray-500/40 bg-gray-500/10"
                          }`}
                        >
                          {iconoCanal(p.canal)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p
                              className={`text-sm font-bold truncate ${tema.colores.texto}`}
                            >
                              {p.nombre}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                p.activo
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                                  : "bg-gray-500/20 text-gray-200 border border-gray-400/40"
                              }`}
                            >
                              {p.activo ? "ACTIVA" : "INACTIVA"}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mb-1 ${tema.colores.textoSecundario}`}
                          >
                            Canal: {etiquetaCanal(p.canal)}
                          </p>
                          <p
                            className={`text-[11px] line-clamp-2 ${tema.colores.textoSecundario}`}
                          >
                            {p.mensaje}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            <button
                              type="button"
                              onClick={() => cargarPlantillaEnFormulario(p)}
                              className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 hover:bg-indigo-500/30"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicarPlantilla(p)}
                              className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40 hover:bg-sky-500/30"
                            >
                              Duplicar
                            </button>
                            <button
                              type="button"
                              onClick={() => cambiarEstadoPlantilla(p)}
                              className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-100 border border-amber-400/40 hover:bg-amber-500/30"
                            >
                              {p.activo ? "Desactivar" : "Activar"}
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarPlantilla(p)}
                              className="px-3 py-1 rounded-full bg-red-500/20 text-red-100 border border-red-400/40 hover:bg-red-500/30"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {plantillas.length === 0 && (
                    <div className="text-center py-10">
                      <MessageSquare
                        className={`w-8 h-8 mx-auto mb-2 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        Aún no tienes plantillas creadas. Crea la primera abajo.
                      </p>
                    </div>
                  )}
                </div>

                {/* Formulario plantilla */}
                <div
                  className={`mt-4 pt-4 border-t ${tema.colores.borde}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className={`text-sm font-bold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                    >
                      {plantillaEnEdicion
                        ? "Editar plantilla"
                        : "Nueva plantilla"}
                    </h4>
                    {plantillaEnEdicion && (
                      <button
                        type="button"
                        onClick={limpiarFormularioPlantilla}
                        className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <form className="space-y-3" onSubmit={guardarPlantilla}>
                    <div>
                      <label
                        className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Nombre de la plantilla
                      </label>
                      <input
                        type="text"
                        value={formPlantillaNombre}
                        onChange={(e) =>
                          setFormPlantillaNombre(e.target.value)
                        }
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                        placeholder="Ej: Recordatorio control crónico"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label
                          className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                        >
                          Canal
                        </label>
                        <select
                          value={formPlantillaCanal}
                          onChange={(e) =>
                            setFormPlantillaCanal(
                              e.target.value as CanalRecordatorio | "todos"
                            )
                          }
                          className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                          <option value="email">Email</option>
                          <option value="llamada">Llamada</option>
                          <option value="todos">Todos los canales</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-[11px] font-semibold mt-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formPlantillaActiva}
                            onChange={(e) =>
                              setFormPlantillaActiva(e.target.checked)
                            }
                            className="w-3 h-3"
                          />
                          <span className={tema.colores.textoSecundario}>
                            Activa
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label
                        className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Mensaje
                      </label>
                      <textarea
                        value={formPlantillaMensaje}
                        onChange={(e) =>
                          setFormPlantillaMensaje(e.target.value)
                        }
                        rows={4}
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                        placeholder="Texto que recibirá el paciente..."
                      />
                    </div>

                    {/* Vista previa rápida */}
                    <div
                      className={`rounded-2xl p-3 border ${tema.colores.borde} ${tema.colores.card}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border border-indigo-400/50 bg-indigo-500/10`}
                          >
                            {iconoCanal(formPlantillaCanal)}
                          </div>
                          <span
                            className={`text-xs font-semibold ${tema.colores.texto}`}
                          >
                            Vista previa ({etiquetaCanal(formPlantillaCanal)})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                        >
                          Ejemplo de cómo lo verá el paciente
                        </span>
                      </div>
                      <div
                        className={`mt-1 rounded-xl px-3 py-2 text-[11px] ${tema.colores.fondoSecundario} ${tema.colores.textoSecundario}`}
                      >
                        {formPlantillaMensaje ||
                          "Aquí se mostrará tu mensaje de plantilla..."}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="submit"
                        disabled={guardandoPlantilla}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs text-white transition-all duration-300 hover:scale-105 ${
                          guardandoPlantilla
                            ? "bg-gray-500 cursor-not-allowed"
                            : tema.colores.primario
                        } ${tema.colores.sombra}`}
                      >
                        {guardandoPlantilla ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {plantillaEnEdicion ? "Actualizar plantilla" : "Crear plantilla"}
                      </button>
                      <p
                        className={`text-[10px] ${tema.colores.textoSecundario} max-w-[160px] text-right`}
                      >
                        Estas plantillas estarán disponibles al programar nuevos
                        recordatorios.
                      </p>
                    </div>
                  </form>
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
                © 2025 AnyssaMed. Configuración de Recordatorios.
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
