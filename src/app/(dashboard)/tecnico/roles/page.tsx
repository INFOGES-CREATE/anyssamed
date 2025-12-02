"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

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
  Headset,
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
  Wrench,
  Hammer,
  Cpu,
  HardDrive,
  Zap as ZapIcon,
  AlertCircleIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS - SESIÓN Y ROLES
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

interface CentroSistema {
  id_centro: number;
  nombre: string;
  ciudad?: string | null;
  region?: string | null;
}

type EstadoUsuario = "activo" | "inactivo" | "suspendido";

interface RolSistema {
  id_rol: number;
  nombre: string;
  descripcion?: string | null;
  nivel_jerarquia: number;
  es_global?: boolean;
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
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "matutino" | "vespertino" | "nocturno" | "rotativo";
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
  };
}

interface UsuarioGestion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  estado: EstadoUsuario;
  es_global: boolean;
  rol: RolSistema;
  centro_principal?: CentroSistema | null;
  centros_asignados?: CentroSistema[];
  fecha_ultimo_acceso?: string | null;
  creado_por?: string | null;
}

interface AlertaTecnico {
  id_alerta: number;
  tipo:
    | "equipo_falla"
    | "mantenimiento_vencido"
    | "ticket_urgente"
    | "equipo_critico";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
}

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  tickets_pendientes_confirmacion: number;
  tiempo_promedio_resolucion: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  disponibilidad_porcentaje: number;
  llamadas_realizadas_hoy: number;
  equipos_mantenidos_semana: number;
  tareas_pendientes: number;
  alertas_activas: number;
}

interface ResumenNotificaciones {
  ticketsHoy: number;
  tareasPendientes: number;
  alertasActivas: number;
  mensajesSinLeer: number;
}

interface MenuItem {
  id: string;
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: {
    titulo: string;
    icono: any;
    url: string;
  }[];
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
    nombre: "Azul Técnico",
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
    nombre: "Púrpura Industrial",
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
    nombre: "Verde Operacional",
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
// COMPONENTE PRINCIPAL - GESTIÓN ROLES
// ========================================

export default function TecnicoRolesPage() {
  // Sesión / tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");

  // Layout / UI
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<string>("roles");
  const [busqueda, setBusqueda] = useState("");
  const [disponibilidad, setDisponibilidad] =
    useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");

  // Datos roles/usuarios
  const [loadingData, setLoadingData] = useState(true);
  const [usuariosGestion, setUsuariosGestion] = useState<UsuarioGestion[]>([]);
  const [rolesDisponibles, setRolesDisponibles] = useState<RolSistema[]>([]);
  const [centrosDisponibles, setCentrosDisponibles] = useState<CentroSistema[]>(
    []
  );
  const [modoGlobal, setModoGlobal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroCentro, setFiltroCentro] = useState<string>("mis_centros");
  const [usuarioProcesando, setUsuarioProcesando] = useState<number | null>(
    null
  );

    const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  

  // Notificaciones / resumen
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);
  const [resumen, setResumen] = useState<ResumenNotificaciones>({
    ticketsHoy: 0,
    tareasPendientes: 0,
    alertasActivas: 0,
    mensajesSinLeer: 0,
  });

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // MENÚ DE NAVEGACIÓN
  // ========================================

 

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    // cargar tema desde localStorage
    if (typeof window !== "undefined") {
      const guardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (guardado && TEMAS[guardado]) {
        setTemaActual(guardado);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarUsuariosRoles(modoGlobal);
    }
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

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

        const tieneRolTecnico = rolesUsuario.some(
          (rol: string) => rol.includes("TECNICO") || rol.includes("SOPORTE")
        );

        if (!tieneRolTecnico) {
          alert(
            `Acceso denegado. Este panel es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
        setDisponibilidad(result.usuario.tecnico.disponibilidad);
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

  const cargarUsuariosRoles = async (globalFlag: boolean) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingData(true);

      const res = await fetch(
        `/api/tecnico/usuarios?modo=roles&id_tecnico=${usuario.tecnico.id_tecnico}&global=${
          globalFlag ? 1 : 0
        }`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        console.error("Error al cargar usuarios/roles:", data);
        return;
      }

      setUsuariosGestion(data.usuarios || []);
      setRolesDisponibles(data.roles || []);
      setCentrosDisponibles(data.centros || []);

      if (data.alertas && Array.isArray(data.alertas)) {
        setAlertas(data.alertas);
        setResumen((prev) => ({
          ...prev,
          alertasActivas: data.alertas.filter((a: any) => !a.leida).length,
        }));
      }

      if (data.resumen_notificaciones) {
        setResumen((prev) => ({
          ...prev,
          ticketsHoy: data.resumen_notificaciones.tickets_hoy ?? prev.ticketsHoy,
          tareasPendientes:
            data.resumen_notificaciones.tareas_pendientes ?? prev.tareasPendientes,
          mensajesSinLeer:
            data.resumen_notificaciones.mensajes_sin_leer ?? prev.mensajesSinLeer,
        }));
      }
    } catch (error) {
      console.error("Error al cargar usuarios/roles:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const response = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (response.ok) {
        setDisponibilidad(nuevoEstado);
        alert(`Estado actualizado a: ${nuevoEstado}`);
      } else {
        alert("Error al actualizar disponibilidad");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      alert("Error al actualizar disponibilidad");
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
      console.error("No se pudo guardar preferencia en BD:", err);
    }
  };

  const togglearModoGlobal = () => {
    if (!usuario?.tecnico?.es_global) return;
    const nuevo = !modoGlobal;
    setModoGlobal(nuevo);
    cargarUsuariosRoles(nuevo);
  };

  const manejarCambioRol = async (idUsuario: number, idRol: number) => {
    if (!idRol) return;
    setUsuarioProcesando(idUsuario);

    try {
      const response = await fetch(`/api/tecnico/usuarios/${idUsuario}/rol`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_rol: idRol }),
      });

      const data = await response.json().catch(() => ({} as any));

      if (!response.ok || !data.success) {
        console.error("Error al actualizar rol:", data);
        alert(data.error || "No se pudo actualizar el rol del usuario.");
        return;
      }

      const rolActualizado: RolSistema | undefined =
        data.rol_actualizado ||
        rolesDisponibles.find((r) => r.id_rol === idRol);

      setUsuariosGestion((prev) =>
        prev.map((u) =>
          u.id_usuario === idUsuario
            ? {
                ...u,
                rol: rolActualizado ? rolActualizado : { ...u.rol, id_rol: idRol },
              }
            : u
        )
      );

      alert("Rol actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      alert("No se pudo actualizar el rol del usuario.");
    } finally {
      setUsuarioProcesando(null);
    }
  };

  const manejarToggleEstado = async (u: UsuarioGestion) => {
    if (u.estado === "suspendido") {
      alert("Este usuario está suspendido. Solo un administrador puede modificarlo.");
      return;
    }

    if (usuario && u.id_usuario === usuario.id_usuario) {
      alert("No puedes desactivar tu propio usuario.");
      return;
    }

    const nuevoEstado: EstadoUsuario = u.estado === "activo" ? "inactivo" : "activo";

    setUsuarioProcesando(u.id_usuario);

    try {
      const response = await fetch(
        `/api/tecnico/usuarios/${u.id_usuario}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json().catch(() => ({} as any));

      if (!response.ok || !data.success) {
        console.error("Error al actualizar estado:", data);
        alert(data.error || "No se pudo actualizar el estado del usuario.");
        return;
      }

      setUsuariosGestion((prev) =>
        prev.map((usr) =>
          usr.id_usuario === u.id_usuario ? { ...usr, estado: nuevoEstado } : usr
        )
      );
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado del usuario.");
    } finally {
      setUsuarioProcesando(null);
    }
  };

  // ========================================
  // AUXILIARES
  // ========================================

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      abierto: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
      en_progreso: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      resuelto: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      cancelado: isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
      pendiente: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      completada: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      // Estados de usuario:
      activo: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      inactivo: isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
      suspendido: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerEstilosRol = (nombreRol: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const n = nombreRol.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

    if (n.includes("super") || n.includes("admin")) {
      return isDark
        ? "bg-red-500/15 text-red-300 border-red-500/40"
        : "bg-red-100 text-red-800 border-red-200";
    }

    if (n.includes("tecnico") || n.includes("soporte")) {
      return isDark
        ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
        : "bg-cyan-100 text-cyan-800 border-cyan-200";
    }

    if (n.includes("secretaria")) {
      return isDark
        ? "bg-pink-500/15 text-pink-300 border-pink-500/40"
        : "bg-pink-100 text-pink-800 border-pink-200";
    }

    if (n.includes("medico") || n.includes("doctor")) {
      return isDark
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
        : "bg-emerald-100 text-emerald-800 border-emerald-200";
    }

    return isDark
      ? "bg-indigo-500/15 text-indigo-200 border-indigo-500/40"
      : "bg-indigo-50 text-indigo-800 border-indigo-200";
  };

  const obtenerTextoBotonEstado = (estado: EstadoUsuario) => {
    if (estado === "activo") return "Desactivar";
    if (estado === "inactivo") return "Activar";
    return "Bloqueado";
  };

  // ========================================
  // DERIVADOS
  // ========================================

  const usuariosFiltrados = useMemo(() => {
    let data = [...usuariosGestion];

    const termino = busqueda.trim().toLowerCase();
    if (termino) {
      data = data.filter((u) => {
        const texto = `${u.nombre} ${u.apellido_paterno} ${
          u.apellido_materno || ""
        } ${u.username} ${u.email}`.toLowerCase();
        return texto.includes(termino);
      });
    }

    if (filtroEstado !== "todos") {
      data = data.filter((u) => u.estado === filtroEstado);
    }

    if (filtroRol !== "todos") {
      data = data.filter((u) => String(u.rol.id_rol) === filtroRol);
    }

    if (filtroCentro === "mis_centros" && usuario?.tecnico && !modoGlobal) {
      data = data.filter(
        (u) => u.centro_principal?.id_centro === usuario.tecnico!.id_centro
      );
    } else if (filtroCentro.startsWith("centro:")) {
      const idCentroSel = Number(filtroCentro.split(":")[1]);
      data = data.filter((u) => u.centro_principal?.id_centro === idCentroSel);
    }

    // Restricción extra si el técnico NO es global
    if (usuario?.tecnico && !usuario.tecnico.es_global) {
      data = data.filter(
        (u) => u.centro_principal?.id_centro === usuario.tecnico!.id_centro
      );
    }

    return data;
  }, [
    usuariosGestion,
    busqueda,
    filtroEstado,
    filtroRol,
    filtroCentro,
    modoGlobal,
    usuario,
  ]);

  const resumenRoles = useMemo(() => {
    const total = usuariosGestion.length;
    const activos = usuariosGestion.filter((u) => u.estado === "activo").length;
    const inactivos = usuariosGestion.filter((u) => u.estado === "inactivo")
      .length;
    const suspendidos = usuariosGestion.filter((u) => u.estado === "suspendido")
      .length;
    const globales = usuariosGestion.filter((u) => u.es_global).length;

    const centrosSet = new Set(
      usuariosGestion
        .map((u) => u.centro_principal?.nombre)
        .filter(Boolean) as string[]
    );

    return {
      total,
      activos,
      inactivos,
      suspendidos,
      globales,
      centros: centrosSet.size,
    };
  }, [usuariosGestion]);

  // ========================================
  // RENDER - LOADING / SIN PERMISOS
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
              <UserCog className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando gestor de roles
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando la matriz de usuarios y permisos...
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
            No tienes permisos para acceder a la gestión de usuarios y roles
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
  // RENDER - PÁGINA COMPLETA
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* ========================================
          SIDEBAR
          ======================================== */}
            <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />


      {/* ========================================
          HEADER
          ======================================== */}
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
                placeholder="Buscar usuario por nombre, correo o usuario..."
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

            {/* Alertas */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <AlertCircle className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {/* Dropdown Alertas */}
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Alertas Activas
                    </h3>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-colors cursor-pointer ${
                            !alerta.leida ? "bg-indigo-500/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorEstado(
                                alerta.prioridad
                              )}`}
                            >
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                              >
                                {alerta.titulo}
                              </p>
                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {alerta.descripcion}
                              </p>
                              <p
                                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                              >
                                {formatearFecha(alerta.fecha_creacion)}
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

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "ocupado"
                    ? "bg-yellow-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-red-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera Servicio
              </button>
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
                    Técnico
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
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
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
          </div>
        </div>
      </header>

      {/* ========================================
          CONTENIDO PRINCIPAL
          ======================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Saludo y contexto */}
        <div className="mb-8">
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
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {usuario.tecnico && (
                <p
                  className={`text-sm font-semibold mt-2 ${tema.colores.textoSecundario} flex items-center gap-2`}
                >
                  <MapPin className="w-4 h-4" />
                  {usuario.tecnico.centro?.nombre ?? "Centro no definido"} •{" "}
                  {usuario.tecnico.area_tecnica ?? "Área no definida"}
                </p>
              )}

              <p
                className={`text-sm font-semibold mt-2 ${tema.colores.textoSecundario}`}
              >
                Aquí puedes gestionar los usuarios de tus centros, asignarles
                roles y desactivar cuentas sin eliminarlas.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              {usuario.tecnico?.es_global && (
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${tema.colores.borde} ${tema.colores.card}`}
                >
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold uppercase ${tema.colores.textoSecundario}`}
                    >
                      Alcance de Gestión
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        modoGlobal ? "text-cyan-400" : tema.colores.texto
                      }`}
                    >
                      {modoGlobal ? "Modo Global (todos los centros)" : "Solo mis centros"}
                    </p>
                  </div>
                  <button
                    onClick={togglearModoGlobal}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      modoGlobal ? "bg-cyan-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        modoGlobal ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              <button
                onClick={() => cargarUsuariosRoles(modoGlobal)}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de usuarios / roles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {/* Total usuarios */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-indigo-400 uppercase">
                Total
              </span>
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenRoles.total}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Usuarios Registrados
            </div>
          </div>

          {/* Activos */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase">
                Activos
              </span>
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenRoles.activos}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Usuarios con acceso
            </div>
          </div>

          {/* Inactivos */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-300 uppercase">
                Inactivos
              </span>
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenRoles.inactivos}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Desactivados (sin borrar)
            </div>
          </div>

          {/* Suspendidos */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-yellow-300 uppercase">
                Suspendidos
              </span>
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenRoles.suspendidos}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Bloqueados temporalmente
            </div>
          </div>

          {/* Globales */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-cyan-300 uppercase">
                Globales
              </span>
            </div>
            <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
              {resumenRoles.globales}
            </div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              Usuarios con alcance global
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        <div
          className={`rounded-2xl p-6 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div>
              <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                Filtros de visualización
              </h3>
              <p
                className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
              >
                Ajusta los filtros para encontrar rápidamente al usuario que
                necesitas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Estado */}
              <div className="flex flex-col">
                <label
                  className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                >
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>

              {/* Rol */}
              <div className="flex flex-col">
                <label
                  className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                >
                  Rol
                </label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos los roles</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Centro */}
              <div className="flex flex-col">
                <label
                  className={`text-xs font-bold mb-1 ${tema.colores.textoSecundario}`}
                >
                  Centro
                </label>
                <select
                  value={filtroCentro}
                  onChange={(e) => setFiltroCentro(e.target.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  {usuario.tecnico?.es_global && (
                    <option value="todos">Todos los centros</option>
                  )}
                  <option value="mis_centros">Solo mi centro</option>
                  {centrosDisponibles.map((c) => (
                    <option
                      key={c.id_centro}
                      value={`centro:${c.id_centro}`}
                    >
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla principal de usuarios */}
        <div
          className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Usuarios y Roles
                </h3>
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  {usuariosFiltrados.length} usuarios visibles con los filtros
                  actuales • {resumenRoles.centros} centros involucrados
                </p>
              </div>
            </div>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Cargando usuarios y roles disponibles...
                </p>
              </div>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div
                className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}
              >
                <Users className="w-12 h-12 text-white" />
              </div>
              <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                No se encontraron usuarios
              </p>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Ajusta los filtros o verifica la configuración de tus centros.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar -mx-4 md:mx-0">
              <table className="min-w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${tema.colores.borde} text-xs uppercase tracking-wide ${tema.colores.textoSecundario}`}
                  >
                    <th className="px-4 py-3 text-left">Usuario</th>
                    <th className="px-4 py-3 text-left">Rol</th>
                    <th className="px-4 py-3 text-left">Centro</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Último acceso</th>
                    <th className="px-4 py-3 text-left">Global</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u, index) => {
                    const esPropio = usuario.id_usuario === u.id_usuario;
                    return (
                      <tr
                        key={u.id_usuario}
                        className={`border-b ${tema.colores.borde} ${
                          index % 2 === 0 ? "" : "bg-black/5"
                        } hover:bg-indigo-500/5 transition-colors`}
                      >
                        {/* Usuario */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}
                            >
                              {u.foto_perfil_url ? (
                                <Image
                                  src={u.foto_perfil_url}
                                  alt={u.nombre}
                                  width={40}
                                  height={40}
                                  className="rounded-xl object-cover"
                                />
                              ) : (
                                `${u.nombre[0]}${u.apellido_paterno[0]}`
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-bold ${tema.colores.texto}`}
                              >
                                {u.nombre} {u.apellido_paterno}{" "}
                                {u.apellido_materno || ""}
                              </p>
                              <p
                                className={`text-xs ${tema.colores.textoSecundario}`}
                              >
                                {u.email}
                              </p>
                              <p className="text-xs text-indigo-400">
                                @{u.username}
                                {esPropio && (
                                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                                    Tú
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-2 max-w-xs">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${obtenerEstilosRol(
                                u.rol.nombre
                              )}`}
                            >
                              <Shield className="w-3 h-3" />
                              {u.rol.nombre}
                            </span>
                            <select
                              disabled={
                                usuarioProcesando === u.id_usuario || esPropio
                              }
                              value={u.rol.id_rol}
                              onChange={(e) =>
                                manejarCambioRol(
                                  u.id_usuario,
                                  Number(e.target.value)
                                )
                              }
                              className={`px-3 py-1 rounded-xl text-xs font-semibold border ${tema.colores.borde} ${
                                tema.colores.card
                              } ${
                                usuarioProcesando === u.id_usuario || esPropio
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <option value={u.rol.id_rol}>
                                {esPropio
                                  ? "Tu rol actual (no editable)"
                                  : "Seleccionar nuevo rol"}
                              </option>
                              {rolesDisponibles.map((rol) => (
                                <option key={rol.id_rol} value={rol.id_rol}>
                                  {rol.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Centro */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1 text-xs">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde}`}
                            >
                              <Building2 className="w-3 h-3 text-indigo-400" />
                              <span className={`font-semibold ${tema.colores.texto}`}>
                                {u.centro_principal?.nombre ?? "Sin centro"}
                              </span>
                            </div>
                            {u.centro_principal?.ciudad && (
                              <span
                                className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}
                              >
                                <MapPin className="w-3 h-3" />
                                {u.centro_principal.ciudad}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${obtenerColorEstado(
                              u.estado
                            )}`}
                          >
                            <Activity className="w-3 h-3" />
                            {u.estado.toUpperCase()}
                          </span>
                        </td>

                        {/* Último acceso */}
                        <td className="px-4 py-4 align-top">
                          <div className="text-xs">
                            <p className={tema.colores.texto}>
                              {formatearFecha(u.fecha_ultimo_acceso)}
                            </p>
                            {u.creado_por && (
                              <p className={tema.colores.textoSecundario}>
                                Creado por {u.creado_por}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Global */}
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold ${
                              u.es_global
                                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                                : "bg-gray-500/10 text-gray-300 border-gray-500/30"
                            }`}
                          >
                            <Globe className="w-3 h-3" />
                            {u.es_global ? "GLOBAL" : "LOCAL"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-4 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={
                                usuarioProcesando === u.id_usuario ||
                                u.estado === "suspendido"
                              }
                              onClick={() => manejarToggleEstado(u)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                                u.estado === "activo"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              } ${
                                usuarioProcesando === u.id_usuario ||
                                u.estado === "suspendido"
                                  ? "opacity-60 cursor-not-allowed"
                                  : "hover:scale-105"
                              }`}
                            >
                              {usuarioProcesando === u.id_usuario ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : u.estado === "activo" ? (
                                <UserX className="w-3 h-3" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              {obtenerTextoBotonEstado(u.estado)}
                            </button>

                            <button
                              className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                              title="Más opciones (editar, ver detalle, etc.)"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================
          FOOTER
          ======================================== */}
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
                © 2025 AnyssaMed - Gestión de Usuarios & Roles. Todos los derechos
                reservados.
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
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================
          ESTILOS GLOBALES (CSS)
          ======================================== */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: "Inter", "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          20% {
            transform: rotate(14deg);
          }
          30%,
          60%,
          90% {
            transform: rotate(-8deg);
          }
          40%,
          80% {
            transform: rotate(14deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .hidden.md\\:block {
            display: none;
          }

          .block.md\\:hidden {
            display: block;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (prefers-color-scheme: dark) {
          input,
          select,
          textarea {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
}
