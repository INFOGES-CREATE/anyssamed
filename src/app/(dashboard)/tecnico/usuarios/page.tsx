"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Cpu,
  Database,
  FileText,
  Filter,
  Globe,
  Home,
  Lightbulb,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
  Wrench,
  X,
} from "lucide-react";

// ===============================
// TIPOS REUTILIZADOS / SESIÓN
// ===============================

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

interface RolUsuario {
  id_rol: number;
  nombre: string;
  nivel_jerarquia: number;
}

interface CentroBasico {
  id_centro: number;
  nombre: string;
  ciudad?: string;
  region?: string;
  logo_url?: string | null;
}

interface TecnicoSesion {
  id_tecnico: number;
  id_centro: number;
  id_sucursal: number | null;
  id_departamento: number | null;
  area_tecnica: string;
  tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
  extension_telefonica: string | null;
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
  turno: "matutino" | "vespertino" | "nocturno" | "rotativo";
  nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
  pais: string;
  region: string;
  zona_horaria: string;
  centro: CentroBasico;
  es_global: boolean;
}

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: RolUsuario;
  tecnico?: TecnicoSesion;
}

// ===============================
// TIPO PARA USUARIOS GESTIONADOS
// ===============================

type EstadoUsuario = "activo" | "inactivo" | "suspendido" | "bloqueado";

interface UsuarioGestion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol_nombre: string;
  nivel_jerarquia: number;
  estado: EstadoUsuario;
  telefono: string | null;
  centro: CentroBasico;
  ultima_actividad: string | null;
  es_superadmin: boolean;
  es_tecnico: boolean;
  es_secretaria: boolean;
  es_admin_centro: boolean;
}

// ===============================
// TEMAS (MISMOS QUE EN DASHBOARD)
// ===============================

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
    nombre: "Azul Técnico",
    icono: Activity,
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
    nombre: "Púrpura Industrial",
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
    nombre: "Verde Operacional",
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
      sidebar: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/80 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

// ===============================
// COMPONENTE PRINCIPAL
// ===============================

export default function TecnicoUsuariosPage() {
  // Sesión y estado general
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);

  // Tema / UI
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  // Datos de usuarios
  const [usuarios, setUsuarios] = useState<UsuarioGestion[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");
  const [filtroRol, setFiltroRol] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Métricas resumidas
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [usuariosActivos, setUsuariosActivos] = useState(0);
  const [usuariosInactivos, setUsuariosInactivos] = useState(0);
  const [usuariosGlobales, setUsuariosGlobales] = useState(0);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  

  // ===========================
  // EFECTOS
  // ===========================

  useEffect(() => {
    // Cargar tema desde localStorage si existe
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico");
      if (temaGuardado && ["light", "dark", "blue", "purple", "green"].includes(temaGuardado)) {
        setTemaActual(temaGuardado as TemaColor);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    cargarSesion();
  }, []);

  useEffect(() => {
    if (usuarioSesion?.tecnico) {
      cargarUsuarios();
    }
  }, [usuarioSesion]);

  // ===========================
  // FUNCIONES DE CARGA
  // ===========================

  const cargarSesion = async () => {
    try {
      setLoadingSesion(true);

      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();

      if (!data.success || !data.usuario) {
        window.location.href = "/login";
        return;
      }

      const rolesUsuario: string[] = [];

      if (data.usuario.rol) {
        rolesUsuario.push(
          data.usuario.rol.nombre
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase()
        );
      }

      const tieneRolTecnico = rolesUsuario.some(
        (rol) => rol.includes("TECNICO") || rol.includes("SOPORTE")
      );

      if (!tieneRolTecnico) {
        alert(
          `Acceso denegado. Este módulo es solo para técnicos. Tus roles actuales: ${rolesUsuario.join(
            ", "
          )}`
        );
        window.location.href = "/";
        return;
      }

      if (!data.usuario.tecnico) {
        alert(
          "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
        );
        window.location.href = "/";
        return;
      }

      setUsuarioSesion(data.usuario);
    } catch (error) {
      console.error("Error al cargar sesión técnico:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoadingSesion(false);
    }
  };

  const cargarUsuarios = async () => {
    if (!usuarioSesion?.tecnico?.id_tecnico) return;

    try {
      setLoadingUsuarios(true);

      const url = `/api/tecnico/usuarios?id_tecnico=${usuarioSesion.tecnico.id_tecnico}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al cargar usuarios técnico:", data);
        return;
      }

      const lista: UsuarioGestion[] = data.usuarios || [];
      setUsuarios(lista);

      // Métricas
      setTotalUsuarios(lista.length);
      setUsuariosActivos(lista.filter((u) => u.estado === "activo").length);
      setUsuariosInactivos(lista.filter((u) => u.estado !== "activo").length);
      setUsuariosGlobales(
        lista.filter(
          (u) =>
            u.es_tecnico &&
            (u.rol_nombre || "").toLowerCase().includes("global")
        ).length
      );
    } catch (error) {
      console.error("Error al cargar usuarios técnico:", error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // ===========================
  // ACCIONES
  // ===========================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (error) {
      console.error("No se pudo guardar el tema en BD:", error);
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleEstadoUsuario = async (usuario: UsuarioGestion) => {
    const nuevoEstado: EstadoUsuario =
      usuario.estado === "activo" ? "inactivo" : "activo";

    if (
      !confirm(
        `¿Seguro que deseas ${
          nuevoEstado === "activo" ? "activar" : "desactivar"
        } al usuario ${usuario.nombre} ${usuario.apellido_paterno}?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/tecnico/usuarios/${usuario.id_usuario}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        alert("No se pudo actualizar el estado del usuario");
        console.error("Error al actualizar estado:", data);
        return;
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === usuario.id_usuario ? { ...u, estado: nuevoEstado } : u
        )
      );

      // Actualizar métricas
      const listaActualizada = usuarios.map((u) =>
        u.id_usuario === usuario.id_usuario ? { ...u, estado: nuevoEstado } : u
      );
      setUsuariosActivos(
        listaActualizada.filter((u) => u.estado === "activo").length
      );
      setUsuariosInactivos(
        listaActualizada.filter((u) => u.estado !== "activo").length
      );
    } catch (error) {
      console.error("Error al actualizar estado usuario:", error);
      alert("Ocurrió un error al actualizar el estado del usuario");
    }
  };

  // ===========================
  // AUXILIARES
  // ===========================

  const obtenerColorEstadoUsuario = (estado: EstadoUsuario): string => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const base = (color: string) =>
      isDark
        ? `bg-${color}-500/20 text-${color}-300 border-${color}-500/40`
        : `bg-${color}-100 text-${color}-800 border-${color}-200`;

    switch (estado) {
      case "activo":
        return isDark
          ? "bg-green-500/20 text-green-300 border-green-500/40"
          : "bg-green-100 text-green-800 border-green-200";
      case "inactivo":
        return isDark
          ? "bg-gray-500/20 text-gray-300 border-gray-500/40"
          : "bg-gray-100 text-gray-800 border-gray-200";
      case "suspendido":
        return isDark
          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "bloqueado":
        return isDark
          ? "bg-red-500/20 text-red-300 border-red-500/40"
          : "bg-red-100 text-red-800 border-red-200";
      default:
        return base("gray");
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin registro";
    const date = new Date(fecha);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // ===========================
  // DERIVADOS (FILTROS)
  // ===========================

  const centrosUnicos = useMemo(() => {
    const mapa = new Map<number, CentroBasico>();
    usuarios.forEach((u) => {
      if (u.centro && !mapa.has(u.centro.id_centro)) {
        mapa.set(u.centro.id_centro, u.centro);
      }
    });
    return Array.from(mapa.values());
  }, [usuarios]);

  const rolesUnicos = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => {
      if (u.rol_nombre) set.add(u.rol_nombre);
    });
    return Array.from(set);
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroCentro !== "todos" && String(u.centro.id_centro) !== filtroCentro) {
        return false;
      }
      if (filtroRol !== "todos" && u.rol_nombre !== filtroRol) {
        return false;
      }
      if (filtroEstado !== "todos" && u.estado !== filtroEstado) {
        return false;
      }

      if (!busqueda.trim()) return true;

      const texto = `${u.nombre} ${u.apellido_paterno} ${u.apellido_materno ?? ""} ${
        u.username
      } ${u.email} ${u.centro?.nombre ?? ""} ${u.rol_nombre}`.toLowerCase();

      return texto.includes(busqueda.toLowerCase());
    });
  }, [usuarios, filtroCentro, filtroRol, filtroEstado, busqueda]);

  // ===========================
  // LOADING / SIN SESIÓN
  // ===========================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando gestión de usuarios...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando la vista de usuarios de tus centros
          </p>
        </div>
      </div>
    );
  }

  if (!usuarioSesion || !usuarioSesion.tecnico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al módulo de usuarios técnicos.
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

  const esGlobal = usuarioSesion.tecnico.es_global;

  // ===========================
  // RENDER COMPLETO
  // ===========================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR BÁSICA SOLO PARA COHERENCIA VISUAL */}
       <SidebarTecnico
  usuario={{
    nombre: usuarioSesion.nombre,
    apellido_paterno: usuarioSesion.apellido_paterno,
    foto_perfil_url: usuarioSesion.foto_perfil_url
  }}
  tema={tema}
  sidebarAbierto={sidebarAbierto}
  setSidebarAbierto={setSidebarAbierto}
  estadisticas={estadisticas}
/>



      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar usuario por nombre, correo, centro o rol..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
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

          {/* Acciones header */}
          <div className="flex items-center gap-3 ml-6">
            {/* Selector tema */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4 space-y-2`}
              >
                <p className={`text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Seleccionar Tema
                </p>
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

            {/* Alertas dummy (solo visual) */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <h3
                      className={`text-lg font-black ${tema.colores.texto}`}
                    >
                      Notificaciones
                    </h3>
                  </div>

                  <div className={`divide-y ${tema.colores.borde}`}>
                    <div className="p-4">
                      <p
                        className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                      >
                        Nuevos usuarios creados
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        2 usuarios registrados hoy en tu centro
                      </p>
                    </div>
                    <div className="p-4">
                      <p
                        className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                      >
                        Usuarios desactivados
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        1 cuenta fue desactivada por el administrador
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuarioSesion.nombre} {usuarioSesion.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Técnico {esGlobal ? "Global" : "Centro"}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                >
                  {usuarioSesion.foto_perfil_url ? (
                    <Image
                      src={usuarioSesion.foto_perfil_url}
                      alt={usuarioSesion.nombre}
                      width={40}
                      height={40}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuarioSesion.nombre[0]}${usuarioSesion.apellido_paterno[0]}`
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/50">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {usuarioSesion.foto_perfil_url ? (
                        <Image
                          src={usuarioSesion.foto_perfil_url}
                          alt={usuarioSesion.nombre}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuarioSesion.nombre[0]}${usuarioSesion.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        {usuarioSesion.nombre} {usuarioSesion.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}
                      >
                        {usuarioSesion.tecnico?.tipo_tecnico}
                      </p>
                      <p
                        className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                      >
                        {usuarioSesion.tecnico?.centro?.nombre ??
                          "Sin centro asignado"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
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

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 p-8`}
      >
        {/* Título y resumen */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              Gestión de Usuarios
              <span className="text-sm px-3 py-1 rounded-full bg-black/10 font-bold flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalUsuarios} usuarios
              </span>
            </h2>
            <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
              {obtenerSaludo()}, {usuarioSesion.nombre}. Estás gestionando usuarios{" "}
              {esGlobal ? "de todos los centros (modo GLOBAL)" : "de tu centro asignado"}.
            </p>
            <p
              className={`text-xs font-medium mt-1 ${tema.colores.textoSecundario} flex items-center gap-1`}
            >
              <MapPin className="w-3 h-3" />
              {usuarioSesion.tecnico?.centro?.nombre} •{" "}
              {usuarioSesion.tecnico?.area_tecnica}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarUsuarios}
              className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingUsuarios ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>

            <Link
              href="/admin/usuarios/nuevo"
              className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform`}
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </Link>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total usuarios */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center gap-3`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                Usuarios totales
              </p>
              <p className={`text-2xl font-black ${tema.colores.texto}`}>
                {totalUsuarios}
              </p>
            </div>
          </div>

          {/* Activos */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center gap-3`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                Usuarios activos
              </p>
              <p className={`text-2xl font-black ${tema.colores.texto}`}>
                {usuariosActivos}
              </p>
            </div>
          </div>

          {/* Inactivos */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center gap-3`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                Usuarios no activos
              </p>
              <p className={`text-2xl font-black ${tema.colores.texto}`}>
                {usuariosInactivos}
              </p>
            </div>
          </div>

          {/* Globales vista info */}
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex items-center gap-3`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                Modo técnico
              </p>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                {esGlobal ? "GLOBAL (todos los centros)" : "CENTRO (solo tu centro)"}
              </p>
              {esGlobal && (
                <p className={`text-[11px] ${tema.colores.textoSecundario}`}>
                  Puedes ver y desactivar usuarios de todos los centros
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div
          className={`rounded-2xl p-4 mb-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} flex flex-wrap gap-3 items-center`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="w-4 h-4" />
            <span>Filtros rápidos</span>
          </div>

          <select
            value={filtroCentro}
            onChange={(e) => setFiltroCentro(e.target.value)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
          >
            <option value="todos">
              {esGlobal ? "Todos los centros" : "Mi centro"}
            </option>
            {centrosUnicos.map((c) => (
              <option key={c.id_centro} value={String(c.id_centro)}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
          >
            <option value="todos">Todos los roles</option>
            {rolesUnicos.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="suspendido">Suspendidos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>

          <button
            onClick={() => {
              setFiltroCentro("todos");
              setFiltroRol("todos");
              setFiltroEstado("todos");
              setBusqueda("");
            }}
            className={`ml-auto px-3 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
          >
            Limpiar filtros
          </button>
        </div>

        {/* TABLA DE USUARIOS */}
        <div
          className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                Usuarios encontrados: {usuariosFiltrados.length}
              </p>
              <p
                className={`text-xs font-medium ${tema.colores.textoSecundario}`}
              >
                Solo puedes desactivar / activar usuarios. No se permite eliminar
                cuentas desde este módulo.
              </p>
            </div>
            <Link
              href="/admin/usuarios"
              className={`hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
            >
              <UserCog className="w-4 h-4" />
              Ver panel completo (Admin)
            </Link>
          </div>

          {loadingUsuarios ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
                <p
                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
                >
                  Cargando usuarios de tus centros...
                </p>
              </div>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <div
                className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <UserX className="w-12 h-12 text-white" />
              </div>
              <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>
                No se encontraron usuarios con los filtros actuales
              </p>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Ajusta los filtros o limpia la búsqueda para ver más resultados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full text-sm">
                <thead>
                  <tr
                    className={`text-left text-xs uppercase tracking-wide ${tema.colores.textoSecundario} border-b ${tema.colores.borde}`}
                  >
                    <th className="py-3 px-3">Usuario</th>
                    <th className="py-3 px-3">Rol</th>
                    <th className="py-3 px-3">Centro</th>
                    <th className="py-3 px-3 hidden md:table-cell">
                      Última actividad
                    </th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u, idx) => (
                    <tr
                      key={u.id_usuario}
                      className={`border-b ${tema.colores.borde} hover:bg-black/5 transition-colors`}
                    >
                      {/* Usuario */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xs overflow-hidden`}
                          >
                            {u.foto_perfil_url ? (
                              <Image
                                src={u.foto_perfil_url}
                                alt={u.nombre}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <>
                                {u.nombre[0]}
                                {u.apellido_paterno[0]}
                              </>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-bold truncate ${tema.colores.texto}`}
                            >
                              {u.nombre} {u.apellido_paterno}
                            </p>
                            <p
                              className={`text-xs truncate ${tema.colores.textoSecundario}`}
                            >
                              {u.email}
                            </p>
                            <p
                              className={`text-[11px] ${tema.colores.textoSecundario}`}
                            >
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold">
                            {u.rol_nombre}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {u.es_superadmin && (
                              <span className="px-2 py-1 text-[10px] rounded-full bg-red-500/10 text-red-500 border border-red-500/40 font-bold">
                                SUPERADMIN
                              </span>
                            )}
                            {u.es_admin_centro && (
                              <span className="px-2 py-1 text-[10px] rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/40 font-bold">
                                ADMIN CENTRO
                              </span>
                            )}
                            {u.es_tecnico && (
                              <span className="px-2 py-1 text-[10px] rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 font-bold">
                                TÉCNICO
                              </span>
                            )}
                            {u.es_secretaria && (
                              <span className="px-2 py-1 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 font-bold">
                                SECRETARIA
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Centro */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center text-[10px] font-bold uppercase">
                            {(u.centro.nombre || "?").slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-semibold truncate ${tema.colores.texto}`}
                            >
                              {u.centro.nombre}
                            </p>
                            <p
                              className={`text-[11px] ${tema.colores.textoSecundario}`}
                            >
                              {u.centro.ciudad ?? ""}{" "}
                              {u.centro.region ? `• ${u.centro.region}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Última actividad */}
                      <td className="py-3 px-3 hidden md:table-cell align-top">
                        <p
                          className={`text-xs ${tema.colores.textoSecundario}`}
                        >
                          {formatearFecha(u.ultima_actividad)}
                        </p>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-bold ${obtenerColorEstadoUsuario(
                            u.estado
                          )}`}
                        >
                          {u.estado === "activo" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {u.estado.toUpperCase()}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right align-top">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/admin/usuarios/${u.id_usuario}`}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => toggleEstadoUsuario(u)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                              u.estado === "activo"
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {u.estado === "activo" ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-4 mt-8`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
          >
            © 2025 AnyssaMed - Gestión de Usuarios Técnicos.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className={tema.colores.textoSecundario}>
              Módulo sólo de activación / desactivación. Eliminación reservada a
              SuperAdmin.
            </span>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES (SCROLLBAR, ANIMACIONES) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
        .custom-scrollbar {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          scrollbar-width: thin;
        }
      `}</style>
    </div>
  );
}
