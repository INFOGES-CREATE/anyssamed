"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  Award,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Lightbulb,
  LogOut,
  MessageSquare,
  Moon,
  Plug,
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
  Video,
  X,
  HeartPulse,
  Wifi,
  Star,
  Upload,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Link2,
  Activity,
  Clock,
  Lock,
  Laptop,
  History,
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

type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

interface HorarioCentro {
  id_horario?: number;
  dia_semana: DiaSemana;
  hora_apertura: string;
  hora_cierre: string;
  es_festivo: boolean;
  fecha_especifica?: string | null;
  nota?: string | null;
  // solo frontend
  habilitado?: boolean;
}

interface BloqueTecnico {
  id_bloque?: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  tipo: "soporte" | "guardia" | "remoto";
  activo: boolean;
  nota?: string | null;
}

interface FeriadoEspecial {
  id?: number;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  cerrado_completamente: boolean;
}

// ENDPOINTS sugeridos (ajusta a tu backend)
const API_HORARIOS = {
  resumen: "/api/tecnico/horarios/resumen",
  guardar: "/api/tecnico/horarios",
};

const DIAS_SEMANA: { id: DiaSemana; label: string; short: string }[] = [
  { id: "lunes", label: "Lunes", short: "Lun" },
  { id: "martes", label: "Martes", short: "Mar" },
  { id: "miercoles", label: "Miércoles", short: "Mié" },
  { id: "jueves", label: "Jueves", short: "Jue" },
  { id: "viernes", label: "Viernes", short: "Vie" },
  { id: "sabado", label: "Sábado", short: "Sáb" },
  { id: "domingo", label: "Domingo", short: "Dom" },
];

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

// Helpers
const buildDefaultHorariosCentro = (
  existentes: HorarioCentro[] | undefined
): HorarioCentro[] => {
  const base = existentes || [];
  return DIAS_SEMANA.map(({ id }) => {
    const encontrado = base.find(
      (h) => h.dia_semana === id && !h.fecha_especifica
    );
    if (encontrado) {
      return {
        ...encontrado,
        habilitado: !encontrado.es_festivo,
      };
    }
    return {
      dia_semana: id,
      hora_apertura: "09:00",
      hora_cierre: "18:00",
      es_festivo: false,
      fecha_especifica: null,
      nota: "",
      habilitado: id !== "domingo",
    };
  });
};

const labelDia = (dia: DiaSemana) => {
  const found = DIAS_SEMANA.find((d) => d.id === dia);
  return found?.label ?? dia;
};

// ===============
// PAGE
// ===============
export default function HorariosPerfilTecnicoPage() {
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

  const [vistaActiva, setVistaActiva] = useState<"centro" | "tecnico" | "especiales">(
    "centro"
  );

  const [horariosCentro, setHorariosCentro] = useState<HorarioCentro[]>([]);
  const [bloquesTecnico, setBloquesTecnico] = useState<BloqueTecnico[]>([]);
  const [feriados, setFeriados] = useState<FeriadoEspecial[]>([]);
  const [nuevoFeriado, setNuevoFeriado] = useState<FeriadoEspecial>({
    fecha: "",
    descripcion: "",
    cerrado_completamente: true,
  });

  const [zonaHoraria, setZonaHoraria] = useState<string>("America/Santiago");

  const [cargandoHorariosCentro, setCargandoHorariosCentro] = useState(true);
  const [cargandoBloquesTecnico, setCargandoBloquesTecnico] = useState(true);
  const [cargandoFeriados, setCargandoFeriados] = useState(true);

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
          if (u.tecnico?.zona_horaria) {
            setZonaHoraria(u.tecnico.zona_horaria);
          }
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

  // =============== cargar datos de horarios
  useEffect(() => {
    if (!usuario) return;

    const cargarHorarios = async () => {
      setCargandoHorariosCentro(true);
      setCargandoBloquesTecnico(true);
      setCargandoFeriados(true);
      try {
        const res = await fetch(API_HORARIOS.resumen, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setZonaHoraria(
              data.zona_horaria ||
                usuario.tecnico?.zona_horaria ||
                "America/Santiago"
            );

            const horariosApi: HorarioCentro[] =
              data.horarios_centro && Array.isArray(data.horarios_centro)
                ? data.horarios_centro
                : [];
            setHorariosCentro(buildDefaultHorariosCentro(horariosApi));

            const bloquesApi: BloqueTecnico[] =
              data.horarios_tecnico && Array.isArray(data.horarios_tecnico)
                ? data.horarios_tecnico
                : [];
            setBloquesTecnico(bloquesApi);

            const feriadosApi: FeriadoEspecial[] =
              data.feriados && Array.isArray(data.feriados)
                ? data.feriados
                : [];
            setFeriados(feriadosApi);
          }
        }
      } catch (e) {
        console.error("Error cargando horarios", e);
      } finally {
        setCargandoHorariosCentro(false);
        setCargandoBloquesTecnico(false);
        setCargandoFeriados(false);
      }
    };

    cargarHorarios();
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

  const actualizarHorarioCentro = (
    index: number,
    cambios: Partial<HorarioCentro>
  ) => {
    setHorariosCentro((prev) =>
      prev.map((h, i) => (i === index ? { ...h, ...cambios } : h))
    );
  };

  const toggleHabilitadoDia = (index: number) => {
    setHorariosCentro((prev) =>
      prev.map((h, i) =>
        i === index
          ? {
              ...h,
              habilitado: !h.habilitado,
            }
          : h
      )
    );
  };

  const copiarLunesATodos = () => {
    const lunes = horariosCentro.find((h) => h.dia_semana === "lunes");
    if (!lunes) return;
    setHorariosCentro((prev) =>
      prev.map((h) =>
        h.dia_semana === "lunes"
          ? h
          : {
              ...h,
              hora_apertura: lunes.hora_apertura,
              hora_cierre: lunes.hora_cierre,
              habilitado: lunes.habilitado,
            }
      )
    );
    setMensajeOk("Horario del lunes copiado al resto de la semana ✅");
  };

  const agregarBloqueTecnico = (dia: DiaSemana) => {
    setBloquesTecnico((prev) => [
      ...prev,
      {
        dia_semana: dia,
        hora_inicio: "09:00",
        hora_fin: "10:00",
        tipo: "soporte",
        activo: true,
        nota: "",
      },
    ]);
  };

  const actualizarBloqueTecnico = (
    index: number,
    cambios: Partial<BloqueTecnico>
  ) => {
    setBloquesTecnico((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...cambios } : b))
    );
  };

  const eliminarBloqueTecnico = (index: number) => {
    setBloquesTecnico((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarFeriado = () => {
    if (!nuevoFeriado.fecha || !nuevoFeriado.descripcion) {
      setMensajeError("Completa fecha y descripción del día especial");
      return;
    }
    setFeriados((prev) => [...prev, { ...nuevoFeriado }]);
    setNuevoFeriado({
      fecha: "",
      descripcion: "",
      cerrado_completamente: true,
    });
  };

  const eliminarFeriado = (index: number) => {
    setFeriados((prev) => prev.filter((_, i) => i !== index));
  };

  const guardarHorarios = async () => {
    if (!usuario) return;
    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);
    try {
      const payload = {
        horarios_centro: horariosCentro
          .filter((h) => h.habilitado)
          .map((h) => {
            const { habilitado, ...rest } = h;
            return { ...rest, es_festivo: false };
          }),
        horarios_tecnico: bloquesTecnico,
        feriados,
        zona_horaria: zonaHoraria,
      };

      const res = await fetch(API_HORARIOS.guardar, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMensajeOk("Horarios actualizados correctamente ✅");
      } else {
        setMensajeError(data.message || "No se pudo guardar los horarios");
      }
    } catch (e) {
      console.error(e);
      setMensajeError("Error al guardar los horarios");
    } finally {
      setGuardando(false);
    }
  };

  const nombreRol = usuario?.rol?.nombre || "Técnico";

  const diasAbiertos = horariosCentro.filter((h) => h.habilitado).length;
  const bloquesActivos = bloquesTecnico.filter((b) => b.activo).length;
  const feriadosActivos = feriados.length;

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
            Cargando horarios...
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
                placeholder="Buscar horarios, sucursales o configuraciones..."
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
                  3
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
                      <ClipboardList className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo cambio de horario solicitado
                        </p>
                        <p
                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                        >
                          hace 5 min
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <MessageSquare className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Comentario del supervisor sobre tu disponibilidad
                        </p>
                        <p
                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                        >
                          hace 15 min
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <BellOff className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Recuerda definir tus feriados personales
                        </p>
                        <p
                          className={`text-[10px] ${tema.colores.textoSecundario}`}
                        >
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
              Horarios & disponibilidad
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                <Clock className="w-3 h-3" /> Sincronizado con el centro
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Define los horarios de atención del centro y tus bloques de
              soporte como técnico.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarHorarios}
              disabled={guardando}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.primario} text-white rounded-xl font-bold text-sm md:text-base ${
                guardando ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`}
              />
              {guardando ? "Guardando..." : "Guardar horarios"}
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
            onClick={() => (window.location.href = "/tecnico/tickets")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <ClipboardList className="w-4 h-4" />
            Ver mis tickets
          </button>
          <button
            onClick={() => setVistaActiva("centro")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <Home className="w-4 h-4" />
            Horario del centro
          </button>
          <button
            onClick={() => setVistaActiva("tecnico")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <ShieldCheck className="w-4 h-4" />
            Horario personal
          </button>
        </div>

        {/* estadísticas horarios */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cargandoHorariosCentro || cargandoBloquesTecnico || cargandoFeriados ? (
            [1, 2, 3].map((i) => (
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
                icon={Home}
                label="Días abiertos"
                value={String(diasAbiertos)}
                secondary="Por semana calendario"
                tema={tema}
              />
              <Estadistica
                icon={Clock}
                label="Bloques personales"
                value={String(bloquesActivos)}
                secondary="Bloques activos de soporte"
                tema={tema}
              />
              <Estadistica
                icon={Calendar}
                label="Días especiales"
                value={String(feriadosActivos)}
                secondary="Feriados y excepciones"
                tema={tema}
              />
            </>
          )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* col izquierda: resumen */}
          <div className="xl:col-span-1 space-y-6">
            {/* resumen centro */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">
                Resumen de horarios
              </p>
              <p className="text-2xl md:text-3xl font-black text-white mb-3">
                {centroPrincipal?.nombre || "Centro sin nombre"}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span className="text-white text-sm">
                    {centroPrincipal
                      ? `${centroPrincipal.ciudad}, ${centroPrincipal.region}`
                      : "Ubicación no definida"}
                  </span>
                </div>
                <span className="text-xs bg-black/20 text-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  TZ: {zonaHoraria}
                </span>
              </div>
              <p className="text-[13px] text-white/90 flex items-center gap-1 mb-2">
                <Clock className="w-3 h-3" />
                Días abiertos: {diasAbiertos}/7
              </p>
              <p className="text-[13px] text-white/90 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Bloques personales activos: {bloquesActivos}
              </p>
            </div>

            {/* tips */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                Buenas prácticas de agenda
              </p>
              <ul className="space-y-2 text-xs list-disc list-inside">
                <li className={tema.colores.textoSecundario}>
                  Mantén al menos 1 hora “buffer” entre bloques críticos de
                  soporte.
                </li>
                <li className={tema.colores.textoSecundario}>
                  Define feriados con anticipación para que el call center y
                  secretaría no asignen tickets fuera de horario.
                </li>
                <li className={tema.colores.textoSecundario}>
                  Usa diferentes tipos de bloque (soporte/guardia/remoto) para
                  que el enrutamiento sea más inteligente.
                </li>
              </ul>
            </div>
          </div>

          {/* col derecha: tabs horarios */}
          <div className="xl:col-span-2 space-y-6">
            {/* tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "centro", label: "Horario del centro", icon: Home },
                { id: "tecnico", label: "Horario personal", icon: ShieldCheck },
                {
                  id: "especiales",
                  label: "Días especiales / feriados",
                  icon: Calendar,
                },
              ].map((tab) => {
                const active = vistaActiva === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setVistaActiva(tab.id as any)}
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

            {/* CENTRO */}
            {vistaActiva === "centro" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${tema.colores.texto}`}>
                        Horario general del centro
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Se utiliza para agendas, call center y validación de
                        tickets fuera de horario.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={copiarLunesATodos}
                    className="text-xs px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-200 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Copiar lunes al resto
                  </button>
                </div>

                <div className="space-y-3">
                  {cargandoHorariosCentro ? (
                    <>
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </>
                  ) : (
                    horariosCentro.map((h, index) => (
                      <div
                        key={h.dia_semana}
                        className={`p-4 rounded-2xl ${tema.colores.secundario} flex flex-col md:flex-row md:items-center gap-3`}
                      >
                        <div className="flex items-center gap-3 md:w-48">
                          <div className="w-9 h-9 rounded-xl bg-black/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`${tema.colores.texto} font-semibold`}>
                              {labelDia(h.dia_semana)}
                            </p>
                            <p
                              className={`text-xs ${
                                h.habilitado
                                  ? "text-green-400"
                                  : "text-red-300"
                              }`}
                            >
                              {h.habilitado ? "Abierto" : "Cerrado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row gap-3 md:items-center">
                          {h.habilitado ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  Apertura
                                </span>
                                <input
                                  type="time"
                                  value={h.hora_apertura}
                                  onChange={(e) =>
                                    actualizarHorarioCentro(index, {
                                      hora_apertura: e.target.value,
                                    })
                                  }
                                  className={`px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  Cierre
                                </span>
                                <input
                                  type="time"
                                  value={h.hora_cierre}
                                  onChange={(e) =>
                                    actualizarHorarioCentro(index, {
                                      hora_cierre: e.target.value,
                                    })
                                  }
                                  className={`px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                />
                              </div>
                            </>
                          ) : (
                            <p
                              className={`text-xs ${tema.colores.textoSecundario}`}
                            >
                              Día marcado como cerrado.
                            </p>
                          )}
                          <div className="flex-1">
                            <input
                              type="text"
                              value={h.nota || ""}
                              onChange={(e) =>
                                actualizarHorarioCentro(index, {
                                  nota: e.target.value,
                                })
                              }
                              placeholder="Nota opcional (Ej: solo urgencias, jornada reducida...)"
                              className={`w-full px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                            />
                          </div>
                        </div>

                        <div className="flex items-center md:flex-col gap-2">
                          <button
                            onClick={() => toggleHabilitadoDia(index)}
                            className={`text-[11px] px-3 py-1 rounded-full border ${
                              h.habilitado
                                ? "bg-green-500/10 border-green-500/40 text-green-300"
                                : "bg-red-500/10 border-red-500/40 text-red-200"
                            }`}
                          >
                            {h.habilitado ? "Marcar cerrado" : "Marcar abierto"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TECNICO */}
            {vistaActiva === "tecnico" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Bloques personales de soporte
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Estos bloques se usan para enrutar tickets y guardias que
                      dependan de ti.
                    </p>
                  </div>
                </div>

                {cargandoBloquesTecnico ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : (
                  <div className="space-y-4">
                    {DIAS_SEMANA.map(({ id, label }) => {
                      const bloquesDia = bloquesTecnico.filter(
                        (b) => b.dia_semana === id
                      );
                      return (
                        <div
                          key={id}
                          className={`p-4 rounded-2xl ${tema.colores.secundario}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <p
                                  className={`${tema.colores.texto} font-semibold`}
                                >
                                  {label}
                                </p>
                                <p
                                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                                >
                                  {bloquesDia.length
                                    ? `${bloquesDia.length} bloque(s) configurados`
                                    : "Sin bloques definidos"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => agregarBloqueTecnico(id)}
                              className="text-[11px] px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-200 flex items-center gap-1"
                            >
                              <PlusIconSmall />
                              Agregar bloque
                            </button>
                          </div>

                          <div className="space-y-2">
                            {bloquesDia.map((b, idxLocal) => {
                              const indexGlobal = bloquesTecnico.findIndex(
                                (global) =>
                                  global ===
                                  bloquesDia[idxLocal] /* misma ref */
                              );
                              const idx =
                                indexGlobal >= 0 ? indexGlobal : idxLocal;
                              return (
                                <div
                                  key={idx}
                                  className={`px-3 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border flex flex-col md:flex-row md:items-center gap-3`}
                                >
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={b.tipo}
                                      onChange={(e) =>
                                        actualizarBloqueTecnico(idx, {
                                          tipo: e.target
                                            .value as BloqueTecnico["tipo"],
                                        })
                                      }
                                      className={`text-xs px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                                    >
                                      <option value="soporte">Soporte</option>
                                      <option value="guardia">Guardia</option>
                                      <option value="remoto">Remoto</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                                    >
                                      Inicio
                                    </span>
                                    <input
                                      type="time"
                                      value={b.hora_inicio}
                                      onChange={(e) =>
                                        actualizarBloqueTecnico(idx, {
                                          hora_inicio: e.target.value,
                                        })
                                      }
                                      className={`px-2 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                    />
                                    <span
                                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                                    >
                                      Fin
                                    </span>
                                    <input
                                      type="time"
                                      value={b.hora_fin}
                                      onChange={(e) =>
                                        actualizarBloqueTecnico(idx, {
                                          hora_fin: e.target.value,
                                        })
                                      }
                                      className={`px-2 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={b.nota || ""}
                                      onChange={(e) =>
                                        actualizarBloqueTecnico(idx, {
                                          nota: e.target.value,
                                        })
                                      }
                                      placeholder="Nota opcional (Ej: guardia telefónica, remoto desde casa...)"
                                      className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        actualizarBloqueTecnico(idx, {
                                          activo: !b.activo,
                                        })
                                      }
                                      className={`text-[11px] px-3 py-1 rounded-full border ${
                                        b.activo
                                          ? "bg-green-500/10 border-green-500/40 text-green-300"
                                          : "bg-gray-500/10 border-gray-500/40 text-gray-200"
                                      }`}
                                    >
                                      {b.activo ? "Activo" : "Inactivo"}
                                    </button>
                                    <button
                                      onClick={() => eliminarBloqueTecnico(idx)}
                                      className="text-[11px] px-3 py-1 rounded-full bg-red-500/10 text-red-200"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ESPECIALES */}
            {vistaActiva === "especiales" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Días especiales y feriados
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Marca feriados, jornadas especiales o cierres
                      excepcionales del centro o de tu agenda.
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={nuevoFeriado.fecha}
                      onChange={(e) =>
                        setNuevoFeriado((p) => ({
                          ...p,
                          fecha: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                    >
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={nuevoFeriado.descripcion}
                      onChange={(e) =>
                        setNuevoFeriado((p) => ({
                          ...p,
                          descripcion: e.target.value,
                        }))
                      }
                      placeholder="Ej: Feriado local, capacitación, cierre por mantención..."
                      className={`w-full mt-1 px-3 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-xs focus:outline-none`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="cerradoCompleto"
                      type="checkbox"
                      checked={nuevoFeriado.cerrado_completamente}
                      onChange={(e) =>
                        setNuevoFeriado((p) => ({
                          ...p,
                          cerrado_completamente: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="cerradoCompleto"
                      className={`text-xs ${tema.colores.texto}`}
                    >
                      Cierre completo del día
                    </label>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={agregarFeriado}
                      className="w-full text-xs px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-200 flex items-center justify-center gap-1"
                    >
                      <PlusIconSmall />
                      Agregar día especial
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {cargandoFeriados ? (
                    <>
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </>
                  ) : feriados.length ? (
                    feriados.map((f, idx) => (
                      <div
                        key={`${f.fecha}-${idx}`}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <div>
                          <p className={tema.colores.texto}>{f.descripcion}</p>
                          <p
                            className={`text-xs ${tema.colores.textoSecundario}`}
                          >
                            {f.fecha} ·{" "}
                            {f.cerrado_completamente
                              ? "Cierre completo"
                              : "Horario especial"}
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarFeriado(idx)}
                          className="text-[11px] px-3 py-1 rounded-full bg-red-500/10 text-red-200"
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className={tema.colores.textoSecundario}>
                      No hay días especiales configurados.
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
                      Configuración de horarios del técnico
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
      <MobileBottomBar tema={tema} actual="/tecnico/perfil/horarios" />

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

// iconito "+" pequeño para no depender de más librerías
function PlusIconSmall() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
