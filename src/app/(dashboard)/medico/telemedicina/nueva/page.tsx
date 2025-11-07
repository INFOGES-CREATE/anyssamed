"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Video,
  ArrowLeft,
  User,
  Search,
  Calendar,
  Clock,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Info,
  Loader2,
  Mail,
  Activity,
  HeartPulse,
  Globe,
  CloudSun,
  Navigation,
  Award,
  Layout,
  Zap,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  Copy,
  Check,
  Hash,
  Circle,
  Droplet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ========================================
// TIPOS Y ENUMS
// ========================================
type TemaColor =
  | "light"
  | "dark"
  | "blue"
  | "purple"
  | "green"
  | "ocean"
  | "sunset"
  | "forest"
  | "royal"
  | "modern";

interface ConfiguracionTema {
  nombre: string;
  descripcion: string;
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
    muted: string;
  };
  efectos: {
    glassmorphism: boolean;
    blur: string;
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
    especialidades?: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal?: number;
    centro_principal?: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "premium" | "empresarial";
    };
  };
}

interface Paciente {
  id_paciente: number;
  nombre_completo: string;
  rut?: string | null;
  edad?: number | null;
  genero?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  region?: string | null;
  foto_url?: string | null;
  grupo_sanguineo?: string | null;
}

type CanalSesion = "video" | "telefono" | "chat";
type TipoCita = "consulta" | "control" | "urgencia" | "procedimiento" | "telemedicina";
type Prioridad = "normal" | "alta" | "urgente";

interface ErrorValidacion {
  campo: string;
  mensaje: string;
}

// ========================================
// TEMAS
// ========================================
const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    descripcion: "Diseño limpio y moderno",
    icono: Sun,
    colores: {
      fondo: "from-white via-slate-50 to-blue-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario:
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-blue-600",
      borde: "border-gray-200",
      sombra: "shadow-2xl shadow-blue-500/10",
      gradiente: "from-blue-500 via-indigo-500 to-purple-500",
      sidebar: "bg-white/95 backdrop-blur-xl border-gray-200",
      header: "bg-white/90 backdrop-blur-xl border-gray-200",
      card: "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10",
      hover: "hover:bg-gray-50",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
      muted: "bg-gray-100 text-gray-500",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-xl",
    },
  },
  dark: {
    nombre: "Oscuro Elite",
    descripcion: "Experiencia premium nocturna",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-2xl border-gray-800",
      header: "bg-gray-900/90 backdrop-blur-2xl border-gray-800",
      card: "bg-gray-800/40 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/20",
      hover: "hover:bg-gray-800/60",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      danger: "bg-red-500/10 text-red-300 border-red-500/20",
      info: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      muted: "bg-gray-800 text-gray-500",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-2xl",
    },
  },
  blue: {
    nombre: "Azul Océano",
    descripcion: "Profundo y sereno",
    icono: Activity,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
      secundario: "bg-blue-800/50 hover:bg-blue-700/50 backdrop-blur-sm",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-2xl border-cyan-800",
      header: "bg-blue-900/90 backdrop-blur-2xl border-cyan-800",
      card: "bg-blue-800/40 backdrop-blur-sm border-cyan-700 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20",
      hover: "hover:bg-blue-800/60",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      danger: "bg-red-500/10 text-red-300 border-red-500/20",
      info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      muted: "bg-blue-800 text-cyan-500",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-2xl",
    },
  },
  purple: {
    nombre: "Púrpura Real",
    descripcion: "Elegancia y sofisticación",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700",
      secundario: "bg-purple-800/50 hover:bg-purple-700/50 backdrop-blur-sm",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-2xl border-purple-800",
      header: "bg-purple-900/90 backdrop-blur-2xl border-purple-800",
      card: "bg-purple-800/40 backdrop-blur-sm border-purple-700 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/20",
      hover: "hover:bg-purple-800/60",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      danger: "bg-red-500/10 text-red-300 border-red-500/20",
      info: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
      muted: "bg-purple-800 text-purple-500",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-2xl",
    },
  },
  green: {
    nombre: "Verde Médico",
    descripcion: "Salud y bienestar",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
      secundario: "bg-teal-800/50 hover:bg-teal-700/50 backdrop-blur-sm",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-2xl border-emerald-800",
      header: "bg-emerald-900/90 backdrop-blur-2xl border-emerald-800",
      card: "bg-emerald-800/40 backdrop-blur-sm border-emerald-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/20",
      hover: "hover:bg-emerald-800/60",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      danger: "bg-red-500/10 text-red-300 border-red-500/20",
      info: "bg-teal-500/10 text-teal-300 border-teal-500/20",
      muted: "bg-emerald-800 text-emerald-500",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-2xl",
    },
  },
  ocean: {
    nombre: "Océano Profundo",
    descripcion: "Calma y claridad",
    icono: Globe,
    colores: {
      fondo: "from-sky-100 via-blue-50 to-cyan-100",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-sky-700",
      primario: "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600",
      secundario: "bg-sky-100 hover:bg-sky-200",
      acento: "text-sky-600",
      borde: "border-sky-200",
      sombra: "shadow-2xl shadow-sky-500/20",
      gradiente: "from-sky-400 via-cyan-400 to-blue-400",
      sidebar: "bg-white/95 backdrop-blur-xl border-sky-200",
      header: "bg-white/90 backdrop-blur-xl border-sky-200",
      card: "bg-white/80 backdrop-blur-sm border-sky-200 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/20",
      hover: "hover:bg-sky-50",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-sky-50 text-sky-700 border-sky-200",
      muted: "bg-sky-100 text-sky-600",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-xl",
    },
  },
  sunset: {
    nombre: "Atardecer Cálido",
    descripcion: "Energía y calidez",
    icono: CloudSun,
    colores: {
      fondo: "from-orange-100 via-rose-50 to-pink-100",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-orange-700",
      primario:
        "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
      secundario: "bg-orange-100 hover:bg-orange-200",
      acento: "text-orange-600",
      borde: "border-orange-200",
      sombra: "shadow-2xl shadow-orange-500/20",
      gradiente: "from-orange-400 via-rose-400 to-pink-400",
      sidebar: "bg-white/95 backdrop-blur-xl border-orange-200",
      header: "bg-white/90 backdrop-blur-xl border-orange-200",
      card: "bg-white/80 backdrop-blur-sm border-orange-200 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/20",
      hover: "hover:bg-orange-50",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-orange-50 text-orange-700 border-orange-200",
      muted: "bg-orange-100 text-orange-600",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-xl",
    },
  },
  forest: {
    nombre: "Bosque Místico",
    descripcion: "Natural y orgánico",
    icono: Navigation,
    colores: {
      fondo: "from-green-100 via-emerald-50 to-teal-100",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-green-700",
      primario:
        "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
      secundario: "bg-green-100 hover:bg-green-200",
      acento: "text-green-600",
      borde: "border-green-200",
      sombra: "shadow-2xl shadow-green-500/20",
      gradiente: "from-green-400 via-emerald-400 to-teal-400",
      sidebar: "bg-white/95 backdrop-blur-xl border-green-200",
      header: "bg-white/90 backdrop-blur-xl border-green-200",
      card: "bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20",
      hover: "hover:bg-green-50",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-teal-50 text-teal-700 border-teal-200",
      muted: "bg-green-100 text-green-600",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-xl",
    },
  },
  royal: {
    nombre: "Real Violeta",
    descripcion: "Lujo y distinción",
    icono: Award,
    colores: {
      fondo: "from-violet-100 via-purple-50 to-fuchsia-100",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-violet-700",
      primario:
        "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700",
      secundario: "bg-violet-100 hover:bg-violet-200",
      acento: "text-violet-600",
      borde: "border-violet-200",
      sombra: "shadow-2xl shadow-violet-500/20",
      gradiente: "from-violet-400 via-purple-400 to-fuchsia-400",
      sidebar: "bg-white/95 backdrop-blur-xl border-violet-200",
      header: "bg-white/90 backdrop-blur-xl border-violet-200",
      card: "bg-white/80 backdrop-blur-sm border-violet-200 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/20",
      hover: "hover:bg-violet-50",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-violet-50 text-violet-700 border-violet-200",
      muted: "bg-violet-100 text-violet-600",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-xl",
    },
  },
  modern: {
    nombre: "Moderno Minimalista",
    descripcion: "Limpio y contemporáneo",
    icono: Layout,
    colores: {
      fondo: "from-slate-100 via-gray-50 to-zinc-100",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-slate-600",
      primario:
        "bg-gradient-to-r from-slate-900 to-gray-900 hover:from-slate-800 hover:to-gray-800",
      secundario: "bg-slate-100 hover:bg-slate-200",
      acento: "text-slate-700",
      borde: "border-slate-200",
      sombra: "shadow-2xl shadow-slate-500/10",
      gradiente: "from-slate-600 via-gray-600 to-zinc-600",
      sidebar: "bg-white/95 backdrop-blur-xl border-slate-200",
      header: "bg-white/90 backdrop-blur-xl border-slate-200",
      card: "bg-white/80 backdrop-blur-sm border-slate-200 hover:border-slate-400 hover:shadow-xl hover:shadow-slate-500/10",
      hover: "hover:bg-slate-50",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
      muted: "bg-slate-100 text-slate-600",
    },
    efectos: {
      glassmorphism: true,
      blur: "backdrop-blur-xl",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function NuevaSesionTelemedicinaUltraPremium() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ========================================
  // ESTADOS BASE
  // ========================================
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [erroresValidacion, setErroresValidacion] = useState<ErrorValidacion[]>([]);

  // ========================================
  // ESTADOS DE PACIENTE
  // ========================================
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [resultadosPacientes, setResultadosPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [mostrarBuscadorPacientes, setMostrarBuscadorPacientes] = useState(true);

  // ========================================
  // ESTADOS DEL FORMULARIO
  // ========================================
  const [tipoCita, setTipoCita] = useState<TipoCita>("telemedicina");
  const [canal, setCanal] = useState<CanalSesion>("video");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("09:00");
  const [duracion, setDuracion] = useState(30);
  const [motivo, setMotivo] = useState("");
  const [notas, setNotas] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("normal");
  const [ubicacionPaciente, setUbicacionPaciente] = useState("");
  const [telPaciente, setTelPaciente] = useState("");
  const [emailPaciente, setEmailPaciente] = useState("");

  // ========================================
  // ESTADOS DE UI
  // ========================================
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [sesionCreada, setSesionCreada] = useState<any>(null);
  const [pasoActual, setPasoActual] = useState(1);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [seccionExpandida, setSeccionExpandida] = useState<string | null>(null);

  // ========================================
  // HELPERS
  // ========================================
  const scrollToPaso = (id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ========================================
  // EFECTOS
  // ========================================
  // Cargar preferencias de tema
  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_telemedicina");
      if (temaGuardado && temaGuardado in TEMAS) {
        setTemaActual(temaGuardado as TemaColor);
      }
    }
  }, []);

  // Establecer fecha actual
  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

  // Cargar usuario + posible paciente por URL
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
        if (!data.success || !data.usuario) {
          router.push("/login");
          return;
        }

        const rol = data.usuario?.rol?.nombre ?? "";
        const normalizado = rol
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase();

        if (!normalizado.includes("MEDICO") || !data.usuario.medico) {
          alert("Acceso denegado. Este módulo es solo para médicos.");
          router.push("/");
          return;
        }

        setUsuario(data.usuario);

        const idPacienteURL = searchParams.get("paciente");
        if (idPacienteURL) {
          await precargarPaciente(parseInt(idPacienteURL));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "No se pudo cargar la sesión");
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [router, searchParams]);

  // Buscar pacientes
  useEffect(() => {
    if (!busquedaPaciente.trim()) {
      setResultadosPacientes([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoadingPacientes(true);
        const resp = await fetch(
          `/api/telemedicina/nueva?search=${encodeURIComponent(busquedaPaciente.trim())}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!resp.ok) throw new Error("No se pudo buscar pacientes");

        const data = await resp.json();
        setResultadosPacientes(data.pacientes ?? []);
      } catch (err) {
        console.error(err);
        setResultadosPacientes([]);
      } finally {
        setLoadingPacientes(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [busquedaPaciente]);

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================
  const precargarPaciente = async (idPaciente: number) => {
    try {
      const resp = await fetch(`/api/telemedicina/nueva?id_paciente=${idPaciente}`, {
        method: "GET",
        credentials: "include",
      });

      if (!resp.ok) return;

      const data = await resp.json();
      if (data.success && data.paciente) {
        setPacienteSeleccionado(data.paciente);
        setTelPaciente(data.paciente.telefono || "");
        setEmailPaciente(data.paciente.email || "");
        setUbicacionPaciente(data.paciente.direccion || "");
        setMostrarBuscadorPacientes(false);
        setPasoActual(2);
        scrollToPaso("paso2");
      }
    } catch (err) {
      console.error("Error precargando paciente:", err);
    }
  };

  const combinarFechaHora = (f: string, h: string): string => {
    const iso = `${f}T${h}:00`;
    return new Date(iso).toISOString();
  };

  const validarFormulario = (): boolean => {
    const errores: ErrorValidacion[] = [];

    if (!pacienteSeleccionado) {
      errores.push({ campo: "paciente", mensaje: "Debes seleccionar un paciente" });
    }

    if (!fecha) {
      errores.push({ campo: "fecha", mensaje: "La fecha es obligatoria" });
    }

    if (!hora) {
      errores.push({ campo: "hora", mensaje: "La hora es obligatoria" });
    }

    if (!motivo.trim()) {
      errores.push({ campo: "motivo", mensaje: "El motivo de consulta es obligatorio" });
    } else if (motivo.trim().length < 10) {
      errores.push({ campo: "motivo", mensaje: "El motivo debe tener al menos 10 caracteres" });
    }

    if (duracion < 5 || duracion > 240) {
      errores.push({ campo: "duracion", mensaje: "La duración debe estar entre 5 y 240 minutos" });
    }

    if (fecha) {
      const fechaSeleccionada = new Date(`${fecha}T${hora}`);
      const ahora = new Date();
      if (fechaSeleccionada < ahora) {
        errores.push({
          campo: "fecha",
          mensaje: "La fecha y hora deben ser futuras",
        });
      }
    }

    setErroresValidacion(errores);
    return errores.length === 0;
  };

  const esFormularioValido = (): boolean => {
    return (
      !!pacienteSeleccionado &&
      !!fecha &&
      !!hora &&
      motivo.trim().length >= 10 &&
      duracion >= 5 &&
      duracion <= 240
    );
  };

  const resetFormulario = () => {
    setPacienteSeleccionado(null);
    setBusquedaPaciente("");
    setResultadosPacientes([]);
    setTipoCita("telemedicina");
    setCanal("video");
    setFecha(new Date().toISOString().split("T")[0]);
    setHora("09:00");
    setDuracion(30);
    setMotivo("");
    setNotas("");
    setPrioridad("normal");
    setUbicacionPaciente("");
    setTelPaciente("");
    setEmailPaciente("");
    setErroresValidacion([]);
    setPasoActual(1);
    setMostrarBuscadorPacientes(true);
    setSesionCreada(null);
    scrollToPaso("paso1");
  };

  const obtenerErrorCampo = (campo: string): string | null => {
    const error = erroresValidacion.find((e) => e.campo === campo);
    return error ? error.mensaje : null;
  };

  const cambiarTema = (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_telemedicina", nuevoTema);
    }
  };

  // ========================================
  // MANEJO DE ENVÍO
  // ========================================
  const handleCrearSesion = async () => {
    if (!validarFormulario() || !pacienteSeleccionado) return;

    try {
      setGuardando(true);
      setError(null);

      const payload = {
        id_paciente: pacienteSeleccionado.id_paciente,
        fecha_hora_inicio_programada: combinarFechaHora(fecha, hora),
        duracion_minutos: duracion,
        motivo: motivo.trim(),
        notas_tecnicas: notas.trim() || null,
        canal,
        prioridad,
        ubicacion_paciente: ubicacionPaciente.trim() || null,
        telefono_paciente: telPaciente.trim() || pacienteSeleccionado.telefono || null,
        email_paciente: emailPaciente.trim() || pacienteSeleccionado.email || null,
      };

      const resp = await fetch("/api/telemedicina/nueva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => null);
        throw new Error(errorData?.error || "No se pudo crear la sesión");
      }

      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || "Error al crear sesión");
      }

      setSesionCreada(data);
      setMostrarPreview(false);
      setMostrarExito(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear la sesión");
    } finally {
      setGuardando(false);
    }
  };

  const copiarLinkSala = () => {
    if (typeof window === "undefined") return;

    const linkSesion =
      sesionCreada?.sesion?.url_sesion ||
      `${window.location.origin}/medico/telemedicina/sala/${pacienteSeleccionado?.id_paciente}`;

    navigator.clipboard.writeText(linkSesion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // ========================================
  // RENDER LOADING
  // ========================================
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div
              className={`w-32 h-32 border-4 ${tema.colores.borde} border-t-transparent rounded-full animate-spin mx-auto`}
            ></div>
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl animate-pulse`}
            >
              <Video className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-3 ${tema.colores.texto} animate-pulse`}>
            Preparando Entorno
          </h2>
          <p className={`text-lg ${tema.colores.textoSecundario}`}>
            Cargando datos del profesional médico…
          </p>
        </motion.div>
      </div>
    );
  }

  // ========================================
  // RENDER ERROR DE ACCESO
  // ========================================
  if (error && !usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} p-6`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 text-center`}
        >
          <div
            className={`w-20 h-20 rounded-2xl ${tema.colores.danger} flex items-center justify-center mx-auto mb-6 shadow-xl`}
          >
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Error de Acceso</h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className={`flex-1 px-6 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold hover:scale-105 transition-all duration-300`}
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push("/medico/telemedicina")}
              className={`flex-1 px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold hover:scale-105 transition-all duration-300`}
            >
              Volver
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} flex flex-col`}>
      {/* HEADER */}
      <header
        className={`${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra} sticky top-0 z-50 ${tema.efectos.blur}`}
      >
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* IZQUIERDA */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/medico/telemedicina")}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold hover:scale-110 transition-all duration-300 shadow-lg`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl animate-pulse`}
              >
                <Video className="w-7 h-7 text-white" />
              </div>

              <div>
                <h1 className={`text-2xl font-black ${tema.colores.texto} flex items-center gap-2`}>
                  Nueva Sesión de Telemedicina
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${tema.colores.success} animate-pulse`}
                  >
                    PREMIUM
                  </span>
                </h1>
                <p className={`text-sm ${tema.colores.textoSecundario}`}>
                  Agenda una atención remota profesional • Paso {pasoActual} de 3
                </p>
              </div>
            </div>

            {/* DERECHA */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {[1, 2, 3].map((paso) => (
                  <div
                    key={paso}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      paso <= pasoActual
                        ? `bg-gradient-to-r ${tema.colores.gradiente} scale-125 shadow-lg`
                        : tema.colores.muted
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setMostrarAyuda(!mostrarAyuda)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold hover:scale-110 transition-all duration-300 shadow-lg`}
              >
                <Info className="w-5 h-5" />
              </button>

              {/* Selector de tema */}
              <div className="relative group">
                <button
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold hover:scale-110 transition-all duration-300 shadow-lg flex items-center gap-2`}
                >
                  <tema.icono className="w-5 h-5" />
                  <span className="text-xs hidden xl:block">Tema</span>
                </button>
                <div
                  className={`absolute top-full right-0 mt-3 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 max-h-[80vh] overflow-y-auto z-[60]`}
                >
                  <p
                    className={`text-xs font-bold ${tema.colores.texto} mb-3 flex items-center gap-2`}
                  >
                    <Sparkles className="w-4 h-4" />
                    TEMAS PREMIUM
                  </p>
                  {Object.entries(TEMAS).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => cambiarTema(key as TemaColor)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                        temaActual === key
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg scale-105`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <t.icono className="w-5 h-5 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <p className="text-sm">{t.nombre}</p>
                        <p className="text-[10px] opacity-70">{t.descripcion}</p>
                      </div>
                      {temaActual === key && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (validarFormulario()) {
                    setMostrarPreview(true);
                  } else {
                    // mover al paso que falta
                    if (!pacienteSeleccionado) {
                      setPasoActual(1);
                      scrollToPaso("paso1");
                    } else if (obtenerErrorCampo("fecha") || obtenerErrorCampo("hora")) {
                      setPasoActual(2);
                      scrollToPaso("paso2");
                    } else {
                      setPasoActual(3);
                      scrollToPaso("paso3");
                    }
                  }
                }}
                disabled={!esFormularioValido()}
                className={`px-6 py-3 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-xl transition-all duration-300 ${
                  esFormularioValido()
                    ? `${tema.colores.primario} hover:scale-105`
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                <Save className="w-5 h-5" />
                <span className="hidden md:inline">Revisar y Crear</span>
                <span className="md:hidden">Crear</span>
              </button>
            </div>
          </div>

          {/* Barra de progreso visual */}
          <div className="mt-4">
            <div className={`h-2 rounded-full ${tema.colores.muted} overflow-hidden`}>
              <motion.div
                className={`h-full bg-gradient-to-r ${tema.colores.gradiente} rounded-full`}
                initial={{ width: "0%" }}
                animate={{ width: `${(pasoActual / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================
          CONTENIDO PRINCIPAL
      ======================================== */}
      <main className="max-w-[1600px] mx-auto flex-1 w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================
              COLUMNA PRINCIPAL - FORMULARIO
          ======================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* PASO 1 */}
            <motion.section
              id="paso1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden`}
            >
              <div
                className={`p-6 border-b ${tema.colores.borde} bg-gradient-to-r ${tema.colores.gradiente} bg-opacity-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-xl shadow-xl`}
                    >
                      1
                    </div>
                    <div>
                      <h2
                        className={`text-xl font-black ${tema.colores.texto} flex items-center gap-2`}
                      >
                        <User className="w-5 h-5" />
                        Seleccionar Paciente
                        {obtenerErrorCampo("paciente") && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 animate-pulse">
                            Requerido
                          </span>
                        )}
                      </h2>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Busca y selecciona el paciente para la sesión
                      </p>
                    </div>
                  </div>
                  {pacienteSeleccionado && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`px-4 py-2 rounded-full ${tema.colores.success} border-2 ${tema.colores.borde} flex items-center gap-2 text-sm font-bold shadow-lg`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Seleccionado
                    </motion.span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {pacienteSeleccionado && !mostrarBuscadorPacientes ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-2xl ${tema.colores.secundario} ${tema.colores.borde} border-2`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-2xl shadow-xl flex-shrink-0`}
                        >
                          {pacienteSeleccionado.foto_url ? (
                            <Image
                              src={pacienteSeleccionado.foto_url}
                              alt={pacienteSeleccionado.nombre_completo}
                              width={80}
                              height={80}
                              className="rounded-2xl object-cover"
                            />
                          ) : (
                            pacienteSeleccionado.nombre_completo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className={`text-2xl font-black ${tema.colores.texto} mb-2`}>
                            {pacienteSeleccionado.nombre_completo}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pacienteSeleccionado.rut && (
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 opacity-50" />
                                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                                  RUT: {pacienteSeleccionado.rut}
                                </span>
                              </div>
                            )}
                            {pacienteSeleccionado.edad && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 opacity-50" />
                                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                                  {pacienteSeleccionado.edad} años
                                </span>
                              </div>
                            )}
                            {pacienteSeleccionado.genero && (
                              <div className="flex items-center gap-2">
                                <Circle className="w-4 h-4 opacity-50" />
                                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                                  {pacienteSeleccionado.genero}
                                </span>
                              </div>
                            )}
                            {pacienteSeleccionado.grupo_sanguineo && (
                              <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 opacity-50" />
                                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                                  {pacienteSeleccionado.grupo_sanguineo}
                                </span>
                              </div>
                            )}
                            {pacienteSeleccionado.telefono && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 opacity-50" />
                                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                                  {pacienteSeleccionado.telefono}
                                </span>
                              </div>
                            )}
                            {pacienteSeleccionado.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 opacity-50" />
                                <span className={`text-sm ${tema.colores.textoSecundario}`}>
                                  {pacienteSeleccionado.email}
                                </span>
                              </div>
                            )}
                          </div>

                          {pacienteSeleccionado.direccion && (
                            <div
                              className={`mt-3 p-3 rounded-xl ${tema.colores.info} border ${tema.colores.borde}`}
                            >
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-bold mb-1">Dirección</p>
                                  <p className="text-xs">{pacienteSeleccionado.direccion}</p>
                                  {(pacienteSeleccionado.ciudad ||
                                    pacienteSeleccionado.region) && (
                                    <p className="text-xs opacity-70 mt-1">
                                      {[pacienteSeleccionado.ciudad, pacienteSeleccionado.region]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setPacienteSeleccionado(null);
                          setMostrarBuscadorPacientes(true);
                          setBusquedaPaciente("");
                          setPasoActual(1);
                          scrollToPaso("paso1");
                        }}
                        className={`px-4 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold hover:scale-105 transition-all duration-300 flex items-center gap-2`}
                      >
                        <X className="w-4 h-4" />
                        Cambiar
                      </button>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setPasoActual(2);
                          scrollToPaso("paso2");
                        }}
                        className={`flex-1 px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center gap-2`}
                      >
                        Continuar
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="relative mb-6">
                      <Search
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
                      />
                      <input
                        value={busquedaPaciente}
                        onChange={(e) => {
                          setBusquedaPaciente(e.target.value);
                          setPacienteSeleccionado(null);
                        }}
                        className={`w-full pl-12 pr-12 py-4 rounded-xl ${tema.colores.texto} ${tema.colores.borde} border-2 focus:border-indigo-500 outline-none transition-all duration-300 text-lg ${
                          obtenerErrorCampo("paciente")
                            ? "border-red-500 bg-red-50/10"
                            : tema.colores.fondoSecundario
                        }`}
                        placeholder="Buscar por nombre, RUT, email o teléfono…"
                        autoFocus
                      />
                      {loadingPacientes && (
                        <Loader2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" />
                      )}
                    </div>

                    {obtenerErrorCampo("paciente") && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`mb-4 p-4 rounded-xl ${tema.colores.danger} border-2 ${tema.colores.borde} flex items-start gap-3`}
                      >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Paciente requerido</p>
                          <p className="text-xs opacity-80">{obtenerErrorCampo("paciente")}</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {busquedaPaciente.trim().length > 1 &&
                        resultadosPacientes.length === 0 &&
                        !loadingPacientes && (
                          <div className={`text-center py-12 rounded-xl ${tema.colores.muted}`}>
                            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>
                              No se encontraron pacientes
                            </p>
                            <p className="text-sm opacity-70">
                              Intenta con otro criterio de búsqueda
                            </p>
                          </div>
                        )}

                      {resultadosPacientes.map((p, idx) => (
                        <motion.button
                          key={p.id_paciente}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          type="button"
                          onClick={() => {
                            setPacienteSeleccionado(p);
                            setTelPaciente(p.telefono || "");
                            setEmailPaciente(p.email || "");
                            setUbicacionPaciente(p.direccion || "");
                            setMostrarBuscadorPacientes(false);
                            setPasoActual(2);
                            scrollToPaso("paso2");
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                            pacienteSeleccionado?.id_paciente === p.id_paciente
                              ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-xl scale-105`
                              : `${tema.colores.card} ${tema.colores.borde} border-2 hover:scale-102 hover:shadow-lg`
                          }`}
                        >
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 ${
                              pacienteSeleccionado?.id_paciente === p.id_paciente
                                ? "bg-white/20"
                                : `bg-gradient-to-br ${tema.colores.gradiente}`
                            }`}
                          >
                            {p.foto_url ? (
                              <Image
                                src={p.foto_url}
                                alt={p.nombre_completo}
                                width={56}
                                height={56}
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

                          <div className="flex-1 text-left">
                            <p
                              className={`text-lg font-bold mb-1 ${
                                pacienteSeleccionado?.id_paciente === p.id_paciente
                                  ? "text-white"
                                  : tema.colores.texto
                              }`}
                            >
                              {p.nombre_completo}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {p.rut && (
                                <span
                                  className={
                                    pacienteSeleccionado?.id_paciente === p.id_paciente
                                      ? "text-white/80"
                                      : tema.colores.textoSecundario
                                  }
                                >
                                  {p.rut}
                                </span>
                              )}
                              {p.edad && (
                                <span
                                  className={
                                    pacienteSeleccionado?.id_paciente === p.id_paciente
                                      ? "text-white/80"
                                      : tema.colores.textoSecundario
                                  }
                                >
                                  • {p.edad} años
                                </span>
                              )}
                              {p.email && (
                                <span
                                  className={
                                    pacienteSeleccionado?.id_paciente === p.id_paciente
                                      ? "text-white/80"
                                      : tema.colores.textoSecundario
                                  }
                                >
                                  • {p.email}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {pacienteSeleccionado?.id_paciente === p.id_paciente ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                              <div
                                className={`w-6 h-6 rounded-full border-2 ${tema.colores.borde}`}
                              ></div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {busquedaPaciente.trim().length === 0 && (
                      <div
                        className={`text-center py-12 rounded-xl ${tema.colores.info} border-2 ${tema.colores.borde}`}
                      >
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className={`text-lg font-bold mb-2`}>Busca un paciente</p>
                        <p className="text-sm opacity-70">
                          Escribe el nombre, RUT, email o teléfono para comenzar
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.section>

            {/* PASO 2 */}
            <motion.section
              id="paso2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden`}
            >
              <div
                className={`p-6 border-b ${tema.colores.borde} flex items-center justify-between bg-gradient-to-r ${tema.colores.gradiente} bg-opacity-5`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-xl shadow-xl`}
                  >
                    2
                  </div>
                  <div>
                    <h2 className={`text-xl font-black ${tema.colores.texto} flex items-center gap-2`}>
                      <Calendar className="w-5 h-5" />
                      Datos de la Sesión
                      {(obtenerErrorCampo("fecha") || obtenerErrorCampo("hora")) && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 animate-pulse">
                          Requerido
                        </span>
                      )}
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Define fecha, hora, duración, canal y prioridad
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPasoActual(2);
                    scrollToPaso("paso2");
                  }}
                  className={`px-4 py-2 rounded-xl ${tema.colores.secundario} text-xs font-bold hover:scale-105 transition-all duration-300`}
                >
                  Ir a este paso
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Fecha y hora */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => {
                        setFecha(e.target.value);
                        setPasoActual(2);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300 ${
                        obtenerErrorCampo("fecha") ? "border-red-500 bg-red-50/10" : ""
                      }`}
                    />
                    {obtenerErrorCampo("fecha") && (
                      <p className="text-xs text-red-400 mt-1">{obtenerErrorCampo("fecha")}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      Hora
                    </label>
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => {
                        setHora(e.target.value);
                        setPasoActual(2);
                      }}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300 ${
                        obtenerErrorCampo("hora") ? "border-red-500 bg-red-50/10" : ""
                      }`}
                    />
                    {obtenerErrorCampo("hora") && (
                      <p className="text-xs text-red-400 mt-1">{obtenerErrorCampo("hora")}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={duracion}
                      onChange={(e) => setDuracion(parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300 ${
                        obtenerErrorCampo("duracion") ? "border-red-500 bg-red-50/10" : ""
                      }`}
                    />
                    {obtenerErrorCampo("duracion") && (
                      <p className="text-xs text-red-400 mt-1">{obtenerErrorCampo("duracion")}</p>
                    )}
                  </div>
                </div>

                {/* Canal y prioridad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-2">
                      Canal de atención
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCanal("video")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
                          canal === "video"
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent shadow-lg`
                            : `${tema.colores.fondoSecundario} ${tema.colores.texto} ${tema.colores.borde} hover:shadow`
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanal("telefono")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
                          canal === "telefono"
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent shadow-lg`
                            : `${tema.colores.fondoSecundario} ${tema.colores.texto} ${tema.colores.borde} hover:shadow`
                        }`}
                      >
                        <Phone className="w-4 h-4" />
                        Teléfono
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanal("chat")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
                          canal === "chat"
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent shadow-lg`
                            : `${tema.colores.fondoSecundario} ${tema.colores.texto} ${tema.colores.borde} hover:shadow`
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        Chat
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-2">
                      Prioridad
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPrioridad("normal")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-300 ${
                          prioridad === "normal"
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent shadow-lg`
                            : `${tema.colores.fondoSecundario} ${tema.colores.texto} ${tema.colores.borde} hover:shadow`
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrioridad("alta")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-300 ${
                          prioridad === "alta"
                            ? `bg-amber-500 text-white border-transparent shadow-lg`
                            : `${tema.colores.fondoSecundario} ${tema.colores.texto} ${tema.colores.borde} hover:shadow`
                        }`}
                      >
                        Alta
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrioridad("urgente")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-300 ${
                          prioridad === "urgente"
                            ? `bg-red-500 text-white border-transparent shadow-lg`
                            : `${tema.colores.fondoSecundario} ${tema.colores.texto} ${tema.colores.borde} hover:shadow`
                        }`}
                      >
                        Urgente
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setPasoActual(3);
                      scrollToPaso("paso3");
                    }}
                    className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg`}
                  >
                    Continuar al Detalle
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* PASO 3 */}
            <motion.section
              id="paso3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden`}
            >
              <div
                className={`p-6 border-b ${tema.colores.borde} flex items-center justify-between bg-gradient-to-r ${tema.colores.gradiente} bg-opacity-5`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-xl shadow-xl`}
                  >
                    3
                  </div>
                  <div>
                    <h2 className={`text-xl font-black ${tema.colores.texto} flex items-center gap-2`}>
                      <AlertCircle className="w-5 h-5" />
                      Detalles de la Atención
                      {obtenerErrorCampo("motivo") && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 animate-pulse">
                          Requerido
                        </span>
                      )}
                    </h2>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Motivo, notas técnicas y datos de contacto
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPasoActual(3);
                    scrollToPaso("paso3");
                  }}
                  className={`px-4 py-2 rounded-xl ${tema.colores.secundario} text-xs font-bold hover:scale-105 transition-all duration-300`}
                >
                  Ir a este paso
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Motivo */}
                <div>
                  <label className="text-xs font-bold flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3 h-3" />
                    Motivo de la consulta
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300 ${
                      obtenerErrorCampo("motivo") ? "border-red-500 bg-red-50/10" : ""
                    }`}
                    placeholder="Ejemplo: Paciente refiere cefalea intensa desde hace 2 días, sin fiebre..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {obtenerErrorCampo("motivo") ? (
                      <p className="text-xs text-red-400">{obtenerErrorCampo("motivo")}</p>
                    ) : (
                      <p className="text-xs opacity-60">
                        Debe tener al menos 10 caracteres para ser claro
                      </p>
                    )}
                    <p className="text-xs opacity-60">{motivo.trim().length} / 250</p>
                  </div>
                </div>

                {/* Notas técnicas */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setSeccionExpandida((prev) => (prev === "notas" ? null : "notas"))
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border-2 hover:shadow transition-all duration-300`}
                  >
                    <span className="text-xs font-bold">Notas técnicas / indicaciones</span>
                    {seccionExpandida === "notas" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {seccionExpandida === "notas" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3"
                      >
                        <textarea
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300`}
                          placeholder="Indicaciones técnicas, consideraciones para la conexión, plataformas externas, etc."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Datos de contacto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-1">
                      <Phone className="w-3 h-3" />
                      Teléfono del paciente
                    </label>
                    <input
                      value={telPaciente}
                      onChange={(e) => setTelPaciente(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300`}
                      placeholder="+56 9 9999 9999"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3" />
                      Email del paciente
                    </label>
                    <input
                      type="email"
                      value={emailPaciente}
                      onChange={(e) => setEmailPaciente(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300`}
                      placeholder="paciente@correo.cl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />
                      Ubicación del paciente
                    </label>
                    <input
                      value={ubicacionPaciente}
                      onChange={(e) => setUbicacionPaciente(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${tema.colores.borde} ${tema.colores.texto} ${tema.colores.fondoSecundario} focus:border-indigo-500 outline-none transition-all duration-300`}
                      placeholder="Ciudad / Región / País"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => {
                      setPasoActual(2);
                      scrollToPaso("paso2");
                    }}
                    className={`px-6 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold hover:scale-105 transition-all duration-300 flex items-center gap-2`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </button>
                  <button
                    onClick={() => {
                      if (validarFormulario()) {
                        setMostrarPreview(true);
                      } else {
                        if (!pacienteSeleccionado) {
                          setPasoActual(1);
                          scrollToPaso("paso1");
                        } else if (obtenerErrorCampo("fecha") || obtenerErrorCampo("hora")) {
                          setPasoActual(2);
                          scrollToPaso("paso2");
                        }
                      }
                    }}
                    disabled={!esFormularioValido()}
                    className={`px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-xl transition-all duration-300 ${
                      esFormularioValido()
                        ? `${tema.colores.primario} hover:scale-105`
                        : "bg-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    Revisar y Crear
                  </button>
                </div>
              </div>
            </motion.section>
          </div>

          {/* ========================================
              SIDEBAR DERECHO
          ======================================== */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden sticky top-24`}
            >
              <div
                className={`p-6 bg-gradient-to-r ${tema.colores.gradiente} bg-opacity-10 border-b ${tema.colores.borde}`}
              >
                <h3 className={`text-lg font-black ${tema.colores.texto} flex items-center gap-2`}>
                  <Shield className="w-5 h-5" />
                  Resumen de Sesión
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                    Paciente
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {pacienteSeleccionado
                        ? pacienteSeleccionado.nombre_completo
                        : "Sin seleccionar"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p
                      className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2 flex items-center gap-1`}
                    >
                      <Calendar className="w-3 h-3" />
                      Fecha
                    </p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>{fecha || "—"}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p
                      className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2 flex items-center gap-1`}
                    >
                      <Clock className="w-3 h-3" />
                      Hora
                    </p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>{hora || "—"}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                    Canal y Duración
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${tema.colores.texto} capitalize`}>
                      {canal === "video"
                        ? "📹 Video"
                        : canal === "telefono"
                        ? "📞 Teléfono"
                        : "💬 Chat"}
                    </span>
                    <span className={`text-sm font-bold ${tema.colores.texto}`}>
                      {duracion} min
                    </span>
                  </div>
                </div>

                {motivo && (
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2`}>
                      Motivo
                    </p>
                    <p className={`text-xs ${tema.colores.texto} line-clamp-3`}>
                      {motivo || "Sin especificar"}
                    </p>
                  </div>
                )}

                <div
                  className={`p-4 rounded-xl ${
                    prioridad === "urgente"
                      ? tema.colores.danger
                      : prioridad === "alta"
                      ? tema.colores.warning
                      : tema.colores.info
                  } border-2 ${tema.colores.borde}`}
                >
                  <p className="text-xs font-bold mb-1">Prioridad</p>
                  <p className="text-sm font-black capitalize">
                    {prioridad === "urgente"
                      ? "🚨 Urgente"
                      : prioridad === "alta"
                      ? "⚠️ Alta"
                      : "📌 Normal"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (validarFormulario()) {
                      setMostrarPreview(true);
                    } else {
                      if (!pacienteSeleccionado) {
                        setPasoActual(1);
                        scrollToPaso("paso1");
                      } else if (obtenerErrorCampo("fecha") || obtenerErrorCampo("hora")) {
                        setPasoActual(2);
                        scrollToPaso("paso2");
                      } else {
                        setPasoActual(3);
                        scrollToPaso("paso3");
                      }
                    }
                  }}
                  disabled={!esFormularioValido()}
                  className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
                    esFormularioValido()
                      ? `${tema.colores.primario} hover:scale-105`
                      : "bg-gray-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Save className="w-5 h-5" />
                  Crear Sesión
                </button>

                <div
                  className={`p-4 rounded-xl ${tema.colores.info} border-2 ${tema.colores.borde}`}
                >
                  <p className="text-xs font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progreso del formulario
                  </p>
                  <div className="space-y-2">
                    {[

                      { label: "Paciente", completado: !!pacienteSeleccionado },
                      { label: "Fecha y hora", completado: !!fecha && !!hora },
                      { label: "Motivo", completado: motivo.trim().length >= 10 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {item.completado ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 opacity-30" />
                        )}
                        <span className={`text-xs ${item.completado ? "font-bold" : "opacity-50"}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-6`}
            >
              <h3
                className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}
              >
                <Zap className="w-5 h-5" />
                Consejos Rápidos
              </h3>
              <ul className={`space-y-3 text-sm ${tema.colores.textoSecundario}`}>
                <li className="flex gap-3">
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${tema.colores.acento}`} />
                  <span>Agenda con al menos 15 minutos de anticipación</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${tema.colores.acento}`} />
                  <span>Para urgencias, marca prioridad "urgente"</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${tema.colores.acento}`} />
                  <span>Verifica que el paciente tenga datos de contacto</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${tema.colores.acento}`} />
                  <span>El motivo debe ser claro y específico</span>
                </li>
              </ul>
            </motion.div>
          </aside>
        </div>
      </main>

      {/* MODAL AYUDA */}
      <AnimatePresence>
        {mostrarAyuda && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className={`max-w-lg w-full rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-6 relative`}
            >
              <button
                onClick={() => setMostrarAyuda(false)}
                className="absolute right-4 top-4 p-2 rounded-full bg-black/10 hover:bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
              <h2
                className={`text-xl font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}
              >
                <Info className="w-5 h-5" />
                ¿Cómo crear la sesión?
              </h2>
              <p className={tema.colores.textoSecundario}>
                1) Selecciona un paciente. 2) Define fecha, hora y canal. 3) Detalla el motivo y
                contacto. Luego presiona “Revisar y Crear”. Se enviará al backend que ya tienes en
                <code className="mx-1 px-2 py-0.5 rounded bg-black/5 text-xs">
                  /api/telemedicina/nueva
                </code>
                .
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setMostrarAyuda(false)}
                  className={`px-4 py-2 rounded-xl ${tema.colores.primario} text-white text-sm font-bold`}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PREVIEW */}
      <AnimatePresence>
        {mostrarPreview && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[210] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-2xl w-full rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
            >
              <button
                onClick={() => setMostrarPreview(false)}
                className="absolute right-4 top-4 p-2 rounded-full bg-black/10 hover:bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
              <h2
                className={`text-xl font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}
              >
                <Eye className="w-5 h-5" />
                Revisar datos antes de crear
              </h2>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <p className="text-xs font-bold mb-2">Paciente</p>
                  <p className="text-sm font-bold">
                    {pacienteSeleccionado?.nombre_completo ?? "—"}
                  </p>
                  {pacienteSeleccionado?.rut && (
                    <p className="text-xs opacity-70">RUT: {pacienteSeleccionado.rut}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Fecha
                    </p>
                    <p className="text-sm font-bold">{fecha}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hora
                    </p>
                    <p className="text-sm font-bold">{hora}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1">Canal</p>
                    <p className="text-sm font-bold capitalize">{canal}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1">Duración</p>
                    <p className="text-sm font-bold">{duracion} minutos</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <p className="text-xs font-bold mb-1">Motivo</p>
                  <p className="text-sm">{motivo}</p>
                </div>

                {notas && (
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1">Notas técnicas</p>
                    <p className="text-sm">{notas}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1">Teléfono</p>
                    <p className="text-sm">{telPaciente || "—"}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1">Email</p>
                    <p className="text-sm">{emailPaciente || "—"}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                    <p className="text-xs font-bold mb-1">Ubicación</p>
                    <p className="text-sm">{ubicacionPaciente || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button
                  onClick={() => setMostrarPreview(false)}
                  className={`px-6 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold`}
                >
                  Volver
                </button>
                <button
                  onClick={handleCrearSesion}
                  disabled={guardando}
                  className={`px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 ${
                    guardando
                      ? "bg-gray-400"
                      : `${tema.colores.primario} hover:scale-105 transition-all duration-300`
                  }`}
                >
                  {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar y crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL EXITO */}
      <AnimatePresence>
        {mostrarExito && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[220] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className={`max-w-md w-full rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-6 text-center relative`}
            >
              <div
                className={`w-20 h-20 rounded-2xl ${tema.colores.success} flex items-center justify-center mx-auto mb-4`}
              >
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
                Sesión creada correctamente
              </h2>
              <p className={tema.colores.textoSecundario}>
                La sesión de telemedicina ha sido registrada. Puedes compartir el link con el
                paciente.
              </p>

              {sesionCreada?.sesion?.url_sesion && (
                <div
                  className={`mt-4 p-3 rounded-xl ${tema.colores.secundario} flex items-center gap-2`}
                >
                  <span className="text-xs flex-1 break-all">
                    {sesionCreada.sesion.url_sesion}
                  </span>
                  <button
                    onClick={copiarLinkSala}
                    className="p-2 rounded-lg bg-black/10 hover:bg-black/20"
                  >
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => {
                    setMostrarExito(false);
                    resetFormulario();
                  }}
                  className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold`}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLLBAR CUSTOM */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
      `}</style>
    </div>
  );
}
