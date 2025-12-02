// src/app/(dashboard)/secretaria/recordatorios/accesibilidad/page.tsx
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
  PhoneOff,
  Type,
  Keyboard,
} from "lucide-react";

// ========================================
// TIPOS
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
  };
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

// Accesibilidad

type TamañoTexto = "normal" | "grande" | "extra";
type EspaciadoLinea = "normal" | "amplio";
type ModoDaltonismo = "ninguno" | "deuteranopia" | "protanopia" | "tritanopia";

type PerfilAccesibilidad =
  | "estandar"
  | "adultos_mayores"
  | "baja_vision"
  | "neurodivergente";

interface ConfiguracionAccesibilidadRecordatorios {
  alto_contraste: boolean;
  tamaño_texto: TamañoTexto;
  espaciado_linea: EspaciadoLinea;
  reducir_animaciones: boolean;
  resaltar_foco: boolean;
  lenguaje_simple: boolean;
  incluir_iconos: boolean;
  modo_daltonismo: ModoDaltonismo;
  habilitar_atajos_teclado: boolean;
  sonido_envio: boolean;
}

// ========================================
// TEMAS
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
// CONFIG POR DEFECTO
// ========================================

const CONFIG_ACCESIBILIDAD_DEFAULT: ConfiguracionAccesibilidadRecordatorios = {
  alto_contraste: false,
  tamaño_texto: "normal",
  espaciado_linea: "normal",
  reducir_animaciones: false,
  resaltar_foco: true,
  lenguaje_simple: true,
  incluir_iconos: true,
  modo_daltonismo: "ninguno",
  habilitar_atajos_teclado: true,
  sonido_envio: true,
};

// ========================================
// HELPERS
// ========================================

function resolverCentroAsignado(usuario: any) {
  if (!usuario) return "Centro no asignado";

  if (usuario.secretaria?.centro?.nombre) {
    return usuario.secretaria.centro.nombre;
  }

  if (usuario.medico?.centro?.nombre) {
    return usuario.medico.centro.nombre;
  }

  if (usuario.administrativo?.centro?.nombre) {
    return usuario.administrativo.centro.nombre;
  }

  if (usuario.tecnico?.centro?.nombre) {
    return usuario.tecnico.centro.nombre;
  }

  if (usuario.profesional_salud?.centro?.nombre) {
    return usuario.profesional_salud.centro.nombre;
  }

  if (usuario.centro?.nombre) {
    return usuario.centro.nombre;
  }

  return "Centro no asignado";
}

const obtenerConfigPerfil = (
  perfil: PerfilAccesibilidad
): ConfiguracionAccesibilidadRecordatorios => {
  switch (perfil) {
    case "adultos_mayores":
      return {
        ...CONFIG_ACCESIBILIDAD_DEFAULT,
        alto_contraste: true,
        tamaño_texto: "extra",
        espaciado_linea: "amplio",
        reducir_animaciones: true,
        resaltar_foco: true,
        lenguaje_simple: true,
        incluir_iconos: true,
      };
    case "baja_vision":
      return {
        ...CONFIG_ACCESIBILIDAD_DEFAULT,
        alto_contraste: true,
        tamaño_texto: "extra",
        espaciado_linea: "amplio",
        reducir_animaciones: false,
        resaltar_foco: true,
        lenguaje_simple: true,
        incluir_iconos: false,
      };
    case "neurodivergente":
      return {
        ...CONFIG_ACCESIBILIDAD_DEFAULT,
        alto_contraste: false,
        tamaño_texto: "grande",
        espaciado_linea: "amplio",
        reducir_animaciones: true,
        resaltar_foco: true,
        lenguaje_simple: true,
        incluir_iconos: true,
      };
    default:
      return CONFIG_ACCESIBILIDAD_DEFAULT;
  }
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function RecordatoriosAccesibilidadPage() {
  // Sesión / usuario
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  // Tema
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // UI global
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState<NotificacionSecretaria[]>([]);

  // Accesibilidad
  const [configAccesibilidad, setConfigAccesibilidad] =
    useState<ConfiguracionAccesibilidadRecordatorios>(CONFIG_ACCESIBILIDAD_DEFAULT);
  const [perfilSeleccionado, setPerfilSeleccionado] =
    useState<PerfilAccesibilidad>("estandar");
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);

  // Menú
  const menuItems: MenuItem[] = [
    {
      titulo: "Dashboard",
      icono: Home,
      url: "/secretaria",
    },
    {
      titulo: "Agenda",
      icono: Calendar,
      url: "/secretaria/agenda",
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        {
          titulo: "Nueva Cita",
          icono: CalendarPlus,
          url: "/secretaria/agenda/nueva",
        },
        {
          titulo: "Búsqueda Citas",
          icono: Search,
          url: "/secretaria/agenda/buscar",
        },
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
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "/secretaria/llamadas",
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "/secretaria/pacientes",
      submenu: [
        { titulo: "Todos", icono: Users, url: "/secretaria/pacientes" },
        {
          titulo: "Nuevo Paciente",
          icono: UserPlus,
          url: "/secretaria/pacientes/nuevo",
        },
        {
          titulo: "Búsqueda",
          icono: Search,
          url: "/secretaria/pacientes/buscar",
        },
        {
          titulo: "Atención Hoy",
          icono: CalendarCheck,
          url: "/secretaria/pacientes/hoy",
        },
      ],
    },
    {
      titulo: "Médicos",
      icono: Stethoscope,
      url: "/secretaria/medicos",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
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
      activo: true,
      submenu: [
        {
          titulo: "Programados",
          icono: Clock,
          url: "/secretaria/recordatorios",
        },
        {
          titulo: "Enviados",
          icono: Send,
          url: "/secretaria/recordatorios/enviados",
        },
        {
          titulo: "Configuración",
          icono: Settings,
          url: "/secretaria/recordatorios/config",
        },
        {
          titulo: "Accesibilidad",
          icono: Eye,
          url: "/secretaria/recordatorios/accesibilidad",
        },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "/secretaria/documentos",
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "/secretaria/mensajes",
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "/secretaria/telemedicina",
    },
    {
      titulo: "Tareas",
      icono: CheckSquare,
      url: "/secretaria/tareas",
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "/secretaria/reportes",
    },
    {
      titulo: "Mi Perfil",
      icono: User,
      url: "/secretaria/perfil",
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "/secretaria/configuracion",
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
      cargarNotificaciones();
      cargarConfigAccesibilidad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.secretaria?.id_secretaria]);

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
      } catch (error) {
        console.error("No se pudo cargar la preferencia de tema:", error);
      }
    };
    cargarPreferenciaTema();
  }, []);

  // ========================================
  // FUNCIONES - CARGA DE DATOS
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
            `Acceso denegado. Este módulo es solo para secretarias. Tus roles: ${rolesUsuario.join(
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

  const cargarNotificaciones = async () => {
    try {
      const res = await fetch(
        "/api/secretaria/notificaciones?limit=10&solo_no_leidas=1",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && Array.isArray(data.notificaciones)) {
        setNotificaciones(data.notificaciones);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const cargarConfigAccesibilidad = async () => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setCargandoConfig(true);

      const res = await fetch(
        `/api/secretaria/recordatorios/accesibilidad?id_secretaria=${usuario.secretaria.id_secretaria}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.config) {
        const cfg = {
          ...CONFIG_ACCESIBILIDAD_DEFAULT,
          ...data.config,
        } as ConfiguracionAccesibilidadRecordatorios;

        setConfigAccesibilidad(cfg);

        if (data.perfil_seleccionado) {
          setPerfilSeleccionado(data.perfil_seleccionado as PerfilAccesibilidad);
        }
      } else {
        setConfigAccesibilidad(CONFIG_ACCESIBILIDAD_DEFAULT);
      }
    } catch (error) {
      console.error("Error al cargar config de accesibilidad:", error);
      setConfigAccesibilidad(CONFIG_ACCESIBILIDAD_DEFAULT);
    } finally {
      setCargandoConfig(false);
    }
  };

  // ========================================
  // FUNCIONES - ACCIONES
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
    } catch (error) {
      console.error("No se pudo guardar preferencia en BD:", error);
    }
  };

  const marcarNotificacionLeida = async (idNotificacion: number) => {
    try {
      await fetch(`/api/secretaria/notificaciones/${idNotificacion}/leer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif.id_notificacion === idNotificacion
            ? { ...notif, leida: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const marcarTodasNotificacionesLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const guardarConfigAccesibilidad = async (
    extra?: Partial<ConfiguracionAccesibilidadRecordatorios> & {
      perfil?: PerfilAccesibilidad;
    }
  ) => {
    if (!usuario?.secretaria?.id_secretaria) return;

    try {
      setGuardando(true);

      const payload = {
        ...configAccesibilidad,
        ...(extra || {}),
        perfil_seleccionado: extra?.perfil || perfilSeleccionado,
        id_secretaria: usuario.secretaria.id_secretaria,
      };

      const res = await fetch("/api/secretaria/recordatorios/accesibilidad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "No se pudo guardar la configuración.");
        return;
      }

      if (extra?.perfil) {
        setPerfilSeleccionado(extra.perfil);
      }

      alert("Configuración de accesibilidad guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar accesibilidad:", error);
      alert("Ocurrió un error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarCampoAccesibilidad = <
    K extends keyof ConfiguracionAccesibilidadRecordatorios
  >(
    campo: K,
    valor: ConfiguracionAccesibilidadRecordatorios[K]
  ) => {
    setConfigAccesibilidad((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const aplicarPerfilAccesibilidad = (perfil: PerfilAccesibilidad) => {
    const nuevaConfig = obtenerConfigPerfil(perfil);
    setConfigAccesibilidad(nuevaConfig);
    setPerfilSeleccionado(perfil);
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const previewMensajeClase = useMemo(() => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    let base =
      "rounded-2xl border px-4 py-3 text-sm leading-relaxed transition-all duration-300";

    if (configAccesibilidad.alto_contraste) {
      base +=
        " bg-black text-yellow-200 border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.6)]";
    } else {
      base += ` ${tema.colores.fondoSecundario} ${tema.colores.textoSecundario}`;
    }

    if (configAccesibilidad.tamaño_texto === "grande") base += " text-base";
    if (configAccesibilidad.tamaño_texto === "extra") base += " text-lg";

    if (configAccesibilidad.espaciado_linea === "amplio")
      base += " tracking-wide space-y-2";

    if (isDark && !configAccesibilidad.alto_contraste) {
      base += " bg-gray-900/80 border-gray-700";
    }

    return base;
  }, [configAccesibilidad, tema, temaActual]);

  const claseBotonAccesible = useMemo(() => {
    const focusRing = configAccesibilidad.resaltar_foco
      ? "focus:outline-none focus:ring-4 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-transparent"
      : "focus:outline-none focus:ring-0";

    const size =
      configAccesibilidad.tamaño_texto === "extra"
        ? "text-base px-5 py-3"
        : configAccesibilidad.tamaño_texto === "grande"
        ? "text-sm px-4 py-2.5"
        : "text-xs px-4 py-2";

    return `inline-flex items-center justify-center gap-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 ${size} ${focusRing}`;
  }, [configAccesibilidad]);

  const descripcionPerfil = (perfil: PerfilAccesibilidad) => {
    switch (perfil) {
      case "adultos_mayores":
        return "Texto muy grande, alto contraste y pocas animaciones.";
      case "baja_vision":
        return "Contraste máximo y letras extra grandes.";
      case "neurodivergente":
        return "Lenguaje simple, menos estímulos y foco claro.";
      default:
        return "Configuración estándar del centro de salud.";
    }
  };

  // ========================================
  // RENDER - ESTADOS ESPECIALES
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Eye className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando accesibilidad de recordatorios
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Ajustando la interfaz para que tus pacientes comprendan mejor los
            mensajes...
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
            No tienes permisos para acceder al módulo de recordatorios.
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
  // RENDER COMPLETO
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${
          tema.colores.sombra
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p
                    className={`text-xs font-semibold ${tema.colores.acento}`}
                  >
                    Accesibilidad Recordatorios
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Eye className="w-6 h-6 text-white" />
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

                {sidebarAbierto &&
                  item.submenu &&
                  menuExpandido === item.titulo && (
                    <div className="mt-2 ml-4 space-y-1">
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

          {/* Usuario bottom */}
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
                    Secretaria · {resolverCentroAsignado(usuario)}
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
                placeholder="Buscar ajustes de accesibilidad o ayuda..."
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

          {/* Acciones header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
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
                        onClick={marcarTodasNotificacionesLeidas}
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
                        No tienes notificaciones nuevas.
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
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-400 hover:text-red-300`}
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

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Título */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-black/5 dark:bg-white/10">
                  <Eye className="w-5 h-5" />
                </span>
              </h2>
              <p
                className={`text-lg lg:text-xl font-semibold ${tema.colores.textoSecundario}`}
              >
                Ajusta la accesibilidad de los recordatorios para que todos los
                pacientes entiendan el mensaje.
              </p>
              <p
                className={`text-sm mt-1 ${tema.colores.textoSecundario} opacity-80`}
              >
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => guardarConfigAccesibilidad()}
                disabled={guardando}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-105 ${
                  guardando ? "bg-gray-500 cursor-not-allowed" : tema.colores.primario
                } ${tema.colores.sombra}`}
              >
                {guardando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={() => {
                  setConfigAccesibilidad(CONFIG_ACCESIBILIDAD_DEFAULT);
                  setPerfilSeleccionado("estandar");
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-semibold transition-all duration-300 hover:scale-105`}
              >
                <RefreshCw className="w-4 h-4" />
                Restaurar valores estándar
              </button>
            </div>
          </div>

          {/* Estado general */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 ${tema.colores.textoSecundario}`}
            >
              <Sparkles className="w-3 h-3" />
              Perfil actual:{" "}
              <span className="font-bold text-xs uppercase tracking-wide">
                {perfilSeleccionado.replace("_", " ")}
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Cambios aplicados solo a mensajes de recordatorios.
            </span>
          </div>
        </div>

        {cargandoConfig ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando configuración de accesibilidad...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Perfiles + switches principales */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              {/* Perfiles rápidos */}
              <div
                className={`xl:col-span-1 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Perfiles de accesibilidad
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Aplica configuraciones predefinidas según el tipo de
                      paciente.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(
                    [
                      "estandar",
                      "adultos_mayores",
                      "baja_vision",
                      "neurodivergente",
                    ] as PerfilAccesibilidad[]
                  ).map((perfil) => {
                    const activo = perfilSeleccionado === perfil;
                    const icono =
                      perfil === "adultos_mayores"
                        ? HeartPulse
                        : perfil === "baja_vision"
                        ? Eye
                        : perfil === "neurodivergente"
                        ? BrainCircuit
                        : Settings;

                    const tituloPerfil =
                      perfil === "estandar"
                        ? "Estándar del centro"
                        : perfil === "adultos_mayores"
                        ? "Adultos mayores"
                        : perfil === "baja_vision"
                        ? "Baja visión"
                        : "Perfil neurodivergente";

                    return (
                      <button
                        key={perfil}
                        type="button"
                        onClick={() => aplicarPerfilAccesibilidad(perfil)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                          activo
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                            : `${tema.colores.card} ${tema.colores.borde} border hover:border-indigo-400/60`
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              activo
                                ? "bg-black/10"
                                : "bg-black/5 dark:bg-white/5"
                            }`}
                          >
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-bold truncate ${
                                activo ? "text-white" : tema.colores.texto
                              }`}
                            >
                              {tituloPerfil}
                            </p>
                            <p
                              className={`text-[11px] line-clamp-2 ${
                                activo ? "text-white/80" : tema.colores.textoSecundario
                              }`}
                            >
                              {descripcionPerfil(perfil)}
                            </p>
                          </div>
                        </div>
                        {activo ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <CircleDot />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p
                  className={`mt-4 text-[11px] ${tema.colores.textoSecundario}`}
                >
                  Puedes elegir un perfil y luego ajustar detalles finos en los
                  paneles de la derecha. El perfil solo se usa como punto de
                  partida.
                </p>
              </div>

              {/* Controles principales */}
              <div
                className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Controles principales
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Define cómo se verán y se sentirán los mensajes de
                        recordatorios.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 ${tema.colores.textoSecundario}`}
                  >
                    Pensado para SMS, WhatsApp, email y llamadas automáticas.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  {/* Columna 1 */}
                  <div className="space-y-4">
                    {/* Alto contraste */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-yellow-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Alto contraste
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            actualizarCampoAccesibilidad(
                              "alto_contraste",
                              !configAccesibilidad.alto_contraste
                            )
                          }
                          className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                            configAccesibilidad.alto_contraste
                              ? "bg-yellow-400 justify-end"
                              : "bg-gray-500/40 justify-start"
                          }`}
                        >
                          <span className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                      </div>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Mejora la legibilidad para pacientes con baja visión o
                        sensibilidad al contraste.
                      </p>
                    </div>

                    {/* Tamaño texto */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Type className="w-4 h-4 text-emerald-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Tamaño del texto
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {(["normal", "grande", "extra"] as TamañoTexto[]).map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                actualizarCampoAccesibilidad("tamaño_texto", t)
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                configAccesibilidad.tamaño_texto === t
                                  ? "bg-emerald-500 text-white border-emerald-400"
                                  : `${tema.colores.card} ${tema.colores.textoSecundario}`
                              }`}
                            >
                              {t === "normal"
                                ? "Normal"
                                : t === "grande"
                                ? "Grande"
                                : "Extra grande"}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Espaciado */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Rows2Icon className="w-4 h-4 text-sky-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Espaciado de líneas
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {(
                          ["normal", "amplio"] as EspaciadoLinea[]
                        ).map((esp) => (
                          <button
                            key={esp}
                            type="button"
                            onClick={() =>
                              actualizarCampoAccesibilidad("espaciado_linea", esp)
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              configAccesibilidad.espaciado_linea === esp
                                ? "bg-sky-500 text-white border-sky-400"
                                : `${tema.colores.card} ${tema.colores.textoSecundario}`
                            }`}
                          >
                            {esp === "normal" ? "Normal" : "Amplio"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reducción animaciones */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-purple-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Reducir animaciones
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            actualizarCampoAccesibilidad(
                              "reducir_animaciones",
                              !configAccesibilidad.reducir_animaciones
                            )
                          }
                          className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                            configAccesibilidad.reducir_animaciones
                              ? "bg-purple-500 justify-end"
                              : "bg-gray-500/40 justify-start"
                          }`}
                        >
                          <span className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                      </div>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Recomendado para pacientes que se marean o se distraen
                        con animaciones.
                      </p>
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-4">
                    {/* Lenguaje simple */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Lenguaje simple
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            actualizarCampoAccesibilidad(
                              "lenguaje_simple",
                              !configAccesibilidad.lenguaje_simple
                            )
                          }
                          className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                            configAccesibilidad.lenguaje_simple
                              ? "bg-emerald-500 justify-end"
                              : "bg-gray-500/40 justify-start"
                          }`}
                        >
                          <span className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                      </div>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Reemplaza frases técnicas por mensajes más claros y
                        cortos.
                      </p>
                    </div>

                    {/* Iconos en mensajes */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-pink-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Iconos en mensajes
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            actualizarCampoAccesibilidad(
                              "incluir_iconos",
                              !configAccesibilidad.incluir_iconos
                            )
                          }
                          className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                            configAccesibilidad.incluir_iconos
                              ? "bg-pink-500 justify-end"
                              : "bg-gray-500/40 justify-start"
                          }`}
                        >
                          <span className="w-5 h-5 bg-white rounded-full shadow" />
                        </button>
                      </div>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Añade emojis o íconos (🕒, 📍, 📞) para reforzar el
                        mensaje.
                      </p>
                    </div>

                    {/* Foco y atajos */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Keyboard className="w-4 h-4 text-indigo-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Navegación con teclado
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Resaltar foco
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCampoAccesibilidad(
                                "resaltar_foco",
                                !configAccesibilidad.resaltar_foco
                              )
                            }
                            className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                              configAccesibilidad.resaltar_foco
                                ? "bg-indigo-500 justify-end"
                                : "bg-gray-500/40 justify-start"
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Atajos de teclado activos
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCampoAccesibilidad(
                                "habilitar_atajos_teclado",
                                !configAccesibilidad.habilitar_atajos_teclado
                              )
                            }
                            className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                              configAccesibilidad.habilitar_atajos_teclado
                                ? "bg-indigo-500 justify-end"
                                : "bg-gray-500/40 justify-start"
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                        </div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Ej: <b>ALT + R</b> abre recordatorios, <b>ALT + F</b>{" "}
                          va al buscador.
                        </p>
                      </div>
                    </div>

                    {/* Daltonismo + sonido */}
                    <div
                      className={`p-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-400" />
                          <span
                            className={`font-semibold ${tema.colores.texto}`}
                          >
                            Modo daltonismo & sonido
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={tema.colores.textoSecundario}>
                            Modo daltonismo
                          </span>
                          <select
                            value={configAccesibilidad.modo_daltonismo}
                            onChange={(e) =>
                              actualizarCampoAccesibilidad(
                                "modo_daltonismo",
                                e.target.value as ModoDaltonismo
                              )
                            }
                            className={`ml-auto px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          >
                            <option value="ninguno">Ninguno</option>
                            <option value="deuteranopia">Deuteranopia</option>
                            <option value="protanopia">Protanopia</option>
                            <option value="tritanopia">Tritanopia</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={tema.colores.textoSecundario}>
                            Sonido al enviar recordatorio
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              actualizarCampoAccesibilidad(
                                "sonido_envio",
                                !configAccesibilidad.sonido_envio
                              )
                            }
                            className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                              configAccesibilidad.sonido_envio
                                ? "bg-emerald-500 justify-end"
                                : "bg-gray-500/40 justify-start"
                            }`}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa + buenas prácticas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Vista previa */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <PhoneCall className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Vista previa de mensaje accesible
                      </h3>
                      <p
                        className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Así vería un paciente tus recordatorios con esta
                        configuración.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={previewMensajeClase}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {configAccesibilidad.incluir_iconos && (
                          <span className="text-lg">⏰</span>
                        )}
                        <p className="font-bold">
                          Recordatorio de tu cita de salud
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Mañana · 09:00 hrs
                      </span>
                    </div>

                    <p>
                      Hola, <b>Juan Pérez</b>. Tienes una cita en tu centro de
                      salud{" "}
                      <span className="font-semibold">
                        CESFAM Colón · Box 3
                      </span>
                      .
                    </p>

                    <p>
                      Por favor, llega{" "}
                      <span className="font-semibold">10 minutos antes</span> y
                      trae tu carnet de identidad.
                    </p>

                    {configAccesibilidad.lenguaje_simple && (
                      <p>
                        Si no puedes venir, avísanos llamando al{" "}
                        <span className="font-semibold">75 2 123 456</span>.
                      </p>
                    )}

                    {configAccesibilidad.incluir_iconos && (
                      <p className="text-xs mt-1">
                        {configAccesibilidad.sonido_envio && "🔊 "}Este mensaje
                        es solo informativo. No respondas a este SMS.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className={claseBotonAccesible}>
                      <Check className="w-4 h-4" />
                      Simular confirmación
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-dashed border-gray-500/40 text-gray-400 hover:text-gray-200 hover:border-gray-300/70 transition-all"
                    >
                      <PhoneOff className="w-3 h-3" />
                      Simular fallo de lectura
                    </button>
                  </div>

                  <p
                    className={`text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Esta vista previa es solo un ejemplo. El texto real se
                    adaptará a cada cita, paciente y canal (WhatsApp, SMS,
                    email, llamada automática).
                  </p>
                </div>
              </div>

              {/* Buenas prácticas */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Buenas prácticas recomendadas
                    </h3>
                    <p
                      className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Guías para reducir ausentismo y mejorar la comprensión.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />
                    <div>
                      <p className={tema.colores.texto}>
                        Mensajes cortos y una idea principal por párrafo.
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Evita siglas técnicas y párrafos muy largos, sobre todo
                        en SMS.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />
                    <div>
                      <p className={tema.colores.texto}>
                        Reforzar siempre la{" "}
                        <span className="font-semibold">
                          hora, lugar y motivo
                        </span>{" "}
                        de la cita.
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Son los datos que más olvidan los pacientes y sus
                        cuidadores.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />
                    <div>
                      <p className={tema.colores.texto}>
                        Incluir siempre una forma simple de{" "}
                        <span className="font-semibold">aviso de inasistencia</span>
                        .
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Un número corto o respuesta rápida ayuda a liberar
                        cupos y re-agendar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />
                    <div>
                      <p className={tema.colores.texto}>
                        Adaptar los recordatorios a{" "}
                        <span className="font-semibold">
                          idiomas y cultura
                        </span>{" "}
                        de la población.
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        En centros con población migrante o pueblos originarios,
                        puedes combinar esta accesibilidad con plantillas en
                        otros idiomas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-700/40 text-xs flex flex-wrap items-center gap-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className={tema.colores.textoSecundario}>
                    Recuerda que todas estas opciones se pueden combinar con las
                    plantillas de mensajes que ya tienes configuradas.
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
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
                © 2025 AnyssaMed. Módulo de Recordatorios · Accesibilidad.
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

// Icono auxiliar simple (punto de selección)
function CircleDot() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-white/40 bg-white/10">
      <span className="w-2 h-2 rounded-full bg-white/80" />
    </span>
  );
}

// Icono simple para espaciado (fila doble)
function Rows2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="3" rx="1" />
      <rect x="3" y="11" width="18" height="3" rx="1" />
      <rect x="3" y="17" width="12" height="3" rx="1" />
    </svg>
  );
}
