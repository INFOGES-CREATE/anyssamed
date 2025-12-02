// frontend/src/app/(dashboard)/medico/perfil/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
  Handshake,
  Home,
  Lightbulb,
  LogOut,
  MessageSquare,
  Moon,
  Pill,
  Plug,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  TestTube,
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
  medico?: {
    id_profesional: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
}

interface MetricasMedico {
  pacientes_totales: number;
  citas_semana: number;
  tasa_asistencia: number;
  calificacion: number;
  completitud_perfil: number;
}

interface ActividadReciente {
  tipo: "cita" | "mensaje" | "interconsulta" | "receta" | "sistema";
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
  metricas: "/api/medico/metricas",
  actividad: "/api/medico/actividad-reciente",
  disponibilidad: "/api/medico/disponibilidad",
  documentos: "/api/medico/documentos",
  integraciones: "/api/medico/integraciones",
  auditoria: "/api/medico/auditoria?limit=5",
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
    nombre: "Verde Médico",
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
    { label: "Inicio", icon: Home, href: "/medico" },
    { label: "Agenda", icon: Calendar, href: "/medico/agenda" },
    { label: "Pacientes", icon: Users, href: "/medico/pacientes" },
    { label: "Perfil", icon: User, href: "/medico/perfil" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-black/40 backdrop-blur-md border-t border-white/5">
      {items.map((item) => {
        const active = item.href === actual;
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
            <item.icon className="w-5 h-5" />
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
export default function PerfilMedicoPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
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
  const [formProfesional, setFormProfesional] = useState({
    numero_registro_medico: "",
    titulo_profesional: "",
    especialidad_principal: "",
    anos_experiencia: 0,
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
    "personal" | "profesional" | "preferencias" | "publico" | "seguridad" | "documentos" | "integraciones"
  >("personal");

  // datos dinámicos
  const [metricas, setMetricas] = useState<MetricasMedico | null>(null);
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

  // =============== cargar sesión
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error("No hay sesión");
        const data = await res.json();

        if (data.success && data.usuario) {
          // validar rol médico
          const rolesUsuario: string[] = [];
          if (data.usuario.rol?.nombre) {
            rolesUsuario.push(
              data.usuario.rol.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
            );
          }
          if (Array.isArray(data.usuario.roles)) {
            data.usuario.roles.forEach((r: any) => {
              if (r?.nombre) {
                rolesUsuario.push(
                  r.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
                );
              }
            });
          }
          const tieneRolMedico = rolesUsuario.some((r) => r.includes("MEDICO"));
          if (!tieneRolMedico) {
            alert("Este módulo es solo para médicos.");
            window.location.href = "/";
            return;
          }

          setUsuario(data.usuario);
          setFormPersonal({
            nombre: data.usuario.nombre || "",
            apellido_paterno: data.usuario.apellido_paterno || "",
            apellido_materno: data.usuario.apellido_materno || "",
            email: data.usuario.email || "",
            telefono: data.usuario.telefono || "",
            ciudad: data.usuario.ciudad || "",
            region: data.usuario.region || "",
          });
          if (data.usuario.medico) {
            setFormProfesional({
              numero_registro_medico: data.usuario.medico.numero_registro_medico || "",
              titulo_profesional: data.usuario.medico.titulo_profesional || "",
              especialidad_principal:
                data.usuario.medico.especialidades?.find((e: any) => e.es_principal)?.nombre ||
                data.usuario.medico.especialidades?.[0]?.nombre ||
                "",
              anos_experiencia: data.usuario.medico.anos_experiencia || 0,
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
        const local = localStorage.getItem("tema_medico");
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
            localStorage.setItem("tema_medico", data.tema_color);
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
              pacientes_totales: d.pacientes_totales ?? 0,
              citas_semana: d.citas_semana ?? 0,
              tasa_asistencia: d.tasa_asistencia ?? 0,
              calificacion: d.calificacion ?? 5,
              completitud_perfil: d.completitud_perfil ?? 75,
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
    localStorage.setItem("tema_medico", nuevo);
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
      localStorage.removeItem("tema_medico");
      window.location.href = "/login";
    } catch {
      /* ignore */
    }
  };

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
        activo: true,
        submenu: [
          { titulo: "Información Personal", icono: User, url: "/medico/perfil" },
          { titulo: "Especialidades", icono: Award, url: "/medico/perfil/especialidades" },
          { titulo: "Credenciales", icono: ShieldCheck, url: "/medico/perfil/credenciales" },
          { titulo: "Disponibilidad", icono: Calendar, url: "/medico/perfil/disponibilidad" },
        ],
      },
      { titulo: "Configuración", icono: Settings, url: "/medico/configuracion" },
    ],
    []
  );

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
      const res = await fetch("/api/medico/perfil", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal: formPersonal,
          profesional: formProfesional,
          preferencias: formPreferencias,
          notificaciones: formNotificaciones,
          publico: formPublico,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMensajeOk("Perfil actualizado correctamente ✅");
      } else {
        setMensajeError(data.message || "No se pudo guardar");
      }
    } catch {
      setMensajeError("Error al guardar el perfil");
    } finally {
      setGuardando(false);
    }
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
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className={`${tema.colores.texto} text-lg font-semibold`}>
            Cargando perfil médico...
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
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
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
                <Stethoscope className={`w-7 h-7 ${tema.colores.acento}`} />
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
            {menuItems.map((item, idx) => (
              <div key={idx} className="mb-1">
                <div
                  className="relative"
                  onMouseEnter={() => item.submenu && sidebarAbierto && setMenuExpandido(item.titulo)}
                  onMouseLeave={() => setMenuExpandido(null)}
                >
                  <Link
                    href={item.url}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      item.activo
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <item.icono
                        className={`w-5 h-5 ${item.activo ? "text-white" : tema.colores.acento}`}
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
            ))}
          </nav>

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
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
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

      {/* SIDEBAR MOBILE */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className={`w-72 h-full ${tema.colores.sidebar} ${tema.colores.borde} border-r p-6 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Stethoscope className={`w-7 h-7 ${tema.colores.acento}`} />
                <p className={`${tema.colores.texto} font-bold`}>Menú médico</p>
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
                placeholder="Buscar citas, pacientes o configuraciones..."
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
                      <Calendar className="w-4 h-4 text-blue-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nueva cita agendada: 15:00
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 5 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <MessageSquare className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Nuevo mensaje de interconsulta
                        </p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 10 min</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${tema.colores.hover} flex gap-2`}>
                      <BellOff className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className={`text-xs ${tema.colores.texto}`}>
                          Completa tu perfil profesional
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
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
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
                    onClick={() => setPerfilAbierto(false)}
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/medico/configuracion"
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
              Mi Perfil Médico
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                <ShieldCheck className="w-3 h-3" /> Verificado
              </span>
            </h1>
            <p className={tema.colores.textoSecundario}>
              Administra tu identidad, datos clínicos públicos y el comportamiento de tu panel.
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
              href="/medico"
              className={`px-4 md:px-6 py-2.5 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold text-sm md:text-base`}
            >
              Volver al dashboard
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
            onClick={() => setSeccionActiva("documentos")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <FolderOpen className="w-4 h-4" />
            Subir credencial
          </button>
          <button
            onClick={() => setSeccionActiva("integraciones")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm ${tema.colores.card} ${tema.colores.borde} border hover:scale-[1.01] transition`}
          >
            <Plug className="w-4 h-4" />
            Integrar agenda
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
                icon={Users}
                label="Pacientes atendidos"
                value={metricas ? metricas.pacientes_totales.toLocaleString() : "0"}
                secondary="Total histórico"
                tema={tema}
              />
              <Estadistica
                icon={Calendar}
                label="Citas esta semana"
                value={metricas ? String(metricas.citas_semana) : "0"}
                secondary="Incluye telemedicina"
                tema={tema}
              />
              <Estadistica
                icon={Star}
                label="Calificación"
                value={metricas ? metricas.calificacion.toFixed(1) : "5.0"}
                secondary="Pacientes verificados"
                tema={tema}
              />
              <Estadistica
                icon={Shield}
                label="Perfil completo"
                value={`${metricas ? metricas.completitud_perfil : 75}%`}
                secondary="Completa los pasos"
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
                      `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
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
                    Se mostrará en panel, pacientes, telemedicina y auditoría.
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Máx: 2MB</p>
                </div>
              </div>
            </div>

            {/* resumen */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} ${tema.colores.sombra}`}
            >
              <p className="text-sm font-bold text-white/80 mb-2">Resumen del profesional</p>
              <p className="text-2xl md:text-3xl font-black text-white mb-3">
                Dr. {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-white text-sm font-semibold">
                    {usuario.medico.calificacion_promedio?.toFixed(1) || "5.0"}
                  </span>
                </div>
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {usuario.medico.anos_experiencia} años
                </span>
              </div>
              <p className="text-[13px] text-white/90 flex items-center gap-1 mb-2">
                <Shield className="w-3 h-3" />
                Centro: {usuario.medico.centro_principal.nombre}
              </p>
              <p className="text-[13px] text-white/90 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {usuario.medico.centro_principal.ciudad},{" "}
                {usuario.medico.centro_principal.region}
              </p>
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
                    <p className={tema.colores.texto}>Credenciales médicas</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Falta subir certificación
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
                    Plan: {usuario.medico.centro_principal.plan.toUpperCase()}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Centro asignado</p>
                </div>
                <Link href="/medico/configuracion" className="text-xs text-indigo-400">
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
                          act.tipo === "cita"
                            ? "bg-blue-500/10 text-blue-200"
                            : act.tipo === "mensaje"
                            ? "bg-green-500/10 text-green-200"
                            : act.tipo === "interconsulta"
                            ? "bg-indigo-500/10 text-indigo-200"
                            : "bg-gray-500/10 text-gray-200"
                        } flex items-center justify-center`}
                      >
                        {act.tipo === "cita" ? (
                          <Calendar className="w-5 h-5" />
                        ) : act.tipo === "mensaje" ? (
                          <MessageSquare className="w-5 h-5" />
                        ) : act.tipo === "interconsulta" ? (
                          <ClipboardList className="w-5 h-5" />
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
                { id: "profesional", label: "Profesional", icon: ShieldCheck },
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

            {/* CONTENT */}
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
                        Datos básicos de tu cuenta
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
                      onChange={(e) => setFormPersonal((p) => ({ ...p, nombre: e.target.value }))}
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
                        onChange={(e) => setFormPersonal((p) => ({ ...p, email: e.target.value }))}
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
                      onChange={(e) => setFormPersonal((p) => ({ ...p, region: e.target.value }))}
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {seccionActiva === "profesional" && (
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
                      Información profesional
                    </p>
                    <p className={tema.colores.textoSecundario}>
                      Se muestra al centro y al paciente
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Nº Registro médico
                    </label>
                    <input
                      value={formProfesional.numero_registro_medico}
                      onChange={(e) =>
                        setFormProfesional((p) => ({
                          ...p,
                          numero_registro_medico: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Título profesional
                    </label>
                    <input
                      value={formProfesional.titulo_profesional}
                      onChange={(e) =>
                        setFormProfesional((p) => ({
                          ...p,
                          titulo_profesional: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Especialidad principal
                    </label>
                    <input
                      value={formProfesional.especialidad_principal}
                      onChange={(e) =>
                        setFormProfesional((p) => ({
                          ...p,
                          especialidad_principal: e.target.value,
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                      Años de experiencia
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formProfesional.anos_experiencia}
                      onChange={(e) =>
                        setFormProfesional((p) => ({
                          ...p,
                          anos_experiencia: Number(e.target.value),
                        }))
                      }
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1">
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      Centro principal asignado
                    </p>
                    <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                      {usuario.medico.centro_principal.nombre} ·{" "}
                      {usuario.medico.centro_principal.ciudad}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Tu disponibilidad (preview)
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
                        Aún no has configurado tu disponibilidad.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                      Personaliza la experiencia de tu panel médico.
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
                      <option value="green">Verde médico</option>
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
                    <span className={tema.colores.texto}>Correo por citas</span>
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
                    <span className={tema.colores.texto}>Correo por mensajes</span>
                    <input
                      type="checkbox"
                      checked={formNotificaciones.email_mensajes}
                      onChange={() =>
                        setFormNotificaciones((p) => ({ ...p, email_mensajes: !p.email_mensajes }))
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
                        setFormNotificaciones((p) => ({ ...p, push_alertas: !p.push_alertas }))
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
                        setFormNotificaciones((p) => ({ ...p, recordatorios: !p.recordatorios }))
                      }
                    />
                  </label>
                </div>
              </div>
            )}

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
                      Esto puede mostrarse en tu ficha para pacientes
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
                      onChange={(e) => setFormPublico((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      className={`w-full mt-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="Ej: Médico internista con enfoque en pacientes crónicos..."
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
                          onChange={(e) => setFormPublico((p) => ({ ...p, web: e.target.value }))}
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
                      Sube tus títulos, certificados y permisos
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
                      Conecta tu agenda y videollamadas
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
                            {intg.actualizado ? `Actualizado ${intg.actualizado}` : "Sincroniza tu cuenta"}
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
                          <p className={tema.colores.texto}>Google Calendar</p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            Sincroniza tus citas
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
                            Videoconsultas automáticas
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
                    <p className={tema.colores.textoSecundario}>Controla tu sesión y accesos</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${tema.colores.secundario} flex items-start gap-3`}>
                    <Shield className="w-5 h-5 mt-1" />
                    <div>
                      <p className={tema.colores.texto}>Autenticación en dos pasos</p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                        Recomendado para médicos
                      </p>
                      <button className="text-xs text-indigo-400 hover:underline">Activar</button>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${tema.colores.secundario} flex items-start gap-3`}>
                    <ShieldAlert className="w-5 h-5 mt-1 text-yellow-300" />
                    <div>
                      <p className={tema.colores.texto}>Alertas de acceso</p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                        Notificar accesos no reconocidos
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
                        <p className={tema.colores.texto}>Chrome · MacOS</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>
                          Santiago · ahora
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
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={tema.colores.texto}>© 2025 AnyssaMed Platform</p>
                    <p className={tema.colores.textoSecundario}>Perfil del médico</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/medico/ayuda" className={tema.colores.textoSecundario}>
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
      <MobileBottomBar tema={tema} actual="/medico/perfil" />

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
