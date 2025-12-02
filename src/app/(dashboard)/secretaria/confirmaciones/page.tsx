// src/app/(dashboard)/secretaria/confirmaciones/page.tsx
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

interface CitaSecretaria {
  id_cita: number;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_cita: string;
  modalidad: "presencial" | "telemedicina";
  estado: string;
  confirmada: boolean;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    telefono: string | null;
    celular: string | null;
    email: string | null;
    foto_url: string | null;
  };
  medico: {
    id_profesional: number;
    nombre_completo: string;
    especialidad: string;
    foto_url: string | null;
  };
  motivo: string | null;
  notas_secretaria: string | null;
  requiere_confirmacion: boolean;
  recordatorio_enviado: boolean;
}

interface MedicoAsignado {
  id_profesional: number;
  nombre_completo: string;
  especialidad: string;
  foto_url: string | null;
  es_principal: boolean;
  citas_hoy: number;
  proxima_cita: string | null;
  disponible_ahora: boolean;
  extension_telefonica: string | null;
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
  target?: string;
  rel?: string;
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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function SecretariaConfirmacionesPage() {
  // ========================================
  // ESTADOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasSecretaria | null>(null);
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);
  const [medicosAsignados, setMedicosAsignados] = useState<MedicoAsignado[]>([]);
  const [confirmaciones, setConfirmaciones] = useState<CitaSecretaria[]>([]);

  // UI
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [seccionActiva] = useState("confirmaciones");
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Confirmaciones");
  const [estadoTab, setEstadoTab] = useState<"pendientes" | "confirmadas" | "canceladas" | "todas">(
    "pendientes"
  );
  const [filtroMedico, setFiltroMedico] = useState<number | null>(null);
  const [filtroEstadoCita, setFiltroEstadoCita] = useState<string>("todas");

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENU DE NAVEGACIÓN (MISMO QUE DASHBOARD)
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
      url: "/secretaria/confirmaciones",
      activo: seccionActiva === "confirmaciones",
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
        { titulo: "Todos Mis Tareas", icono: Square, url: "/secretaria/tareas" },
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
        { titulo: "Mis Métricas", icono: TrendingUp, url: "/secretaria/reportes/" },
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
      cargarDatosBasicos();
      cargarConfirmaciones();
    }
  }, [usuario, fechaSeleccionada]);

  useEffect(() => {
    if (!usuario?.secretaria) return;

    const interval = setInterval(() => {
      cargarDatosBasicos();
      cargarConfirmaciones();
    }, 180000); // 3 minutos

    return () => clearInterval(interval);
  }, [usuario, fechaSeleccionada]);

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

  // carga básica para badges / notificaciones
  const cargarDatosBasicos = async () => {
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
        console.error("Respuesta dashboard en confirmaciones:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setNotificaciones(data.notificaciones || []);
      setMedicosAsignados(data.medicos_asignados || []);
    } catch (err) {
      console.error("Error al cargar datos básicos:", err);
    }
  };

  const cargarConfirmaciones = async (fechaForFetch?: Date) => {
    if (!usuario?.secretaria?.id_secretaria) return;

    const fecha = fechaForFetch || fechaSeleccionada;
    const fechaStr = fecha.toISOString().split("T")[0];

    try {
      setLoadingData(true);

      const res = await fetch(
        `/api/secretaria/confirmaciones?id_secretaria=${usuario.secretaria.id_secretaria}&fecha=${fechaStr}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta confirmaciones:", data);
        return;
      }

      setConfirmaciones(data.confirmaciones || []);
    } catch (err) {
      console.error("Error al cargar confirmaciones:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const confirmarCita = async (idCita: number) => {
    try {
      const response = await fetch(`/api/secretaria/citas/${idCita}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        alert("Cita confirmada exitosamente");
        await cargarConfirmaciones();
        await cargarDatosBasicos();
      } else {
        alert("Error al confirmar la cita");
      }
    } catch (error) {
      console.error("Error al confirmar cita:", error);
      alert("Error al confirmar la cita");
    }
  };

  const cancelarCita = async (idCita: number, motivo: string) => {
    try {
      const response = await fetch(`/api/secretaria/citas/${idCita}/cancelar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ motivo }),
      });

      if (response.ok) {
        alert("Cita cancelada exitosamente");
        await cargarConfirmaciones();
        await cargarDatosBasicos();
      } else {
        alert("Error al cancelar la cita");
      }
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      alert("Error al cancelar la cita");
    }
  };

  const manejarCancelarCita = (idCita: number) => {
    const motivo =
      window.prompt("Ingresa el motivo de cancelación de la cita:", "Cancelada desde confirmaciones") ||
      "";
    if (!motivo.trim()) return;
    cancelarCita(idCita, motivo.trim());
  };

  const enviarRecordatorio = async (idCita: number, tipo: "sms" | "whatsapp" | "email") => {
    try {
      const response = await fetch(`/api/secretaria/citas/${idCita}/recordatorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tipo }),
      });

      if (response.ok) {
        alert(`Recordatorio enviado por ${tipo} exitosamente`);
        await cargarConfirmaciones();
        await cargarDatosBasicos();
      } else {
        alert("Error al enviar el recordatorio");
      }
    } catch (error) {
      console.error("Error al enviar recordatorio:", error);
      alert("Error al enviar el recordatorio");
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
            notif.id_notificacion === idNotificacion ? { ...notif, leida: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
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

  // ========================================
  // AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      confirmada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelada: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      reprogramada: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
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

  // ========================================
  // DERIVADOS
  // ========================================

  const statsConfirmaciones = useMemo(() => {
    const total = confirmaciones.length;
    let pendientes = 0;
    let confirmadasCount = 0;
    let canceladas = 0;
    let telemedicina = 0;

    confirmaciones.forEach((c) => {
      if (c.modalidad === "telemedicina") telemedicina++;
      const estadoLower = (c.estado || "").toLowerCase();

      if (!c.confirmada && (estadoLower.includes("pend") || c.requiere_confirmacion)) {
        pendientes++;
      } else if (c.confirmada || estadoLower.includes("confirm")) {
        confirmadasCount++;
      } else if (estadoLower.includes("cancel") || estadoLower.includes("no asiste")) {
        canceladas++;
      }
    });

    const porcentajeConfirmadas =
      total > 0 ? Math.round((confirmadasCount / total) * 100) : 0;

    return {
      total,
      pendientes,
      confirmadas: confirmadasCount,
      canceladas,
      telemedicina,
      porcentajeConfirmadas,
    };
  }, [confirmaciones]);

  const contadoresPorEstado = useMemo(() => {
    const pendientes = statsConfirmaciones.pendientes;
    const confirmadasCount = statsConfirmaciones.confirmadas;
    const canceladas = statsConfirmaciones.canceladas;
    const todas = statsConfirmaciones.total;

    return { pendientes, confirmadas: confirmadasCount, canceladas, todas };
  }, [statsConfirmaciones]);

  const confirmacionesFiltradas = useMemo(() => {
    let datos = [...confirmaciones];

    if (estadoTab === "pendientes") {
      datos = datos.filter((c) => {
        const estadoLower = (c.estado || "").toLowerCase();
        return (
          (!c.confirmada &&
            (estadoLower.includes("pend") || estadoLower.includes("program"))) ||
          c.requiere_confirmacion
        );
      });
    } else if (estadoTab === "confirmadas") {
      datos = datos.filter((c) => {
        const estadoLower = (c.estado || "").toLowerCase();
        return c.confirmada || estadoLower.includes("confirm");
      });
    } else if (estadoTab === "canceladas") {
      datos = datos.filter((c) => {
        const estadoLower = (c.estado || "").toLowerCase();
        return estadoLower.includes("cancel") || estadoLower.includes("no asiste");
      });
    }

    if (filtroMedico) {
      datos = datos.filter((c) => c.medico.id_profesional === filtroMedico);
    }

    if (filtroEstadoCita !== "todas") {
      datos = datos.filter(
        (c) => (c.estado || "").toLowerCase() === filtroEstadoCita.toLowerCase()
      );
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      datos = datos.filter((c) => {
        const nombre = c.paciente.nombre_completo.toLowerCase();
        const nomMed = c.medico.nombre_completo.toLowerCase();
        const tel = (c.paciente.telefono || "").toLowerCase();
        const cel = (c.paciente.celular || "").toLowerCase();
        return (
          nombre.includes(q) ||
          nomMed.includes(q) ||
          tel.includes(q) ||
          cel.includes(q)
        );
      });
    }

    return datos;
  }, [confirmaciones, estadoTab, filtroMedico, filtroEstadoCita, busqueda]);

  // ========================================
  // RENDER: LOADING / SIN PERMISOS
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
              <CheckSquare className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando módulo de confirmaciones
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus citas para confirmar...
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
            No tienes permisos para acceder al módulo de confirmaciones
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
  // RENDER: LAYOUT COMPLETO
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
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Confirmaciones de Citas
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <CheckSquare className="w-6 h-6 text-white" />
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
                  href={item.url || "#"}
                  target={item.target}
                  rel={item.rel}
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
                      {item.submenu.map((subitem, subindex) =>
                        subitem.target ? (
                          <a
                            key={subindex}
                            href={subitem.url}
                            target={subitem.target}
                            rel={subitem.rel}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                          >
                            <subitem.icono className="w-4 h-4" />
                            <span>{subitem.titulo}</span>
                          </a>
                        ) : (
                          <Link
                            key={subindex}
                            href={subitem.url}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                          >
                            <subitem.icono className="w-4 h-4" />
                            <span>{subitem.titulo}</span>
                          </Link>
                        )
                      )}
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
                placeholder="Buscar paciente, cita, médico, teléfono..."
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
                                {formatearFecha(notif.fecha_hora)}
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

            {/* Botón Actualizar */}
            <button
              onClick={() => {
                cargarDatosBasicos();
                cargarConfirmaciones();
              }}
              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
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
                Gestión avanzada de{" "}
                <span className="font-bold">confirmaciones de citas</span>
              </p>
              <p
                className={`text-sm font-medium mt-1 ${tema.colores.textoSecundario}`}
              >
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* TARJETAS RESUMEN CONFIRMACIONES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Pendientes */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {statsConfirmaciones.pendientes}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Pendientes de Confirmación
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Prioriza estas citas
                </span>
              </div>
            </div>
          </div>

          {/* Confirmadas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {statsConfirmaciones.confirmadas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Confirmadas
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {statsConfirmaciones.porcentajeConfirmadas}% del total
                </span>
              </div>
            </div>
          </div>

          {/* Canceladas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {statsConfirmaciones.canceladas}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Canceladas / No asiste
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-400 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Oportunidad de mejora
                </span>
              </div>
            </div>
          </div>

          {/* Telemedicina */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-white" />
              </div>
              <Wifi className="w-5 h-5 text-cyan-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {statsConfirmaciones.telemedicina}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Telemedicina
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Conexiones remotas
                </span>
              </div>
            </div>
          </div>

          {/* Total del día */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <PieChart className="w-5 h-5 text-indigo-400" />
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {statsConfirmaciones.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Citas del día
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Gestión activa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FILTROS + TABS + LISTA PRINCIPAL */}
        <div
          className={`rounded-2xl p-6 mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          {/* Encabezado módulo */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <PhoneCall className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Panel de Confirmaciones
                </h3>
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Confirma, reprograma o cancela citas de forma rápida y
                  controlada.
                </p>
              </div>
            </div>

            {/* Filtro de fecha + botones */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                <input
                  type="date"
                  value={fechaSeleccionada.toISOString().split("T")[0]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const nuevaFecha = new Date(val + "T00:00:00");
                    setFechaSeleccionada(nuevaFecha);
                  }}
                  className={`px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
              </div>
              <button
                onClick={() => {
                  const hoy = new Date();
                  setFechaSeleccionada(hoy);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-200/60 hover:bg-gray-300 transition-all"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Filtros superiores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Médico */}
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
              >
                Médico
              </label>
              <select
                value={filtroMedico || ""}
                onChange={(e) =>
                  setFiltroMedico(e.target.value ? Number(e.target.value) : null)
                }
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              >
                <option value="">Todos</option>
                {medicosAsignados.map((medico) => (
                  <option key={medico.id_profesional} value={medico.id_profesional}>
                    {medico.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado cita */}
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
              >
                Estado exacto
              </label>
              <select
                value={filtroEstadoCita}
                onChange={(e) => setFiltroEstadoCita(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              >
                <option value="todas">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="no asiste">No asiste</option>
              </select>
            </div>

            {/* Búsqueda rápida */}
            <div className="md:col-span-2">
              <label
                className={`block text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
              >
                Búsqueda rápida
              </label>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre paciente, médico, teléfono..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200/40"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs por estado */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[
              {
                id: "pendientes",
                label: "Pendientes",
                icon: Clock,
                count: contadoresPorEstado.pendientes,
              },
              {
                id: "confirmadas",
                label: "Confirmadas",
                icon: CheckCircle2,
                count: contadoresPorEstado.confirmadas,
              },
              {
                id: "canceladas",
                label: "Canceladas",
                icon: X,
                count: contadoresPorEstado.canceladas,
              },
              {
                id: "todas",
                label: "Todas",
                icon: CalendarDays,
                count: contadoresPorEstado.todas,
              },
            ].map((tab) => {
              const activo = estadoTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setEstadoTab(tab.id as "pendientes" | "confirmadas" | "canceladas" | "todas")
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activo ? "bg-white/20" : "bg-gray-200/70 text-gray-800"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2 text-xs font-medium">
              <Filter className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
              <span className={tema.colores.textoSecundario}>
                {confirmacionesFiltradas.length} citas visibles
              </span>
            </div>
          </div>

          {/* Lista de confirmaciones */}
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Cargando citas para confirmar...
                </p>
              </div>
            </div>
          ) : confirmacionesFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <div
                className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
              >
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                No hay citas en este filtro
              </p>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Ajusta la fecha o los filtros para ver otras citas.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
              {confirmacionesFiltradas.map((cita) => (
                <div
                  key={cita.id_cita}
                  className={`p-5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} group`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar Paciente */}
                    <div
                      className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      {cita.paciente.foto_url ? (
                        <Image
                          src={cita.paciente.foto_url}
                          alt={cita.paciente.nombre_completo}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        cita.paciente.nombre_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                      )}
                      {cita.modalidad === "telemedicina" && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {(!cita.confirmada && cita.requiere_confirmacion) && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info Cita */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4
                            className={`text-xl font-black ${tema.colores.texto} mb-1`}
                          >
                            {cita.paciente.nombre_completo}
                          </h4>
                          <p
                            className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2 mb-1`}
                          >
                            <Stethoscope className="w-4 h-4" />
                            {cita.medico.nombre_completo} - {cita.medico.especialidad}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {cita.paciente.telefono && (
                              <a
                                href={`tel:${cita.paciente.telefono}`}
                                className={`text-xs font-medium ${tema.colores.acento} flex items-center gap-1 hover:underline`}
                              >
                                <Phone className="w-3 h-3" />
                                {cita.paciente.telefono}
                              </a>
                            )}
                            {cita.paciente.celular && (
                              <a
                                href={`tel:${cita.paciente.celular}`}
                                className={`text-xs font-medium ${tema.colores.acento} flex items-center gap-1 hover:underline`}
                              >
                                <Phone className="w-3 h-3" />
                                {cita.paciente.celular}
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                              cita.confirmada
                                ? "confirmada"
                                : cita.estado || "pendiente"
                            )}`}
                          >
                            {cita.confirmada ? "confirmada" : cita.estado}
                          </span>
                          {cita.requiere_confirmacion && !cita.confirmada && (
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Requiere confirmación
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                        >
                          <Clock
                            className={`w-4 h-4 ${tema.colores.acento}`}
                          />
                          <span
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {formatearHora(cita.fecha_hora)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                        >
                          <CalendarCheck
                            className={`w-4 h-4 ${tema.colores.acento}`}
                          />
                          <span
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {cita.duracion_minutos} min
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                        >
                          <Pill
                            className={`w-4 h-4 ${tema.colores.acento}`}
                          />
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            {cita.tipo_cita}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                        >
                          <Globe
                            className={`w-4 h-4 ${tema.colores.acento}`}
                          />
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            {cita.modalidad === "telemedicina"
                              ? "Telemedicina"
                              : "Presencial"}
                          </span>
                        </div>
                      </div>

                      {cita.motivo && (
                        <p
                          className={`text-sm mb-3 ${tema.colores.textoSecundario} flex items-start gap-2`}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Motivo: </strong>
                            {cita.motivo}
                          </span>
                        </p>
                      )}

                      {/* Acciones de la cita */}
                      <div className="flex flex-wrap items-center gap-2">
                        {!cita.confirmada && (
                          <button
                            onClick={() => confirmarCita(cita.id_cita)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirmar
                          </button>
                        )}

                        <button
                          onClick={() =>
                            enviarRecordatorio(cita.id_cita, "whatsapp")
                          }
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp
                        </button>

                        <button
                          onClick={() => enviarRecordatorio(cita.id_cita, "sms")}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                        >
                          <Phone className="w-4 h-4" />
                          SMS
                        </button>

                        <button
                          onClick={() =>
                            enviarRecordatorio(cita.id_cita, "email")
                          }
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>

                        <button
                          onClick={() => manejarCancelarCita(cita.id_cita)}
                          className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white hover:scale-105"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>

                        <Link
                          href={`/secretaria/pacientes/${cita.paciente.id_paciente}`}
                          className={`px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                        >
                          <Eye className="w-4 h-4" />
                          Ver Ficha
                        </Link>

                        <Link
                          href={`/secretaria/agenda/reprogramar?id_cita=${cita.id_cita}`}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
                        >
                          <CalendarClock className="w-4 h-4" />
                          Reprogramar
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                © 2025 AnyssaMed. Módulo de Confirmaciones.
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
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
