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
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  Lightbulb,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Palette,
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

type RolId = "soporte_n1" | "soporte_n2" | "coordinador" | "admin_local";

interface RolConfig {
  habilitado: boolean;
  nombre: string;
  descripcion: string;
  puede_ver_tickets: boolean;
  puede_crear_tickets: boolean;
  puede_reasignar: boolean;
  puede_cerrar: boolean;
  puede_ver_metricas: boolean;
  puede_editar_config_local: boolean;
  puede_gestionar_firmantes: boolean;
  puede_gestionar_usuarios: boolean;
}

interface ConfigPermisosCentro {
  id_config_permisos: number | null;
  id_centro: number;

  habilitado: boolean;
  modo_estricto: boolean;
  auditoria_activa: boolean;
  permitir_override_tecnico: boolean;
  bloquear_acciones_criticas_fuera_horario: boolean;
  obligar_motivo_escalamiento: boolean;
  permitir_ver_datos_sensibles: boolean;

  roles: Record<RolId, RolConfig>;

  ult_actualizacion: string | null;
}

// =====================================================
// CONSTANTES
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

const ROLES_DEF: {
  id: RolId;
  label: string;
  desc: string;
  icon: any;
}[] = [
  {
    id: "soporte_n1",
    label: "Soporte Nivel 1",
    desc: "Primer nivel de atención. Ve y gestiona tickets simples.",
    icon: Activity,
  },
  {
    id: "soporte_n2",
    label: "Soporte Nivel 2",
    desc: "Técnicos avanzados que gestionan incidencias complejas.",
    icon: ClipboardList,
  },
  {
    id: "coordinador",
    label: "Coordinador Centro",
    desc: "Ordena la carga, reasigna tickets y revisa métricas.",
    icon: Eye,
  },
  {
    id: "admin_local",
    label: "Administrador Local",
    desc: "Configura centro, permisos y usuarios en este establecimiento.",
    icon: Lock,
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

function crearConfigPermisosPorDefecto(
  usuario: UsuarioSesion
): ConfigPermisosCentro {
  const now = new Date().toISOString();
  const idCentro =
    usuario.tecnico?.centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0;

  const baseRol = (
    id: RolId,
    nombre: string,
    descripcion: string,
    extra?: Partial<RolConfig>
  ): RolConfig => ({
    habilitado: true,
    nombre,
    descripcion,
    puede_ver_tickets: true,
    puede_crear_tickets: id === "soporte_n1" || id === "soporte_n2",
    puede_reasignar: id !== "soporte_n1",
    puede_cerrar: id !== "soporte_n1",
    puede_ver_metricas: id === "coordinador" || id === "admin_local",
    puede_editar_config_local: id === "admin_local",
    puede_gestionar_firmantes: id === "admin_local",
    puede_gestionar_usuarios: id === "admin_local",
    ...extra,
  });

  const roles: Record<RolId, RolConfig> = {
    soporte_n1: baseRol(
      "soporte_n1",
      "Soporte Nivel 1",
      "Atiende tickets de primer nivel, sin cambios críticos."
    ),
    soporte_n2: baseRol(
      "soporte_n2",
      "Soporte Nivel 2",
      "Atiende tickets escalados y cambios moderados."
    ),
    coordinador: baseRol(
      "coordinador",
      "Coordinador de Centro",
      "Supervisa la operación, reasigna y controla métricas."
    ),
    admin_local: baseRol(
      "admin_local",
      "Administrador Local",
      "Administra configuración, usuarios y permisos del centro."
    ),
  };

  return {
    id_config_permisos: null,
    id_centro: idCentro,
    habilitado: true,
    modo_estricto: true,
    auditoria_activa: true,
    permitir_override_tecnico: false,
    bloquear_acciones_criticas_fuera_horario: true,
    obligar_motivo_escalamiento: true,
    permitir_ver_datos_sensibles: false,
    roles,
    ult_actualizacion: now,
  };
}

// =====================================================
// PAGE
// =====================================================

export default function ConfiguracionPermisosCentroPage() {
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

  const [configPermisos, setConfigPermisos] =
    useState<ConfigPermisosCentro | null>(null);
  const [configOriginal, setConfigOriginal] =
    useState<ConfigPermisosCentro | null>(null);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState<string | null>(null);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  const [rolSimulado, setRolSimulado] = useState<RolId>("soporte_n1");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambios = useMemo(() => {
    if (!configPermisos || !configOriginal) return false;
    return JSON.stringify(configPermisos) !== JSON.stringify(configOriginal);
  }, [configPermisos, configOriginal]);

  const resumen = useMemo(() => {
    if (!configPermisos) {
      return {
        rolesActivos: 0,
        reglasSeguridadActivas: 0,
        accesosCriticos: 0,
        overrideTecnico: false,
        auditoriaActiva: false,
      };
    }

    const rolesActivos = Object.values(configPermisos.roles).filter(
      (r) => r.habilitado
    ).length;

    const reglasSeguridadActivas = [
      configPermisos.modo_estricto,
      configPermisos.auditoria_activa,
      configPermisos.bloquear_acciones_criticas_fuera_horario,
      configPermisos.obligar_motivo_escalamiento,
    ].filter(Boolean).length;

    const accesosCriticos = Object.values(configPermisos.roles).filter(
      (r) =>
        r.puede_gestionar_usuarios ||
        r.puede_editar_config_local ||
        r.puede_gestionar_firmantes
    ).length;

    return {
      rolesActivos,
      reglasSeguridadActivas,
      accesosCriticos,
      overrideTecnico: configPermisos.permitir_override_tecnico,
      auditoriaActiva: configPermisos.auditoria_activa,
    };
  }, [configPermisos]);

  const scoreSeguridad = useMemo(() => {
    if (!configPermisos) return 0;
    let s = 0;
    if (configPermisos.modo_estricto) s += 4;
    if (configPermisos.auditoria_activa) s += 3;
    if (configPermisos.bloquear_acciones_criticas_fuera_horario) s += 2;
    if (configPermisos.obligar_motivo_escalamiento) s += 2;
    if (!configPermisos.permitir_override_tecnico) s += 2;
    if (!configPermisos.permitir_ver_datos_sensibles) s += 2;
    return s;
  }, [configPermisos]);

  const etiquetaSeguridad = useMemo(() => {
    if (!configPermisos) return "Sin configurar";
    if (scoreSeguridad >= 12) return "Política muy estricta";
    if (scoreSeguridad >= 8) return "Política equilibrada";
    if (scoreSeguridad >= 4) return "Política laxa";
    return "Política débil";
  }, [scoreSeguridad, configPermisos]);

  const ultimaActualizacion = configPermisos?.ult_actualizacion ?? null;

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
      cargarConfiguracionPermisos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    if (!mensajeConfig && !errorConfig) return;
    const t = setTimeout(() => {
      setMensajeConfig(null);
      setErrorConfig(null);
    }, 4500);
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
            `Acceso denegado. Esta configuración de permisos es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarConfiguracionPermisos = async () => {
    if (!usuario?.tecnico) return;

    try {
      setLoadingConfig(true);
      setErrorConfig(null);

      const base = crearConfigPermisosPorDefecto(usuario);
      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/configuracion/permisos?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.warn("Sin configuración de permisos previa, usando por defecto");
        setConfigPermisos(base);
        setConfigOriginal(base);
        return;
      }

      const cfgServer =
        (data.config || data.configPermisos || data.config_permisos) ??
        ({} as Partial<ConfigPermisosCentro>);

      const roles: Record<RolId, RolConfig> = {
        ...base.roles,
        ...(cfgServer.roles || {}),
      };

      const cfg: ConfigPermisosCentro = {
        ...base,
        ...cfgServer,
        id_centro: base.id_centro,
        roles,
      };

      setConfigPermisos(cfg);
      setConfigOriginal(cfg);
    } catch (err) {
      console.error("Error al cargar config permisos:", err);
      if (usuario) {
        const base = crearConfigPermisosPorDefecto(usuario);
        setConfigPermisos(base);
        setConfigOriginal(base);
      }
      setErrorConfig(
        "No se pudo cargar la configuración de permisos. Se usarán valores por defecto."
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

  const actualizarConfigPermisos = (
    cambios: Partial<ConfigPermisosCentro>
  ) => {
    setConfigPermisos((prev) => (prev ? { ...prev, ...cambios } : prev));
  };

  const actualizarRol = (rolId: RolId, cambios: Partial<RolConfig>) => {
    setConfigPermisos((prev) =>
      prev
        ? {
            ...prev,
            roles: {
              ...prev.roles,
              [rolId]: { ...prev.roles[rolId], ...cambios },
            },
          }
        : prev
    );
  };

  const guardarConfiguracionPermisos = async () => {
    if (!usuario?.tecnico || !configPermisos) return;

    try {
      setGuardandoConfig(true);
      setMensajeConfig(null);
      setErrorConfig(null);

      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const res = await fetch("/api/tecnico/configuracion/permisos", {
        method: configPermisos.id_config_permisos ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configPermisos,
          id_centro: idCentro,
          id_tecnico: usuario.tecnico.id_tecnico,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.error("Error al guardar config permisos:", data);
        setErrorConfig(
          data?.message ||
            "No se pudo guardar la configuración de permisos. Inténtalo nuevamente."
        );
        return;
      }

      let nuevaConfig: ConfigPermisosCentro = configPermisos;

      if (data.config || data.configPermisos || data.config_permisos) {
        const base = crearConfigPermisosPorDefecto(usuario);
        const cfgServer =
          (data.config ||
            data.configPermisos ||
            data.config_permisos) as Partial<ConfigPermisosCentro>;

        nuevaConfig = {
          ...base,
          ...cfgServer,
          id_centro: base.id_centro,
          roles: {
            ...base.roles,
            ...(cfgServer.roles || {}),
          },
          ult_actualizacion:
            cfgServer.ult_actualizacion || new Date().toISOString(),
        };
      } else {
        nuevaConfig = {
          ...configPermisos,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigPermisos(nuevaConfig);
      setConfigOriginal(nuevaConfig);
      setMensajeConfig("Configuración de permisos del centro guardada correctamente.");
    } catch (err) {
      console.error("Error al guardar config permisos:", err);
      setErrorConfig(
        "Se produjo un error al guardar la configuración. Verifica la conexión."
      );
    } finally {
      setGuardandoConfig(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!configOriginal) return;
    setConfigPermisos(configOriginal);
  };

  const restaurarRecomendados = () => {
    if (!usuario) return;
    const base = crearConfigPermisosPorDefecto(usuario);
    setConfigPermisos(base);
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
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Permisos del Centro
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando roles, accesos y reglas de seguridad...
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
            No tienes permisos para acceder a la configuración de permisos del
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
                placeholder="Buscar roles, acciones o reglas dentro de los permisos..."
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
              <span className="animate-wave inline-block">🔐</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Define los roles, permisos y reglas de seguridad de tu centro
              técnico, sin tocar la configuración global de la comuna.
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
                onClick={cargarConfiguracionPermisos}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingConfig}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingConfig ? "animate-spin" : ""}`}
                />
                Recargar configuración
              </button>
              <button
                onClick={guardarConfiguracionPermisos}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoConfig}
              >
                <Save className="w-4 h-4" />
                {guardandoConfig
                  ? "Guardando cambios..."
                  : "Guardar configuración de permisos"}
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={ShieldCheck}
            titulo="Nivel de seguridad"
            valor={scoreSeguridad}
            chip={etiquetaSeguridad}
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={User}
            titulo="Roles activos"
            valor={resumen.rolesActivos}
            chip="Perfiles habilitados"
            color="from-indigo-500 to-blue-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertCircle}
            titulo="Reglas de seguridad"
            valor={resumen.reglasSeguridadActivas}
            chip="Controles activos"
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={Lock}
            titulo="Accesos críticos"
            valor={resumen.accesosCriticos}
            chip="Roles con administración"
            color="from-amber-500 to-orange-500"
          />
          <ResumenCard
            tema={tema}
            icono={FileText}
            titulo="Auditoría"
            valor={resumen.auditoriaActiva ? 1 : 0}
            chip={resumen.auditoriaActiva ? "Auditando cambios" : "Sin auditoría local"}
            color="from-cyan-500 to-sky-500"
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loadingConfig || !configPermisos ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando configuración de permisos del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bloque 1: Estado general + Reglas seguridad + Override */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* Estado general */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
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
                        Estado del módulo de permisos
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Activa o desactiva el control de roles a nivel de este
                        centro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configPermisos.habilitado}
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          habilitado: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Habilitar control de permisos en este centro
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Si desmarcas, el centro usará solo las políticas
                        globales. No se recomienda salvo contextos de prueba.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configPermisos.modo_estricto}
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          modo_estricto: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Modo estricto de permisos
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Los usuarios solo podrán ejecutar acciones explícitamente
                        habilitadas para su rol. Sin permisos implícitos.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configPermisos.auditoria_activa}
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          auditoria_activa: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Registrar auditoría local de permisos
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Cada cambio de rol o permiso quedará registrado con usuario,
                        fecha y origen. No afecta la auditoría global.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-red-500"
                      checked={configPermisos.permitir_ver_datos_sensibles}
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          permitir_ver_datos_sensibles: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Permitir ver campos sensibles desde soporte
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Ej: datos de infraestructura crítica o identificadores
                        internos. Actívalo solo si es estrictamente necesario.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Reglas de seguridad */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
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
                        Reglas rápidas de seguridad
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ajusta cómo se protegen las operaciones críticas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={
                        configPermisos.bloquear_acciones_criticas_fuera_horario
                      }
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          bloquear_acciones_criticas_fuera_horario:
                            e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Bloquear acciones críticas fuera de horario
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Evita cierres masivos o cambios de configuración fuera del
                        horario normal del centro, salvo administradores globales.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configPermisos.obligar_motivo_escalamiento}
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          obligar_motivo_escalamiento: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Obligar a registrar motivo de escalamiento/cambio de rol
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Al reasignar tickets críticos o modificar roles locales, se
                        pedirá un motivo breve para seguimiento.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configPermisos.permitir_override_tecnico}
                      onChange={(e) =>
                        actualizarConfigPermisos({
                          permitir_override_tecnico: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Permitir overrides temporales de permisos a técnicos
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Útil para dar permisos temporales durante un turno específico.
                        Se sugiere mantenerlo desactivado si no se usa.
                      </p>
                    </div>
                  </label>

                  <div
                    className={`mt-2 rounded-xl p-3 bg-black/10 border border-white/10 text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Estas reglas aplican solo a este{" "}
                    <span className={tema.colores.texto}>centro</span>. Las
                    políticas globales (ej. bloqueo comunal) prevalecen sobre lo
                    que definas aquí.
                  </div>
                </div>
              </div>

              {/* Simulador */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Simulador de permisos
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Selecciona un rol y revisa qué puede y qué no puede hacer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Rol a simular
                    </p>
                    <select
                      value={rolSimulado}
                      onChange={(e) => setRolSimulado(e.target.value as RolId)}
                      className={`px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      {ROLES_DEF.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {configPermisos.roles[rolSimulado] && (
                    <div className="space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Vista rápida:
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-[11px]">
                        {[
                          {
                            field: "puede_ver_tickets",
                            label: "Ver tickets",
                          },
                          {
                            field: "puede_crear_tickets",
                            label: "Crear tickets",
                          },
                          {
                            field: "puede_reasignar",
                            label: "Reasignar tickets",
                          },
                          {
                            field: "puede_cerrar",
                            label: "Cerrar tickets",
                          },
                          {
                            field: "puede_ver_metricas",
                            label: "Ver métricas",
                          },
                          {
                            field: "puede_editar_config_local",
                            label: "Editar configuración del centro",
                          },
                          {
                            field: "puede_gestionar_firmantes",
                            label: "Gestionar firma digital / firmantes",
                          },
                          {
                            field: "puede_gestionar_usuarios",
                            label: "Administrar usuarios y roles locales",
                          },
                        ].map((perm) => {
                          const rolCfg = configPermisos.roles[rolSimulado];
                          const activo =
                            (rolCfg as any)[perm.field] === true &&
                            rolCfg.habilitado;
                          return (
                            <div
                              key={perm.field}
                              className="flex items-center justify-between gap-2"
                            >
                              <span
                                className={`flex items-center gap-2 ${
                                  activo
                                    ? tema.colores.texto
                                    : tema.colores.textoSecundario
                                }`}
                              >
                                {activo ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <X className="w-3 h-3 text-red-400" />
                                )}
                                {perm.label}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] ${
                                  activo
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {activo ? "Permitido" : "Restringido"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bloque 2: Matriz de roles y permisos */}
            <div
              className={`rounded-2xl p-5 mb-10 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Matriz de roles y permisos
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Activa o desactiva acciones por tipo de rol técnico en este
                      centro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-black/20">
                    <tr className="text-[10px] uppercase tracking-wide text-white/70">
                      <th className="px-3 py-2 text-left">Rol</th>
                      <th className="px-3 py-2 text-center">Activo</th>
                      <th className="px-3 py-2 text-center">Ver</th>
                      <th className="px-3 py-2 text-center">Crear</th>
                      <th className="px-3 py-2 text-center">Reasignar</th>
                      <th className="px-3 py-2 text-center">Cerrar</th>
                      <th className="px-3 py-2 text-center">Métricas</th>
                      <th className="px-3 py-2 text-center">Config centro</th>
                      <th className="px-3 py-2 text-center">Firma / firmantes</th>
                      <th className="px-3 py-2 text-center">Usuarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES_DEF.map((rolDef) => {
                      const r = configPermisos.roles[rolDef.id];
                      if (!r) return null;

                      const buscarMatch =
                        !busqueda.trim() ||
                        r.nombre
                          .toLowerCase()
                          .includes(busqueda.toLowerCase()) ||
                        r.descripcion
                          .toLowerCase()
                          .includes(busqueda.toLowerCase());

                      if (!buscarMatch) return null;

                      return (
                        <tr
                          key={rolDef.id}
                          className={`border-t border-white/10 hover:bg-white/5`}
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                              >
                                <rolDef.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold">{r.nombre}</div>
                                <div
                                  className={`text-[10px] ${tema.colores.textoSecundario}`}
                                >
                                  {rolDef.desc}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-emerald-500"
                              checked={r.habilitado}
                              onChange={(e) =>
                                actualizarRol(rolDef.id, {
                                  habilitado: e.target.checked,
                                })
                              }
                            />
                          </td>
                          {(
                            [
                              "puede_ver_tickets",
                              "puede_crear_tickets",
                              "puede_reasignar",
                              "puede_cerrar",
                              "puede_ver_metricas",
                              "puede_editar_config_local",
                              "puede_gestionar_firmantes",
                              "puede_gestionar_usuarios",
                            ] as (keyof RolConfig)[]
                          ).map((campo) => (
                            <td
                              key={campo}
                              className="px-3 py-2 text-center align-middle"
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-indigo-500"
                                checked={r[campo] as boolean}
                                onChange={(e) =>
                                  actualizarRol(rolDef.id, {
                                    [campo]: e.target.checked,
                                  })
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div
                className={`mt-3 text-[11px] ${tema.colores.textoSecundario}`}
              >
                Recuerda que los permisos aquí definidos se combinan con los
                permisos globales del sistema. Si una acción está bloqueada a nivel
                comunal, no se podrá habilitar solo desde este centro.
              </div>
            </div>

            {/* Barra inferior */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm">
                <p className={tema.colores.textoSecundario}>
                  Esta página controla únicamente la{" "}
                  <span className={tema.colores.texto}>
                    política de permisos del centro
                  </span>
                  . No modifica los roles comunales ni los accesos globales que
                  define la administración central.
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
                  Valores recomendados del sistema
                </button>
                <button
                  onClick={guardarConfiguracionPermisos}
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
                © 2025 AnyssaMed / INFOGES – Configuración de Permisos del Centro.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Centro · Permisos
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
