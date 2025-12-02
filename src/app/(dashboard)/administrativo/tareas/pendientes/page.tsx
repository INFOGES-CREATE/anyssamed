// src/app/(dashboard)/secretaria/tareas/pendientes/page.tsx
"use client";

import {
  useState,
  useEffect,
  useMemo,
  FormEvent,
  ChangeEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
   Activity,
  AlertCircle,
  AlertTriangle,
  CalendarPlus ,
  CalendarClock ,
  X,
  CalendarCheck,
  BarChart3,
  Stethoscope,
  FileText,
  Send,
  FileSpreadsheet ,
  Video,
  Award,
  Square,
  TrendingUp,
    
  Pill,
  UserCog, 
  UserPlus,
  Bell,
  BellOff,
  PhoneOutgoing ,
  PhoneIncoming,
  Calendar,
  CalendarDays ,
  Check,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Filter,
  Flame,
  Home,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  PieChart,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Moon,
  User,
  UserCheck,
  Users,
  Target,
  Paperclip,
  Trash,
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
  rol?: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  roles?: Array<{
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  }>;
}

type TareaPrioridad = "baja" | "media" | "alta" | "critica";

type TareaEstado =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "en_espera"
  | "rechazada"
  | "resuelta"
  | "cerrada";

type TipoTarea = "tecnico" | "secretaria" | "administrativo" | "sistema";

interface CentroResumen {
  id_centro: number;
  nombre: string;
}

interface SucursalResumen {
  id_sucursal: number;
  nombre: string;
  id_centro: number;
}

interface UsuarioAsignable {
  id_usuario: number;
  nombre_completo: string;
  rol: string;
  centro?: CentroResumen | null;
  sucursal?: SucursalResumen | null;
}

interface CategoriaTarea {
  id_categoria: number;
  nombre: string;
  color: string;
  icono: string | null;
  activo: boolean;
}

interface OpcionesTareas {
  centros: CentroResumen[];
  sucursales: SucursalResumen[];
  posibles_responsables: UsuarioAsignable[];
  categorias: CategoriaTarea[];
}

interface TareaPendiente {
  id_tarea: number;
  titulo: string;
  descripcion: string | null;
  prioridad: TareaPrioridad;
  estado: TareaEstado;
  tipo_tarea: TipoTarea;
  fecha_limite: string | null;
  fecha_creacion: string;
  centro?: CentroResumen | null;
  sucursal?: SucursalResumen | null;
  responsable?: UsuarioAsignable | null;
  creador?: UsuarioAsignable | null;
  tags?: string[] | null;
  subtareas_pendientes?: number;
  subtareas_totales?: number;
  comentarios_totales?: number;
  adjuntos_totales?: number;
}

interface NotificacionSistema {
  id_notificacion: number;
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
  target?: string;
  rel?: string;
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
    icono: Sparkles,
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
    icono: Users,
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
// COMPONENTE
// ========================================

export default function TareasPendientesSecretariaPage() {
  const pathname = usePathname();
  const router = useRouter();
  const roleParam = "secretaria";

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Tareas");

  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  // Opciones dinámicas
  const [opciones, setOpciones] = useState<OpcionesTareas | null>(null);
  const [loadingOpciones, setLoadingOpciones] = useState(true);

  // Tareas
  const [tareas, setTareas] = useState<TareaPendiente[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [errorTareas, setErrorTareas] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<
    "" | TareaPrioridad
  >("");
  const [filtroEstado, setFiltroEstado] = useState<"" | TareaEstado>("pendiente");
  const [filtroCentro, setFiltroCentro] = useState<string>("");
  const [filtroSucursal, setFiltroSucursal] = useState<string>("");
  const [filtroResponsable, setFiltroResponsable] = useState<string>("");

  const [orden, setOrden] = useState<"vencimiento" | "prioridad" | "creacion">(
    "vencimiento"
  );

  const [enActualizacionEstado, setEnActualizacionEstado] = useState<
    number | null
  >(null);

  const roleLabel = "Secretaria";

  const pathnameActual = usePathname();
  
  const seccionActiva = useMemo(() => {
    if (!pathnameActual) return "";
  
    if (pathnameActual.includes("/confirmaciones")) return "confirmaciones";
    if (pathnameActual.includes("/llamadas")) return "llamadas";
    if (pathnameActual.includes("/pacientes")) return "pacientes";
    if (pathnameActual.includes("/medicos")) return "medicos";
    if (pathnameActual.includes("/recordatorios")) return "recordatorios";
    if (pathnameActual.includes("/documentos")) return "documentos";
    if (pathnameActual.includes("/mensajes")) return "mensajes";
    if (pathnameActual.includes("/telemedicina")) return "telemedicina";
    if (pathnameActual.includes("/tareas")) return "tareas";
    if (pathnameActual.includes("/reportes")) return "reportes";
    if (pathnameActual.includes("/perfil")) return "perfil";
    if (pathnameActual.includes("/configuracion")) return "configuracion";
    if (pathnameActual.includes("/agenda")) return "agenda";
  
    return "dashboard";
  }, [pathnameActual]);

  // ========================================
  // MENU
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
      url: "",
      activo: seccionActiva === "agenda",
      submenu: [
        { titulo: "Ver Agenda", icono: CalendarDays, url: "/secretaria/agenda" },
        { titulo: "Nueva Cita", icono: CalendarPlus, url: "/secretaria/agenda/nueva" },
        { titulo: "Búsqueda Citas", icono: Search, url: "/secretaria/agenda/buscar" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/agenda/disponibilidad" },
      ],
    },
    {
      titulo: "Confirmaciones",
      icono: CheckSquare2,
      url: "",
      activo: seccionActiva === "confirmaciones",
      submenu: [
        { titulo: "Pendientes", icono: Clock, url: "/secretaria/confirmaciones/pendientes" },
        { titulo: "Confirmadas", icono: CheckCircle2, url: "/secretaria/confirmaciones/confirmadas" },
        { titulo: "Cancelaciones", icono: X, url: "/secretaria/confirmaciones/cancelaciones" },
      ],
    },
    {
      titulo: "Llamadas",
      icono: Phone,
      url: "",
      activo: seccionActiva === "llamadas",
      submenu: [
        { titulo: "Por Realizar", icono: PhoneOutgoing, url: "/secretaria/llamadas/pendientes" },
        { titulo: "Realizadas", icono: PhoneIncoming, url: "/secretaria/llamadas/historial" },
        { titulo: "Registro", icono: ClipboardList, url: "/secretaria/llamadas/registro" },
      ],
    },
    {
      titulo: "Pacientes",
      icono: Users,
      url: "",
      activo: seccionActiva === "pacientes",
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
      url: "",
      activo: seccionActiva === "medicos",
      submenu: [
        { titulo: "Mis Médicos", icono: UserCog, url: "/secretaria/medicos" },
        { titulo: "Disponibilidad", icono: CalendarClock, url: "/secretaria/medicos/disponibilidad" },
        { titulo: "Contacto", icono: Phone, url: "/secretaria/medicos/contacto" },
      ],
    },
    {
      titulo: "Recordatorios",
      icono: Bell,
      url: "",
      activo: seccionActiva === "recordatorios",
      submenu: [
        { titulo: "Programados", icono: Clock, url: "/secretaria/recordatorios/programados" },
        { titulo: "Enviados", icono: Send, url: "/secretaria/recordatorios/enviados" },
        { titulo: "Configuración", icono: Settings, url: "/secretaria/recordatorios/config" },
      ],
    },
    {
      titulo: "Documentos",
      icono: FileText,
      url: "",
      activo: seccionActiva === "documentos",
      submenu: [
        { titulo: "Gestión", icono: FileSpreadsheet, url: "/secretaria/documentos" },
        { titulo: "Certificados", icono: Award, url: "/secretaria/documentos/certificados" },
        { titulo: "Recetas", icono: Pill, url: "/secretaria/documentos/recetas" },
        { titulo: "Órdenes", icono: ClipboardList, url: "/secretaria/documentos/ordenes" },
      ],
    },
    {
      titulo: "Mensajes",
      icono: MessageSquare,
      url: "",
      activo: seccionActiva === "mensajes",
      submenu: [
        { titulo: "Bandeja", icono: Mail, url: "/secretaria/mensajes" },
        {
          titulo: "WhatsApp",
          icono: MessageSquare,
          url: "https://web.whatsapp.com/",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        { titulo: "SMS", icono: Phone, url: "/secretaria/mensajes/sms" },
        { titulo: "Email", icono: Mail, url: "/secretaria/mensajes/email" },
        { titulo: "Automáticos", icono: Mail, url: "/secretaria/mensajes/auto" },
      ],
    },
    {
      titulo: "Telemedicina",
      icono: Video,
      url: "",
      activo: seccionActiva === "telemedicina",
      submenu: [
        { titulo: "Sala Espera", icono: Clock, url: "/secretaria/telemedicina/espera" },
        { titulo: "Programadas", icono: CalendarCheck, url: "/secretaria/telemedicina/programadas" },
        { titulo: "Asistencia", icono: Settings, url: "/secretaria/telemedicina/asistencia" },
      ],
    },
    {
      titulo: "Tareas",
      icono: CheckSquare2,
      url: "",
      activo: seccionActiva === "tareas",
      submenu: [
        { titulo: "Todas Mis Tareas", icono: Square, url: "/secretaria/tareas" },
        { titulo: "Pendientes", icono: Square, url: "/secretaria/tareas/pendientes" },
        { titulo: "Completadas", icono: CheckSquare2, url: "/secretaria/tareas/completadas" },
        { titulo: "Nueva Tarea", icono: Plus, url: "/secretaria/tareas/nueva" },
      ],
    },
    {
      titulo: "Reportes",
      icono: BarChart3,
      url: "",
      activo: seccionActiva === "reportes",
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
      url: "",
      activo: seccionActiva === "perfil",
      submenu: [
        { titulo: "Información Personal", icono: User, url: "/secretaria/perfil" },
        { titulo: "Horarios", icono: Clock, url: "/secretaria/perfil/horarios" },
        { titulo: "Preferencias", icono: Settings, url: "/secretaria/perfil/preferencias" },
      ],
    },
    {
      titulo: "Configuración",
      icono: Settings,
      url: "",
      activo: seccionActiva === "configuracion",
      submenu: [
        { titulo: "General", icono: Settings, url: "/secretaria/configuracion/" },
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
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const key = `tema_tareas_${roleParam}`;
    if (typeof window !== "undefined") {
      const guardado = window.localStorage.getItem(key) as TemaColor | null;
      if (guardado && TEMAS[guardado]) {
        setTemaActual(guardado);
      }
    }
  }, []);

  // Usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingUsuario(true);
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const result = await response.json();
        if (!result.success || !result.usuario) {
          window.location.href = "/login";
          return;
        }

        setUsuario(result.usuario);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        window.location.href = "/login";
      } finally {
        setLoadingUsuario(false);
      }
    };

    cargarUsuario();
  }, []);

  // Opciones
  useEffect(() => {
    if (!usuario) return;

    const cargarOpciones = async () => {
      try {
        setLoadingOpciones(true);
        const res = await fetch(
          `/api/tareas/opciones?usuario=${usuario.id_usuario}&rol=secretaria`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          console.error("Error al cargar opciones tareas:", data);
          return;
        }

        setOpciones({
          centros: data.centros || [],
          sucursales: data.sucursales || [],
          posibles_responsables: data.posibles_responsables || [],
          categorias: data.categorias || [],
        });
      } catch (error) {
        console.error("Error opciones:", error);
      } finally {
        setLoadingOpciones(false);
      }
    };

    cargarOpciones();
  }, [usuario]);

  // Tareas pendientes
  useEffect(() => {
    if (!usuario) return;

    const cargarTareas = async () => {
      try {
        setLoadingTareas(true);
        setErrorTareas(null);

        const params = new URLSearchParams();
        params.set("usuario", String(usuario.id_usuario));
        params.set("rol", "secretaria");
        params.set("solo_pendientes", "1");

        if (busqueda.trim()) params.set("q", busqueda.trim());
        if (filtroPrioridad) params.set("prioridad", filtroPrioridad);
        if (filtroEstado) params.set("estado", filtroEstado);
        if (filtroCentro) params.set("centro", filtroCentro);
        if (filtroSucursal) params.set("sucursal", filtroSucursal);
        if (filtroResponsable)
          params.set("responsable", filtroResponsable);
        params.set("orden", orden);

        const url = `/api/secretaria/tareas/pendientes?${params.toString()}`;

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          console.error("Error al cargar tareas pendientes:", data);
          setErrorTareas(
            data?.message ||
              "No se pudieron cargar las tareas pendientes."
          );
          setTareas([]);
          return;
        }

        setTareas(data.tareas || []);
      } catch (error) {
        console.error("Error tareas pendientes:", error);
        setErrorTareas(
          "Ocurrió un error inesperado al cargar las tareas."
        );
        setTareas([]);
      } finally {
        setLoadingTareas(false);
      }
    };

    cargarTareas();
  }, [
    usuario,
    busqueda,
    filtroPrioridad,
    filtroEstado,
    filtroCentro,
    filtroSucursal,
    filtroResponsable,
    orden,
  ]);

  // Preseleccionar estado pendiente
  useEffect(() => {
    if (!filtroEstado) {
      setFiltroEstado("pendiente");
    }
  }, [filtroEstado]);

  // ========================================
  // FUNCIONES
  // ========================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    const key = `tema_tareas_${roleParam}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, nuevoTema);
    }
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (error) {
      console.error("No se pudo guardar tema:", error);
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

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  const actualizarEstadoTarea = async (
    tarea: TareaPendiente,
    nuevoEstado: TareaEstado
  ) => {
    try {
      setEnActualizacionEstado(tarea.id_tarea);
      const res = await fetch(`/api/tareas/${tarea.id_tarea}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado, rol: "secretaria" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        console.error("Error actualizando estado:", data);
        return;
      }

      setTareas((prev) =>
        prev.map((t) =>
          t.id_tarea === tarea.id_tarea ? { ...t, estado: nuevoEstado } : t
        )
      );
    } catch (error) {
      console.error("Error estado tarea:", error);
    } finally {
      setEnActualizacionEstado(null);
    }
  };

  const prioridadBadgeClasses = (prioridad: TareaPrioridad) => {
    switch (prioridad) {
      case "critica":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "alta":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "media":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "baja":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  const estadoBadgeClasses = (estado: TareaEstado) => {
    switch (estado) {
      case "pendiente":
        return "bg-slate-500/20 text-slate-200 border-slate-500/40";
      case "en_progreso":
        return "bg-blue-500/20 text-blue-200 border-blue-500/40";
      case "en_revision":
        return "bg-purple-500/20 text-purple-200 border-purple-500/40";
      case "en_espera":
        return "bg-amber-500/20 text-amber-200 border-amber-500/40";
      case "rechazada":
        return "bg-red-500/20 text-red-200 border-red-500/40";
      case "resuelta":
        return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
      case "cerrada":
        return "bg-gray-500/20 text-gray-200 border-gray-500/40";
      default:
        return "bg-slate-500/20 text-slate-200 border-slate-500/40";
    }
  };

  const prioridadOrden = (p: TareaPrioridad): number => {
    switch (p) {
      case "critica":
        return 1;
      case "alta":
        return 2;
      case "media":
        return 3;
      case "baja":
        return 4;
      default:
        return 99;
    }
  };

  // ========================================
  // MÉTRICAS RESUMEN
  // ========================================

  const ahora = new Date();

  const {
    totalPendientes,
    totalCriticas,
    totalAltas,
    totalVencidas,
    totalHoy,
    totalEnProgreso,
  } = useMemo(() => {
    let total = 0;
    let criticas = 0;
    let altas = 0;
    let vencidas = 0;
    let hoy = 0;
    let enProgreso = 0;

    tareas.forEach((t) => {
      if (t.estado === "pendiente" || t.estado === "en_progreso") {
        total++;
      }
      if (t.prioridad === "critica") criticas++;
      if (t.prioridad === "alta") altas++;
      if (t.estado === "en_progreso") enProgreso++;

      if (t.fecha_limite) {
        const fecha = new Date(t.fecha_limite);
        if (fecha < ahora && t.estado !== "resuelta" && t.estado !== "cerrada") {
          vencidas++;
        }
        const hoyDate = new Date();
        if (
          fecha.getFullYear() === hoyDate.getFullYear() &&
          fecha.getMonth() === hoyDate.getMonth() &&
          fecha.getDate() === hoyDate.getDate()
        ) {
          hoy++;
        }
      }
    });

    return {
      totalPendientes: total,
      totalCriticas: criticas,
      totalAltas: altas,
      totalVencidas: vencidas,
      totalHoy: hoy,
      totalEnProgreso: enProgreso,
    };
  }, [tareas, ahora]);

  // ========================================
  // RENDER LOADING / SESIÓN
  // ========================================

  if (loadingUsuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando tareas pendientes...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando el módulo premium de pendientes
          </p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Sesión no válida
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            Debes iniciar sesión para ver tus tareas pendientes.
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
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${
          tema.colores.sombra
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/40">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <CheckSquare2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>
                    AnyssaMed
                  </h1>
                  <p
                    className={`text-xs font-semibold ${tema.colores.acento}`}
                  >
                    Tareas pendientes · Secretaria
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <CheckSquare2 className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto((v) => !v)}
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
                  href={item.url || pathname}
                  target={item.target}
                  rel={item.rel}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                    item.activo ||
                    (item.titulo === "Tareas" &&
                      pathname.startsWith("/secretaria/tareas"))
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  onClick={(e) => {
                    if (item.target === "_blank") {
                      return;
                    }
                    if (item.submenu) {
                      e.preventDefault();
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
                        item.activo ||
                        (item.titulo === "Tareas" &&
                          pathname.startsWith("/secretaria/tareas"))
                          ? "text-white"
                          : tema.colores.acento
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
                      {item.submenu.map((sub, subindex) => {
                        const activoSub = pathname === sub.url;
                        return (
                          <Link
                            key={subindex}
                            href={sub.url}
                            target={sub.target}
                            rel={sub.rel}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                              activoSub
                                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                                : `${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`
                            }`}
                          >
                            <sub.icono className="w-4 h-4" />
                            <span>{sub.titulo}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
              </div>
            ))}
          </nav>

          {/* Usuario */}
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
                    {roleLabel}
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
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar en tus tareas pendientes (título, descripción, tags, centro...)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-10 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

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
                  Seleccionar tema
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
                onClick={() => setNotificacionesAbiertas((v) => !v)}
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
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
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
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 ${tema.colores.hover} cursor-pointer ${
                            !notif.leida ? "bg-indigo-500/5" : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
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
                            {new Date(
                              notif.fecha_hora
                            ).toLocaleString("es-CL")}
                          </p>
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
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {roleLabel}
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/40">
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
                        {roleLabel}
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

      {/* CONTENIDO */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Header de página */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">👋</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Monitor de tareas pendientes ·{" "}
              <span className={tema.colores.acento}>Secretaría</span>
            </p>
            <p className={`text-sm mt-1 ${tema.colores.textoSecundario}`}>
              {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/secretaria/tareas/nueva"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <Plus className="w-4 h-4" />
              Nueva tarea
            </Link>
            <Link
              href="/secretaria/tareas"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <ClipboardList className="w-4 h-4" />
              Ver todas
            </Link>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Pendientes totales
              </p>
              <p className="text-3xl font-black text-white mt-1">
                {totalPendientes}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Incluye pendientes y en progreso
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-indigo-300" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Críticas
              </p>
              <p className="text-3xl font-black text-red-300 mt-1">
                {totalCriticas}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Máxima prioridad
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-300" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Alta prioridad
              </p>
              <p className="text-3xl font-black text-orange-300 mt-1">
                {totalAltas}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Importantes, no críticas
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-300" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Vencidas
              </p>
              <p className="text-3xl font-black text-pink-300 mt-1">
                {totalVencidas}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Fecha límite ya pasó
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-300" />
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center justify-between`}
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Para hoy
              </p>
              <p className="text-3xl font-black text-emerald-300 mt-1">
                {totalHoy}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Vencen en la fecha actual
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div
          className={`rounded-2xl p-5 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
              >
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className={`text-lg font-black ${tema.colores.texto}`}
                >
                  Filtros inteligentes
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Personaliza la vista de tus tareas pendientes por prioridad,
                  estado, centro y responsable.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>Ordenar por:</span>
              <select
                value={orden}
                onChange={(e) =>
                  setOrden(e.target.value as "vencimiento" | "prioridad" | "creacion")
                }
                className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs"
              >
                <option value="vencimiento">Vencimiento</option>
                <option value="prioridad">Prioridad</option>
                <option value="creacion">Fecha creación</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wide text-gray-400">
                Prioridad
              </label>
              <select
                value={filtroPrioridad}
                onChange={(e) =>
                  setFiltroPrioridad(e.target.value as "" | TareaPrioridad)
                }
                className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-100"
              >
                <option value="">Todas</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide text-gray-400">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value as "" | TareaEstado)
                }
                className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-100"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="en_revision">En revisión</option>
                <option value="en_espera">En espera</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide text-gray-400">
                Centro
              </label>
              <select
                value={filtroCentro}
                onChange={(e) => {
                  setFiltroCentro(e.target.value);
                  setFiltroSucursal("");
                }}
                disabled={loadingOpciones}
                className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-100"
              >
                <option value="">Todos</option>
                {opciones?.centros?.map((c) => (
                  <option key={c.id_centro} value={c.id_centro}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide text-gray-400">
                Sucursal
              </label>
              <select
                value={filtroSucursal}
                onChange={(e) => setFiltroSucursal(e.target.value)}
                disabled={loadingOpciones}
                className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-100"
              >
                <option value="">Todas</option>
                {opciones?.sucursales
                  ?.filter((s) =>
                    filtroCentro
                      ? s.id_centro === Number(filtroCentro)
                      : true
                  )
                  .map((s) => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>
                      {s.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wide text-gray-400">
                Responsable
              </label>
              <select
                value={filtroResponsable}
                onChange={(e) => setFiltroResponsable(e.target.value)}
                disabled={loadingOpciones}
                className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-gray-100"
              >
                <option value="">Todos</option>
                <option value={usuario.id_usuario}>Yo misma/o</option>
                {opciones?.posibles_responsables?.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombre_completo} · {u.rol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LISTADO */}
        <div
          className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3
                  className={`text-lg font-black ${tema.colores.texto}`}
                >
                  Tareas pendientes asignadas a Secretaría
                </h3>
                <p
                  className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                >
                  Se muestran las tareas pendientes y en progreso según tus
                  filtros. Haz clic para ver el detalle en INFOGES.
                </p>
              </div>
            </div>

            {loadingTareas ? null : (
              <p className="text-xs text-gray-400">
                {tareas.length} resultados
              </p>
            )}
          </div>

          {loadingTareas ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Activity className="w-8 h-8 text-indigo-300 animate-spin" />
              <p className="text-sm text-gray-300">
                Cargando tus tareas pendientes...
              </p>
            </div>
          ) : errorTareas ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-300" />
              <p className="text-sm text-red-200">{errorTareas}</p>
            </div>
          ) : tareas.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-300" />
              <p className="text-sm text-gray-200">
                No hay tareas pendientes según los filtros aplicados.
              </p>
              <p className="text-xs text-gray-400">
                Puedes crear una nueva tarea o ajustar los filtros para ver
                más resultados.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
              {tareas
                .slice()
                .sort((a, b) => {
                  if (orden === "prioridad") {
                    return (
                      prioridadOrden(a.prioridad) -
                      prioridadOrden(b.prioridad)
                    );
                  }
                  if (orden === "creacion") {
                    return (
                      new Date(a.fecha_creacion).getTime() -
                      new Date(b.fecha_creacion).getTime()
                    );
                  }
                  // vencimiento
                  const aDate = a.fecha_limite
                    ? new Date(a.fecha_limite).getTime()
                    : Number.MAX_SAFE_INTEGER;
                  const bDate = b.fecha_limite
                    ? new Date(b.fecha_limite).getTime()
                    : Number.MAX_SAFE_INTEGER;
                  return aDate - bDate;
                })
                .map((tarea) => {
                  const vencida =
                    tarea.fecha_limite &&
                    new Date(tarea.fecha_limite) < ahora &&
                    tarea.estado !== "resuelta" &&
                    tarea.estado !== "cerrada";

                  const venceHoy =
                    tarea.fecha_limite &&
                    (() => {
                      const fecha = new Date(tarea.fecha_limite);
                      const hoyDate = new Date();
                      return (
                        fecha.getFullYear() === hoyDate.getFullYear() &&
                        fecha.getMonth() === hoyDate.getMonth() &&
                        fecha.getDate() === hoyDate.getDate()
                      );
                    })();

                  return (
                    <div
                      key={tarea.id_tarea}
                      className={`rounded-2xl p-4 border ${tema.colores.borde} bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4`}
                    >
                      {/* Prioridad y estado */}
                      <div className="flex flex-col items-start gap-2 w-full md:w-48">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${prioridadBadgeClasses(
                            tarea.prioridad
                          )}`}
                        >
                          {tarea.prioridad.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border ${estadoBadgeClasses(
                            tarea.estado
                          )}`}
                        >
                          {tarea.estado.replace("_", " ").toUpperCase()}
                        </span>

                        {vencida && (
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-red-300 font-semibold">
                            <AlertOctagonIcon className="w-3 h-3" />
                            Vencida
                          </span>
                        )}
                        {venceHoy && !vencida && (
                          <span className="mt-1 flex items-center gap-1 text-[11px] text-amber-200 font-semibold">
                            <Calendar className="w-3 h-3" />
                            Vence hoy
                          </span>
                        )}
                      </div>

                      {/* Detalle */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/secretaria/tareas/${tarea.id_tarea}`}
                            className="text-sm md:text-base font-bold text-white hover:underline truncate"
                          >
                            {tarea.titulo}
                          </Link>
                          {tarea.tipo_tarea === "secretaria" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/30 text-indigo-100 border border-indigo-400/60">
                              Secretaría
                            </span>
                          )}
                          {tarea.tipo_tarea === "tecnico" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/60">
                              Técnico
                            </span>
                          )}
                          {tarea.tipo_tarea === "administrativo" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/30 text-cyan-100 border border-cyan-400/60">
                              Administrativo
                            </span>
                          )}
                          {tarea.tipo_tarea === "sistema" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-500/30 text-slate-100 border border-slate-400/60">
                              Sistema
                            </span>
                          )}
                        </div>

                        {tarea.descripcion && (
                          <p className="text-xs text-gray-200 line-clamp-2 mb-2">
                            {tarea.descripcion}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-300">
                          {tarea.centro && (
                            <span className="flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              {tarea.centro.nombre}
                            </span>
                          )}
                          {tarea.sucursal && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {tarea.sucursal.nombre}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            {tarea.responsable?.nombre_completo ||
                              "Sin responsable"}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Creador:{" "}
                            {tarea.creador?.nombre_completo || "Sistema"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Creada:{" "}
                            {new Date(
                              tarea.fecha_creacion
                            ).toLocaleString("es-CL")}
                          </span>
                          {tarea.fecha_limite && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Límite:{" "}
                              {new Date(
                                tarea.fecha_limite
                              ).toLocaleString("es-CL")}
                            </span>
                          )}
                        </div>

                        {tarea.tags && tarea.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {tarea.tags.slice(0, 6).map((tag, idx) => (
                              <span
                                key={`${tarea.id_tarea}-tag-${idx}`}
                                className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-gray-100"
                              >
                                #{tag}
                              </span>
                            ))}
                            {tarea.tags.length > 6 && (
                              <span className="text-[10px] text-gray-400">
                                +{tarea.tags.length - 6} más
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stats y acciones */}
                      <div className="flex flex-col items-end gap-3 w-full md:w-64">
                        <div className="flex flex-wrap justify-end gap-2 text-[11px] text-gray-300">
                          {typeof tarea.subtareas_totales === "number" && (
                            <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1">
                              <CheckSquare2 className="w-3 h-3" />
                              {tarea.subtareas_pendientes ?? 0}/
                              {tarea.subtareas_totales} subtareas
                            </span>
                          )}
                          {typeof tarea.comentarios_totales === "number" && (
                            <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {tarea.comentarios_totales} comentarios
                            </span>
                          )}
                          {typeof tarea.adjuntos_totales === "number" && (
                            <span className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1">
                              <PaperclipIconSmall />
                              {tarea.adjuntos_totales} adjuntos
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            href={`/secretaria/tareas/${tarea.id_tarea}`}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-100 hover:bg-white/10"
                          >
                            Ver detalle
                          </Link>

                          {(tarea.estado === "pendiente" ||
                            tarea.estado === "en_espera") && (
                            <button
                              type="button"
                              disabled={
                                enActualizacionEstado === tarea.id_tarea
                              }
                              onClick={() =>
                                actualizarEstadoTarea(tarea, "en_progreso")
                              }
                              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-blue-500/30 border border-blue-400/60 text-blue-50 hover:bg-blue-500/40 disabled:opacity-60"
                            >
                              {enActualizacionEstado === tarea.id_tarea ? (
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3 animate-spin" />
                                  Actualizando...
                                </span>
                              ) : (
                                "Marcar en progreso"
                              )}
                            </button>
                          )}

                          {(tarea.estado === "pendiente" ||
                            tarea.estado === "en_progreso" ||
                            tarea.estado === "en_revision") && (
                            <button
                              type="button"
                              disabled={
                                enActualizacionEstado === tarea.id_tarea
                              }
                              onClick={() =>
                                actualizarEstadoTarea(tarea, "resuelta")
                              }
                              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-500/30 border border-emerald-400/60 text-emerald-50 hover:bg-emerald-500/40 disabled:opacity-60"
                            >
                              {enActualizacionEstado === tarea.id_tarea ? (
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3 animate-spin" />
                                  Guardando...
                                </span>
                              ) : (
                                "Marcar resuelta"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
            >
              © 2025 AnyssaMed · Módulo de Tareas INFOGES.
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
            >
              v1.0.0 PENDIENTES
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
            <button
              onClick={cerrarSesion}
              className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
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

// Iconos pequeñitos auxiliares
function AlertOctagonIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      {...props}
      stroke="currentColor"
      fill="none"
    >
      <path
        d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v4M12 16h.01"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperclipIconSmall(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      {...props}
      stroke="currentColor"
      fill="none"
      className={`w-3 h-3 ${props.className || ""}`}
    >
      <path
        d="M21.44 11.05l-7.78 7.78a5 5 0 01-7.07-7.07l7.78-7.78a3 3 0 014.24 4.24l-7.78 7.78a1 1 0 01-1.41-1.41l7.07-7.07"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
