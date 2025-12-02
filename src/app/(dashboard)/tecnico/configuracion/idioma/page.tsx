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
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Globe,
  Languages,
  Loader2,
  LogOut,
  MapPin as MapPinIcon,
  Save,
  Search,
  Settings,
  Sparkles,
  User,
  X,
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

interface PreferenciasIdioma {
  id_preferencia?: number;
  idioma: string; // 'es', 'en', 'pt', 'fr', etc.
  zona_horaria: string; // 'America/Santiago', etc.
  formato_fecha: string; // 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'
  formato_hora: string; // '24h' | '12h'
  fecha_actualizacion?: string | null;
}

interface Pais {
  id_pais: number;
  nombre: string;
  codigo_iso2: string;
  codigo_iso3: string | null;
  phone_code: string | null;
  capital: string | null;
  continente: string | null;
  moneda: string | null;
  codigo_moneda: string | null;
  idioma_oficial: string | null;
  dominio_internet: string | null;
  bandera_url: string | null;
  prioridad: number;
  activo: number;
}

// ========================================
// TEMAS (igual que en otras pages)
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
    icono: WifiIcon,
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

// iconitos básicos para los temas (reutilizando lucide)
function SunIcon(props: any) {
  return <Globe {...props} />; // placeholder simpático
}
function MoonIcon(props: any) {
  return <Languages {...props} />;
}
function WifiIcon(props: any) {
  return <Activity {...props} />;
}
function HeartIcon(props: any) {
  return <Bell {...props} />;
}

// ========================================
// OPCIONES IDIOMA / ZONAS HORARIAS
// ========================================

const IDIOMAS_DISPONIBLES: {
  codigo: string;
  label: string;
  descripcion: string;
  emoji: string;
}[] = [
  {
    codigo: "es",
    label: "Español",
    descripcion: "Ideal para centros en Latinoamérica y España.",
    emoji: "🇪🇸",
  },
  {
    codigo: "en",
    label: "English",
    descripcion: "Interfaz global en inglés.",
    emoji: "🇺🇸",
  },
  {
    codigo: "pt",
    label: "Português",
    descripcion: "Para Brasil y países lusófonos.",
    emoji: "🇧🇷",
  },
  {
    codigo: "fr",
    label: "Français",
    descripcion: "Soporte para usuarios francófonos.",
    emoji: "🇫🇷",
  },
];

const FORMATO_FECHA_OPCIONES = [
  { id: "DD/MM/YYYY", label: "DD/MM/YYYY (ej: 25/12/2025)" },
  { id: "MM/DD/YYYY", label: "MM/DD/YYYY (ej: 12/25/2025)" },
  { id: "YYYY-MM-DD", label: "YYYY-MM-DD (ej: 2025-12-25)" },
];

const FORMATO_HORA_OPCIONES = [
  { id: "24h", label: "24 horas (13:45)" },
  { id: "12h", label: "12 horas (1:45 PM)" },
];

const ZONAS_HORARIAS_POPULARES: {
  id: string;
  label: string;
  region: string;
}[] = [
  {
    id: "America/Santiago",
    label: "(GMT-04:00) Santiago, Chile",
    region: "América del Sur",
  },
  {
    id: "America/Bogota",
    label: "(GMT-05:00) Bogotá, Lima, Quito",
    region: "América del Sur",
  },
  {
    id: "America/Buenos_Aires",
    label: "(GMT-03:00) Buenos Aires, Argentina",
    region: "América del Sur",
  },
  {
    id: "America/Mexico_City",
    label: "(GMT-06:00) Ciudad de México",
    region: "América del Norte",
  },
  {
    id: "America/New_York",
    label: "(GMT-05:00) Nueva York",
    region: "América del Norte",
  },
  {
    id: "Europe/Madrid",
    label: "(GMT+01:00) Madrid, España",
    region: "Europa",
  },
  {
    id: "Europe/London",
    label: "(GMT+00:00) Londres, Reino Unido",
    region: "Europa",
  },
  {
    id: "Europe/Paris",
    label: "(GMT+01:00) París, Francia",
    region: "Europa",
  },
  {
    id: "Africa/Johannesburg",
    label: "(GMT+02:00) Johannesburgo, Sudáfrica",
    region: "África",
  },
  {
    id: "Asia/Dubai",
    label: "(GMT+04:00) Dubái, EAU",
    region: "Asia",
  },
  {
    id: "Asia/Tokyo",
    label: "(GMT+09:00) Tokio, Japón",
    region: "Asia",
  },
  {
    id: "Asia/Shanghai",
    label: "(GMT+08:00) Shanghái, China",
    region: "Asia",
  },
  {
    id: "Australia/Sydney",
    label: "(GMT+10:00) Sídney, Australia",
    region: "Oceanía",
  },
];

const MAPA_ZONA_HORARIA_POR_PAIS: Record<string, string> = {
  CL: "America/Santiago",
  AR: "America/Buenos_Aires",
  CO: "America/Bogota",
  PE: "America/Bogota",
  MX: "America/Mexico_City",
  US: "America/New_York",
  ES: "Europe/Madrid",
  FR: "Europe/Paris",
  GB: "Europe/London",
  PT: "Europe/Lisbon",
  BR: "America/Sao_Paulo",
};

// ========================================
// HELPERS
// ========================================

function crearPreferenciasIdiomaPorDefecto(): PreferenciasIdioma {
  return {
    idioma: "es",
    zona_horaria: "America/Santiago",
    formato_fecha: "DD/MM/YYYY",
    formato_hora: "24h",
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

function normalizarTexto(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function construirFechaEjemplo(formato_fecha: string, zona_horaria: string) {
  const now = new Date();
  const timeZone = zona_horaria || "UTC";
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(now);

  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "2025";

  switch (formato_fecha) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
}

function construirHoraEjemplo(formato_hora: string, zona_horaria: string) {
  const now = new Date();
  const timeZone = zona_horaria || "UTC";
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: formato_hora === "12h",
    timeZone,
  };
  return new Intl.DateTimeFormat("en-US", opts).format(now);
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

export default function ConfiguracionIdiomaPageTecnico() {
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

  const [preferencias, setPreferencias] = useState<PreferenciasIdioma | null>(
    null
  );
  const [preferenciasOriginal, setPreferenciasOriginal] =
    useState<PreferenciasIdioma | null>(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [guardandoPrefs, setGuardandoPrefs] = useState(false);
  const [mensajePrefs, setMensajePrefs] = useState<string | null>(null);
  const [errorPrefs, setErrorPrefs] = useState<string | null>(null);

  const [paises, setPaises] = useState<Pais[]>([]);
  const [loadingPaises, setLoadingPaises] = useState(true);
  const [paisSeleccionado, setPaisSeleccionado] = useState<Pais | null>(null);
  const [busquedaPais, setBusquedaPais] = useState("");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambios = useMemo(() => {
    if (!preferencias || !preferenciasOriginal) return false;
    const { fecha_actualizacion: _fa, ...rest } = preferencias;
    const { fecha_actualizacion: _fa2, ...restOriginal } = preferenciasOriginal;
    return JSON.stringify(rest) !== JSON.stringify(restOriginal);
  }, [preferencias, preferenciasOriginal]);

  const previewFechaHora = useMemo(() => {
    if (!preferencias) return null;
    return {
      fecha: construirFechaEjemplo(
        preferencias.formato_fecha,
        preferencias.zona_horaria
      ),
      hora: construirHoraEjemplo(
        preferencias.formato_hora,
        preferencias.zona_horaria
      ),
    };
  }, [preferencias]);

  const paisesFiltrados = useMemo(() => {
    if (!paises.length) return [];
    const q = normalizarTexto(busquedaPais || busqueda);
    if (!q) {
      return [...paises].sort(
        (a, b) =>
          (a.prioridad - b.prioridad) ||
          a.nombre.localeCompare(b.nombre, "es")
      );
    }

    return [...paises]
      .filter((p) => {
        const texto =
          `${p.nombre} ${p.continente ?? ""} ${
            p.capital ?? ""
          } ${p.codigo_iso2} ${p.codigo_iso3 ?? ""} ${p.moneda ?? ""} ${
            p.idioma_oficial ?? ""
          }`;
        return normalizarTexto(texto).includes(q);
      })
      .sort(
        (a, b) =>
          (a.prioridad - b.prioridad) ||
          a.nombre.localeCompare(b.nombre, "es")
      );
  }, [paises, busquedaPais, busqueda]);

  const temaFooter = "Idioma y Región";

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
      cargarPreferenciasIdioma();
      cargarPaises();
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
            `Acceso denegado. Este módulo de idioma/región es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarPreferenciasIdioma = async () => {
    try {
      setLoadingPrefs(true);
      setErrorPrefs(null);

      const res = await fetch("/api/users/preferencias", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success || !data.preferencias) {
        console.warn(
          "No se encontraron preferencias de idioma, usando valores por defecto"
        );
        const base = crearPreferenciasIdiomaPorDefecto();
        setPreferencias(base);
        setPreferenciasOriginal(base);
        return;
      }

      const p = data.preferencias;

      const prefs: PreferenciasIdioma = {
        id_preferencia: p.id_preferencia,
        idioma: p.idioma || "es",
        zona_horaria: p.zona_horaria || "America/Santiago",
        formato_fecha: p.formato_fecha || "DD/MM/YYYY",
        formato_hora: p.formato_hora || "24h",
        fecha_actualizacion: p.fecha_actualizacion || null,
      };

      setPreferencias(prefs);
      setPreferenciasOriginal(prefs);
    } catch (error) {
      console.error("Error al cargar preferencias de idioma:", error);
      const base = crearPreferenciasIdiomaPorDefecto();
      setPreferencias(base);
      setPreferenciasOriginal(base);
      setErrorPrefs(
        "No se pudieron cargar tus preferencias de idioma. Usando valores por defecto."
      );
    } finally {
      setLoadingPrefs(false);
    }
  };

  const cargarPaises = async () => {
    try {
      setLoadingPaises(true);
      const res = await fetch("/api/catalogos/paises?activos=1", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success || !Array.isArray(data.paises)) {
        console.warn("No se pudieron obtener países desde el servidor.");
        setPaises([]);
        return;
      }

      const lista: Pais[] = data.paises;
      lista.sort(
        (a, b) =>
          (a.prioridad - b.prioridad) ||
          a.nombre.localeCompare(b.nombre, "es")
      );
      setPaises(lista);

      // Seleccionar país por defecto (país del técnico si coincide, si no Chile, si no el primero)
      const paisUsuarioNombre = usuario?.tecnico?.pais?.toLowerCase();
      const paisUsuario =
        lista.find(
          (p) =>
            p.nombre.toLowerCase() === (paisUsuarioNombre ?? "") ||
            p.codigo_iso3 === paisUsuarioNombre?.toUpperCase()
        ) ?? null;

      const paisPorDefecto =
        paisUsuario ??
        lista.find((p) => p.codigo_iso2 === "CL") ??
        lista[0] ??
        null;

      setPaisSeleccionado(paisPorDefecto);
    } catch (error) {
      console.error("Error al cargar países:", error);
    } finally {
      setLoadingPaises(false);
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

  const guardarPreferenciasIdioma = async () => {
    if (!preferencias) return;

    try {
      setGuardandoPrefs(true);
      setMensajePrefs(null);
      setErrorPrefs(null);

      const metodo = preferencias.id_preferencia ? "PUT" : "POST";

      const res = await fetch("/api/users/preferencias/idioma", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(preferencias),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.success) {
        console.error("Error al guardar preferencias de idioma:", data);
        setErrorPrefs(
          data?.message ||
            "No se pudieron guardar las preferencias de idioma. Inténtalo nuevamente."
        );
        return;
      }

      const serverPrefs = data.preferencias || data.data || {};
      const prefsFinal: PreferenciasIdioma = {
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
      setMensajePrefs("Preferencias de idioma y región guardadas correctamente.");
    } catch (error) {
      console.error("Error al guardar preferencias de idioma:", error);
      setErrorPrefs(
        "Se produjo un error al guardar tus preferencias de idioma. Verifica la conexión."
      );
    } finally {
      setGuardandoPrefs(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!preferenciasOriginal) return;
    setPreferencias(preferenciasOriginal);
  };

  const restaurarRecomendadas = () => {
    const base = crearPreferenciasIdiomaPorDefecto();
    setPreferencias((prev) =>
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

  const aplicarRecomendacionDesdePais = (pais: Pais) => {
    setPaisSeleccionado(pais);

    setPreferencias((prev) => {
      const base = prev ?? crearPreferenciasIdiomaPorDefecto();
      const codigo2 = (pais.codigo_iso2 || "").toUpperCase();

      let idioma = base.idioma;
      let formato_fecha = base.formato_fecha;
      let formato_hora = base.formato_hora;

      if (["US", "GB", "CA", "AU", "NZ"].includes(codigo2)) {
        idioma = "en";
        formato_fecha = codigo2 === "US" ? "MM/DD/YYYY" : "DD/MM/YYYY";
        formato_hora = "12h";
      } else if (["BR", "PT"].includes(codigo2)) {
        idioma = "pt";
        formato_fecha = "DD/MM/YYYY";
        formato_hora = "24h";
      } else if (["FR", "BE"].includes(codigo2)) {
        idioma = "fr";
        formato_fecha = "DD/MM/YYYY";
        formato_hora = "24h";
      } else {
        idioma = "es";
        formato_fecha = "DD/MM/YYYY";
        formato_hora = "24h";
      }

      const zona_sugerida =
        MAPA_ZONA_HORARIA_POR_PAIS[codigo2] ?? base.zona_horaria;

      return {
        ...base,
        idioma,
        formato_fecha,
        formato_hora,
        zona_horaria: zona_sugerida,
      };
    });
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
              <Languages className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando preferencias de idioma
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Ajustando el panel para tu región...
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
            No tienes permisos para acceder a la configuración de idioma y
            región del módulo técnico.
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
                placeholder="Buscar idioma, país, zona horaria..."
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
                      href="/tecnico/configuracion/temas"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Preferencias de Tema</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion/idioma"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Languages className="w-5 h-5" />
                      <span>Idioma y Región</span>
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
              <span className="animate-wave inline-block">🌍</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Configura tu{" "}
              <span className={tema.colores.texto}>idioma</span>,{" "}
              <span className={tema.colores.texto}>zona horaria</span> y{" "}
              <span className={tema.colores.texto}>formato de fecha/hora</span>{" "}
              para que el panel técnico se adapte a tu país.
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
              {preferencias && (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${tema.colores.borde} ${tema.colores.textoSecundario} bg-black/10`}
                >
                  <Clock3 className="w-3 h-3" />
                  Zona horaria:
                  <span className={tema.colores.texto}>
                    {preferencias.zona_horaria}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={cargarPreferenciasIdioma}
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
                onClick={guardarPreferenciasIdioma}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Idioma principal
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {
                      IDIOMAS_DISPONIBLES.find(
                        (i) => i.codigo === preferencias.idioma
                      )?.label ?? "Personalizado"
                    }
                  </p>
                </div>
              </div>
              <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                Controla el idioma de la interfaz y mensajes del módulo técnico.
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <Clock3 className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Zona horaria
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {preferencias.zona_horaria}
                  </p>
                </div>
              </div>
              {previewFechaHora && (
                <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                  Ahora se vería como:{" "}
                  <span className={tema.colores.texto}>
                    {previewFechaHora.fecha} · {previewFechaHora.hora}
                  </span>
                </p>
              )}
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Formatos de fecha y hora
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {preferencias.formato_fecha} · {preferencias.formato_hora}
                  </p>
                </div>
              </div>
              <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                Afecta cómo se muestran fechas y horas en listas, agendas y
                reportes.
              </p>
            </div>
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
              {/* Idioma interfaz */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Languages className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Idioma de la interfaz
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Selecciona el idioma principal para textos, botones y
                        mensajes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {IDIOMAS_DISPONIBLES.map((idi) => (
                    <button
                      key={idi.codigo}
                      onClick={() =>
                        setPreferencias((prev) =>
                          prev ? { ...prev, idioma: idi.codigo } : prev
                        )
                      }
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-300 ${
                        preferencias.idioma === idi.codigo
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent scale-[1.02]`
                          : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} hover:scale-[1.01]`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{idi.emoji}</span>
                        <div>
                          <p className="text-sm font-bold">{idi.label}</p>
                          <p
                            className={`text-[11px] ${
                              preferencias.idioma === idi.codigo
                                ? "opacity-90"
                                : tema.colores.textoSecundario
                            }`}
                          >
                            {idi.descripcion}
                          </p>
                        </div>
                      </div>
                      {preferencias.idioma === idi.codigo && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zona horaria + formatos */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
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
                        Zona horaria y formatos
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Afecta cómo se calculan y muestran las fechas de los
                        tickets, agendas y reportes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <p
                      className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}
                    >
                      Zona horaria preferida
                    </p>
                    <div className="flex flex-col gap-2">
                      <select
                        value={preferencias.zona_horaria}
                        onChange={(e) =>
                          setPreferencias((prev) =>
                            prev
                              ? { ...prev, zona_horaria: e.target.value }
                              : prev
                          )
                        }
                        className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        {ZONAS_HORARIAS_POPULARES.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.label}
                          </option>
                        ))}
                        {!ZONAS_HORARIAS_POPULARES.find(
                          (z) => z.id === preferencias.zona_horaria
                        ) && (
                          <option
                            value={preferencias.zona_horaria}
                          >{`Personalizada: ${preferencias.zona_horaria}`}</option>
                        )}
                      </select>
                      <p
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Puedes elegir otra zona personalizada desde tu perfil si
                        fuese necesario.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}
                      >
                        Formato de fecha
                      </p>
                      <select
                        value={preferencias.formato_fecha}
                        onChange={(e) =>
                          setPreferencias((prev) =>
                            prev
                              ? { ...prev, formato_fecha: e.target.value }
                              : prev
                          )
                        }
                        className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        {FORMATO_FECHA_OPCIONES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}
                      >
                        Formato de hora
                      </p>
                      <select
                        value={preferencias.formato_hora}
                        onChange={(e) =>
                          setPreferencias((prev) =>
                            prev
                              ? { ...prev, formato_hora: e.target.value }
                              : prev
                          )
                        }
                        className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        {FORMATO_HORA_OPCIONES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {previewFechaHora && (
                    <div
                      className={`mt-2 px-3 py-2 rounded-xl border ${tema.colores.borde} bg-black/10`}
                    >
                      <p
                        className={`text-[11px] ${tema.colores.textoSecundario}`}
                      >
                        Ejemplo de cómo verás las fechas:
                      </p>
                      <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                        {previewFechaHora.fecha} · {previewFechaHora.hora}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* País principal / mundo */}
            <div
              className={`rounded-2xl p-5 mb-10 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
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
                      País principal de trabajo
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Selecciona el país desde donde normalmente operas. No
                      cambia datos clínicos, solo la experiencia de uso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                    />
                    <input
                      type="text"
                      value={busquedaPais}
                      onChange={(e) => setBusquedaPais(e.target.value)}
                      placeholder="Buscar país por nombre, continente, moneda..."
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-1 focus:ring-indigo-500/70`}
                    />
                    {busquedaPais && (
                      <button
                        onClick={() => setBusquedaPais("")}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                {paisSeleccionado && (
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${tema.colores.borde} bg-black/10`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-800">
                      {paisSeleccionado.bandera_url ? (
                        <Image
                          src={paisSeleccionado.bandera_url}
                          alt={paisSeleccionado.nombre}
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-lg">🌐</span>
                      )}
                    </div>
                    <div className="text-xs">
                      <p
                        className={`font-semibold ${tema.colores.texto} truncate max-w-[150px]`}
                      >
                        {paisSeleccionado.nombre}
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        {paisSeleccionado.continente ?? "Continente no asignado"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto custom-scrollbar">
                {loadingPaises && (
                  <div className="col-span-full flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                )}

                {!loadingPaises &&
                  paisesFiltrados.slice(0, 80).map((pais) => {
                    const seleccionado =
                      paisSeleccionado &&
                      paisSeleccionado.id_pais === pais.id_pais;
                    return (
                      <div
                        key={pais.id_pais}
                        className={`relative p-3 rounded-xl border text-xs cursor-pointer transition-all duration-300 ${
                          seleccionado
                            ? `bg-gradient-to-br ${tema.colores.gradiente} text-white border-transparent scale-[1.02]`
                            : `${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} hover:scale-[1.01]`
                        }`}
                        onClick={() => setPaisSeleccionado(pais)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-800">
                            {pais.bandera_url ? (
                              <Image
                                src={pais.bandera_url}
                                alt={pais.nombre}
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-base">🌐</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {pais.nombre}
                            </p>
                            <p
                              className={`text-[10px] truncate ${
                                seleccionado
                                  ? "opacity-90"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {pais.continente ?? "Continente no asignado"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[9px]">
                          {pais.codigo_iso2 && (
                            <span
                              className={`px-2 py-0.5 rounded-full border ${
                                seleccionado
                                  ? "border-white/40 bg-black/10"
                                  : "border-white/10 bg-black/5"
                              }`}
                            >
                              ISO2: {pais.codigo_iso2}
                            </span>
                          )}
                          {pais.codigo_moneda && (
                            <span
                              className={`px-2 py-0.5 rounded-full border ${
                                seleccionado
                                  ? "border-white/40 bg-black/10"
                                  : "border-white/10 bg-black/5"
                              }`}
                            >
                              {pais.moneda ?? "Moneda"} ({pais.codigo_moneda})
                            </span>
                          )}
                          {pais.idioma_oficial && (
                            <span
                              className={`px-2 py-0.5 rounded-full border ${
                                seleccionado
                                  ? "border-white/40 bg-black/10"
                                  : "border-white/10 bg-black/5"
                              }`}
                            >
                              {pais.idioma_oficial}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            aplicarRecomendacionDesdePais(pais);
                          }}
                          className={`mt-2 w-full rounded-lg text-[10px] font-semibold py-1.5 ${
                            seleccionado
                              ? "bg-white/15 text-white"
                              : "bg-black/5 text-current hover:bg-black/10"
                          }`}
                        >
                          Usar recomendación de este país
                        </button>
                      </div>
                    );
                  })}

                {!loadingPaises && paisesFiltrados.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs">
                    <p className={tema.colores.textoSecundario}>
                      No se encontraron países que coincidan con la búsqueda.
                    </p>
                  </div>
                )}
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
                    tus preferencias personales de idioma y región
                  </span>{" "}
                  como técnico. No modifica configuraciones de otros usuarios ni
                  los datos clínicos de los pacientes.
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
                  onClick={guardarPreferenciasIdioma}
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
                © 2025 AnyssaMed / INFOGES – Configuración de {temaFooter}.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Idioma / Región
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
