// src/app/(dashboard)/secretaria/mensajes/email/page.tsx
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
  Stethoscope,
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
  // Extra icons para email
  Inbox,
  Archive,
  Trash2,
  Tag,
  Reply,
  ReplyAll,
  Forward,
  StarOff,
  ExternalLink,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
    centro?: {
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

// === EMAIL ===

type EmailBandeja =
  | "inbox"
  | "sent"
  | "drafts"
  | "archived"
  | "spam"
  | "trash"
  | "all";

interface EmailCuenta {
  id_cuenta: number;
  nombre: string;
  email: string;
  proveedor: "gmail" | "outlook" | "exchange" | "imap" | "otro";
  es_principal: boolean;
  estado_sincronizacion: "conectada" | "sincronizando" | "error";
  ultima_sincronizacion: string | null;
  centro?: {
    id_centro: number;
    nombre: string;
  };
}

interface EmailEtiqueta {
  id_etiqueta: number;
  nombre: string;
  color: string;
  es_predeterminada: boolean;
}

interface EmailAdjunto {
  id_adjunto: string;
  nombre_archivo: string;
  peso_bytes: number;
  tipo_mime: string;
  url_descarga?: string;
}

interface EmailMensaje {
  id_mensaje: string;
  fecha_envio: string;
  remitente_nombre: string;
  remitente_email: string;
  destinatarios: string[];
  cc: string[];
  bcc?: string[];
  cuerpo_html: string;
  cuerpo_texto: string;
  estado_entrega?: "enviado" | "entregado" | "abierto" | "rebotado" | "pendiente";
  adjuntos: EmailAdjunto[];
}

interface EmailResumenConversacion {
  id_conversacion: string;
  asunto: string;
  remitente_nombre: string;
  remitente_email: string;
  destinatarios_resumen: string;
  fecha_ultima: string;
  fragmento: string;
  no_leidos: number;
  total_mensajes: number;
  importante: boolean;
  tiene_adjuntos: boolean;
  centro?: {
    id_centro: number;
    nombre: string;
  };
  paciente?: {
    id_paciente: number;
    nombre_completo: string;
    rut?: string | null;
  };
}

interface EmailEstadisticas {
  recibidos_hoy: number;
  enviados_hoy: number;
  sin_responder: number;
  relacionados_citas: number;
  por_centro: Array<{
    id_centro: number;
    nombre: string;
    total: number;
    no_leidos: number;
  }>;
  por_bandeja: Array<{
    bandeja: EmailBandeja;
    total: number;
    no_leidos: number;
  }>;
}

type ModoRedaccion = "nuevo" | "responder" | "responder_todos" | "reenviar" | null;

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

// Datos demo para gráfico de actividad de correos
const datosEmailSemana = [
  { dia: "Lun", recibidos: 42, enviados: 18 },
  { dia: "Mar", recibidos: 38, enviados: 22 },
  { dia: "Mié", recibidos: 47, enviados: 20 },
  { dia: "Jue", recibidos: 35, enviados: 19 },
  { dia: "Vie", recibidos: 51, enviados: 24 },
  { dia: "Sáb", recibidos: 12, enviados: 6 },
  { dia: "Dom", recibidos: 6, enviados: 3 },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function SecretariaEmailPage() {
  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard básico (para badges del menú y notificaciones)
  const [estadisticas, setEstadisticas] = useState<EstadisticasSecretaria | null>(null);
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);

  // Tema y UI general
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Mensajes");
  const [seccionActiva] = useState<string>("mensajes-email");

  // Módulo de Email
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [cuentas, setCuentas] = useState<EmailCuenta[]>([]);
  const [estadisticasEmail, setEstadisticasEmail] = useState<EmailEstadisticas | null>(null);

  const [bandejaActual, setBandejaActual] = useState<EmailBandeja>("inbox");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");
  const [soloNoLeidos, setSoloNoLeidos] = useState<boolean>(false);
  const [soloImportantes, setSoloImportantes] = useState<boolean>(false);

  const [conversaciones, setConversaciones] = useState<EmailResumenConversacion[]>([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] =
    useState<EmailResumenConversacion | null>(null);
  const [mensajesConversacion, setMensajesConversacion] = useState<EmailMensaje[]>([]);

  // Redacción
  const [modoRedaccion, setModoRedaccion] = useState<ModoRedaccion>(null);
  const [para, setPara] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | "principal">("principal");
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [conversacionOrigenId, setConversacionOrigenId] = useState<string | null>(null);
  const [asociarACentro, setAsociarACentro] = useState<boolean>(true);
  const [asociarAPaciente, setAsociarAPaciente] = useState<boolean>(false);
  const [rutPaciente, setRutPaciente] = useState<string>("");

  // ========================================
  // MENÚ LATERAL
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
      url: "",
      badge: estadisticas?.citas_programadas_hoy || 0,
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        { titulo: "Nueva Cita", icono: CalendarPlus, url: "/secretaria/agenda/nueva" },
        { titulo: "Búsqueda Citas", icono: Search, url: "/secretaria/agenda/buscar" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/agenda/disponibilidad" },
      ],
    },
    {
      titulo: "Confirmaciones",
      icono: CheckSquare,
      url: "",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      submenu: [
        { titulo: "Pendientes", icono: Clock, url: "/secretaria/confirmaciones/pendientes" },
        { titulo: "Confirmadas", icono: CheckCircle2, url: "/secretaria/confirmaciones/confirmadas" },
        { titulo: "Cancelaciones", icono: X, url: "/secretaria/confirmaciones/cancelaciones" },
      ],
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "",
      badge: estadisticas?.llamadas_pendientes || 0,
      submenu: [
        { titulo: "Por Realizar", icono: PhoneOutgoing, url: "/secretaria/llamadas/pendientes" },
        { titulo: "Realizadas", icono: PhoneIncoming, url: "/secretaria/llamadas/historial" },
        { titulo: "Registro", icono: ClipboardList, url: "/secretaria/llamadas/registro" },
      ],
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "",
      badge: estadisticas?.pacientes_nuevos_mes || 0,
      submenu: [
        { titulo: "Todos", icono: Users, url: "/secretaria/pacientes" },
        { titulo: "Nuevo Paciente", icono: UserPlus, url: "/secretaria/pacientes/nuevo" },
        { titulo: "Búsqueda", icono: Search, url: "/secretaria/pacientes/buscar" },
        { titulo: "Atención Hoy", icono: CalendarCheck, url: "/secretaria/pacientes/hoy" },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/medicos/disponibilidad" },
        { titulo: "Contacto", icono: Phone, url: "/secretaria/medicos/contacto" },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: "",
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
      submenu: [
        { titulo: "Programados", icono: Clock, url: "/secretaria/recordatorios/programados" },
        { titulo: "Enviados", icono: Send, url: "/secretaria/recordatorios/enviados" },
        { titulo: "Configuración", icono: Settings, url: "/secretaria/recordatorios/config" },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "",
      badge: estadisticas?.documentos_procesados_semana || 0,
      submenu: [
        { titulo: "Gestión", icono: FileSpreadsheet, url: "/secretaria/documentos" },
        { titulo: "Certificados", icono: Award, url: "/secretaria/documentos/certificados" },
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
        { titulo: "Órdenes", icono: ClipboardList, url: "/secretaria/documentos/ordenes" },
      ],
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "",
      badge: estadisticas?.mensajes_sin_leer || 0,
      activo: seccionActiva.startsWith("mensajes"),
      submenu: [
        { titulo: "Bandeja", icono: Inbox, url: "/secretaria/mensajes" },
        { titulo: "WhatsApp", icono: MessageSquare, url: "/secretaria/mensajes/whatsapp" },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
        { titulo: "Automáticos", icono: Sparkles, url: "/secretaria/mensajes/auto" },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "",
      badge: estadisticas?.consultas_telemedicina_hoy || 0,
      submenu: [
        { titulo: "Sala Espera", icono: Clock, url: "/secretaria/telemedicina/espera" },
        { titulo: "Programadas", icono: CalendarCheck, url: "/secretaria/telemedicina/programadas" },
        { titulo: "Asistencia", icono: Settings, url: "/secretaria/telemedicina/asistencia" },
      ],
    },
    {
      titulo: "Tareas",
      icono: CheckSquare,
      url: "",
      badge: estadisticas?.tareas_pendientes || 0,
      submenu: [
        { titulo: "Pendientes", icono: Square, url: "/secretaria/tareas/pendientes" },
        { titulo: "Completadas", icono: CheckSquare, url: "/secretaria/tareas/completadas" },
        { titulo: "Nueva Tarea", icono: Plus, url: "/secretaria/tareas/nueva" },
      ],
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "",
      submenu: [
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/metricas" },
        { titulo: "Citas", icono: Calendar, url: "/secretaria/reportes/citas" },
        { titulo: "Llamadas", icono: Phone, url: "/secretaria/reportes/llamadas" },
        { titulo: "Rendimiento", icono: Target, url: "/secretaria/reportes/rendimiento" },
      ],
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "",
      submenu: [
        { titulo: "Información Personal", icono: User, url: "/secretaria/perfil" },
        { titulo: "Horarios", icono: Clock, url: "/secretaria/perfil/horarios" },
        { titulo: "Preferencias", icono: Settings, url: "/secretaria/perfil/preferencias" },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/" },
        { titulo: "Notificaciones", icono: Bell, url: "/secretaria/configuracion/notificaciones" },
        { titulo: "Seguridad", icono: Shield, url: "/secretaria/configuracion/seguridad" },
        { titulo: "Temas", icono: Sparkles, url: "/secretaria/configuracion/temas" },
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
      cargarDatosDashboard();
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarModuloEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, bandejaActual, filtroCentro, soloNoLeidos, soloImportantes]);

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

        const tieneRolSecretaria = rolesUsuario.some((rol) => rol.includes("SECRETARIA"));

        if (!tieneRolSecretaria) {
          alert(
            `Acceso denegado. Este módulo es solo para secretarias. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarDatosDashboard = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      const res = await fetch(
        `/api/secretaria/dashboard?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta del dashboard:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    }
  };

  const cargarModuloEmail = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingEmail(true);

      const params = new URLSearchParams();
      params.set("id_secretaria", String(usuario.secretaria.id_secretaria));
      params.set("bandeja", bandejaActual);
      if (filtroCentro !== "todos") params.set("id_centro", filtroCentro);
      if (soloNoLeidos) params.set("solo_no_leidos", "1");
      if (soloImportantes) params.set("solo_importantes", "1");
      if (busqueda.trim()) params.set("q", busqueda.trim());

      const res = await fetch(
        `/api/secretaria/mensajes/email/dashboard?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        console.error("Respuesta módulo email:", data);
        return;
      }

      setCuentas(data.cuentas || []);
      setEstadisticasEmail(data.estadisticas || null);
      setConversaciones(data.conversaciones || []);

      if (data.conversaciones && data.conversaciones.length > 0) {
        const primera = data.conversaciones[0] as EmailResumenConversacion;
        await seleccionarConversacion(primera, false);
      } else {
        setConversacionSeleccionada(null);
        setMensajesConversacion([]);
      }
    } catch (err) {
      console.error("Error al cargar módulo email:", err);
    } finally {
      setLoadingEmail(false);
    }
  };

  const seleccionarConversacion = async (
    conv: EmailResumenConversacion,
    marcarComoLeida: boolean = true
  ) => {
    setConversacionSeleccionada(conv);
    setMensajesConversacion([]);
    try {
      setLoadingDetalle(true);
      const res = await fetch(
        `/api/secretaria/mensajes/email/${encodeURIComponent(conv.id_conversacion)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({} as any));
      if (res.ok && data.success) {
        setMensajesConversacion(data.mensajes || []);
        if (marcarComoLeida) {
          setConversaciones((prev) =>
            prev.map((c) =>
              c.id_conversacion === conv.id_conversacion ? { ...c, no_leidos: 0 } : c
            )
          );
        }
      }
    } catch (err) {
      console.error("Error al cargar conversación:", err);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const enviarEmail = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    const destinatarios = para
      .split(/[;,]/)
      .map((d) => d.trim())
      .filter(Boolean);
    if (destinatarios.length === 0) {
      alert("Debes indicar al menos un destinatario.");
      return;
    }
    if (!asunto.trim()) {
      alert("El asunto no puede estar vacío.");
      return;
    }

    try {
      setEnviandoEmail(true);

      const res = await fetch("/api/secretaria/mensajes/email/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_secretaria: usuario.secretaria.id_secretaria,
          id_cuenta_origen: cuentaSeleccionada === "principal" ? null : cuentaSeleccionada,
          modo: modoRedaccion || "nuevo",
          id_conversacion_origen: conversacionOrigenId,
          para: destinatarios,
          cc: cc
            .split(/[;,]/)
            .map((d) => d.trim())
            .filter(Boolean),
          bcc: bcc
            .split(/[;,]/)
            .map((d) => d.trim())
            .filter(Boolean),
          asunto: asunto.trim(),
          cuerpo_texto: contenido,
          asociar_contexto: {
            asociar_centro: asociarACentro,
            id_centro:
              filtroCentro !== "todos"
                ? Number(filtroCentro)
                : usuario.secretaria.id_centro,
            asociar_paciente: asociarAPaciente,
            rut_paciente: asociarAPaciente && rutPaciente.trim() ? rutPaciente.trim() : null,
          },
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        console.error("Error al enviar email:", data);
        alert(data.message || "No se pudo enviar el correo.");
        return;
      }

      alert("Correo enviado correctamente.");
      setModoRedaccion(null);
      setPara("");
      setCc("");
      setBcc("");
      setAsunto("");
      setContenido("");
      setConversacionOrigenId(null);

      await cargarModuloEmail();
    } catch (err) {
      console.error("Error al enviar email:", err);
      alert("Ocurrió un error al enviar el correo.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  const marcarConversacionLeida = async (
    conv: EmailResumenConversacion,
    leido: boolean
  ) => {
    try {
      const res = await fetch(
        `/api/secretaria/mensajes/email/${encodeURIComponent(
          conv.id_conversacion
        )}/leido`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ leido }),
        }
      );
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data.success) {
        console.error("Error al marcar leído:", data);
        return;
      }

      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === conv.id_conversacion
            ? { ...c, no_leidos: leido ? 0 : Math.max(c.no_leidos, 1) }
            : c
        )
      );
      if (conversacionSeleccionada?.id_conversacion === conv.id_conversacion && leido) {
        setConversacionSeleccionada({ ...conv, no_leidos: 0 });
      }
    } catch (err) {
      console.error("Error al marcar conversación leída:", err);
    }
  };

  const marcarImportante = async (
    conv: EmailResumenConversacion,
    importante: boolean
  ) => {
    try {
      const res = await fetch(
        `/api/secretaria/mensajes/email/${encodeURIComponent(
          conv.id_conversacion
        )}/importante`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ importante }),
        }
      );
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || !data.success) {
        console.error("Error al marcar importante:", data);
        return;
      }

      setConversaciones((prev) =>
        prev.map((c) =>
          c.id_conversacion === conv.id_conversacion ? { ...c, importante } : c
        )
      );
      if (conversacionSeleccionada?.id_conversacion === conv.id_conversacion) {
        setConversacionSeleccionada({ ...conv, importante });
      }
    } catch (err) {
      console.error("Error al marcar importante:", err);
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

  const marcarNotificacionLeida = async (idNotificacion: number) => {
    try {
      const response = await fetch(
        `/api/secretaria/notificaciones/${idNotificacion}/leer`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotificaciones((prev) =>
          prev.map((notif) =>
            notif.id_notificacion === idNotificacion
              ? { ...notif, leida: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  // Redacción helpers

  const prepararRedaccionNueva = () => {
    setModoRedaccion("nuevo");
    setConversacionOrigenId(null);
    setPara("");
    setCc("");
    setBcc("");
    setAsunto("");
    setContenido("");
  };

  const prepararRespuesta = (modo: "responder" | "responder_todos" | "reenviar") => {
    if (!conversacionSeleccionada) return;

    setModoRedaccion(modo);
    setConversacionOrigenId(conversacionSeleccionada.id_conversacion);

    const remitente = conversacionSeleccionada.remitente_email;
    const otros = conversacionSeleccionada.destinatarios_resumen || "";

    if (modo === "responder") {
      setPara(remitente);
      setCc("");
    } else if (modo === "responder_todos") {
      setPara(`${remitente}${otros ? `; ${otros}` : ""}`);
    } else if (modo === "reenviar") {
      setPara("");
      setCc("");
      setBcc("");
    }

    const prefijo = modo === "reenviar" ? "Fwd: " : "Re: ";
    const asuntoBase = conversacionSeleccionada.asunto || "(sin asunto)";
    setAsunto(
      asuntoBase.startsWith(prefijo) ? asuntoBase : `${prefijo}${asuntoBase}`
    );

    const ultimo = mensajesConversacion[mensajesConversacion.length - 1];
    const cita = ultimo
      ? `\n\n----- Mensaje original -----\nDe: ${ultimo.remitente_nombre} <${ultimo.remitente_email}>\nEnviado: ${formatearFechaHoraLarga(
          ultimo.fecha_envio
        )}\n\n${ultimo.cuerpo_texto || ""}`
      : "";

    setContenido(cita);
  };

  // ========================================
  // HELPERS
  // ========================================

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerIniciales = (nombre: string) => {
    if (!nombre) return "?";
    return nombre
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
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

  const formatearFechaHoraLarga = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearFechaCortaEmail = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const mismaFecha =
      date.getFullYear() === hoy.getFullYear() &&
      date.getMonth() === hoy.getMonth() &&
      date.getDate() === hoy.getDate();

    if (mismaFecha) {
      return new Intl.DateTimeFormat("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  const obtenerContadorBandeja = (bandeja: EmailBandeja, tipo: "total" | "no_leidos") => {
    const registro = estadisticasEmail?.por_bandeja?.find(
      (b) => b.bandeja === bandeja
    );
    if (!registro) return 0;
    return tipo === "total" ? registro.total : registro.no_leidos;
  };

  const obtenerColorFiltroToggle = (activo: boolean) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    if (!activo) {
      return isDark
        ? "bg-gray-800 text-gray-300 border-gray-700"
        : "bg-gray-100 text-gray-700 border-gray-200";
    }
    return isDark
      ? "bg-indigo-600 text-white border-indigo-500"
      : "bg-indigo-600 text-white border-indigo-500";
  };

  const conversacionesFiltradas = useMemo(() => {
    let lista = [...conversaciones];

    if (filtroCentro !== "todos") {
      lista = lista.filter(
        (c) => c.centro && String(c.centro.id_centro) === filtroCentro
      );
    }

    if (soloNoLeidos) {
      lista = lista.filter((c) => c.no_leidos > 0);
    }

    if (soloImportantes) {
      lista = lista.filter((c) => c.importante);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.asunto.toLowerCase().includes(q) ||
          c.remitente_nombre.toLowerCase().includes(q) ||
          c.remitente_email.toLowerCase().includes(q) ||
          c.fragmento.toLowerCase().includes(q) ||
          (c.destinatarios_resumen || "").toLowerCase().includes(q) ||
          (c.paciente?.nombre_completo || "").toLowerCase().includes(q) ||
          (c.paciente?.rut || "").toLowerCase().includes(q)
      );
    }

    return lista;
  }, [conversaciones, filtroCentro, soloNoLeidos, soloImportantes, busqueda]);

  const obtenerNombreBandeja = (b: EmailBandeja) => {
    switch (b) {
      case "inbox":
        return "Bandeja de Entrada";
      case "sent":
        return "Enviados";
      case "drafts":
        return "Borradores";
      case "archived":
        return "Archivados";
      case "spam":
        return "Correo no deseado";
      case "trash":
        return "Papelera";
      case "all":
        return "Todos";
      default:
        return b;
    }
  };

  const centroPrincipalNombre =
    usuario?.secretaria?.centro?.nombre || "Centro de Salud";

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
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Abriendo Centro de Correos
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Sincronizando mensajes de tu comuna...
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-bounce`}
            ></div>
            <div
              className={`w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-bounce delay-100`}
            ></div>
            <div
              className={`w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-bounce delay-200`}
            ></div>
          </div>
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
            No tienes permisos para acceder al Centro de Correos de Secretaria.
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
  // RENDER - PÁGINA COMPLETA
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}
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
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Mensajería Email
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Mail className="w-6 h-6 text-white" />
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
                    obtenerIniciales(`${usuario.nombre} ${usuario.apellido_paterno}`)
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
                    Secretaria - {centroPrincipalNombre}
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
                  obtenerIniciales(`${usuario.nombre} ${usuario.apellido_paterno}`)
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================
          HEADER
          ======================================== */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda global (filtra correos) */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar correo, paciente, RUT, asunto, remitente..."
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
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
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
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
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
                    obtenerIniciales(
                      `${usuario.nombre} ${usuario.apellido_paterno}`
                    )
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
                        obtenerIniciales(
                          `${usuario.nombre} ${usuario.apellido_paterno}`
                        )
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
                        {centroPrincipalNombre}
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

      {/* ========================================
          CONTENIDO PRINCIPAL
          ======================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Saludo + título módulo */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">📨</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Centro de Mensajería por Email sincronizado con{" "}
              <span className="font-bold">{centroPrincipalNombre}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prepararRedaccionNueva}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <Plus className="w-4 h-4" />
              Nuevo correo
            </button>

            <button
              onClick={cargarModuloEmail}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loadingEmail ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Resumen rápido de correos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Recibidos hoy
              </p>
              <p
                className={`text-2xl font-black ${tema.colores.texto} mt-1`}
              >
                {estadisticasEmail?.recibidos_hoy ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Enviados hoy
              </p>
              <p
                className={`text-2xl font-black ${tema.colores.texto} mt-1`}
              >
                {estadisticasEmail?.enviados_hoy ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Sin responder
              </p>
              <p
                className={`text-2xl font-black ${tema.colores.texto} mt-1`}
              >
                {estadisticasEmail?.sin_responder ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Relacionados a pacientes/citas
              </p>
              <p
                className={`text-2xl font-black ${tema.colores.texto} mt-1`}
              >
                {estadisticasEmail?.relacionados_citas ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Layout principal de 3 columnas */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Columna 1: filtros / cuentas */}
          <section
            className={`xl:w-72 flex-shrink-0 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} space-y-4`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p
                    className={`text-sm font-black ${tema.colores.texto}`}
                  >
                    Cuentas conectadas
                  </p>
                  <p
                    className={`text-xs ${tema.colores.textoSecundario}`}
                  >
                    Correos oficiales del centro
                  </p>
                </div>
              </div>
              <Link
                href="/secretaria/configuracion"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Configurar
              </Link>
            </div>

            <div className="space-y-2">
              {cuentas.length === 0 ? (
                <div
                  className={`text-xs py-3 px-3 rounded-xl ${tema.colores.hover} ${tema.colores.textoSecundario}`}
                >
                  No hay cuentas de correo conectadas aún. El administrador puede
                  vincular Gmail/Outlook/IMAP para tu comuna.
                </div>
              ) : (
                cuentas.map((c) => (
                  <div
                    key={c.id_cuenta}
                    className={`flex items-center justify-between p-3 rounded-xl ${tema.colores.hover}`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold ${tema.colores.texto} truncate`}
                      >
                        {c.nombre}
                      </p>
                      <p
                        className={`text-[11px] ${tema.colores.textoSecundario} truncate`}
                      >
                        {c.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                        {c.proveedor.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-300">
                        {c.estado_sincronizacion === "conectada"
                          ? "Conectada"
                          : c.estado_sincronizacion === "sincronizando"
                          ? "Sincronizando..."
                          : "Error"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <hr className={`${tema.colores.borde}`} />

            {/* Bandejas */}
            <div>
              <p
                className={`text-xs font-bold mb-2 ${tema.colores.textoSecundario}`}
              >
                Bandejas
              </p>
              <div className="space-y-1">
                {(["inbox", "sent", "drafts", "archived", "spam", "trash", "all"] as EmailBandeja[]).map(
                  (b) => {
                    const total = obtenerContadorBandeja(b, "total");
                    const noLeidos = obtenerContadorBandeja(b, "no_leidos");
                    const activo = bandejaActual === b;

                    return (
                      <button
                        key={b}
                        onClick={() => setBandejaActual(b)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activo
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {b === "inbox" && (
                            <Inbox className="w-3.5 h-3.5" />
                          )}
                          {b === "sent" && (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {b === "drafts" && (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          {b === "archived" && (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                          {b === "spam" && (
                            <AlertOctagon className="w-3.5 h-3.5" />
                          )}
                          {b === "trash" && (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          {b === "all" && (
                            <Globe className="w-3.5 h-3.5" />
                          )}
                          <span>{obtenerNombreBandeja(b)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          {noLeidos > 0 && (
                            <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5">
                              {noLeidos > 99 ? "99+" : noLeidos}
                            </span>
                          )}
                          <span className="text-[10px] opacity-70">
                            {total}
                          </span>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <hr className={`${tema.colores.borde}`} />

            {/* Filtros rápidos */}
            <div className="space-y-3">
              <p
                className={`text-xs font-bold ${tema.colores.textoSecundario}`}
              >
                Filtros rápidos
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setSoloNoLeidos((v) => !v)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold ${obtenerColorFiltroToggle(
                    soloNoLeidos
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Solo no leídos
                  </span>
                  {soloNoLeidos && <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setSoloImportantes((v) => !v)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold ${obtenerColorFiltroToggle(
                    soloImportantes
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5" />
                    Solo importantes
                  </span>
                  {soloImportantes && <Check className="w-3 h-3" />}
                </button>
              </div>

              {/* Filtro centros */}
              <div className="space-y-1">
                <p
                  className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                >
                  Centro de salud
                </p>
                <select
                  value={filtroCentro}
                  onChange={(e) => setFiltroCentro(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                >
                  <option value="todos">Todos mis centros</option>
                  {estadisticasEmail?.por_centro?.map((c) => (
                    <option key={c.id_centro} value={c.id_centro}>
                      {c.nombre}
                    </option>
                  ))}
                  {!estadisticasEmail?.por_centro?.length &&
                    usuario.secretaria.centro && (
                      <option
                        value={usuario.secretaria.centro.id_centro}
                      >
                        {usuario.secretaria.centro.nombre}
                      </option>
                    )}
                </select>
              </div>
            </div>

            {/* Mini gráfico actividad email */}
            <div className="mt-4">
              <p
                className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
              >
                Actividad semanal de correos
              </p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={datosEmailSemana}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="dia"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "10px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "10px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: "12px",
                        padding: "8px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar
                      dataKey="recibidos"
                      name="Recibidos"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="enviados"
                      name="Enviados"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Columna 2: lista de conversaciones */}
          <section
            className={`xl:w-[420px] flex-shrink-0 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-black ${tema.colores.texto}`}
                >
                  Conversaciones
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold">
                  {conversacionesFiltradas.length} visibles
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={prepararRedaccionNueva}
                  className="p-2 rounded-lg bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className={tema.colores.textoSecundario}>
                {obtenerNombreBandeja(bandejaActual)}
              </span>
              <span className={tema.colores.textoSecundario}>
                {soloNoLeidos
                  ? "Mostrando solo no leídos"
                  : "Todos los correos de la bandeja"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {loadingEmail ? (
                <div className="flex items-center justify-center h-full py-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-400" />
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Sincronizando correos desde tus cuentas conectadas...
                    </p>
                  </div>
                </div>
              ) : conversacionesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                  <Inbox
                    className={`w-10 h-10 mb-3 ${tema.colores.textoSecundario}`}
                  />
                  <p
                    className={`text-sm font-semibold ${tema.colores.texto}`}
                  >
                    No hay correos en esta vista
                  </p>
                  <p
                    className={`text-xs ${tema.colores.textoSecundario}`}
                  >
                    Cambia de bandeja o ajusta los filtros para ver otros
                    mensajes.
                  </p>
                </div>
              ) : (
                conversacionesFiltradas.map((conv) => {
                  const seleccionado =
                    conversacionSeleccionada?.id_conversacion ===
                    conv.id_conversacion;
                  return (
                    <button
                      key={conv.id_conversacion}
                      onClick={() => seleccionarConversacion(conv)}
                      className={`w-full text-left rounded-2xl px-3 py-3 transition-all ${
                        seleccionado
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            seleccionado
                              ? "bg-white/20 text-white"
                              : "bg-indigo-500/15 text-indigo-400"
                          }`}
                        >
                          {obtenerIniciales(conv.remitente_nombre)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p
                                className={`text-xs font-bold truncate ${
                                  seleccionado
                                    ? "text-white"
                                    : conv.no_leidos > 0
                                    ? "text-gray-900 dark:text-white"
                                    : tema.colores.texto
                                }`}
                              >
                                {conv.remitente_nombre ||
                                  conv.remitente_email}
                              </p>
                              {conv.paciente && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 font-semibold">
                                  Paciente
                                </span>
                              )}
                              {conv.centro && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-100 font-semibold">
                                  {conv.centro.nombre}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] ${
                                seleccionado
                                  ? "text-white/80"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {formatearFechaCortaEmail(conv.fecha_ultima)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xs truncate ${
                                seleccionado
                                  ? "text-white/90"
                                  : conv.no_leidos > 0
                                  ? "font-semibold"
                                  : tema.colores.texto
                              }`}
                            >
                              {conv.asunto || "(sin asunto)"}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {conv.tiene_adjuntos && (
                                <Paperclip
                                  className={`w-3 h-3 ${
                                    seleccionado
                                      ? "text-white/80"
                                      : tema.colores.textoSecundario
                                  }`}
                                />
                              )}
                              {conv.importante ? (
                                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                              ) : null}
                              {conv.no_leidos > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                                  {conv.no_leidos}
                                </span>
                              )}
                            </div>
                          </div>
                          <p
                            className={`text-[11px] mt-1 line-clamp-1 ${
                              seleccionado
                                ? "text-white/80"
                                : tema.colores.textoSecundario
                            }`}
                          >
                            {conv.fragmento}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Columna 3: detalle + redacción */}
          <section
            className={`flex-1 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col gap-4`}
          >
            {/* Redactor */}
            {modoRedaccion && (
              <div
                className={`rounded-2xl p-4 border-2 border-indigo-500/40 bg-indigo-500/5 space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center">
                      <PenIcon className="w-4 h-4 text-indigo-100" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-black ${tema.colores.texto}`}
                      >
                        {modoRedaccion === "nuevo"
                          ? "Nuevo correo"
                          : modoRedaccion === "responder"
                          ? "Responder"
                          : modoRedaccion === "responder_todos"
                          ? "Responder a todos"
                          : "Reenviar correo"}
                      </p>
                      <p
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Enviado desde la cuenta oficial del centro
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={
                        cuentaSeleccionada === "principal"
                          ? "principal"
                          : String(cuentaSeleccionada)
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setCuentaSeleccionada(
                          val === "principal" ? "principal" : Number(val)
                        );
                      }}
                      className={`text-[11px] px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="principal">
                        {centroPrincipalNombre} (principal)
                      </option>
                      {cuentas.map((c) => (
                        <option key={c.id_cuenta} value={c.id_cuenta}>
                          {c.nombre} - {c.email}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setModoRedaccion(null)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-300 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-semibold text-right">
                      Para:
                    </span>
                    <input
                      value={para}
                      onChange={(e) => setPara(e.target.value)}
                      placeholder="correo1@ejemplo.cl; correo2@ejemplo.cl"
                      className={`flex-1 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} text-[11px]`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-semibold text-right">
                      CC:
                    </span>
                    <input
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      className={`flex-1 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-[11px]`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-semibold text-right">
                      CCO:
                    </span>
                    <input
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      className={`flex-1 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-[11px]`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-semibold text-right">
                      Asunto:
                    </span>
                    <input
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className={`flex-1 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-[11px]`}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 text-[11px]">
                  <div className="flex-1">
                    <textarea
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                      rows={8}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-[11px] resize-y`}
                      placeholder="Escribe el contenido del correo. Puedes incluir información del paciente, indicaciones, etc."
                    />
                  </div>
                  <div className="w-full md:w-52 space-y-2">
                    <p
                      className={`text-[11px] font-bold ${tema.colores.textoSecundario}`}
                    >
                      Contexto del correo
                    </p>
                    <div
                      className={`p-2 rounded-xl ${tema.colores.hover} space-y-2`}
                    >
                      <label className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>Asociar al centro</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={asociarACentro}
                          onChange={(e) =>
                            setAsociarACentro(e.target.checked)
                          }
                          className="w-3 h-3"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1">
                          <HeartPulse className="w-3 h-3" />
                          <span>Asociar a paciente</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={asociarAPaciente}
                          onChange={(e) =>
                            setAsociarAPaciente(e.target.checked)
                          }
                          className="w-3 h-3"
                        />
                      </label>
                      {asociarAPaciente && (
                        <input
                          value={rutPaciente}
                          onChange={(e) => setRutPaciente(e.target.value)}
                          placeholder="RUT paciente (opcional)"
                          className={`mt-1 w-full px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`text-[11px] font-bold ${tema.colores.textoSecundario}`}
                      >
                        Atajos rápidos
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Confirmación de cita",
                          "Indicaciones médicas",
                          "Recordatorio de exámenes",
                          "Información administrativa",
                        ].map((plantilla) => (
                          <button
                            key={plantilla}
                            type="button"
                            onClick={() =>
                              setContenido(
                                (prev) =>
                                  `${prev ? prev + "\n\n" : ""}${plantilla}: `
                              )
                            }
                            className="px-2 py-1 rounded-full bg-indigo-500/10 text-[10px] text-indigo-200 hover:bg-indigo-500/20"
                          >
                            {plantilla}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full mt-2 px-3 py-1.5 rounded-lg border border-dashed border-indigo-400 text-[11px] text-indigo-200 flex items-center justify-center gap-1 hover:bg-indigo-500/10"
                    >
                      <Paperclip className="w-3 h-3" />
                      Adjuntar archivos (implementación en backend)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-indigo-500/30">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={enviarEmail}
                      disabled={enviandoEmail}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white ${tema.colores.sombra} disabled:opacity-60`}
                    >
                      {enviandoEmail ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Enviar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-gray-500/20 hover:bg-gray-500/30"
                    >
                      Guardar borrador
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Tag className="w-3 h-3" />
                    <span className={tema.colores.textoSecundario}>
                      El correo quedará trazado como gestión de secretaria del
                      centro.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detalle conversación */}
            <div className="flex-1 rounded-2xl p-3 bg-black/5 dark:bg-white/5 overflow-hidden flex flex-col">
              {!conversacionSeleccionada ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  <Mail
                    className={`w-14 h-14 mb-4 ${tema.colores.textoSecundario}`}
                  />
                  <p
                    className={`text-sm font-semibold ${tema.colores.texto}`}
                  >
                    Selecciona una conversación para ver los detalles
                  </p>
                  <p
                    className={`text-xs ${tema.colores.textoSecundario} mt-1`}
                  >
                    Aquí verás todos los correos, respuestas, archivos y
                    contexto del paciente/centro.
                  </p>
                </div>
              ) : (
                <>
                  {/* Cabecera conversación */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-black ${tema.colores.texto} mb-1`}
                      >
                        {conversacionSeleccionada.asunto || "(sin asunto)"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-200 font-semibold flex items-center gap-1`}
                        >
                          <Inbox className="w-3 h-3" />
                          {obtenerNombreBandeja(bandejaActual)}
                        </span>
                        {conversacionSeleccionada.centro && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-100 font-semibold flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {conversacionSeleccionada.centro.nombre}
                          </span>
                        )}
                        {conversacionSeleccionada.paciente && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 font-semibold flex items-center gap-1">
                            <HeartPulse className="w-3 h-3" />
                            {conversacionSeleccionada.paciente.nombre_completo}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full bg-gray-500/15 text-[10px] ${tema.colores.textoSecundario}`}
                        >
                          {conversacionSeleccionada.total_mensajes} mensajes
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            marcarImportante(
                              conversacionSeleccionada,
                              !conversacionSeleccionada.importante
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-yellow-300"
                        >
                          {conversacionSeleccionada.importante ? (
                            <Star className="w-4 h-4 fill-yellow-300" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            marcarConversacionLeida(
                              conversacionSeleccionada,
                              conversacionSeleccionada.no_leidos > 0
                                ? true
                                : false
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-200"
                        >
                          {conversacionSeleccionada.no_leidos > 0 ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <Mail className="w-4 h-4 opacity-50" />
                          )}
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-500/20 text-gray-300">
                          <Archive className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        className="flex items-center gap-1 text-[10px] text-indigo-300 hover:text-indigo-200"
                        onClick={() => {
                          // Abrir en webmail del backend si existe
                          window.open(
                            `/secretaria/mensajes/email/external/${encodeURIComponent(
                              conversacionSeleccionada.id_conversacion
                            )}`,
                            "_blank"
                          );
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver en webmail seguro
                      </button>
                    </div>
                  </div>

                  {/* Acciones de respuesta */}
                  <div className="flex items-center gap-2 mb-3 text-[11px]">
                    <button
                      onClick={() => prepararRespuesta("responder")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-1 hover:bg-indigo-700"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Responder
                    </button>
                    <button
                      onClick={() => prepararRespuesta("responder_todos")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-100 font-semibold flex items-center gap-1 hover:bg-indigo-500/30"
                    >
                      <ReplyAll className="w-3.5 h-3.5" />
                      Responder a todos
                    </button>
                    <button
                      onClick={() => prepararRespuesta("reenviar")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-100 font-semibold flex items-center gap-1 hover:bg-indigo-500/30"
                    >
                      <Forward className="w-3.5 h-3.5" />
                      Reenviar
                    </button>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {loadingDetalle ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                      </div>
                    ) : mensajesConversacion.length === 0 ? (
                      <div className="py-8 text-center text-xs">
                        <p
                          className={`mb-1 ${tema.colores.textoSecundario}`}
                        >
                          No se pudieron cargar los mensajes de esta
                          conversación.
                        </p>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Intenta actualizar o vuelve a abrir la conversación.
                        </p>
                      </div>
                    ) : (
                      mensajesConversacion.map((m) => (
                        <div
                          key={m.id_mensaje}
                          className={`rounded-2xl px-3 py-2.5 bg-black/5 dark:bg-white/5 border border-white/5`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-100 flex-shrink-0">
                                {obtenerIniciales(m.remitente_nombre)}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-semibold ${tema.colores.texto} truncate`}
                                >
                                  {m.remitente_nombre}{" "}
                                  <span
                                    className={`font-normal ${tema.colores.textoSecundario}`}
                                  >
                                    {"<"}
                                    {m.remitente_email}
                                    {">"}
                                  </span>
                                </p>
                                <p
                                  className={`text-[10px] ${tema.colores.textoSecundario}`}
                                >
                                  Para: {m.destinatarios.join(", ")}
                                  {m.cc.length > 0 && `  |  CC: ${m.cc.join(", ")}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`text-[10px] ${tema.colores.textoSecundario}`}
                              >
                                {formatearFechaHoraLarga(m.fecha_envio)}
                              </span>
                              {m.estado_entrega && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-200 font-semibold">
                                  {m.estado_entrega}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className={`mt-1 text-[11px] leading-snug ${tema.colores.texto}`}
                          >
                            {/* Render HTML con cuidado */}
                            {m.cuerpo_html ? (
                              <div
                                className="prose prose-invert max-w-none text-[11px]"
                                dangerouslySetInnerHTML={{
                                  __html: m.cuerpo_html,
                                }}
                              />
                            ) : (
                              <pre className="whitespace-pre-wrap font-sans">
                                {m.cuerpo_texto}
                              </pre>
                            )}
                          </div>
                          {m.adjuntos.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                              {m.adjuntos.map((a) => (
                                <a
                                  key={a.id_adjunto}
                                  href={a.url_descarga || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 rounded-full bg-gray-500/15 hover:bg-gray-500/25 flex items-center gap-1"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">
                                    {a.nombre_archivo}
                                  </span>
                                  <span className="opacity-70">
                                    {Math.round(a.peso_bytes / 1024)} KB
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-8`}
      >
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed. Centro de Mensajería para Atención Primaria.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Email v1.0.0
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

// Icono simple para el redactor
function PenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L9 17l-4 1 1-4 10.5-10.5Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
