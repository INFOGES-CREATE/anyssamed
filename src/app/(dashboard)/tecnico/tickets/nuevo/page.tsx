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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
// CONFIGURACIÓN DE TEMAS (MISMO DISEÑO)
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
    icono: Activity,
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

export default function NuevoTicketTecnicoPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [temaActual, setTemaActual] = useState<TemaColor>("blue");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

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
  // MENU (MISMA LÓGICA, ACTIVO: TICKETS)
  // ========================================


  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    // Tema desde localStorage
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as
        | TemaColor
        | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
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
          ? `Ticket creado correctamente. Nº ${numeroTicket}`
          : "Ticket creado correctamente."
      );

      // Reset suave del formulario
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
    } catch (error: any) {
      console.error("Error al crear ticket:", error);
      setMensajeError(
        error?.message || "No se pudo crear el ticket. Intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const getChipDisponibilidad = () => {
    const base =
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border";
    if (disponibilidad === "disponible") {
      return `${base} bg-green-500/10 text-green-300 border-green-500/40`;
    }
    if (disponibilidad === "ocupado") {
      return `${base} bg-yellow-500/10 text-yellow-200 border-yellow-500/40`;
    }
    return `${base} bg-red-500/10 text-red-200 border-red-500/40`;
  };

  // ========================================
  // RENDER: LOADING / SIN PERMISOS
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
              <Wrench className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Preparando módulo de tickets
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Cargando tu sesión de técnico...
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
            Acceso no autorizado
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

  // ========================================
  // RENDER PRINCIPAL
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
          {/* Breadcrumb + título */}
          <div className="flex flex-col gap-1">
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${tema.colores.textoSecundario}`}
            >
              <Home className="w-3 h-3" />
              <span>Panel Técnico</span>
              <ChevronRight className="w-3 h-3" />
              <span>Tickets</span>
              <ChevronRight className="w-3 h-3" />
              <span className={tema.colores.acento}>Nuevo Ticket</span>
            </div>
            <div className="flex items-center gap-3">
              <h1
                className={`text-2xl md:text-3xl font-black ${tema.colores.texto}`}
              >
                Nuevo Ticket Técnico
              </h1>
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-black/10 border border-white/10 text-white">
                <Zap className="w-3 h-3" />
                Registro rápido y trazable
              </span>
            </div>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              {obtenerSaludo()}, {usuario.nombre}. Registra un incidente o
              requerimiento asociado a tu centro.
            </p>
          </div>

          {/* Acciones header */}
          <div className="flex items-center gap-3">
            {/* Selector de tema */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Seleccionar tema
                </p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
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
                    {temaActual === key && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Alertas dummy (placeholder) */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificacionesAbiertas(!notificacionesAbiertas)
                }
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Notificaciones
                    </h3>
                  </div>
                  <div className="p-6 text-center">
                    <BellOff
                      className={`w-10 h-10 mx-auto mb-2 ${tema.colores.textoSecundario}`}
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
                className={`w-2 h-2 rounded-full ${
                  disponibilidad === "disponible"
                    ? "bg-green-400"
                    : disponibilidad === "ocupado"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
              />
              <span>{disponibilidad.toUpperCase()}</span>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                type="button"
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
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50`}
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Home className="w-5 h-5" />
                      <span>Panel técnico</span>
                    </Link>
                    <button
                      type="button"
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar sesión</span>
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
        {/* Mensajes de estado */}
        {(mensajeError || mensajeExito) && (
          <div className="mb-6 grid gap-3">
            {mensajeError && (
              <div
                className={`flex items-start gap-3 p-4 rounded-2xl border border-red-500/40 bg-red-500/10 ${tema.colores.sombra}`}
              >
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-200">
                    Error al crear el ticket
                  </p>
                  <p className="text-xs text-red-100">{mensajeError}</p>
                </div>
              </div>
            )}
            {mensajeExito && (
              <div
                className={`flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 ${tema.colores.sombra}`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-200">
                    Ticket creado correctamente
                  </p>
                  <p className="text-xs text-emerald-100">{mensajeExito}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contenido principal: formulario + resumen */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Columna izquierda (formulario) */}
            <div className="xl:col-span-2 space-y-6">
              {/* Datos principales */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2
                        className={`text-xl font-black ${tema.colores.texto}`}
                      >
                        Datos principales del ticket
                      </h2>
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Define el problema, prioridad y tipo de incidente.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/tecnico/tickets"
                    className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a mis tickets
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Título del ticket
                    </label>
                    <input
                      type="text"
                      value={form.titulo}
                      onChange={(e) => actualizarCampo("titulo", e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="Ej: Computador de RX no enciende"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-300">
                        Tipo de ticket
                      </label>
                      <select
                        value={form.tipo}
                        onChange={(e) =>
                          actualizarCampo("tipo", e.target.value as TipoTicket)
                        }
                        className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      >
                        <option value="soporte">Soporte</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="ingenieria">Ingeniería</option>
                        <option value="biomedico">Biomédico</option>
                        <option value="infraestructura">Infraestructura</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-300">
                        Prioridad
                      </label>
                      <select
                        value={form.prioridad}
                        onChange={(e) =>
                          actualizarCampo(
                            "prioridad",
                            e.target.value as PrioridadTicket
                          )
                        }
                        className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Impacto en el servicio
                    </label>
                    <select
                      value={form.impacto}
                      onChange={(e) =>
                        actualizarCampo(
                          "impacto",
                          e.target.value as FormTicket["impacto"]
                        )
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                    >
                      <option value="bajo">Bajo (pocos usuarios)</option>
                      <option value="medio">Medio (un área)</option>
                      <option value="alto">Alto (varios servicios)</option>
                      <option value="critico">Crítico (servicio detenido)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Tiempo estimado (min)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={480}
                      value={form.tiempoEstimado}
                      onChange={(e) =>
                        actualizarCampo("tiempoEstimado", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold mb-1 text-gray-300">
                    Descripción detallada
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) =>
                      actualizarCampo("descripcion", e.target.value)
                    }
                    className={`w-full min-h-[120px] px-4 py-3 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/60 custom-scrollbar`}
                    placeholder="Describe el problema, mensajes de error, acciones previas realizadas, equipos involucrados, etc."
                  />
                </div>
              </div>

              {/* Origen, canal, equipo */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Origen y canal del requerimiento
                    </h2>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Registra cómo se generó el ticket y el equipo afectado.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Origen del requerimiento
                    </label>
                    <select
                      value={form.origen}
                      onChange={(e) =>
                        actualizarCampo(
                          "origen",
                          e.target.value as OrigenTicket
                        )
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                    >
                      <option value="funcionario">Funcionario</option>
                      <option value="paciente">Paciente</option>
                      <option value="sistema">Sistema</option>
                      <option value="monitoreo">Monitoreo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Canal de ingreso
                    </label>
                    <select
                      value={form.canal}
                      onChange={(e) =>
                        actualizarCampo(
                          "canal",
                          e.target.value as CanalTicket
                        )
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                    >
                      <option value="telefono">Teléfono</option>
                      <option value="presencial">Presencial</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Correo electrónico</option>
                      <option value="web">Portal web</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Equipo / sistema afectado
                    </label>
                    <input
                      type="text"
                      value={form.equipoAfectado}
                      onChange={(e) =>
                        actualizarCampo("equipoAfectado", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="Ej: RX-01, PC recepción, servidor laboratorio..."
                    />
                  </div>
                </div>
              </div>

              {/* Datos del solicitante */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-black ${tema.colores.texto}`}
                    >
                      Datos del solicitante
                    </h2>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Opcional, pero recomendado para trazabilidad y contacto.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={form.nombreSolicitante}
                      onChange={(e) =>
                        actualizarCampo("nombreSolicitante", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={form.emailSolicitante}
                      onChange={(e) =>
                        actualizarCampo("emailSolicitante", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="ejemplo@centro.cl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Teléfono / Anexo
                    </label>
                    <input
                      type="text"
                      value={form.telefonoSolicitante}
                      onChange={(e) =>
                        actualizarCampo("telefonoSolicitante", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="+56 9 ..."
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      Ubicación física
                    </label>
                    <input
                      type="text"
                      value={form.ubicacion}
                      onChange={(e) =>
                        actualizarCampo("ubicacion", e.target.value)
                      }
                      className={`w-full px-4 py-2.5 rounded-xl bg-black/10 border ${tema.colores.borde} text-sm ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                      placeholder="Ej: RX, segundo piso, box 3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha (ficha técnico + resumen) */}
            <div className="space-y-6">
              {/* Ficha técnico / centro */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Técnico asignado
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Información desde la tabla&nbsp;
                      <span className="font-mono text-[11px] text-indigo-300">
                        tecnicos
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {usuario.nombre[0]}
                      {usuario.apellido_paterno[0]}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${tema.colores.texto}`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {usuario.tecnico?.area_tecnica} •{" "}
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-2" />

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-cyan-300" />
                    <p className={tema.colores.textoSecundario}>
                      {usuario.tecnico?.centro?.nombre ?? "Centro no definido"}
                      {usuario.tecnico?.centro?.ciudad
                        ? ` • ${usuario.tecnico.centro.ciudad}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-emerald-300" />
                    <p className={tema.colores.textoSecundario}>
                      Turno: {usuario.tecnico?.turno || "No definido"} • Nivel:{" "}
                      {usuario.tecnico?.nivel_acceso}
                    </p>
                  </div>

                  {usuario.tecnico?.extension_telefonica && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-amber-300" />
                      <p className={tema.colores.textoSecundario}>
                        Anexo: {usuario.tecnico.extension_telefonica}
                      </p>
                    </div>
                  )}

                  {usuario.tecnico?.zona_horaria && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-sky-300" />
                      <p className={tema.colores.textoSecundario}>
                        Zona horaria: {usuario.tecnico.zona_horaria}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen dinámico del ticket */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-amber-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Resumen del ticket
                    </h3>
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Vista previa antes de registrar.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Título
                    </p>
                    <p className={`${tema.colores.texto} text-sm font-bold`}>
                      {form.titulo || "Sin título aún"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Tipo / Prioridad
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {form.tipo} • {form.prioridad}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Impacto
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {form.impacto} • {form.tiempoEstimado || "0"} min
                        estimados
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Origen / Canal
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      {form.origen} • {form.canal}
                    </p>
                  </div>

                  {form.equipoAfectado && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Equipo / sistema
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {form.equipoAfectado}
                      </p>
                    </div>
                  )}

                  {form.nombreSolicitante && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Solicitante
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {form.nombreSolicitante}
                        {form.ubicacion ? ` • ${form.ubicacion}` : ""}
                      </p>
                    </div>
                  )}

                  <div className="h-px bg-white/5 my-2" />

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-300">
                      <AlertTriangle className="w-3 h-3" />
                      <span>
                        Estado inicial:{" "}
                        <span className="font-bold text-amber-200">
                          ABIERTO
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-300">
                      <Star className="w-3 h-3" />
                      <span>Se asociará automáticamente a tu usuario.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white ${tema.colores.primario} ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300`}
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando ticket...
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-4 h-4" />
                        Crear ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
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
                © 2025 AnyssaMed - Módulo de Tickets Técnicos.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                v1.0.0
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/tecnico"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Panel técnico
              </Link>
              <Link
                href="/ayuda"
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <button
                type="button"
                onClick={cerrarSesion}
                className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES IGUALES AL DASHBOARD */}
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
      `}</style>
    </div>
  );
}
