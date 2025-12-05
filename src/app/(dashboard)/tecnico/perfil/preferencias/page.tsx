"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Lightbulb,
  LogOut,
  MessageSquare,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  Users,
  X,
  HeartPulse,
  Wifi,
  MapPin,
  Globe,
  Activity,
  Clock,
  Laptop,
} from "lucide-react";

// ===============
// TIPOS
// ===============
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

interface CentroPrincipal {
  id_centro: number;
  nombre: string;
  plan: "basico" | "profesional" | "enterprise";
  logo_url: string | null;
  ciudad: string;
  region: string;
}

interface TecnicoSesionDatos {
  id_tecnico: number;
  id_usuario: number;
  id_centro?: number | null;
  id_sucursal?: number | null;
  id_departamento?: number | null;
  area_tecnica: string;
  tipo_tecnico:
    | "soporte"
    | "mantenimiento"
    | "ingenieria"
    | "biomedico"
    | "sistemas"
    | "infraestructura";
  turno: "manana" | "tarde" | "noche" | "completo";
  hora_inicio?: string | null;
  hora_fin?: string | null;
  descripcion?: string | null;
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
  extension_telefonica?: string | null;
  estado: "activo" | "inactivo" | "suspendido";
  disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
  prioridad: "baja" | "media" | "alta" | "critica";
  pais?: string | null;
  region?: string | null;
  zona_horaria?: string | null;
  pin_seguridad?: string | null;
  firma_digital?: string | null;
  tickets_resueltos: number;
  tiempo_promedio_resolucion: number; // en minutos
  calificacion_promedio: number;
  supervisor_id?: number | null;
  fecha_inicio: string;
  fecha_termino?: string | null;
  especialidad_tecnica?: string | null;
  certificaciones?: string | null;
}

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  telefono?: string;
  ciudad?: string;
  region?: string;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  centro_principal?: CentroPrincipal;
  tecnico?: TecnicoSesionDatos;
}

// Preferencias de centro / panel
interface PreferenciasCentro {
  permitir_telemedicina: boolean;
  confirmar_citas_doble_paso: boolean;
  duracion_cita_minutos: number;
  buffer_entre_citas_minutos: number;
  max_citas_diarias_por_medico: number;
  recordatorio_certificaciones_dias: number;
  modo_emergencia_activo: boolean;
}

interface PreferenciasNotificacionesCentro {
  email_director: boolean;
  email_jefe_tecnico: boolean;
  email_medicos_certificaciones: boolean;
  alertas_criticas_push: boolean;
  resumen_diario_email: boolean;
}

interface PreferenciasPanelTecnico {
  tema_color: TemaColor;
  idioma: string;
  mostrar_panel_resumen: boolean;
  mostrar_mapa_sucursales: boolean;
  mostrar_columnas_avanzadas: boolean;
  mostrar_alertas_en_portada: boolean;
}

interface MetricasPreferencias {
  modulosActivos: number;
  avisosCriticos: number;
  diasRecordatorio: number;
  cargaMaxima: number;
}

// endpoints sugeridos (ajusta a tu backend)
const ENDPOINTS = {
  preferencias: "/api/tecnico/preferencias",
};

// ===============
// TEMAS
// ===============
const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-white via-slate-50 to-blue-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/98 backdrop-blur-xl border-gray-200",
      header: "bg-white/95 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro Premium",
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
      sidebar: "bg-gray-900/98 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      card: "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800",
    },
  },
  blue: {
    nombre: "Azul Océano",
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
      sidebar: "bg-blue-900/98 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
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
      sidebar: "bg-purple-900/98 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      card: "bg-purple-800/50 border-purple-700 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800",
    },
  },
  green: {
    nombre: "Verde Soporte",
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
      sidebar: "bg-emerald-900/98 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

// ===============
// MINI COMPONENTES
// ===============
const SkeletonLine = ({ tema }: { tema: ConfiguracionTema }) => (
  <div className={`h-3 rounded-full bg-white/5 ${tema.colores.hover} animate-pulse`}></div>
);

const MobileBottomBar = ({ tema, actual }: { tema: ConfiguracionTema; actual: string }) => {
  const items = [
    { label: "Inicio", icon: Home, href: "/tecnico" },
    { label: "Tickets", icon: ClipboardList, href: "/tecnico/tickets" },
    { label: "Perfil", icon: User, href: "/tecnico/perfil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-black/40 backdrop-blur-md border-t border-white/5">
      {items.map((item) => {
        const active = item.href === actual;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs ${
              active
                ? `text-white bg-gradient-to-t ${tema.colores.gradiente}`
                : tema.colores.textoSecundario
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

const Estadistica = ({
  icon: Icon,
  label,
  value,
  tema,
  secondary,
}: {
  icon: any;
  label: string;
  value: string;
  tema: ConfiguracionTema;
  secondary?: string;
}) => (
  <div
    className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all hover:scale-[1.01]`}
  >
    <div className="flex items-center gap-3 mb-2">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} text-white flex items-center justify-center`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className={`text-sm ${tema.colores.textoSecundario}`}>{label}</p>
    </div>
    <p className={`text-2xl font-black ${tema.colores.texto}`}>{value}</p>
    {secondary ? <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>{secondary}</p> : null}
  </div>
);

// ===============
// PAGE
// ===============
export default function PreferenciasCentroPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const [cargandoPreferencias, setCargandoPreferencias] = useState(true);

  const [seccionActiva, setSeccionActiva] = useState<"centro" | "notificaciones" | "panel">(
    "centro"
  );

  const [prefCentro, setPrefCentro] = useState<PreferenciasCentro>({
    permitir_telemedicina: true,
    confirmar_citas_doble_paso: true,
    duracion_cita_minutos: 20,
    buffer_entre_citas_minutos: 5,
    max_citas_diarias_por_medico: 32,
    recordatorio_certificaciones_dias: 30,
    modo_emergencia_activo: false,
  });

  const [prefNotificaciones, setPrefNotificaciones] = useState<PreferenciasNotificacionesCentro>({
    email_director: true,
    email_jefe_tecnico: true,
    email_medicos_certificaciones: true,
    alertas_criticas_push: true,
    resumen_diario_email: true,
  });

  const [prefPanel, setPrefPanel] = useState<PreferenciasPanelTecnico>({
    tema_color: "light",
    idioma: "es-CL",
    mostrar_panel_resumen: true,
    mostrar_mapa_sucursales: false,
    mostrar_columnas_avanzadas: true,
    mostrar_alertas_en_portada: true,
  });

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const centroPrincipal: CentroPrincipal | null = usuario?.centro_principal || null;
  const [estadisticas] = useState<any | null>(null); // sólo para SidebarTecnico

  const menuItems = [
    { titulo: "Inicio", url: "/tecnico", icono: Home, activo: false },
    { titulo: "Tickets", url: "/tecnico/tickets", icono: ClipboardList, activo: false },
    { titulo: "Perfil", url: "/tecnico/perfil", icono: User, activo: true },
    { titulo: "Configuración", url: "/tecnico/configuracion", icono: Settings, activo: false },
  ];

  const metricas: MetricasPreferencias | null = useMemo(() => {
    const modulosActivos =
      (prefCentro.permitir_telemedicina ? 1 : 0) +
      (prefCentro.confirmar_citas_doble_paso ? 1 : 0) +
      (prefCentro.modo_emergencia_activo ? 1 : 0) +
      (prefPanel.mostrar_mapa_sucursales ? 1 : 0) +
      (prefPanel.mostrar_panel_resumen ? 1 : 0);

    const avisosCriticos =
      (prefNotificaciones.alertas_criticas_push ? 1 : 0) +
      (prefNotificaciones.email_medicos_certificaciones ? 1 : 0);

    return {
      modulosActivos,
      avisosCriticos,
      diasRecordatorio: prefCentro.recordatorio_certificaciones_dias,
      cargaMaxima: prefCentro.max_citas_diarias_por_medico,
    };
  }, [prefCentro, prefPanel, prefNotificaciones]);

  // =============== cargar sesión
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error("No hay sesión");
        const data = await res.json();

        if (data.success && data.usuario) {
          const u = data.usuario as UsuarioSesion;
          setUsuario(u);
        } else {
          window.location.href = "/login";
        }
      } catch (e) {
        console.error(e);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // =============== cargar tema
  useEffect(() => {
    const cargarTema = async () => {
      try {
        const local = localStorage.getItem("tema_usuario");
        if (local && local in TEMAS) {
          setTemaActual(local as TemaColor);
          setPrefPanel((p) => ({ ...p, tema_color: local as TemaColor }));
        }
        const res = await fetch("/api/users/preferencias/tema", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tema_color && data.tema_color in TEMAS) {
            setTemaActual(data.tema_color as TemaColor);
            setPrefPanel((p) => ({ ...p, tema_color: data.tema_color as TemaColor }));
            localStorage.setItem("tema_usuario", data.tema_color);
          }
        }
      } catch {
        /* ignore */
      }
    };
    cargarTema();
  }, []);

  // =============== aplicar tema al body
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // =============== cargar preferencias
  useEffect(() => {
    const cargarPreferencias = async () => {
      setCargandoPreferencias(true);
      try {
        const res = await fetch(ENDPOINTS.preferencias, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.centro) {
              setPrefCentro((prev) => ({
                ...prev,
                ...data.centro,
              }));
            }
            if (data.notificaciones) {
              setPrefNotificaciones((prev) => ({
                ...prev,
                ...data.notificaciones,
              }));
            }
            if (data.panel) {
              setPrefPanel((prev) => ({
                ...prev,
                ...data.panel,
              }));
              if (data.panel.tema_color && data.panel.tema_color in TEMAS) {
                setTemaActual(data.panel.tema_color as TemaColor);
                localStorage.setItem("tema_usuario", data.panel.tema_color);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargandoPreferencias(false);
      }
    };

    cargarPreferencias();
  }, []);

  // =============== helpers
  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
    setPrefPanel((prev) => ({ ...prev, tema_color: nuevo }));
    localStorage.setItem("tema_usuario", nuevo);
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema_color: nuevo }),
      });
    } catch {
      /* ignore */
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("tema_usuario");
      window.location.href = "/login";
    } catch {
      /* ignore */
    }
  };

  const guardarPreferencias = async () => {
    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);
    try {
      const res = await fetch(ENDPOINTS.preferencias, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centro: prefCentro,
          notificaciones: prefNotificaciones,
          panel: prefPanel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo guardar las preferencias");
      }
      setMensajeOk("Preferencias actualizadas correctamente ✅");
    } catch (e: any) {
      console.error(e);
      setMensajeError(e.message || "Error al guardar las preferencias");
    } finally {
      setGuardando(false);
    }
  };

  const nombreRol = usuario?.rol?.nombre || "Técnico";

  // =============== LOADING
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin"></div>
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
            >
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className={`${tema.colores.texto} text-lg font-semibold`}>
            Cargando preferencias del centro...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`p-8 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center max-w-md`}
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className={`text-xl font-bold mb-2 ${tema.colores.texto}`}>
            No se pudo cargar la sesión
          </p>
          <p className={tema.colores.textoSecundario}>Verifica tu sesión o tus permisos.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  // =============== RENDER
  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} pb-14 md:pb-0`}>
      {/* SIDEBAR DESKTOP */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* SIDEBAR MOBILE */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className={`w-72 h-full ${tema.colores.sidebar} ${tema.colores.borde} border-r p-6 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Laptop className={`w-7 h-7 ${tema.colores.acento}`} />
                <p className={`${tema.colores.texto} font-bold`}>Menú técnico</p>
              </div>
              <button onClick={() => setMobileSidebar(false)}>
                <X className={tema.colores.texto} />
              </button>
            </div>
            <div className="space-y-1">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    (item as any).activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                  onClick={() => setMobileSidebar(false)}
                >
                  <item.icono className="w-5 h-5" />
                  <span>{item.titulo}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileSidebar(false)} />
        </div>
      )}

      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "md:left-72" : "md:left-20"
        } left-0 ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-4 md:px-8 py-3 gap-4">
          <div className="md:hidden">
            <button
              onClick={() => setMobileSidebar(true)}
              className={`p-2 rounded-lg ${tema.colores.hover}`}
            >
              <ChevronRight className={`w-5 h-5 ${tema.colores.texto} rotate-180`} />
            </button>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar opciones de configuración..."
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* temas */}
            <div className="relative group">
              <button className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}>
                <Sparkles className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 space-y-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}
              >
                <p className={`text-sm font-black ${tema.colores.texto}`}>Temas</p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <t.icono className="w-4 h-4" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((p) => !p)}
                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} relative`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50`}
                >
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>Notificaciones</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <ShieldAlert className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Cambios pendientes de aplicar en preferencias del centro
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 10 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <MessageSquare className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nueva política de certificaciones disponible
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 1 h</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <BellOff className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Ajusta tus avisos si recibes demasiadas alertas
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 3 h</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((p) => !p)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${tema.colores.hover}`}
              >
                <div className="hidden md:block text-right">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>{usuario.nombre}</p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>{nombreRol}</p>
                </div>
                <div
                  className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} text-white flex items-center justify-center font-bold`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={36}
                      height={36}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre?.[0] || ""}${usuario.apellido_paterno?.[0] || ""}`
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${tema.colores.texto} ${
                    perfilAbierto ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50`}
                >
                  <Link
                    href="/tecnico/perfil"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                    onClick={() => setPerfilAbierto(false)}
                  >
                    <User className="w-4 h-4" />
                    Mi perfil técnico
                  </Link>
                  <Link
                    href="/tecnico/configuracion"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                    onClick={() => setPerfilAbierto(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Link>
                  <button
                    onClick={cerrarSesion}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "md:ml-72" : "md:ml-20"
        } pt-20 md:pt-24 px-4 md:px-8 space-y-6`}
      >
        {/* Title + acciones */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1
              className={`text-3xl md:text-4xl font-black ${tema.colores.texto} flex items-center gap-3`}
            >
              Preferencias del centro y panel
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                <ShieldCheck className="w-3 h-3" /> Configuración avanzada
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Define cómo funciona el centro, cómo se notifican las alertas y cómo se ve tu panel
              técnico.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarPreferencias}
              disabled={guardando}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.primario} text-white rounded-xl font-bold text-sm md:text-base ${
                guardando ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`} />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <Link
              href="/tecnico/perfil"
              className={`px-4 md:px-6 py-2.5 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold text-sm md:text-base`}
            >
              Volver al perfil
            </Link>
          </div>
        </div>

        {/* mensajes */}
        {mensajeOk && (
          <div className="bg-green-500/10 border border-green-500 text-green-200 px-4 py-3 rounded-xl flex items-center justify-between">
            <p className="text-sm font-semibold">{mensajeOk}</p>
            <button onClick={() => setMensajeOk(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {mensajeError && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center justify-between">
            <p className="text-sm font-semibold">{mensajeError}</p>
            <button onClick={() => setMensajeError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* quick actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSeccionActiva("centro")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <Users className="w-4 h-4" />
            Preferencias de centro
          </button>
          <button
            onClick={() => setSeccionActiva("notificaciones")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <Bell className="w-4 h-4" />
            Flujo de notificaciones
          </button>
          <button
            onClick={() => setSeccionActiva("panel")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <Settings className="w-4 h-4" />
            Panel técnico
          </button>
        </div>

        {/* estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cargandoPreferencias ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl ${tema.colores.card} border ${tema.colores.borde}`}
              >
                <SkeletonLine tema={tema} />
                <div className="mt-2 space-y-2">
                  <SkeletonLine tema={tema} />
                  <SkeletonLine tema={tema} />
                </div>
              </div>
            ))
          ) : (
            <>
              <Estadistica
                icon={Users}
                label="Módulos activos"
                value={metricas ? String(metricas.modulosActivos) : "0"}
                secondary="Telemedicina, paneles y modos habilitados"
                tema={tema}
              />
              <Estadistica
                icon={ShieldAlert}
                label="Avisos críticos"
                value={metricas ? String(metricas.avisosCriticos) : "0"}
                secondary="Mecanismos de alerta configurados"
                tema={tema}
              />
              <Estadistica
                icon={Clock}
                label="Recordatorio certificaciones"
                value={metricas ? `${metricas.diasRecordatorio} días` : "—"}
                secondary="Antes del vencimiento"
                tema={tema}
              />
              <Estadistica
                icon={ClipboardList}
                label="Carga máxima diaria"
                value={metricas ? `${metricas.cargaMaxima}` : "—"}
                secondary="Citas por médico permitidas"
                tema={tema}
              />
            </>
          )}
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* col izquierda */}
          <div className="xl:col-span-1 space-y-6">
            {/* resumen centro */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">Resumen del centro</p>
              <p className="text-2xl md:text-3xl font-black text-white mb-1">
                {centroPrincipal ? centroPrincipal.nombre : "Centro médico"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {centroPrincipal && (
                  <span className="text-white/80 text-xs flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {centroPrincipal.ciudad}, {centroPrincipal.region}
                  </span>
                )}
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Plan {centroPrincipal?.plan?.toUpperCase() || "STANDARD"}
                </span>
              </div>
              <p className="text-[13px] text-white/90 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Estas preferencias afectan a todo el flujo clínico del centro.
              </p>
            </div>

            {/* modo operación */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                Modo de operación del centro
              </p>
              <div className="space-y-3">
                <label
                  className={`flex items-start justify-between gap-3 px-3 py-3 rounded-xl ${tema.colores.secundario}`}
                >
                  <div>
                    <p className={tema.colores.texto}>Permitir telemedicina</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Habilita la opción de atención remota para los médicos del centro.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefCentro.permitir_telemedicina}
                    onChange={(e) =>
                      setPrefCentro((p) => ({
                        ...p,
                        permitir_telemedicina: e.target.checked,
                      }))
                    }
                  />
                </label>

                <label
                  className={`flex items-start justify-between gap-3 px-3 py-3 rounded-xl ${tema.colores.secundario}`}
                >
                  <div>
                    <p className={tema.colores.texto}>Confirmación de citas en dos pasos</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Requiere confirmación adicional para bloquear una hora de médico.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefCentro.confirmar_citas_doble_paso}
                    onChange={(e) =>
                      setPrefCentro((p) => ({
                        ...p,
                        confirmar_citas_doble_paso: e.target.checked,
                      }))
                    }
                  />
                </label>

                <label
                  className={`flex items-start justify-between gap-3 px-3 py-3 rounded-xl ${tema.colores.secundario}`}
                >
                  <div>
                    <p className={tema.colores.texto}>Modo emergencia del centro</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Ajusta el panel para priorizar urgencias y bloquea cambios sensibles.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefCentro.modo_emergencia_activo}
                    onChange={(e) =>
                      setPrefCentro((p) => ({
                        ...p,
                        modo_emergencia_activo: e.target.checked,
                      }))
                    }
                  />
                </label>
              </div>
            </div>

            {/* info idioma y panel */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>Idioma y panel</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={tema.colores.texto}>Idioma preferido</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Afecta textos y formatos de fecha.
                    </p>
                  </div>
                  <div className="relative">
                    <Globe
                      className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                    />
                    <select
                      value={prefPanel.idioma}
                      onChange={(e) =>
                        setPrefPanel((p) => ({
                          ...p,
                          idioma: e.target.value,
                        }))
                      }
                      className={`pl-8 pr-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="es-CL">Español (Chile)</option>
                      <option value="es-ES">Español (España)</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={tema.colores.texto}>Mostrar panel resumen</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Muestra indicadores rápidos al entrar al dashboard.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefPanel.mostrar_panel_resumen}
                    onChange={(e) =>
                      setPrefPanel((p) => ({
                        ...p,
                        mostrar_panel_resumen: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* col derecha: tabs */}
          <div className="xl:col-span-2 space-y-6">
            {/* tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "centro", label: "Preferencias de centro", icon: Users },
                { id: "notificaciones", label: "Notificaciones", icon: Bell },
                { id: "panel", label: "Panel técnico", icon: Settings },
              ].map((tab) => {
                const active = seccionActiva === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSeccionActiva(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* SECCIÓN CENTRO */}
            {seccionActiva === "centro" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Preferencias operativas del centro
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Ajusta los parámetros generales que afectan a todos los médicos y agendas.
                    </p>
                  </div>
                </div>

                {cargandoPreferencias ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Duración base de cita (min)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={prefCentro.duracion_cita_minutos}
                        onChange={(e) =>
                          setPrefCentro((p) => ({
                            ...p,
                            duracion_cita_minutos: Number(e.target.value || 0),
                          }))
                        }
                        className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      />
                      <p className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}>
                        Usado como duración por defecto al crear bloque de agenda.
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Buffer entre citas (min)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={prefCentro.buffer_entre_citas_minutos}
                        onChange={(e) =>
                          setPrefCentro((p) => ({
                            ...p,
                            buffer_entre_citas_minutos: Number(e.target.value || 0),
                          }))
                        }
                        className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      />
                      <p className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}>
                        Tiempo mínimo entre citas consecutivas.
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Máx. citas diarias por médico
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={80}
                        value={prefCentro.max_citas_diarias_por_medico}
                        onChange={(e) =>
                          setPrefCentro((p) => ({
                            ...p,
                            max_citas_diarias_por_medico: Number(e.target.value || 0),
                          }))
                        }
                        className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      />
                      <p className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}>
                        Controla la carga de trabajo máxima sugerida.
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Recordatorio de vencimiento de certificaciones (días)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={prefCentro.recordatorio_certificaciones_dias}
                        onChange={(e) =>
                          setPrefCentro((p) => ({
                            ...p,
                            recordatorio_certificaciones_dias: Number(e.target.value || 0),
                          }))
                        }
                        className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      />
                      <p className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}>
                        Se usará para generar alertas antes de que un certificado venza.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN NOTIFICACIONES */}
            {seccionActiva === "notificaciones" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Flujo de notificaciones
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Define quién recibe qué tipo de alertas en el centro.
                    </p>
                  </div>
                </div>

                {cargandoPreferencias ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                    >
                      <div>
                        <p className={tema.colores.texto}>Enviar correo al director del centro</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Para alertas críticas o cambios globales de configuración.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefNotificaciones.email_director}
                        onChange={(e) =>
                          setPrefNotificaciones((p) => ({
                            ...p,
                            email_director: e.target.checked,
                          }))
                        }
                      />
                    </label>
                    <label
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                    >
                      <div>
                        <p className={tema.colores.texto}>Enviar correo al jefe técnico</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Para cambios en flujos de tickets y soporte.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefNotificaciones.email_jefe_tecnico}
                        onChange={(e) =>
                          setPrefNotificaciones((p) => ({
                            ...p,
                            email_jefe_tecnico: e.target.checked,
                          }))
                        }
                      />
                    </label>
                    <label
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                    >
                      <div>
                        <p className={tema.colores.texto}>Avisar a médicos por certificaciones</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Correos automáticos ante vencimientos o requisitos nuevos.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefNotificaciones.email_medicos_certificaciones}
                        onChange={(e) =>
                          setPrefNotificaciones((p) => ({
                            ...p,
                            email_medicos_certificaciones: e.target.checked,
                          }))
                        }
                      />
                    </label>
                    <label
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                    >
                      <div>
                        <p className={tema.colores.texto}>Alertas push críticas</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Para incidentes que requieren reacción inmediata.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefNotificaciones.alertas_criticas_push}
                        onChange={(e) =>
                          setPrefNotificaciones((p) => ({
                            ...p,
                            alertas_criticas_push: e.target.checked,
                          }))
                        }
                      />
                    </label>
                    <label
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                    >
                      <div>
                        <p className={tema.colores.texto}>Resumen diario por correo</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Resumen de alertas y cambios del día.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefNotificaciones.resumen_diario_email}
                        onChange={(e) =>
                          setPrefNotificaciones((p) => ({
                            ...p,
                            resumen_diario_email: e.target.checked,
                          }))
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN PANEL */}
            {seccionActiva === "panel" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Preferencias del panel técnico
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Personaliza cómo ves la información y qué se muestra en tu dashboard.
                    </p>
                  </div>
                </div>

                {cargandoPreferencias ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label
                          className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Tema del panel
                        </label>
                        <select
                          value={prefPanel.tema_color}
                          onChange={(e) => cambiarTema(e.target.value as TemaColor)}
                          className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                        >
                          <option value="light">Claro profesional</option>
                          <option value="dark">Oscuro premium</option>
                          <option value="blue">Azul océano</option>
                          <option value="purple">Púrpura real</option>
                          <option value="green">Verde soporte</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                        >
                          Mostrar mapa de sucursales
                        </label>
                        <div className="flex items-center justify-between mt-1 px-4 py-3 rounded-xl gap-3 ${tema.colores.secundario}">
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Útil si el centro tiene múltiples ubicaciones activas.
                          </p>
                          <input
                            type="checkbox"
                            checked={prefPanel.mostrar_mapa_sucursales}
                            onChange={(e) =>
                              setPrefPanel((p) => ({
                                ...p,
                                mostrar_mapa_sucursales: e.target.checked,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                      Elementos visibles en el panel
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <span className={tema.colores.texto}>Mostrar panel resumen</span>
                        <input
                          type="checkbox"
                          checked={prefPanel.mostrar_panel_resumen}
                          onChange={(e) =>
                            setPrefPanel((p) => ({
                              ...p,
                              mostrar_panel_resumen: e.target.checked,
                            }))
                          }
                        />
                      </label>
                      <label
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <span className={tema.colores.texto}>Mostrar columnas avanzadas</span>
                        <input
                          type="checkbox"
                          checked={prefPanel.mostrar_columnas_avanzadas}
                          onChange={(e) =>
                            setPrefPanel((p) => ({
                              ...p,
                              mostrar_columnas_avanzadas: e.target.checked,
                            }))
                          }
                        />
                      </label>
                      <label
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <span className={tema.colores.texto}>
                          Mostrar alertas en portada del técnico
                        </span>
                        <input
                          type="checkbox"
                          checked={prefPanel.mostrar_alertas_en_portada}
                          onChange={(e) =>
                            setPrefPanel((p) => ({
                              ...p,
                              mostrar_alertas_en_portada: e.target.checked,
                            }))
                          }
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* footer */}
            <footer
              className={`transition-all duration-300 ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-6 rounded-2xl`}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={tema.colores.texto}>© 2025 AnyssaMed Platform</p>
                    <p className={tema.colores.textoSecundario}>
                      Módulo de preferencias del centro
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/tecnico/ayuda" className={tema.colores.textoSecundario}>
                    <Lightbulb className="w-4 h-4 inline-block mr-1" />
                    Ayuda
                  </Link>
                  <Link href="/privacidad" className={tema.colores.textoSecundario}>
                    <Shield className="w-4 h-4 inline-block mr-1" />
                    Privacidad
                  </Link>
                  <button onClick={cerrarSesion} className="text-red-400 flex items-center gap-1">
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* bottom bar mobile */}
      <MobileBottomBar tema={tema} actual="/tecnico/perfil" />

      {/* estilos globales */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
