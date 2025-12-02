// frontend/src/app/(dashboard)/tecnico/perfil/page.tsx
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

interface MetricasTecnico {
  tickets_totales: number;
  tickets_semana: number;
  sla_promedio: number; // minutos
  calificacion: number;
  completitud_perfil: number;
}

interface ActividadReciente {
  tipo: "ticket" | "mensaje" | "sistema" | "llamada";
  titulo: string;
  fecha: string;
  descripcion?: string;
}

interface DisponibilidadDia {
  dia: string;
  bloques: string[];
}

interface DocumentoVerificado {
  id: string | number;
  tipo: string;
  estado: "aprobado" | "pendiente" | "rechazado";
  fecha_subida: string;
  comentario?: string;
}

interface Integracion {
  nombre: string;
  clave: string;
  conectado: boolean;
  actualizado?: string;
}

interface AuditoriaItem {
  id: string | number;
  accion: string;
  fecha: string;
  ip?: string;
  agente?: string;
}

// endpoints sugeridos (ajusta a tu backend)
const ENDPOINTS = {
  metricas: "/api/tecnico/metricas",
  actividad: "/api/tecnico/actividad-reciente",
  disponibilidad: "/api/tecnico/disponibilidad",
  documentos: "/api/tecnico/documentos",
  integraciones: "/api/tecnico/integraciones",
  auditoria: "/api/tecnico/auditoria?limit=5",
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
export default function PerfilTecnicoPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // formularios
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const [formPersonal, setFormPersonal] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    ciudad: "",
    region: "",
  });

  const [formTecnico, setFormTecnico] = useState({
    area_tecnica: "",
    tipo_tecnico: "soporte" as TecnicoSesionDatos["tipo_tecnico"],
    turno: "completo" as TecnicoSesionDatos["turno"],
    hora_inicio: "",
    hora_fin: "",
    nivel_acceso: "basico" as TecnicoSesionDatos["nivel_acceso"],
    extension_telefonica: "",
    disponibilidad: "disponible" as TecnicoSesionDatos["disponibilidad"],
    prioridad: "media" as TecnicoSesionDatos["prioridad"],
    especialidad_tecnica: "",
    certificaciones: "",
  });

  const [formPreferencias, setFormPreferencias] = useState({
    tema_color: "light" as TemaColor,
    idioma: "es-CL",
    perfil_publico: true,
    mostrar_calificacion: true,
    mostrar_agenda: false,
  });

  const [formNotificaciones, setFormNotificaciones] = useState({
    email_citas: true,
    email_mensajes: true,
    push_alertas: true,
    recordatorios: true,
  });

  const [formPublico, setFormPublico] = useState({
    bio: "",
    web: "",
    linkedin: "",
    twitter: "",
  });

  const [seccionActiva, setSeccionActiva] = useState<
    "personal" | "tecnico" | "preferencias" | "publico" | "seguridad" | "documentos" | "integraciones"
  >("personal");

  // datos dinámicos
  const [metricas, setMetricas] = useState<MetricasTecnico | null>(null);
  const [actividad, setActividad] = useState<ActividadReciente[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDia[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoVerificado[]>([]);
  const [integraciones, setIntegraciones] = useState<Integracion[]>([]);
  const [auditoria, setAuditoria] = useState<AuditoriaItem[]>([]);

  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const [cargandoActividad, setCargandoActividad] = useState(true);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(true);
  const [cargandoDocumentos, setCargandoDocumentos] = useState(true);
  const [cargandoIntegraciones, setCargandoIntegraciones] = useState(true);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(true);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const centroPrincipal: CentroPrincipal | null = usuario?.centro_principal || null;
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);

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

          setFormPersonal({
            nombre: u.nombre || "",
            apellido_paterno: u.apellido_paterno || "",
            apellido_materno: u.apellido_materno || "",
            email: u.email || "",
            telefono: u.telefono || "",
            ciudad: u.ciudad || "",
            region: u.region || "",
          });

          const t = (u as any).tecnico as TecnicoSesionDatos | undefined;
          if (t) {
            setFormTecnico({
              area_tecnica: t.area_tecnica || "",
              tipo_tecnico: t.tipo_tecnico || "soporte",
              turno: t.turno || "completo",
              hora_inicio: t.hora_inicio || "",
              hora_fin: t.hora_fin || "",
              nivel_acceso: t.nivel_acceso || "basico",
              extension_telefonica: t.extension_telefonica || "",
              disponibilidad: t.disponibilidad || "disponible",
              prioridad: t.prioridad || "media",
              especialidad_tecnica: t.especialidad_tecnica || "",
              certificaciones: t.certificaciones || "",
            });
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
          setFormPreferencias((prev) => ({ ...prev, tema_color: local as TemaColor }));
        }
        const res = await fetch("/api/users/preferencias/tema", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tema_color && data.tema_color in TEMAS) {
            setTemaActual(data.tema_color as TemaColor);
            setFormPreferencias((prev) => ({ ...prev, tema_color: data.tema_color as TemaColor }));
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

  // =============== cargar datos dinámicos
  useEffect(() => {
    // métricas
    const fetchMetricas = async () => {
      setCargandoMetricas(true);
      try {
        const res = await fetch(ENDPOINTS.metricas, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          if (d.success) {
            setMetricas({
              tickets_totales: d.tickets_totales ?? d.tickets_resueltos ?? 0,
              tickets_semana: d.tickets_semana ?? d.tickets_semana_actual ?? 0,
              sla_promedio: d.sla_promedio ?? d.tiempo_promedio_resolucion ?? 0,
              calificacion: d.calificacion ?? d.calificacion_promedio ?? 5,
              completitud_perfil: d.completitud_perfil ?? 80,
            });
          }
        }
      } catch {
        /* fallback */
      } finally {
        setCargandoMetricas(false);
      }
    };
    // actividad
    const fetchActividad = async () => {
      setCargandoActividad(true);
      try {
        const res = await fetch(ENDPOINTS.actividad, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.actividad)) setActividad(d.actividad);
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoActividad(false);
      }
    };
    // disponibilidad
    const fetchDisp = async () => {
      setCargandoDisponibilidad(true);
      try {
        const res = await fetch(ENDPOINTS.disponibilidad, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.dias)) setDisponibilidad(d.dias);
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoDisponibilidad(false);
      }
    };
    // documentos
    const fetchDocs = async () => {
      setCargandoDocumentos(true);
      try {
        const res = await fetch(ENDPOINTS.documentos, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.documentos)) setDocumentos(d.documentos);
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoDocumentos(false);
      }
    };
    // integraciones
    const fetchInt = async () => {
      setCargandoIntegraciones(true);
      try {
        const res = await fetch(ENDPOINTS.integraciones, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.integraciones)) setIntegraciones(d.integraciones);
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoIntegraciones(false);
      }
    };
    // auditoría
    const fetchAud = async () => {
      setCargandoAuditoria(true);
      try {
        const res = await fetch(ENDPOINTS.auditoria, { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          if (d.success && Array.isArray(d.logs)) setAuditoria(d.logs);
        }
      } catch {
        /* ignore */
      } finally {
        setCargandoAuditoria(false);
      }
    };

    fetchMetricas();
    fetchActividad();
    fetchDisp();
    fetchDocs();
    fetchInt();
    fetchAud();
  }, []);

  // =============== helpers
  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
    setFormPreferencias((prev) => ({ ...prev, tema_color: nuevo }));
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

 
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setFotoPreview(preview);
    const formData = new FormData();
    formData.append("foto", file);
    try {
      const res = await fetch("/api/users/perfil/foto", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.foto_perfil_url) {
        setUsuario((prev) => (prev ? { ...prev, foto_perfil_url: data.foto_perfil_url } : prev));
        setMensajeOk("Foto de perfil actualizada");
      } else {
        setMensajeError("No se pudo actualizar la foto");
      }
    } catch {
      setMensajeError("Error al subir la foto");
    }
  };

  const guardarPerfil = async () => {
    if (!usuario) return;
    setGuardando(true);
    setMensajeOk(null);
    setMensajeError(null);
    try {
      const res = await fetch("/api/tecnico/perfil", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal: formPersonal,
          tecnico: formTecnico,
          preferencias: formPreferencias,
          notificaciones: formNotificaciones,
          publico: formPublico,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMensajeOk("Perfil técnico actualizado correctamente ✅");
      } else {
        setMensajeError(data.message || "No se pudo guardar");
      }
    } catch {
      setMensajeError("Error al guardar el perfil");
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
          <p className={`${tema.colores.texto} text-lg font-semibold`}>Cargando perfil técnico...</p>
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
            No se pudo cargar el perfil
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
                placeholder="Buscar tickets, equipos o configuraciones..."
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
                      <ClipboardList className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo ticket asignado al técnico
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 5 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <MessageSquare className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo mensaje interno del supervisor
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 10 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <BellOff className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Revisa tus tickets con SLA próximo a vencer
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 1 h</p>
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
              Mi perfil técnico
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                <ShieldCheck className="w-3 h-3" /> Soporte verificado
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Administra tus datos personales, parámetros técnicos y cómo se muestra tu actividad en
              el panel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarPerfil}
              disabled={guardando}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 ${tema.colores.primario} text-white rounded-xl font-bold text-sm md:text-base ${
                guardando ? "opacity-70 cursor-wait" : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${guardando ? "animate-spin" : ""}`} />
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
            onClick={() => setSeccionActiva("documentos")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <FolderOpen className="w-4 h-4" />
            Subir credenciales
          </button>
          <button
            onClick={() => setSeccionActiva("preferencias")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <Settings className="w-4 h-4" />
            Ajustar panel
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
                icon={ClipboardList}
                label="Tickets totales"
                value={metricas ? metricas.tickets_totales.toLocaleString() : "0"}
                secondary="Histórico resueltos"
                tema={tema}
              />
              <Estadistica
                icon={Activity}
                label="Tickets esta semana"
                value={metricas ? String(metricas.tickets_semana) : "0"}
                secondary="Incluye todas las colas"
                tema={tema}
              />
              <Estadistica
                icon={Clock}
                label="SLA promedio"
                value={
                  metricas
                    ? `${Math.round(metricas.sla_promedio || 0)} min`
                    : "—"
                }
                secondary="Tiempo medio de resolución"
                tema={tema}
              />
              <Estadistica
                icon={Shield}
                label="Perfil completo"
                value={`${metricas ? metricas.completitud_perfil : 80}%`}
                secondary="Completa tus datos técnicos"
                tema={tema}
              />
            </>
          )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* col izquierda */}
          <div className="xl:col-span-1 space-y-6">
            {/* foto */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-lg font-bold mb-4 ${tema.colores.texto}`}>Foto de perfil</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-28">
                  <div
                    className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-2xl font-bold overflow-hidden`}
                  >
                    {fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : usuario.foto_perfil_url ? (
                      <Image
                        src={usuario.foto_perfil_url}
                        alt={usuario.nombre}
                        fill
                        className="object-cover rounded-2xl"
                      />
                    ) : (
                      `${usuario.nombre?.[0] || ""}${usuario.apellido_paterno?.[0] || ""}`
                    )}
                  </div>
                  <label
                    htmlFor="fotoPerfil"
                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg cursor-pointer"
                    title="Cambiar foto"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                  <input
                    id="fotoPerfil"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${tema.colores.textoSecundario} mb-2`}>
                    Se mostrará en el panel técnico, módulos de tickets y auditoría.
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Máx: 2MB</p>
                </div>
              </div>
            </div>

            {/* resumen */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">Resumen del perfil técnico</p>
              <p className="text-2xl md:text-3xl font-black text-white mb-3">
                {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-white text-sm font-semibold">
                    {usuario.tecnico?.calificacion_promedio?.toFixed(1) ||
                      metricas?.calificacion?.toFixed(1) ||
                      "5.0"}
                  </span>
                </div>
                {usuario.tecnico ? (
                  <span className="text-white/80 text-xs flex items-center gap-1">
                    <Activity className="w-4 h-4" />

                    {(usuario?.tecnico?.area_tecnica || "Área no definida")} · 
                    {(usuario?.tecnico?.tipo_tecnico
                      ? usuario.tecnico.tipo_tecnico.toUpperCase()
                      : "TIPO NO DEFINIDO")}
                  </span>

                ) : (
                  <span className="text-white text-sm font-semibold flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {nombreRol}
                  </span>
                )}
              </div>
              {centroPrincipal ? (
                <>
                  <p className="text-[13px] text-white/90 flex items-center gap-1 mb-2">
                    <Shield className="w-3 h-3" />
                    Centro: {centroPrincipal.nombre}
                  </p>
                  <p className="text-[13px] text-white/90 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {centroPrincipal.ciudad}, {centroPrincipal.region}
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-white/90 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Rol: {nombreRol}
                </p>
              )}
            </div>

            {/* estado verificación + plan */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                Estado de verificación
              </p>
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-300">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={tema.colores.texto}>Identidad confirmada</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>RUT / DNI validado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-300">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={tema.colores.texto}>Certificaciones técnicas</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Recomendado subir respaldos de formación y cursos.
                    </p>
                  </div>
                  <button
                    onClick={() => setSeccionActiva("documentos")}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Subir
                  </button>
                </div>
              </div>
              <div
                className={`p-3 rounded-xl ${tema.colores.secundario} flex items-center gap-3 justify-between`}
              >
                <div>
                  <p className={tema.colores.texto}>
                    Plan:{" "}
                    {centroPrincipal?.plan ? centroPrincipal.plan.toUpperCase() : "STANDARD"}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Cuenta del centro</p>
                </div>
                <Link href="/tecnico/configuracion" className="text-xs text-indigo-400">
                  Ver límites
                </Link>
              </div>
            </div>

            {/* actividad */}
            <div
              className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <p className={`text-sm font-bold mb-4 ${tema.colores.texto}`}>Actividad reciente</p>
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {cargandoActividad ? (
                  <>
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                    <SkeletonLine tema={tema} />
                  </>
                ) : actividad.length ? (
                  actividad.map((act, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          act.tipo === "ticket"
                            ? "bg-blue-500/10 text-blue-200"
                            : act.tipo === "mensaje"
                            ? "bg-green-500/10 text-green-200"
                            : act.tipo === "llamada"
                            ? "bg-emerald-500/10 text-emerald-200"
                            : "bg-gray-500/10 text-gray-200"
                        } flex items-center justify-center`}
                      >
                        {act.tipo === "ticket" ? (
                          <ClipboardList className="w-5 h-5" />
                        ) : act.tipo === "mensaje" ? (
                          <MessageSquare className="w-5 h-5" />
                        ) : act.tipo === "llamada" ? (
                          <Phone className="w-5 h-5" />
                        ) : (
                          <Activity className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${tema.colores.texto}`}>{act.titulo}</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          {act.descripcion || "Actualización"}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {act.fecha}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={tema.colores.textoSecundario}>Sin actividad reciente.</p>
                )}
              </div>
            </div>
          </div>

          {/* col derecha: tabs */}
          <div className="xl:col-span-2 space-y-6">
            {/* tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "personal", label: "Personal", icon: User },
                { id: "tecnico", label: "Datos técnicos", icon: ShieldCheck },
                { id: "preferencias", label: "Preferencias", icon: Settings },
                { id: "publico", label: "Público", icon: Globe },
                { id: "documentos", label: "Documentos", icon: FileText },
                { id: "integraciones", label: "Integraciones", icon: Plug },
                { id: "seguridad", label: "Seguridad", icon: Lock },
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

            {/* PERSONAL */}
            {seccionActiva === "personal" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${tema.colores.texto}`}>
                        Información personal
                      </p>
                      <p className={tema.colores.textoSecundario}>
                        Datos básicos de tu cuenta como técnico.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Nombre
                    </label>
                    <input
                      value={formPersonal.nombre}
                      onChange={(e) =>
                        setFormPersonal((p) => ({ ...p, nombre: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Apellido paterno
                    </label>
                    <input
                      value={formPersonal.apellido_paterno}
                      onChange={(e) =>
                        setFormPersonal((p) => ({ ...p, apellido_paterno: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Apellido materno
                    </label>
                    <input
                      value={formPersonal.apellido_materno || ""}
                      onChange={(e) =>
                        setFormPersonal((p) => ({ ...p, apellido_materno: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Email
                    </label>
                    <div className="relative mt-1">
                      <Mail
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                      />
                      <input
                        value={formPersonal.email}
                        onChange={(e) =>
                          setFormPersonal((p) => ({ ...p, email: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Teléfono
                    </label>
                    <div className="relative mt-1">
                      <Phone
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                      />
                      <input
                        value={formPersonal.telefono}
                        onChange={(e) =>
                          setFormPersonal((p) => ({ ...p, telefono: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Ciudad
                    </label>
                    <div className="relative mt-1">
                      <MapPin
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                      />
                      <input
                        value={formPersonal.ciudad}
                        onChange={(e) =>
                          setFormPersonal((p) => ({ ...p, ciudad: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Región
                    </label>
                    <input
                      value={formPersonal.region}
                      onChange={(e) =>
                        setFormPersonal((p) => ({ ...p, region: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TÉCNICO */}
            {seccionActiva === "tecnico" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    Información técnica del rol
                  </p>
                  <p className={tema.colores.textoSecundario}>
                    Estos datos se usan para enrutar tickets, turnos y colas de soporte.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Área técnica principal
                    </label>
                    <input
                      value={formTecnico.area_tecnica}
                      onChange={(e) =>
                        setFormTecnico((p) => ({ ...p, area_tecnica: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      placeholder="Ej: Soporte de usuarios, Servidores, Redes..."
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Tipo de técnico
                    </label>
                    <select
                      value={formTecnico.tipo_tecnico}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          tipo_tecnico: e.target.value as TecnicoSesionDatos["tipo_tecnico"],
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="soporte">Soporte</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="ingenieria">Ingeniería</option>
                      <option value="biomedico">Biomédico</option>
                      <option value="sistemas">Sistemas</option>
                      <option value="infraestructura">Infraestructura</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Turno de trabajo
                    </label>
                    <select
                      value={formTecnico.turno}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          turno: e.target.value as TecnicoSesionDatos["turno"],
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="manana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="noche">Noche</option>
                      <option value="completo">Turno completo</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Extensión telefónica
                    </label>
                    <input
                      value={formTecnico.extension_telefonica}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          extension_telefonica: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      placeholder="Ej: 1234"
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Hora inicio
                    </label>
                    <input
                      type="time"
                      value={formTecnico.hora_inicio}
                      onChange={(e) =>
                        setFormTecnico((p) => ({ ...p, hora_inicio: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Hora término
                    </label>
                    <input
                      type="time"
                      value={formTecnico.hora_fin}
                      onChange={(e) =>
                        setFormTecnico((p) => ({ ...p, hora_fin: e.target.value }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Nivel de acceso
                    </label>
                    <select
                      value={formTecnico.nivel_acceso}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          nivel_acceso: e.target.value as TecnicoSesionDatos["nivel_acceso"],
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="basico">Básico</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Disponibilidad
                    </label>
                    <select
                      value={formTecnico.disponibilidad}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          disponibilidad: e.target.value as TecnicoSesionDatos["disponibilidad"],
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="ocupado">Ocupado</option>
                      <option value="fuera_servicio">Fuera de servicio</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Prioridad de atención
                    </label>
                    <select
                      value={formTecnico.prioridad}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          prioridad: e.target.value as TecnicoSesionDatos["prioridad"],
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Especialidad técnica
                    </label>
                    <input
                      value={formTecnico.especialidad_tecnica}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          especialidad_tecnica: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                      placeholder="Ej: Redes Cisco, Servidores Linux..."
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Certificaciones relevantes
                    </label>
                    <textarea
                      value={formTecnico.certificaciones}
                      onChange={(e) =>
                        setFormTecnico((p) => ({
                          ...p,
                          certificaciones: e.target.value,
                        }))
                      }
                      rows={3}
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="Ej: ITIL, Cisco, Microsoft, otros..."
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Bloques de soporte (preview)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cargandoDisponibilidad ? (
                      <>
                        <SkeletonLine tema={tema} />
                        <SkeletonLine tema={tema} />
                      </>
                    ) : disponibilidad.length ? (
                      disponibilidad.map((d, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
                        >
                          <p className="text-xs font-semibold">{d.dia}</p>
                          <p className="text-[11px] opacity-80">
                            {d.bloques && d.bloques.length ? d.bloques.join(", ") : "Sin bloques"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className={tema.colores.textoSecundario}>
                        Aún no se han configurado bloques de soporte para tu usuario.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCIAS */}
            {seccionActiva === "preferencias" && (
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
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>Preferencias</p>
                    <p className={tema.colores.textoSecundario}>
                      Personaliza la experiencia de tu panel técnico.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Tema de la interfaz
                    </label>
                    <select
                      value={formPreferencias.tema_color}
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
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Idioma
                    </label>
                    <div className="relative mt-1">
                      <Globe
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                      />
                      <select
                        value={formPreferencias.idioma}
                        onChange={(e) =>
                          setFormPreferencias((p) => ({ ...p, idioma: e.target.value }))
                        }
                        className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                      >
                        <option value="es-CL">Español (Chile)</option>
                        <option value="es-ES">Español (España)</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>
                  </div>
                </div>

                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>Notificaciones</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <span className={tema.colores.texto}>Correo por tickets asignados</span>
                    <input
                      type="checkbox"
                      checked={formNotificaciones.email_citas}
                      onChange={() =>
                        setFormNotificaciones((p) => ({ ...p, email_citas: !p.email_citas }))
                      }
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <span className={tema.colores.texto}>Correo por mensajes internos</span>
                    <input
                      type="checkbox"
                      checked={formNotificaciones.email_mensajes}
                      onChange={() =>
                        setFormNotificaciones((p) => ({
                          ...p,
                          email_mensajes: !p.email_mensajes,
                        }))
                      }
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <span className={tema.colores.texto}>Alertas push críticas</span>
                    <input
                      type="checkbox"
                      checked={formNotificaciones.push_alertas}
                      onChange={() =>
                        setFormNotificaciones((p) => ({
                          ...p,
                          push_alertas: !p.push_alertas,
                        }))
                      }
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <span className={tema.colores.texto}>Recordatorios generales</span>
                    <input
                      type="checkbox"
                      checked={formNotificaciones.recordatorios}
                      onChange={() =>
                        setFormNotificaciones((p) => ({
                          ...p,
                          recordatorios: !p.recordatorios,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            )}

            {/* PUBLICO */}
            {seccionActiva === "publico" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>Perfil público</p>
                    <p className={tema.colores.textoSecundario}>
                      Esto puede mostrarse en tu ficha interna o para otros roles del sistema.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Descripción / bio breve
                    </label>
                    <textarea
                      value={formPublico.bio}
                      onChange={(e) =>
                        setFormPublico((p) => ({ ...p, bio: e.target.value }))
                      }
                      rows={3}
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="Ej: Técnico de soporte con foco en continuidad operativa y atención a usuarios..."
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Sitio web
                      </label>
                      <div className="relative mt-1">
                        <Link2
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                        />
                        <input
                          value={formPublico.web}
                          onChange={(e) =>
                            setFormPublico((p) => ({ ...p, web: e.target.value }))
                          }
                          className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        LinkedIn
                      </label>
                      <div className="relative mt-1">
                        <Linkedin
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                        />
                        <input
                          value={formPublico.linkedin}
                          onChange={(e) =>
                            setFormPublico((p) => ({ ...p, linkedin: e.target.value }))
                          }
                          className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        X / Twitter
                      </label>
                      <div className="relative mt-1">
                        <Twitter
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
                        />
                        <input
                          value={formPublico.twitter}
                          onChange={(e) =>
                            setFormPublico((p) => ({ ...p, twitter: e.target.value }))
                          }
                          className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none`}
                          placeholder="https://x.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENTOS */}
            {seccionActiva === "documentos" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>
                      Documentos y credenciales
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Sube tus certificados, cursos y respaldos.
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex gap-2 flex-wrap">
                  <label
                    htmlFor="docFile"
                    className={`px-4 py-2 rounded-xl text-sm cursor-pointer ${tema.colores.secundario} flex items-center gap-2`}
                  >
                    <Upload className="w-4 h-4" />
                    Subir documento
                  </label>
                  <input id="docFile" type="file" className="hidden" />
                  <button
                    className={`px-4 py-2 rounded-xl text-sm ${tema.colores.secundario} flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Ver políticas
                  </button>
                </div>

                <div className="space-y-3">
                  {cargandoDocumentos ? (
                    <>
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </>
                  ) : documentos.length ? (
                    documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <div>
                          <p className={tema.colores.texto}>{doc.tipo}</p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Subido: {doc.fecha_subida}
                          </p>
                          {doc.comentario ? (
                            <p className="text-[11px] text-red-300 mt-1">{doc.comentario}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full ${
                              doc.estado === "aprobado"
                                ? "bg-green-500/10 text-green-300"
                                : doc.estado === "pendiente"
                                ? "bg-yellow-500/10 text-yellow-200"
                                : "bg-red-500/10 text-red-200"
                            }`}
                          >
                            {doc.estado.toUpperCase()}
                          </span>
                          <button className="text-xs text-indigo-400">Ver</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={tema.colores.textoSecundario}>
                      No hay documentos cargados aún.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* INTEGRACIONES */}
            {seccionActiva === "integraciones" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Plug className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>Integraciones</p>
                    <p className={tema.colores.textoSecundario}>
                      Conecta herramientas externas de soporte y colaboración.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {cargandoIntegraciones ? (
                    <>
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </>
                  ) : integraciones.length ? (
                    integraciones.map((intg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <div>
                          <p className={tema.colores.texto}>{intg.nombre}</p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {intg.actualizado
                              ? `Actualizado ${intg.actualizado}`
                              : "Sincroniza tu cuenta"}
                          </p>
                        </div>
                        <button
                          className={`text-xs px-3 py-1 rounded-lg ${
                            intg.conectado
                              ? "bg-green-500/10 text-green-200"
                              : "bg-indigo-500/10 text-indigo-200"
                          }`}
                        >
                          {intg.conectado ? "Conectado" : "Conectar"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <>
                      <div
                        className={`flex items-center justify-between px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <div>
                          <p className={tema.colores.texto}>Microsoft Teams</p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Coordina soporte remoto
                          </p>
                        </div>
                        <button className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-200">
                          Conectar
                        </button>
                      </div>
                      <div
                        className={`flex items-center justify-between px-4 py-3 rounded-xl ${tema.colores.secundario}`}
                      >
                        <div>
                          <p className={tema.colores.texto}>Zoom</p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Sesiones de soporte remoto
                          </p>
                        </div>
                        <button className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-200">
                          Conectar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SEGURIDAD */}
            {seccionActiva === "seguridad" && (
              <div
                className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${tema.colores.texto}`}>Seguridad</p>
                    <p className={tema.colores.textoSecundario}>
                      Controla tu sesión y accesos críticos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${tema.colores.secundario} flex items-start gap-3`}>
                    <Shield className="w-5 h-5 mt-1" />
                    <div>
                      <p className={tema.colores.texto}>Autenticación en dos pasos</p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                        Recomendado para proteger accesos a infraestructura crítica.
                      </p>
                      <button className="text-xs text-indigo-400 hover:underline">Activar</button>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario} flex items-start gap-3`}>
                    <ShieldAlert className="w-5 h-5 mt-1 text-yellow-300" />
                    <div>
                      <p className={tema.colores.texto}>Alertas de acceso</p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                        Notificar accesos no reconocidos o desde nuevos dispositivos.
                      </p>
                      <button className="text-xs text-indigo-400 hover:underline">Configurar</button>
                    </div>
                  </div>
                </div>

                <p className={`text-sm font-bold mt-6 mb-3 ${tema.colores.texto}`}>
                  Dispositivos recientes
                </p>
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5" />
                      <div>
                        <p className={tema.colores.texto}>Chrome · Windows</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Curicó · ahora
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-300 px-2 py-1 rounded-full">
                      Activo
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5" />
                      <div>
                        <p className={tema.colores.texto}>Mobile Safari · iPhone</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>hace 3 días</p>
                      </div>
                    </div>
                    <button className="text-[11px] text-red-300 hover:underline">
                      Cerrar sesión
                    </button>
                  </div>
                </div>

                <p className={`text-sm font-bold mt-6 mb-3 ${tema.colores.texto}`}>
                  Última actividad sensible
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {cargandoAuditoria ? (
                    <>
                      <SkeletonLine tema={tema} />
                      <SkeletonLine tema={tema} />
                    </>
                  ) : auditoria.length ? (
                    auditoria.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-2 rounded-xl ${tema.colores.hover}`}
                      >
                        <History className="w-4 h-4 mt-1" />
                        <div className="flex-1">
                          <p className={tema.colores.texto}>{log.accion}</p>
                          <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                            {log.fecha} {log.ip ? `· ${log.ip}` : ""}{" "}
                            {log.agente ? `· ${log.agente}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={tema.colores.textoSecundario}>
                      Sin registros de auditoría recientes.
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
                    <p className={tema.colores.texto}>© 2025 AnyssaMed Platform</p>
                    <p className={tema.colores.textoSecundario}>Perfil técnico del usuario</p>
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
