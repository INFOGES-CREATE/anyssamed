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
  HeartPulse,
  Shield,
  KeyRound,
  Lock,
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

interface ConfigCentroPremium {
  id_config: number | null;
  id_centro: number;
  nombre_centro: string;
  premium_activo: boolean;
  fecha_activacion: string | null;
  fecha_expiracion: string | null;
  auto_renovacion: boolean;
  modulos: {
    tickets_avanzado: boolean;
    analytics: boolean;
    inventario_avanzado: boolean;
    biomedico: boolean;
  };
  limites: {
    tecnicos_incluidos: number;
    tecnicos_usados: number;
    sucursales_incluidas: number;
    sucursales_usadas: number;
    almacenamiento_gb: number;
  };
  seguridad: {
    pin_obligatorio: boolean;
    longitud_minima: number;
    intentos_maximos: number;
    bloqueo_minutos: number;
    caducidad_dias: number;
  };
  restriccion_ip: {
    habilitada: boolean;
    ips_permitidas: string[];
  };
  auditoria: {
    habilitada: boolean;
    retencion_dias: number;
  };
  ult_actualizacion: string | null;
}

interface PreferenciasPremiumUsuario {
  id_preferencia?: number;
  pin_configurado: boolean;
  ultimo_cambio_pin: string | null;
  requiere_pin_para: {
    login: boolean;
    aprobar_tickets_criticos: boolean;
    ver_informacion_sensible: boolean;
    gestionar_configuracion: boolean;
  };
  factor_doble: {
    habilitado: boolean;
    via_email: boolean;
    via_app: boolean;
  };
  recordar_dispositivo_dias: number;
  fecha_actualizacion?: string | null;
}

// ========================================
// TEMAS (mismo sistema que otras páginas)
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Globe,
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
    icono: Bell,
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

// ========================================
// HELPERS
// ========================================

function crearConfigCentroPremiumPorDefecto(
  usuario: UsuarioSesion
): ConfigCentroPremium {
  const now = new Date().toISOString();
  const centro = usuario.tecnico?.centro;

  return {
    id_config: null,
    id_centro: centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0,
    nombre_centro: centro?.nombre ?? "Centro sin nombre",
    premium_activo: false,
    fecha_activacion: now,
    fecha_expiracion: null,
    auto_renovacion: false,
    modulos: {
      tickets_avanzado: true,
      analytics: false,
      inventario_avanzado: false,
      biomedico: false,
    },
    limites: {
      tecnicos_incluidos: 10,
      tecnicos_usados: 1,
      sucursales_incluidas: 3,
      sucursales_usadas: 1,
      almacenamiento_gb: 20,
    },
    seguridad: {
      pin_obligatorio: true,
      longitud_minima: 4,
      intentos_maximos: 5,
      bloqueo_minutos: 15,
      caducidad_dias: 180,
    },
    restriccion_ip: {
      habilitada: false,
      ips_permitidas: [],
    },
    auditoria: {
      habilitada: true,
      retencion_dias: 365,
    },
    ult_actualizacion: now,
  };
}

function crearPreferenciasPremiumUsuarioPorDefecto(): PreferenciasPremiumUsuario {
  return {
    pin_configurado: false,
    ultimo_cambio_pin: null,
    requiere_pin_para: {
      login: true,
      aprobar_tickets_criticos: true,
      ver_informacion_sensible: true,
      gestionar_configuracion: true,
    },
    factor_doble: {
      habilitado: false,
      via_email: true,
      via_app: false,
    },
    recordar_dispositivo_dias: 7,
    fecha_actualizacion: null,
  };
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "No definido";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatearFechaHora(fecha: string | null) {
  if (!fecha) return "No definido";
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

function calcularDiasRestantes(fechaExpira: string | null): number {
  if (!fechaExpira) return 0;
  const hoy = new Date();
  const exp = new Date(fechaExpira);
  const diff = exp.getTime() - hoy.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dias < 0 ? 0 : dias;
}

// ========================================
// PAGE
// ========================================

export default function ConfiguracionPinPremiumPage() {
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
    useState<ConfigCentroPremium | null>(null);
  const [configCentroOriginal, setConfigCentroOriginal] =
    useState<ConfigCentroPremium | null>(null);
  const [loadingConfigCentro, setLoadingConfigCentro] = useState(true);
  const [guardandoCentro, setGuardandoCentro] = useState(false);

  const [prefsPremium, setPrefsPremium] =
    useState<PreferenciasPremiumUsuario | null>(null);
  const [prefsPremiumOriginal, setPrefsPremiumOriginal] =
    useState<PreferenciasPremiumUsuario | null>(null);
  const [loadingPrefsPremium, setLoadingPrefsPremium] = useState(true);
  const [guardandoPremium, setGuardandoPremium] = useState(false);

  const [mensajeGlobal, setMensajeGlobal] = useState<string | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [pinConfirmacion, setPinConfirmacion] = useState("");
  const [cambiandoPin, setCambiandoPin] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambiosCentro = useMemo(() => {
    if (!configCentro || !configCentroOriginal) return false;
    return JSON.stringify(configCentro) !== JSON.stringify(configCentroOriginal);
  }, [configCentro, configCentroOriginal]);

  const hayCambiosUsuario = useMemo(() => {
    if (!prefsPremium || !prefsPremiumOriginal) return false;
    const { fecha_actualizacion: _f1, ...rest } = prefsPremium;
    const { fecha_actualizacion: _f2, ...restOriginal } =
      prefsPremiumOriginal;
    return JSON.stringify(rest) !== JSON.stringify(restOriginal);
  }, [prefsPremium, prefsPremiumOriginal]);

  const hayCambios = hayCambiosCentro || hayCambiosUsuario;

  const resumen = useMemo(() => {
    if (!configCentro || !prefsPremium) {
      return {
        modulosActivos: 0,
        diasRestantes: 0,
        tecnicosUso: 0,
        reglasSeguridad: 0,
      };
    }

    const modulosActivos = Object.values(configCentro.modulos).filter(Boolean)
      .length;

    const diasRestantes = calcularDiasRestantes(configCentro.fecha_expiracion);

    const tecnicosUso = Math.min(
      configCentro.limites.tecnicos_usados,
      configCentro.limites.tecnicos_incluidos
    );

    let reglasSeguridad = 0;
    if (configCentro.seguridad.pin_obligatorio) reglasSeguridad += 1;
    if (configCentro.restriccion_ip.habilitada) reglasSeguridad += 1;
    if (configCentro.auditoria.habilitada) reglasSeguridad += 1;
    if (prefsPremium.factor_doble.habilitado) reglasSeguridad += 1;

    return { modulosActivos, diasRestantes, tecnicosUso, reglasSeguridad };
  }, [configCentro, prefsPremium]);

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
      cargarConfigCentroPremium();
      cargarPreferenciasPremiumUsuario();
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
            `Acceso denegado. Este módulo Premium/PIN es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarConfigCentroPremium = async () => {
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
        `/api/tecnico/premium/config/centro?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));
      const base = crearConfigCentroPremiumPorDefecto(usuario);

      if (!res.ok || !data.success) {
        console.warn(
          "No se encontró configuración premium del centro, usando valores por defecto"
        );
        setConfigCentro(base);
        setConfigCentroOriginal(base);
        return;
      }

      const cfgServer = data.config || {};

      const cfg: ConfigCentroPremium = {
        ...base,
        ...cfgServer,
        modulos: {
          ...base.modulos,
          ...(cfgServer.modulos || {}),
        },
        limites: {
          ...base.limites,
          ...(cfgServer.limites || {}),
        },
        seguridad: {
          ...base.seguridad,
          ...(cfgServer.seguridad || {}),
        },
        restriccion_ip: {
          ...base.restriccion_ip,
          ...(cfgServer.restriccion_ip || {}),
          ips_permitidas:
            cfgServer.restriccion_ip?.ips_permitidas ??
            base.restriccion_ip.ips_permitidas,
        },
        auditoria: {
          ...base.auditoria,
          ...(cfgServer.auditoria || {}),
        },
      };

      setConfigCentro(cfg);
      setConfigCentroOriginal(cfg);
    } catch (error) {
      console.error("Error al cargar configuración premium centro:", error);
      setErrorGlobal(
        "No se pudo cargar la configuración Premium del centro. Usando valores por defecto."
      );
      if (usuario) {
        const base = crearConfigCentroPremiumPorDefecto(usuario);
        setConfigCentro(base);
        setConfigCentroOriginal(base);
      }
    } finally {
      setLoadingConfigCentro(false);
    }
  };

  const cargarPreferenciasPremiumUsuario = async () => {
    try {
      setLoadingPrefsPremium(true);

      const res = await fetch("/api/users/preferencias/premium", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.preferencias) {
        const base = crearPreferenciasPremiumUsuarioPorDefecto();
        setPrefsPremium(base);
        setPrefsPremiumOriginal(base);
        return;
      }

      const p = data.preferencias;

      const prefs: PreferenciasPremiumUsuario = {
        id_preferencia: p.id_preferencia,
        pin_configurado: p.pin_configurado ?? false,
        ultimo_cambio_pin: p.ultimo_cambio_pin ?? null,
        requiere_pin_para: {
          login: p.requiere_pin_para?.login ?? true,
          aprobar_tickets_criticos:
            p.requiere_pin_para?.aprobar_tickets_criticos ?? true,
          ver_informacion_sensible:
            p.requiere_pin_para?.ver_informacion_sensible ?? true,
          gestionar_configuracion:
            p.requiere_pin_para?.gestionar_configuracion ?? true,
        },
        factor_doble: {
          habilitado: p.factor_doble?.habilitado ?? false,
          via_email: p.factor_doble?.via_email ?? true,
          via_app: p.factor_doble?.via_app ?? false,
        },
        recordar_dispositivo_dias: p.recordar_dispositivo_dias ?? 7,
        fecha_actualizacion: p.fecha_actualizacion ?? null,
      };

      setPrefsPremium(prefs);
      setPrefsPremiumOriginal(prefs);
    } catch (error) {
      console.error(
        "Error al cargar preferencias premium de usuario:",
        error
      );
      const base = crearPreferenciasPremiumUsuarioPorDefecto();
      setPrefsPremium(base);
      setPrefsPremiumOriginal(base);
      setErrorGlobal(
        "No se pudieron cargar tus preferencias de PIN/Premium. Usando valores por defecto."
      );
    } finally {
      setLoadingPrefsPremium(false);
    }
  };

  // ========================================
  // ACCIONES
  // ========================================

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

  const obtenerColorDisponibilidad = () => {
    if (disponibilidad === "disponible")
      return "bg-green-500/20 text-green-300 border-green-400/40";
    if (disponibilidad === "ocupado")
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
    return "bg-red-500/20 text-red-200 border-red-400/40";
  };

  const guardarConfigCentro = async () => {
    if (!configCentro || !usuario?.tecnico) return;

    try {
      setGuardandoCentro(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const metodo = configCentro.id_config ? "PUT" : "POST";

      const res = await fetch("/api/tecnico/premium/config/centro", {
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
        console.error("Error al guardar configuración premium centro:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudo guardar la configuración Premium del centro."
        );
        return;
      }

      let nuevaConfig: ConfigCentroPremium = configCentro;

      if (data.config) {
        const base = crearConfigCentroPremiumPorDefecto(usuario);
        const cfgServer = data.config;
        nuevaConfig = {
          ...base,
          ...cfgServer,
          modulos: {
            ...base.modulos,
            ...(cfgServer.modulos || {}),
          },
          limites: {
            ...base.limites,
            ...(cfgServer.limites || {}),
          },
          seguridad: {
            ...base.seguridad,
            ...(cfgServer.seguridad || {}),
          },
          restriccion_ip: {
            ...base.restriccion_ip,
            ...(cfgServer.restriccion_ip || {}),
          },
          auditoria: {
            ...base.auditoria,
            ...(cfgServer.auditoria || {}),
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
        `Configuración Premium del centro "${nuevaConfig.nombre_centro}" guardada correctamente.`
      );
    } catch (error) {
      console.error("Error al guardar config premium centro:", error);
      setErrorGlobal("Se produjo un error al guardar la configuración Premium.");
    } finally {
      setGuardandoCentro(false);
    }
  };

  const guardarPrefsPremiumUsuario = async () => {
    if (!prefsPremium) return;

    try {
      setGuardandoPremium(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const metodo = prefsPremium.id_preferencia ? "PUT" : "POST";

      const res = await fetch("/api/users/preferencias/premium", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefsPremium),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar preferencias premium usuario:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron guardar tus preferencias de PIN/Premium."
        );
        return;
      }

      const serverPrefs = data.preferencias || data.data || {};
      const prefsFinal: PreferenciasPremiumUsuario = {
        ...prefsPremium,
        ...serverPrefs,
        requiere_pin_para: {
          ...prefsPremium.requiere_pin_para,
          ...(serverPrefs.requiere_pin_para || {}),
        },
        factor_doble: {
          ...prefsPremium.factor_doble,
          ...(serverPrefs.factor_doble || {}),
        },
        id_preferencia:
          serverPrefs.id_preferencia ?? prefsPremium.id_preferencia,
        fecha_actualizacion:
          serverPrefs.fecha_actualizacion ??
          prefsPremium.fecha_actualizacion ??
          new Date().toISOString(),
      };

      setPrefsPremium(prefsFinal);
      setPrefsPremiumOriginal(prefsFinal);
      setMensajeGlobal("Preferencias de PIN y seguridad guardadas.");
    } catch (error) {
      console.error("Error al guardar preferencias premium:", error);
      setErrorGlobal(
        "Se produjo un error al guardar tus preferencias de seguridad."
      );
    } finally {
      setGuardandoPremium(false);
    }
  };

  const guardarTodo = async () => {
    const promesas: Promise<void>[] = [];
    if (hayCambiosCentro) promesas.push(guardarConfigCentro());
    if (hayCambiosUsuario) promesas.push(guardarPrefsPremiumUsuario());
    if (promesas.length === 0) return;
    await Promise.all(promesas);
  };

  const restaurarCentroOriginal = () => {
    if (!configCentroOriginal) return;
    setConfigCentro(configCentroOriginal);
  };

  const restaurarCentroDefault = () => {
    if (!usuario) return;
    const base = crearConfigCentroPremiumPorDefecto(usuario);
    setConfigCentro((prev) =>
      prev ? { ...base, id_config: prev.id_config } : base
    );
  };

  const restaurarUsuarioOriginal = () => {
    if (!prefsPremiumOriginal) return;
    setPrefsPremium(prefsPremiumOriginal);
  };

  const restaurarUsuarioDefault = () => {
    const base = crearPreferenciasPremiumUsuarioPorDefecto();
    setPrefsPremium((prev) =>
      prev ? { ...base, id_preferencia: prev.id_preferencia } : base
    );
  };

  const solicitarResetPin = async () => {
    try {
      setResetEnviado(false);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/pin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al solicitar reset de PIN:", data);
        setErrorGlobal(
          data?.message || "No se pudo solicitar el reinicio del PIN."
        );
        return;
      }

      setResetEnviado(true);
      setMensajeGlobal(
        "Solicitud de reinicio de PIN enviada. Revisa tu correo o app según tu configuración."
      );
    } catch (error) {
      console.error("Error al solicitar reset de PIN:", error);
      setErrorGlobal("Error al solicitar el reinicio del PIN.");
    }
  };

  const actualizarPin = async () => {
    if (!prefsPremium) return;

    if (!pinActual || !pinNuevo || !pinConfirmacion) {
      setErrorGlobal("Completa PIN actual, nuevo y confirmación.");
      return;
    }

    if (pinNuevo !== pinConfirmacion) {
      setErrorGlobal("El nuevo PIN y la confirmación no coinciden.");
      return;
    }

    if (
      pinNuevo.length <
      (configCentro?.seguridad.longitud_minima ?? 4)
    ) {
      setErrorGlobal(
        `El PIN debe tener al menos ${
          configCentro?.seguridad.longitud_minima ?? 4
        } dígitos.`
      );
      return;
    }

    try {
      setCambiandoPin(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/pin/actualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pin_actual: pinActual,
          pin_nuevo: pinNuevo,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cambiar PIN:", data);
        setErrorGlobal(
          data?.message || "No se pudo actualizar tu PIN de seguridad."
        );
        return;
      }

      setPinActual("");
      setPinNuevo("");
      setPinConfirmacion("");

      const now = new Date().toISOString();
      const nuevasPrefs: PreferenciasPremiumUsuario = {
        ...prefsPremium,
        pin_configurado: true,
        ultimo_cambio_pin: now,
        fecha_actualizacion: now,
      };

      setPrefsPremium(nuevasPrefs);
      setPrefsPremiumOriginal(nuevasPrefs);
      setMensajeGlobal("PIN actualizado correctamente.");
    } catch (error) {
      console.error("Error al cambiar PIN:", error);
      setErrorGlobal("Error al actualizar tu PIN.");
    } finally {
      setCambiandoPin(false);
    }
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
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando seguridad Premium & PIN
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Validando tus permisos y configuración del centro...
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
            No tienes permisos para acceder a la configuración Premium/PIN del
            módulo técnico.
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
    loadingConfigCentro || !configCentro || loadingPrefsPremium || !prefsPremium;

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
                placeholder="Buscar opciones de Premium / PIN / seguridad..."
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
                                  ? formatearFechaHora(alerta.fecha_creacion)
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
                    <Link
                      href="/tecnico/configuracion/pin"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Premium & PIN</span>
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
              <span className="animate-wave inline-block">🛡️</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Administra la{" "}
              <span className={tema.colores.texto}>
                suscripción Premium del centro
              </span>{" "}
              y tu{" "}
              <span className={tema.colores.texto}>
                PIN de seguridad técnico
              </span>
              .
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
                  cargarConfigCentroPremium();
                  cargarPreferenciasPremiumUsuario();
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
                disabled={!hayCambios || guardandoCentro || guardandoPremium}
              >
                <Save className="w-4 h-4" />
                {guardandoCentro || guardandoPremium
                  ? "Guardando cambios..."
                  : "Guardar todo"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {configCentro?.ult_actualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Premium centro actualizado:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFechaHora(configCentro.ult_actualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  La configuración Premium del centro aún no se ha guardado.
                </p>
              )}
              {prefsPremium?.fecha_actualizacion && (
                <p className={tema.colores.textoSecundario}>
                  Tus preferencias de seguridad:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFechaHora(prefsPremium.fecha_actualizacion)}
                  </span>
                </p>
              )}
              {hayCambios && (
                <p className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Hay cambios sin guardar en Premium/PIN.
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
            icono={Shield}
            titulo="Módulos Premium activos"
            valor={resumen.modulosActivos}
            chip="Tickets / Analytics / etc."
            color="from-indigo-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={Clock3}
            titulo="Días restantes Premium"
            valor={resumen.diasRestantes}
            chip="Vigencia suscripción"
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={User}
            titulo="Técnicos incluidos usados"
            valor={resumen.tecnicosUso}
            chip="Capacidad del centro"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={KeyRound}
            titulo="Reglas de seguridad activas"
            valor={resumen.reglasSeguridad}
            chip="PIN / IP / 2FA / auditoría"
            color="from-orange-500 to-red-500"
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
                Cargando configuración Premium del centro y tu PIN...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
              {/* PREMIUM CENTRO */}
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
                        Premium del centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Administra qué trae el plan Premium para este centro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Estado Premium */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configCentro!.premium_activo}
                      onChange={(e) =>
                        setConfigCentro((prev) =>
                          prev
                            ? { ...prev, premium_activo: e.target.checked }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Activar Premium en este centro
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Si desmarcas esta opción, se deshabilitan las funciones
                        avanzadas pero no se pierden los datos.
                      </p>
                    </div>
                  </label>

                  {/* Fechas y auto-renovación */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Vigencia y renovación
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Activado desde
                        </p>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          {formatearFecha(configCentro!.fecha_activacion)}
                        </p>
                      </div>
                      <div>
                        <label
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Expira el
                        </label>
                        <div>
                          <input
                            type="date"
                            value={
                              configCentro!.fecha_expiracion
                                ? configCentro!.fecha_expiracion.slice(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              setConfigCentro((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      fecha_expiracion: e.target.value
                                        ? new Date(
                                            e.target.value
                                          ).toISOString()
                                        : null,
                                    }
                                  : prev
                              )
                            }
                            className={`px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configCentro!.auto_renovacion}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    auto_renovacion: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Renovación automática al vencer
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Módulos Premium */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Módulos Premium habilitados
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configCentro!.modulos.tickets_avanzado}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    modulos: {
                                      ...prev.modulos,
                                      tickets_avanzado: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Tickets avanzados (SLA, matrices, vistas dinámicas)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configCentro!.modulos.analytics}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    modulos: {
                                      ...prev.modulos,
                                      analytics: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Panel de Analytics y métricas avanzadas
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configCentro!.modulos.inventario_avanzado}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    modulos: {
                                      ...prev.modulos,
                                      inventario_avanzado: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Inventario avanzado (stock por sucursal, alertas)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configCentro!.modulos.biomedico}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    modulos: {
                                      ...prev.modulos,
                                      biomedico: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Módulo biomédico (equipos críticos, mantenimiento)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Límites */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Límites de uso del plan
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Técnicos incluidos
                        </p>
                        <input
                          type="number"
                          min={1}
                          value={configCentro!.limites.tecnicos_incluidos}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    limites: {
                                      ...prev.limites,
                                      tecnicos_incluidos: Math.max(
                                        1,
                                        parseInt(e.target.value || "1", 10)
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <p
                          className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}
                        >
                          Usados:{" "}
                          <span className={tema.colores.texto}>
                            {configCentro!.limites.tecnicos_usados}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Sucursales incluidas
                        </p>
                        <input
                          type="number"
                          min={1}
                          value={configCentro!.limites.sucursales_incluidas}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    limites: {
                                      ...prev.limites,
                                      sucursales_incluidas: Math.max(
                                        1,
                                        parseInt(e.target.value || "1", 10)
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <p
                          className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}
                        >
                          Usadas:{" "}
                          <span className={tema.colores.texto}>
                            {configCentro!.limites.sucursales_usadas}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Almacenamiento (GB)
                        </p>
                        <input
                          type="number"
                          min={1}
                          value={configCentro!.limites.almacenamiento_gb}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    limites: {
                                      ...prev.limites,
                                      almacenamiento_gb: Math.max(
                                        1,
                                        parseInt(e.target.value || "1", 10)
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seguridad de PIN + IP + auditoría */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Seguridad a nivel de centro
                    </p>

                    {/* PIN obligatorio */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-red-500"
                        checked={configCentro!.seguridad.pin_obligatorio}
                        onChange={(e) =>
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  seguridad: {
                                    ...prev.seguridad,
                                    pin_obligatorio: e.target.checked,
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
                          Exigir PIN a todos los técnicos
                        </p>
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          El PIN se usa como segundo factor para acciones
                          sensibles dentro del módulo.
                        </p>
                      </div>
                    </label>

                    {/* Parámetros PIN */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Longitud mínima del PIN
                        </p>
                        <input
                          type="number"
                          min={4}
                          max={10}
                          value={configCentro!.seguridad.longitud_minima}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    seguridad: {
                                      ...prev.seguridad,
                                      longitud_minima: Math.min(
                                        10,
                                        Math.max(
                                          4,
                                          parseInt(e.target.value || "4", 10)
                                        )
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Intentos máximos antes de bloqueo
                        </p>
                        <input
                          type="number"
                          min={3}
                          max={10}
                          value={configCentro!.seguridad.intentos_maximos}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    seguridad: {
                                      ...prev.seguridad,
                                      intentos_maximos: Math.min(
                                        10,
                                        Math.max(
                                          3,
                                          parseInt(e.target.value || "3", 10)
                                        )
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Minutos de bloqueo
                        </p>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={configCentro!.seguridad.bloqueo_minutos}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    seguridad: {
                                      ...prev.seguridad,
                                      bloqueo_minutos: Math.min(
                                        120,
                                        Math.max(
                                          5,
                                          parseInt(e.target.value || "5", 10)
                                        )
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Caducidad del PIN (días)
                        </p>
                        <input
                          type="number"
                          min={30}
                          max={365}
                          value={configCentro!.seguridad.caducidad_dias}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    seguridad: {
                                      ...prev.seguridad,
                                      caducidad_dias: Math.min(
                                        365,
                                        Math.max(
                                          30,
                                          parseInt(e.target.value || "30", 10)
                                        )
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-full px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                    </div>

                    {/* Restricción IP */}
                    <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-semibold ${tema.colores.texto}`}
                        >
                          Restricción de IP (acceso desde redes autorizadas)
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
                            checked={configCentro!.restriccion_ip.habilitada}
                            onChange={(e) =>
                              setConfigCentro((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      restriccion_ip: {
                                        ...prev.restriccion_ip,
                                        habilitada: e.target.checked,
                                      },
                                    }
                                  : prev
                              )
                            }
                          />
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="IPs permitidas (una por línea, ejemplo: 192.168.0.10)"
                        value={configCentro!.restriccion_ip.ips_permitidas.join(
                          "\n"
                        )}
                        onChange={(e) => {
                          const ips = e.target.value
                            .split("\n")
                            .map((ip) => ip.trim())
                            .filter(Boolean);
                          setConfigCentro((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  restriccion_ip: {
                                    ...prev.restriccion_ip,
                                    ips_permitidas: ips,
                                  },
                                }
                              : prev
                          );
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-xs resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>

                    {/* Auditoría */}
                    <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-semibold ${tema.colores.texto}`}
                        >
                          Bitácora de auditoría
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
                            checked={configCentro!.auditoria.habilitada}
                            onChange={(e) =>
                              setConfigCentro((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      auditoria: {
                                        ...prev.auditoria,
                                        habilitada: e.target.checked,
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
                          Días de retención
                        </span>
                        <input
                          type="number"
                          min={30}
                          max={3650}
                          value={configCentro!.auditoria.retencion_dias}
                          onChange={(e) =>
                            setConfigCentro((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    auditoria: {
                                      ...prev.auditoria,
                                      retencion_dias: Math.max(
                                        30,
                                        parseInt(e.target.value || "30", 10)
                                      ),
                                    },
                                  }
                                : prev
                            )
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-xs text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                      </div>
                    </div>

                    {/* Acciones centro */}
                    <div className="border-t border-dashed border-gray-600/40 pt-4 mt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={restaurarCentroOriginal}
                        className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={!hayCambiosCentro}
                      >
                        Deshacer cambios Premium
                      </button>
                      <button
                        onClick={restaurarCentroDefault}
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
                          ? "Guardando Premium..."
                          : "Guardar solo Premium"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PREFERENCIAS PIN / USUARIO */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Tu PIN y seguridad personal
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Define cuándo se te pedirá PIN y cómo quieres proteger tu
                        sesión.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Estado PIN */}
                  <div className="flex items-center justify-between border-b border-dashed border-gray-600/40 pb-3 mb-2">
                    <div>
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Estado de tu PIN
                      </p>
                      <p
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Último cambio:{" "}
                        <span className={tema.colores.texto}>
                          {formatearFecha(
                            prefsPremium!.ultimo_cambio_pin ?? null
                          )}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                        prefsPremium!.pin_configurado
                          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                          : "bg-red-500/20 text-red-200 border border-red-400/40"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      {prefsPremium!.pin_configurado ? "PIN configurado" : "PIN pendiente"}
                    </span>
                  </div>

                  {/* Cambio de PIN */}
                  <div className="space-y-2">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Cambiar tu PIN
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="password"
                        autoComplete="off"
                        placeholder="PIN actual"
                        value={pinActual}
                        onChange={(e) => setPinActual(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <input
                        type="password"
                        autoComplete="off"
                        placeholder="Nuevo PIN"
                        value={pinNuevo}
                        onChange={(e) => setPinNuevo(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <input
                        type="password"
                        autoComplete="off"
                        placeholder="Confirmar nuevo PIN"
                        value={pinConfirmacion}
                        onChange={(e) => setPinConfirmacion(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <button
                        onClick={actualizarPin}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                        disabled={cambiandoPin}
                      >
                        {cambiandoPin ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                        {cambiandoPin ? "Actualizando PIN..." : "Guardar nuevo PIN"}
                      </button>
                      <button
                        onClick={solicitarResetPin}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        <Mail className="w-4 h-4" />
                        Enviar enlace de reinicio
                      </button>
                      {resetEnviado && (
                        <span className="text-[11px] text-emerald-300">
                          Solicitud enviada ✔
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dónde exigir PIN */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      ¿En qué acciones quieres que se pida PIN?
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={prefsPremium!.requiere_pin_para.login}
                          onChange={(e) =>
                            setPrefsPremium((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    requiere_pin_para: {
                                      ...prev.requiere_pin_para,
                                      login: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Al iniciar sesión en este dispositivo
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            prefsPremium!.requiere_pin_para
                              .aprobar_tickets_criticos
                          }
                          onChange={(e) =>
                            setPrefsPremium((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    requiere_pin_para: {
                                      ...prev.requiere_pin_para,
                                      aprobar_tickets_criticos:
                                        e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Para aprobar / cerrar tickets críticos
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            prefsPremium!.requiere_pin_para
                              .ver_informacion_sensible
                          }
                          onChange={(e) =>
                            setPrefsPremium((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    requiere_pin_para: {
                                      ...prev.requiere_pin_para,
                                      ver_informacion_sensible:
                                        e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Al ver información sensible del ticket (datos críticos
                          del equipo)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            prefsPremium!.requiere_pin_para
                              .gestionar_configuracion
                          }
                          onChange={(e) =>
                            setPrefsPremium((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    requiere_pin_para: {
                                      ...prev.requiere_pin_para,
                                      gestionar_configuracion:
                                        e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Al cambiar configuración del centro / Premium
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 2FA */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-3 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Segundo factor (2FA) personal
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-emerald-500"
                        checked={prefsPremium!.factor_doble.habilitado}
                        onChange={(e) =>
                          setPrefsPremium((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  factor_doble: {
                                    ...prev.factor_doble,
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
                        Activar segundo factor además de PIN (recomendado)
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={prefsPremium!.factor_doble.via_email}
                          onChange={(e) =>
                            setPrefsPremium((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    factor_doble: {
                                      ...prev.factor_doble,
                                      via_email: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Código por correo electrónico
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={prefsPremium!.factor_doble.via_app}
                          onChange={(e) =>
                            setPrefsPremium((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    factor_doble: {
                                      ...prev.factor_doble,
                                      via_app: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          Confirmación desde app móvil
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Recordar este dispositivo
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={prefsPremium!.recordar_dispositivo_dias}
                        onChange={(e) =>
                          setPrefsPremium((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  recordar_dispositivo_dias: Math.max(
                                    0,
                                    parseInt(e.target.value || "0", 10)
                                  ),
                                }
                              : prev
                          )
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-xs text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        días (0 = nunca)
                      </span>
                    </div>
                  </div>

                  {/* Acciones usuario */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={restaurarUsuarioOriginal}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={!hayCambiosUsuario}
                    >
                      Deshacer cambios de seguridad
                    </button>
                    <button
                      onClick={restaurarUsuarioDefault}
                      className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      Volver a valores recomendados
                    </button>
                    <button
                      onClick={guardarPrefsPremiumUsuario}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={!hayCambiosUsuario || guardandoPremium}
                    >
                      <Save className="w-4 h-4" />
                      {guardandoPremium
                        ? "Guardando seguridad..."
                        : "Guardar solo mis preferencias"}
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
                    suscripción Premium del centro
                  </span>{" "}
                  y tus{" "}
                  <span className={tema.colores.texto}>
                    reglas personales de PIN y seguridad
                  </span>
                  . No cambia datos clínicos ni de pacientes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={guardarTodo}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={!hayCambios || guardandoCentro || guardandoPremium}
                >
                  <Save className="w-4 h-4" />
                  {guardandoCentro || guardandoPremium
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
                © 2025 AnyssaMed / INFOGES – Premium & PIN.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Seguridad
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
