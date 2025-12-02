"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import MedicoLayout from "../layout/MedicoLayout";
import MedicoContext from "../layout/MedicoContext"; 

import {
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Eye,
  Edit,
  MoreVertical,
  RefreshCw,
  Download,
  Share2,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Bell,
  Sparkles,
  Star,
  FileText,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Grid,
  List,
  Play,
  Pause,
  SkipForward,
  UserCircle,
  Building2,
  Stethoscope,
  Heart,
  TrendingDown,
  Award,
  Briefcase,
  Shield,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Info,
  Settings,
  Send,
  MessageSquare,
  Printer,
  Copy,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Map,
  Layers,
  CircleDot,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Move,
  RotateCcw,
  Save,
  Upload,
  Trash2,
  Archive,
  Lock,
  Unlock,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Bluetooth,
  Cast,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  FilePlus,
  FileCheck,
  FileX,
  Folder,
  FolderOpen,
  Home,
  Package,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Tag,
  Bookmark,
  Flag,
  HelpCircle,
  Lightbulb,
  Thermometer,
  Droplet,
  Wind,
  Cloud,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sunrise,
  Sunset,
  Navigation2,
  Anchor,
  Aperture,
  Disc,
  Radio,
  Tv,
  Film,
  Music,
  Image as ImageIcon,
  Paperclip,
  Link2,
  Code,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Database,
  Server,
  HardDrive,
  Cpu,
  Power,
  Zap as Lightning,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS EXTENDIDOS
// ========================================

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;

  // 👇 agrega esto porque el backend ya lo manda
  id_centro_principal?: number | null;
  id_sucursal_principal?: number | null;

  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_profesional: number;
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
      // 👇 pon todos los que devuelve el back
      plan: "basico" | "profesional" | "premium" | "empresarial";
      logo_url: string | null;
      ciudad: string;
      region: string;
      direccion: string;
      telefono: string;
      email: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
}


interface Paciente {
  id_paciente: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  rut: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: "M" | "F" | "Otro";
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  foto_url: string | null;
  grupo_sanguineo: string | null;
  alergias: string | null;
  enfermedades_cronicas: string | null;
  estado: "activo" | "inactivo";
}

interface Cita {
  id_cita: number;
  id_paciente: number;
  paciente: Paciente;
  paciente_nombre: string;
  paciente_rut?: string;
  paciente_telefono?: string;
  paciente_email?: string;
  paciente_edad?: number;
  paciente_foto?: string | null;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
  tipo_cita: "primera_vez" | "control" | "procedimiento" | "urgencia" | "telemedicina";
  modalidad: "presencial" | "telemedicina";
  estado:
    | "programada"
    | "confirmada"
    | "en_sala_espera"
    | "en_atencion"
    | "completada"
    | "cancelada"
    | "no_asistio"
    | "reprogramada";
  prioridad: "normal" | "alta" | "urgente";
  sala?: string;
  motivo?: string;
  notas?: string;
  notas_privadas?: string;
  color?: string;
  origen: "presencial" | "telefono" | "web" | "whatsapp" | "chatbot" | "app_movil";
  pagada: boolean;
  monto?: number;
  confirmacion_enviada: boolean;
  confirmado_por_paciente: boolean;
  recordatorio_enviado: boolean;
  especialidad?: {
    id_especialidad: number;
    nombre: string;
  };
  centro?: {
    id_centro: number;
    nombre: string;
  };
  sucursal?: {
    id_sucursal: number;
    nombre: string;
  };
  sesion_telemedicina?: {
    id_sesion: number;
    token_acceso: string;
    url_sesion: string;
    estado: string;
  };
}

interface EstadisticasAgenda {
  total_hoy: number;
  confirmadas: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
  no_asistio: number;
  telemedicina: number;
  presencial: number;
  urgentes: number;
  en_sala_espera: number;
  en_atencion: number;
  reprogramadas: number;
  primera_vez: number;
  controles: number;
  procedimientos: number;
  ingresos_estimados: number;
  ingresos_confirmados: number;
  promedio_duracion: number;
  tasa_ocupacion: number;
  tasa_confirmacion: number;
  tasa_asistencia: number;
}

interface BloqueoHorario {
  id_bloque: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  tipo: "vacaciones" | "reunion" | "personal" | "emergencia" | "otro";
}

interface TipoCita {
  id_tipo_cita: number;
  nombre: string;
  descripcion: string;
  duracion_predeterminada: number;
  color: string;
  precio_sugerido: number;
  requiere_preparacion: boolean;
  instrucciones_preparacion?: string;
}

interface ConfiguracionAgenda {
  duracion_predeterminada: number;
  hora_inicio: string;
  hora_fin: string;
  intervalo_citas: number;
  permite_sobrecupo: boolean;
  maximo_sobrecupo: number;
  tiempo_minimo_anticipacion: number;
  tiempo_maximo_anticipacion: number;
  permite_cancelacion: boolean;
  tiempo_minimo_cancelacion: number;
  dias_laborables: string[];
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function AgendaMedicoPremiumPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  // Estados de la agenda
  const [vista, setVista] = useState<"dia" | "semana" | "mes" | "lista">("dia");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [stats, setStats] = useState<EstadisticasAgenda | null>(null);
  const [bloqueosHorarios, setBloqueosHorarios] = useState<BloqueoHorario[]>([]);
  const [tiposCita, setTiposCita] = useState<TipoCita[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionAgenda | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroModalidad, setFiltroModalidad] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroOrigen, setFiltroOrigen] = useState<string>("todos");
  const [filtroPagada, setFiltroPagada] = useState<string>("todas");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Modales y paneles
  const [mostrarModalNuevaCita, setMostrarModalNuevaCita] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mostrarDetallesCita, setMostrarDetallesCita] = useState(false);
  const [mostrarModalEditarCita, setMostrarModalEditarCita] = useState(false);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);
  const [mostrarPanelEstadisticas, setMostrarPanelEstadisticas] = useState(false);
  const [mostrarModalBloquearHorario, setMostrarModalBloquearHorario] = useState(false);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  // Estados de interacción
  const [horaSeleccionada, setHoraSeleccionada] = useState<Date | null>(null);
  const [rangoSeleccionado, setRangoSeleccionado] = useState<{ inicio: Date; fin: Date } | null>(
    null
  );




  const [salasCentro, setSalasCentro] = useState<
  { id_sala: number; nombre: string; tipo: string }[]
>([]);

  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [citasSeleccionadas, setCitasSeleccionadas] = useState<number[]>([]);
  const [vistaExpandida, setVistaExpandida] = useState(false);

  // Formulario nueva cita
const [formNuevaCita, setFormNuevaCita] = useState({
  id_paciente: "",
  busqueda_paciente: "",
  fecha_hora_inicio: "",
  duracion_minutos: 30,
  tipo_cita: "primera_vez" as const,
  modalidad: "presencial" as const,
  prioridad: "normal" as const,
  motivo: "",
  notas: "",
  id_sala: "",
  especialidad: "",
  monto: "",
});

// helpers de fecha/hora LOCAL (navegador)
const pad = (n: number) => String(n).padStart(2, "0");

// convierte un Date a "YYYY-MM-DDTHH:mm" que es lo que espera <input type="datetime-local">
const toLocalInputValue = (d: Date) => {
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
};

// opcional: por si quieres mostrar la hora bonita según el navegador
const formatLocalHour = (hour: number) => `${pad(hour)}:00`;


  // Estados de pacientes
const [pacientesBuscados, setPacientesBuscados] = useState<Paciente[]>([]);
const [buscandoPacientes, setBuscandoPacientes] = useState(false);
const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

// Estados de cancelación
const [motivoCancelacion, setMotivoCancelacion] = useState("");
const [tipoCancelacion, setTipoCancelacion] = useState<
  "paciente_solicita" | "medico_no_disponible" | "error_programacion" | "reprogramacion" | "otro"
>("paciente_solicita");
const [aplicarCobro, setAplicarCobro] = useState(false);
const [montoCobro, setMontoCobro] = useState("");

// Estados de notificaciones
const [notificaciones, setNotificaciones] = useState<
  { id: string; tipo: "success" | "error" | "warning" | "info"; mensaje: string }[]
>([]);


  // ========================================
  // EFECTOS
  // ========================================

 // carga inicial: datos de sesión
useEffect(() => {
  cargarDatosUsuario();
}, []);

// carga dependiente del médico/fecha/vista
useEffect(() => {
  if (usuario?.medico?.id_profesional) {
    cargarCitas();
    cargarTiposCita();
    cargarConfiguracion();
    cargarSalasCentro(); // <- aquí va lo nuevo
  }
}, [usuario, fechaSeleccionada, vista]);

// búsqueda de paciente con debounce
useEffect(() => {
  if (formNuevaCita.busqueda_paciente.length >= 3) {
    const timeoutId = setTimeout(() => {
      buscarPacientes(formNuevaCita.busqueda_paciente);
    }, 300);

    return () => clearTimeout(timeoutId);
  } else {
    setPacientesBuscados([]);
  }
}, [formNuevaCita.busqueda_paciente]);

// auto-refresh cada 30 segundos
useEffect(() => {
  if (usuario?.medico?.id_profesional) {
    const interval = setInterval(() => {
      cargarCitas(true); // true = silencioso
    }, 30000);

    return () => clearInterval(interval);
  }
}, [usuario]);


  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarDatosUsuario = async () => {
  try {
    setLoading(true);
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("No hay sesión activa");

    const result = await response.json();

    if (result.success && result.usuario) {
      // 👇 normalizamos acá
      const usuarioApi: UsuarioSesion = result.usuario;

      // si el API ya trae el centro dentro de medico.centro_principal,
      // lo reflejamos en medico.id_centro_principal para que el resto del código lo encuentre
    if (
  usuarioApi.medico &&
  !usuarioApi.medico.id_centro_principal &&
  usuarioApi.medico.centro_principal?.id_centro
) {
  usuarioApi.medico.id_centro_principal = usuarioApi.medico.centro_principal.id_centro;
}

// si el médico tiene centro_principal, propágalo al usuario raíz también
if (
  usuarioApi.medico?.centro_principal?.id_centro &&
  !usuarioApi.id_centro_principal
) {
  usuarioApi.id_centro_principal = usuarioApi.medico.centro_principal.id_centro;
}


      // validación de roles como ya tenías
      const rolesUsuario: string[] = [];
      if (usuarioApi.rol) {
        rolesUsuario.push(
          usuarioApi.rol.nombre
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase()
        );
      }

      const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));
      if (!tieneRolMedico) {
        mostrarNotificacion("error", "Acceso denegado. Este panel es solo para médicos.");
        router.push("/");
        return;
      }

      if (!usuarioApi.medico) {
        mostrarNotificacion("error", "Tu usuario no está vinculado a un registro médico.");
        router.push("/");
        return;
      }

      // ✅ ahora sí guardamos el usuario ya normalizado
      setUsuario(usuarioApi);
    } else {
      router.push("/login");
    }
  } catch (error) {
    console.error("Error al cargar usuario:", error);
    mostrarNotificacion("error", "Error al verificar sesión.");
    router.push("/login");
  } finally {
    setLoading(false);
  }
};


  const cargarCitas = async (silencioso = false) => {
    if (!usuario?.medico?.id_profesional) return;

    try {
      if (!silencioso) setCargandoCitas(true);
      
      const fechaISO = fechaSeleccionada.toISOString();
      const response = await fetch(
        `/api/medico/agenda/citas?id_profesional=${usuario.medico.id_profesional}&fecha=${fechaISO}&vista=${vista}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCitas(data.citas || []);
        setStats(data.stats || null);
        setBloqueosHorarios(data.bloqueos || []);
      } else {
        if (!silencioso) {
          mostrarNotificacion("warning", "No se pudieron cargar las citas.");
        }
        setCitas([]);
        setStats(null);
      }
    } catch (error) {
      console.error("Error al cargar citas:", error);
      if (!silencioso) {
        mostrarNotificacion("error", "Error al cargar citas.");
      }
      setCitas([]);
      setStats(null);
    } finally {
      if (!silencioso) setCargandoCitas(false);
    }
  };

  const cargarTiposCita = async () => {
    if (!usuario?.medico?.id_centro_principal) return;

    try {
      const response = await fetch(
        `/api/medico/agenda/tipos-cita?id_centro=${usuario.medico.id_centro_principal}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTiposCita(data.tipos || []);
      }
    } catch (error) {
      console.error("Error al cargar tipos de cita:", error);
    }
  };

  const cargarConfiguracion = async () => {
    if (!usuario?.medico?.id_profesional) return;

    try {
      const response = await fetch(
        `/api/medico/agenda/configuracion?id_profesional=${usuario.medico.id_profesional}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfiguracion(data.configuracion || null);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    }
  };

  const buscarPacientes = async (termino: string) => {
    if (!usuario?.medico?.id_profesional || termino.length < 3) return;

    try {
      setBuscandoPacientes(true);
      const response = await fetch(
        `/api/medico/pacientes/buscar?termino=${encodeURIComponent(termino)}&id_profesional=${
          usuario.medico.id_profesional
        }`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPacientesBuscados(data.pacientes || []);
      } else {
        setPacientesBuscados([]);
      }
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      setPacientesBuscados([]);
    } finally {
      setBuscandoPacientes(false);
    }
  };

  const cargarSalasCentro = async () => {
  try {
    const res = await fetch("/api/medico/centro/salas", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setSalasCentro(data.salas || []);
    }
  } catch (error) {
    console.error("Error al cargar salas:", error);
  }
};


  // ========================================
  // FUNCIONES DE NAVEGACIÓN
  // ========================================

  const irAnterior = () => {
    const nuevaFecha = new Date(fechaSeleccionada);
    if (vista === "dia") {
      nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    } else if (vista === "semana") {
      nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    } else if (vista === "mes") {
      nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    }
    setFechaSeleccionada(nuevaFecha);
  };

  const irSiguiente = () => {
    const nuevaFecha = new Date(fechaSeleccionada);
    if (vista === "dia") {
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    } else if (vista === "semana") {
      nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    } else if (vista === "mes") {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    }
    setFechaSeleccionada(nuevaFecha);
  };

  const irHoy = () => {
    setFechaSeleccionada(new Date());
  };

  // ========================================
  // FUNCIONES DE GESTIÓN DE CITAS
  // ========================================

 const crearNuevaCita = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1) debe haber médico en sesión
  if (!usuario?.medico?.id_profesional) {
    mostrarNotificacion("error", "No hay médico en la sesión.");
    return;
  }

  // 2) intentar centro: primero médico (>0), luego usuario (>0)
  const idCentroMedico = usuario.medico?.id_centro_principal;
  const idCentroUsuario = usuario.id_centro_principal;

// 2) intentar centro en orden: 1) centro_principal del médico (el que ves en el sidebar)
// 2) id_centro_principal del médico
// 3) id_centro_principal del usuario
const idCentro =
  usuario?.medico?.centro_principal?.id_centro ??
  usuario?.medico?.id_centro_principal ??
  usuario?.id_centro_principal ??
  null;

if (!idCentro) {
  mostrarNotificacion(
    "error",
    "Tu usuario no tiene un centro principal asignado. Pídeselo al admin."
  );
  return;
}


  // 3) debe haber paciente
  if (!pacienteSeleccionado) {
    mostrarNotificacion("warning", "Debes seleccionar un paciente");
    return;
  }

  // 4) debe haber fecha
  if (!formNuevaCita.fecha_hora_inicio) {
    mostrarNotificacion("warning", "Debes seleccionar una fecha y hora");
    return;
  }

  try {
    setActualizandoEstado(true);

    const fechaInicio = new Date(formNuevaCita.fecha_hora_inicio);

    const payload = {
      id_paciente: pacienteSeleccionado.id_paciente,
      id_centro: idCentro, // ✅ ya es > 0
      fecha_hora_inicio: fechaInicio.toISOString(),
      duracion_minutos: formNuevaCita.duracion_minutos ?? 30,
      tipo_cita: formNuevaCita.tipo_cita || "primera_vez",
      modalidad: formNuevaCita.modalidad || "presencial",
      estado: "programada",
      prioridad: formNuevaCita.prioridad || "normal",
      motivo: formNuevaCita.motivo || null,
      notas: formNuevaCita.notas || null,
      id_sala: formNuevaCita.id_sala ? Number(formNuevaCita.id_sala) : null,
      id_especialidad: formNuevaCita.especialidad
        ? Number(formNuevaCita.especialidad)
        : null,
      origen: "web",
      pagada: 0,
      monto: formNuevaCita.monto ? parseFloat(formNuevaCita.monto) : null,
      confirmado_por_paciente: 0,
      recordatorio_enviado: 0,
    };

    const response = await fetch("/api/medico/agenda/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      mostrarNotificacion("success", "Cita creada exitosamente");
      setMostrarModalNuevaCita(false);
      resetFormularioNuevaCita();
      cargarCitas();
    } else {
      mostrarNotificacion(
        "error",
        data.error || data.message || "Error al crear la cita"
      );
    }
  } catch (error) {
    console.error("Error al crear cita:", error);
    mostrarNotificacion("error", "Error al crear la cita");
  } finally {
    setActualizandoEstado(false);
  }
};




  const actualizarEstadoCita = async (
    idCita: number,
    nuevoEstado: Cita["estado"],
    notas?: string
  ) => {
    try {
      setActualizandoEstado(true);

      const response = await fetch(`/api/medico/agenda/citas/${idCita}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          estado: nuevoEstado,
          notas_privadas: notas,
        }),
      });

      if (response.ok) {
        mostrarNotificacion("success", `Cita marcada como ${nuevoEstado.replace("_", " ")}`);
        cargarCitas();
        setMostrarDetallesCita(false);
      } else {
        const error = await response.json();
        mostrarNotificacion("error", error.message || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      mostrarNotificacion("error", "Error al actualizar el estado");
    } finally {
      setActualizandoEstado(false);
    }
  };

  const cancelarCita = async () => {
    if (!citaSeleccionada) return;

    try {
      setActualizandoEstado(true);

      const response = await fetch(`/api/medico/agenda/citas/${citaSeleccionada.id_cita}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          motivo: tipoCancelacion,
          detalle_motivo: motivoCancelacion,
          cobro_aplicado: aplicarCobro ? parseFloat(montoCobro) : null,
        }),
      });

      if (response.ok) {
        mostrarNotificacion("success", "Cita cancelada exitosamente");
        setMostrarModalCancelar(false);
        setMostrarDetallesCita(false);
        resetFormularioCancelacion();
        cargarCitas();
      } else {
        const error = await response.json();
        mostrarNotificacion("error", error.message || "Error al cancelar la cita");
      }
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      mostrarNotificacion("error", "Error al cancelar la cita");
    } finally {
      setActualizandoEstado(false);
    }
  };

  const confirmarCita = async (idCita: number) => {
    try {
      setActualizandoEstado(true);

      const response = await fetch(`/api/medico/agenda/citas/${idCita}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          confirmado_por: "medico",
        }),
      });

      if (response.ok) {
        mostrarNotificacion("success", "Cita confirmada exitosamente");
        cargarCitas();
      } else {
        const error = await response.json();
        mostrarNotificacion("error", error.message || "Error al confirmar la cita");
      }
    } catch (error) {
      console.error("Error al confirmar cita:", error);
      mostrarNotificacion("error", "Error al confirmar la cita");
    } finally {
      setActualizandoEstado(false);
    }
  };

  const enviarRecordatorio = async (idCita: number) => {
    try {
      const response = await fetch(`/api/medico/agenda/citas/${idCita}/recordatorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tipo: "email",
        }),
      });

      if (response.ok) {
        mostrarNotificacion("success", "Recordatorio enviado exitosamente");
        cargarCitas();
      } else {
        const error = await response.json();
        mostrarNotificacion("error", error.message || "Error al enviar recordatorio");
      }
    } catch (error) {
      console.error("Error al enviar recordatorio:", error);
      mostrarNotificacion("error", "Error al enviar recordatorio");
    }
  };

  const reprogramarCita = async (idCita: number, nuevaFecha: string) => {
    try {
      setActualizandoEstado(true);

      const response = await fetch(`/api/medico/agenda/citas/${idCita}/reprogramar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fecha_hora_inicio: nuevaFecha,
        }),
      });

      if (response.ok) {
        mostrarNotificacion("success", "Cita reprogramada exitosamente");
        cargarCitas();
      } else {
        const error = await response.json();
        mostrarNotificacion("error", error.message || "Error al reprogramar la cita");
      }
    } catch (error) {
      console.error("Error al reprogramar cita:", error);
      mostrarNotificacion("error", "Error al reprogramar la cita");
    } finally {
      setActualizandoEstado(false);
    }
  };

  // ========================================
  // FUNCIONES DE BLOQUEO DE HORARIOS
  // ========================================

  const bloquearHorario = async (inicio: Date, fin: Date, motivo: string, tipo: string) => {
    if (!usuario?.medico?.id_profesional) return;

    try {
      const response = await fetch("/api/medico/agenda/bloqueos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_profesional: usuario.medico.id_profesional,
          id_centro: usuario.medico.id_centro_principal,
          fecha_inicio: inicio.toISOString(),
          fecha_fin: fin.toISOString(),
          motivo_bloqueo: motivo,
          tipo: tipo,
          estado: "bloqueado",
        }),
      });

      if (response.ok) {
        mostrarNotificacion("success", "Horario bloqueado exitosamente");
        setMostrarModalBloquearHorario(false);
        cargarCitas();
      } else {
        const error = await response.json();
        mostrarNotificacion("error", error.message || "Error al bloquear horario");
      }
    } catch (error) {
      console.error("Error al bloquear horario:", error);
      mostrarNotificacion("error", "Error al bloquear horario");
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "warning" | "info",
    mensaje: string
  ) => {
    const id = Math.random().toString(36).substring(7);
    setNotificaciones((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const resetFormularioNuevaCita = () => {
  setFormNuevaCita({
    id_paciente: "",
    busqueda_paciente: "",
    fecha_hora_inicio: "",
    duracion_minutos: 30,
    tipo_cita: "primera_vez",
    modalidad: "presencial",
    prioridad: "normal",
    motivo: "",
    notas: "",
    id_sala: "",
    especialidad: "",
    monto: "",
  });
  setPacienteSeleccionado(null);
  setPacientesBuscados([]);
};


  const resetFormularioCancelacion = () => {
    setMotivoCancelacion("");
    setTipoCancelacion("paciente_solicita");
    setAplicarCobro(false);
    setMontoCobro("");
  };

  const formatearFecha = (fecha: Date | string) => {
    const d = typeof fecha === "string" ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat("es-CL", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  };

  const formatearFechaCorta = (fecha: Date | string) => {
    const d = typeof fecha === "string" ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
    }).format(d);
  };

  const formatearHora = (fecha: string) => {
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(fecha));
  };

  const formatearDuracion = (minutos: number) => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      programada: "bg-blue-500/10 text-blue-700 border-blue-500/30",
      confirmada: "bg-green-500/10 text-green-700 border-green-500/30",
      en_sala_espera: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
      en_atencion: "bg-purple-500/10 text-purple-700 border-purple-500/30",
      completada: "bg-gray-500/10 text-gray-700 border-gray-500/30",
      cancelada: "bg-red-500/10 text-red-700 border-red-500/30",
      no_asistio: "bg-orange-500/10 text-orange-700 border-orange-500/30",
      reprogramada: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30",
    };
    return colores[estado] || colores.programada;
  };

  const obtenerIconoEstado = (estado: string) => {
    const iconos: { [key: string]: any } = {
      programada: Calendar,
      confirmada: CheckCircle2,
      en_sala_espera: Clock,
      en_atencion: Activity,
      completada: CheckCircle,
      cancelada: XCircle,
      no_asistio: AlertOctagon,
      reprogramada: RefreshCw,
    };
    return iconos[estado] || Calendar;
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const colores: { [key: string]: string } = {
      normal: "bg-gray-500/10 text-gray-700 border-gray-500/30",
      alta: "bg-orange-500/10 text-orange-700 border-orange-500/30",
      urgente: "bg-red-500/10 text-red-700 border-red-500/30 animate-pulse",
    };
    return colores[prioridad] || colores.normal;
  };

  const obtenerColorModalidad = (modalidad: string) => {
    return modalidad === "telemedicina"
      ? "bg-blue-500/10 text-blue-700 border-blue-500/30"
      : "bg-indigo-500/10 text-indigo-700 border-indigo-500/30";
  };

  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      const matchBusqueda =
        !busqueda ||
        c.paciente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.paciente_rut || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.motivo || "").toLowerCase().includes(busqueda.toLowerCase());
      
      const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado;
      const matchModalidad = filtroModalidad === "todas" || c.modalidad === filtroModalidad;
      const matchTipo = filtroTipo === "todos" || c.tipo_cita === filtroTipo;
      const matchPrioridad = filtroPrioridad === "todas" || c.prioridad === filtroPrioridad;
      const matchOrigen = filtroOrigen === "todos" || c.origen === filtroOrigen;
      const matchPagada =
        filtroPagada === "todas" ||
        (filtroPagada === "pagada" && c.pagada) ||
        (filtroPagada === "pendiente" && !c.pagada);

      return (
        matchBusqueda &&
        matchEstado &&
        matchModalidad &&
        matchTipo &&
        matchPrioridad &&
        matchOrigen &&
        matchPagada
      );
    });
  }, [citas, busqueda, filtroEstado, filtroModalidad, filtroTipo, filtroPrioridad, filtroOrigen, filtroPagada]);

  const horasDelDia = useMemo(
    () => Array.from({ length: 14 }, (_, i) => (configuracion?.hora_inicio ? parseInt(configuracion.hora_inicio.split(":")[0]) : 8) + i),
    [configuracion]
  );

  const esMismoDia = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const citasDelDia = useCallback(
    (dia: Date) => citasFiltradas.filter((c) => esMismoDia(new Date(c.fecha_hora_inicio), dia)),
    [citasFiltradas]
  );

  const obtenerSemana = (fecha: Date) => {
    const inicio = new Date(fecha);
    inicio.setDate(inicio.getDate() - inicio.getDay() + 1); // Lunes
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const obtenerDiasMes = (fecha: Date) => {
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const dias = [];

    // Días del mes anterior para completar la primera semana
    const diaSemana = primerDia.getDay();
    const diasAnteriores = diaSemana === 0 ? 6 : diaSemana - 1;
    for (let i = diasAnteriores; i > 0; i--) {
      const dia = new Date(primerDia);
      dia.setDate(dia.getDate() - i);
      dias.push(dia);
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(fecha.getFullYear(), fecha.getMonth(), i));
    }

    // Días del mes siguiente para completar la última semana
    const diasSiguientes = 42 - dias.length; // 6 semanas = 42 días
    for (let i = 1; i <= diasSiguientes; i++) {
      const dia = new Date(ultimoDia);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }

    return dias;
  };

  const esHoy = (fecha: Date) => esMismoDia(fecha, new Date());
  const esMesActual = (fecha: Date) =>
    fecha.getMonth() === fechaSeleccionada.getMonth() &&
    fecha.getFullYear() === fechaSeleccionada.getFullYear();

  // ========================================
  // RENDER LOADING
  // ========================================

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-r-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 animate-pulse">
              Cargando Agenda Premium
            </h2>
            <p className="text-sm text-gray-600 font-semibold">
              Preparando tu espacio de trabajo...
            </p>
          </div>
        </div>
      </MedicoLayout>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="text-center max-w-md mx-auto p-8 rounded-3xl bg-white shadow-2xl border-2 border-red-200">
            <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4 text-gray-900">Acceso No Autorizado</h2>
            <p className="text-sm text-gray-600 mb-6 font-semibold">
              No tienes permisos para acceder a esta página. Solo médicos autorizados pueden
              ingresar.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </MedicoLayout>
    );
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <MedicoLayout>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 md:py-4">
        <div className="max-w-[2000px] mx-auto w-full">
          {/* ========================================
              HEADER ULTRA PREMIUM
              ======================================== */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
              {/* Logo y Título */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Agenda Premium Pro
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                    Sistema inteligente de gestión médica • {formatearFecha(new Date())}
                  </p>
                </div>
              </div>

              {/* Acciones Principales */}
              <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
                <button
                  onClick={() => setMostrarModalNuevaCita(true)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span className="hidden xs:inline">Nueva Cita</span>
                  <span className="xs:hidden">Nueva</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </button>

                <button
                  onClick={() => cargarCitas()}   // 👈 ahora sí
                  disabled={cargandoCitas}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${
                      cargandoCitas
                        ? "animate-spin"
                        : "group-hover:rotate-180 transition-transform duration-500"
                    }`}
                  />
                </button>


                <button
                  onClick={() => setMostrarPanelEstadisticas(!mostrarPanelEstadisticas)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg border border-gray-200 group"
                >
                  <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg border border-gray-200 group"
                >
                  <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================
              PANEL DE ESTADÍSTICAS EXPANDIBLE
              ======================================== */}
          {mostrarPanelEstadisticas && stats && (
            <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white border border-gray-200 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Análisis Completo</h3>
                    <p className="text-xs text-gray-600 font-semibold">
                      Estadísticas detalladas del día
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarPanelEstadisticas(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {[
                  {
                    label: "Total Hoy",
                    value: stats.total_hoy,
                    icon: Calendar,
                    color: "from-blue-500 to-cyan-500",
                    trend: "+12%",
                  },
                  {
                    label: "Confirmadas",
                    value: stats.confirmadas,
                    icon: CheckCircle2,
                    color: "from-green-500 to-emerald-500",
                    percentage: (stats.confirmadas / stats.total_hoy) * 100,
                  },
                  {
                    label: "En Espera",
                    value: stats.en_sala_espera,
                    icon: Clock,
                    color: "from-yellow-500 to-orange-500",
                  },
                  {
                    label: "En Atención",
                    value: stats.en_atencion,
                    icon: Activity,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    label: "Completadas",
                    value: stats.completadas,
                    icon: CheckCircle,
                    color: "from-teal-500 to-cyan-500",
                    percentage: (stats.completadas / stats.total_hoy) * 100,
                  },
                  {
                    label: "Canceladas",
                    value: stats.canceladas,
                    icon: XCircle,
                    color: "from-red-500 to-rose-500",
                  },
                  {
                    label: "No Asistió",
                    value: stats.no_asistio,
                    icon: AlertOctagon,
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    label: "Telemedicina",
                    value: stats.telemedicina,
                    icon: Video,
                    color: "from-cyan-500 to-blue-500",
                    percentage: (stats.telemedicina / stats.total_hoy) * 100,
                  },
                  {
                    label: "Presencial",
                    value: stats.presencial,
                    icon: Users,
                    color: "from-indigo-500 to-purple-500",
                    percentage: (stats.presencial / stats.total_hoy) * 100,
                  },
                  {
                    label: "Urgentes",
                    value: stats.urgentes,
                    icon: AlertTriangle,
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    label: "Primera Vez",
                    value: stats.primera_vez,
                    icon: UserCircle,
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    label: "Controles",
                    value: stats.controles,
                    icon: ClipboardCheck,
                    color: "from-green-500 to-teal-500",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-4 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                      {stat.trend && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    {stat.percentage !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color}`}
                            style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] font-semibold text-gray-500 mt-1">
                          {stat.percentage.toFixed(0)}% del total
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Estadísticas Financieras */}
              {stats.ingresos_estimados > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <span className="text-xs font-bold text-green-600">HOY</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">
                      {formatearMoneda(stats.ingresos_estimados)}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">Ingresos Estimados</p>
                  </div>

                  <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8 text-blue-600" />
                      <span className="text-xs font-bold text-blue-600">CONFIRMADO</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">
                      {formatearMoneda(stats.ingresos_confirmados)}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">Ingresos Confirmados</p>
                  </div>

                  <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-8 h-8 text-purple-600" />
                      <span className="text-xs font-bold text-purple-600">OCUPACIÓN</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-1">
                      {stats.tasa_ocupacion.toFixed(0)}%
                    </p>
                    <p className="text-xs font-semibold text-gray-600">Tasa de Ocupación</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================
              ESTADÍSTICAS COMPACTAS
              ======================================== */}
          {!mostrarPanelEstadisticas && stats && (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              {[
                {
                  label: "Total",
                  value: stats.total_hoy || citasFiltradas.length,
                  icon: Calendar,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  label: "Confirmadas",
                  value: stats.confirmadas || 0,
                  icon: CheckCircle2,
                  color: "from-green-500 to-emerald-500",
                },
                {
                  label: "Pendientes",
                  value: stats.pendientes || 0,
                  icon: Clock,
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  label: "Completadas",
                  value: stats.completadas || 0,
                  icon: Activity,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  label: "Canceladas",
                  value: stats.canceladas || 0,
                  icon: X,
                  color: "from-red-500 to-rose-500",
                },
                {
                  label: "Online",
                  value: stats.telemedicina || 0,
                  icon: Video,
                  color: "from-cyan-500 to-blue-500",
                },
                {
                  label: "Presencial",
                  value: stats.presencial || 0,
                  icon: Users,
                  color: "from-indigo-500 to-purple-500",
                },
                {
                  label: "Urgentes",
                  value: stats.urgentes || 0,
                  icon: AlertTriangle,
                  color: "from-orange-500 to-red-500",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-lg sm:rounded-xl p-2 sm:p-3 bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                  onClick={() => setMostrarPanelEstadisticas(true)}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-600 truncate">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ========================================
              CONTROLES DE NAVEGACIÓN Y VISTAS
              ======================================== */}
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-white border border-gray-200 shadow-lg mb-3 sm:mb-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              {/* Navegación de Fecha */}
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                <button
                  onClick={irAnterior}
                  className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 transition-all hover:scale-105 shadow-md group"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={irHoy}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Hoy
                </button>

                <button
                  onClick={irSiguiente}
                  className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 transition-all hover:scale-105 shadow-md group"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[250px]">
                    {formatearFecha(fechaSeleccionada)}
                  </p>
                </div>
              </div>

              {/* Selector de Vistas */}
              <div className="flex gap-2 w-full lg:w-auto">
                {[
                  { id: "dia", label: "Día", icon: Calendar, shortLabel: "D" },
                  { id: "semana", label: "Semana", icon: Grid, shortLabel: "S" },
                  { id: "mes", label: "Mes", icon: Calendar, shortLabel: "M" },
                  { id: "lista", label: "Lista", icon: List, shortLabel: "L" },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVista(v.id as any)}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                      vista === v.id
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                    }`}
                  >
                    <v.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{v.label}</span>
                    <span className="sm:hidden">{v.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, RUT o motivo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg ${
                  mostrarFiltros
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {(filtroEstado !== "todos" ||
                  filtroModalidad !== "todas" ||
                  filtroTipo !== "todos" ||
                  filtroPrioridad !== "todas" ||
                  filtroOrigen !== "todos" ||
                  filtroPagada !== "todas") && (
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setMostrarModalBloquearHorario(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Bloquear</span>
              </button>
            </div>

            {/* Panel de Filtros */}
            {mostrarFiltros && (
              <div className="mt-3 pt-3 border-t border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    {
                      label: "Estado",
                      value: filtroEstado,
                      onChange: setFiltroEstado,
                      options: [
                        { value: "todos", label: "Todos los estados" },
                        { value: "programada", label: "Programada" },
                        { value: "confirmada", label: "Confirmada" },
                        { value: "en_sala_espera", label: "En sala de espera" },
                        { value: "en_atencion", label: "En atención" },
                        { value: "completada", label: "Completada" },
                        { value: "cancelada", label: "Cancelada" },
                        { value: "no_asistio", label: "No asistió" },
                        { value: "reprogramada", label: "Reprogramada" },
                      ],
                    },
                    {
                      label: "Modalidad",
                      value: filtroModalidad,
                      onChange: setFiltroModalidad,
                      options: [
                        { value: "todas", label: "Todas" },
                        { value: "presencial", label: "Presencial" },
                        { value: "telemedicina", label: "Telemedicina" },
                      ],
                    },
                    {
                      label: "Tipo",
                      value: filtroTipo,
                      onChange: setFiltroTipo,
                      options: [
                        { value: "todos", label: "Todos los tipos" },
                        { value: "primera_vez", label: "Primera vez" },
                        { value: "control", label: "Control" },
                        { value: "procedimiento", label: "Procedimiento" },
                        { value: "urgencia", label: "Urgencia" },
                        { value: "telemedicina", label: "Telemedicina" },
                      ],
                    },
                    {
                      label: "Prioridad",
                      value: filtroPrioridad,
                      onChange: setFiltroPrioridad,
                      options: [
                        { value: "todas", label: "Todas" },
                        { value: "normal", label: "Normal" },
                        { value: "alta", label: "Alta" },
                        { value: "urgente", label: "Urgente" },
                      ],
                    },
                    {
                      label: "Origen",
                      value: filtroOrigen,
                      onChange: setFiltroOrigen,
                      options: [
                        { value: "todos", label: "Todos" },
                        { value: "presencial", label: "Presencial" },
                        { value: "telefono", label: "Teléfono" },
                        { value: "web", label: "Web" },
                        { value: "whatsapp", label: "WhatsApp" },
                        { value: "chatbot", label: "Chatbot" },
                        { value: "app_movil", label: "App Móvil" },
                      ],
                    },
                    {
                      label: "Pago",
                      value: filtroPagada,
                      onChange: setFiltroPagada,
                      options: [
                        { value: "todas", label: "Todas" },
                        { value: "pagada", label: "Pagada" },
                        { value: "pendiente", label: "Pendiente" },
                      ],
                    },
                  ].map((filtro, idx) => (
                    <div key={idx}>
                      <label className="text-xs font-bold text-gray-900 mb-1.5 block">
                        {filtro.label}
                      </label>
                      <select
                        value={filtro.value}
                        onChange={(e) => filtro.onChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                      >
                        {filtro.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">
                    Mostrando {citasFiltradas.length} de {citas.length} citas
                  </p>
                  <button
                    onClick={() => {
                      setFiltroEstado("todos");
                      setFiltroModalidad("todas");
                      setFiltroTipo("todos");
                      setFiltroPrioridad("todas");
                      setFiltroOrigen("todos");
                      setFiltroPagada("todas");
                      setBusqueda("");
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================
              VISTA LISTA - ULTRA PREMIUM
              ======================================== */}
          {vista === "lista" && (
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <List className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      Lista de Citas
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? "s" : ""} •{" "}
                      {formatearFecha(fechaSeleccionada)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVistaExpandida(!vistaExpandida)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    {vistaExpandida ? (
                      <Minimize2 className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Maximize2 className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setModoSeleccion(!modoSeleccion)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      modoSeleccion
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {modoSeleccion ? "Cancelar" : "Seleccionar"}
                  </button>
                </div>
              </div>

              {cargandoCitas ? (
                <div className="text-center py-16">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Cargando citas...</p>
                </div>
              ) : citasFiltradas.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
                    No hay citas
                  </h4>
                  <p className="text-sm text-gray-600 font-semibold mb-6 max-w-md mx-auto">
                    No se encontraron citas para los filtros seleccionados. Intenta ajustar tus
                    criterios de búsqueda.
                  </p>
                  <button
                    onClick={() => setMostrarModalNuevaCita(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Crear Nueva Cita
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {citasFiltradas.map((cita) => {
                    const IconoEstado = obtenerIconoEstado(cita.estado);
                    const estaSeleccionada = citasSeleccionadas.includes(cita.id_cita);

                    return (
                      <div
                        key={cita.id_cita}
                        className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50/50 border-2 transition-all duration-300 cursor-pointer group ${
                          estaSeleccionada
                            ? "border-indigo-500 shadow-xl scale-[1.02]"
                            : "border-gray-200 hover:border-indigo-300 shadow-md hover:shadow-xl hover:scale-[1.01]"
                        }`}
                        onClick={() => {
                          if (modoSeleccion) {
                            setCitasSeleccionadas((prev) =>
                              prev.includes(cita.id_cita)
                                ? prev.filter((id) => id !== cita.id_cita)
                                : [...prev, cita.id_cita]
                            );
                          } else {
                            setCitaSeleccionada(cita);
                            setMostrarDetallesCita(true);
                          }
                        }}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
                          {/* Checkbox en modo selección */}
                          {modoSeleccion && (
                            <div className="flex-shrink-0">
                              <div
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  estaSeleccionada
                                    ? "bg-indigo-600 border-indigo-600"
                                    : "border-gray-300 group-hover:border-indigo-300"
                                }`}
                              >
                                {estaSeleccionada && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Hora */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                              <p className="text-xs font-bold opacity-80">
                                {formatearHora(cita.fecha_hora_inicio).split(":")[0]}
                              </p>
                              <p className="text-2xl font-black">
                                {formatearHora(cita.fecha_hora_inicio).split(":")[1]}
                              </p>
                              <p className="text-[10px] font-semibold opacity-70">
                                {formatearDuracion(cita.duracion_minutos)}
                              </p>
                            </div>
                          </div>

                          {/* Foto del paciente */}
                          <div className="flex-shrink-0">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                              {cita.paciente_foto ? (
                                <Image
                                  src={cita.paciente_foto}
                                  alt={cita.paciente_nombre}
                                  fill
                                  className="rounded-xl sm:rounded-2xl object-cover border-2 border-gray-200 group-hover:border-indigo-300 transition-all"
                                />
                              ) : (
                                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-200 group-hover:border-indigo-300 transition-all">
                                  <UserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                                </div>
                              )}
                              {cita.prioridad === "urgente" && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Información del paciente */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                              <div>
                                <h4 className="text-sm sm:text-base font-black text-gray-900 mb-0.5 truncate">
                                  {cita.paciente_nombre}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                                  {cita.paciente_rut && (
                                    <span className="flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      {cita.paciente_rut}
                                    </span>
                                  )}
                                  {cita.paciente_edad && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {cita.paciente_edad} años
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold border whitespace-nowrap ${obtenerColorEstado(
                                    cita.estado
                                  )}`}
                                >
                                  <IconoEstado className="w-3 h-3 inline mr-1" />
                                  {cita.estado.replace("_", " ").toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Motivo */}
                            <p className="text-xs sm:text-sm text-gray-700 font-medium mb-2 line-clamp-2">
                              {cita.motivo || `${cita.tipo_cita.replace("_", " ")} - Sin motivo especificado`}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5">
                              <div
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${obtenerColorModalidad(
                                  cita.modalidad
                                )}`}
                              >
                                {cita.modalidad === "telemedicina" ? (
                                  <Video className="w-3 h-3" />
                                ) : (
                                  <Users className="w-3 h-3" />
                                )}
                                <span className="text-[10px] font-bold">
                                  {cita.modalidad === "telemedicina" ? "Online" : "Presencial"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200">
                                <Clock className="w-3 h-3 text-purple-600" />
                                <span className="text-[10px] font-bold text-gray-900">
                                  {formatearDuracion(cita.duracion_minutos)}
                                </span>
                              </div>

                              {cita.prioridad !== "normal" && (
                                <div
                                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${obtenerColorPrioridad(
                                    cita.prioridad
                                  )}`}
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span className="text-[10px] font-bold uppercase">
                                    {cita.prioridad}
                                  </span>
                                </div>
                              )}

                              {cita.pagada && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 border border-green-200">
                                  <DollarSign className="w-3 h-3 text-green-600" />
                                  <span className="text-[10px] font-bold text-green-900">
                                    PAGADO
                                  </span>
                                </div>
                              )}

                              {cita.confirmado_por_paciente && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200">
                                  <CheckCircle className="w-3 h-3 text-blue-600" />
                                  <span className="text-[10px] font-bold text-blue-900">
                                    CONFIRMADO
                                  </span>
                                </div>
                              )}

                              {cita.tipo_cita === "primera_vez" && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-50 border border-cyan-200">
                                  <Star className="w-3 h-3 text-cyan-600" />
                                  <span className="text-[10px] font-bold text-cyan-900">
                                    NUEVA
                                  </span>
                                </div>
                              )}

                              {cita.especialidad && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 border border-purple-200">
                                  <Stethoscope className="w-3 h-3 text-purple-600" />
                                  <span className="text-[10px] font-bold text-purple-900 truncate max-w-[100px]">
                                    {cita.especialidad.nombre}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          {!modoSeleccion && (
                            <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                              {cita.modalidad === "telemedicina" && cita.sesion_telemedicina && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `/medico/telemedicina/${cita.id_cita}`,
                                      "_blank"
                                    );
                                  }}
                                  className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>Iniciar Video</span>
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/medico/consultas/nueva?cita=${cita.id_cita}`);
                                }}
                                className="flex-1 lg:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl hover:scale-105"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                <span>Atender</span>
                              </button>

                              {cita.estado === "programada" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmarCita(cita.id_cita);
                                  }}
                                  className="flex-1 lg:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Confirmar</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Acciones masivas en modo selección */}
              {modoSeleccion && citasSeleccionadas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">
                    {citasSeleccionadas.length} cita{citasSeleccionadas.length !== 1 ? "s" : ""}{" "}
                    seleccionada{citasSeleccionadas.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Aquí iría la lógica para confirmar múltiples citas
                        mostrarNotificacion("success", "Citas confirmadas exitosamente");
                        setCitasSeleccionadas([]);
                        setModoSeleccion(false);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg"
                    >
                      Confirmar seleccionadas
                    </button>
                    <button
                      onClick={() => {
                        // Aquí iría la lógica para cancelar múltiples citas
                        setCitasSeleccionadas([]);
                        setModoSeleccion(false);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg"
                    >
                      Cancelar seleccionadas
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================
              VISTA DÍA - CALENDARIO HORARIO
              ======================================== */}
          {vista === "dia" && (
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900">Vista del Día</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      {citasDelDia(fechaSeleccionada).length} cita
                      {citasDelDia(fechaSeleccionada).length !== 1 ? "s" : ""} •{" "}
                      {formatearFecha(fechaSeleccionada)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
  {horasDelDia.map((hora) => {
    // 👇 todas las citas de ese día cuya hora LOCAL coincide con esta fila
    const citasHora = citasDelDia(fechaSeleccionada).filter((c) => {
      const inicioLocal = new Date(c.fecha_hora_inicio); // el browser lo lleva a la zona del user
      return inicioLocal.getHours() === hora;
    });

    return (
      <div
        key={hora}
        className="flex gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all group"
      >
        {/* columna de la hora */}
        <div className="w-20 text-right flex-shrink-0">
          <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
            {formatLocalHour(hora)}
          </p>
          <p className="text-[10px] font-semibold text-gray-500">
            {formatLocalHour(hora + 1)}
          </p>
        </div>

        {/* contenido (citas o slot libre) */}
        <div className="flex-1 border-l-2 border-gray-200 group-hover:border-indigo-300 pl-4 transition-colors">
          {citasHora.length === 0 ? (
            <div className="py-3">
              <button
                onClick={() => {
                  // creamos un Date con la fecha seleccionada,
                  // pero la hora que el user clickeó, en LOCAL
                  const fechaHora = new Date(fechaSeleccionada);
                  fechaHora.setHours(hora, 0, 0, 0);

                  setFormNuevaCita((prev) => ({
                    ...prev,
                    // 👇 aquí está el cambio importante:
                    // NADA de .toISOString(), mandamos formato local
                    fecha_hora_inicio: toLocalInputValue(fechaHora),
                  }));
                  setMostrarModalNuevaCita(true);
                }}
                className="text-xs text-gray-400 hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1 group/btn"
              >
                <Plus className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                Disponible - Click para agendar
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {citasHora.map((cita) => {
                const IconoEstado = obtenerIconoEstado(cita.estado);

                // pasamos las fechas de la cita a Date local para mostrarlas
                const inicio = new Date(cita.fecha_hora_inicio);
                const fin = new Date(cita.fecha_hora_fin);

                const horaInicio = new Intl.DateTimeFormat("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(inicio);

                const horaFin = new Intl.DateTimeFormat("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(fin);

                return (
                  <div
                    key={cita.id_cita}
                    className="p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group/cita"
                    onClick={() => {
                      setCitaSeleccionada(cita);
                      setMostrarDetallesCita(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {cita.paciente_foto ? (
                          <Image
                            src={cita.paciente_foto}
                            alt={cita.paciente_nombre}
                            width={40}
                            height={40}
                            className="rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border border-gray-200">
                            <UserCircle className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate">
                            {cita.paciente_nombre}
                          </p>
                          <p className="text-xs text-gray-600 font-medium truncate">
                            {horaInicio} - {horaFin}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border whitespace-nowrap ${obtenerColorEstado(
                          cita.estado
                        )}`}
                      >
                        <IconoEstado className="w-3 h-3 inline mr-0.5" />
                        {cita.estado.split("_")[0].toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 mb-2 line-clamp-1">
                      {cita.motivo || cita.tipo_cita}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      <div
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border ${obtenerColorModalidad(
                          cita.modalidad
                        )}`}
                      >
                        {cita.modalidad === "telemedicina" ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        <span className="text-[9px] font-bold">
                          {cita.modalidad === "telemedicina"
                            ? "Online"
                            : "Presencial"}
                        </span>
                      </div>

                      {cita.prioridad === "urgente" && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-red-50 border border-red-200 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span className="text-[9px] font-bold text-red-900">
                            URGENTE
                          </span>
                        </div>
                      )}

                      {cita.pagada && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-green-50 border border-green-200">
                          <DollarSign className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>
            </div>
          )}

          {/* ========================================
              VISTA SEMANA - GRID SEMANAL
              ======================================== */}
          {vista === "semana" && (
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Grid className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900">
                      Vista Semanal
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      {formatearFechaCorta(obtenerSemana(fechaSeleccionada)[0])} -{" "}
                      {formatearFechaCorta(obtenerSemana(fechaSeleccionada)[6])}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header con días */}
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    <div className="text-center text-xs font-bold text-gray-500">Hora</div>
                    {obtenerSemana(fechaSeleccionada).map((dia, idx) => (
                      <div
                        key={idx}
                        className={`text-center p-2 rounded-lg ${
                          esHoy(dia)
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-[10px] font-semibold uppercase">
                          {dia.toLocaleDateString("es-CL", { weekday: "short" })}
                        </p>
                        <p className="text-lg font-black">{dia.getDate()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Grid de horarios */}
                  <div className="space-y-1">
                    {horasDelDia.map((hora) => (
                      <div key={hora} className="grid grid-cols-8 gap-2">
                        <div className="text-center py-2 text-xs font-bold text-gray-600">
                          {hora.toString().padStart(2, "0")}:00
                        </div>
                        {obtenerSemana(fechaSeleccionada).map((dia, idx) => {
                          const citasHora = citasDelDia(dia).filter(
                            (c) => new Date(c.fecha_hora_inicio).getHours() === hora
                          );

                          return (
                            <div
                              key={idx}
                              className={`min-h-[60px] p-1 rounded-lg border transition-all ${
                                citasHora.length > 0
                                  ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-md"
                                  : "bg-white border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {citasHora.length > 0 ? (
                                <div className="space-y-1">
                                  {citasHora.slice(0, 2).map((cita) => (
                                    <div
                                      key={cita.id_cita}
                                      className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
                                      onClick={() => {
                                        setCitaSeleccionada(cita);
                                        setMostrarDetallesCita(true);
                                      }}
                                    >
                                      <p className="text-[9px] font-bold text-gray-900 truncate">
                                        {cita.paciente_nombre}
                                      </p>
                                      <p className="text-[8px] text-gray-600 truncate">
                                        {cita.motivo || cita.tipo_cita}
                                      </p>
                                    </div>
                                  ))}
                                  {citasHora.length > 2 && (
                                    <p className="text-[8px] font-bold text-indigo-600 text-center">
                                      +{citasHora.length - 2} más
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    const fechaHora = new Date(dia);
                                    fechaHora.setHours(hora, 0, 0, 0);
                                    setFormNuevaCita((prev) => ({
                                      ...prev,
                                      fecha_hora_inicio: fechaHora.toISOString().slice(0, 16),
                                    }));
                                    setMostrarModalNuevaCita(true);
                                  }}
                                  className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================
              VISTA MES - CALENDARIO MENSUAL
              ======================================== */}
          {vista === "mes" && (
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900">Vista Mensual</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                      {fechaSeleccionada.toLocaleDateString("es-CL", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dia, idx) => (
                  <div key={idx} className="text-center py-2 text-xs font-bold text-gray-600">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {obtenerDiasMes(fechaSeleccionada).map((dia, idx) => {
                  const citasDia = citasDelDia(dia);
                  const esDelMesActual = esMesActual(dia);
                  const esDiaHoy = esHoy(dia);

                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] p-2 rounded-xl border transition-all ${
                        esDiaHoy
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-600 text-white shadow-xl"
                          : esDelMesActual
                          ? "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg"
                          : "bg-gray-50 border-gray-100 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className={`text-sm font-black ${
                            esDiaHoy ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {dia.getDate()}
                        </p>
                        {citasDia.length > 0 && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${
                              esDiaHoy
                                ? "bg-white/20 text-white"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {citasDia.length}
                          </span>
                        )}
                      </div>

                      {citasDia.length > 0 && (
                        <div className="space-y-1">
                          {citasDia.slice(0, 3).map((cita) => (
                            <div
                              key={cita.id_cita}
                              className={`p-1 rounded-lg cursor-pointer transition-all ${
                                esDiaHoy
                                  ? "bg-white/20 hover:bg-white/30"
                                  : "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-300 hover:shadow-md"
                              }`}
                              onClick={() => {
                                setCitaSeleccionada(cita);
                                setMostrarDetallesCita(true);
                              }}
                            >
                              <p
                                className={`text-[9px] font-bold truncate ${
                                  esDiaHoy ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {formatearHora(cita.fecha_hora_inicio)} {cita.paciente_nombre}
                              </p>
                            </div>
                          ))}
                          {citasDia.length > 3 && (
                            <p
                              className={`text-[8px] font-bold text-center ${
                                esDiaHoy ? "text-white/80" : "text-indigo-600"
                              }`}
                            >
                              +{citasDia.length - 3} más
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================
          MODAL NUEVA CITA - ULTRA PREMIUM
          ======================================== */}
      {mostrarModalNuevaCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white border-2 border-gray-200 shadow-2xl p-5 sm:p-8 relative animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setMostrarModalNuevaCita(false);
                resetFormularioNuevaCita();
              }}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-gray-100 transition-all group z-10"
            >
              <X className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Plus className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Nueva Cita Médica</h3>
                <p className="text-sm text-gray-600 font-semibold">
                  Agenda una nueva cita para tu paciente
                </p>
              </div>
            </div>

            <form onSubmit={crearNuevaCita} className="space-y-5">
              {/* Búsqueda de Paciente */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <UserCircle className="w-5 h-5 text-indigo-600" />
                  Buscar Paciente *
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, RUT o email..."
                    value={formNuevaCita.busqueda_paciente}
                    onChange={(e) =>
                      setFormNuevaCita((prev) => ({
                        ...prev,
                        busqueda_paciente: e.target.value,
                      }))
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required={!pacienteSeleccionado}
                  />
                  {buscandoPacientes && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600 animate-spin" />
                  )}
                </div>

                {/* Resultados de búsqueda */}
                {pacientesBuscados.length > 0 && !pacienteSeleccionado && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border-2 border-gray-200 bg-white shadow-lg custom-scrollbar">
                    {pacientesBuscados.map((paciente) => (
                      <div
                        key={paciente.id_paciente}
                        onClick={() => {
                          setPacienteSeleccionado(paciente);
                          setFormNuevaCita((prev) => ({
                            ...prev,
                            id_paciente: paciente.id_paciente.toString(),
                            busqueda_paciente: `${paciente.nombres} ${paciente.apellido_paterno}`,
                          }));
                        }}
                        className="p-3 hover:bg-indigo-50 cursor-pointer transition-all border-b border-gray-100 last:border-0 group"
                      >
                        <div className="flex items-center gap-3">
                          {paciente.foto_url ? (
                            <Image
                              src={paciente.foto_url}
                              alt={paciente.nombres}
                              width={48}
                              height={48}
                              className="rounded-xl object-cover border-2 border-gray-200 group-hover:border-indigo-300 transition-all"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-200 group-hover:border-indigo-300 transition-all">
                              <UserCircle className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">
                              {paciente.nombres} {paciente.apellido_paterno}{" "}
                              {paciente.apellido_materno}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                              <span>{paciente.rut}</span>
                              <span>•</span>
                              <span>{paciente.edad} años</span>
                              {paciente.telefono && (
                                <>
                                  <span>•</span>
                                  <span>{paciente.telefono}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Paciente seleccionado */}
                {pacienteSeleccionado && (
                  <div className="mt-2 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {pacienteSeleccionado.foto_url ? (
                          <Image
                            src={pacienteSeleccionado.foto_url}
                            alt={pacienteSeleccionado.nombres}
                            width={48}
                            height={48}
                            className="rounded-xl object-cover border-2 border-green-300"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center border-2 border-green-300">
                            <UserCircle className="w-8 h-8 text-green-700" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {pacienteSeleccionado.nombres}{" "}
                            {pacienteSeleccionado.apellido_paterno}{" "}
                            {pacienteSeleccionado.apellido_materno}
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                            <span>{pacienteSeleccionado.rut}</span>
                            <span>•</span>
                            <span>{pacienteSeleccionado.edad} años</span>
                            {pacienteSeleccionado.grupo_sanguineo && (
                              <>
                                <span>•</span>
                                <span className="text-red-600">
                                  {pacienteSeleccionado.grupo_sanguineo}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPacienteSeleccionado(null);
                          setFormNuevaCita((prev) => ({
                            ...prev,
                            id_paciente: "",
                            busqueda_paciente: "",
                          }));
                        }}
                        className="p-2 rounded-lg hover:bg-green-100 transition-all"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {pacienteSeleccionado.alergias && (
                      <div className="mt-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-xs font-bold text-yellow-900 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Alergias: {pacienteSeleccionado.alergias}
                        </p>
                      </div>
                    )}

                    {pacienteSeleccionado.enfermedades_cronicas && (
                      <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          Enfermedades crónicas: {pacienteSeleccionado.enfermedades_cronicas}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fecha y Hora + Duración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formNuevaCita.fecha_hora_inicio}
                    onChange={(e) =>
                      setFormNuevaCita((prev) => ({
                        ...prev,
                        fecha_hora_inicio: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Duración (minutos) *
                  </label>
                  <select
                    value={formNuevaCita.duracion_minutos}
                    onChange={(e) =>
                      setFormNuevaCita((prev) => ({
                        ...prev,
                        duracion_minutos: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora 30 min</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>

              {/* Tipo y Modalidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                    Tipo de Cita *
                  </label>
                  <select
                    value={formNuevaCita.tipo_cita}
                    onChange={(e) =>
                      setFormNuevaCita((prev) => ({
                        ...prev,
                        tipo_cita: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required
                  >
                    <option value="primera_vez">Primera vez</option>
                    <option value="control">Control</option>
                    <option value="procedimiento">Procedimiento</option>
                    <option value="urgencia">Urgencia</option>
                    <option value="telemedicina">Telemedicina</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <Video className="w-5 h-5 text-indigo-600" />
                    Modalidad *
                  </label>
                  <select
                    value={formNuevaCita.modalidad}
                    onChange={(e) =>
                      setFormNuevaCita((prev) => ({
                        ...prev,
                        modalidad: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required
                  >
                    <option value="presencial">Presencial</option>
                    <option value="telemedicina">Telemedicina</option>
                  </select>
                </div>
              </div>

              {/* Prioridad y Sala */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <AlertTriangle className="w-5 h-5 text-indigo-600" />
                    Prioridad *
                  </label>
                  <select
                    value={formNuevaCita.prioridad}
                    onChange={(e) =>
                      setFormNuevaCita((prev) => ({
                        ...prev,
                        prioridad: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    required
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
    <MapPin className="w-5 h-5 text-indigo-600" />
    Sala (opcional)
  </label>
  <select
    value={formNuevaCita.id_sala}
    onChange={(e) =>
      setFormNuevaCita((prev) => ({
        ...prev,
        id_sala: e.target.value,
      }))
    }
    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
  >
    <option value="">-- Selecciona una sala --</option>
    {salasCentro.map((sala) => (
      <option key={sala.id_sala} value={sala.id_sala}>
        {sala.nombre} {sala.tipo ? `(${sala.tipo})` : ""}
      </option>
    ))}
  </select>
</div>

              </div>

              {/* Monto */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  Monto (opcional)
                </label>
                <input
                  type="number"
                  placeholder="Ingresa el monto de la consulta..."
                  value={formNuevaCita.monto}
                  onChange={(e) =>
                    setFormNuevaCita((prev) => ({
                      ...prev,
                      monto: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  min="0"
                  step="1000"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Motivo de la Consulta *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe el motivo de la consulta..."
                  value={formNuevaCita.motivo}
                  onChange={(e) =>
                    setFormNuevaCita((prev) => ({
                      ...prev,
                      motivo: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Notas Privadas */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  Notas Privadas (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas internas solo visibles para el equipo médico..."
                  value={formNuevaCita.notas}
                  onChange={(e) =>
                    setFormNuevaCita((prev) => ({
                      ...prev,
                      notas: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalNuevaCita(false);
                    resetFormularioNuevaCita();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actualizandoEstado || !pacienteSeleccionado}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actualizandoEstado ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cita
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL DETALLES DE CITA
          ======================================== */}
      {mostrarDetallesCita && citaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-white border-2 border-gray-200 shadow-2xl p-5 sm:p-8 relative animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setMostrarDetallesCita(false);
                setCitaSeleccionada(null);
              }}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-gray-100 transition-all group z-10"
            >
              <X className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 pr-12">
              <div className="flex items-center gap-4">
                {citaSeleccionada.paciente_foto ? (
                  <Image
                    src={citaSeleccionada.paciente_foto}
                    alt={citaSeleccionada.paciente_nombre}
                    width={80}
                    height={80}
                    className="rounded-2xl object-cover border-2 border-gray-200 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-200 shadow-lg">
                    <UserCircle className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">
                    {citaSeleccionada.paciente_nombre}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold mb-2">
                    {citaSeleccionada.paciente_rut && (
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {citaSeleccionada.paciente_rut}
                      </span>
                    )}
                    {citaSeleccionada.paciente_edad && (
                      <>
                        <span>•</span>
                        <span>{citaSeleccionada.paciente_edad} años</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorEstado(
                        citaSeleccionada.estado
                      )}`}
                    >
                      {citaSeleccionada.estado.replace("_", " ").toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${obtenerColorPrioridad(
                        citaSeleccionada.prioridad
                      )}`}
                    >
                      {citaSeleccionada.prioridad.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <p className="text-xs font-bold text-gray-600">FECHA Y HORA</p>
                </div>
                <p className="text-lg font-black text-gray-900">
                  {formatearFecha(citaSeleccionada.fecha_hora_inicio)}
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatearHora(citaSeleccionada.fecha_hora_inicio)} -{" "}
                  {formatearHora(citaSeleccionada.fecha_hora_fin)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-xs font-bold text-gray-600">DURACIÓN</p>
                </div>
                <p className="text-lg font-black text-gray-900">
                  {formatearDuracion(citaSeleccionada.duracion_minutos)}
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {citaSeleccionada.tipo_cita.replace("_", " ")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  {citaSeleccionada.modalidad === "telemedicina" ? (
                    <Video className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Users className="w-5 h-5 text-blue-600" />
                  )}
                  <p className="text-xs font-bold text-gray-600">MODALIDAD</p>
                </div>
                <p className="text-lg font-black text-gray-900">
                  {citaSeleccionada.modalidad === "telemedicina" ? "Telemedicina" : "Presencial"}
                </p>
                {citaSeleccionada.sala && (
                  <p className="text-sm font-semibold text-gray-700">{citaSeleccionada.sala}</p>
                )}
              </div>

              {citaSeleccionada.monto && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <p className="text-xs font-bold text-gray-600">MONTO</p>
                  </div>
                  <p className="text-lg font-black text-gray-900">
                    {formatearMoneda(citaSeleccionada.monto)}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {citaSeleccionada.pagada ? "Pagado" : "Pendiente de pago"}
                  </p>
                </div>
              )}
            </div>

            {/* Motivo */}
            {citaSeleccionada.motivo && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <p className="text-xs font-bold text-gray-600">MOTIVO DE LA CONSULTA</p>
                </div>
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  {citaSeleccionada.motivo}
                </p>
              </div>
            )}

            {/* Notas Privadas */}
            {citaSeleccionada.notas_privadas && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-yellow-600" />
                  <p className="text-xs font-bold text-yellow-900">NOTAS PRIVADAS</p>
                </div>
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  {citaSeleccionada.notas_privadas}
                </p>
              </div>
            )}

           {/* Información de Contacto */}
<div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
  <p className="text-xs font-bold text-gray-600 mb-3">INFORMACIÓN DE CONTACTO</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {citaSeleccionada.paciente_telefono && (
      <a
        href={`tel:${citaSeleccionada.paciente_telefono}`}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-all group"
      >
        <Phone className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-semibold text-gray-900">
          {citaSeleccionada.paciente_telefono}
        </span>
      </a>
    )}

    {citaSeleccionada.paciente_email && (
      <a
        href={`mailto:${citaSeleccionada.paciente_email}`}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-all group"
      >
        <Mail className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-semibold text-gray-900 truncate">
          {citaSeleccionada.paciente_email}
        </span>
      </a>
    )}
  </div>
</div>


            {/* Badges de Estado */}
            <div className="mb-6 flex flex-wrap gap-2">
              {citaSeleccionada.confirmado_por_paciente && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">Confirmado por paciente</span>
                </div>
              )}
              {citaSeleccionada.confirmacion_enviada && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200">
                  <Send className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-cyan-900">
                    Confirmación enviada
                  </span>
                </div>
              )}
              {citaSeleccionada.recordatorio_enviado && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-purple-900">Recordatorio enviado</span>
                </div>
              )}
              {citaSeleccionada.pagada && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-900">Pagado</span>
                </div>
              )}
              {citaSeleccionada.tipo_cita === "primera_vez" && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200">
                  <Star className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-cyan-900">Primera vez</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              {/* Acciones Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {citaSeleccionada.modalidad === "telemedicina" &&
                  citaSeleccionada.sesion_telemedicina && (
                    <button
                      onClick={() => {
                        window.open(`/medico/telemedicina/${citaSeleccionada.id_cita}`, "_blank");
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Video className="w-5 h-5" />
                      Iniciar Videollamada
                    </button>
                  )}

                <button
                  onClick={() => {
                    router.push(`/medico/consultas/nueva?cita=${citaSeleccionada.id_cita}`);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  Atender Consulta
                </button>
              </div>

              {/* Cambios de Estado */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {citaSeleccionada.estado === "programada" && (<button
                    onClick={() => confirmarCita(citaSeleccionada.id_cita)}
                    disabled={actualizandoEstado}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirmar
                  </button>
                )}

                {citaSeleccionada.estado === "confirmada" && (
                  <button
                    onClick={() =>
                      actualizarEstadoCita(citaSeleccionada.id_cita, "en_sala_espera")
                    }
                    disabled={actualizandoEstado}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    En Espera
                  </button>
                )}

                {citaSeleccionada.estado === "en_sala_espera" && (
                  <button
                    onClick={() =>
                      actualizarEstadoCita(citaSeleccionada.id_cita, "en_atencion")
                    }
                    disabled={actualizandoEstado}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50"
                  >
                    <Activity className="w-4 h-4" />
                    Atendiendo
                  </button>
                )}

                {citaSeleccionada.estado === "en_atencion" && (
                  <button
                    onClick={() => actualizarEstadoCita(citaSeleccionada.id_cita, "completada")}
                    disabled={actualizandoEstado}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Completar
                  </button>
                )}
              </div>

              {/* Acciones Secundarias */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {!citaSeleccionada.recordatorio_enviado && (
                  <button
                    onClick={() => enviarRecordatorio(citaSeleccionada.id_cita)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-xs transition-all hover:scale-105"
                  >
                    <Bell className="w-4 h-4" />
                    Recordar
                  </button>
                )}

                <button
                  onClick={() => {
                    setMostrarDetallesCita(false);
                    setMostrarModalEditarCita(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg font-bold text-xs transition-all hover:scale-105"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Cita: ${citaSeleccionada.paciente_nombre} - ${formatearFecha(
                        citaSeleccionada.fecha_hora_inicio
                      )} ${formatearHora(citaSeleccionada.fecha_hora_inicio)}`
                    );
                    mostrarNotificacion("success", "Información copiada al portapapeles");
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 rounded-lg font-bold text-xs transition-all hover:scale-105"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-bold text-xs transition-all hover:scale-105"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
              </div>

              {/* Acciones Críticas */}
              {citaSeleccionada.estado !== "cancelada" &&
                citaSeleccionada.estado !== "completada" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setMostrarDetallesCita(false);
                        // Aquí se abriría el modal de reprogramar
                        const nuevaFecha = prompt(
                          "Nueva fecha y hora (YYYY-MM-DDTHH:mm):",
                          citaSeleccionada.fecha_hora_inicio.slice(0, 16)
                        );
                        if (nuevaFecha) {
                          reprogramarCita(citaSeleccionada.id_cita, nuevaFecha);
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Reprogramar Cita
                    </button>

                    <button
                      onClick={() => {
                        setMostrarDetallesCita(false);
                        setMostrarModalCancelar(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancelar Cita
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL CANCELAR CITA - ULTRA PREMIUM
          ======================================== */}
      {mostrarModalCancelar && citaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white border-2 border-red-200 shadow-2xl p-5 sm:p-8 relative animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setMostrarModalCancelar(false);
                resetFormularioCancelacion();
              }}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-gray-100 transition-all group z-10"
            >
              <X className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Cancelar Cita</h3>
                <p className="text-sm text-gray-600 font-semibold">
                  ¿Estás seguro de cancelar esta cita?
                </p>
              </div>
            </div>

            {/* Información de la cita */}
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <div className="flex items-start gap-3">
                {citaSeleccionada.paciente_foto ? (
                  <Image
                    src={citaSeleccionada.paciente_foto}
                    alt={citaSeleccionada.paciente_nombre}
                    width={60}
                    height={60}
                    className="rounded-xl object-cover border-2 border-red-300"
                  />
                ) : (
                  <div className="w-15 h-15 rounded-xl bg-gradient-to-br from-red-200 to-pink-300 flex items-center justify-center border-2 border-red-300">
                    <UserCircle className="w-10 h-10 text-red-700" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg font-black text-gray-900 mb-1">
                    {citaSeleccionada.paciente_nombre}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {formatearFecha(citaSeleccionada.fecha_hora_inicio)}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatearHora(citaSeleccionada.fecha_hora_inicio)} -{" "}
                    {formatearHora(citaSeleccionada.fecha_hora_fin)}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                cancelarCita();
              }}
              className="space-y-5"
            >
              {/* Tipo de Cancelación */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Motivo de Cancelación *
                </label>
                <select
                  value={tipoCancelacion}
                  onChange={(e) => setTipoCancelacion(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  required
                >
                  <option value="paciente_solicita">Paciente solicita cancelación</option>
                  <option value="medico_no_disponible">Médico no disponible</option>
                  <option value="error_programacion">Error en la programación</option>
                  <option value="reprogramacion">Reprogramación</option>
                  <option value="otro">Otro motivo</option>
                </select>
              </div>

              {/* Detalle del Motivo */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <FileText className="w-5 h-5 text-red-600" />
                  Detalle del Motivo *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explica detalladamente el motivo de la cancelación..."
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Aplicar Cobro */}
              <div className="p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="aplicarCobro"
                    checked={aplicarCobro}
                    onChange={(e) => setAplicarCobro(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-yellow-400 text-yellow-600 focus:ring-2 focus:ring-yellow-500/50 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="aplicarCobro"
                      className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2"
                    >
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      Aplicar cobro por cancelación
                    </label>
                    <p className="text-xs text-gray-600 font-semibold mt-1">
                      Según la política de cancelación del centro médico
                    </p>
                  </div>
                </div>

                {aplicarCobro && (
                  <div className="mt-3">
                    <label className="text-xs font-bold text-gray-900 mb-1.5 block">
                      Monto del Cobro
                    </label>
                    <input
                      type="number"
                      placeholder="Ingresa el monto..."
                      value={montoCobro}
                      onChange={(e) => setMontoCobro(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border-2 border-yellow-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                      min="0"
                      step="1000"
                      required={aplicarCobro}
                    />
                  </div>
                )}
              </div>

              {/* Advertencia */}
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900 mb-1">
                      ¡Atención! Esta acción no se puede deshacer
                    </p>
                    <p className="text-xs text-red-700 font-semibold">
                      Se enviará una notificación al paciente informando sobre la cancelación. Si
                      deseas reprogramar, cancela primero y luego crea una nueva cita.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalCancelar(false);
                    resetFormularioCancelacion();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-md"
                >
                  No, Mantener Cita
                </button>
                <button
                  type="submit"
                  disabled={actualizandoEstado}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actualizandoEstado ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Sí, Cancelar Cita
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL BLOQUEAR HORARIO - ULTRA PREMIUM
          ======================================== */}
      {mostrarModalBloquearHorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white border-2 border-gray-200 shadow-2xl p-5 sm:p-8 relative animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setMostrarModalBloquearHorario(false)}
              className="absolute right-4 top-4 p-2 rounded-xl hover:bg-gray-100 transition-all group z-10"
            >
              <X className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Lock className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Bloquear Horario</h3>
                <p className="text-sm text-gray-600 font-semibold">
                  Marca un período como no disponible para citas
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const inicio = new Date(formData.get("fecha_inicio") as string);
                const fin = new Date(formData.get("fecha_fin") as string);
                const motivo = formData.get("motivo") as string;
                const tipo = formData.get("tipo") as string;
                bloquearHorario(inicio, fin, motivo, tipo);
              }}
              className="space-y-5"
            >
              {/* Rango de Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Fecha y Hora de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Fecha y Hora de Fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Tipo de Bloqueo */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <Tag className="w-5 h-5 text-orange-600" />
                  Tipo de Bloqueo *
                </label>
                <select
                  name="tipo"
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  required
                >
                  <option value="vacaciones">Vacaciones</option>
                  <option value="reunion">Reunión</option>
                  <option value="personal">Asunto Personal</option>
                  <option value="emergencia">Emergencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-black text-gray-900">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Motivo del Bloqueo *
                </label>
                <textarea
                  rows={3}
                  name="motivo"
                  placeholder="Describe el motivo del bloqueo de horario..."
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                  required
                ></textarea>
              </div>

              {/* Información */}
              <div className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-900 mb-1">
                      Información importante
                    </p>
                    <p className="text-xs text-orange-700 font-semibold">
                      Durante este período, no se podrán agendar nuevas citas. Las citas ya
                      existentes en este rango deberán ser reprogramadas manualmente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModalBloquearHorario(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Bloquear Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          SISTEMA DE NOTIFICACIONES PREMIUM
          ======================================== */}
      <div className="fixed top-4 right-4 z-[60] space-y-2 max-w-sm w-full pointer-events-none">
        {notificaciones.map((notif) => {
          const iconos = {
            success: CheckCircle2,
            error: XCircle,
            warning: AlertTriangle,
            info: Info,
          };
          const colores = {
            success: "from-green-500 to-emerald-500",
            error: "from-red-500 to-rose-500",
            warning: "from-yellow-500 to-orange-500",
            info: "from-blue-500 to-cyan-500",
          };
          const IconoNotif = iconos[notif.tipo];

          return (
            <div
              key={notif.id}
              className="pointer-events-auto animate-slideInRight p-4 rounded-xl bg-white border-2 border-gray-200 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colores[notif.tipo]} flex items-center justify-center flex-shrink-0`}
                >
                  <IconoNotif className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {notif.mensaje}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotificaciones((prev) => prev.filter((n) => n.id !== notif.id))
                  }
                  className="p-1 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================
          ESTILOS GLOBALES PREMIUM
          ======================================== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Scrollbar personalizado premium */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #818cf8, #6366f1);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #6366f1, #4f46e5);
        }

        /* Evitar zoom en inputs en móviles */
        @media (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }

        /* Transiciones suaves para todos los elementos */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill,
            stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        /* Efectos de gradiente animado */
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

        /* Skeleton loaders */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            to right,
            #f0f0f0 0%,
            #e0e0e0 20%,
            #f0f0f0 40%,
            #f0f0f0 100%
          );
          background-size: 1000px 100%;
        }

        /* Focus visible mejorado */
        *:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        /* Mejoras de accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }

        /* Mejoras de rendimiento */
        .gpu-accelerated {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Backdrop blur fallback */
        @supports not (backdrop-filter: blur(10px)) {
          .backdrop-blur-md {
            background-color: rgba(0, 0, 0, 0.8) !important;
          }
        }

        /* Grid responsive avanzado */
        .grid-auto-fit {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .grid-auto-fill {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }

        /* Truncate text con tooltip */
        .truncate-with-tooltip {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .truncate-with-tooltip:hover::after {
          content: attr(data-full-text);
          position: absolute;
          z-index: 1000;
          background: #1f2937;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          white-space: normal;
          max-width: 300px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }

        /* Efectos de cristal (glassmorphism) */
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .glass-dark {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Efectos de neumorfismo */
        .neumorphism {
          background: #e0e5ec;
          box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6),
            -9px -9px 16px rgba(255, 255, 255, 0.5);
        }

        .neumorphism-inset {
          background: #e0e5ec;
          box-shadow: inset 6px 6px 10px 0 rgba(0, 0, 0, 0.2),
            inset -6px -6px 10px 0 rgba(255, 255, 255, 0.5);
        }

        /* Scroll snap para vistas */
        .scroll-snap-container {
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .scroll-snap-item {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        /* Loading spinner premium */
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }

        .spinner-circle {
          animation: rotate 2s linear infinite;
        }

        .spinner-path {
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        /* Transiciones de página */
        .page-transition-enter {
          opacity: 0;
          transform: translateY(20px);
        }

        .page-transition-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }

        .page-transition-exit {
          opacity: 1;
          transform: translateY(0);
        }

        .page-transition-exit-active {
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 300ms, transform 300ms;
        }

        /* Efectos de partículas */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .floating {
          animation: float 3s ease-in-out infinite;
        }

        /* Mejoras de contraste para accesibilidad */
        @media (prefers-contrast: high) {
          * {
            border-color: currentColor !important;
          }
        }

        /* Modo oscuro (si se implementa) */
        @media (prefers-color-scheme: dark) {
          :root {
            color-scheme: dark;
          }
        }
      `}</style>
    </MedicoLayout>
  );
}