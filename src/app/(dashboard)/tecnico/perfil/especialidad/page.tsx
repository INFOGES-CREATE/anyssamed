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
  Filter,
  Globe,
  Home,
  Laptop,
  Lightbulb,
  Link2,
  ListFilter,
  LogOut,
  MapPin,
  Moon,
  Plug,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  User,
  Users,
  X,
  HeartPulse,
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

type TipoProfesional =
  | "medico"
  | "enfermera"
  | "kinesiologo"
  | "tecnico_enfermeria"
  | "administrativo"
  | "otro";

interface Especialidad {
  id_especialidad: number;
  nombre: string;
  codigo?: string | null;
  area?: string | null;
  descripcion?: string | null;
  activo: boolean;
}

interface ProfesionalEspecialidad {
  id_relacion: number;
  id_especialidad: number;
  nombre_especialidad: string;
  principal: boolean;
  vigente: boolean;
}

interface ProfesionalCentro {
  id_profesional: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  tipo_profesional: TipoProfesional;
  rut?: string | null;
  email?: string | null;
  telefono?: string | null;
  estado: "activo" | "inactivo";
  especialidades: ProfesionalEspecialidad[];
}

interface EstadisticasEspecialidad {
  total_profesionales: number;
  con_especialidad: number;
  total_especialidades: number;
  especialidades_activas: number;
}

// endpoints sugeridos (ajusta a tu backend)
const ENDPOINTS = {
  profesionales: "/api/centro/profesionales",
  especialidades: "/api/centro/especialidades",
  asignacion: "/api/centro/profesionales/especialidades",
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
    icono: HeartPulse,
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
    { label: "Especialidad", icon: ListFilter, href: "/tecnico/perfil/especialidad" },
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

const EstadisticaMini = ({
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
      <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>{secondary}</p>
    ) : null}
  </div>
);

// ===============
// PAGE
// ===============
export default function EspecialidadProfesionalesPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [profesionales, setProfesionales] = useState<ProfesionalCentro[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasEspecialidad | null>(
    null
  );

  const [cargandoProfesionales, setCargandoProfesionales] = useState(true);
  const [cargandoEspecialidades, setCargandoEspecialidades] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoProfesional | "todos">("todos");
  const [profesionalSeleccionado, setProfesionalSeleccionado] =
    useState<ProfesionalCentro | null>(null);
  const [seleccionEspecialidades, setSeleccionEspecialidades] = useState<
    number[]
  >([]);
  const [especialidadPrincipalId, setEspecialidadPrincipalId] = useState<
    number | null
  >(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const centroPrincipal: CentroPrincipal | null =
    usuario?.centro_principal || null;

  const menuItems = [
    { titulo: "Inicio", url: "/tecnico", icono: Home, activo: false },
    { titulo: "Tickets", url: "/tecnico/tickets", icono: ClipboardList, activo: false },
    { titulo: "Especialidades", url: "/tecnico/perfil/especialidad", icono: ListFilter, activo: true },
    { titulo: "Perfil", url: "/tecnico/perfil", icono: User, activo: false },
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

  // =============== cargar profesionales / especialidades
  const recalcularEstadisticas = (
    profs: ProfesionalCentro[],
    esps: Especialidad[]
  ) => {
    const total_profesionales = profs.length;
    const con_especialidad = profs.filter(
      (p) => p.especialidades && p.especialidades.length > 0
    ).length;
    const total_especialidades = esps.length;
    const especialidades_activas = esps.filter((e) => e.activo).length;
    setEstadisticas({
      total_profesionales,
      con_especialidad,
      total_especialidades,
      especialidades_activas,
    });
  };

  useEffect(() => {
    const fetchProfesionales = async () => {
      setCargandoProfesionales(true);
      try {
        const res = await fetch(ENDPOINTS.profesionales, {
          credentials: "include",
        });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.profesionales)) {
            setProfesionales(d.profesionales);
            // seleccionar primero por defecto
            if (!profesionalSeleccionado && d.profesionales.length) {
              setProfesionalSeleccionado(d.profesionales[0]);
              const espIds =
                d.profesionales[0].especialidades?.map(
                  (e: ProfesionalEspecialidad) => e.id_especialidad
                ) || [];
              setSeleccionEspecialidades(espIds);
              const espPrincipal =
                d.profesionales[0].especialidades?.find(
                  (e: ProfesionalEspecialidad) => e.principal
                );
              setEspecialidadPrincipalId(espPrincipal?.id_especialidad || null);
            }
          }
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoProfesionales(false);
      }
    };

    const fetchEspecialidades = async () => {
      setCargandoEspecialidades(true);
      try {
        const res = await fetch(ENDPOINTS.especialidades, {
          credentials: "include",
        });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.especialidades)) {
            setEspecialidades(d.especialidades);
          }
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoEspecialidades(false);
      }
    };

    fetchProfesionales();
    fetchEspecialidades();
  }, []);

  // recalcular stats cuando cambie
  useEffect(() => {
    recalcularEstadisticas(profesionales, especialidades);
  }, [profesionales, especialidades]);

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

  const profesionalesFiltrados = useMemo(() => {
    let lista = [...profesionales];
    if (filtroTipo !== "todos") {
      lista = lista.filter((p) => p.tipo_profesional === filtroTipo);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((p) => {
        const nombreCompleto = `${p.nombre} ${p.apellido_paterno} ${
          p.apellido_materno || ""
        }`.toLowerCase();
        return (
          nombreCompleto.includes(q) ||
          (p.email || "").toLowerCase().includes(q) ||
          (p.rut || "").toLowerCase().includes(q)
        );
      });
    }
    return lista;
  }, [profesionales, filtroTipo, busqueda]);

  const seleccionarProfesional = (p: ProfesionalCentro) => {
    setProfesionalSeleccionado(p);
    const espIds =
      p.especialidades?.map((e: ProfesionalEspecialidad) => e.id_especialidad) ||
      [];
    setSeleccionEspecialidades(espIds);
    const espPrincipal = p.especialidades?.find((e) => e.principal);
    setEspecialidadPrincipalId(espPrincipal?.id_especialidad || null);
  };

  const toggleEspecialidadSeleccion = (idEsp: number) => {
    setSeleccionEspecialidades((prev) => {
      if (prev.includes(idEsp)) {
        // si desmarco la principal, limpiar principal
        if (especialidadPrincipalId === idEsp) {
          setEspecialidadPrincipalId(null);
        }
        return prev.filter((id) => id !== idEsp);
      }
      return [...prev, idEsp];
    });
  };

  const marcarComoPrincipal = (idEsp: number) => {
    if (!seleccionEspecialidades.includes(idEsp)) {
      setSeleccionEspecialidades((prev) => [...prev, idEsp]);
    }
    setEspecialidadPrincipalId(idEsp);
  };

  const guardarAsignacion = async () => {
    if (!profesionalSeleccionado) return;
    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);

    try {
      const res = await fetch(ENDPOINTS.asignacion, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_profesional: profesionalSeleccionado.id_profesional,
          especialidades: seleccionEspecialidades,
          especialidad_principal: especialidadPrincipalId,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.especialidades)) {
        // actualizar profesional en la lista
        setProfesionales((prev) =>
          prev.map((p) =>
            p.id_profesional === profesionalSeleccionado.id_profesional
              ? {
                  ...p,
                  especialidades: data.especialidades,
                }
              : p
          )
        );
        setProfesionalSeleccionado((prev) =>
          prev
            ? {
                ...prev,
                especialidades: data.especialidades,
              }
            : prev
        );
        setMensajeOk("Especialidades actualizadas correctamente ✅");
      } else {
        setMensajeError(
          data.message || "No se pudo actualizar la configuración de especialidades"
        );
      }
    } catch (e) {
      console.error(e);
      setMensajeError("Error al guardar las especialidades");
    } finally {
      setGuardando(false);
    }
  };

  const handleBusquedaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
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
            Cargando configuración de especialidades...
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
                placeholder="Buscar profesionales por nombre, RUT o correo..."
                value={busqueda}
                onChange={handleBusquedaChange}
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              {busqueda && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg"
                  onClick={() => setBusqueda("")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
                  3
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
                      <ClipboardList className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo profesional agregado al centro
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                          hace 5 min
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <ListFilter className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Especialidad actualizada para un médico
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
                          Revisa profesionales sin especialidad asignada
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                          hace 1 h
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
              Especialidades de profesionales
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-indigo-500/10 text-indigo-200 border border-indigo-500/30">
                <ShieldCheck className="w-3 h-3" /> Configuración centralizada
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Define y mantiene las especialidades asociadas a médicos, enfermeras y
              otros profesionales de tu centro.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarAsignacion}
              disabled={!profesionalSeleccionado || guardando}
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

        {/* estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {estadisticas ? (
            <>
              <EstadisticaMini
                icon={Users}
                label="Profesionales registrados"
                value={estadisticas.total_profesionales.toString()}
                secondary="En el centro actual"
                tema={tema}
              />
              <EstadisticaMini
                icon={ListFilter}
                label="Con especialidad"
                value={`${estadisticas.con_especialidad}/${estadisticas.total_profesionales}`}
                secondary="Profesionales con al menos una especialidad"
                tema={tema}
              />
              <EstadisticaMini
                icon={HeartPulse}
                label="Especialidades activas"
                value={estadisticas.especialidades_activas.toString()}
                secondary={`${estadisticas.total_especialidades} totales`}
                tema={tema}
              />
              <EstadisticaMini
                icon={Star}
                label="Múltiples especialidades"
                value={
                  profesionales.filter(
                    (p) => (p.especialidades?.length || 0) > 1
                  ).length.toString()
                }
                secondary="Profesionales con más de una especialidad"
                tema={tema}
              />
            </>
          ) : (
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
          )}
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LISTA PROFESIONALES */}
          <div className="xl:col-span-1 space-y-4">
            <div
              className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      Profesionales del centro
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Selecciona un profesional para editar sus especialidades.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                  <select
                    value={filtroTipo}
                    onChange={(e) =>
                      setFiltroTipo(
                        e.target.value as TipoProfesional | "todos"
                      )
                    }
                    className={`text-xs px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                  >
                    <option value="todos">Todos</option>
                    <option value="medico">Médicos</option>
                    <option value="enfermera">Enfermería</option>
                    <option value="kinesiologo">Kinesiología</option>
                    <option value="tecnico_enfermeria">Técnico enfermería</option>
                    <option value="administrativo">Administrativos</option>
                    <option value="otro">Otros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar">
                {cargandoProfesionales ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : profesionalesFiltrados.length ? (
                  profesionalesFiltrados.map((p) => {
                    const seleccionado =
                      profesionalSeleccionado &&
                      profesionalSeleccionado.id_profesional ===
                        p.id_profesional;
                    const tieneEspecialidades =
                      p.especialidades && p.especialidades.length > 0;
                    return (
                      <button
                        key={p.id_profesional}
                        onClick={() => seleccionarProfesional(p)}
                        className={`w-full text-left px-3 py-3 rounded-xl flex items-start gap-3 transition ${
                          seleccionado
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                            : `${tema.colores.secundario}`
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center font-bold text-xs">
                          {p.nombre?.[0]}
                          {p.apellido_paterno?.[0]}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              seleccionado
                                ? "text-white"
                                : tema.colores.texto
                            }`}
                          >
                            {p.nombre} {p.apellido_paterno}{" "}
                            {p.apellido_materno || ""}
                          </p>
                          <p
                            className={`text-[11px] ${
                              seleccionado
                                ? "text-white/80"
                                : tema.colores.textoSecundario
                            }`}
                          >
                            {p.tipo_profesional === "medico"
                              ? "Médico"
                              : p.tipo_profesional === "enfermera"
                              ? "Enfermería"
                              : p.tipo_profesional === "kinesiologo"
                              ? "Kinesiología"
                              : p.tipo_profesional === "tecnico_enfermeria"
                              ? "Técnico enfermería"
                              : p.tipo_profesional === "administrativo"
                              ? "Administrativo"
                              : "Otro profesional"}
                            {" · "}
                            {tieneEspecialidades
                              ? `${p.especialidades.length} especialidad(es)`
                              : "Sin especialidad configurada"}
                          </p>
                          {p.email && (
                            <p
                              className={`text-[11px] ${
                                seleccionado
                                  ? "text-white/70"
                                  : tema.colores.textoSecundario
                              }`}
                            >
                              {p.email}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className={tema.colores.textoSecundario}>
                    No hay profesionales para mostrar con los filtros
                    seleccionados.
                  </p>
                )}
              </div>
            </div>

            {/* resumen centro */}
            <div
              className={`p-4 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-xs font-bold text-white/80 mb-1">
                Centro médico
              </p>
              <p className="text-lg font-black text-white mb-1">
                {centroPrincipal?.nombre || "Centro sin nombre"}
              </p>
              {centroPrincipal ? (
                <>
                  <p className="text-[11px] text-white/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {centroPrincipal.ciudad}, {centroPrincipal.region}
                  </p>
                  <p className="text-[11px] text-white/80 mt-1">
                    Plan {centroPrincipal.plan.toUpperCase()} · Gestión de
                    profesionales
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-white/80">
                  Vincula este usuario a un centro para cargar profesionales.
                </p>
              )}
            </div>
          </div>

          {/* CONFIGURACIÓN ESPECIALIDADES */}
          <div className="xl:col-span-2 space-y-6">
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              {profesionalSeleccionado ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} text-white flex items-center justify-center font-bold text-lg`}
                      >
                        {profesionalSeleccionado.nombre?.[0]}
                        {profesionalSeleccionado.apellido_paterno?.[0]}
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {profesionalSeleccionado.nombre}{" "}
                          {profesionalSeleccionado.apellido_paterno}{" "}
                          {profesionalSeleccionado.apellido_materno || ""}
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          {profesionalSeleccionado.tipo_profesional === "medico"
                            ? "Médico / Profesional clínico"
                            : profesionalSeleccionado.tipo_profesional ===
                              "enfermera"
                            ? "Enfermería"
                            : profesionalSeleccionado.tipo_profesional ===
                              "kinesiologo"
                            ? "Kinesiología"
                            : profesionalSeleccionado.tipo_profesional ===
                              "tecnico_enfermeria"
                            ? "Técnico en enfermería"
                            : profesionalSeleccionado.tipo_profesional ===
                              "administrativo"
                            ? "Administrativo"
                            : "Otro profesional"}
                          {" · "}
                          {profesionalSeleccionado.estado === "activo"
                            ? "Activo"
                            : "Inactivo"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profesionalSeleccionado.especialidades
                        ?.filter((e) => e.principal)
                        .slice(0, 1)
                        .map((e) => (
                          <span
                            key={e.id_relacion}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-200 border border-emerald-500/40"
                          >
                            <Star className="w-3 h-3" /> Principal:{" "}
                            {e.nombre_especialidad}
                          </span>
                        ))}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-indigo-500/10 text-indigo-200 border border-indigo-500/40">
                        <ListFilter className="w-3 h-3" />{" "}
                        {(profesionalSeleccionado.especialidades || []).length}{" "}
                        especialidad(es)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    {/* catálogo especialidades */}
                    <div className="lg:col-span-2">
                      <p
                        className={`text-sm font-bold mb-2 ${tema.colores.texto}`}
                      >
                        Catálogo de especialidades
                      </p>
                      <p className={`text-xs mb-3 ${tema.colores.textoSecundario}`}>
                        Selecciona una o varias especialidades para este
                        profesional. Marca una como principal.
                      </p>
                      <div className="max-h-[360px] overflow-y-auto custom-scrollbar space-y-2">
                        {cargandoEspecialidades ? (
                          <>
                            <SkeletonLine tema={tema} />
                            <SkeletonLine tema={tema} />
                            <SkeletonLine tema={tema} />
                          </>
                        ) : especialidades.length ? (
                          especialidades.map((esp) => {
                            const checked =
                              seleccionEspecialidades.includes(
                                esp.id_especialidad
                              );
                            const esPrincipal =
                              especialidadPrincipalId === esp.id_especialidad;
                            return (
                              <div
                                key={esp.id_especialidad}
                                className={`flex items-start justify-between px-3 py-2 rounded-xl ${
                                  checked
                                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                                    : tema.colores.secundario
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      toggleEspecialidadSeleccion(
                                        esp.id_especialidad
                                      )
                                    }
                                    className="mt-1"
                                  />
                                  <div>
                                    <p
                                      className={`text-sm font-semibold ${
                                        checked ? "text-white" : tema.colores.texto
                                      }`}
                                    >
                                      {esp.nombre}
                                      {esp.codigo ? ` · ${esp.codigo}` : ""}
                                    </p>
                                    <p
                                      className={`text-[11px] ${
                                        checked
                                          ? "text-white/80"
                                          : tema.colores.textoSecundario
                                      }`}
                                    >
                                      {esp.area || "Área general"} ·{" "}
                                      {esp.activo ? "Activa" : "No activa"}
                                    </p>
                                    {esp.descripcion && (
                                      <p
                                        className={`text-[11px] mt-1 ${
                                          checked
                                            ? "text-white/80"
                                            : tema.colores.textoSecundario
                                        }`}
                                      >
                                        {esp.descripcion}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  disabled={!checked}
                                  onClick={() =>
                                    marcarComoPrincipal(esp.id_especialidad)
                                  }
                                  className={`text-[11px] px-2 py-1 rounded-full border ${
                                    esPrincipal
                                      ? "bg-yellow-400 text-black border-yellow-400"
                                      : checked
                                      ? "border-white/40 text-white"
                                      : "border-gray-400 text-gray-500 cursor-not-allowed opacity-50"
                                  }`}
                                >
                                  {esPrincipal ? "Principal" : "Hacer principal"}
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className={tema.colores.textoSecundario}>
                            No hay especialidades configuradas en este centro.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* resumen de asignación */}
                    <div>
                      <div
                        className={`p-4 rounded-2xl ${tema.colores.secundario}`}
                      >
                        <p
                          className={`text-sm font-bold mb-2 ${tema.colores.texto}`}
                        >
                          Resumen asignación
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Vista rápida de las especialidades que quedarán
                          asociadas a este profesional.
                        </p>
                        <div className="mt-3 space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                          {seleccionEspecialidades.length ? (
                            seleccionEspecialidades.map((idEsp) => {
                              const esp = especialidades.find(
                                (e) => e.id_especialidad === idEsp
                              );
                              if (!esp) return null;
                              const esPrincipal =
                                especialidadPrincipalId === idEsp;
                              return (
                                <div
                                  key={idEsp}
                                  className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/5"
                                >
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <div>
                                      <p
                                        className={`text-xs ${
                                          tema.colores.texto
                                        }`}
                                      >
                                        {esp.nombre}
                                      </p>
                                      {esp.area && (
                                        <p
                                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                                        >
                                          {esp.area}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {esPrincipal && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-400 text-black font-semibold">
                                      Principal
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>
                              Aún no se han seleccionado especialidades.
                            </p>
                          )}
                        </div>
                        <button
                          onClick={guardarAsignacion}
                          disabled={!profesionalSeleccionado || guardando}
                          className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${tema.colores.primario} text-white ${
                            guardando ? "opacity-70 cursor-wait" : ""
                          }`}
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              guardando ? "animate-spin" : ""
                            }`}
                          />
                          {guardando
                            ? "Guardando cambios..."
                            : "Guardar especialidades"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Users className={`w-10 h-10 mb-4 ${tema.colores.acento}`} />
                  <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                    Selecciona un profesional en la columna izquierda
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Desde ahí podrás configurar sus especialidades clínicas.
                  </p>
                </div>
              )}
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
                    <p className={tema.colores.texto}>
                      © 2025 AnyssaMed Platform
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Módulo de especialidades de profesionales
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
      <MobileBottomBar
        tema={tema}
        actual="/tecnico/perfil/especialidad"
      />

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
