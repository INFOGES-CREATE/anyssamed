// src/app/(dashboard)/secretaria/configuracion/seguridad/page.tsx
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
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type IdiomaUI = "es" | "en" | "ht" | "fr";
type FormatoHora = "24h" | "12h";
type TamanoFuente = "pequeno" | "normal" | "grande" | "muy_grande";

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

interface EstadisticasSecretaria {
  citas_programadas_hoy: number;
  citas_pendientes_confirmacion: number;
  citas_confirmadas_hoy: number;
  citas_canceladas_hoy: number;
  llamadas_realizadas_hoy: number;
  llamadas_pendientes: number;
  pacientes_atendidos_semana: number;
  pacientes_nuevos_mes: number;
  mensajes_sin_leer: number;
  recordatorios_enviados_hoy: number;
  medicos_activos: number;
  tareas_pendientes: number;
  documentos_procesados_semana: number;
  consultas_telemedicina_hoy: number;
}

interface NotificacionSecretaria {
  id_notificacion: number;
  tipo:
    | "cita_nueva"
    | "cancelacion"
    | "urgente"
    | "mensaje"
    | "recordatorio";
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

interface PreferenciasUsuario {
  tema_color: TemaColor;
  idioma: IdiomaUI;
  zona_horaria: string;
  formato_hora: FormatoHora;
  tamano_fuente: TamanoFuente;
  animaciones: boolean;
  modo_compacto: boolean;
  sidebar_contraido: boolean;
  notificaciones_email: boolean;
  notificaciones_push: boolean;
  notificaciones_sonido: boolean;
  notificaciones_sms: boolean;
  whatsapp_recordatorios: boolean;
  notificacion_login: boolean;
  resumen_diario_email: boolean;
  doble_factor_activado: boolean;
  recordar_dispositivo: boolean;
  mostrar_email_publico: boolean;
  mostrar_foto_publica: boolean;
}

// Sesiones dinámicas desde BD
interface SesionActiva {
  id_sesion: string;
  dispositivo: string;
  navegador: string;
  sistema: string;
  ip: string | null;
  ubicacion: string | null;
  es_actual: boolean;
  ultima_actividad: string;
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

const PREFERENCIAS_POR_DEFECTO: PreferenciasUsuario = {
  tema_color: "light",
  idioma: "es",
  zona_horaria: "America/Santiago",
  formato_hora: "24h",
  tamano_fuente: "normal",
  animaciones: true,
  modo_compacto: false,
  sidebar_contraido: false,
  notificaciones_email: true,
  notificaciones_push: true,
  notificaciones_sonido: true,
  notificaciones_sms: false,
  whatsapp_recordatorios: true,
  notificacion_login: true,
  resumen_diario_email: false,
  doble_factor_activado: false,
  recordar_dispositivo: false,
  mostrar_email_publico: false,
  mostrar_foto_publica: true,
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ConfiguracionSecretariaSeguridadPage() {
  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Datos generales para badges del menú
  const [estadisticas] = useState<EstadisticasSecretaria | null>(null);

  // Preferencias
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(
    null
  );
  const [loadingPreferencias, setLoadingPreferencias] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [seccionActiva] = useState<string>("configuracion");

  // En esta página la pestaña activa por defecto es SEGURIDAD
  const [tabActiva, setTabActiva] = useState<
    "general" | "notificaciones" | "seguridad" | "temas" | "integraciones" | "accesibilidad"
  >("seguridad");

  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>(
    []
  );

  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);
  const [tipoMensajeEstado, setTipoMensajeEstado] = useState<
    "ok" | "error" | "info" | null
  >(null);

  // Sesiones activas dinámicas
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [errorSesiones, setErrorSesiones] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ DE NAVEGACIÓN
  // ========================================

  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/secretaria",
      activo: seccionActiva === "dashboard",
    },
    {
      titulo: "Agenda",
      icono: Calendar,
      url: " ",
      badge: estadisticas?.citas_programadas_hoy || 0,
      activo: seccionActiva === "agenda",
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
      url: " ",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      activo: seccionActiva === "confirmaciones",
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
      badge: estadisticas?.llamadas_pendientes || 0,
      activo: seccionActiva === "llamadas",
      submenu: [
        {
          titulo: "Por Realizar",
          icono: PhoneOutgoing,
          url: "/secretaria/llamadas/pendientes",
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
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: " ",
      badge: estadisticas?.pacientes_nuevos_mes || 0,
      activo: seccionActiva === "pacientes",
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
      url: " ",
      activo: seccionActiva === "medicos",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
        {
          titulo: "Disponibilidad",
          icono: CalendarClock,
          url: "/secretaria/medicos/disponibilidad",
        },
        {
          titulo: "Contacto",
          icono: Phone,
          url: "/secretaria/medicos/contacto",
        },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: " ",
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
      activo: seccionActiva === "recordatorios",
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
      url: " ",
      badge: estadisticas?.documentos_procesados_semana || 0,
      activo: seccionActiva === "documentos",
      submenu: [
        {
          titulo: "Gestión",
          icono: FileSpreadsheet,
          url: "/secretaria/documentos",
        },
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
      url: " ",
      badge: estadisticas?.mensajes_sin_leer || 0,
      activo: seccionActiva === "mensajes",
      submenu: [
        { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
        {
          titulo: "WhatsApp",
          icono: MessageSquare,
          url: "/secretaria/mensajes/whatsapp",
        },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
        { titulo: "Automaticos", icono: Mail, url: "/secretaria/mensajes/auto" },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: " ",
      badge: estadisticas?.consultas_telemedicina_hoy || 0,
      activo: seccionActiva === "telemedicina",
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
      url: " ",
      badge: estadisticas?.tareas_pendientes || 0,
      activo: seccionActiva === "tareas",
      submenu: [
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
      url: " ",
      activo: seccionActiva === "reportes",
      submenu: [
        {
          titulo: "Mis Métricas",
          icono: TrendingUp,
          url: "/secretaria/reportes/metricas",
        },
        { titulo: "Citas", icono: Calendar, url: "/secretaria/reportes/citas" },
        {
          titulo: "Llamadas",
          icono: Phone,
          url: "/secretaria/reportes/llamadas",
        },
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
      url: " ",
      activo: seccionActiva === "perfil",
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
      activo: seccionActiva === "configuracion",
      submenu: [
        {
          titulo: "General",
          icono: Settings,
          url: "/secretaria/configuracion/",
        },
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
    if (usuario) {
      cargarPreferencias();
    }
  }, [usuario]);

  // Cargar sesiones activas desde la BD cuando ya tenemos usuario
  useEffect(() => {
    if (usuario) {
      cargarSesiones();
    }
  }, [usuario]);

  useEffect(() => {
    // Tema desde BD / API específica (solo color)
    const cargarPreferenciaTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (
          data.success &&
          data.tema_color &&
          TEMAS[data.tema_color as TemaColor]
        ) {
          setTemaActual(data.tema_color as TemaColor);
          if (typeof window !== "undefined") {
            localStorage.setItem("tema_secretaria", data.tema_color);
          }
        } else if (typeof window !== "undefined") {
          const temaLocal = localStorage.getItem(
            "tema_secretaria"
          ) as TemaColor | null;
          if (temaLocal && TEMAS[temaLocal]) {
            setTemaActual(temaLocal);
          }
        }
      } catch (e) {
        if (typeof window !== "undefined") {
          const temaLocal = localStorage.getItem(
            "tema_secretaria"
          ) as TemaColor | null;
          if (temaLocal && TEMAS[temaLocal]) {
            setTemaActual(temaLocal);
          }
        }
      }
    };

    cargarPreferenciaTema();
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
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
      setLoading(false);
    }
  };

  const cargarPreferencias = async () => {
    try {
      setLoadingPreferencias(true);
      const res = await fetch("/api/users/preferencias", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.preferencias) {
        const prefsServidor = data.preferencias as Partial<PreferenciasUsuario>;
        const temaServidor =
          (prefsServidor.tema_color as TemaColor | undefined) || temaActual;

        if (temaServidor && TEMAS[temaServidor]) {
          setTemaActual(temaServidor);
          if (typeof window !== "undefined") {
            localStorage.setItem("tema_secretaria", temaServidor);
          }
        }

        setPreferencias({
          ...PREFERENCIAS_POR_DEFECTO,
          ...prefsServidor,
          tema_color: temaServidor || PREFERENCIAS_POR_DEFECTO.tema_color,
        });
      } else {
        setPreferencias(PREFERENCIAS_POR_DEFECTO);
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
      setPreferencias(PREFERENCIAS_POR_DEFECTO);
    } finally {
      setLoadingPreferencias(false);
    }
  };

  const cargarSesiones = async () => {
    try {
      setLoadingSesiones(true);
      setErrorSesiones(null);

      const res = await fetch("/api/auth/sessions", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && Array.isArray(data.sesiones)) {
        const sesionesTransformadas: SesionActiva[] = data.sesiones.map(
          (s: any, idx: number) => ({
            id_sesion: String(
              s.id_sesion ?? s.id ?? s.session_id ?? `sesion-${idx}`
            ),
            dispositivo:
              s.dispositivo ??
              s.device ??
              s.nombre_dispositivo ??
              "Equipo desconocido",
            navegador: s.navegador ?? s.browser ?? "Navegador no identificado",
            sistema:
              s.sistema ??
              s.sistema_operativo ??
              s.os ??
              "Sistema no identificado",
            ip: s.ip ?? s.ip_address ?? null,
            ubicacion: s.ubicacion ?? s.location ?? null,
            es_actual: Boolean(
              s.es_actual ??
                s.actual ??
                s.current_device ??
                s.es_actual_dispositivo
            ),
            ultima_actividad:
              s.ultima_actividad ??
              s.last_activity ??
              s.updated_at ??
              s.created_at ??
              new Date().toISOString(),
          })
        );

        setSesiones(sesionesTransformadas);
      } else {
        setSesiones([]);
        if (!res.ok) {
          setErrorSesiones(
            "No se pudieron obtener las sesiones activas desde el servidor."
          );
        }
      }
    } catch (error) {
      console.error("Error al cargar sesiones:", error);
      setSesiones([]);
      setErrorSesiones(
        "Ocurrió un error al cargar las sesiones activas. Intenta más tarde."
      );
    } finally {
      setLoadingSesiones(false);
    }
  };

  const mostrarMensajeEstado = (
    mensaje: string,
    tipo: "ok" | "error" | "info" = "ok"
  ) => {
    setMensajeEstado(mensaje);
    setTipoMensajeEstado(tipo);
    if (mensaje) {
      setTimeout(() => {
        setMensajeEstado(null);
        setTipoMensajeEstado(null);
      }, 4000);
    }
  };

  const actualizarPreferencias = async (
    nuevasPreferencias: Partial<PreferenciasUsuario>,
    mostrarFeedback = true
  ) => {
    if (!usuario) return;

    setPreferencias((prev) => ({
      ...(prev || PREFERENCIAS_POR_DEFECTO),
      ...nuevasPreferencias,
    }));

    try {
      setSaving(true);
      const res = await fetch("/api/users/preferencias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevasPreferencias),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta al guardar preferencias:", data);
        if (mostrarFeedback) {
          mostrarMensajeEstado(
            "No se pudieron guardar los cambios. Intenta nuevamente.",
            "error"
          );
        }
      } else if (mostrarFeedback) {
        mostrarMensajeEstado("Preferencias guardadas correctamente.", "ok");
      }
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      if (mostrarFeedback) {
        mostrarMensajeEstado(
          "Ocurrió un error al guardar. Revisa tu conexión.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    actualizarPreferencias({ tema_color: nuevoTema }, false);

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
      console.error("No se pudo guardar el tema en BD:", err);
    }
  };

  type CampoToggle =
    | "animaciones"
    | "modo_compacto"
    | "sidebar_contraido"
    | "notificaciones_email"
    | "notificaciones_push"
    | "notificaciones_sonido"
    | "notificaciones_sms"
    | "whatsapp_recordatorios"
    | "notificacion_login"
    | "resumen_diario_email"
    | "doble_factor_activado"
    | "recordar_dispositivo"
    | "mostrar_email_publico"
    | "mostrar_foto_publica";

  const handleToggle = (campo: CampoToggle) => {
    if (!preferencias) return;
    const valorActual = preferencias[campo];
    const nuevoValor = !valorActual;
    actualizarPreferencias({ [campo]: nuevoValor } as Partial<PreferenciasUsuario>);
  };

  const handleCambioIdioma = (idioma: IdiomaUI) => {
    actualizarPreferencias({ idioma });
  };

  const handleCambioZonaHoraria = (zona_horaria: string) => {
    actualizarPreferencias({ zona_horaria });
  };

  const handleCambioFormatoHora = (formato_hora: FormatoHora) => {
    actualizarPreferencias({ formato_hora });
  };

  const handleCambioTamanoFuente = (tamano_fuente: TamanoFuente) => {
    actualizarPreferencias({ tamano_fuente });
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

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      urgente: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      normal: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const cerrarOtrasSesiones = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/auth/sessions/close-others", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        mostrarMensajeEstado(
          "No se pudieron cerrar las otras sesiones activas.",
          "error"
        );
      } else {
        mostrarMensajeEstado("Sesiones cerradas correctamente.", "ok");
        // Recargar listado dinámico de sesiones
        cargarSesiones();
      }
    } catch (error) {
      console.error("Error al cerrar otras sesiones:", error);
      mostrarMensajeEstado(
        "Ocurrió un error al cerrar las sesiones. Intenta más tarde.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // RENDER TOGGLE
  // ========================================

  const renderToggle = (activo: boolean | undefined) => (
    <button
      type="button"
      className={`relative w-14 h-8 rounded-full transition-colors ${
        activo ? "bg-emerald-500" : "bg-gray-400"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
          activo ? "translate-x-6" : ""
        }`}
      />
    </button>
  );

  // ========================================
  // RENDER CONTENIDO PESTAÑAS
  // ========================================

  const renderContenidoTab = () => {
    if (!preferencias) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
              Cargando tus preferencias personalizadas...
            </p>
          </div>
        </div>
      );
    }

    if (tabActiva === "general") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Idioma y región */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Idioma y región
                  </h3>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Ajusta el idioma de la interfaz y la zona horaria del centro.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Idioma de la interfaz
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Se aplicará a mensajes, botones y etiquetas en el panel.
                    </p>
                  </div>
                  <select
                    value={preferencias.idioma}
                    onChange={(e) =>
                      handleCambioIdioma(e.target.value as IdiomaUI)
                    }
                    className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="es">Español (Chile)</option>
                    <option value="en">English</option>
                    <option value="ht">Kreyòl Ayisyen</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Zona horaria
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Se usa para agendas, recordatorios y reportes.
                    </p>
                  </div>
                  <select
                    value={preferencias.zona_horaria}
                    onChange={(e) => handleCambioZonaHoraria(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="America/Santiago">
                      America/Santiago (CESFAM)
                    </option>
                    <option value="America/Lima">America/Lima</option>
                    <option value="America/Bogota">America/Bogotá</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Formato de hora
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Cómo se muestran las horas en agendas y reportes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCambioFormatoHora("24h")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        preferencias.formato_hora === "24h"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto}`
                      }`}
                    >
                      24 horas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCambioFormatoHora("12h")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        preferencias.formato_hora === "12h"
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto}`
                      }`}
                    >
                      12 horas
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comportamiento del panel */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <LayoutDashboardIcon />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Comportamiento del panel
                  </h3>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Ajusta cómo se ve y se siente el panel de secretaria.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                {/* Animaciones */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Animaciones suaves
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Efectos de entrada y transiciones en tarjetas y tablas.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("animaciones")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.animaciones)}
                  </div>
                </div>

                {/* Modo compacto */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Modo compacto
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Reduce espacios y márgenes para ver más información en pantalla.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("modo_compacto")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.modo_compacto)}
                  </div>
                </div>

                {/* Sidebar contraído por defecto */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Menú lateral contraído
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Inicia el panel con el menú lateral reducido.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("sidebar_contraido")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.sidebar_contraido)}
                  </div>
                </div>

                {/* Tamaño de fuente */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Tamaño de fuente
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Mejora la lectura según tus preferencias.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(
                      ["pequeno", "normal", "grande", "muy_grande"] as TamanoFuente[]
                    ).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleCambioTamanoFuente(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          preferencias.tamano_fuente === t
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                            : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto}`
                        }`}
                      >
                        {t === "pequeno" && "XS"}
                        {t === "normal" && "S"}
                        {t === "grande" && "M"}
                        {t === "muy_grande" && "L"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen rápido */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-wrap items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  Configuración aplicada en tiempo real
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Los cambios se guardan automáticamente y se sincronizan entre tus
                  dispositivos.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saving && (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </div>
              )}
              {!saving && mensajeEstado && tipoMensajeEstado === "ok" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {mensajeEstado}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (tabActiva === "notificaciones") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Canales de notificación */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Canales de notificación
                  </h3>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Define por dónde quieres recibir avisos importantes del sistema.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                {/* Email */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Email
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Confirmaciones, recordatorios y reportes enviados a tu correo.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("notificaciones_email")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.notificaciones_email)}
                  </div>
                </div>

                {/* Push */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Notificaciones en el navegador
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Avisos emergentes cuando tengas el panel abierto.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("notificaciones_push")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.notificaciones_push)}
                  </div>
                </div>

                {/* Sonido */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Sonido de notificación
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Reproduce un sonido suave al recibir nuevos avisos.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("notificaciones_sonido")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.notificaciones_sonido)}
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajería a pacientes */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Recordatorios a pacientes
                  </h3>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Controla qué canales se usan para contactar a los pacientes.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                {/* SMS */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      SMS
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Enviar SMS de confirmación y recordatorio de citas.
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("notificaciones_sms")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.notificaciones_sms)}
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      WhatsApp
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Enviar recordatorios automáticos por WhatsApp (si está
                      disponible).
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("whatsapp_recordatorios")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.whatsapp_recordatorios)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resúmenes y alertas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
              >
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Resúmenes y alertas
                </h3>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Configura avisos clave para comenzar tu jornada organizada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Notificación al iniciar sesión */}
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Resumen al iniciar
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("notificacion_login")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.notificacion_login)}
                  </div>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Muestra un resumen rápido de citas, tareas y mensajes al ingresar.
                </p>
              </div>

              {/* Resumen diario por email */}
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-indigo-400" />
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      Resumen diario
                    </p>
                  </div>
                  <div
                    onClick={() => handleToggle("resumen_diario_email")}
                    className="cursor-pointer"
                  >
                    {renderToggle(preferencias.resumen_diario_email)}
                  </div>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Envía un correo diario con las principales métricas del día.
                </p>
              </div>

              {/* Indicador de carga */}
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border flex items-center justify-center`}
              >
                <div className="text-center">
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                    Estado de notificaciones
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className={tema.colores.texto}>
                      {[
                        preferencias.notificaciones_email,
                        preferencias.notificaciones_push,
                        preferencias.notificaciones_sms,
                        preferencias.whatsapp_recordatorios,
                      ].filter(Boolean).length}{" "}
                      canales activos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tabActiva === "seguridad") {
      const sesionActual = sesiones.find((s) => s.es_actual);
      const sesionesOtras = sesiones.filter((s) => !s.es_actual);
      const hayOtrasSesiones = sesionesOtras.length > 0;

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Estado general de seguridad */}
            <div
              className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                  >
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                      Seguridad de la cuenta
                    </h3>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Protege tu acceso y el de tus pacientes con medidas adicionales.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Doble factor */}
                <div
                  className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Verificación en dos pasos
                      </p>
                    </div>
                    <div
                      onClick={() => handleToggle("doble_factor_activado")}
                      className="cursor-pointer"
                    >
                      {renderToggle(preferencias.doble_factor_activado)}
                    </div>
                  </div>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Añade una capa extra de seguridad al requerir un código adicional al
                    iniciar sesión.
                  </p>
                </div>

                {/* Recordar dispositivo */}
                <div
                  className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <DeviceIcon />
                      <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Recordar este equipo
                      </p>
                    </div>
                    <div
                      onClick={() => handleToggle("recordar_dispositivo")}
                      className="cursor-pointer"
                    >
                      {renderToggle(preferencias.recordar_dispositivo)}
                    </div>
                  </div>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Reduce las verificaciones adicionales en este equipo de confianza.
                  </p>
                </div>

                {/* Privacidad email */}
                <div
                  className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Mostrar email a otros usuarios
                      </p>
                    </div>
                    <div
                      onClick={() => handleToggle("mostrar_email_publico")}
                      className="cursor-pointer"
                    >
                      {renderToggle(preferencias.mostrar_email_publico)}
                    </div>
                  </div>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Permite que otros usuarios del centro vean tu correo en el directorio.
                  </p>
                </div>

                {/* Privacidad foto */}
                <div
                  className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-pink-400" />
                      <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Mostrar foto de perfil
                      </p>
                    </div>
                    <div
                      onClick={() => handleToggle("mostrar_foto_publica")}
                      className="cursor-pointer"
                    >
                      {renderToggle(preferencias.mostrar_foto_publica)}
                    </div>
                  </div>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Si lo desactivas, se mostrará solo un avatar con tus iniciales.
                  </p>
                </div>
              </div>
            </div>

            {/* Sesiones activas dinámicas */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Sesiones activas
                  </h3>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Controla desde dónde está iniciada tu cuenta.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-3">
                {loadingSesiones && (
                  <div className="space-y-2">
                    <div
                      className={`rounded-xl p-3 ${tema.colores.card} ${tema.colores.borde} border animate-pulse`}
                    >
                      <div className="h-3 w-2/3 rounded bg-slate-500/30 mb-2" />
                      <div className="h-2 w-1/2 rounded bg-slate-500/20" />
                    </div>
                    <div
                      className={`rounded-xl p-3 ${tema.colores.card} ${tema.colores.borde} border animate-pulse`}
                    >
                      <div className="h-3 w-1/2 rounded bg-slate-500/30 mb-2" />
                      <div className="h-2 w-1/3 rounded bg-slate-500/20" />
                    </div>
                  </div>
                )}

                {!loadingSesiones && errorSesiones && (
                  <div
                    className={`rounded-xl p-3 border border-red-500/40 bg-red-500/10`}
                  >
                    <p className="text-[11px] text-red-200 font-semibold">
                      {errorSesiones}
                    </p>
                  </div>
                )}

                {!loadingSesiones &&
                  !errorSesiones &&
                  sesiones.length === 0 && (
                    <div
                      className={`rounded-xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} mb-1`}
                      >
                        No encontramos sesiones activas registradas para tu cuenta.
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        Cuando inicies sesión desde otros dispositivos, aparecerán
                        aquí para que puedas monitorearlas.
                      </p>
                    </div>
                  )}

                {!loadingSesiones &&
                  !errorSesiones &&
                  sesiones.length > 0 && (
                    <>
                      {sesionActual && (
                        <div
                          className={`rounded-xl p-3 ${tema.colores.card} ${tema.colores.borde} border flex items-center justify-between gap-3`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <MonitorIcon className="w-4 h-4 text-emerald-300" />
                            </div>
                            <div>
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                {sesionActual.dispositivo || "Equipo actual"}
                              </p>
                              <p
                                className={`text-[11px] ${tema.colores.textoSecundario}`}
                              >
                                {sesionActual.navegador} · {sesionActual.sistema}
                                {sesionActual.ultima_actividad && (
                                  <>
                                    {" "}
                                    · Última actividad:{" "}
                                    {formatearFecha(sesionActual.ultima_actividad)}
                                  </>
                                )}
                              </p>
                              {sesionActual.ip && (
                                <p className="text-[11px] text-slate-400">
                                  IP: {sesionActual.ip}
                                  {sesionActual.ubicacion &&
                                    ` · ${sesionActual.ubicacion}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            EQUIPO ACTUAL
                          </span>
                        </div>
                      )}

                      {sesionesOtras.map((sesion) => (
                        <div
                          key={sesion.id_sesion}
                          className={`rounded-xl p-3 ${tema.colores.card} ${tema.colores.borde} border flex items-center justify-between gap-3 opacity-80`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center">
                              <SmartphoneIcon className="w-4 h-4 text-slate-200" />
                            </div>
                            <div>
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                {sesion.dispositivo || "Otro dispositivo"}
                              </p>
                              <p
                                className={`text-[11px] ${tema.colores.textoSecundario}`}
                              >
                                {sesion.navegador} · {sesion.sistema}
                                {sesion.ultima_actividad && (
                                  <>
                                    {" "}
                                    · Última actividad:{" "}
                                    {formatearFecha(sesion.ultima_actividad)}
                                  </>
                                )}
                              </p>
                              {sesion.ip && (
                                <p className="text-[11px] text-slate-400">
                                  IP: {sesion.ip}
                                  {sesion.ubicacion && ` · ${sesion.ubicacion}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-200">
                            ACTIVA
                          </span>
                        </div>
                      ))}
                    </>
                  )}
              </div>

              <button
                type="button"
                onClick={cerrarOtrasSesiones}
                disabled={saving || loadingSesiones || !hayOtrasSesiones}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} ${
                  saving || loadingSesiones || !hayOtrasSesiones
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                <Lock className="w-4 h-4" />
                {saving
                  ? "Procesando..."
                  : hayOtrasSesiones
                  ? "Cerrar sesiones en otros dispositivos"
                  : "No hay otras sesiones activas"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (tabActiva === "temas") {
      return (
        <div className="space-y-6">
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                    Temas del panel
                  </h3>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Elige el modo visual que mejor se adapte a tu forma de trabajar.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {(["light", "dark", "blue", "purple", "green"] as TemaColor[]).map(
                (clave) => {
                  const t = TEMAS[clave];
                  const activo = temaActual === clave;
                  return (
                    <button
                      key={clave}
                      type="button"
                      onClick={() => cambiarTema(clave)}
                      className={`group rounded-2xl p-4 border text-left transition-all duration-300 ${
                        activo
                          ? `bg-gradient-to-br ${t.colores.gradiente} text-white shadow-2xl scale-[1.02]`
                          : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} hover:scale-[1.02]`
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            activo ? "bg-white/15" : "bg-slate-900/5"
                          }`}
                        >
                          <t.icono
                            className={`w-5 h-5 ${
                              activo ? "text-white" : tema.colores.acento
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-black ${
                              activo ? "text-white" : tema.colores.texto
                            }`}
                          >
                            {t.nombre}
                          </p>
                          <p
                            className={`text-[11px] ${
                              activo
                                ? "text-white/80"
                                : tema.colores.textoSecundario
                            }`}
                          >
                            Vista optimizada para sesiones largas de trabajo.
                          </p>
                        </div>
                      </div>
                      <div className="h-10 rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-white/10 via-white/40 to-white/10 opacity-50 group-hover:opacity-80" />
                        <div className="relative grid grid-cols-3 gap-1 h-full p-1">
                          <div className="rounded-md bg-white/80" />
                          <div className="rounded-md bg-black/5" />
                          <div className="rounded-md bg-black/10" />
                        </div>
                      </div>
                      {activo && (
                        <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-white">
                          <Check className="w-4 h-4" />
                          Tema actual
                        </div>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      );
    }

    if (tabActiva === "integraciones") {
      return (
        <div className="space-y-6">
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
              >
                <PlugIcon />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Integraciones del centro
                </h3>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Conecta AnyssaMed con herramientas externas para potenciar la gestión.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
              {[
                {
                  nombre: "WhatsApp Business",
                  descripcion:
                    "Envía recordatorios y mensajes de confirmación a pacientes.",
                  icono: MessageSquare,
                  estado: "Configuración requerida",
                  color: "text-emerald-400",
                },
                {
                  nombre: "SMS Gateway",
                  descripcion:
                    "Canal de respaldo para mensajes en lugares con baja conectividad.",
                  icono: Phone,
                  estado: "No configurado",
                  color: "text-amber-400",
                },
                {
                  nombre: "Correo institucional",
                  descripcion:
                    "Envía certificados y comunicaciones desde tu dominio oficial.",
                  icono: Mail,
                  estado: "Conectado",
                  color: "text-sky-400",
                },
                {
                  nombre: "Telefonía IP",
                  descripcion:
                    "Realiza llamadas directamente desde el módulo de llamadas.",
                  icono: PhoneCall,
                  estado: "No configurado",
                  color: "text-indigo-400",
                },
                {
                  nombre: "Google Calendar",
                  descripcion:
                    "Sincroniza agendas médicas con calendarios externos.",
                  icono: Calendar,
                  estado: "Proximamente",
                  color: "text-fuchsia-400",
                },
                {
                  nombre: "BI / Power BI",
                  descripcion:
                    "Conecta vistas avanzadas de reportes para analítica del centro.",
                  icono: BarChart3,
                  estado: "Proximamente",
                  color: "text-purple-400",
                },
              ].map((int, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900/10 flex items-center justify-center">
                      <int.icono className={`w-5 h-5 ${int.color}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                        {int.nombre}
                      </p>
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        {int.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[11px] ${tema.colores.textoSecundario}`}>
                      {int.estado}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        mostrarMensajeEstado(
                          "La configuración detallada se realiza en el módulo de administración.",
                          "info"
                        )
                      }
                      className="px-3 py-1 rounded-lg text-[11px] font-bold border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
                    >
                      Gestionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (tabActiva === "accesibilidad") {
      return (
        <div className="space-y-6">
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
              >
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                  Accesibilidad visual
                </h3>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Ajusta el panel para que sea más cómodo y accesible para ti.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <p className={`text-sm font-semibold ${tema.colores.texto} mb-2`}>
                  Tamaño de texto
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-3`}>
                  Escoge el tamaño que te resulte más cómodo para leer.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["pequeno", "normal", "grande", "muy_grande"] as TamanoFuente[]
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleCambioTamanoFuente(t)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${
                        preferencias.tamano_fuente === t
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto}`
                      }`}
                    >
                      {t === "pequeno" && "Pequeño"}
                      {t === "normal" && "Normal"}
                      {t === "grande" && "Grande"}
                      {t === "muy_grande" && "Muy grande"}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <p className={`text-sm font-semibold ${tema.colores.texto} mb-2`}>
                  Animaciones
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-3`}>
                  Si te marean las animaciones, puedes desactivarlas fácilmente.
                </p>
                <div
                  onClick={() => handleToggle("animaciones")}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    Animaciones suaves
                  </span>
                  {renderToggle(preferencias.animaciones)}
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}
              >
                <p className={`text-sm font-semibold ${tema.colores.texto} mb-2`}>
                  Densidad de información
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-3`}>
                  Modo compacto reduce espacios para ver más filas en tablas.
                </p>
                <div
                  onClick={() => handleToggle("modo_compacto")}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    Activar modo compacto
                  </span>
                  {renderToggle(preferencias.modo_compacto)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

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
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando configuración
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus preferencias personalizadas...
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
            No tienes permisos para acceder a la configuración de secretaria.
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
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <UserCog className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p
                    className={`text-xs font-semibold ${tema.colores.acento}`}
                  >
                    Configuración Secretaria
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <UserCog className="w-6 h-6 text-white" />
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

          {/* Menú de Navegación */}
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

                {/* Submenú */}
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

          {/* Usuario Info Bottom */}
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
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar configuración, ayuda, atajos..."
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
            {/* Selector de Temas rápido */}
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
                  Tema rápido
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

              {/* Dropdown Notificaciones */}
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
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
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
                        No tienes notificaciones nuevas
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

            {/* Perfil Usuario */}
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

              {/* Dropdown Perfil */}
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

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado Configuración */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-[0.2em] mb-2 ${tema.colores.textoSecundario}`}
              >
                Configuración · Panel de Secretaria
              </p>
              <h2
                className={`text-4xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">🛡️</span>
              </h2>
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Ajusta la seguridad de tu cuenta y controla desde dónde está iniciada.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2 py-1 rounded-full font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
                >
                  Tema: {TEMAS[temaActual].nombre}
                </span>
                <span className={`text-[11px] ${tema.colores.textoSecundario}`}>
                  Idioma:{" "}
                  {preferencias?.idioma === "es"
                    ? "Español"
                    : preferencias?.idioma === "en"
                    ? "English"
                    : preferencias?.idioma === "ht"
                    ? "Kreyòl"
                    : "Français"}
                </span>
              </div>
              {mensajeEstado && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    tipoMensajeEstado === "ok"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      : tipoMensajeEstado === "error"
                      ? "bg-red-500/10 text-red-300 border border-red-500/30"
                      : "bg-sky-500/10 text-sky-300 border border-sky-500/30"
                  }`}
                >
                  {tipoMensajeEstado === "ok" && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {tipoMensajeEstado === "error" && (
                    <AlertOctagon className="w-4 h-4" />
                  )}
                  {tipoMensajeEstado === "info" && <InfoIcon />}
                  <span>{mensajeEstado}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Configuración */}
        <div className="mb-6">
          <div
            className={`inline-flex flex-wrap gap-2 rounded-2xl p-1 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            {[
              {
                id: "general",
                label: "General",
                icono: Settings,
              },
              {
                id: "notificaciones",
                label: "Notificaciones",
                icono: Bell,
              },
              {
                id: "seguridad",
                label: "Seguridad",
                icono: Shield,
              },
              {
                id: "temas",
                label: "Temas",
                icono: Sparkles,
              },
              {
                id: "integraciones",
                label: "Integraciones",
                icono: PlugIcon,
              },
              {
                id: "accesibilidad",
                label: "Accesibilidad",
                icono: Eye,
              },
            ].map((tab) => {
              const activo = tabActiva === tab.id;
              const Icono: any = tab.icono;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setTabActiva(
                      tab.id as
                        | "general"
                        | "notificaciones"
                        | "seguridad"
                        | "temas"
                        | "integraciones"
                        | "accesibilidad"
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                      : `${tema.colores.card} ${tema.colores.texto} hover:${tema.colores.hover}`
                  }`}
                >
                  <Icono className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de la pestaña */}
        {loadingPreferencias ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando tus preferencias...
              </p>
            </div>
          </div>
        ) : (
          renderContenidoTab()
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
                © 2025 AnyssaMed. Todos los derechos reservados.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Configuración · Seguridad · v1.0.0
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

      {/* ESTILOS GLOBAL */}
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

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }

        @keyframes gradient {
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
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

// Iconos auxiliares simples
function LayoutDashboardIcon() {
  return (
    <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
      <span className="bg-indigo-500 rounded-sm" />
      <span className="bg-sky-400 rounded-sm" />
      <span className="bg-emerald-500 rounded-sm" />
      <span className="bg-purple-500 rounded-sm" />
    </div>
  );
}

function DeviceIcon() {
  return (
    <div className="flex items-center justify-center">
      <MonitorIcon className="w-4 h-4" />
    </div>
  );
}

function MonitorIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className={`stroke-current ${props.className || ""}`}
      fill="none"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </svg>
  );
}

function SmartphoneIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className={`stroke-current ${props.className || ""}`}
      fill="none"
    >
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  );
}

function PlugIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className={`stroke-current ${props.className || ""}`}
      fill="none"
    >
      <path d="M7 2v5" />
      <path d="M17 2v5" />
      <path d="M7 7h10v4a5 5 0 0 1-10 0V7Z" />
      <path d="M12 17v5" />
    </svg>
  );
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      className={`stroke-current w-4 h-4 ${props.className || ""}`}
      fill="none"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  );
}
