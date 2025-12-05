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
  Star,
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

// === Certificaciones médicos ===
type EstadoCertificacion = "vigente" | "por_vencer" | "vencida" | "sin_registro";

interface MedicoCentro {
  id_medico: number;
  nombre: string;
  apellido: string;
  rut?: string | null;
  especialidad?: string | null;
  sucursal?: string | null;
  activo: boolean;
}

interface CertificacionCatalogo {
  id_certificacion: number;
  nombre: string;
  categoria?: string | null;
  obligatorio: boolean;
  validez_meses?: number | null;
}

interface CertificacionMedico {
  id?: number;
  id_medico: number;
  id_certificacion: number;
  estado: EstadoCertificacion;
  fecha_emision?: string | null;
  fecha_vencimiento?: string | null;
}

interface MetricasCertificaciones {
  total_medicos: number;
  medicos_completos: number;
  certs_por_vencer: number;
  certs_vencidas: number;
}

// endpoints sugeridos (ajusta a tu backend)
const ENDPOINTS = {
  medicos: "/api/tecnico/certificaciones/medicos",
  catalogo: "/api/tecnico/certificaciones/catalogo",
  medicoCerts: "/api/tecnico/certificaciones/medicos-certificaciones",
  guardarMedico: "/api/tecnico/certificaciones/medico",
  guardarCatalogo: "/api/tecnico/certificaciones/catalogo",
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
export default function CertificacionesMedicasPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [guardandoCatalogo, setGuardandoCatalogo] = useState(false);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // certificaciones
  const [medicos, setMedicos] = useState<MedicoCentro[]>([]);
  const [certificacionesCatalogo, setCertificacionesCatalogo] = useState<CertificacionCatalogo[]>(
    []
  );
  const [certificacionesMedicos, setCertificacionesMedicos] = useState<CertificacionMedico[]>([]);
  const [metricas, setMetricas] = useState<MetricasCertificaciones | null>(null);

  const [cargandoMedicos, setCargandoMedicos] = useState(true);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true);

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "completo" | "incompleto" | "alerta">(
    "todos"
  );

  const [medicoSeleccionadoId, setMedicoSeleccionadoId] = useState<number | null>(null);
  const [certParaAgregar, setCertParaAgregar] = useState<number | "">("");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);
  const centroPrincipal: CentroPrincipal | null = usuario?.centro_principal || null;
  const [estadisticas] = useState<EstadisticasTecnico | null>(null); // sólo para SidebarTecnico

  const cargandoMetricas = cargandoMedicos || cargandoCatalogo || cargandoAsignaciones;

  const menuItems = [
    { titulo: "Inicio", url: "/tecnico", icono: Home, activo: false },
    { titulo: "Tickets", url: "/tecnico/tickets", icono: ClipboardList, activo: false },
    { titulo: "Perfil", url: "/tecnico/perfil", icono: User, activo: true },
    { titulo: "Configuración", url: "/tecnico/configuracion", icono: Settings, activo: false },
  ];

  const medicoSeleccionado = useMemo(
    () => medicos.find((m) => m.id_medico === medicoSeleccionadoId) || null,
    [medicos, medicoSeleccionadoId]
  );

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
        const res = await fetch("/api/users/preferencias/tema", { credentials: "include" });
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

  // =============== cargar datos de certificaciones
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoMedicos(true);
        setCargandoCatalogo(true);
        setCargandoAsignaciones(true);

        const [resMedicos, resCatalogo, resAsignaciones] = await Promise.all([
          fetch(ENDPOINTS.medicos, { credentials: "include" }),
          fetch(ENDPOINTS.catalogo, { credentials: "include" }),
          fetch(ENDPOINTS.medicoCerts, { credentials: "include" }),
        ]);

        if (resMedicos.ok) {
          const data = await resMedicos.json();
          if (data.success && Array.isArray(data.medicos)) {
            setMedicos(data.medicos);
          }
        }

        if (resCatalogo.ok) {
          const data = await resCatalogo.json();
          if (data.success && Array.isArray(data.certificaciones)) {
            setCertificacionesCatalogo(data.certificaciones);
          }
        }

        if (resAsignaciones.ok) {
          const data = await resAsignaciones.json();
          if (data.success && Array.isArray(data.certificaciones_medicos)) {
            setCertificacionesMedicos(data.certificaciones_medicos);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargandoMedicos(false);
        setCargandoCatalogo(false);
        setCargandoAsignaciones(false);
      }
    };

    cargarDatos();
  }, []);

  // seleccionar primer médico por defecto
  useEffect(() => {
    if (!medicoSeleccionadoId && medicos.length) {
      setMedicoSeleccionadoId(medicos[0].id_medico);
    }
  }, [medicos, medicoSeleccionadoId]);

  // =============== helpers certificaciones
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

  const getEstadoGlobalMedico = (id_medico: number) => {
    const obligatorias = certificacionesCatalogo.filter((c) => c.obligatorio);
    const certsMed = certificacionesMedicos.filter((c) => c.id_medico === id_medico);

    if (!obligatorias.length) return "sin_registro";
    if (!certsMed.length) return "incompleto";

    let tieneFaltantes = false;
    let tieneAlerta = false;

    for (const certCat of obligatorias) {
      const cert = certsMed.find((c) => c.id_certificacion === certCat.id_certificacion);
      if (!cert || cert.estado === "sin_registro") {
        tieneFaltantes = true;
        continue;
      }
      if (cert.estado === "vencida" || cert.estado === "por_vencer") {
        tieneAlerta = true;
      }
    }

    if (tieneAlerta) return "alerta";
    if (tieneFaltantes) return "incompleto";
    return "completo";
  };

  const medicosFiltrados = useMemo(() => {
    return medicos.filter((m) => {
      const texto =
        `${m.nombre} ${m.apellido} ${m.especialidad || ""} ${m.sucursal || ""}`.toLowerCase();
      if (filtroTexto && !texto.includes(filtroTexto.toLowerCase())) return false;

      if (filtroEstado !== "todos") {
        const estado = getEstadoGlobalMedico(m.id_medico);
        if (filtroEstado === "completo" && estado !== "completo") return false;
        if (filtroEstado === "incompleto" && estado !== "incompleto") return false;
        if (filtroEstado === "alerta" && estado !== "alerta") return false;
      }

      return true;
    });
  }, [medicos, filtroTexto, filtroEstado, certificacionesCatalogo, certificacionesMedicos]);

  const certsMedicoSeleccionado = useMemo(
    () =>
      medicoSeleccionadoId
        ? certificacionesMedicos.filter((c) => c.id_medico === medicoSeleccionadoId)
        : [],
    [certificacionesMedicos, medicoSeleccionadoId]
  );

  const alertasCertificaciones = useMemo(
    () =>
      certificacionesMedicos.filter(
        (c) => c.estado === "por_vencer" || c.estado === "vencida"
      ),
    [certificacionesMedicos]
  );

  // recalcular métricas
  useEffect(() => {
    if (!medicos.length || !certificacionesCatalogo.length) {
      setMetricas(null);
      return;
    }

    const obligatorias = certificacionesCatalogo.filter((c) => c.obligatorio);
    const total_medicos = medicos.length;
    let medicos_completos = 0;
    let certs_por_vencer = 0;
    let certs_vencidas = 0;

    for (const medico of medicos) {
      const estado = getEstadoGlobalMedico(medico.id_medico);
      if (estado === "completo") medicos_completos++;
    }

    for (const cert of certificacionesMedicos) {
      if (cert.estado === "por_vencer") certs_por_vencer++;
      if (cert.estado === "vencida") certs_vencidas++;
    }

    setMetricas({
      total_medicos,
      medicos_completos,
      certs_por_vencer,
      certs_vencidas,
    });
  }, [medicos, certificacionesCatalogo, certificacionesMedicos]);

  const handleEstadoCertificacionChange = (
    id_medico: number,
    id_certificacion: number,
    nuevoEstado: EstadoCertificacion
  ) => {
    setCertificacionesMedicos((prev) => {
      const idx = prev.findIndex(
        (c) => c.id_medico === id_medico && c.id_certificacion === id_certificacion
      );
      if (idx === -1) {
        return [...prev, { id_medico, id_certificacion, estado: nuevoEstado }];
      }
      const copia = [...prev];
      copia[idx] = { ...copia[idx], estado: nuevoEstado };
      return copia;
    });
  };

  const handleFechaCertificacionChange = (
    id_medico: number,
    id_certificacion: number,
    campo: "fecha_emision" | "fecha_vencimiento",
    valor: string
  ) => {
    setCertificacionesMedicos((prev) => {
      const idx = prev.findIndex(
        (c) => c.id_medico === id_medico && c.id_certificacion === id_certificacion
      );
      if (idx === -1) {
        return [
          ...prev,
          {
            id_medico,
            id_certificacion,
            estado: "vigente",
            [campo]: valor,
          } as CertificacionMedico,
        ];
      }
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
  };

  const handleAgregarCertificacionMedico = () => {
    if (!medicoSeleccionadoId || certParaAgregar === "") return;
    setCertificacionesMedicos((prev) => {
      const exist = prev.some(
        (c) =>
          c.id_medico === medicoSeleccionadoId &&
          c.id_certificacion === (certParaAgregar as number)
      );
      if (exist) return prev;
      return [
        ...prev,
        {
          id_medico: medicoSeleccionadoId,
          id_certificacion: certParaAgregar as number,
          estado: "vigente",
        },
      ];
    });
    setCertParaAgregar("");
  };

  const guardarCambiosMedico = async () => {
    if (!medicoSeleccionadoId) return;

    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);

    try {
      const certsMedico = certificacionesMedicos.filter(
        (c) => c.id_medico === medicoSeleccionadoId
      );

      const res = await fetch(ENDPOINTS.guardarMedico, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medico_id: medicoSeleccionadoId,
          certificaciones: certsMedico,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo guardar las certificaciones");
      }

      setMensajeOk("Certificaciones del médico actualizadas correctamente ✅");
    } catch (e: any) {
      console.error(e);
      setMensajeError(e.message || "Error al guardar certificaciones");
    } finally {
      setGuardando(false);
    }
  };

  const guardarCatalogo = async () => {
    setGuardandoCatalogo(true);
    setMensajeOk(null);
    setMensajeError(null);

    try {
      const res = await fetch(ENDPOINTS.guardarCatalogo, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificaciones: certificacionesCatalogo,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo guardar el catálogo");
      }

      setMensajeOk("Catálogo de certificaciones actualizado correctamente ✅");
    } catch (e: any) {
      console.error(e);
      setMensajeError(e.message || "Error al guardar el catálogo");
    } finally {
      setGuardandoCatalogo(false);
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
            Cargando certificaciones médicas...
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
                placeholder="Buscar médicos, especialidades o sucursales..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className={`w-full pl-10 pr-12 py-2.5 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              {filtroTexto && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg"
                  onClick={() => setFiltroTexto("")}
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
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>Notificaciones</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <ShieldAlert className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Certificaciones próximas a vencer en tu centro
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 5 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <ClipboardList className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo médico agregado al centro
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 30 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <BellOff className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Recuerda revisar políticas de certificación
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 2 h</p>
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
              Certificaciones médicas del centro
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                <ShieldCheck className="w-3 h-3" /> Cumplimiento clínico
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Configura y controla las certificaciones obligatorias de los médicos del centro para
              mantener el cumplimiento y la seguridad del paciente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarCambiosMedico}
              disabled={guardando || !medicoSeleccionadoId}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.primario} text-white rounded-xl font-bold text-sm md:text-base ${
                guardando ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`} />
              {guardando ? "Guardando..." : "Guardar médico"}
            </button>
            <button
              onClick={guardarCatalogo}
              disabled={guardandoCatalogo}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold text-sm md:text-base ${
                guardandoCatalogo ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <FileText className={`w-4 h-4 ${guardandoCatalogo ? "animate-pulse" : ""}`} />
              Guardar catálogo
            </button>
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

        {/* quick filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado("incompleto")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Médicos con requisitos pendientes
          </button>
          <button
            onClick={() => setFiltroEstado("alerta")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Con certificaciones en alerta
          </button>
          <button
            onClick={() => {
              setFiltroEstado("todos");
              setFiltroTexto("");
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>

        {/* estadísticas dinámicas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cargandoMetricas ? (
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
                label="Médicos del centro"
                value={metricas ? String(metricas.total_medicos) : "0"}
                secondary={centroPrincipal ? centroPrincipal.nombre : "Centro sin nombre"}
                tema={tema}
              />
              <Estadistica
                icon={ShieldCheck}
                label="Médicos al día"
                value={metricas ? String(metricas.medicos_completos) : "0"}
                secondary="Con todas las certificaciones obligatorias vigentes"
                tema={tema}
              />
              <Estadistica
                icon={AlertTriangle}
                label="Por vencer"
                value={metricas ? String(metricas.certs_por_vencer) : "0"}
                secondary="Dentro de los próximos días"
                tema={tema}
              />
              <Estadistica
                icon={ShieldAlert}
                label="Vencidas"
                value={metricas ? String(metricas.certs_vencidas) : "0"}
                secondary="Requieren acción inmediata"
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
                Gestión centralizada de certificaciones para todo el equipo médico.
              </p>
            </div>

            {/* médicos del centro */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>Médicos del centro</p>
                    <p className={tema.colores.textoSecundario}>
                      Selecciona un médico para configurar sus certificaciones.
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full bg-black/10 text-white/80`}>
                  {medicos.length} médicos
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <select
                  value={filtroEstado}
                  onChange={(e) =>
                    setFiltroEstado(e.target.value as "todos" | "completo" | "incompleto" | "alerta")
                  }
                  className={`px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                >
                  <option value="todos">Todos</option>
                  <option value="completo">Al día</option>
                  <option value="incompleto">Con requisitos pendientes</option>
                  <option value="alerta">Con alertas</option>
                </select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {cargandoMedicos ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : medicosFiltrados.length ? (
                  medicosFiltrados.map((m) => {
                    const estado = getEstadoGlobalMedico(m.id_medico);
                    const activo = medicoSeleccionadoId === m.id_medico;

                    const estadoLabel =
                      estado === "completo"
                        ? "Al día"
                        : estado === "alerta"
                        ? "En alerta"
                        : estado === "incompleto"
                        ? "Pendiente"
                        : "Sin registro";

                    const estadoClasses =
                      estado === "completo"
                        ? "bg-green-500/10 text-green-300 border-green-500/30"
                        : estado === "alerta"
                        ? "bg-red-500/10 text-red-300 border-red-500/30"
                        : estado === "incompleto"
                        ? "bg-yellow-500/10 text-yellow-200 border-yellow-500/30"
                        : "bg-gray-500/10 text-gray-200 border-gray-500/30";

                    const certsMed = certificacionesMedicos.filter(
                      (c) => c.id_medico === m.id_medico
                    );

                    const obligatorias = certificacionesCatalogo.filter((c) => c.obligatorio);
                    const completadas = obligatorias.filter((c) =>
                      certsMed.some(
                        (cm) =>
                          cm.id_certificacion === c.id_certificacion &&
                          (cm.estado === "vigente" || cm.estado === "por_vencer")
                      )
                    ).length;

                    return (
                      <button
                        key={m.id_medico}
                        onClick={() => setMedicoSeleccionadoId(m.id_medico)}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-start justify-between gap-3 ${
                          activo
                            ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                            : `${tema.colores.secundario}`
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {m.nombre} {m.apellido}
                          </p>
                          <p
                            className={`text-[11px] ${
                              activo ? "text-white/80" : tema.colores.textoSecundario
                            }`}
                          >
                            {m.especialidad || "Especialidad no registrada"}
                            {m.sucursal ? ` · ${m.sucursal}` : ""}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              activo ? "text-white/70" : tema.colores.textoSecundario
                            }`}
                          >
                            {obligatorias.length
                              ? `${completadas}/${obligatorias.length} certificaciones obligatorias al día`
                              : "Sin certificaciones obligatorias definidas"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border ${estadoClasses}`}
                          >
                            {estadoLabel}
                          </span>
                          {m.rut && (
                            <span
                              className={`text-[10px] ${
                                activo ? "text-white/70" : tema.colores.textoSecundario
                              }`}
                            >
                              RUT: {m.rut}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className={tema.colores.textoSecundario}>
                    No se encontraron médicos con los filtros actuales.
                  </p>
                )}
              </div>
            </div>

            {/* alertas de certificaciones */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-4 ${tema.colores.texto}`}>
                Alertas de certificaciones
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {cargandoAsignaciones ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : alertasCertificaciones.length ? (
                  alertasCertificaciones.map((c, idx) => {
                    const medico = medicos.find((m) => m.id_medico === c.id_medico);
                    const cert = certificacionesCatalogo.find(
                      (cat) => cat.id_certificacion === c.id_certificacion
                    );
                    const isVencida = c.estado === "vencida";

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-xl ${
                          isVencida ? "bg-red-500/5" : "bg-yellow-500/5"
                        }`}
                      >
                        {isVencida ? (
                          <ShieldAlert className="w-4 h-4 mt-1 text-red-300" />
                        ) : (
                          <Clock className="w-4 h-4 mt-1 text-yellow-300" />
                        )}
                        <div className="flex-1">
                          <p className={tema.colores.texto}>
                            {cert?.nombre || "Certificación"} ·{" "}
                            {medico ? `${medico.nombre} ${medico.apellido}` : "Médico"}
                          </p>
                          <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                            Estado: {isVencida ? "VENCIDA" : "POR VENCER"}
                            {c.fecha_vencimiento ? ` · Vence: ${c.fecha_vencimiento}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className={tema.colores.textoSecundario}>
                    No hay certificaciones en alerta en este momento.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* col derecha */}
          <div className="xl:col-span-2 space-y-6">
            {/* detalle médico + certificaciones */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Certificaciones del médico
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Revisa y actualiza las certificaciones individuales de cada médico.
                    </p>
                  </div>
                </div>
                {medicoSeleccionado && (
                  <div className="hidden md:flex flex-col items-end">
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      {medicoSeleccionado.nombre} {medicoSeleccionado.apellido}
                    </p>
                    <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                      {medicoSeleccionado.especialidad || "Especialidad no registrada"}
                      {medicoSeleccionado.sucursal ? ` · ${medicoSeleccionado.sucursal}` : ""}
                    </p>
                  </div>
                )}
              </div>

              {!medicoSeleccionado ? (
                <p className={tema.colores.textoSecundario}>
                  Selecciona un médico en la columna izquierda para configurar sus certificaciones.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {medicoSeleccionado.especialidad && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {medicoSeleccionado.especialidad}
                      </span>
                    )}
                    {medicoSeleccionado.rut && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-xs">
                        RUT: {medicoSeleccionado.rut}
                      </span>
                    )}
                    {medicoSeleccionado.sucursal && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {medicoSeleccionado.sucursal}
                      </span>
                    )}
                  </div>

                  {/* agregar certificación */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <select
                      value={certParaAgregar}
                      onChange={(e) =>
                        setCertParaAgregar(
                          e.target.value ? Number(e.target.value) : ("" as typeof certParaAgregar)
                        )
                      }
                      className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="">Agregar certificación...</option>
                      {certificacionesCatalogo.map((c) => (
                        <option key={c.id_certificacion} value={c.id_certificacion}>
                          {c.nombre} {c.obligatorio ? "(Obligatoria)" : "(Opcional)"}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAgregarCertificacionMedico}
                      className={`px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.primario} text-white flex items-center gap-2`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>

                  {/* lista certificaciones del médico */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
                    {cargandoAsignaciones ? (
                      <>
                        <SkeletonLine tema={tema} />
                        <SkeletonLine tema={tema} />
                        <SkeletonLine tema={tema} />
                      </>
                    ) : certsMedicoSeleccionado.length ? (
                      certsMedicoSeleccionado.map((cert, idx) => {
                        const cat = certificacionesCatalogo.find(
                          (c) => c.id_certificacion === cert.id_certificacion
                        );
                        const obligatorio = cat?.obligatorio;

                        const estadoLabel =
                          cert.estado === "vigente"
                            ? "Vigente"
                            : cert.estado === "por_vencer"
                            ? "Por vencer"
                            : cert.estado === "vencida"
                            ? "Vencida"
                            : "Sin registro";

                        const estadoClasses =
                          cert.estado === "vigente"
                            ? "bg-green-500/10 text-green-300 border-green-500/30"
                            : cert.estado === "por_vencer"
                            ? "bg-yellow-500/10 text-yellow-200 border-yellow-500/30"
                            : cert.estado === "vencida"
                            ? "bg-red-500/10 text-red-200 border-red-500/30"
                            : "bg-gray-500/10 text-gray-200 border-gray-500/30";

                        return (
                          <div
                            key={idx}
                            className={`px-4 py-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 ${tema.colores.secundario}`}
                          >
                            <div className="flex-1">
                              <p className={tema.colores.texto}>
                                {cat?.nombre || "Certificación"}
                              </p>
                              <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                                {cat?.categoria || "Sin categoría definida"}
                                {obligatorio ? " · Obligatoria" : " · Opcional"}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:w-[55%]">
                              <select
                                value={cert.estado}
                                onChange={(e) =>
                                  handleEstadoCertificacionChange(
                                    cert.id_medico,
                                    cert.id_certificacion,
                                    e.target.value as EstadoCertificacion
                                  )
                                }
                                className={`px-2 py-1 rounded-lg text-[11px] border ${estadoClasses} bg-transparent`}
                              >
                                <option value="vigente">Vigente</option>
                                <option value="por_vencer">Por vencer</option>
                                <option value="vencida">Vencida</option>
                                <option value="sin_registro">Sin registro</option>
                              </select>
                              <input
                                type="date"
                                value={cert.fecha_emision || ""}
                                onChange={(e) =>
                                  handleFechaCertificacionChange(
                                    cert.id_medico,
                                    cert.id_certificacion,
                                    "fecha_emision",
                                    e.target.value
                                  )
                                }
                                className={`px-2 py-1 rounded-lg text-[11px] flex-1 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                              />
                              <input
                                type="date"
                                value={cert.fecha_vencimiento || ""}
                                onChange={(e) =>
                                  handleFechaCertificacionChange(
                                    cert.id_medico,
                                    cert.id_certificacion,
                                    "fecha_vencimiento",
                                    e.target.value
                                  )
                                }
                                className={`px-2 py-1 rounded-lg text-[11px] flex-1 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className={tema.colores.textoSecundario}>
                        Este médico aún no tiene certificaciones registradas. Añade una desde el
                        selector superior.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* catálogo certificaciones centro */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    Catálogo de certificaciones del centro
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Define qué certificaciones existen y cuáles son obligatorias para los médicos.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                {cargandoCatalogo ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : certificacionesCatalogo.length ? (
                  certificacionesCatalogo.map((c, idx) => (
                    <div
                      key={c.id_certificacion ?? idx}
                      className={`px-4 py-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 ${tema.colores.secundario}`}
                    >
                      <div className="flex-1">
                        <p className={tema.colores.texto}>{c.nombre}</p>
                        <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                          {c.categoria || "Sin categoría definida"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:w-[50%]">
                        <label
                          className="flex items-center gap-2 text-[11px] cursor-pointer select-none"
                          title="Define si esta certificación es obligatoria para el centro"
                        >
                          <input
                            type="checkbox"
                            checked={c.obligatorio}
                            onChange={(e) =>
                              setCertificacionesCatalogo((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, obligatorio: e.target.checked } : item
                                )
                              )
                            }
                          />
                          <span className={tema.colores.texto}>
                            {c.obligatorio ? "Obligatoria" : "Opcional"}
                          </span>
                        </label>
                        <div className="flex items-center gap-1 text-[11px] flex-1">
                          <span className={tema.colores.textoSecundario}>Validez (meses)</span>
                          <input
                            type="number"
                            min={0}
                            value={c.validez_meses ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCertificacionesCatalogo((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? {
                                        ...item,
                                        validez_meses: value === "" ? null : Number(value),
                                      }
                                    : item
                                )
                              );
                            }}
                            className={`w-20 px-2 py-1 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={tema.colores.textoSecundario}>
                    Aún no hay certificaciones definidas para el centro. Puedes crearlas desde tu
                    backend y se mostrarán aquí.
                  </p>
                )}
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
                      Módulo de certificaciones médicas
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
