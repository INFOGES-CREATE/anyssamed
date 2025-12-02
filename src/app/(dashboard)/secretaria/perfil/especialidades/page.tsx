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
  TestTube,
  Video,
  Handshake,
  MessageSquare,
  User,
  Award,
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
  Plus,
  Trash2,
  Edit3,
  Info,
  Palette,
  Lock,
  Globe2,
  AlertCircle,
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

interface EspecialidadBase {
  id_especialidad: number;
  nombre: string;
  descripcion?: string | null;
  area_medica?: string | null;
  color?: string | null;
  requiere_certificacion?: boolean;
  icono_url?: string | null;
  codigo?: string | null;
}

interface EspecialidadMedicoDetallada {
  id_profesional: number;
  id_especialidad: number;
  nombre: string;
  es_principal: boolean;
  certificado_url?: string | null;
  fecha_certificacion?: string | null;
  institucion_certificadora?: string | null;
  anos_experiencia?: number | null;
  requiere_certificacion?: boolean;
  area_medica?: string | null;
  color?: string | null;
  descripcion?: string | null;
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
    especialidades: {
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }[];
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    calificacion_promedio: number;
    numero_opiniones: number;
    anos_experiencia: number;
    acepta_nuevos_pacientes: 0 | 1;
    consulta_telemedicina: 0 | 1;
    consulta_presencial: 0 | 1;
    duracion_consulta_min: number;
    firma_digital: 0 | 1;
    firma_digital_url?: string | null;
    verificado_por_admin: 0 | 1;
    requiere_revision_credenciales: 0 | 1;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  };
}

interface Notificacion {
  id_notificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: 0 | 1;
  fecha: string;
}

// ==========================================
// TEMAS
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

const CLASS_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#22C55E",
  "#F97316",
  "#EC4899",
  "#6366F1",
  "#0F172A",
];

// ==========================================
// PAGE
// ==========================================
export default function PerfilMedicoEspecialidadesPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [especialidadesMedico, setEspecialidadesMedico] = useState<
    EspecialidadMedicoDetallada[]
  >([]);
  const [catalogo, setCatalogo] = useState<EspecialidadBase[]>([]);
  const [buscandoCatalogo, setBuscandoCatalogo] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [inputEspecialidad, setInputEspecialidad] = useState("");
  const [buscarEspecialidad, setBuscarEspecialidad] = useState("");

  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "principal">("todas");

  // modal
  const [especialidadEditando, setEspecialidadEditando] =
    useState<EspecialidadMedicoDetallada | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editArea, setEditArea] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCertificadoUrl, setEditCertificadoUrl] = useState("");
  const [editFechaCert, setEditFechaCert] = useState("");
  const [editInstitucion, setEditInstitucion] = useState("");
  const [editAnos, setEditAnos] = useState<number | string>("");
  const [editRequiere, setEditRequiere] = useState(false);
  const [tabModal, setTabModal] = useState<"basico" | "respaldo" | "avanzado">("basico");

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
          { titulo: "Especialidades", icono: Award, url: "/medico/perfil/especialidades" },
          { titulo: "Credenciales", icono: ShieldCheck, url: "/medico/perfil/credenciales" },
          { titulo: "Disponibilidad", icono: Calendar, url: "/medico/perfil/disponibilidad" },
        ],
      },
      { titulo: "Configuración", icono: Settings, url: "/medico/configuracion" },
    ],
    []
  );

  // cargar datos iniciales (solo médico y sus especialidades)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/medico/perfil", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success) {
          setUsuario(data.usuario);
          if (data.usuario.medico?.especialidad_principal) {
            setInputEspecialidad(data.usuario.medico.especialidad_principal);
          }
        } else {
          setMensajeError("No se pudo cargar tu información.");
        }

        const resEsp = await fetch("/api/medico/especialidades", {
          credentials: "include",
        });
        if (resEsp.ok) {
          const dataEsp = await resEsp.json();
          setEspecialidadesMedico(dataEsp.especialidades || []);
        } else if (data?.usuario?.medico?.especialidades) {
          setEspecialidadesMedico(
            data.usuario.medico.especialidades.map((e: any) => ({
              id_profesional: data.usuario.medico.id_profesional,
              id_especialidad: e.id_especialidad,
              nombre: e.nombre,
              es_principal: e.es_principal,
            }))
          );
        }
      } catch (e) {
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

  // notificaciones (polling)
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

  // aplicar tema al body
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // buscar catálogo
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!buscarEspecialidad.trim()) {
        setCatalogo([]);
        return;
      }
      setBuscandoCatalogo(true);
      try {
        const res = await fetch(
          `/api/catalogo/especialidades?query=${encodeURIComponent(buscarEspecialidad)}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setCatalogo(data.especialidades || []);
        }
      } catch {}
      setBuscandoCatalogo(false);
    }, 350);
    return () => clearTimeout(t);
  }, [buscarEspecialidad]);

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

  const recargarEspecialidades = async () => {
    try {
      const resEsp = await fetch("/api/medico/especialidades", { credentials: "include" });
      if (resEsp.ok) {
        const dataEsp = await resEsp.json();
        setEspecialidadesMedico(dataEsp.especialidades || []);
      }
    } catch {}
  };

  // principal
  const guardarEspecialidadPrincipal = async (nombre?: string) => {
    const valor = (nombre ?? inputEspecialidad).trim();
    if (!valor) {
      setMensajeError("Escribe el nombre de la especialidad.");
      return;
    }
    setGuardando(true);
    setMensajeError(null);
    setMensajeOk(null);
    try {
      const res = await fetch("/api/medico/perfil", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profesional: {
            especialidad_principal: valor,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMensajeOk("Especialidad principal actualizada.");
        setUsuario(data.usuario);
        await recargarEspecialidades();
      } else {
        setMensajeError(data.message || "No se pudo guardar.");
      }
    } catch (e) {
      setMensajeError("Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  // agregar
  const agregarSecundaria = async (nombre: string) => {
    const valor = nombre.trim();
    if (!valor) return;
    setGuardando(true);
    setMensajeError(null);
    setMensajeOk(null);
    try {
      const res = await fetch("/api/medico/especialidades", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: valor, es_principal: false }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMensajeOk("Especialidad agregada.");
        setInputEspecialidad("");
        setBuscarEspecialidad("");
        await recargarEspecialidades();
      } else {
        setMensajeError(data.message || "No se pudo agregar.");
      }
    } catch (e) {
      setMensajeError("Error al agregar.");
    } finally {
      setGuardando(false);
    }
  };

  const hacerPrincipalDesdeTabla = async (_id: number, nombre: string) => {
    await guardarEspecialidadPrincipal(nombre);
  };

  // eliminar
  const eliminarEspecialidad = async (id_especialidad: number) => {
    if (!usuario?.medico?.id_profesional) return;
    if (!confirm("¿Quitar esta especialidad de tu perfil?")) return;
    try {
      let res = await fetch(`/api/medico/especialidades/${id_especialidad}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        res = await fetch("/api/medico/especialidades", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_especialidad,
            id_profesional: usuario.medico.id_profesional,
          }),
        });
      }

      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setMensajeOk("Especialidad eliminada.");
        await recargarEspecialidades();
      } else {
        setMensajeError(data.message || "No se pudo eliminar en el servidor.");
      }
    } catch (e) {
      setMensajeError("Error al eliminar (revisa el endpoint DELETE en tu API).");
    }
  };

  const abrirEdicion = (esp: EspecialidadMedicoDetallada) => {
    setEspecialidadEditando(esp);
    setEditNombre(esp.nombre);
    setEditArea(esp.area_medica || "");
    setEditColor(esp.color || "");
    setEditDescripcion(esp.descripcion || "");
    setEditCertificadoUrl(esp.certificado_url || "");
    setEditFechaCert(esp.fecha_certificacion || "");
    setEditInstitucion(esp.institucion_certificadora || "");
    setEditAnos(esp.anos_experiencia ?? "");
    setEditRequiere(!!esp.requiere_certificacion);
    setTabModal("basico");
  };

  const guardarEdicion = async () => {
    if (!especialidadEditando) return;
    try {
      const res = await fetch(`/api/medico/especialidades/${especialidadEditando.id_especialidad}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre,
          area_medica: editArea || null,
          color: editColor || null,
          descripcion: editDescripcion || null,
          requiere_certificacion: editRequiere,
          certificado_url: editCertificadoUrl || null,
          fecha_certificacion: editFechaCert || null,
          institucion_certificadora: editInstitucion || null,
          anos_experiencia: editAnos ? Number(editAnos) : null,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setMensajeOk("Especialidad actualizada.");
        setEspecialidadEditando(null);
        await recargarEspecialidades();
      } else {
        setMensajeError(data.message || "No se pudo actualizar.");
      }
    } catch {
      setMensajeError("Error al actualizar (revisa el PUT en tu API).");
    }
  };

  // resumen solo con datos del médico
  const resumen = useMemo(() => {
    const total = especialidadesMedico.length;
    const principal = especialidadesMedico.find((e) => e.es_principal) || null;
    const pendientes = especialidadesMedico.filter(
      (e) => e.requiere_certificacion && !e.certificado_url
    ).length;
    return { total, principal, pendientes };
  }, [especialidadesMedico]);

  // filtrar
  const listaFiltrada = useMemo(() => {
    if (filtro === "principal") return especialidadesMedico.filter((e) => e.es_principal);
    if (filtro === "pendientes")
      return especialidadesMedico.filter(
        (e) => e.requiere_certificacion && !e.certificado_url
      );
    return especialidadesMedico;
  }, [filtro, especialidadesMedico]);

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
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className={`${tema.colores.texto} text-base font-semibold`}>
            Cargando tus especialidades...
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

  const principal = resumen.principal;

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
              const activo = item.url === "/medico/perfil/especialidades";
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
              Mis especialidades
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isLight
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "bg-indigo-500/10 text-indigo-100 border border-indigo-500/30"
                }`}
              >
                <Award className="w-3 h-3" /> Perfil médico
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Mantén tu listado actualizado. Solo se muestran tus propias especialidades.
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

        {/* alertas de seguridad / estado médico */}
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
                  ? "Verificado por administración"
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
              resumen.pendientes > 0 ? "bg-amber-50 border-amber-100" : tema.colores.card
            } ${tema.colores.borde} border flex items-center gap-3`}
          >
            <AlertCircle
              className={`w-10 h-10 ${
                resumen.pendientes > 0 ? "text-amber-400" : "text-slate-300"
              }`}
            />
            <div>
              <p className={tema.colores.texto}>Pendientes</p>
              <p className="text-xs text-slate-400">
                {resumen.pendientes} requieren respaldo
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

        {/* contenido */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
          {/* izquierda */}
          <div className="2xl:col-span-2 space-y-6">
            {/* principal */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    Especialidad principal
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Esta es la que se mostrará primero en tu perfil.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={inputEspecialidad}
                  onChange={(e) => setInputEspecialidad(e.target.value)}
                  placeholder="Ej. Medicina Interna, Cardiología, Pediatría..."
                  className={`flex-1 px-4 py-3 rounded-xl ${
                    isLight ? "bg-white" : tema.colores.cardAlt
                  } ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    tema.colores.texto
                  }`}
                />
                <button
                  onClick={() => guardarEspecialidadPrincipal()}
                  disabled={guardando}
                  className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} ${
                    tema.colores.primarioText
                  } rounded-xl font-bold ${guardando ? "opacity-70 cursor-wait" : ""}`}
                >
                  <RefreshCw className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`} />
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
              {principal && (
                <div
                  className={`mt-4 inline-flex flex-wrap gap-2 items-center px-4 py-2 rounded-full text-sm ${
                    isLight
                      ? "bg-indigo-50 border border-indigo-200 text-indigo-700"
                      : "bg-indigo-500/10 border border-indigo-500/40 text-indigo-100"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Actual: {principal.nombre}
                  {usuario.medico.duracion_consulta_min ? (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                      {usuario.medico.duracion_consulta_min} min consulta
                    </span>
                  ) : null}
                  {usuario.medico.acepta_nuevos_pacientes ? (
                    <span className="text-[10px] bg-emerald-400/10 text-emerald-900 px-2 py-0.5 rounded-full">
                      Acepta nuevos pacientes
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* admin listado */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex flex-wrap items-center justify-between mb-4 gap-4 relative">
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    Administrar especialidades
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Añade, elimina o edita tu información profesional.
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    value={buscarEspecialidad}
                    onChange={(e) => setBuscarEspecialidad(e.target.value)}
                    placeholder="Buscar en catálogo..."
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isLight ? "bg-white" : tema.colores.cardAlt
                    } border ${tema.colores.borde} focus:outline-none`}
                  />
                  <div
                    className={`flex gap-1 rounded-xl ${
                      isLight ? "bg-slate-100" : "bg-slate-900/50"
                    } p-1`}
                  >
                    {[{ key: "todas", label: "Todas" }, { key: "pendientes", label: "Pendientes" }, { key: "principal", label: "Principal" }].map(
                      (f) => (
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
                      )
                    )}
                  </div>
                </div>

                {/* dropdown catálogo */}
                {catalogo.length > 0 && (
                  <div
                    className={`absolute top-14 right-0 w-72 max-h-60 overflow-y-auto rounded-xl ${
                      tema.colores.card
                    } border ${tema.colores.borde} ${tema.colores.sombra} p-2 space-y-1 z-30 ${
                      buscandoCatalogo ? "opacity-50" : ""
                    }`}
                  >
                    {catalogo.map((c) => (
                      <button
                        key={c.id_especialidad}
                        onClick={() => agregarSecundaria(c.nombre)}
                        className={`flex w-full items-center justify-between px-3 py-2 rounded-lg ${
                          tema.colores.hover
                        } ${tema.colores.texto}`}
                      >
                        <div>
                          <p className="text-sm">{c.nombre}</p>
                          {c.area_medica && (
                            <p className="text-[10px] text-slate-400">{c.area_medica}</p>
                          )}
                        </div>
                        <Plus className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {listaFiltrada.length === 0 && (
                  <div
                    className={`p-5 rounded-xl ${tema.colores.cardAlt} border border-dashed ${tema.colores.borde} flex items-center gap-3`}
                  >
                    <Info className="w-6 h-6 text-indigo-400" />
                    <div>
                      <p className={tema.colores.texto}>
                        No hay especialidades para este filtro.
                      </p>
                      <p className="text-xs text-slate-400">
                        Quita el filtro o agrega una nueva.
                      </p>
                    </div>
                  </div>
                )}

                {listaFiltrada.map((esp) => {
                  const tieneXP =
                    typeof esp.anos_experiencia === "number" && esp.anos_experiencia > 0;
                  const pendienteRespaldo =
                    esp.requiere_certificacion && !esp.certificado_url;

                  return (
                    <div
                      key={esp.id_especialidad}
                      className={`p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isLight ? "bg-white" : tema.colores.cardAlt
                      } border ${esp.es_principal ? "border-indigo-200" : tema.colores.borde}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                            esp.es_principal
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {esp.nombre.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-semibold ${tema.colores.texto} flex flex-wrap items-center gap-2 truncate`}
                          >
                            {esp.nombre}
                            {esp.es_principal && (
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                                Principal
                              </span>
                            )}
                            {pendienteRespaldo && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                Requiere respaldo
                              </span>
                            )}
                            {esp.certificado_url && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                Certificado
                              </span>
                            )}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {esp.area_medica ? esp.area_medica : "Área no especificada"}
                            {tieneXP ? ` · ${esp.anos_experiencia} años` : ""}
                          </p>
                          {esp.institucion_certificadora && (
                            <p className="text-[10px] text-slate-400">
                              Certificado por {esp.institucion_certificadora}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!esp.es_principal && (
                          <button
                            onClick={() =>
                              hacerPrincipalDesdeTabla(esp.id_especialidad, esp.nombre)
                            }
                            className={`text-xs px-3 py-1 rounded-lg ${
                              isLight
                                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                : "bg-indigo-500/10 text-indigo-50 hover:bg-indigo-500/20"
                            }`}
                          >
                            Hacer principal
                          </button>
                        )}
                        <button
                          onClick={() => abrirEdicion(esp)}
                          className={`p-2 rounded-lg ${
                            isLight
                              ? "bg-slate-100 text-slate-700"
                              : "bg-slate-800 text-slate-100"
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!esp.es_principal && (
                          <button
                            onClick={() => eliminarEspecialidad(esp.id_especialidad)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* derecha */}
          <div className="space-y-6">
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">Tu perfil profesional</p>
              <p className="text-3xl font-black text-white mb-3 leading-tight">
                Dr. {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <p className="text-xs text-white/70 mb-2">
                Centro: {usuario.medico.centro_principal.nombre}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-white/60">Total</p>
                  <p className="text-xl font-bold text-white">
                    {resumen.total.toString().padStart(2, "0")}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-white/60">Principal</p>
                  <p className="text-xl font-bold text-white">{principal ? "1" : "0"}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-white/60">Pendientes</p>
                  <p className="text-xl font-bold text-white">
                    {resumen.pendientes.toString()}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-white/50 mt-4">
                Si agregas una que no existe, el sistema la crea mínima y puedes completarla después.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-4 ${tema.colores.texto}`}>Buenas prácticas</p>
              <ul className="space-y-3 text-sm">
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Usa el nombre oficial de tu especialidad (colegio / registro).
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Completa institución y fecha si tu centro valida credenciales.
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Mantén siempre una sola marcada como principal.
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
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className={tema.colores.texto}>© 2025 Plataforma Médica</p>
              <p className={tema.colores.textoSecundario}>Gestión de especialidades</p>
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

      {/* MODAL EDICIÓN AVANZADA */}
      {especialidadEditando && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 relative">
            <button
              onClick={() => setEspecialidadEditando(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Editar {especialidadEditando.nombre}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Ajusta el nombre, área y respaldo de esta especialidad.
            </p>

            {/* tabs */}
            <div className="flex gap-2 mb-4">
              {["basico", "respaldo", "avanzado"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTabModal(t as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    tabModal === t ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {t === "basico" && "Datos básicos"}
                  {t === "respaldo" && "Respaldo"}
                  {t === "avanzado" && "Avanzado"}
                </button>
              ))}
            </div>

            {tabModal === "basico" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Nombre de la especialidad
                  </label>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Cardiología, Medicina Interna..."
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Área médica / grupo
                    </label>
                    <input
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Medicina Interna, Pediatría..."
                    />
                  </div>
                  <div className="w-36">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      Color <Palette className="w-3 h-3" />
                    </label>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {CLASS_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-md border ${
                            editColor === c ? "border-slate-950" : "border-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Descripción visible
                  </label>
                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Breve descripción que ayude a identificar esta especialidad."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="req-cert"
                    type="checkbox"
                    checked={editRequiere}
                    onChange={(e) => setEditRequiere(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="req-cert" className="text-xs text-slate-600">
                    Esta especialidad requiere respaldo / certificación
                  </label>
                </div>
              </div>
            )}

            {tabModal === "respaldo" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    URL del certificado / respaldo
                  </label>
                  <input
                    value={editCertificadoUrl}
                    onChange={(e) => setEditCertificadoUrl(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Institución certificadora
                    </label>
                    <input
                      value={editInstitucion}
                      onChange={(e) => setEditInstitucion(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Colegio Médico, Universidad..."
                    />
                  </div>
                  <div className="w-40">
                    <label className="text-xs font-semibold text-slate-600">
                      Fecha certificación
                    </label>
                    <input
                      type="date"
                      value={editFechaCert}
                      onChange={(e) => setEditFechaCert(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {tabModal === "avanzado" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Años de experiencia en esta especialidad
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editAnos}
                    onChange={(e) => setEditAnos(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Ej. 5"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Estos datos pueden ser usados por la agenda o la ficha para mostrar tu experiencia.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEspecialidadEditando(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600"
              >
                Guardar cambios
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
