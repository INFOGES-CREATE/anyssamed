// src/app/(dashboard)/[role]/tareas/nueva/page.tsx
"use client";

import {
  useState,
  useEffect,
  useMemo,
  FormEvent,
  ChangeEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import { useParams, usePathname, useRouter } from "next/navigation";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CalendarPlus,
  CalendarClock,
  X,
  CalendarCheck,
  BarChart3,
  Stethoscope,
  FileText,
  Send,
  FileSpreadsheet,
  Video,
  Award,
  Square,
  TrendingUp,
  Pill,
  UserCog,
  UserPlus,
  Bell,
  BellOff,
  PhoneOutgoing,
  PhoneIncoming,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Filter,
  Flame,
  Home,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  PieChart,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Moon,
  User,
  UserCheck,
  Users,
  Target,
  Paperclip,
  Trash,
  Zap,
  Layers,
  Tag,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Lightbulb,
  TrendingDown,
  Hash,
  Building2,
  MapPin,
} from "lucide-react";

// ========================================
// TIPOS DE DATOS
// ========================================

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
  roles?: Array<{
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  }>;
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

type TareaPrioridad = "baja" | "media" | "alta" | "critica";

type TareaEstado =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "en_espera"
  | "rechazada"
  | "resuelta"
  | "cerrada";

type TipoTarea = "secretaria" | "tecnico" | "administrativo" | "sistema";

interface CentroResumen {
  id_centro: number;
  nombre: string;
}

interface SucursalResumen {
  id_sucursal: number;
  nombre: string;
  id_centro: number;
}

interface UsuarioAsignable {
  id_usuario: number;
  nombre_completo: string;
  rol: string;
  centro?: CentroResumen | null;
  sucursal?: SucursalResumen | null;
}

interface CategoriaTarea {
  id_categoria: number;
  nombre: string;
  color: string;
  icono: string | null;
  activo: boolean;
}

interface OpcionesTareas {
  centros: CentroResumen[];
  sucursales: SucursalResumen[];
  categorias: CategoriaTarea[];
  posibles_responsables: UsuarioAsignable[];
  tags_sugeridos: string[];
}

interface NotificacionSistema {
  id_notificacion: number;
  titulo: string;
  descripcion: string;
  fecha_hora: string;
  leida: boolean;
  prioridad: "baja" | "media" | "alta";
}

interface SubtareaForm {
  id: number;
  titulo: string;
}

// ========================================
// CONFIGURACIÓN DE TEMAS ULTRA PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50/30 to-indigo-50/50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
      secundario: "bg-gray-100 hover:bg-gray-200",
      acento: "text-indigo-600",
      borde: "border-gray-200/80",
      sombra: "shadow-2xl shadow-indigo-500/10",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/98 backdrop-blur-2xl border-gray-200/80",
      header: "bg-white/95 backdrop-blur-2xl border-gray-200/80",
      card: "bg-white/95 backdrop-blur-sm border-gray-200/80 hover:border-indigo-300/60",
      hover: "hover:bg-gray-50/80",
    },
  },
  dark: {
    nombre: "Oscuro Elite",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950/50 to-purple-950/30",
      fondoSecundario: "bg-gray-900/95",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
      secundario: "bg-gray-800/80 hover:bg-gray-700/80",
      acento: "text-indigo-400",
      borde: "border-gray-800/60",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/98 backdrop-blur-2xl border-gray-800/60",
      header: "bg-gray-900/95 backdrop-blur-2xl border-gray-800/60",
      card: "bg-gray-800/60 backdrop-blur-sm border-gray-700/60 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800/80",
    },
  },
  blue: {
    nombre: "Azul Océano Premium",
    icono: Sparkles,
    colores: {
      fondo: "from-blue-950 via-cyan-950/50 to-teal-950/30",
      fondoSecundario: "bg-blue-900/95",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario:
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
      secundario: "bg-blue-800/80 hover:bg-blue-700/80",
      acento: "text-cyan-400",
      borde: "border-cyan-800/60",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/98 backdrop-blur-2xl border-cyan-800/60",
      header: "bg-blue-900/95 backdrop-blur-2xl border-cyan-800/60",
      card: "bg-blue-800/60 backdrop-blur-sm border-cyan-700/60 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800/80",
    },
  },
  purple: {
    nombre: "Púrpura Real Luxury",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950/50 to-pink-950/30",
      fondoSecundario: "bg-purple-900/95",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500",
      secundario: "bg-purple-800/80 hover:bg-purple-700/80",
      acento: "text-fuchsia-400",
      borde: "border-purple-800/60",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/98 backdrop-blur-2xl border-purple-800/60",
      header: "bg-purple-900/95 backdrop-blur-2xl border-purple-800/60",
      card: "bg-purple-800/60 backdrop-blur-sm border-purple-700/60 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800/80",
    },
  },
  green: {
    nombre: "Verde Médico Pro",
    icono: Users,
    colores: {
      fondo: "from-emerald-950 via-teal-950/50 to-cyan-950/30",
      fondoSecundario: "bg-emerald-900/95",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      secundario: "bg-teal-800/80 hover:bg-teal-700/80",
      acento: "text-emerald-400",
      borde: "border-emerald-800/60",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/98 backdrop-blur-2xl border-emerald-800/60",
      header: "bg-emerald-900/95 backdrop-blur-2xl border-emerald-800/60",
      card: "bg-emerald-800/60 backdrop-blur-sm border-emerald-700/60 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800/80",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL ULTRA PREMIUM
// ========================================

export default function NuevaTareaPage() {
  const params = useParams<{ role: string }>();
  const roleParam = (params?.role as string) || "tecnico";
  const pathname = usePathname();
  const router = useRouter();

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");

  // Carga / estado
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [loadingOpciones, setLoadingOpciones] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Opciones dinámicas desde la API
  const [opciones, setOpciones] = useState<OpcionesTareas | null>(null);

  // Notificaciones / UI
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(
    []
  );
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  // Buscador en header
  const [busqueda, setBusqueda] = useState("");

  // Formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<TareaPrioridad>("media");
  const [estado, setEstado] = useState<TareaEstado>("pendiente");
  const [tipoTarea, setTipoTarea] = useState<TipoTarea | "">("");
  const [centroId, setCentroId] = useState<string>("");
  const [sucursalId, setSucursalId] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [fechaLimite, setFechaLimite] = useState<string>("");

  const [tagsInput, setTagsInput] = useState<string>("");
  const [tagsSeleccionados, setTagsSeleccionados] = useState<string[]>([]);

  const [idResponsable, setIdResponsable] = useState<string>("");
  const [idsColaboradores, setIdsColaboradores] = useState<string[]>([]);

  const [subtareas, setSubtareas] = useState<SubtareaForm[]>([]);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(
    null
  );

  // Mensajes
  const [errores, setErrores] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const roleLabel = useMemo(() => {
    const map: Record<string, string> = {
      secretaria: "Secretaria",
      medico: "Médico",
      tecnico: "Técnico",
      nutricionista: "Nutricionista",
      administrativo: "Administrativo",
      enfermera: "Enfermera",
      odontologo: "Odontólogo",
      matrona: "Matrona",
      psicologo: "Psicólogo",
    };
    return map[roleParam] ?? "Secretaria";
  }, [roleParam]);

  const pathnameActual = usePathname();

  const seccionActiva = useMemo(() => {
    if (!pathnameActual) return "";
    if (pathnameActual.includes("/confirmaciones")) return "confirmaciones";
    if (pathnameActual.includes("/llamadas")) return "llamadas";
    if (pathnameActual.includes("/pacientes")) return "pacientes";
    if (pathnameActual.includes("/medicos")) return "medicos";
    if (pathnameActual.includes("/recordatorios")) return "recordatorios";
    if (pathnameActual.includes("/documentos")) return "documentos";
    if (pathnameActual.includes("/mensajes")) return "mensajes";
    if (pathnameActual.includes("/telemedicina")) return "telemedicina";
    if (pathnameActual.includes("/tareas")) return "tareas";
    if (pathnameActual.includes("/reportes")) return "reportes";
    if (pathnameActual.includes("/perfil")) return "perfil";
    if (pathnameActual.includes("/configuracion")) return "configuracion";
    if (pathnameActual.includes("/agenda")) return "agenda";
    return "dashboard";
  }, [pathnameActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-700`;
  }, [tema]);

  useEffect(() => {
    const key = `tema_tareas_${roleParam}`;
    if (typeof window !== "undefined") {
      const guardado = window.localStorage.getItem(key) as TemaColor | null;
      if (guardado && TEMAS[guardado]) {
        setTemaActual(guardado);
      }
    }
  }, [roleParam]);

  // Cargar usuario
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingUsuario(true);
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const result = await response.json();
        if (!result.success || !result.usuario) {
          window.location.href = "/login";
          return;
        }

        setUsuario(result.usuario);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        window.location.href = "/login";
      } finally {
        setLoadingUsuario(false);
      }
    };

    cargarUsuario();
  }, []);

  // Cargar opciones
  useEffect(() => {
    if (!usuario) return;

    const cargarOpciones = async () => {
      try {
        setLoadingOpciones(true);
        const res = await fetch(
          `/api/tareas/opciones?usuario=${usuario.id_usuario}&rol=${roleParam}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          console.error("Error al cargar opciones de tareas:", data);
          return;
        }

        setOpciones({
          centros: data.centros || [],
          sucursales: data.sucursales || [],
          categorias: data.categorias || [],
          posibles_responsables: data.posibles_responsables || [],
          tags_sugeridos: data.tags_sugeridos || [],
        });
      } catch (error) {
        console.error("Error al cargar opciones:", error);
      } finally {
        setLoadingOpciones(false);
      }
    };

    cargarOpciones();
  }, [usuario, roleParam]);

  // Valores por defecto
  useEffect(() => {
    if (!usuario) return;

    if (!idResponsable) {
      setIdResponsable(String(usuario.id_usuario));
    }

    if (!tipoTarea) {
      const mapa: Record<string, TipoTarea> = {
        secretaria: "secretaria",
        tecnico: "tecnico",
        administrativo: "administrativo",
      };
      setTipoTarea(mapa[roleParam] || "sistema");
    }
  }, [usuario, roleParam, idResponsable, tipoTarea]);

  // Preseleccionar centro único
  useEffect(() => {
    if (opciones?.centros?.length === 1 && !centroId) {
      setCentroId(String(opciones.centros[0].id_centro));
    }
  }, [opciones?.centros, centroId]);

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    const key = `tema_tareas_${roleParam}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, nuevoTema);
    }
    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (error) {
      console.error("No se pudo guardar preferencia de tema:", error);
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

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const toggleTagSugerido = (tag: string) => {
    setTagsSeleccionados((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const agregarSubtarea = () => {
    setSubtareas((prev) => [
      ...prev,
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, titulo: "" },
    ]);
  };

  const actualizarSubtareaTitulo = (id: number, valor: string) => {
    setSubtareas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, titulo: valor } : s))
    );
  };

  const eliminarSubtarea = (id: number) => {
    setSubtareas((prev) => prev.filter((s) => s.id !== id));
  };

  const handleArchivosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchivos(files);
  };

  const handleColaboradoresChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setIdsColaboradores(values);
  };

  const obtenerColorPrioridad = (prioridad: TareaPrioridad) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const map: Record<TareaPrioridad, string> = {
      critica: isDark
        ? "bg-red-600/30 text-red-200 border-red-500/70 shadow-xl shadow-red-500/30"
        : "bg-red-100 text-red-800 border-red-400 shadow-md",
      alta: isDark
        ? "bg-amber-500/30 text-amber-200 border-amber-500/70 shadow-lg shadow-amber-500/20"
        : "bg-amber-100 text-amber-800 border-amber-400 shadow-sm",
      media: isDark
        ? "bg-sky-500/30 text-sky-200 border-sky-500/70 shadow-lg shadow-sky-500/20"
        : "bg-sky-100 text-sky-800 border-sky-400 shadow-sm",
      baja: isDark
        ? "bg-emerald-500/30 text-emerald-200 border-emerald-500/70 shadow-lg shadow-emerald-500/20"
        : "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-sm",
    };
    return map[prioridad];
  };

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setErrores(null);
    setMensajeExito(null);

    const erroresForm: string[] = [];

    if (!titulo.trim()) {
      erroresForm.push("El título de la tarea es obligatorio.");
    }

    if (!tipoTarea) {
      erroresForm.push("Debes seleccionar el tipo de tarea.");
    }

    if (!idResponsable) {
      erroresForm.push("Debes seleccionar un responsable principal.");
    }

    if (erroresForm.length > 0) {
      setErrores(erroresForm.join(" "));
      return;
    }

    const tipoPorRol: Record<string, TipoTarea> = {
      secretaria: "secretaria",
      tecnico: "tecnico",
      administrativo: "administrativo",
    };

    const tipoFinal: TipoTarea =
      (tipoTarea || tipoPorRol[roleParam] || "sistema") as TipoTarea;

    const tagsManual = tagsInput
      .split(/[,#]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const tags = Array.from(new Set([...tagsManual, ...tagsSeleccionados]));

    const subtareasLimpias = subtareas
      .map((s) => s.titulo.trim())
      .filter(Boolean)
      .map((titulo) => ({ titulo }));

    const colaboradores = idsColaboradores
      .map((id) => Number(id))
      .filter((id) => id && id !== Number(idResponsable));

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      prioridad,
      estado,
      tipo_tarea: tipoFinal,
      id_centro: centroId ? Number(centroId) : null,
      id_sucursal: sucursalId ? Number(sucursalId) : null,
      fecha_limite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
      tags,
      id_responsable: idResponsable ? Number(idResponsable) : null,
      id_creador: usuario.id_usuario,
      subtareas: subtareasLimpias,
      colaboradores,
      categoria_id: categoriaId ? Number(categoriaId) : null,
      role: roleParam,
    };

    try {
      setEnviando(true);

      let res: Response;
      let data: any;

      if (archivos.length > 0) {
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));
        archivos.forEach((file) => {
          formData.append("adjuntos", file, file.name);
        });

        res = await fetch("/api/tareas", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        res = await fetch("/api/tareas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.error("Error al crear tarea:", data);
        setErrores(
          data?.message || "No se pudo crear la tarea. Intenta nuevamente."
        );
        return;
      }

      setMensajeExito("✅ Tarea creada correctamente en INFOGES.");
      const idTareaNueva = data.tarea?.id_tarea;

      setTimeout(() => {
        if (idTareaNueva) {
          router.push(`/${roleParam}/tareas/${idTareaNueva}`);
        } else {
          router.push(`/${roleParam}/tareas`);
        }
      }, 1500);
    } catch (error) {
      console.error("Error al enviar tarea:", error);
      setErrores("Ocurrió un error inesperado al crear la tarea.");
    } finally {
      setEnviando(false);
    }
  };

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loadingUsuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-40 h-40 border-4 border-indigo-400/30 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-purple-400/30 border-t-purple-600 rounded-full animate-spin-reverse" />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse shadow-2xl`}
            >
              <Plus className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>
          <h2
            className={`text-5xl font-black mb-4 ${tema.colores.texto} bg-clip-text text-transparent bg-gradient-to-r ${tema.colores.gradiente}`}
          >
            Cargando Formulario Premium
          </h2>
          <p
            className={`text-xl font-bold ${tema.colores.textoSecundario} animate-pulse flex items-center justify-center gap-2`}
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            Preparando experiencia de creación avanzada
            <Sparkles className="w-5 h-5 animate-spin" />
          </p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} p-4`}
      >
        <div
          className={`text-center max-w-md mx-auto p-10 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border-2 backdrop-blur-xl`}
        >
          <div
            className={`w-28 h-28 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl`}
          >
            <AlertCircle className="w-14 h-14 text-white" />
          </div>
          <h2
            className={`text-4xl font-black mb-4 ${tema.colores.texto} bg-clip-text text-transparent bg-gradient-to-r ${tema.colores.gradiente}`}
          >
            Acceso Restringido
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            Necesitas autenticación para crear tareas.
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-10 py-5 ${tema.colores.primario} text-white rounded-2xl font-black text-lg transition-all duration-300 hover:scale-110 ${tema.colores.sombra}`}
          >
            <LogOut className="w-6 h-6" />
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER PRINCIPAL ULTRA PREMIUM
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-700 bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
    >
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${tema.colores.gradiente} opacity-10 rounded-full blur-3xl animate-float`}
        />
        <div
          className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr ${tema.colores.gradiente} opacity-10 rounded-full blur-3xl animate-float-delayed`}
        />
      </div>

      {/* SIDEBAR */}
      <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />

      {/* HEADER ULTRA PREMIUM */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b-2 ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href={`/${roleParam}/tareas`}
              className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all duration-300 shadow-lg`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1
                className={`text-2xl font-black ${tema.colores.texto} flex items-center gap-2`}
              >
                <Plus className="w-6 h-6 text-indigo-400" />
                Nueva Tarea Premium
              </h1>
              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                Crea tareas con inteligencia y estilo profesional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-4 rounded-2xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 ${tema.colores.sombra}`}
              >
                <Sparkles className="w-6 h-6 animate-pulse" />
              </button>
              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-5 space-y-3 backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <p
                    className={`text-sm font-black ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Temas Premium
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${tema.colores.gradiente} text-white font-bold`}
                  >
                    PRO
                  </span>
                </div>
                {Object.entries(TEMAS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as TemaColor)}
                    className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${
                      temaActual === key
                        ? `bg-gradient-to-r ${t.colores.gradiente} text-white shadow-xl scale-105`
                        : `${tema.colores.hover} ${tema.colores.texto} hover:scale-105`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <t.icono className="w-5 h-5" />
                      <span>{t.nombre}</span>
                    </div>
                    {temaActual === key && (
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-4 rounded-2xl font-bold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 ${tema.colores.sombra}`}
              >
                <Bell className="w-6 h-6" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-ping" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-xl">
                      {notificaciones.filter((n) => !n.leida).length > 9
                        ? "9+"
                        : notificaciones.filter((n) => !n.leida).length}
                    </span>
                  </>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-3 w-[420px] rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} max-h-[500px] overflow-y-auto custom-scrollbar backdrop-blur-xl animate-slideDown`}
                >
                  <div
                    className={`p-5 border-b-2 ${tema.colores.borde} sticky top-0 ${tema.colores.card} backdrop-blur-xl z-10`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-xl font-black ${tema.colores.texto} flex items-center gap-2`}
                      >
                        <Bell className="w-5 h-5" />
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-bold ${tema.colores.acento} hover:underline flex items-center gap-1`}
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Marcar todas
                      </button>
                    </div>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="p-10 text-center">
                      <BellOff
                        className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`text-base font-bold ${tema.colores.textoSecundario}`}
                      >
                        No hay notificaciones
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y-2 ${tema.colores.borde}`}>
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-5 ${tema.colores.hover} cursor-pointer transition-all hover:scale-[1.02] ${
                            !notif.leida
                              ? "bg-indigo-500/10 border-l-4 border-indigo-500"
                              : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-3 h-3 rounded-full mt-2 ${
                                !notif.leida
                                  ? "bg-indigo-500 animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p
                                className={`text-base font-black mb-2 ${tema.colores.texto}`}
                              >
                                {notif.titulo}
                              </p>
                              <p
                                className={`text-sm mb-3 ${tema.colores.textoSecundario}`}
                              >
                                {notif.descripcion}
                              </p>
                              <p
                                className={`text-xs font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
                              >
                                <Clock className="w-3 h-3" />
                                {new Date(notif.fecha_hora).toLocaleString(
                                  "es-CL"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 ${tema.colores.hover} hover:scale-105 ${tema.colores.sombra}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-base font-black ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p
                    className={`text-xs font-bold ${tema.colores.textoSecundario}`}
                  >
                    {roleLabel} · Premium
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black shadow-xl ring-4 ring-white/10`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={48}
                      height={48}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 ${tema.colores.texto} transition-transform duration-300 ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-3 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-6 backdrop-blur-xl animate-slideDown`}
                >
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b-2 border-gray-700/40">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-black text-2xl shadow-2xl ring-4 ring-white/10`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={80}
                          height={80}
                          className="rounded-2xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xl font-black ${tema.colores.texto} mb-1`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-bold ${tema.colores.textoSecundario} mb-2 flex items-center gap-2`}
                      >
                        <Shield className="w-4 h-4" />
                        {roleLabel}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario} truncate`}
                      >
                        {usuario.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/${roleParam}/perfil`}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href={`/${roleParam}/configuracion`}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-105`}
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

      {/* CONTENIDO PRINCIPAL ULTRA PREMIUM */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-28 p-8 relative z-10`}
      >
        {/* Encabezado */}
        <div className="mb-10">
          <h2
            className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-4 bg-clip-text text-transparent bg-gradient-to-r ${tema.colores.gradiente}`}
          >
            {obtenerSaludo()}, {usuario.nombre}
            <span className="animate-wave inline-block text-5xl">🚀</span>
          </h2>
          <p
            className={`text-xl font-bold ${tema.colores.textoSecundario} flex items-center gap-2`}
          >
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            Crea una nueva tarea con tecnología avanzada
          </p>
        </div>

        {/* Alertas */}
        {errores && (
          <div className="mb-6 rounded-3xl border-2 border-red-500/40 bg-red-500/10 p-6 flex gap-4 animate-shake backdrop-blur-sm">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-base font-bold text-red-100">{errores}</p>
          </div>
        )}
        {mensajeExito && (
          <div className="mb-6 rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 flex gap-4 animate-slideUp backdrop-blur-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0 animate-bounce" />
            <p className="text-base font-bold text-emerald-100">
              {mensajeExito}
            </p>
          </div>
        )}

        {/* Formulario Ultra Premium */}
        <form
          id="form-nueva-tarea"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Columna 1: info básica */}
            <div
              className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                >
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-2xl font-black ${tema.colores.texto}`}
                  >
                    Información de la tarea
                  </h3>
                  <p
                    className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                  >
                    Define título, descripción, categoría y prioridad
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto}`}>
                    Título de la tarea *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Confirmar agenda de pacientes críticos de hoy"
                    disabled={enviando}
                    className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 shadow-lg`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto}`}>
                    Descripción detallada
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={6}
                    disabled={enviando}
                    placeholder="Describe qué debe hacer el equipo, contexto, pasos, criterios de cierre..."
                    className={`w-full px-5 py-4 rounded-2xl text-base resize-none ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 shadow-lg custom-scrollbar`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto}`}>
                      Prioridad
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["baja", "media", "alta", "critica"] as TareaPrioridad[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrioridad(p)}
                          className={`px-4 py-3 rounded-2xl text-xs font-black border-2 transition-all duration-300 ${
                            prioridad === p
                              ? `${obtenerColorPrioridad(p)} scale-110 shadow-2xl`
                              : `${tema.colores.hover} ${tema.colores.texto} ${tema.colores.borde} hover:scale-105`
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto}`}>
                      Estado inicial
                    </label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as TareaEstado)}
                      disabled={enviando}
                      className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 shadow-lg cursor-pointer`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="en_revision">En revisión</option>
                      <option value="en_espera">En espera</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="resuelta">Resuelta</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto}`}>
                      Tipo de tarea
                    </label>
                    <select
                      value={tipoTarea}
                      onChange={(e) => setTipoTarea(e.target.value as TipoTarea)}
                      disabled={enviando}
                      className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 shadow-lg cursor-pointer`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="secretaria">Secretaría</option>
                      <option value="tecnico">Técnico</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="sistema">Sistema</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto}`}>
                      Categoría
                    </label>
                    <select
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      disabled={enviando || loadingOpciones}
                      className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 shadow-lg cursor-pointer`}
                    >
                      <option value="">
                        {loadingOpciones ? "Cargando..." : "Sin categoría"}
                      </option>
                      {opciones?.categorias?.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: centro, fechas, tags */}
            <div
              className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                >
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                    Centro, plazos y etiquetas
                  </h3>
                  <p
                    className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                  >
                    Ubica la tarea y define fecha límite y tags
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                    >
                      <Building2 className="w-4 h-4 text-blue-400" />
                      Centro
                    </label>
                    <select
                      value={centroId}
                      onChange={(e) => {
                        setCentroId(e.target.value);
                        setSucursalId("");
                      }}
                      disabled={enviando || loadingOpciones}
                      className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-lg cursor-pointer`}
                    >
                      <option value="">
                        {loadingOpciones
                          ? "Cargando centros..."
                          : "Sin centro específico"}
                      </option>
                      {opciones?.centros?.map((c) => (
                        <option key={c.id_centro} value={c.id_centro}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                    >
                      <MapPin className="w-4 h-4 text-teal-400" />
                      Sucursal
                    </label>
                    <select
                      value={sucursalId}
                      onChange={(e) => setSucursalId(e.target.value)}
                      disabled={enviando || loadingOpciones || !centroId}
                      className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50`}
                    >
                      <option value="">Sin sucursal</option>
                      {opciones?.sucursales
                        ?.filter((s) =>
                          centroId ? s.id_centro === Number(centroId) : true
                        )
                        .map((s) => (
                          <option key={s.id_sucursal} value={s.id_sucursal}>
                            {s.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <CalendarClock className="w-4 h-4 text-purple-400" />
                    Fecha límite
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    disabled={enviando}
                    className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 shadow-lg`}
                  />
                  {fechaLimite && (
                    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
                      <p className="text-sm font-bold text-purple-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha límite:{" "}
                        {new Date(fechaLimite).toLocaleDateString("es-CL", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <Hash className="w-4 h-4 text-indigo-400" />
                    Tags manuales
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    disabled={enviando}
                    placeholder="Ej: crítico, IAAPS, urgencias (separar con coma o #)"
                    className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 shadow-lg`}
                  />
                </div>

                {opciones?.tags_sugeridos &&
                  opciones.tags_sugeridos.length > 0 && (
                    <div>
                      <label
                        className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                      >
                        <Tag className="w-4 h-4 text-cyan-400" />
                        Tags sugeridos por el sistema
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {opciones.tags_sugeridos.map((tag) => {
                          const activo = tagsSeleccionados.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              disabled={enviando}
                              onClick={() => toggleTagSugerido(tag)}
                              className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all duration-300 ${
                                activo
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-xl scale-105"
                                  : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:scale-105"
                              }`}
                            >
                              #{tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Columna 3: responsables, subtareas, adjuntos */}
            <div
              className={`rounded-3xl p-8 ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} backdrop-blur-xl hover:scale-[1.01] transition-all duration-300 animate-slideUp`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                >
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                    Responsables y recursos
                  </h3>
                  <p
                    className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                  >
                    Asigna responsables, subtareas y archivos
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Responsable */}
                <div>
                  <label
                    className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Responsable principal *
                  </label>
                  <select
                    value={idResponsable}
                    onChange={(e) => setIdResponsable(e.target.value)}
                    disabled={enviando || loadingOpciones}
                    className={`w-full px-5 py-4 rounded-2xl text-base ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 shadow-lg cursor-pointer`}
                  >
                    <option value="">
                      {loadingOpciones
                        ? "Cargando responsables..."
                        : "Seleccionar responsable"}
                    </option>
                    <option value={usuario.id_usuario}>
                      🌟 Yo mismo(a) — {usuario.nombre}{" "}
                      {usuario.apellido_paterno}
                    </option>
                    {opciones?.posibles_responsables?.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} · {u.rol}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Colaboradores */}
                <div>
                  <label
                    className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    Colaboradores (opcional)
                  </label>
                  <select
                    multiple
                    value={idsColaboradores}
                    onChange={handleColaboradoresChange}
                    disabled={enviando || loadingOpciones}
                    className={`w-full px-4 py-3 rounded-2xl text-sm ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.texto} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 shadow-lg custom-scrollbar`}
                    style={{ minHeight: "120px" }}
                  >
                    {opciones?.posibles_responsables?.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} · {u.rol}
                      </option>
                    ))}
                  </select>
                  <p
                    className={`text-xs mt-2 ${tema.colores.textoSecundario} flex items-center gap-1`}
                  >
                    <Lightbulb className="w-3 h-3" />
                    Mantén presionado Ctrl/Cmd para seleccionar múltiples
                  </p>
                </div>

                {/* Subtareas */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label
                      className={`text-sm font-black uppercase tracking-wide ${tema.colores.texto} flex items-center gap-2`}
                    >
                      <CheckSquare2 className="w-4 h-4 text-cyan-400" />
                      Subtareas (checklist)
                    </label>
                    <button
                      type="button"
                      onClick={agregarSubtarea}
                      disabled={enviando}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${tema.colores.primario} text-white hover:scale-105 transition-all duration-300 shadow-lg`}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                  {subtareas.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-2 border-gray-500/30 text-center">
                      <CheckSquare2
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario} opacity-50`}
                      />
                      <p
                        className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                      >
                        Crea un checklist de pasos para esta tarea
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {subtareas.map((s, index) => (
                        <div
                          key={s.id}
                          className={`flex items-center gap-3 p-3 rounded-2xl ${tema.colores.hover} border-2 ${tema.colores.borde} hover:scale-[1.02] transition-all duration-300`}
                        >
                          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={s.titulo}
                            disabled={enviando}
                            onChange={(e) =>
                              actualizarSubtareaTitulo(s.id, e.target.value)
                            }
                            placeholder="Describe el paso..."
                            className={`flex-1 px-4 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                          />
                          <button
                            type="button"
                            onClick={() => eliminarSubtarea(s.id)}
                            disabled={enviando}
                            className="flex-shrink-0 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:scale-110 transition-all duration-300"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adjuntos */}
                <div>
                  <label
                    className={`block text-sm font-black uppercase tracking-wide mb-3 ${tema.colores.texto} flex items-center gap-2`}
                  >
                    <Paperclip className="w-4 h-4 text-amber-400" />
                    Adjuntos (opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label
                      className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold cursor-pointer border-2 border-dashed ${tema.colores.borde} hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-300 ${tema.colores.texto}`}
                    >
                      <Paperclip className="w-5 h-5" />
                      <span>Elegir archivos</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleArchivosChange}
                        disabled={enviando}
                      />
                    </label>
                  </div>
                  {archivos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {archivos.length} archivo(s) seleccionado(s)
                      </p>
                      <ul className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {archivos.map((file, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl ${tema.colores.hover} border ${tema.colores.borde}`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <span className="text-sm font-semibold truncate">
                                {file.name}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 flex-shrink-0">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Resumen rápido */}
                <div className="mt-6 pt-6 border-t-2 border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-indigo-300" />
                    <p
                      className={`text-sm font-black uppercase tracking-wide ${tema.colores.texto}`}
                    >
                      Resumen rápido
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30">
                    <p className="text-sm text-indigo-200">
                      {titulo ? (
                        <>
                          Crearás una tarea{" "}
                          <span className="font-black">"{titulo}"</span> para{" "}
                          <span className="font-black">{roleLabel}</span> con
                          prioridad{" "}
                          <span className="font-black">
                            {prioridad.toUpperCase()}
                          </span>
                          {subtareas.length > 0 && (
                            <>
                              {" "}
                              y{" "}
                              <span className="font-black">
                                {subtareas.length} subtarea(s)
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        "Completa el título para ver el resumen de la tarea."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra inferior de acciones ULTRA PREMIUM */}
          <div
            className={`sticky bottom-4 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-xl animate-slideUp`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm font-black ${tema.colores.texto}`}>
                  Sistema INFOGES Premium
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  La tarea se registrará con auditoría completa y trazabilidad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push(`/${roleParam}/tareas`)}
                disabled={enviando}
                className={`px-6 py-4 rounded-2xl text-base font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setMostrarPreview(!mostrarPreview)}
                disabled={enviando}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50`}
              >
                {mostrarPreview ? (
                  <>
                    <EyeOff className="w-5 h-5" />
                    Ocultar Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Ver Preview
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={enviando || loadingOpciones}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-black ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-110 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl`}
              >
                {enviando ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Guardando tarea...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Crear tarea ahora
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Preview Modal ULTRA PREMIUM */}
          {mostrarPreview && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn p-4">
            <div
              className={`w-full max-w-4xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} p-8 animate-scaleIn backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                  >
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-black ${tema.colores.texto}`}
                    >
                      Vista Previa de la Tarea
                    </h3>
                    <p
                      className={`text-sm font-bold ${tema.colores.textoSecundario}`}
                    >
                      Así se verá tu tarea antes de crearla
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarPreview(false)}
                  className={`p-3 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} hover:scale-110 transition-all duration-300`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {titulo && (
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide mb-2 ${tema.colores.textoSecundario}`}
                    >
                      Título
                    </p>
                    <p
                      className={`text-2xl font-black ${tema.colores.texto}`}
                    >
                      {titulo}
                    </p>
                  </div>
                )}

                {descripcion && (
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide mb-2 ${tema.colores.textoSecundario}`}
                    >
                      Descripción
                    </p>
                    <p className={`text-base ${tema.colores.textoSecundario}`}>
                      {descripcion}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border-2 ${obtenerColorPrioridad(
                      prioridad
                    )}`}
                  >
                    <Flame className="w-4 h-4" />
                    {prioridad.toUpperCase()}
                  </span>

                  {tipoTarea && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border-2 border-white/20">
                      <Tag className="w-4 h-4" />
                      {tipoTarea}
                    </span>
                  )}

                  {estado && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border-2 border-white/20">
                      <Activity className="w-4 h-4" />
                      {estado.replace("_", " ")}
                    </span>
                  )}
                </div>

                {(tagsSeleccionados.length > 0 ||
                  tagsInput.trim().length > 0) && (
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide mb-3 ${tema.colores.textoSecundario}`}
                    >
                      Etiquetas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ...tagsSeleccionados,
                        ...tagsInput
                          .split(/[,#]/)
                          .map((t) => t.trim())
                          .filter(Boolean),
                      ].map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {subtareas.length > 0 && (
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide mb-3 ${tema.colores.textoSecundario}`}
                    >
                      Subtareas ({subtareas.length})
                    </p>
                    <div className="space-y-2">
                      {subtareas.map((s, i) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                            {i + 1}
                          </span>
                          <span className={tema.colores.textoSecundario}>
                            {s.titulo || "(Sin título)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {archivos.length > 0 && (
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wide mb-3 ${tema.colores.textoSecundario}`}
                    >
                      Archivos adjuntos ({archivos.length})
                    </p>
                    <div className="space-y-2">
                      {archivos.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <FileText className="w-5 h-5 text-amber-400" />
                          <span className="text-sm font-semibold flex-1 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setMostrarPreview(false)}
                  className={`px-6 py-3 rounded-2xl text-base font-bold ${tema.colores.secundario} ${tema.colores.texto} hover:scale-105 transition-all duration-300`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER ULTRA PREMIUM */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t-2 py-8 mt-16 relative z-10`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-xl`}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                © 2025 AnyssaMed
              </p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Módulo Ultra Premium de Creación de Tareas INFOGES
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/ayuda"
              className={`text-base font-black transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`text-base font-black transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <button
              onClick={cerrarSesion}
              className="text-base font-black text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES ULTRA PREMIUM */}
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-5deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.8),
            rgba(168, 85, 247, 0.8)
          );
          border-radius: 10px;
          border: 2px solid
            ${["dark", "blue", "purple", "green"].includes(temaActual)
              ? "rgba(31, 41, 55, 0.5)"
              : "rgba(243, 244, 246, 0.5)"};
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 1),
            rgba(168, 85, 247, 1)
          );
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }

        html {
          scroll-behavior: smooth;
        }

        * {
          transition-property: background-color, border-color, color, fill,
            stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
