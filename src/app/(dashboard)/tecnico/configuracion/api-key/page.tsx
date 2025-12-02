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
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Laptop2,
  Loader2,
  Lock,
  LogOut,
  MapPin as MapPinIcon,
  MonitorSmartphone,
  Network,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
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

type TipoApiKey = "personal" | "centro";
type EstadoApiKey = "activa" | "revocada" | "suspendida";
type EntornoApiKey = "produccion" | "sandbox";

interface ApiKey {
  id_api_key: string;
  nombre: string;
  prefijo: string; // ej: "am_live_"
  ultimos4: string; // últimas 4
  creada_en: string;
  expira_en: string | null;
  estado: EstadoApiKey;
  tipo: TipoApiKey;
  entorno: EntornoApiKey;
  scopes: string[];
  ip_whitelist: string[];
  dominios_origen: string[];
  rate_limit_minuto: number | null;
  rate_limit_diario: number | null;
  notas: string | null;
  ultima_vez_usada: string | null;
  total_llamadas_24h: number;
  total_llamadas_mes: number;
}

interface PreferenciasApiKey {
  id_preferencia?: number;
  exigir_2fa_para_crear: boolean;
  notificar_creacion: boolean;
  notificar_revocacion: boolean;
  notificar_uso_excesivo: boolean;
  notificar_origen_desconocido: boolean;
  max_keys_personales: number;
  max_keys_centro: number;
  expiracion_por_defecto_dias: number | null;
  bloqueo_automatico_por_abuso: boolean;
  umbral_abuso_24h: number | null;
  fecha_actualizacion: string | null;
}

// ========================================
// TEMAS
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
    icono: Shield,
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
    icono: MonitorSmartphone,
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

function crearPreferenciasApiKeyPorDefecto(): PreferenciasApiKey {
  return {
    exigir_2fa_para_crear: true,
    notificar_creacion: true,
    notificar_revocacion: true,
    notificar_uso_excesivo: true,
    notificar_origen_desconocido: true,
    max_keys_personales: 5,
    max_keys_centro: 10,
    expiracion_por_defecto_dias: 180,
    bloqueo_automatico_por_abuso: true,
    umbral_abuso_24h: 50000,
    fecha_actualizacion: null,
  };
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "No definido";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
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
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

function iconoEntorno(entorno: EntornoApiKey) {
  return entorno === "produccion" ? Server : Network;
}

function colorEstado(estado: EstadoApiKey) {
  if (estado === "activa")
    return "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";
  if (estado === "suspendida")
    return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
  return "bg-red-500/20 text-red-200 border-red-400/40";
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

// ========================================
// PAGE COMPONENT
// ========================================

export default function ConfiguracionApiKeyPage() {
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

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [prefs, setPrefs] = useState<PreferenciasApiKey | null>(null);
  const [loadingPanel, setLoadingPanel] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensajeGlobal, setMensajeGlobal] = useState<string | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoApiKey>("todos");
  const [filtroEntorno, setFiltroEntorno] = useState<"todos" | EntornoApiKey>(
    "todos"
  );
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoApiKey>(
    "todos"
  );

  const [savingKeyId, setSavingKeyId] = useState<string | null>(null);

  // para nuevas keys
  const [nuevaKeyNombre, setNuevaKeyNombre] = useState("");
  const [nuevaKeyTipo, setNuevaKeyTipo] = useState<TipoApiKey>("personal");
  const [nuevaKeyEntorno, setNuevaKeyEntorno] =
    useState<EntornoApiKey>("sandbox");
  const [nuevaKeyScopes, setNuevaKeyScopes] = useState("tickets:read");
  const [nuevaKeyExpiraDias, setNuevaKeyExpiraDias] = useState<number | null>(
    180
  );

  const [ultimoTokenVisible, setUltimoTokenVisible] = useState<string | null>(
    null
  );
  const [tipoTokenVisible, setTipoTokenVisible] = useState<
    "nueva" | "rotada" | null
  >(null);
  const [mostrarTokenClaro, setMostrarTokenClaro] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayPrefs = !!prefs;

  const apiKeysFiltradas = useMemo(() => {
    let lista = [...apiKeys];

    if (filtroTipo !== "todos") {
      lista = lista.filter((k) => k.tipo === filtroTipo);
    }
    if (filtroEntorno !== "todos") {
      lista = lista.filter((k) => k.entorno === filtroEntorno);
    }
    if (filtroEstado !== "todos") {
      lista = lista.filter((k) => k.estado === filtroEstado);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((k) => {
        return (
          k.nombre.toLowerCase().includes(q) ||
          k.prefijo.toLowerCase().includes(q) ||
          k.ultimos4.toLowerCase().includes(q) ||
          (k.notas || "").toLowerCase().includes(q)
        );
      });
    }
    return lista;
  }, [apiKeys, filtroTipo, filtroEntorno, filtroEstado, busqueda]);

  const resumen = useMemo(() => {
    const total = apiKeys.length;
    const personales = apiKeys.filter((k) => k.tipo === "personal").length;
    const centro = apiKeys.filter((k) => k.tipo === "centro").length;
    const proximasExpirar = apiKeys.filter((k) => {
      if (!k.expira_en) return false;
      const t = new Date(k.expira_en).getTime();
      if (Number.isNaN(t)) return false;
      const ahora = Date.now();
      const sieteDias = 7 * 24 * 60 * 60 * 1000;
      return t > ahora && t - ahora <= sieteDias && k.estado === "activa";
    }).length;

    return { total, personales, centro, proximasExpirar };
  }, [apiKeys]);

  const hayCambiosPrefs = useMemo(() => {
    return !!prefs;
  }, [prefs]);

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
      cargarPanelApiKeys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.tecnico?.id_tecnico]);

  useEffect(() => {
    if (!mensajeGlobal && !errorGlobal) return;
    const t = setTimeout(() => {
      setMensajeGlobal(null);
      setErrorGlobal(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [mensajeGlobal, errorGlobal]);

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
            `Acceso denegado. Este módulo de API Keys es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarPanelApiKeys = async () => {
    try {
      setLoadingPanel(true);
      setErrorGlobal(null);

      const res = await fetch("/api/tecnico/api-keys/panel", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Respuesta panel api-keys:", data);
        setApiKeys([]);
        setPrefs((prev) => prev ?? crearPreferenciasApiKeyPorDefecto());
        return;
      }

      const keys: ApiKey[] = (data.keys || []).map((k: any) => ({
        id_api_key: String(k.id_api_key ?? k.id ?? Math.random()),
        nombre: k.nombre ?? "API Key sin nombre",
        prefijo: k.prefijo ?? "am_",
        ultimos4: k.ultimos4 ?? "****",
        creada_en: k.creada_en ?? new Date().toISOString(),
        expira_en: k.expira_en ?? null,
        estado: (k.estado as EstadoApiKey) ?? "activa",
        tipo: (k.tipo as TipoApiKey) ?? "personal",
        entorno: (k.entorno as EntornoApiKey) ?? "sandbox",
        scopes: Array.isArray(k.scopes)
          ? k.scopes
          : typeof k.scopes === "string"
          ? k.scopes.split(",").map((s: string) => s.trim()).filter(Boolean)
          : ["tickets:read"],
        ip_whitelist: Array.isArray(k.ip_whitelist)
          ? k.ip_whitelist
          : typeof k.ip_whitelist === "string" && k.ip_whitelist.length > 0
          ? k.ip_whitelist.split(",").map((s: string) => s.trim())
          : [],
        dominios_origen: Array.isArray(k.dominios_origen)
          ? k.dominios_origen
          : typeof k.dominios_origen === "string" &&
            k.dominios_origen.length > 0
          ? k.dominios_origen.split(",").map((s: string) => s.trim())
          : [],
        rate_limit_minuto:
          typeof k.rate_limit_minuto === "number"
            ? k.rate_limit_minuto
            : null,
        rate_limit_diario:
          typeof k.rate_limit_diario === "number"
            ? k.rate_limit_diario
            : null,
        notas: k.notas ?? null,
        ultima_vez_usada: k.ultima_vez_usada ?? null,
        total_llamadas_24h: k.total_llamadas_24h ?? 0,
        total_llamadas_mes: k.total_llamadas_mes ?? 0,
      }));

      setApiKeys(keys);

      if (data.preferencias) {
        const p = data.preferencias;
        const prefsLocal: PreferenciasApiKey = {
          id_preferencia: p.id_preferencia,
          exigir_2fa_para_crear: p.exigir_2fa_para_crear ?? true,
          notificar_creacion: p.notificar_creacion ?? true,
          notificar_revocacion: p.notificar_revocacion ?? true,
          notificar_uso_excesivo: p.notificar_uso_excesivo ?? true,
          notificar_origen_desconocido:
            p.notificar_origen_desconocido ?? true,
          max_keys_personales: p.max_keys_personales ?? 5,
          max_keys_centro: p.max_keys_centro ?? 10,
          expiracion_por_defecto_dias:
            typeof p.expiracion_por_defecto_dias === "number"
              ? p.expiracion_por_defecto_dias
              : 180,
          bloqueo_automatico_por_abuso:
            p.bloqueo_automatico_por_abuso ?? true,
          umbral_abuso_24h:
            typeof p.umbral_abuso_24h === "number"
              ? p.umbral_abuso_24h
              : 50000,
          fecha_actualizacion: p.fecha_actualizacion ?? null,
        };
        setPrefs(prefsLocal);
      } else {
        setPrefs((prev) => prev ?? crearPreferenciasApiKeyPorDefecto());
      }
    } catch (error) {
      console.error("Error al cargar panel api-keys:", error);
      setErrorGlobal(
        "No se pudieron cargar las API Keys. Se usan preferencias base por defecto."
      );
      setPrefs((prev) => prev ?? crearPreferenciasApiKeyPorDefecto());
    } finally {
      setLoadingPanel(false);
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

  const actualizarApiKeyLocal = (
    id_api_key: string,
    cambios: Partial<ApiKey>
  ) => {
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id_api_key === id_api_key ? { ...k, ...cambios } : k
      )
    );
  };

  const guardarApiKey = async (key: ApiKey) => {
    try {
      setSavingKeyId(key.id_api_key);
      setGuardando(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch(
        `/api/tecnico/api-keys/${encodeURIComponent(key.id_api_key)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...key,
            scopes: key.scopes,
            ip_whitelist: key.ip_whitelist,
            dominios_origen: key.dominios_origen,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar api-key:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron guardar los cambios de esta API Key."
        );
        return;
      }

      const k = data.api_key || data.key || key;
      actualizarApiKeyLocal(key.id_api_key, {
        ...key,
        notas: k.notas ?? key.notas,
        rate_limit_minuto:
          typeof k.rate_limit_minuto === "number"
            ? k.rate_limit_minuto
            : key.rate_limit_minuto,
        rate_limit_diario:
          typeof k.rate_limit_diario === "number"
            ? k.rate_limit_diario
            : key.rate_limit_diario,
      });

      setMensajeGlobal(`API Key "${key.nombre}" guardada correctamente.`);
    } catch (error) {
      console.error("Error al guardar api-key:", error);
      setErrorGlobal(
        "Ocurrió un error al guardar los cambios de la API Key."
      );
    } finally {
      setGuardando(false);
      setSavingKeyId(null);
    }
  };

  const revocarApiKey = async (key: ApiKey) => {
    if (!confirm(`¿Seguro que quieres revocar la API Key "${key.nombre}"?`))
      return;
    try {
      setGuardando(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/tecnico/api-keys/revocar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_api_key: key.id_api_key }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al revocar api-key:", data);
        setErrorGlobal(data?.message || "No se pudo revocar la API Key.");
        return;
      }

      actualizarApiKeyLocal(key.id_api_key, { estado: "revocada" });
      setMensajeGlobal(`API Key "${key.nombre}" revocada correctamente.`);
    } catch (error) {
      console.error("Error al revocar api-key:", error);
      setErrorGlobal("Ocurrió un error al revocar la API Key.");
    } finally {
      setGuardando(false);
    }
  };

  const rotarApiKey = async (key: ApiKey) => {
    if (
      !confirm(
        `Se generará un nuevo secreto para "${key.nombre}". El anterior dejará de funcionar. ¿Continuar?`
      )
    )
      return;

    try {
      setGuardando(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);
      setUltimoTokenVisible(null);

      const res = await fetch("/api/tecnico/api-keys/rotar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_api_key: key.id_api_key }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.api_key_clara) {
        console.error("Error al rotar api-key:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudo rotar la API Key. Inténtalo nuevamente."
        );
        return;
      }

      // opcionalmente puedes usar datos.api_key para actualizar algo
      setUltimoTokenVisible(data.api_key_clara);
      setTipoTokenVisible("rotada");
      setMostrarTokenClaro(false);

      setMensajeGlobal(
        `API Key "${key.nombre}" rotada. Copia el nuevo secreto, se mostrará una sola vez.`
      );
    } catch (error) {
      console.error("Error al rotar api-key:", error);
      setErrorGlobal("Ocurrió un error al rotar la API Key.");
    } finally {
      setGuardando(false);
    }
  };

  const crearNuevaApiKey = async () => {
    if (!usuario?.tecnico) return;
    if (!nuevaKeyNombre.trim()) {
      alert("Define un nombre para la API Key.");
      return;
    }

    try {
      setGuardando(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);
      setUltimoTokenVisible(null);

      const scopesList = nuevaKeyScopes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/tecnico/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: nuevaKeyNombre.trim(),
          tipo: nuevaKeyTipo,
          entorno: nuevaKeyEntorno,
          scopes: scopesList,
          expira_en_dias: nuevaKeyExpiraDias,
          id_centro:
            nuevaKeyTipo === "centro"
              ? usuario.tecnico.centro?.id_centro ??
                usuario.tecnico.id_centro
              : null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.api_key) {
        console.error("Error al crear api-key:", data);
        setErrorGlobal(
          data?.message || "No se pudo crear la API Key. Revisa los datos."
        );
        return;
      }

      const k = data.api_key;
      const nueva: ApiKey = {
        id_api_key: String(k.id_api_key ?? k.id ?? Math.random()),
        nombre: k.nombre ?? nuevaKeyNombre.trim(),
        prefijo: k.prefijo ?? "am_",
        ultimos4: k.ultimos4 ?? "****",
        creada_en: k.creada_en ?? new Date().toISOString(),
        expira_en: k.expira_en ?? null,
        estado: (k.estado as EstadoApiKey) ?? "activa",
        tipo: (k.tipo as TipoApiKey) ?? nuevaKeyTipo,
        entorno: (k.entorno as EntornoApiKey) ?? nuevaKeyEntorno,
        scopes: Array.isArray(k.scopes) ? k.scopes : scopesList,
        ip_whitelist: Array.isArray(k.ip_whitelist) ? k.ip_whitelist : [],
        dominios_origen: Array.isArray(k.dominios_origen)
          ? k.dominios_origen
          : [],
        rate_limit_minuto:
          typeof k.rate_limit_minuto === "number"
            ? k.rate_limit_minuto
            : null,
        rate_limit_diario:
          typeof k.rate_limit_diario === "number"
            ? k.rate_limit_diario
            : null,
        notas: k.notas ?? null,
        ultima_vez_usada: k.ultima_vez_usada ?? null,
        total_llamadas_24h: k.total_llamadas_24h ?? 0,
        total_llamadas_mes: k.total_llamadas_mes ?? 0,
      };

      setApiKeys((prev) => [nueva, ...prev]);

      if (data.api_key_clara) {
        setUltimoTokenVisible(data.api_key_clara);
        setTipoTokenVisible("nueva");
        setMostrarTokenClaro(false);
      }

      setNuevaKeyNombre("");
      setNuevaKeyScopes("tickets:read");
      setNuevaKeyTipo("personal");
      setNuevaKeyEntorno("sandbox");
      setNuevaKeyExpiraDias(180);

      setMensajeGlobal(
        `API Key "${nueva.nombre}" creada. Copia el secreto mostrado, se verá solo una vez.`
      );
    } catch (error) {
      console.error("Error al crear api-key:", error);
      setErrorGlobal(
        "Ocurrió un error al crear la API Key. Inténtalo nuevamente."
      );
    } finally {
      setGuardando(false);
    }
  };

  const guardarPreferenciasApiKey = async () => {
    if (!prefs) return;
    try {
      setGuardando(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const metodo = prefs.id_preferencia ? "PUT" : "POST";

      const res = await fetch("/api/tecnico/api-keys/preferencias", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefs),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar prefs api-key:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron guardar las preferencias de API Keys."
        );
        return;
      }

      const p = data.preferencias || data.data || prefs;
      setPrefs({
        ...prefs,
        ...p,
        fecha_actualizacion:
          p.fecha_actualizacion ??
          prefs.fecha_actualizacion ??
          new Date().toISOString(),
        id_preferencia: p.id_preferencia ?? prefs.id_preferencia,
      });

      setMensajeGlobal("Preferencias de API Keys guardadas correctamente.");
    } catch (error) {
      console.error("Error al guardar prefs api-key:", error);
      setErrorGlobal(
        "Ocurrió un error al guardar las preferencias de seguridad API."
      );
    } finally {
      setGuardando(false);
    }
  };

  const restaurarPrefsDefault = () => {
    setPrefs((prev) => {
      const base = crearPreferenciasApiKeyPorDefecto();
      return prev ? { ...base, id_preferencia: prev.id_preferencia } : base;
    });
  };

  const copiarAlPortapapeles = async (texto: string) => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(texto);
        alert("API Key copiada al portapapeles.");
      } else if (typeof window !== "undefined") {
        window.prompt("Copia manualmente la API Key:", texto);
      }
    } catch (error) {
      console.error("Error al copiar:", error);
      alert("No se pudo copiar al portapapeles.");
    }
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
              <KeyRound className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando configuración de API Keys
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Validando tu sesión y preparando el panel de integraciones seguras...
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
            No tienes permisos para acceder a la configuración de API Keys del
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
  const cargandoContenido = loadingPanel || !hayPrefs;

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
                placeholder="Buscar por nombre de API Key, prefijo, últimas 4, notas..."
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
              <span className="animate-wave inline-block">🔐</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Administra tus{" "}
              <span className={tema.colores.texto}>API Keys técnicas</span> para
              integraciones seguras entre tu centro y otros sistemas.
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
                onClick={cargarPanelApiKeys}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={cargandoContenido}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    cargandoContenido ? "animate-spin" : "opacity-60"
                  }`}
                />
                Recargar API Keys
              </button>
              <button
                onClick={guardarPreferenciasApiKey}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambiosPrefs || guardando}
              >
                <Save className="w-4 h-4" />
                {guardando ? "Guardando..." : "Guardar preferencias"}
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {prefs?.fecha_actualizacion ? (
                <p className={tema.colores.textoSecundario}>
                  Preferencias actualizadas:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFechaHora(prefs.fecha_actualizacion)}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  Aún no se han guardado preferencias personalizadas de API
                  Keys.
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
            icono={KeyRound}
            titulo="API Keys totales"
            valor={resumen.total}
            chip="Activas y revocadas"
            color="from-indigo-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={Laptop2}
            titulo="Personales"
            valor={resumen.personales}
            chip="Solo tu usuario"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={Server}
            titulo="Del centro"
            valor={resumen.centro}
            chip="Integraciones del establecimiento"
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertTriangle}
            titulo="Próximas a expirar"
            valor={resumen.proximasExpirar}
            chip="En los próximos 7 días"
            color="from-red-500 to-orange-500"
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
                Cargando todas las API Keys asociadas a tu cuenta y a tu
                centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* LISTA API KEYS */}
              <div
                className={`xl:col-span-2 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        API Keys configuradas
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Revisa el detalle de cada clave, sus límites y desde
                        dónde se pueden usar.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <select
                      value={filtroTipo}
                      onChange={(e) =>
                        setFiltroTipo(e.target.value as "todos" | TipoApiKey)
                      }
                      className={`px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Tipo: todas</option>
                      <option value="personal">Personales</option>
                      <option value="centro">Centro</option>
                    </select>
                    <select
                      value={filtroEntorno}
                      onChange={(e) =>
                        setFiltroEntorno(
                          e.target.value as "todos" | EntornoApiKey
                        )
                      }
                      className={`px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Entorno: todos</option>
                      <option value="sandbox">Sandbox</option>
                      <option value="produccion">Producción</option>
                    </select>
                    <select
                      value={filtroEstado}
                      onChange={(e) =>
                        setFiltroEstado(
                          e.target.value as "todos" | EstadoApiKey
                        )
                      }
                      className={`px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="todos">Estado: todos</option>
                      <option value="activa">Activas</option>
                      <option value="suspendida">Suspendidas</option>
                      <option value="revocada">Revocadas</option>
                    </select>
                  </div>
                </div>

                {apiKeysFiltradas.length === 0 ? (
                  <div className="p-6 text-center text-sm">
                    <p className={tema.colores.textoSecundario}>
                      No hay API Keys que coincidan con los filtros actuales.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                    {apiKeysFiltradas.map((k) => {
                      const IconoEntorno = iconoEntorno(k.entorno);
                      return (
                        <div
                          key={k.id_api_key}
                          className={`rounded-2xl p-3 md:p-4 border ${tema.colores.borde} ${tema.colores.hover} flex flex-col gap-3`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                              >
                                <IconoEntorno className="w-5 h-5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    defaultValue={k.nombre}
                                    onBlur={(e) =>
                                      e.target.value.trim() &&
                                      actualizarApiKeyLocal(k.id_api_key, {
                                        nombre: e.target.value.trim(),
                                      })
                                    }
                                    className={`text-sm font-semibold bg-transparent border-b border-dashed border-transparent focus:border-indigo-400 focus:outline-none ${tema.colores.texto}`}
                                  />
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorEstado(
                                      k.estado
                                    )}`}
                                  >
                                    {k.estado.toUpperCase()}
                                  </span>
                                </div>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  {k.prefijo}
                                  {"·".repeat(3)}
                                  {k.ultimos4} · {k.tipo === "personal"
                                    ? "Uso personal"
                                    : "Integraciones centro"}{" "}
                                  · {k.entorno === "produccion"
                                    ? "Producción"
                                    : "Sandbox"}
                                </p>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  Creada:{" "}
                                  <span className={tema.colores.texto}>
                                    {formatearFecha(k.creada_en)}
                                  </span>{" "}
                                  · Último uso:{" "}
                                  <span className={tema.colores.texto}>
                                    {formatearFechaHora(k.ultima_vez_usada)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-[11px]">
                              <div className="text-right">
                                <p className={tema.colores.textoSecundario}>
                                  Llamadas últimas 24h
                                </p>
                                <p className={tema.colores.texto}>
                                  {k.total_llamadas_24h}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={tema.colores.textoSecundario}>
                                  Llamadas mes actual
                                </p>
                                <p className={tema.colores.texto}>
                                  {k.total_llamadas_mes}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Config avanzada por Key */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] mt-1">
                            <div className="space-y-2">
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                Scopes / permisos
                              </p>
                              <textarea
                                defaultValue={k.scopes.join(", ")}
                                onBlur={(e) => {
                                  const list = e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  actualizarApiKeyLocal(k.id_api_key, {
                                    scopes: list,
                                  });
                                }}
                                rows={2}
                                className={`w-full px-2 py-1 rounded-lg resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                              />
                              <p className={tema.colores.textoSecundario}>
                                Ej: tickets:read, tickets:write,
                                equipos:read, equipos:write
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                Notas internas
                              </p>
                              <textarea
                                defaultValue={k.notas ?? ""}
                                onBlur={(e) =>
                                  actualizarApiKeyLocal(k.id_api_key, {
                                    notas: e.target.value.trim() || null,
                                  })
                                }
                                rows={2}
                                className={`w-full px-2 py-1 rounded-lg resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                              />
                              <p className={tema.colores.textoSecundario}>
                                Describe qué integra (ej: laboratorio externo,
                                bodega, dashboard BI...).
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] mt-2">
                            <div className="space-y-2">
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                IPs permitidas (whitelist)
                              </p>
                              <textarea
                                defaultValue={k.ip_whitelist.join(", ")}
                                onBlur={(e) => {
                                  const list = e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  actualizarApiKeyLocal(k.id_api_key, {
                                    ip_whitelist: list,
                                  });
                                }}
                                rows={2}
                                className={`w-full px-2 py-1 rounded-lg resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                              />
                              <p className={tema.colores.textoSecundario}>
                                Opcional. Se recomienda para integraciones
                                servidor-servidor.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                Dominios de origen permitidos (CORS)
                              </p>
                              <textarea
                                defaultValue={k.dominios_origen.join(", ")}
                                onBlur={(e) => {
                                  const list = e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  actualizarApiKeyLocal(k.id_api_key, {
                                    dominios_origen: list,
                                  });
                                }}
                                rows={2}
                                className={`w-full px-2 py-1 rounded-lg resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                              />
                              <p className={tema.colores.textoSecundario}>
                                Útil si en algún caso se expone en front ends
                                controlados (idealmente, evitar).
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] mt-2">
                            <div className="space-y-2">
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                Límites de uso (rate limit)
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={tema.colores.textoSecundario}
                                >
                                  Máx/minuto
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={k.rate_limit_minuto ?? 0}
                                  onBlur={(e) =>
                                    actualizarApiKeyLocal(k.id_api_key, {
                                      rate_limit_minuto:
                                        parseInt(e.target.value || "0", 10) ||
                                        null,
                                    })
                                  }
                                  className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                                />
                                <span
                                  className={tema.colores.textoSecundario}
                                >
                                  Máx/día
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  defaultValue={k.rate_limit_diario ?? 0}
                                  onBlur={(e) =>
                                    actualizarApiKeyLocal(k.id_api_key, {
                                      rate_limit_diario:
                                        parseInt(e.target.value || "0", 10) ||
                                        null,
                                    })
                                  }
                                  className={`w-24 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                                />
                              </div>
                              <p className={tema.colores.textoSecundario}>
                                Deja 0 para no aplicar límite desde esta capa.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p
                                className={`text-xs font-semibold ${tema.colores.texto}`}
                              >
                                Expiración
                              </p>
                              <p className={tema.colores.textoSecundario}>
                                Expira el:{" "}
                                <span className={tema.colores.texto}>
                                  {k.expira_en
                                    ? formatearFecha(k.expira_en)
                                    : "Sin vencimiento configurado"}
                                </span>
                              </p>
                              <p className={tema.colores.textoSecundario}>
                                Cambios de fecha de expiración se deben
                                gestionar desde backend o consola de
                                administración global.
                              </p>
                            </div>
                          </div>

                          {/* Acciones por Key */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11px]">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => guardarApiKey(k)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-500/60 text-indigo-100 hover:bg-indigo-500/10 font-semibold disabled:opacity-60 disabled:cursor-not-allowed`}
                                disabled={guardando && savingKeyId === k.id_api_key}
                              >
                                <Save className="w-3 h-3" />
                                {guardando && savingKeyId === k.id_api_key
                                  ? "Guardando..."
                                  : "Guardar cambios de esta key"}
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {k.estado === "activa" && (
                                <button
                                  onClick={() => rotarApiKey(k)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-500/60 text-amber-200 hover:bg-amber-500/10 font-semibold"
                                  disabled={guardando}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Rotar secreto
                                </button>
                              )}
                              {k.estado !== "revocada" && (
                                <button
                                  onClick={() => revocarApiKey(k)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-500/60 text-red-200 hover:bg-red-500/10 font-semibold"
                                  disabled={guardando}
                                >
                                  <Lock className="w-3 h-3" />
                                  Revocar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* GENERADOR + PREFERENCIAS */}
              <div className="space-y-6 xl:col-span-1">
                {/* Generar nueva API Key */}
                <div
                  className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Nueva API Key
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Crea una credencial específica para cada integración.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <p className={tema.colores.texto}>Nombre de la key</p>
                      <input
                        type="text"
                        placeholder="Ej: Laboratorio Externo, PowerBI, Sistema de Bodega..."
                        value={nuevaKeyNombre}
                        onChange={(e) => setNuevaKeyNombre(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[120px] space-y-1">
                        <p className={tema.colores.texto}>Tipo</p>
                        <select
                          value={nuevaKeyTipo}
                          onChange={(e) =>
                            setNuevaKeyTipo(e.target.value as TipoApiKey)
                          }
                          className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        >
                          <option value="personal">Personal (solo tú)</option>
                          <option value="centro">
                            Centro (integraciones del establecimiento)
                          </option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-1">
                        <p className={tema.colores.texto}>Entorno</p>
                        <select
                          value={nuevaKeyEntorno}
                          onChange={(e) =>
                            setNuevaKeyEntorno(
                              e.target.value as EntornoApiKey
                            )
                          }
                          className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        >
                          <option value="sandbox">Sandbox / pruebas</option>
                          <option value="produccion">Producción</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className={tema.colores.texto}>Scopes iniciales</p>
                      <textarea
                        value={nuevaKeyScopes}
                        onChange={(e) => setNuevaKeyScopes(e.target.value)}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-xl resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <p className={tema.colores.textoSecundario}>
                        Separa por coma. Ej: tickets:read, tickets:write,
                        equipos:read
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className={tema.colores.texto}>
                        Expiración por defecto
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={nuevaKeyExpiraDias ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value || "0", 10);
                            setNuevaKeyExpiraDias(Number.isNaN(v) ? null : v);
                          }}
                          className={`w-24 px-3 py-2 rounded-xl text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <span className={tema.colores.textoSecundario}>
                          días (0 = sin expiración automática)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={crearNuevaApiKey}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                        disabled={guardando}
                      >
                        <KeyRound className="w-4 h-4" />
                        {guardando ? "Creando..." : "Generar nueva API Key"}
                      </button>
                      <p className={tema.colores.textoSecundario}>
                        La clave completa solo se mostrará una vez. No la
                        compartas por correo o chats sin cifrar.
                      </p>
                    </div>
                  </div>

                  {/* Muestra de última key generada/rotada */}
                  {ultimoTokenVisible && (
                    <div className="mt-4 border border-amber-500/40 rounded-2xl p-3 bg-amber-500/5 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-300" />
                        <p className="font-semibold text-amber-100">
                          {tipoTokenVisible === "nueva"
                            ? "Nueva API Key generada"
                            : "API Key rotada"}
                        </p>
                      </div>
                      <p className="text-amber-100">
                        Copia y guarda esta clave en un lugar seguro. No se
                        volverá a mostrar completa.
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-amber-400/40 font-mono text-[11px] overflow-x-auto">
                          {mostrarTokenClaro
                            ? ultimoTokenVisible
                            : "••••••••••••••••••••••••••••••••"}
                        </div>
                        <button
                          onClick={() =>
                            setMostrarTokenClaro((prev) => !prev)
                          }
                          className="p-2 rounded-xl bg-black/20 hover:bg-black/30"
                        >
                          {mostrarTokenClaro ? (
                            <EyeOff className="w-4 h-4 text-amber-100" />
                          ) : (
                            <Eye className="w-4 h-4 text-amber-100" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            copiarAlPortapapeles(ultimoTokenVisible)
                          }
                          className="p-2 rounded-xl bg-black/20 hover:bg-black/30 flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4 text-amber-100" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* PREFERENCIAS */}
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
                        Reglas globales de API Keys
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ajusta el comportamiento por defecto de seguridad y
                        alertas.
                      </p>
                    </div>
                  </div>

                  {prefs && (
                    <div className="space-y-3 text-xs">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.exigir_2fa_para_crear}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    exigir_2fa_para_crear: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Exigir 2FA/segundo factor para crear o rotar API
                          Keys.
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.notificar_creacion}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_creacion: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Enviar notificación cuando se cree una nueva API Key.
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.notificar_revocacion}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_revocacion: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Enviar notificación cuando se revoque o suspenda una
                          API Key.
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-amber-500"
                          checked={prefs.notificar_uso_excesivo}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_uso_excesivo: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Alertar si alguna clave se dispara en llamadas
                          anormales (picos de uso).
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-amber-500"
                          checked={prefs.notificar_origen_desconocido}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_origen_desconocido:
                                      e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Avisar si una API Key se usa desde IP o dominio no
                          registrado.
                        </span>
                      </label>

                      <div className="border-t border-dashed border-gray-600/40 pt-3 mt-2 space-y-2">
                        <p
                          className={`text-xs font-semibold ${tema.colores.texto}`}
                        >
                          Límites globales
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={tema.colores.textoSecundario}>
                            Máx. personales:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={prefs.max_keys_personales}
                            onChange={(e) =>
                              setPrefs((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      max_keys_personales: Math.min(
                                        50,
                                        Math.max(
                                          1,
                                          parseInt(e.target.value || "1", 10)
                                        )
                                      ),
                                    }
                                  : prev
                              )
                            }
                            className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          />
                          <span className={tema.colores.textoSecundario}>
                            Máx. centro:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={prefs.max_keys_centro}
                            onChange={(e) =>
                              setPrefs((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      max_keys_centro: Math.min(
                                        100,
                                        Math.max(
                                          1,
                                          parseInt(e.target.value || "1", 10)
                                        )
                                      ),
                                    }
                                  : prev
                              )
                            }
                            className={`w-20 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={tema.colores.textoSecundario}>
                            Expiración por defecto:
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={365 * 5}
                            value={prefs.expiracion_por_defecto_dias ?? 0}
                            onChange={(e) =>
                              setPrefs((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      expiracion_por_defecto_dias:
                                        parseInt(e.target.value || "0", 10) ||
                                        0,
                                    }
                                  : prev
                              )
                            }
                            className={`w-24 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          />
                          <span className={tema.colores.textoSecundario}>
                            días (0 = sin expiración)
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-600/40 pt-3 mt-2 space-y-2">
                        <p
                          className={`text-xs font-semibold ${tema.colores.texto}`}
                        >
                          Detección de abuso
                        </p>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-0.5 w-4 h-4 accent-red-500"
                            checked={prefs.bloqueo_automatico_por_abuso}
                            onChange={(e) =>
                              setPrefs((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      bloqueo_automatico_por_abuso:
                                        e.target.checked,
                                    }
                                  : prev
                              )
                            }
                          />
                          <span className={tema.colores.textoSecundario}>
                            Bloquear automáticamente una API Key si supera el
                            umbral de uso en 24h.
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className={tema.colores.textoSecundario}>
                            Umbral 24h:
                          </span>
                          <input
                            type="number"
                            min={100}
                            max={1000000}
                            value={prefs.umbral_abuso_24h ?? 50000}
                            onChange={(e) =>
                              setPrefs((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      umbral_abuso_24h:
                                        parseInt(e.target.value || "0", 10) ||
                                        0,
                                    }
                                  : prev
                              )
                            }
                            className={`w-28 px-2 py-1 rounded-lg text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          />
                          <span className={tema.colores.textoSecundario}>
                            llamadas
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 flex flex-wrap items-center gap-3">
                        <button
                          onClick={restaurarPrefsDefault}
                          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                        >
                          Valores recomendados
                        </button>
                        <button
                          onClick={guardarPreferenciasApiKey}
                          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                          disabled={guardando}
                        >
                          <Save className="w-4 h-4" />
                          {guardando ? "Guardando..." : "Guardar ahora"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DISCLAIMER / BARRA ABAJO */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm flex items-start gap-2">
                <Clipboard className={`w-4 h-4 mt-0.5 ${tema.colores.texto}`} />
                <p className={tema.colores.textoSecundario}>
                  Las API Keys de este módulo{" "}
                  <span className={tema.colores.texto}>
                    solo controlan integraciones técnicas
                  </span>{" "}
                  (laboratorios, BI, otros sistemas) y{" "}
                  <span className={tema.colores.texto}>
                    no exponen datos sensibles directamente
                  </span>{" "}
                  sin pasar por las políticas centrales de seguridad de
                  AnyssaMed / INFOGES.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                <span
                  className={`px-3 py-1 rounded-full bg-black/20 ${tema.colores.textoSecundario}`}
                >
                  Recomendación: una key por integración · revocar cuando deje
                  de usarse
                </span>
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
                © 2025 AnyssaMed / INFOGES – API Keys & Integraciones.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Seguridad de Integración
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
