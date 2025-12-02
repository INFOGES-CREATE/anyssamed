"use client";

import { useState, useEffect, useMemo } from "react";
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

// para los badges del menú, igual que en el dashboard
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

// Documentos

type EstadoDocumento = "pendiente" | "firmado" | "entregado" | "anulado" | "vencido";
type TipoDocumento =
  | "certificado"
  | "receta"
  | "orden"
  | "interconsulta"
  | "licencia"
  | "otro";
type CanalEntrega = "presencial" | "email" | "whatsapp" | "portal";

interface DocumentoClinico {
  id_documento: number;
  tipo: TipoDocumento;
  titulo: string;
  categoria: string;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    rut: string;
  };
  medico: {
    id_profesional: number;
    nombre_completo: string;
    especialidad: string;
  };
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: EstadoDocumento;
  canal_entrega: CanalEntrega;
  prioridad: "normal" | "alta" | "urgente";
  firmado_digitalmente: boolean;
  tiene_archivo: boolean;
  url_archivo?: string | null;
  creado_por_secretaria: boolean;
  observacion?: string | null;
}

interface EstadisticasDocumentos {
  total_hoy: number;
  total_semana: number;
  total_mes: number;
  certificados_hoy: number;
  recetas_hoy: number;
  ordenes_hoy: number;
  pendientes_firma: number;
  pendientes_entrega: number;
  anulados_hoy: number;
  enviados_digital_hoy: number;
  impresos_hoy: number;
}

interface ActividadDocumento {
  id: number;
  tipo: "creado" | "firmado" | "entregado" | "anulado" | "enviado";
  descripcion: string;
  fecha_hora: string;
  usuario: string;
}

// ========================================
// CONFIGURACIONES DE TEMAS
// (MISMO SISTEMA QUE EN EL DASHBOARD)
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
// COMPONENTE PRINCIPAL
// ========================================

export default function DocumentosSecretariaPage() {
  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Datos generales (para badges de menú y notificaciones)
  const [estadisticas, setEstadisticas] = useState<EstadisticasSecretaria | null>(null);
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Datos propios de documentos
  const [estadisticasDocs, setEstadisticasDocs] =
    useState<EstadisticasDocumentos | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [actividadesDocumentos, setActividadesDocumentos] = useState<
    ActividadDocumento[]
  >([]);

  // UI
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva] = useState("documentos");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  // Filtros de documentos
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroCanal, setFiltroCanal] = useState<string>("todos");
  const [filtroRangoFecha, setFiltroRangoFecha] = useState<string>("hoy");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ DE NAVEGACIÓN (MISMO ESTILO)
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
      url: "/secretaria/agenda",
      badge: estadisticas?.citas_programadas_hoy || 0,
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
      url: "/secretaria/confirmaciones",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
      submenu: [
        { titulo: "Pendientes", icono: Clock, url: "/secretaria/confirmaciones/pendientes" },
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
      url: "/secretaria/llamadas",
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
      url: "/secretaria/pacientes",
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
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
      submenu: [
        { titulo: "Programados", icono: Clock, url: "/secretaria/recordatorios/programados" },
        { titulo: "Enviados", icono: Send, url: "/secretaria/recordatorios/enviados" },
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
      activo: seccionActiva === "documentos",
      badge: estadisticasDocs?.pendientes_firma || 0,
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
      url: "/secretaria/mensajes",
      badge: estadisticas?.mensajes_sin_leer || 0,
      submenu: [
        { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
        { titulo: "WhatsApp", icono: MessageSquare, url: "/secretaria/mensajes/whatsapp" },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "/secretaria/telemedicina",
      badge: estadisticas?.consultas_telemedicina_hoy || 0,
      submenu: [
        { titulo: "Sala Espera", icono: Clock, url: "/secretaria/telemedicina/espera" },
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
      url: "/secretaria/tareas",
      badge: estadisticas?.tareas_pendientes || 0,
      submenu: [
        { titulo: "Pendientes", icono: Square, url: "/secretaria/tareas/pendientes" },
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
      url: "/secretaria/reportes",
      submenu: [
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/metricas" },
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
      url: "/secretaria/perfil",
      submenu: [
        { titulo: "Información Personal", icono: User, url: "/secretaria/perfil" },
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
      url: "/secretaria/configuracion",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/general" },
        {
          titulo: "Notificaciones",
          icono: Bell,
          url: "/secretaria/configuracion/notificaciones",
        },
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
      cargarDatosGenerales();
      cargarDatosDocumentos();
    }
  }, [usuario]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.secretaria) {
        cargarDatosDocumentos();
      }
    }, 180000); // 3 minutos

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

  const cargarDatosGenerales = async () => {
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

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta dashboard (documentos):", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("Error al cargar datos generales:", err);
    }
  };

  const cargarDatosDocumentos = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingData(true);

      const res = await fetch(
        `/api/secretaria/documentos?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta documentos:", data);
        return;
      }

      setDocumentos(data.documentos || []);

      if (data.estadisticas_documentos) {
        setEstadisticasDocs(data.estadisticas_documentos);
      } else {
        // fallback por si la API aún no está lista
        const totalHoy = (data.documentos || []).length;
        setEstadisticasDocs({
          total_hoy: totalHoy,
          total_semana: data.total_semana || totalHoy,
          total_mes: data.total_mes || totalHoy,
          certificados_hoy: data.certificados_hoy || 0,
          recetas_hoy: data.recetas_hoy || 0,
          ordenes_hoy: data.ordenes_hoy || 0,
          pendientes_firma: data.pendientes_firma || 0,
          pendientes_entrega: data.pendientes_entrega || 0,
          anulados_hoy: data.anulados_hoy || 0,
          enviados_digital_hoy: data.enviados_digital_hoy || 0,
          impresos_hoy: data.impresos_hoy || 0,
        });
      }

      setActividadesDocumentos(data.actividades || []);
    } catch (err) {
      console.error("Error al cargar documentos:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // ========================================
  // ACCIONES
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

  const manejarVerDocumento = (doc: DocumentoClinico) => {
    if (doc.url_archivo) {
      window.open(doc.url_archivo, "_blank");
    } else {
      window.open(`/secretaria/documentos/${doc.id_documento}/vista-previa`, "_blank");
    }
  };

  const manejarImprimirDocumento = (doc: DocumentoClinico) => {
    window.open(`/secretaria/documentos/${doc.id_documento}/imprimir`, "_blank");
  };

  const manejarEnviarDocumento = async (
    doc: DocumentoClinico,
    canal: "email" | "whatsapp"
  ) => {
    try {
      const res = await fetch(
        `/api/secretaria/documentos/${doc.id_documento}/enviar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ canal }),
        }
      );

      if (res.ok) {
        alert(
          `Documento enviado por ${
            canal === "email" ? "correo electrónico" : "WhatsApp"
          } correctamente.`
        );
        cargarDatosDocumentos();
      } else {
        alert("Error al enviar el documento.");
      }
    } catch (error) {
      console.error("Error al enviar documento:", error);
      alert("Error al enviar el documento.");
    }
  };

  const manejarMarcarEntregado = async (doc: DocumentoClinico) => {
    try {
      const res = await fetch(
        `/api/secretaria/documentos/${doc.id_documento}/entregado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (res.ok) {
        alert("Documento marcado como entregado.");
        cargarDatosDocumentos();
      } else {
        alert("Error al marcar documento como entregado.");
      }
    } catch (error) {
      console.error("Error al marcar entregado:", error);
      alert("Error al marcar documento como entregado.");
    }
  };

  const manejarAnularDocumento = async (doc: DocumentoClinico) => {
    const confirmar = window.confirm(
      "¿Estás seguro de anular este documento? Esta acción se registra en auditoría."
    );
    if (!confirmar) return;

    try {
      const res = await fetch(
        `/api/secretaria/documentos/${doc.id_documento}/anular`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (res.ok) {
        alert("Documento anulado correctamente.");
        cargarDatosDocumentos();
      } else {
        alert("Error al anular documento.");
      }
    } catch (error) {
      console.error("Error al anular documento:", error);
      alert("Error al anular documento.");
    }
  };

  // ========================================
  // AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatearFechaHora = (fecha: string) => {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerColorEstadoDocumento = (estado: EstadoDocumento) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = (bg: string, text: string, border: string) =>
      `${bg} ${text} ${border}`;

    switch (estado) {
      case "firmado":
        return base(
          isDark ? "bg-emerald-500/20" : "bg-emerald-100",
          isDark ? "text-emerald-300" : "text-emerald-800",
          isDark ? "border-emerald-500/30" : "border-emerald-200"
        );
      case "entregado":
        return base(
          isDark ? "bg-blue-500/20" : "bg-blue-100",
          isDark ? "text-blue-300" : "text-blue-800",
          isDark ? "border-blue-500/30" : "border-blue-200"
        );
      case "pendiente":
        return base(
          isDark ? "bg-yellow-500/20" : "bg-yellow-100",
          isDark ? "text-yellow-300" : "text-yellow-800",
          isDark ? "border-yellow-500/30" : "border-yellow-200"
        );
      case "vencido":
        return base(
          isDark ? "bg-orange-500/20" : "bg-orange-100",
          isDark ? "text-orange-300" : "text-orange-800",
          isDark ? "border-orange-500/30" : "border-orange-200"
        );
      case "anulado":
        return base(
          isDark ? "bg-red-500/20" : "bg-red-100",
          isDark ? "text-red-300" : "text-red-800",
          isDark ? "border-red-500/30" : "border-red-200"
        );
      default:
        return base(
          isDark ? "bg-gray-500/20" : "bg-gray-100",
          isDark ? "text-gray-300" : "text-gray-800",
          isDark ? "border-gray-500/30" : "border-gray-200"
        );
    }
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = (bg: string, text: string, border: string) =>
      `${bg} ${text} ${border}`;

    switch (prioridad) {
      case "urgente":
        return base(
          isDark ? "bg-red-500/20" : "bg-red-100",
          isDark ? "text-red-300" : "text-red-800",
          isDark ? "border-red-500/30" : "border-red-200"
        );
      case "alta":
        return base(
          isDark ? "bg-orange-500/20" : "bg-orange-100",
          isDark ? "text-orange-300" : "text-orange-800",
          isDark ? "border-orange-500/30" : "border-orange-200"
        );
      default:
        return base(
          isDark ? "bg-emerald-500/20" : "bg-emerald-100",
          isDark ? "text-emerald-300" : "text-emerald-800",
          isDark ? "border-emerald-500/30" : "border-emerald-200"
        );
    }
  };

  const obtenerIconoTendencia = (valorActual: number, valorAnterior: number) => {
    if (valorAnterior === 0 && valorActual > 0) {
      return (
        <ArrowUpRight className="w-4 h-4 text-green-500" />
      );
    }
    if (valorActual > valorAnterior) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    }
    if (valorActual < valorAnterior) {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleActualizarTodo = () => {
    if (usuario?.secretaria) {
      cargarDatosGenerales();
      cargarDatosDocumentos();
    }
  };

  const iconoActividadDocumento = (tipo: ActividadDocumento["tipo"]) => {
    switch (tipo) {
      case "creado":
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case "firmado":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "entregado":
        return <Send className="w-5 h-5 text-blue-400" />;
      case "anulado":
        return <AlertOctagon className="w-5 h-5 text-red-400" />;
      case "enviado":
        return <Share2 className="w-5 h-5 text-cyan-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  // ========================================
  // DERIVADOS (FILTROS Y GRÁFICOS)
// ========================================

  const documentosFiltrados = useMemo(() => {
    let resultado = [...documentos];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      resultado = resultado.filter((doc) => {
        const texto =
          `${doc.paciente.nombre_completo} ${doc.paciente.rut} ${doc.medico.nombre_completo} ${doc.titulo} ${doc.tipo} ${doc.categoria}`.toLowerCase();
        return texto.includes(q);
      });
    }

    if (filtroTipo !== "todos") {
      resultado = resultado.filter((doc) => doc.tipo === filtroTipo);
    }

    if (filtroEstado !== "todos") {
      resultado = resultado.filter((doc) => doc.estado === filtroEstado);
    }

    if (filtroCanal !== "todos") {
      resultado = resultado.filter((doc) => doc.canal_entrega === filtroCanal);
    }

    if (filtroRangoFecha !== "todo") {
      const ahora = new Date();
      resultado = resultado.filter((doc) => {
        const fecha = new Date(doc.fecha_emision);
        if (isNaN(fecha.getTime())) return true;

        const diffMs = ahora.getTime() - fecha.getTime();
        const diffDias = diffMs / (1000 * 60 * 60 * 24);

        if (filtroRangoFecha === "hoy") {
          return fecha.toDateString() === ahora.toDateString();
        }
        if (filtroRangoFecha === "7") {
          return diffDias <= 7;
        }
        if (filtroRangoFecha === "30") {
          return diffDias <= 30;
        }
        return true;
      });
    }

    return resultado;
  }, [documentos, busqueda, filtroTipo, filtroEstado, filtroCanal, filtroRangoFecha]);

  const resumenPorTipo = useMemo(() => {
    const mapa: Record<string, number> = {};
    documentos.forEach((doc) => {
      mapa[doc.tipo] = (mapa[doc.tipo] || 0) + 1;
    });

    const colores: Record<string, string> = {
      certificado: "#6366f1",
      receta: "#10b981",
      orden: "#f59e0b",
      interconsulta: "#ec4899",
      licencia: "#0ea5e9",
      otro: "#6b7280",
    };

    return Object.entries(mapa).map(([nombre, valor]) => ({
      nombre,
      valor,
      color: colores[nombre] || "#6b7280",
    }));
  }, [documentos]);

  const resumenPorEstado = useMemo(() => {
    const mapa: Record<string, number> = {};
    documentos.forEach((doc) => {
      mapa[doc.estado] = (mapa[doc.estado] || 0) + 1;
    });
    return [
      { nombre: "Pendientes", valor: mapa["pendiente"] || 0 },
      { nombre: "Firmados", valor: mapa["firmado"] || 0 },
      { nombre: "Entregados", valor: mapa["entregado"] || 0 },
      { nombre: "Vencidos", valor: mapa["vencido"] || 0 },
      { nombre: "Anulados", valor: mapa["anulado"] || 0 },
    ];
  }, [documentos]);

  // ========================================
  // RENDER - LOADING / SIN PERMISOS
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
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Abriendo módulo de documentos
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus certificados, recetas y órdenes...
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
            No tienes permisos para acceder al módulo de documentos de secretaria.
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Documentos de Secretaria
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <FileText className="w-6 h-6 text-white" />
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

      {/* ========================================
          HEADER
          ======================================== */}
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
                placeholder="Buscar documento, paciente, médico, tipo..."
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
            {/* Tema */}
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
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50`}
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
                                {formatearFechaHora(notif.fecha_hora)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notificaciones.length > 5 && (
                    <div
                      className={`p-4 border-t ${tema.colores.borde} text-center`}
                    >
                      <Link
                        href="/secretaria/notificaciones"
                        className={`text-sm font-bold ${tema.colores.acento} hover:underline`}
                      >
                        Ver todas las notificaciones
                      </Link>
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

      {/* ========================================
          CONTENIDO PRINCIPAL
          ======================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Título y botón actualizar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">📄</span>
              </h2>
              <p
                className={`text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Gestión ultra-profesional de certificados, recetas y documentos
                clínicos.
              </p>
              <p
                className={`text-sm mt-1 ${tema.colores.textoSecundario}`}
              >
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <button
                onClick={handleActualizarTodo}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              <Link
                href="/secretaria/documentos/certificados/nuevo"
                className={`flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <Plus className="w-5 h-5" />
                Nuevo Certificado
              </Link>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando documentos, métricas y actividades...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================
                ESTADÍSTICAS PRINCIPALES DE DOCUMENTOS
                ======================================== */}
            {estadisticasDocs && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {/* Documentos hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <Activity className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticasDocs.total_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Documentos Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs flex items-center justify-between">
                    <span className="text-indigo-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {estadisticasDocs.certificados_hoy} certificados
                    </span>
                  </div>
                </div>

                {/* Pendientes firma */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PenToolIcon />
                    </div>
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticasDocs.pendientes_firma}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Pendientes de Firma
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs flex items-center justify-between">
                    <span className="text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Priorizar con el médico
                    </span>
                  </div>
                </div>

                {/* Pendientes entrega */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticasDocs.pendientes_entrega}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Pendientes de Entrega
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs flex items-center justify-between">
                    <span className="text-blue-400 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" />
                      Contactar paciente
                    </span>
                  </div>
                </div>

                {/* Enviados digital */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <Wifi className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticasDocs.enviados_digital_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Enviados Digital Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs flex items-center justify-between">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Con respaldo en el sistema
                    </span>
                  </div>
                </div>

                {/* Impresos */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Printer className="w-6 h-6 text-white" />
                    </div>
                    <FileSpreadsheet className="w-5 h-5 text-gray-300" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticasDocs.impresos_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Impresos Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs flex items-center justify-between">
                    <span className="text-gray-300 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Entregados en ventanilla
                    </span>
                  </div>
                </div>

                {/* Anulados */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <AlertOctagon className="w-6 h-6 text-white" />
                    </div>
                    <Shield className="w-5 h-5 text-red-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticasDocs.anulados_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Anulados Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs flex items-center justify-between">
                    <span className="text-red-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Registrados en auditoría
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================
                FILTROS + TABLA DE DOCUMENTOS
                ======================================== */}
            <div
              className={`rounded-2xl p-6 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              {/* Filtros */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-black ${tema.colores.texto}`}
                    >
                      Documentos Clínicos
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {documentosFiltrados.length} documentos filtrados de{" "}
                      {documentos.length} totales.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todos">Todos los tipos</option>
                    <option value="certificado">Certificados</option>
                    <option value="receta">Recetas</option>
                    <option value="orden">Órdenes</option>
                    <option value="interconsulta">Interconsultas</option>
                    <option value="licencia">Licencias</option>
                    <option value="otro">Otros</option>
                  </select>

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="firmado">Firmados</option>
                    <option value="entregado">Entregados</option>
                    <option value="vencido">Vencidos</option>
                    <option value="anulado">Anulados</option>
                  </select>

                  <select
                    value={filtroCanal}
                    onChange={(e) => setFiltroCanal(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="todos">Todos los canales</option>
                    <option value="presencial">Presencial</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="portal">Portal Paciente</option>
                  </select>

                  <select
                    value={filtroRangoFecha}
                    onChange={(e) => setFiltroRangoFecha(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="hoy">Hoy</option>
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="todo">Todo</option>
                  </select>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr
                      className={`text-xs uppercase tracking-wide ${tema.colores.textoSecundario}`}
                    >
                      <th className="px-4 py-3 text-left">Fecha</th>
                      <th className="px-4 py-3 text-left">Paciente</th>
                      <th className="px-4 py-3 text-left">Documento</th>
                      <th className="px-4 py-3 text-left">Médico</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-left">Canal</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-sm"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`w-16 h-16 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-2`}
                            >
                              <FileText className="w-8 h-8 text-white" />
                            </div>
                            <p
                              className={`font-bold ${tema.colores.texto}`}
                            >
                              No se encontraron documentos con los filtros
                              actuales.
                            </p>
                            <p
                              className={tema.colores.textoSecundario}
                            >
                              Ajusta los filtros o selecciona "Todo".
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      documentosFiltrados.map((doc) => (
                        <tr
                          key={doc.id_documento}
                          className={`border-t ${tema.colores.borde} hover:bg-white/5 transition-colors`}
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold ${tema.colores.texto}`}
                              >
                                {formatearFecha(doc.fecha_emision)}
                              </span>
                              {doc.fecha_vencimiento && (
                                <span
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  Vence: {formatearFecha(doc.fecha_vencimiento)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col">
                              <span
                                className={`font-bold ${tema.colores.texto}`}
                              >
                                {doc.paciente.nombre_completo}
                              </span>
                              <span
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                RUT: {doc.paciente.rut}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`font-semibold ${tema.colores.texto}`}
                              >
                                {doc.titulo}
                              </span>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span
                                  className={`px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                >
                                  {doc.tipo.toUpperCase()}
                                </span>
                                {doc.categoria && (
                                  <span
                                    className={`px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                  >
                                    {doc.categoria}
                                  </span>
                                )}
                                {doc.firmado_digitalmente && (
                                  <span className="px-2 py-1 rounded-full border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Firma Digital
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold ${tema.colores.texto}`}
                              >
                                {doc.medico.nombre_completo}
                              </span>
                              <span
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                {doc.medico.especialidad}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${obtenerColorEstadoDocumento(
                                  doc.estado
                                )}`}
                              >
                                {doc.estado.toUpperCase()}
                              </span>
                              <span
                                className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-semibold ${obtenerColorPrioridad(
                                  doc.prioridad
                                )}`}
                              >
                                <Flame className="w-3 h-3" />
                                {doc.prioridad.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1 text-xs">
                              <span className={tema.colores.textoSecundario}>
                                {doc.canal_entrega === "presencial" && "Presencial"}
                                {doc.canal_entrega === "email" && "Correo electrónico"}
                                {doc.canal_entrega === "whatsapp" && "WhatsApp"}
                                {doc.canal_entrega === "portal" && "Portal Paciente"}
                              </span>
                              {doc.creado_por_secretaria && (
                                <span className="text-[11px] text-indigo-400 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Creado por secretaria
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => manejarVerDocumento(doc)}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105"
                              >
                                <Eye className="w-3 h-3" />
                                Ver
                              </button>
                              <button
                                onClick={() => manejarImprimirDocumento(doc)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105 ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                <Printer className="w-3 h-3" />
                                Imprimir
                              </button>
                              <button
                                onClick={() => manejarEnviarDocumento(doc, "whatsapp")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105 ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                <MessageSquare className="w-3 h-3" />
                                WhatsApp
                              </button>
                              <button
                                onClick={() => manejarEnviarDocumento(doc, "email")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105 ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                <Mail className="w-3 h-3" />
                                Email
                              </button>
                              {doc.estado !== "entregado" &&
                                doc.estado !== "anulado" && (
                                  <button
                                    onClick={() => manejarMarcarEntregado(doc)}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Entregado
                                  </button>
                                )}
                              {doc.estado !== "anulado" && (
                                <button
                                  onClick={() => manejarAnularDocumento(doc)}
                                  className="px-2 py-1 rounded-lg bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================
                GRÁFICOS
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Por tipo */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Documentos por Tipo
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Distribución de los documentos gestionados
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="60%" height={260}>
                    <RechartsPieChart>
                      <Pie
                        data={resumenPorTipo}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="valor"
                      >
                        {resumenPorTipo.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(17,24,39,0.95)",
                          borderRadius: 12,
                          border: "1px solid rgba(129,140,248,0.5)",
                          padding: 10,
                          color: "#fff",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {resumenPorTipo.map((item, idx) => (
                      <div
                        key={idx}
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
                            {item.nombre.toUpperCase()}
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

              {/* Por estado */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Documentos por Estado
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Situación actual de los documentos
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <RechartsBarChart data={resumenPorEstado}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="nombre"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17,24,39,0.95)",
                        borderRadius: 12,
                        border: "1px solid rgba(52,211,153,0.5)",
                        padding: 10,
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valor"
                      name="Documentos"
                      radius={[8, 8, 0, 0]}
                      fill="#6366f1"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ========================================
                ACTIVIDAD RECIENTE DE DOCUMENTOS
                ======================================== */}
            {actividadesDocumentos.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-black ${tema.colores.texto}`}
                    >
                      Actividad Reciente en Documentos
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Últimos movimientos de certificados, recetas y órdenes.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {actividadesDocumentos.slice(0, 10).map((actividad) => (
                    <div
                      key={actividad.id}
                      className={`flex items-start gap-4 p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shadow-lg flex-shrink-0">
                        {iconoActividadDocumento(actividad.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold ${tema.colores.texto} mb-1`}
                        >
                          {actividad.descripcion}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={tema.colores.textoSecundario}>
                            {actividad.usuario}
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            {formatearFechaHora(actividad.fecha_hora)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================
          FOOTER
          ======================================== */}
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
                © 2025 AnyssaMed. Módulo de Documentos Clínicos.
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

      {/* ========================================
          ESTILOS GLOBALES (MISMO SISTEMA)
          ======================================== */}
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

        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

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
      `}</style>
    </div>
  );
}

// Icono simple para "firma" reutilizando lucide existente
function PenToolIcon() {
  return <Edit3Icon />;
}

// Reutilizamos un icono ya existente en lucide (por seguridad de imports)
function Edit3Icon() {
  return <Edit3Svg />;
}

// SVG inline (no depende de nuevos imports)
function Edit3Svg() {
  return (
    <svg
      className="w-5 h-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
