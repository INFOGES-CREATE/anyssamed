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
  Droplet,
  FileText,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  Palette,
  PenTool,
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

type ModoFirma = "simple" | "avanzada" | "integrada_hsm";
type UbicacionPdf = "pie" | "cabecera" | "margen_derecho" | "margen_izquierdo";
type TamanioBloque = "compacto" | "normal" | "extendido";

interface ConfigFirmaDigitalCentro {
  id_config_firma: number | null;
  id_centro: number;

  habilitada: boolean;
  modo_firma: ModoFirma;

  frase_firma: string;
  leyenda_legal: string;

  formato: {
    mostrar_logo_centro: boolean;
    mostrar_firma_imagen: boolean;
    mostrar_firma_texto: boolean;
    mostrar_rut: boolean;
    mostrar_profesion: boolean;
    mostrar_registro_superintendencia: boolean;
    mostrar_codigo_qr: boolean;
    incluir_sello_tiempo: boolean;
  };

  estilo: {
    fuente: string;
    tamano: number;
    color_texto: string;
    color_resaltado: string;
    alineacion: "izquierda" | "centro" | "derecha";
    mostrar_borde: boolean;
    grosor_borde: number;
  };

  ubicacion_pdf: UbicacionPdf;
  tamanio_bloque: TamanioBloque;

  requiere_pin_tecnico: boolean;
  requiere_mfa_para_firmar: boolean;
  permitir_firma_masiva: boolean;
  max_documentos_lote: number;
  permitir_reasignar_firma: boolean;
  habilitar_firma_en_movil: boolean;

  ult_actualizacion: string | null;
}

interface MedicoFirmante {
  id_medico: number;
  nombre_completo: string;
  rut: string;
  especialidad: string;
  activo: boolean;
  color_firma: string;
  iniciales: string;
}

// =====================================================
// TEMAS
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

function crearConfigFirmaPorDefecto(usuario: UsuarioSesion): ConfigFirmaDigitalCentro {
  const now = new Date().toISOString();
  const centroId =
    usuario.tecnico?.centro?.id_centro ?? usuario.tecnico?.id_centro ?? 0;

  return {
    id_config_firma: null,
    id_centro: centroId,
    habilitada: true,
    modo_firma: "avanzada",

    frase_firma: "Firmo electrónicamente la presente orden / documento clínico.",
    leyenda_legal:
      "Esta firma electrónica cumple con la normativa vigente y reemplaza la firma manuscrita para todos los efectos legales dentro de este establecimiento.",

    formato: {
      mostrar_logo_centro: true,
      mostrar_firma_imagen: true,
      mostrar_firma_texto: true,
      mostrar_rut: true,
      mostrar_profesion: true,
      mostrar_registro_superintendencia: false,
      mostrar_codigo_qr: true,
      incluir_sello_tiempo: true,
    },

    estilo: {
      fuente: "Inter",
      tamano: 13,
      color_texto: "#ffffff",
      color_resaltado: "#4f46e5",
      alineacion: "izquierda",
      mostrar_borde: true,
      grosor_borde: 1,
    },

    ubicacion_pdf: "pie",
    tamanio_bloque: "normal",

    requiere_pin_tecnico: true,
    requiere_mfa_para_firmar: true,
    permitir_firma_masiva: false,
    max_documentos_lote: 20,
    permitir_reasignar_firma: true,
    habilitar_firma_en_movil: true,

    ult_actualizacion: now,
  };
}

const FUENTES_FIRMA = ["Inter", "Roboto", "Nunito", "Poppins", "Playfair", "Caveat"];

const PALETA_COLORES = [
  "#1f2937",
  "#111827",
  "#4f46e5",
  "#6366f1",
  "#0f766e",
  "#059669",
  "#b91c1c",
  "#f97316",
  "#eab308",
  "#ffffff",
];

// =====================================================
// PAGE
// =====================================================

export default function ConfiguracionFirmaDigitalPage() {
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

  const [configFirma, setConfigFirma] =
    useState<ConfigFirmaDigitalCentro | null>(null);
  const [configOriginal, setConfigOriginal] =
    useState<ConfigFirmaDigitalCentro | null>(null);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeConfig, setMensajeConfig] = useState<string | null>(null);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);

  // CRUD Médicos / firmantes
  const [medicos, setMedicos] = useState<MedicoFirmante[]>([]);
  const [medicoSeleccionado, setMedicoSeleccionado] =
    useState<MedicoFirmante | null>(null);
  const [formMedico, setFormMedico] = useState<Partial<MedicoFirmante>>({});
  const [editandoMedicoId, setEditandoMedicoId] = useState<number | null>(null);
  const [guardandoMedico, setGuardandoMedico] = useState(false);
  const [mensajeMedico, setMensajeMedico] = useState<string | null>(null);
  const [errorMedico, setErrorMedico] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const hayCambios = useMemo(() => {
    if (!configFirma || !configOriginal) return false;
    return JSON.stringify(configFirma) !== JSON.stringify(configOriginal);
  }, [configFirma, configOriginal]);

  const totalFirmantesActivos = useMemo(
    () => medicos.filter((m) => m.activo).length,
    [medicos]
  );

  const ultimaActualizacion = useMemo(
    () => configFirma?.ult_actualizacion ?? null,
    [configFirma]
  );

  // score / nivel de firma
  const scoreFirma = useMemo(() => {
    if (!configFirma) return 0;
    let s = 0;
    if (configFirma.habilitada) s += 4;
    if (configFirma.modo_firma === "simple") s += 1;
    if (configFirma.modo_firma === "avanzada") s += 3;
    if (configFirma.modo_firma === "integrada_hsm") s += 5;

    if (configFirma.formato.mostrar_codigo_qr) s += 2;
    if (configFirma.formato.incluir_sello_tiempo) s += 2;

    if (configFirma.requiere_pin_tecnico) s += 2;
    if (configFirma.requiere_mfa_para_firmar) s += 3;

    if (configFirma.habilitar_firma_en_movil) s += 1;

    return s;
  }, [configFirma]);

  const etiquetaNivelFirma = useMemo(() => {
    if (!configFirma) return "Sin configurar";
    if (scoreFirma >= 15) return "Firma avanzada / robusta";
    if (scoreFirma >= 10) return "Firma reforzada";
    if (scoreFirma >= 6) return "Firma básica";
    return "Firma débil";
  }, [scoreFirma, configFirma]);

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
      cargarConfiguracionFirma();
      cargarMedicosFirmantes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    if (!mensajeConfig && !errorConfig && !mensajeMedico && !errorMedico) return;
    const t = setTimeout(() => {
      setMensajeConfig(null);
      setErrorConfig(null);
      setMensajeMedico(null);
      setErrorMedico(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [mensajeConfig, errorConfig, mensajeMedico, errorMedico]);

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
            `Acceso denegado. Esta configuración de firma digital es solo para técnicos. Tus roles actuales son: ${rolesUsuario.join(
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

  const cargarConfiguracionFirma = async () => {
    if (!usuario?.tecnico) return;

    try {
      setLoadingConfig(true);
      setErrorConfig(null);

      const base = crearConfigFirmaPorDefecto(usuario);

      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
        id_tecnico: String(usuario.tecnico.id_tecnico),
      });

      const res = await fetch(
        `/api/tecnico/configuracion/firma-digital?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.warn("Sin configuración de firma previa, usando por defecto");
        setConfigFirma(base);
        setConfigOriginal(base);
        return;
      }

      const cfgServer =
        (data.config || data.configFirma || data.config_firma) ??
        ({} as Partial<ConfigFirmaDigitalCentro>);

      const cfg: ConfigFirmaDigitalCentro = {
        ...base,
        ...cfgServer,
        id_centro: base.id_centro,
        formato: {
          ...base.formato,
          ...(cfgServer.formato || {}),
        },
        estilo: {
          ...base.estilo,
          ...(cfgServer.estilo || {}),
        },
      };

      setConfigFirma(cfg);
      setConfigOriginal(cfg);
    } catch (err) {
      console.error("Error al cargar config firma:", err);
      if (usuario) {
        const base = crearConfigFirmaPorDefecto(usuario);
        setConfigFirma(base);
        setConfigOriginal(base);
      }
      setErrorConfig(
        "No se pudo cargar la configuración de firma digital. Se usarán valores por defecto."
      );
    } finally {
      setLoadingConfig(false);
    }
  };

  const cargarMedicosFirmantes = async () => {
    if (!usuario?.tecnico) return;
    try {
      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const params = new URLSearchParams({
        id_centro: String(idCentro),
      });

      const res = await fetch(
        `/api/tecnico/configuracion/firma-digital/firmantes?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.warn("Sin lista de médicos firmantes, se mostrará vacía");
        setMedicos([]);
        setMedicoSeleccionado(null);
        return;
      }

      const lista: MedicoFirmante[] = data.medicos || data.firmantes || [];
      setMedicos(lista);
      setMedicoSeleccionado(lista[0] ?? null);
    } catch (err) {
      console.error("Error al cargar médicos firmantes:", err);
      setMedicos([]);
      setMedicoSeleccionado(null);
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

  const actualizarConfigFirma = (
    cambios: Partial<ConfigFirmaDigitalCentro>
  ) => {
    setConfigFirma((prev) => (prev ? { ...prev, ...cambios } : prev));
  };

  const actualizarFormato = (
    cambios: Partial<ConfigFirmaDigitalCentro["formato"]>
  ) => {
    setConfigFirma((prev) =>
      prev
        ? {
            ...prev,
            formato: { ...prev.formato, ...cambios },
          }
        : prev
    );
  };

  const actualizarEstilo = (
    cambios: Partial<ConfigFirmaDigitalCentro["estilo"]>
  ) => {
    setConfigFirma((prev) =>
      prev
        ? {
            ...prev,
            estilo: { ...prev.estilo, ...cambios },
          }
        : prev
    );
  };

  const actualizarNumero = (
    campo: keyof ConfigFirmaDigitalCentro,
    valor: string,
    opts?: { min?: number; max?: number }
  ) => {
    if (!configFirma) return;
    const n = parseInt(valor, 10);
    if (Number.isNaN(n)) return;
    if (opts?.min != null && n < opts.min) return;
    if (opts?.max != null && n > opts.max) return;
    actualizarConfigFirma({ [campo]: n } as any);
  };

  const guardarConfiguracionFirma = async () => {
    if (!usuario?.tecnico || !configFirma) return;

    try {
      setGuardandoConfig(true);
      setMensajeConfig(null);
      setErrorConfig(null);

      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const res = await fetch("/api/tecnico/configuracion/firma-digital", {
        method: configFirma.id_config_firma ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...configFirma,
          id_centro: idCentro,
          id_tecnico: usuario.tecnico.id_tecnico,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.error("Error al guardar config firma:", data);
        setErrorConfig(
          data?.message ||
            "No se pudo guardar la configuración de firma. Inténtalo nuevamente."
        );
        return;
      }

      let nuevaConfig: ConfigFirmaDigitalCentro = configFirma;

      if (data.config || data.configFirma || data.config_firma) {
        const base = crearConfigFirmaPorDefecto(usuario);
        const cfgServer =
          (data.config || data.configFirma || data.config_firma) as Partial<
            ConfigFirmaDigitalCentro
          >;

        nuevaConfig = {
          ...base,
          ...cfgServer,
          id_centro: base.id_centro,
          formato: {
            ...base.formato,
            ...(cfgServer.formato || {}),
          },
          estilo: {
            ...base.estilo,
            ...(cfgServer.estilo || {}),
          },
          ult_actualizacion:
            cfgServer.ult_actualizacion || new Date().toISOString(),
        };
      } else {
        nuevaConfig = {
          ...configFirma,
          ult_actualizacion: new Date().toISOString(),
        };
      }

      setConfigFirma(nuevaConfig);
      setConfigOriginal(nuevaConfig);
      setMensajeConfig("Configuración de firma digital guardada correctamente.");
    } catch (err) {
      console.error("Error al guardar config firma:", err);
      setErrorConfig(
        "Se produjo un error al guardar la configuración. Verifica la conexión."
      );
    } finally {
      setGuardandoConfig(false);
    }
  };

  const restaurarDesdeOriginal = () => {
    if (!configOriginal) return;
    setConfigFirma(configOriginal);
  };

  const restaurarRecomendados = () => {
    if (!usuario) return;
    const base = crearConfigFirmaPorDefecto(usuario);
    setConfigFirma(base);
  };

  // ----------- CRUD Médicos --------------

  const limpiarFormMedico = () => {
    setFormMedico({});
    setEditandoMedicoId(null);
  };

  const cargarEnFormulario = (medico: MedicoFirmante) => {
    setFormMedico(medico);
    setEditandoMedicoId(medico.id_medico);
  };

  const handleGuardarMedico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.tecnico) return;

    const base: MedicoFirmante = {
      id_medico: editandoMedicoId ?? 0,
      nombre_completo: formMedico.nombre_completo?.trim() || "",
      rut: formMedico.rut?.trim() || "",
      especialidad: formMedico.especialidad?.trim() || "",
      activo: formMedico.activo ?? true,
      color_firma: formMedico.color_firma || "#4f46e5",
      iniciales:
        formMedico.iniciales ||
        (formMedico.nombre_completo
          ? formMedico.nombre_completo
              .split(" ")
              .map((p) => p[0])
              .join("")
              .toUpperCase()
          : ""),
    };

    if (!base.nombre_completo || !base.rut) {
      setErrorMedico("Nombre y RUT son obligatorios.");
      return;
    }

    try {
      setGuardandoMedico(true);
      setMensajeMedico(null);
      setErrorMedico(null);

      const idCentro =
        usuario.tecnico.centro?.id_centro ?? usuario.tecnico.id_centro;

      const body = {
        ...base,
        id_centro: idCentro,
      };

      const method = editandoMedicoId ? "PUT" : "POST";
      const url = editandoMedicoId
        ? `/api/tecnico/configuracion/firma-digital/firmantes/${editandoMedicoId}`
        : "/api/tecnico/configuracion/firma-digital/firmantes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.error("Error guardar médico:", data);
        setErrorMedico(
          data?.message ||
            "No se pudo guardar el médico firmante. Intenta nuevamente."
        );
        return;
      }

      await cargarMedicosFirmantes();
      setMensajeMedico(
        editandoMedicoId
          ? "Médico firmante actualizado correctamente."
          : "Médico firmante creado correctamente."
      );
      limpiarFormMedico();
    } catch (err) {
      console.error("Error guardar médico firmante:", err);
      setErrorMedico(
        "Se produjo un error al guardar el médico firmante. Revisa la conexión."
      );
    } finally {
      setGuardandoMedico(false);
    }
  };

  const handleEliminarMedico = async (medico: MedicoFirmante) => {
    if (!usuario?.tecnico) return;
    if (!confirm(`¿Eliminar al médico ${medico.nombre_completo}?`)) return;

    try {
      setGuardandoMedico(true);
      setErrorMedico(null);
      setMensajeMedico(null);

      const res = await fetch(
        `/api/tecnico/configuracion/firma-digital/firmantes/${medico.id_medico}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success) {
        console.error("Error eliminar médico:", data);
        setErrorMedico(
          data?.message || "No se pudo eliminar el médico firmante."
        );
        return;
      }

      await cargarMedicosFirmantes();
      if (medicoSeleccionado?.id_medico === medico.id_medico) {
        setMedicoSeleccionado(null);
      }
      setMensajeMedico("Médico firmante eliminado correctamente.");
    } catch (err) {
      console.error("Error eliminar médico:", err);
      setErrorMedico(
        "Se produjo un error al eliminar el médico firmante. Revisa la conexión."
      );
    } finally {
      setGuardandoMedico(false);
    }
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
              <PenTool className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Firma Digital del Centro
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando estilos, firmantes y reglas para tus documentos...
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
            No tienes permisos para acceder a la configuración de firma digital
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
                placeholder="Buscar opciones dentro de la firma digital..."
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
              <span className="animate-wave inline-block">✍️</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Diseña, configura y prueba la firma digital que verán tus médicos y
              documentos clínicos en este centro.
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
                  cargarConfiguracionFirma();
                  cargarMedicosFirmantes();
                }}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.secundario} rounded-xl font-semibold text-sm ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                disabled={loadingConfig}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingConfig ? "animate-spin" : ""}`}
                />
                Recargar configuración
              </button>
              <button
                onClick={guardarConfiguracionFirma}
                className={`flex items-center gap-2 px-5 py-3 ${tema.colores.primario} text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={!hayCambios || guardandoConfig}
              >
                <Save className="w-4 h-4" />
                {guardandoConfig
                  ? "Guardando cambios..."
                  : "Guardar configuración de firma"}
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
        {(mensajeConfig || errorConfig || mensajeMedico || errorMedico) && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 flex flex-col gap-2 ${
              errorConfig || errorMedico
                ? "bg-red-500/10 border border-red-500/40"
                : "bg-emerald-500/10 border border-emerald-500/40"
            }`}
          >
            {(mensajeConfig || errorConfig) && (
              <div className="flex items-center gap-3">
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
            {(mensajeMedico || errorMedico) && (
              <div className="flex items-center gap-3">
                {mensajeMedico ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <p
                  className={`text-sm ${
                    mensajeMedico ? "text-emerald-100" : "text-red-100"
                  }`}
                >
                  {mensajeMedico || errorMedico}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <ResumenCard
            tema={tema}
            icono={ShieldCheck}
            titulo="Nivel de firma"
            valor={scoreFirma}
            chip={etiquetaNivelFirma}
            color="from-emerald-500 to-teal-500"
          />
          <ResumenCard
            tema={tema}
            icono={PenTool}
            titulo="Modo de firma"
            valor={configFirma?.modo_firma === "integrada_hsm" ? 3 : configFirma?.modo_firma === "avanzada" ? 2 : 1}
            chip={
              configFirma?.modo_firma === "integrada_hsm"
                ? "Integrada a HSM"
                : configFirma?.modo_firma === "avanzada"
                ? "Avanzada"
                : "Simple"
            }
            color="from-indigo-500 to-blue-500"
          />
          <ResumenCard
            tema={tema}
            icono={FileText}
            titulo="Bloque en PDF"
            valor={configFirma?.tamanio_bloque === "extendido" ? 3 : configFirma?.tamanio_bloque === "normal" ? 2 : 1}
            chip={`Ubicación: ${
              configFirma?.ubicacion_pdf
                ? configFirma.ubicacion_pdf.toUpperCase()
                : "N/A"
            }`}
            color="from-purple-500 to-pink-500"
          />
          <ResumenCard
            tema={tema}
            icono={Bell}
            titulo="Requisitos de firma"
            valor={
              (configFirma?.requiere_pin_tecnico ? 1 : 0) +
              (configFirma?.requiere_mfa_para_firmar ? 1 : 0)
            }
            chip="PIN / MFA"
            color="from-amber-500 to-yellow-500"
          />
          <ResumenCard
            tema={tema}
            icono={Activity}
            titulo="Firmantes activos"
            valor={totalFirmantesActivos}
            chip="Médicos configurados"
            color="from-cyan-500 to-sky-500"
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loadingConfig || !configFirma ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p
                className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
              >
                Cargando configuración de firma digital del centro...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Bloque 1: Config general + estilo + preview */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* Config general */}
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
                        Estado de la firma digital
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Controla si el centro puede firmar documentos
                        electrónicamente y cómo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configFirma.habilitada}
                      onChange={(e) =>
                        actualizarConfigFirma({ habilitada: e.target.checked })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Habilitar firma digital en este centro
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Si desmarcas esta opción, el centro no podrá firmar
                        documentos, pero se mantendrá el historial de firmas
                        existentes.
                      </p>
                    </div>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Modo de firma
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Define el tipo de mecanismo electrónico a utilizar.
                      </p>
                    </div>
                    <select
                      value={configFirma.modo_firma}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          modo_firma: e.target.value as ModoFirma,
                        })
                      }
                      className={`px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs`}
                    >
                      <option value="simple">Simple</option>
                      <option value="avanzada">Avanzada</option>
                      <option value="integrada_hsm">Integrada a HSM</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold">
                      Frase de firma
                    </label>
                    <textarea
                      value={configFirma.frase_firma}
                      onChange={(e) =>
                        actualizarConfigFirma({ frase_firma: e.target.value })
                      }
                      rows={2}
                      className={`w-full text-xs rounded-xl px-3 py-2 resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold">
                      Leyenda legal / nota al pie
                    </label>
                    <textarea
                      value={configFirma.leyenda_legal}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          leyenda_legal: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full text-xs rounded-xl px-3 py-2 resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-gray-600/40 mt-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Ubicación en PDF
                      </label>
                      <select
                        value={configFirma.ubicacion_pdf}
                        onChange={(e) =>
                          actualizarConfigFirma({
                            ubicacion_pdf: e.target.value as UbicacionPdf,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="pie">Pie del documento</option>
                        <option value="cabecera">Cabecera</option>
                        <option value="margen_derecho">Margen derecho</option>
                        <option value="margen_izquierdo">
                          Margen izquierdo
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Tamaño del bloque
                      </label>
                      <select
                        value={configFirma.tamanio_bloque}
                        onChange={(e) =>
                          actualizarConfigFirma({
                            tamanio_bloque: e.target.value as TamanioBloque,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="compacto">Compacto</option>
                        <option value="normal">Normal</option>
                        <option value="extendido">Extendido</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estilo visual */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Estilo y colores
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Ajusta la apariencia de la firma: fuente, tamaño y
                        colores.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Fuente de la firma
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Afecta solo al bloque de firma, no a todo el PDF.
                      </p>
                    </div>
                    <select
                      value={configFirma.estilo.fuente}
                      onChange={(e) =>
                        actualizarEstilo({ fuente: e.target.value })
                      }
                      className={`px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      {FUENTES_FIRMA.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Tamaño de texto
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={9}
                        max={24}
                        value={configFirma.estilo.tamano}
                        onChange={(e) =>
                          actualizarEstilo({
                            tamano: Number(e.target.value) || 9,
                          })
                        }
                        className={`w-20 px-2 py-1 rounded-lg text-right text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      />
                      <span className={tema.colores.textoSecundario}>pt</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-[11px] font-semibold mb-1 ${tema.colores.texto}`}
                      >
                        Color de texto
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={configFirma.estilo.color_texto}
                          onChange={(e) =>
                            actualizarEstilo({
                              color_texto: e.target.value,
                            })
                          }
                          className="w-10 h-8 rounded-md border border-black/20"
                        />
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          {configFirma.estilo.color_texto}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p
                        className={`text-[11px] font-semibold mb-1 ${tema.colores.texto}`}
                      >
                        Color resaltado / fondo
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={configFirma.estilo.color_resaltado}
                          onChange={(e) =>
                            actualizarEstilo({
                              color_resaltado: e.target.value,
                            })
                          }
                          className="w-10 h-8 rounded-md border border-black/20"
                        />
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          {configFirma.estilo.color_resaltado}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {PALETA_COLORES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          actualizarEstilo({
                            color_resaltado: c,
                          })
                        }
                        className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center"
                        style={{ backgroundColor: c }}
                      >
                        {configFirma.estilo.color_resaltado === c && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-gray-600/40 pt-3 mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Alineación del bloque
                      </p>
                      <select
                        value={configFirma.estilo.alineacion}
                        onChange={(e) =>
                          actualizarEstilo({
                            alineacion: e.target
                              .value as ConfigFirmaDigitalCentro["estilo"]["alineacion"],
                          })
                        }
                        className={`px-3 py-2 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="izquierda">Izquierda</option>
                        <option value="centro">Centro</option>
                        <option value="derecha">Derecha</option>
                      </select>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 accent-indigo-500"
                        checked={configFirma.estilo.mostrar_borde}
                        onChange={(e) =>
                          actualizarEstilo({
                            mostrar_borde: e.target.checked,
                          })
                        }
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${tema.colores.texto}`}
                        >
                          Mostrar borde externo
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          Resalta el bloque de firma separado del contenido del
                          documento.
                        </p>
                      </div>
                    </label>

                    {configFirma.estilo.mostrar_borde && (
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`text-xs font-semibold ${tema.colores.texto}`}
                        >
                          Grosor de borde
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={6}
                            value={configFirma.estilo.grosor_borde}
                            onChange={(e) =>
                              actualizarEstilo({
                                grosor_borde:
                                  Number(e.target.value) ||
                                  configFirma.estilo.grosor_borde,
                              })
                            }
                            className={`w-20 px-2 py-1 rounded-lg text-right text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          />
                          <span className={tema.colores.textoSecundario}>
                            px
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Vista previa en tiempo real
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Así se verá el bloque de firma en los documentos PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs md:text-sm">
                  <div
                    className={`rounded-xl p-4 bg-white/5 border border-white/10`}
                  >
                    <p
                      className={`text-[11px] uppercase tracking-wide font-semibold mb-2 ${tema.colores.textoSecundario}`}
                    >
                      Documento ejemplo
                    </p>
                    <div className="h-24 rounded-xl border border-dashed border-white/10 bg-black/10 flex items-center justify-center text-[11px] text-center text-white/60">
                      Contenido clínico / texto del documento (simulado).
                    </div>
                  </div>

                  <BloqueFirmaPreview
                    tema={tema}
                    config={configFirma}
                    medico={medicoSeleccionado}
                    usuario={usuario}
                  />
                </div>
              </div>
            </div>

            {/* Bloque 2: Médicos firmantes + reglas de firma */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              {/* Médicos (list + crud simple) */}
              <div
                className={`xl:col-span-2 rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Médicos y firmantes del centro
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Administra quién puede firmar documentos y cómo se
                        muestra su firma.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  {/* Tabla rápida */}
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="min-w-full text-xs">
                      <thead className="bg-black/20">
                        <tr className="text-[11px] uppercase tracking-wide text-white/70">
                          <th className="px-3 py-2 text-left">Iniciales</th>
                          <th className="px-3 py-2 text-left">Nombre</th>
                          <th className="px-3 py-2 text-left">RUT</th>
                          <th className="px-3 py-2 text-left">Especialidad</th>
                          <th className="px-3 py-2 text-center">Activo</th>
                          <th className="px-3 py-2 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicos.length === 0 ? (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-white/60"
                              colSpan={6}
                            >
                              Aún no hay médicos firmantes configurados para
                              este centro.
                            </td>
                          </tr>
                        ) : (
                          medicos.map((m) => (
                            <tr
                              key={m.id_medico}
                              className={`border-t border-white/10 hover:bg-white/5 cursor-pointer ${
                                medicoSeleccionado?.id_medico === m.id_medico
                                  ? "bg-indigo-500/10"
                                  : ""
                              }`}
                              onClick={() => setMedicoSeleccionado(m)}
                            >
                              <td className="px-3 py-2">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                                  style={{ backgroundColor: m.color_firma }}
                                >
                                  {m.iniciales}
                                </div>
                              </td>
                              <td className="px-3 py-2">{m.nombre_completo}</td>
                              <td className="px-3 py-2">{m.rut}</td>
                              <td className="px-3 py-2">{m.especialidad}</td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${
                                    m.activo
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                                >
                                  {m.activo ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cargarEnFormulario(m);
                                  }}
                                  className="text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEliminarMedico(m);
                                  }}
                                  className="text-[11px] px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-100"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Formulario médico */}
                  <form
                    onSubmit={handleGuardarMedico}
                    className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={formMedico.nombre_completo || ""}
                        onChange={(e) =>
                          setFormMedico((prev) => ({
                            ...prev,
                            nombre_completo: e.target.value,
                          }))
                        }
                        className={`w-full text-xs rounded-xl px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        placeholder="Ej: Dra. Ana Pérez Soto"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold">
                        RUT / Identificador
                      </label>
                      <input
                        type="text"
                        value={formMedico.rut || ""}
                        onChange={(e) =>
                          setFormMedico((prev) => ({
                            ...prev,
                            rut: e.target.value,
                          }))
                        }
                        className={`w-full text-xs rounded-xl px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        placeholder="Ej: 12.345.678-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        value={formMedico.especialidad || ""}
                        onChange={(e) =>
                          setFormMedico((prev) => ({
                            ...prev,
                            especialidad: e.target.value,
                          }))
                        }
                        className={`w-full text-xs rounded-xl px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        placeholder="Ej: Medicina Interna"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold">
                        Iniciales
                      </label>
                      <input
                        type="text"
                        value={formMedico.iniciales || ""}
                        onChange={(e) =>
                          setFormMedico((prev) => ({
                            ...prev,
                            iniciales: e.target.value.toUpperCase(),
                          }))
                        }
                        className={`w-full text-xs rounded-xl px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        maxLength={4}
                        placeholder="Ej: APS"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold">
                        Color de firma
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formMedico.color_firma || "#4f46e5"}
                          onChange={(e) =>
                            setFormMedico((prev) => ({
                              ...prev,
                              color_firma: e.target.value,
                            }))
                          }
                          className="w-10 h-8 rounded-md border border-black/20"
                        />
                        <span
                          className={`text-[11px] ${tema.colores.textoSecundario}`}
                        >
                          {formMedico.color_firma || "#4f46e5"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold">
                        Estado
                      </label>
                      <select
                        value={
                          formMedico.activo === false ? "inactivo" : "activo"
                        }
                        onChange={(e) =>
                          setFormMedico((prev) => ({
                            ...prev,
                            activo: e.target.value === "activo",
                          }))
                        }
                        className={`w-full text-xs rounded-xl px-3 py-2 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-dashed border-gray-600/40 mt-2">
                      <button
                        type="button"
                        onClick={limpiarFormMedico}
                        className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold ${tema.colores.hover} ${tema.colores.texto}`}
                      >
                        Limpiar formulario
                      </button>
                      <button
                        type="submit"
                        disabled={guardandoMedico}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <Save className="w-4 h-4" />
                        {guardandoMedico
                          ? "Guardando firmante..."
                          : editandoMedicoId
                          ? "Actualizar firmante"
                          : "Crear firmante"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Reglas de firma */}
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
                        Reglas de seguridad al firmar
                      </h3>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        Controla cómo, cuándo y desde dónde se permite firmar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs md:text-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configFirma.requiere_pin_tecnico}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          requiere_pin_tecnico: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Solicitar PIN del técnico al firmar
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Pide un PIN adicional antes de ejecutar la firma, útil
                        cuando el técnico comparte equipos.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-emerald-500"
                      checked={configFirma.requiere_mfa_para_firmar}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          requiere_mfa_para_firmar: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Requerir MFA específicamente para firmar
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Incluso si el usuario ya inició sesión, se solicitará
                        un segundo factor justo antes de la firma.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configFirma.habilitar_firma_en_movil}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          habilitar_firma_en_movil: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Permitir firma desde dispositivos móviles
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Habilita flujos desde tablet o smartphone, manteniendo
                        las reglas de seguridad definidas.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configFirma.permitir_firma_masiva}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          permitir_firma_masiva: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Permitir firma masiva de documentos
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Útil para firmar lotes de órdenes similares. Se
                        recomienda usarla solo con MFA activo.
                      </p>
                    </div>
                  </label>

                  {configFirma.permitir_firma_masiva && (
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={`text-xs font-semibold ${tema.colores.texto}`}
                      >
                        Máx. documentos por lote
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={configFirma.max_documentos_lote}
                          onChange={(e) =>
                            actualizarNumero(
                              "max_documentos_lote",
                              e.target.value,
                              { min: 1, max: 200 }
                            )
                          }
                          className={`w-24 px-2 py-1 rounded-lg text-right text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                        />
                        <span className={tema.colores.textoSecundario}>
                          docs
                        </span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 accent-indigo-500"
                      checked={configFirma.permitir_reasignar_firma}
                      onChange={(e) =>
                        actualizarConfigFirma({
                          permitir_reasignar_firma: e.target.checked,
                        })
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${tema.colores.texto}`}
                      >
                        Permitir reasignar médico firmante
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Solo se recomienda si hay un flujo claro de
                        supervisión (por ejemplo, residente → médico de turno →
                        jefe de servicio).
                      </p>
                    </div>
                  </label>

                  <div
                    className={`mt-2 rounded-xl p-3 bg-black/10 border border-white/10 text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Estas reglas aplican únicamente al{" "}
                    <span className={tema.colores.texto}>
                      centro técnico actual
                    </span>
                    . Las políticas globales del sistema (infraestructura,
                    certificados, etc.) siguen administradas a nivel comunal.
                  </div>
                </div>
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
                    firma digital de documentos del centro
                  </span>
                  . Aquí puedes ajustar visual, seguridad y firmantes sin
                  tocar la infraestructura de certificados ni otros centros.
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
                  onClick={guardarConfiguracionFirma}
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
                © 2025 AnyssaMed / INFOGES – Configuración de Firma Digital.
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                Módulo Centro · Firma Digital
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
// COMPONENTES AUXILIARES
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

function BloqueFirmaPreview({
  tema,
  config,
  medico,
  usuario,
}: {
  tema: ConfiguracionTema;
  config: ConfigFirmaDigitalCentro;
  medico: MedicoFirmante | null;
  usuario: UsuarioSesion;
}) {
  const alignClass =
    config.estilo.alineacion === "centro"
      ? "items-center text-center"
      : config.estilo.alineacion === "derecha"
      ? "items-end text-right"
      : "items-start text-left";

  const bordeStyle = config.estilo.mostrar_borde
    ? {
        borderWidth: config.estilo.grosor_borde,
        borderColor: "rgba(255,255,255,0.35)",
        borderStyle: "solid" as const,
      }
    : {
        borderWidth: 0,
      };

  const sizeClass =
    config.tamanio_bloque === "compacto"
      ? "py-2 px-3 text-[10px]"
      : config.tamanio_bloque === "extendido"
      ? "py-4 px-5 text-[12px]"
      : "py-3 px-4 text-[11px]";

  const medicoNombre = medico?.nombre_completo || "Médico / Profesional";
  const medicoRut = medico?.rut || "RUT / Identificador";
  const medicoEsp = medico?.especialidad || "Especialidad";
  const colorFirmante = medico?.color_firma || "#22c55e";

  return (
    <div className="space-y-3">
      <p
        className={`text-[11px] uppercase tracking-wide font-semibold ${tema.colores.textoSecundario}`}
      >
        Bloque de firma simulado
      </p>
      <div
        className={`rounded-2xl shadow-lg bg-black/40 ${sizeClass} flex flex-col gap-1`}
        style={{
          backgroundImage: `linear-gradient(to right, ${config.estilo.color_resaltado}, rgba(15,23,42,0.95))`,
          fontFamily: config.estilo.fuente,
          ...bordeStyle,
        }}
      >
        <div
          className={`flex ${alignClass} gap-3 w-full text-white/90 flex-wrap`}
        >
          {config.formato.mostrar_logo_centro &&
            usuario.tecnico?.centro?.logo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={usuario.tecnico.centro.logo_url}
                  alt="Logo centro"
                  width={40}
                  height={40}
                  className="rounded-md object-contain bg-white/10 p-1"
                />
              </div>
            )}

          <div className="flex flex-col gap-0.5 min-w-0">
            {config.formato.mostrar_firma_texto && (
              <p
                className="font-semibold"
                style={{ color: config.estilo.color_texto }}
              >
                {medicoNombre}
              </p>
            )}

            <div className="flex flex-wrap gap-1 text-[10px] text-white/80">
              {config.formato.mostrar_rut && <span>{medicoRut}</span>}
              {config.formato.mostrar_profesion && (
                <>
                  <span>•</span>
                  <span>{medicoEsp}</span>
                </>
              )}
              {config.formato.mostrar_registro_superintendencia && (
                <>
                  <span>•</span>
                  <span>Reg. Sup. Salud: XXXXX</span>
                </>
              )}
            </div>

            <p className="mt-1 text-[10px] text-white/80">
              {config.frase_firma}
            </p>

            {config.formato.incluir_sello_tiempo && (
              <p className="text-[9px] text-white/70 mt-1">
                Sello de tiempo: {new Date().toLocaleString("es-CL")}
              </p>
            )}

            {config.leyenda_legal && (
              <p className="mt-1 text-[9px] text-white/60">
                {config.leyenda_legal}
              </p>
            )}
          </div>

          {config.formato.mostrar_codigo_qr && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1">
              <div className="w-12 h-12 rounded-lg bg-white/90 flex items-center justify-center text-[8px] text-gray-700 font-bold">
                QR
              </div>
              <span className="text-[9px] text-white/70">Verificar</span>
            </div>
          )}
        </div>

        {config.formato.mostrar_firma_imagen && (
          <div
            className={`mt-2 flex ${alignClass} gap-2 text-white/80 text-[9px]`}
          >
            <div
              className="h-6 w-24 rounded-sm"
              style={{
                backgroundImage: `linear-gradient(90deg, transparent, ${colorFirmante}, transparent)`,
                opacity: 0.9,
              }}
            />
            <span>trazo de firma (simulado)</span>
          </div>
        )}
      </div>
    </div>
  );
}
