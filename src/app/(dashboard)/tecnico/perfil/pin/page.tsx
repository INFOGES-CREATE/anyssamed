"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  RefreshCw,
  Lightbulb,
  X,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  Wifi,
  HeartPulse,
  Activity,
  Clock,
  Lock,
  Laptop,
  History,
  KeyRound,
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
  tiempo_promedio_resolucion: number;
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

interface AuditoriaPinItem {
  id: string | number;
  accion: string;
  fecha: string;
  ip?: string | null;
  dispositivo?: string | null;
  ok: boolean;
}

interface ConfigPinOpciones {
  requerir_pin_tickets_criticos: boolean;
  requerir_pin_equipos: boolean;
  requerir_pin_login: boolean;
}

// ENDPOINTS sugeridos (ajusta a tu backend)
const API_PIN = {
  obtener: "/api/tecnico/pin",
  guardar: "/api/tecnico/pin",
  auditoria: "/api/tecnico/pin/auditoria?limit=10",
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
  <div
    className={`h-3 rounded-full bg-white/5 ${tema.colores.hover} animate-pulse`}
  ></div>
);

const MobileBottomBar = ({
  tema,
  actual,
}: {
  tema: ConfiguracionTema;
  actual: string;
}) => {
  const items = [
    { label: "Inicio", icon: Home, href: "/tecnico" },
    { label: "Tickets", icon: ClipboardList, href: "/tecnico/tickets" },
    { label: "Perfil", icon: User, href: "/tecnico/perfil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-black/40 backdrop-blur-md border-t border-white/5">
      {items.map((item) => {
        const active =
          item.href === actual ||
          (actual.startsWith("/tecnico/perfil") &&
            item.href === "/tecnico/perfil");
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
    {secondary ? (
      <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>
        {secondary}
      </p>
    ) : null}
  </div>
);

// ===============
// PAGE
// ===============
export default function PinPerfilTecnicoPage() {
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

  const [seccionActiva, setSeccionActiva] = useState<"pin" | "opciones" | "auditoria">("pin");

  const [formPin, setFormPin] = useState({
    pin_actual: "",
    pin_nuevo: "",
    pin_confirmacion: "",
  });

  const [tienePin, setTienePin] = useState(false);
  const [ultimoCambio, setUltimoCambio] = useState<string | null>(null);
  const [intentosFallidos, setIntentosFallidos] = useState<number>(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState<string | null>(null);

  const [opcionesPin, setOpcionesPin] = useState<ConfigPinOpciones>({
    requerir_pin_tickets_criticos: true,
    requerir_pin_equipos: true,
    requerir_pin_login: false,
  });

  const [auditoria, setAuditoria] = useState<AuditoriaPinItem[]>([]);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(true);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const centroPrincipal: CentroPrincipal | null =
    usuario?.centro_principal || null;

  const menuItems = [
    { titulo: "Inicio", url: "/tecnico", icono: Home, activo: false },
    { titulo: "Tickets", url: "/tecnico/tickets", icono: ClipboardList, activo: false },
    { titulo: "Perfil", url: "/tecnico/perfil", icono: User, activo: true },
    { titulo: "Configuración", url: "/tecnico/configuracion", icono: Settings, activo: false },
  ];

  // =============== cargar sesión (técnico)
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error("No hay sesión");
        const data = await res.json();

        if (data.success && data.usuario) {
          const u = data.usuario as UsuarioSesion;
          setUsuario(u);
          setTienePin(!!u.tecnico?.pin_seguridad);
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
        }
        const res = await fetch("/api/users/preferencias/tema", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tema_color && data.tema_color in TEMAS) {
            setTemaActual(data.tema_color as TemaColor);
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

  // =============== cargar datos de PIN
  useEffect(() => {
    if (!usuario) return;

    const cargarPin = async () => {
      try {
        const res = await fetch(API_PIN.obtener, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (typeof data.tiene_pin === "boolean") {
              setTienePin(data.tiene_pin);
            }
            if (data.ultimo_cambio) setUltimoCambio(data.ultimo_cambio);
            if (typeof data.intentos_fallidos === "number") {
              setIntentosFallidos(data.intentos_fallidos);
            }
            if (data.bloqueado_hasta) setBloqueadoHasta(data.bloqueado_hasta);
            if (data.opciones) {
              setOpcionesPin((prev) => ({
                ...prev,
                ...data.opciones,
              }));
            }
          }
        }
      } catch (e) {
        console.error("Error cargando config de PIN", e);
      }
    };

    const cargarAuditoria = async () => {
      setCargandoAuditoria(true);
      try {
        const res = await fetch(API_PIN.auditoria, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.logs)) {
            setAuditoria(data.logs);
          } else if (Array.isArray(data.auditoria)) {
            setAuditoria(data.auditoria);
          }
        }
      } catch (e) {
        console.error("Error cargando auditoría PIN", e);
      } finally {
        setCargandoAuditoria(false);
      }
    };

    cargarPin();
    cargarAuditoria();
  }, [usuario]);

  // =============== helpers
  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
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

  const validarPin = () => {
    if (!formPin.pin_nuevo) {
      setMensajeError("Ingresa el PIN nuevo");
      return false;
    }
    if (formPin.pin_nuevo.length < 4 || formPin.pin_nuevo.length > 8) {
      setMensajeError("El PIN debe tener entre 4 y 8 dígitos");
      return false;
    }
    if (!/^\d+$/.test(formPin.pin_nuevo)) {
      setMensajeError("El PIN solo puede contener números");
      return false;
    }
    if (formPin.pin_nuevo !== formPin.pin_confirmacion) {
      setMensajeError("La confirmación del PIN no coincide");
      return false;
    }
    if (tienePin && !formPin.pin_actual) {
      setMensajeError("Debes ingresar tu PIN actual");
      return false;
    }
    return true;
  };

  const guardarPin = async () => {
    if (!usuario) return;
    setMensajeOk(null);
    setMensajeError(null);

    if (!validarPin()) return;

    setGuardando(true);
    try {
      const payload = {
        pin_actual: formPin.pin_actual || null,
        pin_nuevo: formPin.pin_nuevo,
        opciones: opcionesPin,
      };

      const res = await fetch(API_PIN.guardar, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMensajeOk("PIN actualizado correctamente ✅");
        setTienePin(true);
        setFormPin({
          pin_actual: "",
          pin_nuevo: "",
          pin_confirmacion: "",
        });
        if (data.ultimo_cambio) setUltimoCambio(data.ultimo_cambio);
        setIntentosFallidos(0);
        setBloqueadoHasta(null);
      } else {
        setMensajeError(data.message || "No se pudo actualizar el PIN");
        if (typeof data.intentos_fallidos === "number") {
          setIntentosFallidos(data.intentos_fallidos);
        }
        if (data.bloqueado_hasta) {
          setBloqueadoHasta(data.bloqueado_hasta);
        }
      }
    } catch (e) {
      console.error(e);
      setMensajeError("Error al actualizar el PIN");
    } finally {
      setGuardando(false);
    }
  };

  const nombreRol = usuario?.rol?.nombre || "Técnico";

  const estadoPinLabel = tienePin
    ? "PIN activo"
    : "PIN no configurado";

  const estadoPinColor = tienePin ? "text-green-400" : "text-yellow-300";

  const menuStats = {
    riesgo: intentosFallidos >= 3 || !!bloqueadoHasta,
  };

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
            Cargando seguridad de PIN...
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
          <p className={tema.colores.textoSecundario}>
            Verifica tu sesión o tus permisos.
          </p>
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
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} pb-14 md:pb-0`}
    >
      {/* SIDEBAR DESKTOP */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={null}
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
                    item.url.startsWith("/tecnico/perfil")
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
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileSidebar(false)}
          />
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
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} rotate-180`}
              />
            </button>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar configuraciones, dispositivos o tickets..."
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
              <button
                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 space-y-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}
              >
                <p className={`text-sm font-black ${tema.colores.texto}`}>
                  Temas
                </p>
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
                  <p
                    className={`text-sm font-bold mb-2 ${tema.colores.texto}`}
                  >
                    Notificaciones
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <Lock className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo inicio de sesión desde un dispositivo distinto
                        </p>
                        <p
                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                        >
                          hace 5 min
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <ShieldAlert className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Revisa intentos fallidos recientes de PIN
                        </p>
                        <p
                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                        >
                          hace 30 min
                        </p>
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
                  <p
                    className={`text-sm font-bold ${tema.colores.texto}`}
                  >
                    {usuario.nombre}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {nombreRol}
                  </p>
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
                    `${usuario.nombre?.[0] || ""}${
                      usuario.apellido_paterno?.[0] || ""
                    }`
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
                    href="/tecnico/perfil/horarios"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                    onClick={() => setPerfilAbierto(false)}
                  >
                    <Clock className="w-4 h-4" />
                    Mis horarios
                  </Link>
                  <Link
                    href="/tecnico/perfil/pin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                    onClick={() => setPerfilAbierto(false)}
                  >
                    <Lock className="w-4 h-4" />
                    PIN de seguridad
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
              PIN de seguridad
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> Protección avanzada
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Configura tu PIN para aprobar acciones críticas en el centro
              médico y proteger tu cuenta técnica.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarPin}
              disabled={guardando}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.primario} text-white rounded-xl font-bold text-sm md:text-base ${
                guardando ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`}
              />
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

        {/* estadísticas seguridad */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Estadistica
            icon={Lock}
            label="Estado del PIN"
            value={tienePin ? "Configurado" : "Pendiente"}
            secondary={
              ultimoCambio
                ? `Último cambio: ${ultimoCambio}`
                : "Aún no se registra cambio"
            }
            tema={tema}
          />
          <Estadistica
            icon={Shield}
            label="Uso del PIN"
            value={
              [
                opcionesPin.requerir_pin_tickets_criticos && "Tickets críticos",
                opcionesPin.requerir_pin_equipos && "Equipos",
                opcionesPin.requerir_pin_login && "Login",
              ].filter(Boolean).length.toString()
            }
            secondary="Módulos protegidos"
            tema={tema}
          />
          <Estadistica
            icon={AlertTriangle}
            label="Intentos fallidos"
            value={intentosFallidos.toString()}
            secondary={
              bloqueadoHasta
                ? `Bloqueado hasta: ${bloqueadoHasta}`
                : "Sin bloqueo activo"
            }
            tema={tema}
          />
          <Estadistica
            icon={History}
            label="Eventos recientes"
            value={auditoria.length.toString()}
            secondary="Últimos cambios y accesos"
            tema={tema}
          />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* col izquierda: resumen */}
          <div className="xl:col-span-1 space-y-6">
            {/* resumen PIN */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">
                Resumen de seguridad
              </p>
              <p className="text-2xl md:text-3xl font-black text-white mb-3">
                {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Lock className="w-5 h-5 text-white" />
                  <span className={`text-sm font-semibold ${estadoPinColor}`}>
                    {estadoPinLabel}
                  </span>
                </div>
              </div>
              {centroPrincipal && (
                <p className="text-[13px] text-white/90 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Centro: {centroPrincipal.nombre}
                </p>
              )}
              {menuStats.riesgo && (
                <p className="mt-3 text-[12px] text-yellow-200 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Se detectaron intentos fallidos o bloqueo reciente. Revisa tu
                  PIN y dispositivos.
                </p>
              )}
            </div>

            {/* recomendaciones */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                Recomendaciones de PIN
              </p>
              <ul className="space-y-2 text-xs list-disc list-inside">
                <li className={tema.colores.textoSecundario}>
                  No uses el mismo PIN que en otros sistemas externos.
                </li>
                <li className={tema.colores.textoSecundario}>
                  Evita secuencias obvias (1234, 0000, 1111, etc.).
                </li>
                <li className={tema.colores.textoSecundario}>
                  Cambia el PIN periódicamente si gestionas equipos críticos o
                  áreas restringidas.
                </li>
              </ul>
            </div>
          </div>

          {/* col derecha: tabs PIN */}
          <div className="xl:col-span-2 space-y-6">
            {/* tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "pin", label: "Configurar PIN", icon: KeyRound },
                { id: "opciones", label: "Opciones de uso", icon: Settings },
                { id: "auditoria", label: "Auditoría", icon: History },
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

            {/* PIN */}
            {seccionActiva === "pin" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      {tienePin ? "Actualizar PIN" : "Crear PIN de seguridad"}
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Este PIN se usará para aprobar acciones sensibles en el
                      sistema.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tienePin && (
                    <div>
                      <label
                        className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                      >
                        PIN actual
                      </label>
                      <input
                        type="password"
                        value={formPin.pin_actual}
                        onChange={(e) =>
                          setFormPin((p) => ({
                            ...p,
                            pin_actual: e.target.value,
                          }))
                        }
                        className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                        placeholder="●●●●"
                      />
                    </div>
                  )}
                  <div>
                    <label
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      PIN nuevo
                    </label>
                    <input
                      type="password"
                      value={formPin.pin_nuevo}
                      onChange={(e) =>
                        setFormPin((p) => ({
                          ...p,
                          pin_nuevo: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      placeholder="4 a 8 dígitos numéricos"
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Repetir PIN nuevo
                    </label>
                    <input
                      type="password"
                      value={formPin.pin_confirmacion}
                      onChange={(e) =>
                        setFormPin((p) => ({
                          ...p,
                          pin_confirmacion: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      placeholder="Debe coincidir con el PIN nuevo"
                    />
                  </div>
                </div>

                <div className="mt-4 text-xs text-yellow-200 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/40 rounded-xl px-3 py-2">
                  <ShieldAlert className="w-4 h-4 mt-[2px]" />
                  <p>
                    El PIN no se mostrará nunca completo en pantalla ni será
                    enviado por correo. Si lo olvidas, deberás reestablecerlo a
                    través del administrador del centro.
                  </p>
                </div>
              </div>
            )}

            {/* OPCIONES */}
            {seccionActiva === "opciones" && (
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
                      Opciones de uso del PIN
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Define en qué escenarios se solicitará tu PIN.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div>
                      <p className={tema.colores.texto}>
                        Tickets de prioridad alta/crítica
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Se pedirá PIN al cerrar o reabrir tickets de impacto
                        crítico.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={opcionesPin.requerir_pin_tickets_criticos}
                      onChange={() =>
                        setOpcionesPin((p) => ({
                          ...p,
                          requerir_pin_tickets_criticos:
                            !p.requerir_pin_tickets_criticos,
                        }))
                      }
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div>
                      <p className={tema.colores.texto}>
                        Operaciones sobre equipos
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Requerir PIN para registrar intervenciones o cambios en
                        equipamiento crítico.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={opcionesPin.requerir_pin_equipos}
                      onChange={() =>
                        setOpcionesPin((p) => ({
                          ...p,
                          requerir_pin_equipos: !p.requerir_pin_equipos,
                        }))
                      }
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div>
                      <p className={tema.colores.texto}>
                        Solicitar PIN al iniciar sesión
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        Recomendado solo si trabajas en puestos compartidos o
                        salas abiertas.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={opcionesPin.requerir_pin_login}
                      onChange={() =>
                        setOpcionesPin((p) => ({
                          ...p,
                          requerir_pin_login: !p.requerir_pin_login,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            )}

            {/* AUDITORIA */}
            {seccionActiva === "auditoria" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Auditoría de acciones de PIN
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Últimos cambios, intentos y accesos relacionados a tu
                      PIN.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {cargandoAuditoria ? (
                    <>
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </>
                  ) : auditoria.length ? (
                    auditoria.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-xl ${tema.colores.hover}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            log.ok
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-200"
                          }`}
                        >
                          {log.ok ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={tema.colores.texto}>{log.accion}</p>
                          <p
                            className={`text-[10px] ${tema.colores.textoSecundario}`}
                          >
                            {log.fecha}
                            {log.ip ? ` · IP: ${log.ip}` : ""}
                            {log.dispositivo ? ` · ${log.dispositivo}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={tema.colores.textoSecundario}>
                      Sin registros de auditoría de PIN.
                    </p>
                  )}
                </div>
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
                    <p className={tema.colores.texto}>
                      © 2025 AnyssaMed Platform
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Configuración de PIN del técnico
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href="/tecnico/ayuda"
                    className={tema.colores.textoSecundario}
                  >
                    <Lightbulb className="w-4 h-4 inline-block mr-1" />
                    Ayuda
                  </Link>
                  <Link
                    href="/privacidad"
                    className={tema.colores.textoSecundario}
                  >
                    <Shield className="w-4 h-4 inline-block mr-1" />
                    Privacidad
                  </Link>
                  <button
                    onClick={cerrarSesion}
                    className="text-red-400 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* bottom bar mobile */}
      <MobileBottomBar tema={tema} actual="/tecnico/perfil/pin" />

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
