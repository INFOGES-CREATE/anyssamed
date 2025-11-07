"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Sparkles,
  Calendar,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  AlertCircle,
  ClipboardList,
  ClipboardCheck,
  Settings,
  User,
  LogOut,
  Bell,
  BellOff,
  LayoutDashboard,
  FileSearch,
  FileSignature,
  FileBadge,
  FilePlus2,
  FileClock,
  FileCog,
  CheckCircle2,
  Shield,
  Trash2,
  RefreshCw,
  Cloud,
  Share2,
  Copy,
  Tag,
  Users,
  CalendarCheck,
  Sun,
  Moon,
  Wifi,
  HeartPulse,
  Star,
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
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_medico: number;
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

interface CertificadoMedico {
  id_certificado: number;
  id_centro: number;
  id_paciente: number;
  id_medico: number;
  id_plantilla: number | null;
  tipo_certificado: string;
  titulo: string;
  contenido: string;
  diagnostico: string | null;
  codigo_cie10: string | null;
  fecha_emision: string;
  estado: "emitido" | "anulado" | "reemplazado";
  motivo_anulacion: string | null;
  numero_certificado: string | null;
  url_documento: string | null;
  codigo_verificacion: string | null;
  paciente?: {
    nombre_completo: string;
    rut?: string;
    edad?: number;
  };
}

interface PlantillaDocumento {
  id_plantilla: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
}

interface AlertaCertificado {
  id: number;
  nivel: "critica" | "alta" | "media" | "baja";
  titulo: string;
  detalle: string;
  fecha_hora: string;
}

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-200 hover:bg-gray-300",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-xl border-gray-200",
      header: "bg-white/80 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro",
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
      sidebar: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/80 backdrop-blur-xl border-gray-800",
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
      sidebar: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/80 backdrop-blur-xl border-cyan-800",
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
      sidebar: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/80 backdrop-blur-xl border-purple-800",
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
      sidebar: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/80 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

export default function CertificadosPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const [certificados, setCertificados] = useState<CertificadoMedico[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaDocumento[]>([]);
  const [alertas, setAlertas] = useState<AlertaCertificado[]>([]);
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState<CertificadoMedico | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<"todos" | "emitido" | "anulado" | "reemplazado">("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("30");

  const [mostrarContenido, setMostrarContenido] = useState(true);
  const [menuExpandido, setMenuExpandido] = useState<string | null>("Certificados");
  const [verificadorCodigo, setVerificadorCodigo] = useState("");
  const [verificacionResultado, setVerificacionResultado] = useState<CertificadoMedico | null>(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.usuario) {
          window.location.href = "/login";
          return;
        }

        const rolesUsuario: string[] = [];
        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
          );
        }
        if (Array.isArray(data.usuario.roles)) {
          data.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
              );
            }
          });
        }
        const tieneRolMedico = rolesUsuario.some((r) => r.includes("MEDICO"));
        if (!tieneRolMedico || !data.usuario.medico) {
          alert("Acceso denegado. Esta sección es solo para médicos.");
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
      } catch (error) {
        console.error("Error cargando usuario:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    const cargarTema = async () => {
      try {
        const res = await fetch("/api/users/preferencias/tema", { method: "GET", credentials: "include" });
        const data = await res.json();
        if (data.success && data.tema_color) {
          setTemaActual(data.tema_color);
          if (typeof window !== "undefined") localStorage.setItem("tema_medico", data.tema_color);
        }
      } catch {
        // ignore
      }
    };
    cargarTema();
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario?.medico?.id_medico) return;
      try {
        setLoadingData(true);
        const [resCertificados, resPlantillas, resAlertas] = await Promise.all([
          fetch(`/api/medico/certificados?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`/api/medico/certificados/plantillas?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`/api/medico/certificados/alertas?id_medico=${usuario.medico.id_medico}`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const dataCertificados = await resCertificados.json().catch(() => ({ certificados: [] }));
        const dataPlantillas = await resPlantillas.json().catch(() => ({ plantillas: [] }));
        const dataAlertas = await resAlertas.json().catch(() => ({ alertas: [] }));

        setCertificados(dataCertificados.certificados || []);
        setPlantillas(dataPlantillas.plantillas || []);
        setAlertas(dataAlertas.alertas || []);

        if ((dataCertificados.certificados || []).length > 0) {
          setCertificadoSeleccionado(dataCertificados.certificados[0]);
        }
      } catch (e) {
        console.error("Error cargando datos certificados:", e);
      } finally {
        setLoadingData(false);
      }
    };

    cargarDatos();
  }, [usuario]);

  const cambiarTema = async (nuevo: TemaColor) => {
    setTemaActual(nuevo);
    if (typeof window !== "undefined") localStorage.setItem("tema_medico", nuevo);
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevo }),
      });
    } catch (e) {
      console.error("No se pudo guardar el tema");
    }
  };

  const filtrarCertificados = () => {
    return certificados.filter((c) => {
      const porEstado = filtroEstado === "todos" ? true : c.estado === filtroEstado;
      const porTipo = filtroTipo === "todos" ? true : c.tipo_certificado === filtroTipo;
      const porBusqueda =
        busqueda.trim().length === 0
          ? true
          : c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.paciente?.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.numero_certificado?.toLowerCase().includes(busqueda.toLowerCase());

      let porFecha = true;
      if (filtroFecha !== "todos") {
        const dias = parseInt(filtroFecha, 10);
        const fechaC = new Date(c.fecha_emision);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        porFecha = fechaC >= fechaLimite;
      }

      return porEstado && porTipo && porBusqueda && porFecha;
    });
  };

  const certificadosFiltrados = filtrarCertificados();

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatearFecha = (fecha: string) => {
    const d = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const anularCertificado = async (id: number) => {
    const motivo = typeof window !== "undefined" ? window.prompt("Motivo de anulación:") : null;
    if (!motivo) return;
    try {
      const res = await fetch(`/api/medico/certificados/${id}/anular`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ motivo }),
      });
      const data = await res.json();
      if (data.success) {
        setCertificados((prev) =>
          prev.map((c) => (c.id_certificado === id ? { ...c, estado: "anulado", motivo_anulacion: motivo } : c))
        );
        if (certificadoSeleccionado?.id_certificado === id) {
          setCertificadoSeleccionado((prev) =>
            prev ? { ...prev, estado: "anulado", motivo_anulacion: motivo } : prev
          );
        }
        alert("Certificado anulado correctamente");
      } else {
        alert("No se pudo anular el certificado");
      }
    } catch (e) {
      alert("Error al anular certificado");
    }
  };

  const verificarCodigo = async () => {
    if (!verificadorCodigo.trim()) return;
    try {
      const res = await fetch(`/api/publico/certificados/verificar?codigo=${verificadorCodigo}`, {
        method: "GET",
      });
      const data = await res.json();
      if (data.success && data.certificado) {
        setVerificacionResultado(data.certificado);
      } else {
        setVerificacionResultado(null);
        alert("No se encontró certificado con ese código de verificación.");
      }
    } catch (e) {
      alert("Error al verificar código");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>Cargando certificados...</h2>
          <p className={tema.colores.textoSecundario}>Preparando módulo avanzado de certificaciones</p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Acceso No Autorizado</h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a este módulo de certificados
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { titulo: "Dashboard", icono: LayoutDashboard, url: "/medico" },
    { titulo: "Agenda", icono: Calendar, url: "/medico/agenda" },
    { titulo: "Pacientes", icono: Users, url: "/medico/pacientes" },
    { titulo: "Consultas", icono: ClipboardCheck, url: "/medico/consultas" },
    { titulo: "Recetas", icono: FileSignature, url: "/medico/recetas" },
    { titulo: "Exámenes", icono: FileSearch, url: "/medico/examenes" },
    {
      titulo: "Certificados",
      icono: FileText,
      url: "/medico/certificados",
      submenu: [
        { titulo: "Emitir nuevo", icono: FilePlus2, url: "/medico/certificados/nuevo" },
        { titulo: "Licencias médicas", icono: FileBadge, url: "/medico/certificados/licencias" },
        { titulo: "Plantillas", icono: FileCog, url: "/medico/certificados/plantillas" },
        { titulo: "Verificación", icono: ShieldCheck, url: "/medico/certificados/verificar" },
      ],
    },
    { titulo: "Telemedicina", icono: Cloud, url: "/medico/telemedicina" },
    { titulo: "Mensajes", icono: Bell, url: "/medico/mensajes" },
    { titulo: "Configuración", icono: Settings, url: "/medico/configuracion" },
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-72" : "w-20"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-black ${tema.colores.texto}`}>Certificados</h1>
                  <p className={`text-xs font-semibold ${tema.colores.acento}`}>Módulo médico premium</p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg mx-auto`}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
            )}

            <button
              onClick={() => setSidebarAbierto((p) => !p)}
              className={`p-2 rounded-lg ${tema.colores.hover} transition-colors`}
            >
              <ChevronRight
                className={`w-5 h-5 ${tema.colores.texto} transition-transform ${
                  sidebarAbierto ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
            {menuItems.map((item, idx) => {
              const activo = item.url === "/medico/certificados";
              return (
                <div key={idx} className="mb-1">
                  <Link
                    href={item.url}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                      activo
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                    onClick={(e) => {
                      if (item.submenu) {
                        e.preventDefault();
                        setMenuExpandido((p) => (p === item.titulo ? null : item.titulo));
                        if (!sidebarAbierto) setSidebarAbierto(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icono
                        className={`w-5 h-5 flex-shrink-0 ${
                          activo ? "text-white" : tema.colores.acento
                        }`}
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
                      {item.submenu.map((s, i) => (
                        <Link
                          key={i}
                          href={s.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${tema.colores.hover} ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
                        >
                          <s.icono className="w-4 h-4" />
                          <span>{s.titulo}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${tema.colores.borde}`}>
            {sidebarAbierto ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      width={48}
                      height={48}
                      alt={usuario.nombre}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs font-medium truncate ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg mx-auto`}
              >
                {usuario.foto_perfil_url ? (
                  <Image
                    src={usuario.foto_perfil_url}
                    width={48}
                    height={48}
                    alt={usuario.nombre}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                )}
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
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar certificado, paciente, N° de certificado, código de verificación..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>Seleccionar Tema</p>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((p) => !p)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {alertas.length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {alertas.length > 9 ? "9+" : alertas.length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>Alertas de certificados</h3>
                      <button
                        onClick={() => setAlertas([])}
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  {alertas.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`} />
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>No hay alertas pendientes</p>
                    </div>
                  ) : (
                    alertas.map((al) => (
                      <div
                        key={al.id}
                        className={`p-4 flex gap-3 border-b ${tema.colores.borde} ${tema.colores.hover}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            al.nivel === "critica"
                              ? "bg-red-500/20 text-red-400"
                              : al.nivel === "alta"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>{al.titulo}</p>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>{al.detalle}</p>
                          <p className={`text-xs mt-1 ${tema.colores.textoSecundario}`}>{al.fecha_hora}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((p) => !p)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Dr. {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {usuario.medico.especialidades[0]?.nombre || "Médico"}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
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
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${tema.colores.texto} transition-transform ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/30">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        Dr. {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}>
                        {usuario.medico.especialidades[0]?.nombre || "Médico"}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>
                          {usuario.medico.calificacion_promedio?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/medico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/medico/configuracion"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-500 hover:text-red-400`}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className={`${sidebarAbierto ? "ml-72" : "ml-20"} pt-24 p-8 transition-all duration-300`}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-4xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}>
              {obtenerSaludo()}, Dr. {usuario.nombre}
              <span className="animate-wave inline-block">📝</span>
            </h2>
            <p className={tema.colores.textoSecundario}>
              Gestión avanzada de certificados médicos ·{" "}
              {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/medico/certificados/nuevo"
              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <Plus className="w-5 h-5" />
              Emitir Certificado
            </Link>
            <button
              onClick={() => {
                if (!usuario?.medico?.id_medico) return;
                setLoadingData(true);
                fetch(`/api/medico/certificados?id_medico=${usuario.medico.id_medico}`, {
                  method: "GET",
                  credentials: "include",
                })
                  .then((r) => r.json())
                  .then((d) => {
                    setCertificados(d.certificados || []);
                  })
                  .finally(() => setLoadingData(false));
              }}
              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
            >
              <RefreshCw className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CalendarCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>{certificados.length}</div>
            <p className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
              Certificados emitidos
            </p>
          </div>

          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
              <Tag className="w-5 h-5 text-green-400" />
            </div>
            <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
              {certificados.filter((c) => c.estado === "emitido").length}
            </div>
            <p className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
              Vigentes
            </p>
          </div>

          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <FileClock className="w-5 h-5 text-red-400" />
            </div>
            <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
              {certificados.filter((c) => c.estado !== "emitido").length}
            </div>
            <p className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
              Anulados / Reemplazados
            </p>
          </div>

          <div
            className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileCog className="w-6 h-6 text-blue-400" />
              </div>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>{plantillas.length}</div>
            <p className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>
              Plantillas disponibles
            </p>
          </div>
        </div>

        {/* panel principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* listado */}
          <div
            className={`xl:col-span-2 rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center`}
                >
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${tema.colores.texto}`}>Certificados recientes</h3>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Gestión completa: emisión, descarga, anulación, verificación
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFiltroEstado("todos");
                    setFiltroTipo("todos");
                    setFiltroFecha("30");
                    setBusqueda("");
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario}`}
                >
                  Limpiar filtros
                </button>
                <Link
                  href="/medico/certificados/nuevo"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.primario} text-white flex items-center gap-2`}
                >
                  <Plus className="w-4 h-4" />
                  Nuevo
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div>
                <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl bg-transparent ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                >
                  <option value="todos">Todos</option>
                  <option value="emitido">Emitidos</option>
                  <option value="anulado">Anulados</option>
                  <option value="reemplazado">Reemplazados</option>
                </select>
              </div>
              <div>
                <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Tipo</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl bg-transparent ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                >
                  <option value="todos">Todos</option>
                  <option value="certificado médico">Certificado médico</option>
                  <option value="reposo laboral">Reposo laboral</option>
                  <option value="licencia médica">Licencia médica</option>
                  <option value="aptitud física">Aptitud física</option>
                  <option value="otras">Otras</option>
                </select>
              </div>
              <div>
                <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Periodo</label>
                <select
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl bg-transparent ${tema.colores.borde} border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tema.colores.texto}`}
                >
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
              <div>
                <label className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Acciones masivas</label>
                <button
                  className={`w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-sm font-semibold`}
                >
                  <Filter className="w-4 h-4" />
                  Exportar PDF
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-700/20">
              <div className={`grid grid-cols-12 gap-2 px-4 py-2 ${tema.colores.fondoSecundario} bg-opacity-50`}>
                <div className="col-span-3 text-xs font-bold uppercase">Paciente</div>
                <div className="col-span-3 text-xs font-bold uppercase">Certificado</div>
                <div className="col-span-2 text-xs font-bold uppercase">Fecha</div>
                <div className="col-span-2 text-xs font-bold uppercase">Estado</div>
                <div className="col-span-2 text-xs font-bold uppercase text-right">Acciones</div>
              </div>
              <div className="max-h-[460px] overflow-y-auto custom-scrollbar">
                {loadingData ? (
                  <div className="p-6 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-400" />
                    <p className={tema.colores.textoSecundario}>Cargando certificados...</p>
                  </div>
                ) : certificadosFiltrados.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className={`w-12 h-12 mx-auto mb-2 ${tema.colores.textoSecundario}`} />
                    <p className={`font-semibold ${tema.colores.texto}`}>No se encontraron certificados</p>
                    <p className={tema.colores.textoSecundario}>Ajusta los filtros o crea uno nuevo</p>
                  </div>
                ) : (
                  certificadosFiltrados.map((c) => (
                    <div
                      key={c.id_certificado}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b ${tema.colores.borde} hover:bg-indigo-500/5 cursor-pointer`}
                      onClick={() => setCertificadoSeleccionado(c)}
                    >
                      <div className="col-span-3">
                        <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                          {c.paciente?.nombre_completo || "Paciente sin nombre"}
                        </p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>N° {c.numero_certificado || "—"}</p>
                      </div>
                      <div className="col-span-3">
                        <p className={`text-sm font-semibold ${tema.colores.texto}`}>{c.titulo}</p>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>{c.tipo_certificado}</p>
                      </div>
                      <div className="col-span-2">
                        <p className={`text-sm ${tema.colores.texto}`}>{formatearFecha(c.fecha_emision)}</p>
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            c.estado === "emitido"
                              ? "bg-green-500/10 text-green-400"
                              : c.estado === "anulado"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!c.url_documento) return;
                            window.open(c.url_documento, "_blank");
                          }}
                          className={`p-2 rounded-lg ${tema.colores.hover}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCertificadoSeleccionado(c);
                          }}
                          className={`p-2 rounded-lg ${tema.colores.hover}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            anularCertificado(c.id_certificado);
                          }}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* panel derecho */}
          <div className="space-y-8">
            {/* verificación */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className={`text-lg font-black ${tema.colores.texto}`}>Verificar código</h4>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Usa el código que aparece en el PDF o impreso
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={verificadorCodigo}
                  onChange={(e) => setVerificadorCodigo(e.target.value)}
                  placeholder="Ej: MED-CL-2025-000123"
                  className={`flex-1 px-3 py-2 rounded-xl bg-transparent ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
                />
                <button
                  onClick={verificarCodigo}
                  className={`px-4 py-2 rounded-xl ${tema.colores.primario} text-white text-sm font-semibold`}
                >
                  Verificar
                </button>
              </div>
              {verificacionResultado ? (
                <div className="mt-3 rounded-xl bg-green-500/10 border border-green-500/30 p-3">
                  <p className="text-xs text-green-100 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Certificado válido
                  </p>
                  <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                    {verificacionResultado.titulo}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Paciente: {verificacionResultado.paciente?.nombre_completo || "—"}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Fecha: {formatearFecha(verificacionResultado.fecha_emision)}
                  </p>
                </div>
              ) : (
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  Aquí se mostrará el resultado de la verificación
                </p>
              )}
            </div>

            {/* plantillas */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <FileCog className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className={`text-lg font-black ${tema.colores.texto}`}>Plantillas rápidas</h4>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>Preconfiguradas por tu centro</p>
                </div>
              </div>
              {plantillas.length === 0 ? (
                <p className={tema.colores.textoSecundario}>No hay plantillas cargadas</p>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {plantillas.map((p) => (
                    <button
                      key={p.id_plantilla}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl ${tema.colores.hover} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02]`}
                      onClick={() => {
                        window.location.href = `/medico/certificados/nuevo?id_plantilla=${p.id_plantilla}`;
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5" />
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${tema.colores.texto}`}>{p.nombre}</p>
                          {p.descripcion && (
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>{p.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                    </button>
                  ))}
                </div>
              )}
              <Link
                href="/medico/certificados/plantillas"
                className={`inline-flex items-center gap-2 text-xs font-semibold mt-3 ${tema.colores.acento}`}
              >
                Administrar plantillas
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* vista previa */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-black ${tema.colores.texto}`}>Vista previa</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMostrarContenido((p) => !p)}
                    className={`p-2 rounded-lg ${tema.colores.hover}`}
                  >
                    {mostrarContenido ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className={`p-2 rounded-lg ${tema.colores.hover}`}>
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {certificadoSeleccionado ? (
                <div className="border border-dashed border-indigo-500/20 rounded-xl p-4 bg-indigo-500/5">
                  <p className={`text-xs mb-1 ${tema.colores.textoSecundario}`}>
                    N° {certificadoSeleccionado.numero_certificado || "—"} ·{" "}
                    {formatearFecha(certificadoSeleccionado.fecha_emision)}
                  </p>
                  <p className={`text-sm font-bold mb-2 ${tema.colores.texto}`}>
                    {certificadoSeleccionado.titulo}
                  </p>
                  <p className={`text-xs mb-2 ${tema.colores.textoSecundario}`}>
                    Paciente: {certificadoSeleccionado.paciente?.nombre_completo || "—"}
                  </p>
                  {mostrarContenido ? (
                    <p className={`text-xs ${tema.colores.textoSecundario} whitespace-pre-wrap`}>
                      {certificadoSeleccionado.contenido?.slice(0, 400) || "Certificado sin contenido"}
                      {certificadoSeleccionado.contenido?.length > 400 ? "..." : ""}
                    </p>
                  ) : (
                    <p className={`text-xs italic ${tema.colores.textoSecundario}`}>
                      Contenido oculto por confidencialidad
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        if (!certificadoSeleccionado.url_documento) return;
                        window.open(certificadoSeleccionado.url_documento, "_blank");
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold ${tema.colores.primario} text-white flex items-center gap-2`}
                    >
                      <Download className="w-4 h-4" /> Descargar PDF
                    </button>
                    <button
                      onClick={() =>
                        certificadoSeleccionado.codigo_verificacion &&
                        navigator.clipboard.writeText(certificadoSeleccionado.codigo_verificacion)
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold ${tema.colores.hover} flex items-center gap-2`}
                    >
                      <Copy className="w-4 h-4" /> Copiar código
                    </button>
                  </div>
                </div>
              ) : (
                <p className={tema.colores.textoSecundario}>Selecciona un certificado para ver el detalle</p>
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <footer
          className={`mt-8 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
          <p className={tema.colores.textoSecundario}>
            © {new Date().getFullYear()} AnyssaMed · Módulo de certificados médicos
          </p>
          <div className="flex gap-4">
            <Link
              href="/ayuda"
              className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className={`text-sm font-semibold ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Términos
            </Link>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes wave {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(temaActual)
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }
      `}</style>
    </div>
  );
}
