"use client";

import {
  useEffect,
  useMemo,
  useState,
  ChangeEvent,
} from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  FileText,
  Fingerprint,
  KeyRound,
  Laptop,
  Lightbulb,
  Link2,
  LogOut,
  Mail,
  MapPin,
  Moon,
  PenLine,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  User,
  X,
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
  firma_digital?: string | null;
  pin_seguridad?: string | null;
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

interface ConfigFirmaRespuesta {
  success: boolean;
  firma_texto?: string | null;
  firma_imagen_url?: string | null;
  usar_firma_texto?: boolean;
  usar_firma_imagen?: boolean;
  mostrar_en?: {
    correos: boolean;
    reportes: boolean;
    recetas: boolean;
    internos: boolean;
  };
  pin_configurado?: boolean;
}

// endpoints sugeridos
const ENDPOINTS = {
  firma: "/api/tecnico/firma",
  firmaUpload: "/api/tecnico/firma/imagen",
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
    icono: Activity,
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

const MobileBottomBar = ({
  tema,
  actual,
}: {
  tema: ConfiguracionTema;
  actual: string;
}) => {
  const items = [
    { label: "Inicio", icon: Laptop, href: "/tecnico" },
    { label: "Firma", icon: PenLine, href: "/tecnico/perfil/firma" },
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

// ===============
// PAGE
// ===============
export default function FirmaProfesionalPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [firmaTexto, setFirmaTexto] = useState("");
  const [usarFirmaTexto, setUsarFirmaTexto] = useState(true);

  const [firmaImagenUrl, setFirmaImagenUrl] = useState<string | null>(null);
  const [firmaImagenPreview, setFirmaImagenPreview] = useState<string | null>(null);
  const [usarFirmaImagen, setUsarFirmaImagen] = useState(false);

  const [mostrarEnCorreos, setMostrarEnCorreos] = useState(true);
  const [mostrarEnReportes, setMostrarEnReportes] = useState(true);
  const [mostrarEnRecetas, setMostrarEnRecetas] = useState(false);
  const [mostrarEnInternos, setMostrarEnInternos] = useState(true);

  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [pinConfirmacion, setPinConfirmacion] = useState("");
  const [pinConfigurado, setPinConfigurado] = useState(false);
  const [mostrandoPin, setMostrandoPin] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [guardandoPin, setGuardandoPin] = useState(false);

  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const [cargandoFirma, setCargandoFirma] = useState(true);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const centroPrincipal: CentroPrincipal | null = usuario?.centro_principal || null;

  const menuItems = [
    { titulo: "Inicio", url: "/tecnico", icono: Laptop, activo: false },
    { titulo: "Tickets", url: "/tecnico/tickets", icono: ClipboardList, activo: false },
    { titulo: "Perfil", url: "/tecnico/perfil", icono: User, activo: false },
    { titulo: "Firma", url: "/tecnico/perfil/firma", icono: PenLine, activo: true },
    { titulo: "Configuración", url: "/tecnico/configuracion", icono: Settings, activo: false },
  ];

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

  // =============== cargar firma
  useEffect(() => {
    const fetchFirma = async () => {
      setCargandoFirma(true);
      try {
        const res = await fetch(ENDPOINTS.firma, {
          credentials: "include",
        });
        if (res.ok) {
          const d: ConfigFirmaRespuesta = await res.json();
          if (d.success) {
            if (d.firma_texto) setFirmaTexto(d.firma_texto);
            if (d.firma_imagen_url) {
              setFirmaImagenUrl(d.firma_imagen_url);
              setFirmaImagenPreview(d.firma_imagen_url);
            }
            setUsarFirmaTexto(d.usar_firma_texto ?? true);
            setUsarFirmaImagen(d.usar_firma_imagen ?? false);
            if (d.mostrar_en) {
              setMostrarEnCorreos(d.mostrar_en.correos ?? true);
              setMostrarEnReportes(d.mostrar_en.reportes ?? true);
              setMostrarEnRecetas(d.mostrar_en.recetas ?? false);
              setMostrarEnInternos(d.mostrar_en.internos ?? true);
            }
            setPinConfigurado(d.pin_configurado ?? false);
          }
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoFirma(false);
      }
    };
    fetchFirma();
  }, []);

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

  const nombreRol = usuario?.rol?.nombre || "Técnico";

  const handleFirmaImagenChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setFirmaImagenPreview(preview);

    const formData = new FormData();
    formData.append("firma", file);

    try {
      const res = await fetch(ENDPOINTS.firmaUpload, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.firma_imagen_url) {
        setFirmaImagenUrl(data.firma_imagen_url);
        setMensajeOk("Imagen de firma actualizada correctamente ✅");
      } else {
        setMensajeError("No se pudo actualizar la imagen de firma");
      }
    } catch {
      setMensajeError("Error al subir la imagen de firma");
    }
  };

  const guardarFirma = async () => {
    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);

    try {
      const res = await fetch(ENDPOINTS.firma, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firma_texto: firmaTexto,
          usar_firma_texto: usarFirmaTexto,
          usar_firma_imagen: usarFirmaImagen,
          mostrar_en: {
            correos: mostrarEnCorreos,
            reportes: mostrarEnReportes,
            recetas: mostrarEnRecetas,
            internos: mostrarEnInternos,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMensajeOk("Firma profesional actualizada correctamente ✅");
      } else {
        setMensajeError(data.message || "No se pudo guardar la configuración de firma");
      }
    } catch {
      setMensajeError("Error al guardar la configuración de firma");
    } finally {
      setGuardando(false);
    }
  };

  const guardarPin = async () => {
    if (!pinNuevo || pinNuevo.length < 4) {
      setMensajeError("El PIN debe tener al menos 4 dígitos");
      return;
    }
    if (pinNuevo !== pinConfirmacion) {
      setMensajeError("El PIN nuevo y la confirmación no coinciden");
      return;
    }

    setGuardandoPin(true);
    setMensajeOk(null);
    setMensajeError(null);

    try {
      const res = await fetch("/api/tecnico/firma/pin", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin_actual: pinActual || undefined,
          pin_nuevo: pinNuevo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMensajeOk("PIN de firma actualizado correctamente ✅");
        setPinConfigurado(true);
        setPinActual("");
        setPinNuevo("");
        setPinConfirmacion("");
      } else {
        setMensajeError(data.message || "No se pudo actualizar el PIN de firma");
      }
    } catch {
      setMensajeError("Error al actualizar el PIN de firma");
    } finally {
      setGuardandoPin(false);
    }
  };

  const textoPreview = useMemo(() => {
    if (firmaTexto.trim()) return firmaTexto;
    if (!usuario) return "";
    return `${usuario.nombre} ${usuario.apellido_paterno}\n${nombreRol}`;
  }, [firmaTexto, usuario, nombreRol]);

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
            Cargando módulo de firma profesional...
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
            No se pudo cargar la información
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
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} pb-14 md:pb-0`}>
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
                    item.activo
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
                placeholder="Quick search: módulos, ayuda, configuración..."
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
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    Notificaciones
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <PenLine className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Recuerda configurar tu firma profesional
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                          hace 5 min
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <Fingerprint className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Puedes reforzar tu firma con PIN de seguridad
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                          hace 20 min
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <BellOff className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Ajusta en qué documentos se muestra tu firma
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                          hoy
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
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre}
                  </p>
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
              Firma profesional
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-emerald-500/10 text-emerald-200 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> Firma premium
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Define cómo se muestra tu firma en correos, reportes y documentos médicos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarFirma}
              disabled={guardando}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.primario} text-white rounded-xl font-bold text-sm md:text-base ${
                guardando ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`} />
              {guardando ? "Guardando..." : "Guardar firma"}
            </button>
            <Link
              href="/tecnico"
              className={`px-4 md:px-6 py-2.5 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold text-sm md:text-base`}
            >
              Volver al panel
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

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Col izquierda: info + preview tipo correo / documento */}
          <div className="xl:col-span-1 space-y-4">
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-xs font-bold text-white/80 mb-1">
                Perfil de firma
              </p>
              <p className="text-xl font-black text-white mb-2">
                {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <p className="text-[13px] text-white/90 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {usuario.email}
              </p>
              {centroPrincipal ? (
                <>
                  <p className="text-[13px] text-white/90 flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3" />
                    Centro: {centroPrincipal.nombre}
                  </p>
                  <p className="text-[13px] text-white/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {centroPrincipal.ciudad}, {centroPrincipal.region}
                  </p>
                </>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="px-3 py-1 rounded-full bg-black/20 text-white/90 flex items-center gap-1">
                  <PenLine className="w-3 h-3" /> Firma texto:{" "}
                  {usarFirmaTexto ? "Activa" : "Inactiva"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/20 text-white/90 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Firma imagen:{" "}
                  {usarFirmaImagen ? "Activa" : "Inactiva"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/20 text-white/90 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3" /> PIN:{" "}
                  {pinConfigurado ? "Configurado" : "Pendiente"}
                </span>
              </div>
            </div>

            {/* Preview tipo correo */}
            <div
              className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                Vista previa: correo al paciente
              </p>
              <div className="bg-white/5 rounded-xl p-3 text-xs space-y-2">
                <p className="font-semibold text-gray-300">
                  Asunto: Confirmación de cita · {usuario.nombre}
                </p>
                <p className="text-gray-300">
                  Estimado/a paciente, su cita ha sido confirmada...
                </p>
                <div className="border-t border-white/10 pt-2 mt-2">
                  {usarFirmaTexto && (
                    <pre className="whitespace-pre-wrap text-gray-100 text-xs">
                      {textoPreview}
                    </pre>
                  )}
                  {usarFirmaImagen && (firmaImagenPreview || firmaImagenUrl) && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={firmaImagenPreview || firmaImagenUrl || ""}
                        alt="Firma"
                        className="max-h-20 object-contain"
                      />
                    </div>
                  )}
                  {!usarFirmaTexto && !usarFirmaImagen && (
                    <p className="text-[11px] text-gray-400">
                      (La firma no se mostrará en este tipo de documento)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview móvil */}
            <div
              className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border`}
            >
              <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                Vista móvil rápida
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-14 rounded-2xl border border-white/10 flex flex-col justify-between px-1 py-1">
                  <div className="flex items-center justify-center">
                    <Smartphone className="w-3 h-3" />
                  </div>
                  <div className="bg-white/10 rounded-md h-7 flex items-center justify-center text-[9px] text-white/80 text-center px-1">
                    {usarFirmaTexto
                      ? "Firma texto visible"
                      : usarFirmaImagen
                      ? "Firma imagen visible"
                      : "Sin firma aplicada"}
                  </div>
                </div>
                <p className={tema.colores.textoSecundario}>
                  Así se verá tu firma en notificaciones móviles, resúmenes y vistas
                  compactas.
                </p>
              </div>
            </div>
          </div>

          {/* Col derecha: configuración firma + PIN */}
          <div className="xl:col-span-2 space-y-6">
            {/* Config firma */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <PenLine className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Configuración de firma
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Combina firma de texto y gráfica para una presencia profesional
                      uniforme.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={usarFirmaTexto}
                      onChange={() => setUsarFirmaTexto((p) => !p)}
                    />
                    <span className={tema.colores.texto}>Usar firma de texto</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={usarFirmaImagen}
                      onChange={() => setUsarFirmaImagen((p) => !p)}
                    />
                    <span className={tema.colores.texto}>Usar imagen de firma</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Firma texto */}
                <div>
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    Firma de texto
                  </p>
                  <p className={`text-xs mb-2 ${tema.colores.textoSecundario}`}>
                    Se recomienda incluir nombre completo, título profesional, registro
                    o RUT y datos de contacto relevantes.
                  </p>
                  {cargandoFirma ? (
                    <div className="space-y-2">
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </div>
                  ) : (
                    <textarea
                      value={firmaTexto}
                      onChange={(e) => setFirmaTexto(e.target.value)}
                      rows={6}
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
                      placeholder={
                        "Ej:\nDr(a). Nombre Apellido Apellido\nMédico Cirujano · Especialidad\nRUT: 11.111.111-1 · Registro Superintendencia N° XXX\nCentro Médico Ejemplo · Tel: +56 9 1234 5678"
                      }
                    />
                  )}
                </div>

                {/* Firma imagen */}
                <div>
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    Imagen de firma
                  </p>
                  <p className={`text-xs mb-2 ${tema.colores.textoSecundario}`}>
                    Puedes subir una foto escaneada de tu firma manuscrita para
                    documentos que lo permitan.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <div
                        className={`w-full h-32 rounded-xl border border-dashed ${tema.colores.borde} flex items-center justify-center bg-black/5`}
                      >
                        {firmaImagenPreview || firmaImagenUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firmaImagenPreview || firmaImagenUrl || ""}
                            alt="Firma"
                            className="max-h-28 object-contain"
                          />
                        ) : (
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            No hay imagen de firma cargada
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="firmaImagen"
                        className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${tema.colores.secundario} flex items-center gap-2`}
                      >
                        <Link2 className="w-4 h-4" />
                        Subir / cambiar imagen
                      </label>
                      <input
                        id="firmaImagen"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFirmaImagenChange}
                      />
                      <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                        Máx: 1MB · Formatos: PNG / JPG · Fondo blanco o transparente
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donde mostrar la firma */}
              <div className="mt-6">
                <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                  Dónde se mostrará tu firma
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <div>
                        <p className={tema.colores.texto}>Correos automáticos</p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          Confirmaciones de cita, cambios y notificaciones.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mostrarEnCorreos}
                      onChange={() => setMostrarEnCorreos((p) => !p)}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div>
                        <p className={tema.colores.texto}>Reportes / informes</p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          PDFs de atención, informes técnicos o clínicos.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mostrarEnReportes}
                      onChange={() => setMostrarEnReportes((p) => !p)}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <div>
                        <p className={tema.colores.texto}>Recetas / órdenes</p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          Según normativas habilitadas en tu centro.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mostrarEnRecetas}
                      onChange={() => setMostrarEnRecetas((p) => !p)}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      <div>
                        <p className={tema.colores.texto}>Registros internos</p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          Bitácoras, auditoría interna, notas para equipos.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mostrarEnInternos}
                      onChange={() => setMostrarEnInternos((p) => !p)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Seguridad de firma / PIN */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    Seguridad de la firma
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Protege el uso de tu firma digital con un PIN para operaciones
                    sensibles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl ${tema.colores.secundario} flex items-start gap-3`}
                >
                  <KeyRound className="w-5 h-5 mt-1" />
                  <div className="flex-1">
                    <p className={tema.colores.texto}>
                      {pinConfigurado
                        ? "Actualizar PIN de firma"
                        : "Configurar PIN por primera vez"}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-3`}>
                      Se solicitará en confirmaciones críticas (por ejemplo, cierre de
                      informes o recetas).
                    </p>
                    {pinConfigurado && (
                      <div className="mb-2">
                        <label
                          className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                        >
                          PIN actual
                        </label>
                        <input
                          type={mostrandoPin ? "text" : "password"}
                          value={pinActual}
                          onChange={(e) => setPinActual(e.target.value)}
                          className={`w-full mt-1 px-3 py-2 rounded-lg text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                        />
                      </div>
                    )}
                    <div className="mb-2">
                      <label
                        className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                      >
                        PIN nuevo
                      </label>
                      <input
                        type={mostrandoPin ? "text" : "password"}
                        value={pinNuevo}
                        onChange={(e) => setPinNuevo(e.target.value)}
                        className={`w-full mt-1 px-3 py-2 rounded-lg text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                        placeholder="Mínimo 4 dígitos"
                      />
                    </div>
                    <div className="mb-2">
                      <label
                        className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                      >
                        Confirmar PIN nuevo
                      </label>
                      <input
                        type={mostrandoPin ? "text" : "password"}
                        value={pinConfirmacion}
                        onChange={(e) => setPinConfirmacion(e.target.value)}
                        className={`w-full mt-1 px-3 py-2 rounded-lg text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-1 text-[11px]">
                      <input
                        type="checkbox"
                        checked={mostrandoPin}
                        onChange={() => setMostrandoPin((p) => !p)}
                      />
                      <span className={tema.colores.textoSecundario}>
                        Mostrar caracteres de PIN
                      </span>
                    </label>
                    <button
                      onClick={guardarPin}
                      disabled={guardandoPin}
                      className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${tema.colores.primario} text-white ${
                        guardandoPin ? "opacity-70 cursor-wait" : ""
                      }`}
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          guardandoPin ? "animate-spin" : ""
                        }`}
                      />
                      {guardandoPin ? "Guardando PIN..." : "Guardar PIN de firma"}
                    </button>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl ${tema.colores.secundario} flex flex-col gap-3`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <p className={tema.colores.texto}>Buenas prácticas</p>
                  </div>
                  <ul className="text-[11px] list-disc list-inside space-y-1 text-gray-300">
                    <li>No compartas tu PIN con otros usuarios del centro.</li>
                    <li>Evita usar fechas de nacimiento o datos fáciles de adivinar.</li>
                    <li>
                      Actualiza tu PIN periódicamente, especialmente si sospechas un
                      acceso no autorizado.
                    </li>
                    <li>
                      Tu firma puede ser registrada en auditoría para acciones críticas.
                    </li>
                  </ul>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-400">
                    <Smartphone className="w-4 h-4" />
                    <span>
                      Próximamente: confirmación de firma vía app móvil / 2FA.
                    </span>
                  </div>
                </div>
              </div>

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
                        Módulo de firma profesional del técnico
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
        </div>
      </main>

      {/* bottom bar mobile */}
      <MobileBottomBar tema={tema} actual="/tecnico/perfil/firma" />

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
