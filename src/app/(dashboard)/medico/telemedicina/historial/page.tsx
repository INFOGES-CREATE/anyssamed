//frontend\src\app\(dashboard)\medico\telemedicina\historial\page.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Download,
  FileText,
  HeartPulse,
  Moon,
  Phone,
  Mail,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  User,
  Video,
  X,
  Star,
  Clock,
  Filter,
  LayoutGrid,
  Rows,
  Table as TableIcon,
  SortAsc,
  TrendingUp,
  Users,
  Zap,
  Award,
  ChevronRight,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Minus,
  ArrowUpRight,
  Eye,
  EyeOff,
  Globe,
  Wifi,
  Battery,
  CloudRain,
  ThermometerSun,
  Wind,
  Droplets,
  Heart,
  Brain,
  Pill,
  Syringe,
  Microscope,
  TestTube,
  Clipboard,
  FolderOpen,
  FileCheck,
  UserCheck,
  UserX,
  UserPlus,
  TrendingDown,
  BarChart,
  LineChart,
  DollarSign,
  CreditCard,
  Wallet,
  Receipt,
  Package,
  Truck,
  Home,
  Building,
  Hospital,
  Ambulance,
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  Camera,
  Mic,
  PhoneCall,
  PhoneOff,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Share2,
  Link2,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreVertical,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  CircleDot,
  Square,
  CheckSquare,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
} from "lucide-react";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "aurora" | "midnight" | "ocean" | "royal" | "emerald" | "crimson" | "platinum";
type VistaPacientes = "tarjetas" | "lista" | "tabla" | "grid" | "timeline";
type FiltroEstado = "todos" | "criticos" | "cronicos" | "recientes" | "sin_contacto" | "favoritos" | "urgentes";
type OrdenPacientes = "nombre_asc" | "nombre_desc" | "ultima_desc" | "ultima_asc" | "tele_desc" | "criticos_desc" | "calificacion_desc";

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
    success: string;
    warning: string;
    danger: string;
    info: string;
    glass: string;
    glow: string;
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
    numero_registro_medico?: string;
    titulo_profesional?: string;
  };
}

interface PacienteListado {
  id_paciente: number;
  nombre_completo: string;
  edad: number | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  grupo_sanguineo: string | null;
  total_consultas?: number;
  consultas_telemedicina?: number;
  ultima_consulta?: string | null;
  alergias_criticas?: number;
  alergias_nombres?: string[];
  condiciones_cronicas?: string[];
  calificacion_promedio?: number;
  rut?: string | null;
  ciudad?: string | null;
  region?: string | null;
  fecha_ultima_atencion?: string | null;
  favorito?: boolean;
  urgente?: boolean;
  notas?: string;
}

// ========================================
// TEMAS ULTRA PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  aurora: {
    nombre: "Aurora Borealis",
    icono: Sparkles,
    colores: {
      fondo: "from-indigo-950 via-purple-950 to-pink-950",
      fondoSecundario: "bg-slate-950",
      texto: "text-white",
      textoSecundario: "text-indigo-300",
      primario: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-indigo-400",
      borde: "border-white/10",
      sombra: "shadow-2xl shadow-indigo-500/30",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-slate-950/50 backdrop-blur-3xl border-white/10",
      header: "bg-slate-950/80 backdrop-blur-3xl border-white/10",
      card: "bg-slate-900/40 backdrop-blur-2xl border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-indigo-500/50",
    },
  },
  midnight: {
    nombre: "Midnight Elegance",
    icono: Moon,
    colores: {
      fondo: "from-gray-950 via-slate-950 to-zinc-950",
      fondoSecundario: "bg-black",
      texto: "text-gray-100",
      textoSecundario: "text-gray-400",
      primario: "bg-gradient-to-r from-gray-700 via-slate-700 to-zinc-700 hover:from-gray-600 hover:via-slate-600 hover:to-zinc-600",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-gray-300",
      borde: "border-white/10",
      sombra: "shadow-2xl shadow-black/60",
      gradiente: "from-gray-600 via-slate-600 to-zinc-600",
      sidebar: "bg-black/50 backdrop-blur-3xl border-white/10",
      header: "bg-black/80 backdrop-blur-3xl border-white/10",
      card: "bg-zinc-900/40 backdrop-blur-2xl border-white/10 hover:border-gray-500/50 hover:shadow-2xl hover:shadow-gray-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-gray-500/50",
    },
  },
  ocean: {
    nombre: "Deep Ocean",
    icono: Droplets,
    colores: {
      fondo: "from-cyan-950 via-blue-950 to-indigo-950",
      fondoSecundario: "bg-blue-950",
      texto: "text-cyan-50",
      textoSecundario: "text-cyan-300",
      primario: "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-cyan-400",
      borde: "border-cyan-900/50",
      sombra: "shadow-2xl shadow-cyan-500/30",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-950/50 backdrop-blur-3xl border-cyan-900/50",
      header: "bg-blue-950/80 backdrop-blur-3xl border-cyan-900/50",
      card: "bg-blue-900/40 backdrop-blur-2xl border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-cyan-500/50",
    },
  },
  royal: {
    nombre: "Royal Purple",
    icono: Award,
    colores: {
      fondo: "from-purple-950 via-violet-950 to-fuchsia-950",
      fondoSecundario: "bg-purple-950",
      texto: "text-purple-50",
      textoSecundario: "text-purple-300",
      primario: "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:via-violet-500 hover:to-fuchsia-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-purple-400",
      borde: "border-purple-900/50",
      sombra: "shadow-2xl shadow-purple-500/30",
      gradiente: "from-purple-500 via-violet-500 to-fuchsia-500",
      sidebar: "bg-purple-950/50 backdrop-blur-3xl border-purple-900/50",
      header: "bg-purple-950/80 backdrop-blur-3xl border-purple-900/50",
      card: "bg-purple-900/40 backdrop-blur-2xl border-purple-900/50 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-purple-500/50",
    },
  },
  emerald: {
    nombre: "Emerald Garden",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-green-950 to-teal-950",
      fondoSecundario: "bg-emerald-950",
      texto: "text-emerald-50",
      textoSecundario: "text-emerald-300",
      primario: "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-emerald-400",
      borde: "border-emerald-900/50",
      sombra: "shadow-2xl shadow-emerald-500/30",
      gradiente: "from-emerald-500 via-green-500 to-teal-500",
      sidebar: "bg-emerald-950/50 backdrop-blur-3xl border-emerald-900/50",
      header: "bg-emerald-950/80 backdrop-blur-3xl border-emerald-900/50",
      card: "bg-emerald-900/40 backdrop-blur-2xl border-emerald-900/50 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-teal-500/10 text-teal-300 border-teal-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-emerald-500/50",
    },
  },
  crimson: {
    nombre: "Crimson Passion",
    icono: Heart,
    colores: {
      fondo: "from-rose-950 via-red-950 to-pink-950",
      fondoSecundario: "bg-rose-950",
      texto: "text-rose-50",
      textoSecundario: "text-rose-300",
      primario: "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:via-red-500 hover:to-pink-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-rose-400",
      borde: "border-rose-900/50",
      sombra: "shadow-2xl shadow-rose-500/30",
      gradiente: "from-rose-500 via-red-500 to-pink-500",
      sidebar: "bg-rose-950/50 backdrop-blur-3xl border-rose-900/50",
      header: "bg-rose-950/80 backdrop-blur-3xl border-rose-900/50",
      card: "bg-rose-900/40 backdrop-blur-2xl border-rose-900/50 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-rose-500/50",
    },
  },
  platinum: {
    nombre: "Platinum White",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-gray-50 to-zinc-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 hover:from-slate-700 hover:via-gray-700 hover:to-zinc-700",
      secundario: "bg-black/5 hover:bg-black/10 backdrop-blur-xl",
      acento: "text-slate-700",
      borde: "border-gray-200",
      sombra: "shadow-2xl shadow-gray-400/30",
      gradiente: "from-slate-700 via-gray-700 to-zinc-700",
      sidebar: "bg-white/90 backdrop-blur-3xl border-gray-200",
      header: "bg-white/95 backdrop-blur-3xl border-gray-200",
      card: "bg-white/80 backdrop-blur-2xl border-gray-200 hover:border-slate-400 hover:shadow-2xl hover:shadow-gray-400/20",
      hover: "hover:bg-black/5",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
      glass: "bg-white/60 backdrop-blur-2xl",
      glow: "shadow-lg shadow-gray-400/50",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL ULTRA PREMIUM
// ========================================

export default function PacientesTelemedicinaUltraPremium() {
  const router = useRouter();

  // Estados principales
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [pacientes, setPacientes] = useState<PacienteListado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [vistaActual, setVistaActual] = useState<VistaPacientes>("tarjetas");
  const [orden, setOrden] = useState<OrdenPacientes>("nombre_asc");

  // Estados de UI
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteListado | null>(null);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [temaActual, setTemaActual] = useState<TemaColor>("aurora");
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [modoCompacto, setModoCompacto] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // CARGAR SESIÓN USUARIO
  // ========================================
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const resp = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!resp.ok) throw new Error("No hay sesión activa");

        const data = await resp.json();
        if (data.success && data.usuario) {
          const rolNombre = data.usuario?.rol?.nombre ?? "";
          const rolNorm = rolNombre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
          const esMedico = rolNorm.includes("MEDICO");
          if (!esMedico || !data.usuario.medico) {
            alert("Acceso denegado. Este módulo es solo para médicos.");
            router.push("/");
            return;
          }
          setUsuario(data.usuario);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [router]);

  // ========================================
  // CARGAR PACIENTES
  // ========================================
  const cargarPacientes = useCallback(async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const resp = await fetch("/api/telemedicina/pacientes", {
        method: "GET",
        credentials: "include",
      });

      if (!resp.ok) throw new Error("No se pudieron cargar los pacientes");

      const data = await resp.json();
      if (!data.success) throw new Error(data.error || "Error al cargar pacientes");

      const lista: PacienteListado[] = (data.pacientes ?? []).map((p: any) => ({
        id_paciente: p.id_paciente,
        nombre_completo: p.nombre_completo ?? "Sin nombre",
        rut: p.rut ?? null,
        edad: p.edad ?? null,
        genero: p.genero ?? null,
        telefono: p.telefono ?? null,
        email: p.email ?? null,
        foto_url: p.foto_url ?? null,
        grupo_sanguineo: p.grupo_sanguineo ?? null,
        ciudad: p.ciudad ?? null,
        region: p.region ?? null,
        total_consultas: p.total_consultas ?? 0,
        consultas_telemedicina: p.consultas_telemedicina ?? 0,
        ultima_consulta: p.ultima_consulta ?? null,
        alergias_criticas: p.alergias_criticas ?? 0,
        alergias_nombres:
          typeof p.alergias_nombres === "string" && p.alergias_nombres.length
            ? p.alergias_nombres.split("|")
            : Array.isArray(p.alergias_nombres)
            ? p.alergias_nombres
            : [],
        condiciones_cronicas:
          typeof p.condiciones_cronicas === "string" && p.condiciones_cronicas.length
            ? p.condiciones_cronicas.split("|")
            : Array.isArray(p.condiciones_cronicas)
            ? p.condiciones_cronicas
            : [],
        calificacion_promedio: p.calificacion_promedio ?? 0,
        fecha_ultima_atencion: p.ultima_consulta ?? null,
        favorito: p.favorito ?? false,
        urgente: p.urgente ?? false,
        notas: p.notas ?? "",
      }));

      setPacientes(lista);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      cargarPacientes();
    }
  }, [usuario, cargarPacientes]);

  // ========================================
  // ESTADÍSTICAS MEJORADAS
  // ========================================
  const stats = useMemo(() => {
    const total = pacientes.length;
    const alergicos = pacientes.filter(
      (p) => (p.alergias_criticas ?? 0) > 0 || (p.alergias_nombres ?? []).length > 0
    ).length;
    const cronicos = pacientes.filter((p) => (p.condiciones_cronicas ?? []).length > 0).length;
    const conTele = pacientes.filter((p) => (p.consultas_telemedicina ?? 0) > 0).length;
    const promedioSatisfaccion =
      total > 0
        ? Number((pacientes.reduce((sum, p) => sum + (p.calificacion_promedio ?? 0), 0) / total).toFixed(1))
        : 0;
    const atendidosHoy = pacientes.filter((p) => {
      if (!p.ultima_consulta) return false;
      const hoy = new Date().toDateString();
      const fecha = new Date(p.ultima_consulta).toDateString();
      return hoy === fecha;
    }).length;
    const favoritos = pacientes.filter((p) => p.favorito).length;
    const urgentes = pacientes.filter((p) => p.urgente).length;
    const sinContacto = pacientes.filter((p) => !p.ultima_consulta).length;
    
    // Estadísticas por género
    const masculinos = pacientes.filter((p) => p.genero?.toLowerCase() === 'm' || p.genero?.toLowerCase() === 'masculino').length;
    const femeninos = pacientes.filter((p) => p.genero?.toLowerCase() === 'f' || p.genero?.toLowerCase() === 'femenino').length;
    
    // Rango de edades
    const edades = pacientes.filter((p) => p.edad !== null).map((p) => p.edad!);
    const edadPromedio = edades.length > 0 ? Math.round(edades.reduce((sum, e) => sum + e, 0) / edades.length) : 0;
    const edadMin = edades.length > 0 ? Math.min(...edades) : 0;
    const edadMax = edades.length > 0 ? Math.max(...edades) : 0;

    return {
      total,
      alergicos,
      cronicos,
      conTele,
      promedioSatisfaccion,
      atendidosHoy,
      favoritos,
      urgentes,
      sinContacto,
      masculinos,
      femeninos,
      edadPromedio,
      edadMin,
      edadMax,
    };
  }, [pacientes]);

  // ========================================
  // FILTROS Y ORDENAMIENTO MEJORADOS
  // ========================================
  const pacientesFiltrados = useMemo(() => {
    let lista = [...pacientes];

    // Aplicar filtros
    switch (filtro) {
      case "criticos":
        lista = lista.filter((p) => (p.alergias_criticas ?? 0) > 0);
        break;
      case "cronicos":
        lista = lista.filter((p) => (p.condiciones_cronicas ?? []).length > 0);
        break;
      case "recientes":
        lista = lista.filter((p) => p.ultima_consulta);
        break;
      case "sin_contacto":
        lista = lista.filter((p) => !p.ultima_consulta);
        break;
      case "favoritos":
        lista = lista.filter((p) => p.favorito);
        break;
      case "urgentes":
        lista = lista.filter((p) => p.urgente);
        break;
    }

    // Aplicar búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(q) ||
          (p.rut ?? "").toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q) ||
          (p.telefono ?? "").toLowerCase().includes(q) ||
          (p.ciudad ?? "").toLowerCase().includes(q) ||
          (p.grupo_sanguineo ?? "").toLowerCase().includes(q)
      );
    }

    // Aplicar ordenamiento
    lista.sort((a, b) => {
      switch (orden) {
        case "nombre_asc":
          return a.nombre_completo.localeCompare(b.nombre_completo);
        case "nombre_desc":
          return b.nombre_completo.localeCompare(a.nombre_completo);
        case "ultima_desc":
          const da = a.ultima_consulta ? new Date(a.ultima_consulta).getTime() : 0;
          const db = b.ultima_consulta ? new Date(b.ultima_consulta).getTime() : 0;
          return db - da;
        case "ultima_asc":
          const daa = a.ultima_consulta ? new Date(a.ultima_consulta).getTime() : 0;
          const dbb = b.ultima_consulta ? new Date(b.ultima_consulta).getTime() : 0;
          return daa - dbb;
        case "tele_desc":
          return (b.consultas_telemedicina ?? 0) - (a.consultas_telemedicina ?? 0);
        case "criticos_desc":
          return (b.alergias_criticas ?? 0) - (a.alergias_criticas ?? 0);
        case "calificacion_desc":
          return (b.calificacion_promedio ?? 0) - (a.calificacion_promedio ?? 0);
        default:
          return 0;
      }
    });

    return lista;
  }, [pacientes, filtro, busqueda, orden]);

  // ========================================
  // LOADING STATE PREMIUM
  // ========================================
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}>
        {/* Fondo animado */}
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-20 w-72 h-72 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl opacity-20 animate-pulse`}></div>
          <div className={`absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl opacity-20 animate-pulse delay-1000`}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl opacity-10 animate-pulse delay-500`}></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-12">
            {/* Círculo exterior */}
            <div className="w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-r from-transparent via-indigo-500 to-transparent bg-clip-border animate-spin mx-auto absolute inset-0"></div>
            <div className={`w-40 h-40 rounded-full border-4 ${tema.colores.borde} animate-spin mx-auto`}></div>
            
            {/* Contenedor central con efecto glassmorphism */}
            <div
              className={`w-28 h-28 rounded-3xl ${tema.colores.glass} ${tema.colores.borde} border-2 flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${tema.colores.sombra}`}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl animate-pulse`}>
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className={`text-5xl font-black mb-4 ${tema.colores.texto} animate-pulse bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
            Cargando Plataforma
          </h2>
          <p className={`text-xl ${tema.colores.textoSecundario} mb-2`}>
            Preparando el sistema más avanzado del mundo
          </p>
          <p className={`text-sm ${tema.colores.textoSecundario} opacity-60`}>
            Obteniendo datos de pacientes de telemedicina...
          </p>
          
          {/* Barra de progreso elegante */}
          <div className={`w-64 h-2 ${tema.colores.glass} rounded-full overflow-hidden mt-8 mx-auto ${tema.colores.borde} border`}>
            <div className={`h-full bg-gradient-to-r ${tema.colores.gradiente} animate-pulse rounded-full`} style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE PREMIUM
  // ========================================
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} p-6 relative overflow-hidden`}>
        {/* Fondo animado */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div
          className={`text-center max-w-md mx-auto p-12 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border-2 relative z-10 backdrop-blur-2xl`}
        >
          <div className={`w-28 h-28 rounded-3xl ${tema.colores.danger} ${tema.colores.borde} border-2 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30 animate-pulse`}>
            <XCircle className="w-14 h-14" />
          </div>
          <h2 className={`text-5xl font-black mb-5 ${tema.colores.texto} bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent`}>
            Error del Sistema
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-8 py-4 rounded-2xl ${tema.colores.primario} text-white font-black text-base shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto group`}
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Reintentar Carga
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // VISTA DE TARJETAS ULTRA PREMIUM
  // ========================================
  const renderVistaTarjetas = () => (
    <div className={`grid ${modoCompacto ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'}`}>
      {pacientesFiltrados.length === 0 ? (
        <div
          className={`col-span-full rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 p-16 text-center backdrop-blur-2xl`}
        >
          <div className={`w-24 h-24 rounded-3xl ${tema.colores.glass} ${tema.colores.borde} border-2 flex items-center justify-center mx-auto mb-6 shadow-xl`}>
            <User className={`w-12 h-12 ${tema.colores.textoSecundario}`} />
          </div>
          <h3 className={`text-2xl font-black ${tema.colores.texto} mb-3`}>No se encontraron pacientes</h3>
          <p className={`${tema.colores.textoSecundario} text-lg mb-6`}>Intenta ajustar los filtros o la búsqueda</p>
          <button
            onClick={() => {
              setBusqueda("");
              setFiltro("todos");
            }}
            className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-300`}
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      ) : (
        pacientesFiltrados.map((paciente) => (
          <div
            key={paciente.id_paciente}
            className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} ${modoCompacto ? 'p-5' : 'p-7'} flex flex-col gap-5 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 group backdrop-blur-2xl relative overflow-hidden`}
            onClick={() => setPacienteSeleccionado(paciente)}
          >
            {/* Efecto de brillo al hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
            
            {/* Badges de estado en la esquina superior */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              {paciente.favorito && (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-pulse`}>
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
              )}
              {paciente.urgente && (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg animate-pulse`}>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Header del card */}
            <div className="flex items-start gap-5 relative z-10">
              <div className="relative group/avatar">
                <div
                  className={`${modoCompacto ? 'w-16 h-16' : 'w-20 h-20'} rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black ${modoCompacto ? 'text-xl' : 'text-2xl'} overflow-hidden shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative`}
                >
                  {/* Anillo de progreso decorativo */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-white/20 group-hover/avatar:border-white/40 transition-colors duration-300"></div>
                  
                  {paciente.foto_url ? (
                    <Image
                      src={paciente.foto_url}
                      alt={paciente.nombre_completo}
                      width={modoCompacto ? 64 : 80}
                      height={modoCompacto ? 64 : 80}
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    paciente.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                  )}
                </div>
                
                {/* Indicador de estado online */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-950 shadow-lg"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className={`${modoCompacto ? 'text-lg' : 'text-xl'} font-black ${tema.colores.texto} mb-2 truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${tema.colores.gradiente} group-hover:bg-clip-text transition-all duration-300`}>
                  {paciente.nombre_completo}
                </h2>
                <p className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-2 mb-1`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tema.colores.gradiente}`}></div>
                  {paciente.rut ?? "RUT no registrado"}
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-2`}>
                  <User className="w-3 h-3" />
                  {paciente.edad ? `${paciente.edad} años` : "Edad no reg."}
                  {paciente.genero && ` • ${paciente.genero}`}
                </p>
                {paciente.ciudad && (
                  <p className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-2 mt-2`}>
                    <MapPin className="w-3 h-3" />
                    {`${paciente.ciudad}${paciente.region ? `, ${paciente.region}` : ""}`}
                  </p>
                )}
              </div>
              
              {paciente.grupo_sanguineo && (
                <div className={`px-4 py-2 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 ${tema.colores.borde} border-2 shadow-lg`}>
                  <span className={`text-sm font-black text-red-300`}>{paciente.grupo_sanguineo}</span>
                </div>
              )}
            </div>

            {/* Badges de condiciones */}
            <div className="flex flex-wrap gap-2">
              {(paciente.alergias_criticas ?? 0) > 0 ? (
                <div
                  className={`px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 ${tema.colores.borde} border-2 text-xs font-bold flex items-center gap-2 shadow-md backdrop-blur-xl group/badge hover:scale-105 transition-transform duration-300`}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center group-hover/badge:rotate-12 transition-transform duration-300`}>
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-red-300">Alergia crítica</span>
                </div>
              ) : (
                (paciente.alergias_nombres ?? []).length > 0 && (
                  <div className={`px-4 py-2 rounded-2xl bg-amber-500/20 ${tema.colores.borde} border-2 text-xs font-bold shadow-md backdrop-blur-xl hover:scale-105 transition-transform duration-300`}>
                    <span className="text-amber-300">{(paciente.alergias_nombres ?? []).length} Alergias</span>
                  </div>
                )
              )}

              {(paciente.condiciones_cronicas ?? []).length > 0 && (
                <div
                  className={`px-4 py-2 rounded-2xl bg-amber-500/20 ${tema.colores.borde} border-2 text-xs font-bold flex items-center gap-2 shadow-md backdrop-blur-xl group/badge hover:scale-105 transition-transform duration-300`}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover/badge:rotate-12 transition-transform duration-300`}>
                    <HeartPulse className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-amber-300">{(paciente.condiciones_cronicas ?? []).length} Crónicas</span>
                </div>
              )}

              <div
                className={`px-4 py-2 rounded-2xl bg-blue-500/20 ${tema.colores.borde} border-2 text-xs font-bold flex items-center gap-2 shadow-md backdrop-blur-xl hover:scale-105 transition-transform duration-300`}
              >
                <Calendar className="w-3 h-3 text-blue-300" />
                <span className="text-blue-300">
                  {paciente.ultima_consulta
                    ? new Date(paciente.ultima_consulta).toLocaleDateString("es-CL")
                    : "Sin atención"}
                </span>
              </div>

              {paciente.calificacion_promedio && paciente.calificacion_promedio > 0 && (
                <div
                  className={`px-4 py-2 rounded-2xl bg-emerald-500/20 ${tema.colores.borde} border-2 text-xs font-bold flex items-center gap-2 shadow-md backdrop-blur-xl hover:scale-105 transition-transform duration-300`}
                >
                  <Star className="w-3 h-3 fill-emerald-300 text-emerald-300" />
                  <span className="text-emerald-300">{paciente.calificacion_promedio}/5.0</span>
                </div>
              )}
            </div>

            {/* Información de contacto con iconos premium */}
            <div className={`space-y-3 ${modoCompacto ? 'text-xs' : 'text-sm'}`}>
              <div className={`flex items-center gap-3 p-3 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border transition-all duration-300 hover:border-blue-500/50`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg`}>
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] ${tema.colores.textoSecundario} mb-0.5`}>Teléfono</p>
                  <p className={`font-bold ${tema.colores.texto} truncate`}>{paciente.telefono || "No registrado"}</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border transition-all duration-300 hover:border-purple-500/50`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg`}>
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] ${tema.colores.textoSecundario} mb-0.5`}>Email</p>
                  <p className={`font-bold ${tema.colores.texto} truncate`}>{paciente.email || "No registrado"}</p>
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border`}>
              <div className="text-center">
                <p className={`text-2xl font-black ${tema.colores.texto} mb-1 bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
                  {paciente.total_consultas ?? 0}
                </p>
                <p className={`text-[10px] ${tema.colores.textoSecundario}`}>Consultas Totales</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-black ${tema.colores.texto} mb-1 bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
                  {paciente.consultas_telemedicina ?? 0}
                </p>
                <p className={`text-[10px] ${tema.colores.textoSecundario}`}>Telemedicina</p>
              </div>
            </div>

            {/* Acciones con efectos premium */}
            <div className="flex gap-3 mt-auto pt-5 border-t-2 border-white/5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/medico/telemedicina/pacientes/${paciente.id_paciente}/historial`);
                }}
                className={`flex-1 px-5 py-4 rounded-2xl bg-gradient-to-r ${tema.colores.gradiente} text-white ${modoCompacto ? 'text-xs' : 'text-sm'} font-black flex items-center justify-center gap-2 shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-300 group/btn relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <FileText className={`${modoCompacto ? 'w-4 h-4' : 'w-5 h-5'} relative z-10 group-hover/btn:rotate-12 transition-transform duration-300`} />
                <span className="relative z-10">Ver historial</span>
                <ChevronRight className={`${modoCompacto ? 'w-4 h-4' : 'w-5 h-5'} relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300`} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/medico/telemedicina?paciente=${paciente.id_paciente}`);
                }}
                className={`px-5 py-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} ${modoCompacto ? 'text-xs' : 'text-sm'} font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-300 group/btn backdrop-blur-xl ${tema.colores.borde} border-2`}
              >
                <Video className={`${modoCompacto ? 'w-4 h-4' : 'w-5 h-5'} group-hover/btn:scale-110 transition-transform duration-300`} />
                <span>Sesión</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ========================================
  // VISTA DE LISTA ULTRA PREMIUM
  // ========================================
  const renderVistaLista = () => (
    <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 overflow-hidden backdrop-blur-2xl ${tema.colores.sombra}`}>
      <div className="divide-y divide-white/5">
        {pacientesFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-20 h-20 rounded-3xl ${tema.colores.glass} ${tema.colores.borde} border-2 flex items-center justify-center mx-auto mb-5 shadow-xl`}>
              <User className={`w-10 h-10 ${tema.colores.textoSecundario}`} />
            </div>
            <p className={`text-base ${tema.colores.textoSecundario} mb-4`}>No se encontraron pacientes.</p>
            <button
              onClick={() => {
                setBusqueda("");
                setFiltro("todos");
              }}
              className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-300`}
            >
              <RefreshCw className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>
        ) : (
          pacientesFiltrados.map((paciente, index) => (
            <div
              key={paciente.id_paciente}
              className={`flex items-center gap-5 p-6 ${tema.colores.hover} cursor-pointer transition-all duration-300 hover:bg-white/10 group relative`}
              onClick={() => setPacienteSeleccionado(paciente)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Indicador lateral animado */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${tema.colores.gradiente} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Avatar premium */}
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  {paciente.foto_url ? (
                    <Image
                      src={paciente.foto_url}
                      alt={paciente.nombre_completo}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    paciente.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                  )}
                </div>
                {/* Estado online */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-slate-950 shadow-lg"></div>
              </div>
              
              {/* Información principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className={`text-base font-black ${tema.colores.texto} group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${tema.colores.gradiente} group-hover:bg-clip-text transition-all duration-300`}>
                    {paciente.nombre_completo}
                  </p>
                  {paciente.favorito && (
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                  )}
                  {paciente.urgente && (
                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <p className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-1`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tema.colores.gradiente}`}></div>
                    {paciente.rut || "RUT no registrado"}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {paciente.ultima_consulta
                      ? `Última: ${new Date(paciente.ultima_consulta).toLocaleDateString("es-CL")}`
                      : "Sin atenciones"}
                  </p>
                  {paciente.grupo_sanguineo && (
                    <span className={`px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold ${tema.colores.borde} border`}>
                      {paciente.grupo_sanguineo}
                    </span>
                  )}
                </div>
                
                {/* Badges */}
                <div className="flex gap-2 mt-3">
                  {(paciente.alergias_criticas ?? 0) > 0 && (
                    <span className={`px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold ${tema.colores.borde} border flex items-center gap-1`}>
                      <AlertTriangle className="w-3 h-3" />
                      Crítico
                    </span>
                  )}
                  {(paciente.condiciones_cronicas ?? []).length > 0 && (
                    <span className={`px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold ${tema.colores.borde} border flex items-center gap-1`}>
                      <HeartPulse className="w-3 h-3" />
                      {(paciente.condiciones_cronicas ?? []).length} Crónicas
                    </span>
                  )}
                  {(paciente.consultas_telemedicina ?? 0) > 0 && (
                    <span className={`px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold ${tema.colores.borde} border flex items-center gap-1`}>
                      <Video className="w-3 h-3" />
                      {paciente.consultas_telemedicina} tele
                    </span>
                  )}
                  {paciente.calificacion_promedio && paciente.calificacion_promedio > 0 && (
                    <span className={`px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold ${tema.colores.borde} border flex items-center gap-1`}>
                      <Star className="w-3 h-3 fill-current" />
                      {paciente.calificacion_promedio}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/medico/telemedicina/pacientes/${paciente.id_paciente}/historial`);
                  }}
                  className={`px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all duration-300 backdrop-blur-xl ${tema.colores.borde} border-2 shadow-lg`}
                >
                  <FileText className="w-4 h-4" />
                  Historial
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/medico/telemedicina?paciente=${paciente.id_paciente}`);
                  }}
                  className={`px-4 py-3 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  <Video className="w-4 h-4" />
                  Sesión
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ========================================
  // VISTA DE TABLA ULTRA PREMIUM
  // ========================================
  const renderVistaTabla = () => (
    <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 overflow-hidden backdrop-blur-2xl ${tema.colores.sombra}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className={`${tema.colores.glass} backdrop-blur-xl`}>
            <tr>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Paciente
                </div>
              </th>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contacto
                </div>
              </th>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alergias
                </div>
              </th>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4" />
                  Crónicas
                </div>
              </th>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Telemedicina
                </div>
              </th>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider`}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Última
                </div>
              </th>
              <th className={`px-6 py-5 font-black ${tema.colores.texto} text-xs uppercase tracking-wider text-right`}>
                <div className="flex items-center justify-end gap-2">
                  <Zap className="w-4 h-4" />
                  Acciones
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pacientesFiltrados.length === 0 ? (
              <tr>
                <td className={`px-6 py-12 text-center ${tema.colores.textoSecundario}`} colSpan={7}>
                  <div className={`w-16 h-16 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                    <User className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-base mb-3">Sin datos disponibles</p>
                  <button
                    onClick={() => {
                      setBusqueda("");
                      setFiltro("todos");
                    }}
                    className={`px-5 py-2 rounded-xl ${tema.colores.primario} text-white font-bold inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all duration-300`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                </td>
              </tr>
            ) : (
              pacientesFiltrados.map((p) => (
                <tr
                  key={p.id_paciente}
                  className={`${tema.colores.hover} transition-all duration-300 hover:bg-white/10 group cursor-pointer`}
                  onClick={() => setPacienteSeleccionado(p)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                        >
                          {p.foto_url ? (
                            <Image
                              src={p.foto_url}
                              alt={p.nombre_completo}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            p.nombre_completo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                      </div>
                      <div>
                        <span className={`font-bold ${tema.colores.texto} block mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${tema.colores.gradiente} group-hover:bg-clip-text transition-all duration-300`}>
                          {p.nombre_completo}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${tema.colores.textoSecundario}`}>
                            {p.rut || "RUT no reg."} • {p.edad ? `${p.edad} años` : "Edad no reg."}
                          </span>
                          {p.favorito && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                          {p.urgente && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center`}>
                          <Phone className="w-3 h-3 text-white" />
                        </div>
                        <span className={tema.colores.textoSecundario}>{p.telefono || "Sin tel."}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center`}>
                          <Mail className="w-3 h-3 text-white" />
                        </div>
                        <span className={`${tema.colores.textoSecundario} truncate max-w-[150px]`}>
                          {p.email || "Sin email"}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    {(p.alergias_criticas ?? 0) > 0 ? (
                      <span className={`px-3 py-2 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-2 w-fit ${tema.colores.borde} border`}>
                        <AlertTriangle className="w-3 h-3" />
                        Crítica
                      </span>
                    ) : (p.alergias_nombres ?? []).length > 0 ? (
                      <span className={`px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold ${tema.colores.borde} border`}>
                        {(p.alergias_nombres ?? []).length} reg.
                      </span>
                    ) : (
                      <span className={tema.colores.textoSecundario}>—</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-5">
                    {(p.condiciones_cronicas ?? []).length > 0 ? (
                      <span className={`px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold ${tema.colores.borde} border`}>
                        {(p.condiciones_cronicas ?? []).length} condiciones
                      </span>
                    ) : (
                      <span className={tema.colores.textoSecundario}>—</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-5">
                    {(p.consultas_telemedicina ?? 0) > 0 ? (
                      <span className={`px-3 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center gap-2 w-fit ${tema.colores.borde} border`}>
                        <Video className="w-3 h-3" />
                        {p.consultas_telemedicina}
                      </span>
                    ) : (
                      <span className={tema.colores.textoSecundario}>—</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-5">
                    <span className={`text-xs ${tema.colores.textoSecundario}`}>
                      {p.ultima_consulta ? new Date(p.ultima_consulta).toLocaleDateString("es-CL") : "Sin registro"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPacienteSeleccionado(p);
                        }}
                        className={`px-4 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold hover:scale-105 transition-all duration-300 backdrop-blur-xl ${tema.colores.borde} border-2 shadow-md`}
                      >
                        Detalle
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/medico/telemedicina/pacientes/${p.id_paciente}/historial`);
                        }}
                        className={`px-4 py-2 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white text-xs font-bold hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-1`}
                      >
                        <FileText className="w-3 h-3" />
                        Historial
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL ULTRA PREMIUM
  // ========================================
  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}>
      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-96 h-96 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl opacity-20 animate-pulse`}></div>
        <div className={`absolute bottom-40 right-40 w-[500px] h-[500px] bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl opacity-15 animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl opacity-10 animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* ========================================
          HEADER ULTRA PREMIUM
      ======================================== */}
      <header className={`${tema.colores.header} ${tema.colores.borde} border-b-2 ${tema.colores.sombra} sticky top-0 z-50 backdrop-blur-3xl`}>
        <div className="max-w-[1920px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
              {/* Logo premium con animación */}
              <div className={`relative w-16 h-16 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl ${tema.colores.glow} group hover:scale-110 hover:rotate-6 transition-all duration-500`}>
                <Users className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-3xl border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-4xl font-black ${tema.colores.texto} bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
                    Pacientes de Telemedicina
                  </h1>
                  <div className={`px-4 py-1 rounded-full ${tema.colores.glass} ${tema.colores.borde} border`}>
                    <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>PRO</span>
                  </div>
                </div>
                <p className={`text-base ${tema.colores.textoSecundario} flex items-center gap-2`}>
                  <Sparkles className="w-4 h-4" />
                  Plataforma más avanzada del mundo • Gestión integral de pacientes
                </p>
              </div>
            </div>

            {/* Controles superiores premium */}
            <div className="flex items-center gap-4">
              {/* Modo compacto toggle */}
              <button
                onClick={() => setModoCompacto(!modoCompacto)}
                className={`p-4 rounded-2xl ${modoCompacto ? `bg-gradient-to-r ${tema.colores.gradiente}` : tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110 relative group shadow-lg backdrop-blur-xl ${tema.colores.borde} border-2`}
                title={modoCompacto ? "Vista normal" : "Vista compacta"}
              >
                {modoCompacto ? <Maximize className="w-5 h-5 text-white" /> : <Minimize className="w-5 h-5" />}
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r ${tema.colores.gradiente} rounded-full ${modoCompacto ? 'animate-pulse' : 'opacity-0'}`}></div>
              </button>

              {/* Notificaciones premium */}
              <div className="relative">
                <button
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className={`p-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110 relative shadow-lg backdrop-blur-xl ${tema.colores.borde} border-2`}
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-white text-xs font-black">3</span>
                  </div>
                </button>
              </div>

              {/* Selector de tema ultra premium */}
              <div className="relative group/tema">
                <button
                  className={`p-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110 flex items-center gap-3 shadow-lg backdrop-blur-xl ${tema.colores.borde} border-2`}
                >
                  <tema.icono className="w-5 h-5" />
                  <span className="text-sm font-black hidden lg:block">{tema.nombre}</span>
                  <ChevronDown className="w-4 h-4 group-hover/tema:rotate-180 transition-transform duration-300" />
                </button>
                
                <div
                  className={`absolute top-full right-0 mt-4 w-80 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} opacity-0 invisible group-hover/tema:opacity-100 group-hover/tema:visible transition-all duration-300 p-4 backdrop-blur-3xl`}
                >
                  <div className="space-y-2">
                    {Object.entries(TEMAS).map(([key, t]) => {
                      const IconoTema = t.icono;
                      return (
                        <button
                          key={key}
                          onClick={() => setTemaActual(key as TemaColor)}
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group/item relative overflow-hidden ${
                            temaActual === key
                              ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-xl scale-105`
                              : `${tema.colores.hover} ${tema.colores.texto} hover:scale-105`
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl ${temaActual === key ? 'bg-white/20' : `bg-gradient-to-br ${t.colores.gradiente}`} flex items-center justify-center shadow-lg group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300`}>
                            <IconoTema className={`w-6 h-6 ${temaActual === key ? 'text-white' : 'text-white'}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-black block">{t.nombre}</span>
                            <span className={`text-xs ${temaActual === key ? 'text-white/80' : tema.colores.textoSecundario}`}>
                              {key === 'aurora' && 'Elegante y vibrante'}
                              {key === 'midnight' && 'Minimalista oscuro'}
                              {key === 'ocean' && 'Profundo y sereno'}
                              {key === 'royal' && 'Lujo y sofisticación'}
                              {key === 'emerald' && 'Fresco y natural'}
                              {key === 'crimson' && 'Apasionado e intenso'}
                              {key === 'platinum' && 'Limpio y profesional'}
                            </span>
                          </div>
                          {temaActual === key && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Usuario premium */}
              {usuario && (
                <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl shadow-lg`}>
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black shadow-lg overflow-hidden`}>
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                  </div>
                  <div className="hidden lg:block">
                    <p className={`text-sm font-black ${tema.colores.texto}`}>
                      {usuario.nombre} {usuario.apellido_paterno}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      {usuario.medico?.titulo_profesional || usuario.rol.nombre}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas premium con animaciones */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Users, label: "Total", value: stats.total, color: "from-blue-500 to-indigo-600", delay: "0ms" },
              { icon: AlertTriangle, label: "Alergias", value: stats.alergicos, color: "from-red-500 to-pink-600", delay: "100ms" },
              { icon: HeartPulse, label: "Crónicas", value: stats.cronicos, color: "from-amber-500 to-orange-600", delay: "200ms" },
              { icon: Video, label: "Telemedicina", value: stats.conTele, color: "from-purple-500 to-fuchsia-600", delay: "300ms" },
              { icon: Star, label: "Satisfacción", value: stats.promedioSatisfaccion, color: "from-emerald-500 to-teal-600", delay: "400ms" },
              { icon: Clock, label: "Hoy", value: stats.atendidosHoy, color: "from-cyan-500 to-blue-600", delay: "500ms" },
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-5 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 transition-all duration-500 hover:scale-105 hover:-translate-y-1 cursor-pointer group backdrop-blur-xl relative overflow-hidden shadow-xl`}
                style={{ animationDelay: stat.delay }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1 uppercase tracking-wide font-bold`}>{stat.label}</p>
                    <p className={`text-3xl font-black ${tema.colores.texto} bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ========================================
          CONTENIDO PRINCIPAL ULTRA PREMIUM
      ======================================== */}
      <main className="max-w-[1920px] mx-auto px-8 py-8">
        <div className={`grid grid-cols-1 ${sidebarColapsado ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8`}>
          {/* COLUMNA PRINCIPAL */}
          <div className={`${sidebarColapsado ? 'lg:col-span-1' : 'lg:col-span-9'} space-y-8`}>
            {/* Barra de búsqueda y filtros ultra premium */}
            <div
              className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 space-y-6 backdrop-blur-3xl relative overflow-hidden group/search`}
            >
              {/* Efecto de brillo */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-0 group-hover/search:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="flex flex-col lg:flex-row gap-5 relative z-10">
                {/* Buscador premium */}
                <div className="relative flex-1 group/input">
                  <Search className={`w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 ${tema.colores.textoSecundario} group-focus-within/input:${tema.colores.acento} transition-colors duration-300`} />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={`w-full pl-16 pr-6 py-5 rounded-2xl ${tema.colores.glass} backdrop-blur-xl outline-none ${tema.colores.texto} border-2 ${tema.colores.borde} focus:border-indigo-500 transition-all duration-300 text-base font-medium shadow-lg placeholder:${tema.colores.textoSecundario}`}
                    placeholder="Buscar por nombre, RUT, correo, teléfono, ciudad..."
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
                      className={`absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all duration-300`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Controles premium */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                    className={`px-6 py-5 rounded-2xl ${mostrarFiltrosAvanzados ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.secundario} ${tema.colores.texto}`} text-sm font-black flex items-center gap-3 hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-xl border-2 ${tema.colores.borde}`}
                  >
                    <Filter className="w-5 h-5" />
                    Filtros
                    {mostrarFiltrosAvanzados ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => cargarPacientes()}
                    className={`px-6 py-5 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-black flex items-center gap-3 hover:scale-105 hover:rotate-3 transition-all duration-300 shadow-lg backdrop-blur-xl border-2 ${tema.colores.borde} group/refresh`}
                  >
                    <RefreshCw className="w-5 h-5 group-hover/refresh:rotate-180 transition-transform duration-500" />
                    <span className="hidden lg:inline">Actualizar</span>
                  </button>
                  
                  <button
                    onClick={() => alert("Funcionalidad de exportación")}
                    className={`px-6 py-5 rounded-2xl bg-gradient-to-r ${tema.colores.gradiente} text-white text-sm font-black flex items-center gap-3 shadow-2xl hover:scale-105 transition-all duration-300 group/export`}
                  >
                    <Download className="w-5 h-5 group-hover/export:translate-y-1 transition-transform duration-300" />
                    <span className="hidden lg:inline">Exportar</span>
                  </button>
                </div>
              </div>

              {/* Filtros avanzados */}
              {mostrarFiltrosAvanzados && (
                <div className={`p-6 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 space-y-5 backdrop-blur-xl animate-fadeIn`}>
                  <h3 className={`text-sm font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                    <Filter className="w-4 h-4" />
                    Filtros Avanzados
                  </h3>
                  
                  {/* Aquí puedes agregar más filtros avanzados según necesites */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2 block`}>Rango de edad</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className={`flex-1 px-4 py-3 rounded-xl ${tema.colores.glass} backdrop-blur-xl outline-none ${tema.colores.texto} border-2 ${tema.colores.borde} focus:border-indigo-500 transition-all duration-300 text-sm`}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className={`flex-1 px-4 py-3 rounded-xl ${tema.colores.glass} backdrop-blur-xl outline-none ${tema.colores.texto} border-2 ${tema.colores.borde} focus:border-indigo-500 transition-all duration-300 text-sm`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2 block`}>Género</label>
                      <select className={`w-full px-4 py-3 rounded-xl ${tema.colores.glass} backdrop-blur-xl outline-none ${tema.colores.texto} border-2 ${tema.colores.borde} focus:border-indigo-500 transition-all duration-300 text-sm`}>
                        <option value="">Todos</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2 block`}>Grupo sanguíneo</label>
                      <select className={`w-full px-4 py-3 rounded-xl ${tema.colores.glass} backdrop-blur-xl outline-none ${tema.colores.texto} border-2 ${tema.colores.borde} focus:border-indigo-500 transition-all duration-300 text-sm`}>
                        <option value="">Todos</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtros y vista ultra premium */}
              <div className="flex flex-col md:flex-row gap-5 md:items-center md:justify-between relative z-10">
                {/* Chips de filtro premium */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "todos", label: `Todos (${stats.total})`, icon: Users, color: "from-blue-500 to-indigo-600" },
                    { id: "criticos", label: `Críticos (${stats.alergicos})`, icon: AlertTriangle, color: "from-red-500 to-pink-600" },
                    { id: "cronicos", label: `Crónicos (${stats.cronicos})`, icon: HeartPulse, color: "from-amber-500 to-orange-600" },
                    { id: "recientes", label: "Atendidos", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
                    { id: "sin_contacto", label: `Sin contacto (${stats.sinContacto})`, icon: XCircle, color: "from-gray-500 to-slate-600" },
                    { id: "favoritos", label: `Favoritos (${stats.favoritos})`, icon: Star, color: "from-yellow-500 to-orange-600" },
                    { id: "urgentes", label: `Urgentes (${stats.urgentes})`, icon: Zap, color: "from-purple-500 to-fuchsia-600" },
                  ].map((f) => {
                    const IconComponent = f.icon;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setFiltro(f.id as FiltroEstado)}
                        className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 flex items-center gap-3 shadow-lg backdrop-blur-xl border-2 ${
                          filtro === f.id
                            ? `bg-gradient-to-r ${f.color} text-white ${tema.colores.glow} scale-105 border-transparent`
                            : `${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.borde} hover:scale-105`
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl ${filtro === f.id ? 'bg-white/20' : `bg-gradient-to-br ${f.color}`} flex items-center justify-center shadow-lg`}>
                          <IconComponent className={`w-4 h-4 ${filtro === f.id ? 'text-white' : 'text-white'}`} />
                        </div>
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Vista y orden premium */}
                <div className="flex gap-4 items-center">
                  {/* Selector de vista premium */}
                  <div className={`flex gap-2 ${tema.colores.glass} rounded-2xl p-2 backdrop-blur-xl ${tema.colores.borde} border-2 shadow-lg`}>
                    {[
                      { id: "tarjetas", icon: LayoutGrid, label: "Tarjetas" },
                      { id: "lista", icon: Rows, label: "Lista" },
                      { id: "tabla", icon: TableIcon, label: "Tabla" },
                    ].map((vista) => (
                      <button
                        key={vista.id}
                        onClick={() => setVistaActual(vista.id as VistaPacientes)}
                        className={`p-3 rounded-xl transition-all duration-300 group/vista relative ${
                          vistaActual === vista.id
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-xl scale-105`
                            : `hover:bg-white/10 ${tema.colores.texto}`
                        }`}
                        title={vista.label}
                      >
                        <vista.icon className={`w-5 h-5 ${vistaActual === vista.id ? 'scale-110' : ''} transition-transform duration-300`} />
                        {vistaActual === vista.id && (
                          <div className="absolute inset-0 rounded-xl border-2 border-white/30"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Selector de orden premium */}
                  <div className={`flex items-center gap-3 ${tema.colores.glass} rounded-2xl px-5 py-3 backdrop-blur-xl ${tema.colores.borde} border-2 shadow-lg`}>
                    <SortAsc className={`w-5 h-5 ${tema.colores.textoSecundario}`} />
                    <select
                      value={orden}
                      onChange={(e) => setOrden(e.target.value as OrdenPacientes)}
                      className={`bg-transparent text-sm outline-none ${tema.colores.texto} font-bold cursor-pointer`}
                    >
                      <option value="nombre_asc">Nombre (A-Z)</option>
                      <option value="nombre_desc">Nombre (Z-A)</option>
                      <option value="ultima_desc">Última atención ↓</option>
                      <option value="ultima_asc">Última atención ↑</option>
                      <option value="tele_desc">Más telemedicina</option>
                      <option value="criticos_desc">Más críticos</option>
                      <option value="calificacion_desc">Mejor calificados</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contador de resultados premium */}
              <div className={`flex items-center justify-between pt-5 border-t-2 border-white/10 relative z-10`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <CircleDot className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-base ${tema.colores.textoSecundario}`}>
                    Mostrando{" "}
                    <span className={`font-black ${tema.colores.texto} text-xl bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
                      {pacientesFiltrados.length}
                    </span>{" "}
                    de{" "}
                    <span className={`font-black ${tema.colores.texto} text-xl`}>
                      {pacientes.length}
                    </span>{" "}
                    pacientes
                  </p>
                </div>
                
                {(busqueda || filtro !== "todos") && (
                  <button
                    onClick={() => {
                      setBusqueda("");
                      setFiltro("todos");
                    }}
                    className={`px-5 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold hover:scale-105 transition-all duration-300 flex items-center gap-2 backdrop-blur-xl ${tema.colores.borde} border-2 shadow-lg group/clear`}
                  >
                    <X className="w-4 h-4 group-hover/clear:rotate-90 transition-transform duration-300" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Renderizar vista seleccionada */}
            <div className="animate-fadeIn">
              {vistaActual === "tarjetas" && renderVistaTarjetas()}
              {vistaActual === "lista" && renderVistaLista()}
              {vistaActual === "tabla" && renderVistaTabla()}
            </div>
          </div>

          {/* ========================================
              SIDEBAR DERECHO ULTRA PREMIUM
          ======================================== */}
          {!sidebarColapsado && (
            <aside className="lg:col-span-3 space-y-8">
              {/* Toggle sidebar */}
              <button
                onClick={() => setSidebarColapsado(true)}
                className={`w-full p-4 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-between group`}
              >
                <span className={`text-sm font-bold ${tema.colores.texto}`}>Ocultar panel</span>
                <ChevronsRight className={`w-5 h-5 ${tema.colores.textoSecundario} group-hover:translate-x-1 transition-transform duration-300`} />
              </button>

              {/* Información del médico premium */}
              <div
                className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 backdrop-blur-3xl relative overflow-hidden group/med`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-0 group-hover/med:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <h3 className={`text-base font-black ${tema.colores.texto} mb-6 flex items-center gap-3`}>
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    Acceso Médico
                  </h3>
                  
                  <div className={`p-6 rounded-2xl ${tema.colores.info} ${tema.colores.borde} border-2 mb-6 backdrop-blur-xl`}>
                    <p className={`text-sm mb-5 leading-relaxed`}>
                      Estás visualizando datos médicos sensibles. Toda actividad queda registrada en el sistema de auditoría.
                    </p>
                    
                    {usuario && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-lg shadow-xl overflow-hidden`}>
                            {usuario.foto_perfil_url ? (
                              <Image
                                src={usuario.foto_perfil_url}
                                alt={usuario.nombre}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                            )}
                          </div>
                          <div>
                            <p className={`font-black ${tema.colores.texto} text-base mb-1`}>
                              {usuario.nombre} {usuario.apellido_paterno}
                            </p>
                            <p className={`${tema.colores.textoSecundario} text-sm`}>
                              @{usuario.username}
                            </p>
                          </div>
                        </div>
                        
                        {usuario.medico?.numero_registro_medico && (
                          <div className={`p-4 rounded-xl ${tema.colores.glass} ${tema.colores.borde} border`}>
                            <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Registro Médico</p>
                            <p className={`font-bold ${tema.colores.texto}`}>
                              {usuario.medico.numero_registro_medico}
                            </p>
                          </div>
                        )}
                        
                        {usuario.medico?.titulo_profesional && (
                          <div className={`p-4 rounded-xl ${tema.colores.glass} ${tema.colores.borde} border`}>
                            <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Título Profesional</p>
                            <p className={`font-bold ${tema.colores.texto}`}>
                              {usuario.medico.titulo_profesional}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accesos rápidos premium */}
              <div
                className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 backdrop-blur-3xl`}
              >
                <h3 className={`text-base font-black ${tema.colores.texto} mb-6 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  Accesos Rápidos
                </h3>
                
                <div className="space-y-3">
                  {[
                    { icon: Video, label: "Telemedicina", url: "/medico/telemedicina", color: "from-purple-500 to-fuchsia-600" },
                    { icon: BarChart3, label: "Reportes", color: "from-blue-500 to-indigo-600" },
                    { icon: Stethoscope, label: "Seguimiento", color: "from-emerald-500 to-teal-600" },
                    { icon: PieChart, label: "Estadísticas", color: "from-amber-500 to-orange-600" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => item.url ? router.push(item.url) : alert(`Conecta ${item.label}`)}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold shadow-lg hover:scale-105 transition-all duration-300 group/quick backdrop-blur-xl ${tema.colores.borde} border-2 relative overflow-hidden`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover/quick:opacity-10 transition-opacity duration-300`}></div>
                      <span className="flex items-center gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover/quick:scale-110 group-hover/quick:rotate-6 transition-all duration-300`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        {item.label}
                      </span>
                      <ChevronRight className="w-5 h-5 group-hover/quick:translate-x-1 transition-transform duration-300 relative z-10" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actividad reciente premium */}
              <div
                className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 backdrop-blur-3xl`}
              >
                <h3 className={`text-base font-black ${tema.colores.texto} mb-6 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Actividad Reciente
                </h3>
                
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, title: "Pacientes atendidos hoy", value: `${stats.atendidosHoy} consultas completadas`, color: "from-blue-500 to-indigo-600" },
                    { icon: AlertCircle, title: "Pacientes críticos", value: `${stats.alergicos} requieren atención especial`, color: "from-amber-500 to-orange-600" },
                    { icon: TrendingUp, title: "Satisfacción promedio", value: `${stats.promedioSatisfaccion}/5.0 estrellas`, color: "from-emerald-500 to-teal-600" },
                  ].map((activity, index) => (
                    <div key={index} className={`p-5 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl hover:scale-105 transition-all duration-300 group/activity cursor-pointer`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-lg group-hover/activity:scale-110 group-hover/activity:rotate-6 transition-all duration-300 flex-shrink-0`}>
                          <activity.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black ${tema.colores.texto} mb-2`}>
                            {activity.title}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {activity.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips profesionales premium */}
              <div
                className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 backdrop-blur-3xl`}
              >
                <h3 className={`text-base font-black ${tema.colores.texto} mb-6 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg`}>
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                  Tips Profesionales
                </h3>
                
                <ul className={`space-y-4 text-sm ${tema.colores.textoSecundario}`}>
                  {[
                    "Revisa las alergias antes de prescribir medicamentos",
                    "Actualiza el historial después de cada consulta",
                    "Usa filtros para encontrar pacientes rápidamente",
                    "Exporta reportes periódicamente para análisis",
                    "Marca como favoritos a pacientes de seguimiento continuo",
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3 group/tip">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center flex-shrink-0 group-hover/tip:scale-110 group-hover/tip:rotate-12 transition-all duration-300 shadow-lg mt-0.5`}>
                        <span className="text-white text-xs font-black">{index + 1}</span>
                      </div>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estadísticas adicionales */}
              <div
                className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 backdrop-blur-3xl`}
              >
                <h3 className={`text-base font-black ${tema.colores.texto} mb-6 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  Estadísticas Demográficas
                </h3>
                
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>Distribución por género</span>
                      <Users className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.texto}`}>Masculino</span>
                        <span className={`text-sm font-black ${tema.colores.texto}`}>{stats.masculinos}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${tema.colores.glass}`}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600`}
                          style={{ width: `${stats.total > 0 ? (stats.masculinos / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.texto}`}>Femenino</span>
                        <span className={`text-sm font-black ${tema.colores.texto}`}>{stats.femeninos}</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${tema.colores.glass}`}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600`}
                          style={{ width: `${stats.total > 0 ? (stats.femeninos / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>Rango de edades</span>
                      <Activity className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className={`text-2xl font-black ${tema.colores.texto} mb-1`}>{stats.edadMin}</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>Mínima</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-black bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent mb-1`}>
                          {stats.edadPromedio}
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>Promedio</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-black ${tema.colores.texto} mb-1`}>{stats.edadMax}</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>Máxima</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Botón para mostrar sidebar si está colapsado */}
          {sidebarColapsado && (
            <button
              onClick={() => setSidebarColapsado(false)}
              className={`fixed right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-2xl hover:scale-110 transition-all duration-300 z-40 ${tema.colores.glow}`}
            >
              <ChevronsLeft className="w-6 h-6" />
            </button>
          )}
        </div>
      </main>

      {/* ========================================
          PANEL LATERAL DETALLE PACIENTE ULTRA PREMIUM
      ======================================== */}
      {pacienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-end animate-fadeIn">
          {/* Overlay con efecto blur */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setPacienteSeleccionado(null)}
          />

          {/* Panel premium */}
          <div
            className={`relative w-full sm:w-[520px] md:w-[640px] h-full ${tema.colores.fondoSecundario} shadow-2xl overflow-y-auto animate-slideInRight`}
            style={{
              animation: "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {/* Header del panel ultra premium */}
            <div
              className={`sticky top-0 z-10 ${tema.colores.header} ${tema.colores.borde} border-b-2 backdrop-blur-3xl p-8 shadow-xl`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-5">
                  <div className="relative group/avatar">
                    <div
                      className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-2xl ${tema.colores.glow} group-hover/avatar:scale-110 group-hover/avatar:rotate-6 transition-all duration-500`}
                    >
                      <div className="absolute inset-0 rounded-3xl border-4 border-white/20"></div>
                      {pacienteSeleccionado.foto_url ? (
                        <Image
                          src={pacienteSeleccionado.foto_url}
                          alt={pacienteSeleccionado.nombre_completo}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-3xl"
                        />
                      ) : (
                        pacienteSeleccionado.nombre_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full border-4 border-slate-950 shadow-xl"></div>
                  </div>
                  
                  <div>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-2 uppercase tracking-wider font-bold flex items-center gap-2`}>
                      <Eye className="w-3 h-3" />
                      Detalle del paciente
                    </p>
                    <h2 className={`text-3xl font-black ${tema.colores.texto} mb-2 bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
                      {pacienteSeleccionado.nombre_completo}
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tema.colores.gradiente}`}></div>
                      {pacienteSeleccionado.rut || "RUT no registrado"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setPacienteSeleccionado(null)}
                  className={`p-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 hover:rotate-90 transition-all duration-300 shadow-xl backdrop-blur-xl ${tema.colores.borde} border-2`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Badges de estado premium */}
              <div className="flex flex-wrap gap-3">
                {pacienteSeleccionado.grupo_sanguineo && (
                  <div className={`px-5 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 ${tema.colores.borde} border-2 shadow-xl backdrop-blur-xl`}>
                    <span className={`text-sm font-black text-red-300 flex items-center gap-2`}>
                      <Droplets className="w-4 h-4" />
                      {pacienteSeleccionado.grupo_sanguineo}
                    </span>
                  </div>
                )}
                {(pacienteSeleccionado.alergias_criticas ?? 0) > 0 && (
                  <div
                    className={`px-5 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 ${tema.colores.borde} border-2 text-sm font-bold flex items-center gap-2 shadow-xl backdrop-blur-xl animate-pulse`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center`}>
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-red-300">Alergia crítica</span>
                  </div>
                )}
                {(pacienteSeleccionado.condiciones_cronicas ?? []).length > 0 && (
                  <div
                    className={`px-5 py-2 rounded-2xl bg-amber-500/20 ${tema.colores.borde} border-2 text-sm font-bold flex items-center gap-2 shadow-xl backdrop-blur-xl`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center`}>
                      <HeartPulse className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-amber-300">Condiciones crónicas</span>
                  </div>
                )}
                {pacienteSeleccionado.calificacion_promedio && pacienteSeleccionado.calificacion_promedio > 0 && (
                  <div
                    className={`px-5 py-2 rounded-2xl bg-emerald-500/20 ${tema.colores.borde} border-2 text-sm font-bold flex items-center gap-2 shadow-xl backdrop-blur-xl`}
                  >
                    <Star className="w-4 h-4 fill-emerald-300 text-emerald-300" />
                    <span className="text-emerald-300">{pacienteSeleccionado.calificacion_promedio}/5.0</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido del panel ultra premium */}
            <div className="p-8 space-y-8">
              {/* Información básica premium */}
              <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 p-8 backdrop-blur-2xl ${tema.colores.sombra} relative overflow-hidden group/section`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-0 group-hover/section:opacity-5 transition-opacity duration-500`}></div>
                
                <h3 className={`text-base font-black mb-6 ${tema.colores.texto} flex items-center gap-3 relative z-10`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Información Básica
                </h3>
                
                <div className="grid grid-cols-2 gap-5 relative z-10">
                  {[
                    { label: "Edad", value: pacienteSeleccionado.edad ? `${pacienteSeleccionado.edad} años` : "No registrada", icon: User },
                    { label: "Género", value: pacienteSeleccionado.genero || "No registrado", icon: User },
                    { label: "Teléfono", value: pacienteSeleccionado.telefono || "No registrado", icon: Phone },
                    { label: "Email", value: pacienteSeleccionado.email || "No registrado", icon: Mail },
                  ].map((field, index) => (
                    <div key={index} className={`p-5 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg`}>
                          <field.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className={`text-xs ${tema.colores.textoSecundario} font-bold uppercase tracking-wider`}>{field.label}</p>
                      </div>
                      <p className={`font-black ${tema.colores.texto} text-sm ${index === 3 ? 'break-all' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                  
                  <div className={`col-span-2 p-5 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border-2 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <p className={`text-xs ${tema.colores.textoSecundario} font-bold uppercase tracking-wider`}>Ubicación</p>
                    </div>
                    <p className={`font-black ${tema.colores.texto} text-sm`}>
                      {pacienteSeleccionado.ciudad
                        ? `${pacienteSeleccionado.ciudad}${pacienteSeleccionado.region ? `, ${pacienteSeleccionado.region}` : ""}`
                        : "No registrada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas de consultas premium */}
              <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 p-8 backdrop-blur-2xl ${tema.colores.sombra} relative overflow-hidden group/section`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-0 group-hover/section:opacity-5 transition-opacity duration-500`}></div>
                
                <h3 className={`text-base font-black mb-6 ${tema.colores.texto} flex items-center gap-3 relative z-10`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Estadísticas de Consultas
                </h3>
                
                <div className="grid grid-cols-2 gap-5 mb-5 relative z-10">
                  <div className={`p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 ${tema.colores.borde} border-2 hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-xl`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-xs font-bold uppercase tracking-wider`}>Total</p>
                      <Activity className="w-5 h-5 text-blue-300" />
                    </div>
                    <p className={`text-4xl font-black text-blue-300`}>
                      {pacienteSeleccionado.total_consultas ?? 0}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-2`}>consultas realizadas</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-600/20 ${tema.colores.borde} border-2 hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-xl`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-xs font-bold uppercase tracking-wider`}>Telemedicina</p>
                      <Video className="w-5 h-5 text-purple-300" />
                    </div>
                    <p className={`text-4xl font-black text-purple-300`}>
                      {pacienteSeleccionado.consultas_telemedicina ?? 0}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-2`}>consultas remotas</p>
                  </div>
                </div>
                
                <div className={`p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 ${tema.colores.borde} border-2 hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-xl relative z-10`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2`}>
                      <Calendar className="w-4 h-4" />
                      Última atención
                    </p>
                    <Clock className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className={`text-base font-black text-emerald-300`}>
                    {pacienteSeleccionado.ultima_consulta
                      ? new Date(pacienteSeleccionado.ultima_consulta).toLocaleString("es-CL", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : "Sin registro de atención"}
                  </p>
                </div>
              </div>

              {/* Alergias ultra premium */}
              {(pacienteSeleccionado.alergias_nombres ?? []).length > 0 && (
                <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 p-8 backdrop-blur-2xl ${tema.colores.sombra} relative overflow-hidden animate-pulse-slow`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-600/10"></div>
                  
                  <h3
                    className={`text-base font-black mb-6 flex items-center gap-3 relative z-10`}
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-xl`}>
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-red-300">Alergias Registradas</span>
                    {(pacienteSeleccionado.alergias_criticas ?? 0) > 0 && (
                      <span className={`ml-auto px-4 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-xs font-black text-white shadow-lg animate-pulse`}>
                        CRÍTICAS
                      </span>
                    )}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 mb-6 relative z-10">
                    {(pacienteSeleccionado.alergias_nombres ?? []).map((alergia, i) => (
                      <div
                        key={i}
                        className={`px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500/30 to-pink-600/30 ${tema.colores.borde} border-2 text-sm font-bold shadow-xl backdrop-blur-xl flex items-center gap-3 hover:scale-105 transition-transform duration-300 group/alergia`}
                      >
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg group-hover/alergia:scale-110 group-hover/alergia:rotate-12 transition-all duration-300`}>
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-red-200">{alergia}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`p-5 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-600/20 ${tema.colores.borde} border-2 backdrop-blur-xl relative z-10`}>
                    <p className={`text-sm font-bold flex items-center gap-3 text-red-200`}>
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg`}>
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      IMPORTANTE: Verificar alergias antes de prescribir cualquier medicamento
                    </p>
                  </div>
                </div>
              )}

              {/* Condiciones crónicas ultra premium */}
              {(pacienteSeleccionado.condiciones_cronicas ?? []).length > 0 && (
                <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 p-8 backdrop-blur-2xl ${tema.colores.sombra} relative overflow-hidden group/section`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 group-hover/section:opacity-100 transition-opacity duration-500`}></div>
                  
                  <h3
                    className={`text-base font-black mb-6 flex items-center gap-3 relative z-10`}
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl`}>
                      <HeartPulse className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-amber-300">Condiciones Crónicas</span>
                  </h3>
                  
                  <ul className="space-y-3 relative z-10">
                    {(pacienteSeleccionado.condiciones_cronicas ?? []).map((condicion, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 ${tema.colores.borde} border-2 text-sm hover:scale-105 transition-all duration-300 cursor-pointer backdrop-blur-xl group/condicion`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover/condicion:scale-110 group-hover/condicion:rotate-12 transition-all duration-300 flex-shrink-0`}>
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-amber-200 flex-1">{condicion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Acciones rápidas ultra premium */}
              <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 p-8 space-y-4 backdrop-blur-2xl ${tema.colores.sombra} relative overflow-hidden group/section`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-0 group-hover/section:opacity-5 transition-opacity duration-500`}></div>
                
                <h3 className={`text-base font-black mb-6 flex items-center gap-3 relative z-10`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  Acciones Rápidas
                </h3>
                
                {[
                  { icon: FileText, label: "Ver Historial Clínico Completo", url: `/medico/telemedicina/pacientes/${pacienteSeleccionado.id_paciente}/historial`, color: "from-indigo-500 to-purple-600", primary: true },
                  { icon: Video, label: "Iniciar Sesión de Telemedicina", url: `/medico/telemedicina?paciente=${pacienteSeleccionado.id_paciente}`, color: "from-blue-500 to-cyan-600" },
                  { icon: Clock, label: "Crear Seguimiento", color: "from-emerald-500 to-teal-600" },
                  { icon: Bell, label: "Enviar Notificación", color: "from-amber-500 to-orange-600" },
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      action.url
                        ? router.push(action.url)
                        : alert(`Crear ${action.label}`)
                    }
                    className={`w-full flex items-center justify-between px-7 py-5 rounded-2xl ${action.primary ? `bg-gradient-to-r ${action.color} text-white shadow-2xl ${tema.colores.glow}` : `${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.borde} border-2`} text-base font-black shadow-xl hover:scale-105 transition-all duration-300 group/action backdrop-blur-xl relative z-10 overflow-hidden`}
                  >
                    <div className={`absolute inset-0 ${action.primary ? 'bg-white/10' : `bg-gradient-to-r ${action.color}`} opacity-0 group-hover/action:opacity-${action.primary ? '100' : '10'} transition-opacity duration-300`}></div>
                    
                    <span className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl ${action.primary ? 'bg-white/20' : `bg-gradient-to-br ${action.color}`} flex items-center justify-center shadow-xl group-hover/action:scale-110 group-hover/action:rotate-6 transition-all duration-300`}>
                        <action.icon className={`w-6 h-6 ${action.primary ? 'text-white' : 'text-white'}`} />
                      </div>
                      {action.label}
                    </span>
                    <ChevronRight className="w-6 h-6 group-hover/action:translate-x-2 transition-transform duration-300 relative z-10" />
                  </button>
                ))}
              </div>

              {/* Información adicional ultra premium */}
              <div className={`rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 ${tema.colores.borde} border-2 p-8 backdrop-blur-2xl shadow-xl`}>
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center flex-shrink-0 shadow-xl`}>
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className={`text-base font-black ${tema.colores.texto} mb-3`}>
                      Privacidad y Seguridad
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario} leading-relaxed`}>
                      Toda la información mostrada está protegida bajo las normativas de privacidad de datos
                      médicos (Ley 20.584). Tu acceso y actividad quedan registrados en el sistema de auditoría
                      para garantizar la seguridad de los datos del paciente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          PANEL DE NOTIFICACIONES ULTRA PREMIUM
      ======================================== */}
      {mostrarNotificaciones && (
        <div className="fixed top-24 right-8 z-50 w-[420px] animate-slideInRight">
          <div
            className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 backdrop-blur-3xl relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tema.colores.gradiente} opacity-5`}></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className={`text-lg font-black ${tema.colores.texto} flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}>
                  <Bell className="w-5 h-5 text-white" />
                </div>
                Notificaciones
                <span className={`px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-xs font-black text-white shadow-lg`}>
                  3
                </span>
              </h3>
              <button
                onClick={() => setMostrarNotificaciones(false)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 hover:rotate-90 transition-all duration-300 shadow-lg backdrop-blur-xl ${tema.colores.borde} border-2`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 relativez-10">
              {[
                { icon: AlertTriangle, title: "Paciente crítico requiere atención", time: "Hace 15 minutos", type: "warning", color: "from-amber-500 to-orange-600" },
                { icon: CheckCircle2, title: "Nueva consulta programada", time: "Hace 1 hora", type: "info", color: "from-blue-500 to-indigo-600" },
                { icon: TrendingUp, title: "Reporte mensual disponible", time: "Hace 2 horas", type: "success", color: "from-emerald-500 to-teal-600" },
              ].map((notif, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-2xl bg-gradient-to-r ${notif.color}/20 ${tema.colores.borde} border-2 backdrop-blur-xl hover:scale-105 transition-all duration-300 cursor-pointer group/notif`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${notif.color} flex items-center justify-center shadow-xl group-hover/notif:scale-110 group-hover/notif:rotate-6 transition-all duration-300 flex-shrink-0`}>
                      <notif.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${tema.colores.texto} mb-1`}>
                        {notif.title}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              className={`w-full mt-6 px-6 py-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold hover:scale-105 transition-all duration-300 backdrop-blur-xl ${tema.colores.borde} border-2 shadow-lg relative z-10`}
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// ESTILOS CSS ADICIONALES (Agregar al global.css o como styled-jsx)
// ========================================

/*
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideInRight {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

.delay-300 {
  animation-delay: 300ms;
}

.delay-400 {
  animation-delay: 400ms;
}

.delay-500 {
  animation-delay: 500ms;
}

.delay-1000 {
  animation-delay: 1000ms;
}

.delay-2000 {
  animation-delay: 2000ms;
}

/* Scrollbar personalizado */
/*
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #6366f1, #8b5cf6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #4f46e5, #7c3aed);
}

/* Efectos de glassmorphism mejorados */
/*
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.backdrop-blur-2xl {
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

.backdrop-blur-3xl {
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
}

/* Sombras personalizadas */
/*
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5);
}

/* Efectos de hover suaves */
/*
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animación de carga personalizada */
/*
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Gradientes animados */
/*
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-animated {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

/* Efectos de brillo */
/*
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.8);
  }
}

.glow-animate {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Efectos de partículas */
/*
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Efecto de texto brillante */
/*
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.text-shimmer {
  background: linear-gradient(to right, #fff 0%, #f0f0f0 50%, #fff 100%);
  background-size: 2000px 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s infinite;
}

/* Sombras de colores para cada tema */
/*
.shadow-indigo-500\/10 {
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.1);
}

.shadow-indigo-500\/20 {
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.2);
}

.shadow-indigo-500\/30 {
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.3);
}

.shadow-indigo-500\/50 {
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.5);
}

/* Efectos de hover para cards */
/*
.card-hover {
  position: relative;
  overflow: hidden;
}

.card-hover::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.card-hover:hover::before {
  width: 300%;
  height: 300%;
}

/* Bordes animados */
/*
@keyframes border-dance {
  0%, 100% {
    border-color: rgba(99, 102, 241, 0.3);
  }
  50% {
    border-color: rgba(168, 85, 247, 0.6);
  }
}

.border-animate {
  animation: border-dance 3s ease-in-out infinite;
}

/* Efectos de entrada escalonada */
/*
.stagger-fade-in > * {
  animation: fadeIn 0.5s ease-out backwards;
}

.stagger-fade-in > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-fade-in > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-fade-in > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-fade-in > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-fade-in > *:nth-child(5) { animation-delay: 0.5s; }
.stagger-fade-in > *:nth-child(6) { animation-delay: 0.6s; }

/* Efectos de texto gradiente */
/*
.text-gradient {
  background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Efecto de cristal mejorado */
/*
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Efectos de sombra interior */
/*
.inner-shadow {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* Efectos de neomorfismo */
/*
.neomorphism {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  box-shadow: 20px 20px 60px #0a0e16, -20px -20px 60px #2a3a52;
}

/* Animación de pulso para badges */
/*
@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.badge-animate {
  animation: badge-pulse 2s ease-in-out infinite;
}

/* Efectos de hover para botones */
/*
.button-premium {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.button-premium::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.button-premium:hover::after {
  width: 300px;
  height: 300px;
}

/* Efectos de ondulación */
/*
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple-effect {
  position: relative;
  overflow: hidden;
}

.ripple-effect::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  animation: ripple 1s ease-out;
}

/* Efectos de parallax suave */
/*
.parallax-slow {
  transform: translateY(0);
  transition: transform 0.5s ease-out;
}

.parallax-slow:hover {
  transform: translateY(-5px);
}

/* Texto con sombra de color */
/*
.text-shadow-glow {
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.5),
               0 0 40px rgba(99, 102, 241, 0.3);
}

/* Efectos de zoom suave */
/*
.zoom-on-hover {
  transition: transform 0.3s ease;
}

.zoom-on-hover:hover {
  transform: scale(1.05);
}

/* Bordes con gradiente */
/*
.border-gradient {
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
}

.border-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Efectos de iluminación */
/*
@keyframes light-sweep {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.light-sweep {
  position: relative;
  overflow: hidden;
}

.light-sweep::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: light-sweep 3s infinite;
}

/* Efectos de reflexión */
/*
.reflection-effect {
  position: relative;
}

.reflection-effect::after {
  content: '';
  position: absolute;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  transform: scaleY(-1);
  opacity: 0.15;
  mask-image: linear-gradient(to bottom, black, transparent);
  -webkit-mask-image: linear-gradient(to bottom, black, transparent);
}
*/