"use client";

import { useEffect, useMemo, useState } from "react";
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
  Clipboard,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  MapPin as MapPinIcon,
  MonitorSmartphone,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X,
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

type NivelSeguridad = "basico" | "reforzado" | "estricto";

interface ConfigSeguridadTecnico {
  id_config: number | null;
  id_usuario: number;
  id_tecnico: number;
  id_centro: number | null;

  nivel_seguridad: NivelSeguridad;

  login_2fa_obligatorio: boolean;
  login_2fa_methods_enabled: {
    app: boolean;
    sms: boolean;
    email: boolean;
    llave: boolean;
  };

  permitir_recordar_dispositivo_dias: number;

  bloqueo_por_intentos_fallidos: {
    habilitado: boolean;
    max_intentos: number;
    ventana_minutos: number;
    duracion_bloqueo_minutos: number;
  };

  sesiones_config: {
    expira_inactividad_minutos: number;
    max_sesiones_activas: number;
    cerrar_otras_sesiones_al_login: boolean;
    aviso_nueva_sesion_email: boolean;
    aviso_nueva_sesion_push: boolean;
  };

  cambios_criticos: {
    requiere_reauth_password: boolean;
    requiere_2fa: boolean;
    registrar_auditoria: boolean;
    notificar_email: boolean;
  };

  restricciones_ubicacion: {
    habilitado: boolean;
    paises_permitidos: string[];
    bloquear_vpn_proxy: boolean;
  };

  ult_actualizacion: string | null;
}

// ========================================
// TEMAS (mismos que tu página de configuración)
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Shield,
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
    icono: ShieldCheck,
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
    icono: Globe,
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
// HELPERS
// ========================================

function crearConfigSeguridadPorDefecto(
  usuario: UsuarioSesion
): ConfigSeguridadTecnico {
  const now = new Date().toISOString();
  const tecnico = usuario.tecnico;

  return {
    id_config: null,
    id_usuario: usuario.id_usuario,
    id_tecnico: tecnico?.id_tecnico ?? 0,
    id_centro: tecnico?.centro?.id_centro ?? tecnico?.id_centro ?? null,

    nivel_seguridad: "reforzado",

    login_2fa_obligatorio: true,
    login_2fa_methods_enabled: {
      app: true,
      sms: false,
      email: true,
      llave: false,
    },

    permitir_recordar_dispositivo_dias: 30,

    bloqueo_por_intentos_fallidos: {
      habilitado: true,
      max_intentos: 5,
      ventana_minutos: 15,
      duracion_bloqueo_minutos: 30,
    },

    sesiones_config: {
      expira_inactividad_minutos: 30,
      max_sesiones_activas: 5,
      cerrar_otras_sesiones_al_login: true,
      aviso_nueva_sesion_email: true,
      aviso_nueva_sesion_push: true,
    },

    cambios_criticos: {
      requiere_reauth_password: true,
      requiere_2fa: true,
      registrar_auditoria: true,
      notificar_email: true,
    },

    restricciones_ubicacion: {
      habilitado: false,
      paises_permitidos: [],
      bloquear_vpn_proxy: true,
    },

    ult_actualizacion: now,
  };
}

function formatearFechaHora(fecha: string | null) {
  if (!fecha) return "No definido";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function obtenerSaludo() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function obtenerColorDisponibilidad(
  disponibilidad: "disponible" | "ocupado" | "fuera_servicio"
) {
  if (disponibilidad === "disponible")
    return "bg-green-500/20 text-green-300 border-green-400/40";
  if (disponibilidad === "ocupado")
    return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
  return "bg-red-500/20 text-red-200 border-red-400/40";
}

function nivelSeguridadLabel(n: NivelSeguridad) {
  if (n === "basico") return "Básico";
  if (n === "reforzado") return "Reforzado";
  return "Estricto";
}

function nivelSeguridadIndex(n: NivelSeguridad) {
  if (n === "basico") return 1;
  if (n === "reforzado") return 2;
  return 3;
}

// ========================================
// PAGE
// ========================================

export default function ConfiguracionSeguridadPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);

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

  const [configSeguridad, setConfigSeguridad] =
    useState<ConfigSeguridadTecnico | null>(null);
  const [configOriginal, setConfigOriginal] =
    useState<ConfigSeguridadTecnico | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState<string | null>(null);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambios = useMemo(() => {
    if (!configSeguridad || !configOriginal) return false;
    return JSON.stringify(configSeguridad) !== JSON.stringify(configOriginal);
  }, [configSeguridad, configOriginal]);

  const resumenSeguridad = useMemo(() => {
    if (!configSeguridad) {
      return {
        nivelIndex: 0,
        metodos2fa: 0,
        inactividad: 0,
        maxIntentos: 0,
      };
    }

    const metodos2fa = Object.values(
      configSeguridad.login_2fa_methods_enabled
    ).filter(Boolean).length;

    return {
      nivelIndex: nivelSeguridadIndex(configSeguridad.nivel_seguridad),
      metodos2fa,
      inactividad: configSeguridad.sesiones_config.expira_inactividad_minutos,
      maxIntentos: configSeguridad.bloqueo_por_intentos_fallidos.max_intentos,
    };
  }, [configSeguridad]);

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
      cargarConfiguracionSeguridad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.tecnico?.id_tecnico]);

  useEffect(() => {
    if (!mensajeConfig && !errorConfig) return;
    const t = setTimeout(() => {
      setMensajeConfig(null);
      setErrorConfig(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [mensajeConfig, errorConfig]);

  // ========================================
  // CARGA DE DATOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoadingUsuario(true);
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("No hay sesión activa");

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
            `Acceso denegado. Este módulo de Seguridad es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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
      setLoadingUsuario(false);
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

  const cargarConfiguracionSeguridad = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingConfig(true);
      setErrorConfig(null);

      const idCentro =
        usuario.tecnico?.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_usuario: String(usuario.id_usuario),
        id_tecnico: String(usuario.tecnico.id_tecnico),
        id_centro: idCentro ? String(idCentro) : "",
      });

      const res = await fetch(
        `/api/tecnico/seguridad/config?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({}));

      const base = crearConfigSeguridadPorDefecto(usuario);

      if (!res.ok || !data.success) {
        console.warn(
          "No se encontró configuración de seguridad, usando valores por defecto"
        );
        setConfigSeguridad(base);
        setConfigOriginal(base);
        return;
      }

      const cfgServer = data.config || {};

      const cfg: ConfigSeguridadTecnico = {
        ...base,
        ...cfgServer,
        login_2fa_methods_enabled: {
          ...base.login_2fa_methods_enabled,
          ...(cfgServer.login_2fa_methods_enabled || {}),
        },
        bloqueo_por_intentos_fallidos: {
          ...base.bloqueo_por_intentos_fallidos,
          ...(cfgServer.bloqueo_por_intentos_fallidos || {}),
        },
        sesiones_config: {
          ...base.sesiones_config,
          ...(cfgServer.sesiones_config || {}),
        },
        cambios_criticos: {
          ...base.cambios_criticos,
          ...(cfgServer.cambios_criticos || {}),
        },
        restricciones_ubicacion: {
          ...base.restricciones_ubicacion,
          ...(cfgServer.restricciones_ubicacion || {}),
          paises_permitidos:
            cfgServer.restricciones_ubicacion?.paises_permitidos ??
            base.restricciones_ubicacion.paises_permitidos,
        },
      };

      setConfigSeguridad(cfg);
      setConfigOriginal(cfg);
    } catch (error) {
      console.error("Error al cargar configuración de seguridad:", error);
      setErrorConfig(
        "No se pudo cargar la configuración de seguridad. Usando valores recomendados."
      );
      if (usuario) {
        const base = crearConfigSeguridadPorDefecto(usuario);
        setConfigSeguridad(base);
        setConfigOriginal(base);
      }
    } finally {
      setLoadingConfig(false);
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

  const aplicarNivelRecomendado = (nivel: NivelSeguridad) => {
    if (!usuario) return;
    const base = crearConfigSeguridadPorDefecto(usuario);

    if (nivel === "basico") {
      setConfigSeguridad((prev) =>
        prev
          ? {
              ...prev,
              nivel_seguridad: "basico",
              login_2fa_obligatorio: false,
              login_2fa_methods_enabled: {
                app: true,
                sms: false,
                email: true,
                llave: false,
              },
              sesiones_config: {
                ...prev.sesiones_config,
                expira_inactividad_minutos: 60,
                max_sesiones_activas: 10,
                cerrar_otras_sesiones_al_login: false,
              },
              bloqueo_por_intentos_fallidos: {
                ...prev.bloqueo_por_intentos_fallidos,
                habilitado: true,
                max_intentos: 7,
                ventana_minutos: 30,
                duracion_bloqueo_minutos: 15,
              },
            }
          : { ...base, nivel_seguridad: "basico" }
      );
    } else if (nivel === "reforzado") {
      setConfigSeguridad((prev) =>
        prev
          ? {
              ...prev,
              nivel_seguridad: "reforzado",
              login_2fa_obligatorio: true,
              login_2fa_methods_enabled: {
                app: true,
                sms: false,
                email: true,
                llave: false,
              },
              sesiones_config: {
                ...prev.sesiones_config,
                expira_inactividad_minutos: 30,
                max_sesiones_activas: 5,
                cerrar_otras_sesiones_al_login: true,
              },
              bloqueo_por_intentos_fallidos: {
                ...prev.bloqueo_por_intentos_fallidos,
                habilitado: true,
                max_intentos: 5,
                ventana_minutos: 15,
                duracion_bloqueo_minutos: 30,
              },
            }
          : { ...base, nivel_seguridad: "reforzado" }
      );
    } else {
      setConfigSeguridad((prev) =>
        prev
          ? {
              ...prev,
              nivel_seguridad: "estricto",
              login_2fa_obligatorio: true,
              login_2fa_methods_enabled: {
                app: true,
                sms: true,
                email: true,
                llave: true,
              },
              sesiones_config: {
                ...prev.sesiones_config,
                expira_inactividad_minutos: 15,
                max_sesiones_activas: 3,
                cerrar_otras_sesiones_al_login: true,
              },
              bloqueo_por_intentos_fallidos: {
                ...prev.bloqueo_por_intentos_fallidos,
                habilitado: true,
                max_intentos: 3,
                ventana_minutos: 10,
                duracion_bloqueo_minutos: 60,
              },
              restricciones_ubicacion: {
                ...prev.restricciones_ubicacion,
                bloquear_vpn_proxy: true,
              },
            }
          : { ...base, nivel_seguridad: "estricto" }
      );
    }
  };

  const guardarConfiguracionSeguridad = async () => {
    if (!configSeguridad || !usuario?.tecnico) return;

    try {
      setGuardandoConfig(true);
      setMensajeConfig(null);
      setErrorConfig(null);

      const metodo = configSeguridad.id_config ? "PUT" : "POST";

      const res = await fetch("/api/tecnico/seguridad/config", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configSeguridad,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar configuración de seguridad:", data);
        setErrorConfig(
          data?.message ||
            "No se pudo guardar la configuración de seguridad. Inténtalo nuevamente."
        );
        return;
      }

      let nuevaConfig: ConfigSeguridadTecnico = configSeguridad;

      if (data.config) {
        const base = crearConfigSeguridadPorDefecto(usuario);
        const cfgServer = data.config;

        nuevaConfig = {
          ...base,
          ...cfgServer,
          login_2fa_methods_enabled: {
            ...base.login_2fa_methods_enabled,
            ...(cfgServer.login_2fa_methods_enabled || {}),
          },
          bloqueo_por_intentos_fallidos: {
            ...base.bloqueo_por_intentos_fallidos,
            ...(cfgServer.bloqueo_por_intentos_fallidos || {}),
          },
          sesiones_config: {
            ...base.sesiones_config,
            ...(cfgServer.sesiones_config || {}),
          },
          cambios_criticos: {
            ...base.cambios_criticos,
            ...(cfgServer.cambios_criticos || {}),
          },
          restricciones_ubicacion: {
            ...base.restricciones_ubicacion,
            ...(cfgServer.restricciones_ubicacion || {}),
          },
        };
      } else {
        nuevaConfig = {
          ...configSeguridad,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigSeguridad(nuevaConfig);
      setConfigOriginal(nuevaConfig);
      setMensajeConfig(
        `Configuración de seguridad guardada correctamente en el centro "${
          usuario.tecnico?.centro?.nombre ?? "sin nombre"
        }".`
      );
    } catch (error) {
      console.error("Error al guardar configuración de seguridad:", error);
      setErrorConfig(
        "Se produjo un error al guardar la configuración de seguridad. Verifica la conexión."
      );
    } finally {
      setGuardandoConfig(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!configOriginal) return;
    setConfigSeguridad(configOriginal);
  };

  const restaurarRecomendados = () => {
    if (!usuario) return;
    const base = crearConfigSeguridadPorDefecto(usuario);
    setConfigSeguridad(base);
  };

  // ========================================
  // ESTADOS ESPECIALES
  // ========================================

  if (loadingUsuario) {
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
            Cargando panel de Seguridad
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Validando tu sesión y preparando las políticas de seguridad para tu
            cuenta y centro...
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
            No tienes permisos para acceder a la configuración de seguridad del
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

  const colorDisp = obtenerColorDisponibilidad(disponibilidad);

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
                placeholder="Buscar opciones dentro de seguridad de la cuenta y del centro..."
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
                className={`px-3 py-2 rounded-xl text-xs font-semibold border ${colorDisp}`}
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
                      href="/tecnico/configuracion/sesiones"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <MonitorSmartphone className="w-5 h-5" />
                      <span>Sesiones & Dispositivos</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion/api-key"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <KeyRound className="w-5 h-5" />
                      <span>API Keys</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion/seguridad"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Seguridad</span>
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
              Define el{" "}
              <span className={tema.colores.texto}>nivel de seguridad</span> de
              tu cuenta técnica y de tu centro, sin afectar la configuración
              global del sistema.
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
                onClick={cargarConfiguracionSeguridad}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingConfig}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingConfig ? "animate-spin" : "opacity-60"
                  }`}
                />
                Recargar configuración
              </button>
              <button
                onClick={guardarConfiguracionSeguridad}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoConfig}
              >
                <Save className="w-4 h-4" />
                {guardandoConfig
                  ? "Guardando cambios..."
                  : "Guardar configuración de seguridad"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {configSeguridad?.ult_actualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Última actualización:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFechaHora(configSeguridad.ult_actualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  Esta configuración aún no se ha guardado en la base de datos.
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
        {(mensajeConfig || errorConfig) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 ${
              mensajeConfig
                ? "bg-emerald-500/10 border border-emerald-500/40"
                : "bg-red-500/10 border border-red-500/40"
            }`}
          >
            {mensajeConfig ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`text-sm ${
                mensajeConfig ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {mensajeConfig || errorConfig}
            </p>
          </div>
        )}

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={Shield}
            titulo="Nivel de seguridad"
            valor={resumenSeguridad.nivelIndex}
            chip={`Modo ${configSeguridad ? nivelSeguridadLabel(configSeguridad.nivel_seguridad) : "N/A"}`}
            color="from-indigo-500 to-purple-500"
          />
          <ResumenCard
            tema={tema}
            icono={Lock}
            titulo="Métodos 2FA activos"
            valor={resumenSeguridad.metodos2fa}
            chip="App, SMS, email, llave"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={MonitorSmartphone}
            titulo="Timeout de sesión (min)"
            valor={resumenSeguridad.inactividad}
            chip="Inactividad máxima"
            color="from-blue-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertTriangle}
            titulo="Intentos fallidos"
            valor={resumenSeguridad.maxIntentos}
            chip="Antes de bloquear"
            color="from-red-500 to-orange-500"
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loadingConfig || !configSeguridad ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando políticas de seguridad del centro y tu cuenta técnica...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Fila 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Nivel global */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Nivel global de seguridad
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Ajusta el perfil general de seguridad de tu usuario y del
                      centro para este módulo.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {(["basico", "reforzado", "estricto"] as NivelSeguridad[]).map(
                    (nivel) => (
                      <label
                        key={nivel}
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="nivel_seguridad"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={configSeguridad.nivel_seguridad === nivel}
                          onChange={() => aplicarNivelRecomendado(nivel)}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${tema.colores.texto}`}
                          >
                            Modo {nivelSeguridadLabel(nivel)}
                          </p>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {nivel === "basico" &&
                              "Equilibrado para uso diario. 2FA recomendado pero no siempre obligatorio."}
                            {nivel === "reforzado" &&
                              "Recomendado para técnicos de centro. 2FA obligatorio y sesiones más controladas."}
                            {nivel === "estricto" &&
                              "Máxima seguridad para cuentas sensibles. 2FA fuerte, límites estrictos y detección de abuso agresiva."}
                          </p>
                        </div>
                      </label>
                    )
                  )}

                  <p
                    className={`mt-3 text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Puedes usar estos modos como base y luego ajustar parámetros
                    finos en los bloques de abajo.
                  </p>
                </div>
              </div>

              {/* 2FA */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Autenticación y segundo factor
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Define cómo deben autenticarse las cuentas técnicas.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={configSeguridad.login_2fa_obligatorio}
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                login_2fa_obligatorio: e.target.checked,
                              }
                            : prev
                        )
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Exigir 2FA para iniciar sesión
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Si se desactiva, se podrá iniciar sesión solo con
                        usuario/contraseña (no recomendado para técnicos).
                      </p>
                    </div>
                  </label>

                  <div className="border-t border-dashed border-gray-600/40 pt-3 mt-2 space-y-2">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Métodos de segundo factor permitidos
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configSeguridad.login_2fa_methods_enabled.app}
                          onChange={(e) =>
                            setConfigSeguridad((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    login_2fa_methods_enabled: {
                                      ...prev.login_2fa_methods_enabled,
                                      app: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          App autenticadora (TOTP)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={configSeguridad.login_2fa_methods_enabled.sms}
                          onChange={(e) =>
                            setConfigSeguridad((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    login_2fa_methods_enabled: {
                                      ...prev.login_2fa_methods_enabled,
                                      sms: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          SMS / teléfono
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            configSeguridad.login_2fa_methods_enabled.email
                          }
                          onChange={(e) =>
                            setConfigSeguridad((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    login_2fa_methods_enabled: {
                                      ...prev.login_2fa_methods_enabled,
                                      email: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Código por correo
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-500"
                          checked={
                            configSeguridad.login_2fa_methods_enabled.llave
                          }
                          onChange={(e) =>
                            setConfigSeguridad((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    login_2fa_methods_enabled: {
                                      ...prev.login_2fa_methods_enabled,
                                      llave: e.target.checked,
                                    },
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Llave física / WebAuthn
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-600/40 pt-3 mt-2 space-y-2">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Recordar dispositivo
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={tema.colores.textoSecundario}>
                        Permitir omitir 2FA en dispositivos confiables por
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={365}
                        value={
                          configSeguridad.permitir_recordar_dispositivo_dias
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  permitir_recordar_dispositivo_dias:
                                    parseInt(e.target.value || "0", 10) || 0,
                                }
                              : prev
                          )
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>días</span>
                    </div>
                    <p className={tema.colores.textoSecundario}>
                      Pon 0 para exigir siempre 2FA incluso en dispositivos ya
                      usados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sesiones */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <MonitorSmartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Sesiones y dispositivos
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Controla tiempo de sesión, cantidad de inicios activos y
                      alertas de nuevos dispositivos.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className={tema.colores.textoSecundario}>
                      Expirar por inactividad
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={5}
                        max={480}
                        value={
                          configSeguridad.sesiones_config
                            .expira_inactividad_minutos
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sesiones_config: {
                                    ...prev.sesiones_config,
                                    expira_inactividad_minutos:
                                      parseInt(e.target.value || "0", 10) || 5,
                                  },
                                }
                              : prev
                          )
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={tema.colores.textoSecundario}>
                      Máx. sesiones activas
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={
                          configSeguridad.sesiones_config.max_sesiones_activas
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sesiones_config: {
                                    ...prev.sesiones_config,
                                    max_sesiones_activas:
                                      parseInt(e.target.value || "1", 10) || 1,
                                  },
                                }
                              : prev
                          )
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>
                        sesiones
                      </span>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={
                        configSeguridad.sesiones_config
                          .cerrar_otras_sesiones_al_login
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                sesiones_config: {
                                  ...prev.sesiones_config,
                                  cerrar_otras_sesiones_al_login:
                                    e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Cerrar automáticamente otras sesiones al iniciar sesión
                      desde un nuevo dispositivo.
                    </span>
                  </label>

                  <div className="border-t border-dashed border-gray-600/40 pt-3 mt-2 space-y-2">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Alertas de nuevas sesiones
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 accent-indigo-500"
                        checked={
                          configSeguridad.sesiones_config
                            .aviso_nueva_sesion_email
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sesiones_config: {
                                    ...prev.sesiones_config,
                                    aviso_nueva_sesion_email: e.target.checked,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <span className={tema.colores.textoSecundario}>
                        Enviar correo cuando se inicie sesión en un dispositivo
                        nuevo.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 accent-indigo-500"
                        checked={
                          configSeguridad.sesiones_config
                            .aviso_nueva_sesion_push
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sesiones_config: {
                                    ...prev.sesiones_config,
                                    aviso_nueva_sesion_push: e.target.checked,
                                  },
                                }
                              : prev
                          )
                        }
                      />
                      <span className={tema.colores.textoSecundario}>
                        Mostrar alerta dentro del módulo técnico cuando se
                        detecte un inicio de sesión nuevo.
                      </span>
                    </label>
                  </div>

                  <Link
                    href="/tecnico/configuracion/sesiones"
                    className={`inline-flex items-center gap-2 mt-2 text-[11px] font-semibold ${tema.colores.acento}`}
                  >
                    <MonitorSmartphone className="w-3 h-3" />
                    Ver detalle de sesiones y dispositivos
                  </Link>
                </div>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* Intentos fallidos */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Intentos fallidos y bloqueo automático
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Evita ataques de fuerza bruta contra cuentas técnicas.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-red-500"
                      checked={
                        configSeguridad.bloqueo_por_intentos_fallidos.habilitado
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                bloqueo_por_intentos_fallidos: {
                                  ...prev.bloqueo_por_intentos_fallidos,
                                  habilitado: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Activar bloqueo automático de la cuenta tras superar un
                      número de intentos fallidos.
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <span className={tema.colores.textoSecundario}>
                      Máx. intentos fallidos
                    </span>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={
                        configSeguridad.bloqueo_por_intentos_fallidos
                          .max_intentos
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                bloqueo_por_intentos_fallidos: {
                                  ...prev.bloqueo_por_intentos_fallidos,
                                  max_intentos:
                                    parseInt(e.target.value || "3", 10) || 3,
                                },
                              }
                            : prev
                        )
                      }
                      className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={tema.colores.textoSecundario}>
                      Ventana de cálculo
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={
                          configSeguridad.bloqueo_por_intentos_fallidos
                            .ventana_minutos
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  bloqueo_por_intentos_fallidos: {
                                    ...prev.bloqueo_por_intentos_fallidos,
                                    ventana_minutos:
                                      parseInt(e.target.value || "5", 10) || 5,
                                  },
                                }
                              : prev
                          )
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={tema.colores.textoSecundario}>
                      Duración del bloqueo
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={5}
                        max={1440}
                        value={
                          configSeguridad.bloqueo_por_intentos_fallidos
                            .duracion_bloqueo_minutos
                        }
                        onChange={(e) =>
                          setConfigSeguridad((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  bloqueo_por_intentos_fallidos: {
                                    ...prev.bloqueo_por_intentos_fallidos,
                                    duracion_bloqueo_minutos:
                                      parseInt(e.target.value || "5", 10) || 5,
                                  },
                                }
                              : prev
                          )
                        }
                        className={`w-24 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>min</span>
                    </div>
                  </div>

                  <p
                    className={`mt-2 text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    El desbloqueo manual y la gestión de cuentas bloqueadas se
                    realiza desde el módulo de administración avanzado.
                  </p>
                </div>
              </div>

              {/* Ubicación */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Ubicación y red
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Restringe desde qué lugares se puede acceder al módulo
                      técnico.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={configSeguridad.restricciones_ubicacion.habilitado}
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                restricciones_ubicacion: {
                                  ...prev.restricciones_ubicacion,
                                  habilitado: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Activar restricciones por país / región para inicios de
                      sesión.
                    </span>
                  </label>

                  <div className="space-y-1">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Países permitidos (códigos ISO o nombres)
                    </p>
                    <textarea
                      rows={3}
                      value={configSeguridad.restricciones_ubicacion.paises_permitidos.join(
                        ", "
                      )}
                      onChange={(e) => {
                        const list = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                restricciones_ubicacion: {
                                  ...prev.restricciones_ubicacion,
                                  paises_permitidos: list,
                                },
                              }
                            : prev
                        );
                      }}
                      className={`w-full px-3 py-2 rounded-xl resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                    <p className={tema.colores.textoSecundario}>
                      Ej: Chile, Perú, AR, CL, etc. Si está vacío, no se aplica
                      filtro por país (solo otras reglas).
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={
                        configSeguridad.restricciones_ubicacion
                          .bloquear_vpn_proxy
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                restricciones_ubicacion: {
                                  ...prev.restricciones_ubicacion,
                                  bloquear_vpn_proxy: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Intentar bloquear accesos desde IP conocidas de VPN /
                      proxy (depende de la capa de red global).
                    </span>
                  </label>
                </div>
              </div>

              {/* Cambios críticos */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Clipboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Acciones críticas y auditoría
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Control adicional cuando se modifican configuraciones
                      sensibles.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={
                        configSeguridad.cambios_criticos
                          .requiere_reauth_password
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                cambios_criticos: {
                                  ...prev.cambios_criticos,
                                  requiere_reauth_password: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Pedir re-autenticación de contraseña para cambiar
                      parámetros críticos (ej: 2FA, API Keys, seguridad centro).
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={configSeguridad.cambios_criticos.requiere_2fa}
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                cambios_criticos: {
                                  ...prev.cambios_criticos,
                                  requiere_2fa: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Exigir también 2FA cuando se cambien políticas de
                      seguridad o se gestionen sensores críticos.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={
                        configSeguridad.cambios_criticos.registrar_auditoria
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                cambios_criticos: {
                                  ...prev.cambios_criticos,
                                  registrar_auditoria: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Registrar en bitácora interna todos los cambios
                      importantes (recomendado).
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-indigo-500"
                      checked={
                        configSeguridad.cambios_criticos.notificar_email
                      }
                      onChange={(e) =>
                        setConfigSeguridad((prev) =>
                          prev
                            ? {
                                ...prev,
                                cambios_criticos: {
                                  ...prev.cambios_criticos,
                                  notificar_email: e.target.checked,
                                },
                              }
                            : prev
                        )
                      }
                    />
                    <span className={tema.colores.textoSecundario}>
                      Enviar correo cuando alguien cambie configuración de
                      seguridad o revoque API Keys importantes.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Barra inferior */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm flex items-start gap-2">
                <Shield className={`w-4 h-4 mt-0.5 ${tema.colores.texto}`} />
                <p className={tema.colores.textoSecundario}>
                  Esta página controla únicamente la{" "}
                  <span className={tema.colores.texto}>
                    seguridad del módulo técnico y de tu centro
                  </span>
                  . No reemplaza las políticas globales corporativas, pero te
                  permite adaptarlas al nivel de riesgo y operación de tu
                  establecimiento.
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
                  onClick={restaurarRecomendados}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  Valores recomendados
                </button>
                <button
                  onClick={guardarConfiguracionSeguridad}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={!hayCambios || guardandoConfig}
                >
                  <Save className="w-4 h-4" />
                  {guardandoConfig ? "Guardando..." : "Guardar ahora"}
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
                © 2025 AnyssaMed / INFOGES – Seguridad del Módulo Técnico.
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
