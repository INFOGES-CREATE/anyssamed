"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe,
  Loader2,
  LogOut,
  MapPin as MapPinIcon,
  Save,
  Search,
  Settings,
  Sparkles,
  User,
  X,
  Mail,
  Smartphone,
  MessageSquare,
  Phone,
  Wifi,
  Zap as ZapIcon,
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

type NivelPrioridadNotificacion = "critica" | "alta" | "media" | "baja";

interface ConfigCentroNotificaciones {
  id_config: number | null;
  id_centro: number;
  nombre_centro: string;
  habilitado: boolean;
  canales_notificacion: {
    email: boolean;
    web: boolean;
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  resumen_diario: {
    habilitado: boolean;
    hora_envio: string; // "08:00"
    incluir_detalle: boolean;
    incluir_estadisticas: boolean;
  };
  alertas_criticas: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    repetir_hasta_leida: boolean;
    frecuencia_minutos: number;
  };
  recordatorios: {
    habilitado: boolean;
    dias_previos_vencimiento: number;
    incluir_vencidos: boolean;
  };
  copias: {
    jefatura_centro: boolean;
    mantencion_comunal: boolean;
    administrador_sistema: boolean;
  };
  sonido_panel: {
    habilitado: boolean;
    volumen: number; // 0-100
  };
  ult_actualizacion: string | null;
}

interface PreferenciasNotificacionesUsuario {
  id_preferencia?: number;
  canales: {
    email: boolean;
    web: boolean;
    push_movil: boolean;
    sms: boolean;
  };
  frecuencia_resumen: "ninguno" | "diario" | "semanal";
  prioridad_minima: NivelPrioridadNotificacion;
  ventanas_silencio: {
    habilitado: boolean;
    desde: string; // "22:00"
    hasta: string; // "07:00"
    solo_dias_habiles: boolean;
  };
  mutear_sonidos: boolean;
  mostrar_banner: boolean;
  fecha_actualizacion?: string | null;
}

// ========================================
// TEMAS (mismo sistema que tu página de centro)
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: SunIcon,
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
    icono: MoonIcon,
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
    icono: HeartIcon,
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

// iconos base para los temas
function SunIcon(props: any) {
  return <Globe {...props} />;
}
function MoonIcon(props: any) {
  return <Bell {...props} />;
}
function HeartIcon(props: any) {
  return <Activity {...props} />;
}

// ========================================
// CONSTANTES DE UI
// ========================================

const CANALES_CENTRO = [
  {
    id: "email",
    label: "Correo electrónico",
    desc: "Avisos a correos configurados para el centro.",
    icon: Mail,
  },
  {
    id: "web",
    label: "Notificaciones en panel",
    desc: "Bandeja de notificaciones dentro del módulo técnico.",
    icon: Bell,
  },
  {
    id: "push",
    label: "Push navegador / app",
    desc: "Requiere permisos en el navegador o app móvil.",
    icon: Smartphone,
  },
  {
    id: "sms",
    label: "SMS",
    desc: "Mensajes de texto para eventos críticos.",
    icon: Phone,
  },
  {
    id: "whatsapp",
    label: "WhatsApp / Mensajería",
    desc: "Integración futura con canales de mensajería.",
    icon: MessageSquare,
  },
] as const;

const CANALES_USUARIO = [
  {
    id: "email",
    label: "Correo electrónico personal",
    desc: "Te enviaremos correos a tu email registrado.",
    icon: Mail,
  },
  {
    id: "web",
    label: "Bandeja en el panel",
    desc: "Notificaciones dentro del módulo AnyssaMed / INFOGES.",
    icon: Bell,
  },
  {
    id: "push_movil",
    label: "Push en app móvil",
    desc: "Necesita sesión activa en la app móvil.",
    icon: Smartphone,
  },
  {
    id: "sms",
    label: "SMS directo al teléfono",
    desc: "Solo para alertas realmente importantes.",
    icon: Phone,
  },
] as const;

const PRIORIDADES_LABEL: Record<NivelPrioridadNotificacion, string> = {
  critica: "Solo críticas",
  alta: "Críticas y altas",
  media: "Hasta prioridad media",
  baja: "Todas las prioridades",
};

// ========================================
// HELPERS
// ========================================

function crearConfigCentroNotificacionesPorDefecto(
  usuario: UsuarioSesion
): ConfigCentroNotificaciones {
  const now = new Date().toISOString();
  const centro = usuario.tecnico?.centro;

  return {
    id_config: null,
    id_centro: centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0,
    nombre_centro: centro?.nombre ?? "Centro sin nombre",
    habilitado: true,
    canales_notificacion: {
      email: true,
      web: true,
      push: false,
      sms: false,
      whatsapp: false,
    },
    resumen_diario: {
      habilitado: true,
      hora_envio: "08:00",
      incluir_detalle: true,
      incluir_estadisticas: true,
    },
    alertas_criticas: {
      email: true,
      sms: false,
      whatsapp: false,
      repetir_hasta_leida: true,
      frecuencia_minutos: 15,
    },
    recordatorios: {
      habilitado: true,
      dias_previos_vencimiento: 3,
      incluir_vencidos: true,
    },
    copias: {
      jefatura_centro: true,
      mantencion_comunal: false,
      administrador_sistema: false,
    },
    sonido_panel: {
      habilitado: true,
      volumen: 60,
    },
    ult_actualizacion: now,
  };
}

function crearPreferenciasNotificacionesUsuarioPorDefecto(): PreferenciasNotificacionesUsuario {
  return {
    canales: {
      email: true,
      web: true,
      push_movil: false,
      sms: false,
    },
    frecuencia_resumen: "diario",
    prioridad_minima: "alta",
    ventanas_silencio: {
      habilitado: false,
      desde: "22:00",
      hasta: "07:00",
      solo_dias_habiles: true,
    },
    mutear_sonidos: false,
    mostrar_banner: true,
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

// ========================================
// PAGE COMPONENT
// ========================================

export default function ConfiguracionNotificacionesPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );
  const [alertas, setAlertas] = useState<AlertaTecnico[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("blue");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [configCentro, setConfigCentro] =
    useState<ConfigCentroNotificaciones | null>(null);
  const [configCentroOriginal, setConfigCentroOriginal] =
    useState<ConfigCentroNotificaciones | null>(null);
  const [loadingConfigCentro, setLoadingConfigCentro] = useState(true);
  const [guardandoCentro, setGuardandoCentro] = useState(false);

  const [prefsUsuario, setPrefsUsuario] =
    useState<PreferenciasNotificacionesUsuario | null>(null);
  const [prefsUsuarioOriginal, setPrefsUsuarioOriginal] =
    useState<PreferenciasNotificacionesUsuario | null>(null);
  const [loadingPrefsUsuario, setLoadingPrefsUsuario] = useState(true);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);

  const [mensajeGlobal, setMensajeGlobal] = useState<string | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambiosCentro = useMemo(() => {
    if (!configCentro || !configCentroOriginal) return false;
    return JSON.stringify(configCentro) !== JSON.stringify(configCentroOriginal);
  }, [configCentro, configCentroOriginal]);

  const hayCambiosUsuario = useMemo(() => {
    if (!prefsUsuario || !prefsUsuarioOriginal) return false;
    const { fecha_actualizacion: _f1, ...rest } = prefsUsuario;
    const { fecha_actualizacion: _f2, ...restOriginal } = prefsUsuarioOriginal;
    return JSON.stringify(rest) !== JSON.stringify(restOriginal);
  }, [prefsUsuario, prefsUsuarioOriginal]);

  const hayCambios = hayCambiosCentro || hayCambiosUsuario;

  const resumenCentro = useMemo(() => {
    if (!configCentro) {
      return {
        canalesActivos: 0,
        destinosCopia: 0,
        frecuenciaCriticos: 0,
        volumen: 0,
      };
    }

    const canalesActivos = Object.values(configCentro.canales_notificacion).filter(
      Boolean
    ).length;

    const destinosCopia = Object.values(configCentro.copias).filter(Boolean)
      .length;

    const frecuenciaCriticos = configCentro.alertas_criticas.frecuencia_minutos;

    const volumen = configCentro.sonido_panel.habilitado
      ? configCentro.sonido_panel.volumen
      : 0;

    return { canalesActivos, destinosCopia, frecuenciaCriticos, volumen };
  }, [configCentro]);

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
      cargarConfigCentroNotificaciones();
      cargarPreferenciasNotificacionesUsuario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.tecnico?.id_tecnico]);

  useEffect(() => {
    if (!mensajeGlobal && !errorGlobal) return;
    const timer = setTimeout(() => {
      setMensajeGlobal(null);
      setErrorGlobal(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mensajeGlobal, errorGlobal]);

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
            `Acceso denegado. Este módulo de notificaciones es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarConfigCentroNotificaciones = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingConfigCentro(true);
      setErrorGlobal(null);

      const idCentro =
        usuario.tecnico?.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/notificaciones/config/centro?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      const base = crearConfigCentroNotificacionesPorDefecto(usuario);

      if (!res.ok || !data.success) {
        console.warn(
          "No se encontró configuración de notificaciones del centro, usando valores por defecto"
        );
        setConfigCentro(base);
        setConfigCentroOriginal(base);
        return;
      }

      const cfgServer = data.config || {};

      const cfg: ConfigCentroNotificaciones = {
        ...base,
        ...cfgServer,
        canales_notificacion: {
          ...base.canales_notificacion,
          ...(cfgServer.canales_notificacion || {}),
        },
        resumen_diario: {
          ...base.resumen_diario,
          ...(cfgServer.resumen_diario || {}),
        },
        alertas_criticas: {
          ...base.alertas_criticas,
          ...(cfgServer.alertas_criticas || {}),
        },
        recordatorios: {
          ...base.recordatorios,
          ...(cfgServer.recordatorios || {}),
        },
        copias: {
          ...base.copias,
          ...(cfgServer.copias || {}),
        },
        sonido_panel: {
          ...base.sonido_panel,
          ...(cfgServer.sonido_panel || {}),
        },
      };

      setConfigCentro(cfg);
      setConfigCentroOriginal(cfg);
    } catch (error) {
      console.error(
        "Error al cargar configuración de notificaciones del centro:",
        error
      );
      setErrorGlobal(
        "No se pudo cargar la configuración de notificaciones del centro. Usando valores por defecto."
      );
      if (usuario) {
        const base = crearConfigCentroNotificacionesPorDefecto(usuario);
        setConfigCentro(base);
        setConfigCentroOriginal(base);
      }
    } finally {
      setLoadingConfigCentro(false);
    }
  };

  const cargarPreferenciasNotificacionesUsuario = async () => {
    try {
      setLoadingPrefsUsuario(true);

      const res = await fetch("/api/users/preferencias/notificaciones", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.preferencias) {
        const base = crearPreferenciasNotificacionesUsuarioPorDefecto();
        setPrefsUsuario(base);
        setPrefsUsuarioOriginal(base);
        return;
      }

      const p = data.preferencias;

      const prefs: PreferenciasNotificacionesUsuario = {
        id_preferencia: p.id_preferencia,
        canales: {
          email: p.canales?.email ?? true,
          web: p.canales?.web ?? true,
          push_movil: p.canales?.push_movil ?? false,
          sms: p.canales?.sms ?? false,
        },
        frecuencia_resumen: p.frecuencia_resumen ?? "diario",
        prioridad_minima: p.prioridad_minima ?? "alta",
        ventanas_silencio: {
          habilitado: p.ventanas_silencio?.habilitado ?? false,
          desde: p.ventanas_silencio?.desde ?? "22:00",
          hasta: p.ventanas_silencio?.hasta ?? "07:00",
          solo_dias_habiles: p.ventanas_silencio?.solo_dias_habiles ?? true,
        },
        mutear_sonidos: p.mutear_sonidos ?? false,
        mostrar_banner: p.mostrar_banner ?? true,
        fecha_actualizacion: p.fecha_actualizacion ?? null,
      };

      setPrefsUsuario(prefs);
      setPrefsUsuarioOriginal(prefs);
    } catch (error) {
      console.error(
        "Error al cargar preferencias de notificaciones de usuario:",
        error
      );
      const base = crearPreferenciasNotificacionesUsuarioPorDefecto();
      setPrefsUsuario(base);
      setPrefsUsuarioOriginal(base);
      setErrorGlobal(
        "No se pudieron cargar tus preferencias personales de notificación. Usando valores por defecto."
      );
    } finally {
      setLoadingPrefsUsuario(false);
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

  const guardarConfigCentro = async () => {
    if (!configCentro || !usuario?.tecnico) return;

    try {
      setGuardandoCentro(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const metodo = configCentro.id_config ? "PUT" : "POST";

      const res = await fetch("/api/tecnico/notificaciones/config/centro", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configCentro,
          id_tecnico: usuario.tecnico.id_tecnico,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar configuración centro:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudo guardar la configuración de notificaciones del centro."
        );
        return;
      }

      let nuevaConfig: ConfigCentroNotificaciones = configCentro;

      if (data.config) {
        const base = crearConfigCentroNotificacionesPorDefecto(usuario);
        const cfgServer = data.config;
        nuevaConfig = {
          ...base,
          ...cfgServer,
          canales_notificacion: {
            ...base.canales_notificacion,
            ...(cfgServer.canales_notificacion || {}),
          },
          resumen_diario: {
            ...base.resumen_diario,
            ...(cfgServer.resumen_diario || {}),
          },
          alertas_criticas: {
            ...base.alertas_criticas,
            ...(cfgServer.alertas_criticas || {}),
          },
          recordatorios: {
            ...base.recordatorios,
            ...(cfgServer.recordatorios || {}),
          },
          copias: {
            ...base.copias,
            ...(cfgServer.copias || {}),
          },
          sonido_panel: {
            ...base.sonido_panel,
            ...(cfgServer.sonido_panel || {}),
          },
        };
      } else {
        nuevaConfig = {
          ...configCentro,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigCentro(nuevaConfig);
      setConfigCentroOriginal(nuevaConfig);
      setMensajeGlobal(
        `Configuración de notificaciones del centro "${nuevaConfig.nombre_centro}" guardada correctamente.`
      );
    } catch (error) {
      console.error("Error al guardar config centro:", error);
      setErrorGlobal(
        "Se produjo un error al guardar la configuración del centro."
      );
    } finally {
      setGuardandoCentro(false);
    }
  };

  const guardarPrefsUsuario = async () => {
    if (!prefsUsuario) return;

    try {
      setGuardandoUsuario(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const metodo = prefsUsuario.id_preferencia ? "PUT" : "POST";

      const res = await fetch("/api/users/preferencias/notificaciones", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefsUsuario),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar preferencias usuario:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron guardar tus preferencias personales de notificación."
        );
        return;
      }

      const serverPrefs = data.preferencias || data.data || {};
      const prefsFinal: PreferenciasNotificacionesUsuario = {
        ...prefsUsuario,
        ...serverPrefs,
        canales: {
          ...prefsUsuario.canales,
          ...(serverPrefs.canales || {}),
        },
        ventanas_silencio: {
          ...prefsUsuario.ventanas_silencio,
          ...(serverPrefs.ventanas_silencio || {}),
        },
        id_preferencia:
          serverPrefs.id_preferencia ?? prefsUsuario.id_preferencia,
        fecha_actualizacion:
          serverPrefs.fecha_actualizacion ??
          prefsUsuario.fecha_actualizacion ??
          new Date().toISOString(),
      };

      setPrefsUsuario(prefsFinal);
      setPrefsUsuarioOriginal(prefsFinal);
      setMensajeGlobal("Preferencias personales de notificación guardadas.");
    } catch (error) {
      console.error("Error al guardar preferencias usuario:", error);
      setErrorGlobal(
        "Se produjo un error al guardar tus preferencias personales."
      );
    } finally {
      setGuardandoUsuario(false);
    }
  };

  const guardarTodo = async () => {
    const promesas: Promise<void>[] = [];

    if (hayCambiosCentro) {
      promesas.push(guardarConfigCentro());
    }
    if (hayCambiosUsuario) {
      promesas.push(guardarPrefsUsuario());
    }

    if (promesas.length === 0) return;
    await Promise.all(promesas);
  };

  const restaurarCentroDesdeOriginal = () => {
    if (!configCentroOriginal) return;
    setConfigCentro(configCentroOriginal);
  };

  const restaurarCentroRecomendado = () => {
    if (!usuario) return;
    const base = crearConfigCentroNotificacionesPorDefecto(usuario);
    setConfigCentro((prev) =>
      prev ? { ...base, id_config: prev.id_config } : base
    );
  };

  const restaurarUsuarioDesdeOriginal = () => {
    if (!prefsUsuarioOriginal) return;
    setPrefsUsuario(prefsUsuarioOriginal);
  };

  const restaurarUsuarioRecomendado = () => {
    const base = crearPreferenciasNotificacionesUsuarioPorDefecto();
    setPrefsUsuario((prev) =>
      prev ? { ...base, id_preferencia: prev.id_preferencia } : base
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
              <Bell className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando configuración de notificaciones
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Ajustando alertas y avisos para tu centro...
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
            No tienes permisos para acceder a la configuración de notificaciones
            del módulo técnico.
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

  const cargandoContenido =
    loadingConfigCentro || !configCentro || loadingPrefsUsuario || !prefsUsuario;

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
                placeholder="Buscar opciones de notificación (centro, usuario, canal...)"
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
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2 z-50`}
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
                      href="/tecnico/configuracion/notificaciones"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Bell className="w-5 h-5" />
                      <span>Notificaciones</span>
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
              <span className="animate-wave inline-block">🔔</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Define cómo se notifican los eventos del módulo de tickets en tu{" "}
              <span className={tema.colores.texto}>centro</span> y cuáles{" "}
              <span className={tema.colores.texto}>avisos personales</span>{" "}
              quieres recibir como técnico.
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
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  cargarConfigCentroNotificaciones();
                  cargarPreferenciasNotificacionesUsuario();
                }}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={cargandoContenido}
              >
                <Loader2
                  className={`w-4 h-4 ${
                    cargandoContenido ? "animate-spin" : "opacity-60"
                  }`}
                />
                Recargar configuración
              </button>
              <button
                onClick={guardarTodo}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoCentro || guardandoUsuario}
              >
                <Save className="w-4 h-4" />
                {guardandoCentro || guardandoUsuario
                  ? "Guardando cambios..."
                  : "Guardar todo"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {configCentro?.ult_actualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Última actualización centro:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFecha(configCentro.ult_actualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  La configuración de notificaciones del centro aún no se ha
                  guardado en la base de datos.
                </p>
              )}
              {prefsUsuario?.fecha_actualizacion && (
                <p className={tema.colores.textoSecundario}>
                  Tus preferencias personales:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFecha(prefsUsuario.fecha_actualizacion)}
                  </span>
                </p>
              )}
              {hayCambios && (
                <p className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Hay cambios sin guardar en notificaciones.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mensajes globales */}
        {(mensajeGlobal || errorGlobal) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 ${
              mensajeGlobal
                ? "bg-emerald-500/10 border border-emerald-500/40"
                : "bg-red-500/10 border border-red-500/40"
            }`}
          >
            {mensajeGlobal ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`text-sm ${
                mensajeGlobal ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {mensajeGlobal || errorGlobal}
            </p>
          </div>
        )}

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={Bell}
            titulo="Canales del centro activos"
            valor={resumenCentro.canalesActivos}
            chip="Salidas de notificación"
            color="from-indigo-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={Building2}
            titulo="Destinatarios en copia"
            valor={resumenCentro.destinosCopia}
            chip="Jefaturas y soporte"
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertTriangle}
            titulo="Frecuencia alertas críticas"
            valor={resumenCentro.frecuenciaCriticos}
            chip="Minutos entre avisos"
            color="from-red-500 to-orange-500"
          />
          <ResumenCard
            tema={tema}
            icono={Activity}
            titulo="Volumen de sonidos"
            valor={resumenCentro.volumen}
            chip="Panel técnico"
            color="from-emerald-500 to-teal-500"
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {cargandoContenido ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando reglas de notificación del centro y tus preferencias...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
              {/* NOTIFICACIONES DEL CENTRO */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Reglas de notificación del centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Controla cómo se avisa a nivel de establecimiento. No
                        afecta a otros centros.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Habilitar módulo */}
                <div className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configCentro!.habilitado}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev ? { ...prev, habilitado: e.target.checked } : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Habilitar notificaciones en este centro
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Si desmarcas esta opción, se detienen los avisos
                        automáticos, pero el historial de tickets y eventos se
                        mantiene.
                      </p>
                    </div>
                  </label>

                  {/* Canales */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Canales de salida del centro
                    </p>
                    <div className="space-y-3">
                      {CANALES_CENTRO.map((canal) => (
                        <label
                          key={canal.id}
                          className="flex items-start gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 accent-indigo-500"
                            checked={
                              configCentro!.canales_notificacion[
                                canal.id as keyof ConfigCentroNotificaciones["canales_notificacion"]
                              ]
                            }
                            onChange={() =>
                              setConfigCentro((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      canales_notificacion: {
                                        ...prev.canales_notificacion,
                                        [canal.id]:
                                          !prev.canales_notificacion[canal.id as keyof ConfigCentroNotificaciones["canales_notificacion"]],
                                      },
                                    }
                                  : prev
                              )
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold ${tema.colores.texto} flex items-center gap-2`}
                            >
                              <canal.icon className="w-4 h-4" />
                              {canal.label}
                            </p>
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              {canal.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Resumen diario */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Resumen diario de tickets del centro
                      </p>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Activar
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500"
                          checked={configCentro!.resumen_diario.habilitado}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    resumen_diario: {
                                      ...prev.resumen_diario,
                                      habilitado: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Hora de envío
                      </span>
                      <input
                        type="time"
                        value={configCentro!.resumen_diario.hora_envio}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  resumen_diario: {
                                    ...prev.resumen_diario,
                                    hora_envio: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            configCentro!.resumen_diario.incluir_detalle
                          }
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    resumen_diario: {
                                      ...prev.resumen_diario,
                                      incluir_detalle: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Incluir detalle de tickets
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            configCentro!.resumen_diario.incluir_estadisticas
                          }
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    resumen_diario: {
                                      ...prev.resumen_diario,
                                      incluir_estadisticas: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Incluir métricas del día
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Alertas críticas */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Alertas inmediatas de tickets críticos
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-red-500"
                          checked={configCentro!.alertas_criticas.email}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    alertas_criticas: {
                                      ...prev.alertas_criticas,
                                      email: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Email inmediato
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-red-500"
                          checked={configCentro!.alertas_criticas.sms}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    alertas_criticas: {
                                      ...prev.alertas_criticas,
                                      sms: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          SMS para críticos
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-red-500"
                          checked={configCentro!.alertas_criticas.whatsapp}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    alertas_criticas: {
                                      ...prev.alertas_criticas,
                                      whatsapp: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          WhatsApp (cuando esté disponible)
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Repetir hasta que alguien la lea
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Activar
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-red-500"
                          checked={
                            configCentro!.alertas_criticas.repetir_hasta_leida
                          }
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    alertas_criticas: {
                                      ...prev.alertas_criticas,
                                      repetir_hasta_leida: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Frecuencia de repetición
                      </span>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={
                          configCentro!.alertas_criticas.frecuencia_minutos
                        }
                        onChange={(e) => {
                          const num = parseInt(e.target.value, 10);
                          if (Number.isNaN(num) || num <= 0) return;
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  alertas_criticas: {
                                    ...prev.alertas_criticas,
                                    frecuencia_minutos: num,
                                  },
                                }
                              : prev
                          );
                        }}
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                      />
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        min
                      </span>
                    </div>
                  </div>

                  {/* Recordatorios + copias */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Recordatorios y destinatarios en copia
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configCentro!.recordatorios.habilitado}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  recordatorios: {
                                    ...prev.recordatorios,
                                    habilitado: e.target.checked,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Enviar recordatorios de vencimiento
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            Avisar
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={
                              configCentro!.recordatorios
                                .dias_previos_vencimiento
                            }
                            onChange={(e) => {
                              const num = parseInt(e.target.value, 10);
                              if (Number.isNaN(num) || num <= 0) return;
                              setConfigCentro((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      recordatorios: {
                                        ...prev.recordatorios,
                                        dias_previos_vencimiento: num,
                                      },
                                    }
                                  : prev
                              );
                            }}
                            className={`w-16 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                          />
                          <span
                            className={`text-[11px] ${tema.colores.textoSecundario}`}
                          >
                            días antes
                          </span>
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-indigo-500"
                            checked={
                              configCentro!.recordatorios.incluir_vencidos
                            }
                            onChange={(e) =>
                              setConfigCentro((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      recordatorios: {
                                        ...prev.recordatorios,
                                        incluir_vencidos: e.target.checked,
                                      },
                                    }
                                  : prev
                              )
                            }
                          />
                          <span
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            Incluir también tickets ya vencidos en el resumen
                          </span>
                        </label>
                      </div>
                    </label>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500"
                          checked={configCentro!.copias.jefatura_centro}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    copias: {
                                      ...prev.copias,
                                      jefatura_centro: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Copia automática a jefatura del centro
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500"
                          checked={configCentro!.copias.mantencion_comunal}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    copias: {
                                      ...prev.copias,
                                      mantencion_comunal: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Copia al equipo comunal de mantención
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500"
                          checked={configCentro!.copias.administrador_sistema}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    copias: {
                                      ...prev.copias,
                                      administrador_sistema: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Copia al administrador de sistema
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Sonido panel */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Sonidos del panel técnico
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-indigo-500"
                        checked={configCentro!.sonido_panel.habilitado}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sonido_panel: {
                                    ...prev.sonido_panel,
                                    habilitado: e.target.checked,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <span
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Activar sonidos para eventos importantes en el panel
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Volumen
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={configCentro!.sonido_panel.volumen}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sonido_panel: {
                                    ...prev.sonido_panel,
                                    volumen: parseInt(e.target.value, 10),
                                  },
                                }
                              : prev
                          )
                        }
                        className="flex-1"
                      />
                      <span
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        {configCentro!.sonido_panel.volumen}%
                      </span>
                    </div>
                  </div>

                  {/* Acciones centro */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={restaurarCentroDesdeOriginal}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={!hayCambiosCentro}
                    >
                      Deshacer cambios del centro
                    </button>
                    <button
                      onClick={restaurarCentroRecomendado}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      Valores recomendados para este centro
                    </button>
                    <button
                      onClick={guardarConfigCentro}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={!hayCambiosCentro || guardandoCentro}
                    >
                      <Save className="w-4 h-4" />
                      {guardandoCentro
                        ? "Guardando centro..."
                        : "Guardar solo centro"}
                    </button>
                  </div>
                </div>
              </div>

              {/* PREFERENCIAS PERSONALES */}
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
                        Tus preferencias personales
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Controla qué tipos de eventos quieres que te notifiquen y
                        por qué canal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Canales personales */}
                  <div className="space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Canales personales de notificación
                    </p>
                    {CANALES_USUARIO.map((canal) => (
                      <label
                        key={canal.id}
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4 accent-indigo-500"
                          checked={
                            prefsUsuario!.canales[
                              canal.id as keyof PreferenciasNotificacionesUsuario["canales"]
                            ]
                          }
                          onChange={() =>
                            setPrefsUsuario((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    canales: {
                                      ...prev.canales,
                                      [canal.id]:
                                        !prev.canales[
                                          canal.id as keyof PreferenciasNotificacionesUsuario["canales"]
                                        ],
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold ${tema.colores.texto} flex items-center gap-2`}
                          >
                            <canal.icon className="w-4 h-4" />
                            {canal.label}
                          </p>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {canal.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Frecuencia resumen personal */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Resúmenes personales
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        {
                          id: "ninguno",
                          label: "Sin resúmenes",
                          desc: "Solo notificaciones en tiempo real.",
                        },
                        {
                          id: "diario",
                          label: "Diario",
                          desc: "Resumen de pendientes al final del día.",
                        },
                        {
                          id: "semanal",
                          label: "Semanal",
                          desc: "Foto general cada semana.",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setPrefsUsuario((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    frecuencia_resumen:
                                      opt.id as PreferenciasNotificacionesUsuario["frecuencia_resumen"],
                                  }
                                : prev
                            )
                          }
                          className={`px-3 py-2 rounded-xl border text-left text-xs transition-all duration-300 ${
                            prefsUsuario!.frecuencia_resumen === opt.id
                              ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent`
                              : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto}`
                          }`}
                        >
                          <p className="font-semibold">{opt.label}</p>
                          <p
                            className={`text-[11px] ${
                              prefsUsuario!.frecuencia_resumen === opt.id
                                ? "opacity-90"
                                : tema.colores.textoSecundario
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prioridad mínima */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      ¿Desde qué prioridad quieres ser notificado?
                    </p>
                    <div className="flex flex-col gap-2">
                      {(["critica", "alta", "media", "baja"] as NivelPrioridadNotificacion[]).map(
                        (nivel) => (
                          <label
                            key={nivel}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="prioridad_minima"
                              className="w-4 h-4 accent-indigo-500"
                              checked={prefsUsuario!.prioridad_minima === nivel}
                              onChange={() =>
                                setPrefsUsuario((prev) =>
                                  prev
                                    ? { ...prev, prioridad_minima: nivel }
                                    : prev
                                )
                              }
                            />
                            <div>
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                {PRIORIDADES_LABEL[nivel]}
                              </p>
                            </div>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Ventanas de silencio */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Ventanas de silencio
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Activar
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={prefsUsuario!.ventanas_silencio.habilitado}
                          onChange={(e) =>
                            setPrefsUsuario((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    ventanas_silencio: {
                                      ...prev.ventanas_silencio,
                                      habilitado: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                      </label>
                    </div>
                    <p className={tema.colores.textoSecundario}>
                      Durante esta franja horaria se limitan los avisos
                      invasivos (sonidos, SMS, etc.), pero podrás verlos en la
                      bandeja.
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Desde
                        </span>
                        <input
                          type="time"
                          value={prefsUsuario!.ventanas_silencio.desde}
                          onChange={(e) =>
                            setPrefsUsuario((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    ventanas_silencio: {
                                      ...prev.ventanas_silencio,
                                      desde: e.target.value,
                                    },
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
                          Hasta
                        </span>
                        <input
                          type="time"
                          value={prefsUsuario!.ventanas_silencio.hasta}
                          onChange={(e) =>
                            setPrefsUsuario((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    ventanas_silencio: {
                                      ...prev.ventanas_silencio,
                                      hasta: e.target.value,
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-indigo-500"
                        checked={
                          prefsUsuario!.ventanas_silencio.solo_dias_habiles
                        }
                        onChange={(e) =>
                          setPrefsUsuario((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  ventanas_silencio: {
                                    ...prev.ventanas_silencio,
                                    solo_dias_habiles: e.target.checked,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <span
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Aplicar solo de lunes a viernes
                      </span>
                    </label>
                  </div>

                  {/* Sonidos / banners personales */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Sonidos y banners en tu sesión
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-indigo-500"
                        checked={prefsUsuario!.mutear_sonidos}
                        onChange={(e) =>
                          setPrefsUsuario((prev) =>
                            prev ? { ...prev, mutear_sonidos: e.target.checked } : prev
                          )
                        }
                      />
                      <span
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Silenciar sonidos en este dispositivo
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-indigo-500"
                        checked={prefsUsuario!.mostrar_banner}
                        onChange={(e) =>
                          setPrefsUsuario((prev) =>
                            prev
                              ? { ...prev, mostrar_banner: e.target.checked }
                              : prev
                          )
                        }
                      />
                      <span
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Mostrar banners flotantes cuando haya un evento nuevo
                      </span>
                    </label>
                  </div>

                  {/* Acciones usuario */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={restaurarUsuarioDesdeOriginal}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={!hayCambiosUsuario}
                    >
                      Deshacer mis cambios
                    </button>
                    <button
                      onClick={restaurarUsuarioRecomendado}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      Volver a valores recomendados
                    </button>
                    <button
                      onClick={guardarPrefsUsuario}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={!hayCambiosUsuario || guardandoUsuario}
                    >
                      <Save className="w-4 h-4" />
                      {guardandoUsuario
                        ? "Guardando mis preferencias..."
                        : "Guardar solo personales"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* BARRA ABAJO */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm">
                <p className={tema.colores.textoSecundario}>
                  Esta página controla la{" "}
                  <span className={tema.colores.texto}>
                    configuración de notificaciones del centro
                  </span>{" "}
                  y tus{" "}
                  <span className={tema.colores.texto}>
                    preferencias personales como técnico
                  </span>
                  . No modifica reglas globales de otros módulos ni datos
                  clínicos.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={guardarTodo}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={!hayCambios || guardandoCentro || guardandoUsuario}
                >
                  <Save className="w-4 h-4" />
                  {guardandoCentro || guardandoUsuario
                    ? "Guardando todo..."
                    : "Guardar ahora"}
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
                © 2025 AnyssaMed / INFOGES – Configuración de Notificaciones.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Notificaciones
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

// ========================================
// COMPONENTE RESUMEN
// ========================================

function ResumenCard({
  tema,
  icono: Icono,
  titulo,
  valor,
  chip,
  color,
}: {
  tema: ConfiguracionTema;
  icono: any;
  titulo: string;
  valor: number;
  chip: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icono className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
        {isNaN(valor) ? 0 : valor}
      </div>
      <div
        className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
      >
        {titulo}
      </div>
      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${tema.colores.hover}`}
        >
          <ZapIcon className="w-3 h-3" />
          {chip}
        </span>
      </div>
    </div>
  );
}
