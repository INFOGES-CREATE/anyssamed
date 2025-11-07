// app/(dashboard)/medico/agenda/page.tsx
"use client";
import React from "react";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Send,
  FileText,
  Printer,
  Share2,
  Bell,
  BellOff,
  X,
  Check,
  Loader2,
  Sun,
  Moon,
  Sparkles,
  Wifi,
  HeartPulse,
  ArrowLeft,
  ArrowRight,
  User,
  Settings,
  LogOut,
  Home,
  Stethoscope,
  Activity,
  TrendingUp,
  TrendingDown,
  Star,
  Zap,
  Target,
  Award,
  Briefcase,
  Grid,
  List,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  UserCheck,
  UserX,
  PhoneCall,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Camera,
  Paperclip,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Maximize2,
  Minimize2,
  Columns,
  Rows,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Building2,
  DollarSign,
  CreditCard,
  Save,
  Repeat,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type VistaCalendario = "dia" | "semana" | "mes" | "agenda";
type VistaModo = "calendario" | "lista" | "timeline";
type EstadoCita =
  | "programada"
  | "confirmada"
  | "en_sala_espera"
  | "en_atencion"
  | "completada"
  | "cancelada"
  | "no_asistio"
  | "reprogramada";
type TipoCita =
  | "primera_vez"
  | "control"
  | "procedimiento"
  | "urgencia"
  | "telemedicina";

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
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
}

interface Cita {
  id_cita: number;
  id_paciente: number;
  id_medico: number;
  id_centro: number;
  id_sucursal: number | null;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
  tipo_cita: TipoCita;
  motivo: string | null;
  estado: EstadoCita;
  prioridad: "normal" | "alta" | "urgente";
  id_especialidad: number | null;
  origen: "presencial" | "telefono" | "web" | "whatsapp" | "chatbot" | "app_movil";
  pagada: boolean;
  monto: number | null;
  id_sala: number | null;
  notas: string | null;
  notas_privadas: string | null;
  recordatorio_enviado: boolean;
  confirmacion_enviada: boolean;
  confirmado_por_paciente: boolean;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    genero: string;
    telefono: string | null;
    email: string | null;
    foto_url: string | null;
    grupo_sanguineo: string;
    alergias_criticas: number;
  };
  sala: {
    id_sala: number;
    nombre: string;
    tipo: string;
  } | null;
  especialidad: {
    id_especialidad: number;
    nombre: string;
  } | null;
}

interface BloqueHorario {
  id_bloque: number;
  id_medico: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_minutos: number;
  estado: "disponible" | "reservado" | "bloqueado" | "completado" | "no_disponible";
  tipo_atencion: "presencial" | "telemedicina" | "ambos";
  id_sala: number | null;
  cupo_maximo: number | null;
  cupo_actual: number;
  visible_web: boolean;
}

interface EstadisticasAgenda {
  total_citas: number;
  confirmadas: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
  no_asistio: number;
  en_sala_espera: number;
  tasa_asistencia: number;
  tasa_confirmacion: number;
  duracion_promedio: number;
  tiempo_promedio_espera: number;
  horas_agendadas: number;
  horas_disponibles: number;
  ocupacion: number;
  ingresos_estimados: number;
  ingresos_reales: number;
}

interface FiltrosAgenda {
  fechaInicio: string;
  fechaFin: string;
  estados: EstadoCita[];
  tipos: TipoCita[];
  prioridades: string[];
  especialidades: number[];
  salas: number[];
  paciente: string;
  confirmadas: boolean | null;
  pagadas: boolean | null;
}

interface FormularioCita {
  id_paciente: number | null;
  fecha: string;
  hora_inicio: string;
  duracion_minutos: number;
  tipo_cita: TipoCita;
  motivo: string;
  id_especialidad: number | null;
  id_sala: number | null;
  tipo_atencion: "presencial" | "telemedicina";
  prioridad: "normal" | "alta" | "urgente";
  notas: string;
  notas_privadas: string;
  monto: number | null;
  enviar_recordatorio: boolean;
  enviar_confirmacion: boolean;
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
// COLORES POR ESTADO Y TIPO
// ========================================

const COLORES_ESTADO: Record<EstadoCita, { bg: string; text: string; border: string }> = {
  programada: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  confirmada: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
  },
  en_sala_espera: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  en_atencion: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  completada: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  cancelada: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  no_asistio: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  reprogramada: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
};

const COLORES_TIPO: Record<TipoCita, string> = {
  primera_vez: "#3b82f6",
  control: "#10b981",
  procedimiento: "#8b5cf6",
  urgencia: "#ef4444",
  telemedicina: "#06b6d4",
};

// ========================================
// DATOS MOCK PARA PACIENTES Y SALAS
// ========================================

const PACIENTES_MOCK = [
  { id: 1, nombre: "Juan Pérez González", telefono: "+56912345678", email: "juan@email.com" },
  { id: 2, nombre: "María Silva Rojas", telefono: "+56987654321", email: "maria@email.com" },
  { id: 3, nombre: "Carlos Muñoz López", telefono: "+56911111111", email: "carlos@email.com" },
  { id: 4, nombre: "Ana Torres Vargas", telefono: "+56922222222", email: "ana@email.com" },
  { id: 5, nombre: "Pedro Soto Díaz", telefono: "+56933333333", email: "pedro@email.com" },
];

const SALAS_MOCK = [
  { id: 1, nombre: "Consulta 1", tipo: "Consulta General" },
  { id: 2, nombre: "Consulta 2", tipo: "Consulta General" },
  { id: 3, nombre: "Procedimientos", tipo: "Sala de Procedimientos" },
  { id: 4, nombre: "Urgencias", tipo: "Sala de Urgencias" },
];

const ESPECIALIDADES_MOCK = [
  { id: 1, nombre: "Medicina General" },
  { id: 2, nombre: "Cardiología" },
  { id: 3, nombre: "Pediatría" },
  { id: 4, nombre: "Dermatología" },
  { id: 5, nombre: "Traumatología" },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function AgendaMedicaPage() {
  // ========================================
  // ESTADOS
  // ========================================

  // Usuario y sesión
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // Datos de la agenda
  const [citas, setCitas] = useState<Cita[]>([]);
  const [bloquesHorarios, setBloquesHorarios] = useState<BloqueHorario[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAgenda | null>(null);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [vistaCalendario, setVistaCalendario] = useState<VistaCalendario>("dia");
  const [vistaModo, setVistaModo] = useState<VistaModo>("lista");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    estados: [],
    tipos: [],
    prioridades: [],
    especialidades: [],
    salas: [],
    paciente: "",
    confirmadas: null,
    pagadas: null,
  });

  // Modales
  const [modalNuevaCita, setModalNuevaCita] = useState(false);
  const [modalEditarCita, setModalEditarCita] = useState(false);
  const [modalDetallesCita, setModalDetallesCita] = useState(false);
  const [modalSelectorTema, setModalSelectorTema] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  // Formulario de nueva cita
  const [formularioCita, setFormularioCita] = useState<FormularioCita>({
    id_paciente: null,
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "09:00",
    duracion_minutos: 30,
    tipo_cita: "control",
    motivo: "",
    id_especialidad: null,
    id_sala: null,
    tipo_atencion: "presencial",
    prioridad: "normal",
    notas: "",
    notas_privadas: "",
    monto: null,
    enviar_recordatorio: true,
    enviar_confirmacion: true,
  });

  // Sidebar
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  // Búsqueda de pacientes
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState(PACIENTES_MOCK);

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosAgenda();
    }
  }, [usuario, fechaSeleccionada, vistaCalendario, filtros]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      if (usuario?.medico) {
        cargarDatosAgenda();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [usuario]);

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
          localStorage.setItem("tema_medico", data.tema_color);
        }
      } catch (e) {
        console.error("No se pudo cargar la preferencia de tema:", e);
      }
    };

    cargarPreferenciaTema();
  }, []);

  useEffect(() => {
    const resultados = PACIENTES_MOCK.filter((p) =>
      p.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase())
    );
    setPacientesFiltrados(resultados);
  }, [busquedaPaciente]);

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

        const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));

        if (!tieneRolMedico) {
          alert("Acceso denegado. Este panel es solo para médicos.");
          window.location.href = "/";
          return;
        }

        if (!result.usuario.medico) {
          alert("Tu usuario no está vinculado a un registro médico.");
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

  const cargarDatosAgenda = async () => {
    if (!usuario?.medico?.id_medico) return;

    try {
      setLoadingData(true);

      const params = new URLSearchParams({
        id_medico: usuario.medico.id_medico.toString(),
        fecha_inicio: calcularFechaInicio(),
        fecha_fin: calcularFechaFin(),
        vista: vistaCalendario,
      });

      // Agregar filtros si están activos
      if (filtros.estados.length > 0) {
        params.append("estados", filtros.estados.join(","));
      }
      if (filtros.tipos.length > 0) {
        params.append("tipos", filtros.tipos.join(","));
      }
      if (filtros.paciente) {
        params.append("paciente", filtros.paciente);
      }

      const res = await fetch(`/api/medico/agenda?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta de la agenda:", data);
        return;
      }

      setCitas(data.citas || []);
      setBloquesHorarios(data.bloques_horarios || []);
      setEstadisticas(data.estadisticas || null);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const calcularFechaInicio = (): string => {
    const fecha = new Date(fechaSeleccionada);

    switch (vistaCalendario) {
      case "dia":
        return fecha.toISOString().split("T")[0];

      case "semana":
        const diaActual = fecha.getDay();
        const primerDiaSemana = new Date(fecha);
        primerDiaSemana.setDate(fecha.getDate() - diaActual + (diaActual === 0 ? -6 : 1));
        return primerDiaSemana.toISOString().split("T")[0];

      case "mes":
        return new Date(fecha.getFullYear(), fecha.getMonth(), 1)
          .toISOString()
          .split("T")[0];

      case "agenda":
        return fecha.toISOString().split("T")[0];

      default:
        return fecha.toISOString().split("T")[0];
    }
  };

  const calcularFechaFin = (): string => {
    const fecha = new Date(fechaSeleccionada);

    switch (vistaCalendario) {
      case "dia":
        return fecha.toISOString().split("T")[0];

      case "semana":
        const diaActual = fecha.getDay();
        const ultimoDiaSemana = new Date(fecha);
        ultimoDiaSemana.setDate(
          fecha.getDate() + (diaActual === 0 ? 0 : 7 - diaActual)
        );
        return ultimoDiaSemana.toISOString().split("T")[0];

      case "mes":
        return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

      case "agenda":
        const fechaFin = new Date(fecha);
        fechaFin.setDate(fecha.getDate() + 30);
        return fechaFin.toISOString().split("T")[0];

      default:
        return fecha.toISOString().split("T")[0];
    }
  };

  const formatearFecha = (fecha: string, formato: "corto" | "largo" = "corto") => {
    const date = new Date(fecha);

    if (formato === "largo") {
      return new Intl.DateTimeFormat("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    }

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

  const navegarFecha = (direccion: "anterior" | "siguiente" | "hoy") => {
    if (direccion === "hoy") {
      setFechaSeleccionada(new Date());
      return;
    }

    const nuevaFecha = new Date(fechaSeleccionada);

    switch (vistaCalendario) {
      case "dia":
        nuevaFecha.setDate(
          nuevaFecha.getDate() + (direccion === "siguiente" ? 1 : -1)
        );
        break;

      case "semana":
        nuevaFecha.setDate(
          nuevaFecha.getDate() + (direccion === "siguiente" ? 7 : -7)
        );
        break;

      case "mes":
        nuevaFecha.setMonth(
          nuevaFecha.getMonth() + (direccion === "siguiente" ? 1 : -1)
        );
        break;

      case "agenda":
        nuevaFecha.setDate(
          nuevaFecha.getDate() + (direccion === "siguiente" ? 7 : -7)
        );
        break;
    }

    setFechaSeleccionada(nuevaFecha);
  };

  const obtenerTituloFecha = (): string => {
    const fecha = new Date(fechaSeleccionada);

    switch (vistaCalendario) {
      case "dia":
        return new Intl.DateTimeFormat("es-CL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(fecha);

      case "semana":
        const inicio = calcularFechaInicio();
        const fin = calcularFechaFin();
        return `${new Intl.DateTimeFormat("es-CL", {
          day: "numeric",
          month: "short",
        }).format(new Date(inicio))} - ${new Intl.DateTimeFormat("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(fin))}`;

      case "mes":
        return new Intl.DateTimeFormat("es-CL", {
          month: "long",
          year: "numeric",
        }).format(fecha);

      case "agenda":
        return "Vista de Agenda";

      default:
        return "";
    }
  };

  const citasFiltradas = useMemo(() => {
    let resultado = [...citas];

    // Filtro de búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (cita) =>
          cita.paciente.nombre_completo.toLowerCase().includes(termino) ||
          cita.motivo?.toLowerCase().includes(termino) ||
          cita.notas?.toLowerCase().includes(termino)
      );
    }

    // Filtros adicionales
    if (filtros.estados.length > 0) {
      resultado = resultado.filter((cita) =>
        filtros.estados.includes(cita.estado)
      );
    }

    if (filtros.tipos.length > 0) {
      resultado = resultado.filter((cita) =>
        filtros.tipos.includes(cita.tipo_cita)
      );
    }

    if (filtros.confirmadas !== null) {
      resultado = resultado.filter(
        (cita) => cita.confirmado_por_paciente === filtros.confirmadas
      );
    }

    if (filtros.pagadas !== null) {
      resultado = resultado.filter((cita) => cita.pagada === filtros.pagadas);
    }

    return resultado;
  }, [citas, busqueda, filtros]);

  const citasDelDia = useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return citasFiltradas.filter(
      (cita) => cita.fecha_hora_inicio.split("T")[0] === hoy
    );
  }, [citasFiltradas]);

  const citasPorEstado = useMemo(() => {
    return citasDelDia.reduce((acc, cita) => {
      acc[cita.estado] = (acc[cita.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [citasDelDia]);

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
      localStorage.setItem("tema_medico", nuevoTema);
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
  // FUNCIONES DE ACCIONES
  // ========================================

  const handleNuevaCita = () => {
    setFormularioCita({
      id_paciente: null,
      fecha: fechaSeleccionada.toISOString().split("T")[0],
      hora_inicio: "09:00",
      duracion_minutos: 30,
      tipo_cita: "control",
      motivo: "",
      id_especialidad: null,
      id_sala: null,
      tipo_atencion: "presencial",
      prioridad: "normal",
      notas: "",
      notas_privadas: "",
      monto: null,
      enviar_recordatorio: true,
      enviar_confirmacion: true,
    });
    setModalNuevaCita(true);
  };

  const handleEditarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setFormularioCita({
      id_paciente: cita.id_paciente,
      fecha: cita.fecha_hora_inicio.split("T")[0],
      hora_inicio: formatearHora(cita.fecha_hora_inicio),
      duracion_minutos: cita.duracion_minutos,
      tipo_cita: cita.tipo_cita,
      motivo: cita.motivo || "",
      id_especialidad: cita.id_especialidad,
      id_sala: cita.id_sala,
      tipo_atencion: cita.tipo_cita === "telemedicina" ? "telemedicina" : "presencial",
      prioridad: cita.prioridad,
      notas: cita.notas || "",
      notas_privadas: cita.notas_privadas || "",
      monto: cita.monto,
      enviar_recordatorio: false,
      enviar_confirmacion: false,
    });
    setModalEditarCita(true);
  };

  const handleVerDetalles = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setModalDetallesCita(true);
  };

  const handleGuardarCita = async () => {
  if (!formularioCita.id_paciente) {
    alert("Debe seleccionar un paciente");
    return;
  }

  try {
    // 1. armar fecha/hora inicio
    const fechaHoraInicio = `${formularioCita.fecha}T${formularioCita.hora_inicio}:00`;

    // 2. calcular fecha/hora fin
    const inicioDate = new Date(fechaHoraInicio);
    const finDate = new Date(inicioDate.getTime() + formularioCita.duracion_minutos * 60_000);
    const fechaHoraFin = finDate.toISOString();

    const endpoint =
      modalEditarCita && citaSeleccionada
        ? `/api/medico/agenda/${citaSeleccionada.id_cita}`
        : "/api/medico/agenda";

    const method = modalEditarCita ? "PUT" : "POST";

    const payload = {
      // lo que el backend suele necesitar:
      id_medico: usuario?.medico?.id_medico,
      id_centro: usuario?.medico?.centro_principal.id_centro,

      // fechas completas
      fecha_hora_inicio: fechaHoraInicio,
      fecha_hora_fin: fechaHoraFin,
      duracion_minutos: formularioCita.duracion_minutos,

      // datos de la cita
      id_paciente: formularioCita.id_paciente,
      tipo_cita: formularioCita.tipo_cita,
      motivo: formularioCita.motivo,
      id_especialidad: formularioCita.id_especialidad,
      id_sala: formularioCita.id_sala,
      prioridad: formularioCita.prioridad,
      notas: formularioCita.notas,
      notas_privadas: formularioCita.notas_privadas,
      monto: formularioCita.monto,
      // si tu API los admite:
      enviar_recordatorio: formularioCita.enviar_recordatorio,
      enviar_confirmacion: formularioCita.enviar_confirmacion,
      // forma de atención
      tipo_atencion: formularioCita.tipo_atencion,
    };

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await cargarDatosAgenda();
      setModalNuevaCita(false);
      setModalEditarCita(false);
      setCitaSeleccionada(null);
    } else {
      // intentar leer el json, pero sin romper si viene HTML
      let errorMsg = "Error al guardar la cita";
      try {
        const error = await response.json();
        if (error?.message) errorMsg = error.message;
      } catch (_) {}
      alert(errorMsg);
      console.error("Guardar cita - payload enviado:", payload);
    }
  } catch (error) {
    console.error("Error al guardar cita:", error);
    alert("Error al guardar la cita");
  }
};


  const handleConfirmarCita = async (idCita: number) => {
    try {
      const response = await fetch(`/api/medico/agenda/${idCita}/confirmar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        await cargarDatosAgenda();
      }
    } catch (error) {
      console.error("Error al confirmar cita:", error);
    }
  };

  const handleCancelarCita = async (idCita: number, motivo: string) => {
    try {
      const response = await fetch(`/api/medico/agenda/${idCita}/cancelar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ motivo }),
      });

      if (response.ok) {
        await cargarDatosAgenda();
      }
    } catch (error) {
      console.error("Error al cancelar cita:", error);
    }
  };

  const handleMarcarAsistencia = async (idCita: number, asistio: boolean) => {
    try {
      const response = await fetch(`/api/medico/agenda/${idCita}/asistencia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ asistio }),
      });

      if (response.ok) {
        await cargarDatosAgenda();
      }
    } catch (error) {
      console.error("Error al marcar asistencia:", error);
    }
  };

  const handleIniciarAtencion = async (idCita: number) => {
    try {
      const response = await fetch(`/api/medico/agenda/${idCita}/iniciar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        await cargarDatosAgenda();
        window.location.href = `/medico/consultas/nueva/${idCita}`;
      }
    } catch (error) {
      console.error("Error al iniciar atención:", error);
    }
  };

  const handleCompletarCita = async (idCita: number) => {
    try {
      const response = await fetch(`/api/medico/agenda/${idCita}/completar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        await cargarDatosAgenda();
      }
    } catch (error) {
      console.error("Error al completar cita:", error);
    }
  };

  const handleEnviarRecordatorio = async (idCita: number) => {
    try {
      const response = await fetch(`/api/medico/agenda/${idCita}/recordatorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        await cargarDatosAgenda();
      }
    } catch (error) {
      console.error("Error al enviar recordatorio:", error);
    }
  };

  const handleExportarAgenda = async (formato: "pdf" | "excel" | "csv") => {
    try {
      const params = new URLSearchParams({
        id_medico: usuario?.medico?.id_medico?.toString() || "",
        fecha_inicio: calcularFechaInicio(),
        fecha_fin: calcularFechaFin(),
        formato,
      });

      const response = await fetch(`/api/medico/agenda/exportar?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `agenda-${new Date().toISOString()}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al exportar agenda:", error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(citasFiltradas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Aquí puedes actualizar el orden en el backend si lo necesitas
    setCitas(items);
  };

  // ========================================
  // GENERADOR DE HORARIOS PARA TIMELINE
  // ========================================

  const generarHorarios = () => {
    const horarios = [];
    for (let hora = 7; hora <= 20; hora++) {
      horarios.push({
        hora: `${hora.toString().padStart(2, "0")}:00`,
        label: `${hora}:00`,
      });
    }
    return horarios;
  };

  const citasPorHora = useMemo(() => {
    const resultado: Record<string, Cita[]> = {};
    
    citasFiltradas.forEach((cita) => {
      const hora = cita.fecha_hora_inicio.split("T")[1].substring(0, 5);
      const horaRedondeada = `${hora.split(":")[0]}:00`;
      
      if (!resultado[horaRedondeada]) {
        resultado[horaRedondeada] = [];
      }
      resultado[horaRedondeada].push(cita);
    });

    return resultado;
  }, [citasFiltradas]);

  // ========================================
  // CALENDARIO MENSUAL
  // ========================================

  const generarCalendarioMensual = () => {
    const fecha = new Date(fechaSeleccionada);
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    
    const diasPrevios = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;
    const diasMes = ultimoDia.getDate();
    
    const calendario = [];
    
    // Días del mes anterior
    const mesAnterior = new Date(fecha.getFullYear(), fecha.getMonth(), 0);
    for (let i = diasPrevios; i > 0; i--) {
      calendario.push({
        dia: mesAnterior.getDate() - i + 1,
        fecha: new Date(fecha.getFullYear(), fecha.getMonth() - 1, mesAnterior.getDate() - i + 1),
        mesActual: false,
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= diasMes; i++) {
      calendario.push({
        dia: i,
        fecha: new Date(fecha.getFullYear(), fecha.getMonth(), i),
        mesActual: true,
      });
    }
    
    // Días del mes siguiente
    const diasRestantes = 42 - calendario.length;
    for (let i = 1; i <= diasRestantes; i++) {
      calendario.push({
        dia: i,
        fecha: new Date(fecha.getFullYear(), fecha.getMonth() + 1, i),
        mesActual: false,
      });
    }
    
    return calendario;
  };

  const citasPorDia = useMemo(() => {
    const resultado: Record<string, Cita[]> = {};
    
    citasFiltradas.forEach((cita) => {
      const fecha = cita.fecha_hora_inicio.split("T")[0];
      
      if (!resultado[fecha]) {
        resultado[fecha] = [];
      }
      resultado[fecha].push(cita);
    });

    return resultado;
  }, [citasFiltradas]);

  // ========================================
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}>
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Agenda
          </h2>
          <p className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}>
            Preparando tu calendario médico...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}>
          <div className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}>
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a la agenda médica
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
  // RENDER - AGENDA COMPLETA
  // ========================================

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-20" : "w-0"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        {sidebarAbierto && (
          <div className="flex flex-col h-full items-center py-6 gap-4">
            <Link
              href="/medico"
              className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110`}
            >
              <Stethoscope className="w-6 h-6 text-white" />
            </Link>

            <div className="flex-1 flex flex-col gap-2 w-full px-2">
              <Link
                href="/medico"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Home className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>

              <Link
                href="/medico/agenda"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r ${tema.colores.gradiente} shadow-lg`}
              >
                <Calendar className="w-6 h-6 text-white" />
              </Link>

              <Link
                href="/medico/pacientes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Users className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>

              <Link
                href="/medico/mensajes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <MessageSquare className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>

              <button
                onClick={() => setModalSelectorTema(true)}
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                {React.createElement(tema.icono, {
                  className: `w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`,
                })}
              </button>

              <Link
                href="/medico/configuracion"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Settings className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>
            </div>

            <button
              onClick={cerrarSesion}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-red-500/20 group`}
            >
              <LogOut className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-20" : "ml-0"
        } p-8`}
      >
        {/* HEADER CON PERFIL */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-white/10`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={64}
                      height={64}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div>
                <h1 className={`text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}>
                  Dr(a). {usuario.nombre} {usuario.apellido_paterno}
                  {usuario.medico.especialidades.find(e => e.es_principal) && (
                    <span className={`text-base font-semibold px-3 py-1 rounded-full ${tema.colores.secundario} ${tema.colores.texto}`}>
                      {usuario.medico.especialidades.find(e => e.es_principal)?.nombre}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    {usuario.medico.centro_principal.logo_url ? (
                      <Image
                        src={usuario.medico.centro_principal.logo_url}
                        alt={usuario.medico.centro_principal.nombre}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    ) : (
                      <Building2 className={`w-5 h-5 ${tema.colores.acento}`} />
                    )}
                    <span className={`text-base font-semibold ${tema.colores.textoSecundario}`}>
                      {usuario.medico.centro_principal.nombre}
                    </span>
                  </div>

                  <span className={`text-base ${tema.colores.textoSecundario}`}>•</span>

                  <span className={`text-base font-semibold ${tema.colores.textoSecundario}`}>
                    RM: {usuario.medico.numero_registro_medico}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => cargarDatosAgenda()}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
              >
                <RefreshCw className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`} />
                Actualizar
              </button>

              <button
                onClick={handleNuevaCita}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <Plus className="w-5 h-5" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CalendarCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.total_citas}
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Total Citas
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.confirmadas}
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Confirmadas
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.pendientes}
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Pendientes
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <UserCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.en_sala_espera}
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                En Espera
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.tasa_asistencia.toFixed(0)}%
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Asistencia
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.ocupacion.toFixed(0)}%
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Ocupación
              </div>
            </div>
          </div>
        )}

        {/* CONTROLES DE NAVEGACIÓN */}
        <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navegarFecha("anterior")}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="text-center min-w-[280px]">
                <h3 className={`text-2xl font-black ${tema.colores.texto} capitalize`}>
                  {obtenerTituloFecha()}
                </h3>
                <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                  {citasFiltradas.length} citas programadas
                </p>
              </div>

              <button
                onClick={() => navegarFecha("siguiente")}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => navegarFecha("hoy")}
                className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}
              >
                Hoy
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVistaCalendario("dia")}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  vistaCalendario === "dia"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Día
              </button>
              <button
                onClick={() => setVistaCalendario("semana")}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  vistaCalendario === "semana"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setVistaCalendario("mes")}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  vistaCalendario === "mes"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setVistaCalendario("agenda")}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  vistaCalendario === "agenda"
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Agenda
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVistaModo("calendario")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "calendario"
                    ? `${tema.colores.primario} text-white`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVistaModo("lista")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "lista"
                    ? `${tema.colores.primario} text-white`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVistaModo("timeline")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "timeline"
                    ? `${tema.colores.primario} text-white`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 relative`}
              >
                <Filter className="w-5 h-5" />
                {(filtros.estados.length > 0 ||
                  filtros.tipos.length > 0 ||
                  filtros.confirmadas !== null ||
                  filtros.pagadas !== null) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {filtros.estados.length +
                      filtros.tipos.length +
                      (filtros.confirmadas !== null ? 1 : 0) +
                      (filtros.pagadas !== null ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="relative group">
                <button className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}>
                  <Download className="w-5 h-5" />
                </button>

                <div className={`absolute right-0 mt-2 w-48 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1 z-50`}>
                  <button
                    onClick={() => handleExportarAgenda("pdf")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold`}
                  >
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => handleExportarAgenda("excel")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold`}
                  >
                    Exportar Excel
                  </button>
                  <button
                    onClick={() => handleExportarAgenda("csv")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold`}
                  >
                    Exportar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
              <input
                type="text"
                placeholder="Buscar por paciente, motivo, notas..."
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

          {filtrosAbiertos && (
            <div className={`mt-6 p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <h4 className={`text-lg font-black mb-4 ${tema.colores.texto}`}>
                Filtros Avanzados
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Estados
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        "programada",
                        "confirmada",
                        "en_sala_espera",
                        "en_atencion",
                        "completada",
                        "cancelada",
                      ] as EstadoCita[]
                    ).map((estado) => (
                      <label
                        key={estado}
                        className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={filtros.estados.includes(estado)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                estados: [...filtros.estados, estado],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                estados: filtros.estados.filter((e) => e !== estado),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto} capitalize`}>
                          {estado.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Tipos de Cita
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        "primera_vez",
                        "control",
                        "procedimiento",
                        "urgencia",
                        "telemedicina",
                      ] as TipoCita[]
                    ).map((tipo) => (
                      <label
                        key={tipo}
                        className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={filtros.tipos.includes(tipo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                tipos: [...filtros.tipos, tipo],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                tipos: filtros.tipos.filter((t) => t !== tipo),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto} capitalize`}>
                          {tipo.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Estado de Confirmación
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="confirmadas"
                        checked={filtros.confirmadas === true}
                        onChange={() =>
                          setFiltros({ ...filtros, confirmadas: true })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Confirmadas
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="confirmadas"
                        checked={filtros.confirmadas === false}
                        onChange={() =>
                          setFiltros({ ...filtros, confirmadas: false })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Sin Confirmar
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="confirmadas"
                        checked={filtros.confirmadas === null}
                        onChange={() =>
                          setFiltros({ ...filtros, confirmadas: null })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Todas
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Estado de Pago
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="pagadas"
                        checked={filtros.pagadas === true}
                        onChange={() => setFiltros({ ...filtros, pagadas: true })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Pagadas
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="pagadas"
                        checked={filtros.pagadas === false}
                        onChange={() =>
                          setFiltros({ ...filtros, pagadas: false })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Pendientes de Pago
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}
                    >
                      <input
                        type="radio"
                        name="pagadas"
                        checked={filtros.pagadas === null}
                        onChange={() => setFiltros({ ...filtros, pagadas: null })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Todas
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() =>
                    setFiltros({
                      fechaInicio: new Date().toISOString().split("T")[0],
                      fechaFin: new Date().toISOString().split("T")[0],
                      estados: [],
                      tipos: [],
                      prioridades: [],
                      especialidades: [],
                      salas: [],
                      paciente: "",
                      confirmadas: null,
                      pagadas: null,
                    })
                  }
                  className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                >
                  Limpiar Filtros
                </button>

                <button
                  onClick={() => setFiltrosAbiertos(false)}
                  className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO - VISTAS */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando agenda...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* VISTA DE LISTA */}
            {vistaModo === "lista" && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="citas-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {citasFiltradas.length === 0 ? (
                        <div className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}>
                          <div className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                            <Calendar className="w-12 h-12 text-white" />
                          </div>
                          <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
                            No hay citas programadas
                          </h3>
                          <p className={`text-lg ${tema.colores.textoSecundario} mb-6`}>
                            Agenda tu primera cita del día
                          </p>
                          <button
                            onClick={handleNuevaCita}
                            className={`px-8 py-4 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
                          >
                            <Plus className="w-5 h-5 inline-block mr-2" />
                            Nueva Cita
                          </button>
                        </div>
                      ) : (
                        citasFiltradas.map((cita, index) => (
                          <Draggable
                            key={cita.id_cita}
                            draggableId={cita.id_cita.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 ${
                                  snapshot.isDragging ? "scale-105 rotate-2" : "hover:scale-[1.01] hover:-translate-y-1"
                                }`}
                              >
                                <div className="flex items-start gap-6">
                                  <div className="flex flex-col items-center gap-3">
                                    <div
                                      className={`relative w-20 h-20 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
                                    >
                                      {cita.paciente.foto_url ? (
                                        <Image
                                          src={cita.paciente.foto_url}
                                          alt={cita.paciente.nombre_completo}
                                          width={80}
                                          height={80}
                                          className="rounded-xl object-cover"
                                        />
                                      ) : (
                                        cita.paciente.nombre_completo
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .substring(0, 2)
                                      )}
                                      {cita.tipo_cita === "telemedicina" && (
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                          <Video className="w-4 h-4 text-white" />
                                        </div>
                                      )}
                                      {cita.prioridad === "urgente" && (
                                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                          <AlertTriangle className="w-4 h-4 text-white" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-center">
                                      <div className={`text-2xl font-black ${tema.colores.texto}`}>
                                        {formatearHora(cita.fecha_hora_inicio)}
                                      </div>
                                      <div className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                                        {cita.duracion_minutos} min
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h3 className={`text-2xl font-black ${tema.colores.texto} mb-1`}>
                                          {cita.paciente.nombre_completo}
                                        </h3>
                                        <p className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2 flex-wrap`}>
                                          <span>
                                            {cita.paciente.edad} años · {cita.paciente.genero}
                                          </span>
                                          <span>·</span>
                                          <span>{cita.paciente.grupo_sanguineo}</span>
                                          {cita.paciente.alergias_criticas > 0 && (
                                            <>
                                              <span>·</span>
                                              <span className="flex items-center gap-1 text-red-400 font-bold">
                                                <AlertTriangle className="w-3 h-3" />
                                                {cita.paciente.alergias_criticas} alergias
                                              </span>
                                            </>
                                          )}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            COLORES_ESTADO[cita.estado].bg
                                          } ${COLORES_ESTADO[cita.estado].text} ${
                                            COLORES_ESTADO[cita.estado].border
                                          }`}
                                        >
                                          {cita.estado.replace("_", " ")}
                                        </span>

                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-bold`}
                                          style={{
                                            backgroundColor: `${COLORES_TIPO[cita.tipo_cita]}20`,
                                            color: COLORES_TIPO[cita.tipo_cita],
                                          }}
                                        >
                                          {cita.tipo_cita.replace("_", " ")}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                      {cita.motivo && (
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                          <FileText className={`w-4 h-4 ${tema.colores.acento}`} />
                                          <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>
                                            {cita.motivo}
                                          </span>
                                        </div>
                                      )}

                                      {cita.sala && (
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                          <MapPin className={`w-4 h-4 ${tema.colores.acento}`} />
                                          <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>
                                            {cita.sala.nombre}
                                          </span>
                                        </div>
                                      )}

                                      {cita.especialidad && (
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                          <Stethoscope className={`w-4 h-4 ${tema.colores.acento}`} />
                                          <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>
                                            {cita.especialidad.nombre}
                                          </span>
                                        </div>
                                      )}

                                      {cita.paciente.telefono && (
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                          <Phone className={`w-4 h-4 ${tema.colores.acento}`} />
                                          <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>
                                            {cita.paciente.telefono}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap mb-4">
                                      {cita.confirmado_por_paciente ? (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Confirmada
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                                          <Clock className="w-3 h-3" />
                                          Sin Confirmar
                                        </span>
                                      )}

                                      {cita.pagada ? (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Pagada
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                                          <AlertCircle className="w-3 h-3" />
                                          Pago Pendiente
                                        </span>
                                      )}

                                      {cita.recordatorio_enviado && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                                          <Bell className="w-3 h-3" />
                                          Recordatorio Enviado
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                      {cita.estado === "programada" && !cita.confirmado_por_paciente && (
                                        <button
                                          onClick={() => handleConfirmarCita(cita.id_cita)}
                                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                          Confirmar
                                        </button>
                                      )}

                                      {["programada", "confirmada"].includes(cita.estado) && (
                                        <button
                                          onClick={() => handleMarcarAsistencia(cita.id_cita, true)}
                                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                        >
                                          <UserCheck className="w-4 h-4" />
                                          En Sala Espera
                                        </button>
                                      )}

                                      {cita.estado === "en_sala_espera" && (
                                        <button
                                          onClick={() => handleIniciarAtencion(cita.id_cita)}
                                          className={`px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                                        >
                                          <Activity className="w-4 h-4" />
                                          Iniciar Atención
                                        </button>
                                      )}

                                      {cita.estado === "en_atencion" && (
                                        <button
                                          onClick={() => handleCompletarCita(cita.id_cita)}
                                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                          Completar
                                        </button>
                                      )}

                                      <Link
                                        href={`/medico/pacientes/${cita.id_paciente}`}
                                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                                      >
                                        <FileText className="w-4 h-4" />
                                        Ver Ficha
                                      </Link>

                                      {!cita.recordatorio_enviado && (
                                        <button
                                          onClick={() => handleEnviarRecordatorio(cita.id_cita)}
                                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                                        >
                                          <Send className="w-4 h-4" />
                                          Recordatorio
                                        </button>
                                      )}

                                      <button
                                        onClick={() => handleEditarCita(cita)}
                                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                                      >
                                        <Edit className="w-4 h-4" />
                                        Editar
                                      </button>

                                      <button
                                        onClick={() => handleVerDetalles(cita)}
                                        className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${tema.colores.secundario} ${tema.colores.texto}`}
                                      >
                                        <MoreVertical className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* VISTA DE CALENDARIO */}
            {vistaModo === "calendario" && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}>
                {vistaCalendario === "mes" && (
                  <>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dia) => (
                        <div
                          key={dia}
                          className={`text-center py-3 font-black text-sm ${tema.colores.texto}`}
                        >
                          {dia}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {generarCalendarioMensual().map((dia, index) => {
                        const fechaStr = dia.fecha.toISOString().split("T")[0];
                        const citasDelDia = citasPorDia[fechaStr] || [];
                        const esHoy =
                          fechaStr === new Date().toISOString().split("T")[0];

                        return (
                          <div
                            key={index}
                            className={`min-h-[120px] p-3 rounded-xl ${
                              dia.mesActual
                                ? `${tema.colores.card} ${tema.colores.borde} border`
                                : `${tema.colores.secundario} opacity-50`
                            } ${esHoy ? "ring-2 ring-indigo-500" : ""} transition-all duration-300 hover:scale-105 cursor-pointer`}
                            onClick={() => {
                              setFechaSeleccionada(dia.fecha);
                              setVistaCalendario("dia");
                            }}
                          >
                            <div
                              className={`text-right mb-2 font-bold ${
                                esHoy ? "text-indigo-500" : tema.colores.texto
                              }`}
                            >
                              {dia.dia}
                            </div>

                            <div className="space-y-1">
                              {citasDelDia.slice(0, 3).map((cita) => (
                                <div
                                  key={cita.id_cita}
                                  className={`px-2 py-1 rounded-lg text-xs font-bold truncate ${
                                    COLORES_ESTADO[cita.estado].bg
                                  } ${COLORES_ESTADO[cita.estado].text}`}
                                  title={`${formatearHora(cita.fecha_hora_inicio)} - ${cita.paciente.nombre_completo}`}
                                >
                                  {formatearHora(cita.fecha_hora_inicio).substring(0, 5)}{" "}
                                  {cita.paciente.nombre_completo.split(" ")[0]}
                                </div>
                              ))}

                              {citasDelDia.length > 3 && (
                                <div className={`text-xs font-bold text-center ${tema.colores.acento}`}>
                                  +{citasDelDia.length - 3} más
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {vistaCalendario === "semana" && (
                  <div className={`text-center py-20 ${tema.colores.texto}`}>
                    <Calendar className={`w-24 h-24 mx-auto mb-4 ${tema.colores.acento} animate-pulse`} />
                    <h3 className="text-2xl font-black mb-2">Vista Semanal</h3>
                    <p className={tema.colores.textoSecundario}>
                      En desarrollo - Usa la vista de día o mes
                    </p>
                  </div>
                )}

                {vistaCalendario === "dia" && (
                  <div className="space-y-4">
                    <h3 className={`text-2xl font-black mb-6 ${tema.colores.texto}`}>
                      Citas del {formatearFecha(fechaSeleccionada.toISOString(), "largo")}
                    </h3>

                    {citasFiltradas.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className={`w-16 h-16 mx-auto mb-4 ${tema.colores.acento} opacity-50`} />
                        <p className={`text-lg ${tema.colores.textoSecundario}`}>
                          No hay citas programadas para este día
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {citasFiltradas.map((cita) => (
                          <div
                            key={cita.id_cita}
                            className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 cursor-pointer`}
                            onClick={() => handleVerDetalles(cita)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`text-xl font-black ${tema.colores.texto}`}>
                                {formatearHora(cita.fecha_hora_inicio)}
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  COLORES_ESTADO[cita.estado].bg
                                } ${COLORES_ESTADO[cita.estado].text}`}
                              >
                                {cita.estado.replace("_", " ")}
                              </span>
                            </div>

                            <h4 className={`font-bold mb-2 ${tema.colores.texto}`}>
                              {cita.paciente.nombre_completo}
                            </h4>

                            <p className={`text-sm ${tema.colores.textoSecundario} mb-3`}>
                              {cita.motivo || "Sin motivo especificado"}
                            </p>

                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${tema.colores.acento}`} />
                              <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                                {cita.duracion_minutos} minutos
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VISTA DE TIMELINE */}
            {vistaModo === "timeline" && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}>
                <h3 className={`text-2xl font-black mb-6 ${tema.colores.texto}`}>
                  Timeline del Día
                </h3>

                <div className="space-y-4">
                  {generarHorarios().map((horario) => {
                    const citasHora = citasPorHora[horario.hora] || [];

                    return (
                      <div key={horario.hora} className="flex gap-4">
                        <div className={`w-24 flex-shrink-0 text-right pt-2 font-black text-lg ${tema.colores.texto}`}>
                          {horario.label}
                        </div>

                        <div className={`flex-1 min-h-[60px] rounded-xl ${tema.colores.secundario} p-4 relative`}>
                          {citasHora.length === 0 ? (
                            <div className={`text-sm ${tema.colores.textoSecundario} italic`}>
                              Disponible
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {citasHora.map((cita) => (
                                <div
                                  key={cita.id_cita}
                                  className={`p-3 rounded-lg ${COLORES_ESTADO[cita.estado].bg} ${COLORES_ESTADO[cita.estado].border} border cursor-pointer transition-all duration-300 hover:scale-105`}
                                  onClick={() => handleVerDetalles(cita)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className={`font-black text-sm ${COLORES_ESTADO[cita.estado].text}`}>
                                      {formatearHora(cita.fecha_hora_inicio)}
                                    </div>
                                    {cita.tipo_cita === "telemedicina" && (
                                      <Video className="w-4 h-4 text-blue-400" />
                                    )}
                                    {cita.prioridad === "urgente" && (
                                      <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                                    )}
                                  </div>

                                  <h4 className={`font-bold text-sm mb-1 ${tema.colores.texto}`}>
                                    {cita.paciente.nombre_completo}
                                  </h4>

                                  <p className={`text-xs ${tema.colores.textoSecundario} truncate`}>
                                    {cita.motivo || cita.tipo_cita.replace("_", " ")}
                                  </p>

                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className={`w-3 h-3 ${tema.colores.acento}`} />
                                    <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                                      {cita.duracion_minutos} min
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${tema.colores.primario.replace("hover:", "").replace("bg-", "bg-")}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL SELECTOR DE TEMAS */}
      {modalSelectorTema && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`max-w-4xl w-full rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden animate-slideIn`}
          >
            <div className={`p-8 border-b ${tema.colores.borde}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-black ${tema.colores.texto} mb-2`}>
                    Personaliza tu Tema
                  </h2>
                  <p className={`text-lg ${tema.colores.textoSecundario}`}>
                    Elige el tema que mejor se adapte a tu estilo
                  </p>
                </div>

                <button
                  onClick={() => setModalSelectorTema(false)}
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(TEMAS).map(([key, temaConfig]) => {
                  const IconoTema = temaConfig.icono;
                  const esTemaActual = key === temaActual;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        cambiarTema(key as TemaColor);
                        setModalSelectorTema(false);
                      }}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                        esTemaActual
                          ? `border-indigo-500 ring-4 ring-indigo-500/30 ${temaConfig.colores.card}`
                          : `${temaConfig.colores.card} ${temaConfig.colores.borde}`
                      }`}
                    >
                      {esTemaActual && (
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}

                      <div
                        className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${temaConfig.colores.gradiente} flex items-center justify-center shadow-xl`}
                      >
                        <IconoTema className="w-10 h-10 text-white" />
                      </div>

                      <h3
                        className={`text-xl font-black mb-2 ${
                          key === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {temaConfig.nombre}
                      </h3>

                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div
                          className="w-8 h-8 rounded-full shadow-lg"
                          style={{
                            background: `linear-gradient(to bottom right, ${temaConfig.colores.gradiente.split(" ")[0].replace("from-", "var(--color-")}, ${temaConfig.colores.gradiente.split(" ")[2].replace("to-", "var(--color-")})`,
                          }}
                        ></div>
                      </div>

                      <p
                        className={`text-sm ${
                          key === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {key === "light" && "Perfecto para trabajar durante el día"}
                        {key === "dark" && "Ideal para sesiones nocturnas"}
                        {key === "blue" && "Fresco y profesional"}
                        {key === "purple" && "Elegante y moderno"}
                        {key === "green" && "Relajante y medicinal"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className={`mt-8 p-6 rounded-2xl ${tema.colores.secundario}`}>
                <div className="flex items-start gap-4">
                  <Info className={`w-6 h-6 ${tema.colores.acento} flex-shrink-0`} />
                  <div>
                    <h4 className={`font-bold mb-2 ${tema.colores.texto}`}>
                      Consejo Pro
                    </h4>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Tu preferencia de tema se guardará automáticamente y se aplicará en
                      todas tus sesiones futuras. Puedes cambiarla en cualquier momento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA/EDITAR CITA */}
      {(modalNuevaCita || modalEditarCita) && (
  <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
    <div
      className={`max-w-4xl w-full rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideIn max-h-[90vh] overflow-y-auto`}
          >
            <div className={`p-8 border-b ${tema.colores.borde}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-black ${tema.colores.texto} mb-2`}>
                    {modalEditarCita ? "Editar Cita" : "Nueva Cita"}
                  </h2>
                  <p className={`text-lg ${tema.colores.textoSecundario}`}>
                    {modalEditarCita
                      ? "Modifica los detalles de la cita"
                      : "Programa una nueva cita para tu paciente"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setModalNuevaCita(false);
                    setModalEditarCita(false);
                    setCitaSeleccionada(null);
                  }}
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Selector de Paciente */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Paciente *
                </label>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={busquedaPaciente}
                    onChange={(e) => setBusquedaPaciente(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  />
                </div>

                {busquedaPaciente && (
                  <div className={`mt-2 max-h-60 overflow-y-auto rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
                    {pacientesFiltrados.map((paciente) => (
                      <button
                        key={paciente.id}
                        onClick={() => {
                          setFormularioCita({ ...formularioCita, id_paciente: paciente.id });
                          setBusquedaPaciente(paciente.nombre);
                        }}
                        className={`w-full text-left px-4 py-3 ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 first:rounded-t-xl last:rounded-b-xl`}
                      >
                        <div className="font-bold">{paciente.nombre}</div>
                        <div className={`text-sm ${tema.colores.textoSecundario}`}>
                          {paciente.telefono} • {paciente.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formularioCita.fecha}
                    onChange={(e) =>
                      setFormularioCita({ ...formularioCita, fecha: e.target.value })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  />
                </div>

                {/* Hora */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    value={formularioCita.hora_inicio}
                    onChange={(e) =>
                      setFormularioCita({ ...formularioCita, hora_inicio: e.target.value })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duración */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Duración (minutos) *
                  </label>
                  <select
                    value={formularioCita.duracion_minutos}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        duracion_minutos: parseInt(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>

                {/* Tipo de Cita */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Tipo de Cita *
                  </label>
                  <select
                    value={formularioCita.tipo_cita}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        tipo_cita: e.target.value as TipoCita,
                      })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  >
                    <option value="primera_vez">Primera Vez</option>
                    <option value="control">Control</option>
                    <option value="procedimiento">Procedimiento</option>
                    <option value="urgencia">Urgencia</option>
                    <option value="telemedicina">Telemedicina</option>
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Prioridad *
                  </label>
                  <select
                    value={formularioCita.prioridad}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        prioridad: e.target.value as "normal" | "alta" | "urgente",
                      })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Especialidad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Especialidad
                  </label>
                  <select
                    value={formularioCita.id_especialidad || ""}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        id_especialidad: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  >
                    <option value="">Seleccionar especialidad...</option>
                    {ESPECIALIDADES_MOCK.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sala */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Sala
                  </label>
                  <select
                    value={formularioCita.id_sala || ""}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        id_sala: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  >
                    <option value="">Seleccionar sala...</option>
                    {SALAS_MOCK.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        {sala.nombre} - {sala.tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Motivo de Consulta *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dolor abdominal, Control de presión, etc."
                  value={formularioCita.motivo}
                  onChange={(e) =>
                    setFormularioCita({ ...formularioCita, motivo: e.target.value })
                  }
                  className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                />
              </div>

              {/* Notas */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Notas
                </label>
                <textarea
                  rows={3}
                  placeholder="Notas adicionales sobre la cita..."
                  value={formularioCita.notas}
                  onChange={(e) =>
                    setFormularioCita({ ...formularioCita, notas: e.target.value })
                  }
                  className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 resize-none`}
                />
              </div>

              {/* Notas Privadas */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Notas Privadas (Solo Médico)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas privadas que solo tú puedes ver..."
                  value={formularioCita.notas_privadas}
                  onChange={(e) =>
                    setFormularioCita({
                      ...formularioCita,
                      notas_privadas: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 resize-none`}
                />
              </div>

              {/* Monto */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Monto a Cobrar (CLP)
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                  <input
                    type="number"
                    placeholder="0"
                    value={formularioCita.monto || ""}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        monto: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className={`w-full pl-12 pr-4 py-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                  />
                </div>
              </div>

              {/* Opciones de Notificaciones */}
              <div className={`p-6 rounded-xl ${tema.colores.secundario} space-y-4`}>
                <h4 className={`font-bold ${tema.colores.texto} mb-3`}>
                  Notificaciones
                </h4>

                <label className={`flex items-center gap-3 cursor-pointer ${tema.colores.hover} p-3 rounded-lg`}>
                  <input
                    type="checkbox"
                    checked={formularioCita.enviar_recordatorio}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        enviar_recordatorio: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className={`font-semibold ${tema.colores.texto}`}>
                      Enviar recordatorio al paciente
                    </div>
                    <div className={`text-sm ${tema.colores.textoSecundario}`}>
                      Se enviará 24 horas antes de la cita
                    </div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 cursor-pointer ${tema.colores.hover} p-3 rounded-lg`}>
                  <input
                    type="checkbox"
                    checked={formularioCita.enviar_confirmacion}
                    onChange={(e) =>
                      setFormularioCita({
                        ...formularioCita,
                        enviar_confirmacion: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className={`font-semibold ${tema.colores.texto}`}>
                      Solicitar confirmación de asistencia
                    </div>
                    <div className={`text-sm ${tema.colores.textoSecundario}`}>
                      El paciente podrá confirmar su asistencia
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className={`p-8 border-t ${tema.colores.borde}`}>
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => {
                    setModalNuevaCita(false);
                    setModalEditarCita(false);
                    setCitaSeleccionada(null);
                  }}
                  className={`px-8 py-4 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                >
                  Cancelar
                </button>

                <button
                  onClick={handleGuardarCita}
                  className={`px-8 py-4 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra} flex items-center gap-2`}
                >
                  <Save className="w-5 h-5" />
                  {modalEditarCita ? "Guardar Cambios" : "Crear Cita"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DE CITA */}
     {modalDetallesCita && citaSeleccionada && (
  <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
    <div
      className={`max-w-4xl w-full rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideIn max-h-[90vh] overflow-y-auto`}
          >
            <div className={`p-8 border-b ${tema.colores.borde}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-black ${tema.colores.texto} mb-2`}>
                    Detalles de la Cita
                  </h2>
                  <p className={`text-lg ${tema.colores.textoSecundario}`}>
                    Información completa de la cita programada
                  </p>
                </div>

                <button
                  onClick={() => {
                    setModalDetallesCita(false);
                    setCitaSeleccionada(null);
                  }}
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Información del Paciente */}
              <div className={`p-6 rounded-2xl ${tema.colores.secundario}`}>
                <h3 className={`text-xl font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}>
                  <User className="w-6 h-6" />
                  Información del Paciente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Nombre Completo
                    </div>
                    <div className={`text-lg font-bold ${tema.colores.texto}`}>
                      {citaSeleccionada.paciente.nombre_completo}
                    </div>
                  </div>

                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Edad y Género
                    </div>
                    <div className={`text-lg font-bold ${tema.colores.texto}`}>
                      {citaSeleccionada.paciente.edad} años • {citaSeleccionada.paciente.genero}
                    </div>
                  </div>

                  {citaSeleccionada.paciente.telefono && (
                    <div>
                      <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                        Teléfono
                      </div>
                      <div className={`text-lg font-bold ${tema.colores.texto} flex items-center gap-2`}>
                        <Phone className="w-5 h-5" />
                        {citaSeleccionada.paciente.telefono}
                      </div>
                    </div>
                  )}

                  {citaSeleccionada.paciente.email && (
                    <div>
                      <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                        Email
                      </div>
                      <div className={`text-lg font-bold ${tema.colores.texto} flex items-center gap-2`}>
                        <Mail className="w-5 h-5" />
                        {citaSeleccionada.paciente.email}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Grupo Sanguíneo
                    </div>
                    <div className={`text-lg font-bold ${tema.colores.texto}`}>
                      {citaSeleccionada.paciente.grupo_sanguineo}
                    </div>
                  </div>

                  {citaSeleccionada.paciente.alergias_criticas > 0 && (
                    <div>
                      <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                        Alergias Críticas
                      </div>
                      <div className={`text-lg font-bold text-red-400 flex items-center gap-2`}>
                        <AlertTriangle className="w-5 h-5" />
                        {citaSeleccionada.paciente.alergias_criticas} alergia(s)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Cita */}
              <div className={`p-6 rounded-2xl ${tema.colores.secundario}`}>
                <h3 className={`text-xl font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}>
                  <Calendar className="w-6 h-6" />
                  Información de la Cita
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Fecha y Hora
                    </div>
                    <div className={`text-lg font-bold ${tema.colores.texto}`}>
                      {formatearFecha(citaSeleccionada.fecha_hora_inicio, "largo")}
                      <br />
                      {formatearHora(citaSeleccionada.fecha_hora_inicio)} -{" "}
                      {formatearHora(citaSeleccionada.fecha_hora_fin)}
                    </div>
                  </div>

                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Duración
                    </div>
                    <div className={`text-lg font-bold ${tema.colores.texto} flex items-center gap-2`}>
                      <Clock className="w-5 h-5" />
                      {citaSeleccionada.duracion_minutos} minutos
                    </div>
                  </div>

                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Estado
                    </div>
                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${
                        COLORES_ESTADO[citaSeleccionada.estado].bg
                      } ${COLORES_ESTADO[citaSeleccionada.estado].text} ${
                        COLORES_ESTADO[citaSeleccionada.estado].border
                      }`}
                    >
                      {citaSeleccionada.estado.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Tipo de Cita
                    </div>
                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-sm font-bold`}
                      style={{
                        backgroundColor: `${COLORES_TIPO[citaSeleccionada.tipo_cita]}20`,
                        color: COLORES_TIPO[citaSeleccionada.tipo_cita],
                      }}
                    >
                      {citaSeleccionada.tipo_cita.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                      Prioridad
                    </div>
                    <span
                      className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                        citaSeleccionada.prioridad === "urgente"
                          ? "bg-red-500/20 text-red-400"
                          : citaSeleccionada.prioridad === "alta"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {citaSeleccionada.prioridad}
                    </span>
                  </div>

                  {citaSeleccionada.especialidad && (
                    <div>
                      <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                        Especialidad
                      </div>
                      <div className={`text-lg font-bold ${tema.colores.texto} flex items-center gap-2`}>
                        <Stethoscope className="w-5 h-5" />
                        {citaSeleccionada.especialidad.nombre}
                      </div>
                    </div>
                  )}

                  {citaSeleccionada.sala && (
                    <div>
                      <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                        Sala
                      </div>
                      <div className={`text-lg font-bold ${tema.colores.texto} flex items-center gap-2`}>
                        <MapPin className="w-5 h-5" />
                        {citaSeleccionada.sala.nombre}
                      </div>
                    </div>
                  )}

                  {citaSeleccionada.monto && (
                    <div>
                      <div className={`text-sm font-bold mb-1 ${tema.colores.textoSecundario}`}>
                        Monto
                      </div>
                      <div className={`text-lg font-bold ${tema.colores.texto} flex items-center gap-2`}>
                        <DollarSign className="w-5 h-5" />
                        ${citaSeleccionada.monto.toLocaleString("es-CL")}
                      </div>
                    </div>
                  )}
                </div>

                {citaSeleccionada.motivo && (
                  <div className="mt-4">
                    <div className={`text-sm font-bold mb-2 ${tema.colores.textoSecundario}`}>
                      Motivo de Consulta
                    </div>
                    <div className={`text-base ${tema.colores.texto} p-4 rounded-xl ${tema.colores.hover}`}>
                      {citaSeleccionada.motivo}
                    </div>
                  </div>
                )}

                {citaSeleccionada.notas && (
                  <div className="mt-4">
                    <div className={`text-sm font-bold mb-2 ${tema.colores.textoSecundario}`}>
                      Notas
                    </div>
                    <div className={`text-base ${tema.colores.texto} p-4 rounded-xl ${tema.colores.hover}`}>
                      {citaSeleccionada.notas}
                    </div>
                  </div>
                )}
              </div>

              {/* Estados de Confirmación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-6 rounded-2xl text-center ${
                    citaSeleccionada.confirmado_por_paciente
                      ? "bg-green-500/20 border-2 border-green-500/30"
                      : "bg-yellow-500/20 border-2 border-yellow-500/30"
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    {citaSeleccionada.confirmado_por_paciente ? (
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    ) : (
                      <Clock className="w-12 h-12 text-yellow-400" />
                    )}
                  </div>
                  <div className={`font-bold ${tema.colores.texto}`}>
                    {citaSeleccionada.confirmado_por_paciente
                      ? "Confirmada"
                      : "Sin Confirmar"}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl text-center ${
                    citaSeleccionada.pagada
                      ? "bg-green-500/20 border-2 border-green-500/30"
                      : "bg-orange-500/20 border-2 border-orange-500/30"
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    {citaSeleccionada.pagada ? (
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    ) : (
                      <CreditCard className="w-12 h-12 text-orange-400" />
                    )}
                  </div>
                  <div className={`font-bold ${tema.colores.texto}`}>
                    {citaSeleccionada.pagada ? "Pagada" : "Pago Pendiente"}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl text-center ${
                    citaSeleccionada.recordatorio_enviado
                      ? "bg-blue-500/20 border-2 border-blue-500/30"
                      : "bg-gray-500/20 border-2 border-gray-500/30"
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    {citaSeleccionada.recordatorio_enviado ? (
                      <Bell className="w-12 h-12 text-blue-400" />
                    ) : (
                      <BellOff className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className={`font-bold ${tema.colores.texto}`}>
                    {citaSeleccionada.recordatorio_enviado
                      ? "Recordatorio Enviado"
                      : "Sin Recordatorio"}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-8 border-t ${tema.colores.borde}`}>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => handleEditarCita(citaSeleccionada)}
                  className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                >
                  <Edit className="w-5 h-5" />
                  Editar
                </button>

                <div className="flex items-center gap-3">
                  {!citaSeleccionada.recordatorio_enviado && (
                    <button
                      onClick={() => handleEnviarRecordatorio(citaSeleccionada.id_cita)}
                      className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      <Send className="w-5 h-5" />
                      Enviar Recordatorio
                    </button>
                  )}

                  {["programada", "confirmada", "en_sala_espera", "en_atencion"].includes(
                    citaSeleccionada.estado
                  ) && (
                    <button
                      onClick={() => {
                        const motivo = prompt("Ingresa el motivo de la cancelación:");
                        if (motivo) {
                          handleCancelarCita(citaSeleccionada.id_cita, motivo);
                          setModalDetallesCita(false);
                        }
                      }}
                      className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      <XCircle className="w-5 h-5" />
                      Cancelar Cita
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setModalDetallesCita(false);
                      setCitaSeleccionada(null);
                    }}
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS PERSONALIZADOS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce 2s infinite;
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
          animation: shimmer 2s linear infinite;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        /* Transiciones suaves globales */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity,
            box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Mejoras de rendimiento */
        .will-change-transform {
          will-change: transform;
        }

        .will-change-opacity {
          will-change: opacity;
        }

        /* Efectos de hover mejorados */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Gradientes animados */
        .gradient-animation {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
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

        /* Efectos de glassmorphism */
        .glass-effect {
          backdrop-filter: blur(10px) saturate(150%);
          -webkit-backdrop-filter: blur(10px) saturate(150%);
        }

        /* Estilos de impresión */
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Ocultar elementos no necesarios en impresión */
          aside,
          button,
          .no-print {
            display: none !important;
          }
        }

        /* Estilos para drag and drop */
        .dragging {
          opacity: 0.5;
          transform: rotate(5deg);
        }

        .drag-over {
          background: rgba(99, 102, 241, 0.1);
          border: 2px dashed rgba(99, 102, 241, 0.5);
        }

        /* Mejoras de accesibilidad */
        .focus-visible:focus {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
        }

        /* Animaciones de entrada para modales */
        .modal-backdrop {
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efectos de ripple en botones */
        .ripple {
          position: relative;
          overflow: hidden;
        }

        .ripple::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .ripple:active::after {
          width: 300px;
          height: 300px;
        }

        /* Skeleton loaders */
        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        /* Efectos de texto */
        .text-gradient {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Efectos de sombra personalizados */
        .shadow-glow {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }

        .shadow-glow-hover:hover {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
        }

        /* Animaciones de carga */
        .loading-dots span {
          animation: loading-dots 1.4s infinite;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes loading-dots {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          40% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        /* Efectos de border */
        .border-gradient {
          border: 2px solid transparent;
          background-clip: padding-box;
          position: relative;
        }

        .border-gradient::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: -1;
          margin: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Efectos de card hover */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Efectos de progreso */
        .progress-bar {
          position: relative;
          overflow: hidden;
        }

        .progress-bar::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: progress-shimmer 2s infinite;
        }

        @keyframes progress-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Efectos de badge */
        .badge-pulse {
          animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes badge-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Efectos de tooltip */
        .tooltip {
          position: relative;
        }

        .tooltip::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 8px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s, transform 0.3s;
        }

        .tooltip:hover::before {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }

        /* Mejoras responsivas */
        @media (max-width: 768px) {
          .hide-mobile {
            display: none;
          }

          .mobile-full-width {
            width: 100% !important;
          }

          .mobile-stack {
            flex-direction: column;
          }
        }

        /* Efectos de entrada de lista */
        .list-enter {
          animation: listEnter 0.3s ease-out forwards;
        }

        @keyframes listEnter {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .list-enter:nth-child(1) {
          animation-delay: 0s;
        }
        .list-enter:nth-child(2) {
          animation-delay: 0.05s;
        }
        .list-enter:nth-child(3) {
          animation-delay: 0.1s;
        }
        .list-enter:nth-child(4) {
          animation-delay: 0.15s;
        }
        .list-enter:nth-child(5) {
          animation-delay: 0.2s;
        }

        /* Efectos de notificación */
        .notification-slide-in {
          animation: notificationSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes notificationSlideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Efectos de calendario */
        .calendar-day-hover {
          transition: all 0.2s ease;
        }

        .calendar-day-hover:hover {
          background: rgba(99, 102, 241, 0.1);
          transform: scale(1.05);
          z-index: 10;
        }

        /* Efectos de timeline */
        .timeline-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #667eea, #764ba2);
          animation: timeline-pulse 2s ease-in-out infinite;
        }

        @keyframes timeline-pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        /* Optimizaciones de rendimiento */
        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Efectos de scroll suave */
        html {
          scroll-behavior: smooth;
        }

        /* Efectos de input focus */
        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Efectos de checkbox y radio personalizados */
        input[type="checkbox"],
        input[type="radio"] {
          cursor: pointer;
          transition: all 0.2s;
        }

        input[type="checkbox"]:checked,
        input[type="radio"]:checked {
          transform: scale(1.1);
        }

        /* Efectos de select personalizado */
        select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        /* Efectos de overlay */
        .overlay-enter {
          animation: overlayEnter 0.3s ease-out;
        }

        @keyframes overlayEnter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Efectos de zoom */
        .zoom-hover {
          transition: transform 0.3s ease;
        }

        .zoom-hover:hover {
          transform: scale(1.05);
        }

        /* Efectos de rotate */
        .rotate-hover {
          transition: transform 0.3s ease;
        }

        .rotate-hover:hover {
          transform: rotate(5deg);
        }

        /* Efectos de blur */
        .blur-hover {
          transition: filter 0.3s ease;
        }

        .blur-hover:hover {
          filter: blur(0px) brightness(1.1);
        }

        /* Efectos de saturate */
        .saturate-hover {
          transition: filter 0.3s ease;
        }

        .saturate-hover:hover {
          filter: saturate(1.3);
        }

        /* Efectos de neon */
        .neon-glow {
          text-shadow: 0 0 10px rgba(99, 102, 241, 0.8), 0 0 20px rgba(99, 102, 241, 0.6),
            0 0 30px rgba(99, 102, 241, 0.4);
        }

        /* Efectos de particle */
        @keyframes particle-float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Efectos de wave */
        .wave {
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Efectos de heartbeat */
        .heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%,
          100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.1);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.1);
          }
          60% {
            transform: scale(1);
          }
        }

        /* Mejoras de performance en móvil */
        @media (max-width: 768px) {
          * {
            -webkit-tap-highlight-color: transparent;
          }

          input,
          textarea,
          select {
            font-size: 16px; /* Evita zoom en iOS */
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          :root {
            color-scheme: dark;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .card,
          .button {
            border: 2px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
}