"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Moon,
  Sun,
  Bell,
  HeartPulse,
  Calendar,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  X,
  ClipboardCheck,
  ClipboardList,
  Database,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Handshake,
  Home,
  Lightbulb,
  LogOut,
  MessageSquare,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Wifi,
  TestTube,
  TrendingUp,
  Upload,
  User,
  Users,
  Video,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
  Zap,
} from "lucide-react";

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
  rol?: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_profesional: number;
    numero_registro_medico?: string;
    especialidades: Array<{ id_especialidad: number; nombre: string; es_principal: boolean }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise" | string;
      logo_url: string | null;
      ciudad: string;
      region: string;
      direccion?: string;
      telefono?: string;
      email?: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
}

interface EstadisticasResumen {
  citas_hoy: number;
  citas_pendientes: number;
  citas_completadas_hoy: number;
  citas_canceladas_hoy: number;
  pacientes_nuevos_mes: number;
  total_pacientes: number;
  consultas_mes: number;
  consultas_ano: number;
  recetas_emitidas_mes: number;
  ordenes_examen_mes: number;
  interconsultas_pendientes: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  total_resenas: number;
  ingresos_mes: number;
  telemedicina_activas: number;
  certificados_emitidos: number;
  procedimientos_mes: number;
}

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
}

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

interface MedicoLayoutProps {
  children: ReactNode;
}

export default function MedicoLayout({ children }: MedicoLayoutProps) {
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasResumen | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Cargar sesión
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          setUsuario(null);
          return;
        }
        const data = await res.json();
        if (data.success && data.usuario) {
          const roles: string[] = [];
          if (data.usuario.rol?.nombre) {
            roles.push(
              data.usuario.rol.nombre
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toUpperCase()
            );
          }
          if (Array.isArray(data.usuario.roles)) {
            data.usuario.roles.forEach((r: any) => {
              if (r?.nombre) {
                roles.push(
                  r.nombre
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toUpperCase()
                );
              }
            });
          }
          const esMedico = roles.some((r) => r.includes("MEDICO"));
          if (!esMedico || !data.usuario.medico) {
            setUsuario(null);
          } else {
            setUsuario(data.usuario);
          }
        } else {
          setUsuario(null);
        }
      } catch (e) {
        console.error(e);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Cargar estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!usuario?.medico?.id_profesional) return;
      try {
        const res = await fetch(
          `/api/medico/dashboard/estadisticas?id_profesional=${usuario.medico.id_profesional}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setEstadisticas(data.data);
          }
        }
      } catch (e) {
        console.error("No se pudo cargar estadísticas:", e);
      }
    };
    cargarEstadisticas();
  }, [usuario]);

  // Cargar tema
  useEffect(() => {
    const cargarTema = async () => {
      try {
        const local = localStorage.getItem("tema_medico");
        if (local && local in TEMAS) {
          setTemaActual(local as TemaColor);
        }
        const res = await fetch("/api/users/preferencias/tema", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.tema_color && d.tema_color in TEMAS) {
            setTemaActual(d.tema_color as TemaColor);
            localStorage.setItem("tema_medico", d.tema_color);
          }
        }
      } catch (e) {
        console.warn("No se pudo cargar tema:", e);
      }
    };
    cargarTema();
  }, []);

  // Aplicar fondo
  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("tema_medico");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const cambiarTema = async (t: TemaColor) => {
    setTemaActual(t);
    localStorage.setItem("tema_medico", t);
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: t }),
      });
    } catch (e) {
      console.error("No se pudo guardar tema", e);
    }
  };

  // Función para verificar si una ruta está activa
  const esRutaActiva = (url: string): boolean => {
    if (!pathname) return false;
    if (url === "/medico" && pathname === "/medico") return true;
    if (url !== "/medico" && pathname.startsWith(url)) return true;
    return false;
  };

  const menuItems: MenuItem[] = useMemo(
    () => [
      { titulo: "Dashboard", icono: Home, url: "/medico" },
      { titulo: "Agenda", icono: Calendar, url: "/medico/agenda", badge: estadisticas?.citas_hoy || 0 },
      {
        titulo: "Pacientes",
        icono: Users,
        url: "/medico/pacientes",
        badge: estadisticas?.pacientes_nuevos_mes || 0,
        submenu: [
          { titulo: "Todos los Pacientes", icono: Users, url: "/medico/pacientes" },
          { titulo: "Nuevo Paciente", icono: Plus, url: "/medico/pacientes/nuevo" },
          { titulo: "Búsqueda Avanzada", icono: Search, url: "/medico/pacientes/buscar" },
          { titulo: "Pacientes Críticos", icono: AlertTriangle, url: "/medico/pacientes/criticos" },
        ],
      },
      {
        titulo: "Consultas",
        icono: ClipboardCheck,
        url: "/medico/consultas",
        submenu: [
          { titulo: "Nueva Consulta", icono: Plus, url: "/medico/consultas/nueva" },
          { titulo: "Historial", icono: ClipboardList, url: "/medico/consultas/historial" },
          { titulo: "Seguimientos", icono: CheckCircle2, url: "/medico/consultas/seguimientos" },
        ],
      },
      {
        titulo: "Recetas",
        icono: Pill,
        url: "/medico/recetas",
        badge: estadisticas?.recetas_emitidas_mes || 0,
        submenu: [
          { titulo: "Nueva Receta", icono: Plus, url: "/medico/recetas/nueva" },
          { titulo: "Mis Recetas", icono: FileText, url: "/medico/recetas" },
          { titulo: "Vademécum", icono: Database, url: "/medico/vademecum" },
        ],
      },
      {
        titulo: "Exámenes",
        icono: TestTube,
        url: "/medico/examenes",
        submenu: [
          { titulo: "Nueva Orden", icono: Plus, url: "/medico/examenes/orden" },
          { titulo: "Resultados Pendientes", icono: Clock, url: "/medico/examenes/pendientes" },
          { titulo: "Historial", icono: FileSpreadsheet, url: "/medico/examenes/historial" },
        ],
      },
      {
        titulo: "Certificados",
        icono: FileText,
        url: "/medico/certificados",
        submenu: [
          { titulo: "Nuevo Certificado", icono: Plus, url: "/medico/certificados/nuevo" },
          { titulo: "Licencias Médicas", icono: FileText, url: "/medico/certificados/licencias" },
          { titulo: "Certificados GES", icono: ShieldCheck, url: "/medico/certificados/ges" },
        ],
      },
      {
        titulo: "Telemedicina",
        icono: Video,
        url: "/medico/telemedicina",
        badge: estadisticas?.telemedicina_activas || 0,
        submenu: [
          { titulo: "Sala de Espera", icono: Clock, url: "/medico/telemedicina/espera" },
          { titulo: "Historial", icono: Video, url: "/medico/telemedicina/historial" },
          { titulo: "Configuración", icono: Settings, url: "/medico/telemedicina/config" },
        ],
      },
      {
        titulo: "Interconsultas",
        icono: Handshake,
        url: "/medico/interconsultas",
        badge: estadisticas?.interconsultas_pendientes || 0,
        submenu: [
          { titulo: "Nueva Interconsulta", icono: Plus, url: "/medico/interconsultas/nueva" },
          { titulo: "Recibidas", icono: Download, url: "/medico/interconsultas/recibidas" },
          { titulo: "Enviadas", icono: Upload, url: "/medico/interconsultas/enviadas" },
        ],
      },
      { titulo: "Mensajes", icono: MessageSquare, url: "/medico/mensajes", badge: estadisticas?.mensajes_sin_leer || 0 },
      {
        titulo: "Biblioteca",
        icono: GraduationCap,
        url: "/medico/biblioteca",
        submenu: [
          { titulo: "Recursos Médicos", icono: FileText, url: "/medico/biblioteca/recursos" },
          { titulo: "Calculadoras", icono: Calculator, url: "/medico/biblioteca/calculadoras" },
          { titulo: "Protocolos", icono: ClipboardList, url: "/medico/biblioteca/protocolos" },
          { titulo: "Guías Clínicas", icono: GraduationCap, url: "/medico/biblioteca/guias" },
        ],
      },
      {
        titulo: "Estadísticas",
        icono: BarChart3,
        url: "/medico/estadisticas",
        submenu: [
          { titulo: "Mis Métricas", icono: TrendingUp, url: "/medico/estadisticas/metricas" },
          { titulo: "Rendimiento", icono: Target, url: "/medico/estadisticas/rendimiento" },
          { titulo: "Satisfacción", icono: Star, url: "/medico/estadisticas/satisfaccion" },
          { titulo: "Financiero", icono: DollarSign, url: "/medico/estadisticas/financiero" },
        ],
      },
      {
        titulo: "Mi Perfil",
        icono: User,
        url: "/medico/perfil",
        submenu: [
          { titulo: "Información Personal", icono: User, url: "/medico/perfil" },
          { titulo: "Especialidades", icono: Award, url: "/medico/perfil/especialidades" },
          { titulo: "Credenciales", icono: ShieldCheck, url: "/medico/perfil/credenciales" },
          { titulo: "Disponibilidad", icono: Calendar, url: "/medico/perfil/disponibilidad" },
        ],
      },
      {
        titulo: "Configuración",
        icono: Settings,
        url: "/medico/configuracion",
        submenu: [
          { titulo: "Preferencias", icono: Settings, url: "/medico/configuracion/preferencias" },
          { titulo: "Notificaciones", icono: Bell, url: "/medico/configuracion/notificaciones" },
          { titulo: "Seguridad", icono: Shield, url: "/medico/configuracion/seguridad" },
          { titulo: "Temas", icono: Sparkles, url: "/medico/configuracion/temas" },
        ],
      },
    ],
    [estadisticas, pathname]
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-6 w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div className={`absolute inset-4 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center`}>
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className={`${tema.colores.textoSecundario} font-semibold`}>Cargando entorno del médico...</p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className={`p-8 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center max-w-md`}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <h2 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>Acceso no autorizado</h2>
          <p className={tema.colores.textoSecundario}>Este módulo es exclusivo para médicos.</p>
          <button onClick={cerrarSesion} className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-semibold">
            <LogOut className="w-4 h-4" />
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${sidebarAbierto ? "w-72" : "w-20"} ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}>
        <div className="flex flex-col h-full">
          {/* Logo Centro */}
          <div className={`flex items-center ${sidebarAbierto ? 'justify-between' : 'justify-center'} p-4 border-b ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                {usuario.medico.centro_principal.logo_url ? (
                  <Image src={usuario.medico.centro_principal.logo_url} alt={usuario.medico.centro_principal.nombre} width={44} height={44} className="rounded-xl object-contain bg-white p-1 shadow-md" />
                ) : (
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg text-sm`}>
                    {usuario.medico.centro_principal.nombre.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${tema.colores.texto} truncate`}>{usuario.medico.centro_principal.nombre}</p>
                  <p className={`text-xs ${tema.colores.textoSecundario} truncate`}>{usuario.medico.centro_principal.ciudad}</p>
                </div>
              </div>
            ) : (
              <div>
                {usuario.medico.centro_principal.logo_url ? (
                  <Image src={usuario.medico.centro_principal.logo_url} alt={usuario.medico.centro_principal.nombre} width={40} height={40} className="rounded-lg object-contain bg-white p-1 shadow-md" />
                ) : (
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg text-sm`}>
                    {usuario.medico.centro_principal.nombre.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            {sidebarAbierto && (
              <button onClick={() => setSidebarAbierto(false)} className={`p-2 rounded-lg ${tema.colores.hover} transition-all`}>
                <ChevronRight className={`w-5 h-5 ${tema.colores.texto}`} />
              </button>
            )}
          </div>

          {!sidebarAbierto && (
            <button onClick={() => setSidebarAbierto(true)} className={`mx-auto mt-2 p-2 rounded-lg ${tema.colores.hover} transition-all`}>
              <ChevronRight className={`w-5 h-5 ${tema.colores.texto} rotate-180`} />
            </button>
          )}

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
            {menuItems.map((item) => {
              const activo = esRutaActiva(item.url);
              const expandido = menuExpandido === item.titulo;
              return (
                <div key={item.titulo} className="mb-1">
                  <div className="relative group" onMouseEnter={() => item.submenu && sidebarAbierto && setMenuExpandido(item.titulo)} onMouseLeave={() => item.submenu && sidebarAbierto && setMenuExpandido(null)}>
                    <Link href={item.url} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${activo ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}` : `${tema.colores.hover} ${tema.colores.texto}`}`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <item.icono className={`w-5 h-5 flex-shrink-0 ${activo ? "text-white" : tema.colores.acento}`} />
                        {sidebarAbierto && <span className="truncate text-sm">{item.titulo}</span>}
                      </div>
                      {sidebarAbierto && item.badge && item.badge > 0 && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0 ${activo ? "bg-white/20 text-white" : "bg-red-500 text-white"}`}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      {sidebarAbierto && item.submenu && <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${expandido ? "rotate-180" : ""}`} />}
                    </Link>
                    {sidebarAbierto && item.submenu && expandido && (
                      <div className="mt-1 ml-4 space-y-1 animate-fadeIn">
                        {item.submenu.map((sub) => {
                          const subActivo = esRutaActiva(sub.url);
                          return (
                            <Link key={sub.url} href={sub.url} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${subActivo ? `${tema.colores.acento} bg-indigo-50/10` : `${tema.colores.textoSecundario} ${tema.colores.hover}`}`}>
                              <sub.icono className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{sub.titulo}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Usuario */}
          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 text-sm`}>
                  {usuario.foto_perfil_url ? <Image src={usuario.foto_perfil_url} alt={usuario.nombre} width={40} height={40} className="rounded-xl object-cover" /> : `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${tema.colores.texto} truncate`}>Dr. {usuario.nombre} {usuario.apellido_paterno}</p>
                  <p className={`text-xs ${tema.colores.textoSecundario} truncate`}>{usuario.medico.especialidades[0]?.nombre || "Médico"}</p>
                </div>
              </div>
            ) : (
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold mx-auto shadow-lg text-sm`}>
                {usuario.foto_perfil_url ? <Image src={usuario.foto_perfil_url} alt={usuario.nombre} width={40} height={40} className="rounded-xl object-cover" /> : `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* HEADER - ALTURA EXACTA 56px */}
      <header className={`fixed top-0 right-0 h-14 z-40 transition-all duration-300 ${sidebarAbierto ? "left-72" : "left-20"} ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}>
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`} />
              <input type="text" placeholder="Buscar paciente, historia clínica, medicamento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={`w-full pl-9 pr-9 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300`} />
              {busqueda && (
                <button onClick={() => setBusqueda("")} className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3">
            {/* Temas */}
            <div className="relative group">
              <button className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all hover:scale-105`}>
                <Sparkles className="w-4 h-4" />
              </button>
              <div className={`absolute right-0 mt-2 w-56 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2.5 space-y-1.5 z-50`}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className={`text-xs font-black ${tema.colores.texto}`}>Temas Premium</p>
                  <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                </div>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button key={key} onClick={() => cambiarTema(key as TemaColor)} className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${temaActual === key ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-lg` : `${tema.colores.hover} ${tema.colores.texto}`}`}>
                    <span className="flex items-center gap-1.5">
                      <t.icono className="w-3.5 h-3.5" />
                      {t.nombre}
                    </span>
                    {temaActual === key && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button onClick={() => setNotificacionesAbiertas((v) => !v)} className={`relative p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all hover:scale-105`}>
                <Bell className="w-4 h-4" />
                {estadisticas?.mensajes_sin_leer ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold animate-pulse">
                    {estadisticas.mensajes_sin_leer > 9 ? "9+" : estadisticas.mensajes_sin_leer}
                  </span>
                ) : null}
              </button>
              {notificacionesAbiertas && (
                <div className={`absolute right-0 mt-2 w-72 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-3 space-y-2 z-50 animate-fadeIn`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-black ${tema.colores.texto}`}>Notificaciones</h3>
                    <button onClick={() => setNotificacionesAbiertas(false)} className={`p-1 rounded-lg ${tema.colores.hover}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                    <div className={`p-2.5 rounded-lg ${tema.colores.hover} flex gap-2.5`}>
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div>
                        <p className={`text-xs font-semibold ${tema.colores.texto}`}>Paciente con alerta crítica</p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 5 min</p>
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-lg ${tema.colores.hover} flex gap-2.5`}>
                      <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className={`text-xs font-semibold ${tema.colores.texto}`}>2 mensajes sin leer</p>
                        <p className={`text-[10px] ${tema.colores.textoSecundario}`}>hace 10 min</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/medico/notificaciones" className={`text-xs font-bold ${tema.colores.acento} hover:underline inline-flex items-center gap-1`}>
                    Ver todas
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="relative">
              <button onClick={() => setPerfilAbierto((v) => !v)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${tema.colores.hover} transition-all hover:scale-105`}>
                <div className="text-right hidden sm:block">
                  <p className={`text-xs font-bold ${tema.colores.texto}`}>Dr. {usuario.nombre}</p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>{usuario.medico.especialidades[0]?.nombre || "Médico"}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg text-xs`}>
                  {usuario.foto_perfil_url ? <Image src={usuario.foto_perfil_url} alt={usuario.nombre} width={32} height={32} className="rounded-lg object-cover" /> : `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 ${tema.colores.texto} transition-transform ${perfilAbierto ? "rotate-180" : ""}`} />
              </button>
              {perfilAbierto && (
                <div className={`absolute right-0 mt-2 w-64 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-3 space-y-1.5 z-50 animate-fadeIn`}>
                  <div className={`flex items-center gap-2.5 pb-2.5 border-b ${tema.colores.borde}`}>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg text-sm`}>
                      {usuario.foto_perfil_url ? <Image src={usuario.foto_perfil_url} alt={usuario.nombre} width={40} height={40} className="rounded-lg object-cover" /> : `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>Dr. {usuario.nombre} {usuario.apellido_paterno}</p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>{usuario.email}</p>
                    </div>
                  </div>
                  <Link href="/medico/perfil" className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${tema.colores.hover} ${tema.colores.texto} text-sm font-medium`}>
                    <User className="w-4 h-4" />
                    Mi perfil
                  </Link>
                  <Link href="/medico/configuracion" className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${tema.colores.hover} ${tema.colores.texto} text-sm font-medium`}>
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Link>
                  <button onClick={cerrarSesion} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO - PEGADO AL HEADER (56px exactos) */}
      <main className={`flex-1 transition-all duration-300 ${sidebarAbierto ? "ml-72" : "ml-20"} pt-14`}>
        {children}
      </main>

      {/* FOOTER */}
      <footer className={`transition-all duration-300 ${sidebarAbierto ? "ml-72" : "ml-20"} ${tema.colores.card} ${tema.colores.borde} border-t ${tema.colores.sombra}`}>
        <div className="px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {usuario.medico.centro_principal.logo_url ? (
                <Image src={usuario.medico.centro_principal.logo_url} alt={usuario.medico.centro_principal.nombre} width={44} height={44} className="rounded-lg object-contain bg-white p-1.5 shadow-lg" />
              ) : (
                <div className={`w-11 h-11 bg-gradient-to-br ${tema.colores.gradiente} rounded-lg flex items-center justify-center text-white font-bold shadow-lg`}>
                  <Stethoscope className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className={`text-xs font-black ${tema.colores.texto}`}>{usuario.medico.centro_principal.nombre}</p>
                <p className={`text-[10px] ${tema.colores.textoSecundario} font-semibold`}>Sistema Médico Premium · © 2025 AnyssaMed</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
              {usuario.medico.centro_principal.direccion && (
                <div className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}>
                  <MapPin className="w-3 h-3" />
                  <span className="font-medium">{usuario.medico.centro_principal.direccion}</span>
                </div>
              )}
              {usuario.medico.centro_principal.telefono && (
                <div className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}>
                  <Phone className="w-3 h-3" />
                  <span className="font-medium">{usuario.medico.centro_principal.telefono}</span>
                </div>
              )}
              {usuario.medico.centro_principal.email && (
                <div className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}>
                  <Mail className="w-3 h-3" />
                  <span className="font-medium">{usuario.medico.centro_principal.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/medico/ayuda" className={`flex items-center gap-1 text-[10px] font-bold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-all`}>
                <Lightbulb className="w-3 h-3" />
                Ayuda
              </Link>
              <Link href="/privacidad" className={`flex items-center gap-1 text-[10px] font-bold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-all`}>
                <Shield className="w-3 h-3" />
                Privacidad
              </Link>
              <Link href="/terminos" className={`flex items-center gap-1 text-[10px] font-bold ${tema.colores.textoSecundario} hover:${tema.colores.acento} transition-all`}>
                <FileText className="w-3 h-3" />
                Términos
              </Link>
            </div>
          </div>

          <div className={`mt-3 pt-3 border-t ${tema.colores.borde} flex flex-wrap items-center justify-between gap-2 text-[10px]`}>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Sistema Operativo</span>
              </div>
              <div className={`flex items-center gap-1 ${tema.colores.textoSecundario}`}>
                <Heart className="w-3 h-3 text-red-500" />
                <span className="font-semibold">Hecho con amor para médicos</span>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 ${tema.colores.textoSecundario} font-semibold`}>
              <span>Versión 2.0.0</span>
              <span>·</span>
              <span>Plan {usuario.medico.centro_principal.plan.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
