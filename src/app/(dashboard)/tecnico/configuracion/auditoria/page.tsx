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
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  Filter,
  Lightbulb,
  Loader2,
  Lock,
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

type Criticidad = "baja" | "media" | "alta" | "critica";

type ModuloAuditable =
  | "configuracion_general"
  | "permisos"
  | "seguridad"
  | "firma_digital"
  | "zona_horaria"
  | "preferencias"
  | "tickets_centro"
  | "otro";

interface RegistroAuditoria {
  id_registro: number;
  id_centro: number;
  modulo: ModuloAuditable;
  seccion: string;
  entidad: string;
  accion: "creacion" | "actualizacion" | "eliminacion" | "override" | "otro";
  descripcion: string;
  criticidad: Criticidad;
  fecha: string;
  usuario_responsable: {
    id_usuario: number;
    username: string;
    nombre: string;
    apellido_paterno: string;
  } | null;
  origen: string;
  ip_origen: string | null;
  cambios_previos?: any;
  cambios_nuevos?: any;
}

// =====================================================
// CONSTANTES / TEMAS
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
    icono: Sparkles,
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

const MODULOS_DEF: {
  id: ModuloAuditable | "todos";
  label: string;
  desc: string;
  icon: any;
}[] = [
  {
    id: "todos",
    label: "Todos",
    desc: "Cualquier módulo configurable del centro.",
    icon: Activity,
  },
  {
    id: "configuracion_general",
    label: "Config. general",
    desc: "Parámetros base del centro.",
    icon: Settings,
  },
  {
    id: "tickets_centro",
    label: "Tickets",
    desc: "Cambios en reglas de tickets del centro.",
    icon: ClipboardList,
  },
  {
    id: "permisos",
    label: "Permisos",
    desc: "Roles y accesos locales.",
    icon: ShieldCheck,
  },
  {
    id: "seguridad",
    label: "Seguridad",
    desc: "Reglas de seguridad y bloqueo.",
    icon: Lock,
  },
  {
    id: "firma_digital",
    label: "Firma digital",
    desc: "Firmantes y certificados.",
    icon: FileTextIcon,
  } as any, // pequeño hack solo para icono; lo reemplazamos abajo
  {
    id: "zona_horaria",
    label: "Zona horaria",
    desc: "Ventanas de atención y TZ.",
    icon: CalendarRange,
  },
  {
    id: "preferencias",
    label: "Preferencias",
    desc: "Ajustes visuales y personales.",
    icon: Sparkles,
  },
];

// Reemplazo limpio para el icono de firma (usamos FileText)
function FileTextIcon(props: any) {
  const { className } = props;
  return <ClipboardList className={className} />;
}

// =====================================================
// HELPERS
// =====================================================

function formatearFechaCorta(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatearFechaLarga(fecha: string) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

// =====================================================
// PAGE
// =====================================================

export default function ConfiguracionAuditoriaCentroPage() {
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

  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [loadingAuditoria, setLoadingAuditoria] = useState(true);
  const [errorAuditoria, setErrorAuditoria] = useState<string | null>(null);

  const [filtroCriticidad, setFiltroCriticidad] = useState<
    "todas" | Criticidad
  >("todas");
  const [filtroModulo, setFiltroModulo] = useState<
    ModuloAuditable | "todos"
  >("todos");
  const [rangoFechas, setRangoFechas] = useState<{ desde: string; hasta: string }>(
    { desde: "", hasta: "" }
  );

  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 15;

  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<RegistroAuditoria | null>(null);

  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Resumen para cards
  const resumen = useMemo(() => {
    if (!registros.length) {
      return {
        total: 0,
        criticos: 0,
        cambiosHoy: 0,
        cambios7dias: 0,
        usuariosUnicos: 0,
      };
    }

    const ahora = new Date();
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    let criticos = 0;
    let cambiosHoy = 0;
    let cambios7dias = 0;
    const setUsuarios = new Set<string>();

    for (const r of registros) {
      const d = new Date(r.fecha);
      if (!Number.isNaN(d.getTime())) {
        if (d >= inicioHoy) cambiosHoy += 1;
        if (d >= hace7) cambios7dias += 1;
      }
      if (r.criticidad === "critica" || r.criticidad === "alta") criticos += 1;
      if (r.usuario_responsable) {
        setUsuarios.add(
          `${r.usuario_responsable.id_usuario}-${r.usuario_responsable.username}`
        );
      }
    }

    return {
      total: registros.length,
      criticos,
      cambiosHoy,
      cambios7dias,
      usuariosUnicos: setUsuarios.size,
    };
  }, [registros]);

  // Filtro principal
  const registrosFiltrados = useMemo(() => {
    let lista = [...registros];

    if (filtroCriticidad !== "todas") {
      lista = lista.filter((r) => r.criticidad === filtroCriticidad);
    }

    if (filtroModulo !== "todos") {
      lista = lista.filter((r) => r.modulo === filtroModulo);
    }

    if (rangoFechas.desde) {
      const dDesde = new Date(rangoFechas.desde);
      dDesde.setHours(0, 0, 0, 0);
      lista = lista.filter((r) => {
        const d = new Date(r.fecha);
        return !Number.isNaN(d.getTime()) && d >= dDesde;
      });
    }

    if (rangoFechas.hasta) {
      const dHasta = new Date(rangoFechas.hasta);
      dHasta.setHours(23, 59, 59, 999);
      lista = lista.filter((r) => {
        const d = new Date(r.fecha);
        return !Number.isNaN(d.getTime()) && d <= dHasta;
      });
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((r) => {
        const base =
          `${r.descripcion} ${r.seccion} ${r.entidad} ${r.origen} ${
            r.usuario_responsable
              ? `${r.usuario_responsable.nombre} ${r.usuario_responsable.apellido_paterno} ${r.usuario_responsable.username}`
              : ""
          }`.toLowerCase();
        return base.includes(q);
      });
    }

    lista.sort(
      (a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return lista;
  }, [registros, filtroCriticidad, filtroModulo, rangoFechas, busqueda]);

  const totalPaginas = useMemo(() => {
    const total = registrosFiltrados.length;
    return Math.max(1, Math.ceil(total / registrosPorPagina));
  }, [registrosFiltrados.length]);

  const registrosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return registrosFiltrados.slice(inicio, inicio + registrosPorPagina);
  }, [paginaActual, registrosPorPagina, registrosFiltrados]);

  const ultimoCambio = useMemo(() => {
    if (!registros.length) return null;
    const ordenados = [...registros].sort(
      (a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    return ordenados[0];
  }, [registros]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [
    filtroCriticidad,
    filtroModulo,
    rangoFechas.desde,
    rangoFechas.hasta,
    busqueda,
  ]);

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
      cargarAuditoria();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    if (!mensajeAccion) return;
    const t = setTimeout(() => setMensajeAccion(null), 4000);
    return () => clearTimeout(t);
  }, [mensajeAccion]);

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
            `Acceso denegado. Este historial de auditoría es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarAuditoria = async () => {
    if (!usuario?.tecnico) return;

    try {
      setLoadingAuditoria(true);
      setErrorAuditoria(null);

      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/configuracion/auditoria?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.error("Error al cargar auditoría:", data);
        setErrorAuditoria(
          data?.message ||
            "No se pudo cargar el historial de auditoría del centro."
        );
        setRegistros([]);
        return;
      }

      const items: RegistroAuditoria[] =
        data.registros || data.audit || data.auditLogs || [];

      setRegistros(items || []);
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
      setErrorAuditoria(
        "Se produjo un error al obtener el historial. Revisa la conexión."
      );
      setRegistros([]);
    } finally {
      setLoadingAuditoria(false);
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

  const exportarCSV = () => {
    if (!registrosFiltrados.length) {
      setMensajeAccion("No hay registros filtrados para exportar.");
      return;
    }

    const encabezados = [
      "ID",
      "Fecha",
      "Módulo",
      "Sección",
      "Entidad",
      "Acción",
      "Criticidad",
      "Usuario",
      "Origen",
      "IP",
      "Descripción",
    ];

    const filas = registrosFiltrados.map((r) => {
      const usuarioNombre = r.usuario_responsable
        ? `${r.usuario_responsable.nombre} ${r.usuario_responsable.apellido_paterno} (${r.usuario_responsable.username})`
        : "Sistema";

      return [
        r.id_registro,
        formatearFechaLarga(r.fecha),
        r.modulo,
        r.seccion,
        r.entidad,
        r.accion,
        r.criticidad,
        usuarioNombre,
        r.origen,
        r.ip_origen ?? "",
        (r.descripcion || "").replace(/\s+/g, " "),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";");
    });

    const contenido = [encabezados.join(";"), ...filas].join("\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-centro-${usuario?.tecnico?.centro?.nombre || "centro"
      }.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setMensajeAccion("Exportación CSV generada correctamente.");
  };

  const obtenerSaludo = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const obtenerColorDisponibilidad = () => {
    if (disponibilidad === "disponible")
      return "bg-green-500/20 text-green-300 border-green-400/40";
    if (disponibilidad === "ocupado")
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
    return "bg-red-500/20 text-red-200 border-red-400/40";
  };

  const badgeCriticidad = (criticidad: Criticidad) => {
    switch (criticidad) {
      case "critica":
        return "bg-red-500/20 text-red-300 border border-red-500/40";
      case "alta":
        return "bg-orange-500/20 text-orange-300 border border-orange-500/40";
      case "media":
        return "bg-yellow-500/20 text-yellow-200 border border-yellow-500/40";
      case "baja":
      default:
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
    }
  };

  const labelCriticidad = (criticidad: Criticidad) => {
    switch (criticidad) {
      case "critica":
        return "Crítica";
      case "alta":
        return "Alta";
      case "media":
        return "Media";
      case "baja":
      default:
        return "Baja";
    }
  };

  const labelAccion = (accion: RegistroAuditoria["accion"]) => {
    switch (accion) {
      case "creacion":
        return "Creación";
      case "actualizacion":
        return "Actualización";
      case "eliminacion":
        return "Eliminación";
      case "override":
        return "Override / Excepción";
      default:
        return "Acción";
    }
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
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Historial de Auditoría
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando la línea de tiempo de cambios de configuración del centro...
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
            No tienes permisos para ver el historial de auditoría de este centro.
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
                placeholder="Buscar en el historial: usuario, módulo, acción, descripción..."
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
                                {alerta.fecha_creacion
                                  ? formatearFechaCorta(alerta.fecha_creacion)
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
              <span className="animate-wave inline-block">📜</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Revisa el{" "}
              <span className={tema.colores.texto}>
                historial de cambios y auditoría
              </span>{" "}
              de la configuración de tu centro, con trazabilidad completa.
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
                onClick={cargarAuditoria}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingAuditoria}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingAuditoria ? "animate-spin" : ""
                  }`}
                />
                Recargar historial
              </button>
              <button
                onClick={exportarCSV}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <Download className="w-4 h-4" />
                Exportar CSV (filtros actuales)
              </button>
            </div>

            <div className="text-xs md:text-sm text-right space-y-1">
              {ultimoCambio ? (
                <p className={tema.colores.textoSecundario}>
                  Último cambio registrado:{" "}
                  <span className={tema.colores.texto}>
                    {formatearFechaCorta(ultimoCambio.fecha)} ·{" "}
                    {labelAccion(ultimoCambio.accion)} en{" "}
                    {ultimoCambio.seccion || ultimoCambio.modulo}
                  </span>
                </p>
              ) : (
                <p className={tema.colores.textoSecundario}>
                  Aún no hay cambios registrados para este centro.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {(errorAuditoria || mensajeAccion) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex items-center gap-3 ${
              errorAuditoria
                ? "bg-red-500/10 border border-red-500/40"
                : "bg-emerald-500/10 border border-emerald-500/40"
            }`}
          >
            {errorAuditoria ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <p
              className={`text-sm ${
                errorAuditoria ? "text-red-100" : "text-emerald-100"
              }`}
            >
              {errorAuditoria || mensajeAccion}
            </p>
          </div>
        )}

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={ClipboardList}
            titulo="Cambios totales"
            valor={resumen.total}
            chip="Historial completo"
            color="from-indigo-500 to-blue-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertCircle}
            titulo="Cambios críticos"
            valor={resumen.criticos}
            chip="Alta & Crítica"
            color="from-red-500 to-orange-500"
          />
          <ResumenCard
            tema={tema}
            icono={CalendarRange}
            titulo="Hoy"
            valor={resumen.cambiosHoy}
            chip="Cambios del día"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={Activity}
            titulo="Últimos 7 días"
            valor={resumen.cambios7dias}
            chip="Actividad reciente"
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={User}
            titulo="Usuarios distintos"
            valor={resumen.usuariosUnicos}
            chip="Quienes cambiaron algo"
            color="from-cyan-500 to-sky-500"
          />
        </div>

        {/* Filtros principales */}
        <div
          className={`mb-8 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Filter className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
              <span className={`${tema.colores.textoSecundario}`}>
                Filtros rápidos:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Criticidad */}
              <div className="flex items-center gap-2 text-xs">
                <span className={tema.colores.textoSecundario}>
                  Criticidad:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "todas", label: "Todas" },
                      { id: "critica", label: "Crítica" },
                      { id: "alta", label: "Alta" },
                      { id: "media", label: "Media" },
                      { id: "baja", label: "Baja" },
                    ] as { id: "todas" | Criticidad; label: string }[]
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFiltroCriticidad(c.id)}
                      className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition-all ${
                        filtroCriticidad === c.id
                          ? "bg-indigo-500/80 border-indigo-400 text-white"
                          : `${tema.colores.hover} ${tema.colores.textoSecundario}`
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango fechas */}
              <div className="flex items-center gap-2 text-xs">
                <CalendarRange
                  className={`w-4 h-4 ${tema.colores.textoSecundario}`}
                />
                <span className={tema.colores.textoSecundario}>Desde:</span>
                <input
                  type="date"
                  value={rangoFechas.desde}
                  onChange={(e) =>
                    setRangoFechas((prev) => ({
                      ...prev,
                      desde: e.target.value,
                    }))
                  }
                  className={`px-2 py-1 rounded-lg border ${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} text-xs`}
                />
                <span className={tema.colores.textoSecundario}>Hasta:</span>
                <input
                  type="date"
                  value={rangoFechas.hasta}
                  onChange={(e) =>
                    setRangoFechas((prev) => ({
                      ...prev,
                      hasta: e.target.value,
                    }))
                  }
                  className={`px-2 py-1 rounded-lg border ${tema.colores.card} ${tema.colores.borde} ${tema.colores.texto} text-xs`}
                />
                {(rangoFechas.desde || rangoFechas.hasta) && (
                  <button
                    onClick={() =>
                      setRangoFechas({ desde: "", hasta: "" })
                    }
                    className="text-[11px] text-amber-300 underline"
                  >
                    Limpiar fechas
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtro por módulo */}
          <div className="flex flex-wrap gap-2 mt-2">
            {MODULOS_DEF.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setFiltroModulo(mod.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                  filtroModulo === mod.id
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-400"
                    : `${tema.colores.hover} ${tema.colores.textoSecundario} ${tema.colores.borde}`
                }`}
              >
                <mod.icon className="w-4 h-4" />
                <span>{mod.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LISTA + DETALLE */}
        {loadingAuditoria ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando historial de cambios del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* Timeline principal */}
              <div
                className={`xl:col-span-2 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Línea de tiempo de cambios
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Historial detallado de modificaciones realizadas sobre la
                        configuración del centro.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-right">
                    <p className={tema.colores.textoSecundario}>
                      Mostrando{" "}
                      <span className={tema.colores.texto}>
                        {registrosPagina.length}
                      </span>{" "}
                      de{" "}
                      <span className={tema.colores.texto}>
                        {registrosFiltrados.length}
                      </span>{" "}
                      registros filtrados
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Página {paginaActual} de {totalPaginas}
                    </p>
                  </div>
                </div>

                {registrosPagina.length === 0 ? (
                  <div className="py-10 text-center">
                    <ClipboardList
                      className={`w-10 h-10 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                    />
                    <p className={tema.colores.textoSecundario}>
                      No se encontraron registros con los filtros actuales.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/60 via-indigo-500/20 to-transparent pointer-events-none" />
                    <div className="space-y-3">
                      {registrosPagina.map((r) => (
                        <button
                          key={r.id_registro}
                          onClick={() => setRegistroSeleccionado(r)}
                          className={`w-full text-left flex gap-3 group`}
                        >
                          {/* Punto de la línea de tiempo */}
                          <div className="pt-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                r.criticidad === "critica"
                                  ? "bg-red-400"
                                  : r.criticidad === "alta"
                                  ? "bg-orange-400"
                                  : r.criticidad === "media"
                                  ? "bg-yellow-300"
                                  : "bg-emerald-300"
                              } shadow-md shadow-black/30 group-hover:scale-110 transition-transform`}
                            />
                          </div>

                          {/* Tarjeta */}
                          <div
                            className={`flex-1 rounded-2xl px-4 py-3 border ${tema.colores.borde} bg-black/10 hover:bg-black/20 transition-all ${tema.colores.sombra}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span
                                    className={`text-[11px] px-2 py-1 rounded-full border ${badgeCriticidad(
                                      r.criticidad
                                    )}`}
                                  >
                                    {labelCriticidad(r.criticidad)}
                                  </span>
                                  <span
                                    className={`text-[11px] px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-400/40`}
                                  >
                                    {labelAccion(r.accion)}
                                  </span>
                                  <span
                                    className={`text-[11px] px-2 py-1 rounded-full bg-slate-500/15 text-slate-200 border border-slate-400/40`}
                                  >
                                    {r.seccion || r.modulo}
                                  </span>
                                </div>
                                <p
                                  className={`text-sm font-semibold ${tema.colores.texto} mb-1 line-clamp-2`}
                                >
                                  {r.descripcion || "Sin descripción detallada"}
                                </p>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario} mb-1 line-clamp-1`}
                                >
                                  Entidad:{" "}
                                  <span className={tema.colores.texto}>
                                    {r.entidad}
                                  </span>{" "}
                                  · Origen:{" "}
                                  <span className={tema.colores.texto}>
                                    {r.origen}
                                  </span>
                                </p>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  {r.usuario_responsable ? (
                                    <>
                                      Por{" "}
                                      <span className={tema.colores.texto}>
                                        {r.usuario_responsable.nombre}{" "}
                                        {r.usuario_responsable.apellido_paterno}{" "}
                                        ({r.usuario_responsable.username})
                                      </span>
                                    </>
                                  ) : (
                                    "Acción ejecutada por el sistema"
                                  )}{" "}
                                  · {formatearFechaCorta(r.fecha)} · IP:{" "}
                                  {r.ip_origen || "N/D"}
                                </p>
                              </div>
                              <div className="pl-2 pt-1">
                                <span className="text-[11px] text-indigo-300 group-hover:text-indigo-100">
                                  Ver detalle
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paginación */}
                {registrosFiltrados.length > 0 && (
                  <div className="mt-4 flex items-center justify-between text-[11px]">
                    <p className={tema.colores.textoSecundario}>
                      Página{" "}
                      <span className={tema.colores.texto}>
                        {paginaActual}
                      </span>{" "}
                      de{" "}
                      <span className={tema.colores.texto}>
                        {totalPaginas}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPaginaActual((p) => Math.max(1, p - 1))
                        }
                        disabled={paginaActual === 1}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                          paginaActual === 1
                            ? "opacity-40 cursor-not-allowed"
                            : `${tema.colores.hover} ${tema.colores.texto}`
                        }`}
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() =>
                          setPaginaActual((p) =>
                            Math.min(totalPaginas, p + 1)
                          )
                        }
                        disabled={paginaActual === totalPaginas}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                          paginaActual === totalPaginas
                            ? "opacity-40 cursor-not-allowed"
                            : `${tema.colores.hover} ${tema.colores.texto}`
                        }`}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel detalle */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <FileTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Detalle del cambio
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Selecciona un registro en la línea de tiempo para ver sus
                        campos completos.
                      </p>
                    </div>
                  </div>
                </div>

                {!registroSeleccionado ? (
                  <div className="py-10 text-center text-xs">
                    <Activity
                      className={`w-10 h-10 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                    />
                    <p className={tema.colores.textoSecundario}>
                      Aún no has seleccionado ningún registro.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-[11px] custom-scrollbar max-h-[32rem] overflow-y-auto pr-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full border ${badgeCriticidad(
                          registroSeleccionado.criticidad
                        )}`}
                      >
                        {labelCriticidad(registroSeleccionado.criticidad)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-400/40`}
                      >
                        {labelAccion(registroSeleccionado.accion)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full bg-slate-500/15 text-slate-200 border border-slate-400/40`}
                      >
                        {registroSeleccionado.seccion ||
                          registroSeleccionado.modulo}
                      </span>
                    </div>

                    <div>
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        Fecha:
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {formatearFechaLarga(registroSeleccionado.fecha)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Entidad:
                        </p>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          {registroSeleccionado.entidad}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Módulo:
                        </p>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          {registroSeleccionado.modulo}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Origen:
                        </p>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          {registroSeleccionado.origen}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          IP:
                        </p>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          {registroSeleccionado.ip_origen || "No disponible"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        Usuario responsable:
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {registroSeleccionado.usuario_responsable ? (
                          <>
                            {registroSeleccionado.usuario_responsable.nombre}{" "}
                            {
                              registroSeleccionado.usuario_responsable
                                .apellido_paterno
                            }{" "}
                            (
                            {
                              registroSeleccionado.usuario_responsable
                                .username
                            }
                            )
                          </>
                        ) : (
                          "Sistema / proceso automático"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        Descripción:
                      </p>
                      <p className={`text-xs ${tema.colores.texto}`}>
                        {registroSeleccionado.descripcion ||
                          "Sin descripción detallada."}
                      </p>
                    </div>

                    {(registroSeleccionado.cambios_previos ||
                      registroSeleccionado.cambios_nuevos) && (
                      <div className="space-y-2">
                        <p
                          className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Comparación de valores:
                        </p>
                        {registroSeleccionado.cambios_previos && (
                          <div>
                            <p
                              className={`text-[11px] ${tema.colores.textoSecundario}`}
                            >
                              Valores previos:
                            </p>
                            <pre className="mt-1 text-[10px] bg-black/40 rounded-xl p-2 overflow-auto">
                              {JSON.stringify(
                                registroSeleccionado.cambios_previos,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                        {registroSeleccionado.cambios_nuevos && (
                          <div>
                            <p
                              className={`text-[11px] ${tema.colores.textoSecundario}`}
                            >
                              Valores nuevos:
                            </p>
                            <pre className="mt-1 text-[10px] bg-black/40 rounded-xl p-2 overflow-auto">
                              {JSON.stringify(
                                registroSeleccionado.cambios_nuevos,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Barra inferior */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm">
                <p className={tema.colores.textoSecundario}>
                  Este módulo de{" "}
                  <span className={tema.colores.texto}>auditoría</span> registra
                  únicamente cambios de{" "}
                  <span className={tema.colores.texto}>
                    configuración del centro
                  </span>
                  . La auditoría global del sistema y otros módulos transversales
                  se gestiona por la administración central.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setRegistroSeleccionado(null)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  Limpiar selección
                </button>
                <button
                  onClick={exportarCSV}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra}`}
                >
                  <Download className="w-4 h-4" />
                  Exportar vista actual
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
                © 2025 AnyssaMed / INFOGES – Auditoría de Configuración de Centro.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Centro · Auditoría
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
