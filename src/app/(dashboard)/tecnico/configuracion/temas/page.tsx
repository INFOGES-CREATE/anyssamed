"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import {
  Sparkles,
  Settings,
  Search,
  X,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Sun,
  Moon,
  Wifi,
  HeartPulse,
  User,
  ChevronDown,
  LogOut,
  Building2,
  MapPin as MapPinIcon,
  Check,
  CheckCircle2,
  Loader2,
  Save,
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

type VistaAgenda = "dia" | "semana" | "mes" | "lista";

interface PreferenciasUsuario {
  id_preferencia?: number;
  tema_color: TemaColor;
  modo_compacto: boolean;
  animaciones_habilitadas: boolean;
  vista_agenda_default: VistaAgenda;
  mostrar_estadisticas: boolean;
  mostrar_filtros_avanzados: boolean;
  hora_inicio_jornada: string; // "HH:MM"
  hora_fin_jornada: string; // "HH:MM"
  duracion_cita_default: number;
  notificaciones_email: boolean;
  notificaciones_push: boolean;
  notificaciones_sms: boolean;
  recordatorio_citas_minutos: number;
  fecha_actualizacion?: string | null;
}

// ========================================
// TEMAS (coinciden con ENUM tema_color)
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

const DESCRIPCIONES_TEMA: Record<TemaColor, string> = {
  light: "Interfaz clara para jornadas largas frente a la pantalla.",
  dark: "Modo oscuro para ambientes con poca luz.",
  blue: "Look técnico, ideal para monitoreo y soporte.",
  purple: "Toque industrial con acentos fucsia.",
  green: "Estilo operativo orientado a continuidad asistencial.",
};

// ========================================
// HELPERS
// ========================================

function crearPreferenciasPorDefecto(temaColor: TemaColor): PreferenciasUsuario {
  return {
    tema_color: temaColor,
    modo_compacto: false,
    animaciones_habilitadas: true,
    vista_agenda_default: "dia",
    mostrar_estadisticas: true,
    mostrar_filtros_avanzados: false,
    hora_inicio_jornada: "08:00",
    hora_fin_jornada: "18:00",
    duracion_cita_default: 30,
    notificaciones_email: true,
    notificaciones_push: true,
    notificaciones_sms: false,
    recordatorio_citas_minutos: 60,
    fecha_actualizacion: null,
  };
}

function formatearFecha(fecha: string) {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function obtenerSaludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

function normalizarTexto(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ========================================
// PAGE COMPONENT
// ========================================

export default function ConfiguracionTemasTecnicoPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(
    null
  );
  const [preferenciasOriginal, setPreferenciasOriginal] =
    useState<PreferenciasUsuario | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [guardandoPrefs, setGuardandoPrefs] = useState(false);
  const [mensajePrefs, setMensajePrefs] = useState<string | null>(null);
  const [errorPrefs, setErrorPrefs] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const seccionActiva = "temas";

  const hayCambios = useMemo(() => {
    if (!preferencias || !preferenciasOriginal) return false;
    const { fecha_actualizacion: _, ...rest } = preferencias;
    const { fecha_actualizacion: __, ...restOriginal } = preferenciasOriginal;
    return JSON.stringify(rest) !== JSON.stringify(restOriginal);
  }, [preferencias, preferenciasOriginal]);

  const coincideBusqueda = (texto: string) => {
    if (!busqueda.trim()) return true;
    return normalizarTexto(texto).includes(normalizarTexto(busqueda));
  };

  const resumenNotificaciones = useMemo(() => {
    if (!preferencias) return { activas: 0, total: 3 };
    const activas = [
      preferencias.notificaciones_email,
      preferencias.notificaciones_push,
      preferencias.notificaciones_sms,
    ].filter(Boolean).length;
    return { activas, total: 3 };
  }, [preferencias]);

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
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarContextoTecnico();
      cargarPreferenciasUsuario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.tecnico?.id_tecnico]);

  useEffect(() => {
    if (!mensajePrefs && !errorPrefs) return;
    const timer = setTimeout(() => {
      setMensajePrefs(null);
      setErrorPrefs(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mensajePrefs, errorPrefs]);

  // ========================================
  // CARGA DE DATOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoadingSesion(true);
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
            `Acceso denegado. Este módulo de preferencias es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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
      setLoadingSesion(false);
    }
  };

  const cargarContextoTecnico = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
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
        console.error("Respuesta dashboard contexto:", data);
        return;
      }

      setEstadisticas(data.estadisticas || null);
      setAlertas(data.alertas || []);
    } catch (err) {
      console.error("Error al cargar contexto técnico:", err);
    }
  };

  const cargarPreferenciasUsuario = async () => {
    try {
      setLoadingPrefs(true);
      setErrorPrefs(null);

      const res = await fetch("/api/users/preferencias", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({} as any));

      let temaBase: TemaColor = temaActual;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("tema_tecnico") as TemaColor | null;
        if (saved && TEMAS[saved]) temaBase = saved;
      }

      if (!res.ok || !data.success || !data.preferencias) {
        console.warn(
          "No se encontraron preferencias, usando valores por defecto"
        );
        const base = crearPreferenciasPorDefecto(temaBase);
        setPreferencias(base);
        setPreferenciasOriginal(base);
        setTemaActual(base.tema_color);
        if (typeof window !== "undefined") {
          localStorage.setItem("tema_tecnico", base.tema_color);
        }
        return;
      }

      const p = data.preferencias;

      const prefs: PreferenciasUsuario = {
        id_preferencia: p.id_preferencia,
        tema_color: (p.tema_color as TemaColor) || temaBase,
        modo_compacto: Boolean(p.modo_compacto),
        animaciones_habilitadas: Boolean(p.animaciones_habilitadas),
        vista_agenda_default: (p.vista_agenda_default ||
          "dia") as VistaAgenda,
        mostrar_estadisticas: Boolean(p.mostrar_estadisticas ?? true),
        mostrar_filtros_avanzados: Boolean(
          p.mostrar_filtros_avanzados ?? false
        ),
        hora_inicio_jornada: p.hora_inicio_jornada?.slice(0, 5) || "08:00",
        hora_fin_jornada: p.hora_fin_jornada?.slice(0, 5) || "18:00",
        duracion_cita_default: Number(p.duracion_cita_default ?? 30),
        notificaciones_email: Boolean(p.notificaciones_email ?? true),
        notificaciones_push: Boolean(p.notificaciones_push ?? true),
        notificaciones_sms: Boolean(p.notificaciones_sms ?? false),
        recordatorio_citas_minutos: Number(
          p.recordatorio_citas_minutos ?? 60
        ),
        fecha_actualizacion: p.fecha_actualizacion || null,
      };

      setPreferencias(prefs);
      setPreferenciasOriginal(prefs);
      setTemaActual(prefs.tema_color);
      if (typeof window !== "undefined") {
        localStorage.setItem("tema_tecnico", prefs.tema_color);
      }
    } catch (error) {
      console.error("Error al cargar preferencias de usuario:", error);
      const base = crearPreferenciasPorDefecto(temaActual);
      setPreferencias(base);
      setPreferenciasOriginal(base);
      setErrorPrefs(
        "No se pudieron cargar tus preferencias desde el servidor. Usando valores por defecto."
      );
    } finally {
      setLoadingPrefs(false);
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

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    setPreferencias((prev) =>
      prev ? { ...prev, tema_color: nuevoTema } : crearPreferenciasPorDefecto(nuevoTema)
    );

    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", nuevoTema);
    }

    // Guardado rápido solo de tema (tabla preferencias_usuarios.tema_color)
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

  const guardarPreferenciasUsuario = async () => {
    if (!preferencias) return;

    try {
      setGuardandoPrefs(true);
      setMensajePrefs(null);
      setErrorPrefs(null);

      const metodo = preferencias.id_preferencia ? "PUT" : "POST";

      const res = await fetch("/api/users/preferencias", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(preferencias),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        console.error("Error al guardar preferencias:", data);
        setErrorPrefs(
          data?.message ||
            "No se pudieron guardar las preferencias. Inténtalo nuevamente."
        );
        return;
      }

      const serverPrefs = data.preferencias || data.data || {};
      const prefsFinal: PreferenciasUsuario = {
        ...preferencias,
        ...serverPrefs,
        id_preferencia:
          serverPrefs.id_preferencia ?? preferencias.id_preferencia,
        fecha_actualizacion:
          serverPrefs.fecha_actualizacion ??
          preferencias.fecha_actualizacion ??
          new Date().toISOString(),
      };

      setPreferencias(prefsFinal);
      setPreferenciasOriginal(prefsFinal);
      setMensajePrefs("Preferencias de tema y experiencia guardadas correctamente.");
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      setErrorPrefs(
        "Se produjo un error al guardar tus preferencias. Verifica la conexión."
      );
    } finally {
      setGuardandoPrefs(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!preferenciasOriginal) return;
    setPreferencias(preferenciasOriginal);
    setTemaActual(preferenciasOriginal.tema_color);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", preferenciasOriginal.tema_color);
    }
  };

  const restaurarRecomendadas = () => {
    const base = crearPreferenciasPorDefecto(temaActual);
    setPreferencias((prev) =>
      prev
        ? { ...base, id_preferencia: prev.id_preferencia }
        : base
    );
  };

  const obtenerColorDisponibilidad = () => {
    if (disponibilidad === "disponible")
      return "bg-green-500/20 text-green-300 border-green-400/40";
    if (disponibilidad === "ocupado")
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
    return "bg-red-500/20 text-red-200 border-red-400/40";
  };

  // ========================================
  // ESTADOS ESPECIALES
  // ========================================

  if (loadingSesion) {
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
            Cargando tus preferencias
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Ajustando el panel a tu estilo de trabajo...
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
            No tienes permisos para acceder a las preferencias de tema técnico.
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
  // RENDER
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
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Busca dentro de tus preferencias (tema, agenda, notificaciones)..."
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
            {/* Temas quick switch */}
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
                  Tema rápido
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

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50 custom-scrollbar`}
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
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  alerta.prioridad === "critica"
                                    ? "bg-red-500/20 border border-red-400/40"
                                    : alerta.prioridad === "alta"
                                    ? "bg-orange-500/20 border border-orange-400/40"
                                    : alerta.prioridad === "media"
                                    ? "bg-yellow-500/20 border border-yellow-400/40"
                                    : "bg-emerald-500/20 border border-emerald-400/40"
                                }`}
                              >
                                <AlertCircle className="w-5 h-5" />
                              </div>
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

            {/* Disponibilidad */}
            <div className="hidden lg:flex items-center gap-2">
              <span
                className={`px-3 py-2 rounded-xl text-xs font-semibold border ${obtenerColorDisponibilidad()}`}
              >
                Estado: {disponibilidad?.toUpperCase() ?? "NO DEFINIDO"}
              </span>
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
                        {usuario.tecnico?.tipo_tecnico}
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuario.tecnico?.centro?.nombre ??
                          "Sin centro asignado"}
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
                      <span>Configuración del Centro</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion/temas"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Preferencias de Tema</span>
                    </Link>
                    <Link
                      href="/tecnico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <AlertCircle className="w-5 h-5" />
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

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Encabezado */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl lg:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">🎨</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Ajusta el <span className={tema.colores.texto}>tema visual</span> y
              la <span className={tema.colores.texto}>experiencia de uso</span>{" "}
              del módulo técnico, solo para tu usuario.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
              >
                <Building2 className="w-3 h-3" />
                Centro actual:
                <span className={tema.colores.texto}>
                  {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
              >
                <MapPinIcon className="w-3 h-3" />
                {usuario.tecnico?.centro?.ciudad ?? "Sin ciudad"},{" "}
                {usuario.tecnico?.centro?.region ?? "Sin región"}
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
              >
                <Sparkles className="w-3 h-3" />
                Tema actual:
                <span className={tema.colores.texto}>
                  {TEMAS[temaActual].nombre}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={cargarPreferenciasUsuario}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingPrefs}
              >
                <Loader2
                  className={`w-4 h-4 ${
                    loadingPrefs ? "animate-spin" : "opacity-60"
                  }`}
                />
                Recargar preferencias
              </button>
              <button
                onClick={guardarPreferenciasUsuario}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoPrefs}
              >
                <Save className="w-4 h-4" />
                {guardandoPrefs
                  ? "Guardando preferencias..."
                  : "Guardar preferencias"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {preferencias?.fecha_actualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Última actualización:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFecha(preferencias.fecha_actualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  Estas preferencias aún no se han guardado en la base de datos.
                </p>
              )}
              {hayCambios && (
                <p className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Hay cambios sin guardar.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {(mensajePrefs || errorPrefs) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 ${
              mensajePrefs
                ? "bg-emerald-500/10 border border-emerald-500/40"
                : "bg-red-500/10 border border-red-500/40"
            }`}
          >
            {mensajePrefs ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`text-sm ${
                mensajePrefs ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {mensajePrefs || errorPrefs}
            </p>
          </div>
        )}

        {/* Resumen rápido */}
        {preferencias && (
          <div className="flex flex-wrap gap-3 mb-6 text-xs md:text-sm">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
            >
              🎯 Vista agenda por defecto:
              <span className={tema.colores.texto}>
                {preferencias.vista_agenda_default.toUpperCase()}
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
            >
              ⏱️ Duración estándar cita:
              <span className={tema.colores.texto}>
                {preferencias.duracion_cita_default} min
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
            >
              🔔 Notificaciones activas:
              <span className={tema.colores.texto}>
                {resumenNotificaciones.activas}/{resumenNotificaciones.total}
              </span>
            </span>
          </div>
        )}

        {/* Contenido principal */}
        {loadingPrefs || !preferencias ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando tus preferencias personalizadas...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
              {/* Tema visual */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Tema visual del panel
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Elige cómo se ve el módulo técnico para tu usuario.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    Object.entries(TEMAS) as [TemaColor, ConfiguracionTema][]
                  ).map(([key, t]) => {
                    const coincide = coincideBusqueda(
                      `${t.nombre} ${DESCRIPCIONES_TEMA[key]} tema`
                    );
                    return (
                      <button
                        key={key}
                        onClick={() => cambiarTema(key)}
                        className={`relative w-full rounded-2xl p-3 border transition-all duration-300 text-left ${
                          temaActual === key
                            ? `bg-gradient-to-br ${t.colores.gradiente} text-white border-transparent scale-[1.02]`
                            : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} ${
                                coincide ? "" : "opacity-60"
                              } hover:scale-[1.01]`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.colores.gradiente} flex items-center justify-center shadow-lg`}
                          >
                            <t.icono className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{t.nombre}</p>
                            <p className="text-[11px] opacity-80">
                              {DESCRIPCIONES_TEMA[key]}
                            </p>
                          </div>
                        </div>
                        {temaActual === key && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diseño y animaciones */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      🧩
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Diseño y animaciones
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ajusta el nivel de densidad de información y movimiento.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={preferencias.modo_compacto}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                modo_compacto: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Activar modo compacto
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Reduce espacios y márgenes para ver más información en
                        la pantalla.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={preferencias.animaciones_habilitadas}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                animaciones_habilitadas: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Animaciones suaves habilitadas
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Mejora la percepción de cambios y transiciones en el
                        panel.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={preferencias.mostrar_estadisticas}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                mostrar_estadisticas: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Mostrar panel de estadísticas rápidas
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Tarjetas de resumen con tickets, SLA y desempeño (cuando
                        estén disponibles).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={preferencias.mostrar_filtros_avanzados}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                mostrar_filtros_avanzados: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Mostrar filtros avanzados por defecto
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Útil si sueles trabajar con muchos tickets y filtros
                        complejos.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Agenda + Notificaciones */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
              {/* Agenda y jornada */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      📅
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Agenda y jornada de trabajo
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Define cómo se muestra tu agenda y tu rango horario base.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex flex-col gap-2">
                    <label
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Vista por defecto de la agenda
                    </label>
                    <select
                      value={preferencias.vista_agenda_default}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                vista_agenda_default: e.target
                                  .value as VistaAgenda,
                              }
                            : prev
                        )
                      }
                      className={`px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="dia">Día</option>
                      <option value="semana">Semana</option>
                      <option value="mes">Mes</option>
                      <option value="lista">Lista</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Jornada desde
                      </span>
                      <input
                        type="time"
                        value={preferencias.hora_inicio_jornada}
                        onChange={(e) =>
                          setPreferencias((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  hora_inicio_jornada: e.target.value,
                                }
                              : prev
                          )
                        }
                        className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        hasta
                      </span>
                      <input
                        type="time"
                        value={preferencias.hora_fin_jornada}
                        onChange={(e) =>
                          setPreferencias((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  hora_fin_jornada: e.target.value,
                                }
                              : prev
                          )
                        }
                        className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Duración estándar de cada cita
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={240}
                        step={5}
                        value={preferencias.duracion_cita_default}
                        onChange={(e) =>
                          setPreferencias((prev) => {
                            const num = parseInt(e.target.value, 10);
                            if (Number.isNaN(num) || num <= 0) return prev;
                            return prev
                              ? { ...prev, duracion_cita_default: num }
                              : prev;
                          })
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>min</span>
                    </div>
                  </div>

                  <p
                    className={`mt-2 text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Estos parámetros afectan solo tu vista personal de agenda,
                    no la lógica global de asignación de citas.
                  </p>
                </div>
              </div>

              {/* Notificaciones */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones personales
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Decide por qué canales quieres recibir recordatorios.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={preferencias.notificaciones_email}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones_email: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Recibir notificaciones por correo electrónico
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Confirmaciones, cambios y recordatorios de tickets
                        importantes.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={preferencias.notificaciones_push}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones_push: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Notificaciones push (cuando esté disponible)
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ideal si trabajas con la app abierta durante el turno.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={preferencias.notificaciones_sms}
                      onChange={(e) =>
                        setPreferencias((prev) =>
                          prev
                            ? {
                                ...prev,
                                notificaciones_sms: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        SMS para recordatorios críticos
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Se utilizará solo para avisos importantes, según la
                        configuración del centro.
                      </p>
                    </div>
                  </label>

                  <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Minutos de anticipación para recordatorios
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          max={720}
                          step={5}
                          value={preferencias.recordatorio_citas_minutos}
                          onChange={(e) =>
                            setPreferencias((prev) => {
                              const num = parseInt(e.target.value, 10);
                              if (Number.isNaN(num) || num <= 0) return prev;
                              return prev
                                ? {
                                    ...prev,
                                    recordatorio_citas_minutos: num,
                                  }
                                : prev;
                            })
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <span className={tema.colores.textoSecundario}>
                          min
                        </span>
                      </div>
                    </div>
                    <p
                      className={`mt-2 text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Aplica a recordatorios que te correspondan según tu rol y
                      centro; no cambia la configuración global de notificaciones
                      a pacientes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BARRA ACCIONES ABAJO */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm">
                <p className={tema.colores.textoSecundario}>
                  Esta página controla{" "}
                  <span className={tema.colores.texto}>
                    tus preferencias personales de tema y experiencia
                  </span>{" "}
                  como técnico. No afecta la configuración del centro ni de otros
                  usuarios.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={restaurarDesdeOriginal}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!hayCambios}
                >
                  Deshacer cambios
                </button>
                <button
                  onClick={restaurarRecomendadas}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  Volver a valores recomendados
                </button>
                <button
                  onClick={guardarPreferenciasUsuario}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={!hayCambios || guardandoPrefs}
                >
                  <Save className="w-4 h-4" />
                  {guardandoPrefs ? "Guardando..." : "Guardar ahora"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <footer
          className={`transition-all duration-300 mt-10 rounded-2xl px-6 py-4 ${tema.colores.card} ${tema.colores.borde} border`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <p className={tema.colores.textoSecundario}>
                © 2025 AnyssaMed / INFOGES – Preferencias de usuario técnico.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Tema Técnico
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/ayuda"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Ayuda
              </Link>
              <Link
                href="/privacidad"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
              >
                Términos
              </Link>
              <button
                onClick={cerrarSesion}
                className={`text-xs md:text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:text-red-400 flex items-center gap-1`}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* ESTILOS GLOBALES */}
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
