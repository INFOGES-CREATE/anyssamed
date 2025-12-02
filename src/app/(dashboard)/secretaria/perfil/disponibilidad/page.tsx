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
  X,
  Check,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Info,
  AlertCircle,
  Clock3,
  Globe2,
} from "lucide-react";

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
    id_centro_principal: number | null;
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

// LO QUE REALMENTE DEVUELVE EL BACK NUEVO
interface DisponibilidadMedico {
  id_disponibilidad: number;
  id_profesional: number;
  id_centro: number;
  id_sucursal: number | null;
  dia_semana: "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";
  hora_inicio: string;
  hora_fin: string;
  fecha_especifica: string | null;
  es_recurrente: 0 | 1;
  tipo_atencion: "presencial" | "telemedicina" | "ambos" | string;
  max_pacientes: number | null;
  estado: "activo" | "inactivo" | "bloqueado" | "vacaciones" | "capacitacion";
  motivo_bloqueo: string | null;
  notas: string | null;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

const DIAS_ORDENADOS: Array<DisponibilidadMedico["dia_semana"]> = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const LABEL_DIA: Record<DisponibilidadMedico["dia_semana"], string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

function hoyComoEnum(): DisponibilidadMedico["dia_semana"] {
  const n = new Date().getDay(); // 0 = domingo
  switch (n) {
    case 0:
      return "domingo";
    case 1:
      return "lunes";
    case 2:
      return "martes";
    case 3:
      return "miercoles";
    case 4:
      return "jueves";
    case 5:
      return "viernes";
    case 6:
    default:
      return "sabado";
  }
}

export default function PerfilMedicoDisponibilidadPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadMedico[]>([]);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [diaSeleccionado, setDiaSeleccionado] = useState<DisponibilidadMedico["dia_semana"]>(
    hoyComoEnum()
  );

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<DisponibilidadMedico | null>(null);

  // campos modal
  const [formRecurrente, setFormRecurrente] = useState(true);
  const [formDia, setFormDia] = useState<DisponibilidadMedico["dia_semana"]>("lunes");
  const [formFechaUnica, setFormFechaUnica] = useState("");
  const [formInicio, setFormInicio] = useState("09:00");
  const [formFin, setFormFin] = useState("12:00");
  const [formTipo, setFormTipo] = useState<"presencial" | "telemedicina" | "ambos">("presencial");
  const [formMaxPac, setFormMaxPac] = useState<string>("");
  const [formEstado, setFormEstado] = useState<
    "activo" | "inactivo" | "bloqueado" | "vacaciones" | "capacitacion"
  >("activo");
  const [formNotas, setFormNotas] = useState("");
  const [formMotivo, setFormMotivo] = useState("");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const isLight = temaActual === "light";

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
          { titulo: "Credenciales", icono: ShieldCheck, url: "/medico/perfil/credenciales" },
          { titulo: "Disponibilidad", icono: Calendar, url: "/medico/perfil/disponibilidad" },
        ],
      },
      { titulo: "Configuración", icono: Settings, url: "/medico/configuracion" },
    ],
    []
  );

  // cargar datos
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/medico/perfil", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success) {
          setUsuario(data.usuario);
        } else {
          setMensajeError("No se pudo cargar tu perfil.");
        }

        const resDisp = await fetch("/api/medico/disponibilidad", { credentials: "include" });
        if (resDisp.ok) {
          const dataDisp = await resDisp.json();
          setDisponibilidades(dataDisp.disponibilidad || []);
        } else {
          setMensajeError("No se pudo cargar tu disponibilidad.");
        }
      } catch (e) {
        setMensajeError("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }

      try {
        const local = localStorage.getItem("tema_medico");
        if (local && local in TEMAS) setTemaActual(local as TemaColor);
      } catch {}
    })();
  }, []);

  // notificaciones
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

  // aplicar tema
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

  const unreadCount = useMemo(
    () => notificaciones.filter((n) => n.leida === 0).length,
    [notificaciones]
  );

  const recargarDisponibilidad = async () => {
    try {
      const res = await fetch("/api/medico/disponibilidad", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDisponibilidades(data.disponibilidad || []);
      }
    } catch {}
  };

  const abrirModalNueva = (dia?: DisponibilidadMedico["dia_semana"]) => {
    setEditando(null);
    setFormRecurrente(true);
    setFormDia(dia || "lunes");
    setFormFechaUnica("");
    setFormInicio("09:00");
    setFormFin("12:00");
    setFormTipo("presencial");
    setFormMaxPac("");
    setFormEstado("activo");
    setFormNotas("");
    setFormMotivo("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (d: DisponibilidadMedico) => {
    setEditando(d);
    setFormRecurrente(d.es_recurrente === 1);
    setFormDia(d.dia_semana);
    setFormFechaUnica(d.fecha_especifica || "");
    setFormInicio(d.hora_inicio);
    setFormFin(d.hora_fin);
    setFormTipo(
      d.tipo_atencion === "presencial" || d.tipo_atencion === "telemedicina" || d.tipo_atencion === "ambos"
        ? d.tipo_atencion
        : "presencial"
    );
    setFormMaxPac(d.max_pacientes ? String(d.max_pacientes) : "");
    setFormEstado(d.estado);
    setFormNotas(d.notas || "");
    setFormMotivo(d.motivo_bloqueo || "");
    setModalAbierto(true);
  };

  const guardarDisponibilidad = async () => {
    if (!formInicio || !formFin) {
      setMensajeError("Debes indicar hora de inicio y fin.");
      return;
    }

    if (!formRecurrente && !formFechaUnica) {
      setMensajeError("Para una disponibilidad puntual debes indicar la fecha.");
      return;
    }

    setGuardando(true);
    setMensajeError(null);
    setMensajeOk(null);

    const id_centro =
      usuario?.medico?.centro_principal?.id_centro ||
      usuario?.medico?.id_centro_principal ||
      null;

    const payload = {
      id_centro,
      dia_semana: formRecurrente ? formDia : undefined,
      fecha_especifica: !formRecurrente ? formFechaUnica : null,
      hora_inicio: formInicio,
      hora_fin: formFin,
      es_recurrente: formRecurrente,
      tipo_atencion: formTipo,
      max_pacientes: formMaxPac ? Number(formMaxPac) : null,
      estado: formEstado,
      motivo_bloqueo: formEstado !== "activo" ? formMotivo || null : null,
      notas: formNotas || null,
    };

    try {
      if (editando) {
        const res = await fetch(`/api/medico/disponibilidad/${editando.id_disponibilidad}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && (data.success ?? true)) {
          setMensajeOk("Disponibilidad actualizada.");
          setModalAbierto(false);
          await recargarDisponibilidad();
        } else {
          setMensajeError(data.message || "No se pudo actualizar.");
        }
      } else {
        const res = await fetch("/api/medico/disponibilidad", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && (data.success ?? true)) {
          setMensajeOk("Disponibilidad creada.");
          setModalAbierto(false);
          await recargarDisponibilidad();
        } else {
          setMensajeError(data.message || "No se pudo crear.");
        }
      }
    } catch (e) {
      setMensajeError("Error al guardar disponibilidad.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarDisponibilidad = async (id: number) => {
    if (!confirm("¿Eliminar esta franja de disponibilidad?")) return;
    try {
      const res = await fetch(`/api/medico/disponibilidad/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && (data.success ?? true)) {
        setMensajeOk("Disponibilidad eliminada.");
        await recargarDisponibilidad();
      } else {
        setMensajeError(data.message || "No se pudo eliminar.");
      }
    } catch {
      setMensajeError("Error al eliminar.");
    }
  };

  // resumen
  const resumen = useMemo(() => {
    const activas = disponibilidades.filter((d) => d.estado === "activo").length;
    const tele = disponibilidades.filter((d) => d.tipo_atencion === "telemedicina").length;
    const mixtas = disponibilidades.filter((d) => d.tipo_atencion === "ambos").length;
    const puntuales = disponibilidades.filter((d) => !!d.fecha_especifica).length;
    return { total: disponibilidades.length, activas, tele, mixtas, puntuales };
  }, [disponibilidades]);

  const porDia = useMemo(
    () =>
      disponibilidades.filter(
        (d) => d.es_recurrente === 1 && d.dia_semana === diaSeleccionado
      ),
    [disponibilidades, diaSeleccionado]
  );

  const puntuales = useMemo(
    () => disponibilidades.filter((d) => d.es_recurrente === 0 && d.fecha_especifica),
    [disponibilidades]
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
            Cargando tu disponibilidad...
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
                {usuario.medico.centro_principal?.logo_url ? (
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
                    {usuario.medico.centro_principal?.nombre}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.centro_principal?.ciudad},{" "}
                    {usuario.medico.centro_principal?.region}
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
              const activo = item.url === "/medico/perfil/disponibilidad";
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

          {/* bottom */}
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
                          <ShieldCheck className="w-4 h-4 text-indigo-400 mt-1" />
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
              Mi disponibilidad
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isLight
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "bg-indigo-500/10 text-indigo-100 border border-indigo-500/30"
                }`}
              >
                <Calendar className="w-3 h-3" /> Se usa en la agenda
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Define en qué días y horarios atiendes. Todo queda en tu perfil de médico.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => abrirModalNueva(diaSeleccionado)}
              className={`px-6 py-3 ${tema.colores.primario} ${tema.colores.primarioText} rounded-xl font-bold flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" /> Nueva franja
            </button>
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

        {/* alertas */}
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
            className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border flex items-center gap-3`}
          >
            <Clock3 className="w-10 h-10 text-indigo-400" />
            <div>
              <p className={tema.colores.texto}>Franjas activas</p>
              <p className="text-xs text-slate-400">
                {resumen.activas} de {resumen.total} totales
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-2xl ${
              resumen.puntuales > 0 ? "bg-amber-50 border-amber-100" : tema.colores.card
            } ${tema.colores.borde} border flex items-center gap-3`}
          >
            <AlertCircle
              className={`w-10 h-10 ${
                resumen.puntuales > 0 ? "text-amber-400" : "text-slate-300"
              }`}
            />
            <div>
              <p className={tema.colores.texto}>Puntuales</p>
              <p className="text-xs text-slate-400">
                {resumen.puntuales} fechas únicas
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* izquierda */}
          <div className="xl:col-span-2 space-y-6">
            {/* selector de días */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-lg font-bold ${tema.colores.texto} mb-3`}>Días de atención</p>
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                {DIAS_ORDENADOS.map((d) => {
                  const count = disponibilidades.filter(
                    (x) => x.es_recurrente === 1 && x.dia_semana === d
                  ).length;
                  return (
                    <button
                      key={d}
                      onClick={() => setDiaSeleccionado(d)}
                      className={`px-4 py-2 rounded-xl flex flex-col items-start min-w-[110px] ${
                        diaSeleccionado === d
                          ? isLight
                            ? "bg-indigo-50 border border-indigo-200"
                            : "bg-indigo-500/10 border border-indigo-500/30"
                          : isLight
                            ? "bg-slate-50 border border-slate-100"
                            : "bg-slate-900/30 border border-slate-800/50"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${
                          diaSeleccionado === d ? "text-indigo-700" : tema.colores.texto
                        }`}
                      >
                        {LABEL_DIA[d]}
                      </span>
                      <span className="text-[10px] text-slate-400">{count} franjas</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* listado del día */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    {LABEL_DIA[diaSeleccionado]}
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Estas franjas se usan tal cual en agenda.
                  </p>
                </div>
                <button
                  onClick={() => abrirModalNueva(diaSeleccionado)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${tema.colores.primario} ${tema.colores.primarioText}`}
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {porDia.length === 0 && (
                  <div
                    className={`p-5 rounded-xl ${tema.colores.cardAlt} border border-dashed ${tema.colores.borde} flex items-center gap-3`}
                  >
                    <Info className="w-6 h-6 text-indigo-400" />
                    <div>
                      <p className={tema.colores.texto}>
                        No tienes disponibilidad para este día.
                      </p>
                      <p className="text-xs text-slate-400">
                        Pulsa “Agregar” para crear una franja.
                      </p>
                    </div>
                  </div>
                )}

                {porDia.map((disp) => (
                  <div
                    key={disp.id_disponibilidad}
                    className={`p-4 rounded-xl flex items-center justify-between gap-4 ${
                      isLight ? "bg-white" : tema.colores.cardAlt
                    } border ${tema.colores.borde}`}
                  >
                    <div>
                      <p
                        className={`font-semibold ${tema.colores.texto} flex items-center gap-2 flex-wrap`}
                      >
                        {disp.hora_inicio} - {disp.hora_fin}
                        {disp.estado === "activo" ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Activa
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                            {disp.estado}
                          </span>
                        )}
                        {disp.tipo_atencion === "telemedicina" && (
                          <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            Telemedicina
                          </span>
                        )}
                        {disp.tipo_atencion === "ambos" && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Ambos
                          </span>
                        )}
                        {disp.max_pacientes && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            {disp.max_pacientes} cupos
                          </span>
                        )}
                      </p>
                      {disp.notas && (
                        <p className="text-[10px] text-slate-400 mt-1">{disp.notas}</p>
                      )}
                      {disp.motivo_bloqueo && (
                        <p className="text-[10px] text-red-400 mt-1">
                          Motivo: {disp.motivo_bloqueo}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditar(disp)}
                        className={`p-2 rounded-lg ${
                          isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-100"
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarDisponibilidad(disp.id_disponibilidad)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* puntuales */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>Fechas puntuales</p>
                  <p className={tema.colores.textoSecundario}>
                    Útil para feriados, campañas o días especiales.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormRecurrente(false);
                    setFormFechaUnica("");
                    setModalAbierto(true);
                    setEditando(null);
                    setFormDia("lunes");
                    setFormInicio("09:00");
                    setFormFin("12:00");
                    setFormTipo("presencial");
                    setFormEstado("activo");
                    setFormMaxPac("");
                    setFormNotas("");
                    setFormMotivo("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${tema.colores.primario} ${tema.colores.primarioText}`}
                >
                  <Plus className="w-4 h-4" />
                  Nueva puntual
                </button>
              </div>
              <div className="space-y-3">
                {puntuales.length === 0 && (
                  <div
                    className={`p-4 rounded-xl ${tema.colores.cardAlt} border border-dashed ${tema.colores.borde}`}
                  >
                    <p className={tema.colores.texto}>No hay fechas puntuales.</p>
                    <p className="text-xs text-slate-400">
                      Crea una para un día concreto.
                    </p>
                  </div>
                )}
                {puntuales.map((p) => (
                  <div
                    key={p.id_disponibilidad}
                    className={`p-4 rounded-xl flex items-center justify-between gap-4 ${
                      isLight ? "bg-white" : tema.colores.cardAlt
                    } border ${tema.colores.borde}`}
                  >
                    <div>
                      <p
                        className={`font-semibold ${tema.colores.texto} flex items-center gap-2 flex-wrap`}
                      >
                        {p.fecha_especifica} · {p.hora_inicio} - {p.hora_fin}
                        {p.estado === "activo" ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Activa
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                            {p.estado}
                          </span>
                        )}
                        {p.tipo_atencion === "telemedicina" && (
                          <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            Telemedicina
                          </span>
                        )}
                        {p.tipo_atencion === "ambos" && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Ambos
                          </span>
                        )}
                      </p>
                      {p.notas && (
                        <p className="text-[10px] text-slate-400 mt-1">{p.notas}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditar(p)}
                        className={`p-2 rounded-lg ${
                          isLight ? "bg-slate-100 text-slate-700" : "bg-slate-800 text-slate-100"
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarDisponibilidad(p.id_disponibilidad)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* derecha */}
          <div className="space-y-6">
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">Tu agenda</p>
              <p className="text-3xl font-black text-white mb-3 leading-tight">
                Dr. {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <p className="text-xs text-white/70 mb-2">
                Centro: {usuario.medico.centro_principal?.nombre}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-white/60">Total franjas</p>
                  <p className="text-xl font-bold text-white">
                    {resumen.total.toString().padStart(2, "0")}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-white/60">Activas</p>
                  <p className="text-xl font-bold text-white">
                    {resumen.activas.toString()}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] text-white/60">Tele/ambos</p>
                  <p className="text-xl font-bold text-white">
                    {(resumen.tele + resumen.mixtas).toString()}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-white/50 mt-4">
                La agenda solo usará las franjas activas. Puedes pausar una sin eliminarla.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-4 ${tema.colores.texto}`}>Recomendaciones</p>
              <ul className="space-y-3 text-sm">
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Mantén bloques de 3-4 horas máximo.
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Separa telemedicina de presencial para evitar solapamientos.
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Usa fechas puntuales para campañas y feriados.
                </li>
                <li className={`flex gap-2 ${tema.colores.textoSecundario}`}>
                  <Check className="w-4 h-4 text-green-400 mt-1" />
                  Este módulo solo muestra tu disponibilidad, no la del centro.
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
              <p className={tema.colores.textoSecundario}>Disponibilidad del médico</p>
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

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 relative">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {editando ? "Editar disponibilidad" : "Nueva disponibilidad"}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Define el día/fecha, horario, tipo y estado. Se guarda en tu perfil.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600 border rounded-lg px-3 py-2">
                  <input
                    type="radio"
                    checked={formRecurrente}
                    onChange={() => setFormRecurrente(true)}
                  />
                  Se repite cada semana
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 border rounded-lg px-3 py-2">
                  <input
                    type="radio"
                    checked={!formRecurrente}
                    onChange={() => setFormRecurrente(false)}
                  />
                  Solo una fecha
                </label>
              </div>

              {formRecurrente ? (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Día de la semana</label>
                  <select
                    value={formDia}
                    onChange={(e) =>
                      setFormDia(e.target.value as DisponibilidadMedico["dia_semana"])
                    }
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {DIAS_ORDENADOS.map((d) => (
                      <option key={d} value={d}>
                        {LABEL_DIA[d]}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Fecha única</label>
                  <input
                    type="date"
                    value={formFechaUnica}
                    onChange={(e) => setFormFechaUnica(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Hora inicio</label>
                  <input
                    type="time"
                    value={formInicio}
                    onChange={(e) => setFormInicio(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">Hora fin</label>
                  <input
                    type="time"
                    value={formFin}
                    onChange={(e) => setFormFin(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Tipo de atención
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as any)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="telemedicina">Telemedicina</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div className="w-32">
                    <label className="text-xs font-semibold text-slate-600">
                      Máx. pacientes
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMaxPac}
                      onChange={(e) => setFormMaxPac(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Estado</label>
                <select
                  value={formEstado}
                  onChange={(e) =>
                    setFormEstado(
                      e.target.value as
                        | "activo"
                        | "inactivo"
                        | "bloqueado"
                        | "vacaciones"
                        | "capacitacion"
                    )
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="capacitacion">Capacitación</option>
                </select>
              </div>

              {formEstado !== "activo" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Motivo</label>
                  <input
                    value={formMotivo}
                    onChange={(e) => setFormMotivo(e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Ej. vacaciones, congreso médico..."
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600">Notas</label>
                <textarea
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[70px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Ej. solo controles, dejar hueco para interconsultas..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarDisponibilidad}
                disabled={guardando}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar"}
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
