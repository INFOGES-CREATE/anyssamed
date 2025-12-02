"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronDown,
  Home,
  Calendar,
  Users,
  ClipboardList,
  Pill,
  AlertCircle,
  TestTube,
  Video,
  Handshake,
  MessageSquare,
  User,
  ShieldCheck,
  Settings,
  Stethoscope,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  HeartPulse,
  AlertTriangle,
  Search,
  Bell,
  BellOff,
  X,
  Check,
  RefreshCw,
  Shield,
  LogOut,
  Edit3,
  Trash2,
  Info,
  FileText,
  BadgeCheck,
  Lock,
  Globe2,
  Crown,
} from "lucide-react";

// ==========================================
// TIPOS
// ==========================================
type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  colores: {
    fondo: string;
    texto: string;
    textoSecundario: string;
    card: string;
    cardAlt: string;
    borde: string;
    primario: string;
    primarioText: string;
    secundario: string;
    hover: string;
    gradiente: string;
    sidebar: string;
    header: string;
    sombra: string;
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
    id_profesional: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    universidad: string;
    ano_graduacion: number;
    especialidad_principal?: string;
    id_especialidad_principal?: number | null;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    acepta_nuevos_pacientes: 0 | 1;
    consulta_telemedicina: 0 | 1;
    firma_digital: 0 | 1;
    verificado_por_admin: 0 | 1;
  };
}

type EstadoCredencial = "vigente" | "vencida" | "pendiente";

interface CredencialMedica {
  id_credencial: number;
  id_profesional: number;
  tipo: string; // Ej. "Título Profesional", "Especialidad", "Certificación", "Registro"
  nombre: string;
  numero?: string | null;
  entidad_emisora?: string | null;
  fecha_emision?: string | null;
  fecha_expiracion?: string | null;
  url_documento?: string | null;
  estado?: EstadoCredencial;
  es_principal?: boolean;
  notas?: string | null;
}

interface Notificacion {
  id_notificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: 0 | 1;
  fecha: string;
}

interface PremiumInfo {
  activo: boolean;
  plan: string;
  vence_el?: string | null;
  beneficios?: string[];
}

// ==========================================
// TEMAS (mismos que en especialidades)
// ==========================================
const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro clínico",
    icono: Sun,
    colores: {
      fondo: "from-[#eef1ff] via-white to-[#eef1ff]",
      texto: "text-slate-950",
      textoSecundario: "text-slate-500",
      card: "bg-white",
      cardAlt: "bg-slate-50",
      borde: "border-slate-200",
      primario: "bg-[#4F46E5] hover:bg-[#4338CA]",
      primarioText: "text-white",
      secundario: "bg-slate-100 hover:bg-slate-200",
      hover: "hover:bg-slate-50",
      gradiente: "from-[#4F46E5] via-[#6366F1] to-[#A855F7]",
      sidebar: "bg-white/95 backdrop-blur-xl border-slate-200",
      header: "bg-white/90 backdrop-blur-xl border-slate-200",
      sombra: "shadow-[0_18px_45px_rgba(79,70,229,0.08)]",
    },
  },
  dark: {
    nombre: "Oscuro clínico",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-slate-900 to-slate-950",
      texto: "text-slate-50",
      textoSecundario: "text-slate-300",
      card: "bg-slate-900/95",
      cardAlt: "bg-slate-900/50",
      borde: "border-slate-700",
      primario: "bg-indigo-500 hover:bg-indigo-600",
      primarioText: "text-white",
      secundario: "bg-slate-800 hover:bg-slate-700",
      hover: "hover:bg-slate-800/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-slate-950/95 backdrop-blur-xl border-slate-800",
      header: "bg-slate-950/95 backdrop-blur-xl border-slate-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
    },
  },
  blue: {
    nombre: "Azul médico",
    icono: Wifi,
    colores: {
      fondo: "from-slate-950 via-sky-950 to-slate-950",
      texto: "text-slate-50",
      textoSecundario: "text-sky-100/80",
      card: "bg-slate-950/60",
      cardAlt: "bg-slate-900/40",
      borde: "border-sky-900",
      primario: "bg-sky-500 hover:bg-sky-600",
      primarioText: "text-white",
      secundario: "bg-slate-900/60 hover:bg-slate-900",
      hover: "hover:bg-slate-900/50",
      gradiente: "from-sky-500 via-blue-500 to-indigo-500",
      sidebar: "bg-slate-950/98 backdrop-blur-xl border-slate-900",
      header: "bg-slate-950/95 backdrop-blur-xl border-slate-900",
      sombra: "shadow-2xl shadow-sky-500/20",
    },
  },
  purple: {
    nombre: "Especialista",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-slate-950 to-purple-950",
      texto: "text-slate-50",
      textoSecundario: "text-purple-100/80",
      card: "bg-slate-950/60",
      cardAlt: "bg-purple-950/40",
      borde: "border-purple-900",
      primario: "bg-fuchsia-500 hover:bg-fuchsia-600",
      primarioText: "text-white",
      secundario: "bg-purple-950/40 hover:bg-purple-900/60",
      hover: "hover:bg-purple-950/30",
      gradiente: "from-fuchsia-500 via-purple-500 to-indigo-500",
      sidebar: "bg-slate-950/98 backdrop-blur-xl border-purple-900/80",
      header: "bg-slate-950/95 backdrop-blur-xl border-purple-900/80",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
    },
  },
  green: {
    nombre: "Verde hospital",
    icono: HeartPulse,
    colores: {
      fondo: "from-slate-950 via-emerald-950 to-slate-950",
      texto: "text-slate-50",
      textoSecundario: "text-emerald-100/80",
      card: "bg-slate-950/50",
      cardAlt: "bg-emerald-950/40",
      borde: "border-emerald-900",
      primario: "bg-emerald-500 hover:bg-emerald-600",
      primarioText: "text-white",
      secundario: "bg-slate-900/60 hover:bg-slate-900",
      hover: "hover:bg-emerald-950/30",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-slate-950/98 backdrop-blur-xl border-emerald-900",
      header: "bg-slate-950/95 backdrop-blur-xl border-emerald-900",
      sombra: "shadow-2xl shadow-emerald-500/20",
    },
  },
};

// ==========================================
// PAGE
// ==========================================
export default function PerfilMedicoCredencialesPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [credenciales, setCredenciales] = useState<CredencialMedica[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [premium, setPremium] = useState<PremiumInfo | null>(null);

  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [filtro, setFiltro] = useState<"todas" | "vigentes" | "pendientes" | "vencidas">("todas");

  // modal
  const [credencialEditando, setCredencialEditando] = useState<CredencialMedica | null>(null);
  const [editTipo, setEditTipo] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editNumero, setEditNumero] = useState("");
  const [editEntidad, setEditEntidad] = useState("");
  const [editFEmision, setEditFEmision] = useState("");
  const [editFExpira, setEditFExpira] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editEstado, setEditEstado] = useState<EstadoCredencial>("vigente");
  const [editPrincipal, setEditPrincipal] = useState(false);
  const [editNotas, setEditNotas] = useState("");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const isLight = temaActual === "light";

  // menú
  const menuItems = useMemo(
    () => [
      { titulo: "Dashboard", icono: Home, url: "/medico" },
      { titulo: "Agenda", icono: Calendar, url: "/medico/agenda" },
      {
        titulo: "Pacientes",
        icono: Users,
        url: "/medico/pacientes",
        submenu: [
          { titulo: "Todos", icono: Users, url: "/medico/pacientes" },
          { titulo: "Nuevo", icono: User, url: "/medico/pacientes/nuevo" },
        ],
      },
      { titulo: "Consultas", icono: ClipboardList, url: "/medico/consultas" },
      { titulo: "Recetas", icono: Pill, url: "/medico/recetas" },
      { titulo: "Exámenes", icono: TestTube, url: "/medico/examenes" },
      { titulo: "Telemedicina", icono: Video, url: "/medico/telemedicina" },
      { titulo: "Interconsultas", icono: Handshake, url: "/medico/interconsultas" },
      { titulo: "Mensajes", icono: MessageSquare, url: "/medico/mensajes" },
      {
        titulo: "Mi Perfil",
        icono: User,
        url: "/medico/perfil",
        submenu: [
          { titulo: "Datos personales", icono: User, url: "/medico/perfil" },
          { titulo: "Especialidades", icono: ShieldCheck, url: "/medico/perfil/especialidades" },
          { titulo: "Credenciales", icono: FileText, url: "/medico/perfil/credenciales" },
        ],
      },
      { titulo: "Configuración", icono: Settings, url: "/medico/configuracion" },
    ],
    []
  );

  // carga inicial
  useEffect(() => {
    (async () => {
      try {
        // perfil
        const res = await fetch("/api/medico/perfil", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success) {
          setUsuario(data.usuario);
        } else {
          setMensajeError("No se pudo cargar tu información.");
        }

        // credenciales
        try {
          const resCred = await fetch("/api/medico/credenciales", { credentials: "include" });
          if (resCred.ok) {
            const dataCred = await resCred.json();
            setCredenciales(dataCred.credenciales || []);
          }
        } catch {}

        // premium (opcional)
        try {
          const resPremium = await fetch("/api/medico/premium", { credentials: "include" });
          if (resPremium.ok) {
            const dataPremium = await resPremium.json();
            setPremium(dataPremium);
          }
        } catch {}
      } catch {
        setMensajeError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }

      // tema guardado
      try {
        const local = localStorage.getItem("tema_medico");
        if (local && local in TEMAS) setTemaActual(local as TemaColor);
      } catch {}
    })();
  }, []);

  // notis
  useEffect(() => {
    let active = true;
    const fetchNotis = async () => {
      try {
        const res = await fetch("/api/medico/notificaciones", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (active) setNotificaciones(data.notificaciones || []);
        }
      } catch {}
    };
    fetchNotis();
    const i = setInterval(fetchNotis, 30000);
    return () => {
      active = false;
      clearInterval(i);
    };
  }, []);

  // aplica tema
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
    localStorage.setItem("tema_medico", nuevo);
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema_color: nuevo }),
      });
    } catch {}
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("tema_medico");
      window.location.href = "/login";
    } catch {}
  };

  const recargarCredenciales = async () => {
    try {
      const resCred = await fetch("/api/medico/credenciales", { credentials: "include" });
      if (resCred.ok) {
        const dataCred = await resCred.json();
        setCredenciales(dataCred.credenciales || []);
      }
    } catch {}
  };

  const abrirEdicion = (c: CredencialMedica) => {
    setCredencialEditando(c);
    setEditTipo(c.tipo || "");
    setEditNombre(c.nombre || "");
    setEditNumero(c.numero || "");
    setEditEntidad(c.entidad_emisora || "");
    setEditFEmision(c.fecha_emision || "");
    setEditFExpira(c.fecha_expiracion || "");
    setEditUrl(c.url_documento || "");
    setEditEstado(c.estado || "vigente");
    setEditPrincipal(!!c.es_principal);
    setEditNotas(c.notas || "");
  };

  const guardarCredencial = async () => {
    if (!credencialEditando) return;
    setGuardando(true);
    setMensajeError(null);
    setMensajeOk(null);
    try {
      const res = await fetch(`/api/medico/credenciales/${credencialEditando.id_credencial}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: editTipo,
          nombre: editNombre,
          numero: editNumero || null,
          entidad_emisora: editEntidad || null,
          fecha_emision: editFEmision || null,
          fecha_expiracion: editFExpira || null,
          url_documento: editUrl || null,
          estado: editEstado,
          es_principal: editPrincipal,
          notas: editNotas || null,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setMensajeOk("Credencial actualizada.");
        setCredencialEditando(null);
        await recargarCredenciales();
      } else {
        setMensajeError(data.message || "No se pudo actualizar.");
      }
    } catch {
      setMensajeError("Error al actualizar.");
    } finally {
      setGuardando(false);
    }
  };

  const marcarComoPrincipal = async (id_credencial: number) => {
    setGuardando(true);
    setMensajeError(null);
    setMensajeOk(null);
    try {
      const res = await fetch(`/api/medico/credenciales/${id_credencial}/principal`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setMensajeOk("Credencial marcada como principal.");
        await recargarCredenciales();
      } else {
        setMensajeError(data.message || "No se pudo marcar como principal.");
      }
    } catch {
      setMensajeError("Error al marcar como principal.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCredencial = async (id_credencial: number) => {
    if (!confirm("¿Quitar esta credencial de tu perfil?")) return;
    try {
      const res = await fetch(`/api/medico/credenciales/${id_credencial}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setMensajeOk("Credencial eliminada.");
        await recargarCredenciales();
      } else {
        setMensajeError(data.message || "No se pudo eliminar.");
      }
    } catch {
      setMensajeError("Error al eliminar.");
    }
  };

  // filtrado
  const listaFiltrada = useMemo(() => {
    if (filtro === "vigentes")
      return credenciales.filter((c) => (c.estado || "vigente") === "vigente");
    if (filtro === "pendientes")
      return credenciales.filter((c) => (c.estado || "vigente") === "pendiente");
    if (filtro === "vencidas")
      return credenciales.filter((c) => (c.estado || "vigente") === "vencida");
    return credenciales;
  }, [filtro, credenciales]);

  const unreadCount = useMemo(
    () => notificaciones.filter((n) => n.leida === 0).length,
    [notificaciones]
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400/80 border-t-transparent animate-spin"></div>
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
            >
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className={`${tema.colores.texto} text-base font-semibold`}>
            Cargando tus credenciales...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`p-8 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center max-w-md`}
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className={`text-xl font-bold mb-2 ${tema.colores.texto}`}>
            No pudimos encontrar tu perfil médico
          </p>
          <p className={tema.colores.textoSecundario}>
            Ingresa nuevamente o contacta al centro.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-700/10">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                {usuario.medico.centro_principal.logo_url ? (
                  <Image
                    src={usuario.medico.centro_principal.logo_url}
                    alt={usuario.medico.centro_principal.nombre}
                    width={56}
                    height={56}
                    className="rounded-xl bg-white p-1 object-contain"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente}`}
                  ></div>
                )}
                <div>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.medico.centro_principal.nombre}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.centro_principal.ciudad},{" "}
                    {usuario.medico.centro_principal.region}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <Stethoscope className={`w-7 h-7 ${tema.colores.texto}`} />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto((p) => !p)}
              className={`p-2 rounded-lg ${tema.colores.hover}`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} ${
                  sidebarAbierto ? "rotate-180" : ""
                } transition-transform`}
              />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, idx) => {
              const activo = item.url === "/medico/perfil/credenciales";
              return (
                <div key={idx} className="mb-1">
                  <div
                    className="relative"
                    onMouseEnter={() => item.submenu && sidebarAbierto && setMenuExpandido(item.titulo)}
                    onMouseLeave={() => setMenuExpandido(null)}
                  >
                    <Link
                      href={item.url}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        activo
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <item.icono
                          className={`w-5 h-5 ${activo ? "text-white" : "text-indigo-400/90"}`}
                        />
                        {sidebarAbierto && <span className="truncate">{item.titulo}</span>}
                      </div>
                      {sidebarAbierto && item.submenu && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            menuExpandido === item.titulo ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Link>
                    {sidebarAbierto && item.submenu && menuExpandido === item.titulo && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.submenu.map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.url}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${tema.colores.hover} ${tema.colores.textoSecundario}`}
                          >
                            <sub.icono className="w-4 h-4" />
                            <span>{sub.titulo}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* médico abajo */}
          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidad_principal || "Médico"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold mx-auto`}
              >
                {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
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
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar en tu panel..."
                className={`w-full pl-12 pr-12 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <div className="relative group">
              <button
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 space-y-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}
              >
                <p className={`text-sm font-black ${tema.colores.texto}`}>Apariencia</p>
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
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} relative`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50 max-h-[340px] overflow-y-auto`}
                >
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    Notificaciones
                  </p>
                  {notificaciones.length === 0 ? (
                    <p className={tema.colores.textoSecundario}>Sin notificaciones nuevas.</p>
                  ) : (
                    <div className="space-y-2">
                      {notificaciones.map((n) => (
                        <div
                          key={n.id_notificacion}
                          className={`p-3 rounded-xl flex gap-2 ${
                            n.leida
                              ? tema.colores.hover
                              : isLight
                                ? "bg-indigo-50"
                                : "bg-indigo-500/10"
                          }`}
                        >
                          {n.tipo === "respaldo" ? (
                            <BellOff
                              className={`w-4 h-4 ${
                                isLight ? "text-yellow-500" : "text-yellow-400"
                              } mt-1`}
                            />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-1" />
                          )}
                          <div>
                            <p className={`text-xs ${tema.colores.texto}`}>{n.titulo}</p>
                            <p className="text-[10px] text-slate-400">{n.mensaje}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{n.fecha}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>Dr. {usuario.nombre}</p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidad_principal || "Médico"}
                  </p>
                </div>
                <div
                  className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} text-white flex items-center justify-center font-bold`}
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
                    href="/medico/perfil"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto}`}
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={cerrarSesion}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/5 mt-2"
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
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8 space-y-8`}
      >
        {/* heading */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1
              className={`text-4xl font-black ${tema.colores.texto} flex items-center gap-3 tracking-tight`}
            >
              Credenciales médicas
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isLight
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "bg-indigo-500/10 text-indigo-100 border border-indigo-500/30"
                }`}
              >
                <ShieldCheck className="w-3 h-3" /> Validación
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Aquí solo ves lo tuyo. Adjunta tus respaldos y mantenlos vigentes.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/medico/perfil"
              className={`px-6 py-3 ${
                isLight ? "bg-white" : tema.colores.secundario
              } ${tema.colores.texto} rounded-xl font-bold border ${tema.colores.borde} shadow-sm`}
            >
              Volver al perfil
            </Link>
          </div>
        </div>

        {/* alertas básicas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div
            className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border flex items-center gap-3`}
          >
            <ShieldCheck
              className={`w-10 h-10 ${
                usuario.medico.verificado_por_admin ? "text-emerald-400" : "text-amber-400"
              }`}
            />
            <div>
              <p className={tema.colores.texto}>Verificación</p>
              <p className="text-xs text-slate-400">
                {usuario.medico.verificado_por_admin
                  ? "Cuenta verificada"
                  : "Pendiente de validación"}
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border flex items-center gap-3`}
          >
            <Lock
              className={`w-10 h-10 ${
                usuario.medico.firma_digital ? "text-indigo-400" : "text-slate-300"
              }`}
            />
            <div>
              <p className={tema.colores.texto}>Firma digital</p>
              <p className="text-xs text-slate-400">
                {usuario.medico.firma_digital ? "Habilitada" : "No registrada"}
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border flex items-center gap-3`}
          >
            <Globe2
              className={`w-10 h-10 ${
                usuario.medico.consulta_telemedicina ? "text-emerald-400" : "text-slate-300"
              }`}
            />
            <div>
              <p className={tema.colores.texto}>Telemedicina</p>
              <p className="text-xs text-slate-400">
                {usuario.medico.consulta_telemedicina ? "Activa" : "Desactivada"}
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-2xl ${
              credenciales.some((c) => (c.estado || "vigente") === "pendiente")
                ? "bg-amber-50 border-amber-100"
                : tema.colores.card
            } ${tema.colores.borde} border flex items-center gap-3`}
          >
            <AlertCircle
              className={`w-10 h-10 ${
                credenciales.some((c) => (c.estado || "vigente") === "pendiente")
                  ? "text-amber-400"
                  : "text-slate-300"
              }`}
            />
            <div>
              <p className={tema.colores.texto}>Respaldos</p>
              <p className="text-xs text-slate-400">
                {credenciales.some((c) => (c.estado || "vigente") === "pendiente")
                  ? "Hay documentos por validar"
                  : "Todo al día"}
              </p>
            </div>
          </div>
        </div>

        {/* mensajes */}
        {mensajeOk && (
          <div
            className={`${
              isLight
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-green-500/10 text-green-200 border-green-500/50"
            } border px-4 py-3 rounded-xl flex items-center justify-between`}
          >
            <p className="text-sm font-semibold">{mensajeOk}</p>
            <button onClick={() => setMensajeOk(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {mensajeError && (
          <div
            className={`${
              isLight
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-red-500/10 text-red-200 border-red-500/50"
            } border px-4 py-3 rounded-xl flex items-center justify-between`}
          >
            <p className="text-sm font-semibold">{mensajeError}</p>
            <button onClick={() => setMensajeError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
          {/* izquierda */}
          <div className="2xl:col-span-2 space-y-6">
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    Documentos y credenciales
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Títulos, registros, certificados, cursos validados.
                  </p>
                </div>
                <div
                  className={`flex gap-1 rounded-xl ${
                    isLight ? "bg-slate-100" : "bg-slate-900/50"
                  } p-1`}
                >
                  {[
                    { key: "todas", label: "Todas" },
                    { key: "vigentes", label: "Vigentes" },
                    { key: "pendientes", label: "Pendientes" },
                    { key: "vencidas", label: "Vencidas" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFiltro(f.key as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        filtro === f.key
                          ? isLight
                            ? "bg-white shadow text-slate-900"
                            : "bg-slate-900 text-slate-50"
                          : "text-slate-500"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {listaFiltrada.length === 0 && (
                  <div
                    className={`p-5 rounded-xl ${tema.colores.cardAlt} border border-dashed ${tema.colores.borde} flex items-center gap-3`}
                  >
                    <Info className="w-6 h-6 text-indigo-400" />
                    <div>
                      <p className={tema.colores.texto}>
                        No hay credenciales para este filtro.
                      </p>
                      <p className="text-xs text-slate-400">
                        Puedes cargarlas desde tu administración.
                      </p>
                    </div>
                  </div>
                )}

                {listaFiltrada.map((c) => (
                  <div
                    key={c.id_credencial}
                    className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isLight ? "bg-white" : tema.colores.cardAlt
                    } border ${c.es_principal ? "border-indigo-200" : tema.colores.borde}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          c.es_principal ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold ${tema.colores.texto} flex gap-2 flex-wrap`}>
                          {c.nombre || c.tipo}
                          {c.es_principal && (
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                              Principal
                            </span>
                          )}
                          {c.estado === "pendiente" && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                              Pendiente
                            </span>
                          )}
                          {c.estado === "vencida" && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                              Vencida
                            </span>
                          )}
                          {c.estado === "vigente" && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                              Vigente
                            </span>
                          )}
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          {c.tipo}
                          {c.numero ? ` · Nº ${c.numero}` : ""}
                          {c.entidad_emisora ? ` · ${c.entidad_emisora}` : ""}
                        </p>
                        {(c.fecha_emision || c.fecha_expiracion) && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {c.fecha_emision ? `Emitida: ${c.fecha_emision}` : ""}
                            {c.fecha_emision && c.fecha_expiracion ? " · " : ""}
                            {c.fecha_expiracion ? `Vence: ${c.fecha_expiracion}` : ""}
                          </p>
                        )}
                        {c.notas && (
                          <p className="text-[10px] text-slate-400 mt-1">{c.notas}</p>
                        )}
                        {c.url_documento && (
                          <a
                            href={c.url_documento}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-indigo-500 underline mt-1 inline-flex items-center gap-1"
                          >
                            Ver documento
                            <ExternalLinkMini />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!c.es_principal && (
                        <button
                          onClick={() => marcarComoPrincipal(c.id_credencial)}
                          className={`text-xs px-3 py-1 rounded-lg ${
                            isLight
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              : "bg-indigo-500/10 text-indigo-50 hover:bg-indigo-500/20"
                          }`}
                        >
                          Principal
                        </button>
                      )}
                      <button
                        onClick={() => abrirEdicion(c)}
                        className={`p-2 rounded-lg ${
                          isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-100"
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!c.es_principal && (
                        <button
                          onClick={() => eliminarCredencial(c.id_credencial)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* derecha */}
          <div className="space-y-6">
            {/* premium */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">Tu plan</p>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-7 h-7 text-yellow-200" />
                <p className="text-2xl font-black text-white leading-tight">
                  {premium?.activo ? premium.plan || "Premium médico" : "Plan estándar"}
                </p>
              </div>
              <p className="text-xs text-white/70 mb-3">
                {premium?.activo
                  ? premium.vence_el
                    ? `Activo · vence el ${premium.vence_el}`
                    : "Activo"
                  : "Activa tu plan para más funciones."}
              </p>
              <ul className="space-y-2 text-xs text-white/80">
                {premium?.activo
                  ? (premium.beneficios || [
                      "Mayor prioridad de agenda",
                      "Soporte clínico preferente",
                      "Más documentos por perfil",
                    ]).map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="w-3 h-3 mt-0.5" /> {b}
                      </li>
                    ))
                  : [
                      "Carga ilimitada de credenciales",
                      "Validación más rápida",
                      "Soporte personalizado",
                    ].map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="w-3 h-3 mt-0.5" /> {b}
                      </li>
                    ))}
              </ul>
            </div>

            {/* buenas prácticas */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-4 ${tema.colores.texto}`}>Buenas prácticas</p>
              <ul className="space-y-3 text-sm">
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Usa el mismo nombre del documento que emitió la institución.
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Adjunta la URL o archivo oficial para que pueda ser validado.
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Mantén al menos una credencial vigente marcada como principal.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-8 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className={tema.colores.texto}>© 2025 Plataforma Médica</p>
              <p className={tema.colores.textoSecundario}>Gestión de credenciales</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/medico/ayuda" className={tema.colores.textoSecundario}>
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

      {/* MODAL EDICIÓN */}
      {credencialEditando && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 relative">
            <button
              onClick={() => setCredencialEditando(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Editar credencial
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Ajusta el documento. Solo tú lo ves aquí.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Tipo</label>
                  <input
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Título profesional, Especialidad..."
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Nombre</label>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Ej. Médico Cirujano"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Número / registro</label>
                  <input
                    value={editNumero}
                    onChange={(e) => setEditNumero(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Entidad emisora</label>
                  <input
                    value={editEntidad}
                    onChange={(e) => setEditEntidad(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Colegio Médico, Universidad..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Fecha emisión</label>
                  <input
                    type="date"
                    value={editFEmision}
                    onChange={(e) => setEditFEmision(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Fecha expiración</label>
                  <input
                    type="date"
                    value={editFExpira}
                    onChange={(e) => setEditFExpira(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  URL del documento (opcional)
                </label>
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Estado</label>
                  <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as EstadoCredencial)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="vigente">Vigente</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="principal"
                    type="checkbox"
                    checked={editPrincipal}
                    onChange={(e) => setEditPrincipal(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="principal" className="text-xs text-slate-600">
                    Marcar como principal
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Notas</label>
                <textarea
                  value={editNotas}
                  onChange={(e) => setEditNotas(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Info interna, breve..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setCredencialEditando(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCredencial}
                disabled={guardando}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-70"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* scrollbar */}
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

// pequeño icono de enlace externo sin traer todo lucide otra vez
function ExternalLinkMini() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    >
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M5 5v16h16" />
    </svg>
  );
}
