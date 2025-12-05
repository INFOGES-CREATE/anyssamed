// src/app/(dashboard)/tecnico/mantenimiento/correctivo/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Download,
  FileDown,
  FileText,
  Filter,
  Globe,
  HardDrive,
  HeartPulse,
  History,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  MoreVertical,
  Package,
  Play,
  PowerOff,
  RefreshCw,
  Search,
  Shield,
  SortAsc,
  SortDesc,
  Sparkles,
  Sun,
  Target,
  Trophy,
  User,
  UserCheck,
  Wifi,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

// ===================================================
// TIPOS
// ===================================================

type TemaColor =
  | "light"
  | "dark"
  | "blue"
  | "purple"
  | "green"
  | "cyberpunk"
  | "ocean"
  | "sunset";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  descripcion: string;
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
    success: string;
    warning: string;
    error: string;
    info: string;
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
  tecnico?: {
    id_tecnico: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    area_tecnica: string;
    tipo_tecnico:
      | "soporte"
      | "mantenimiento"
      | "ingenieria"
      | "biomedico"
      | "sistemas"
      | "infraestructura";
    turno: "manana" | "tarde" | "noche" | "completo";
    hora_inicio: string | null;
    hora_fin: string | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    pais: string;
    region: string;
    zona_horaria: string;
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    es_global: boolean;
    tickets_resueltos: number;
    tiempo_promedio_resolucion: number;
    calificacion_promedio: number;
  };
}

interface ChecklistItem {
  id_item: number;
  descripcion: string;
  completado: boolean;
  observaciones: string | null;
  fecha_completado: string | null;
  completado_por: string | null;
  es_critico: boolean;
  orden: number;
}

interface RepuestoUtilizado {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  proveedor: string | null;
}

interface DocumentoMantenimiento {
  id_documento: number;
  tipo: "foto" | "pdf" | "reporte" | "certificado" | "factura";
  nombre: string;
  url: string;
  descripcion: string | null;
  fecha_subida: string;
  subido_por: string;
}

interface HistorialMantenimiento {
  id_historial: number;
  accion: string;
  descripcion: string;
  usuario: string;
  fecha: string;
}

interface OrdenMantenimiento {
  id_mantenimiento: number;
  id_equipo: number;
  tipo_mantenimiento:
    | "preventivo"
    | "correctivo"
    | "predictivo"
    | "calibracion"
    | "inspeccion";
  estado: "programado" | "en_progreso" | "completado" | "cancelado" | "reprogramado";
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_programada: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  duracion_estimada: number; // minutos
  duracion_real: number | null; // minutos
  tecnico_asignado: number;
  nombre_tecnico: string;
  foto_tecnico: string | null;
  equipo: {
    id_equipo: number;
    nombre: string;
    marca: string;
    modelo: string;
    serie: string;
    ubicacion: string;
    estado: string;
    criticidad: "baja" | "media" | "alta" | "critica";
    foto_url: string | null;
  };
  descripcion: string;
  observaciones: string | null;
  checklist: ChecklistItem[];
  repuestos_utilizados: RepuestoUtilizado[];
  costo_total: number;
  tiempo_fuera_servicio: number | null;
  proximo_mantenimiento: string | null;
  requiere_aprobacion: boolean;
  aprobado_por: number | null;
  nombre_aprobador: string | null;
  fecha_aprobacion: string | null;
  documentos: DocumentoMantenimiento[];
  historial: HistorialMantenimiento[];
  calificacion: number | null;
  comentarios_calificacion: string | null;
  created_at: string;
  updated_at: string;
}

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  alertas_activas: number;
  alertas_criticas: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
  mantenimientos_programados: number;
  mantenimientos_vencidos: number;
  mantenimientos_completados_mes: number;
  equipos_en_mantenimiento: number;
}

interface FiltrosCorrectivo {
  estado: string[];
  prioridad: string[];
  ubicacion: string;
  fechaDesde: string;
  fechaHasta: string;
  soloVencidos: boolean;
  soloAsignadosAMi: boolean;
  ordenarPor: "fecha_programada" | "prioridad" | "estado" | "equipo";
  ordenDireccion: "asc" | "desc";
}

interface VistaCorrectivo {
  modo: "tarjetas" | "lista";
  mostrarCompletados: boolean;
}

interface ResumenCorrectivo {
  total: number;
  programados: number;
  en_progreso: number;
  completados: number;
  vencidos: number;
  asignadosAMi: number;
  tiempoPromedio: number;
}

// ===================================================
// TEMAS
// ===================================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    descripcion: "Interfaz clara y moderna",
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
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    },
  },
  dark: {
    nombre: "Oscuro Premium",
    icono: Moon,
    descripcion: "Modo oscuro elegante",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
  },
  blue: {
    nombre: "Azul Técnico",
    icono: Wifi,
    descripcion: "Tema azul profesional",
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
      success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      info: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
  },
  purple: {
    nombre: "Púrpura Industrial",
    icono: Sparkles,
    descripcion: "Diseño moderno púrpura",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    },
  },
  green: {
    nombre: "Verde Operacional",
    icono: HeartPulse,
    descripcion: "Tema verde para monitoreo",
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
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    },
  },
  cyberpunk: {
    nombre: "Cyberpunk Neon",
    icono: Zap,
    descripcion: "Estilo futurista",
    colores: {
      fondo: "from-black via-purple-950 to-pink-950",
      fondoSecundario: "bg-black",
      texto: "text-cyan-300",
      textoSecundario: "text-pink-400",
      primario: "bg-pink-600 hover:bg-pink-700",
      secundario: "bg-purple-900 hover:bg-purple-800",
      acento: "text-cyan-400",
      borde: "border-pink-500/30",
      sombra: "shadow-2xl shadow-pink-500/30",
      gradiente: "from-pink-500 via-purple-500 to-cyan-500",
      sidebar: "bg-black/95 backdrop-blur-xl border-pink-500/30",
      header: "bg-black/80 backdrop-blur-xl border-pink-500/30",
      card: "bg-purple-950/50 border-pink-500/30 hover:border-cyan-500/50",
      hover: "hover:bg-purple-900/50",
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
  },
  ocean: {
    nombre: "Océano Profundo",
    icono: Globe,
    descripcion: "Colores del océano",
    colores: {
      fondo: "from-blue-950 via-indigo-950 to-slate-950",
      fondoSecundario: "bg-blue-950",
      texto: "text-blue-100",
      textoSecundario: "text-blue-300",
      primario: "bg-blue-600 hover:bg-blue-700",
      secundario: "bg-slate-800 hover:bg-slate-700",
      acento: "text-blue-400",
      borde: "border-blue-800",
      sombra: "shadow-2xl shadow-blue-500/20",
      gradiente: "from-blue-500 via-indigo-500 to-purple-500",
      sidebar: "bg-blue-950/95 backdrop-blur-xl border-blue-800",
      header: "bg-blue-950/80 backdrop-blur-xl border-blue-800",
      card: "bg-slate-900/50 border-blue-800 hover:border-blue-500/50",
      hover: "hover:bg-slate-800",
      success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      info: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
  },
  sunset: {
    nombre: "Atardecer Cálido",
    icono: Sun,
    descripcion: "Tonos cálidos",
    colores: {
      fondo: "from-orange-950 via-red-950 to-pink-950",
      fondoSecundario: "bg-orange-900",
      texto: "text-orange-100",
      textoSecundario: "text-orange-300",
      primario: "bg-orange-600 hover:bg-orange-700",
      secundario: "bg-red-900 hover:bg-red-800",
      acento: "text-orange-400",
      borde: "border-orange-800",
      sombra: "shadow-2xl shadow-orange-500/20",
      gradiente: "from-orange-500 via-red-500 to-pink-500",
      sidebar: "bg-orange-950/95 backdrop-blur-xl border-orange-800",
      header: "bg-orange-950/80 backdrop-blur-xl border-orange-800",
      card: "bg-red-950/50 border-orange-800 hover:border-orange-500/50",
      hover: "hover:bg-red-900",
      success: "bg-green-500/20 text-green-300 border-green-500/40",
      warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      error: "bg-red-500/20 text-red-300 border-red-500/40",
      info: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    },
  },
};

// ===================================================
// COMPONENTE PRINCIPAL - FOCUS CORRECTIVO
// ===================================================

export default function MantenimientoCorrectivoPage() {
  // Estado base
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCorrectivos, setLoadingCorrectivos] = useState(true);

  // Datos
  const [mantenimientos, setMantenimientos] = useState<OrdenMantenimiento[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenMantenimiento | null>(null);

  // UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [panelDetalleAbierto, setPanelDetalleAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [filtros, setFiltros] = useState<FiltrosCorrectivo>({
    estado: [],
    prioridad: [],
    ubicacion: "",
    fechaDesde: "",
    fechaHasta: "",
    soloVencidos: false,
    soloAsignadosAMi: false,
    ordenarPor: "fecha_programada",
    ordenDireccion: "asc",
  });

  const [vista, setVista] = useState<VistaCorrectivo>({
    modo: "tarjetas",
    mostrarCompletados: true,
  });

  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervaloRefresh, setIntervaloRefresh] = useState(300000); // 5 min

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ===================================================
  // EFECTOS
  // ===================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
    if (temaGuardado && TEMAS[temaGuardado]) {
      setTemaActual(temaGuardado);
    }
  }, []);

  useEffect(() => {
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarCorrectivos();
      cargarEstadisticas();
    }
  }, [usuario]);

  useEffect(() => {
    if (!autoRefresh || !usuario?.tecnico) return;

    const id = setInterval(() => {
      cargarCorrectivos();
      cargarEstadisticas();
    }, intervaloRefresh);

    return () => clearInterval(id);
  }, [autoRefresh, intervaloRefresh, usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ===================================================
  // HELPERS
  // ===================================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "warning" | "info",
    titulo: string,
    mensaje: string
  ) => {
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
  };

  const esVencido = (fechaProgramada: string, estado: string) => {
    if (estado === "completado" || estado === "cancelado") return false;
    return new Date(fechaProgramada) < new Date();
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatearFechaCompleta = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatearTiempo = (minutos: number): string => {
    if (!minutos) return "0m";
    if (minutos < 60) return `${minutos}m`;
    if (minutos < 1440) return `${Math.floor(minutos / 60)}h ${minutos % 60}m`;
    return `${Math.floor(minutos / 1440)}d ${Math.floor((minutos % 1440) / 60)}h`;
  };

  const obtenerSaludo = () => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas madrugadas";
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = temaActual !== "light";
    const base = {
      critica: isDark
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
    } as Record<string, string>;

    return (
      base[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerColorEstado = (estado: string) => {
    const colores: Record<string, string> = {
      programado: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      en_progreso: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      completado: "bg-green-500/20 text-green-300 border-green-500/40",
      cancelado: "bg-red-500/20 text-red-300 border-red-500/40",
      reprogramado: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    };
    return colores[estado] || "bg-gray-500/20 text-gray-300 border-gray-500/40";
  };

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", nuevoTema);
    }
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar tema:", err);
    }
  };

  // ===================================================
  // CARGA DE DATOS
  // ===================================================

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("No hay sesión");

      const data = await res.json();

      if (!data.success || !data.usuario) {
        window.location.href = "/login";
        return;
      }

      const rolesUsuario: string[] = [];
      if (data.usuario.rol) {
        rolesUsuario.push(
          data.usuario.rol.nombre
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase()
        );
      }

      const tieneRolTecnico = rolesUsuario.some(
        (rol: string) =>
          rol.includes("TECNICO") || rol.includes("SOPORTE") || rol.includes("MANTENIMIENTO")
      );

      if (!tieneRolTecnico) {
        mostrarNotificacion("error", "Acceso denegado", "Este panel es solo para técnicos.");
        window.location.href = "/";
        return;
      }

      if (!data.usuario.tecnico) {
        mostrarNotificacion(
          "error",
          "Configuración incompleta",
          "Tu usuario no está vinculado a un técnico."
        );
        window.location.href = "/";
        return;
      }

      setUsuario(data.usuario);
      setDisponibilidad(data.usuario.tecnico.disponibilidad);
    } catch (err) {
      console.error(err);
      mostrarNotificacion("error", "Error de sesión", "Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarCorrectivos = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;
    try {
      setLoadingCorrectivos(true);
      const res = await fetch(
        `/api/tecnico/mantenimiento?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar mantenimientos:", data);
        return;
      }

      const todos: OrdenMantenimiento[] = data.mantenimientos || [];
      const soloCorrectivos = todos.filter(
        (m: OrdenMantenimiento) => m.tipo_mantenimiento === "correctivo"
      );
      setMantenimientos(soloCorrectivos);
    } catch (err) {
      console.error(err);
      mostrarNotificacion("error", "Error", "No se pudieron cargar los correctivos");
    } finally {
      setLoadingCorrectivos(false);
    }
  };

  const cargarEstadisticas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/estadisticas?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===================================================
  // ACCIONES
  // ===================================================

  const cambiarDisponibilidad = async (
    nuevo: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    try {
      const res = await fetch(
        `/api/tecnico/${usuario?.tecnico?.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevo }),
        }
      );

      if (!res.ok) throw new Error("No se pudo actualizar");

      setDisponibilidad(nuevo);
      mostrarNotificacion("success", "Disponibilidad actualizada", `Estado: ${nuevo}`);
    } catch (err) {
      console.error(err);
      mostrarNotificacion("error", "Error", "No se pudo actualizar tu disponibilidad");
    }
  };

  const iniciarMantenimiento = async (id: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/${id}/iniciar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al iniciar");

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === id
            ? {
                ...m,
                estado: "en_progreso",
                fecha_inicio: new Date().toISOString(),
              }
            : m
        )
      );
      mostrarNotificacion("success", "Correctivo iniciado", "Marcado como en progreso");
      cargarEstadisticas();
    } catch (err) {
      console.error(err);
      mostrarNotificacion("error", "Error", "No se pudo iniciar el correctivo");
    }
  };

  const completarMantenimiento = async (id: number) => {
    try {
      const res = await fetch(`/api/tecnico/mantenimiento/${id}/completar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al completar");

      setMantenimientos((prev) =>
        prev.map((m) =>
          m.id_mantenimiento === id
            ? {
                ...m,
                estado: "completado",
                fecha_fin: new Date().toISOString(),
              }
            : m
        )
      );
      mostrarNotificacion("success", "Correctivo completado", "Trabajo finalizado");
      cargarEstadisticas();
    } catch (err) {
      console.error(err);
      mostrarNotificacion("error", "Error", "No se pudo completar el correctivo");
    }
  };

  const exportar = async (formato: "csv" | "excel" | "pdf") => {
    try {
      mostrarNotificacion("info", "Exportando", `Generando ${formato.toUpperCase()}...`);

      const res = await fetch(
        `/api/tecnico/mantenimiento/exportar?formato=${formato}&id_tecnico=${usuario?.tecnico?.id_tecnico}&tipo=correctivo`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Error al exportar");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mantenimientos_correctivos_${new Date()
        .toISOString()
        .split("T")[0]}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      mostrarNotificacion("success", "Exportado", "Archivo descargado correctamente");
    } catch (err) {
      console.error(err);
      mostrarNotificacion("error", "Error", "No se pudo exportar");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSeleccion = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === correctivosFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(correctivosFiltrados.map((m) => m.id_mantenimiento));
    }
  };

  // ===================================================
  // DERIVADOS
  // ===================================================

  const correctivosFiltrados = useMemo(() => {
    let data = [...mantenimientos];

    if (filtros.estado.length > 0) {
      data = data.filter((m) => filtros.estado.includes(m.estado));
    }

    if (filtros.prioridad.length > 0) {
      data = data.filter((m) => filtros.prioridad.includes(m.prioridad));
    }

    if (filtros.ubicacion) {
      const q = filtros.ubicacion.toLowerCase();
      data = data.filter((m) => m.equipo.ubicacion.toLowerCase().includes(q));
    }

    if (filtros.fechaDesde) {
      const d = new Date(filtros.fechaDesde).getTime();
      data = data.filter((m) => new Date(m.fecha_programada).getTime() >= d);
    }

    if (filtros.fechaHasta) {
      const h = new Date(filtros.fechaHasta).getTime();
      data = data.filter((m) => new Date(m.fecha_programada).getTime() <= h);
    }

    if (filtros.soloVencidos) {
      data = data.filter((m) => esVencido(m.fecha_programada, m.estado));
    }

    if (filtros.soloAsignadosAMi) {
      data = data.filter((m) => m.tecnico_asignado === usuario?.tecnico?.id_tecnico);
    }

    if (!vista.mostrarCompletados) {
      data = data.filter((m) => m.estado !== "completado");
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (m) =>
          m.descripcion.toLowerCase().includes(q) ||
          m.equipo.nombre.toLowerCase().includes(q) ||
          m.equipo.ubicacion.toLowerCase().includes(q) ||
          m.equipo.marca.toLowerCase().includes(q) ||
          m.equipo.modelo.toLowerCase().includes(q) ||
          m.nombre_tecnico.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      let comp = 0;

      switch (filtros.ordenarPor) {
        case "fecha_programada":
          comp =
            new Date(a.fecha_programada).getTime() -
            new Date(b.fecha_programada).getTime();
          break;
        case "prioridad": {
          const p: Record<string, number> = { critica: 4, alta: 3, media: 2, baja: 1 };
          comp = p[b.prioridad] - p[a.prioridad];
          break;
        }
        case "estado":
          comp = a.estado.localeCompare(b.estado);
          break;
        case "equipo":
          comp = a.equipo.nombre.localeCompare(b.equipo.nombre);
          break;
      }

      return filtros.ordenDireccion === "asc" ? comp : -comp;
    });

    return data;
  }, [mantenimientos, filtros, vista.mostrarCompletados, busqueda, usuario]);

  const resumen: ResumenCorrectivo = useMemo(() => {
    const total = mantenimientos.length;
    const programados = mantenimientos.filter((m) => m.estado === "programado").length;
    const en_progreso = mantenimientos.filter((m) => m.estado === "en_progreso").length;
    const completados = mantenimientos.filter((m) => m.estado === "completado").length;
    const vencidos = mantenimientos.filter((m) =>
      esVencido(m.fecha_programada, m.estado)
    ).length;
    const asignadosAMi = mantenimientos.filter(
      (m) => m.tecnico_asignado === usuario?.tecnico?.id_tecnico
    ).length;

    const tiempos = mantenimientos
      .filter((m) => m.duracion_real !== null)
      .map((m) => m.duracion_real || 0);

    const tiempoPromedio =
      tiempos.length > 0
        ? tiempos.reduce((acc, t) => acc + t, 0) / tiempos.length
        : 0;

    return {
      total,
      programados,
      en_progreso,
      completados,
      vencidos,
      asignadosAMi,
      tiempoPromedio,
    };
  }, [mantenimientos, usuario]);

  const datosPorEstado = useMemo(
    () => [
      {
        nombre: "Programado",
        valor: resumen.programados,
        color: "#3b82f6",
      },
      {
        nombre: "En Progreso",
        valor: resumen.en_progreso,
        color: "#eab308",
      },
      {
        nombre: "Completado",
        valor: resumen.completados,
        color: "#22c55e",
      },
      {
        nombre: "Vencido",
        valor: resumen.vencidos,
        color: "#ef4444",
      },
    ],
    [resumen]
  );

  // ===================================================
  // RENDER - LOADING / SIN USUARIO
  // ===================================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wrench className="w-12 h-12 text-orange-500 animate-pulse" />
            </div>
          </div>
          <h2 className={`text-3xl font-black mb-2 ${tema.colores.texto}`}>
            Cargando Mantenimiento Correctivo
          </h2>
          <p className={tema.colores.textoSecundario}>
            Sincronizando órdenes críticas...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.tecnico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl font-black mb-3 ${tema.colores.texto}`}>
            Acceso no autorizado
          </h2>
          <p className={tema.colores.textoSecundario}>
            No tienes permisos para acceder al módulo de mantenimiento correctivo.
          </p>
          <Link
            href="/login"
            className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold shadow-lg`}
          >
            <LogOut className="w-4 h-4" />
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDER PRINCIPAL
  // ===================================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* BREADCRUMB + BUSQUEDA */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/tecnico/dashboard"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Link
                href="/tecnico/mantenimiento"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Mantenimiento
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                Correctivo
              </span>
            </div>

            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar correctivos por equipo, ubicación, técnico..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-10 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-orange-500/60`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ACCIONES HEADER */}
          <div className="flex items-center gap-3 ml-6">
            {/* Auto refresh */}
            <div className="relative group">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl ${
                  autoRefresh
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${autoRefresh ? "animate-spin-slow" : ""}`}
                />
              </button>
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4`}
              >
                <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                  ⚡ Auto-actualización
                </p>
                <div className="space-y-2 text-sm">
                  {[60000, 300000, 600000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setIntervaloRefresh(v)}
                      className={`w-full px-3 py-2 rounded-lg font-semibold ${
                        intervaloRefresh === v
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      {v / 60000} min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tema */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 max-h-96 overflow-y-auto custom-scrollbar`}
              >
                <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                  🎨 Tema visual
                </p>
                {Object.entries(TEMAS).map(([key, t]) => {
                  const Icono = t.icono;
                  return (
                    <button
                      key={key}
                      onClick={() => cambiarTema(key as TemaColor)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold ${
                        temaActual === key
                          ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icono className="w-5 h-5" />
                        <div className="text-left">
                          <p className="font-bold">{t.nombre}</p>
                          <p className="text-xs opacity-80">{t.descripcion}</p>
                        </div>
                      </div>
                      {temaActual === key && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Disp.
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <Clock className="w-4 h-4" />
                Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <PowerOff className="w-4 h-4" />
                Fuera
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl ${tema.colores.hover}`}
              >
                <div className="hidden md:block text-right">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.tecnico?.tipo_tecnico}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/40">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={56}
                          height={56}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Técnico de mantenimiento
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">Mi perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/estadisticas"
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Estadísticas</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.hover} text-red-500 hover:text-red-400`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
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
        } pt-32 p-8 ${panelDetalleAbierto ? "mr-[420px]" : ""}`}
      >
        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1
              className={`text-4xl md:text-5xl font-black mb-2 flex items-center gap-3 ${tema.colores.texto}`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="text-3xl">🛠️</span>
            </h1>
            <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
              Panel especializado en Mantenimiento Correctivo
            </p>
            {usuario.tecnico && (
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs md:text-sm">
                <p className={`flex items-center gap-2 ${tema.colores.textoSecundario}`}>
                  <MapPin className="w-4 h-4" />
                  {usuario.tecnico.centro?.nombre ?? "Centro no definido"} •{" "}
                  {usuario.tecnico.area_tecnica ?? "Área no definida"}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      disponibilidad === "disponible"
                        ? "bg-green-500"
                        : disponibilidad === "ocupado"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    } animate-pulse`}
                  />
                  <span className={`font-semibold ${tema.colores.textoSecundario}`}>
                    {disponibilidad === "disponible"
                      ? "Disponible"
                      : disponibilidad === "ocupado"
                      ? "Ocupado"
                      : "Fuera de servicio"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => cargarCorrectivos()}
                disabled={loadingCorrectivos}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingCorrectivos ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2`}
                >
                  <button
                    onClick={() => exportar("csv")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                  >
                    <FileText className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportar("excel")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                  >
                    <FileText className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => exportar("pdf")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-xl text-xs flex items-center gap-2 ${tema.colores.card} ${tema.colores.borde} border`}
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className={tema.colores.textoSecundario}>
                Este módulo muestra solo órdenes de tipo{" "}
                <span className="font-bold text-red-400">CORRECTIVO</span>
              </span>
            </div>
          </div>
        </div>

        {/* TARJETAS RESUMEN */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {/* Total */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:-translate-y-1 hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Wrench className="w-5 h-5" />
              </div>
              <Activity className="w-4 h-4 text-orange-400" />
            </div>
            <p className={`text-3xl font-black ${tema.colores.texto}`}>
              {resumen.total}
            </p>
            <p className={`text-xs font-bold mt-1 ${tema.colores.textoSecundario}`}>
              Correctivos totales
            </p>
          </div>

          {/* Programados */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:-translate-y-1 hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-3xl font-black ${tema.colores.texto}`}>
              {resumen.programados}
            </p>
            <p className={`text-xs font-bold mt-1 ${tema.colores.textoSecundario}`}>
              Programados
            </p>
          </div>

          {/* En progreso */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:-translate-y-1 hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Play className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-3xl font-black ${tema.colores.texto}`}>
              {resumen.en_progreso}
            </p>
            <p className={`text-xs font-bold mt-1 ${tema.colores.textoSecundario}`}>
              En progreso
            </p>
          </div>

          {/* Completados */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:-translate-y-1 hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <Trophy className="w-4 h-4 text-green-400" />
            </div>
            <p className={`text-3xl font-black ${tema.colores.texto}`}>
              {resumen.completados}
            </p>
            <p className={`text-xs font-bold mt-1 ${tema.colores.textoSecundario}`}>
              Completados
            </p>
          </div>

          {/* Vencidos */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:-translate-y-1 hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-3xl font-black ${tema.colores.texto}`}>
              {resumen.vencidos}
            </p>
            <p className={`text-xs font-bold mt-1 ${tema.colores.textoSecundario}`}>
              Vencidos
            </p>
          </div>

          {/* Asignados a mí */}
          <div
            className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:-translate-y-1 hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-3xl font-black ${tema.colores.texto}`}>
              {resumen.asignadosAMi}
            </p>
            <p className={`text-xs font-bold mt-1 ${tema.colores.textoSecundario}`}>
              Asignados a mí
            </p>
          </div>
        </div>

        {/* GRAFICO + METRICAS RAPIDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico por estado */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  Estado de correctivos
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Seguimiento en tiempo real
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <RechartsBarChart data={datosPorEstado}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="nombre"
                  stroke="#9ca3af"
                  style={{ fontSize: "11px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.95)",
                    borderRadius: 12,
                    border: "1px solid rgba(249,115,22,0.5)",
                    padding: 10,
                  }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {datosPorEstado.map((d, i) => (
                    <Bar key={i} dataKey="valor" fill={d.color} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas rápidas */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  Rendimiento en correctivos
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Tiempo de respuesta y cierre
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    Tiempo medio de corrección
                  </span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {formatearTiempo(Math.round(resumen.tiempoPromedio))}
                </p>
              </div>

              <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    Tasa de cierre
                  </span>
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumen.total > 0
                    ? Math.round((resumen.completados / resumen.total) * 100)
                    : 0}
                  %
                </p>
              </div>

              <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    Backlog vencido
                  </span>
                </div>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {resumen.vencidos}
                </p>
              </div>
            </div>
          </div>

          {/* Info rápida */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  Tips correctivos
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Mejores prácticas rápidas
                </p>
              </div>
            </div>
            <ul className={`text-xs space-y-2 ${tema.colores.textoSecundario}`}>
              <li>• Prioriza siempre los equipos críticos de UCI y pabellón.</li>
              <li>• Documenta la causa raíz en la descripción final.</li>
              <li>• Adjunta fotos de antes/después cuando sea posible.</li>
              <li>
                • Si un correctivo se repite, sugiera al supervisor una revisión del plan
                preventivo.
              </li>
            </ul>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS */}
        <div
          className={`rounded-2xl p-5 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Vista */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5">
                <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                  Vista:
                </span>
                <button
                  onClick={() =>
                    setVista((v) => ({
                      ...v,
                      modo: "tarjetas",
                    }))
                  }
                  className={`p-2 rounded-lg ${
                    vista.modo === "tarjetas"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  <Box className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setVista((v) => ({
                      ...v,
                      modo: "lista",
                    }))
                  }
                  className={`p-2 rounded-lg ${
                    vista.modo === "lista"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* Orden */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5">
                <span className={`text-xs font-semibold ${tema.colores.texto}`}>
                  Ordenar:
                </span>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) =>
                    setFiltros((f) => ({
                      ...f,
                      ordenarPor: e.target.value as FiltrosCorrectivo["ordenarPor"],
                    }))
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="fecha_programada">Fecha programada</option>
                  <option value="prioridad">Prioridad</option>
                  <option value="estado">Estado</option>
                  <option value="equipo">Equipo</option>
                </select>
                <button
                  onClick={() =>
                    setFiltros((f) => ({
                      ...f,
                      ordenDireccion: f.ordenDireccion === "asc" ? "desc" : "asc",
                    }))
                  }
                  className={`p-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  {filtros.ordenDireccion === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setModoSeleccionMultiple((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  modoSeleccionMultiple
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Selección múltiple
              </button>

              <button
                onClick={() =>
                  setVista((v) => ({
                    ...v,
                    mostrarCompletados: !v.mostrarCompletados,
                  }))
                }
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  vista.mostrarCompletados
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Completados
              </button>

              <button
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>

          {/* FILTROS PRINCIPALES */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Estado */}
            <div>
              <p className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}>
                Estado
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "programado", label: "Programado" },
                  { value: "en_progreso", label: "En progreso" },
                  { value: "completado", label: "Completado" },
                  { value: "reprogramado", label: "Reprogramado" },
                ].map((e) => (
                  <button
                    key={e.value}
                    onClick={() =>
                      setFiltros((f) => ({
                        ...f,
                        estado: f.estado.includes(e.value)
                          ? f.estado.filter((x) => x !== e.value)
                          : [...f.estado, e.value],
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      filtros.estado.includes(e.value)
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent"
                        : `${tema.colores.card} ${tema.colores.texto}`
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <p className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}>
                Prioridad
              </p>
              <div className="flex flex-wrap gap-2">
                {["baja", "media", "alta", "critica"].map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      setFiltros((f) => ({
                        ...f,
                        prioridad: f.prioridad.includes(p)
                          ? f.prioridad.filter((x) => x !== p)
                          : [...f.prioridad, p],
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      filtros.prioridad.includes(p)
                        ? obtenerColorPrioridad(p)
                        : `${tema.colores.card} ${tema.colores.texto}`
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <p className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}>
                Ubicación
              </p>
              <input
                type="text"
                value={filtros.ubicacion}
                onChange={(e) =>
                  setFiltros((f) => ({
                    ...f,
                    ubicacion: e.target.value,
                  }))
                }
                placeholder="Ej: UCI, Pabellón..."
                className={`w-full px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
              />
            </div>

            {/* Flags */}
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.soloVencidos}
                  onChange={(e) =>
                    setFiltros((f) => ({
                      ...f,
                      soloVencidos: e.target.checked,
                    }))
                  }
                />
                <span className={tema.colores.texto}>Solo vencidos</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.soloAsignadosAMi}
                  onChange={(e) =>
                    setFiltros((f) => ({
                      ...f,
                      soloAsignadosAMi: e.target.checked,
                    }))
                  }
                />
                <span className={tema.colores.texto}>Solo asignados a mí</span>
              </label>
              <button
                onClick={() =>
                  setFiltros({
                    estado: [],
                    prioridad: [],
                    ubicacion: "",
                    fechaDesde: "",
                    fechaHasta: "",
                    soloVencidos: false,
                    soloAsignadosAMi: false,
                    ordenarPor: "fecha_programada",
                    ordenDireccion: "asc",
                  })
                }
                className={`mt-1 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* LISTA / TARJETAS */}
        {loadingCorrectivos ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-14 h-14 mx-auto mb-4 text-orange-500 animate-spin" />
              <p className={tema.colores.textoSecundario}>
                Cargando órdenes correctivas...
              </p>
            </div>
          </div>
        ) : correctivosFiltrados.length === 0 ? (
          <div
            className={`rounded-2xl p-10 text-center ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
              Sin correctivos
            </h3>
            <p className={tema.colores.textoSecundario}>
              No hay órdenes de mantenimiento correctivo que coincidan con los filtros
              actuales.
            </p>
            <button
              onClick={() => {
                setFiltros({
                  estado: [],
                  prioridad: [],
                  ubicacion: "",
                  fechaDesde: "",
                  fechaHasta: "",
                  soloVencidos: false,
                  soloAsignadosAMi: false,
                  ordenarPor: "fecha_programada",
                  ordenDireccion: "asc",
                });
                setBusqueda("");
              }}
              className={`mt-6 px-6 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* TARJETAS */}
            {vista.modo === "tarjetas" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {correctivosFiltrados.map((m) => {
                  const isSel = seleccionados.includes(m.id_mantenimiento);
                  const vencido = esVencido(m.fecha_programada, m.estado);

                  return (
                    <div
                      key={m.id_mantenimiento}
                      className={`relative rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer ${
                        isSel ? "ring-2 ring-purple-500" : ""
                      } ${vencido ? "ring-2 ring-red-500/50" : ""}`}
                      onClick={() => {
                        if (modoSeleccionMultiple) {
                          toggleSeleccion(m.id_mantenimiento);
                        } else {
                          setOrdenSeleccionada(m);
                          setPanelDetalleAbierto(true);
                        }
                      }}
                    >
                      {modoSeleccionMultiple && (
                        <div className="absolute top-4 right-4">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleSeleccion(m.id_mantenimiento)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      {vencido && (
                        <div className="absolute top-4 left-4">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                            ⚠️ Vencido
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-4 mt-4">
                        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white flex-shrink-0 overflow-hidden shadow-lg">
                          {m.equipo.foto_url ? (
                            <Image
                              src={m.equipo.foto_url}
                              alt={m.equipo.nombre}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Wrench className="w-8 h-8" />
                          )}
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p
                                className={`text-sm font-black mb-1 ${tema.colores.texto} line-clamp-2`}
                              >
                                {m.equipo.nombre}
                              </p>
                              <p
                                className={`text-xs ${tema.colores.textoSecundario} line-clamp-1`}
                              >
                                {m.equipo.marca} {m.equipo.modelo} • {m.equipo.serie}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${obtenerColorPrioridad(
                                  m.prioridad
                                )}`}
                              >
                                {m.prioridad.toUpperCase()}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${obtenerColorEstado(
                                  m.estado
                                )}`}
                              >
                                {m.estado.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <p
                            className={`text-xs mb-2 ${tema.colores.textoSecundario} line-clamp-2`}
                          >
                            {m.descripcion}
                          </p>

                          <div className="space-y-1 mb-3 text-[11px]">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className={tema.colores.texto}>
                                {m.equipo.ubicacion}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className={tema.colores.texto}>
                                Programado: {formatearFecha(m.fecha_programada)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-3 h-3 text-gray-500" />
                              <span className={tema.colores.texto}>
                                {m.nombre_tecnico}
                              </span>
                            </div>
                            {m.duracion_estimada && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className={tema.colores.texto}>
                                  Estimado: {formatearTiempo(m.duracion_estimada)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {m.estado === "programado" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  iniciarMantenimiento(m.id_mantenimiento);
                                }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-lg"
                              >
                                <Play className="w-3 h-3" />
                                Iniciar
                              </button>
                            )}

                            {m.estado === "en_progreso" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completarMantenimiento(m.id_mantenimiento);
                                }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 shadow-lg"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Completar
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOrdenSeleccionada(m);
                                setPanelDetalleAbierto(true);
                              }}
                              className={`p-1.5 rounded-lg ${tema.colores.secundario} ${tema.colores.texto}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {m.checklist && m.checklist.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-700/40">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                            >
                              Checklist
                            </span>
                            <span
                              className={`text-[11px] font-bold ${tema.colores.texto}`}
                            >
                              {
                                m.checklist.filter((c) => c.completado)
                                  .length
                              }
                              /{m.checklist.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (m.checklist.filter((c) => c.completado).length /
                                    m.checklist.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* LISTA */}
            {vista.modo === "lista" && (
              <div
                className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={tema.colores.secundario}>
                      <tr>
                        {modoSeleccionMultiple && (
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={
                                seleccionados.length === correctivosFiltrados.length &&
                                correctivosFiltrados.length > 0
                              }
                              onChange={seleccionarTodos}
                            />
                          </th>
                        )}
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Equipo
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Prioridad
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Ubicación
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Fecha programada
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Técnico
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tema.colores.borde}`}>
                      {correctivosFiltrados.map((m) => {
                        const isSel = seleccionados.includes(m.id_mantenimiento);
                        const vencido = esVencido(m.fecha_programada, m.estado);

                        return (
                          <tr
                            key={m.id_mantenimiento}
                            className={`${tema.colores.hover} cursor-pointer ${
                              isSel ? "bg-purple-500/10" : ""
                            } ${vencido ? "bg-red-500/5" : ""}`}
                            onClick={() => {
                              if (modoSeleccionMultiple) {
                                toggleSeleccion(m.id_mantenimiento);
                              } else {
                                setOrdenSeleccionada(m);
                                setPanelDetalleAbierto(true);
                              }
                            }}
                          >
                            {modoSeleccionMultiple && (
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={isSel}
                                  onChange={() => toggleSeleccion(m.id_mantenimiento)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                {vencido && (
                                  <span className="text-[10px] text-red-400 font-bold">
                                    Vencido
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
                                  {m.equipo.foto_url ? (
                                    <Image
                                      src={m.equipo.foto_url}
                                      alt={m.equipo.nombre}
                                      width={32}
                                      height={32}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <Wrench className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p
                                    className={`text-xs font-bold ${tema.colores.texto}`}
                                  >
                                    {m.equipo.nombre}
                                  </p>
                                  <p
                                    className={`text-[11px] ${tema.colores.textoSecundario}`}
                                  >
                                    {m.equipo.marca} {m.equipo.modelo}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                                  m.prioridad
                                )}`}
                              >
                                {m.prioridad.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                {m.equipo.ubicacion}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                {formatearFecha(m.fecha_programada)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {m.foto_tecnico ? (
                                  <Image
                                    src={m.foto_tecnico}
                                    alt={m.nombre_tecnico}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-[10px] font-bold">
                                    {m.nombre_tecnico
                                      .split(" ")
                                      .map((x) => x[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </div>
                                )}
                                <span
                                  className={`text-xs font-semibold ${tema.colores.texto}`}
                                >
                                  {m.nombre_tecnico}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {m.estado === "programado" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      iniciarMantenimiento(m.id_mantenimiento);
                                    }}
                                    className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Play className="w-3 h-3" />
                                  </button>
                                )}
                                {m.estado === "en_progreso" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      completarMantenimiento(m.id_mantenimiento);
                                    }}
                                    className="p-1.5 rounded bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrdenSeleccionada(m);
                                    setPanelDetalleAbierto(true);
                                  }}
                                  className={`p-1.5 rounded ${tema.colores.secundario} ${tema.colores.texto}`}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGINACION (placeholder simple) */}
        {correctivosFiltrados.length > 0 && (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 flex items-center justify-between ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <p className={`text-xs ${tema.colores.textoSecundario}`}>
              Mostrando {correctivosFiltrados.length} de {resumen.total} órdenes
              correctivas
            </p>
            <div className="flex items-center gap-1 text-xs">
              <button
                className={`px-3 py-1 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <span className={tema.colores.texto}>Página 1</span>
              <button
                className={`px-3 py-1 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer
          className={`mt-10 rounded-2xl py-5 px-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className={tema.colores.texto}>
                  © 2025 AnyssaMed · Módulo Correctivo
                </p>
                <p className={tema.colores.textoSecundario}>
                  Gestión de mantenimiento correctivo v1.0.0
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className={tema.colores.textoSecundario}>
                🌐 {usuario.tecnico?.region}
              </span>
              <span className={tema.colores.textoSecundario}>
                ⏰ {usuario.tecnico?.zona_horaria}
              </span>
              <span className={tema.colores.textoSecundario}>
                🔄 Auto-refresh: {autoRefresh ? `${intervaloRefresh / 1000}s` : "Off"}
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* PANEL LATERAL DETALLE */}
      {panelDetalleAbierto && ordenSeleccionada && (
        <div
          className={`fixed top-0 right-0 h-full w-[420px] ${tema.colores.card} ${tema.colores.borde} border-l ${tema.colores.sombra} z-50 overflow-y-auto custom-scrollbar`}
        >
          <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 p-5 z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Correctivo #{ordenSeleccionada.id_mantenimiento}
              </h3>
              <button
                onClick={() => setPanelDetalleAbierto(false)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span
                className={`px-2 py-1 rounded-full font-bold border ${obtenerColorPrioridad(
                  ordenSeleccionada.prioridad
                )}`}
              >
                {ordenSeleccionada.prioridad.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded-full font-bold border ${obtenerColorEstado(
                  ordenSeleccionada.estado
                )}`}
              >
                {ordenSeleccionada.estado.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5 text-xs">
            {/* Equipo */}
            <div>
              <p
                className={`text-sm font-bold mb-2 flex items-center gap-2 ${tema.colores.texto}`}
              >
                <HardDrive className="w-4 h-4" />
                Equipo
              </p>
              <div
                className={`rounded-xl p-3 ${tema.colores.secundario} ${tema.colores.borde} border`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
                    {ordenSeleccionada.equipo.foto_url ? (
                      <Image
                        src={ordenSeleccionada.equipo.foto_url}
                        alt={ordenSeleccionada.equipo.nombre}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <Wrench className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {ordenSeleccionada.equipo.nombre}
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      {ordenSeleccionada.equipo.marca}{" "}
                      {ordenSeleccionada.equipo.modelo}
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Serie: {ordenSeleccionada.equipo.serie}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>Ubicación</span>
                    <span className={tema.colores.texto}>
                      {ordenSeleccionada.equipo.ubicacion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>Estado</span>
                    <span className={tema.colores.texto}>
                      {ordenSeleccionada.equipo.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={tema.colores.textoSecundario}>Criticidad</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold border ${obtenerColorPrioridad(
                        ordenSeleccionada.equipo.criticidad
                      )}`}
                    >
                      {ordenSeleccionada.equipo.criticidad.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <p
                className={`text-sm font-bold mb-2 flex items-center gap-2 ${tema.colores.texto}`}
              >
                <Calendar className="w-4 h-4" />
                Programación
              </p>
              <div
                className={`rounded-xl p-3 ${tema.colores.info} ${tema.colores.borde} border`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Programado</span>
                  <span>
                    {formatearFechaCompleta(ordenSeleccionada.fecha_programada)}
                  </span>
                </div>
                {ordenSeleccionada.fecha_inicio && (
                  <div className="flex items-center justify-between mb-1">
                    <span>Inicio</span>
                    <span>
                      {formatearFechaCompleta(ordenSeleccionada.fecha_inicio)}
                    </span>
                  </div>
                )}
                {ordenSeleccionada.fecha_fin && (
                  <div className="flex items-center justify-between mb-1">
                    <span>Fin</span>
                    <span>{formatearFechaCompleta(ordenSeleccionada.fecha_fin)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-1">
                  <span>Duración estimada</span>
                  <span>
                    {formatearTiempo(ordenSeleccionada.duracion_estimada)}
                  </span>
                </div>
                {ordenSeleccionada.duracion_real && (
                  <div className="flex items-center justify-between">
                    <span>Duración real</span>
                    <span>
                      {formatearTiempo(ordenSeleccionada.duracion_real)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Técnico */}
            <div>
              <p
                className={`text-sm font-bold mb-2 flex items-center gap-2 ${tema.colores.texto}`}
              >
                <UserCheck className="w-4 h-4" />
                Técnico asignado
              </p>
              <div
                className={`rounded-xl p-3 ${tema.colores.secundario} ${tema.colores.borde} border flex items-center gap-3`}
              >
                {ordenSeleccionada.foto_tecnico ? (
                  <Image
                    src={ordenSeleccionada.foto_tecnico}
                    alt={ordenSeleccionada.nombre_tecnico}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                    {ordenSeleccionada.nombre_tecnico
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className={tema.colores.texto}>
                    {ordenSeleccionada.nombre_tecnico}
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Técnico de mantenimiento
                  </p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                Descripción
              </p>
              <div
                className={`rounded-xl p-3 ${tema.colores.secundario} ${tema.colores.borde} border`}
              >
                <p className={tema.colores.textoSecundario}>
                  {ordenSeleccionada.descripcion}
                </p>
              </div>
            </div>

            {/* Checklist */}
            {ordenSeleccionada.checklist &&
              ordenSeleccionada.checklist.length > 0 && (
                <div>
                  <p
                    className={`text-sm font-bold mb-1 flex items-center gap-2 ${tema.colores.texto}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Checklist
                  </p>
                  <div className="space-y-2">
                    {ordenSeleccionada.checklist.map((c) => (
                      <div
                        key={c.id_item}
                        className={`rounded-xl p-2 flex items-start gap-2 ${tema.colores.secundario} ${tema.colores.borde} border`}
                      >
                        <div className="mt-0.5">
                          {c.completado ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${tema.colores.texto} ${
                              c.completado ? "line-through opacity-70" : ""
                            }`}
                          >
                            {c.descripcion}
                            {c.es_critico && (
                              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300">
                                Crítico
                              </span>
                            )}
                          </p>
                          {c.observaciones && (
                            <p className={tema.colores.textoSecundario}>
                              {c.observaciones}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Repuestos */}
            {ordenSeleccionada.repuestos_utilizados &&
              ordenSeleccionada.repuestos_utilizados.length > 0 && (
                <div>
                  <p
                    className={`text-sm font-bold mb-1 flex items-center gap-2 ${tema.colores.texto}`}
                  >
                    <Package className="w-4 h-4" />
                    Repuestos utilizados
                  </p>
                  <div className="space-y-2">
                    {ordenSeleccionada.repuestos_utilizados.map((r) => (
                      <div
                        key={r.id_repuesto}
                        className={`rounded-xl p-2 ${tema.colores.secundario} ${tema.colores.borde} border`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={tema.colores.texto}>{r.nombre}</span>
                          <span className={tema.colores.texto}>
                            $
                            {r.costo_total.toLocaleString("es-CL", {
                              minimumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={tema.colores.textoSecundario}>
                            Cod: {r.codigo}
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            Cant: {r.cantidad}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`mt-3 rounded-xl p-2 ${tema.colores.warning} ${tema.colores.borde} border`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Costo total correctivo</span>
                      <span>
                        $
                        {ordenSeleccionada.costo_total.toLocaleString("es-CL", {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Historial */}
            {ordenSeleccionada.historial &&
              ordenSeleccionada.historial.length > 0 && (
                <div>
                  <p
                    className={`text-sm font-bold mb-1 flex items-center gap-2 ${tema.colores.texto}`}
                  >
                    <History className="w-4 h-4" />
                    Historial
                  </p>
                  <div className="space-y-2">
                    {ordenSeleccionada.historial.map((h) => (
                      <div
                        key={h.id_historial}
                        className={`rounded-xl p-2 ${tema.colores.secundario} ${tema.colores.borde} border`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[11px] font-bold ${tema.colores.texto}`}
                          >
                            {h.accion}
                          </span>
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            {formatearFecha(h.fecha)}
                          </span>
                        </div>
                        <p className={tema.colores.textoSecundario}>{h.descripcion}</p>
                        <p
                          className={`mt-1 text-[11px] font-semibold ${tema.colores.texto}`}
                        >
                          Por: {h.usuario}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Info importante */}
            <div
              className={`rounded-xl p-3 ${tema.colores.success} ${tema.colores.borde} border`}
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-green-400 mt-0.5" />
                <div>
                  <p className={`text-xs font-bold mb-1 ${tema.colores.texto}`}>
                    Recomendación
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Antes de cerrar el correctivo, verifica que el equipo esté en
                    producción y que el usuario final confirme la solución.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILO SCROLLBAR MINIMO */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f97316 0%, #dc2626 100%);
          border-radius: 999px;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
