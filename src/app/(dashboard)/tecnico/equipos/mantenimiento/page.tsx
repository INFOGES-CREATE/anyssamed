// src/app/(dashboard)/tecnico/equipos/mantenimiento/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  Bell,
  Calendar,
  CalendarClock,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardList,
  Cpu,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  HardDrive,
  History,
  Loader2,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Tool,
  TrendingUp,
  User,
  Wrench,
  X,
  Zap,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

// ================================
// TIPOS
// ================================

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

type EstadoMantenimiento =
  | "programado"
  | "en_progreso"
  | "completado"
  | "cancelado"
  | "vencido";

type TipoMantenimiento = "preventivo" | "correctivo" | "predictivo" | "calibracion";

type PrioridadMantenimiento = "baja" | "media" | "alta" | "critica";

interface MantenimientoEquipo {
  id_mantenimiento: number;
  id_equipo: number;
  equipo: {
    codigo_interno: string;
    nombre: string;
    tipo_equipo: string;
    marca: string;
    modelo: string;
    centro: string;
    sucursal: string | null;
    ubicacion: string;
  };
  tipo_mantenimiento: TipoMantenimiento;
  estado: EstadoMantenimiento;
  prioridad: PrioridadMantenimiento;
  fecha_programada: string;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  duracion_estimada_horas: number;
  duracion_real_horas: number | null;
  id_tecnico_asignado: number;
  tecnico_asignado: string;
  descripcion: string;
  observaciones: string | null;
  checklist_completado: boolean;
  requiere_repuestos: boolean;
  costo_estimado: number | null;
  costo_real: number | null;
  proximo_mantenimiento: string | null;
}

interface ApiMantenimientosResponse {
  success: boolean;
  mantenimientos?: MantenimientoEquipo[];
  error?: string;
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

// ================================
// TEMAS PREMIUM
// ================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-2xl shadow-indigo-500/10",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-2xl border-gray-200",
      header: "bg-white/90 backdrop-blur-2xl border-gray-200",
      card: "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10",
      hover: "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50",
    },
  },
  dark: {
    nombre: "Oscuro Elite",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
      secundario: "bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-2xl border-gray-800",
      header: "bg-gray-900/90 backdrop-blur-2xl border-gray-800",
      card: "bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20",
      hover: "hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-indigo-900/30",
    },
  },
  blue: {
    nombre: "Azul Técnico Pro",
    icono: Cpu,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
      secundario: "bg-blue-800/50 hover:bg-blue-700/50 backdrop-blur-sm",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-2xl border-cyan-800",
      header: "bg-blue-900/90 backdrop-blur-2xl border-cyan-800",
      card: "bg-blue-800/50 backdrop-blur-sm border-cyan-700 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20",
      hover: "hover:bg-gradient-to-r hover:from-blue-800/80 hover:to-cyan-900/30",
    },
  },
  purple: {
    nombre: "Púrpura Industrial Elite",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500",
      secundario: "bg-purple-800/50 hover:bg-purple-700/50 backdrop-blur-sm",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-2xl border-purple-800",
      header: "bg-purple-900/90 backdrop-blur-2xl border-purple-800",
      card: "bg-purple-800/50 backdrop-blur-sm border-purple-700 hover:border-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/20",
      hover:
        "hover:bg-gradient-to-r hover:from-purple-800/80 hover:to-fuchsia-900/30",
    },
  },
  green: {
    nombre: "Verde Operacional Pro",
    icono: AlertTriangle,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      secundario: "bg-teal-800/50 hover:bg-teal-700/50 backdrop-blur-sm",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-2xl border-emerald-800",
      header: "bg-emerald-900/90 backdrop-blur-2xl border-emerald-800",
      card: "bg-emerald-800/50 backdrop-blur-sm border-emerald-700 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20",
      hover:
        "hover:bg-gradient-to-r hover:from-emerald-800/80 hover:to-teal-900/30",
    },
  },
};

// ================================
// COMPONENTE PRINCIPAL
// ================================

export default function MantenimientoEquiposPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [loadingMantenimientos, setLoadingMantenimientos] = useState(true);
  const [errorMantenimientos, setErrorMantenimientos] = useState<string | null>(
    null
  );

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [mantenimientos, setMantenimientos] = useState<MantenimientoEquipo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoMantenimiento | "todos">(
    "todos"
  );
  const [filtroTipo, setFiltroTipo] = useState<TipoMantenimiento | "todos">("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<
    PrioridadMantenimiento | "todos"
  >("todos");
  const [soloVencidos, setSoloVencidos] = useState(false);

  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] =
    useState<MantenimientoEquipo | null>(null);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );

  // ================================
  // EFECTOS: TEMA Y BODY
  // ================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem(
        "tema_tecnico"
      ) as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  // ================================
  // EFECTO: CARGAR SESIÓN
  // ================================

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingSesion(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("No hay sesión activa");
        }

        const data = await res.json();
        if (!data.success || !data.usuario) {
          throw new Error("Sesión inválida");
        }

        const rolesUsuario: string[] = [];

        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const esTecnico = rolesUsuario.some((r) => r.includes("TECNICO"));

        if (!esTecnico) {
          alert(
            `Acceso denegado. Módulo exclusivo para TÉCNICOS.\nRoles actuales: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!data.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
        setDisponibilidad(data.usuario.tecnico.disponibilidad);
      } catch (err) {
        console.error("Error sesión técnico:", err);
        alert("Error al verificar sesión. Serás redirigido al login.");
        window.location.href = "/login";
      } finally {
        setLoadingSesion(false);
      }
    };

    cargarUsuario();
  }, []);

  // ================================
  // EFECTO: CARGAR MANTENIMIENTOS
  // ================================

  const cargarMantenimientos = async () => {
    try {
      setLoadingMantenimientos(true);
      setErrorMantenimientos(null);

      const res = await fetch("/api/tecnico/mantenimientos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      let data: ApiMantenimientosResponse;
      try {
        data = (await res.json()) as ApiMantenimientosResponse;
      } catch {
        data = { success: false, error: "Respuesta inválida" };
      }

      if (!res.ok || !data.success || !data.mantenimientos) {
        console.warn("No se pudieron cargar mantenimientos desde la API.");
        setMantenimientos([]);
        if (data.error) setErrorMantenimientos(data.error);
        return;
      }

      setMantenimientos(data.mantenimientos);
    } catch (err) {
      console.error("Error al cargar mantenimientos:", err);
      setMantenimientos([]);
      setErrorMantenimientos(
        "No se pudo cargar el historial de mantenimientos."
      );
    } finally {
      setLoadingMantenimientos(false);
    }
  };

  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarMantenimientos();
    }
  }, [usuario]);

  // ================================
  // CAMBIAR TEMA / DISPONIBILIDAD
  // ================================

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
      console.error("No se pudo guardar el tema en BD:", err);
    }
  };

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (!res.ok) {
        alert("No se pudo actualizar la disponibilidad.");
        return;
      }

      setDisponibilidad(nuevoEstado);
    } catch (err) {
      console.error("Error disponibilidad:", err);
      alert("Error al actualizar disponibilidad.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logout:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  // ================================
  // HELPERS
  // ================================

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const formatearFechaHora = (fecha: string | null) => {
    if (!fecha) return "Sin registro";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Sin registro";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const diasHasta = (fecha: string | null) => {
    if (!fecha) return null;
    const hoy = new Date();
    const target = new Date(fecha);
    if (isNaN(target.getTime())) return null;
    const diffMs = target.getTime() - hoy.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDias;
  };

  const obtenerBadgeEstado = (estado: EstadoMantenimiento) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (estado) {
      case "programado":
        return isDark
          ? "bg-sky-500/20 text-sky-300 border border-sky-500/60 shadow-lg shadow-sky-500/20"
          : "bg-sky-50 text-sky-700 border border-sky-300 shadow-sm";
      case "en_progreso":
        return isDark
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse"
          : "bg-amber-50 text-amber-700 border border-amber-300 shadow-sm animate-pulse";
      case "completado":
        return isDark
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-lg shadow-emerald-500/20"
          : "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm";
      case "cancelado":
        return isDark
          ? "bg-slate-500/20 text-slate-300 border border-slate-500/60 shadow-lg shadow-slate-500/20"
          : "bg-slate-50 text-slate-700 border border-slate-300 shadow-sm";
      case "vencido":
        return isDark
          ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-lg shadow-rose-500/20 animate-pulse"
          : "bg-rose-50 text-rose-700 border border-rose-300 shadow-sm animate-pulse";
    }
  };

  const obtenerBadgeTipo = (tipo: TipoMantenimiento) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (tipo) {
      case "preventivo":
        return isDark
          ? "bg-blue-500/15 text-blue-300 border border-blue-500/50 shadow-md shadow-blue-500/10"
          : "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm";
      case "correctivo":
        return isDark
          ? "bg-orange-500/15 text-orange-300 border border-orange-500/50 shadow-md shadow-orange-500/10"
          : "bg-orange-50 text-orange-700 border border-orange-200 shadow-sm";
      case "predictivo":
        return isDark
          ? "bg-purple-500/15 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-500/10"
          : "bg-purple-50 text-purple-700 border border-purple-200 shadow-sm";
      case "calibracion":
        return isDark
          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10"
          : "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm";
    }
  };

  const obtenerBadgePrioridad = (prioridad: PrioridadMantenimiento) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (prioridad) {
      case "baja":
        return isDark
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "media":
        return isDark
          ? "bg-sky-500/15 text-sky-300 border border-sky-500/50"
          : "bg-sky-50 text-sky-700 border border-sky-200";
      case "alta":
        return isDark
          ? "bg-amber-500/15 text-amber-300 border border-amber-500/50"
          : "bg-amber-50 text-amber-700 border border-amber-200";
      case "critica":
        return isDark
          ? "bg-red-500/15 text-red-300 border border-red-500/50 animate-pulse"
          : "bg-red-50 text-red-700 border border-red-200 animate-pulse";
    }
  };

  // ================================
  // FILTROS Y KPIs
  // ================================

  const mantenimientosFiltrados = useMemo(() => {
    let lista = [...mantenimientos];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (m) =>
          m.equipo.nombre.toLowerCase().includes(q) ||
          m.equipo.codigo_interno.toLowerCase().includes(q) ||
          m.equipo.centro.toLowerCase().includes(q) ||
          m.tecnico_asignado.toLowerCase().includes(q) ||
          m.descripcion.toLowerCase().includes(q)
      );
    }

    if (filtroEstado !== "todos") {
      lista = lista.filter((m) => m.estado === filtroEstado);
    }

    if (filtroTipo !== "todos") {
      lista = lista.filter((m) => m.tipo_mantenimiento === filtroTipo);
    }

    if (filtroPrioridad !== "todos") {
      lista = lista.filter((m) => m.prioridad === filtroPrioridad);
    }

    if (soloVencidos) {
      lista = lista.filter((m) => m.estado === "vencido");
    }

    return lista;
  }, [
    mantenimientos,
    busqueda,
    filtroEstado,
    filtroTipo,
    filtroPrioridad,
    soloVencidos,
  ]);

  const kpis = useMemo(() => {
    const total = mantenimientos.length;
    const programados = mantenimientos.filter(
      (m) => m.estado === "programado"
    ).length;
    const enProgreso = mantenimientos.filter(
      (m) => m.estado === "en_progreso"
    ).length;
    const completados = mantenimientos.filter(
      (m) => m.estado === "completado"
    ).length;
    const vencidos = mantenimientos.filter((m) => m.estado === "vencido").length;
    const proximos = mantenimientos.filter((m) => {
      const d = diasHasta(m.fecha_programada);
      return d !== null && d >= 0 && d <= 7;
    }).length;

    return {
      total,
      programados,
      enProgreso,
      completados,
      vencidos,
      proximos,
    };
  }, [mantenimientos]);

  // ================================
  // ESTADOS DE CARGA
  // ================================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
            >
              <Wrench className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h2
            className={`text-4xl font-black mb-3 ${tema.colores.texto} animate-pulse`}
          >
            Cargando Mantenimientos
          </h2>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Verificando tu sesión de técnico...
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <div
              className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
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
          className={`max-w-md w-full p-10 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
        >
          <div className="flex flex-col items-center text-center gap-5">
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-2 shadow-2xl animate-pulse`}
            >
              <AlertOctagon className="w-12 h-12 text-white" />
            </div>
            <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
              Acceso restringido
            </h2>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Este módulo es exclusivo para cuentas con rol <b>TÉCNICO</b>.
            </p>
            <Link
              href="/login"
              className={`mt-3 inline-flex items-center gap-2 px-8 py-4 rounded-2xl ${tema.colores.primario} text-white font-bold ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
            >
              <LogOut className="w-5 h-5" />
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // RENDER PRINCIPAL
  // ================================

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} transition-all duration-700`}
    >
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
        className={`fixed top-0 right-0 z-30 transition-all duration-500 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b-2 ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5">
          {/* Búsqueda Premium */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} group-focus-within:text-indigo-500 transition-colors duration-300`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por equipo, código, técnico o descripción..."
                className={`w-full pl-12 pr-12 py-3.5 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 shadow-lg`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-rose-500/20 transition-all duration-200 group"
                >
                  <X className="w-4 h-4 text-rose-400 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              )}
              {busqueda && (
                <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-xl bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/30">
                  <p className="text-xs text-indigo-300">
                    🔍 {mantenimientosFiltrados.length} resultados encontrados
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acciones Premium */}
          <div className="flex items-center gap-3 ml-6">
            {/* Temas con animación */}
            <div className="relative group">
              <button
                className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Temas Premium
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.entries(TEMAS).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => cambiarTema(key as TemaColor)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                        temaActual === key
                          ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-xl`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <t.icono className="w-5 h-5" />
                        {t.nombre}
                      </span>
                      {temaActual === key && (
                        <Check className="w-5 h-5 animate-bounce" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notificaciones Premium */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <Bell className="w-5 h-5" />
                {kpis.vencidos > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 border-2 border-white animate-ping" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 border-2 border-white flex items-center justify-center text-[8px] font-bold">
                      {kpis.vencidos}
                    </span>
                  </>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-3 w-96 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 animate-fadeIn`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-400" />
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        Alertas de Mantenimiento
                      </p>
                    </div>
                    {kpis.vencidos > 0 && (
                      <span className="px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                        {kpis.vencidos} vencidos
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {kpis.vencidos > 0 && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all duration-200 cursor-pointer">
                        <p className="text-xs font-semibold text-rose-300">
                          🚨 Mantenimientos Vencidos
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {kpis.vencidos} mantenimientos requieren atención
                          inmediata
                        </p>
                      </div>
                    )}
                    {kpis.proximos > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all duration-200 cursor-pointer">
                        <p className="text-xs font-semibold text-amber-300">
                          ⏰ Próximos 7 días
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {kpis.proximos} mantenimientos programados
                        </p>
                      </div>
                    )}
                    {kpis.enProgreso > 0 && (
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all duration-200 cursor-pointer">
                        <p className="text-xs font-semibold text-indigo-300">
                          ⚙️ En Progreso
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {kpis.enProgreso} mantenimientos activos
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilidad Premium */}
            <div className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-black/10 backdrop-blur-sm">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "disponible"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ✓ Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "ocupado"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ⏸ Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50"
                    : `${tema.colores.texto} hover:bg-white/10`
                }`}
              >
                ⊗ Fuera
              </button>
            </div>

            {/* Perfil Premium */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${tema.colores.hover} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <div className="hidden md:block text-right">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Técnico {usuario.tecnico?.tipo_tecnico}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-sm font-bold shadow-xl ring-2 ring-white/20`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={40}
                      height={40}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${
                    tema.colores.texto
                  } transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-3 w-80 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-5 animate-fadeIn`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-lg font-bold shadow-xl`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={56}
                          height={56}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-base font-bold ${tema.colores.texto} truncate`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} truncate`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          En línea
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <User className="w-4 h-4" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${tema.colores.hover} ${tema.colores.texto} font-semibold transform hover:scale-105 transition-all duration-200`}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/20 text-xs font-bold transform hover:scale-105 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
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
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-28 px-8 pb-12`}
      >
        {/* Encabezado Premium */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs mb-2">
                <Link
                  href="/tecnico"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
                >
                  Dashboard Técnico
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href="/tecnico/equipos"
                  className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
                >
                  Equipos
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className={`font-bold ${tema.colores.texto}`}>
                  Mantenimientos
                </span>
              </div>
              <h1
                className={`text-4xl md:text-5xl font-black flex items-center gap-4 ${tema.colores.texto} mb-2`}
              >
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Gestión de Mantenimientos
                </span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider shadow-xl shadow-indigo-500/50 animate-pulse">
                  ✨ Premium
                </span>
              </h1>
              <p
                className={`text-sm md:text-base mt-2 ${tema.colores.textoSecundario} max-w-3xl`}
              >
                Control completo de mantenimientos preventivos, correctivos y
                predictivos con seguimiento en tiempo real y alertas automáticas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tecnico/equipos"
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Equipos
              </Link>
              <button
                onClick={cargarMantenimientos}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingMantenimientos ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </button>
              <Link
                href="/tecnico/mantenimiento/programar"
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} transform hover:scale-105 transition-all duration-300`}
              >
                <Plus className="w-4 h-4" />
                Nuevo Mantenimiento
              </Link>
              <button
                onClick={() =>
                  window.open("/api/tecnico/mantenimientos/export-excel", "_blank")
                }
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {errorMantenimientos && (
            <div className="mt-3 flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">{errorMantenimientos}</span>
            </div>
          )}
        </div>

        {/* KPIs Premium con animaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5 mb-8">
          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Total
              </p>
              <div className="p-2 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-all duration-300">
                <ClipboardList className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <p
              className={`text-3xl font-black ${tema.colores.texto} mb-2 group-hover:scale-110 transition-transform duration-300`}
            >
              {kpis.total}
            </p>
            <p className="text-xs text-indigo-300 font-semibold">
              Mantenimientos registrados
            </p>
          </div>

          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Programados
              </p>
              <div className="p-2 rounded-xl bg-sky-500/20 group-hover:bg-sky-500/30 transition-all duration-300">
                <Calendar className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <p className="text-3xl font-black text-sky-300 mb-2 group-hover:scale-110 transition-transform duration-300">
              {kpis.programados}
            </p>
            <p className="text-xs text-sky-200 font-semibold">
              📅 Pendientes de ejecución
            </p>
          </div>

          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                En Progreso
              </p>
              <div className="p-2 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 transition-all duration-300 animate-pulse">
                <Wrench className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-300 mb-2 group-hover:scale-110 transition-transform duration-300">
              {kpis.enProgreso}
            </p>
            <p className="text-xs text-amber-200 font-semibold">
              ⚙️ Actualmente en ejecución
            </p>
          </div>

          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Completados
              </p>
              <div className="p-2 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-all duration-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-300 mb-2 group-hover:scale-110 transition-transform duration-300">
              {kpis.completados}
            </p>
            <p className="text-xs text-emerald-200 font-semibold">
              ✓ Finalizados exitosamente
            </p>
          </div>

          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Vencidos
              </p>
              <div className="p-2 rounded-xl bg-rose-500/20 group-hover:bg-rose-500/30 transition-all duration-300 animate-pulse">
                <AlertOctagon className="w-5 h-5 text-rose-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <p className="text-3xl font-black text-rose-400 mb-2 group-hover:scale-110 transition-transform duration-300">
              {kpis.vencidos}
            </p>
            <p className="text-xs text-rose-300 font-semibold">
              🚨 Requieren atención urgente
            </p>
          </div>

          <div
            className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
                >
                  Próximos 7 días
                </p>
                <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-all duration-300">
                  <CalendarClock className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <p className="text-3xl font-black text-purple-300 mb-2 group-hover:scale-110 transition-transform duration-300">
                {kpis.proximos}
              </p>
              <p className="text-xs text-purple-200 font-semibold">
                ⏰ Programados próximamente
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal con filtros */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Panel de filtros lateral Premium */}
          <aside
            className={`xl:col-span-1 rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} h-fit sticky top-28 transform hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
              >
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-base font-black ${tema.colores.texto}`}>
                  Filtros Avanzados
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Personaliza tu búsqueda
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Filtro Estado */}
              <div>
                <label
                  className={`text-xs font-bold mb-3 block ${tema.colores.textoSecundario} uppercase tracking-wider`}
                >
                  ⚡ Estado del Mantenimiento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroEstado("todos")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "todos"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado("programado")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "programado"
                        ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    📅 Programado
                  </button>
                  <button
                    onClick={() => setFiltroEstado("en_progreso")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "en_progreso"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    ⚙️ En Progreso
                  </button>
                  <button
                    onClick={() => setFiltroEstado("completado")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "completado"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    ✓ Completado
                  </button>
                  <button
                    onClick={() => setFiltroEstado("vencido")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "vencido"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50 animate-pulse"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🚨 Vencido
                  </button>
                  <button
                    onClick={() => setFiltroEstado("cancelado")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroEstado === "cancelado"
                        ? "bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-lg shadow-slate-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    ⊗ Cancelado
                  </button>
                </div>
              </div>

              {/* Filtro Tipo */}
              <div>
                <label
                  className={`text-xs font-bold mb-3 block ${tema.colores.textoSecundario} uppercase tracking-wider`}
                >
                  🔧 Tipo de Mantenimiento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroTipo("todos")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroTipo === "todos"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroTipo("preventivo")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroTipo === "preventivo"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🛡️ Preventivo
                  </button>
                  <button
                    onClick={() => setFiltroTipo("correctivo")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroTipo === "correctivo"
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🔨 Correctivo
                  </button>
                  <button
                    onClick={() => setFiltroTipo("predictivo")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroTipo === "predictivo"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🔮 Predictivo
                  </button>
                  <button
                    onClick={() => setFiltroTipo("calibracion")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold col-span-2 transition-all duration-300 transform hover:scale-105 ${
                      filtroTipo === "calibracion"
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    ⚖️ Calibración
                  </button>
                </div>
              </div>

              {/* Filtro Prioridad */}
              <div>
                <label
                  className={`text-xs font-bold mb-3 block ${tema.colores.textoSecundario} uppercase tracking-wider`}
                >
                  🎯 Nivel de Prioridad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroPrioridad("todos")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "todos"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("baja")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "baja"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Baja
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("media")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "media"
                        ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Media
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("alta")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "alta"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Alta
                  </button>
                  <button
                    onClick={() => setFiltroPrioridad("critica")}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold col-span-2 transition-all duration-300 transform hover:scale-105 ${
                      filtroPrioridad === "critica"
                        ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/50 animate-pulse"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    🔥 Crítica
                  </button>
                </div>
              </div>

              {/* Toggle Solo Vencidos */}
              <div
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  soloVencidos
                    ? "bg-rose-500/20 border-2 border-rose-500/50"
                    : "bg-black/5 border-2 border-transparent"
                } transition-all duration-300`}
              >
                <div>
                  <label
                    className={`text-xs font-bold ${tema.colores.texto} block mb-1`}
                  >
                    🚨 Solo Vencidos
                  </label>
                  <p className="text-[10px] text-gray-400">
                    Mostrar únicamente mantenimientos vencidos
                  </p>
                </div>
                <button
                  onClick={() => setSoloVencidos((v) => !v)}
                  className={`w-14 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${
                    soloVencidos
                      ? "bg-gradient-to-r from-rose-600 to-red-600 shadow-lg shadow-rose-500/50"
                      : "bg-slate-500/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                      soloVencidos ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Botón Limpiar Filtros */}
              <button
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todos");
                  setFiltroTipo("todos");
                  setFiltroPrioridad("todos");
                  setSoloVencidos(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold ${tema.colores.secundario} ${tema.colores.texto} transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>
          </aside>

          {/* Contenido principal - Tabla y Detalle */}
          <section className="xl:col-span-3 space-y-6">
            {/* Tabla de Mantenimientos Premium */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20">
                    <History className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>
                      Historial de Mantenimientos
                    </p>
                    <p className="text-xs text-indigo-300 font-semibold">
                      {mantenimientosFiltrados.length} registros encontrados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {kpis.enProgreso > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 animate-pulse">
                      <span className="text-xs font-bold text-amber-300">
                        {kpis.enProgreso} en progreso
                      </span>
                    </div>
                  )}
                  {kpis.vencidos > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 animate-pulse">
                      <span className="text-xs font-bold text-rose-300">
                        {kpis.vencidos} vencidos
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {loadingMantenimientos ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-transparent rounded-full animate-spin" />
                    <div
                      className={`absolute inset-2 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Wrench className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tema.colores.texto} mb-2`}>
                    Cargando mantenimientos...
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Obteniendo historial completo
                  </p>
                </div>
              ) : mantenimientosFiltrados.length === 0 ? (
                <div className="py-16 text-center">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} mx-auto flex items-center justify-center mb-4 shadow-2xl`}
                  >
                    <ClipboardList className="w-10 h-10 text-white" />
                  </div>
                  <p className={`text-lg font-black ${tema.colores.texto} mb-2`}>
                    No se encontraron mantenimientos
                  </p>
                  <p className={`text-sm ${tema.colores.textoSecundario} mb-4`}>
                    Ajusta los filtros o programa un nuevo mantenimiento
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setBusqueda("");
                        setFiltroEstado("todos");
                        setFiltroTipo("todos");
                        setFiltroPrioridad("todos");
                        setSoloVencidos(false);
                      }}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transform hover:scale-105 transition-all duration-300 shadow-lg`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Restablecer filtros
                    </button>
                    <Link
                      href="/tecnico/mantenimiento/programar"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.primario} text-white font-bold transform hover:scale-105 transition-all duration-300 shadow-xl`}
                    >
                      <Plus className="w-4 h-4" />
                      Programar Mantenimiento
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar-premium">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider border-b-2 border-white/10">
                        <th
                          className={`text-left pb-4 pr-6 ${tema.colores.textoSecundario} font-black`}
                        >
                          Equipo
                        </th>
                        <th
                          className={`text-left pb-4 pr-6 ${tema.colores.textoSecundario} font-black`}
                        >
                          Tipo / Prioridad
                        </th>
                        <th
                          className={`text-left pb-4 pr-6 ${tema.colores.textoSecundario} font-black`}
                        >
                          Estado
                        </th>
                        <th
                          className={`text-left pb-4 pr-6 ${tema.colores.textoSecundario} font-black`}
                        >
                          Fecha Programada
                        </th>
                        <th
                          className={`text-left pb-4 pr-6 ${tema.colores.textoSecundario} font-black`}
                        >
                          Técnico Asignado
                        </th>
                        <th
                          className={`text-left pb-4 pr-6 ${tema.colores.textoSecundario} font-black`}
                        >
                          Duración
                        </th>
                        <th
                          className={`text-center pb-4 ${tema.colores.textoSecundario} font-black`}
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mantenimientosFiltrados.map((m, idx) => {
                        const d = diasHasta(m.fecha_programada);
                        const esVencido = d !== null && d < 0;
                        const esProximo = d !== null && d >= 0 && d <= 7;

                        return (
                          <tr
                            key={m.id_mantenimiento}
                            className={`border-t ${tema.colores.borde} text-xs hover:bg-gradient-to-r hover:from-indigo-500/5 hover:to-purple-500/5 cursor-pointer transition-all duration-300 group`}
                            onClick={() => setMantenimientoSeleccionado(m)}
                            style={{
                              animationDelay: `${idx * 50}ms`,
                            }}
                          >
                            <td className="py-4 pr-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                                >
                                  <HardDrive className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p
                                    className={`font-bold ${tema.colores.texto} group-hover:text-indigo-400 transition-colors duration-200`}
                                  >
                                    {m.equipo.nombre}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-mono">
                                    {m.equipo.codigo_interno}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    {m.equipo.centro}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-6">
                              <div className="space-y-1.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold ${obtenerBadgeTipo(
                                    m.tipo_mantenimiento
                                  )} transform group-hover:scale-105 transition-all duration-300`}
                                >
                                  {m.tipo_mantenimiento === "preventivo" && "🛡️"}
                                  {m.tipo_mantenimiento === "correctivo" && "🔨"}
                                  {m.tipo_mantenimiento === "predictivo" && "🔮"}
                                  {m.tipo_mantenimiento === "calibracion" && "⚖️"}
                                  <span className="uppercase tracking-wide">
                                    {m.tipo_mantenimiento}
                                  </span>
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold ${obtenerBadgePrioridad(
                                    m.prioridad
                                  )} transform group-hover:scale-105 transition-all duration-300`}
                                >
                                  {m.prioridad === "baja" && "🟢"}
                                  {m.prioridad === "media" && "🟡"}
                                  {m.prioridad === "alta" && "🟠"}
                                  {m.prioridad === "critica" && "🔴"}
                                  <span className="uppercase">
                                    {m.prioridad}
                                  </span>
                                </span>
                              </div>
                            </td>
                            <td className="py-4 pr-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold ${obtenerBadgeEstado(
                                  m.estado
                                )} transform group-hover:scale-110 transition-all duration-300`}
                              >
                                {m.estado === "programado" && "📅"}
                                {m.estado === "en_progreso" && "⚙️"}
                                {m.estado === "completado" && "✓"}
                                {m.estado === "cancelado" && "⊗"}
                                {m.estado === "vencido" && "🚨"}
                                <span className="uppercase tracking-wide">
                                  {m.estado.replace("_", " ")}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 pr-6">
                              <div className="flex items-start gap-2">
                                <Calendar
                                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                    esVencido
                                      ? "text-rose-400 animate-pulse"
                                      : esProximo
                                      ? "text-amber-400"
                                      : "text-gray-400"
                                  }`}
                                />
                                <div>
                                  <p
                                    className={`text-xs font-semibold ${
                                      esVencido
                                        ? "text-rose-400"
                                        : esProximo
                                        ? "text-amber-300"
                                        : tema.colores.texto
                                    }`}
                                  >
                                    {formatearFecha(m.fecha_programada)}
                                  </p>
                                  {d !== null && (
                                    <p
                                      className={`text-[10px] font-bold ${
                                        esVencido
                                          ? "text-rose-300"
                                          : esProximo
                                          ? "text-amber-200"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {d >= 0
                                        ? `⏱ En ${d} días`
                                        : `⚠️ ${-d} días de atraso`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                                >
                                  {m.tecnico_asignado
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <p
                                    className={`text-xs font-bold ${tema.colores.texto}`}
                                  >
                                    {m.tecnico_asignado}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    Técnico asignado
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-6">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                <div>
                                  <p
                                    className={`text-xs font-bold ${tema.colores.texto}`}
                                  >
                                    {m.duracion_real_horas
                                      ? `${m.duracion_real_horas}h reales`
                                      : `${m.duracion_estimada_horas}h estimadas`}
                                  </p>
                                  {m.duracion_real_horas && (
                                    <p className="text-[10px] text-gray-400">
                                      Est: {m.duracion_estimada_horas}h
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    setMantenimientoSeleccionado(m);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ${tema.colores.primario} text-white text-[10px] font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver
                                </button>
                                {m.estado === "programado" && (
                                  <button
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      router.push(
                                        `/tecnico/mantenimiento/${m.id_mantenimiento}/editar`
                                      );
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-[10px] font-bold transform hover:scale-110 transition-all duration-300 shadow-md`}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}
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

            {/* Panel de Detalle Premium */}
            <div
              className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} transform hover:shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>
                      Detalle del Mantenimiento
                    </p>
                    <p className="text-xs text-emerald-300 font-semibold">
                      Información completa y seguimiento
                    </p>
                  </div>
                </div>
                {mantenimientoSeleccionado && (
                  <button
                    onClick={() => setMantenimientoSeleccionado(null)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 transition-all duration-200 group"
                  >
                    <X className="w-5 h-5 text-rose-400 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                )}
              </div>

              {mantenimientoSeleccionado ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Header del mantenimiento */}
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                    >
                      <Wrench className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-black ${tema.colores.texto} mb-1`}
                      >
                        Mantenimiento #{mantenimientoSeleccionado.id_mantenimiento}
                      </h3>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario} mb-2`}
                      >
                        {mantenimientoSeleccionado.equipo.nombre} •{" "}
                        {mantenimientoSeleccionado.equipo.codigo_interno}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerBadgeEstado(
                            mantenimientoSeleccionado.estado
                          )}`}
                        >
                          {mantenimientoSeleccionado.estado.replace("_", " ")}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerBadgeTipo(
                            mantenimientoSeleccionado.tipo_mantenimiento
                          )}`}
                        >
                          {mantenimientoSeleccionado.tipo_mantenimiento}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerBadgePrioridad(
                            mantenimientoSeleccionado.prioridad
                          )}`}
                        >
                          Prioridad {mantenimientoSeleccionado.prioridad}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid de información */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Información del Equipo */}
                    <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        🔧 Información del Equipo
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Equipo:</span>
                          <span
                            className={`font-bold ${tema.colores.texto} text-right`}
                          >
                            {mantenimientoSeleccionado.equipo.nombre}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Código:</span>
                          <span
                            className={`font-mono font-bold ${tema.colores.texto}`}
                          >
                            {mantenimientoSeleccionado.equipo.codigo_interno}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tipo:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {mantenimientoSeleccionado.equipo.tipo_equipo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Marca/Modelo:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {mantenimientoSeleccionado.equipo.marca}{" "}
                            {mantenimientoSeleccionado.equipo.modelo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ubicación:</span>
                          <span
                            className={`font-bold ${tema.colores.texto} text-right`}
                          >
                            {mantenimientoSeleccionado.equipo.ubicacion}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fechas y Tiempos */}
                    <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        📅 Fechas y Tiempos
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Programado:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {formatearFecha(
                              mantenimientoSeleccionado.fecha_programada
                            )}
                          </span>
                        </div>
                        {mantenimientoSeleccionado.fecha_inicio && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Inicio:</span>
                            <span className={`font-bold ${tema.colores.texto}`}>
                              {formatearFechaHora(
                                mantenimientoSeleccionado.fecha_inicio
                              )}
                            </span>
                          </div>
                        )}
                        {mantenimientoSeleccionado.fecha_finalizacion && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Finalización:</span>
                            <span className={`font-bold ${tema.colores.texto}`}>
                              {formatearFechaHora(
                                mantenimientoSeleccionado.fecha_finalizacion
                              )}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duración estimada:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {mantenimientoSeleccionado.duracion_estimada_horas}h
                          </span>
                        </div>
                        {mantenimientoSeleccionado.duracion_real_horas && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duración real:</span>
                            <span
                              className={`font-bold ${
                                mantenimientoSeleccionado.duracion_real_horas >
                                mantenimientoSeleccionado.duracion_estimada_horas
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {mantenimientoSeleccionado.duracion_real_horas}h
                            </span>
                          </div>
                        )}
                        {mantenimientoSeleccionado.proximo_mantenimiento && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Próximo:</span>
                            <span className="font-bold text-sky-400">
                              {formatearFecha(
                                mantenimientoSeleccionado.proximo_mantenimiento
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Técnico y Recursos */}
                    <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        👤 Técnico y Recursos
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Técnico:</span>
                          <span className={`font-bold ${tema.colores.texto}`}>
                            {mantenimientoSeleccionado.tecnico_asignado}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Repuestos:</span>
                          <span
                            className={`font-bold ${
                              mantenimientoSeleccionado.requiere_repuestos
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {mantenimientoSeleccionado.requiere_repuestos
                              ? "Sí requiere"
                              : "No requiere"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Checklist:</span>
                          <span
                            className={`font-bold ${
                              mantenimientoSeleccionado.checklist_completado
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            {mantenimientoSeleccionado.checklist_completado
                              ? "✓ Completado"
                              : "⏳ Pendiente"}
                          </span>
                        </div>
                        {mantenimientoSeleccionado.costo_estimado && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Costo estimado:</span>
                            <span className={`font-bold ${tema.colores.texto}`}>
                              $
                              {mantenimientoSeleccionado.costo_estimado.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {mantenimientoSeleccionado.costo_real && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Costo real:</span>
                            <span
                              className={`font-bold ${
                                mantenimientoSeleccionado.costo_real >
                                (mantenimientoSeleccionado.costo_estimado || 0)
                                  ? "text-rose-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              $
                              {mantenimientoSeleccionado.costo_real.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="p-4 rounded-2xl bg-black/5 border border-white/10">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        📝 Descripción
                      </p>
                      <p className={`text-xs ${tema.colores.texto} leading-relaxed`}>
                        {mantenimientoSeleccionado.descripcion}
                      </p>
                      {mantenimientoSeleccionado.observaciones && (
                        <>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">
                            💬 Observaciones
                          </p>
                          <p
                            className={`text-xs ${tema.colores.texto} leading-relaxed`}
                          >
                            {mantenimientoSeleccionado.observaciones}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex flex-wrap items-center gap-3">
                    {mantenimientoSeleccionado.estado === "programado" && (
                      <>
                        <button
                          onClick={() => {
                            // Lógica para iniciar mantenimiento
                            alert("Función: Iniciar Mantenimiento");
                          }}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.primario} text-white text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                        >
                          <Activity className="w-4 h-4" />
                          Iniciar Mantenimiento
                        </button>
                        <Link
                          href={`/tecnico/mantenimiento/${mantenimientoSeleccionado.id_mantenimiento}/editar`}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Link>
                      </>
                    )}
                    {mantenimientoSeleccionado.estado === "en_progreso" && (
                      <button
                        onClick={() => {
                          // Lógica para finalizar mantenimiento
                          alert("Función: Finalizar Mantenimiento");
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Finalizar Mantenimiento
                      </button>
                    )}
                    <Link
                      href={`/tecnico/equipos/${mantenimientoSeleccionado.id_equipo}`}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <HardDrive className="w-4 h-4" />
                      Ver Equipo
                    </Link>
                    <button
                      onClick={() => {
                        window.open(
                          `/api/tecnico/mantenimientos/${mantenimientoSeleccionado.id_mantenimiento}/pdf`,
                          "_blank"
                        );
                      }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <FileText className="w-4 h-4" />
                      Generar Reporte
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} mx-auto flex items-center justify-center mb-4 shadow-2xl animate-pulse`}
                  >
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <p className={`text-lg font-black ${tema.colores.texto} mb-2`}>
                    Selecciona un mantenimiento
                  </p>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Haz clic en cualquier registro de la tabla para ver su
                    información completa
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER PREMIUM */}
      <footer
        className={`transition-all duration-500 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t-2 py-6 px-8 mt-12`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-black ${tema.colores.texto}`}>
                © 2025 AnyssaMed
              </p>
              <p className="text-xs text-gray-400">
                Módulo Premium de Mantenimientos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/ayuda"
              className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
            >
              📖 Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
            >
              🔒 Privacidad
            </Link>
            <Link
              href="/terminos"
              className={`font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors duration-200`}
            >
              📋 Términos
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-300 font-bold">Sistema Activo</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES PREMIUM */}
      <style jsx global>{`
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

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .custom-scrollbar-premium::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar-premium::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar-premium::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(129, 140, 248, 0.8),
            rgba(167, 139, 250, 0.8)
          );
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar-premium::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(129, 140, 248, 1),
            rgba(167, 139, 250, 1)
          );
        }

        /* Animación de entrada para las filas */
        tbody tr {
          animation: fadeIn 0.3s ease-out backwards;
        }

        /* Efecto de brillo en hover */
        .group:hover .shadow-lg {
          box-shadow: 0 20px 25px -5px rgba(129, 140, 248, 0.3),
            0 10px 10px -5px rgba(129, 140, 248, 0.2);
        }
      `}</style>
    </div>
  );
}

