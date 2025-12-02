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
  CalendarPlus ,
  CalendarClock ,
  X,
  CalendarCheck,
  BarChart3,
  Stethoscope,
  FileText,
  Send,
  FileSpreadsheet ,
  Video,
  Award,
  Square,
  TrendingUp,

  Pill,
  UserCog, 
  UserPlus,
  Bell,
  BellOff,
  PhoneOutgoing ,
  PhoneIncoming,
  Calendar,
  CalendarDays ,
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

type TipoTarea = "tecnico" | "secretaria" | "administrativo" | "sistema";

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

interface MenuItem {
  titulo: string;
  icono: any;
  url: string;
  badge?: number;
  submenu?: MenuItem[];
  activo?: boolean;
  target?: string;
  rel?: string;
}

interface SubtareaForm {
  id: number;
  titulo: string;
}

// ========================================
// CONFIGURACIÓN DE TEMAS
// ========================================

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
    icono: Sparkles,
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
    icono: Users,
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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function NuevaTareaPage() {
  const params = useParams<{ role: string }>();
  const roleParam = (params?.role as string) || "secretaria";
  const pathname = usePathname();
  const router = useRouter();

  // Usuario y tema
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");

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

  // Buscador en header (para futuras mejoras, opcional)
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
  const [fechaLimite, setFechaLimite] = useState<string>(""); // datetime-local

  const [tagsInput, setTagsInput] = useState<string>("");
  const [tagsSeleccionados, setTagsSeleccionados] = useState<string[]>([]);

  const [idResponsable, setIdResponsable] = useState<string>("");
  const [idsColaboradores, setIdsColaboradores] = useState<string[]>([]);

  const [subtareas, setSubtareas] = useState<SubtareaForm[]>([]);
  const [archivos, setArchivos] = useState<File[]>([]);
      const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
  

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

    // Sección activa
// ========================================
// SECCIÓN ACTIVA SEGÚN LA URL
// ========================================
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
  // MENÚ DE NAVEGACIÓN
  // ========================================

  


  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
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

  // Cargar opciones para el formulario una vez que tenemos usuario
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

  // Valores por defecto (tipo de tarea por rol / responsable)
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

  const handleColaboradoresChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const values = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setIdsColaboradores(values);
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

    const tags = Array.from(
      new Set([...tagsManual, ...tagsSeleccionados])
    );

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
      fecha_limite: fechaLimite
        ? new Date(fechaLimite).toISOString()
        : null,
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
          data?.message ||
            "No se pudo crear la tarea. Intenta nuevamente."
        );
        return;
      }

      setMensajeExito("Tarea creada correctamente en INFOGES.");
      const idTareaNueva = data.tarea?.id_tarea;

      // Redirigir al detalle o listado
      if (idTareaNueva) {
        router.push(`/${roleParam}/tareas/${idTareaNueva}`);
      } else {
        router.push(`/${roleParam}/tareas`);
      }
    } catch (error) {
      console.error("Error al enviar tarea:", error);
      setErrores("Ocurrió un error inesperado al crear la tarea.");
    } finally {
      setEnviando(false);
    }
  };

  const marcarNotificacionLeida = (idNotificacion: number) => {
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.id_notificacion === idNotificacion ? { ...n, leida: true } : n
      )
    );
  };

  // ========================================
  // RENDER LOADING / ACCESO
  // ========================================

  if (loadingUsuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <CheckSquare2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando módulo de tareas...
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando la creación de tu nueva tarea premium
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
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Sesión no válida
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            Debes iniciar sesión para crear una nueva tarea.
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

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
           <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />


      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-40 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${
          tema.colores.sombra
        }`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar tareas existentes para evitar duplicados..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
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
                  Seleccionar tema
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

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificacionesAbiertas((v) => !v)}
                className={`relative p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-5 h-5" />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {notificaciones.filter((n) => !n.leida).length > 9
                      ? "9+"
                      : notificaciones.filter((n) => !n.leida).length}
                  </span>
                )}
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-96 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} max-h-96 overflow-y-auto`}
                >
                  <div
                    className={`p-4 border-b ${tema.colores.borde} sticky top-0 ${tema.colores.card}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        Notificaciones
                      </h3>
                      <button
                        className={`text-sm font-semibold ${tema.colores.acento} hover:underline`}
                        onClick={() =>
                          setNotificaciones((prev) =>
                            prev.map((n) => ({ ...n, leida: true }))
                          )
                        }
                      >
                        Marcar todas leídas
                      </button>
                    </div>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff
                        className={`w-12 h-12 mx-auto mb-3 ${tema.colores.textoSecundario}`}
                      />
                      <p
                        className={`text-sm ${tema.colores.textoSecundario}`}
                      >
                        No tienes notificaciones nuevas
                      </p>
                    </div>
                  ) : (
                    <div className={`divide-y ${tema.colores.borde}`}>
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id_notificacion}
                          className={`p-4 ${tema.colores.hover} cursor-pointer ${
                            !notif.leida ? "bg-indigo-500/5" : ""
                          }`}
                          onClick={() =>
                            marcarNotificacionLeida(notif.id_notificacion)
                          }
                        >
                          <p
                            className={`text-sm font-bold mb-1 ${tema.colores.texto}`}
                          >
                            {notif.titulo}
                          </p>
                          <p
                            className={`text-xs mb-2 ${tema.colores.textoSecundario}`}
                          >
                            {notif.descripcion}
                          </p>
                          <p
                            className={`text-xs font-medium ${tema.colores.textoSecundario}`}
                          >
                            {new Date(
                              notif.fecha_hora
                            ).toLocaleString("es-CL")}
                          </p>
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
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${tema.colores.hover}`}
              >
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    {roleLabel}
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
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700/40">
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
                      <p
                        className={`text-lg font-black ${tema.colores.texto}`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-sm font-medium ${tema.colores.textoSecundario} mb-1`}
                      >
                        {roleLabel}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/${roleParam}/perfil`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href={`/${roleParam}/configuracion`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.hover} text-red-400 hover:text-red-300`}
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className={`text-4xl md:text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}
            >
              {obtenerSaludo()}, {usuario.nombre}
              <span className="animate-wave inline-block">👋</span>
            </h2>
            <p
              className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
            >
              Crear nueva tarea premium · Rol:{" "}
              <span className={tema.colores.acento}>{roleLabel}</span>
            </p>
            <p className={`text-sm mt-1 ${tema.colores.textoSecundario}`}>
              {new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${roleParam}/tareas`}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${tema.colores.secundario} ${tema.colores.texto} ${tema.colores.sombra} hover:scale-105 transition-all`}
            >
              <ClipboardList className="w-4 h-4" />
              Volver al listado
            </Link>
            <button
              type="submit"
              form="form-nueva-tarea"
              disabled={enviando || loadingOpciones}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${tema.colores.primario} text-white ${tema.colores.sombra} hover:scale-105 transition-all disabled:opacity-60`}
            >
              {enviando ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear tarea
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alertas */}
        {errores && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <p className="text-sm text-red-100">{errores}</p>
          </div>
        )}
        {mensajeExito && (
          <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
            <p className="text-sm text-emerald-100">{mensajeExito}</p>
          </div>
        )}

        {/* Formulario */}
        <form
          id="form-nueva-tarea"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Columna 1: info básica */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                >
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-black ${tema.colores.texto}`}
                  >
                    Información de la tarea
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Define título, descripción, categoría, prioridad y estado
                    inicial.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Título de la tarea *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Confirmar agenda de pacientes críticos de hoy"
                    disabled={enviando}
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/60`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Descripción detallada
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={5}
                    disabled={enviando}
                    placeholder="Describe qué debe hacer la secretaria / equipo, contexto, pasos, criterios de cierre..."
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-sm resize-none ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/60 custom-scrollbar`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide">
                      Prioridad
                    </label>
                    <select
                      value={prioridad}
                      onChange={(e) =>
                        setPrioridad(e.target.value as TareaPrioridad)
                      }
                      disabled={enviando}
                      className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide">
                      Estado inicial
                    </label>
                    <select
                      value={estado}
                      onChange={(e) =>
                        setEstado(e.target.value as TareaEstado)
                      }
                      disabled={enviando}
                      className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
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

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide">
                      Tipo de tarea
                    </label>
                    <select
                      value={tipoTarea}
                      onChange={(e) =>
                        setTipoTarea(e.target.value as TipoTarea)
                      }
                      disabled={enviando}
                      className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="secretaria">Secretaría</option>
                      <option value="tecnico">Técnico</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="sistema">Sistema</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Categoría de tarea
                  </label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    disabled={enviando || loadingOpciones}
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="">
                      {loadingOpciones
                        ? "Cargando categorías..."
                        : "Sin categoría"}
                    </option>
                    {opciones?.categorias?.map((cat) => (
                      <option
                        key={cat.id_categoria}
                        value={cat.id_categoria}
                      >
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Columna 2: centro, fechas, tags */}
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                >
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-black ${tema.colores.texto}`}
                  >
                    Centro, plazos y etiquetas
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Ubica la tarea en centros/sucursales y define fecha
                    límite y tags.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide">
                      Centro
                    </label>
                    <select
                      value={centroId}
                      onChange={(e) => {
                        setCentroId(e.target.value);
                        setSucursalId("");
                      }}
                      disabled={enviando || loadingOpciones}
                      className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
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
                    <label className="text-xs font-semibold uppercase tracking-wide">
                      Sucursal
                    </label>
                    <select
                      value={sucursalId}
                      onChange={(e) => setSucursalId(e.target.value)}
                      disabled={enviando || loadingOpciones}
                      className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                    >
                      <option value="">Sin sucursal</option>
                      {opciones?.sucursales
                        ?.filter((s) =>
                          centroId
                            ? s.id_centro === Number(centroId)
                            : true
                        )
                        .map((s) => (
                          <option
                            key={s.id_sucursal}
                            value={s.id_sucursal}
                          >
                            {s.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Fecha límite
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    disabled={enviando}
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  />
                  <p
                    className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}
                  >
                    Si no defines una fecha límite, la tarea quedará sin
                    vencimiento programado.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Tags manuales
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    disabled={enviando}
                    placeholder="Ej: crítico, IAAPS, urgencias (separar con coma o #)"
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario}`}
                  />
                </div>

                {opciones?.tags_sugeridos &&
                  opciones.tags_sugeridos.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide">
                        Tags sugeridos por el sistema
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {opciones.tags_sugeridos.map((tag) => {
                          const activo = tagsSeleccionados.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              disabled={enviando}
                              onClick={() => toggleTagSugerido(tag)}
                              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                                activo
                                  ? "bg-indigo-600 text-white border-indigo-400"
                                  : "bg-white/5 border-white/10 text-xs text-gray-200 hover:bg-white/10"
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
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                >
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-black ${tema.colores.texto}`}
                  >
                    Responsables, subtareas y adjuntos
                  </h3>
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Asigna responsables principales/colaboradores, define
                    subtareas y agrega archivos clave.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Responsable */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Responsable principal *
                  </label>
                  <select
                    value={idResponsable}
                    onChange={(e) => setIdResponsable(e.target.value)}
                    disabled={enviando || loadingOpciones}
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-sm ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                  >
                    <option value="">
                      {loadingOpciones
                        ? "Cargando responsables..."
                        : "Seleccionar responsable"}
                    </option>
                    {/* Opción Yo mismo */}
                    <option value={usuario.id_usuario}>
                      Yo mismo(a) — {usuario.nombre} {usuario.apellido_paterno}
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
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Colaboradores (opcional)
                  </label>
                  <select
                    multiple
                    value={idsColaboradores}
                    onChange={handleColaboradoresChange}
                    disabled={enviando || loadingOpciones}
                    className={`mt-1 w-full px-3 py-2 rounded-xl text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} custom-scrollbar`}
                    style={{ minHeight: "80px" }}
                  >
                    {opciones?.posibles_responsables?.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} · {u.rol}
                      </option>
                    ))}
                  </select>
                  <p
                    className={`text-[11px] mt-1 ${tema.colores.textoSecundario}`}
                  >
                    Mantén al menos un responsable principal. Los
                    colaboradores se crearán como asignaciones secundarias.
                  </p>
                </div>

                {/* Subtareas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wide">
                      Subtareas (checklist)
                    </label>
                    <button
                      type="button"
                      onClick={agregarSubtarea}
                      disabled={enviando}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 hover:bg-white/15"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar
                    </button>
                  </div>
                  {subtareas.length === 0 ? (
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      Puedes crear un checklist de pasos (ej: llamar a
                      paciente, validar datos en sistema, informar a médico).
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {subtareas.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[11px] text-gray-400">
                            •
                          </span>
                          <input
                            type="text"
                            value={s.titulo}
                            disabled={enviando}
                            onChange={(e) =>
                              actualizarSubtareaTitulo(
                                s.id,
                                e.target.value
                              )
                            }
                            placeholder="Subtarea..."
                            className={`flex-1 px-2 py-1 rounded-lg text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                          />
                          <button
                            type="button"
                            onClick={() => eliminarSubtarea(s.id)}
                            disabled={enviando}
                            className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adjuntos */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide">
                    Adjuntos (opcional)
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <label
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer border border-dashed ${tema.colores.borde} hover:border-indigo-400 hover:bg-white/5`}
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>Elegir archivos</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleArchivosChange}
                        disabled={enviando}
                      />
                    </label>
                    {archivos.length > 0 && (
                      <span className="text-[11px] text-gray-300">
                        {archivos.length} archivo(s) seleccionados
                      </span>
                    )}
                  </div>
                  {archivos.length > 0 && (
                    <ul className="mt-2 text-[11px] text-gray-300 space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                      {archivos.map((file, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className="truncate">{file.name}</span>
                          <span className="ml-2 opacity-70">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Resumen rápido */}
                <div className="mt-4 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-indigo-300" />
                    <p
                      className={`text-xs font-semibold ${tema.colores.texto}`}
                    >
                      Resumen rápido
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    {titulo
                      ? `Crearás una tarea "${titulo}" para ${roleLabel} con prioridad ${prioridad.toUpperCase()}`
                      : "Completa el título para ver el resumen de la tarea que se creará."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra inferior de acciones */}
          <div
            className={`sticky bottom-4 mt-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3`}
          >
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Filter className="w-4 h-4" />
              <span>
                INFOGES registrará la tarea, sus asignaciones, subtareas,
                adjuntos y auditoría en las tablas{" "}
                <code className="font-mono">tareas_*</code>.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/${roleParam}/tareas`)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || loadingOpciones}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${tema.colores.primario} text-white ${tema.colores.sombra} disabled:opacity-60`}
              >
                {enviando ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Guardando tarea...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear tarea ahora
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-6 mt-12`}
      >
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-semibold ${tema.colores.textoSecundario}`}
            >
              © 2025 AnyssaMed · Módulo de Tareas INFOGES.
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white`}
            >
              v1.0.0 NUEVA TAREA
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/ayuda"
              className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`text-sm font-bold transition-colors ${tema.colores.textoSecundario} hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <button
              onClick={cerrarSesion}
              className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES */}
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
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(99, 102, 241, 0.5)"
            : "rgba(99, 102, 241, 0.7)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${["dark", "blue", "purple", "green"].includes(
            temaActual
          )
            ? "rgba(99, 102, 241, 0.7)"
            : "rgba(99, 102, 241, 0.9)"};
        }
      `}</style>
    </div>
  );
}

// Icono X simple para limpiar búsqueda
function XIcon(props: any) {
  return <svg viewBox="0 0 24 24" {...props} stroke="currentColor" fill="none">
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6l12 12M18 6L6 18"
    />
  </svg>;
}
