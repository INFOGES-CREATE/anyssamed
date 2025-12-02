//src\app\(dashboard)\secretaria\agenda\nueva\page.tsx
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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

type EstadoCitaAgenda =
  | "programada"
  | "confirmada"
  | "en_sala_espera"
  | "en_atencion"
  | "completada"
  | "cancelada"
  | "no_asistio"
  | "reprogramada"
  | string;

type PrioridadCitaAgenda = "normal" | "alta" | "urgente" | string;

interface PacienteAgenda {
  id_paciente: number;
  nombre_completo: string;
  rut?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  foto_url?: string | null;
  fecha_nacimiento?: string | null;
  sexo?: string | null;
}

interface MedicoAgenda {
  id_profesional: number;
  nombre_completo: string;
  especialidad: string;
  foto_url?: string | null;
  id_especialidad?: number | null;
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

interface MedicoAsignado extends MedicoAgenda {
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

interface TelemedicinaProveedor {
  id_proveedor: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  color?: string | null;
  es_default?: boolean;
  activo: boolean;
  caracteristicas?: string | null;
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

const limpiarFecha = (fechaStr: string | undefined | null) => {
  if (!fechaStr) return null;
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return null;
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
// COMPONENTE PRINCIPAL (CONTENT)
// ========================================

function NuevaCitaSecretariaContent() {
  const searchParams = useSearchParams();

  // ========================================
  // ESTADOS BÁSICOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");

  const [estadisticas, setEstadisticas] = useState<EstadisticasSecretaria | null>(null);
  const [medicosAsignados, setMedicosAsignados] = useState<MedicoAsignado[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);

  const [tiposCita, setTiposCita] = useState<TipoCitaAgenda[]>([]);
  const [salas, setSalas] = useState<SalaAgenda[]>([]);
  const [proveedoresTele, setProveedoresTele] = useState<TelemedicinaProveedor[]>([]);

  const [seccionActiva] = useState("agenda");

  // ========================================
  // ESTADOS NUEVA CITA
  // ========================================

  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);

  // Paciente
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [resultadosPacientes, setResultadosPacientes] = useState<PacienteAgenda[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteAgenda | null>(null);
  const [cargandoPaciente, setCargandoPaciente] = useState(false);

  // Configuración cita
  const [fechaCita, setFechaCita] = useState("");
  const [horaCita, setHoraCita] = useState("");
  const [duracionCita, setDuracionCita] = useState<number>(30);
  const [tipoCitaSeleccionado, setTipoCitaSeleccionado] = useState<string>("");
  const [prioridadCita, setPrioridadCita] = useState<PrioridadCitaAgenda>("normal");
  const [origenCita, setOrigenCita] = useState<string>("presencial");
  const [modoAtencion, setModoAtencion] = useState<"presencial" | "telemedicina" | "mixto">(
    "presencial"
  );
  const [estadoInicialCita, setEstadoInicialCita] =
    useState<EstadoCitaAgenda>("programada");

  const [medicoSeleccionadoId, setMedicoSeleccionadoId] = useState<number | "">("");
  const [salaSeleccionadaId, setSalaSeleccionadaId] = useState<number | "">("");

  const [motivoCita, setMotivoCita] = useState("");
  const [notasPublicas, setNotasPublicas] = useState("");
  const [notasPrivadas, setNotasPrivadas] = useState("");

  // Recordatorios / Confirmaciones
  const [enviarRecordatorioSMS, setEnviarRecordatorioSMS] = useState(true);
  const [enviarRecordatorioWhatsApp, setEnviarRecordatorioWhatsApp] = useState(true);
  const [enviarRecordatorioEmail, setEnviarRecordatorioEmail] = useState(false);
  const [recordatorioMinutosAntes, setRecordatorioMinutosAntes] = useState<number>(60 * 24); // 24h

  const [programarConfirmacion, setProgramarConfirmacion] = useState(true);
  const [confirmarMinutosAntes, setConfirmarMinutosAntes] = useState<number>(90); // 90min
  const [canalConfirmacion, setCanalConfirmacion] = useState<
    "sms" | "whatsapp" | "llamada" | "email"
  >("whatsapp");

  // Telemedicina
  const [crearSesionTelemedicina, setCrearSesionTelemedicina] = useState(true);
  const [proveedorTeleSeleccionado, setProveedorTeleSeleccionado] = useState<number | "">("");
  const [grabarTelemedicina, setGrabarTelemedicina] = useState(false);

  // Estados globales de envío
  const [creandoCitaCompleta, setCreandoCitaCompleta] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [citaCreadaId, setCitaCreadaId] = useState<number | null>(null);

  const [prefillHecho, setPrefillHecho] = useState(false);

  // ========================================
  // MENU DE NAVEGACIÓN
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
        { titulo: "Mis Médicos", icono: UserCheck, url: "/secretaria/medicos" },
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
        { titulo: "Configuración", icono: Settings, url: "/secretaria/recordatorios/config" },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "/secretaria/documentos",
      badge: estadisticas?.documentos_procesados_semana || 0,
      submenu: [
        { titulo: "Gestión", icono: FileText, url: "/secretaria/documentos" },
        { titulo: "Certificados", icono: Award, url: "/secretaria/documentos/certificados" },
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
        { titulo: "Órdenes", icono: ClipboardList, url: "/secretaria/documentos/ordenes" },
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
        { titulo: "Asistencia", icono: Settings, url: "/secretaria/telemedicina/asistencia" },
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
        { titulo: "Rendimiento", icono: Target, url: "/secretaria/reportes/rendimiento" },
      ],
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "/secretaria/perfil",
      submenu: [
        { titulo: "Información Personal", icono: User, url: "/secretaria/perfil" },
        { titulo: "Horarios", icono: Clock, url: "/secretaria/perfil/horarios" },
        { titulo: "Preferencias", icono: Settings, url: "/secretaria/perfil/preferencias" },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "/secretaria/configuracion",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/general" },
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
      cargarCatalogosNuevaCita();
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
      } catch (e) {
        console.error("No se pudo cargar la preferencia de tema:", e);
      }
    };

    cargarPreferenciaTema();
  }, []);

  // Prefill desde querystring (fecha, hora, médico, tipo_cita, rut)
  useEffect(() => {
    if (!usuario?.secretaria || prefillHecho) return;

    const hoy = new Date();
    const defaultFecha =
      searchParams.get("fecha") || hoy.toISOString().substring(0, 10);
    const defaultHora =
      searchParams.get("hora") ||
      new Date(hoy.getTime() + 30 * 60000).toISOString().substring(11, 16); // +30 min

    setFechaCita(defaultFecha);
    setHoraCita(defaultHora);

    const medicoParam = searchParams.get("id_profesional");
    if (medicoParam) {
      setMedicoSeleccionadoId(Number(medicoParam));
    }

    const tipoParam = searchParams.get("tipo_cita");
    if (tipoParam) {
      setTipoCitaSeleccionado(tipoParam);
    }

    const origenParam = searchParams.get("origen");
    if (origenParam) {
      setOrigenCita(origenParam);
      if (origenParam === "web" || origenParam === "whatsapp" || origenParam === "app_movil") {
        setModoAtencion("telemedicina");
      }
    }

    const rutParam = searchParams.get("rut");
    if (rutParam) {
      setBusquedaPaciente(rutParam);
      // No llamamos automático aquí para evitar doble request; el usuario puede pulsar Buscar rápido.
    }

    setPrefillHecho(true);
  }, [usuario, searchParams, prefillHecho]);

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
      setMedicosAsignados(data.medicos_asignados || []);
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    }
  };

  const cargarCatalogosNuevaCita = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      const res = await fetch(
        `/api/secretaria/agenda/catalogos-nueva?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta catalogos-nueva:", data);
        return;
      }

      setTiposCita(data.tipos_cita || []);
      setSalas(data.salas || []);

      if (Array.isArray(data.medicos_asignados) && data.medicos_asignados.length > 0) {
        setMedicosAsignados(data.medicos_asignados);
      }

      if (Array.isArray(data.telemedicina_proveedores)) {
        setProveedoresTele(data.telemedicina_proveedores);
        const defaultProvider = data.telemedicina_proveedores.find(
          (p: TelemedicinaProveedor) => p.es_default
        );
        if (defaultProvider) {
          setProveedorTeleSeleccionado(defaultProvider.id_proveedor);
        }
      }
    } catch (err) {
      console.error("Error al cargar catálogos para nueva cita:", err);
    }
  };

  // ========================================
  // ACCIONES GENERALES
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

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
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
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
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
  // ACCIONES ESPECÍFICAS NUEVA CITA
  // ========================================

  const buscarPaciente = async () => {
    if (!busquedaPaciente.trim()) {
      setMensajeError("Ingresa RUT, nombre o teléfono para buscar al paciente.");
      setResultadosPacientes([]);
      return;
    }
    if (!usuario?.secretaria) return;

    setMensajeError(null);
    setMensajeExito(null);
    setCargandoPaciente(true);

    try {
      const params = new URLSearchParams();
      params.append("query", busquedaPaciente.trim());
      params.append("id_centro", String(usuario.secretaria.id_centro));

      const res = await fetch(`/api/secretaria/pacientes/buscar?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setResultadosPacientes([]);
        setPacienteSeleccionado(null);
        setMensajeError(data.message || "No se encontraron pacientes con ese criterio.");
        return;
      }

      const lista: PacienteAgenda[] = data.pacientes || [];
      setResultadosPacientes(lista);

      if (lista.length === 1) {
        setPacienteSeleccionado(lista[0]);
      }
    } catch (err) {
      console.error("Error al buscar paciente:", err);
      setMensajeError("Error inesperado al buscar paciente.");
      setResultadosPacientes([]);
    } finally {
      setCargandoPaciente(false);
    }
  };

  const medicoSeleccionado = useMemo(() => {
    if (typeof medicoSeleccionadoId !== "number") return null;
    return (
      medicosAsignados.find(
        (m) => m.id_profesional === (medicoSeleccionadoId as number)
      ) || null
    );
  }, [medicosAsignados, medicoSeleccionadoId]);

  const salaSeleccionada = useMemo(() => {
    if (typeof salaSeleccionadaId !== "number") return null;
    return salas.find((s) => s.id_sala === (salaSeleccionadaId as number)) || null;
  }, [salas, salaSeleccionadaId]);

  const proveedorSeleccionadoObj = useMemo(() => {
    if (typeof proveedorTeleSeleccionado !== "number") return null;
    return (
      proveedoresTele.find((p) => p.id_proveedor === proveedorTeleSeleccionado) || null
    );
  }, [proveedoresTele, proveedorTeleSeleccionado]);

  const fechaHoraPreview = useMemo(() => {
    if (!fechaCita || !horaCita) return "-";
    const d = new Date(`${fechaCita}T${horaCita}:00`);
    if (Number.isNaN(d.getTime())) return "-";
    return `${formatearFechaLarga(d)} • ${formatearHora(d)}`;
  }, [fechaCita, horaCita]);

  const puedeAvanzarPaso1 = useMemo(() => !!pacienteSeleccionado, [pacienteSeleccionado]);

  const puedeAvanzarPaso2 = useMemo(() => {
    if (!fechaCita || !horaCita) return false;
    if (!medicoSeleccionadoId) return false;
    if (!tipoCitaSeleccionado) return false;
    return true;
  }, [fechaCita, horaCita, medicoSeleccionadoId, tipoCitaSeleccionado]);

  const manejarCrearCitaCompleta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario?.secretaria) return;

    setMensajeError(null);
    setMensajeExito(null);

    if (!pacienteSeleccionado) {
      setMensajeError("Debes seleccionar un paciente antes de crear la cita.");
      setPasoActual(1);
      return;
    }

    if (!fechaCita || !horaCita) {
      setMensajeError("Debes indicar fecha y hora de la cita.");
      setPasoActual(2);
      return;
    }

    if (!medicoSeleccionadoId) {
      setMensajeError("Debes seleccionar un médico para la cita.");
      setPasoActual(2);
      return;
    }

    const duracionMin = duracionCita || 30;
    const tipoFinal = tipoCitaSeleccionado || "control";
    const prioridadFinal: PrioridadCitaAgenda = prioridadCita || "normal";
    const origenFinal = origenCita || "presencial";

    const teleActiva =
      tipoFinal === "telemedicina" || modoAtencion === "telemedicina" || modoAtencion === "mixto";

    const payload: any = {
      id_secretaria: usuario.secretaria.id_secretaria,
      id_centro: usuario.secretaria.id_centro,
      id_sucursal: usuario.secretaria.id_sucursal || null,

      id_paciente: pacienteSeleccionado.id_paciente,
      id_profesional: medicoSeleccionadoId,
      id_especialidad: medicoSeleccionado?.id_especialidad || null,

      fecha: fechaCita,
      hora: horaCita,
      duracion_minutos: duracionMin,

      tipo_cita: tipoFinal,
      prioridad: prioridadFinal,
      origen: origenFinal,
      estado_inicial: estadoInicialCita,

      id_sala: salaSeleccionadaId || null,

      motivo: motivoCita || null,
      notas: notasPublicas || null,
      notas_privadas: notasPrivadas || null,

      // Opciones de recordatorios -> tabla recordatorios
      recordatorios: {
        sms: enviarRecordatorioSMS,
        whatsapp: enviarRecordatorioWhatsApp,
        email: enviarRecordatorioEmail,
        minutos_antes: recordatorioMinutosAntes,
      },

      // Opciones de confirmación -> tabla confirmaciones
      confirmacion: {
        programar: programarConfirmacion,
        minutos_antes: confirmarMinutosAntes,
        canal: canalConfirmacion,
      },

      // Telemedicina (sesión + configuraciones)
      telemedicina: teleActiva
        ? {
            crear_sesion: crearSesionTelemedicina,
            id_proveedor: proveedorTeleSeleccionado || null,
            grabar: grabarTelemedicina,
          }
        : null,
    };

    try {
      setCreandoCitaCompleta(true);

      const res = await fetch("/api/secretaria/agenda/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta crear cita:", data);
        setMensajeError(data.message || "No se pudo crear la cita. Intenta nuevamente.");
        return;
      }

      const idCita =
        data.cita?.id_cita || data.id_cita || data.cita_id || null;

      if (idCita) {
        setCitaCreadaId(Number(idCita));
      }

      setMensajeExito("Cita creada correctamente. 🎉");
      setPasoActual(3);
    } catch (err) {
      console.error("Error al crear cita completa:", err);
      setMensajeError("Error inesperado al crear la cita.");
    } finally {
      setCreandoCitaCompleta(false);
    }
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
              <CalendarPlus className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Preparando módulo de nueva cita
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Cargando datos de tu centro y médicos...
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
            No tienes permisos para acceder al módulo de agendamiento de secretaría.
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
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <CalendarPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Nueva Cita Premium
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <CalendarPlus className="w-6 h-6 text-white" />
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
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duración-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
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
          {/* Búsqueda global */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar rápido en el sistema (paciente, médico, cita...)"
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
                        {usuario?.secretaria?.centro?.nombre ?? "Centro no asignado"}
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duración-300 ${tema.colores.hover} ${tema.colores.texto}`}
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
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado */}
        <div className="mb-8 flex flex-col xl:flex-row gap-6 xl:items-center xl:justify-between">
          <div>
            <h2
              className={`text-4xl xl:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">✨</span>
            </h2>
            <p
              className={`text-lg xl:text-xl font-semibold ${tema.colores.textoSecundario}`}
            >
              Nuevo agendamiento en{" "}
              <span className="font-bold">
                {usuario?.secretaria?.centro?.nombre ?? "Centro no asignado"}
              </span>
              . Diseñado para crear citas completas en segundos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div
              className={`flex items-center rounded-2xl p-1 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <button
                type="button"
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  pasoActual === 1
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
                onClick={() => setPasoActual(1)}
              >
                <User className="w-4 h-4" />
                Paciente
              </button>
              <button
                type="button"
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  pasoActual === 2
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
                onClick={() => puedeAvanzarPaso1 && setPasoActual(2)}
              >
                <Calendar className="w-4 h-4" />
                Configuración
              </button>
              <button
                type="button"
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  pasoActual === 3
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                }`}
                onClick={() => puedeAvanzarPaso2 && setPasoActual(3)}
              >
                <Bell className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes globales */}
        {(mensajeError || mensajeExito) && (
          <div className="mb-6">
            {mensajeError && (
              <div
                className={`mb-3 rounded-2xl px-4 py-3 flex items-start gap-3 border ${tema.colores.card} ${tema.colores.borde} border-red-400/60 bg-red-500/5`}
              >
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="text-sm text-red-200 sm:text-red-300">
                  {mensajeError}
                </p>
              </div>
            )}
            {mensajeExito && (
              <div
                className={`rounded-2xl px-4 py-3 flex items-start gap-3 border ${tema.colores.card} ${tema.colores.borde} border-emerald-400/60 bg-emerald-500/5`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                <p className="text-sm text-emerald-100 sm:text-emerald-200">
                  {mensajeExito}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Layout principal */}
        <form
          onSubmit={manejarCrearCitaCompleta}
          className="grid grid-cols-1 2xl:grid-cols-3 gap-8"
        >
          {/* Columna principal: pasos 1 y 2 */}
          <div className="2xl:col-span-2 space-y-6">
            {/* PASO 1: PACIENTE */}
            {pasoActual === 1 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Paso 1 · Seleccionar paciente
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Busca al paciente por RUT, nombre o teléfono. Si no
                        existe, puedes crear uno nuevo desde el módulo de pacientes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buscador */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1">
                        RUT / Nombre / Teléfono
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={busquedaPaciente}
                          onChange={(e) => setBusquedaPaciente(e.target.value)}
                          placeholder="Ej: 12.345.678-9, Juan Pérez, +569..."
                          className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        {busquedaPaciente && (
                          <button
                            type="button"
                            onClick={() => {
                              setBusquedaPaciente("");
                              setResultadosPacientes([]);
                              setPacienteSeleccionado(null);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200/30"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={buscarPaciente}
                        disabled={cargandoPaciente}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {cargandoPaciente ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        {cargandoPaciente ? "Buscando..." : "Buscar paciente"}
                      </button>
                    </div>
                  </div>

                  {/* Resultados */}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {resultadosPacientes.length === 0 && !cargandoPaciente && (
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        No hay resultados todavía. Escribe y pulsa “Buscar
                        paciente”.
                      </p>
                    )}

                    <div className="space-y-3 mt-2">
                      {resultadosPacientes.map((p) => {
                        const seleccionado = pacienteSeleccionado?.id_paciente === p.id_paciente;
                        return (
                          <div
                            key={p.id_paciente}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition-all duration-200 ${
                              seleccionado
                                ? `border-2 border-emerald-400/80 bg-emerald-500/5`
                                : `${tema.colores.hover} border border-transparent`
                            }`}
                            onClick={() => setPacienteSeleccionado(p)}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xs font-bold`}
                            >
                              {p.foto_url ? (
                                <Image
                                  src={p.foto_url}
                                  alt={p.nombre_completo}
                                  width={40}
                                  height={40}
                                  className="rounded-xl object-cover"
                                />
                              ) : (
                                p.nombre_completo
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold truncate ${tema.colores.texto}`}
                              >
                                {p.nombre_completo}
                              </p>
                              <p
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                {p.rut && <span className="mr-2">RUT: {p.rut}</span>}
                                {p.celular && <span>📱 {p.celular}</span>}
                              </p>
                            </div>
                            {seleccionado ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPacienteSeleccionado(p);
                                }}
                                className={`px-3 py-1 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                Seleccionar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen paciente seleccionado */}
                  {pacienteSeleccionado && (
                    <div
                      className={`mt-4 rounded-2xl px-4 py-3 border ${tema.colores.borde} ${tema.colores.card}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {pacienteSeleccionado.foto_url ? (
                            <Image
                              src={pacienteSeleccionado.foto_url}
                              alt={pacienteSeleccionado.nombre_completo}
                              width={40}
                              height={40}
                              className="rounded-xl object-cover"
                            />
                          ) : (
                            pacienteSeleccionado.nombre_completo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-black ${tema.colores.texto}`}
                          >
                            {pacienteSeleccionado.nombre_completo}
                          </p>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {pacienteSeleccionado.rut && (
                              <span className="mr-2">
                                RUT: {pacienteSeleccionado.rut}
                              </span>
                            )}
                            {pacienteSeleccionado.celular && (
                              <span>📱 {pacienteSeleccionado.celular}</span>
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/secretaria/pacientes/${pacienteSeleccionado.id_paciente}`}
                          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${tema.colores.primario} text-white`}
                        >
                          <Eye className="w-3 h-3" />
                          Ficha
                        </Link>
                      </div>
                      <p
                        className={`text-[0.7rem] ${tema.colores.textoSecundario}`}
                      >
                        Este será el paciente asociado a la nueva cita.
                      </p>
                    </div>
                  )}

                  {/* Botón siguiente */}
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      disabled={!puedeAvanzarPaso1}
                      onClick={() => setPasoActual(2)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      Configurar cita
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: CONFIGURACIÓN */}
            {pasoActual === 2 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <CalendarCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Paso 2 · Configurar cita
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Selecciona fecha, hora, médico, tipo de cita, prioridad y sala.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Fecha y hora */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold">
                        Fecha de la cita
                      </label>
                      <input
                        type="date"
                        value={fechaCita}
                        onChange={(e) => setFechaCita(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Hora de inicio
                      </label>
                      <input
                        type="time"
                        value={horaCita}
                        onChange={(e) => setHoraCita(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Duración (min)
                      </label>
                      <select
                        value={duracionCita}
                        onChange={(e) => setDuracionCita(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        {[10, 15, 20, 30, 40, 45, 60].map((min) => (
                          <option key={min} value={min}>
                            {min} minutos
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Médico, tipo, prioridad */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold">
                        Médico / Profesional
                      </label>
                      <select
                        value={medicoSeleccionadoId}
                        onChange={(e) =>
                          setMedicoSeleccionadoId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="">Seleccionar médico</option>
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
                        Tipo de cita
                      </label>
                      <select
                        value={tipoCitaSeleccionado}
                        onChange={(e) => setTipoCitaSeleccionado(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="">Seleccionar</option>
                        {tiposCita.map((t) => (
                          <option key={t.id_tipo_cita} value={t.nombre}>
                            {t.nombre}
                          </option>
                        ))}
                        {tiposCita.length === 0 && (
                          <>
                            <option value="primera_vez">Primera vez</option>
                            <option value="control">Control</option>
                            <option value="procedimiento">Procedimiento</option>
                            <option value="urgencia">Urgencia</option>
                            <option value="telemedicina">Telemedicina</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Prioridad
                      </label>
                      <select
                        value={prioridadCita}
                        onChange={(e) =>
                          setPrioridadCita(e.target.value as PrioridadCitaAgenda)
                        }
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="normal">Normal</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  {/* Origen, modo atención, estado inicial */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold">
                        Origen de la cita
                      </label>
                      <select
                        value={origenCita}
                        onChange={(e) => setOrigenCita(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="presencial">Presencial (mostrador)</option>
                        <option value="telefono">Teléfono</option>
                        <option value="web">Portal Paciente</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="chatbot">Chatbot</option>
                        <option value="app_movil">App móvil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Tipo de atención
                      </label>
                      <select
                        value={modoAtencion}
                        onChange={(e) =>
                          setModoAtencion(
                            e.target.value as "presencial" | "telemedicina" | "mixto"
                          )
                        }
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="presencial">Presencial</option>
                        <option value="telemedicina">Telemedicina</option>
                        <option value="mixto">Mixto (presencial + video)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Estado inicial
                      </label>
                      <select
                        value={estadoInicialCita}
                        onChange={(e) =>
                          setEstadoInicialCita(e.target.value as EstadoCitaAgenda)
                        }
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="programada">Programada</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="en_sala_espera">En sala de espera</option>
                      </select>
                    </div>
                  </div>

                  {/* Sala */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold">
                        Sala (opcional)
                      </label>
                      <select
                        value={salaSeleccionadaId}
                        onChange={(e) =>
                          setSalaSeleccionadaId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="">Sin sala específica</option>
                        {salas.map((s) => (
                          <option key={s.id_sala} value={s.id_sala}>
                            {s.nombre} · {s.tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Motivo / resumen de consulta
                      </label>
                      <input
                        type="text"
                        value={motivoCita}
                        onChange={(e) => setMotivoCita(e.target.value)}
                        placeholder="Ej: Control crónico, chequeo general, etc."
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                  </div>

                  {/* Notas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-semibold">
                        Nota visible para el médico
                      </label>
                      <textarea
                        value={notasPublicas}
                        onChange={(e) => setNotasPublicas(e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-xl resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        placeholder="Indicaciones o contexto breve que el médico debería saber."
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">
                        Nota interna (solo secretaria / administración)
                      </label>
                      <textarea
                        value={notasPrivadas}
                        onChange={(e) => setNotasPrivadas(e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-xl resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        placeholder="Información interna (no visible al paciente)."
                      />
                    </div>
                  </div>

                  {/* Telemedicina extra */}
                  {(modoAtencion === "telemedicina" ||
                    modoAtencion === "mixto" ||
                    tipoCitaSeleccionado.toLowerCase() === "telemedicina") && (
                    <div
                      className={`mt-4 rounded-2xl px-4 py-3 border ${tema.colores.borde} bg-blue-500/5`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="w-4 h-4 text-sky-400" />
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          Configuración de Telemedicina
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            id="crearSesionTele"
                            type="checkbox"
                            className="rounded"
                            checked={crearSesionTelemedicina}
                            onChange={(e) =>
                              setCrearSesionTelemedicina(e.target.checked)
                            }
                          />
                          <label
                            htmlFor="crearSesionTele"
                            className="font-semibold"
                          >
                            Crear sala de videollamada automáticamente
                          </label>
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold">
                            Proveedor
                          </label>
                          <select
                            value={proveedorTeleSeleccionado}
                            onChange={(e) =>
                              setProveedorTeleSeleccionado(
                                e.target.value ? Number(e.target.value) : ""
                              )
                            }
                            className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          >
                            <option value="">Proveedor por defecto</option>
                            {proveedoresTele.map((p) => (
                              <option key={p.id_proveedor} value={p.id_proveedor}>
                                {p.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="grabarTele"
                            type="checkbox"
                            className="rounded"
                            checked={grabarTelemedicina}
                            onChange={(e) =>
                              setGrabarTelemedicina(e.target.checked)
                            }
                          />
                          <label
                            htmlFor="grabarTele"
                            className="font-semibold"
                          >
                            Solicitar grabación (si está permitido)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones navegación pasos */}
                  <div className="mt-5 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setPasoActual(1)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver a paciente
                    </button>
                    <button
                      type="button"
                      disabled={!puedeAvanzarPaso2}
                      onClick={() => setPasoActual(3)}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      Configurar recordatorios
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: RECORDATORIOS & CONFIRMACIÓN */}
            {pasoActual === 3 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Paso 3 · Recordatorios y confirmación
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Configura cómo y cuándo avisaremos al paciente, y crea la cita.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Recordatorios */}
                  <div
                    className={`rounded-2xl px-4 py-3 border ${tema.colores.borde} ${tema.colores.card}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Send className="w-4 h-4 text-sky-400" />
                      <p
                        className={`text-sm font-bold ${tema.colores.texto}`}
                      >
                        Recordatorios automáticos
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            id="recSms"
                            type="checkbox"
                            className="rounded"
                            checked={enviarRecordatorioSMS}
                            onChange={(e) =>
                              setEnviarRecordatorioSMS(e.target.checked)
                            }
                          />
                          <label htmlFor="recSms" className="font-semibold">
                            SMS
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="recWsp"
                            type="checkbox"
                            className="rounded"
                            checked={enviarRecordatorioWhatsApp}
                            onChange={(e) =>
                              setEnviarRecordatorioWhatsApp(e.target.checked)
                            }
                          />
                          <label htmlFor="recWsp" className="font-semibold">
                            WhatsApp
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="recEmail"
                            type="checkbox"
                            className="rounded"
                            checked={enviarRecordatorioEmail}
                            onChange={(e) =>
                              setEnviarRecordatorioEmail(e.target.checked)
                            }
                          />
                          <label htmlFor="recEmail" className="font-semibold">
                            Email
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-1 font-semibold">
                          Tiempo previo al recordatorio
                        </label>
                        <select
                          value={recordatorioMinutosAntes}
                          onChange={(e) =>
                            setRecordatorioMinutosAntes(
                              Number(e.target.value)
                            )
                          }
                          className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        >
                          <option value={60}>1 hora antes</option>
                          <option value={120}>2 horas antes</option>
                          <option value={60 * 6}>6 horas antes</option>
                          <option value={60 * 12}>12 horas antes</option>
                          <option value={60 * 24}>1 día antes</option>
                          <option value={60 * 48}>2 días antes</option>
                        </select>
                      </div>
                      <div>
                        <p
                          className={`text-[0.7rem] ${tema.colores.textoSecundario}`}
                        >
                          Se crearán registros en la tabla{" "}
                          <span className="font-bold">recordatorios</span> y el
                          sistema de envío los procesará automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confirmación */}
                  <div
                    className={`rounded-2xl px-4 py-3 border ${tema.colores.borde} ${tema.colores.card}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <p
                        className={`text-sm font-bold ${tema.colores.texto}`}
                      >
                        Confirmación de asistencia
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          id="progConf"
                          type="checkbox"
                          className="rounded"
                          checked={programarConfirmacion}
                          onChange={(e) =>
                            setProgramarConfirmacion(e.target.checked)
                          }
                        />
                        <label htmlFor="progConf" className="font-semibold">
                          Programar confirmación
                        </label>
                      </div>
                      <div>
                        <label className="block mb-1 font-semibold">
                          Canal principal
                        </label>
                        <select
                          value={canalConfirmacion}
                          onChange={(e) =>
                            setCanalConfirmacion(
                              e.target.value as
                                | "sms"
                                | "whatsapp"
                                | "llamada"
                                | "email"
                            )
                          }
                          className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          disabled={!programarConfirmacion}
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                          <option value="email">Email</option>
                          <option value="llamada">Llamada manual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 font-semibold">
                          Tiempo previo a confirmar
                        </label>
                        <select
                          value={confirmarMinutosAntes}
                          onChange={(e) =>
                            setConfirmarMinutosAntes(Number(e.target.value))
                          }
                          className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          disabled={!programarConfirmacion}
                        >
                          <option value={60}>1 hora antes</option>
                          <option value={90}>1.5 horas antes</option>
                          <option value={120}>2 horas antes</option>
                          <option value={60 * 24}>1 día antes</option>
                        </select>
                      </div>
                    </div>
                    <p
                      className={`mt-2 text-[0.7rem] ${tema.colores.textoSecundario}`}
                    >
                      Se registrará en la tabla{" "}
                      <span className="font-bold">confirmaciones</span> para
                      controlar respuestas de asistencia.
                    </p>
                  </div>

                  {/* Navegación y submit */}
                  <div className="mt-5 flex flex-col sm:flex-row justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setPasoActual(2)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver a configuración
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      {citaCreadaId && (
                        <Link
                          href={`/secretaria/agenda/cita/${citaCreadaId}`}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                        >
                          <Eye className="w-4 h-4" />
                          Ver cita creada
                        </Link>
                      )}
                      <button
                        type="submit"
                        disabled={creandoCitaCompleta}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {creandoCitaCompleta ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CalendarPlus className="w-4 h-4" />
                        )}
                        {creandoCitaCompleta
                          ? "Creando cita..."
                          : "Crear cita completa"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral: vista previa + mini radar */}
          <div className="space-y-6">
            {/* Vista previa de cita */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-black ${tema.colores.texto}`}
                  >
                    Vista previa de la cita
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Revisa que todo esté correcto antes de guardar.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p className="font-semibold">Fecha y hora</p>
                    <p className={tema.colores.textoSecundario}>
                      {fechaHoraPreview}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <div>
                    <p className="font-semibold">Paciente</p>
                    <p className={tema.colores.textoSecundario}>
                      {pacienteSeleccionado
                        ? pacienteSeleccionado.nombre_completo
                        : "Sin paciente seleccionado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-semibold">Profesional</p>
                    <p className={tema.colores.textoSecundario}>
                      {medicoSeleccionado
                        ? `${medicoSeleccionado.nombre_completo} · ${medicoSeleccionado.especialidad}`
                        : "Sin médico seleccionado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-semibold">Tipo / Prioridad / Estado</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-[0.7rem] font-bold border ${tema.colores.borde}`}
                      >
                        Tipo: {tipoCitaSeleccionado || "No definido"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-[0.7rem] font-bold border ${obtenerColorPrioridad(
                          prioridadCita
                        )}`}
                      >
                        Prioridad: {prioridadCita}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-[0.7rem] font-bold border ${obtenerColorEstado(
                          estadoInicialCita
                        )}`}
                      >
                        Estado: {estadoInicialCita}
                      </span>
                    </div>
                  </div>
                </div>
                {salaSeleccionada && (
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <div>
                      <p className="font-semibold">Sala asignada</p>
                      <p className={tema.colores.textoSecundario}>
                        {salaSeleccionada.nombre} · {salaSeleccionada.tipo}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <div>
                    <p className="font-semibold">Origen / Atención</p>
                    <p className={tema.colores.textoSecundario}>
                      Origen: {origenCita} · Atención: {modoAtencion}
                    </p>
                  </div>
                </div>
                {motivoCita && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-semibold">Motivo</p>
                      <p className={tema.colores.textoSecundario}>
                        {motivoCita}
                      </p>
                    </div>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-500/40 pt-3 mt-2 text-[0.7rem]">
                  <p className={tema.colores.textoSecundario}>
                    Esta vista previa resume lo que se enviará hacia las tablas{" "}
                    <span className="font-bold">citas</span>,{" "}
                    <span className="font-bold">recordatorios</span> y{" "}
                    <span className="font-bold">confirmaciones</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Mini radar secretaria */}
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
                      Resumen rápido de tu jornada.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div
                    className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                  >
                    <p className={`font-bold ${tema.colores.texto}`}>
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
                    <p className={`font-bold ${tema.colores.texto}`}>
                      Confirmadas
                    </p>
                    <p className="text-lg font-black text-emerald-400">
                      {estadisticas.citas_confirmadas_hoy}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                  >
                    <p className={`font-bold ${tema.colores.texto}`}>
                      Llamadas hoy
                    </p>
                    <p className="text-lg font-black text-sky-400">
                      {estadisticas.llamadas_realizadas_hoy}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 ${tema.colores.hover}`}
                  >
                    <p className={`font-bold ${tema.colores.texto}`}>
                      Pendientes
                    </p>
                    <p className="text-lg font-black text-amber-400">
                      {estadisticas.citas_pendientes_confirmacion}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div
              className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-300" />
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  Tips para agendar ultra-rápido
                </p>
              </div>
              <ul className={`text-[0.75rem] space-y-1 ${tema.colores.textoSecundario}`}>
                <li>• Usa la barra superior para ir rápido a pacientes o médicos.</li>
                <li>
                  • Si vienes desde la agenda, los parámetros de fecha / médico
                  pueden venir prellenados por la URL.
                </li>
                <li>
                  • Las opciones de recordatorio y confirmación alimentan directamente
                  las tablas <strong>recordatorios</strong> y <strong>confirmaciones</strong>.
                </li>
                <li>
                  • Para telemedicina, el backend creará registros en{" "}
                  <strong>telemedicina_sesiones</strong> según el proveedor elegido.
                </li>
              </ul>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <footer
          className={`transition-all duración-300 mt-12 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                © 2025 AnyssaMed · Módulo de Nueva Cita Inteligente.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v4.0.0
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <Link
                href="/ayuda"
                className={`font-bold transición-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`font-bold transición-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`font-bold transición-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className="font-bold text-red-400 hover:text-red-300 transición-colors"
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

// ========================================
// WRAPPER CON SUSPENSE (DEFAULT EXPORT)
// ========================================

export default function NuevaCitaSecretariaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">
              Cargando módulo de nueva cita...
            </p>
          </div>
        </div>
      }
    >
      <NuevaCitaSecretariaContent />
    </Suspense>
  );
}
