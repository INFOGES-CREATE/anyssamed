"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Shield,
  Calendar,
  Clock,
  Bell,
  Globe,
  Database,
  Server,
  Cpu,
  Activity,
  RefreshCw,
  Save,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Video,
  Sparkles,
  Code2,
  PieChart,
  HardDrive,
  History,
  KeySquare,
  Eye,
} from "lucide-react";

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
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
  };
}

interface ConfiguracionCentro {
  id_configuracion: number;
  id_centro: number;
  clave: string;
  valor: string;
  tipo_dato: "string" | "integer" | "float" | "boolean" | "json" | "datetime";
  descripcion?: string | null;
  grupo?: string | null;
  modificable_por_centro: 0 | 1;
}

interface HorarioAtencion {
  id_horario: number;
  id_centro: number;
  id_sucursal: number | null;
  dia_semana:
    | "lunes"
    | "martes"
    | "miercoles"
    | "jueves"
    | "viernes"
    | "sabado"
    | "domingo";
  hora_apertura: string;
  hora_cierre: string;
  es_festivo: 0 | 1;
  nota?: string | null;
}

interface PreferenciasUsuario {
  id_preferencia?: number;
  tema_color: TemaColor;
  modo_compacto: 0 | 1;
  animaciones_habilitadas: 0 | 1;
  vista_agenda_default: "dia" | "semana" | "mes" | "lista";
  mostrar_estadisticas: 0 | 1;
  mostrar_filtros_avanzados: 0 | 1;
  hora_inicio_jornada: string;
  hora_fin_jornada: string;
  duracion_cita_default: number;
  notificaciones_email: 0 | 1;
  notificaciones_push: 0 | 1;
  notificaciones_sms: 0 | 1;
  recordatorio_citas_minutos: number;
  idioma: string;
  zona_horaria: string;
  formato_fecha: string;
  formato_hora: string;
  mostrar_foto_perfil: 0 | 1;
  compartir_disponibilidad: 0 | 1;
  permitir_reserva_online: 0 | 1;
  auto_confirmar_citas: 0 | 1;
  enviar_recordatorios_automaticos: 0 | 1;
  bloquear_citas_mismo_horario: 0 | 1;
  permitir_overbooking: 0 | 1;
}

interface TelemedicinaConfig {
  id_configuracion: number;
  proveedor_servicio: string;
  tiempo_espera_minutos: number;
  recordatorio_minutos_antes: number;
  max_participantes: number;
  permite_compartir_pantalla: 0 | 1;
  permite_chat: 0 | 1;
  permite_grabacion: 0 | 1;
  activo: 0 | 1;
}

interface IAConfig {
  id_configuracion: number;
  tipo_configuracion: string;
  nombre: string;
  valor: string;
  descripcion?: string | null;
  nivel_acceso: "centro" | "departamento" | "usuario";
  activo: 0 | 1;
}

interface SistemaConfig {
  id_configuracion: number;
  clave: string;
  valor: string;
  tipo_dato: string;
  categoria: string;
  nivel: string;
  visible: 0 | 1;
  editable: 0 | 1;
  es_sensible: 0 | 1;
  descripcion?: string | null;
}

interface PoliticaSeguridad {
  id_politica: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  nivel_aplicacion: string;
  estado: string;
  obligatoria: 0 | 1;
  prioridad: number;
}

interface CopiaSeguridad {
  id_copia: number;
  fecha_hora: string;
  nombre_archivo: string;
  tipo: string;
  estado: string;
}

interface APIConfig {
  id_api: number;
  nombre: string;
  url_base: string;
  version: string;
  estado: string;
  tipo_autenticacion: string;
  requiere_oauth: 0 | 1;
}

interface BIConfig {
  id_configuracion: number;
  tipo: string;
  clave: string;
  valor: string;
  nivel_acceso: string;
  activo: 0 | 1;
}

interface SesionUsuario {
  id_sesion: string;
  fecha_inicio: string;
  fecha_ultima_actividad: string;
  ip_origen: string;
  dispositivo: string | null;
  navegador: string | null;
  estado: string;
}

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
    nombre: "Azul Océano",
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
    nombre: "Púrpura Real",
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
    nombre: "Verde Médico",
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

export default function ConfiguracionPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Configuración");

  // sección activa
  const [seccionActiva, setSeccionActiva] = useState<
    | "perfil"
    | "centro"
    | "horarios"
    | "preferencias"
    | "notificaciones"
    | "telemedicina"
    | "ia"
    | "seguridad"
    | "apis"
    | "bi"
    | "copias"
    | "sesiones"
  >("preferencias");

  // estados de datos
  const [configCentro, setConfigCentro] = useState<ConfiguracionCentro[]>([]);
  const [horarios, setHorarios] = useState<HorarioAtencion[]>([]);
  const [prefUsuario, setPrefUsuario] = useState<PreferenciasUsuario | null>(null);
  const [telemedicina, setTelemedicina] = useState<TelemedicinaConfig[]>([]);
  const [iaConfigs, setIaConfigs] = useState<IAConfig[]>([]);
  const [sistemaConfigs, setSistemaConfigs] = useState<SistemaConfig[]>([]);
  const [politicas, setPoliticas] = useState<PoliticaSeguridad[]>([]);
  const [copias, setCopias] = useState<CopiaSeguridad[]>([]);
  const [apis, setApis] = useState<APIConfig[]>([]);
  const [biConfigs, setBiConfigs] = useState<BIConfig[]>([]);
  const [sesiones, setSesiones] = useState<SesionUsuario[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  // cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.usuario) {
          window.location.href = "/login";
          return;
        }

        // validar que sea médico
        const rolesUsuario: string[] = [];
        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
          );
        }
        if (Array.isArray(data.usuario.roles)) {
          data.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
              );
            }
          });
        }
        const tieneRolMedico = rolesUsuario.some((r) => r.includes("MEDICO"));
        if (!tieneRolMedico || !data.usuario.medico) {
          alert("Acceso denegado. Módulo de configuración solo para médicos.");
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
      } catch (e) {
        console.error("Error cargando usuario:", e);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  // cargar preferencias de tema del usuario
  useEffect(() => {
    const cargarTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.tema_color) {
          setTemaActual(data.tema_color);
          if (typeof window !== "undefined") localStorage.setItem("tema_medico", data.tema_color);
        } else {
          if (typeof window !== "undefined") {
            const t = localStorage.getItem("tema_medico") as TemaColor | null;
            if (t) setTemaActual(t);
          }
        }
      } catch (e) {
        // noop
      }
    };
    cargarTema();
  }, []);

  // aplicar al body
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // cargar datos de configuración
  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario?.medico?.id_centro_principal) return;
      try {
        setLoadingData(true);

        const idCentro = usuario.medico.id_centro_principal;
        const [
          resCentro,
          resHorarios,
          resPref,
          resTele,
          resIA,
          resSis,
          resPol,
          resCop,
          resApis,
          resBi,
          resSes,
        ] = await Promise.all([
          fetch(`/api/medico/configuracion/centro?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/horarios?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/preferencias?id_usuario=${usuario.id_usuario}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/telemedicina?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/ia?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/sistema?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/seguridad?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/copias?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/apis?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/bi?id_centro=${idCentro}`, {
            credentials: "include",
          }),
          fetch(`/api/medico/configuracion/sesiones?id_usuario=${usuario.id_usuario}`, {
            credentials: "include",
          }),
        ]);

        const [dCentro, dHorarios, dPref, dTele, dIA, dSis, dPol, dCop, dApis, dBi, dSes] =
          await Promise.all([
            resCentro.json().catch(() => ({ configuraciones: [] })),
            resHorarios.json().catch(() => ({ horarios: [] })),
            resPref.json().catch(() => ({ preferencias: null })),
            resTele.json().catch(() => ({ configuraciones: [] })),
            resIA.json().catch(() => ({ configuraciones: [] })),
            resSis.json().catch(() => ({ configuraciones: [] })),
            resPol.json().catch(() => ({ politicas: [] })),
            resCop.json().catch(() => ({ copias: [] })),
            resApis.json().catch(() => ({ apis: [] })),
            resBi.json().catch(() => ({ configuraciones: [] })),
            resSes.json().catch(() => ({ sesiones: [] })),
          ]);

        setConfigCentro(dCentro.configuraciones || []);
        setHorarios(dHorarios.horarios || []);
        if (dPref.preferencias) {
          setPrefUsuario(dPref.preferencias);
          if (dPref.preferencias.tema_color) {
            setTemaActual(dPref.preferencias.tema_color);
          }
        } else {
          // default
          setPrefUsuario({
            tema_color: temaActual,
            modo_compacto: 0,
            animaciones_habilitadas: 1,
            vista_agenda_default: "dia",
            mostrar_estadisticas: 1,
            mostrar_filtros_avanzados: 0,
            hora_inicio_jornada: "08:00:00",
            hora_fin_jornada: "18:00:00",
            duracion_cita_default: 30,
            notificaciones_email: 1,
            notificaciones_push: 1,
            notificaciones_sms: 0,
            recordatorio_citas_minutos: 60,
            idioma: "es",
            zona_horaria: "America/Santiago",
            formato_fecha: "DD/MM/YYYY",
            formato_hora: "24h",
            mostrar_foto_perfil: 1,
            compartir_disponibilidad: 1,
            permitir_reserva_online: 1,
            auto_confirmar_citas: 0,
            enviar_recordatorios_automaticos: 1,
            bloquear_citas_mismo_horario: 1,
            permitir_overbooking: 0,
          });
        }
        setTelemedicina(dTele.configuraciones || []);
        setIaConfigs(dIA.configuraciones || []);
        setSistemaConfigs(dSis.configuraciones || []);
        setPoliticas(dPol.politicas || []);
        setCopias(dCop.copias || []);
        setApis(dApis.apis || []);
        setBiConfigs(dBi.configuraciones || []);
        setSesiones(dSes.sesiones || []);
      } catch (e) {
        console.error("Error cargando configuración:", e);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, [usuario, temaActual]);

  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
    if (prefUsuario) {
      setPrefUsuario({ ...prefUsuario, tema_color: nuevo });
    }
    if (typeof window !== "undefined") localStorage.setItem("tema_medico", nuevo);
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevo }),
      });
    } catch (e) {
      console.error("No se pudo guardar el tema");
    }
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const guardarSeccion = async () => {
    if (!usuario) return;
    setGuardando(true);
    setMensajeGuardado(null);
    try {
      let url = "/api/medico/configuracion/guardar";
      let payload: any = { seccion: seccionActiva };

      switch (seccionActiva) {
        case "preferencias":
          payload.datos = prefUsuario;
          url = "/api/medico/configuracion/preferencias";
          break;
        case "centro":
          payload.datos = configCentro;
          url = "/api/medico/configuracion/centro";
          break;
        case "horarios":
          payload.datos = horarios;
          url = "/api/medico/configuracion/horarios";
          break;
        case "telemedicina":
          payload.datos = telemedicina;
          url = "/api/medico/configuracion/telemedicina";
          break;
        case "ia":
          payload.datos = iaConfigs;
          url = "/api/medico/configuracion/ia";
          break;
        case "seguridad":
          payload.datos = { sistema: sistemaConfigs, politicas };
          url = "/api/medico/configuracion/seguridad";
          break;
        case "apis":
          payload.datos = apis;
          url = "/api/medico/configuracion/apis";
          break;
        case "bi":
          payload.datos = biConfigs;
          url = "/api/medico/configuracion/bi";
          break;
        default:
          payload.datos = {};
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMensajeGuardado("Cambios guardados correctamente.");
      } else {
        setMensajeGuardado("No se pudo guardar. Revisa los campos.");
      }
    } catch (e) {
      console.error("Error guardando:", e);
      setMensajeGuardado("Error al guardar. Intenta nuevamente.");
    } finally {
      setGuardando(false);
      setTimeout(() => setMensajeGuardado(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute inset-2 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center animate-pulse`}
            >
              <Settings className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-3xl font-black mb-2 ${tema.colores.texto}`}>Cargando configuración</h2>
          <p className={tema.colores.textoSecundario}>Preparando panel de ajustes del centro médico...</p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div
          className={`max-w-md w-full mx-auto rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
        >
          <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>Acceso no autorizado</h2>
          <p className={tema.colores.textoSecundario}>
            No tienes permisos para ver el módulo de configuración
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold`}
          >
            <LogOut className="w-4 h-4" />
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const menuLateral = [
    { id: "preferencias", nombre: "Mis preferencias", icono: Settings },
    { id: "centro", nombre: "Configuración del centro", icono: Database },
    { id: "horarios", nombre: "Horarios de atención", icono: Calendar },
    { id: "notificaciones", nombre: "Notificaciones", icono: Bell },
    { id: "telemedicina", nombre: "Telemedicina", icono: Video },
    { id: "ia", nombre: "IA & asistentes", icono: Sparkles },
    { id: "apis", nombre: "APIs e integraciones", icono: Code2 },
    { id: "bi", nombre: "BI y analítica", icono: PieChart },
    { id: "seguridad", nombre: "Seguridad y políticas", icono: Shield },
    { id: "copias", nombre: "Copias de seguridad", icono: HardDrive },
    { id: "sesiones", nombre: "Sesiones activas", icono: History },
  ] as const;

  const toggleHorario = (id: number, campo: keyof HorarioAtencion, valor: any) => {
    setHorarios((prev) =>
      prev.map((h) => (h.id_horario === id ? { ...h, [campo]: valor } : h))
    );
  };

  const togglePref = (campo: keyof PreferenciasUsuario, valor: any) => {
    if (!prefUsuario) return;
    setPrefUsuario({ ...prefUsuario, [campo]: valor });
    if (campo === "tema_color") {
      cambiarTema(valor as TemaColor);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} transition-all duration-500`}>
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>Configuración</h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>
                    Panel de control médico
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <Settings className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto((p) => !p)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-colors`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                  sidebarAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
            <Link
              href="/medico"
              className={`flex items-center gap-3 px-4 py-3 mb-4 rounded-xl ${tema.colores.hover} ${tema.colores.texto}`}
            >
              <Globe className="w-4 h-4" />
              {sidebarAbierto && <span>Volver al dashboard</span>}
            </Link>
            {menuLateral.map((item) => {
              const activo = seccionActiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSeccionActiva(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 mb-2 ${
                    activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icono
                      className={`w-5 h-5 ${
                        activo ? "text-white" : tema.colores.acento
                      } flex-shrink-0`}
                    />
                    {sidebarAbierto && <span>{item.nombre}</span>}
                  </div>
                  {sidebarAbierto && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${activo ? "translate-x-1" : ""}`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      width={48}
                      height={48}
                      alt={usuario.nombre}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
              >
                {usuario.foto_perfil_url ? (
                  <Image
                    src={usuario.foto_perfil_url}
                    width={48}
                    height={48}
                    alt={usuario.nombre}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4 gap-4">
          <div>
            <h2 className={`text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}>
              {obtenerSaludo()}, Dr. {usuario.nombre}
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300">
                Configuración
              </span>
            </h2>
            <p className={tema.colores.textoSecundario}>
              Ajusta tus preferencias, las del centro y la seguridad del sistema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // recargar datos
                if (!usuario?.medico?.id_centro_principal) return;
                setLoadingData(true);
                fetch(
                  `/api/medico/configuracion/centro?id_centro=${usuario.medico.id_centro_principal}`,
                  { credentials: "include" }
                )
                  .then((r) => r.json())
                  .then((d) => setConfigCentro(d.configuraciones || []))
                  .finally(() => setLoadingData(false));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
              Recargar
            </button>
            <button
              onClick={guardarSeccion}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.primario} text-white font-bold`}
              disabled={guardando}
            >
              <Save className="w-4 h-4" />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>

            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Médico</p>
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
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/30">
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
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        Dr. {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}>
                        {usuario.medico.especialidades[0]?.nombre || "Médico"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/medico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
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
      <main className={`${sidebarAbierto ? "ml-72" : "ml-20"} pt-28 p-6 transition-all duration-300`}>
        {mensajeGuardado && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl flex items-center gap-3 ${
              mensajeGuardado.includes("Error") || mensajeGuardado.includes("No se pudo")
                ? "bg-red-500/10 text-red-200 border border-red-500/30"
                : "bg-emerald-500/10 text-emerald-100 border border-emerald-500/30"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{mensajeGuardado}</p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          {/* CONTENIDO PRINCIPAL */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {/* PREFERENCIAS USUARIO */}
            {seccionActiva === "preferencias" && prefUsuario && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>Mis preferencias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* apariencia */}
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Apariencia</h4>
                    <div className="space-y-2">
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Tema de colores</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(TEMAS).map(([key, t]) => (
                          <button
                            key={key}
                            onClick={() => togglePref("tema_color", key)}
                            className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                              prefUsuario.tema_color === key
                                ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                                : `${tema.colores.card}`
                            }`}
                          >
                            <t.icono className="w-4 h-4" />
                            <span>{t.nombre}</span>
                          </button>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 mt-3 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prefUsuario.modo_compacto === 1}
                          onChange={(e) => togglePref("modo_compacto", e.target.checked ? 1 : 0)}
                        />
                        <span className={tema.colores.textoSecundario}>Modo compacto</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prefUsuario.animaciones_habilitadas === 1}
                          onChange={(e) =>
                            togglePref("animaciones_habilitadas", e.target.checked ? 1 : 0)
                          }
                        />
                        <span className={tema.colores.textoSecundario}>Animaciones habilitadas</span>
                      </label>
                    </div>
                  </div>

                  {/* agenda */}
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Agenda</h4>
                    <label className="block text-xs mb-1">Vista por defecto</label>
                    <select
                      value={prefUsuario.vista_agenda_default}
                      onChange={(e) =>
                        togglePref("vista_agenda_default", e.target.value as any)
                      }
                      className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm`}
                    >
                      <option value="dia">Día</option>
                      <option value="semana">Semana</option>
                      <option value="mes">Mes</option>
                      <option value="lista">Lista</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <label className="block text-xs mb-1">Inicio jornada</label>
                        <input
                          type="time"
                          value={prefUsuario.hora_inicio_jornada}
                          onChange={(e) => togglePref("hora_inicio_jornada", e.target.value)}
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Fin jornada</label>
                        <input
                          type="time"
                          value={prefUsuario.hora_fin_jornada}
                          onChange={(e) => togglePref("hora_fin_jornada", e.target.value)}
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm`}
                        />
                      </div>
                    </div>
                    <label className="block text-xs mt-3 mb-1">Duración cita (min)</label>
                    <input
                      type="number"
                      min={5}
                      value={prefUsuario.duracion_cita_default}
                      onChange={(e) =>
                        togglePref("duracion_cita_default", parseInt(e.target.value || "30", 10))
                      }
                      className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm`}
                    />
                    <label className="flex items-center gap-2 mt-3 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.mostrar_estadisticas === 1}
                        onChange={(e) => togglePref("mostrar_estadisticas", e.target.checked ? 1 : 0)}
                      />
                      <span className={tema.colores.textoSecundario}>
                        Mostrar estadísticas en agenda
                      </span>
                    </label>
                  </div>

                  {/* notificaciones */}
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Notificaciones</h4>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.notificaciones_email === 1}
                        onChange={(e) =>
                          togglePref("notificaciones_email", e.target.checked ? 1 : 0)
                        }
                      />
                      <span className={tema.colores.textoSecundario}>Email</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.notificaciones_push === 1}
                        onChange={(e) => togglePref("notificaciones_push", e.target.checked ? 1 : 0)}
                      />
                      <span className={tema.colores.textoSecundario}>Push</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.notificaciones_sms === 1}
                        onChange={(e) => togglePref("notificaciones_sms", e.target.checked ? 1 : 0)}
                      />
                      <span className={tema.colores.textoSecundario}>SMS</span>
                    </label>
                    <label className="block text-xs mt-3 mb-1">
                      Recordatorio de citas (min antes)
                    </label>
                    <input
                      type="number"
                      value={prefUsuario.recordatorio_citas_minutos}
                      onChange={(e) =>
                        togglePref("recordatorio_citas_minutos", parseInt(e.target.value || "60", 10))
                      }
                      className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm`}
                    />
                  </div>

                  {/* idioma / privacidad */}
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Idioma & privacidad</h4>
                    <label className="block text-xs mb-1">Idioma</label>
                    <select
                      value={prefUsuario.idioma}
                      onChange={(e) => togglePref("idioma", e.target.value)}
                      className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm mb-2`}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                    <label className="block text-xs mb-1">Zona horaria</label>
                    <input
                      type="text"
                      value={prefUsuario.zona_horaria}
                      onChange={(e) => togglePref("zona_horaria", e.target.value)}
                      className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm mb-2`}
                    />
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.mostrar_foto_perfil === 1}
                        onChange={(e) =>
                          togglePref("mostrar_foto_perfil", e.target.checked ? 1 : 0)
                        }
                      />
                      <span className={tema.colores.textoSecundario}>Mostrar foto de perfil</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={prefUsuario.compartir_disponibilidad === 1}
                        onChange={(e) =>
                          togglePref("compartir_disponibilidad", e.target.checked ? 1 : 0)
                        }
                      />
                      <span className={tema.colores.textoSecundario}>
                        Compartir disponibilidad con el centro
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={prefUsuario.permitir_reserva_online === 1}
                        onChange={(e) =>
                          togglePref("permitir_reserva_online", e.target.checked ? 1 : 0)
                        }
                      />
                      <span className={tema.colores.textoSecundario}>Permitir reserva online</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIGURACIÓN CENTRO */}
            {seccionActiva === "centro" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>
                  Configuraciones del centro
                </h3>
                {loadingData ? (
                  <p className={tema.colores.textoSecundario}>Cargando configuraciones...</p>
                ) : configCentro.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>No hay configuraciones</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {configCentro.map((c) => (
                      <div key={c.id_configuracion} className={`rounded-xl p-4 ${tema.colores.hover}`}>
                        <p className={`text-xs font-semibold mb-1 ${tema.colores.texto}`}>
                          {c.clave}
                        </p>
                        <p className={`text-[10px] mb-2 ${tema.colores.textoSecundario}`}>
                          {c.descripcion || "Sin descripción"}
                        </p>
                        {c.tipo_dato === "boolean" ? (
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={c.valor === "1" || c.valor === "true"}
                              onChange={(e) =>
                                setConfigCentro((prev) =>
                                  prev.map((x) =>
                                    x.id_configuracion === c.id_configuracion
                                      ? {
                                          ...x,
                                          valor: e.target.checked ? "1" : "0",
                                        }
                                      : x
                                  )
                                )
                              }
                              disabled={c.modificable_por_centro === 0}
                            />
                            <span>{c.modificable_por_centro === 0 ? "Solo lectura" : "Activo"}</span>
                          </label>
                        ) : (
                          <input
                            type="text"
                            value={c.valor}
                            onChange={(e) =>
                              setConfigCentro((prev) =>
                                prev.map((x) =>
                                  x.id_configuracion === c.id_configuracion
                                    ? { ...x, valor: e.target.value }
                                    : x
                                )
                              )
                            }
                            disabled={c.modificable_por_centro === 0}
                            className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm ${
                              c.modificable_por_centro === 0 ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          />
                        )}
                        <p className="text-[10px] mt-2 text-gray-400">
                          Grupo: {c.grupo || "general"} · Tipo: {c.tipo_dato}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HORARIOS */}
            {seccionActiva === "horarios" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>Horarios del centro</h3>
                {horarios.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>No hay horarios definidos.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {horarios.map((h) => (
                      <div key={h.id_horario} className={`rounded-xl p-4 ${tema.colores.hover}`}>
                        <p className={`text-sm font-semibold mb-2 ${tema.colores.texto}`}>
                          {h.dia_semana.toUpperCase()}
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-[10px] mb-1">Apertura</label>
                            <input
                              type="time"
                              value={h.hora_apertura}
                              onChange={(e) =>
                                toggleHorario(h.id_horario, "hora_apertura", e.target.value)
                              }
                              className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-2 py-1 text-sm`}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] mb-1">Cierre</label>
                            <input
                              type="time"
                              value={h.hora_cierre}
                              onChange={(e) =>
                                toggleHorario(h.id_horario, "hora_cierre", e.target.value)
                              }
                              className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-2 py-1 text-sm`}
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={h.es_festivo === 1}
                            onChange={(e) => toggleHorario(h.id_horario, "es_festivo", e.target.checked ? 1 : 0)}
                          />
                          <span>Festivo / cerrado</span>
                        </label>
                        <input
                          type="text"
                          value={h.nota || ""}
                          onChange={(e) => toggleHorario(h.id_horario, "nota", e.target.value)}
                          placeholder="Nota u observación"
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-2 py-1 text-xs mt-2`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICACIONES (desde tablas app_notificaciones / preferencias_usuarios) */}
            {seccionActiva === "notificaciones" && prefUsuario && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>Centro de notificaciones</h3>
                <p className={tema.colores.textoSecundario}>
                  Define cómo quieres que el sistema (citas, telemedicina, alertas, campañas) te hable.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Email</h4>
                    <p className={`text-xs mb-2 ${tema.colores.textoSecundario}`}>
                      Confirmaciones, recordatorios y resultados
                    </p>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.notificaciones_email === 1}
                        onChange={(e) =>
                          togglePref("notificaciones_email", e.target.checked ? 1 : 0)
                        }
                      />
                      <span>Activar correos</span>
                    </label>
                  </div>
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Push / App</h4>
                    <p className={`text-xs mb-2 ${tema.colores.textoSecundario}`}>
                      Para dispositivos móviles conectados
                    </p>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.notificaciones_push === 1}
                        onChange={(e) =>
                          togglePref("notificaciones_push", e.target.checked ? 1 : 0)
                        }
                      />
                      <span>Notificaciones push</span>
                    </label>
                  </div>
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>SMS / WhatsApp</h4>
                    <p className={`text-xs mb-2 ${tema.colores.textoSecundario}`}>
                      Solo para avisos urgentes
                    </p>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUsuario.notificaciones_sms === 1}
                        onChange={(e) =>
                          togglePref("notificaciones_sms", e.target.checked ? 1 : 0)
                        }
                      />
                      <span>Permitir SMS</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TELEMEDICINA */}
            {seccionActiva === "telemedicina" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>
                  Configuraciones de telemedicina
                </h3>
                {telemedicina.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>
                    No hay proveedores configurados. Agrega uno en el backend.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {telemedicina.map((t) => (
                      <div key={t.id_configuracion} className={`rounded-xl p-4 ${tema.colores.hover}`}>
                        <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                          {t.proveedor_servicio}
                        </p>
                        <p className={`text-[10px] mb-3 ${tema.colores.textoSecundario}`}>
                          Tiempo de espera: {t.tiempo_espera_minutos} min · Recordar:{" "}
                          {t.recordatorio_minutos_antes} min
                        </p>
                        <label className="block text-[10px] mb-1">Tiempo de espera (min)</label>
                        <input
                          type="number"
                          value={t.tiempo_espera_minutos}
                          onChange={(e) =>
                            setTelemedicina((prev) =>
                              prev.map((x) =>
                                x.id_configuracion === t.id_configuracion
                                  ? { ...x, tiempo_espera_minutos: parseInt(e.target.value || "15", 10) }
                                  : x
                              )
                            )
                          }
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-2 py-1 text-sm mb-2`}
                        />
                        <label className="block text-[10px] mb-1">Recordar antes (min)</label>
                        <input
                          type="number"
                          value={t.recordatorio_minutos_antes}
                          onChange={(e) =>
                            setTelemedicina((prev) =>
                              prev.map((x) =>
                                x.id_configuracion === t.id_configuracion
                                  ? {
                                      ...x,
                                      recordatorio_minutos_antes: parseInt(e.target.value || "10", 10),
                                    }
                                  : x
                              )
                            )
                          }
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-2 py-1 text-sm mb-2`}
                        />
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={t.permite_compartir_pantalla === 1}
                            onChange={(e) =>
                              setTelemedicina((prev) =>
                                prev.map((x) =>
                                  x.id_configuracion === t.id_configuracion
                                    ? {
                                        ...x,
                                        permite_compartir_pantalla: e.target.checked ? 1 : 0,
                                      }
                                    : x
                                )
                              )
                            }
                          />
                          <span>Permitir compartir pantalla</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={t.permite_chat === 1}
                            onChange={(e) =>
                              setTelemedicina((prev) =>
                                prev.map((x) =>
                                  x.id_configuracion === t.id_configuracion
                                    ? {
                                        ...x,
                                        permite_chat: e.target.checked ? 1 : 0,
                                      }
                                    : x
                                )
                              )
                            }
                          />
                          <span>Permitir chat</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={t.permite_grabacion === 1}
                            onChange={(e) =>
                              setTelemedicina((prev) =>
                                prev.map((x) =>
                                  x.id_configuracion === t.id_configuracion
                                    ? {
                                        ...x,
                                        permite_grabacion: e.target.checked ? 1 : 0,
                                      }
                                    : x
                                )
                              )
                            }
                          />
                          <span>Permitir grabación</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* IA */}
            {seccionActiva === "ia" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>
                  Configuraciones de IA / asistentes
                </h3>
                {iaConfigs.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>
                    No hay configuraciones de IA. Configura modelos en el backend.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {iaConfigs.map((ia) => (
                      <div key={ia.id_configuracion} className={`rounded-xl p-4 ${tema.colores.hover}`}>
                        <p className={`text-sm font-semibold ${tema.colores.texto}`}>{ia.nombre}</p>
                        <p className={`text-[10px] mb-3 ${tema.colores.textoSecundario}`}>
                          Tipo: {ia.tipo_configuracion} · Nivel: {ia.nivel_acceso}
                        </p>
                        <textarea
                          value={ia.valor}
                          onChange={(e) =>
                            setIaConfigs((prev) =>
                              prev.map((x) =>
                                x.id_configuracion === ia.id_configuracion
                                  ? { ...x, valor: e.target.value }
                                  : x
                              )
                            )
                          }
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-xs min-h-[80px]`}
                        />
                        <label className="flex items-center gap-2 text-xs cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={ia.activo === 1}
                            onChange={(e) =>
                              setIaConfigs((prev) =>
                                prev.map((x) =>
                                  x.id_configuracion === ia.id_configuracion
                                    ? { ...x, activo: e.target.checked ? 1 : 0 }
                                    : x
                                )
                              )
                            }
                          />
                          <span>Activo</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* APIs */}
            {seccionActiva === "apis" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>
                  APIs / Integraciones
                </h3>
                {apis.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>No hay APIs registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {apis.map((api) => (
                      <div
                        key={api.id_api}
                        className={`rounded-xl p-4 ${tema.colores.hover} flex items-center justify-between gap-3`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${tema.colores.texto}`}>{api.nombre}</p>
                          <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                            {api.url_base} · v{api.version}
                          </p>
                          <p className={`text-[10px] mt-1 ${tema.colores.textoSecundario}`}>
                            Auth: {api.tipo_autenticacion} · OAuth:{" "}
                            {api.requiere_oauth ? "sí" : "no"}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-lg ${
                            api.estado === "produccion"
                              ? "bg-emerald-500/10 text-emerald-200"
                              : "bg-yellow-500/10 text-yellow-200"
                          }`}
                        >
                          {api.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BI */}
            {seccionActiva === "bi" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>
                  Configuraciones BI / analítica
                </h3>
                {biConfigs.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>No hay parámetros de BI.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {biConfigs.map((b) => (
                      <div key={b.id_configuracion} className={`rounded-xl p-4 ${tema.colores.hover}`}>
                        <p className={`text-sm font-semibold ${tema.colores.texto}`}>{b.clave}</p>
                        <p className={`text-[10px] mb-2 ${tema.colores.textoSecundario}`}>
                          Tipo: {b.tipo} · Nivel: {b.nivel_acceso}
                        </p>
                        <input
                          type="text"
                          value={b.valor}
                          onChange={(e) =>
                            setBiConfigs((prev) =>
                              prev.map((x) =>
                                x.id_configuracion === b.id_configuracion
                                  ? { ...x, valor: e.target.value }
                                  : x
                              )
                            )
                          }
                          className={`w-full rounded-lg bg-transparent ${tema.colores.borde} border px-3 py-2 text-sm`}
                        />
                        <label className="flex items-center gap-2 text-xs cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={b.activo === 1}
                            onChange={(e) =>
                              setBiConfigs((prev) =>
                                prev.map((x) =>
                                  x.id_configuracion === b.id_configuracion
                                    ? { ...x, activo: e.target.checked ? 1 : 0 }
                                    : x
                                )
                              )
                            }
                          />
                          <span>Activo</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEGURIDAD */}
            {seccionActiva === "seguridad" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>
                  Seguridad y políticas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* políticas */}
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>
                      Políticas de seguridad
                    </h4>
                    {politicas.length === 0 ? (
                      <p className={tema.colores.textoSecundario}>No hay políticas definidas.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {politicas.map((p) => (
                          <div
                            key={p.id_politica}
                            className={`rounded-lg p-3 ${tema.colores.card} flex items-start justify-between gap-3`}
                          >
                            <div>
                              <p className={`text-xs font-semibold ${tema.colores.texto}`}>
                                {p.nombre}
                              </p>
                              <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                                {p.tipo} · {p.nivel_aplicacion}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] px-2 py-1 rounded-lg ${
                                p.estado === "activa"
                                  ? "bg-emerald-500/10 text-emerald-200"
                                  : "bg-gray-500/10 text-gray-200"
                              }`}
                            >
                              {p.estado}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* configs sensibles */}
                  <div className={`rounded-xl p-4 ${tema.colores.hover}`}>
                    <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>
                      Parámetros sensibles
                    </h4>
                    {sistemaConfigs.filter((c) => c.es_sensible === 1).length === 0 ? (
                      <p className={tema.colores.textoSecundario}>
                        No hay parámetros sensibles visibles.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {sistemaConfigs
                          .filter((c) => c.es_sensible === 1)
                          .map((s) => (
                            <div
                              key={s.id_configuracion}
                              className={`rounded-lg p-3 ${tema.colores.card} flex items-center justify-between gap-3`}
                            >
                              <div>
                                <p className={`text-xs font-semibold ${tema.colores.texto}`}>
                                  {s.clave}
                                </p>
                                <p className="text-[10px] text-red-300">Dato sensible</p>
                              </div>
                              <Eye className="w-4 h-4 text-red-200/60" />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* COPIAS */}
            {seccionActiva === "copias" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>Copias de seguridad</h3>
                {copias.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>No hay copias registradas.</p>
                ) : (
                  <div className="space-y-2">
                    {copias.map((c) => (
                      <div
                        key={c.id_copia}
                        className={`rounded-xl p-3 ${tema.colores.hover} flex items-center justify-between gap-3`}
                      >
                        <div>
                          <p className={`text-xs font-semibold ${tema.colores.texto}`}>
                            {c.nombre_archivo}
                          </p>
                          <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                            {new Date(c.fecha_hora).toLocaleString("es-CL")} · {c.tipo}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-lg ${
                            c.estado === "completada"
                              ? "bg-emerald-500/10 text-emerald-200"
                              : "bg-yellow-500/10 text-yellow-200"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SESIONES */}
            {seccionActiva === "sesiones" && (
              <div
                className={`rounded-2xl p-5 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <h3 className={`text-xl font-bold mb-4 ${tema.colores.texto}`}>Sesiones activas</h3>
                {sesiones.length === 0 ? (
                  <p className={tema.colores.textoSecundario}>No hay sesiones activas.</p>
                ) : (
                  <div className="space-y-2">
                    {sesiones.map((s) => (
                      <div
                        key={s.id_sesion}
                        className={`rounded-xl p-3 ${tema.colores.hover} flex items-center justify-between gap-3`}
                      >
                        <div>
                          <p className={`text-xs font-semibold ${tema.colores.texto}`}>
                            {s.dispositivo || "Dispositivo desconocido"}
                          </p>
                          <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                            IP: {s.ip_origen} · {s.navegador || "Navegador"} · Última:{" "}
                            {new Date(s.fecha_ultima_actividad).toLocaleString("es-CL")}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-lg ${
                            s.estado === "activa"
                              ? "bg-emerald-500/10 text-emerald-200"
                              : "bg-gray-500/10 text-gray-200"
                          }`}
                        >
                          {s.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>
                Estado de la configuración
              </h4>
              <p className={`text-xs mb-3 ${tema.colores.textoSecundario}`}>
                Centro: {usuario.medico.centro_principal.nombre}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={tema.colores.textoSecundario}>Preferencias</span>
                  <span className="text-emerald-400 font-semibold">OK</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={tema.colores.textoSecundario}>Centro</span>
                  <span className="text-emerald-400 font-semibold">OK</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={tema.colores.textoSecundario}>Telemedicina</span>
                  <span className="text-amber-300 font-semibold">Revisar</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={tema.colores.textoSecundario}>Seguridad</span>
                  <span className="text-emerald-400 font-semibold">OK</span>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Temas rápidos</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                        : `${tema.colores.hover}`
                    }`}
                  >
                    <t.icono className="w-4 h-4" />
                    <span>{t.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Seguridad</h4>
              <p className={`text-xs mb-3 ${tema.colores.textoSecundario}`}>
                Según tus políticas, algunas configuraciones pueden no ser editables.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl p-3 bg-emerald-500/10">
                  <p className="text-[10px] text-emerald-100">Nivel actual</p>
                  <p className="text-xs font-bold text-emerald-50">Alto</p>
                </div>
                <div className="flex-1 rounded-xl p-3 bg-indigo-500/10">
                  <p className="text-[10px] text-indigo-100">Sesiones</p>
                  <p className="text-xs font-bold text-indigo-50">{sesiones.length}</p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <h4 className={`text-sm font-semibold mb-3 ${tema.colores.texto}`}>Ayuda</h4>
              <p className={`text-xs mb-3 ${tema.colores.textoSecundario}`}>
                Para cambiar configuraciones de nivel sistema o políticas obligatorias, habla con el
                administrador.
              </p>
              <Link
                href="/ayuda"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.primario} text-white text-xs font-semibold`}
              >
                Ir a ayuda
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <footer
          className={`mt-6 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col md:flex-row items-center justify-between gap-4`}
        >
          <p className={tema.colores.textoSecundario}>
            © {new Date().getFullYear()} AnyssaMed · Módulo de configuración
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacidad"
              className={`text-xs font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className={`text-xs font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Términos
            </Link>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }
      `}</style>
    </div>
  );
}
