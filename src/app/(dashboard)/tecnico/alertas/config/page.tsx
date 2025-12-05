// src/app/(dashboard)/tecnico/alertas/config/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  Check,
  CheckCircle2,
  Layers,
  Box,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flame,
  Globe,
  HardDrive,
  Heart,
  HeartPulse,
  History,
  Home,
  Info,
  Lightbulb,
  Link as LinkIcon,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Moon,
  MoreVertical,
  Phone,
  Power,
  PowerOff,
  RefreshCw,
  RotateCw,
  Save,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Target,
  Terminal,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  User,
  Users,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ========================================
// 🎨 TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green" | "cyberpunk" | "ocean" | "sunset";

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
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico" | "sistemas" | "infraestructura";
    turno: "manana" | "tarde" | "noche" | "completo";
    hora_inicio: string | null;
    hora_fin: string | null;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    prioridad: "baja" | "media" | "alta" | "critica";
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

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  alertas_activas: number;
  alertas_criticas: number;
  tiempo_promedio_resolucion: number;
  calificacion_promedio: number;
}

interface ConfiguracionAlertas {
  // Notificaciones
  notificaciones_email: boolean;
  notificaciones_sms: boolean;
  notificaciones_push: boolean;
  notificaciones_desktop: boolean;
  notificaciones_sonido: boolean;
  notificaciones_vibracion: boolean;

  // Prioridades
  prioridad_minima_notificar: "baja" | "media" | "alta" | "critica";
  alertas_criticas_inmediatas: boolean;
  alertas_fuera_horario: boolean;

  // Tipos de alerta
  tipos_alerta_activos: string[];
  
  // Horarios
  horario_notificaciones_inicio: string;
  horario_notificaciones_fin: string;
  notificar_fines_semana: boolean;
  notificar_feriados: boolean;

  // Frecuencia
  frecuencia_resumen_email: "nunca" | "diario" | "semanal" | "mensual";
  agrupar_notificaciones: boolean;
  tiempo_agrupacion_minutos: number;

  // Filtros avanzados
  filtrar_por_ubicacion: boolean;
  ubicaciones_monitoreadas: string[];
  filtrar_por_equipo: boolean;
  equipos_monitoreados: string[];
  filtrar_por_servicio: boolean;
  servicios_monitoreados: string[];

  // Escalamiento
  auto_escalar_sin_respuesta: boolean;
  tiempo_auto_escalamiento_minutos: number;
  notificar_supervisor_criticas: boolean;

  // Interfaz
  mostrar_alertas_resueltas: boolean;
  tiempo_ocultar_resueltas_horas: number;
  alertas_por_pagina: number;
  vista_predeterminada: "tarjetas" | "lista" | "tabla";

  // Sonidos
  sonido_alerta_critica: string;
  sonido_alerta_alta: string;
  sonido_alerta_media: string;
  volumen_notificaciones: number;

  // Avanzado
  modo_no_molestar: boolean;
  horario_no_molestar_inicio: string;
  horario_no_molestar_fin: string;
  pausar_alertas_en_llamada: boolean;
  pausar_alertas_en_reunion: boolean;
}

// ========================================
// 🎨 CONFIGURACIONES DE TEMAS
// ========================================

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

const TIPOS_ALERTA_DISPONIBLES = [
  { value: "equipo_falla", label: "Equipo en Falla", icon: HardDrive, color: "red" },
  { value: "mantenimiento_vencido", label: "Mantenimiento Vencido", icon: Wrench, color: "orange" },
  { value: "ticket_urgente", label: "Ticket Urgente", icon: AlertTriangle, color: "yellow" },
  { value: "equipo_critico", label: "Equipo Crítico", icon: Cpu, color: "red" },
  { value: "sistema_caido", label: "Sistema Caído", icon: Server, color: "red" },
  { value: "red_lenta", label: "Red Lenta", icon: WifiOff, color: "orange" },
  { value: "backup_fallido", label: "Backup Fallido", icon: Database, color: "yellow" },
  { value: "seguridad_comprometida", label: "Seguridad Comprometida", icon: ShieldAlert, color: "red" },
];

const SONIDOS_DISPONIBLES = [
  { value: "default", label: "Sonido Predeterminado" },
  { value: "beep", label: "Beep Simple" },
  { value: "chime", label: "Campana" },
  { value: "alert", label: "Alerta Fuerte" },
  { value: "notification", label: "Notificación Suave" },
  { value: "urgent", label: "Urgente" },
  { value: "none", label: "Sin Sonido" },
];

// ========================================
// 🎯 COMPONENTE PRINCIPAL
// ========================================

export default function ConfiguracionAlertasPage() {
  // 📊 ESTADOS PRINCIPALES
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  
  // 🎨 ESTADOS DE UI
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState<"disponible" | "ocupado" | "fuera_servicio">("disponible");
  
  // ⚙️ CONFIGURACIÓN
  const [configuracion, setConfiguracion] = useState<ConfiguracionAlertas>({
    // Notificaciones
    notificaciones_email: true,
    notificaciones_sms: false,
    notificaciones_push: true,
    notificaciones_desktop: true,
    notificaciones_sonido: true,
    notificaciones_vibracion: true,

    // Prioridades
    prioridad_minima_notificar: "media",
    alertas_criticas_inmediatas: true,
    alertas_fuera_horario: false,

    // Tipos de alerta
    tipos_alerta_activos: ["equipo_falla", "mantenimiento_vencido", "ticket_urgente", "equipo_critico"],
    
    // Horarios
    horario_notificaciones_inicio: "08:00",
    horario_notificaciones_fin: "18:00",
    notificar_fines_semana: false,
    notificar_feriados: false,

    // Frecuencia
    frecuencia_resumen_email: "diario",
    agrupar_notificaciones: true,
    tiempo_agrupacion_minutos: 5,

    // Filtros avanzados
    filtrar_por_ubicacion: false,
    ubicaciones_monitoreadas: [],
    filtrar_por_equipo: false,
    equipos_monitoreados: [],
    filtrar_por_servicio: false,
    servicios_monitoreados: [],

    // Escalamiento
    auto_escalar_sin_respuesta: true,
    tiempo_auto_escalamiento_minutos: 30,
    notificar_supervisor_criticas: true,

    // Interfaz
    mostrar_alertas_resueltas: true,
    tiempo_ocultar_resueltas_horas: 24,
    alertas_por_pagina: 20,
    vista_predeterminada: "tarjetas",

    // Sonidos
    sonido_alerta_critica: "urgent",
    sonido_alerta_alta: "alert",
    sonido_alerta_media: "notification",
    volumen_notificaciones: 70,

    // Avanzado
    modo_no_molestar: false,
    horario_no_molestar_inicio: "22:00",
    horario_no_molestar_fin: "07:00",
    pausar_alertas_en_llamada: true,
    pausar_alertas_en_reunion: true,
  });

  const [seccionActiva, setSeccionActiva] = useState<string>("notificaciones");
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // 🔄 EFECTOS Y CICLO DE VIDA
  // ========================================

  useEffect(() => {
    cargarConfiguracionLocal();
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarConfiguracionAlertas();
      cargarEstadisticas();
    }
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ========================================
  // 📥 FUNCIONES DE CARGA DE DATOS
  // ========================================

  const cargarConfiguracionLocal = () => {
    if (typeof window === "undefined") return;

    const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
    if (temaGuardado && TEMAS[temaGuardado]) {
      setTemaActual(temaGuardado);
    }
  };

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
          mostrarNotificacion(
            "error",
            "Acceso Denegado",
            `Este panel es solo para técnicos.`
          );
          window.location.href = "/";
          return;
        }

        if (!result.usuario.tecnico) {
          mostrarNotificacion(
            "error",
            "Configuración Incompleta",
            "Tu usuario no está vinculado a un registro de técnico."
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
      mostrarNotificacion("error", "Error de Sesión", "Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarConfiguracionAlertas = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/alertas/configuracion?id_tecnico=${usuario.tecnico.id_tecnico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.configuracion) {
        setConfiguracion(data.configuracion);
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error);
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
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // ========================================
  // 🎬 ACCIONES DE USUARIO
  // ========================================

  const guardarConfiguracion = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setGuardando(true);

      const res = await fetch(
        `/api/tecnico/alertas/configuracion`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id_tecnico: usuario.tecnico.id_tecnico,
            configuracion,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al guardar configuración");
      }

      mostrarNotificacion(
        "success",
        "Configuración Guardada",
        "Tus preferencias de alertas se guardaron correctamente"
      );

      setCambiosPendientes(false);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      mostrarNotificacion(
        "error",
        "Error",
        "No se pudo guardar la configuración"
      );
    } finally {
      setGuardando(false);
    }
  };

  const restaurarConfiguracionPredeterminada = () => {
    if (confirm("¿Estás seguro de restaurar la configuración predeterminada? Se perderán todos los cambios personalizados.")) {
      setConfiguracion({
        notificaciones_email: true,
        notificaciones_sms: false,
        notificaciones_push: true,
        notificaciones_desktop: true,
        notificaciones_sonido: true,
        notificaciones_vibracion: true,
        prioridad_minima_notificar: "media",
        alertas_criticas_inmediatas: true,
        alertas_fuera_horario: false,
        tipos_alerta_activos: ["equipo_falla", "mantenimiento_vencido", "ticket_urgente", "equipo_critico"],
        horario_notificaciones_inicio: "08:00",
        horario_notificaciones_fin: "18:00",
        notificar_fines_semana: false,
        notificar_feriados: false,
        frecuencia_resumen_email: "diario",
        agrupar_notificaciones: true,
        tiempo_agrupacion_minutos: 5,
        filtrar_por_ubicacion: false,
        ubicaciones_monitoreadas: [],
        filtrar_por_equipo: false,
        equipos_monitoreados: [],
        filtrar_por_servicio: false,
        servicios_monitoreados: [],
        auto_escalar_sin_respuesta: true,
        tiempo_auto_escalamiento_minutos: 30,
        notificar_supervisor_criticas: true,
        mostrar_alertas_resueltas: true,
        tiempo_ocultar_resueltas_horas: 24,
        alertas_por_pagina: 20,
        vista_predeterminada: "tarjetas",
        sonido_alerta_critica: "urgent",
        sonido_alerta_alta: "alert",
        sonido_alerta_media: "notification",
        volumen_notificaciones: 70,
        modo_no_molestar: false,
        horario_no_molestar_inicio: "22:00",
        horario_no_molestar_fin: "07:00",
        pausar_alertas_en_llamada: true,
        pausar_alertas_en_reunion: true,
      });
      setCambiosPendientes(true);
      mostrarNotificacion("info", "Configuración Restaurada", "Se aplicó la configuración predeterminada");
    }
  };

  const probarNotificacion = async (tipo: "desktop" | "sonido" | "email" | "sms") => {
    try {
      const res = await fetch(`/api/tecnico/alertas/probar-notificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_tecnico: usuario?.tecnico?.id_tecnico,
          tipo,
        }),
      });

      if (res.ok) {
        mostrarNotificacion("success", "Prueba Enviada", `Se envió una notificación de prueba por ${tipo}`);
      } else {
        throw new Error("Error al enviar prueba");
      }
    } catch (error) {
      console.error("Error al probar notificación:", error);
      mostrarNotificacion("error", "Error", "No se pudo enviar la notificación de prueba");
    }
  };

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
        mostrarNotificacion(
          "success",
          "Disponibilidad Actualizada",
          `Tu estado cambió a: ${nuevoEstado}`
        );
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      mostrarNotificacion("error", "Error", "No se pudo actualizar tu disponibilidad");
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

  // ========================================
  // 🔔 SISTEMA DE NOTIFICACIONES
  // ========================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "warning" | "info",
    titulo: string,
    mensaje: string
  ) => {
    console.log(`[${tipo.toUpperCase()}] ${titulo}: ${mensaje}`);
    // Implementar sistema de toast real aquí
  };

  // ========================================
  // 🛠️ FUNCIONES AUXILIARES
  // ========================================

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 6) return "Buenas madrugadas";
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const actualizarConfiguracion = (campo: keyof ConfiguracionAlertas, valor: any) => {
    setConfiguracion((prev) => ({ ...prev, [campo]: valor }));
    setCambiosPendientes(true);
  };

  const toggleTipoAlerta = (tipo: string) => {
    setConfiguracion((prev) => {
      const nuevos = prev.tipos_alerta_activos.includes(tipo)
        ? prev.tipos_alerta_activos.filter((t) => t !== tipo)
        : [...prev.tipos_alerta_activos, tipo];
      
      return { ...prev, tipos_alerta_activos: nuevos };
    });
    setCambiosPendientes(true);
  };

  // ========================================
  // 🎨 RENDER - LOADING
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
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Configuración
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando tus preferencias de alertas...
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
            className={`w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a la configuración de alertas.
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
  // 🎨 RENDER PRINCIPAL
  // ========================================

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
          {/* Breadcrumb */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/tecnico/"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
              >
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Link
                href="/tecnico/alertas"
                className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-colors`}
              >
                Alertas
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                Configuración
              </span>
            </div>

            <h1 className={`text-2xl font-black ${tema.colores.texto}`}>
              ⚙️ Configuración de Alertas
            </h1>
          </div>

          {/* Acciones Header */}
          <div className="flex items-center gap-3">
            {/* Selector de tema */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 max-h-96 overflow-y-auto custom-scrollbar`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  🎨 Seleccionar Tema
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
                      <div className="text-left">
                        <p className="font-bold">{t.nombre}</p>
                        <p className="text-xs opacity-80">{t.descripcion}</p>
                      </div>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  disponibilidad === "disponible"
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
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
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
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
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.tecnico?.tipo_tecnico}
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
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
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
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
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

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-32 p-8`}
      >
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
              >
                {obtenerSaludo()}, {usuario.nombre}
                <span className="inline-block">⚙️</span>
              </h2>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Personaliza cómo y cuándo recibes tus alertas técnicas
              </p>
              {usuario.tecnico && (
                <div className="flex items-center gap-4 mt-3">
                  <p
                    className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}
                  >
                    <MapPin className="w-4 h-4" />
                    {usuario.tecnico.centro?.nombre ?? "Centro no definido"} •{" "}
                    {usuario.tecnico.area_tecnica ?? "Área no definida"}
                  </p>
                  {cambiosPendientes && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse">
                      ⚠️ Cambios sin guardar
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={restaurarConfiguracionPredeterminada}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <RotateCw className="w-5 h-5" />
                Restaurar
              </button>

              <button
                onClick={guardarConfiguracion}
                disabled={!cambiosPendientes || guardando}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido con navegación lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navegación lateral */}
          <div className="lg:col-span-1">
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} sticky top-32`}
            >
              <h3 className={`text-lg font-black mb-4 ${tema.colores.texto}`}>
                Secciones
              </h3>
              <nav className="space-y-2">
                {[
                  { id: "notificaciones", label: "Notificaciones", icon: Bell },
                  { id: "prioridades", label: "Prioridades", icon: Target },
                  { id: "tipos", label: "Tipos de Alerta", icon: Sliders },
                  { id: "horarios", label: "Horarios", icon: Clock },
                  { id: "frecuencia", label: "Frecuencia", icon: Calendar },
                  { id: "filtros", label: "Filtros Avanzados", icon: Filter },
                  { id: "escalamiento", label: "Escalamiento", icon: TrendingUp },
                  { id: "interfaz", label: "Interfaz", icon: Monitor },
                  { id: "sonidos", label: "Sonidos", icon: Volume2 },
                  { id: "avanzado", label: "Avanzado", icon: Shield },
                ].map((seccion) => (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      seccionActiva === seccion.id
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <seccion.icon className="w-5 h-5" />
                    <span>{seccion.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sección: Notificaciones */}
            {seccionActiva === "notificaciones" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Bell className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🔔 Canales de Notificación
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Configura cómo deseas recibir las alertas
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificaciones por Email
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Recibe alertas en tu correo electrónico
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => probarNotificacion("email")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        Probar
                      </button>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "notificaciones_email",
                            !configuracion.notificaciones_email
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.notificaciones_email
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.notificaciones_email
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* SMS */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificaciones por SMS
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Recibe alertas críticas por mensaje de texto
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => probarNotificacion("sms")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        Probar
                      </button>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "notificaciones_sms",
                            !configuracion.notificaciones_sms
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.notificaciones_sms
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.notificaciones_sms
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Push */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <BellRing className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificaciones Push
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Recibe notificaciones en tu navegador
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "notificaciones_push",
                          !configuracion.notificaciones_push
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.notificaciones_push
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.notificaciones_push
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Desktop */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificaciones de Escritorio
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Muestra alertas en tu escritorio
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => probarNotificacion("desktop")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        Probar
                      </button>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "notificaciones_desktop",
                            !configuracion.notificaciones_desktop
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.notificaciones_desktop
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.notificaciones_desktop
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Sonido */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Sonido de Notificaciones
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Reproduce un sonido al recibir alertas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => probarNotificacion("sonido")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        Probar
                      </button>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "notificaciones_sonido",
                            !configuracion.notificaciones_sonido
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.notificaciones_sonido
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.notificaciones_sonido
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Vibración */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-pink-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Vibración (Móvil)
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Vibra el dispositivo al recibir alertas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "notificaciones_vibracion",
                          !configuracion.notificaciones_vibracion
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.notificaciones_vibracion
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.notificaciones_vibracion
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Prioridades */}
            {seccionActiva === "prioridades" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🎯 Configuración de Prioridades
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Define qué alertas son más importantes para ti
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Prioridad mínima */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                      Prioridad Mínima para Notificar
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: "baja", label: "Baja", color: "from-green-500 to-emerald-500" },
                        { value: "media", label: "Media", color: "from-yellow-500 to-orange-500" },
                        { value: "alta", label: "Alta", color: "from-orange-500 to-red-500" },
                        { value: "critica", label: "Crítica", color: "from-red-500 to-rose-600" },
                      ].map((prioridad) => (
                        <button
                          key={prioridad.value}
                          onClick={() =>
                            actualizarConfiguracion(
                              "prioridad_minima_notificar",
                              prioridad.value as any
                            )
                          }
                          className={`p-4 rounded-xl font-bold transition-all duration-300 ${
                            configuracion.prioridad_minima_notificar === prioridad.value
                              ? `bg-gradient-to-br ${prioridad.color} text-white shadow-lg scale-105`
                              : `${tema.colores.secundario} ${tema.colores.texto}`
                          }`}
                        >
                          {prioridad.label}
                        </button>
                      ))}
                    </div>
                    <p className={`text-xs mt-2 ${tema.colores.textoSecundario}`}>
                      Solo recibirás notificaciones de alertas con esta prioridad o superior
                    </p>
                  </div>

                  {/* Alertas críticas inmediatas */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-red-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Alertas Críticas Inmediatas
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Notifica instantáneamente las alertas críticas sin demora
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "alertas_criticas_inmediatas",
                          !configuracion.alertas_criticas_inmediatas
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.alertas_criticas_inmediatas
                          ? "bg-red-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.alertas_criticas_inmediatas
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Alertas fuera de horario */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificar Fuera de Horario
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Recibe alertas incluso fuera de tu horario laboral
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "alertas_fuera_horario",
                          !configuracion.alertas_fuera_horario
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.alertas_fuera_horario
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.alertas_fuera_horario
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Tipos de Alerta */}
            {seccionActiva === "tipos" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Sliders className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      📋 Tipos de Alerta Activos
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Selecciona qué tipos de alertas deseas recibir
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TIPOS_ALERTA_DISPONIBLES.map((tipo) => {
                    const Icono = tipo.icon;
                    const activo = configuracion.tipos_alerta_activos.includes(tipo.value);

                    return (
                      <button
                        key={tipo.value}
                        onClick={() => toggleTipoAlerta(tipo.value)}
                        className={`p-4 rounded-xl transition-all duration-300 ${
                          activo
                            ? `bg-gradient-to-br from-${tipo.color}-500 to-${tipo.color}-600 text-white shadow-lg scale-105`
                            : `${tema.colores.secundario} ${tema.colores.texto}`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              activo ? "bg-white/20" : "bg-gray-500/20"
                            }`}
                          >
                            <Icono className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold">{tipo.label}</p>
                            <p className={`text-xs ${activo ? "text-white/80" : tema.colores.textoSecundario}`}>
                              {activo ? "Activo" : "Inactivo"}
                            </p>
                          </div>
                          {activo && <Check className="w-5 h-5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className={`mt-4 p-4 rounded-xl ${tema.colores.info} border ${tema.colores.borde}`}>
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                        💡 Recomendación
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Te recomendamos mantener activos al menos "Equipo en Falla", "Equipo Crítico" y "Sistema Caído" para no perder alertas importantes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Horarios */}
            {seccionActiva === "horarios" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      ⏰ Horarios de Notificación
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Define cuándo deseas recibir notificaciones
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Horario de inicio */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={configuracion.horario_notificaciones_inicio}
                      onChange={(e) =>
                        actualizarConfiguracion(
                          "horario_notificaciones_inicio",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold`}
                    />
                  </div>

                  {/* Horario de fin */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={configuracion.horario_notificaciones_fin}
                      onChange={(e) =>
                        actualizarConfiguracion(
                          "horario_notificaciones_fin",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold`}
                    />
                  </div>

                  {/* Fines de semana */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificar en Fines de Semana
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Recibe alertas los sábados y domingos
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "notificar_fines_semana",
                          !configuracion.notificar_fines_semana
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.notificar_fines_semana
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.notificar_fines_semana
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Feriados */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificar en Feriados
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Recibe alertas en días festivos
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "notificar_feriados",
                          !configuracion.notificar_feriados
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.notificar_feriados
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.notificar_feriados
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Información del turno del técnico */}
                  {usuario.tecnico && (
                    <div
                      className={`p-4 rounded-xl ${tema.colores.info} border ${tema.colores.borde}`}
                    >
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                            📋 Tu Turno Laboral
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Turno: <strong className="capitalize">{usuario.tecnico.turno}</strong>
                            {usuario.tecnico.hora_inicio && usuario.tecnico.hora_fin && (
                              <> • Horario: {usuario.tecnico.hora_inicio} - {usuario.tecnico.hora_fin}</>
                            )}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                            Zona horaria: {usuario.tecnico.zona_horaria}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Frecuencia */}
            {seccionActiva === "frecuencia" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      📊 Frecuencia y Agrupación
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Controla la frecuencia de las notificaciones
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Frecuencia de resumen */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                      Frecuencia de Resumen por Email
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: "nunca", label: "Nunca" },
                        { value: "diario", label: "Diario" },
                        { value: "semanal", label: "Semanal" },
                        { value: "mensual", label: "Mensual" },
                      ].map((frecuencia) => (
                        <button
                          key={frecuencia.value}
                          onClick={() =>
                            actualizarConfiguracion(
                              "frecuencia_resumen_email",
                              frecuencia.value as any
                            )
                          }
                          className={`p-4 rounded-xl font-bold transition-all duration-300 ${
                            configuracion.frecuencia_resumen_email === frecuencia.value
                              ? `bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg scale-105`
                              : `${tema.colores.secundario} ${tema.colores.texto}`
                          }`}
                        >
                          {frecuencia.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agrupar notificaciones */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Agrupar Notificaciones
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Agrupa múltiples alertas en una sola notificación
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "agrupar_notificaciones",
                          !configuracion.agrupar_notificaciones
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.agrupar_notificaciones
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.agrupar_notificaciones
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tiempo de agrupación */}
                  {configuracion.agrupar_notificaciones && (
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                        Tiempo de Agrupación (minutos)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="60"
                          value={configuracion.tiempo_agrupacion_minutos}
                          onChange={(e) =>
                            actualizarConfiguracion(
                              "tiempo_agrupacion_minutos",
                              parseInt(e.target.value)
                            )
                          }
                          className="flex-1"
                        />
                        <span
                          className={`text-2xl font-black ${tema.colores.texto} min-w-[60px] text-right`}
                        >
                          {configuracion.tiempo_agrupacion_minutos}m
                        </span>
                      </div>
                      <p className={`text-xs mt-2 ${tema.colores.textoSecundario}`}>
                        Las alertas que lleguen en este período se agruparán en una sola notificación
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Filtros Avanzados */}
            {seccionActiva === "filtros" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Filter className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🔍 Filtros Avanzados
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Filtra alertas por ubicación, equipo o servicio
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Filtrar por ubicación */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`text-sm font-bold ${tema.colores.texto}`}>
                        Filtrar por Ubicación
                      </label>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "filtrar_por_ubicacion",
                            !configuracion.filtrar_por_ubicacion
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.filtrar_por_ubicacion
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.filtrar_por_ubicacion
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {configuracion.filtrar_por_ubicacion && (
                      <div>
                        <input
                          type="text"
                          placeholder="Agregar ubicación y presionar Enter..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              actualizarConfiguracion("ubicaciones_monitoreadas", [
                                ...configuracion.ubicaciones_monitoreadas,
                                e.currentTarget.value.trim(),
                              ]);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {configuracion.ubicaciones_monitoreadas.map((ubicacion, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-bold ${tema.colores.info} flex items-center gap-2`}
                            >
                              <MapPin className="w-3 h-3" />
                              {ubicacion}
                              <button
                                onClick={() =>
                                  actualizarConfiguracion(
                                    "ubicaciones_monitoreadas",
                                    configuracion.ubicaciones_monitoreadas.filter(
                                      (_, i) => i !== index
                                    )
                                  )
                                }
                                className="hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filtrar por equipo */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`text-sm font-bold ${tema.colores.texto}`}>
                        Filtrar por Equipo
                      </label>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "filtrar_por_equipo",
                            !configuracion.filtrar_por_equipo
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.filtrar_por_equipo
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.filtrar_por_equipo
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {configuracion.filtrar_por_equipo && (
                      <div>
                        <input
                          type="text"
                          placeholder="Agregar equipo y presionar Enter..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              actualizarConfiguracion("equipos_monitoreados", [
                                ...configuracion.equipos_monitoreados,
                                e.currentTarget.value.trim(),
                              ]);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {configuracion.equipos_monitoreados.map((equipo, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-bold ${tema.colores.warning} flex items-center gap-2`}
                            >
                              <HardDrive className="w-3 h-3" />
                              {equipo}
                              <button
                                onClick={() =>
                                  actualizarConfiguracion(
                                    "equipos_monitoreados",
                                    configuracion.equipos_monitoreados.filter(
                                      (_, i) => i !== index
                                    )
                                  )
                                }
                                className="hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filtrar por servicio */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className={`text-sm font-bold ${tema.colores.texto}`}>
                        Filtrar por Servicio
                      </label>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "filtrar_por_servicio",
                            !configuracion.filtrar_por_servicio
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.filtrar_por_servicio
                            ? "bg-green-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.filtrar_por_servicio
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {configuracion.filtrar_por_servicio && (
                      <div>
                        <input
                          type="text"
                          placeholder="Agregar servicio y presionar Enter..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              actualizarConfiguracion("servicios_monitoreados", [
                                ...configuracion.servicios_monitoreados,
                                e.currentTarget.value.trim(),
                              ]);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {configuracion.servicios_monitoreados.map((servicio, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-bold ${tema.colores.success} flex items-center gap-2`}
                            >
                              <Server className="w-3 h-3" />
                              {servicio}
                              <button
                                onClick={() =>
                                  actualizarConfiguracion(
                                    "servicios_monitoreados",
                                    configuracion.servicios_monitoreados.filter(
                                      (_, i) => i !== index
                                    )
                                  )
                                }
                                className="hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Escalamiento */}
            {seccionActiva === "escalamiento" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      📈 Escalamiento Automático
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Configura el escalamiento de alertas sin respuesta
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Auto escalar */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Escalamiento Automático
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Escala alertas sin respuesta automáticamente
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "auto_escalar_sin_respuesta",
                          !configuracion.auto_escalar_sin_respuesta
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.auto_escalar_sin_respuesta
                          ? "bg-orange-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.auto_escalar_sin_respuesta
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tiempo de escalamiento */}
                  {configuracion.auto_escalar_sin_respuesta && (
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                        Tiempo para Auto-Escalamiento (minutos)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="5"
                          value={configuracion.tiempo_auto_escalamiento_minutos}
                          onChange={(e) =>
                            actualizarConfiguracion(
                              "tiempo_auto_escalamiento_minutos",
                              parseInt(e.target.value)
                            )
                          }
                          className="flex-1"
                        />
                        <span
                          className={`text-2xl font-black ${tema.colores.texto} min-w-[80px] text-right`}
                        >
                          {configuracion.tiempo_auto_escalamiento_minutos}m
                        </span>
                      </div>
                      <p className={`text-xs mt-2 ${tema.colores.textoSecundario}`}>
                        Si no respondes en este tiempo, la alerta se escalará automáticamente
                      </p>
                    </div>
                  )}

                  {/* Notificar supervisor */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Notificar Supervisor en Críticas
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Notifica a tu supervisor cuando recibas alertas críticas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "notificar_supervisor_criticas",
                          !configuracion.notificar_supervisor_criticas
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.notificar_supervisor_criticas
                          ? "bg-purple-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.notificar_supervisor_criticas
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Interfaz */}
            {seccionActiva === "interfaz" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Monitor className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🖥️ Preferencias de Interfaz
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Personaliza cómo se muestran las alertas
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mostrar alertas resueltas */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Mostrar Alertas Resueltas
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Muestra alertas resueltas en el listado principal
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "mostrar_alertas_resueltas",
                          !configuracion.mostrar_alertas_resueltas
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.mostrar_alertas_resueltas
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.mostrar_alertas_resueltas
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tiempo ocultar resueltas */}
                  {configuracion.mostrar_alertas_resueltas && (
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                        Ocultar Resueltas Después de (horas)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="168"
                          value={configuracion.tiempo_ocultar_resueltas_horas}
                          onChange={(e) =>
                            actualizarConfiguracion(
                              "tiempo_ocultar_resueltas_horas",
                              parseInt(e.target.value)
                            )
                          }
                          className="flex-1"
                        />
                        <span
                          className={`text-2xl font-black ${tema.colores.texto} min-w-[80px] text-right`}
                        >
                          {configuracion.tiempo_ocultar_resueltas_horas}h
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Alertas por página */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Alertas por Página
                    </label>
                    <select
                      value={configuracion.alertas_por_pagina}
                      onChange={(e) =>
                        actualizarConfiguracion(
                          "alertas_por_pagina",
                          parseInt(e.target.value)
                        )
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold cursor-pointer`}
                    >
                      <option value="10">10 alertas</option>
                      <option value="20">20 alertas</option>
                      <option value="50">50 alertas</option>
                      <option value="100">100 alertas</option>
                    </select>
                  </div>

                  {/* Vista predeterminada */}
                  <div>
                    <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                      Vista Predeterminada
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "tarjetas", label: "Tarjetas", icon: Box },
                        { value: "lista", label: "Lista", icon: Layers },
                        { value: "tabla", label: "Tabla", icon: BarChart3 },
                      ].map((vista) => {
                        const Icono = vista.icon;
                        return (
                          <button
                            key={vista.value}
                            onClick={() =>
                              actualizarConfiguracion(
                                "vista_predeterminada",
                                vista.value as any
                              )
                            }
                            className={`p-4 rounded-xl font-bold transition-all duration-300 flex flex-col items-center gap-2 ${
                              configuracion.vista_predeterminada === vista.value
                                ? `bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-105`
                                : `${tema.colores.secundario} ${tema.colores.texto}`
                            }`}
                          >
                            <Icono className="w-6 h-6" />
                            {vista.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Sonidos */}
            {seccionActiva === "sonidos" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Volume2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🔊 Configuración de Sonidos
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Personaliza los sonidos de notificación
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Sonido alerta crítica */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Sonido para Alertas Críticas
                    </label>
                    <select
                      value={configuracion.sonido_alerta_critica}
                      onChange={(e) =>
                        actualizarConfiguracion("sonido_alerta_critica", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold cursor-pointer`}
                    >
                      {SONIDOS_DISPONIBLES.map((sonido) => (
                        <option key={sonido.value} value={sonido.value}>
                          {sonido.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sonido alerta alta */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Sonido para Alertas de Prioridad Alta
                    </label>
                    <select
                      value={configuracion.sonido_alerta_alta}
                      onChange={(e) =>
                        actualizarConfiguracion("sonido_alerta_alta", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold cursor-pointer`}
                    >
                      {SONIDOS_DISPONIBLES.map((sonido) => (
                        <option key={sonido.value} value={sonido.value}>
                          {sonido.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sonido alerta media */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Sonido para Alertas de Prioridad Media
                    </label>
                    <select
                      value={configuracion.sonido_alerta_media}
                      onChange={(e) =>
                        actualizarConfiguracion("sonido_alerta_media", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold cursor-pointer`}
                    >
                      {SONIDOS_DISPONIBLES.map((sonido) => (
                        <option key={sonido.value} value={sonido.value}>
                          {sonido.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Volumen */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto}`}>
                      Volumen de Notificaciones
                    </label>
                    <div className="flex items-center gap-4">
                      {configuracion.volumen_notificaciones === 0 ? (
                        <VolumeX className="w-6 h-6 text-gray-500" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-pink-500" />
                      )}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={configuracion.volumen_notificaciones}
                        onChange={(e) =>
                          actualizarConfiguracion(
                            "volumen_notificaciones",
                            parseInt(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                      <span
                        className={`text-2xl font-black ${tema.colores.texto} min-w-[60px] text-right`}
                      >
                        {configuracion.volumen_notificaciones}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Avanzado */}
            {seccionActiva === "avanzado" && (
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-fade-in-up`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      🛡️ Configuración Avanzada
                    </h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      Opciones avanzadas de gestión de alertas
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Modo No Molestar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className={`font-bold ${tema.colores.texto}`}>
                            Modo No Molestar
                          </p>
                          <p className={`text-sm ${tema.colores.textoSecundario}`}>
                            Silencia todas las notificaciones en horario específico
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          actualizarConfiguracion(
                            "modo_no_molestar",
                            !configuracion.modo_no_molestar
                          )
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          configuracion.modo_no_molestar
                            ? "bg-purple-600"
                            : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            configuracion.modo_no_molestar
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {configuracion.modo_no_molestar && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}>
                            Hora de Inicio
                          </label>
                          <input
                            type="time"
                            value={configuracion.horario_no_molestar_inicio}
                            onChange={(e) =>
                              actualizarConfiguracion(
                                "horario_no_molestar_inicio",
                                e.target.value
                              )
                            }
                            className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ${tema.colores.texto}`}>
                            Hora de Fin
                          </label>
                          <input
                            type="time"
                            value={configuracion.horario_no_molestar_fin}
                            onChange={(e) =>
                              actualizarConfiguracion(
                                "horario_no_molestar_fin",
                                e.target.value
                              )
                            }
                            className={`w-full px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border ${tema.colores.texto} font-semibold`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pausar en llamada */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Pausar Alertas en Llamada
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          No mostrar alertas mientras estás en una llamada
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "pausar_alertas_en_llamada",
                          !configuracion.pausar_alertas_en_llamada
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.pausar_alertas_en_llamada
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.pausar_alertas_en_llamada
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Pausar en reunión */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.secundario} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          Pausar Alertas en Reunión
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          No mostrar alertas mientras estás en una reunión
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        actualizarConfiguracion(
                          "pausar_alertas_en_reunion",
                          !configuracion.pausar_alertas_en_reunion
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        configuracion.pausar_alertas_en_reunion
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          configuracion.pausar_alertas_en_reunion
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Información adicional */}
                  <div
                    className={`p-4 rounded-xl ${tema.colores.warning} border ${tema.colores.borde}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
                      <div>
                        <p className={`text-sm font-bold mb-1 ${tema.colores.texto}`}>
                          ⚠️ Importante
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Las alertas críticas siempre se mostrarán, incluso con estas opciones activadas, para garantizar que no pierdas información importante.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de configuración */}
        <div
          className={`mt-8 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
            >
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                📊 Resumen de tu Configuración
              </h3>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Vista general de tus preferencias actuales
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Canales activos */}
            <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <p className={`font-bold ${tema.colores.texto}`}>Canales Activos</p>
              </div>
              <p className={`text-2xl font-black ${tema.colores.texto}`}>
                {[
                  configuracion.notificaciones_email,
                  configuracion.notificaciones_sms,
                  configuracion.notificaciones_push,
                  configuracion.notificaciones_desktop,
                  configuracion.notificaciones_sonido,
                  configuracion.notificaciones_vibracion,
                ].filter(Boolean).length}
                /6
              </p>
            </div>

            {/* Tipos de alerta */}
            <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <p className={`font-bold ${tema.colores.texto}`}>Tipos Activos</p>
              </div>
              <p className={`text-2xl font-black ${tema.colores.texto}`}>
                {configuracion.tipos_alerta_activos.length}/{TIPOS_ALERTA_DISPONIBLES.length}
              </p>
            </div>

            {/* Prioridad mínima */}
            <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-red-400" />
                <p className={`font-bold ${tema.colores.texto}`}>Prioridad Mínima</p>
              </div>
              <p className={`text-2xl font-black ${tema.colores.texto} capitalize`}>
                {configuracion.prioridad_minima_notificar}
              </p>
            </div>

            {/* Horario */}
            <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <p className={`font-bold ${tema.colores.texto}`}>Horario</p>
              </div>
              <p className={`text-lg font-black ${tema.colores.texto}`}>
                {configuracion.horario_notificaciones_inicio} -{" "}
                {configuracion.horario_notificaciones_fin}
              </p>
            </div>
          </div>

          {/* Estadísticas del técnico */}
          {usuario.tecnico && (
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <h4 className={`text-lg font-black mb-4 ${tema.colores.texto}`}>
                👤 Información del Técnico
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Área Técnica
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.tecnico.area_tecnica}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Tipo de Técnico
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto} capitalize`}>
                    {usuario.tecnico.tipo_tecnico}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Turno
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto} capitalize`}>
                    {usuario.tecnico.turno}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Nivel de Acceso
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto} capitalize`}>
                    {usuario.tecnico.nivel_acceso}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Tickets Resueltos
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.tecnico.tickets_resueltos}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Tiempo Promedio
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.tecnico.tiempo_promedio_resolucion} min
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Calificación
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
  {(usuario?.tecnico?.calificacion_promedio ?? 0).toFixed(1)}
</p>

                  </div>
                </div>
                <div>
                  <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                    Estado
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                      usuario.tecnico.estado === "activo"
                        ? tema.colores.success
                        : tema.colores.error
                    }`}
                  >
                    {usuario.tecnico.estado}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div
          className={`mt-8 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <h3 className={`text-xl font-black mb-4 ${tema.colores.texto}`}>
            ⚡ Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => probarNotificacion("desktop")}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Monitor className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Probar Desktop</span>
            </button>

            <button
              onClick={() => probarNotificacion("email")}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Probar Email</span>
            </button>

            <button
              onClick={() => probarNotificacion("sms")}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Smartphone className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Probar SMS</span>
            </button>

            <button
              onClick={() => probarNotificacion("sonido")}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Probar Sonido</span>
            </button>

            <button
              onClick={restaurarConfiguracionPredeterminada}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <RotateCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-sm font-bold">Restaurar</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(configuracion, null, 2));
                mostrarNotificacion("success", "Copiado", "Configuración copiada al portapapeles");
              }}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Copy className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Copiar Config</span>
            </button>

            <button
              onClick={() => {
                const dataStr = JSON.stringify(configuracion, null, 2);
                const dataBlob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `config-alertas-${usuario.tecnico?.id_tecnico}.json`;
                link.click();
                URL.revokeObjectURL(url);
                mostrarNotificacion("success", "Descargado", "Configuración descargada");
              }}
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
              <span className="text-sm font-bold">Descargar</span>
            </button>

            <Link
              href="/tecnico/alertas"
              className={`p-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105 flex flex-col items-center gap-2 group`}
            >
              <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Ver Alertas</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`mt-12 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border py-6 px-8 ${tema.colores.sombra}`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                  © 2025 AnyssaMed - Configuración de Alertas Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Sistema de Gestión Avanzada v4.5.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Lightbulb className="w-4 h-4" />
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <Shield className="w-4 h-4" />
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento} flex items-center gap-1`}
              >
                <FileText className="w-4 h-4" />
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

          <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                🌐 Conectado desde: {usuario.tecnico?.region}
              </span>
              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                ⏰ Zona horaria: {usuario.tecnico?.zona_horaria}
              </span>
              {cambiosPendientes && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse">
                  ⚠️ Cambios sin guardar
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  disponibilidad === "disponible"
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : disponibilidad === "ocupado"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}
              >
                {disponibilidad === "disponible"
                  ? "✓ Disponible"
                  : disponibilidad === "ocupado"
                  ? "⏳ Ocupado"
                  : "✕ Fuera de servicio"}
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* Botón flotante de guardar (visible cuando hay cambios) */}
      {cambiosPendientes && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <button
            onClick={guardarConfiguracion}
            disabled={guardando}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-110 shadow-2xl shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
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
          overflow-x: hidden;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%);
        }

        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }

        /* Toggle Switch personalizado */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: linear-gradient(
            to right,
            #6366f1 0%,
            #6366f1 var(--value),
            #374151 var(--value),
            #374151 100%
          );
          outline: none;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        input[type="range"]:hover {
          opacity: 1;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.6);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          border: none;
          transition: all 0.3s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.6);
        }

        /* Animación de bounce mejorada */
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hidden\\.md\\:block {
            display: none;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus visible */
        *:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* Selection */
        ::selection {
          background-color: rgba(99, 102, 241, 0.3);
          color: inherit;
        }
      `}</style>
    </div>
  );
}
                
