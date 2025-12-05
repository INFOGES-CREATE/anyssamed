// src/app/(dashboard)/tecnico/tickets/buscar/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
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
  Building2,
  MessageSquare,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ClipboardList,
  Cpu,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Grid2X2,
  Headset,
  HeartPulse,
  Lightbulb,
  List,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Microscope,
  Moon,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Share2,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Wifi,
  Wrench,
  X,
  Zap,
  BrainCircuit,
  Layers,
  SlidersHorizontal,
  FilterX,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green" | "cosmic" | "sunset";

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
    glow: string;
    particulas: string;
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

interface Ticket {
  id_ticket: number;
  numero_ticket: string;
  titulo: string;
  descripcion: string;
  estado: "abierto" | "en_progreso" | "resuelto" | "cancelado";
  prioridad: "baja" | "media" | "alta" | "critica";
  tipo: "soporte" | "mantenimiento" | "ingenieria" | "biomedico" | "infraestructura";
  fecha_creacion: string;
  fecha_asignacion: string;
  fecha_resolucion: string | null;
  tiempo_estimado_minutos: number;
  tiempo_real_minutos: number | null;
  centro: {
    id_centro: number;
    nombre: string;
    ciudad: string;
  };
  departamento: {
    id_departamento: number;
    nombre: string;
  } | null;
  solicitante: {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    telefono: string | null;
  };
  equipo_afectado: {
    id_equipo: number;
    nombre: string;
    tipo: string;
    ubicacion: string;
  } | null;
  notas_tecnico: string | null;
  calificacion: number | null;
  comentario_cliente: string | null;
}

interface AlertaTecnico {
  id_alerta: number;
  tipo: "equipo_falla" | "mantenimiento_vencido" | "ticket_urgente" | "equipo_critico";
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta" | "critica";
  fecha_creacion: string;
  leida: boolean;
  url_accion: string | null;
}

type VistaTickets = "lista" | "tablero" | "compacta";
type OrdenTickets = "reciente" | "antiguo" | "prioridad" | "estado";

// ========================================
// CONFIGURACIONES DE TEMAS PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Cristal Luminoso",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-100",
      fondoSecundario: "bg-white/80",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700",
      secundario: "bg-white/60 hover:bg-white/80 backdrop-blur-xl",
      acento: "text-indigo-600",
      borde: "border-indigo-200/50",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/70 backdrop-blur-2xl border-indigo-200/30",
      header: "bg-white/60 backdrop-blur-2xl border-indigo-200/30",
      card: "bg-white/70 backdrop-blur-xl border-indigo-200/40 hover:border-indigo-400/60 hover:shadow-indigo-500/30",
      hover: "hover:bg-indigo-50/80",
      glow: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      particulas: "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400",
    },
  },
  dark: {
    nombre: "Obsidiana Estelar",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900/80",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario: "bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:via-purple-500 hover:to-fuchsia-500",
      secundario: "bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-xl",
      acento: "text-indigo-400",
      borde: "border-indigo-800/50",
      sombra: "shadow-2xl shadow-indigo-500/30",
      gradiente: "from-indigo-500 via-purple-500 to-fuchsia-500",
      sidebar: "bg-gray-900/70 backdrop-blur-2xl border-indigo-800/30",
      header: "bg-gray-900/60 backdrop-blur-2xl border-indigo-800/30",
      card: "bg-gray-800/50 backdrop-blur-xl border-indigo-700/40 hover:border-indigo-500/60 hover:shadow-indigo-500/40",
      hover: "hover:bg-gray-800/80",
      glow: "shadow-[0_0_40px_rgba(99,102,241,0.4)]",
      particulas: "bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500",
    },
  },
  blue: {
    nombre: "Océano Cuántico",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900/80",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500",
      secundario: "bg-blue-800/60 hover:bg-blue-700/80 backdrop-blur-xl",
      acento: "text-cyan-400",
      borde: "border-cyan-800/50",
      sombra: "shadow-2xl shadow-cyan-500/30",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/70 backdrop-blur-2xl border-cyan-800/30",
      header: "bg-blue-900/60 backdrop-blur-2xl border-cyan-800/30",
      card: "bg-blue-800/50 backdrop-blur-xl border-cyan-700/40 hover:border-cyan-500/60 hover:shadow-cyan-500/40",
      hover: "hover:bg-blue-800/80",
      glow: "shadow-[0_0_40px_rgba(6,182,212,0.4)]",
      particulas: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500",
    },
  },
  purple: {
    nombre: "Nebulosa Violeta",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900/80",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario: "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-violet-500",
      secundario: "bg-purple-800/60 hover:bg-purple-700/80 backdrop-blur-xl",
      acento: "text-fuchsia-400",
      borde: "border-purple-800/50",
      sombra: "shadow-2xl shadow-fuchsia-500/30",
      gradiente: "from-fuchsia-500 via-purple-500 to-violet-500",
      sidebar: "bg-purple-900/70 backdrop-blur-2xl border-purple-800/30",
      header: "bg-purple-900/60 backdrop-blur-2xl border-purple-800/30",
      card: "bg-purple-800/50 backdrop-blur-xl border-purple-700/40 hover:border-fuchsia-500/60 hover:shadow-fuchsia-500/40",
      hover: "hover:bg-purple-800/80",
      glow: "shadow-[0_0_40px_rgba(217,70,239,0.4)]",
      particulas: "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500",
    },
  },
  green: {
    nombre: "Selva Bioluminiscente",
    icono: HeartPulse,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900/80",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500",
      secundario: "bg-teal-800/60 hover:bg-teal-700/80 backdrop-blur-xl",
      acento: "text-emerald-400",
      borde: "border-emerald-800/50",
      sombra: "shadow-2xl shadow-emerald-500/30",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/70 backdrop-blur-2xl border-emerald-800/30",
      header: "bg-emerald-900/60 backdrop-blur-2xl border-emerald-800/30",
      card: "bg-emerald-800/50 backdrop-blur-xl border-emerald-700/40 hover:border-emerald-500/60 hover:shadow-emerald-500/40",
      hover: "hover:bg-emerald-800/80",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]",
      particulas: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500",
    },
  },
  cosmic: {
    nombre: "Cosmos Infinito",
    icono: Rocket,
    colores: {
      fondo: "from-slate-950 via-violet-950 to-fuchsia-950",
      fondoSecundario: "bg-slate-900/80",
      texto: "text-white",
      textoSecundario: "text-violet-300",
      primario: "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500",
      secundario: "bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-xl",
      acento: "text-violet-400",
      borde: "border-violet-800/50",
      sombra: "shadow-2xl shadow-violet-500/30",
      gradiente: "from-violet-500 via-fuchsia-500 to-pink-500",
      sidebar: "bg-slate-900/70 backdrop-blur-2xl border-violet-800/30",
      header: "bg-slate-900/60 backdrop-blur-2xl border-violet-800/30",
      card: "bg-slate-800/50 backdrop-blur-xl border-violet-700/40 hover:border-violet-500/60 hover:shadow-violet-500/40",
      hover: "hover:bg-slate-800/80",
      glow: "shadow-[0_0_50px_rgba(139,92,246,0.5)]",
      particulas: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500",
    },
  },
  sunset: {
    nombre: "Atardecer Dorado",
    icono: Sun,
    colores: {
      fondo: "from-orange-950 via-rose-950 to-pink-950",
      fondoSecundario: "bg-orange-900/80",
      texto: "text-white",
      textoSecundario: "text-orange-300",
      primario: "bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 hover:from-orange-500 hover:via-rose-500 hover:to-pink-500",
      secundario: "bg-orange-800/60 hover:bg-orange-700/80 backdrop-blur-xl",
      acento: "text-orange-400",
      borde: "border-orange-800/50",
      sombra: "shadow-2xl shadow-orange-500/30",
      gradiente: "from-orange-500 via-rose-500 to-pink-500",
      sidebar: "bg-orange-900/70 backdrop-blur-2xl border-orange-800/30",
      header: "bg-orange-900/60 backdrop-blur-2xl border-orange-800/30",
      card: "bg-orange-800/50 backdrop-blur-xl border-orange-700/40 hover:border-orange-500/60 hover:shadow-orange-500/40",
      hover: "hover:bg-orange-800/80",
      glow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]",
      particulas: "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function BuscarTicketsTecnicoPage() {
  // Estados base
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("cosmic");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  // Búsqueda y filtros avanzados
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");
  const [filtroSoloCriticos, setFiltroSoloCriticos] = useState(false);
  const [filtroSoloHoy, setFiltroSoloHoy] = useState(false);
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [ordenamiento, setOrdenamiento] = useState<OrdenTickets>("reciente");

  const [vista, setVista] = useState<VistaTickets>("lista");
  const [paginaActual, setPaginaActual] = useState(1);
  const [tamanoPagina] = useState(15);

  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [filtrosAvanzadosAbiertos, setFiltrosAvanzadosAbiertos] = useState(true);

  const [nuevoTicketData, setNuevoTicketData] = useState<{
    titulo: string;
    descripcion: string;
    tipo: Ticket["tipo"];
    prioridad: Ticket["prioridad"];
    telefono: string;
  }>({
    titulo: "",
    descripcion: "",
    tipo: "soporte",
    prioridad: "media",
    telefono: "",
  });

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (saved && TEMAS[saved]) {
        setTemaActual(saved);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarDatosTickets();
    }
  }, [usuario]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.tecnico) {
        cargarDatosTickets(false);
      }
    }, 180000);

    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
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
          (rol) => rol.includes("TECNICO") || rol.includes("SOPORTE")
        );

        if (!tieneRolTecnico) {
          alert(
            `Acceso denegado. Este módulo es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarDatosTickets = async (mostrarLoader: boolean = true) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      if (mostrarLoader) setLoadingData(true);

      const res = await fetch(
        `/api/tecnico/dashboard?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta de tickets:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setTickets(data.tickets || []);
      setAlertas(data.alertas || []);
    } catch (err) {
      console.error("Error al cargar tickets:", err);
    } finally {
      if (mostrarLoader) setLoadingData(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    try {
      const response = await fetch(
        `/api/tecnico/${usuario?.tecnico?.id_tecnico}/disponibilidad`,
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

  const actualizarEstadoTicket = async (
    idTicket: number,
    nuevoEstado: Ticket["estado"]
  ) => {
    try {
      const response = await fetch(`/api/tecnico/tickets/${idTicket}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id_ticket === idTicket ? { ...ticket, estado: nuevoEstado } : ticket
          )
        );
        cargarDatosTickets(false);
      } else {
        alert("Error al actualizar estado del ticket");
      }
    } catch (error) {
      console.error("Error al actualizar estado del ticket:", error);
      alert("Error al actualizar estado del ticket");
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

  const limpiarFiltros = useCallback(() => {
    setFiltroEstado("todos");
    setFiltroPrioridad("todas");
    setFiltroTipo("todos");
    setFiltroCentro("todos");
    setFiltroSoloCriticos(false);
    setFiltroSoloHoy(false);
    setFechaDesde("");
    setFechaHasta("");
    setBusqueda("");
    setPaginaActual(1);
    setOrdenamiento("reciente");
  }, []);

  const manejarNuevoTicketChange = (campo: string, valor: string) => {
    setNuevoTicketData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const crearNuevoTicket = async (e: any) => {
    e.preventDefault();
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const body = {
        id_tecnico: usuario.tecnico.id_tecnico,
        titulo: nuevoTicketData.titulo.trim(),
        descripcion: nuevoTicketData.descripcion.trim(),
        tipo: nuevoTicketData.tipo,
        prioridad: nuevoTicketData.prioridad,
        telefono_contacto:
          nuevoTicketData.telefono.trim() ||
          usuario.tecnico.extension_telefonica ||
          null,
        id_centro: usuario.tecnico.centro?.id_centro || null,
      };

      const response = await fetch("/api/tecnico/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        console.error("Error al crear ticket:", data);
        alert("No se pudo crear el ticket. Revisa los datos.");
        return;
      }

      setModalNuevoAbierto(false);
      setNuevoTicketData({
        titulo: "",
        descripcion: "",
        tipo: "soporte",
        prioridad: "media",
        telefono: "",
      });
      await cargarDatosTickets();
    } catch (error) {
      console.error("Error al crear ticket:", error);
      alert("Error inesperado al crear el ticket");
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

  const formatearFechaSoloDia = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green", "cosmic", "sunset"].includes(temaActual);
    const colores: { [key: string]: string } = {
      abierto: isDark
        ? "bg-red-500/20 text-red-300 border-red-400/40"
        : "bg-red-100 text-red-800 border-red-200",
      en_progreso: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
        : "bg-blue-100 text-blue-800 border-blue-200",
      resuelto: isDark
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
        : "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelado: isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      colores[estado.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    const isDark = ["dark", "blue", "purple", "green", "cosmic", "sunset"].includes(temaActual);
    const colores: { [key: string]: string } = {
      critica: isDark
        ? "bg-red-500/20 text-red-300 border-red-400/50"
        : "bg-red-100 text-red-800 border-red-200",
      alta: isDark
        ? "bg-orange-500/20 text-orange-300 border-orange-400/50"
        : "bg-orange-100 text-orange-800 border-orange-200",
      media: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      baja: isDark
        ? "bg-green-500/20 text-green-300 border-green-400/50"
        : "bg-green-100 text-green-800 border-green-200",
    };

    return (
      colores[prioridad.toLowerCase()] ||
      (isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const obtenerIconoTipo = (tipo: string) => {
    const iconos: { [key: string]: any } = {
      soporte: Headset,
      mantenimiento: Wrench,
      ingenieria: BrainCircuit,
      biomedico: Microscope,
      infraestructura: Database,
    };
    return iconos[tipo.toLowerCase()] || ClipboardList;
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // ========================================
  // DERIVADOS: FILTROS Y RESÚMENES
  // ========================================

  const tiposDisponibles = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.tipo))),
    [tickets]
  );

  const centrosDisponibles = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.centro?.nombre).filter(Boolean))),
    [tickets]
  );

  const ticketsFiltrados = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);

    let resultado = tickets.filter((ticket) => {
      if (filtroEstado !== "todos" && ticket.estado !== filtroEstado) return false;
      if (filtroPrioridad !== "todas" && ticket.prioridad !== filtroPrioridad) return false;
      if (filtroTipo !== "todos" && ticket.tipo !== filtroTipo) return false;
      if (
        filtroCentro !== "todos" &&
        ticket.centro?.nombre &&
        ticket.centro.nombre !== filtroCentro
      ) {
        return false;
      }

      if (filtroSoloCriticos && !(ticket.prioridad === "critica" || ticket.prioridad === "alta")) {
        return false;
      }

      if (filtroSoloHoy && ticket.fecha_creacion.slice(0, 10) !== hoy) {
        return false;
      }

      if (fechaDesde) {
        const fechaTicket = ticket.fecha_creacion.slice(0, 10);
        if (fechaTicket < fechaDesde) return false;
      }

      if (fechaHasta) {
        const fechaTicket = ticket.fecha_creacion.slice(0, 10);
        if (fechaTicket > fechaHasta) return false;
      }

      if (busqueda.trim().length > 0) {
        const term = busqueda.toLowerCase();
        const texto =
          `${ticket.numero_ticket} ${ticket.titulo} ${
            ticket.descripcion || ""
          } ${ticket.solicitante.nombre_completo} ${
            ticket.centro?.nombre || ""
          } ${ticket.centro?.ciudad || ""}`.toLowerCase();

        if (!texto.includes(term)) return false;
      }

      return true;
    });

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case "reciente":
          return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
        case "antiguo":
          return new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime();
        case "prioridad":
          const prioridadOrden = { critica: 4, alta: 3, media: 2, baja: 1 };
          return prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
        case "estado":
          const estadoOrden = { abierto: 1, en_progreso: 2, resuelto: 3, cancelado: 4 };
          return estadoOrden[a.estado] - estadoOrden[b.estado];
        default:
          return 0;
      }
    });

    return resultado;
  }, [
    tickets,
    filtroEstado,
    filtroPrioridad,
    filtroTipo,
    filtroCentro,
    filtroSoloCriticos,
    filtroSoloHoy,
    fechaDesde,
    fechaHasta,
    busqueda,
    ordenamiento,
  ]);

  const totalPaginas = useMemo(() => {
    return Math.max(1, Math.ceil(ticketsFiltrados.length / tamanoPagina));
  }, [ticketsFiltrados.length, tamanoPagina]);

  const ticketsPaginados = useMemo(() => {
    if (vista === "tablero") return ticketsFiltrados;
    const inicio = (paginaActual - 1) * tamanoPagina;
    const fin = inicio + tamanoPagina;
    return ticketsFiltrados.slice(inicio, fin);
  }, [ticketsFiltrados, paginaActual, tamanoPagina, vista]);

  const resumenTickets = useMemo(() => {
    const base = {
      total: tickets.length,
      filtrados: ticketsFiltrados.length,
      criticos: 0,
      hoy: 0,
      abiertos: 0,
      resueltos: 0,
    };

    const hoyFecha = new Date().toISOString().slice(0, 10);

    for (const t of tickets) {
      if (t.estado === "abierto") base.abiertos++;
      if (t.estado === "resuelto") base.resueltos++;
      if (t.prioridad === "critica" || t.prioridad === "alta") base.criticos++;
      if ((t.fecha_creacion || "").slice(0, 10) === hoyFecha) base.hoy++;
    }

    return base;
  }, [tickets, ticketsFiltrados.length]);

  const columnasKanban: { id: Ticket["estado"]; titulo: string; descripcion: string }[] = [
    { id: "abierto", titulo: "🔴 Abiertos", descripcion: "Tickets sin iniciar" },
    {
      id: "en_progreso",
      titulo: "🔵 En Progreso",
      descripcion: "En desarrollo activo",
    },
    {
      id: "resuelto",
      titulo: "✅ Resueltos",
      descripcion: "Completados exitosamente",
    },
    {
      id: "cancelado",
      titulo: "⚫ Cancelados",
      descripcion: "Cerrados sin resolver",
    },
  ];

  const filtrosActivos = useMemo(() => {
    let count = 0;
    if (filtroEstado !== "todos") count++;
    if (filtroPrioridad !== "todas") count++;
    if (filtroTipo !== "todos") count++;
    if (filtroCentro !== "todos") count++;
    if (filtroSoloCriticos) count++;
    if (filtroSoloHoy) count++;
    if (fechaDesde) count++;
    if (fechaHasta) count++;
    if (busqueda) count++;
    return count;
  }, [filtroEstado, filtroPrioridad, filtroTipo, filtroCentro, filtroSoloCriticos, filtroSoloHoy, fechaDesde, fechaHasta, busqueda]);

  // ========================================
  // RENDER: ESTADOS ESPECIALES
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        {/* Partículas de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${tema.colores.particulas} opacity-20 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className={`w-40 h-40 border-4 border-transparent bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-spin`} style={{
              WebkitMaskImage: 'linear-gradient(transparent 40%, black 60%)',
              maskImage: 'linear-gradient(transparent 40%, black 60%)',
            }}></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse ${tema.colores.glow}`}
            >
              <Search className="w-14 h-14 text-white animate-bounce" />
            </div>
          </div>
          <h2 className={`text-5xl font-black mb-4 ${tema.colores.texto} animate-pulse bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
            Cargando Búsqueda Avanzada
          </h2>
          <p
            className={`text-xl font-bold ${tema.colores.textoSecundario} animate-pulse flex items-center justify-center gap-3`}
          >
            <Sparkles className="w-6 h-6 animate-spin" />
            Preparando filtros inteligentes...
            <Sparkles className="w-6 h-6 animate-spin" />
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
          className={`text-center max-w-md mx-4 p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border ${tema.colores.glow}`}
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
            No tienes permisos para acceder a la búsqueda avanzada de tickets.
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
      className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
    >
      {/* Partículas de fondo animadas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${tema.colores.particulas} opacity-30 animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* SIDEBAR */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* HEADER PREMIUM */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra} ${tema.colores.glow}`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between px-4 lg:px-8 py-4 gap-4">
          {/* Búsqueda principal mejorada */}
          <div className="flex-1 w-full lg:max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-hover:scale-110 transition-transform`}
              />
              <input
                type="text"
                placeholder="🔍 Buscar por número, título, centro, equipo o solicitante..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className={`w-full pl-12 pr-12 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:${tema.colores.glow} transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => {
                    setBusqueda("");
                    setPaginaActual(1);
                  }}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones header */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Selector de temas premium */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 ${tema.colores.glow}`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
              >
                <p className={`text-sm font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                  <Sparkles className="w-4 h-4" />
                  Temas Premium Disponibles
                </p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white ${t.colores.glow}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Alertas con animación */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110`}
              >
                <AlertCircle className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-red-500/50">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} max-h-96 overflow-y-auto custom-scrollbar z-50`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto} flex items-center gap-2`}
                    >
                      <Bell className="w-5 h-5 animate-swing" />
                      Alertas Activas
                    </h3>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {alertas.slice(0, 5).map((alerta, idx) => (
                        <div
                          key={alerta.id_alerta}
                          className={`p-4 ${tema.colores.hover} transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                            !alerta.leida ? `bg-gradient-to-r ${tema.colores.gradiente} bg-opacity-5` : ""
                          }`}
                          style={{
                            animationDelay: `${idx * 50}ms`,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${obtenerColorPrioridad(
                                alerta.prioridad
                              )} shadow-lg`}
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
                                {alerta?.fecha_creacion
                                  ? formatearFecha(alerta.fecha_creacion)
                                  : "Sin fecha"}
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

            {/* Disponibilidad con efectos */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "disponible"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "ocupado"
                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ⏳ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-300 hover:scale-105 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                ✕ Fuera
              </button>
            </div>

            {/* Perfil mejorado */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:scale-105`}
              >
                <div className="text-right hidden lg:block">
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    {usuario.nombre}
                  </p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Técnico
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg ${tema.colores.glow} ring-2 ring-white/20`}
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
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} p-4 z-50`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg ${tema.colores.glow} ring-2 ring-white/20`}
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Ayuda</span>
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

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-4 lg:p-8 relative z-10`}
      >
        {/* Hero Section Premium */}
        <div className="mb-6 lg:mb-8">
          <div className={`rounded-3xl p-6 lg:p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden`}>
            {/* Efectos de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl animate-pulse`}></div>
              <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${tema.colores.gradiente} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 lg:w-20 h-16 lg:h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl ${tema.colores.glow} animate-float`}>
                    <Search className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-3xl lg:text-5xl font-black ${tema.colores.texto} flex items-center gap-3 mb-2`}>
                      {obtenerSaludo()}, {usuario.nombre}
                      <span className="animate-wave inline-block text-2xl lg:text-4xl">🔎</span>
                    </h1>
                    <p className={`text-base lg:text-xl font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Sparkles className="w-4 lg:w-5 h-4 lg:h-5 animate-spin" />
                      Búsqueda Avanzada de Tickets Premium
                      <Sparkles className="w-4 lg:w-5 h-4 lg:h-5 animate-spin" />
                    </p>
                  </div>
                </div>
                
                <div className={`flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}>
                  <div className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm">
                    <MapPin className="w-3 lg:w-4 h-3 lg:h-4" />
                    {usuario?.tecnico?.centro?.nombre ?? "Centro no definido"}
                  </div>
                  <div className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm">
                    <Building2 className="w-3 lg:w-4 h-3 lg:h-4" />
                    {usuario?.tecnico?.area_tecnica ?? "Área técnica no definida"}
                  </div>
                  <div className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm">
                    <Clock className="w-3 lg:w-4 h-3 lg:h-4" />
                    {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <button
                  onClick={() => cargarDatosTickets()}
                  className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 ${tema.colores.secundario} rounded-xl font-bold text-xs lg:text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105 shadow-lg`}
                >
                  <RefreshCw className={`w-4 lg:w-5 h-4 lg:h-5 ${loadingData ? "animate-spin" : ""}`} />
                  Actualizar
                </button>
                
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 backdrop-blur-sm">
                  <button
                    onClick={() => setVista("lista")}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-bold text-xs lg:text-sm transition-all duration-300 ${
                      vista === "lista"
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`
                        : `${tema.colores.texto} hover:bg-white/10`
                    }`}
                  >
                    <List className="w-3 lg:w-4 h-3 lg:h-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                  <button
                    onClick={() => setVista("tablero")}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-bold text-xs lg:text-sm transition-all duration-300 ${
                      vista === "tablero"
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`
                        : `${tema.colores.texto} hover:bg-white/10`
                    }`}
                  >
                    <Grid2X2 className="w-3 lg:w-4 h-3 lg:h-4" />
                    <span className="hidden sm:inline">Tablero</span>
                  </button>
                  <button
                    onClick={() => setVista("compacta")}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-bold text-xs lg:text-sm transition-all duration-300 ${
                      vista === "compacta"
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`
                        : `${tema.colores.texto} hover:bg-white/10`
                    }`}
                  >
                    <Layers className="w-3 lg:w-4 h-3 lg:h-4" />
                    <span className="hidden sm:inline">Compacta</span>
                  </button>
                </div>

                <button
                  onClick={() => setModalNuevoAbierto(true)}
                  className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-xs lg:text-sm transition-all duration-300 hover:scale-105 shadow-2xl ${tema.colores.glow}`}
                >
                  <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
                  <span className="hidden sm:inline">Nuevo Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard de Estadísticas Premium */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <ResumenCardPremium
            tema={tema}
            icono={ClipboardList}
            titulo="Total Tickets"
            valor={resumenTickets.total}
            chip="Sistema completo"
            color="from-indigo-500 via-purple-500 to-pink-500"
            tendencia="+12%"
            tendenciaPositiva={true}
          />
          <ResumenCardPremium
            tema={tema}
            icono={Search}
            titulo="Filtrados"
            valor={resumenTickets.filtrados}
            chip="Resultados actuales"
            color="from-cyan-500 via-blue-500 to-indigo-500"
            tendencia="+8%"
            tendenciaPositiva={true}
          />
          <ResumenCardPremium
            tema={tema}
            icono={Flame}
            titulo="Críticos"
            valor={resumenTickets.criticos}
            chip="Alta prioridad"
            color="from-orange-500 via-red-500 to-rose-500"
            tendencia="-3%"
            tendenciaPositiva={true}
          />
          <ResumenCardPremium
            tema={tema}
            icono={CalendarClock}
            titulo="Hoy"
            valor={resumenTickets.hoy}
            chip="Últimas 24h"
            color="from-emerald-500 via-teal-500 to-green-500"
            tendencia="+20%"
            tendenciaPositiva={true}
          />
          <ResumenCardPremium
            tema={tema}
            icono={CheckCircle2}
            titulo="Resueltos"
            valor={resumenTickets.resueltos}
            chip="Completados"
            color="from-violet-500 via-purple-500 to-fuchsia-500"
            tendencia="+15%"
            tendenciaPositiva={true}
          />
        </div>

        {/* Panel de Filtros Avanzados Premium */}
        <div className={`rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden`}>
          {/* Fondo decorativo */}
          <div className="absolute inset-0 opacity-5">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg ${tema.colores.glow}`}>
                  <SlidersHorizontal className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg lg:text-2xl font-black ${tema.colores.texto} flex items-center gap-2`}>
                    Filtros Avanzados
                    {filtrosActivos > 0 && (
                      <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`}>
                        {filtrosActivos} activos
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Personaliza tu búsqueda con múltiples criterios
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFiltrosAvanzadosAbiertos(!filtrosAvanzadosAbiertos)}
                  className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                >
                  {filtrosAvanzadosAbiertos ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {filtrosAvanzadosAbiertos ? "Ocultar" : "Mostrar"}
                </button>
                {filtrosActivos > 0 && (
                  <button
                    onClick={limpiarFiltros}
                    className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/50 flex items-center gap-2`}
                  >
                    <FilterX className="w-4 h-4" />
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {filtrosAvanzadosAbiertos && (
              <div className="space-y-4 animate-fadeIn">
                {/* Primera fila de filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Activity className="w-3 h-3" />
                      Estado
                    </label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => {
                        setFiltroEstado(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    >
                      <option value="todos">📋 Todos los estados</option>
                      <option value="abierto">🔴 Abiertos</option>
                      <option value="en_progreso">🔵 En progreso</option>
                      <option value="resuelto">✅ Resueltos</option>
                      <option value="cancelado">⚫ Cancelados</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Flame className="w-3 h-3" />
                      Prioridad
                    </label>
                    <select
                      value={filtroPrioridad}
                      onChange={(e) => {
                        setFiltroPrioridad(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    >
                      <option value="todas">⚡ Todas las prioridades</option>
                      <option value="critica">🔥 Crítica</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="media">🟡 Media</option>
                      <option value="baja">🟢 Baja</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Layers className="w-3 h-3" />
                      Tipo
                    </label>
                    <select
                      value={filtroTipo}
                      onChange={(e) => {
                        setFiltroTipo(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    >
                      <option value="todos">🎯 Todos los tipos</option>
                      {tiposDisponibles.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo === 'soporte' && '🎧'} 
                          {tipo === 'mantenimiento' && '🔧'} 
                          {tipo === 'ingenieria' && '⚙️'} 
                          {tipo === 'biomedico' && '🔬'} 
                          {tipo === 'infraestructura' && '🏗️'} 
                          {tipo.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Building2 className="w-3 h-3" />
                      Centro
                    </label>
                    <select
                      value={filtroCentro}
                      onChange={(e) => {
                        setFiltroCentro(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    >
                      <option value="todos">🏢 Todos los centros</option>
                      {centrosDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Segunda fila: Fechas y ordenamiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Calendar className="w-3 h-3" />
                      Fecha Desde
                    </label>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => {
                        setFechaDesde(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <Calendar className="w-3 h-3" />
                      Fecha Hasta
                    </label>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => {
                        setFechaHasta(e.target.value);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario} flex items-center gap-2`}>
                      <ArrowUpDown className="w-3 h-3" />
                      Ordenar Por
                    </label>
                    <select
                      value={ordenamiento}
                      onChange={(e) => {
                        setOrdenamiento(e.target.value as OrdenTickets);
                        setPaginaActual(1);
                      }}
                      className={`w-full px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                    >
                      <option value="reciente">🕐 Más recientes</option>
                      <option value="antiguo">🕑 Más antiguos</option>
                      <option value="prioridad">🔥 Por prioridad</option>
                      <option value="estado">📊 Por estado</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                      Filtros Rápidos
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFiltroSoloCriticos((prev) => !prev);
                          setPaginaActual(1);
                        }}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-300 hover:scale-105 ${
                          filtroSoloCriticos
                            ? `bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-lg shadow-red-500/50`
                            : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        Solo Críticos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFiltroSoloHoy((prev) => !prev);
                          setPaginaActual(1);
                        }}
                        className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-300 hover:scale-105 ${
                          filtroSoloHoy
                            ? `bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/50`
                            : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                        }`}
                      >
                        <CalendarClock className="w-3 h-3" />
                        Solo Hoy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resumen de filtros activos */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-700/30">
                  <div className={`flex items-center gap-2 text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
                    <Target className="w-4 h-4" />
                    <span>
                      Mostrando <span className={tema.colores.acento}>{ticketsFiltrados.length}</span> de <span className={tema.colores.acento}>{tickets.length}</span> tickets
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {/* Exportar lógica */}}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button 
                      onClick={() => {/* Imprimir lógica */}}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      <Printer className="w-3 h-3" />
                      <span className="hidden sm:inline">Imprimir</span>
                    </button>
                    <button 
                      onClick={() => {/* Compartir lógica */}}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido según vista seleccionada */}
        {loadingData ? (
          <div className={`rounded-3xl p-12 lg:p-16 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow}`}>
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-8">
                <div className={`w-24 lg:w-32 h-24 lg:h-32 border-4 border-transparent bg-gradient-to-r ${tema.colores.gradiente} rounded-full animate-spin`} style={{
                  WebkitMaskImage: 'linear-gradient(transparent 40%, black 60%)',
                  maskImage: 'linear-gradient(transparent 40%, black 60%)',
                }}></div>
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse ${tema.colores.glow}`}>
                  <Loader2 className="w-8 lg:w-10 h-8 lg:h-10 text-white animate-spin" />
                </div>
              </div>
              <h3 className={`text-xl lg:text-2xl font-black mb-2 ${tema.colores.texto}`}>
                Cargando Resultados
              </h3>
              <p className={`text-base lg:text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}>
                Aplicando filtros y preparando tu vista...
              </p>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className={`rounded-3xl p-12 lg:p-16 text-center ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-5">
              <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl animate-pulse`}></div>
              <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${tema.colores.gradiente} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10">
              <div className={`w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl ${tema.colores.glow}`}>
                <Search className="w-12 lg:w-16 h-12 lg:h-16 text-white" />
              </div>
              <h3 className={`text-2xl lg:text-4xl font-black mb-4 ${tema.colores.texto}`}>
                Sin Tickets Disponibles
              </h3>
              <p className={`text-base lg:text-xl font-semibold mb-8 ${tema.colores.textoSecundario}`}>
                Cuando se te asignen tickets, podrás buscarlos y filtrarlos aquí
              </p>
              <button
                onClick={() => setModalNuevoAbierto(true)}
                className={`inline-flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-base lg:text-lg transition-all duration-300 hover:scale-105 shadow-2xl ${tema.colores.glow}`}
              >
                <Plus className="w-5 lg:w-6 h-5 lg:h-6" />
                Crear Primer Ticket
              </button>
            </div>
          </div>
        ) : vista === "lista" ? (
          <VistaListaPremium
            tema={tema}
            tickets={ticketsPaginados}
            obtenerIconoTipo={obtenerIconoTipo}
            obtenerColorEstado={obtenerColorEstado}
            obtenerColorPrioridad={obtenerColorPrioridad}
            formatearFecha={formatearFecha}
            actualizarEstadoTicket={actualizarEstadoTicket}
            setTicketSeleccionado={setTicketSeleccionado}
            paginaActual={paginaActual}
            setPaginaActual={setPaginaActual}
            totalPaginas={totalPaginas}
            ticketsFiltrados={ticketsFiltrados}
          />
        ) : vista === "tablero" ? (
          <VistaTableroPremium
            tema={tema}
            tickets={ticketsFiltrados}
            columnasKanban={columnasKanban}
            obtenerIconoTipo={obtenerIconoTipo}
            obtenerColorPrioridad={obtenerColorPrioridad}
            formatearFechaSoloDia={formatearFechaSoloDia}
            actualizarEstadoTicket={actualizarEstadoTicket}
            setTicketSeleccionado={setTicketSeleccionado}
          />
        ) : (
          <VistaCompactaPremium
            tema={tema}
            tickets={ticketsPaginados}
            obtenerIconoTipo={obtenerIconoTipo}
            obtenerColorEstado={obtenerColorEstado}
            obtenerColorPrioridad={obtenerColorPrioridad}
            formatearFecha={formatearFecha}
            setTicketSeleccionado={setTicketSeleccionado}
            paginaActual={paginaActual}
            setPaginaActual={setPaginaActual}
            totalPaginas={totalPaginas}
            ticketsFiltrados={ticketsFiltrados}
          />
        )}

        {/* Footer Premium */}
        <footer className={`mt-8 lg:mt-12 rounded-3xl px-6 lg:px-8 py-4 lg:py-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-5">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg ${tema.colores.glow}`}>
                <Sparkles className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </div>
              <div>
                <p className={`text-xs lg:text-sm font-bold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Búsqueda Avanzada Premium
                </p>
                <p className={`text-[10px] lg:text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Desarrollado con tecnología de vanguardia
                </p>
              </div>
              <span className={`px-3 lg:px-4 py-1 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`}>
                v5.0.0 PREMIUM
              </span>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm">
              <Link
                href="/ayuda"
                className={`font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:${tema.colores.acento} hover:scale-110`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:${tema.colores.acento} hover:scale-110`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:${tema.colores.acento} hover:scale-110`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:text-red-400 hover:scale-110 flex items-center gap-2`}
              >
                <LogOut className="w-3 lg:w-4 h-3 lg:h-4" />
                Cerrar
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* MODAL: NUEVO TICKET PREMIUM */}
      {modalNuevoAbierto && (
        <ModalNuevoTicketPremium
          tema={tema}
          nuevoTicketData={nuevoTicketData}
          manejarNuevoTicketChange={manejarNuevoTicketChange}
          crearNuevoTicket={crearNuevoTicket}
          setModalNuevoAbierto={setModalNuevoAbierto}
        />
      )}

      {/* PANEL DETALLE TICKET PREMIUM */}
      {ticketSeleccionado && (
        <PanelDetalleTicketPremium
          tema={tema}
          ticket={ticketSeleccionado}
          setTicketSeleccionado={setTicketSeleccionado}
          obtenerIconoTipo={obtenerIconoTipo}
          obtenerColorEstado={obtenerColorEstado}
          obtenerColorPrioridad={obtenerColorPrioridad}
          formatearFecha={formatearFecha}
          actualizarEstadoTicket={actualizarEstadoTicket}
        />
      )}

      {/* ESTILOS GLOBALES PREMIUM */}
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
          font-family: "Inter", "Segoe UI", "Roboto", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #8b5cf6, #d946ef);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #7c3aed, #c026d3);
        }
        .custom-scrollbar {
          scrollbar-color: #6366f1 rgba(0, 0, 0, 0.1);
          scrollbar-width: thin;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10%, 20% { transform: rotate(14deg); }
          30%, 60%, 90% { transform: rotate(-8deg); }
          40%, 80% { transform: rotate(14deg); }
          50% { transform: rotate(10deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-swing {
          animation: swing 1s ease-in-out infinite;
          transform-origin: top center;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .hidden\\.sm\\:inline {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .hidden\\.md\\:block {
            display: none;
          }
        }

        @media (max-width: 1024px) {
          .hidden\\.lg\\:flex {
            display: none;
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
          input, select, textarea {
            color-scheme: dark;
          }
        }
      `}</style>
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES PREMIUM
// ========================================

function ResumenCardPremium({
  tema,
  icono: Icono,
  titulo,
  valor,
  chip,
  color,
  tendencia,
  tendenciaPositiva,
}: {
  tema: ConfiguracionTema;
  icono: any;
  titulo: string;
  valor: number;
  chip: string;
  color: string;
  tendencia: string;
  tendenciaPositiva: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 lg:p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer group relative overflow-hidden`}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-full blur-2xl`}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <div
            className={`w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${tema.colores.glow}`}
          >
            <Icono className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
          </div>
          <div className={`flex items-center gap-1 text-[10px] lg:text-xs font-bold ${tendenciaPositiva ? 'text-green-500' : 'text-red-500'}`}>
            {tendenciaPositiva ? <TrendingUp className="w-3 lg:w-4 h-3 lg:h-4" /> : <TrendingDown className="w-3 lg:w-4 h-3 lg:h-4" />}
            {tendencia}
          </div>
        </div>

        <div className={`text-3xl lg:text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-110 transition-transform duration-300`}>
          {valor.toLocaleString()}
        </div>

        <div className={`text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}>
          {titulo}
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold bg-white/5 backdrop-blur-sm ${tema.colores.texto}`}>
            <Sparkles className="w-2 lg:w-3 h-2 lg:h-3" />
            {chip}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componentes de vistas 
// ========================================
// VISTA LISTA PREMIUM
// ========================================

function VistaListaPremium({
  tema,
  tickets,
  obtenerIconoTipo,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
  actualizarEstadoTicket,
  setTicketSeleccionado,
  paginaActual,
  setPaginaActual,
  totalPaginas,
  ticketsFiltrados,
}: any) {
  return (
    <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} overflow-hidden animate-fadeIn`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-700/40 bg-gradient-to-r from-transparent via-white/5 to-transparent gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className={`w-12 lg:w-14 h-12 lg:h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-xl ${tema.colores.glow} animate-float`}>
            <List className="w-6 lg:w-7 h-6 lg:h-7" />
          </div>
          <div>
            <h3 className={`text-xl lg:text-2xl font-black ${tema.colores.texto}`}>
              Vista de Lista Premium
            </h3>
            <p className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}>
              Gestión detallada con acciones rápidas
            </p>
          </div>
        </div>
        <div className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white font-bold text-sm lg:text-base shadow-lg ${tema.colores.glow}`}>
          {tickets.length} tickets
        </div>
      </div>

      {/* Tabla Responsive */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full">
          <thead>
            <tr className={`border-b ${tema.colores.borde} bg-white/5 backdrop-blur-sm`}>
              <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Ticket
              </th>
              <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Estado
              </th>
              <th className={`px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Prioridad
              </th>
              <th className={`hidden md:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Tipo
              </th>
              <th className={`hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Centro
              </th>
              <th className={`hidden xl:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Solicitante
              </th>
              <th className={`hidden sm:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Creado
              </th>
              <th className={`px-3 lg:px-6 py-3 lg:py-4 text-right text-[10px] lg:text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tema.colores.borde}`}>
            {tickets.map((ticket: any, index: number) => (
              <tr
                key={ticket.id_ticket}
                className={`${tema.colores.hover} transition-all duration-300 hover:scale-[1.01] cursor-pointer group animate-fadeIn`}
                onClick={() => setTicketSeleccionado(ticket)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-3 lg:px-6 py-3 lg:py-4">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className={`w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${tema.colores.glow}`}>
                      {(() => {
                        const Icono = obtenerIconoTipo(ticket.tipo);
                        return <Icono className="w-5 lg:w-6 h-5 lg:h-6" />;
                      })()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs lg:text-sm font-black ${tema.colores.texto} truncate`}>
                        {ticket.numero_ticket}
                      </p>
                      <p className={`text-[10px] lg:text-xs font-semibold ${tema.colores.textoSecundario} line-clamp-1`}>
                        {ticket.titulo}
                      </p>
                      {ticket.equipo_afectado && (
                        <p className={`text-[10px] lg:text-xs font-semibold ${tema.colores.textoSecundario} flex items-center gap-1 mt-1`}>
                          <Cpu className="w-3 h-3" />
                          {ticket.equipo_afectado.nombre}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-4">
                  <span className={`inline-flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1 lg:py-2 rounded-xl text-[10px] lg:text-xs font-bold border shadow-lg ${obtenerColorEstado(ticket.estado)}`}>
                    <Activity className="w-3 h-3" />
                    <span className="hidden sm:inline">{ticket.estado}</span>
                  </span>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-4">
                  <span className={`inline-flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1 lg:py-2 rounded-xl text-[10px] lg:text-xs font-bold border shadow-lg ${obtenerColorPrioridad(ticket.prioridad)}`}>
                    {ticket.prioridad === "critica" && <Flame className="w-3 h-3 animate-pulse" />}
                    {ticket.prioridad !== "critica" && <Zap className="w-3 h-3" />}
                    <span className="hidden sm:inline">{ticket.prioridad}</span>
                  </span>
                </td>
                <td className="hidden md:table-cell px-3 lg:px-6 py-3 lg:py-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${tema.colores.hover} bg-white/5`}>
                    {(() => {
                      const Icono = obtenerIconoTipo(ticket.tipo);
                      return <Icono className="w-4 h-4" />;
                    })()}
                    {ticket.tipo.toUpperCase()}
                  </span>
                </td>
                <td className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4">
                  <div className="text-xs">
                    <p className={`font-bold ${tema.colores.texto} mb-1`}>
                      {ticket.centro?.nombre}
                    </p>
                    <p className={`font-semibold ${tema.colores.textoSecundario} flex items-center gap-1`}>
                      <MapPin className="w-3 h-3" />
                      {ticket.centro?.ciudad}
                    </p>
                  </div>
                </td>
                <td className="hidden xl:table-cell px-3 lg:px-6 py-3 lg:py-4">
                  <div className="text-xs">
                    <p className={`font-bold ${tema.colores.texto} mb-1`}>
                      {ticket.solicitante.nombre_completo}
                    </p>
                    <p className={`font-semibold ${tema.colores.textoSecundario}`}>
                      {ticket.solicitante.email}
                    </p>
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 lg:px-6 py-3 lg:py-4">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3 lg:w-4 h-3 lg:h-4 ${tema.colores.textoSecundario}`} />
                    <span className={`text-[10px] lg:text-xs font-bold ${tema.colores.texto}`}>
                      {formatearFecha(ticket.fecha_creacion)}
                    </span>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-1 lg:gap-2">
                    {ticket.estado === "abierto" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          actualizarEstadoTicket(ticket.id_ticket, "en_progreso");
                        }}
                        className="px-2 lg:px-4 py-1 lg:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-[10px] lg:text-xs font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                      >
                        <span className="hidden sm:inline">Iniciar</span>
                        <span className="sm:hidden">▶</span>
                      </button>
                    )}
                    {ticket.estado === "en_progreso" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          actualizarEstadoTicket(ticket.id_ticket, "resuelto");
                        }}
                        className="px-2 lg:px-4 py-1 lg:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[10px] lg:text-xs font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
                      >
                        <span className="hidden sm:inline">Resolver</span>
                        <span className="sm:hidden">✓</span>
                      </button>
                    )}
                    <Link
                      href={`/tecnico/tickets/${ticket.id_ticket}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 lg:px-4 py-1 lg:py-2 ${tema.colores.primario} text-white rounded-xl text-[10px] lg:text-xs font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-1`}
                    >
                      <Eye className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span className="hidden lg:inline">Ver</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación Premium */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-t border-gray-700/40 bg-gradient-to-r from-transparent via-white/5 to-transparent gap-4">
        <div className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
          Mostrando <span className={tema.colores.acento}>{tickets.length}</span> de{" "}
          <span className={tema.colores.acento}>{ticketsFiltrados.length}</span> tickets
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p: number) => Math.max(1, p - 1))}
            className={`px-3 lg:px-5 py-2 rounded-xl border font-bold text-xs lg:text-sm transition-all duration-300 flex items-center gap-2 ${
              paginaActual === 1
                ? "opacity-50 cursor-not-allowed"
                : `${tema.colores.hover} hover:scale-105 shadow-lg`
            }`}
          >
            <ChevronLeft className="w-3 lg:w-4 h-3 lg:h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <div className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
            <span className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
              Página
            </span>
            <span className={`text-base lg:text-lg font-black ${tema.colores.texto}`}>
              {paginaActual}
            </span>
            <span className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
              de {totalPaginas}
            </span>
          </div>
          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual((p: number) => Math.min(totalPaginas, p + 1))}
            className={`px-3 lg:px-5 py-2 rounded-xl border font-bold text-xs lg:text-sm transition-all duration-300 flex items-center gap-2 ${
              paginaActual === totalPaginas
                ? "opacity-50 cursor-not-allowed"
                : `${tema.colores.hover} hover:scale-105 shadow-lg`
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// VISTA TABLERO KANBAN PREMIUM
// ========================================

function VistaTableroPremium({
  tema,
  tickets,
  columnasKanban,
  obtenerIconoTipo,
  obtenerColorPrioridad,
  formatearFechaSoloDia,
  actualizarEstadoTicket,
  setTicketSeleccionado,
}: any) {
  return (
    <div className={`rounded-3xl p-4 lg:p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn`}>
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${tema.colores.gradiente} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className={`w-12 lg:w-16 h-12 lg:h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-2xl ${tema.colores.glow} animate-float`}>
              <Grid2X2 className="w-6 lg:w-8 h-6 lg:h-8" />
            </div>
            <div>
              <h3 className={`text-xl lg:text-3xl font-black ${tema.colores.texto}`}>
                Tablero Kanban Premium
              </h3>
              <p className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
                Visualización de flujo en tiempo real
              </p>
            </div>
          </div>
          <div className={`px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-gradient-to-r ${tema.colores.gradiente} text-white font-black text-base lg:text-lg shadow-2xl ${tema.colores.glow}`}>
            {tickets.length} Tickets
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {columnasKanban.map((col: any, colIndex: number) => {
            const items = tickets.filter((t: any) => t.estado === col.id);

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-2xl p-4 lg:p-5 ${tema.colores.card} ${tema.colores.borde} border bg-opacity-60 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 ${tema.colores.sombra} animate-fadeIn`}
                style={{ animationDelay: `${colIndex * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/30">
                  <div>
                    <h4 className={`text-base lg:text-lg font-black ${tema.colores.texto} mb-1`}>
                      {col.titulo}
                    </h4>
                    <p className={`text-[10px] lg:text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      {col.descripcion}
                    </p>
                  </div>
                  <div className={`w-8 lg:w-10 h-8 lg:h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-sm lg:text-base shadow-lg ${tema.colores.glow}`}>
                    {items.length}
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4 max-h-[500px] lg:max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {items.length === 0 ? (
                    <div className={`border-2 border-dashed ${tema.colores.borde} rounded-2xl p-6 lg:p-8 text-center`}>
                      <div className={`w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center`}>
                        <ClipboardList className={`w-6 lg:w-8 h-6 lg:h-8 ${tema.colores.textoSecundario} opacity-50`} />
                      </div>
                      <p className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                        Sin tickets
                      </p>
                    </div>
                  ) : (
                    items.map((ticket: any, ticketIndex: number) => (
                      <div
                        key={ticket.id_ticket}
                        className={`rounded-2xl p-4 lg:p-5 ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group ${tema.colores.sombra} relative overflow-hidden animate-fadeIn`}
                        onClick={() => setTicketSeleccionado(ticket)}
                        style={{ animationDelay: `${ticketIndex * 50}ms` }}
                      >
                        {/* Efecto de brillo en hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-2xl`}></div>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300 ${tema.colores.glow}`}>
                              {(() => {
                                const Icono = obtenerIconoTipo(ticket.tipo);
                                return <Icono className="w-5 lg:w-6 h-5 lg:h-6" />;
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-black ${tema.colores.texto} mb-1`}>
                                {ticket.numero_ticket}
                              </p>
                              <p className={`text-sm font-bold ${tema.colores.texto} line-clamp-2 mb-2`}>
                                {ticket.titulo}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-md ${obtenerColorPrioridad(ticket.prioridad)}`}>
                              {ticket.prioridad === "critica" && "🔥"}
                              {ticket.prioridad === "alta" && "🟠"}
                              {ticket.prioridad === "media" && "🟡"}
                              {ticket.prioridad === "baja" && "🟢"}
                              {" "}{ticket.prioridad}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/5 backdrop-blur-sm ${tema.colores.texto}`}>
                              {ticket.centro?.nombre}
                            </span>
                          </div>

                          <div className={`flex items-center gap-2 text-xs font-semibold ${tema.colores.textoSecundario} mb-3 pb-3 border-b border-gray-700/30`}>
                            <Calendar className="w-3 h-3" />
                            {formatearFechaSoloDia(ticket.fecha_creacion)}
                          </div>

                          <div className="flex items-center gap-2 text-xs mb-3">
                            <User className={`w-3 h-3 ${tema.colores.textoSecundario}`} />
                            <span className={`font-semibold ${tema.colores.texto} truncate`}>
                              {ticket.solicitante.nombre_completo}
                            </span>
                          </div>

                          {ticket.equipo_afectado && (
                            <div className={`flex items-center gap-2 text-xs mb-3 p-2 rounded-lg bg-white/5`}>
                              <Cpu className={`w-3 h-3 ${tema.colores.textoSecundario}`} />
                              <span className={`font-semibold ${tema.colores.texto} truncate`}>
                                {ticket.equipo_afectado.nombre}
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {col.id !== "en_progreso" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  actualizarEstadoTicket(ticket.id_ticket, "en_progreso");
                                }}
                                className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                              >
                                ▶ Progreso
                              </button>
                            )}
                            {col.id !== "resuelto" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  actualizarEstadoTicket(ticket.id_ticket, "resuelto");
                                }}
                                className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
                              >
                                ✓ Resolver
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========================================
// VISTA COMPACTA PREMIUM
// ========================================

function VistaCompactaPremium({
  tema,
  tickets,
  obtenerIconoTipo,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
  setTicketSeleccionado,
  paginaActual,
  setPaginaActual,
  totalPaginas,
  ticketsFiltrados,
}: any) {
  return (
    <div className={`rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} overflow-hidden animate-fadeIn`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-b border-gray-700/40 bg-gradient-to-r from-transparent via-white/5 to-transparent gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className={`w-12 lg:w-14 h-12 lg:h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-xl ${tema.colores.glow} animate-float`}>
            <Layers className="w-6 lg:w-7 h-6 lg:h-7" />
          </div>
          <div>
            <h3 className={`text-xl lg:text-2xl font-black ${tema.colores.texto}`}>
              Vista Compacta Premium
            </h3>
            <p className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}>
              Máxima densidad de información
            </p>
          </div>
        </div>
        <div className={`px-4 lg:px-6 py-2 lg:py-3 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white font-bold text-sm lg:text-base shadow-lg ${tema.colores.glow}`}>
          {tickets.length} tickets
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
        {tickets.map((ticket: any, index: number) => (
          <div
            key={ticket.id_ticket}
            className={`rounded-2xl p-4 lg:p-5 ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group ${tema.colores.sombra} relative overflow-hidden animate-fadeIn`}
            onClick={() => setTicketSeleccionado(ticket)}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`w-12 lg:w-14 h-12 lg:h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300 ${tema.colores.glow} flex-shrink-0`}>
                  {(() => {
                    const Icono = obtenerIconoTipo(ticket.tipo);
                    return <Icono className="w-6 lg:w-7 h-6 lg:h-7" />;
                  })()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black uppercase tracking-wider ${tema.colores.textoSecundario} mb-1`}>
                        {ticket.numero_ticket}
                      </p>
                      <h4 className={`text-base lg:text-xl font-black ${tema.colores.texto} mb-2 line-clamp-2`}>
                        {ticket.titulo}
                      </h4>
                      <p className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario} line-clamp-2 mb-3`}>
                        {ticket.descripcion}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-start gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border shadow-lg ${obtenerColorEstado(ticket.estado)}`}>
                        <Activity className="w-3 h-3" />
                        {ticket.estado}
                      </span>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border shadow-lg ${obtenerColorPrioridad(ticket.prioridad)}`}>
                        {ticket.prioridad === "critica" && <Flame className="w-3 h-3 animate-pulse" />}
                        {ticket.prioridad !== "critica" && <Zap className="w-3 h-3" />}
                        {ticket.prioridad}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div className={`flex items-center gap-2 text-xs p-3 rounded-lg bg-white/5`}>
                      <Building2 className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                      <div className="min-w-0">
                        <p className={`font-bold ${tema.colores.texto} truncate`}>
                          {ticket.centro?.nombre}
                        </p>
                        <p className={`font-semibold ${tema.colores.textoSecundario} truncate`}>
                          {ticket.centro?.ciudad}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 text-xs p-3 rounded-lg bg-white/5`}>
                      <User className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                      <div className="min-w-0">
                        <p className={`font-bold ${tema.colores.texto} truncate`}>
                          {ticket.solicitante.nombre_completo}
                        </p>
                        <p className={`font-semibold ${tema.colores.textoSecundario} truncate`}>
                          {ticket.solicitante.email}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 text-xs p-3 rounded-lg bg-white/5`}>
                      <Clock className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          {formatearFecha(ticket.fecha_creacion)}
                        </p>
                        <p className={`font-semibold ${tema.colores.textoSecundario}`}>
                          {ticket.tiempo_estimado_minutos} min estimado
                        </p>
                      </div>
                    </div>

                    {ticket.equipo_afectado && (
                      <div className={`flex items-center gap-2 text-xs p-3 rounded-lg bg-white/5`}>
                        <Cpu className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                        <div className="min-w-0">
                          <p className={`font-bold ${tema.colores.texto} truncate`}>
                            {ticket.equipo_afectado.nombre}
                          </p>
                          <p className={`font-semibold ${tema.colores.textoSecundario} truncate`}>
                            {ticket.equipo_afectado.tipo}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-700/30">
                    <Link
                      href={`/tecnico/tickets/${ticket.id_ticket}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`flex-1 px-4 py-2 ${tema.colores.primario} text-white rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2`}
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles Completos
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketSeleccionado(ticket);
                      }}
                      className={`px-4 py-2 ${tema.colores.secundario} rounded-xl font-bold text-xs transition-all duration-300 hover:scale-105`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 lg:px-8 py-4 lg:py-6 border-t border-gray-700/40 bg-gradient-to-r from-transparent via-white/5 to-transparent gap-4">
        <div className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
          Mostrando <span className={tema.colores.acento}>{tickets.length}</span> de{" "}
          <span className={tema.colores.acento}>{ticketsFiltrados.length}</span> tickets
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p: number) => Math.max(1, p - 1))}
            className={`px-3 lg:px-5 py-2 rounded-xl border font-bold text-xs lg:text-sm transition-all duration-300 flex items-center gap-2 ${
              paginaActual === 1
                ? "opacity-50 cursor-not-allowed"
                : `${tema.colores.hover} hover:scale-105 shadow-lg`
            }`}
          >
            <ChevronLeft className="w-3 lg:w-4 h-3 lg:h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <div className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
            <span className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
              Página
            </span>
            <span className={`text-base lg:text-lg font-black ${tema.colores.texto}`}>
              {paginaActual}
            </span>
            <span className={`text-xs lg:text-sm font-bold ${tema.colores.textoSecundario}`}>
              de {totalPaginas}
            </span>
          </div>
          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual((p: number) => Math.min(totalPaginas, p + 1))}
            className={`px-3 lg:px-5 py-2 rounded-xl border font-bold text-xs lg:text-sm transition-all duration-300 flex items-center gap-2 ${
              paginaActual === totalPaginas
                ? "opacity-50 cursor-not-allowed"
                : `${tema.colores.hover} hover:scale-105 shadow-lg`
            }`}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MODAL NUEVO TICKET PREMIUM
// ========================================

function ModalNuevoTicketPremium({
  tema,
  nuevoTicketData,
  manejarNuevoTicketChange,
  crearNuevoTicket,
  setModalNuevoAbierto,
}: any) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn p-4">
      <div className={`w-full max-w-2xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} p-6 lg:p-8 relative animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar`}>
        <button
          onClick={() => setModalNuevoAbierto(false)}
          className={`absolute right-4 lg:right-6 top-4 lg:top-6 p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 hover:rotate-90`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 lg:w-16 h-14 lg:h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-2xl ${tema.colores.glow} animate-float`}>
            <Plus className="w-7 lg:w-8 h-7 lg:h-8" />
          </div>
          <div>
            <h3 className={`text-2xl lg:text-3xl font-black ${tema.colores.texto}`}>
              Crear Nuevo Ticket
            </h3>
            <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
              Registra un nuevo incidente o requerimiento técnico
            </p>
          </div>
        </div>

        <form className="space-y-6 mt-6" onSubmit={crearNuevoTicket}>
          <div className="space-y-2">
            <label className={`text-sm font-bold uppercase tracking-wider ${tema.colores.texto} flex items-center gap-2`}>
              <FileText className="w-4 h-4" />
              Título del Ticket
            </label>
            <input
              type="text"
              required
              value={nuevoTicketData.titulo}
              onChange={(e) => manejarNuevoTicketChange("titulo", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
              placeholder="Ej: Problema con servidor de fichas clínicas"
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-bold uppercase tracking-wider ${tema.colores.texto} flex items-center gap-2`}>
              <MessageSquare className="w-4 h-4" />
              Descripción Detallada
            </label>
            <textarea
              required
              rows={5}
              value={nuevoTicketData.descripcion}
              onChange={(e) => manejarNuevoTicketChange("descripcion", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300 resize-none`}
              placeholder="Describe el problema, impacto y contexto detalladamente..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-bold uppercase tracking-wider ${tema.colores.texto} flex items-center gap-2`}>
                <Layers className="w-4 h-4" />
                Tipo de Ticket
              </label>
              <select
                value={nuevoTicketData.tipo}
                onChange={(e) => manejarNuevoTicketChange("tipo", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
              >
                <option value="soporte">🎧 Soporte Técnico</option>
                <option value="mantenimiento">🔧 Mantenimiento</option>
                <option value="ingenieria">⚙️ Ingeniería</option>
                <option value="biomedico">🔬 Biomédico</option>
                <option value="infraestructura">🏗️ Infraestructura</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-bold uppercase tracking-wider ${tema.colores.texto} flex items-center gap-2`}>
                <Flame className="w-4 h-4" />
                Nivel de Prioridad
              </label>
              <select
                value={nuevoTicketData.prioridad}
                onChange={(e) => manejarNuevoTicketChange("prioridad", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🟠 Alta</option>
                <option value="critica">🔥 Crítica</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-bold uppercase tracking-wider ${tema.colores.texto} flex items-center gap-2`}>
              <Phone className="w-4 h-4" />
              Teléfono de Contacto (Opcional)
            </label>
            <input
              type="tel"
              value={nuevoTicketData.telefono}
              onChange={(e) => manejarNuevoTicketChange("telefono", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
              placeholder="Ej: +56 9 1234 5678"
            />
            <p className={`text-xs font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}>
              <Lightbulb className="w-3 h-3" />
              Si lo dejas vacío, se utilizará tu extensión o teléfono registrado
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 lg:gap-4 pt-4 border-t border-gray-700/30">
            <button
              type="button"
              onClick={() => setModalNuevoAbierto(false)}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white ${tema.colores.primario} transition-all duration-300 hover:scale-105 shadow-2xl ${tema.colores.glow} flex items-center justify-center gap-2`}
            >
              <Rocket className="w-5 h-5" />
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// PANEL DETALLE TICKET PREMIUM
// ========================================

function PanelDetalleTicketPremium({
  tema,
  ticket,
  setTicketSeleccionado,
  obtenerIconoTipo,
  obtenerColorEstado,
  obtenerColorPrioridad,
  formatearFecha,
  actualizarEstadoTicket,
}: any) {
  return (
    <div className="fixed inset-0 z-[55] flex justify-end animate-fadeIn">
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={() => setTicketSeleccionado(null)}
      />
      <div className={`w-full max-w-2xl h-full ${tema.colores.card} ${tema.colores.borde} border-l ${tema.colores.sombra} ${tema.colores.glow} p-6 lg:p-8 overflow-y-auto custom-scrollbar animate-slideInRight`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 lg:w-14 h-12 lg:h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-xl ${tema.colores.glow}`}>
              {(() => {
                const Icono = obtenerIconoTipo(ticket.tipo);
                return <Icono className="w-6 lg:w-7 h-6 lg:h-7" />;
              })()}
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
                {ticket.numero_ticket}
              </p>
              <h3 className={`text-xl lg:text-2xl font-black ${tema.colores.texto}`}>
                {ticket.titulo}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setTicketSeleccionado(null)}
            className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 hover:rotate-90`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Estado y Prioridad */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${tema.colores.textoSecundario}`}>
                Estado Actual
              </p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${obtenerColorEstado(ticket.estado)}`}>
                <Activity className="w-4 h-4" />
                {ticket.estado}
              </span>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${tema.colores.textoSecundario}`}>
                Prioridad
              </p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${obtenerColorPrioridad(ticket.prioridad)}`}>
                <Flame className="w-4 h-4" />
                {ticket.prioridad}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario} flex items-center gap-2`}>
              <FileText className="w-4 h-4" />
              Descripción del Problema
            </p>
            <p className={`text-sm font-semibold leading-relaxed ${tema.colores.texto}`}>
              {ticket.descripcion}
            </p>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${tema.colores.textoSecundario}`}>
                Tipo
              </p>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                {ticket.tipo.toUpperCase()}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${tema.colores.textoSecundario}`}>
                Centro
              </p>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                {ticket.centro?.nombre}
              </p>
            </div>
          </div>

          {/* Equipo Afectado */}
          {ticket.equipo_afectado && (
            <div className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario} flex items-center gap-2`}>
                <Cpu className="w-4 h-4" />
                Equipo Afectado
              </p>
              <div className="space-y-2">
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  {ticket.equipo_afectado.nombre}
                </p>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                  Tipo: {ticket.equipo_afectado.tipo}
                </p>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario} flex items-center gap-1`}>
                  <MapPin className="w-3 h-3" />
                  {ticket.equipo_afectado.ubicacion}
                </p>
              </div>
            </div>
          )}

          {/* Solicitante */}
          <div className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario} flex items-center gap-2`}>
              <User className="w-4 h-4" />
              Información del Solicitante
            </p>
            <div className="space-y-2">
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                {ticket.solicitante.nombre_completo}
              </p>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}>
                <Mail className="w-3 h-3" />
                {ticket.solicitante.email}
              </p>
              {ticket.solicitante.telefono && (
                <a
                  href={`tel:${ticket.solicitante.telefono}`}
                  className={`inline-flex items-center gap-2 text-xs font-bold ${tema.colores.acento} hover:underline`}
                >
                  <Phone className="w-3 h-3" />
                  {ticket.solicitante.telefono}
                </a>
              )}
            </div>
          </div>

          {/* Tiempos */}
          <div className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario} flex items-center gap-2`}>
              <Clock className="w-4 h-4" />
              Información de Tiempos
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                  Creado
                </p>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  {formatearFecha(ticket.fecha_creacion)}
                </p>
              </div>
              <div>
                <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                  Tiempo Estimado
                </p>
                <p className={`text-sm font-bold ${tema.colores.texto}`}>
                  {ticket.tiempo_estimado_minutos} minutos
                </p>
              </div>
              {ticket.tiempo_real_minutos && (
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Tiempo Real
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {ticket.tiempo_real_minutos} minutos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-3 pt-4 border-t border-gray-700/30">
            <p className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
              Acciones Rápidas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => actualizarEstadoTicket(ticket.id_ticket, "en_progreso")}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                En Progreso
              </button>
              <button
                onClick={() => actualizarEstadoTicket(ticket.id_ticket, "resuelto")}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Resolver
              </button>
              <button
                onClick={() => actualizarEstadoTicket(ticket.id_ticket, "cancelado")}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <Link
                href={`/tecnico/tickets/${ticket.id_ticket}`}
                className={`px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2`}
              >
                <Eye className="w-4 h-4" />
                Ver Completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ResumenCardPremium, VistaListaPremium, VistaTableroPremium, VistaCompactaPremium, ModalNuevoTicketPremium, PanelDetalleTicketPremium };



