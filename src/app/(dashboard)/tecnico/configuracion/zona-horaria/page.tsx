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
  Clock3,
  Globe,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  HeartPulse,
  X,
  Zap as ZapIcon,
  AlertCircle as AlertCircleIcon,
  MapPin as MapPinIcon,
  User,
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

interface ConfigZonaHorariaCentro {
  id_config_zona: number | null;
  id_centro: number;
  zona_horaria_centro: string;
  usar_zona_sistema: boolean;
  sincronizar_con_pais: boolean;
  pais_iso: string | null;
  region: string | null;
  ajustar_horario_verano: boolean;
  mostrar_hora_local_en_tickets: boolean;
  mostrar_hora_utc_en_detalle: boolean;
  offset_minutos_manual: number | null;
  ult_actualizacion: string | null;
  ultima_sincronizacion: string | null;
}

// =====================================================
// TEMAS (mismos que en las otras páginas)
// =====================================================

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

// =====================================================
// HELPERS
// =====================================================

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatearFechaSoloDia(fecha: string | null | undefined) {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function crearConfigZonaPorDefecto(usuario: UsuarioSesion): ConfigZonaHorariaCentro {
  const nowIso = new Date().toISOString();
  const tzNavegador =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  const tzUsuario = usuario.tecnico?.zona_horaria || tzNavegador || "UTC";

  return {
    id_config_zona: null,
    id_centro:
      usuario.tecnico?.centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0,
    zona_horaria_centro: tzUsuario,
    usar_zona_sistema: false,
    sincronizar_con_pais: true,
    pais_iso: usuario.tecnico?.pais || null,
    region: usuario.tecnico?.region || null,
    ajustar_horario_verano: true,
    mostrar_hora_local_en_tickets: true,
    mostrar_hora_utc_en_detalle: false,
    offset_minutos_manual: null,
    ult_actualizacion: nowIso,
    ultima_sincronizacion: nowIso,
  };
}

function obtenerListaZonaHoraria(zonaPorDefecto?: string): string[] {
  let lista: string[] = [];

  try {
    const anyIntl = Intl as any;
    if (anyIntl && typeof anyIntl.supportedValuesOf === "function") {
      lista = anyIntl.supportedValuesOf("timeZone") as string[];
    }
  } catch {
    // ignorar
  }

  if (!lista || lista.length === 0) {
    lista = [
      "UTC",
      "America/Santiago",
      "America/Bogota",
      "America/Lima",
      "America/Mexico_City",
      "America/Buenos_Aires",
      "Atlantic/Stanley",
      "Europe/Madrid",
    ];
  }

  const set = new Set(lista);
  if (zonaPorDefecto && !set.has(zonaPorDefecto)) {
    set.add(zonaPorDefecto);
  }

  return Array.from(set).sort();
}

function calcularOffsetMinutos(timeZone: string, fecha: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const parts = dtf.formatToParts(fecha);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "00";

    const year = get("year");
    const month = get("month");
    const day = get("day");
    const hour = get("hour");
    const minute = get("minute");
    const second = get("second");

    const localAsUTC = Date.parse(
      `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
    );
    const diffMs = localAsUTC - fecha.getTime();
    return diffMs / 60000;
  } catch {
    return 0;
  }
}

// =====================================================
// PAGE
// =====================================================

export default function ConfiguracionZonaHorariaCentroPage() {
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

  const [configZona, setConfigZona] = useState<ConfigZonaHorariaCentro | null>(
    null
  );
  const [configOriginal, setConfigOriginal] =
    useState<ConfigZonaHorariaCentro | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState<string | null>(null);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  const [opcionesZona, setOpcionesZona] = useState<string[]>([]);
  const [busquedaZona, setBusquedaZona] = useState("");

  const [now, setNow] = useState<Date>(new Date());

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambios = useMemo(() => {
    if (!configZona || !configOriginal) return false;
    return JSON.stringify(configZona) !== JSON.stringify(configOriginal);
  }, [configZona, configOriginal]);

  const opcionesZonaFiltradas = useMemo(() => {
    if (!busquedaZona.trim()) return opcionesZona;
    const q = busquedaZona.toLowerCase();
    return opcionesZona.filter((z) => z.toLowerCase().includes(q));
  }, [opcionesZona, busquedaZona]);

  const offsetCentroMin = useMemo(() => {
    if (!configZona) return 0;
    if (configZona.offset_minutos_manual != null) {
      return configZona.offset_minutos_manual;
    }
    if (!configZona.zona_horaria_centro) return 0;
    return calcularOffsetMinutos(configZona.zona_horaria_centro, now);
  }, [configZona, now]);

  const offsetCentroHoras = useMemo(() => {
    const h = offsetCentroMin / 60;
    return Math.round(h * 10) / 10;
  }, [offsetCentroMin]);

  const horaCentro = useMemo(() => {
    if (!configZona?.zona_horaria_centro) return "";
    try {
      return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: configZona.zona_horaria_centro,
      }).format(now);
    } catch {
      return "Zona horaria no válida";
    }
  }, [configZona?.zona_horaria_centro, now]);

  const horaSistema = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(now);
    } catch {
      return "";
    }
  }, [now]);

  const modoCalculo = useMemo(() => {
    if (!configZona) return "No definido";
    if (configZona.usar_zona_sistema) return "Tomado del sistema / servidor";
    if (configZona.sincronizar_con_pais) return "Sincronizado con país / región";
    if (configZona.offset_minutos_manual != null)
      return "Offset manual definido";
    return "Zona horaria fija del centro";
  }, [configZona]);

  const flagsActivas = useMemo(() => {
    if (!configZona) return 0;
    let count = 0;
    if (configZona.ajustar_horario_verano) count++;
    if (configZona.mostrar_hora_local_en_tickets) count++;
    if (configZona.mostrar_hora_utc_en_detalle) count++;
    if (configZona.usar_zona_sistema) count++;
    if (configZona.sincronizar_con_pais) count++;
    return count;
  }, [configZona]);

  const ultimaActualizacion = useMemo(
    () => configZona?.ult_actualizacion ?? null,
    [configZona]
  );

  // =====================================================
  // EFECTOS
  // =====================================================

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
      cargarContextoTecnico();
      cargarConfiguracionZona();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    if (!mensajeConfig && !errorConfig) return;
    const timer = setTimeout(() => {
      setMensajeConfig(null);
      setErrorConfig(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [mensajeConfig, errorConfig]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // =====================================================
  // DATA FETCHING
  // =====================================================

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
            `Acceso denegado. Esta configuración de zona horaria es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarConfiguracionZona = async () => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      setLoadingConfig(true);
      setErrorConfig(null);

      const base = crearConfigZonaPorDefecto(usuario);
      const idCentro =
        usuario.tecnico?.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/configuracion/zona-horaria?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.warn("Sin configuración previa de zona horaria, usando base.");
        setConfigZona(base);
        setConfigOriginal(base);
        setOpcionesZona(obtenerListaZonaHoraria(base.zona_horaria_centro));
        return;
      }

      const cfgServer = (data.config || data.configZona || {}) as Partial<
        ConfigZonaHorariaCentro
      >;

      const cfg: ConfigZonaHorariaCentro = {
        ...base,
        ...cfgServer,
        id_centro: base.id_centro,
        zona_horaria_centro:
          cfgServer.zona_horaria_centro || base.zona_horaria_centro,
      };

      setConfigZona(cfg);
      setConfigOriginal(cfg);

      let lista: string[] = [];
      if (Array.isArray(data.opciones_zona_horaria)) {
        lista = data.opciones_zona_horaria;
      } else if (Array.isArray(data.zonas)) {
        lista = data.zonas;
      } else {
        lista = obtenerListaZonaHoraria(cfg.zona_horaria_centro);
      }
      setOpcionesZona(lista);
    } catch (error) {
      console.error("Error al cargar configuración de zona horaria:", error);
      if (usuario) {
        const base = crearConfigZonaPorDefecto(usuario);
        setConfigZona(base);
        setConfigOriginal(base);
        setOpcionesZona(obtenerListaZonaHoraria(base.zona_horaria_centro));
      }
      setErrorConfig(
        "No se pudo cargar la configuración de zona horaria. Se usan valores por defecto."
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

  const actualizarConfigZona = (
    cambios: Partial<ConfigZonaHorariaCentro>
  ) => {
    setConfigZona((prev) => (prev ? { ...prev, ...cambios } : prev));
  };

  const guardarConfiguracionZona = async () => {
    if (!usuario?.tecnico || !configZona) return;

    try {
      setGuardandoConfig(true);
      setMensajeConfig(null);
      setErrorConfig(null);

      const idCentro =
        usuario.tecnico?.centro?.id_centro ?? usuario.tecnico.id_centro;

      const res = await fetch("/api/tecnico/configuracion/zona-horaria", {
        method: configZona.id_config_zona ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configZona,
          id_centro: idCentro,
          id_tecnico: usuario.tecnico.id_tecnico,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        console.error("Error al guardar zona horaria:", data);
        setErrorConfig(
          data?.message ||
            "No se pudo guardar la configuración de zona horaria. Inténtalo nuevamente."
        );
        return;
      }

      let nuevaConfig: ConfigZonaHorariaCentro = configZona;

      if (data.config || data.configZona) {
        const base = crearConfigZonaPorDefecto(usuario);
        const cfgServer = (data.config || data.configZona) as Partial<
          ConfigZonaHorariaCentro
        >;
        nuevaConfig = {
          ...base,
          ...cfgServer,
          id_centro: base.id_centro,
          zona_horaria_centro:
            cfgServer.zona_horaria_centro || base.zona_horaria_centro,
          ult_actualizacion: cfgServer.ult_actualizacion || new Date().toISOString(),
        };
      } else {
        nuevaConfig = {
          ...configZona,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigZona(nuevaConfig);
      setConfigOriginal(nuevaConfig);
      setMensajeConfig("Configuración de zona horaria guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar configuración de zona horaria:", error);
      setErrorConfig(
        "Se produjo un error al guardar la configuración. Verifica la conexión."
      );
    } finally {
      setGuardandoConfig(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!configOriginal) return;
    setConfigZona(configOriginal);
  };

  const restaurarRecomendados = () => {
    if (!usuario) return;
    const base = crearConfigZonaPorDefecto(usuario);
    setConfigZona(base);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorDisponibilidad = () => {
    if (disponibilidad === "disponible")
      return "bg-green-500/20 text-green-300 border-green-400/40";
    if (disponibilidad === "ocupado")
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
    return "bg-red-500/20 text-red-200 border-red-400/40";
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
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Zona Horaria del Centro
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Ajustando la referencia de tiempo para todos tus tickets y agendas...
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
            No tienes permisos para acceder a la configuración de zona horaria del
            centro.
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
  // RENDER
  // =====================================================

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
                placeholder="Buscar dentro de la configuración de zona horaria..."
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
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto z-50`}
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
              <span className="animate-wave inline-block">🕒</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Alinea la zona horaria de tu centro para que tickets, agendas y
              reportes muestren horas consistentes para todo el equipo.
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
                onClick={cargarConfiguracionZona}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingConfig}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingConfig ? "animate-spin" : ""}`}
                />
                Recargar configuración
              </button>
              <button
                onClick={guardarConfiguracionZona}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoConfig}
              >
                <Save className="w-4 h-4" />
                {guardandoConfig
                  ? "Guardando cambios..."
                  : "Guardar zona horaria del centro"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {ultimaActualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Última actualización:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFecha(ultimaActualizacion)}
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

        {/* Mensajes de guardado / error */}
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={Globe}
            titulo="Zona horaria"
            valor={1}
            chip={configZona?.zona_horaria_centro || "No definida"}
            color="from-indigo-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={Clock3}
            titulo="Offset respecto a UTC"
            valor={Number.isNaN(offsetCentroHoras) ? 0 : offsetCentroHoras}
            chip={`${offsetCentroHoras >= 0 ? "+" : ""}${offsetCentroHoras} h`}
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={ShieldCheck}
            titulo="Modo de cálculo"
            valor={1}
            chip={modoCalculo}
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={Activity}
            titulo="Ajustes activos"
            valor={flagsActivas}
            chip="Reglas aplicadas"
            color="from-amber-500 to-orange-500"
          />
          <ResumenCard
            tema={tema}
            icono={Bell}
            titulo="Impacto en tickets"
            valor={configZona?.mostrar_hora_local_en_tickets ? 1 : 0}
            chip={
              configZona?.mostrar_hora_local_en_tickets
                ? "Hora local visible"
                : "Sólo hora base"
            }
            color="from-slate-500 to-slate-700"
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loadingConfig || !configZona ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando parámetros de zona horaria del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* MODO Y SELECCIÓN DE ZONA */}
              <div
                className={`xl:col-span-2 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Zona horaria del centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Define cómo se calcula la hora oficial para este centro, sin
                        afectar la configuración global de otros establecimientos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configZona.usar_zona_sistema}
                      onChange={(e) =>
                        actualizarConfigZona({
                          usar_zona_sistema: e.target.checked,
                          // si se usa sistema, no tiene sentido offset manual
                          offset_minutos_manual: e.target.checked
                            ? null
                            : configZona.offset_minutos_manual,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Usar zona horaria del sistema / servidor
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        El centro tomará la hora desde la configuración del servidor
                        de aplicaciones. Útil cuando todos los centros comparten la
                        misma zona.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configZona.sincronizar_con_pais}
                      onChange={(e) =>
                        actualizarConfigZona({
                          sincronizar_con_pais: e.target.checked,
                        })
                      }
                      disabled={configZona.usar_zona_sistema}
                    />
                    <div className={configZona.usar_zona_sistema ? "opacity-60" : ""}>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Sincronizar automáticamente con país / región del centro
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Usa la zona horaria recomendada para{" "}
                        <span className={tema.colores.texto}>
                          {configZona.pais_iso || usuario.tecnico?.pais || "el país"}
                        </span>
                        . Puedes sobre-escribirla manualmente si tu municipio tiene
                        excepción.
                      </p>
                    </div>
                  </label>

                  {/* BUSCADOR Y SELECTOR DE ZONA */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-1 space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Buscar zona horaria
                      </p>
                      <input
                        type="text"
                        value={busquedaZona}
                        onChange={(e) => setBusquedaZona(e.target.value)}
                        placeholder="Ej: America/Santiago, Europe/Madrid..."
                        className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} text-xs`}
                        disabled={configZona.usar_zona_sistema}
                      />
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        Solo afecta a este centro. Se recomienda mantener la zona
                        del país salvo centros con horarios especiales.
                      </p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Seleccionar zona horaria oficial del centro
                      </p>
                      <div className="relative">
                        <select
                          value={configZona.zona_horaria_centro}
                          onChange={(e) =>
                            actualizarConfigZona({
                              zona_horaria_centro: e.target.value,
                            })
                          }
                          disabled={configZona.usar_zona_sistema}
                          className={`w-full px-3 py-2 rounded-lg pr-8 appearance-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs md:text-sm ${
                            configZona.usar_zona_sistema
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {opcionesZonaFiltradas.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                          {opcionesZonaFiltradas.length === 0 && (
                            <option value={configZona.zona_horaria_centro}>
                              {configZona.zona_horaria_centro}
                            </option>
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        Si no encuentras la zona que necesitas, valida primero que
                        exista en el sistema operativo / base de datos de zonas
                        horarias del servidor.
                      </p>
                    </div>
                  </div>

                  {/* OFFSET MANUAL */}
                  <div className="border-t border-dashed border-gray-600/40 pt-4 mt-4 space-y-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Ajustes avanzados de offset:
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p
                          className={`text-xs font-semibold ${tema.colores.texto}`}
                        >
                          Offset manual respecto de UTC (minutos)
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          Úsalo sólo si tu centro tiene una excepción horaria no
                          cubierta por la base de zonas horarias estándar.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={15}
                          value={
                            configZona.offset_minutos_manual ?? ""
                          }
                          onChange={(e) =>
                            actualizarConfigZona({
                              offset_minutos_manual:
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value, 10),
                            })
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                          placeholder="auto"
                          disabled={configZona.usar_zona_sistema}
                        />
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          min
                        </span>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configZona.ajustar_horario_verano}
                        onChange={(e) =>
                          actualizarConfigZona({
                            ajustar_horario_verano: e.target.checked,
                          })
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Considerar reglas de horario de verano
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          Aplica automáticamente cambios de hora (DST) donde
                          corresponda. Si tu región dejó de usar DST pero sigue
                          marcada, puedes desactivar este ajuste.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* VISTA PREVIA HORAS */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Clock3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Vista previa de horas
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Verifica cómo se verán las horas en el centro y en tu
                        navegador.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <div
                    className={`rounded-xl p-4 bg-black/10 border border-white/10`}
                  >
                    <p
                      className={`text-[11px] uppercase tracking-wide font-semibold ${tema.colores.textoSecundario} mb-1`}
                    >
                      Hora oficial del centro
                    </p>
                    <p className={`text-base font-bold ${tema.colores.texto}`}>
                      {horaCentro || "Sin zona horaria configurada"}
                    </p>
                    <p className={`text-[11px] mt-2 ${tema.colores.textoSecundario}`}>
                      Zona:{" "}
                      <span className={tema.colores.texto}>
                        {configZona.zona_horaria_centro}
                      </span>{" "}
                      · Offset estimado:{" "}
                      <span className={tema.colores.texto}>
                        {offsetCentroHoras >= 0 ? "+" : ""}
                        {offsetCentroHoras} h
                      </span>
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-4 border border-dashed ${tema.colores.borde}`}
                  >
                    <p
                      className={`text-[11px] uppercase tracking-wide font-semibold ${tema.colores.textoSecundario} mb-1`}
                    >
                      Hora local de tu navegador
                    </p>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      {horaSistema}
                    </p>
                    <p className={`text-[11px] mt-2 ${tema.colores.textoSecundario}`}>
                      Esto ayuda a validar que las horas de tickets no queden
                      adelantadas o atrasadas respecto a lo que ve el equipo en el
                      centro.
                    </p>
                  </div>

                  <div className="border-t border-dashed border-gray-600/40 pt-3 mt-2 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-emerald-500"
                        checked={configZona.mostrar_hora_local_en_tickets}
                        onChange={(e) =>
                          actualizarConfigZona({
                            mostrar_hora_local_en_tickets: e.target.checked,
                          })
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Mostrar siempre la hora local del centro en los tickets
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          Afecta encabezados, listados y paneles. No modifica la
                          fecha almacenada en la base de datos, solo la presentación.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configZona.mostrar_hora_utc_en_detalle}
                        onChange={(e) =>
                          actualizarConfigZona({
                            mostrar_hora_utc_en_detalle: e.target.checked,
                          })
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Mostrar también hora UTC en detalle avanzado
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          Útil para auditorías o cuando se coordinan técnicos de
                          distintos países y se necesita un punto de referencia
                          común.
                        </p>
                      </div>
                    </label>
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
                  Esta página controla únicamente la{" "}
                  <span className={tema.colores.texto}>
                    referencia de tiempo para tu centro
                  </span>
                  . No cambia la hora del servidor ni la configuración global de
                  otros centros, solo cómo se interpretan y muestran las fechas de
                  tus tickets y agendas.
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
                  Volver a valores recomendados
                </button>
                <button
                  onClick={guardarConfiguracionZona}
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
                © 2025 AnyssaMed / INFOGES – Configuración de Zona Horaria.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Centro · Tiempo
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

// =====================================================
// COMPONENTE RESUMEN
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
