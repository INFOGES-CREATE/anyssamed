"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Wrench,
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
  Package,
  Truck,
  Wallet,
  Receipt,
  GitBranch,
  BookOpen,
  Trash2,
  Edit,
  Copy,
  Share,
  MoreHorizontal,
  ChevronUp,
  ChevronLeft,
  AlertCircleIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";

// ========================================
// TIPOS DE DATOS AVANZADOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green" | "orange" | "red";

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

interface UsuarioAdmin {
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
  administrativo?: {
    id_administrativo: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    cargo: string;
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
      rut: string;
      razon_social: string;
      telefono_principal: string;
      email_contacto: string;
      sitio_web: string | null;
      especializacion_principal: string | null;
      nivel_complejidad: "baja" | "media" | "alta";
      capacidad_pacientes_dia: number | null;
      estado: "activo" | "inactivo" | "suspendido";
    };
  };
}

interface EstadisticasAdmin {
  total_pacientes: number;
  pacientes_activos: number;
  pacientes_nuevos_mes: number;
  pacientes_nuevos_semana: number;
  pacientes_por_atender_hoy: number;
  total_citas_mes: number;
  citas_programadas_hoy: number;
  citas_confirmadas_hoy: number;
  citas_canceladas_mes: number;
  tasa_confirmacion_mes: number;
  tasa_no_asistencia: number;
  total_medicos: number;
  medicos_activos: number;
  medicos_disponibles_ahora: number;
  medicos_en_consulta: number;
  carga_promedio_medicos: number;
  total_facturado_mes: number;
  total_cobrado_mes: number;
  total_pendiente_cobro: number;
  numero_facturas_mes: number;
  tasa_cobranza: number;
  ingresos_hoy: number;
  total_medicamentos: number;
  medicamentos_bajo_stock: number;
  medicamentos_vencidos: number;
  medicamentos_proximos_vencer: number;
  valor_inventario_total: number;
  total_examenes_mes: number;
  examenes_pendientes: number;
  examenes_completados_mes: number;
  examenes_pendientes_resultado: number;
  total_empleados: number;
  empleados_activos: number;
  empleados_en_vacaciones: number;
  empleados_suspendidos: number;
  ocupacion_camas: number | null;
  salas_disponibles: number;
  salas_ocupadas: number;
  llamadas_realizadas_hoy: number;
  mensajes_sin_leer: number;
}

interface Factura {
  id_factura: number;
  numero_factura: string;
  fecha_emision: string;
  estado: "emitida" | "pagada" | "anulada" | "vencida" | "parcial" | "en_revision" | "pendiente";
  subtotal: number;
  impuestos: number;
  total: number;
  pagado: number;
  saldo: number;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    rut: string;
  };
  medico: {
    id_medico: number;
    nombre_completo: string;
  };
}

interface Medicamento {
  id_medicamento: number;
  nombre_generico: string;
  nombre_comercial: string | null;
  forma_farmaceutica: string;
  concentracion: string;
  stock_actual: number;
  stock_minimo: number;
  precio_unitario: number;
  valor_total: number;
  estado: "disponible" | "bajo_stock" | "agotado" | "proximo_vencer" | "vencido";
}

interface Examen {
  id_examen: number;
  nombre_examen: string;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
  };
  medico: {
    id_medico: number;
    nombre_completo: string;
  };
  fecha_solicitud: string;
  estado_resultado: "pendiente" | "en_proceso" | "listo" | "entregado" | "anulado";
  tipo_examen: "laboratorio" | "imagenologia" | "procedimiento" | "otros";
}

interface Empleado {
  id_usuario: number;
  nombre_completo: string;
  cargo: string;
  departamento: string;
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  email: string;
  telefono: string;
  fecha_contratacion: string;
}

interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: "info" | "warning" | "error" | "success";
  timestamp: Date;
  leida: boolean;
  icono: any;
}

interface GraficoData {
  nombre: string;
  valor: number;
  color?: string;
}

// ========================================
// CONFIGURACIONES DE TEMAS PREMIUM
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
  orange: {
    nombre: "Naranja Energía",
    icono: Flame,
    colores: {
      fondo: "from-orange-950 via-amber-950 to-yellow-950",
      fondoSecundario: "bg-orange-900",
      texto: "text-white",
      textoSecundario: "text-orange-300",
      primario: "bg-orange-600 hover:bg-orange-700",
      secundario: "bg-amber-800 hover:bg-amber-700",
      acento: "text-orange-400",
      borde: "border-orange-800",
      sombra: "shadow-2xl shadow-orange-500/20",
      gradiente: "from-orange-500 via-amber-500 to-yellow-500",
      sidebar: "bg-orange-900/95 backdrop-blur-xl border-orange-800",
      header: "bg-orange-900/80 backdrop-blur-xl border-orange-800",
      card: "bg-orange-800/50 border-orange-700 hover:border-orange-500/50",
      hover: "hover:bg-orange-800",
    },
  },
  red: {
    nombre: "Rojo Crítico",
    icono: AlertTriangle,
    colores: {
      fondo: "from-red-950 via-rose-950 to-pink-950",
      fondoSecundario: "bg-red-900",
      texto: "text-white",
      textoSecundario: "text-red-300",
      primario: "bg-red-600 hover:bg-red-700",
      secundario: "bg-rose-800 hover:bg-rose-700",
      acento: "text-red-400",
      borde: "border-red-800",
      sombra: "shadow-2xl shadow-red-500/20",
      gradiente: "from-red-500 via-rose-500 to-pink-500",
      sidebar: "bg-red-900/95 backdrop-blur-xl border-red-800",
      header: "bg-red-900/80 backdrop-blur-xl border-red-800",
      card: "bg-red-800/50 border-red-700 hover:border-red-500/50",
      hover: "hover:bg-red-800",
    },
  },
};

// ========================================
// GENERADOR DE DATOS DINÁMICOS
// ========================================

const generarDatosGrafico = (dias: number = 7): any[] => {
  const datos = [];
  const hoy = new Date();

  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const dia = fecha.toLocaleDateString("es-CL", { weekday: "short" });

    datos.push({
      dia,
      ingresos: Math.floor(Math.random() * 80000) + 20000,
      cobrado: Math.floor(Math.random() * 70000) + 20000,
      pendiente: Math.floor(Math.random() * 15000) + 1000,
      solicitados: Math.floor(Math.random() * 50) + 20,
      completados: Math.floor(Math.random() * 45) + 15,
      pendientes: Math.floor(Math.random() * 10) + 5,
    });
  }

  return datos;
};

const generarDatosOcupacion = (): any[] => {
  const datos = [];
  let ocupacion = 45;

  for (let i = 8; i <= 17; i++) {
    ocupacion += Math.floor(Math.random() * 20) - 5;
    ocupacion = Math.max(20, Math.min(100, ocupacion));

    datos.push({
      hora: `${i}:00`,
      ocupacion,
    });
  }

  return datos;
};

const generarDistribucionPacientes = (): any[] => {
  const tipos = ["Consulta Externa", "Hospitalización", "Urgencia", "Telemedicina"];
  const colores = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  return tipos.map((nombre, index) => ({
    nombre,
    valor: Math.floor(Math.random() * 50) + 10,
    color: colores[index],
  }));
};

const generarRendimientoMedicos = (): any[] => {
  const medicos = [
    "Dr. García",
    "Dra. López",
    "Dr. Martínez",
    "Dra. Rodríguez",
    "Dr. Sánchez",
  ];

  return medicos.map((medico) => ({
    medico,
    citas: Math.floor(Math.random() * 15) + 20,
    satisfaccion: Math.floor(Math.random() * 10) + 90,
    ingresos: Math.floor(Math.random() * 1000000) + 2000000,
  }));
};

// ========================================
// COMPONENTE PRINCIPAL PREMIUM
// ========================================

export default function DashboardAdminPage() {
  // ========================================
  // ESTADOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [filtroFactura, setFiltroFactura] = useState<string>("todas");
  const [filtroMedicamento, setFiltroMedicamento] = useState<string>("todos");
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [datosGrafico, setDatosGrafico] = useState<any[]>([]);
  const [datosOcupacion, setDatosOcupacion] = useState<any[]>([]);
  const [distribucionPacientes, setDistribucionPacientes] = useState<any[]>([]);
  const [rendimientoMedicos, setRendimientoMedicos] = useState<any[]>([]);

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ DE NAVEGACIÓN DINÁMICO
  // ========================================

  const menuItems = useMemo(
    () => [
      {
        titulo: "Dashboard",
        icono: Home,
        url: "/administrativo",
        activo: seccionActiva === "dashboard",
      },
      {
        titulo: "Gestión de Pacientes",
        icono: Users,
        url: "/administrativo/pacientes",
        badge: estadisticas?.pacientes_nuevos_mes || 0,
        submenu: [
          { titulo: "Todos los Pacientes", icono: Users, url: "/administrativo/pacientes" },
          { titulo: "Nuevo Paciente", icono: UserPlus, url: "/administrativo/pacientes/nuevo" },
          { titulo: "Búsqueda Avanzada", icono: Search, url: "/administrativo/pacientes/buscar" },
          { titulo: "Segmentación", icono: Layers, url: "/administrativo/pacientes/segmentacion" },
        ],
      },
      {
        titulo: "Citas y Agenda",
        icono: Calendar,
        url: "/administrativo/citas",
        badge: estadisticas?.citas_programadas_hoy || 0,
        submenu: [
          { titulo: "Calendario", icono: Calendar, url: "/administrativo/citas/calendario" },
          { titulo: "Todas las Citas", icono: CalendarDays, url: "/administrativo/citas" },
          { titulo: "Reportes", icono: BarChart3, url: "/administrativo/citas/reportes" },
          { titulo: "Configuración", icono: Settings, url: "/administrativo/citas/config" },
        ],
      },
      {
        titulo: "Médicos y Personal",
        icono: Stethoscope,
        url: "/administrativo/medicos",
        badge: estadisticas?.medicos_activos || 0,
        submenu: [
          { titulo: "Médicos", icono: Stethoscope, url: "/administrativo/medicos" },
          { titulo: "Administrativos", icono: UserCog, url: "/administrativo/administrativos" },
          { titulo: "Secretarias", icono: Users, url: "/administrativo/secretarias" },
          { titulo: "Técnicos", icono: Wrench, url: "/administrativo/tecnicos" },
          { titulo: "Horarios", icono: Clock, url: "/administrativo/horarios" },
          { titulo: "Disponibilidad", icono: CalendarCheck, url: "/administrativo/disponibilidad" },
        ],
      },
      {
        titulo: "Facturación",
        icono: DollarSign,
        url: "/administrativo/facturacion",
        badge: estadisticas?.total_pendiente_cobro ? 1 : 0,
        submenu: [
          { titulo: "Facturas", icono: Receipt, url: "/administrativo/facturacion/facturas" },
          { titulo: "Cobros", icono: CreditCard, url: "/administrativo/facturacion/cobros" },
          { titulo: "Reportes", icono: BarChart3, url: "/administrativo/facturacion/reportes" },
          { titulo: "Configuración", icono: Settings, url: "/administrativo/facturacion/config" },
        ],
      },
      {
        titulo: "Farmacia e Inventario",
        icono: Pill,
        url: "/administrativo/farmacia",
        badge: estadisticas?.medicamentos_bajo_stock || 0,
        submenu: [
          { titulo: "Medicamentos", icono: Pill, url: "/administrativo/farmacia/medicamentos" },
          { titulo: "Inventario", icono: Package, url: "/administrativo/farmacia/inventario" },
          { titulo: "Proveedores", icono: Truck, url: "/administrativo/farmacia/proveedores" },
          { titulo: "Lotes", icono: Layers, url: "/administrativo/farmacia/lotes" },
          { titulo: "Alertas", icono: AlertCircle, url: "/administrativo/farmacia/alertas" },
        ],
      },
      {
        titulo: "Exámenes y Laboratorio",
        icono: Microscope,
        url: "/administrativo/examenes",
        badge: estadisticas?.examenes_pendientes || 0,
        submenu: [
          { titulo: "Órdenes", icono: ClipboardList, url: "/administrativo/examenes/ordenes" },
          { titulo: "Resultados", icono: CheckCircle2, url: "/administrativo/examenes/resultados" },
          { titulo: "Laboratorios", icono: Building2, url: "/administrativo/examenes/laboratorios" },
          { titulo: "Tipos", icono: Layers, url: "/administrativo/examenes/tipos" },
        ],
      },
      {
        titulo: "Centros y Sucursales",
        icono: Building2,
        url: "/administrativo/centros",
        submenu: [
          { titulo: "Mi Centro", icono: Building2, url: "/administrativo/centros/principal" },
          { titulo: "Sucursales", icono: MapPin, url: "/administrativo/centros/sucursales" },
          { titulo: "Salas", icono: Layers, url: "/administrativo/centros/salas" },
          { titulo: "Departamentos", icono: Briefcase, url: "/administrativo/centros/departamentos" },
          { titulo: "Horarios", icono: Clock, url: "/administrativo/centros/horarios" },
        ],
      },
      {
        titulo: "Reportes y Análisis",
        icono: BarChart3,
        url: "/administrativo/reportes",
        submenu: [
          { titulo: "Dashboard", icono: Home, url: "/administrativo/reportes/dashboard" },
          { titulo: "Financiero", icono: DollarSign, url: "/administrativo/reportes/financiero" },
          { titulo: "Operativo", icono: Activity, url: "/administrativo/reportes/operativo" },
          { titulo: "Clínico", icono: HeartPulse, url: "/administrativo/reportes/clinico" },
          { titulo: "Personalizado", icono: Settings, url: "/administrativo/reportes/personalizado" },
        ],
      },
      {
        titulo: "Configuración",
        icono: Settings,
        url: "/administrativo/configuracion",
        submenu: [
          { titulo: "General", icono: Settings, url: "/administrativo/configuracion/general" },
          { titulo: "Usuarios", icono: Users, url: "/administrativo/configuracion/usuarios" },
          { titulo: "Roles y Permisos", icono: Shield, url: "/administrativo/configuracion/roles" },
          { titulo: "Integraciones", icono: Cloud, url: "/administrativo/configuracion/integraciones" },
          { titulo: "Seguridad", icono: Lock, url: "/administrativo/configuracion/seguridad" },
          { titulo: "Temas", icono: Sparkles, url: "/administrativo/configuracion/temas" },
        ],
      },
    ],
    [seccionActiva, estadisticas]
  );

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (usuario?.administrativo) {
      cargarDatosDashboard();
    }
  }, [usuario]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.administrativo) {
        cargarDatosDashboard();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarDatosIniciales = useCallback(() => {
    setDatosGrafico(generarDatosGrafico(7));
    setDatosOcupacion(generarDatosOcupacion());
    setDistribucionPacientes(generarDistribucionPacientes());
    setRendimientoMedicos(generarRendimientoMedicos());

    // Generar notificaciones iniciales
    const notificacionesIniciales: Notificacion[] = [
      {
        id: "1",
        titulo: "Medicamento Bajo Stock",
        descripcion: "Amoxicilina 500mg requiere reorden",
        tipo: "warning",
        timestamp: new Date(),
        leida: false,
        icono: AlertTriangle,
      },
      {
        id: "2",
        titulo: "Factura Vencida",
        descripcion: "Factura #2024-001 vencida hace 5 días",
        tipo: "error",
        timestamp: new Date(Date.now() - 3600000),
        leida: false,
        icono: AlertOctagon,
      },
      {
        id: "3",
        titulo: "Examen Completado",
        descripcion: "Resultado de laboratorio listo para entregar",
        tipo: "success",
        timestamp: new Date(Date.now() - 7200000),
        leida: true,
        icono: CheckCircle,
      },
    ];

    setNotificaciones(notificacionesIniciales);
  }, []);

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

        const tieneRolAdmin = rolesUsuario.some((rol) =>
          rol.includes("ADMINISTRATIVO")
        );

        if (!tieneRolAdmin) {
          alert(
            `Acceso denegado. Este panel es solo para administradores. Tus roles: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.administrativo) {
          alert(
            "Tu usuario tiene rol de ADMINISTRADOR pero no está vinculado a un registro administrativo."
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
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosDashboard = async () => {
  if (!usuario?.administrativo?.id_centro) return;

  try {
    setLoadingData(true);

    const res = await fetch(
      `/api/administrativo/dashboard`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("Error en dashboard:", data);
      return;
    }

    // Actualizar estados con los datos de la API
    setEstadisticas(data.estadisticas || null);
    setFacturas(data.facturas || []);
    setMedicamentos(data.medicamentos || []);
    setExamenes(data.examenes || []);
    setEmpleados(data.empleados || []);

  } catch (err) {
    console.error("Error al cargar dashboard:", err);
  } finally {
    setLoadingData(false);
  }
};


  // ========================================
  // FUNCIONES AUXILIARES
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

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const formatearPorcentaje = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green", "orange", "red"].includes(temaActual);
    const colores: { [key: string]: string } = {
      activo: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      pagada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelada: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      listo: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      en_proceso: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerIconoTendencia = (tendencia: string) => {
    if (tendencia === "up")
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (tendencia === "down")
      return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
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
      localStorage.setItem("tema_admin", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar preferencia:", err);
    }
  };

  const marcarNotificacionLeida = (id: string) => {
    setNotificaciones(
      notificaciones.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      )
    );
  };

  // ========================================
  // RENDER - LOADING
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
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Iniciando Panel
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tu panel administrativo...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.administrativo) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso Denegado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a este panel
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - DASHBOARD COMPLETO PREMIUM
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* ========================================
          SIDEBAR PREMIUM
          ======================================== */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    v4.0.0 PRO
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Building2 className="w-6 h-6 text-white" />
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
                    <div className="mt-2 ml-4 space-y-1 animate-slideInUp">
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

          {/* Usuario Info */}
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
                    Administrador
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
    HEADER PREMIUM
    ======================================== */}
<header
  className={`fixed top-0 right-0 z-40 transition-all duration-500 ${
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
          placeholder="Buscar paciente, factura, medicamento, médico..."
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

    {/* Acciones */}
    <div className="flex items-center gap-3 ml-6">
      {/* Selector de Temas */}
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
              {notificaciones.filter((n) => !n.leida).length}
            </span>
          )}
        </button>

        {notificacionesAbiertas && (
          <div
            className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50 max-h-96 overflow-y-auto custom-scrollbar`}
          >
            <h3 className={`text-lg font-black mb-4 ${tema.colores.texto}`}>
              Notificaciones
            </h3>

            {notificaciones.length === 0 ? (
              <p className={`text-center py-8 ${tema.colores.textoSecundario}`}>
                No hay notificaciones
              </p>
            ) : (
              <div className="space-y-2">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg ${tema.colores.secundario} cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      notif.leida ? "opacity-60" : ""
                    }`}
                    onClick={() => marcarNotificacionLeida(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notif.tipo === "error"
                            ? "bg-red-500/20"
                            : notif.tipo === "warning"
                            ? "bg-yellow-500/20"
                            : notif.tipo === "success"
                            ? "bg-green-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        <notif.icono className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-bold text-sm ${tema.colores.texto}`}
                        >
                          {notif.titulo}
                        </h4>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario} truncate`}
                        >
                          {notif.descripcion}
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario} mt-1`}
                        >
                          {notif.timestamp.toLocaleTimeString("es-CL")}
                        </p>
                      </div>

                      {!notif.leida && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
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
              Administrador
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
        </button>

        {perfilAbierto && (
          <div
            className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50 animate-slideInUp`}
          >
            {/* Header del Perfil */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}
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
                  Administrador
                </p>
                <p
                  className={`text-xs font-medium ${tema.colores.textoSecundario} truncate`}
                >
                  {usuario.administrativo?.centro?.nombre ?? "Centro no definido"}
                </p>
              </div>
            </div>

            {/* Opciones del Perfil */}
            <div className="space-y-1">
              <Link
                href="/administrativo/perfil"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </Link>
              <Link
                href="/administrativo/configuracion"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
              >
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </Link>
              <button
                onClick={cerrarSesion}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400 hover:scale-105`}
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
          CONTENIDO PRINCIPAL PREMIUM
          ======================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Saludo Premium */}
        <div className="mb-8 animate-slideInUp">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">👋</span>
              </h2>
              <p
                className={`text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                {usuario?.administrativo?.centro?.nombre ?? "Centro no definido"} •{" "}
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={() => cargarDatosDashboard()}
              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <RefreshCw
                className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando datos del dashboard...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================
                ESTADÍSTICAS PRINCIPALES - FILA 1 PREMIUM
                ======================================== */}
            {estadisticas && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 animate-slideInUp">
                {/* Pacientes */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <UserCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.total_pacientes}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Pacientes Totales
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {estadisticas.pacientes_activos} activos
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        {obtenerIconoTendencia("up")}
                        {estadisticas.pacientes_nuevos_mes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Citas Hoy */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <CalendarCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.citas_programadas_hoy}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Citas Hoy
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {estadisticas.citas_confirmadas_hoy} confirmadas
                      </span>
                      <span className="text-yellow-400">
                        {formatearPorcentaje(estadisticas.tasa_confirmacion_mes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Médicos */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <UserCheck className="w-5 h-5 text-green-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.total_medicos}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Médicos
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {estadisticas.medicos_disponibles_ahora} disponibles
                      </span>
                      <span className="text-orange-400">
                        {estadisticas.medicos_en_consulta} en consulta
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facturación */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div
                    className={`text-3xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {formatearMoneda(estadisticas.total_facturado_mes)}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Facturado Mes
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {formatearPorcentaje(estadisticas.tasa_cobranza)}% cobrado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Farmacia */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-pink-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.total_medicamentos}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Medicamentos
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        {estadisticas.medicamentos_bajo_stock} bajo stock
                      </span>
                      <span className="text-orange-400">
                        {estadisticas.medicamentos_vencidos} vencidos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exámenes */}
                <div
                  className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Microscope className="w-6 h-6 text-white" />
                    </div>
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <div
                    className={`text-4xl font-black mb-1 ${tema.colores.texto}`}
                  >
                    {estadisticas.examenes_pendientes}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                  >
                    Exámenes Pendientes
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {estadisticas.total_examenes_mes} este mes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================
                GRID PRINCIPAL: Facturación + Inventario PREMIUM
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-slideInUp">
              {/* FACTURACIÓN PREMIUM */}
              <div
                className={`lg:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Receipt className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Facturación Reciente
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {facturas.length} facturas registradas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filtroFactura}
                      onChange={(e) => setFiltroFactura(e.target.value)}
                      className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}
                    >
                      <option value="todas">Todas</option>
                      <option value="pagada">Pagadas</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="vencida">Vencidas</option>
                    </select>

                    <Link
                      href="/administrativo/facturacion"
                      className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      Ver Todas
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {facturas.length === 0 ? (
                    <div className="text-center py-16">
                      <Receipt className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                      <p
                        className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                      >
                        No hay facturas
                      </p>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        Las facturas aparecerán aquí cuando se generen
                      </p>
                    </div>
                  ) : (
                    facturas.slice(0, 10).map((factura, index) => (
                      <div
                        key={factura.id_factura}
                        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${tema.colores.sombra} group animate-slideInUp`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Estado */}
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorEstado(
                              factura.estado
                            )}`}
                          >
                            {factura.estado === "pagada" && (
                              <CheckCircle2 className="w-6 h-6" />
                            )}
                            {factura.estado === "pendiente" && (
                              <Clock className="w-6 h-6" />
                            )}
                            {factura.estado === "vencida" && (
                              <AlertOctagon className="w-6 h-6" />
                            )}
                            {factura.estado === "anulada" && (
                              <XCircle className="w-6 h-6" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4
                                  className={`text-lg font-black ${tema.colores.texto} mb-1`}
                                >
                                  Factura #{factura.numero_factura}
                                </h4>
                                <p
                                  className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2 mb-1`}
                                >
                                  <User className="w-4 h-4" />
                                  {factura.paciente.nombre_completo}
                                </p>
                                <p
                                  className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
                                >
                                  <Stethoscope className="w-4 h-4" />
                                  Dr. {factura.medico.nombre_completo}
                                </p>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                  factura.estado
                                )}`}
                              >
                                {factura.estado.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <DollarSign
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                                <span
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {formatearMoneda(factura.total)}
                                </span>
                              </div>

                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <CreditCard
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                                <span
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {formatearMoneda(factura.pagado)}
                                </span>
                              </div>

                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}
                              >
                                <AlertCircle
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                                <span
                                  className={`text-sm font-bold ${tema.colores.texto}`}
                                >
                                  {formatearMoneda(factura.saldo)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {formatearFecha(factura.fecha_emision)}
                              </p>

                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/administrativo/facturacion/${factura.id_factura}`}
                                  className={`px-3 py-1 ${tema.colores.primario} text-white rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105 flex items-center gap-1`}
                                >
                                  <Eye className="w-3 h-3" />
                                  Ver
                                </Link>
                                <button
                                  className={`p-1 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* INVENTARIO FARMACIA PREMIUM */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Pill className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Inventario
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {medicamentos.length} medicamentos
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/administrativo/farmacia"
                    className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-105`}
                  >
                    <ChevronRight
                      className={`w-5 h-5 ${tema.colores.texto}`}
                    />
                  </Link>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {medicamentos.length === 0 ? (
                    <div className="text-center py-16">
                      <Pill className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                      <p
                        className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                      >
                        No hay medicamentos
                      </p>
                    </div>
                  ) : (
                    medicamentos.slice(0, 8).map((med, index) => (
                      <div
                        key={med.id_medicamento}
                        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] ${tema.colores.sombra} animate-slideInUp`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${obtenerColorEstado(
                              med.estado
                            )}`}
                          >
                            <Pill className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-black ${tema.colores.texto} text-sm truncate`}
                            >
                              {med.nombre_generico}
                            </h4>
                            {med.nombre_comercial && (
                              <p
                                className={`text-xs ${tema.colores.textoSecundario} truncate`}
                              >
                                {med.nombre_comercial}
                              </p>
                            )}
                          </div>

                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${obtenerColorEstado(
                              med.estado
                            )}`}
                          >
                            {med.stock_actual}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex-1 bg-gray-700/30 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${
                                med.stock_actual < med.stock_minimo
                                  ? "from-red-500 to-orange-500"
                                  : "from-green-500 to-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  (med.stock_actual / med.stock_minimo) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`font-bold ${tema.colores.textoSecundario}`}
                          >
                            {med.stock_minimo} mín
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className={tema.colores.textoSecundario}>
                            {formatearMoneda(med.precio_unitario)} c/u
                          </span>
                          <span className={`font-bold ${tema.colores.acento}`}>
                            {formatearMoneda(med.valor_total)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ========================================
                GRÁFICOS Y ANÁLISIS PREMIUM
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-slideInUp">
              {/* GRÁFICO INGRESOS PREMIUM */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Ingresos Semanales
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Facturado vs Cobrado
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={datosGrafico}>
                    <defs>
                      <linearGradient
                        id="colorIngresos"
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
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      formatter={(value) => formatearMoneda(value as number)}
                    />
                    <Legend />
                    <Bar
                      dataKey="ingresos"
                      fill="#10b981"
                      name="Facturado"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="cobrado"
                      stroke="#059669"
                      strokeWidth={3}
                      name="Cobrado"
                      dot={{ fill: "#059669", r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* GRÁFICO DISTRIBUCIÓN PACIENTES PREMIUM */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Distribución Pacientes
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Por tipo de atención
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="60%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={distribucionPacientes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {distribucionPacientes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {distribucionPacientes.map((item, index) => (
                      <div
                        key={index}
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
                            {item.nombre}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-bold ${tema.colores.acento}`}
                        >
                          {item.valor}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRÁFICO OCUPACIÓN PREMIUM */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Ocupación Hoy
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Capacidad de camas
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={datosOcupacion}>
                    <defs>
                      <linearGradient
                        id="colorOcupacion"
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
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="hora"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      formatter={(value) => `${value}%`}
                    />
                    <Area
                      type="monotone"
                      dataKey="ocupacion"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorOcupacion)"
                      name="Ocupación"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* GRÁFICO EXÁMENES PREMIUM */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Microscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Exámenes Semanales
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Solicitados vs Completados
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={datosGrafico}>
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
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="solicitados"
                      fill="#8b5cf6"
                      name="Solicitados"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="completados"
                      fill="#6d28d9"
                      name="Completados"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="pendientes"
                      fill="#fbbf24"
                      name="Pendientes"
                      radius={[8, 8, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ========================================
                EXÁMENES PENDIENTES PREMIUM
                ======================================== */}
            {examenes.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-slideInUp`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Microscope className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Exámenes Pendientes
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {examenes.filter((e) => e.estado_resultado === "pendiente")
                          .length} pendientes de resultado
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/administrativo/examenes"
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    Ver Todos
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examenes
                    .filter((e) => e.estado_resultado === "pendiente")
                    .slice(0, 6)
                    .map((examen, index) => (
                      <div
                        key={examen.id_examen}
                        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 ${tema.colores.sombra} animate-slideInUp`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-500`}
                          >
                            <Microscope className="w-5 h-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-black ${tema.colores.texto} text-sm truncate`}
                            >
                              {examen.nombre_examen}
                            </h4>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario} truncate`}
                            >
                              {examen.paciente.nombre_completo}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <p
                            className={`${tema.colores.textoSecundario} flex items-center gap-2`}
                          >
                            <Stethoscope className="w-3 h-3" />
                            Dr. {examen.medico.nombre_completo}
                          </p>
                          <p
                            className={`${tema.colores.textoSecundario} flex items-center gap-2`}
                          >
                            <Clock className="w-3 h-3" />
                            {formatearFecha(examen.fecha_solicitud)}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold ${obtenerColorEstado(
                              examen.estado_resultado
                            )}`}
                          >
                            {examen.estado_resultado.toUpperCase()}
                          </span>
                          <Link
                            href={`/administrativo/examenes/${examen.id_examen}`}
                            className={`flex-1 px-3 py-1 ${tema.colores.primario} text-white rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105 text-center`}
                          >
                            Ver
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================
                EMPLEADOS Y PERSONAL PREMIUM
                ======================================== */}
            {empleados.length > 0 && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-slideInUp`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-2xl font-black ${tema.colores.texto}`}
                      >
                        Personal del Centro
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        {empleados.filter((e) => e.estado === "activo").length}{" "}
                        empleados activos
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/administrativo/configuracion/usuarios"
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    Gestionar
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {empleados.slice(0, 8).map((empleado, index) => (
                    <div
                      key={empleado.id_usuario}
                      className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 ${tema.colores.sombra} animate-slideInUp`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg`}
                        >
                          {empleado.nombre_completo
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-black ${tema.colores.texto} text-sm truncate`}
                          >
                            {empleado.nombre_completo}
                          </h4>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario} truncate`}
                          >
                            {empleado.cargo}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3 text-xs">
                        <p
                          className={`${tema.colores.textoSecundario} flex items-center gap-2 truncate`}
                        >
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {empleado.email}
                        </p>
                        <p
                          className={`${tema.colores.textoSecundario} flex items-center gap-2`}
                        >
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {empleado.telefono}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${obtenerColorEstado(
                            empleado.estado
                          )}`}
                        >
                          {empleado.estado.toUpperCase()}
                        </span>
                        <Link
                          href={`/administrativo/configuracion/usuarios/${empleado.id_usuario}`}
                          className={`p-1 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================
                RENDIMIENTO MÉDICOS PREMIUM
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-slideInUp">
              {/* TOP MÉDICOS */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Top Médicos
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Por ingresos generados
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {rendimientoMedicos.slice(0, 5).map((medico, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${tema.colores.secundario} transition-all duration-300 hover:scale-[1.02] animate-slideInUp`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className={`font-bold text-sm ${tema.colores.texto}`}
                        >
                          {index + 1}. {medico.medico}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
                        >
                          {medico.citas} citas
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={tema.colores.textoSecundario}>
                              Satisfacción
                            </span>
                            <span className={`font-bold ${tema.colores.acento}`}>
                              {medico.satisfaccion}%
                            </span>
                          </div>
                          <div className="bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                              style={{ width: `${medico.satisfaccion}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <p
                        className={`text-xs font-bold mt-2 ${tema.colores.acento}`}
                      >
                        {formatearMoneda(medico.ingresos)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALERTAS CRÍTICAS */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Alertas Críticas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Requieren atención
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      titulo: "Medicamentos Bajo Stock",
                      valor: estadisticas?.medicamentos_bajo_stock || 0,
                      color: "from-orange-500 to-red-500",
                      icono: AlertTriangle,
                    },
                    {
                      titulo: "Medicamentos Vencidos",
                      valor: estadisticas?.medicamentos_vencidos || 0,
                      color: "from-red-500 to-pink-500",
                      icono: AlertOctagon,
                    },
                    {
                      titulo: "Próximos a Vencer",
                      valor:
                        estadisticas?.medicamentos_proximos_vencer || 0,
                      color: "from-yellow-500 to-orange-500",
                      icono: Clock,
                    },
                    {
                      titulo: "Facturas Vencidas",
                      valor: facturas.filter(
                        (f) => f.estado === "vencida"
                      ).length,
                      color: "from-red-500 to-orange-500",
                      icono: AlertCircle,
                    },
                  ].map((alerta, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg bg-gradient-to-r ${alerta.color} bg-opacity-10 border border-current border-opacity-20 animate-slideInUp`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <alerta.icono
                            className={`w-5 h-5 text-opacity-80`}
                          />
                          <span
                            className={`text-sm font-bold ${tema.colores.texto}`}
                          >
                            {alerta.titulo}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-black bg-gradient-to-r ${alerta.color} text-white`}
                        >
                          {alerta.valor}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESUMEN FINANCIERO PREMIUM */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Resumen Financiero
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Este mes
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Total Facturado",
                      valor: estadisticas?.total_facturado_mes || 0,
                      color: "from-green-500 to-emerald-500",
                    },
                    {
                      label: "Total Cobrado",
                      valor: estadisticas?.total_cobrado_mes || 0,
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      label: "Pendiente de Cobro",
                      valor: estadisticas?.total_pendiente_cobro || 0,
                      color: "from-yellow-500 to-orange-500",
                    },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-lg font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
                        >
                          {formatearMoneda(item.valor)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700/30 rounded-full overflow-hidden">
                        <div
                          className={`                          h-full bg-gradient-to-r ${item.color}`}
                          style={{
                            width: `${
                              item.valor > 0
                                ? Math.min(
                                    (item.valor /
                                      (estadisticas?.total_facturado_mes || 1)) *
                                      100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  <div
                    className={`mt-4 pt-4 border-t ${tema.colores.borde} flex items-center justify-between`}
                  >
                    <span
                      className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                    >
                      Tasa de Cobranza
                    </span>
                    <span
                      className={`text-2xl font-black ${tema.colores.acento}`}
                    >
                      {formatearPorcentaje(
                        estadisticas?.tasa_cobranza || 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================
                TABLA AVANZADA DE FACTURAS PREMIUM
                ======================================== */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8 animate-slideInUp overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-black ${tema.colores.texto}`}
                    >
                      Todas las Facturas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Gestión completa de facturación
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className={`px-4 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    <Download className="w-5 h-5" />
                    Exportar
                  </button>
                  <Link
                    href="/administrativo/facturacion/nueva"
                    className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Factura
                  </Link>
                </div>
              </div>

              {/* Tabla Responsiva */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b ${tema.colores.borde} ${tema.colores.secundario}`}
                    >
                      <th
                        className={`px-6 py-4 text-left font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Factura
                      </th>
                      <th
                        className={`px-6 py-4 text-left font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Paciente
                      </th>
                      <th
                        className={`px-6 py-4 text-left font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Médico
                      </th>
                      <th
                        className={`px-6 py-4 text-right font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Total
                      </th>
                      <th
                        className={`px-6 py-4 text-right font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Pagado
                      </th>
                      <th
                        className={`px-6 py-4 text-center font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Estado
                      </th>
                      <th
                        className={`px-6 py-4 text-center font-black ${tema.colores.texto} uppercase tracking-wider text-xs`}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {facturas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-16 text-center"
                        >
                          <Receipt className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                          <p
                            className={`text-xl font-bold ${tema.colores.texto} mb-2`}
                          >
                            No hay facturas
                          </p>
                          <p
                            className={`text-sm ${tema.colores.textoSecundario}`}
                          >
                            Las facturas aparecerán aquí cuando se generen
                          </p>
                        </td>
                      </tr>
                    ) : (
                      facturas.map((factura, index) => (
                        <tr
                          key={factura.id_factura}
                          className={`${tema.colores.hover} transition-all duration-300 hover:${tema.colores.sombra} animate-slideInUp`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className={`px-6 py-4 font-bold ${tema.colores.texto}`}>
                            #{factura.numero_factura}
                          </td>
                          <td
                            className={`px-6 py-4 font-semibold ${tema.colores.textoSecundario}`}
                          >
                            {factura.paciente.nombre_completo}
                          </td>
                          <td
                            className={`px-6 py-4 font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Dr. {factura.medico.nombre_completo}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-black ${tema.colores.acento}`}
                          >
                            {formatearMoneda(factura.total)}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-black text-green-400`}
                          >
                            {formatearMoneda(factura.pagado)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                                factura.estado
                              )}`}
                            >
                              {factura.estado.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/administrativo/facturacion/${factura.id_factura}`}
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                                title="Ver detalles"
                              >
                                <Eye
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                              </Link>
                              <button
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                                title="Descargar"
                              >
                                <Download
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                              </button>
                              <button
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                                title="Más opciones"
                              >
                                <MoreVertical
                                  className={`w-4 h-4 ${tema.colores.acento}`}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {facturas.length > 10 && (
                <div className="mt-6 flex items-center justify-between">
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Mostrando 1 a 10 de {facturas.length} facturas
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                      disabled
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      className={`px-3 py-2 rounded-lg ${tema.colores.primario} text-white font-bold`}
                    >
                      1
                    </button>
                    <button
                      className={`px-3 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105`}
                    >
                      2
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================
                ANÁLISIS AVANZADO PREMIUM
                ======================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-slideInUp">
              {/* RADAR DE DESEMPEÑO */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Desempeño del Centro
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Indicadores clave
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={[
                      {
                        metric: "Citas",
                        valor: Math.min(
                          (estadisticas?.citas_programadas_hoy || 0) * 5,
                          100
                        ),
                      },
                      {
                        metric: "Ingresos",
                        valor: Math.min(
                          ((estadisticas?.total_facturado_mes || 0) /
                            5000000) *
                            100,
                          100
                        ),
                      },
                      {
                        metric: "Cobranza",
                        valor: estadisticas?.tasa_cobranza || 0,
                      },
                      {
                        metric: "Pacientes",
                        valor: Math.min(
                          ((estadisticas?.total_pacientes || 0) / 1000) * 100,
                          100
                        ),
                      },
                      {
                        metric: "Exámenes",
                        valor: Math.min(
                          ((estadisticas?.total_examenes_mes || 0) / 500) * 100,
                          100
                        ),
                      },
                      {
                        metric: "Disponibilidad",
                        valor: Math.min(
                          ((estadisticas?.medicos_disponibles_ahora || 0) /
                            (estadisticas?.total_medicos || 1)) *
                            100,
                          100
                        ),
                      },
                    ]}
                  >
                    <PolarGrid opacity={0.2} />
                    <PolarAngleAxis
                      dataKey="metric"
                      stroke={tema.colores.textoSecundario}
                      style={{ fontSize: "12px" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      stroke={tema.colores.textoSecundario}
                    />
                    <Radar
                      name="Desempeño"
                      dataKey="valor"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* SCATTER PLOT - SATISFACCIÓN VS CITAS */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Análisis de Médicos
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Satisfacción vs Productividad
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="citas"
                      name="Citas Realizadas"
                      stroke={tema.colores.textoSecundario}
                      type="number"
                    />
                    <YAxis
                      dataKey="satisfaccion"
                      name="Satisfacción (%)"
                      stroke={tema.colores.textoSecundario}
                      type="number"
                      domain={[80, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        border: "1px solid rgba(236, 72, 153, 0.3)",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      cursor={{ strokeDasharray: "3 3" }}
                    />
                    <Scatter
                      name="Médicos"
                      data={rendimientoMedicos}
                      fill="#ec4899"
                      fillOpacity={0.7}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ========================================
                TARJETAS DE ACCIÓN RÁPIDA PREMIUM
                ======================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideInUp">
              {[
                {
                  titulo: "Nueva Cita",
                  descripcion: "Programar cita médica",
                  icono: CalendarPlus,
                  color: "from-blue-500 to-cyan-500",
                  url: "/administrativo/citas/nueva",
                },
                {
                  titulo: "Nuevo Paciente",
                  descripcion: "Registrar paciente",
                  icono: UserPlus,
                  color: "from-green-500 to-emerald-500",
                  url: "/administrativo/pacientes/nuevo",
                },
                {
                  titulo: "Nueva Factura",
                  descripcion: "Crear factura",
                  icono: FileSpreadsheet,
                  color: "from-yellow-500 to-orange-500",
                  url: "/administrativo/facturacion/nueva",
                },
                {
                  titulo: "Reporte Rápido",
                  descripcion: "Generar reporte",
                  icono: BarChart3,
                  color: "from-purple-500 to-pink-500",
                  url: "/administrativo/reportes/personalizado",
                },
              ].map((accion, index) => (
                <Link
                  key={index}
                  href={accion.url}
                  className={`rounded-2xl p-6 bg-gradient-to-br ${accion.color} transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${tema.colores.sombra} group cursor-pointer animate-slideInUp`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300`}
                    >
                      <accion.icono className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <h3 className="text-xl font-black text-white mb-1">
                    {accion.titulo}
                  </h3>
                  <p className="text-sm font-semibold text-white/80">
                    {accion.descripcion}
                  </p>
                </Link>
              ))}
            </div>

            {/* ========================================
                FOOTER PREMIUM
                ======================================== */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideInUp`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Info Centro */}
                <div>
                  <h4
                    className={`text-lg font-black mb-4 ${tema.colores.texto}`}
                  >
                    Centro de Salud
                  </h4>
                  <div className="space-y-3">
                    <p
                      className={`font-bold ${tema.colores.texto} flex items-center gap-2`}
                    >
                      <Building2 className="w-5 h-5" />
                      {usuario?.administrativo?.centro?.nombre}
                    </p>
                    <p
                      className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-2`}
                    >
                      <MapPin className="w-5 h-5" />
                      {usuario?.administrativo?.centro?.ciudad},{" "}
                      {usuario?.administrativo?.centro?.region}
                    </p>
                    <p
                      className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-2`}
                    >
                      <Phone className="w-5 h-5" />
                      {usuario?.administrativo?.centro?.telefono_principal}
                    </p>
                    <p
                      className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-2`}
                    >
                      <Mail className="w-5 h-5" />
                      {usuario?.administrativo?.centro?.email_contacto}
                    </p>
                  </div>
                </div>

                {/* Enlaces Rápidos */}
                <div>
                  <h4
                    className={`text-lg font-black mb-4 ${tema.colores.texto}`}
                  >
                    Enlaces Rápidos
                  </h4>
                  <div className="space-y-2">
                    {[
                      { titulo: "Dashboard", url: "/administrativo" },
                      { titulo: "Pacientes", url: "/administrativo/pacientes" },
                      { titulo: "Citas", url: "/administrativo/citas" },
                      { titulo: "Facturación", url: "/administrativo/facturacion" },
                      { titulo: "Reportes", url: "/administrativo/reportes" },
                    ].map((enlace, index) => (
                      <Link
                        key={index}
                        href={enlace.url}
                        className={`block text-sm font-semibold ${tema.colores.acento} hover:${tema.colores.texto} transition-colors duration-300`}
                      >
                        → {enlace.titulo}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Información del Sistema */}
                <div>
                  <h4
                    className={`text-lg font-black mb-4 ${tema.colores.texto}`}
                  >
                    Sistema
                  </h4>
                  <div className="space-y-3">
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      <span className={tema.colores.acento}>AnyssaMed v4.0.0</span>
                      <br />
                      Panel Administrativo Premium
                    </p>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Última actualización:{" "}
                      {new Date().toLocaleDateString("es-CL")}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span
                        className={`text-xs font-bold text-green-500`}
                      >
                        Sistema Seguro
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`mt-6 pt-6 border-t ${tema.colores.borde} flex items-center justify-between`}
              >
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  © 2024 AnyssaMed. Todos los derechos reservados.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href="#"
                    className={`text-xs font-semibold ${tema.colores.acento} hover:${tema.colores.texto} transition-colors`}
                  >
                    Privacidad
                  </Link>
                  <Link
                    href="#"
                    className={`text-xs font-semibold ${tema.colores.acento} hover:${tema.colores.texto} transition-colors`}
                  >
                    Términos
                  </Link>
                  <Link
                    href="#"
                    className={`text-xs font-semibold ${tema.colores.acento} hover:${tema.colores.texto} transition-colors`}
                  >
                    Soporte
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ========================================
          ESTILOS GLOBALES
          ======================================== */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 20% {
            transform: rotate(14deg);
          }
          30% {
            transform: rotate(-8deg);
          }
          40%, 50% {
            transform: rotate(14deg);
          }
          60% {
            transform: rotate(-4deg);
          }
          70% {
            transform: rotate(10deg);
          }
          80% {
            transform: rotate(0deg);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-wave {
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        /* Animaciones de entrada para elementos */
        @media (prefers-reduced-motion: no-preference) {
          * {
            scroll-behavior: smooth;
          }
        }

        /* Backdrop blur support */
        @supports (backdrop-filter: blur(10px)) {
          .backdrop-blur-xl {
            backdrop-filter: blur(20px);
          }
        }

        /* Gradientes personalizados */
        .bg-gradient-premium {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Sombras premium */
        .shadow-premium {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.2);
        }

        /* Transiciones suaves */
        button,
        a,
        input,
        select {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Focus states accesibles */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}