"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cpu,
  Clock,
  FileText,
  Home,
  Wifi,
  Lightbulb,
  ChevronLeft,
  LineChart,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  User,
  Wrench,
  X,
  Zap,
  Phone,
  Rocket,
  Shield,
  Award,
  Flame,
  Building2,
  Send,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  CheckSquare,
  Layers,
  Globe,
  Wifi as WifiIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ========================================
// TIPOS
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
    id_centro: number | null;
    id_sucursal: number | null;
    id_departamento: number | null;
    area_tecnica: string;
    tipo_tecnico: string;
    turno: string;
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    pais: string | null;
    region: string | null;
    zona_horaria: string | null;
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    } | null;
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

type TipoTicket =
  | "soporte"
  | "mantenimiento"
  | "ingenieria"
  | "biomedico"
  | "infraestructura";

type PrioridadTicket = "baja" | "media" | "alta" | "critica";

type OrigenTicket =
  | "funcionario"
  | "paciente"
  | "sistema"
  | "monitoreo"
  | "otro";

type CanalTicket =
  | "telefono"
  | "presencial"
  | "whatsapp"
  | "email"
  | "web"
  | "otro";

interface FormTicket {
  titulo: string;
  descripcion: string;
  tipo: TipoTicket;
  prioridad: PrioridadTicket;
  origen: OrigenTicket;
  canal: CanalTicket;
  impacto: "bajo" | "medio" | "alto" | "critico";
  tiempoEstimado: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  telefonoSolicitante: string;
  ubicacion: string;
  equipoAfectado: string;
}

// ========================================
// CONFIGURACIÓN DE TEMAS PREMIUM
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
    icono: Activity,
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

export default function NuevoTicketTecnicoPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [temaActual, setTemaActual] = useState<TemaColor>("cosmic");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

  const [form, setForm] = useState<FormTicket>({
    titulo: "",
    descripcion: "",
    tipo: "soporte",
    prioridad: "media",
    origen: "funcionario",
    canal: "telefono",
    impacto: "medio",
    tiempoEstimado: "30",
    nombreSolicitante: "",
    emailSolicitante: "",
    telefonoSolicitante: "",
    ubicacion: "",
    equipoAfectado: "",
  });

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  // ========================================
  // FUNCIONES
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

        const disp =
          (result.usuario.tecnico
            .disponibilidad as "disponible" | "ocupado" | "fuera_servicio") ||
          "disponible";
        setDisponibilidad(disp);
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

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const actualizarCampo = <K extends keyof FormTicket>(
    campo: K,
    valor: FormTicket[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);

    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setMensajeError("El título y la descripción del ticket son obligatorios.");
      return;
    }

    if (!usuario?.tecnico?.id_tecnico) {
      setMensajeError("No se encontró información del técnico en la sesión.");
      return;
    }

    try {
      setEnviando(true);

      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        prioridad: form.prioridad,
        origen: form.origen,
        canal: form.canal,
        impacto: form.impacto,
        tiempo_estimado_minutos: Number(form.tiempoEstimado) || null,
        nombre_solicitante: form.nombreSolicitante.trim() || null,
        email_solicitante: form.emailSolicitante.trim() || null,
        telefono_solicitante: form.telefonoSolicitante.trim() || null,
        ubicacion: form.ubicacion.trim() || null,
        equipo_afectado: form.equipoAfectado.trim() || null,
        id_tecnico: usuario.tecnico.id_tecnico,
        id_centro: usuario.tecnico.id_centro,
        id_sucursal: usuario.tecnico.id_sucursal,
        id_departamento: usuario.tecnico.id_departamento,
      };

      const res = await fetch("/api/tecnico/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || "Ocurrió un error al crear el ticket."
        );
      }

      const numeroTicket =
        data.ticket?.numero_ticket || data.ticket?.id_ticket || null;

      setMensajeExito(
        numeroTicket
          ? `¡Ticket creado exitosamente! Número: ${numeroTicket}`
          : "¡Ticket creado exitosamente!"
      );

      // Reset del formulario
      setForm({
        titulo: "",
        descripcion: "",
        tipo: "soporte",
        prioridad: "media",
        origen: "funcionario",
        canal: "telefono",
        impacto: "medio",
        tiempoEstimado: "30",
        nombreSolicitante: "",
        emailSolicitante: "",
        telefonoSolicitante: "",
        ubicacion: "",
        equipoAfectado: "",
      });

      // Scroll al inicio para ver el mensaje
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Error al crear ticket:", error);
      setMensajeError(
        error?.message || "No se pudo crear el ticket. Intenta nuevamente."
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setEnviando(false);
    }
  };

  const getChipDisponibilidad = () => {
    const base =
      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-lg transition-all duration-300 hover:scale-105";
    if (disponibilidad === "disponible") {
      return `${base} bg-green-500/20 text-green-300 border-green-500/40`;
    }
    if (disponibilidad === "ocupado") {
      return `${base} bg-yellow-500/20 text-yellow-200 border-yellow-500/40`;
    }
    return `${base} bg-red-500/20 text-red-200 border-red-500/40`;
  };

  const calcularProgresoFormulario = () => {
    let campos = 0;
    let completados = 0;

    // Campos obligatorios
    if (form.titulo.trim()) completados++;
    campos++;
    if (form.descripcion.trim()) completados++;
    campos++;

    // Campos opcionales pero recomendados
    if (form.nombreSolicitante.trim()) completados++;
    campos++;
    if (form.ubicacion.trim()) completados++;
    campos++;
    if (form.equipoAfectado.trim()) completados++;
    campos++;

    return Math.round((completados / campos) * 100);
  };

  // ========================================
  // RENDER: LOADING / SIN PERMISOS
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
              <Wrench className="w-14 h-14 text-white animate-bounce" />
            </div>
          </div>
          <h2 className={`text-5xl font-black mb-4 ${tema.colores.texto} animate-pulse bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}>
            Preparando Módulo Premium
          </h2>
          <p
            className={`text-xl font-bold ${tema.colores.textoSecundario} animate-pulse flex items-center justify-center gap-3`}
          >
            <Sparkles className="w-6 h-6 animate-spin" />
            Cargando formulario extraordinario...
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
            No tienes permisos para crear tickets técnicos.
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

  const progreso = calcularProgresoFormulario();

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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 lg:px-8 py-4 gap-4">
          {/* Breadcrumb + título */}
          <div className="flex-1">
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${tema.colores.textoSecundario} mb-2`}
            >
              <Home className="w-3 h-3" />
              <span>Panel Técnico</span>
              <ChevronRight className="w-3 h-3" />
              <span>Tickets</span>
              <ChevronRight className="w-3 h-3" />
              <span className={tema.colores.acento}>Nuevo Ticket</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1
                className={`text-2xl lg:text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}
              >
                Nuevo Ticket Técnico
                <span className="animate-wave inline-block">📝</span>
              </h1>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`}>
                <Zap className="w-3 h-3" />
                Registro Rápido
              </span>
            </div>
            <p className={`text-sm ${tema.colores.textoSecundario} mt-1`}>
              {obtenerSaludo()}, {usuario.nombre}. Registra un incidente de forma profesional y trazable.
            </p>
          </div>

          {/* Acciones header */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Selector de tema */}
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
                    type="button"
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
                    {temaActual === key && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Alertas */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110`}
              >
                <Bell className="w-5 h-5" />
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} max-h-96 overflow-y-auto z-50 custom-scrollbar`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto} flex items-center gap-2`}
                    >
                      <Bell className="w-5 h-5 animate-swing" />
                      Notificaciones
                    </h3>
                  </div>
                  <div className="p-6 text-center">
                    <BellOff
                      className={`w-10 h-10 mx-auto mb-2 ${tema.colores.textoSecundario} opacity-50`}
                    />
                    <p className={tema.colores.textoSecundario}>
                      Sin notificaciones nuevas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className={getChipDisponibilidad()}>
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  disponibilidad === "disponible"
                    ? "bg-green-400"
                    : disponibilidad === "ocupado"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
              />
              <span className="uppercase">{disponibilidad}</span>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-2 lg:gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:scale-105`}
              >
                <div className="text-right hidden lg:block">
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Técnico Premium
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
                        {usuario.tecnico?.area_tecnica}
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
                      href="/tecnico"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Home className="w-5 h-5" />
                      <span>Panel Técnico</span>
                    </Link>
                    <button
                      type="button"
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

        {/* Barra de progreso */}
        <div className="px-4 lg:px-8 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className={`h-2 rounded-full bg-white/10 overflow-hidden`}>
                <div
                  className={`h-full bg-gradient-to-r ${tema.colores.gradiente} transition-all duration-500 ${tema.colores.glow}`}
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-bold ${tema.colores.texto} min-w-[60px] text-right`}>
              {progreso}% completo
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-32 p-4 lg:p-8 relative z-10`}
      >
        {/* Mensajes de estado */}
        {(mensajeError || mensajeExito) && (
          <div className="mb-6 grid gap-3 animate-fadeIn">
            {mensajeError && (
              <div
                className={`flex items-start gap-3 p-4 lg:p-5 rounded-2xl border border-red-500/40 bg-red-500/10 ${tema.colores.sombra} animate-scaleIn`}
              >
                <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm lg:text-base font-bold text-red-200 mb-1">
                    Error al crear el ticket
                  </p>
                  <p className="text-xs lg:text-sm text-red-100">{mensajeError}</p>
                </div>
                <button
                  onClick={() => setMensajeError(null)}
                  className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-4 h-4 text-red-300" />
                </button>
              </div>
            )}
            {mensajeExito && (
              <div
                className={`flex items-start gap-3 p-4 lg:p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 ${tema.colores.sombra} animate-scaleIn`}
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-300 mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm lg:text-base font-bold text-emerald-200 mb-1">
                    ¡Ticket creado exitosamente!
                  </p>
                  <p className="text-xs lg:text-sm text-emerald-100">{mensajeExito}</p>
                </div>
                <button
                  onClick={() => setMensajeExito(null)}
                  className="p-1 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <X className="w-4 h-4 text-emerald-300" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contenido principal: formulario + resumen */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Columna izquierda (formulario) - 2/3 */}
            <div className="xl:col-span-2 space-y-6">
              {/* Datos principales */}
              <div
                className={`rounded-3xl p-6 lg:p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn`}
              >
                {/* Fondo decorativo */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div
                        className={`w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br ${tema.colores.gradiente} rounded-2xl flex items-center justify-center shadow-2xl ${tema.colores.glow} animate-float`}
                      >
                        <ClipboardList className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                      </div>
                      <div>
                        <h2
                          className={`text-xl lg:text-2xl font-black ${tema.colores.texto}`}
                        >
                          Datos Principales del Ticket
                        </h2>
                        <p
                          className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Define el problema, prioridad y tipo de incidente
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/tecnico/tickets"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Volver a mis tickets</span>
                      <span className="sm:hidden">Volver</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <FileText className="w-4 h-4" />
                        Título del Ticket *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.titulo}
                        onChange={(e) => actualizarCampo("titulo", e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                        placeholder="Ej: Computador de RX no enciende"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Layers className="w-4 h-4" />
                        Tipo de Ticket *
                      </label>
                      <select
                        required
                        value={form.tipo}
                        onChange={(e) =>
                          actualizarCampo("tipo", e.target.value as TipoTicket)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                      >
                        <option value="soporte">🎧 Soporte Técnico</option>
                        <option value="mantenimiento">🔧 Mantenimiento</option>
                        <option value="ingenieria">⚙️ Ingeniería</option>
                        <option value="biomedico">🔬 Biomédico</option>
                        <option value="infraestructura">🏗️ Infraestructura</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Flame className="w-4 h-4" />
                        Prioridad *
                      </label>
                      <select
                        required
                        value={form.prioridad}
                        onChange={(e) =>
                          actualizarCampo(
                            "prioridad",
                            e.target.value as PrioridadTicket
                          )
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                      >
                        <option value="baja">🟢 Baja</option>
                        <option value="media">🟡 Media</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="critica">🔥 Crítica</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Target className="w-4 h-4" />
                        Impacto en el Servicio
                      </label>
                      <select
                        value={form.impacto}
                        onChange={(e) =>
                          actualizarCampo(
                            "impacto",
                            e.target.value as FormTicket["impacto"]
                          )
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                      >
                        <option value="bajo">Bajo (pocos usuarios)</option>
                        <option value="medio">Medio (un área)</option>
                        <option value="alto">Alto (varios servicios)</option>
                        <option value="critico">Crítico (servicio detenido)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Clock className="w-4 h-4" />
                        Tiempo Estimado (minutos)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={480}
                        value={form.tiempoEstimado}
                        onChange={(e) =>
                          actualizarCampo("tiempoEstimado", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <MessageSquare className="w-4 h-4" />
                        Descripción Detallada *
                      </label>
                      <textarea
                        required
                        value={form.descripcion}
                        onChange={(e) =>
                          actualizarCampo("descripcion", e.target.value)
                        }
                        rows={5}
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300 resize-none custom-scrollbar`}
                        placeholder="Describe el problema, mensajes de error, acciones previas realizadas, equipos involucrados, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Origen, canal, equipo */}
              <div
                className={`rounded-3xl p-6 lg:p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn`}
                style={{ animationDelay: '0.1s' }}
              >
                {/* Fondo decorativo */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 lg:gap-4 mb-6">
                    <div
                      className={`w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-float`}
                    >
                      <Phone className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2
                        className={`text-xl lg:text-2xl font-black ${tema.colores.texto}`}
                      >
                        Origen y Canal del Requerimiento
                      </h2>
                      <p
                        className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Registra cómo se generó el ticket y el equipo afectado
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <User className="w-4 h-4" />
                        Origen del Requerimiento
                      </label>
                      <select
                        value={form.origen}
                        onChange={(e) =>
                          actualizarCampo(
                            "origen",
                            e.target.value as OrigenTicket
                          )
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                      >
                        <option value="funcionario">👤 Funcionario</option>
                        <option value="paciente">🏥 Paciente</option>
                        <option value="sistema">💻 Sistema</option>
                        <option value="monitoreo">📊 Monitoreo</option>
                        <option value="otro">📋 Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <WifiIcon className="w-4 h-4" />
                        Canal de Ingreso
                      </label>
                      <select
                        value={form.canal}
                        onChange={(e) =>
                          actualizarCampo(
                            "canal",
                            e.target.value as CanalTicket
                          )
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                      >
                        <option value="telefono">📞 Teléfono</option>
                        <option value="presencial">🚶 Presencial</option>
                        <option value="whatsapp">💬 WhatsApp</option>
                        <option value="email">📧 Correo electrónico</option>
                        <option value="web">🌐 Portal web</option>
                        <option value="otro">📝 Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Cpu className="w-4 h-4" />
                        Equipo / Sistema Afectado
                      </label>
                      <input
                        type="text"
                        value={form.equipoAfectado}
                        onChange={(e) =>
                          actualizarCampo("equipoAfectado", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                        placeholder="Ej: RX-01, PC recepción, servidor..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos del solicitante */}
              <div
                className={`rounded-3xl p-6 lg:p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn`}
                style={{ animationDelay: '0.2s' }}
              >
                {/* Fondo decorativo */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 lg:gap-4 mb-6">
                    <div
                      className={`w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-float`}
                    >
                      <User className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                    </div>
                    <div>
                      <h2
                        className={`text-xl lg:text-2xl font-black ${tema.colores.texto}`}
                      >
                        Datos del Solicitante
                      </h2>
                      <p
                        className={`text-xs lg:text-sm font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Opcional, pero recomendado para trazabilidad y contacto
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <User className="w-4 h-4" />
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={form.nombreSolicitante}
                        onChange={(e) =>
                          actualizarCampo("nombreSolicitante", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Mail className="w-4 h-4" />
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={form.emailSolicitante}
                        onChange={(e) =>
                          actualizarCampo("emailSolicitante", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                        placeholder="ejemplo@centro.cl"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <Phone className="w-4 h-4" />
                        Teléfono / Anexo
                      </label>
                      <input
                        type="text"
                        value={form.telefonoSolicitante}
                        onChange={(e) =>
                          actualizarCampo("telefonoSolicitante", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                        placeholder="+56 9 ..."
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                        <MapPin className="w-4 h-4" />
                        Ubicación Física
                      </label>
                      <input
                        type="text"
                        value={form.ubicacion}
                        onChange={(e) =>
                          actualizarCampo("ubicacion", e.target.value)
                        }
                        className={`w-full px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm lg:text-base ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:${tema.colores.glow} transition-all duration-300`}
                        placeholder="Ej: RX, segundo piso, box 3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha (resumen y acciones) - 1/3 */}
            <div className="space-y-6">
              {/* Ficha técnico / centro */}
              <div
                className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn sticky top-24`}
              >
                {/* Fondo decorativo */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-2xl flex items-center justify-center shadow-2xl ${tema.colores.glow} animate-float`}
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Técnico Asignado
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Información del sistema
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs lg:text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg ${tema.colores.glow} ring-2 ring-white/20`}
                      >
                        {usuario.foto_perfil_url ? (
                          <Image
                            src={usuario.foto_perfil_url}
                            alt={usuario.nombre}
                            width={48}
                            height={48}
                            className="rounded-2xl object-cover"
                          />
                        ) : (
                          `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${tema.colores.texto}`}
                        >
                          {usuario.nombre} {usuario.apellido_paterno}
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          {usuario.tecnico?.area_tecnica} • {usuario.tecnico?.tipo_tecnico}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-white/10 my-3" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                        <p className={`${tema.colores.textoSecundario} text-xs`}>
                          {usuario.tecnico?.centro?.nombre ?? "Centro no definido"}
                          {usuario.tecnico?.centro?.ciudad
                            ? ` • ${usuario.tecnico.centro.ciudad}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                        <p className={`${tema.colores.textoSecundario} text-xs`}>
                          Turno: {usuario.tecnico?.turno || "No definido"} • Nivel: {usuario.tecnico?.nivel_acceso}
                        </p>
                      </div>

                      {usuario.tecnico?.extension_telefonica && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-300 flex-shrink-0" />
                          <p className={`${tema.colores.textoSecundario} text-xs`}>
                            Anexo: {usuario.tecnico.extension_telefonica}
                          </p>
                        </div>
                      )}

                      {usuario.tecnico?.zona_horaria && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-300 flex-shrink-0" />
                          <p className={`${tema.colores.textoSecundario} text-xs`}>
                            Zona horaria: {usuario.tecnico.zona_horaria}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen dinámico del ticket */}
              <div
                className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn`}
                style={{ animationDelay: '0.1s' }}
              >
                {/* Fondo decorativo */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-float`}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Resumen del Ticket
                      </h3>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Vista previa antes de registrar
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs lg:text-sm">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Título
                      </p>
                      <p className={`${tema.colores.texto} text-sm font-bold`}>
                        {form.titulo || "Sin título aún"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Tipo / Prioridad
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${tema.colores.hover} bg-white/5`}>
                            {form.tipo}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            form.prioridad === 'critica' ? 'bg-red-500/20 text-red-300' :
                            form.prioridad === 'alta' ? 'bg-orange-500/20 text-orange-300' :
                            form.prioridad === 'media' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {form.prioridad}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Impacto
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          {form.impacto} • {form.tiempoEstimado || "0"} min
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Origen / Canal
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {form.origen} • {form.canal}
                      </p>
                    </div>

                    {form.equipoAfectado && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Cpu className="w-3 h-3" />
                          Equipo / Sistema
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          {form.equipoAfectado}
                        </p>
                      </div>
                    )}

                    {form.nombreSolicitante && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          Solicitante
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          {form.nombreSolicitante}
                          {form.ubicacion ? ` • ${form.ubicacion}` : ""}
                        </p>
                      </div>
                    )}

                    <div className="h-px bg-white/10 my-3" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-300" />
                        <span className={tema.colores.textoSecundario}>
                          Estado inicial: <span className="font-bold text-amber-200">ABIERTO</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Star className="w-4 h-4 text-indigo-300" />
                        <span className={tema.colores.textoSecundario}>
                          Se asociará automáticamente a tu usuario
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3 pt-4 border-t border-gray-700/30">
                      <button
                        type="button"
                        onClick={() => setMostrarVistaPrevia(!mostrarVistaPrevia)}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                      >
                        {mostrarVistaPrevia ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {mostrarVistaPrevia ? "Ocultar" : "Vista Previa"}
                      </button>

                      <button
                        type="submit"
                        disabled={enviando || !form.titulo.trim() || !form.descripcion.trim()}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white ${tema.colores.primario} ${tema.colores.sombra} ${tema.colores.glow} disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300`}
                      >
                        {enviando ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Registrando ticket...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Crear Ticket
                          </>
                        )}
                      </button>

                      <div className={`flex items-center justify-center gap-2 text-xs ${tema.colores.textoSecundario}`}>
                        <Info className="w-3 h-3" />
                        <span>Los campos con * son obligatorios</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips y ayuda */}
              <div
                className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden animate-fadeIn`}
                style={{ animationDelay: '0.2s' }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50`}
                    >
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-base font-black ${tema.colores.texto}`}>
                      Tips para un mejor registro
                    </h3>
                  </div>

                  <ul className="space-y-2 text-xs">
                    <li className={`flex items-start gap-2 ${tema.colores.textoSecundario}`}>
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Describe el problema con el mayor detalle posible</span>
                    </li>
                    <li className={`flex items-start gap-2 ${tema.colores.textoSecundario}`}>
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Incluye mensajes de error si los hay</span>
                    </li>
                    <li className={`flex items-start gap-2 ${tema.colores.textoSecundario}`}>
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Indica el equipo o sistema afectado</span>
                    </li>
                    <li className={`flex items-start gap-2 ${tema.colores.textoSecundario}`}>
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Proporciona datos de contacto del solicitante</span>
                    </li>
                  </ul>

                  <Link
                    href="/tecnico/ayuda"
                    className={`mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Ver guía completa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* FOOTER PREMIUM */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } mt-12 rounded-3xl mx-4 lg:mx-8 px-6 lg:px-8 py-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} ${tema.colores.glow} relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tema.colores.gradiente} rounded-full blur-3xl`}></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg ${tema.colores.glow}`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                © 2025 AnyssaMed - Módulo de Tickets Premium
              </p>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                Sistema de gestión técnica profesional
              </p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg ${tema.colores.glow}`}>
              v5.0.0 PREMIUM
            </span>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <Link
              href="/tecnico"
              className={`text-sm font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:${tema.colores.acento} hover:scale-110`}
            >
              Panel Técnico
            </Link>
            <Link
              href="/ayuda"
              className={`text-sm font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:${tema.colores.acento} hover:scale-110`}
            >
              Ayuda
            </Link>
            <button
              type="button"
              onClick={cerrarSesion}
              className={`text-sm font-bold transition-all duration-300 ${tema.colores.textoSecundario} hover:text-red-400 hover:scale-110 flex items-center gap-2`}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </footer>

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
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
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

        .backdrop-blur-xl {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .backdrop-blur-2xl {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        @media (max-width: 640px) {
          .sm\:hidden {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .md\:hidden {
            display: none;
          }
        }

        @media (max-width: 1024px) {
          .lg\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

