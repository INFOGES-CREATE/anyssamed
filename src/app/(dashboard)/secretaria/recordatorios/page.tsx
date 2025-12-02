// src/app/(dashboard)/secretaria/recordatorios/page.tsx
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

const RECORDATORIOS_DEMO: Recordatorio[] = [
  {
    id_recordatorio: 1,
    id_cita: 101,
    id_paciente: 5001,
    paciente_nombre: "Juan Pérez",
    paciente_telefono: "752345678",
    paciente_celular: "+56 9 1234 5678",
    paciente_email: "juan.perez@example.com",
    canal: "whatsapp",
    estado: "pendiente",
    prioridad: "alta",
    fecha_hora_envio: new Date().toISOString(),
    mensaje_resumen:
      "Recordatorio de cita mañana a las 09:00 con Dra. Rojas en CESFAM Colón.",
    intentos: 0,
    ultimo_intento: null,
    creado_por: "Secretaria Ana",
    via_automatico: true,
  },
  {
    id_recordatorio: 2,
    id_cita: 102,
    id_paciente: 5002,
    paciente_nombre: "María González",
    paciente_telefono: null,
    paciente_celular: "+56 9 2222 3333",
    paciente_email: "maria.gonzalez@example.com",
    canal: "sms",
    estado: "programado",
    prioridad: "media",
    fecha_hora_envio: new Date(
      new Date().getTime() + 2 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Recordatorio de control de enfermería hoy a las 16:00 en CESFAM Sarmiento.",
    intentos: 0,
    ultimo_intento: null,
    creado_por: "Secretaria Ana",
    via_automatico: true,
  },
  {
    id_recordatorio: 3,
    id_cita: 103,
    id_paciente: 5003,
    paciente_nombre: "Pedro Lagos",
    paciente_telefono: "752987654",
    paciente_celular: null,
    paciente_email: "pedro.lagos@example.com",
    canal: "email",
    estado: "enviado",
    prioridad: "baja",
    fecha_hora_envio: new Date(
      new Date().getTime() - 3 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Recordatorio enviado para control odontológico mañana 10:30.",
    intentos: 1,
    ultimo_intento: new Date(
      new Date().getTime() - 3 * 60 * 60 * 1000
    ).toISOString(),
    creado_por: "Sistema automático",
    via_automatico: true,
  },
  {
    id_recordatorio: 4,
    id_cita: 104,
    id_paciente: 5004,
    paciente_nombre: "Lucía Ramírez",
    paciente_telefono: null,
    paciente_celular: "+56 9 8888 9999",
    paciente_email: null,
    canal: "llamada",
    estado: "fallido",
    prioridad: "urgente",
    fecha_hora_envio: new Date(
      new Date().getTime() - 1 * 60 * 60 * 1000
    ).toISOString(),
    mensaje_resumen:
      "Intento de llamada por resultado de examen. Sin respuesta.",
    intentos: 3,
    ultimo_intento: new Date(
      new Date().getTime() - 30 * 60 * 1000
    ).toISOString(),
    creado_por: "Secretaria Ana",
    via_automatico: false,
  },
];

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

// Gráfico: recordatorios últimos 7 días
const datosRecordatoriosSemana = [
  { dia: "Lun", pendientes: 12, enviados: 34, fallidos: 1 },
  { dia: "Mar", pendientes: 9, enviados: 30, fallidos: 2 },
  { dia: "Mié", pendientes: 8, enviados: 32, fallidos: 0 },
  { dia: "Jue", pendientes: 11, enviados: 29, fallidos: 3 },
  { dia: "Vie", pendientes: 10, enviados: 36, fallidos: 1 },
  { dia: "Sáb", pendientes: 4, enviados: 18, fallidos: 0 },
  { dia: "Dom", pendientes: 3, enviados: 12, fallidos: 0 },
];

// Gráfico: canales
const datosCanalesRecordatorios = [
  { nombre: "WhatsApp", valor: 52, color: "#10b981" },
  { nombre: "SMS", valor: 28, color: "#f59e0b" },
  { nombre: "Email", valor: 15, color: "#3b82f6" },
  { nombre: "Llamada", valor: 5, color: "#8b5cf6" },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function resolverCentroAsignado(usuario: any) {
  if (!usuario) return "Centro no asignado";

  // Si es secretaria
  if (usuario.secretaria?.centro?.nombre) {
    return usuario.secretaria.centro.nombre;
  }

  // Si es médico
  if (usuario.medico?.centro?.nombre) {
    return usuario.medico.centro.nombre;
  }

  // Si es administrativo
  if (usuario.administrativo?.centro?.nombre) {
    return usuario.administrativo.centro.nombre;
  }

  // Si es técnico
  if (usuario.tecnico?.centro?.nombre) {
    return usuario.tecnico.centro.nombre;
  }

  // Si usa profesionales_salud
  if (usuario.profesional_salud?.centro?.nombre) {
    return usuario.profesional_salud.centro.nombre;
  }

  // Si tiene centro directo
  if (usuario.centro?.nombre) {
    return usuario.centro.nombre;
  }

  return "Centro no asignado";
}


export default function RecordatoriosSecretariaPage() {
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

  // Recordatorios
  const [loadingData, setLoadingData] = useState(true);
  const [resumenRecordatorios, setResumenRecordatorios] =
    useState<ResumenRecordatorios | null>(null);
  const [recordatoriosProgramados, setRecordatoriosProgramados] = useState<
    Recordatorio[]
  >([]);
  const [recordatoriosRecientes, setRecordatoriosRecientes] = useState<
    Recordatorio[]
  >([]);
  const [configuracionRecordatorios, setConfiguracionRecordatorios] =
    useState<ConfiguracionRecordatorios>(CONFIG_RECORDATORIOS_DEFAULT);
  const [plantillas, setPlantillas] =
    useState<PlantillaRecordatorio[]>(PLANTILLAS_POR_DEFECTO);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroCanal, setFiltroCanal] = useState<string>("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("hoy");

  // Formulario nuevo recordatorio
  const [nuevoPacienteNombre, setNuevoPacienteNombre] = useState("");
  const [nuevoPacienteContacto, setNuevoPacienteContacto] = useState("");
  const [nuevoCanal, setNuevoCanal] =
    useState<CanalRecordatorio>("whatsapp");
  const [nuevoFecha, setNuevoFecha] = useState("");
  const [nuevoHora, setNuevoHora] = useState("");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<
    number | "none"
  >("none");
  const [enviando, setEnviando] = useState(false);

  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  // Menú de navegación (misma estructura, activando Recordatorios)
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
      cargarDatosRecordatorios();
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
          localStorage.setItem("tema_secretaria", data.tema_color);
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

  const cargarDatosRecordatorios = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingData(true);

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
        setRecordatoriosProgramados(
          data.recordatorios_programados || RECORDATORIOS_DEMO
        );
        setRecordatoriosRecientes(
          data.recordatorios_recientes || RECORDATORIOS_DEMO
        );
        setConfiguracionRecordatorios(
          data.configuracion || CONFIG_RECORDATORIOS_DEFAULT
        );
        setPlantillas(data.plantillas || PLANTILLAS_POR_DEFECTO);
      } else {
        // Fallback demo
        setResumenRecordatorios({
          pendientesHoy: 6,
          enviadosHoy: 28,
          fallidosHoy: 1,
          automaticosActivos: 3,
        });
        setRecordatoriosProgramados(RECORDATORIOS_DEMO);
        setRecordatoriosRecientes(RECORDATORIOS_DEMO);
        setConfiguracionRecordatorios(CONFIG_RECORDATORIOS_DEFAULT);
        setPlantillas(PLANTILLAS_POR_DEFECTO);
      }
    } catch (error) {
      console.error("Error al cargar recordatorios:", error);
      setResumenRecordatorios({
        pendientesHoy: 6,
        enviadosHoy: 28,
        fallidosHoy: 1,
        automaticosActivos: 3,
      });
      setRecordatoriosProgramados(RECORDATORIOS_DEMO);
      setRecordatoriosRecientes(RECORDATORIOS_DEMO);
      setConfiguracionRecordatorios(CONFIG_RECORDATORIOS_DEFAULT);
      setPlantillas(PLANTILLAS_POR_DEFECTO);
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

  const toggleConfigBoolean = async (campo: ConfigBooleanKey) => {
    const nuevaConfiguracion: ConfiguracionRecordatorios = {
      ...configuracionRecordatorios,
      [campo]: !configuracionRecordatorios[campo],
    };

    setConfiguracionRecordatorios(nuevaConfiguracion);

    try {
      await fetch("/api/secretaria/recordatorios/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaConfiguracion),
      });
    } catch (error) {
      console.error("No se pudo guardar configuración:", error);
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

    try {
      await fetch("/api/secretaria/recordatorios/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaConfiguracion),
      });
    } catch (error) {
      console.error("No se pudo guardar configuración:", error);
    }
  };

  const handleSeleccionPlantilla = (id: number | "none") => {
    setPlantillaSeleccionada(id);
    if (id === "none") return;
    const plantilla = plantillas.find((p) => p.id_plantilla === id);
    if (plantilla) {
      setNuevoMensaje(plantilla.mensaje);
      if (plantilla.canal !== "todos") {
        setNuevoCanal(plantilla.canal);
      }
    }
  };

  const handleCrearRecordatorio = async (e: any) => {
    e.preventDefault();
    if (!usuario?.secretaria?.id_secretaria) return;

    if (!nuevoPacienteNombre || !nuevoFecha || !nuevoHora || !nuevoMensaje) {
      alert("Completa nombre, fecha, hora y mensaje del recordatorio.");
      return;
    }

    const fechaISO = new Date(`${nuevoFecha}T${nuevoHora}:00`).toISOString();
    const esEmail = nuevoPacienteContacto.includes("@");
    const celular = esEmail ? null : nuevoPacienteContacto || null;
    const email = esEmail ? nuevoPacienteContacto : null;

    try {
      setEnviando(true);

      const response = await fetch("/api/secretaria/recordatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_secretaria: usuario.secretaria.id_secretaria,
          paciente_nombre: nuevoPacienteNombre,
          contacto: nuevoPacienteContacto,
          canal: nuevoCanal,
          fecha_hora_envio: fechaISO,
          mensaje: nuevoMensaje,
          id_plantilla: plantillaSeleccionada === "none" ? null : plantillaSeleccionada,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.message || "No se pudo crear el recordatorio.");
        return;
      }

      const baseRecordatorio: Recordatorio = data.recordatorio || {
        id_recordatorio: Date.now(),
        id_cita: null,
        id_paciente: 0,
        paciente_nombre: nuevoPacienteNombre,
        paciente_telefono: celular,
        paciente_celular: celular,
        paciente_email: email,
        canal: nuevoCanal,
        estado: "programado",
        prioridad: "media",
        fecha_hora_envio: fechaISO,
        mensaje_resumen: nuevoMensaje,
        intentos: 0,
        ultimo_intento: null,
        creado_por: `${usuario.nombre} ${usuario.apellido_paterno}`,
        via_automatico: false,
      };

      setRecordatoriosProgramados((prev) => [baseRecordatorio, ...prev]);
      setResumenRecordatorios((prev) =>
        prev
          ? { ...prev, pendientesHoy: prev.pendientesHoy + 1 }
          : {
              pendientesHoy: 1,
              enviadosHoy: 0,
              fallidosHoy: 0,
              automaticosActivos:
                configuracionRecordatorios.habilitar_sms ||
                configuracionRecordatorios.habilitar_whatsapp ||
                configuracionRecordatorios.habilitar_email
                  ? 1
                  : 0,
            }
      );

      // Limpiar formulario
      setNuevoPacienteNombre("");
      setNuevoPacienteContacto("");
      setNuevoFecha("");
      setNuevoHora("");
      setNuevoMensaje("");
      setPlantillaSeleccionada("none");

      alert("Recordatorio programado correctamente.");
    } catch (error) {
      console.error("Error al crear recordatorio:", error);
      alert("Ocurrió un error al crear el recordatorio.");
    } finally {
      setEnviando(false);
    }
  };

  const enviarAhoraRecordatorio = async (idRecordatorio: number) => {
    try {
      setEnviando(true);

      const response = await fetch(
        `/api/secretaria/recordatorios/${idRecordatorio}/enviar-ahora`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.message || "No se pudo enviar el recordatorio.");
        return;
      }

      setRecordatoriosProgramados((prev) =>
        prev.map((r) =>
          r.id_recordatorio === idRecordatorio
            ? {
                ...r,
                estado: "enviado",
                intentos: r.intentos + 1,
                ultimo_intento: new Date().toISOString(),
              }
            : r
        )
      );

      setResumenRecordatorios((prev) =>
        prev
          ? {
              ...prev,
              enviadosHoy: prev.enviadosHoy + 1,
              pendientesHoy: Math.max(prev.pendientesHoy - 1, 0),
            }
          : {
              pendientesHoy: 0,
              enviadosHoy: 1,
              fallidosHoy: 0,
              automaticosActivos: 0,
            }
      );
    } catch (error) {
      console.error("Error al enviar recordatorio:", error);
      alert("Ocurrió un error al enviar el recordatorio.");
    } finally {
      setEnviando(false);
    }
  };

  const cancelarRecordatorio = async (idRecordatorio: number) => {
    try {
      const response = await fetch(
        `/api/secretaria/recordatorios/${idRecordatorio}/cancelar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ motivo: "Cancelado desde panel de recordatorios" }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || "No se pudo cancelar el recordatorio.");
        return;
      }

      setRecordatoriosProgramados((prev) =>
        prev.map((r) =>
          r.id_recordatorio === idRecordatorio
            ? { ...r, estado: "cancelado" }
            : r
        )
      );
    } catch (error) {
      console.error("Error al cancelar recordatorio:", error);
      alert("Ocurrió un error al cancelar el recordatorio.");
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
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
  // DERIVADOS
  // ========================================

  const recordatoriosFiltrados = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return recordatoriosProgramados.filter((r) => {
      if (filtroEstado !== "todos" && r.estado !== filtroEstado)
        return false;
      if (filtroCanal !== "todos" && r.canal !== filtroCanal) return false;

      if (filtroFecha !== "todos") {
        const fecha = new Date(r.fecha_hora_envio);
        const f = new Date(fecha);
        f.setHours(0, 0, 0, 0);
        const diffDias = Math.round(
          (f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (filtroFecha === "hoy" && diffDias !== 0) return false;
        if (filtroFecha === "manana" && diffDias !== 1) return false;
        if (filtroFecha === "pasados" && diffDias > 0) return false;
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
  }, [recordatoriosProgramados, filtroEstado, filtroCanal, filtroFecha, busqueda]);

  const recordatoriosHoyOrdenados = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const soloHoy = recordatoriosProgramados.filter((r) => {
      const fecha = new Date(r.fecha_hora_envio);
      const f = new Date(fecha);
      f.setHours(0, 0, 0, 0);
      return f.getTime() === hoy.getTime();
    });

    return [...soloHoy].sort(
      (a, b) =>
        new Date(a.fecha_hora_envio).getTime() -
        new Date(b.fecha_hora_envio).getTime()
    );
  }, [recordatoriosProgramados]);

  const historialOrdenado = useMemo(
    () =>
      [...recordatoriosRecientes].sort((a, b) => {
        const fa =
          a.ultimo_intento || a.fecha_hora_envio || new Date().toISOString();
        const fb =
          b.ultimo_intento || b.fecha_hora_envio || new Date().toISOString();
        return new Date(fb).getTime() - new Date(fa).getTime();
      }),
    [recordatoriosRecientes]
  );

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
              <Bell className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando módulo de recordatorios
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus recordatorios inteligentes para pacientes...
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
            No tienes permisos para acceder al módulo de recordatorios.
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
                placeholder="Buscar recordatorio, paciente, mensaje..."
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
        {/* Título y resumen */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">⏰</span>
              </h2>
              <p
                className={`text-lg lg:text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Gestión centralizada de recordatorios para tus pacientes.
              </p>
              <p
                className={`text-sm mt-1 ${tema.colores.textoSecundario} opacity-80`}
              >
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => cargarDatosRecordatorios()}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar datos
              </button>
              <Link
                href="/secretaria/agenda"
                className={`flex items-center gap-2 px-5 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-semibold transition-all duration-300 hover:scale-105`}
              >
                <Calendar className="w-4 h-4" />
                Ver agenda
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
                Cargando recordatorios y configuración...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* STATS */}
            {resumenRecordatorios && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Pendientes hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {resumenRecordatorios.pendientesHoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Pendientes Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-yellow-400 flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      Lista priorizada en el panel
                    </span>
                  </div>
                </div>

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
                    {resumenRecordatorios.enviadosHoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Enviados Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Menos ausentismo en la atención
                    </span>
                  </div>
                </div>

                {/* Fallidos */}
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
                    {resumenRecordatorios.fallidosHoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Fallidos Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-rose-400 flex items-center gap-1">
                      <PhoneOff className="w-3 h-3 hidden" />
                      Revisa teléfonos y canales
                    </span>
                  </div>
                </div>

                {/* Automáticos activos */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {resumenRecordatorios.automaticosActivos}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Flujos Automáticos
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs">
                    <span className="text-indigo-300 flex items-center gap-1">
                      <Rocket className="w-3 h-3" />
                      Recordatorios que se envían solos
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* NUEVO RECORDATORIO + HOY */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Nuevo recordatorio */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Programar nuevo recordatorio
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Envía recordatorios puntuales por WhatsApp, SMS, email o llamada.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={handleCrearRecordatorio}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Nombre del paciente
                      </label>
                      <input
                        type="text"
                        value={nuevoPacienteNombre}
                        onChange={(e) => setNuevoPacienteNombre(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Teléfono o correo
                      </label>
                      <input
                        type="text"
                        value={nuevoPacienteContacto}
                        onChange={(e) =>
                          setNuevoPacienteContacto(e.target.value)
                        }
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                        placeholder="Ej: +56 9..., o correo@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={nuevoFecha}
                        onChange={(e) => setNuevoFecha(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Hora
                      </label>
                      <input
                        type="time"
                        value={nuevoHora}
                        onChange={(e) => setNuevoHora(e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      />
                    </div>
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Canal
                      </label>
                      <select
                        value={nuevoCanal}
                        onChange={(e) =>
                          setNuevoCanal(e.target.value as CanalRecordatorio)
                        }
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="email">Email</option>
                        <option value="llamada">Llamada</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Plantilla rápida
                      </label>
                      <select
                        value={plantillaSeleccionada}
                        onChange={(e) =>
                          handleSeleccionPlantilla(
                            e.target.value === "none"
                              ? "none"
                              : Number(e.target.value)
                          )
                        }
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      >
                        <option value="none">Sin plantilla</option>
                        {plantillas
                          .filter((p) => p.activo)
                          .map((p) => (
                            <option key={p.id_plantilla} value={p.id_plantilla}>
                              {p.nombre}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                      >
                        Prioridad
                      </label>
                      <select
                        className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                        defaultValue="media"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`text-xs font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
                    >
                      Mensaje
                    </label>
                    <textarea
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      rows={5}
                      className={`mt-1 w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="Escribe el mensaje que recibirá el paciente..."
                    />
                  </div>

                  {/* Vista previa */}
                  <div
                    className={`rounded-2xl p-4 border ${tema.colores.borde} ${tema.colores.card} mt-2`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border ${obtenerColorCanal(
                            nuevoCanal
                          )}`}
                        >
                          {iconoCanal(nuevoCanal)}
                        </div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Vista previa ({nuevoCanal.toUpperCase()})
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {nuevoFecha && nuevoHora
                          ? `${nuevoFecha} · ${nuevoHora}`
                          : "Sin fecha/hora definida"}
                      </span>
                    </div>
                    <div
                      className={`rounded-xl px-3 py-2 text-sm ${tema.colores.fondoSecundario} ${tema.colores.textoSecundario}`}
                    >
                      {nuevoMensaje || "Aquí verás el mensaje del paciente..."}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className={tema.colores.textoSecundario}>
                        Se registrará en el historial de recordatorios del
                        paciente.
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={enviando}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-105 ${
                        enviando
                          ? "bg-gray-500 cursor-not-allowed"
                          : tema.colores.primario
                      } ${tema.colores.sombra}`}
                    >
                      {enviando ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Programar recordatorio
                    </button>
                  </div>
                </form>
              </div>

              {/* Hoy */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Clock3 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Recordatorios de hoy
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {recordatoriosHoyOrdenados.length} programados para el día.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
                  {recordatoriosHoyOrdenados.length === 0 ? (
                    <div className="text-center py-12">
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mx-auto mb-3 animate-pulse`}
                      >
                        <Bell className="w-10 h-10 text-white" />
                      </div>
                      <p
                        className={`text-lg font-bold ${tema.colores.texto} mb-1`}
                      >
                        No hay recordatorios programados para hoy.
                      </p>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        Programa recordatorios desde el formulario de la izquierda.
                      </p>
                    </div>
                  ) : (
                    recordatoriosHoyOrdenados.map((r) => (
                      <div
                        key={r.id_recordatorio}
                        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${obtenerColorCanal(
                              r.canal
                            )}`}
                          >
                            {iconoCanal(r.canal)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4
                                className={`text-sm font-black ${tema.colores.texto}`}
                              >
                                {r.paciente_nombre}
                              </h4>
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${obtenerColorEstadoRecordatorio(
                                  r.estado
                                )}`}
                              >
                                {r.estado}
                              </span>
                            </div>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario} mb-1`}
                            >
                              {formatearFecha(r.fecha_hora_envio)}
                            </p>
                            <p
                              className={`text-xs line-clamp-2 ${tema.colores.textoSecundario}`}
                            >
                              {r.mensaje_resumen}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {r.estado !== "enviado" &&
                                r.estado !== "cancelado" && (
                                  <button
                                    onClick={() =>
                                      enviarAhoraRecordatorio(
                                        r.id_recordatorio
                                      )
                                    }
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105"
                                  >
                                    <Zap className="w-3 h-3" />
                                    Enviar ahora
                                  </button>
                                )}
                              {r.estado !== "cancelado" && (
                                <button
                                  onClick={() =>
                                    cancelarRecordatorio(r.id_recordatorio)
                                  }
                                  className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all duration-300 hover:scale-105"
                                >
                                  <X className="w-3 h-3" />
                                  Cancelar
                                </button>
                              )}
                              <span
                                className={`text-[10px] ${tema.colores.textoSecundario}`}
                              >
                                Intentos: {r.intentos}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* LISTA + CONFIG */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Lista + filtros */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Recordatorios programados
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Vista general de todos los recordatorios.
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
                      <option value="pendiente">Pendientes</option>
                      <option value="programado">Programados</option>
                      <option value="enviado">Enviados</option>
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
                      <option value="llamada">Llamadas</option>
                    </select>
                    <select
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="hoy">Hoy</option>
                      <option value="manana">Mañana</option>
                      <option value="pasados">Atrasados</option>
                      <option value="todos">Todas las fechas</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
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
                        className={`grid grid-cols-[auto,1fr,auto] items-center gap-3 px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition-all duration-200`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${obtenerColorCanal(
                            r.canal
                          )}`}
                        >
                          {iconoCanal(r.canal)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-bold truncate ${tema.colores.texto}`}
                            >
                              {r.paciente_nombre}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-bold border ${obtenerColorEstadoRecordatorio(
                                r.estado
                              )}`}
                            >
                              {r.estado}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-[11px] mt-1">
                            <span className={tema.colores.textoSecundario}>
                              {formatearHora(r.fecha_hora_envio)} ·{" "}
                              {r.canal.toUpperCase()}
                            </span>
                            <span className={tema.colores.textoSecundario}>
                              Intentos: {r.intentos}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {r.estado !== "enviado" &&
                            r.estado !== "cancelado" && (
                              <button
                                onClick={() =>
                                  enviarAhoraRecordatorio(r.id_recordatorio)
                                }
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all duration-200"
                              >
                                <Zap className="w-3 h-3" />
                                Enviar
                              </button>
                            )}
                          {r.estado !== "cancelado" && (
                            <button
                              onClick={() =>
                                cancelarRecordatorio(r.id_recordatorio)
                              }
                              className="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all duration-200"
                            >
                              <X className="w-3 h-3" />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Configuración automática */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Recordatorios automáticos
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Define cuándo y cómo se enviarán en forma automática.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div
                    className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-semibold ${tema.colores.texto}`}
                      >
                        WhatsApp antes de la cita
                      </span>
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
                    <div className="flex items-center gap-2">
                      <span
                        className={tema.colores.textoSecundario}
                      >
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
                        className={`w-16 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                      />
                      <span
                        className={tema.colores.textoSecundario}
                      >
                        horas antes.
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-semibold ${tema.colores.texto}`}
                      >
                        SMS antes de la cita
                      </span>
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
                    <div className="flex items-center gap-2">
                      <span
                        className={tema.colores.textoSecundario}
                      >
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
                        className={`w-16 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                      />
                      <span
                        className={tema.colores.textoSecundario}
                      >
                        horas antes.
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-semibold ${tema.colores.texto}`}
                      >
                        Email antes de la cita
                      </span>
                      <button
                        onClick={() => toggleConfigBoolean("habilitar_email")}
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
                    <div className="flex items-center gap-2">
                      <span
                        className={tema.colores.textoSecundario}
                      >
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
                        className={`w-16 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                      />
                      <span
                        className={tema.colores.textoSecundario}
                      >
                        horas antes.
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`font-semibold ${tema.colores.texto}`}
                      >
                        Llamadas automáticas
                      </span>
                      <button
                        onClick={() =>
                          toggleConfigBoolean("habilitar_llamadas_automaticas")
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

                  <div
                    className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                  >
                    <p
                      className={`text-xs ${tema.colores.textoSecundario} mb-2`}
                    >
                      Días hábiles para enviar recordatorios:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {["L", "M", "X", "J", "V", "S", "D"].map(
                        (dia, index) => {
                          const numero = index + 1;
                          const activo =
                            configuracionRecordatorios.dias_recordatorios_libres.includes(
                              numero
                            );
                          return (
                            <span
                              key={dia}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                                activo
                                  ? "bg-indigo-500 text-white border-indigo-400"
                                  : `${tema.colores.card} ${tema.colores.textoSecundario}`
                              }`}
                            >
                              {dia}
                            </span>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GRÁFICOS + HISTORIAL */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Gráfico semana */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Recordatorios últimos 7 días
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Pendientes, enviados y fallidos.
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={datosRecordatoriosSemana}>
                    <defs>
                      <linearGradient
                        id="recPendientes"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="recEnviados"
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
                        id="recFallidos"
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
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: 12,
                        padding: 12,
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="pendientes"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#recPendientes)"
                      name="Pendientes"
                    />
                    <Area
                      type="monotone"
                      dataKey="enviados"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#recEnviados)"
                      name="Enviados"
                    />
                    <Area
                      type="monotone"
                      dataKey="fallidos"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#recFallidos)"
                      name="Fallidos"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Canales + historial corto */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Canales utilizados
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Distribución de recordatorios por canal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={datosCanalesRecordatorios}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {datosCanalesRecordatorios.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 text-xs">
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

                <div className="mt-4 pt-3 border-t border-gray-700/40">
                  <p
                    className={`text-xs font-semibold mb-2 ${tema.colores.textoSecundario}`}
                  >
                    Historial rápido
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                    {historialOrdenado.slice(0, 4).map((r) => (
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
                          {r.estado} · {formatearHora(
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
                © 2025 AnyssaMed. Módulo de Recordatorios.
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
