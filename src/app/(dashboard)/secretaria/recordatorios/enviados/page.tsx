// src/app/(dashboard)/secretaria/recordatorios/enviados/page.tsx
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
type EstadoRecordatorio =
  | "pendiente"
  | "programado"
  | "enviado"
  | "fallido"
  | "cancelado";
type PrioridadRecordatorio = "baja" | "media" | "alta" | "urgente";

interface Recordatorio {
  id_recordatorio: number;
  id_cita: number | null;
  id_paciente: number;
  paciente_nombre: string;
  paciente_telefono: string | null;
  paciente_celular: string | null;
  paciente_email: string | null;
  canal: CanalRecordatorio;
  estado: EstadoRecordatorio;
  prioridad: PrioridadRecordatorio;
  fecha_hora_envio: string;
  mensaje_resumen: string;
  intentos: number;
  ultimo_intento: string | null;
  creado_por: string;
  via_automatico: boolean;
}

interface ResumenEnviados {
  enviadosHoy: number;
  fallidosHoy: number;
  tasaExito: number;
}

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

const RECORDATORIOS_ENVIADOS_DEMO: Recordatorio[] = [
  {
    id_recordatorio: 101,
    id_cita: 5001,
    id_paciente: 9001,
    paciente_nombre: "Juan Pérez",
    paciente_telefono: "752345678",
    paciente_celular: "+56 9 1234 5678",
    paciente_email: "juan.perez@example.com",
    canal: "whatsapp",
    estado: "enviado",
    prioridad: "alta",
    fecha_hora_envio: new Date(
      new Date().getTime() - 1 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Recordatorio enviado para control médico hoy a las 09:00 en CESFAM Colón.",
    intentos: 1,
    ultimo_intento: new Date(
      new Date().getTime() - 1 * 60 * 60 * 1000
    ).toISOString(),
    creado_por: "Sistema automático",
    via_automatico: true,
  },
  {
    id_recordatorio: 102,
    id_cita: 5002,
    id_paciente: 9002,
    paciente_nombre: "María González",
    paciente_telefono: null,
    paciente_celular: "+56 9 2222 3333",
    paciente_email: "maria.gonzalez@example.com",
    canal: "sms",
    estado: "enviado",
    prioridad: "media",
    fecha_hora_envio: new Date(
      new Date().getTime() - 3 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Recordatorio enviado para control de enfermería hoy a las 16:00 en CESFAM Sarmiento.",
    intentos: 1,
    ultimo_intento: new Date(
      new Date().getTime() - 3 * 60 * 60 * 1000
    ).toISOString(),
    creado_por: "Secretaria Ana",
    via_automatico: true,
  },
  {
    id_recordatorio: 103,
    id_cita: 5003,
    id_paciente: 9003,
    paciente_nombre: "Pedro Lagos",
    paciente_telefono: "752987654",
    paciente_celular: null,
    paciente_email: "pedro.lagos@example.com",
    canal: "email",
    estado: "enviado",
    prioridad: "baja",
    fecha_hora_envio: new Date(
      new Date().getTime() - 26 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Recordatorio enviado para control odontológico mañana 10:30.",
    intentos: 1,
    ultimo_intento: new Date(
      new Date().getTime() - 26 * 60 * 60 * 1000
    ).toISOString(),
    creado_por: "Sistema automático",
    via_automatico: true,
  },
  {
    id_recordatorio: 104,
    id_cita: 5004,
    id_paciente: 9004,
    paciente_nombre: "Lucía Ramírez",
    paciente_telefono: null,
    paciente_celular: "+56 9 8888 9999",
    paciente_email: null,
    canal: "llamada",
    estado: "fallido",
    prioridad: "urgente",
    fecha_hora_envio: new Date(
      new Date().getTime() - 2 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Llamada automática para resultado de examen crítico. No se logró contactar.",
    intentos: 3,
    ultimo_intento: new Date(
      new Date().getTime() - 30 * 60 * 1000
    ).toISOString(),
    creado_por: "Sistema automático",
    via_automatico: true,
  },
];

// ========================================
// FUNCIONES AUXILIARES COMUNES
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

const calcularResumenEnviados = (
  lista: Recordatorio[]
): ResumenEnviados => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let enviadosHoy = 0;
  let fallidosHoy = 0;

  lista.forEach((r) => {
    const f = new Date(r.fecha_hora_envio);
    const fs = new Date(f);
    fs.setHours(0, 0, 0, 0);

    if (fs.getTime() === hoy.getTime()) {
      if (r.estado === "enviado") enviadosHoy++;
      if (r.estado === "fallido") fallidosHoy++;
    }
  });

  const totalHoy = enviadosHoy + fallidosHoy;
  const tasaExito = totalHoy
    ? Math.round((enviadosHoy / totalHoy) * 100)
    : 0;

  return { enviadosHoy, fallidosHoy, tasaExito };
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function RecordatoriosEnviadosSecretariaPage() {
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
  const [notificaciones, setNotificaciones] = useState<
    NotificacionSecretaria[]
  >([]);

  // Datos de enviados
  const [loadingData, setLoadingData] = useState(true);
  const [resumenEnviados, setResumenEnviados] =
    useState<ResumenEnviados | null>(null);
  const [recordatoriosEnviados, setRecordatoriosEnviados] = useState<
    Recordatorio[]
  >([]);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroCanal, setFiltroCanal] = useState<string>("todos");
  const [filtroRangoFecha, setFiltroRangoFecha] =
    useState<string>("hoy");
  const [filtroPrioridad, setFiltroPrioridad] =
    useState<string>("todas");

  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

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
      badge: resumenEnviados?.enviadosHoy || 0,
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
      cargarRecordatoriosEnviados();
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

  const cargarRecordatoriosEnviados = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingData(true);

      const res = await fetch(
        `/api/secretaria/recordatorios/enviados?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const lista: Recordatorio[] =
          data.recordatorios_enviados ||
          data.recordatorios ||
          RECORDATORIOS_ENVIADOS_DEMO;

        setRecordatoriosEnviados(lista);

        if (data.resumen_enviados || data.resumen) {
          const r = data.resumen_enviados || data.resumen;
          setResumenEnviados({
            enviadosHoy: r.enviadosHoy ?? r.enviados_hoy ?? 0,
            fallidosHoy: r.fallidosHoy ?? r.fallidos_hoy ?? 0,
            tasaExito: r.tasaExito ?? r.tasa_exito ?? 0,
          });
        } else {
          setResumenEnviados(calcularResumenEnviados(lista));
        }
      } else {
        // Fallback demo
        setRecordatoriosEnviados(RECORDATORIOS_ENVIADOS_DEMO);
        setResumenEnviados(
          calcularResumenEnviados(RECORDATORIOS_ENVIADOS_DEMO)
        );
      }
    } catch (error) {
      console.error("Error al cargar recordatorios enviados:", error);
      setRecordatoriosEnviados(RECORDATORIOS_ENVIADOS_DEMO);
      setResumenEnviados(
        calcularResumenEnviados(RECORDATORIOS_ENVIADOS_DEMO)
      );
    } finally {
      setLoadingData(false);
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

  // ========================================
  // FUNCIONES AUXILIARES DE UI
  // ========================================

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatearHora = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const obtenerColorEstadoRecordatorio = (estado: EstadoRecordatorio) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    const colores: Record<EstadoRecordatorio, string> = {
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      programado: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
        : "bg-blue-100 text-blue-800 border-blue-200",
      enviado: isDark
        ? "bg-green-500/20 text-green-300 border-green-500/40"
        : "bg-green-100 text-green-800 border-green-200",
      fallido: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/40"
        : "bg-red-100 text-red-800 border-red-200",
      cancelado: isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200",
    };

    return colores[estado];
  };

  const obtenerColorCanal = (canal: CanalRecordatorio) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    const base: Record<CanalRecordatorio, string> = {
      sms: isDark
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-amber-100 text-amber-800 border-amber-200",
      whatsapp: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      email: isDark
        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
        : "bg-sky-100 text-sky-800 border-sky-200",
      llamada: isDark
        ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
        : "bg-violet-100 text-violet-800 border-violet-200",
    };

    return base[canal];
  };

  const obtenerColorPrioridad = (prioridad: PrioridadRecordatorio | string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const p = prioridad.toLowerCase();

    const colores: Record<string, string> = {
      urgente: isDark
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
      colores[p] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const iconoCanal = (canal: CanalRecordatorio) => {
    if (canal === "sms") return <Phone className="w-4 h-4" />;
    if (canal === "whatsapp") return <MessageSquare className="w-4 h-4" />;
    if (canal === "email") return <Mail className="w-4 h-4" />;
    return <PhoneCall className="w-4 h-4" />;
  };

  // ========================================
  // DERIVADOS / MEMOS
  // ========================================

  const recordatoriosFiltrados = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const msDia = 1000 * 60 * 60 * 24;

    return recordatoriosEnviados.filter((r) => {
      if (filtroEstado !== "todos" && r.estado !== filtroEstado)
        return false;

      if (filtroCanal !== "todos" && r.canal !== filtroCanal) return false;

      if (
        filtroPrioridad !== "todas" &&
        r.prioridad !== filtroPrioridad
      ) {
        return false;
      }

      if (filtroRangoFecha !== "todos") {
        const fecha = new Date(r.fecha_hora_envio);
        const f = new Date(fecha);
        f.setHours(0, 0, 0, 0);

        const diffMs = hoy.getTime() - f.getTime();
        const diffDias = Math.floor(diffMs / msDia);

        if (filtroRangoFecha === "hoy" && diffDias !== 0) return false;
        if (
          filtroRangoFecha === "7dias" &&
          (diffDias < 0 || diffDias > 6)
        )
          return false;
        if (
          filtroRangoFecha === "30dias" &&
          (diffDias < 0 || diffDias > 29)
        )
          return false;
        if (filtroRangoFecha === "anteriores" && diffDias <= 0)
          return false;
      }

      if (
        busqueda &&
        !r.paciente_nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
        !(r.mensaje_resumen || "")
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [
    recordatoriosEnviados,
    filtroEstado,
    filtroCanal,
    filtroRangoFecha,
    filtroPrioridad,
    busqueda,
  ]);

  const historialOrdenado = useMemo(
    () =>
      [...recordatoriosEnviados].sort((a, b) => {
        const fa =
          a.ultimo_intento || a.fecha_hora_envio || new Date().toISOString();
        const fb =
          b.ultimo_intento || b.fecha_hora_envio || new Date().toISOString();
        return new Date(fb).getTime() - new Date(fa).getTime();
      }),
    [recordatoriosEnviados]
  );

  const datosGraficoSemana = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const etiquetas = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const data: { dia: string; enviados: number; fallidos: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const etiqueta = etiquetas[fecha.getDay()];

      const enviados = recordatoriosEnviados.filter((r) => {
        const f = new Date(r.fecha_hora_envio);
        const fs = new Date(f);
        fs.setHours(0, 0, 0, 0);
        return (
          fs.getTime() === fecha.getTime() && r.estado === "enviado"
        );
      }).length;

      const fallidos = recordatoriosEnviados.filter((r) => {
        const f = new Date(r.fecha_hora_envio);
        const fs = new Date(f);
        fs.setHours(0, 0, 0, 0);
        return (
          fs.getTime() === fecha.getTime() && r.estado === "fallido"
        );
      }).length;

      data.push({ dia: etiqueta, enviados, fallidos });
    }

    return data;
  }, [recordatoriosEnviados]);

  const datosCanalesRecordatorios = useMemo(() => {
    const conteos: Record<CanalRecordatorio, number> = {
      whatsapp: 0,
      sms: 0,
      email: 0,
      llamada: 0,
    };

    recordatoriosEnviados.forEach((r) => {
      conteos[r.canal]++;
    });

    const total =
      conteos.whatsapp + conteos.sms + conteos.email + conteos.llamada || 0;

    const toPercent = (valor: number) =>
      total === 0 ? 0 : Math.round((valor / total) * 100);

    return [
      {
        nombre: "WhatsApp",
        valor: toPercent(conteos.whatsapp),
        color: "#10b981",
      },
      {
        nombre: "SMS",
        valor: toPercent(conteos.sms),
        color: "#f59e0b",
      },
      {
        nombre: "Email",
        valor: toPercent(conteos.email),
        color: "#3b82f6",
      },
      {
        nombre: "Llamada",
        valor: toPercent(conteos.llamada),
        color: "#8b5cf6",
      },
    ];
  }, [recordatoriosEnviados]);

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
              <Send className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando historial de recordatorios enviados
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Analizando envíos y resultados para tus pacientes...
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
            No tienes permisos para acceder al historial de recordatorios.
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
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p
                    className={`text-xs font-semibold ${tema.colores.acento}`}
                  >
                    Recordatorios Enviados
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Send className="w-6 h-6 text-white" />
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
                placeholder="Buscar por paciente, mensaje o canal..."
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
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                notif.prioridad
                              )}`}
                            >
                              <Bell className="w-5 h-5" />
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
                                {formatearFecha(notif.fecha_hora)}
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
        {/* Título y acciones */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">📨</span>
              </h2>
              <p
                className={`text-lg lg:text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Historial avanzado de recordatorios enviados a tus pacientes.
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
                onClick={cargarRecordatoriosEnviados}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar lista
              </button>
              <Link
                href="/secretaria/recordatorios"
                className={`flex items-center gap-2 px-5 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-semibold transition-all duration-300 hover:scale-105`}
              >
                <Clock className="w-4 h-4" />
                Ver programados
              </Link>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando historial de envíos...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* STATS */}
            {resumenEnviados && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {/* Enviados hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {resumenEnviados.enviadosHoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Enviados Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Confirmaciones enviadas con éxito.
                    </span>
                  </div>
                </div>

                {/* Fallidos hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <AlertOctagon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {resumenEnviados.fallidosHoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Fallidos Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-rose-400 flex items-center gap-1">
                      <PhoneOff className="w-3 h-3 hidden" />
                      Revisa teléfonos, correos y permisos.
                    </span>
                  </div>
                </div>

                {/* Tasa éxito */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {resumenEnviados.tasaExito}%
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Tasa de éxito hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-indigo-300 flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3" />
                      Optimiza plantillas y canales para mejorar.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* LISTA + GRÁFICOS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Lista de enviados */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Historial de recordatorios enviados
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Filtra por canal, estado, prioridad y rango de fechas.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="enviado">Solo enviados</option>
                      <option value="fallido">Fallidos</option>
                      <option value="cancelado">Cancelados</option>
                    </select>
                    <select
                      value={filtroCanal}
                      onChange={(e) => setFiltroCanal(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Todos los canales</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="llamada">Llamada</option>
                    </select>
                    <select
                      value={filtroPrioridad}
                      onChange={(e) => setFiltroPrioridad(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todas">Todas las prioridades</option>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                    <select
                      value={filtroRangoFecha}
                      onChange={(e) => setFiltroRangoFecha(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="hoy">Hoy</option>
                      <option value="7dias">Últimos 7 días</option>
                      <option value="30dias">Últimos 30 días</option>
                      <option value="anteriores">Anteriores a hoy</option>
                      <option value="todos">Todas las fechas</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-700/40 pt-4">
                  <div className="hidden md:grid grid-cols-[1.3fr,1fr,1fr,auto] gap-3 text-[11px] font-semibold uppercase tracking-wide mb-2 text-gray-400">
                    <span>Paciente / Mensaje</span>
                    <span>Canal / Estado</span>
                    <span>Fecha / Intentos</span>
                    <span className="text-right">Resultado</span>
                  </div>
                  <div className="space-y-2 max-h-[430px] overflow-y-auto custom-scrollbar pr-2">
                    {recordatoriosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare
                          className={`w-10 h-10 mx-auto mb-2 ${tema.colores.textoSecundario}`}
                        />
                        <p
                          className={`text-sm ${tema.colores.textoSecundario}`}
                        >
                          No hay recordatorios que cumplan con los filtros
                          seleccionados.
                        </p>
                      </div>
                    ) : (
                      recordatoriosFiltrados.map((r) => (
                        <div
                          key={r.id_recordatorio}
                          className={`grid md:grid-cols-[1.3fr,1fr,1fr,auto] grid-cols-1 gap-3 px-3 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition-all duration-200`}
                        >
                          {/* Paciente / mensaje */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center border ${obtenerColorCanal(
                                  r.canal
                                )}`}
                              >
                                {iconoCanal(r.canal)}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-bold truncate ${tema.colores.texto}`}
                                >
                                  {r.paciente_nombre}
                                </p>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario} truncate`}
                                >
                                  {r.mensaje_resumen}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Canal / estado */}
                          <div className="flex md:flex-col items-start md:items-stretch gap-1 text-[11px]">
                            <span
                              className={`px-2 py-1 rounded-full border font-bold uppercase tracking-wide ${obtenerColorCanal(
                                r.canal
                              )}`}
                            >
                              {r.canal.toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full border font-bold uppercase tracking-wide ${obtenerColorEstadoRecordatorio(
                                r.estado
                              )}`}
                            >
                              {r.estado}
                            </span>
                          </div>

                          {/* Fecha / intentos */}
                          <div className="flex flex-col justify-center text-[11px]">
                            <span className={tema.colores.textoSecundario}>
                              {formatearFecha(
                                r.ultimo_intento || r.fecha_hora_envio
                              )}
                            </span>
                            <span className={tema.colores.textoSecundario}>
                              Intentos: {r.intentos}
                            </span>
                            <span
                              className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full border ${obtenerColorPrioridad(
                                r.prioridad
                              )}`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              {r.prioridad.toUpperCase()}
                            </span>
                          </div>

                          {/* Resultado / acciones */}
                          <div className="flex flex-col items-end justify-center gap-2 text-[11px]">
                            <span
                              className={`px-3 py-1 rounded-full border font-bold flex items-center gap-1 ${r.estado === "enviado"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                                  : r.estado === "fallido"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                                  : "bg-gray-500/10 text-gray-300 border-gray-500/40"
                                }`}
                            >
                              {r.estado === "enviado" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : r.estado === "fallido" ? (
                                <AlertOctagon className="w-3 h-3" />
                              ) : (
                                <UserX className="w-3 h-3" />
                              )}
                              {r.estado === "enviado"
                                ? "ENTREGADO"
                                : r.estado === "fallido"
                                ? "NO ENTREGADO"
                                : "CANCELADO"}
                            </span>
                            {r.canal === "email" && r.paciente_email && (
                              <span
                                className={`text-[10px] ${tema.colores.textoSecundario} truncate max-w-[160px]`}
                              >
                                {r.paciente_email}
                              </span>
                            )}
                            {r.canal !== "email" &&
                              (r.paciente_celular || r.paciente_telefono) && (
                                <span
                                  className={`text-[10px] ${tema.colores.textoSecundario}`}
                                >
                                  {r.paciente_celular ||
                                    r.paciente_telefono}
                                </span>
                              )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Gráficos y canales */}
              <div
                className={`rounded-2xl p-6 space-y-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                {/* Gráfico últimos 7 días */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-black ${tema.colores.texto}`}
                      >
                        Envíos últimos 7 días
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Enviados vs. fallidos por día.
                      </p>
                    </div>
                  </div>

                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={datosGraficoSemana}>
                        <defs>
                          <linearGradient
                            id="envEnviados"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="envFallidos"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                          dataKey="dia"
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "11px" }}
                        />
                        <YAxis
                          stroke={tema.colores.textoSecundario}
                          style={{ fontSize: "11px" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            border:
                              "1px solid rgba(129, 140, 248, 0.4)",
                            borderRadius: 12,
                            padding: 10,
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="enviados"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#envEnviados)"
                          name="Enviados"
                        />
                        <Area
                          type="monotone"
                          dataKey="fallidos"
                          stroke="#ef4444"
                          fillOpacity={1}
                          fill="url(#envFallidos)"
                          name="Fallidos"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Canales */}
                <div className="pt-3 border-t border-gray-700/40">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-black ${tema.colores.texto}`}
                      >
                        Canales más utilizados
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Porcentaje de uso de cada canal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-1/2 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={datosCanalesRecordatorios}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={55}
                            fill="#8884d8"
                            dataKey="valor"
                          >
                            {datosCanalesRecordatorios.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1 text-xs">
                      {datosCanalesRecordatorios.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className={tema.colores.texto}>
                              {item.nombre}
                            </span>
                          </div>
                          <span
                            className={`font-bold ${tema.colores.acento}`}
                          >
                            {item.valor}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Historial rápido */}
                <div className="pt-3 border-t border-gray-700/40">
                  <p
                    className={`text-xs font-semibold mb-2 ${tema.colores.textoSecundario}`}
                  >
                    Últimos envíos
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                    {historialOrdenado.slice(0, 5).map((r) => (
                      <div
                        key={r.id_recordatorio}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <span
                          className={`truncate max-w-[140px] ${tema.colores.textoSecundario}`}
                        >
                          {r.paciente_nombre}
                        </span>
                        <span className={tema.colores.textoSecundario}>
                          {r.estado} ·{" "}
                          {formatearHora(
                            r.ultimo_intento || r.fecha_hora_envio
                          )}
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
                © 2025 AnyssaMed. Historial de Recordatorios Enviados.
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
