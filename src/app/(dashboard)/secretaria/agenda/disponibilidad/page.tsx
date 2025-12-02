"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  BellOff,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  RefreshCw,
  CheckSquare,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pill,
  ClipboardCheck,
  Send,
  TrendingUp,
  ClipboardList,
  Award,
  FileText,
  HeartPulse,
  Shield,
  Home,
  Lightbulb,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PieChart,
  Plus,
  CalendarRange,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  Sun,
  Target,
  User,
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
  Zap,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

interface SalaAgenda {
  id_sala: number;
  nombre: string;
  tipo: string;
}

interface TipoCitaAgenda {
  id_tipo_cita: number;
  nombre: string;
  color: string;
  duracion_predeterminada: number;
}

interface BloqueHorarioAgenda {
  id_bloque: number;
  id_centro: number;
  id_sucursal: number | null;
  id_profesional: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_minutos: number;
  estado:
    | "disponible"
    | "reservado"
    | "bloqueado"
    | "completado"
    | "no_disponible"
    | string;
  tipo_atencion: "presencial" | "telemedicina" | "ambos" | string;
  sala?: SalaAgenda | null;
  cupo_maximo?: number | null;
  cupo_actual: number;
}

interface MedicoAsignado {
  id_profesional: number;
  nombre_completo: string;
  especialidad: string;
  foto_url?: string | null;
  es_principal: boolean;
  citas_hoy?: number;
  proxima_cita?: string | null;
  disponible_ahora?: boolean;
  extension_telefonica?: string | null;
  email: string;
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
    icono: Activity,
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
// FUNCIONES AUXILIARES DE FECHAS
// ========================================

const esMismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const limpiarFecha = (fechaStr: string | undefined | null) => {
  if (!fechaStr) return null;
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const inicioDeSemana = (fecha: Date) => {
  const d = new Date(fecha);
  const day = d.getDay(); // 0 domingo - 6 sábado
  const diff = (day + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sumaDias = (fecha: Date, dias: number) => {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
};

const formatearFechaLarga = (fecha: Date) =>
  new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(fecha);

const formatearFechaCorta = (fecha: Date) =>
  new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);

const formatearHora = (fecha: Date) =>
  new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function AgendaDisponibilidadPage() {
  // ========================================
  // ESTADOS
  // ========================================

  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Datos generales
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasSecretaria | null>(null);
  const [medicosAsignados, setMedicosAsignados] = useState<MedicoAsignado[]>(
    []
  );
  const [notificaciones, setNotificaciones] = useState<
    NotificacionSecretaria[]
  >([]);

  // Disponibilidad
  const [bloques, setBloques] = useState<BloqueHorarioAgenda[]>([]);
  const [tiposCita, setTiposCita] = useState<TipoCitaAgenda[]>([]);
  const [salas, setSalas] = useState<SalaAgenda[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vistaAgenda, setVistaAgenda] = useState<"dia" | "semana" | "mes">(
    "semana"
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [seccionActiva] = useState("agenda");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [filtroMedico, setFiltroMedico] = useState<number | "todos">("todos");
  const [filtroTipoAtencion, setFiltroTipoAtencion] =
    useState<string>("todos");
  const [filtroEstadoBloque, setFiltroEstadoBloque] =
    useState<string>("todos");
  const [soloConCupos, setSoloConCupos] = useState<boolean>(true);

  // ========================================
  // TEMA ACTUAL
  // ========================================

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
      url: "/secretaria/agenda",
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
      url: "/secretaria/confirmaciones",
      badge: estadisticas?.citas_pendientes_confirmacion || 0,
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
      url: "/secretaria/llamadas",
      badge: estadisticas?.llamadas_pendientes || 0,
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
      url: "/secretaria/pacientes",
      badge: estadisticas?.pacientes_nuevos_mes || 0,
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
        {
          titulo: "Mis Médicos",
          icono: UserCheck,
          url: "/secretaria/medicos",
        },
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
      url: "/secretaria/recordatorios",
      badge: estadisticas?.recordatorios_enviados_hoy || 0,
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
      url: "/secretaria/documentos",
      badge: estadisticas?.documentos_procesados_semana || 0,
      submenu: [
        {
          titulo: "Gestión",
          icono: FileText,
          url: "/secretaria/documentos",
        },
        {
          titulo: "Certificados",
          icono: Award,
          url: "/secretaria/documentos/certificados",
        },
        {
          titulo: "Recetas",
          icono: Pill,
          url: "/secretaria/documentos/recetas",
        },
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
        {
          titulo: "WhatsApp",
          icono: MessageSquare,
          url: "/secretaria/mensajes/whatsapp",
        },
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
      titulo: "Reportes",
      icono: BarChart3,
      url: "/secretaria/reportes",
      submenu: [
        {
          titulo: "Mis Métricas",
          icono: TrendingUp,
          url: "/secretaria/reportes/metricas",
        },
        {
          titulo: "Citas",
          icono: Calendar,
          url: "/secretaria/reportes/citas",
        },
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
      url: "/secretaria/perfil",
      submenu: [
        {
          titulo: "Información Personal",
          icono: User,
          url: "/secretaria/perfil",
        },
        {
          titulo: "Horarios",
          icono: Clock,
          url: "/secretaria/perfil/horarios",
        },
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
        {
          titulo: "General",
          icono: Settings,
          url: "/secretaria/configuracion/general",
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
    if (usuario?.secretaria) {
      cargarDatosDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    if (usuario?.secretaria) {
      cargarDisponibilidad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, vistaAgenda, fechaSeleccionada]);

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
      setMedicosAsignados(data.medicos_asignados || []);
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    }
  };

  const cargarDisponibilidad = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setLoadingAgenda(true);

      const params = new URLSearchParams();
      params.append("id_secretaria", String(usuario.secretaria.id_secretaria));
      params.append("vista", vistaAgenda);
      params.append("fecha", fechaSeleccionada.toISOString().substring(0, 10));

      const res = await fetch(
        `/api/secretaria/agenda/disponibilidad?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta disponibilidad:", data);
        return;
      }

      setBloques(data.bloques || []);
      if (Array.isArray(data.medicos_asignados)) {
        setMedicosAsignados(data.medicos_asignados);
      }
      if (Array.isArray(data.tipos_cita)) {
        setTiposCita(data.tipos_cita);
      }
      if (Array.isArray(data.salas)) {
        setSalas(data.salas);
      }
    } catch (err) {
      console.error("Error al cargar disponibilidad:", err);
    } finally {
      setLoadingAgenda(false);
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

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearFechaTexto = (fechaStr: string) => {
    const d = limpiarFecha(fechaStr);
    if (!d) return "-";
    return formatearFechaCorta(d) + " • " + formatearHora(d);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      // Citas
      programada: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      confirmada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      en_sala_espera: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      en_atencion: isDark
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      completada: isDark
        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        : "bg-indigo-100 text-indigo-800 border-indigo-200",
      cancelada: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      no_asistio: isDark
        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
        : "bg-rose-100 text-rose-800 border-rose-200",
      reprogramada: isDark
        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
        : "bg-purple-100 text-purple-800 border-purple-200",

      // Bloques
      disponible: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      reservado: isDark
        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        : "bg-indigo-100 text-indigo-800 border-indigo-200",
      bloqueado: isDark
        ? "bg-red-500/20 text-red-300 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      no_disponible: isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
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

  const obtenerMedicoDeBloque = (b: BloqueHorarioAgenda) =>
    medicosAsignados.find((m) => m.id_profesional === b.id_profesional) ||
    null;

  const tieneCupos = (b: BloqueHorarioAgenda) => {
    if (b.estado !== "disponible") return false;
    if (b.cupo_maximo == null || b.cupo_maximo === 0) {
      // si no hay cupo máximo, consideramos que aún hay espacio
      return true;
    }
    return b.cupo_actual < b.cupo_maximo;
  };

  const irAHoy = () => {
    setFechaSeleccionada(new Date());
  };

  const moverPeriodo = (delta: number) => {
    if (vistaAgenda === "dia") {
      setFechaSeleccionada((prev) => sumaDias(prev, delta));
    } else if (vistaAgenda === "semana") {
      setFechaSeleccionada((prev) => sumaDias(prev, delta * 7));
    } else {
      setFechaSeleccionada((prev) => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + delta);
        return d;
      });
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

  // ========================================
  // DERIVADOS (DISPONIBILIDAD)
  // ========================================

  const inicioSemanaSeleccionada = useMemo(
    () => inicioDeSemana(fechaSeleccionada),
    [fechaSeleccionada]
  );

  const bloquesFiltradosBase = useMemo(() => {
    let lista = [...bloques];

    if (filtroMedico !== "todos") {
      lista = lista.filter((b) => b.id_profesional === filtroMedico);
    }

    if (filtroTipoAtencion !== "todos") {
      lista = lista.filter(
        (b) => b.tipo_atencion.toLowerCase() === filtroTipoAtencion.toLowerCase()
      );
    }

    if (filtroEstadoBloque !== "todos") {
      lista = lista.filter(
        (b) => b.estado.toLowerCase() === filtroEstadoBloque.toLowerCase()
      );
    }

    if (soloConCupos) {
      lista = lista.filter((b) => tieneCupos(b));
    }

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((b) => {
        const medico = obtenerMedicoDeBloque(b);
        const nombreMedico = medico?.nombre_completo.toLowerCase() || "";
        const especialidad = medico?.especialidad.toLowerCase() || "";
        const salaNombre = b.sala?.nombre.toLowerCase() || "";
        const salaTipo = b.sala?.tipo.toLowerCase() || "";
        return (
          nombreMedico.includes(q) ||
          especialidad.includes(q) ||
          salaNombre.includes(q) ||
          salaTipo.includes(q)
        );
      });
    }

    return lista.sort((a, b) => {
      const da = limpiarFecha(a.fecha_inicio)?.getTime() ?? 0;
      const db = limpiarFecha(b.fecha_inicio)?.getTime() ?? 0;
      return da - db;
    });
  }, [
    bloques,
    filtroMedico,
    filtroTipoAtencion,
    filtroEstadoBloque,
    soloConCupos,
    busqueda,
    medicosAsignados,
  ]);

  const resumenDisponibilidad = useMemo(() => {
    const lista = bloquesFiltradosBase;
    if (!lista.length) {
      return {
        totalBloques: 0,
        bloquesDisponibles: 0,
        cuposTotales: 0,
        cuposDisponibles: 0,
        porcentajeOcupacion: 0,
      };
    }

    let totalBloques = 0;
    let bloquesDisponibles = 0;
    let cuposTotales = 0;
    let cuposOcupados = 0;

    for (const b of lista) {
      totalBloques++;
      const max =
        b.cupo_maximo && b.cupo_maximo > 0 ? b.cupo_maximo : 1; // asumimos 1 si no está definido
      const actual = Math.max(0, Math.min(b.cupo_actual ?? 0, max));
      cuposTotales += max;
      cuposOcupados += actual;
      if (tieneCupos(b)) {
        bloquesDisponibles++;
      }
    }

    const cuposDisponibles = Math.max(cuposTotales - cuposOcupados, 0);
    const porcentajeOcupacion = cuposTotales
      ? Math.round((cuposOcupados / cuposTotales) * 100)
      : 0;

    return {
      totalBloques,
      bloquesDisponibles,
      cuposTotales,
      cuposDisponibles,
      porcentajeOcupacion,
    };
  }, [bloquesFiltradosBase]);

  const bloquesDelDia = useMemo(() => {
    return bloquesFiltradosBase.filter((b) => {
      const d = limpiarFecha(b.fecha_inicio);
      if (!d) return false;
      return esMismoDia(d, fechaSeleccionada);
    });
  }, [bloquesFiltradosBase, fechaSeleccionada]);

  const bloquesSemana = useMemo(() => {
    if (vistaAgenda !== "semana") return [];
    const inicio = inicioSemanaSeleccionada;
    const fin = sumaDias(inicio, 7);
    return bloquesFiltradosBase.filter((b) => {
      const d = limpiarFecha(b.fecha_inicio);
      return d && d >= inicio && d < fin;
    });
  }, [bloquesFiltradosBase, vistaAgenda, inicioSemanaSeleccionada]);

  const bloquesPorDiaSemana = useMemo(() => {
    const mapa: Record<
      string,
      { total: number; disponibles: number; fecha: Date }
    > = {};
    bloquesSemana.forEach((b) => {
      const d = limpiarFecha(b.fecha_inicio);
      if (!d) return;
      const key = d.toISOString().substring(0, 10);
      if (!mapa[key]) {
        mapa[key] = { total: 0, disponibles: 0, fecha: d };
      }
      mapa[key].total++;
      if (tieneCupos(b)) mapa[key].disponibles++;
    });
    return mapa;
  }, [bloquesSemana]);

  const bloquesMes = useMemo(() => {
    if (vistaAgenda !== "mes") return [];
    const year = fechaSeleccionada.getFullYear();
    const month = fechaSeleccionada.getMonth();
    const inicio = new Date(year, month, 1, 0, 0, 0, 0);
    const fin = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return bloquesFiltradosBase.filter((b) => {
      const d = limpiarFecha(b.fecha_inicio);
      return d && d >= inicio && d <= fin;
    });
  }, [bloquesFiltradosBase, vistaAgenda, fechaSeleccionada]);

  const bloquesPorDiaMes = useMemo(() => {
    const mapa: Record<string, { total: number; disponibles: number }> = {};
    bloquesMes.forEach((b) => {
      const d = limpiarFecha(b.fecha_inicio);
      if (!d) return;
      const key = d.toISOString().substring(0, 10);
      if (!mapa[key]) {
        mapa[key] = { total: 0, disponibles: 0 };
      }
      mapa[key].total++;
      if (tieneCupos(b)) mapa[key].disponibles++;
    });
    return mapa;
  }, [bloquesMes]);

  const resumenPorMedico = useMemo(() => {
    const mapa: Record<
      number,
      { medico: MedicoAsignado | null; total: number; disponibles: number }
    > = {};

    bloquesFiltradosBase.forEach((b) => {
      const id = b.id_profesional;
      if (!mapa[id]) {
        const med = medicosAsignados.find((m) => m.id_profesional === id);
        mapa[id] = {
          medico: med || null,
          total: 0,
          disponibles: 0,
        };
      }
      mapa[id].total++;
      if (tieneCupos(b)) {
        mapa[id].disponibles++;
      }
    });

    return Object.values(mapa).sort((a, b) => {
      const pa =
        a.total > 0 ? a.disponibles / a.total : 0;
      const pb =
        b.total > 0 ? b.disponibles / b.total : 0;
      return pb - pa;
    });
  }, [bloquesFiltradosBase, medicosAsignados]);

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
              <CalendarClock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando disponibilidad
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando el mapa de bloques y cupos disponibles...
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
            No tienes permisos para acceder al módulo de disponibilidad de
            agenda.
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
      className={`min-h-screen transition-all duración-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duración-300 ${
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
                  <CalendarClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Mapa de Disponibilidad
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <CalendarClock className="w-6 h-6 text-white" />
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
                placeholder="Buscar médico, sala, tipo de atención..."
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
            {/* Selector de Temas */}
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
                className={`relative p-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.secundario} ${tema.colores.texto}`}
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
                      {notificaciones.slice(0, 8).map((notif) => (
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
                                {formatearFechaTexto(notif.fecha_hora)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notificaciones.length > 8 && (
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
                        {usuario?.secretaria?.centro?.nombre ??
                          "Centro no asignado"}
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
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
        className={`transition-all duración-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Saludo y controles de fecha/vista */}
        <div className="mb-8 flex flex-col xl:flex-row gap-6 xl:items-center xl:justify-between">
          <div>
            <h2
              className={`text-4xl xl:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">🧭</span>
            </h2>
            <p
              className={`text-lg xl:text-xl font-semibold ${tema.colores.textoSecundario}`}
            >
              Mapa ultra-premium de{" "}
              <span className="font-bold">
                disponibilidad de agenda ·{" "}
                {usuario?.secretaria?.centro?.nombre ?? "Centro no asignado"}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Vista */}
            <div
              className={`flex items-center rounded-2xl p-1 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <button
                onClick={() => setVistaAgenda("dia")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  vistaAgenda === "dia"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
              >
                <Clock className="w-4 h-4" />
                Día
              </button>
              <button
                onClick={() => setVistaAgenda("semana")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  vistaAgenda === "semana"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Semana
              </button>
              <button
                onClick={() => setVistaAgenda("mes")}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  vistaAgenda === "mes"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
              >
                <PieChart className="w-4 h-4" />
                Mes
              </button>
            </div>

            {/* Controles de fecha */}
            <div
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <button
                onClick={() => moverPeriodo(-1)}
                className={`p-2 rounded-xl ${tema.colores.hover}`}
              >
                <ChevronLeft className={`w-4 h-4 ${tema.colores.texto}`} />
              </button>
              <div className="text-center px-2">
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {vistaAgenda === "dia"
                    ? "Día seleccionado"
                    : vistaAgenda === "semana"
                    ? "Semana de referencia"
                    : "Mes seleccionado"}
                </p>
                <p
                  className={`text-sm sm:text-base font-bold ${tema.colores.texto}`}
                >
                  {vistaAgenda === "semana"
                    ? `${formatearFechaCorta(
                        inicioSemanaSeleccionada
                      )} — ${formatearFechaCorta(
                        sumaDias(inicioSemanaSeleccionada, 6)
                      )}`
                    : formatearFechaLarga(fechaSeleccionada)}
                </p>
              </div>
              <button
                onClick={() => moverPeriodo(1)}
                className={`p-2 rounded-xl ${tema.colores.hover}`}
              >
                <ChevronRight className={`w-4 h-4 ${tema.colores.texto}`} />
              </button>
              <button
                onClick={irAHoy}
                className={`ml-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${tema.colores.primario} text-white ${tema.colores.sombra}`}
              >
                <Clock className="w-4 h-4" />
                Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Resumen Disponibilidad */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          {/* Total Bloques */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <CalendarRange className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-indigo-400">
                Bloques
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenDisponibilidad.totalBloques}
            </p>
            <p
              className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
            >
              Bloques en el periodo filtrado
            </p>
          </div>

          {/* Bloques Disponibles */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-emerald-300">
                Cupos
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenDisponibilidad.bloquesDisponibles}
            </p>
            <p
              className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
            >
              Bloques con cupos disponibles
            </p>
          </div>

          {/* Cupos Disponibles */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-cyan-300">
                Cupos libres
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenDisponibilidad.cuposDisponibles}
            </p>
            <p
              className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
            >
              Cupos totales aún disponibles
            </p>
          </div>

          {/* Ocupación */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold uppercase text-rose-300">
                Ocupación
              </span>
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {resumenDisponibilidad.porcentajeOcupacion}%
            </p>
            <p
              className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
            >
              Porcentaje de cupos ocupados
            </p>
          </div>
        </div>

        {/* Layout principal disponibilidad */}
        {loadingAgenda ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando bloques y disponibilidad...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Columna principal: mapa + detalle */}
            <div className="xl:col-span-2 space-y-6">
              {/* Mapa de disponibilidad */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <CalendarClock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Mapa de disponibilidad
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Vista {vistaAgenda === "dia"
                          ? "detallada por día"
                          : vistaAgenda === "semana"
                          ? "semanal por día"
                          : "mensual por día"}{" "}
                        con bloques configurados.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={cargarDisponibilidad}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </button>
                </div>

                {/* Vista por modo */}
                {vistaAgenda === "dia" && (
                  <div className="space-y-4">
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {formatearFechaLarga(fechaSeleccionada)} ·{" "}
                      {bloquesDelDia.length}{" "}
                      {bloquesDelDia.length === 1
                        ? "bloque configurado"
                        : "bloques configurados"}
                    </p>

                    <div className="space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar pr-2">
                      {bloquesDelDia.length === 0 ? (
                        <div className="text-center py-16">
                          <div
                            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
                          >
                            <Clock className="w-12 h-12 text-white" />
                          </div>
                          <p
                            className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                          >
                            No hay bloques configurados para este día
                          </p>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario}`}
                          >
                            Configura bloques en el módulo de agenda o usa
                            herramientas de gestión horaria.
                          </p>
                        </div>
                      ) : (
                        bloquesDelDia.map((b) => {
                          const dInicio =
                            limpiarFecha(b.fecha_inicio) || new Date();
                          const dFin = limpiarFecha(b.fecha_fin) || dInicio;
                          const medico = obtenerMedicoDeBloque(b);

                          const max =
                            b.cupo_maximo && b.cupo_maximo > 0
                              ? b.cupo_maximo
                              : undefined;
                          const actual = b.cupo_actual ?? 0;
                          const porcentaje =
                            max && max > 0
                              ? Math.round((actual / max) * 100)
                              : undefined;

                          return (
                            <div
                              key={b.id_bloque}
                              className={`flex flex-col md:flex-row items-start md:items-center gap-3 rounded-xl px-3 py-3 ${tema.colores.hover}`}
                            >
                              <div className="flex items-center gap-3 min-w-[80px]">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex flex-col items-center justify-center text-white text-xs font-bold">
                                  <span>{formatearHora(dInicio)}</span>
                                  <span className="block text-[0.65rem] font-normal">
                                    {b.duracion_minutos}m
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <p
                                    className={`font-semibold ${tema.colores.texto}`}
                                  >
                                    {formatearHora(dInicio)} –{" "}
                                    {formatearHora(dFin)}
                                  </p>
                                  <p
                                    className={`${tema.colores.textoSecundario}`}
                                  >
                                    {b.tipo_atencion === "presencial"
                                      ? "Presencial"
                                      : b.tipo_atencion === "telemedicina"
                                      ? "Telemedicina"
                                      : "Mixto"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {medico
                                    ? medico.nombre_completo
                                    : `Profesional #${b.id_profesional}`}
                                </p>
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  {medico?.especialidad || "Especialidad no registrada"}
                                  {b.sala && (
                                    <>
                                      {" "}
                                      · Sala {b.sala.nombre} (
                                      {b.sala.tipo})
                                    </>
                                  )}
                                </p>

                                <div className="mt-2 flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span
                                      className={`text-[0.65rem] font-bold px-2 py-1 rounded-full border ${obtenerColorEstado(
                                        b.estado
                                      )}`}
                                    >
                                      {b.estado}
                                    </span>
                                    {max && (
                                      <span
                                        className={`text-[0.65rem] font-medium px-2 py-1 rounded-full ${tema.colores.hover}`}
                                      >
                                        Cupos: {actual}/{max}
                                      </span>
                                    )}
                                    {!max && (
                                      <span
                                        className={`text-[0.65rem] font-medium px-2 py-1 rounded-full ${tema.colores.hover}`}
                                      >
                                        Cupos usados: {actual}
                                      </span>
                                    )}
                                  </div>

                                  {max && (
                                    <div className="mt-1">
                                      <div className="w-full h-2 rounded-full bg-gray-200/50 overflow-hidden">
                                        <div
                                          className={`h-2 rounded-full ${
                                            porcentaje !== undefined &&
                                            porcentaje >= 80
                                              ? "bg-red-500"
                                              : porcentaje !== undefined &&
                                                porcentaje >= 50
                                              ? "bg-amber-400"
                                              : "bg-emerald-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(
                                              porcentaje ?? 0,
                                              100
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 w-full md:w-auto">
                                <Link
                                  href={`/secretaria/agenda/nueva?bloque=${b.id_bloque}`}
                                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
                                >
                                  <CalendarPlus className="w-4 h-4" />
                                  Agendar en este bloque
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {vistaAgenda === "semana" && (
                  <div className="mt-4">
                    <p
                      className={`text-sm font-semibold mb-3 ${tema.colores.textoSecundario}`}
                    >
                      Resumen de bloques por día de la semana.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {Array.from({ length: 7 }).map((_, idx) => {
                        const dia = sumaDias(inicioSemanaSeleccionada, idx);
                        const key = dia.toISOString().substring(0, 10);
                        const info = bloquesPorDiaSemana[key] || {
                          total: 0,
                          disponibles: 0,
                          fecha: dia,
                        };

                        const total = info.total;
                        const disponibles = info.disponibles;
                        const porcentaje =
                          total > 0
                            ? Math.round((disponibles / total) * 100)
                            : 0;

                        let barraColor = "bg-gray-300";
                        if (total > 0) {
                          if (porcentaje >= 60) barraColor = "bg-emerald-500";
                          else if (porcentaje >= 30)
                            barraColor = "bg-amber-400";
                          else barraColor = "bg-red-500";
                        }

                        return (
                          <div
                            key={key}
                            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p
                                  className={`text-xs font-semibold uppercase ${tema.colores.textoSecundario}`}
                                >
                                  {new Intl.DateTimeFormat("es-CL", {
                                    weekday: "short",
                                  }).format(dia)}
                                </p>
                                <p
                                  className={`text-lg font-black ${tema.colores.texto}`}
                                >
                                  {dia.getDate()}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${tema.colores.hover}`}
                              >
                                {total} bloques
                              </span>
                            </div>

                            <div className="mt-1 mb-1 text-xs">
                              <span
                                className={`font-semibold ${tema.colores.textoSecundario}`}
                              >
                                {disponibles} con cupos
                              </span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-gray-200/40 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${barraColor}`}
                                style={{
                                  width: `${Math.min(porcentaje, 100)}%`,
                                }}
                              ></div>
                            </div>

                            <p
                              className={`mt-1 text-[0.7rem] ${tema.colores.textoSecundario}`}
                            >
                              Disponibilidad:{" "}
                              <span className="font-bold">
                                {porcentaje}%
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {vistaAgenda === "mes" && (
                  <div className="mt-4">
                    <p
                      className={`text-sm font-semibold mb-3 ${tema.colores.textoSecundario}`}
                    >
                      Calendario mensual con número de bloques y cupos
                      disponibles.
                    </p>

                    {(() => {
                      const year = fechaSeleccionada.getFullYear();
                      const month = fechaSeleccionada.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const daysInMonth = lastDay.getDate();
                      const offset = (firstDay.getDay() + 6) % 7; // lunes = 0

                      const celdas: (Date | null)[] = [];
                      for (let i = 0; i < offset; i++) celdas.push(null);
                      for (let d = 1; d <= daysInMonth; d++) {
                        celdas.push(new Date(year, month, d));
                      }

                      return (
                        <div className="grid grid-cols-7 gap-2">
                          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                            <div
                              key={d}
                              className={`text-xs font-bold text-center mb-1 ${tema.colores.textoSecundario}`}
                            >
                              {d}
                            </div>
                          ))}
                          {celdas.map((d, idx) => {
                            if (!d) {
                              return (
                                <div
                                  key={idx}
                                  className="rounded-xl h-14 sm:h-16"
                                />
                              );
                            }
                            const key = d.toISOString().substring(0, 10);
                            const info = bloquesPorDiaMes[key] || {
                              total: 0,
                              disponibles: 0,
                            };
                            const total = info.total;
                            const disponibles = info.disponibles;
                            const porcentaje =
                              total > 0
                                ? Math.round((disponibles / total) * 100)
                                : 0;

                            let extraRing = "";
                            if (total > 0) {
                              if (porcentaje >= 60)
                                extraRing = "ring-emerald-400/60 ring-2";
                              else if (porcentaje >= 30)
                                extraRing = "ring-amber-400/60 ring-2";
                              else extraRing = "ring-red-400/60 ring-2";
                            }

                            const selected = esMismoDia(
                              d,
                              fechaSeleccionada
                            );

                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  setFechaSeleccionada(d);
                                  setVistaAgenda("dia");
                                }}
                                className={`relative rounded-xl h-14 sm:h-16 w-full text-left px-2 py-1 text-xs border ${
                                  selected
                                    ? `bg-gradient-to-br ${tema.colores.gradiente} text-white border-transparent`
                                    : `${tema.colores.card} ${tema.colores.borde} border`
                                } hover:scale-[1.02] transition-all duration-200 ${tema.colores.sombra} ${extraRing}`}
                              >
                                <p className="font-bold">{d.getDate()}</p>
                                {total > 0 && (
                                  <p
                                    className={`mt-1 text-[0.65rem] font-semibold ${
                                      selected
                                        ? "text-white"
                                        : tema.colores.acento
                                    }`}
                                  >
                                    {total} bloq · {disponibles} cupos
                                  </p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Detalle de bloques filtrados */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <ListIcon />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Detalle de bloques filtrados
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Vista compacta para agendar rápido desde cualquier
                        bloque.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-2 text-xs sm:text-sm">
                  {bloquesFiltradosBase.length === 0 ? (
                    <p className={tema.colores.textoSecundario}>
                      No hay bloques para los filtros seleccionados.
                    </p>
                  ) : (
                    bloquesFiltradosBase.slice(0, 80).map((b) => {
                      const dInicio =
                        limpiarFecha(b.fecha_inicio) || new Date();
                      const dFin = limpiarFecha(b.fecha_fin) || dInicio;
                      const medico = obtenerMedicoDeBloque(b);
                      const max =
                        b.cupo_maximo && b.cupo_maximo > 0
                          ? b.cupo_maximo
                          : undefined;
                      const actual = b.cupo_actual ?? 0;

                      return (
                        <div
                          key={b.id_bloque}
                          className={`flex flex-col lg:flex-row items-start lg:items-center gap-2 rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <div className="w-full lg:w-40 flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-[0.65rem] font-bold border ${tema.colores.borde}`}
                            >
                              {formatearFechaCorta(dInicio)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-[0.65rem] font-semibold ${tema.colores.textoSecundario}`}
                            >
                              {formatearHora(dInicio)} – {formatearHora(dFin)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold truncate ${tema.colores.texto}`}
                            >
                              {medico
                                ? medico.nombre_completo
                                : `Profesional #${b.id_profesional}`}
                            </p>
                            <p
                              className={`text-[0.7rem] truncate ${tema.colores.textoSecundario}`}
                            >
                              {b.tipo_atencion === "presencial"
                                ? "Presencial"
                                : b.tipo_atencion === "telemedicina"
                                ? "Telemedicina"
                                : "Presencial + Telemedicina"}
                              {b.sala && ` · Sala ${b.sala.nombre}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[0.65rem] font-bold px-2 py-1 rounded-full border ${obtenerColorEstado(
                                b.estado
                              )}`}
                            >
                              {b.estado}
                            </span>
                            <span
                              className={`text-[0.65rem] px-2 py-1 rounded-full ${tema.colores.hover}`}
                            >
                              {max
                                ? `${actual}/${max} cupos`
                                : `${actual} cupos usados`}
                            </span>
                          </div>

                          <div className="flex gap-2 w-full lg:w-auto">
                            <Link
                              href={`/secretaria/agenda/nueva?bloque=${b.id_bloque}`}
                              className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[0.7rem] font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
                            >
                              <CalendarPlus className="w-3 h-3" />
                              Agendar
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Columna lateral: filtros + resumen por médico */}
            <div className="space-y-6">
              {/* Filtros avanzados */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Filtros de disponibilidad
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Ajusta vista por médico, tipo de atención y estado del
                      bloque.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block mb-1 font-semibold">
                      Médico
                    </label>
                    <select
                      value={filtroMedico}
                      onChange={(e) =>
                        setFiltroMedico(
                          e.target.value === "todos"
                            ? "todos"
                            : Number(e.target.value)
                        )
                      }
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Todos los médicos</option>
                      {medicosAsignados.map((m) => (
                        <option
                          key={m.id_profesional}
                          value={m.id_profesional}
                        >
                          {m.nombre_completo} · {m.especialidad}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold">
                      Tipo de atención
                    </label>
                    <select
                      value={filtroTipoAtencion}
                      onChange={(e) => setFiltroTipoAtencion(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Todos</option>
                      <option value="presencial">Solo presencial</option>
                      <option value="telemedicina">Solo telemedicina</option>
                      <option value="ambos">Mixtos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold">
                      Estado del bloque
                    </label>
                    <select
                      value={filtroEstadoBloque}
                      onChange={(e) => setFiltroEstadoBloque(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="bloqueado">Bloqueado</option>
                      <option value="completado">Completado</option>
                      <option value="no_disponible">No disponible</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="soloCupos"
                      type="checkbox"
                      checked={soloConCupos}
                      onChange={(e) => setSoloConCupos(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="soloCupos"
                      className={`text-xs sm:text-sm ${tema.colores.texto}`}
                    >
                      Mostrar solo bloques con cupos disponibles
                    </label>
                  </div>

                  <button
                    onClick={cargarDisponibilidad}
                    className={`w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Recalcular disponibilidad
                  </button>
                </div>
              </div>

              {/* Resumen por médico */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3
                  className={`text-xl font-black mb-1 ${tema.colores.texto}`}
                >
                  Resumen por médico
                </h3>
                <p
                  className={`text-xs font-semibold mb-4 ${tema.colores.textoSecundario}`}
                >
                  Distribución de bloques y cupos por profesional en el periodo
                  filtrado.
                </p>

                <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2 text-xs sm:text-sm">
                  {resumenPorMedico.length === 0 ? (
                    <p className={tema.colores.textoSecundario}>
                      No hay bloques para mostrar con los filtros actuales.
                    </p>
                  ) : (
                    resumenPorMedico.map((r, index) => {
                      const medico = r.medico;
                      const total = r.total;
                      const disponibles = r.disponibles;
                      const porcentaje =
                        total > 0 ? Math.round((disponibles / total) * 100) : 0;

                      return (
                        <div
                          key={`${medico?.id_profesional ?? index}-${total}`}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 ${tema.colores.hover}`}
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xs`}
                            >
                              {medico?.foto_url ? (
                                <Image
                                  src={medico.foto_url}
                                  alt={medico.nombre_completo}
                                  width={40}
                                  height={40}
                                  className="rounded-xl object-cover"
                                />
                              ) : medico ? (
                                medico.nombre_completo
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                              ) : (
                                "MD"
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold truncate ${tema.colores.texto}`}
                            >
                              {medico
                                ? medico.nombre_completo
                                : "Profesional sin ficha"}
                            </p>
                            <p
                              className={`text-[0.7rem] truncate ${tema.colores.textoSecundario}`}
                            >
                              {medico?.especialidad || "Especialidad no registrada"}
                            </p>
                            <p
                              className={`mt-1 text-[0.7rem] ${tema.colores.textoSecundario}`}
                            >
                              {disponibles}/{total} bloques con cupos
                            </p>
                            <div className="mt-1 w-full h-2 rounded-full bg-gray-200/40 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(porcentaje, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Mini métricas adicionales */}
              {estadisticas && (
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Radar secretaria
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Citas y llamadas rápidas del día.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div
                      className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                    >
                      <p
                        className={`font-bold ${tema.colores.texto}`}
                      >
                        Citas hoy
                      </p>
                      <p
                        className={`text-lg font-black ${tema.colores.acento}`}
                      >
                        {estadisticas.citas_programadas_hoy}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                    >
                      <p
                        className={`font-bold ${tema.colores.texto}`}
                      >
                        Confirmadas
                      </p>
                      <p className="text-lg font-black text-emerald-400">
                        {estadisticas.citas_confirmadas_hoy}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                    >
                      <p
                        className={`font-bold ${tema.colores.texto}`}
                      >
                        Llamadas hoy
                      </p>
                      <p className="text-lg font-black text-sky-400">
                        {estadisticas.llamadas_realizadas_hoy}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                    >
                      <p
                        className={`font-bold ${tema.colores.texto}`}
                      >
                        Pendientes
                      </p>
                      <p className="text-lg font-black text-amber-400">
                        {estadisticas.citas_pendientes_confirmacion}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer
          className={`transition-all duration-300 mt-12 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed · Módulo de Disponibilidad de Agenda.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v1.0.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <Link
                href="/ayuda"
                className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className="font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </footer>
      </main>

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

// Icono simple para la lista (para no importar otro)
function ListIcon() {
  return (
    <div className="flex flex-col gap-[3px]">
      <span className="w-4 h-[2px] bg-white/80 rounded-full block" />
      <span className="w-4 h-[2px] bg-white/80 rounded-full block" />
      <span className="w-4 h-[2px] bg-white/80 rounded-full block" />
    </div>
  );
}
