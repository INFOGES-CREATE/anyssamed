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
  Laptop2,
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

type EstadoDispositivo = "confiable" | "bloqueado" | "nuevo";

interface SesionActiva {
  id_sesion: string;
  dispositivo_id: string | null;
  navegador: string;
  so: string;
  dispositivo: "desktop" | "mobile" | "tablet" | "otro";
  ip: string;
  ubicacion_aprox: string | null;
  primer_acceso: string;
  ultimo_acceso: string;
  actual: boolean;
  confiable: boolean;
  riesgo: "bajo" | "medio" | "alto";
}

interface DispositivoRegistrado {
  id_dispositivo: string;
  nombre_alias: string;
  tipo: "desktop" | "mobile" | "tablet" | "otro";
  so: string;
  navegador_principal: string;
  ip_ultima: string | null;
  ubicacion_ultima: string | null;
  primera_vez: string;
  ultimo_acceso: string;
  estado: EstadoDispositivo;
  sesiones_activas: number;
  ultima_actividad_riesgosa: string | null;
}

interface PreferenciasSesiones {
  cierre_inactividad_minutos: number;
  max_sesiones_activas: number;
  notificar_nueva_sesion: boolean;
  notificar_dispositivo_nuevo: boolean;
  notificar_intento_bloqueado: boolean;
  cerrar_todas_en_logout: boolean;
  permitir_recuperar_sesion: boolean;
  recordar_dispositivo_dias: number;
  alerta_ubicacion_diferente: boolean;
  tolerancia_ubicacion_km: number;
  fecha_actualizacion: string | null;
  id_preferencia?: number;
}

// ========================================
// TEMAS (igual sistema que otras páginas)
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

function crearPreferenciasSesionesPorDefecto(): PreferenciasSesiones {
  return {
    cierre_inactividad_minutos: 30,
    max_sesiones_activas: 5,
    notificar_nueva_sesion: true,
    notificar_dispositivo_nuevo: true,
    notificar_intento_bloqueado: true,
    cerrar_todas_en_logout: true,
    permitir_recuperar_sesion: true,
    recordar_dispositivo_dias: 7,
    alerta_ubicacion_diferente: true,
    tolerancia_ubicacion_km: 100,
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

function iconoDispositivo(tipo: DispositivoRegistrado["tipo"] | SesionActiva["dispositivo"]) {
  if (tipo === "mobile") return Smartphone;
  if (tipo === "tablet") return MonitorSmartphone;
  if (tipo === "desktop") return Laptop2;
  return MonitorSmartphone;
}

function colorRiesgo(riesgo: SesionActiva["riesgo"]) {
  if (riesgo === "alto") return "bg-red-500/20 text-red-200 border-red-400/40";
  if (riesgo === "medio") return "bg-yellow-500/20 text-yellow-200 border-yellow-400/40";
  return "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";
}

function chipEstadoDispositivo(estado: EstadoDispositivo) {
  if (estado === "confiable")
    return "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";
  if (estado === "bloqueado")
    return "bg-red-500/20 text-red-200 border-red-400/40";
  return "bg-slate-500/20 text-slate-200 border-slate-400/40";
}

// ========================================
// PAGE
// ========================================

export default function ConfiguracionSesionesDispositivosPage() {
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

  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [dispositivos, setDispositivos] = useState<DispositivoRegistrado[]>([]);
  const [prefs, setPrefs] = useState<PreferenciasSesiones | null>(null);

  const [loadingDatosSeguridad, setLoadingDatosSeguridad] = useState(true);
  const [guardandoSesiones, setGuardandoSesiones] = useState(false);

  const [mensajeGlobal, setMensajeGlobal] = useState<string | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambiosPrefs = useMemo(() => {
    if (!prefs) return false;
    // aquí podrías comparar con prefsOriginal si quisieras un "deshacer" completo
    return true; // siempre activamos el botón de guardar cuando se editen
  }, [prefs]);

  const sesionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return sesiones;
    const q = busqueda.toLowerCase();
    return sesiones.filter((s) => {
      return (
        s.navegador.toLowerCase().includes(q) ||
        s.so.toLowerCase().includes(q) ||
        s.ip.toLowerCase().includes(q) ||
        (s.ubicacion_aprox || "").toLowerCase().includes(q)
      );
    });
  }, [sesiones, busqueda]);

  const dispositivosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return dispositivos;
    const q = busqueda.toLowerCase();
    return dispositivos.filter((d) => {
      return (
        d.nombre_alias.toLowerCase().includes(q) ||
        d.so.toLowerCase().includes(q) ||
        d.navegador_principal.toLowerCase().includes(q) ||
        (d.ip_ultima || "").toLowerCase().includes(q) ||
        (d.ubicacion_ultima || "").toLowerCase().includes(q)
      );
    });
  }, [dispositivos, busqueda]);

  const resumen = useMemo(() => {
    const totalSesiones = sesiones.length;
    const sesionesRiesgoAlto = sesiones.filter((s) => s.riesgo === "alto").length;
    const dispositivosConfiables = dispositivos.filter(
      (d) => d.estado === "confiable"
    ).length;
    const dispositivosBloqueados = dispositivos.filter(
      (d) => d.estado === "bloqueado"
    ).length;

    return {
      totalSesiones,
      sesionesRiesgoAlto,
      dispositivosConfiables,
      dispositivosBloqueados,
    };
  }, [sesiones, dispositivos]);

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
      cargarSeguridadSesionesYDispositivos();
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
            `Acceso denegado. Este módulo de sesiones/dispositivos es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarSeguridadSesionesYDispositivos = async () => {
    try {
      setLoadingDatosSeguridad(true);
      setErrorGlobal(null);

      // Sesiones activas
      const resSesiones = await fetch("/api/users/sesiones", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const dataSesiones = await resSesiones.json().catch(() => ({}));

      if (resSesiones.ok && dataSesiones.success && Array.isArray(dataSesiones.sesiones)) {
        setSesiones(
          dataSesiones.sesiones.map((s: any) => ({
            id_sesion: s.id_sesion,
            dispositivo_id: s.dispositivo_id ?? null,
            navegador: s.navegador ?? "Navegador",
            so: s.so ?? "SO",
            dispositivo: s.dispositivo ?? "desktop",
            ip: s.ip ?? "0.0.0.0",
            ubicacion_aprox: s.ubicacion_aprox ?? null,
            primer_acceso: s.primer_acceso ?? s.ultimo_acceso ?? new Date().toISOString(),
            ultimo_acceso: s.ultimo_acceso ?? s.primer_acceso ?? new Date().toISOString(),
            actual: !!s.actual,
            confiable: !!s.confiable,
            riesgo: s.riesgo ?? "bajo",
          })) as SesionActiva[]
        );
      } else {
        setSesiones([]);
      }

      // Dispositivos
      const resDisp = await fetch("/api/users/dispositivos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const dataDisp = await resDisp.json().catch(() => ({}));

      if (resDisp.ok && dataDisp.success && Array.isArray(dataDisp.dispositivos)) {
        setDispositivos(
          dataDisp.dispositivos.map((d: any) => ({
            id_dispositivo: d.id_dispositivo,
            nombre_alias: d.nombre_alias ?? "Dispositivo sin nombre",
            tipo: d.tipo ?? "desktop",
            so: d.so ?? "SO",
            navegador_principal: d.navegador_principal ?? "Navegador",
            ip_ultima: d.ip_ultima ?? null,
            ubicacion_ultima: d.ubicacion_ultima ?? null,
            primera_vez: d.primera_vez ?? d.ultimo_acceso ?? new Date().toISOString(),
            ultimo_acceso: d.ultimo_acceso ?? d.primera_vez ?? new Date().toISOString(),
            estado: d.estado ?? "nuevo",
            sesiones_activas: d.sesiones_activas ?? 0,
            ultima_actividad_riesgosa: d.ultima_actividad_riesgosa ?? null,
          })) as DispositivoRegistrado[]
        );
      } else {
        setDispositivos([]);
      }

      // Preferencias
      const resPrefs = await fetch("/api/users/preferencias/sesiones", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const dataPrefs = await resPrefs.json().catch(() => ({}));

      if (resPrefs.ok && dataPrefs.success && dataPrefs.preferencias) {
        const p = dataPrefs.preferencias;
        const prefsLocal: PreferenciasSesiones = {
          id_preferencia: p.id_preferencia,
          cierre_inactividad_minutos: p.cierre_inactividad_minutos ?? 30,
          max_sesiones_activas: p.max_sesiones_activas ?? 5,
          notificar_nueva_sesion: p.notificar_nueva_sesion ?? true,
          notificar_dispositivo_nuevo: p.notificar_dispositivo_nuevo ?? true,
          notificar_intento_bloqueado: p.notificar_intento_bloqueado ?? true,
          cerrar_todas_en_logout: p.cerrar_todas_en_logout ?? true,
          permitir_recuperar_sesion: p.permitir_recuperar_sesion ?? true,
          recordar_dispositivo_dias: p.recordar_dispositivo_dias ?? 7,
          alerta_ubicacion_diferente: p.alerta_ubicacion_diferente ?? true,
          tolerancia_ubicacion_km: p.tolerancia_ubicacion_km ?? 100,
          fecha_actualizacion: p.fecha_actualizacion ?? null,
        };
        setPrefs(prefsLocal);
      } else {
        setPrefs(crearPreferenciasSesionesPorDefecto());
      }
    } catch (error) {
      console.error("Error al cargar seguridad sesiones/dispositivos:", error);
      setErrorGlobal(
        "No se pudieron cargar las sesiones y dispositivos. Se usarán valores base para preferencias."
      );
      setPrefs((prev) => prev ?? crearPreferenciasSesionesPorDefecto());
    } finally {
      setLoadingDatosSeguridad(false);
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

  const revocarSesion = async (id_sesion: string) => {
    try {
      setGuardandoSesiones(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/sesiones/revocar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_sesion }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al revocar sesión:", data);
        setErrorGlobal(data?.message || "No se pudo cerrar esa sesión.");
        return;
      }

      setSesiones((prev) => prev.filter((s) => s.id_sesion !== id_sesion));
      setMensajeGlobal("Sesión cerrada correctamente.");
    } catch (error) {
      console.error("Error al revocar sesión:", error);
      setErrorGlobal("Ocurrió un error al cerrar la sesión.");
    } finally {
      setGuardandoSesiones(false);
    }
  };

  const revocarOtrasSesiones = async () => {
    try {
      setGuardandoSesiones(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/sesiones/revocar-otras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al revocar otras sesiones:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron cerrar las otras sesiones activas."
        );
        return;
      }

      setSesiones((prev) => prev.filter((s) => s.actual));
      setMensajeGlobal("Se cerraron todas las otras sesiones.");
    } catch (error) {
      console.error("Error al revocar otras sesiones:", error);
      setErrorGlobal(
        "Ocurrió un error al cerrar las otras sesiones activas."
      );
    } finally {
      setGuardandoSesiones(false);
    }
  };

  const revocarSesionesAntiguas = async (dias: number) => {
    try {
      setGuardandoSesiones(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/sesiones/revocar-antiguas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dias }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al revocar sesiones antiguas:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron cerrar las sesiones antiguas."
        );
        return;
      }

      const limite = Date.now() - dias * 24 * 60 * 60 * 1000;
      setSesiones((prev) =>
        prev.filter((s) => {
          const t = new Date(s.ultimo_acceso).getTime();
          return Number.isNaN(t) || t >= limite || s.actual;
        })
      );
      setMensajeGlobal(
        `Se cerraron las sesiones con inactividad mayor a ${dias} días.`
      );
    } catch (error) {
      console.error("Error al revocar sesiones antiguas:", error);
      setErrorGlobal("Ocurrió un error al cerrar sesiones antiguas.");
    } finally {
      setGuardandoSesiones(false);
    }
  };

  const actualizarEstadoDispositivo = async (
    id_dispositivo: string,
    nuevoEstado: EstadoDispositivo
  ) => {
    try {
      setGuardandoSesiones(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/dispositivos/estado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_dispositivo, estado: nuevoEstado }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al actualizar estado dispositivo:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudo actualizar el estado del dispositivo."
        );
        return;
      }

      setDispositivos((prev) =>
        prev.map((d) =>
          d.id_dispositivo === id_dispositivo
            ? { ...d, estado: nuevoEstado }
            : d
        )
      );

      if (nuevoEstado === "bloqueado") {
        setSesiones((prev) =>
          prev.filter((s) => s.dispositivo_id !== id_dispositivo || s.actual)
        );
      }

      setMensajeGlobal("Estado del dispositivo actualizado.");
    } catch (error) {
      console.error("Error al actualizar estado dispositivo:", error);
      setErrorGlobal(
        "Ocurrió un error al cambiar el estado del dispositivo."
      );
    } finally {
      setGuardandoSesiones(false);
    }
  };

  const renombrarDispositivo = async (
    id_dispositivo: string,
    alias: string
  ) => {
    try {
      setGuardandoSesiones(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const res = await fetch("/api/users/dispositivos/alias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_dispositivo, nombre_alias: alias }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al renombrar dispositivo:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudo actualizar el nombre del dispositivo."
        );
        return;
      }

      setDispositivos((prev) =>
        prev.map((d) =>
          d.id_dispositivo === id_dispositivo
            ? { ...d, nombre_alias: alias }
            : d
        )
      );
      setMensajeGlobal("Dispositivo renombrado correctamente.");
    } catch (error) {
      console.error("Error al renombrar dispositivo:", error);
      setErrorGlobal("Ocurrió un error al renombrar el dispositivo.");
    } finally {
      setGuardandoSesiones(false);
    }
  };

  const guardarPreferenciasSesiones = async () => {
    if (!prefs) return;
    try {
      setGuardandoSesiones(true);
      setMensajeGlobal(null);
      setErrorGlobal(null);

      const metodo = prefs.id_preferencia ? "PUT" : "POST";

      const res = await fetch("/api/users/preferencias/sesiones", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefs),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al guardar preferencias sesiones:", data);
        setErrorGlobal(
          data?.message ||
            "No se pudieron guardar las preferencias de sesiones/dispositivos."
        );
        return;
      }

      const serverPrefs = data.preferencias || data.data || {};
      const prefsFinal: PreferenciasSesiones = {
        ...prefs,
        ...serverPrefs,
        fecha_actualizacion:
          serverPrefs.fecha_actualizacion ??
          prefs.fecha_actualizacion ??
          new Date().toISOString(),
        id_preferencia:
          serverPrefs.id_preferencia ?? prefs.id_preferencia,
      };

      setPrefs(prefsFinal);
      setMensajeGlobal("Preferencias de sesiones y dispositivos guardadas.");
    } catch (error) {
      console.error("Error al guardar preferencias sesiones:", error);
      setErrorGlobal(
        "Ocurrió un error al guardar las preferencias de seguridad."
      );
    } finally {
      setGuardandoSesiones(false);
    }
  };

  const restaurarPrefsDefault = () => {
    const base = crearPreferenciasSesionesPorDefecto();
    setPrefs((prev) =>
      prev ? { ...base, id_preferencia: prev.id_preferencia } : base
    );
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
              <MonitorSmartphone className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando sesiones y dispositivos
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Validando tu sesión y preparando el panel de seguridad...
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
            No tienes permisos para acceder a la configuración de sesiones y
            dispositivos del módulo técnico.
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

  const cargandoContenido = loadingDatosSeguridad || !prefs;

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
                placeholder="Buscar sesiones, dispositivos, IP o ubicación..."
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
                      href="/tecnico/configuracion/pin"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Premium & PIN</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion/sesiones"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <MonitorSmartphone className="w-5 h-5" />
                      <span>Sesiones & Dispositivos</span>
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
              <span className="animate-wave inline-block">📡</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Controla todas tus{" "}
              <span className={tema.colores.texto}>sesiones activas</span> y
              los{" "}
              <span className={tema.colores.texto}>
                dispositivos que pueden acceder
              </span>{" "}
              a tu cuenta técnica.
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
                onClick={cargarSeguridadSesionesYDispositivos}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={cargandoContenido}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    cargandoContenido ? "animate-spin" : "opacity-60"
                  }`}
                />
                Recargar sesiones y dispositivos
              </button>
              <button
                onClick={guardarPreferenciasSesiones}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambiosPrefs || guardandoSesiones}
              >
                <Save className="w-4 h-4" />
                {guardandoSesiones
                  ? "Guardando cambios..."
                  : "Guardar preferencias"}
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
                  Aún no se han guardado preferencias personalizadas de sesiones.
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
            icono={MonitorSmartphone}
            titulo="Sesiones activas"
            valor={resumen.totalSesiones}
            chip="Sesiones abiertas"
            color="from-indigo-500 to-cyan-500"
          />
          <ResumenCard
            tema={tema}
            icono={AlertTriangle}
            titulo="Sesiones de riesgo"
            valor={resumen.sesionesRiesgoAlto}
            chip="Riesgo alto detectado"
            color="from-red-500 to-orange-500"
          />
          <ResumenCard
            tema={tema}
            icono={Shield}
            titulo="Dispositivos confiables"
            valor={resumen.dispositivosConfiables}
            chip="Marcados como seguros"
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={Lock}
            titulo="Dispositivos bloqueados"
            valor={resumen.dispositivosBloqueados}
            chip="Denegados por seguridad"
            color="from-purple-500 to-pink-500"
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
                Cargando todas tus sesiones activas y dispositivos registrados...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* SESIONES ACTIVAS */}
              <div
                className={`xl:col-span-2 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <MonitorSmartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Sesiones activas
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Visualiza y cierra sesiones abiertas en otros dispositivos
                        o ubicaciones.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={revocarOtrasSesiones}
                      className={`px-3 py-2 rounded-xl font-semibold ${tema.colores.hover} ${tema.colores.texto} border border-transparent hover:border-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={guardandoSesiones || sesiones.length <= 1}
                    >
                      Cerrar todas menos esta
                    </button>
                    <button
                      onClick={() => revocarSesionesAntiguas(30)}
                      className={`px-3 py-2 rounded-xl font-semibold ${tema.colores.hover} ${tema.colores.texto} border border-transparent hover:border-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed`}
                      disabled={guardandoSesiones || sesiones.length === 0}
                    >
                      Cerrar sesiones &gt; 30 días
                    </button>
                  </div>
                </div>

                {sesionesFiltradas.length === 0 ? (
                  <div className="p-6 text-center text-sm">
                    <p className={tema.colores.textoSecundario}>
                      No hay sesiones activas que coincidan con tu búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                    {sesionesFiltradas.map((s) => {
                      const IconoDispositivo = iconoDispositivo(s.dispositivo);
                      return (
                        <div
                          key={s.id_sesion}
                          className={`flex items-start gap-3 rounded-2xl p-3 md:p-4 border ${tema.colores.borde} ${tema.colores.hover}`}
                        >
                          <div className="flex flex-col items-center gap-2 mt-1">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                            >
                              <IconoDispositivo className="w-5 h-5" />
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] border ${colorRiesgo(
                                s.riesgo
                              )} font-semibold`}
                            >
                              {s.riesgo === "alto"
                                ? "Riesgo alto"
                                : s.riesgo === "medio"
                                ? "Riesgo medio"
                                : "Riesgo bajo"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p
                                  className={`text-sm font-semibold ${tema.colores.texto}`}
                                >
                                  {s.navegador} · {s.so}
                                </p>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  IP {s.ip}
                                  {s.ubicacion_aprox
                                    ? ` · ${s.ubicacion_aprox}`
                                    : ""}
                                </p>
                              </div>
                              <div className="text-right text-[11px]">
                                <p className={tema.colores.textoSecundario}>
                                  Último acceso:
                                </p>
                                <p className={tema.colores.texto}>
                                  {formatearFechaHora(s.ultimo_acceso)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              <div className="flex flex-wrap items-center gap-2">
                                {s.actual && (
                                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 font-semibold flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Esta sesión
                                  </span>
                                )}
                                {s.confiable && (
                                  <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-100 border border-indigo-400/40 font-semibold">
                                    Dispositivo confiable
                                  </span>
                                )}
                                {s.dispositivo_id === null && (
                                  <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-100 border border-slate-400/40 font-semibold">
                                    Dispositivo no identificado
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {!s.actual && (
                                  <button
                                    onClick={() => revocarSesion(s.id_sesion)}
                                    className="px-3 py-1.5 rounded-xl border border-red-500/60 text-red-300 hover:bg-red-500/10 font-semibold"
                                    disabled={guardandoSesiones}
                                  >
                                    Cerrar sesión
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PREFERENCIAS DE SESIONES */}
              <div
                className={`xl:col-span-1 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Reglas de sesión
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ajusta el comportamiento por defecto de tus sesiones y
                        alertas.
                      </p>
                    </div>
                  </div>
                </div>

                {prefs && (
                  <div className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Tiempo máximo de inactividad
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={5}
                          max={480}
                          value={prefs.cierre_inactividad_minutos}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    cierre_inactividad_minutos: Math.min(
                                      480,
                                      Math.max(
                                        5,
                                        parseInt(e.target.value || "5", 10)
                                      )
                                    ),
                                  }
                                : prev
                            )
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-xs text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <span className={tema.colores.textoSecundario}>
                          minutos de inactividad
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Número máximo de sesiones abiertas
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={prefs.max_sesiones_activas}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    max_sesiones_activas: Math.min(
                                      20,
                                      Math.max(
                                        1,
                                        parseInt(e.target.value || "1", 10)
                                      )
                                    ),
                                  }
                                : prev
                            )
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-xs text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <span className={tema.colores.textoSecundario}>
                          sesiones simultáneas
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Notificaciones
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.notificar_nueva_sesion}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_nueva_sesion: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Avisar al correo o app cuando se abra una nueva sesión.
                        </span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.notificar_dispositivo_nuevo}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_dispositivo_nuevo:
                                      e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Avisar cuando se use un dispositivo nuevo para tu
                          cuenta.
                        </span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-red-500"
                          checked={prefs.notificar_intento_bloqueado}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    notificar_intento_bloqueado:
                                      e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Avisar si se bloquea un intento de acceso desde un
                          dispositivo o IP bloqueada.
                        </span>
                      </label>
                    </div>

                    <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Cierre y recuperación
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.cerrar_todas_en_logout}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    cerrar_todas_en_logout: e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Cerrar todas las sesiones cuando cierres sesión desde
                          este dispositivo.
                        </span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.permitir_recuperar_sesion}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    permitir_recuperar_sesion:
                                      e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Permitir recuperar una sesión reciente si se cerró por
                          inactividad.
                        </span>
                      </label>
                    </div>

                    <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 space-y-2">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Ubicación y dispositivos recordados
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 w-4 h-4 accent-indigo-500"
                          checked={prefs.alerta_ubicacion_diferente}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    alerta_ubicacion_diferente:
                                      e.target.checked,
                                  }
                                : prev
                            )
                          }
                        />
                        <span className={tema.colores.textoSecundario}>
                          Avisar cuando la nueva sesión sea desde una ubicación
                          muy distinta a la habitual.
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Tolerancia aproximada:
                        </span>
                        <input
                          type="number"
                          min={10}
                          max={2000}
                          value={prefs.tolerancia_ubicacion_km}
                          onChange={(e) =>
                            setPrefs((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    tolerancia_ubicacion_km: Math.min(
                                      2000,
                                      Math.max(
                                        10,
                                        parseInt(e.target.value || "10", 10)
                                      )
                                    ),
                                  }
                                : prev
                            )
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-xs text-right ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          km
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          Recordar este dispositivo por
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={prefs.recordar_dispositivo_dias}
                          onChange={(e) =>
                            setPrefs((prev) =>
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

                    <div className="border-t border-dashed border-gray-600/40 pt-4 mt-4 flex flex-wrap items-center gap-3">
                      <button
                        onClick={restaurarPrefsDefault}
                        className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        Valores recomendados
                      </button>
                      <button
                        onClick={guardarPreferenciasSesiones}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                        disabled={guardandoSesiones}
                      >
                        <Save className="w-4 h-4" />
                        {guardandoSesiones
                          ? "Guardando..."
                          : "Guardar ahora"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DISPOSITIVOS */}
            <div
              className={`rounded-2xl p-5 mb-10 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Dispositivos registrados
                    </h3>
                    <p
                      className={`text-xs ${tema.colores.textoSecundario}`}
                    >
                      Marca como confiables los dispositivos que usas a diario y
                      bloquea los que no reconozcas.
                    </p>
                  </div>
                </div>
              </div>

              {dispositivosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-sm">
                  <p className={tema.colores.textoSecundario}>
                    No hay dispositivos registrados que coincidan con tu
                    búsqueda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                  {dispositivosFiltrados.map((d) => {
                    const Icono = iconoDispositivo(d.tipo);
                    return (
                      <div
                        key={d.id_dispositivo}
                        className={`rounded-2xl p-3 md:p-4 border ${tema.colores.borde} ${tema.colores.hover} flex flex-col gap-2`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                            >
                              <Icono className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  defaultValue={d.nombre_alias}
                                  onBlur={(e) =>
                                    e.target.value.trim() &&
                                    e.target.value.trim() !== d.nombre_alias &&
                                    renombrarDispositivo(
                                      d.id_dispositivo,
                                      e.target.value.trim()
                                    )
                                  }
                                  className={`text-sm font-semibold bg-transparent border-b border-dashed border-transparent focus:border-indigo-400 focus:outline-none ${tema.colores.texto}`}
                                />
                              </div>
                              <p
                                className={`text-[11px] ${tema.colores.textoSecundario}`}
                              >
                                {d.so} · {d.navegador_principal}
                              </p>
                              <p
                                className={`text-[11px] ${tema.colores.textoSecundario}`}
                              >
                                Última IP:{" "}
                                <span className={tema.colores.texto}>
                                  {d.ip_ultima ?? "Desconocida"}
                                </span>{" "}
                                {d.ubicacion_ultima
                                  ? `· ${d.ubicacion_ultima}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-[11px]">
                            <span
                              className={`px-3 py-1 rounded-full font-semibold border ${chipEstadoDispositivo(
                                d.estado
                              )}`}
                            >
                              {d.estado === "confiable"
                                ? "Confiable"
                                : d.estado === "bloqueado"
                                ? "Bloqueado"
                                : "Nuevo / sin clasificar"}
                            </span>
                            <div className="text-right">
                              <p className={tema.colores.textoSecundario}>
                                Último acceso:
                              </p>
                              <p className={tema.colores.texto}>
                                {formatearFechaHora(d.ultimo_acceso)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full bg-black/20 ${tema.colores.textoSecundario}`}
                            >
                              Sesiones activas desde este dispositivo:{" "}
                              <span className={tema.colores.texto}>
                                {d.sesiones_activas}
                              </span>
                            </span>
                            {d.ultima_actividad_riesgosa && (
                              <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-100 border border-red-400/40">
                                Actividad riesgosa:{" "}
                                {formatearFechaHora(
                                  d.ultima_actividad_riesgosa
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() =>
                                actualizarEstadoDispositivo(
                                  d.id_dispositivo,
                                  "confiable"
                                )
                              }
                              className="px-3 py-1.5 rounded-xl border border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/10 font-semibold"
                              disabled={guardandoSesiones}
                            >
                              Marcar como confiable
                            </button>
                            <button
                              onClick={() =>
                                actualizarEstadoDispositivo(
                                  d.id_dispositivo,
                                  "bloqueado"
                                )
                              }
                              className="px-3 py-1.5 rounded-xl border border-red-500/60 text-red-200 hover:bg-red-500/10 font-semibold"
                              disabled={guardandoSesiones}
                            >
                              Bloquear dispositivo
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BARRA ABAJO */}
            <div
              className={`mt-6 rounded-2xl px-5 py-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-3`}
            >
              <div className="text-xs md:text-sm">
                <p className={tema.colores.textoSecundario}>
                  Aquí gestionas las{" "}
                  <span className={tema.colores.texto}>
                    sesiones activas de tu cuenta técnica
                  </span>{" "}
                  y los{" "}
                  <span className={tema.colores.texto}>
                    dispositivos autorizados
                  </span>
                  . No afecta la configuración del centro ni datos de pacientes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={cargarSeguridadSesionesYDispositivos}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={cargandoContenido || guardandoSesiones}
                >
                  <RefreshCw className="w-4 h-4" />
                  Volver a escanear sesiones
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
                © 2025 AnyssaMed / INFOGES – Sesiones & Dispositivos.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Tickets · Seguridad de acceso
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
