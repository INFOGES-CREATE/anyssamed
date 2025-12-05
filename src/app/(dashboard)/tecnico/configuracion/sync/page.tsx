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
  Cloud,
  Database,
  HardDrive,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  X,
  Zap as ZapIcon,
  AlertCircle as AlertCircleIcon,
  User,
  Link2,
  Clock3,
  TrendingUp,
  Layers,
} from "lucide-react";

// =====================================================
// TIPOS
// =====================================================

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
    cardHover: string;
    gradienteCard: string;
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

export type MotorId =
  | "his"
  | "cmdb"
  | "monitoreo"
  | "backup"
  | "directorio_activo"
  | "bus_interno";

type PoliticaConflictos = "preferir_remoto" | "preferir_local" | "preguntar";

interface ConfigSyncCentro {
  id_config_sync: number | null;
  id_centro: number;
  habilitado: boolean;
  motores: Record<MotorId, boolean>;
  frecuencia_minutos: Record<MotorId, number>;
  endpoints: Record<MotorId, string>;
  ult_ejecuciones: Record<MotorId, string | null>;
  ventanas: {
    horario_inicio: string;
    horario_fin: string;
    permitir_fuera_horario: boolean;
  };
  reintentos_maximos: number;
  politica_conflictos: PoliticaConflictos;
  enviar_alerta_falla: boolean;
  enviar_resumen_diario: boolean;
  pausar_sync_si_mantenimiento: boolean;
  ult_actualizacion: string | null;
}

// =====================================================
// CONSTANTES - TEMAS PREMIUM
// =====================================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50/30 to-indigo-50/40",
      fondoSecundario: "bg-white",
      texto: "text-slate-900",
      textoSecundario: "text-slate-600",
      primario: "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
      secundario: "bg-slate-100 hover:bg-slate-200",
      acento: "text-indigo-600",
      borde: "border-slate-200/60",
      sombra: "shadow-2xl shadow-indigo-500/10",
      gradiente: "from-indigo-600 via-blue-600 to-cyan-600",
      sidebar: "bg-white/95 backdrop-blur-2xl border-slate-200/60",
      header: "bg-white/90 backdrop-blur-2xl border-slate-200/60",
      card: "bg-white/80 backdrop-blur-sm border-slate-200/60",
      hover: "hover:bg-slate-50/80",
      cardHover: "hover:shadow-xl hover:shadow-indigo-500/20 hover:border-indigo-300/60",
      gradienteCard: "from-indigo-50/50 to-blue-50/50",
    },
  },
  dark: {
    nombre: "Oscuro Elegante",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-slate-900 to-slate-950",
      fondoSecundario: "bg-slate-900/95",
      texto: "text-slate-50",
      textoSecundario: "text-slate-400",
      primario: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-slate-800/80 hover:bg-slate-700/80",
      acento: "text-indigo-400",
      borde: "border-slate-800/60",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-600 via-purple-600 to-pink-600",
      sidebar: "bg-slate-900/95 backdrop-blur-2xl border-slate-800/60",
      header: "bg-slate-900/90 backdrop-blur-2xl border-slate-800/60",
      card: "bg-slate-900/60 backdrop-blur-sm border-slate-800/60",
      hover: "hover:bg-slate-800/60",
      cardHover: "hover:shadow-xl hover:shadow-indigo-500/30 hover:border-indigo-500/60",
      gradienteCard: "from-slate-900/80 to-slate-800/80",
    },
  },
  blue: {
    nombre: "Azul Corporativo",
    icono: Wifi,
    colores: {
      fondo: "from-blue-950 via-cyan-950/80 to-slate-950",
      fondoSecundario: "bg-blue-900/95",
      texto: "text-cyan-50",
      textoSecundario: "text-cyan-300/80",
      primario: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
      secundario: "bg-blue-900/80 hover:bg-blue-800/80",
      acento: "text-cyan-400",
      borde: "border-cyan-900/60",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-600 via-blue-600 to-indigo-600",
      sidebar: "bg-blue-950/95 backdrop-blur-2xl border-cyan-900/60",
      header: "bg-blue-950/90 backdrop-blur-2xl border-cyan-900/60",
      card: "bg-blue-900/60 backdrop-blur-sm border-cyan-900/60",
      hover: "hover:bg-blue-900/60",
      cardHover: "hover:shadow-xl hover:shadow-cyan-500/30 hover:border-cyan-500/60",
      gradienteCard: "from-blue-950/80 to-cyan-950/80",
    },
  },
  purple: {
    nombre: "Púrpura Premium",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950/80 to-slate-950",
      fondoSecundario: "bg-purple-900/95",
      texto: "text-purple-50",
      textoSecundario: "text-purple-300/80",
      primario: "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700",
      secundario: "bg-purple-900/80 hover:bg-purple-800/80",
      acento: "text-fuchsia-400",
      borde: "border-purple-900/60",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-600 via-purple-600 to-pink-600",
      sidebar: "bg-purple-950/95 backdrop-blur-2xl border-purple-900/60",
      header: "bg-purple-950/90 backdrop-blur-2xl border-purple-900/60",
      card: "bg-purple-900/60 backdrop-blur-sm border-purple-900/60",
      hover: "hover:bg-purple-900/60",
      cardHover: "hover:shadow-xl hover:shadow-fuchsia-500/30 hover:border-fuchsia-500/60",
      gradienteCard: "from-purple-950/80 to-fuchsia-950/80",
    },
  },
  green: {
    nombre: "Verde Operacional",
    icono: Activity,
    colores: {
      fondo: "from-emerald-950 via-teal-950/80 to-slate-950",
      fondoSecundario: "bg-emerald-900/95",
      texto: "text-emerald-50",
      textoSecundario: "text-emerald-300/80",
      primario: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
      secundario: "bg-emerald-900/80 hover:bg-emerald-800/80",
      acento: "text-emerald-400",
      borde: "border-emerald-900/60",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-600 via-teal-600 to-cyan-600",
      sidebar: "bg-emerald-950/95 backdrop-blur-2xl border-emerald-900/60",
      header: "bg-emerald-950/90 backdrop-blur-2xl border-emerald-900/60",
      card: "bg-emerald-900/60 backdrop-blur-sm border-emerald-900/60",
      hover: "hover:bg-emerald-900/60",
      cardHover: "hover:shadow-xl hover:shadow-emerald-500/30 hover:border-emerald-500/60",
      gradienteCard: "from-emerald-950/80 to-teal-950/80",
    },
  },
};

const MOTORES_DEF: {
  id: MotorId;
  label: string;
  desc: string;
  icon: any;
  tipo: "critico" | "operacional" | "soporte";
}[] = [
  {
    id: "his",
    label: "HIS / Clínica",
    desc: "Sincronización con el sistema clínico / HIS del centro.",
    icon: Link2,
    tipo: "critico",
  },
  {
    id: "cmdb",
    label: "Inventario / CMDB",
    desc: "Sincronización de activos, equipos y ubicaciones.",
    icon: Database,
    tipo: "critico",
  },
  {
    id: "monitoreo",
    label: "Monitoreo Técnico",
    desc: "Alarmas y métricas desde sistemas de monitoreo.",
    icon: Activity,
    tipo: "operacional",
  },
  {
    id: "backup",
    label: "Respaldos",
    desc: "Estado de respaldos y verificaciones periódicas.",
    icon: HardDrive,
    tipo: "operacional",
  },
  {
    id: "directorio_activo",
    label: "Directorio / Usuarios",
    desc: "Sincronización con directorio de usuarios (ej. AD, LDAP).",
    icon: Shield,
    tipo: "soporte",
  },
  {
    id: "bus_interno",
    label: "Bus Interno / Integrador",
    desc: "Conexión con bus de integración interno u orquestador.",
    icon: Cloud,
    tipo: "soporte",
  },
];

// =====================================================
// HELPERS
// =====================================================

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function crearConfigSyncPorDefecto(usuario: UsuarioSesion): ConfigSyncCentro {
  const now = new Date().toISOString();
  const idCentro =
    usuario.tecnico?.centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0;

  const motoresBase: Record<MotorId, boolean> = {
    his: true,
    cmdb: true,
    monitoreo: true,
    backup: false,
    directorio_activo: false,
    bus_interno: false,
  };

  const freqBase: Record<MotorId, number> = {
    his: 5,
    cmdb: 15,
    monitoreo: 1,
    backup: 1440,
    directorio_activo: 60,
    bus_interno: 2,
  };

  const endpointsBase: Record<MotorId, string> = {
    his: "https://his.centro.local/api",
    cmdb: "https://cmdb.centro.local/api",
    monitoreo: "https://monitoreo.centro.local/api",
    backup: "https://backup.centro.local/api",
    directorio_activo: "ldap://directorio.local",
    bus_interno: "https://bus-integracion.local/api",
  };

  const ultEjecBase: Record<MotorId, string | null> = {
    his: null,
    cmdb: null,
    monitoreo: null,
    backup: null,
    directorio_activo: null,
    bus_interno: null,
  };

  return {
    id_config_sync: null,
    id_centro: idCentro,
    habilitado: true,
    motores: motoresBase,
    frecuencia_minutos: freqBase,
    endpoints: endpointsBase,
    ult_ejecuciones: ultEjecBase,
    ventanas: {
      horario_inicio: "07:00",
      horario_fin: "21:00",
      permitir_fuera_horario: true,
    },
    reintentos_maximos: 3,
    politica_conflictos: "preferir_remoto",
    enviar_alerta_falla: true,
    enviar_resumen_diario: true,
    pausar_sync_si_mantenimiento: true,
    ult_actualizacion: now,
  };
}

function calcularScoreSalud(config: ConfigSyncCentro): number {
  let score = 0;
  const conectoresActivos = Object.values(config.motores).filter(Boolean).length;

  if (config.habilitado) score += 2;
  if (conectoresActivos >= 4) score += 3;
  if (config.pausar_sync_si_mantenimiento) score += 2;
  if (config.enviar_alerta_falla) score += 2;
  if (config.enviar_resumen_diario) score += 1;
  if (config.reintentos_maximos >= 3) score += 1;

  const freqMonitoreo = config.frecuencia_minutos.monitoreo;
  if (freqMonitoreo <= 5) score += 2;

  return score;
}

function etiquetaSalud(score: number): string {
  if (score >= 10) return "Arquitectura robusta";
  if (score >= 7) return "Operación equilibrada";
  if (score >= 4) return "Configuración básica";
  return "Configurar con prioridad";
}

// =====================================================
// PAGE
// =====================================================

export default function ConfiguracionSyncCentroPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

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

  const [configSync, setConfigSync] = useState<ConfigSyncCentro | null>(null);
  const [configOriginal, setConfigOriginal] =
    useState<ConfigSyncCentro | null>(null);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState<string | null>(null);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  const [motorFocus, setMotorFocus] = useState<MotorId>("his");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambios = useMemo(() => {
    if (!configSync || !configOriginal) return false;
    return JSON.stringify(configSync) !== JSON.stringify(configOriginal);
  }, [configSync, configOriginal]);

  const resumen = useMemo(() => {
    if (!configSync) {
      return {
        conectoresActivos: 0,
        freqPromedio: 0,
        conectoresCriticos: 0,
        fueraHorario: false,
        scoreSalud: 0,
      };
    }

    const valores = Object.values(configSync.frecuencia_minutos);
    const freqPromedio =
      valores.length > 0
        ? Math.round(
            valores.reduce((acc, v) => acc + (v || 0), 0) / valores.length
          )
        : 0;

    const conectoresActivos = Object.values(configSync.motores).filter(
      Boolean
    ).length;

    const conectoresCriticos = MOTORES_DEF.filter(
      (m) => m.tipo === "critico" && configSync.motores[m.id]
    ).length;

    const scoreSalud = calcularScoreSalud(configSync);

    return {
      conectoresActivos,
      freqPromedio,
      conectoresCriticos,
      fueraHorario: configSync.ventanas.permitir_fuera_horario,
      scoreSalud,
    };
  }, [configSync]);

  const etiquetaScore = useMemo(
    () => etiquetaSalud(resumen.scoreSalud),
    [resumen.scoreSalud]
  );

  const ultimaActualizacion = configSync?.ult_actualizacion ?? null;

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (saved && TEMAS[saved]) setTemaActual(saved);
    }
  }, []);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.tecnico) {
      cargarContextoTecnico();
      cargarConfiguracionSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  useEffect(() => {
    if (!mensajeConfig && !errorConfig) return;
    const t = setTimeout(() => {
      setMensajeConfig(null);
      setErrorConfig(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [mensajeConfig, errorConfig]);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("No hay sesión activa");

      const result = await res.json();

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
            `Acceso denegado. Esta configuración de sincronización es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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
    } catch (err) {
      console.error("Error al cargar usuario:", err);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
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

  const cargarConfiguracionSync = async () => {
    if (!usuario?.tecnico) return;

    try {
      setLoadingConfig(true);
      setErrorConfig(null);

      const base = crearConfigSyncPorDefecto(usuario);
      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/configuracion/sync?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.warn(
          "Sin configuración de sincronización previa, usando por defecto"
        );
        setConfigSync(base);
        setConfigOriginal(base);
        return;
      }

      const cfgServer =
        (data.config || data.configSync || data.config_sync) ??
        ({} as Partial<ConfigSyncCentro>);

      const cfg: ConfigSyncCentro = {
        ...base,
        ...cfgServer,
        id_centro: base.id_centro,
        motores: {
          ...base.motores,
          ...(cfgServer.motores || {}),
        },
        frecuencia_minutos: {
          ...base.frecuencia_minutos,
          ...(cfgServer.frecuencia_minutos || {}),
        },
        endpoints: {
          ...base.endpoints,
          ...(cfgServer.endpoints || {}),
        },
        ult_ejecuciones: {
          ...base.ult_ejecuciones,
          ...(cfgServer.ult_ejecuciones || {}),
        },
        ventanas: {
          ...base.ventanas,
          ...(cfgServer.ventanas || {}),
        },
      };

      setConfigSync(cfg);
      setConfigOriginal(cfg);
    } catch (err) {
      console.error("Error al cargar config sync:", err);
      if (usuario) {
        const base = crearConfigSyncPorDefecto(usuario);
        setConfigSync(base);
        setConfigOriginal(base);
      }
      setErrorConfig(
        "No se pudo cargar la configuración de sincronización. Se usarán valores por defecto."
      );
    } finally {
      setLoadingConfig(false);
    }
  };

  // =====================================================
  // ACCIONES
  // =====================================================

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
      if (res.ok) {
        setDisponibilidad(nuevoEstado);
        alert(`Estado actualizado a: ${nuevoEstado}`);
      } else {
        alert("Error al actualizar disponibilidad");
      }
    } catch (err) {
      console.error("Error al cambiar disponibilidad:", err);
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
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  const actualizarConfigSync = (cambios: Partial<ConfigSyncCentro>) => {
    setConfigSync((prev) => (prev ? { ...prev, ...cambios } : prev));
  };

  const actualizarMotor = (
    motor: MotorId,
    cambios: {
      habilitado?: boolean;
      frecuencia?: number;
      endpoint?: string;
    }
  ) => {
    setConfigSync((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        motores:
          cambios.habilitado === undefined
            ? prev.motores
            : { ...prev.motores, [motor]: cambios.habilitado },
        frecuencia_minutos:
          cambios.frecuencia === undefined
            ? prev.frecuencia_minutos
            : { ...prev.frecuencia_minutos, [motor]: cambios.frecuencia },
        endpoints:
          cambios.endpoint === undefined
            ? prev.endpoints
            : { ...prev.endpoints, [motor]: cambios.endpoint },
      };
    });
  };

  const guardarConfiguracionSync = async () => {
    if (!usuario?.tecnico || !configSync) return;

    try {
      setGuardandoConfig(true);
      setMensajeConfig(null);
      setErrorConfig(null);

      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const res = await fetch("/api/tecnico/configuracion/sync", {
        method: configSync.id_config_sync ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configSync,
          id_centro: idCentro,
          id_tecnico: usuario.tecnico.id_tecnico,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.error("Error al guardar config sync:", data);
        setErrorConfig(
          data?.message ||
            "No se pudo guardar la configuración de sincronización. Inténtalo nuevamente."
        );
        return;
      }

      let nuevaConfig: ConfigSyncCentro = configSync;

      if (data.config || data.configSync || data.config_sync) {
        const base = crearConfigSyncPorDefecto(usuario);
        const cfgServer =
          (data.config ||
            data.configSync ||
            data.config_sync) as Partial<ConfigSyncCentro>;

        nuevaConfig = {
          ...base,
          ...cfgServer,
          id_centro: base.id_centro,
          motores: {
            ...base.motores,
            ...(cfgServer.motores || {}),
          },
          frecuencia_minutos: {
            ...base.frecuencia_minutos,
            ...(cfgServer.frecuencia_minutos || {}),
          },
          endpoints: {
            ...base.endpoints,
            ...(cfgServer.endpoints || {}),
          },
          ult_ejecuciones: {
            ...base.ult_ejecuciones,
            ...(cfgServer.ult_ejecuciones || {}),
          },
          ventanas: {
            ...base.ventanas,
            ...(cfgServer.ventanas || {}),
          },
          ult_actualizacion:
            cfgServer.ult_actualizacion || new Date().toISOString(),
        };
      } else {
        nuevaConfig = {
          ...configSync,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigSync(nuevaConfig);
      setConfigOriginal(nuevaConfig);
      setMensajeConfig(
        "✓ Configuración de sincronización del centro guardada correctamente."
      );
    } catch (err) {
      console.error("Error al guardar config sync:", err);
      setErrorConfig(
        "Se produjo un error al guardar la configuración. Verifica la conexión."
      );
    } finally {
      setGuardandoConfig(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!configOriginal) return;
    setConfigSync(configOriginal);
  };

  const restaurarRecomendados = () => {
    if (!usuario) return;
    const base = crearConfigSyncPorDefecto(usuario);
    setConfigSync(base);
  };

  const obtenerSaludo = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorDisponibilidad = () => {
    if (disponibilidad === "disponible")
      return "bg-emerald-500/20 text-emerald-200 border-emerald-400/50";
    if (disponibilidad === "ocupado")
      return "bg-amber-500/20 text-amber-200 border-amber-400/50";
    return "bg-red-500/20 text-red-200 border-red-400/50";
  };

  const resumenMotor = (motor: MotorId) => {
    if (!configSync) return { estado: "Desactivado", clase: "" };

    const activo = configSync.motores[motor];
    const ultima = configSync.ult_ejecuciones[motor];

    if (!activo) {
      return { estado: "Desactivado", clase: "bg-slate-500/20 text-slate-300 border-slate-400/30" };
    }

    if (!ultima) {
      return { estado: "Pendiente primera sync", clase: "bg-amber-500/20 text-amber-200 border-amber-400/40" };
    }

    return { estado: `Última sync: ${formatearFecha(ultima)}`, clase: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40" };
  };

  // =====================================================
  // ESTADOS ESPECIALES
  // =====================================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse shadow-2xl`}
            >
              <Cloud className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Sincronización del Centro
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando conectores, frecuencias y reglas de integración...
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
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a la configuración de sincronización
            del centro.
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

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  return (
    <div
      className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${tema.colores.fondo}`}
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
            <div className="relative group">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} transition-colors group-focus-within:text-indigo-400`}
              />
              <input
                type="text"
                placeholder="Buscar conectores, endpoints o parámetros de sync..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/60 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover} transition-all`}
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
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
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
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-lg`
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
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}
              >
                <AlertCircle className="w-5 h-5" />
                {alertas.filter((a) => !a.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    {alertas.filter((a) => !a.leida).length > 9
                      ? "9+"
                      : alertas.filter((a) => !a.leida).length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50 animate-slideDown`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl`}
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
                          className={`p-4 ${tema.colores.hover} transition-all cursor-pointer ${
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
                                <AlertCircleIcon className="w-5 h-5" />
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
                                {alerta.fecha_creacion
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
                className={`px-3 py-2 rounded-xl text-xs font-semibold border ${obtenerColorDisponibilidad()} transition-all duration-300`}
              >
                {disponibilidad?.toUpperCase() ?? "NO DEFINIDO"}
              </span>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:scale-105`}
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
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50 animate-slideDown`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-opacity-20" style={{ borderColor: tema.colores.borde }}>
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
                      href="/tecnico/ayuda"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Ayuda</span>
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
              <span className="animate-wave inline-block">☁️</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Orquesta cómo se sincronizan los sistemas externos del centro:
              conectores, frecuencias, ventanas horarias y alertas.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/5 backdrop-blur-sm`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Centro:
                <span className={`${tema.colores.texto} font-semibold`}>
                  {usuario.tecnico?.centro?.nombre ?? "Sin centro asignado"}
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/5 backdrop-blur-sm`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {usuario.tecnico?.centro?.ciudad ?? "Sin ciudad"},{" "}
                {usuario.tecnico?.centro?.region ?? "Sin región"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={cargarConfiguracionSync}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                disabled={loadingConfig}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingConfig ? "animate-spin" : ""}`}
                />
                Recargar
              </button>
              <button
                onClick={guardarConfiguracionSync}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoConfig}
              >
                <Save className="w-4 h-4" />
                {guardandoConfig
                  ? "Guardando..."
                  : "Guardar configuración"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {ultimaActualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Última actualización:{" "}
                  <span className={`${tema.colores.texto} font-semibold`}>
                    {formatearFecha(ultimaActualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  Esta configuración aún no se ha guardado.
                </p>
              )}
              {hayCambios && (
                <p className="text-amber-400 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  Hay cambios sin guardar
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {(mensajeConfig || errorConfig) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 border transition-all duration-300 ${
              mensajeConfig
                ? "bg-emerald-500/10 border-emerald-500/50"
                : "bg-red-500/10 border-red-500/50"
            }`}
          >
            {mensajeConfig ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <p
              className={`text-sm font-semibold ${
                mensajeConfig ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {mensajeConfig || errorConfig}
            </p>
          </div>
        )}

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={Cloud}
            titulo="Conectores activos"
            valor={resumen.conectoresActivos}
            chip="Integraciones habilitadas"
            color="from-cyan-500 to-blue-600"
          />

                    <ResumenCard
            tema={tema}
            icono={Clock3}
            titulo="Frecuencia promedio"
            valor={resumen.freqPromedio}
            chip="Minutos por ciclo"
            color="from-indigo-500 to-purple-600"
          />
          <ResumenCard
            tema={tema}
            icono={ShieldCheck}
            titulo="Conectores críticos"
            valor={resumen.conectoresCriticos}
            chip="HIS / CMDB / Monitoreo"
            color="from-red-500 to-orange-600"
          />
          <ResumenCard
            tema={tema}
            icono={TrendingUp}
            titulo="Score de salud"
            valor={resumen.scoreSalud}
            chip={etiquetaScore}
            color="from-emerald-500 to-teal-600"
          />
          <ResumenCard
            tema={tema}
            icono={Bell}
            titulo="Alertas automáticas"
            valor={configSync?.enviar_alerta_falla ? 1 : 0}
            chip={
              configSync?.enviar_alerta_falla
                ? "Alertando fallas de sync"
                : "Sin alertas locales"
            }
            color="from-amber-500 to-yellow-600"
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loadingConfig || !configSync ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-8">
                <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
                <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
              </div>
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando configuración de sincronización del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bloque 1: Estado general + Ventana / política */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* Estado general sync */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 ${tema.colores.cardHover} group`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Estado del módulo
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Control de sincronización
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group/item">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={configSync.habilitado}
                        onChange={(e) =>
                          actualizarConfigSync({ habilitado: e.target.checked })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-700/50 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-emerald-600 transition-all duration-300 shadow-inner"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto} mb-1`}
                      >
                        Habilitar sincronización automática
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Activa la orquestación de integraciones en este centro.
                      </p>
                    </div>
                  </label>

                  <div className={`h-px bg-gradient-to-r ${tema.colores.gradiente} opacity-20`} />

                  <label className="flex items-start gap-3 cursor-pointer group/item">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={configSync.pausar_sync_si_mantenimiento}
                        onChange={(e) =>
                          actualizarConfigSync({
                            pausar_sync_si_mantenimiento: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-700/50 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-amber-600 transition-all duration-300 shadow-inner"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto} mb-1`}
                      >
                        Pausar durante mantenimiento
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Suspende jobs locales en ventanas de mantenimiento.
                      </p>
                    </div>
                  </label>

                  <div className={`h-px bg-gradient-to-r ${tema.colores.gradiente} opacity-20`} />

                  <div className={`rounded-xl p-4 bg-gradient-to-br ${tema.colores.gradienteCard} border ${tema.colores.borde}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p
                        className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}
                      >
                        <Layers className="w-4 h-4" />
                        Reintentos máximos por job
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            actualizarConfigSync({
                              reintentos_maximos: Math.max(
                                0,
                                configSync.reintentos_maximos - 1
                              ),
                            })
                          }
                          className={`w-8 h-8 rounded-lg ${tema.colores.secundario} flex items-center justify-center font-bold transition-all duration-300 hover:scale-110`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={configSync.reintentos_maximos}
                          onChange={(e) =>
                            actualizarConfigSync({
                              reintentos_maximos: Math.max(
                                0,
                                parseInt(e.target.value || "0", 10)
                              ),
                            })
                          }
                          className={`w-16 px-3 py-2 rounded-lg text-center font-bold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                        />
                        <button
                          onClick={() =>
                            actualizarConfigSync({
                              reintentos_maximos: Math.min(
                                10,
                                configSync.reintentos_maximos + 1
                              ),
                            })
                          }
                          className={`w-8 h-8 rounded-lg ${tema.colores.secundario} flex items-center justify-center font-bold transition-all duration-300 hover:scale-110`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Número de intentos antes de marcar un job como fallido.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ventana horaria + política de conflictos */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 ${tema.colores.cardHover} group`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Clock3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Ventana horaria
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Rango de operación
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`rounded-xl p-4 bg-gradient-to-br ${tema.colores.gradienteCard} border ${tema.colores.borde}`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs font-semibold ${tema.colores.texto} mb-2 block`}>
                          Hora inicio
                        </label>
                        <input
                          type="time"
                          value={configSync.ventanas.horario_inicio}
                          onChange={(e) =>
                            actualizarConfigSync({
                              ventanas: {
                                ...configSync.ventanas,
                                horario_inicio: e.target.value,
                              },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono`}
                        />
                      </div>
                      <div>
                        <label className={`text-xs font-semibold ${tema.colores.texto} mb-2 block`}>
                          Hora fin
                        </label>
                        <input
                          type="time"
                          value={configSync.ventanas.horario_fin}
                          onChange={(e) =>
                            actualizarConfigSync({
                              ventanas: {
                                ...configSync.ventanas,
                                horario_fin: e.target.value,
                              },
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono`}
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group/item">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={configSync.ventanas.permitir_fuera_horario}
                        onChange={(e) =>
                          actualizarConfigSync({
                            ventanas: {
                              ...configSync.ventanas,
                              permitir_fuera_horario: e.target.checked,
                            },
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-700/50 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-indigo-600 transition-all duration-300 shadow-inner"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto} mb-1`}
                      >
                        Permitir jobs fuera de horario
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Para sincronizaciones críticas 24/7.
                      </p>
                    </div>
                  </label>

                  <div className={`h-px bg-gradient-to-r ${tema.colores.gradiente} opacity-20`} />

                  <div>
                    <p
                      className={`text-sm font-bold ${tema.colores.texto} mb-3 flex items-center gap-2`}
                    >
                      <Shield className="w-4 h-4" />
                      Política de conflictos
                    </p>
                    <div className="space-y-2">
                      {(
                        [
                          {
                            id: "preferir_remoto",
                            label: "Preferir remoto",
                            desc: "El sistema remoto es la verdad.",
                            icon: Cloud,
                          },
                          {
                            id: "preferir_local",
                            label: "Preferir local",
                            desc: "Mantener datos del centro.",
                            icon: Database,
                          },
                          {
                            id: "preguntar",
                            label: "Solicitar decisión",
                            desc: "Revisión manual de conflictos.",
                            icon: AlertCircle,
                          },
                        ] as {
                          id: PoliticaConflictos;
                          label: string;
                          desc: string;
                          icon: any;
                        }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() =>
                            actualizarConfigSync({
                              politica_conflictos: opt.id,
                            })
                          }
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 ${
                            configSync.politica_conflictos === opt.id
                              ? `border-indigo-400/60 bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg scale-105`
                              : `${tema.colores.borde} ${tema.colores.hover} ${tema.colores.texto}`
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <opt.icon className="w-5 h-5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {configSync.politica_conflictos === opt.id ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full border-2 border-current opacity-50" />
                                )}
                                <span className="font-bold text-sm">
                                  {opt.label}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${configSync.politica_conflictos === opt.id ? 'text-white/80' : tema.colores.textoSecundario}`}>
                                {opt.desc}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertas y resumen */}
              <div
                className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 ${tema.colores.cardHover} group`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Alertas y logs
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Observabilidad local
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group/item">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={configSync.enviar_alerta_falla}
                        onChange={(e) =>
                          actualizarConfigSync({
                            enviar_alerta_falla: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-700/50 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-red-600 transition-all duration-300 shadow-inner"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto} mb-1`}
                      >
                        Alertas ante fallas de sync
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Notificación inmediata cuando un job falla.
                      </p>
                    </div>
                  </label>

                  <div className={`h-px bg-gradient-to-r ${tema.colores.gradiente} opacity-20`} />

                  <label className="flex items-start gap-3 cursor-pointer group/item">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={configSync.enviar_resumen_diario}
                        onChange={(e) =>
                          actualizarConfigSync({
                            enviar_resumen_diario: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-700/50 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-emerald-600 transition-all duration-300 shadow-inner"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-lg"></div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto} mb-1`}
                      >
                        Resumen diario de sincronización
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Reporte consolidado enviado cada día.
                      </p>
                    </div>
                  </label>

                  <div className={`h-px bg-gradient-to-r ${tema.colores.gradiente} opacity-20`} />

                  <div
                    className={`rounded-xl p-4 bg-gradient-to-br ${tema.colores.gradienteCard} border ${tema.colores.borde}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg`}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${tema.colores.texto}`}>
                          Score de salud: {resumen.scoreSalud}/13
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          {etiquetaScore}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${tema.colores.gradiente} transition-all duration-700 rounded-full`}
                        style={{
                          width: `${Math.min(
                            100,
                            (resumen.scoreSalud / 13) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={`mt-3 rounded-xl p-3 bg-black/10 border ${tema.colores.borde} text-xs ${tema.colores.textoSecundario}`}
                  >
                    💡 Estas alertas son{" "}
                    <span className={`${tema.colores.texto} font-semibold`}>
                      específicas de este centro
                    </span>
                    . La observabilidad comunal sigue disponible en paneles
                    globales.
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 2: Matriz de conectores */}
<div
  className={`rounded-2xl p-6 mb-10 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 ${tema.colores.cardHover}`}
>
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg`}
      >
        <Link2 className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-black text-black dark:text-white">
          Conectores y frecuencia de sincronización
        </h3>
        <p className="text-sm text-black/70 dark:text-white/70">
          Habilita conectores, ajusta frecuencia y endpoints por tipo de motor.
        </p>
      </div>
    </div>

    {/* selector rápido de motor */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-black/70 dark:text-white/70 hidden md:inline">
        Vista rápida:
      </span>
      <select
        value={motorFocus}
        onChange={(e) => setMotorFocus(e.target.value as MotorId)}
        className={`
          px-4 py-2 rounded-xl text-sm font-semibold
          ${tema.colores.card} ${tema.colores.borde} border
          text-black dark:text-white
          focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer
        `}
      >
        {MOTORES_DEF.map((m) => (
          <option key={m.id} value={m.id} className="text-black dark:text-white">
            {m.label}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* tabla conectores */}
  <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 mb-6 custom-scrollbar">
    <table className="min-w-full text-sm">
      <thead className={`bg-gradient-to-r ${tema.colores.gradiente}`}>
        <tr className="text-xs uppercase tracking-wide text-white">
          <th className="px-4 py-3 text-left font-bold">Conector</th>
          <th className="px-4 py-3 text-center font-bold">Activo</th>
          <th className="px-4 py-3 text-center font-bold">Tipo</th>
          <th className="px-4 py-3 text-center font-bold">Frecuencia (min)</th>
          <th className="px-4 py-3 text-left font-bold">Endpoint / origen</th>
          <th className="px-4 py-3 text-left font-bold">Estado</th>
        </tr>
      </thead>

      <tbody>
        {MOTORES_DEF.map((m, idx) => {
          const matchBusqueda =
            !busqueda.trim() ||
            m.label.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.desc.toLowerCase().includes(busqueda.toLowerCase()) ||
            configSync.endpoints[m.id]?.toLowerCase().includes(busqueda.toLowerCase());

          if (!matchBusqueda) return null;

          const info = resumenMotor(m.id);
          const freq = configSync.frecuencia_minutos[m.id];

          return (
            <tr
              key={m.id}
              className={`
                border-t border-black/10 dark:border-white/10
                transition-all duration-300
                ${motorFocus === m.id ? "bg-indigo-500/10" : "hover:bg-black/5 dark:hover:bg-white/10"}
              `}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Columna: Icono + Nombre */}
              <td className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente}
                      flex items-center justify-center text-white shadow-lg flex-shrink-0
                    `}
                  >
                    <m.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-black dark:text-white">{m.label}</div>
                    <div className="text-xs text-black/60 dark:text-white/60 mt-1">
                      {m.desc}
                    </div>
                  </div>
                </div>
              </td>

              {/* Activo */}
              <td className="px-4 py-4 text-center">
  <label className="inline-flex items-center cursor-pointer relative">
    <input
      type="checkbox"
      checked={configSync.motores[m.id]}
      onChange={(e) =>
        actualizarMotor(m.id, { habilitado: e.target.checked })
      }
      className="sr-only peer"
    />

    {/* FONDO DEL SWITCH */}
    <span
      className="
        w-11 h-6 rounded-full
        bg-gray-300 dark:bg-gray-700
        peer-checked:bg-green-500
        transition-all duration-300
      "
    />

    {/* BOLITA */}
    <span
      className="
        absolute left-1 top-1
        w-4 h-4 rounded-full bg-white shadow
        transition-all duration-300
        peer-checked:translate-x-5
      "
    />
  </label>
</td>


              {/* Tipo */}
              <td className="px-4 py-4 text-center">
                <span
                  className={`
                    inline-flex px-3 py-1 rounded-full text-xs font-bold border
                    ${
                      m.tipo === "critico"
                        ? "bg-red-100 text-red-800 border-red-400"
                        : m.tipo === "operacional"
                        ? "bg-blue-100 text-blue-800 border-blue-400"
                        : "bg-green-100 text-green-800 border-green-400"
                    }
                  `}
                >
                  {m.tipo.toUpperCase()}
                </span>
              </td>

              {/* Frecuencia */}
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      actualizarMotor(m.id, { frecuencia: Math.max(1, freq - 1) })
                    }
                    className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:scale-110 transition"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min={1}
                    value={freq}
                    onChange={(e) =>
                      actualizarMotor(m.id, {
                        frecuencia: Math.max(1, parseInt(e.target.value || "1")),
                      })
                    }
                    className="
                      w-20 px-3 py-2 rounded-lg text-center font-bold
                      bg-white dark:bg-gray-800 text-black dark:text-white
                      border border-black/20 dark:border-white/20
                      focus:ring-2 focus:ring-indigo-500/50
                    "
                  />

                  <button
                    onClick={() =>
                      actualizarMotor(m.id, { frecuencia: freq + 1 })
                    }
                    className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:scale-110 transition"
                  >
                    +
                  </button>
                </div>
              </td>

              {/* Endpoint */}
              <td className="px-4 py-4">
                <input
                  type="text"
                  value={configSync.endpoints[m.id] || ""}
                  onChange={(e) =>
                    actualizarMotor(m.id, { endpoint: e.target.value })
                  }
                  className="
                    w-full px-3 py-2 rounded-lg text-xs font-mono
                    bg-white dark:bg-gray-800
                    border border-black/20 dark:border-white/20
                    text-black dark:text-white
                    focus:ring-2 focus:ring-indigo-500/50
                  "
                  placeholder="URL / servidor / host..."
                />
              </td>

              {/* Estado */}
              <td className="px-4 py-4">
                <span
                  className={`
                    inline-flex px-3 py-1 rounded-full text-xs font-semibold border
                    text-black dark:text-white
                  `}
                >
                  {info.estado}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>



              {/* Detalle del motor seleccionado */}
              <div
                className={`rounded-xl p-5 bg-gradient-to-br ${tema.colores.gradienteCard} border ${tema.colores.borde}`}
              >
                {(() => {
                  const def = MOTORES_DEF.find((m) => m.id === motorFocus)!;
                  const info = resumenMotor(motorFocus);
                  const freq = configSync.frecuencia_minutos[motorFocus];

                  return (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                        >
                          <def.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p
                            className={`text-base font-black ${tema.colores.texto} mb-1`}
                          >
                            {def.label}
                          </p>
                          <p className={`text-sm ${tema.colores.textoSecundario} mb-2`}>
                            {def.desc}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Endpoint actual:{" "}
                            <span className={`${tema.colores.texto} font-mono font-semibold`}>
                              {configSync.endpoints[motorFocus] ||
                                "No definido"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${info.clase}`}
                        >
                          {info.estado}
                        </span>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/40`}
                        >
                          Frecuencia: {freq} min
                        </span>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            configSync.motores[motorFocus]
                              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                              : "bg-slate-500/20 text-slate-300 border border-slate-400/40"
                          }`}
                        >
                          {configSync.motores[motorFocus]
                            ? "✓ Conector activo"
                            : "○ Conector desactivado"}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Barra inferior */}
            <div
              className={`mt-8 rounded-2xl px-6 py-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg`}>
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <p className={tema.colores.textoSecundario}>
                    Esta página controla únicamente la{" "}
                    <span className={`${tema.colores.texto} font-bold`}>
                      estrategia de sincronización de tu centro
                    </span>
                    . No modifica las integraciones globales ni la topología
                    comunal definida por la administración central.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={restaurarDesdeOriginal}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!hayCambios}
                >
                  Deshacer cambios
                </button>
                <button
                  onClick={restaurarRecomendados}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                >
                  Valores recomendados
                </button>
                <button
                  onClick={guardarConfiguracionSync}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed`}
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
            <div className="flex items-center gap-3">
              <p className={tema.colores.textoSecundario}>
                © 2025 AnyssaMed / INFOGES – Configuración de Sincronización de
                Centro.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
              >
                Módulo Centro · Sync
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
          font-family: "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6));
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9));
        }
        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.6) rgba(0, 0, 0, 0.1);
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
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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

 body, * {
    color: #000 !important;
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

        /* Animaciones personalizadas */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite linear;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }

        /* Gradientes animados */
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
}

// =====================================================
// COMPONENTE RESUMEN PREMIUM
// =====================================================

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
      className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer group overflow-hidden relative`}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
          >
            <Icono className="w-6 h-6 text-white" />
          </div>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
        </div>
        
        <div className={`text-4xl font-black mb-2 ${tema.colores.texto} group-hover:scale-105 transition-transform duration-300`}>
          {isNaN(valor) ? 0 : valor}
        </div>
        
        <div
          className={`text-xs font-bold uppercase tracking-wider mb-3 ${tema.colores.textoSecundario}`}
        >
          {titulo}
        </div>
        
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${color} text-white shadow-md group-hover:shadow-lg transition-all duration-300`}
          >
            <ZapIcon className="w-3 h-3" />
            {chip}
          </span>
        </div>
      </div>
      
      {/* Indicador de progreso decorativo */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-700 group-hover:w-full`}
          style={{ width: "30%" }}
        />
      </div>
    </div>
  );
}

          
