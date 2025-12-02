// src/app/(dashboard)/tecnico/permisos/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  Key,
  BarChart3,
  Bell,
  RefreshCcw,
  BellOff,
  PenTool,
  Briefcase,
  History,
  Calendar,
  Calculator,
  CalendarCheck,
  SlidersHorizontal,
  CalendarClock,
  Headset,
  Smartphone,
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
  AlertCircle as AlertCircleIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS - SESIÓN Y PERMISOS
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

interface RolSistema {
  id_rol: number;
  nombre: string;
  descripcion: string;
  nivel_jerarquia: number;
  es_global: boolean;
  estado: "activo" | "inactivo";
  total_usuarios?: number;
  total_usuarios_centro?: number;
}

interface PermisoSistema {
  id_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  categoria: string;
  critico: boolean;
}

interface PermisoRol extends PermisoSistema {
  asignado: boolean;
  fecha_actualizacion?: string | null;
}

interface AlertaTecnico {
  id_alerta: number;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
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
    icono: Activity,
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
    icono: Shield,
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

export default function PermisosTecnicoPage() {
  // ----------------------------------------
  // ESTADOS BASE
  // ----------------------------------------

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);


  // ----------------------------------------
  // ESTADOS ROLES / PERMISOS
  // ----------------------------------------

  const [roles, setRoles] = useState<RolSistema[]>([]);
  const [permisosGlobales, setPermisosGlobales] = useState<PermisoSistema[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<RolSistema | null>(
    null
  );
  const [permisosRol, setPermisosRol] = useState<PermisoRol[]>([]);

  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [loadingPermisosRol, setLoadingPermisosRol] = useState(false);
  const [guardandoPermisoId, setGuardandoPermisoId] = useState<number | null>(
    null
  );

  const [busqueda, setBusqueda] = useState("");
  const [filtroModulo, setFiltroModulo] = useState<string>("todos");
  const [filtroCriticidad, setFiltroCriticidad] = useState<string>("todos");
  const [filtroAlcanceRol, setFiltroAlcanceRol] = useState<string>("todos");
  const [estadisticas, setEstadisticas] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("permisos");



 
  // ========================================
  // EFECTOS DE TEMA Y SESIÓN
  // ========================================

  useEffect(() => {
    // cargar tema guardado
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (!usuario || !usuario.tecnico) return;
    const esAdmin =
      usuario.tecnico.nivel_acceso === "administrador" ||
      usuario.tecnico.nivel_acceso === "avanzado";
    if (!esAdmin) return;

    cargarPermisos();
  }, [usuario]);


  const cargarEstadisticas = async () => {
  const res = await fetch(`/api/tecnico/dashboard?id_tecnico=${usuario?.tecnico?.id_tecnico}`);
  const data = await res.json();
  if (data.success) setEstadisticas(data.estadisticas);
};

useEffect(() => {
  if (usuario?.tecnico) cargarEstadisticas();
}, [usuario]);

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

const esTecnicoAdmin = true;


  const puedeGestionarRol = (rol: RolSistema): boolean => {
    if (!usuario || !usuario.tecnico) return false;

    // No puede tocar roles con jerarquía >= a la suya
    if (rol.nivel_jerarquia >= usuario.rol.nivel_jerarquia) return false;

    // Si el rol es global y el técnico NO es global
    if (rol.es_global && !usuario.tecnico.es_global) return false;

    return true;
  };

  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin registro";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin registro";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
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
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  // ========================================
  // CARGA DE DATOS - USUARIO Y PERMISOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoadingUsuario(true);

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
        setUsuario(result.usuario);

        if (result.usuario.tecnico?.disponibilidad) {
          setDisponibilidad(result.usuario.tecnico.disponibilidad);
        }
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoadingUsuario(false);
    }
  };

  const cargarPermisos = async () => {
    try {
      setLoadingPermisos(true);
      const res = await fetch("/api/tecnico/permisos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta permisos:", data);
        return;
      }

      const rolesApi: RolSistema[] = data.roles || [];
      const permisosApi: PermisoSistema[] = data.permisos || [];

      setRoles(rolesApi);
      setPermisosGlobales(permisosApi);

      if (rolesApi.length > 0 && !rolSeleccionado) {
        // Priorizar un rol no global del centro, si existe
        const rolPorDefecto =
          rolesApi.find((r) => !r.es_global) || rolesApi[0];
        setRolSeleccionado(rolPorDefecto);
        await cargarPermisosRol(rolPorDefecto.id_rol);
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    } finally {
      setLoadingPermisos(false);
    }
  };

  const cargarPermisosRol = async (idRol: number) => {
    try {
      setLoadingPermisosRol(true);
      const res = await fetch(`/api/tecnico/permisos/rol/${idRol}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta permisos rol:", data);
        setPermisosRol([]);
        return;
      }

      setPermisosRol(data.permisos || []);
    } catch (error) {
      console.error("Error al cargar permisos del rol:", error);
      setPermisosRol([]);
    } finally {
      setLoadingPermisosRol(false);
    }
  };

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
      console.error("No se pudo guardar preferencia de tema:", err);
    }
  };

  const cambiarEstadoRol = async (
    rol: RolSistema,
    nuevoEstado: "activo" | "inactivo"
  ) => {
    if (!puedeGestionarRol(rol)) {
      alert("No tienes permisos suficientes para modificar este rol.");
      return;
    }

    const accion =
      nuevoEstado === "activo" ? "activar este rol" : "desactivar este rol";
    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} "${rol.nombre}"?\n\nNo se eliminará nada, solo se desactivará para nuevas asignaciones.`
    );
    if (!confirmado) return;

    const estadoAnterior = rol.estado;

    setRoles((prev) =>
      prev.map((r) =>
        r.id_rol === rol.id_rol ? { ...r, estado: nuevoEstado } : r
      )
    );
    if (rolSeleccionado?.id_rol === rol.id_rol) {
      setRolSeleccionado((prev) =>
        prev ? { ...prev, estado: nuevoEstado } : prev
      );
    }

    try {
      const res = await fetch(`/api/tecnico/roles/${rol.id_rol}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id_rol === rol.id_rol ? { ...r, estado: estadoAnterior } : r
          )
        );
        if (rolSeleccionado?.id_rol === rol.id_rol) {
          setRolSeleccionado((prev) =>
            prev ? { ...prev, estado: estadoAnterior } : prev
          );
        }
        alert(
          data.error || "No se pudo actualizar el estado del rol en el servidor."
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado del rol:", error);
      setRoles((prev) =>
        prev.map((r) =>
          r.id_rol === rol.id_rol ? { ...r, estado: estadoAnterior } : r
        )
      );
      if (rolSeleccionado?.id_rol === rol.id_rol) {
        setRolSeleccionado((prev) =>
          prev ? { ...prev, estado: estadoAnterior } : prev
        );
      }
      alert("Error de conexión al actualizar el rol.");
    }
  };

  const handleTogglePermiso = async (permiso: PermisoRol) => {
    if (!rolSeleccionado) return;

    if (!puedeGestionarRol(rolSeleccionado)) {
      alert("No puedes modificar permisos de este rol.");
      return;
    }

    if (permiso.critico && !usuario?.tecnico?.es_global) {
      alert(
        "Los permisos críticos solo pueden modificarse en modo GLOBAL. Contacta al administrador."
      );
      return;
    }

    const nuevoEstado = !permiso.asignado;

    setGuardandoPermisoId(permiso.id_permiso);
    // Actualización optimista
    setPermisosRol((prev) =>
      prev.map((p) =>
        p.id_permiso === permiso.id_permiso
          ? { ...p, asignado: nuevoEstado }
          : p
      )
    );

    try {
      const res = await fetch(
        `/api/tecnico/permisos/rol/${rolSeleccionado.id_rol}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id_permiso: permiso.id_permiso,
            asignado: nuevoEstado,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        // revertir
        setPermisosRol((prev) =>
          prev.map((p) =>
            p.id_permiso === permiso.id_permiso
              ? { ...p, asignado: !nuevoEstado }
              : p
          )
        );
        alert(data.error || "No se pudo actualizar el permiso.");
      }
    } catch (error) {
      console.error("Error al actualizar permiso:", error);
      setPermisosRol((prev) =>
        prev.map((p) =>
          p.id_permiso === permiso.id_permiso
            ? { ...p, asignado: !nuevoEstado }
            : p
        )
      );
      alert("Error de conexión al actualizar el permiso.");
    } finally {
      setGuardandoPermisoId(null);
    }
  };

  // ========================================
  // DERIVADOS PARA UI
  // ========================================

  const totalRoles = roles.length;
  const totalPermisos = permisosGlobales.length;
  const permisosCriticos = permisosGlobales.filter((p) => p.critico).length;
  const rolesGlobales = roles.filter((r) => r.es_global).length;
  const totalUsuariosGestionados = roles.reduce(
    (acc, r) => acc + (r.total_usuarios || 0),
    0
  );

  const modulosDisponibles = useMemo(() => {
    const set = new Set<string>();
    permisosRol.forEach((p) => set.add(p.modulo));
    return Array.from(set).sort();
  }, [permisosRol]);

  const permisosFiltrados = useMemo(() => {
    let lista = [...permisosRol];

    if (filtroModulo !== "todos") {
      lista = lista.filter((p) => p.modulo === filtroModulo);
    }

    if (filtroCriticidad === "criticos") {
      lista = lista.filter((p) => p.critico);
    } else if (filtroCriticidad === "no_criticos") {
      lista = lista.filter((p) => !p.critico);
    }

    const q = busqueda.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q) ||
          p.modulo.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
      );
    }

    return lista;
  }, [permisosRol, filtroModulo, filtroCriticidad, busqueda]);

  const rolesFiltrados = useMemo(() => {
    let lista = [...roles];

    if (filtroAlcanceRol === "global") {
      lista = lista.filter((r) => r.es_global);
    } else if (filtroAlcanceRol === "centro") {
      lista = lista.filter((r) => !r.es_global);
    }

    return lista;
  }, [roles, filtroAlcanceRol]);

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // ========================================
  // RENDER ESTADOS BASE
  // ========================================

  if (loadingUsuario) {
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
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando seguridad y permisos...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Validando tu sesión técnica
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
            Este módulo es exclusivo para técnicos con rol asignado.
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

  if (!esTecnicoAdmin) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-lg mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Permisos Restringidos
          </h2>
          <p className={`text-lg mb-4 ${tema.colores.textoSecundario}`}>
            Solo técnicos con acceso <strong>Avanzado</strong> o{" "}
            <strong>Administrador</strong> pueden gestionar roles y permisos.
          </p>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Si consideras que esto es un error, contacta al administrador del
            sistema.
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER COMPLETO
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
          {/* Búsqueda global de permisos */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar permiso por nombre, módulo o código..."
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

            {/* Alertas (para futuros avisos de seguridad) */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Alertas de Seguridad
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
                        No hay alertas de permisos por ahora
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
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
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
            <div className="hidden md:flex items-center gap-2">
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
                    Técnico • {usuario.tecnico?.area_tecnica}
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
                        {usuario.tecnico?.tipo_tecnico} • Seguridad
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario} flex items-center gap-1`}
                      >
                        <MapPin className="w-3 h-3" />
                        {usuario.tecnico?.centro?.nombre ?? "Centro no definido"}
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="animate-wave inline-block">🛡️</span>
              </h2>
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Configura <span className="font-bold">roles</span> y{" "}
                <span className="font-bold">permisos finos</span> para tus
                centros sin eliminar nada: solo activar o desactivar.
              </p>
              {usuario.tecnico && (
                <p
                  className={`text-sm font-semibold mt-2 ${tema.colores.textoSecundario} flex items-center gap-2`}
                >
                  <MapPin className="w-4 h-4" />
                  {usuario.tecnico.es_global ? (
                    <>
                      Modo <strong>GLOBAL</strong> • Todos los centros
                    </>
                  ) : (
                    <>
                      Centro:{" "}
                      <strong>
                        {usuario.tecnico.centro?.nombre ?? "No definido"}
                      </strong>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col gap-1`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Roles
                  </span>
                </div>
                <div
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {totalRoles}
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Configurables
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col gap-1`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                  >
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Permisos
                  </span>
                </div>
                <div
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {totalPermisos}
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Totales
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col gap-1`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
                  >
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Críticos
                  </span>
                </div>
                <div
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {permisosCriticos}
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Requieren cuidado
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col gap-1`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Roles Globales
                  </span>
                </div>
                <div
                  className={`text-2xl font-black ${tema.colores.texto}`}
                >
                  {rolesGlobales}
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Alcance comunal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL: ROLES + PERMISOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PANEL IZQUIERDO - ROLES */}
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-2xl font-black ${tema.colores.texto}`}
                  >
                    Roles disponibles
                  </h3>
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Selecciona un rol para ver y ajustar sus permisos
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <select
                  value={filtroAlcanceRol}
                  onChange={(e) => setFiltroAlcanceRol(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos los roles</option>
                  <option value="centro">Solo roles del centro</option>
                  <option value="global">Solo roles globales</option>
                </select>
              </div>
            </div>

            {loadingPermisos ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Cargando roles y permisos...
                  </p>
                </div>
              </div>
            ) : rolesFiltrados.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 animate-pulse"
                >
                  <Users className="w-10 h-10 text-white" />
                </div>
                <p
                  className={`text-lg font-bold ${tema.colores.texto} mb-1`}
                >
                  No hay roles configurables
                </p>
                <p
                  className={`text-sm ${tema.colores.textoSecundario}`}
                >
                  Crea roles desde el módulo de administración central.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {rolesFiltrados.map((rol) => {
                  const seleccionado = rolSeleccionado?.id_rol === rol.id_rol;
                  const bloqueado = !puedeGestionarRol(rol);

                  return (
                    <div
                      key={rol.id_rol}
                      onClick={() => {
                        setRolSeleccionado(rol);
                        cargarPermisosRol(rol.id_rol);
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        seleccionado
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.card} ${tema.colores.borde} border ${tema.colores.hover}`
                      } ${tema.colores.sombra}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              seleccionado
                                ? "bg-white/20"
                                : "bg-gradient-to-br from-indigo-500/80 to-purple-500/80"
                            }`}
                          >
                            <UserCog
                              className={`w-5 h-5 ${
                                seleccionado ? "text-white" : "text-white"
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`font-black text-sm truncate ${
                                seleccionado ? "text-white" : tema.colores.texto
                              }`}
                            >
                              {rol.nombre}
                            </p>
                            <p
                              className={`text-xs mt-1 line-clamp-2 ${
                                seleccionado
                                  ? "text-indigo-100"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {rol.descripcion}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                              <span
                                className={`px-2 py-1 rounded-full font-bold border ${
                                  seleccionado
                                    ? "border-white/40 text-white bg-white/10"
                                    : "border-indigo-300 text-indigo-700 bg-indigo-50"
                                }`}
                              >
                                Jerarquía {rol.nivel_jerarquia}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full font-bold border flex items-center gap-1 ${
                                  rol.es_global
                                    ? seleccionado
                                      ? "border-emerald-300 text-emerald-100 bg-emerald-500/20"
                                      : "border-emerald-500 text-emerald-700 bg-emerald-50"
                                    : seleccionado
                                    ? "border-sky-300 text-sky-100 bg-sky-500/20"
                                    : "border-sky-500 text-sky-700 bg-sky-50"
                                }`}
                              >
                                <Globe className="w-3 h-3" />
                                {rol.es_global ? "Global" : "Centro"}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full font-bold border ${
                                  seleccionado
                                    ? "border-white/30 text-white bg-white/10"
                                    : "border-gray-300 text-gray-700 bg-gray-50"
                                }`}
                              >
                                {(rol.total_usuarios || 0) + " usuarios"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarEstadoRol(
                                rol,
                                rol.estado === "activo" ? "inactivo" : "activo"
                              );
                            }}
                            disabled={!puedeGestionarRol(rol)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                              rol.estado === "activo"
                                ? seleccionado
                                  ? "bg-emerald-500 text-white border-emerald-300"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : seleccionado
                                ? "bg-gray-700 text-gray-100 border-gray-400"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            } ${
                              !puedeGestionarRol(rol)
                                ? "opacity-60 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {rol.estado === "activo" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Activo
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                Inactivo
                              </>
                            )}
                          </button>
                          {bloqueado && (
                            <p
                              className={`text-[10px] ${seleccionado ? "text-indigo-100" : tema.colores.textoSecundario}`}
                            >
                              No puedes modificar este rol
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PANEL DERECHO - PERMISOS DEL ROL */}
          <div
            className={`lg:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg"
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-2xl font-black ${tema.colores.texto}`}
                  >
                    Permisos del rol
                  </h3>
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    {rolSeleccionado
                      ? `Editando: ${rolSeleccionado.nombre}`
                      : "Selecciona un rol en el panel izquierdo"}
                  </p>
                </div>
              </div>

              {/* Filtros permisos */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Filter className="w-3 h-3" />
                  <span
                    className={`${tema.colores.textoSecundario}`}
                  >
                    Filtros
                  </span>
                </div>
                <select
                  value={filtroModulo}
                  onChange={(e) => setFiltroModulo(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos los módulos</option>
                  {modulosDisponibles.map((modulo) => (
                    <option key={modulo} value={modulo}>
                      {modulo}
                    </option>
                  ))}
                </select>
                <select
                  value={filtroCriticidad}
                  onChange={(e) => setFiltroCriticidad(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos los permisos</option>
                  <option value="criticos">Solo críticos</option>
                  <option value="no_criticos">No críticos</option>
                </select>
              </div>
            </div>

            {!rolSeleccionado ? (
              <div className="text-center py-16">
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse"
                >
                  <ShieldCheck className="w-12 h-12 text-white" />
                </div>
                <p
                  className={`text-lg font-bold ${tema.colores.texto} mb-1`}
                >
                  Selecciona un rol
                </p>
                <p
                  className={`text-sm ${tema.colores.textoSecundario}`}
                >
                  Elige un rol en la columna izquierda para ver sus permisos.
                </p>
              </div>
            ) : loadingPermisosRol ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-3" />
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Cargando permisos del rol...
                  </p>
                </div>
              </div>
            ) : permisosRol.length === 0 ? (
              <div className="text-center py-16">
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse"
                >
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <p
                  className={`text-lg font-bold ${tema.colores.texto} mb-1`}
                >
                  Este rol no tiene permisos asignados aún
                </p>
                <p
                  className={`text-sm ${tema.colores.textoSecundario}`}
                >
                  Activa los permisos que necesite este perfil.
                </p>
              </div>
            ) : permisosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Ningún permiso coincide con los filtros actuales.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between text-xs">
                  <p
                    className={`${tema.colores.textoSecundario}`}
                  >
                    Mostrando{" "}
                    <span className="font-bold">
                      {permisosFiltrados.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-bold">{permisosRol.length}</span>{" "}
                    permisos del rol
                  </p>
                  <p
                    className={`text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Cambios guardados en tiempo real • Sin eliminaciones, solo
                    activación/desactivación
                  </p>
                </div>

                <div className="space-y-3 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
                  {permisosFiltrados.map((permiso) => {
                    const bloqueado = !puedeGestionarRol(rolSeleccionado);

                    const esCritico = permiso.critico;
                    const asignado = permiso.asignado;

                    return (
                      <div
                        key={permiso.id_permiso}
                        className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 ${tema.colores.sombra} group`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                asignado
                                  ? "bg-gradient-to-br from-emerald-500 to-cyan-500"
                                  : "bg-gradient-to-br from-gray-500 to-slate-600"
                              }`}
                            >
                              {asignado ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <Lock className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p
                                  className={`font-black text-sm ${tema.colores.texto}`}
                                >
                                  {permiso.nombre}
                                </p>
                                <span
                                  className={`px-2 py-1 rounded-full text-[11px] font-bold border ${
                                    asignado
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-400/60"
                                      : "bg-gray-500/10 text-gray-400 border-gray-500/50"
                                  }`}
                                >
                                  {permiso.codigo}
                                </span>
                                {esCritico && (
                                  <span
                                    className={`px-2 py-1 rounded-full text-[11px] font-bold border ${obtenerColorPrioridad(
                                      "critica"
                                    )} flex items-center gap-1`}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    Crítico
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                              >
                                {permiso.descripcion}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <span
                                  className={`px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                >
                                  Módulo:{" "}
                                  <span className="font-bold">
                                    {permiso.modulo}
                                  </span>
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                >
                                  Categoría:{" "}
                                  <span className="font-bold">
                                    {permiso.categoria}
                                  </span>
                                </span>
                                {permiso.fecha_actualizacion && (
                                  <span
                                    className={`px-2 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario}`}
                                  >
                                    Última actualización:{" "}
                                    {formatearFecha(permiso.fecha_actualizacion)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Switch de permiso */}
                          <div className="flex flex-col items-end gap-1">
                            <button
                              disabled={
                                bloqueado ||
                                guardandoPermisoId === permiso.id_permiso
                              }
                              onClick={() => handleTogglePermiso(permiso)}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                                asignado
                                  ? "bg-emerald-500"
                                  : "bg-gray-500/60"
                              } ${
                                bloqueado
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer hover:scale-105"
                              }`}
                            >
                              <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                  asignado ? "translate-x-5" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <p
                              className={`text-[11px] font-semibold ${
                                asignado
                                  ? "text-emerald-400"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {asignado ? "Permitido" : "Denegado"}
                            </p>
                            {bloqueado && (
                              <p
                                className={`text-[10px] ${tema.colores.textoSecundario} flex items-center gap-1`}
                              >
                                <Lock className="w-3 h-3" />
                                Rol de igual o mayor nivel
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* NOTA INFORMATIVA */}
        <div
          className={`mt-8 rounded-2xl p-4 border-dashed ${tema.colores.borde} border-2 ${tema.colores.card}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
              >
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${tema.colores.texto}`}
                >
                  Política de seguridad de AnyssaMed
                </p>
                <p
                  className={`text-xs ${tema.colores.textoSecundario}`}
                >
                  Este módulo no elimina roles ni permisos. Solo permite
                  activarlos o desactivarlos de forma controlada según tu
                  nivel de acceso y alcance (centro / global).
                </p>
              </div>
            </div>
            <p
              className={`text-xs ${tema.colores.textoSecundario}`}
            >
              Usuarios gestionados por estos roles:{" "}
              <span className="font-bold">{totalUsuariosGestionados}</span>
            </p>
          </div>
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
                © 2025 AnyssaMed - Módulo de Seguridad. Todos los derechos
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

        .transition-all {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }

        .hover\\:-translate-y-1:hover {
          transform: translateY(-4px);
        }

        .backdrop-blur-xl {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
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
