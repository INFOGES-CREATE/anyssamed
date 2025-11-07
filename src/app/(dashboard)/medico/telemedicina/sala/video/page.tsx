// frontend/src/app/(dashboard)/medico/telemedicina/sala/video/page.tsx

"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BellOff,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  Cloud,
  Code,
  Copy,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Film,
  Filter,
  Folder,
  Globe,
  Grid,
  Headphones,
  Heart,
  HeartPulse,
  History,
  Home,
  Image as ImageIcon,
  Info,
  Laptop,
  Layers,
  Link2,
  List,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Maximize,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize,
  Minimize2,
  Monitor,
  MonitorPlay,
  Moon,
  MoreHorizontal,
  MoreVertical,
  MousePointer,
  Move,
  Pause,
  Phone,
  PhoneCall,
  PhoneOff,
  Play,
  Plus,
  Power,
  Printer,
  Radio,
  RefreshCw,
  Repeat,
  Save,
  Scissors,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Signal,
  Smartphone,
  Sparkles,
  Speaker,
  Star,
  StopCircle,
  Sun,
  Tablet,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Tv,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  Video,
  VideoOff,
  Volume,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type CalidadVideo = "360p" | "480p" | "720p" | "1080p" | "4k";
type TipoLayout = "grid" | "speaker" | "sidebar" | "fullscreen";
type EstadoGrabacion = "idle" | "recording" | "paused" | "processing";

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
      plan: "basico" | "profesional" | "premium" | "empresarial";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
  };
}

interface SesionTelemedicina {
  id_sesion: number;
  id_cita: number;
  id_paciente: number;
  id_medico: number;
  token_acceso: string;
  url_sesion: string;
  estado: "programada" | "en_espera" | "en_curso" | "finalizada" | "cancelada";
  fecha_hora_inicio_programada: string;
  fecha_hora_fin_programada: string;
  fecha_hora_inicio_real: string | null;
  fecha_hora_fin_real: string | null;
  duracion_segundos: number | null;
  proveedor_servicio: string;
  calidad_conexion: "excelente" | "buena" | "regular" | "mala" | null;
  grabacion_autorizada: boolean;
  url_grabacion: string | null;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    genero: string;
    foto_url: string | null;
    telefono: string | null;
    email: string | null;
    grupo_sanguineo: string;
    alergias: string[];
    condiciones_cronicas: string[];
  };
  cita: {
    id_cita: number;
    motivo: string | null;
    tipo_cita: string;
    notas_previas: string | null;
  };
}

interface ParticipanteSesion {
  id: string;
  nombre: string;
  tipo: "medico" | "paciente" | "especialista" | "invitado";
  foto_url: string | null;
  audio_activo: boolean;
  video_activo: boolean;
  compartiendo_pantalla: boolean;
  calidad_conexion: "excelente" | "buena" | "regular" | "mala";
  tiempo_conexion_minutos: number;
  dispositivo: string;
  ubicacion: string;
}

interface MensajeChat {
  id: string;
  id_usuario: number;
  nombre_usuario: string;
  tipo_usuario: "medico" | "paciente" | "sistema";
  mensaje: string;
  fecha_hora: string;
  leido: boolean;
  tipo: "texto" | "archivo" | "imagen" | "sistema" | "alerta";
  archivo_url?: string;
  archivo_nombre?: string;
}

interface NotaSesion {
  id: string;
  timestamp: string;
  tipo: "observacion" | "diagnostico" | "tratamiento" | "recordatorio";
  contenido: string;
  autor: string;
}

interface RecetaDigital {
  id: string;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
  fecha_prescripcion: string;
}

interface ExamenSolicitado {
  id: string;
  tipo: string;
  nombre: string;
  prioridad: "urgente" | "normal" | "rutina";
  indicaciones: string;
  fecha_solicitud: string;
}

interface SignosVitales {
  id: string;
  presion_sistolica: number;
  presion_diastolica: number;
  pulso: number;
  temperatura: number;
  saturacion_oxigeno: number;
  peso: number;
  talla: number;
  imc: number;
  fecha_medicion: string;
}

interface EstadisticasSesion {
  duracion_actual: number;
  calidad_promedio: number;
  paquetes_perdidos: number;
  latencia_promedio: number;
  ancho_banda_usado: number;
  fps_video: number;
  resolucion_actual: string;
}

// ========================================
// CONFIGURACIONES DE TEMAS
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
    icono: Video,
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

export default function TelemedicinaProfesionalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSesion = searchParams.get("sesion");

  // ========================================
  // ESTADOS PRINCIPALES
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [sesionActiva, setSesionActiva] = useState<SesionTelemedicina | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [panelDerechoAbierto, setPanelDerechoAbierto] = useState(true);
  const [tabActiva, setTabActiva] = useState<
    "info" | "notas" | "recetas" | "examenes" | "historial" | "signos" | "transcripcion"
  >("info");

  // Participantes y comunicación
  const [participantes, setParticipantes] = useState<ParticipanteSesion[]>([]);
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>([]);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensajeActual, setMensajeActual] = useState("");

  // Controles de video
  const [audioActivo, setAudioActivo] = useState(true);
  const [videoActivo, setVideoActivo] = useState(true);
  const [compartiendoPantalla, setCompartiendoPantalla] = useState(false);
  const [layoutVideo, setLayoutVideo] = useState<TipoLayout>("speaker");

  // Grabación
  const [estadoGrabacion, setEstadoGrabacion] = useState<EstadoGrabacion>("idle");
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);

  // Notas y documentación
  const [notas, setNotas] = useState<NotaSesion[]>([]);
  const [notaActual, setNotaActual] = useState("");
  const [recetas, setRecetas] = useState<RecetaDigital[]>([]);
  const [examenes, setExamenes] = useState<ExamenSolicitado[]>([]);
  const [signosVitales, setSignosVitales] = useState<SignosVitales[]>([]);

  // Herramientas avanzadas
  const [transcripcionActiva, setTranscripcionActiva] = useState(false);
  const [transcripcionTexto, setTranscripcionTexto] = useState("");
  const [iaAsistenteActivo, setIaAsistenteActivo] = useState(false);
  const [sugerenciasIA, setSugerenciasIA] = useState<string[]>([]);

  // Estadísticas
  const [estadisticasSesion, setEstadisticasSesion] = useState<EstadisticasSesion>({
    duracion_actual: 0,
    calidad_promedio: 95,
    paquetes_perdidos: 0,
    latencia_promedio: 45,
    ancho_banda_usado: 2.5,
    fps_video: 30,
    resolucion_actual: "1280x720",
  });

  // Refs para video
  const videoLocalRef = useRef<HTMLVideoElement>(null);
  const videoRemotoRef = useRef<HTMLVideoElement>(null);
  const streamLocalRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario && idSesion) {
      cargarSesionTelemedicina();
    }
  }, [usuario, idSesion]);

  useEffect(() => {
    if (sesionActiva) {
      inicializarSesionVideo();
      cargarDatosSesion();
      iniciarMonitoreoEstadisticas();
    }

    return () => {
      detenerSesionVideo();
    };
  }, [sesionActiva]);

  useEffect(() => {
    // Timer para grabación
    let interval: NodeJS.Timeout;
    if (estadoGrabacion === "recording") {
      interval = setInterval(() => {
        setTiempoGrabacion((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [estadoGrabacion]);

  useEffect(() => {
    // Timer para duración de sesión
    let interval: NodeJS.Timeout;
    if (sesionActiva) {
      interval = setInterval(() => {
        setEstadisticasSesion((prev) => ({
          ...prev,
          duracion_actual: prev.duracion_actual + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sesionActiva]);

  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No hay sesión activa");
      }

      const result = await response.json();

      if (result.success && result.usuario) {
        const rolesUsuario: string[] = [];

        if (result.usuario.rol) {
          rolesUsuario.push(
            result.usuario.rol.nombre
              ?.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));

        if (!tieneRolMedico) {
          alert("Acceso denegado. Este módulo es solo para médicos.");
          router.push("/");
          return;
        }

        if (!result.usuario.medico) {
          alert("Tu usuario tiene rol de MÉDICO pero no está vinculado a un registro médico.");
          router.push("/");
          return;
        }

        setUsuario(result.usuario);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const cargarSesionTelemedicina = async () => {
    if (!idSesion) return;

    try {
      const response = await fetch(`/api/telemedicina/sesiones/${idSesion}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar sesión");
      }

      const result = await response.json();

      if (result.success && result.sesion) {
        setSesionActiva(result.sesion);

        // Cargar participantes
        setParticipantes([
          {
            id: `medico-${usuario?.id_usuario}`,
            nombre: `Dr. ${usuario?.nombre} ${usuario?.apellido_paterno}`,
            tipo: "medico",
            foto_url: usuario?.foto_perfil_url || null,
            audio_activo: true,
            video_activo: true,
            compartiendo_pantalla: false,
            calidad_conexion: "excelente",
            tiempo_conexion_minutos: 0,
            dispositivo: "Desktop - Chrome",
            ubicacion: "Santiago, Chile",
          },
          {
            id: `paciente-${result.sesion.id_paciente}`,
            nombre: result.sesion.paciente.nombre_completo,
            tipo: "paciente",
            foto_url: result.sesion.paciente.foto_url,
            audio_activo: true,
            video_activo: true,
            compartiendo_pantalla: false,
            calidad_conexion: "buena",
            tiempo_conexion_minutos: 0,
            dispositivo: "Desktop - Chrome",
            ubicacion: "Chile",
          },
        ]);
      } else {
        setError("No se pudo cargar la sesión");
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
      setError("Error al cargar la sesión de telemedicina");
    }
  };

  const cargarDatosSesion = async () => {
    if (!sesionActiva) return;

    try {
      // Cargar chat
      const chatResponse = await fetch(
        `/api/telemedicina/sala/chat?id_sesion=${sesionActiva.id_sesion}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (chatResponse.ok) {
        const chatResult = await chatResponse.json();
        if (chatResult.success) {
          setMensajesChat(chatResult.mensajes);
        }
      }

      // Cargar notas
      const notasResponse = await fetch(
        `/api/telemedicina/sala/notas?id_paciente=${sesionActiva.id_paciente}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (notasResponse.ok) {
        const notasResult = await notasResponse.json();
        if (notasResult.success) {
          setNotas(
            notasResult.notas.map((n: any) => ({
              id: n.id_nota,
              timestamp: n.fecha_nota,
              tipo: n.tipo_nota,
              contenido: n.contenido,
              autor: n.autor_nombre,
            }))
          );
        }
      }

      // Cargar recetas
      const recetasResponse = await fetch(
        `/api/telemedicina/sala/recetas?id_paciente=${sesionActiva.id_paciente}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (recetasResponse.ok) {
        const recetasResult = await recetasResponse.json();
        if (recetasResult.success) {
          setRecetas(
            recetasResult.recetas.map((r: any) => ({
              id: r.id_receta,
              medicamento: r.medicamentos[0]?.nombre_medicamento || "",
              dosis: r.medicamentos[0]?.dosis || "",
              frecuencia: r.medicamentos[0]?.frecuencia || "",
              duracion: r.medicamentos[0]?.duracion || "",
              indicaciones: r.medicamentos[0]?.instrucciones || "",
              fecha_prescripcion: r.fecha_emision,
            }))
          );
        }
      }

      // Cargar exámenes
      const examenesResponse = await fetch(
        `/api/telemedicina/sala/examenes?id_paciente=${sesionActiva.id_paciente}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (examenesResponse.ok) {
        const examenesResult = await examenesResponse.json();
        if (examenesResult.success) {
          setExamenes(
            examenesResult.examenes.map((e: any) => ({
              id: e.id_examen,
              tipo: e.tipo_examen_categoria,
              nombre: e.tipo_examen_nombre,
              prioridad: e.prioridad,
              indicaciones: e.motivo_solicitud || "",
              fecha_solicitud: e.fecha_solicitud,
            }))
          );
        }
      }

      // Cargar signos vitales
      const signosResponse = await fetch(
        `/api/telemedicina/sala/signos-vitales?id_paciente=${sesionActiva.id_paciente}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (signosResponse.ok) {
        const signosResult = await signosResponse.json();
        if (signosResult.success) {
          setSignosVitales(
            signosResult.signos_vitales.map((s: any) => ({
              id: s.id_signo_vital,
              presion_sistolica: s.presion_sistolica,
              presion_diastolica: s.presion_diastolica,
              pulso: s.pulso,
              temperatura: s.temperatura,
              saturacion_oxigeno: s.saturacion_oxigeno,
              peso: s.peso,
              talla: s.talla,
              imc: s.imc,
              fecha_medicion: s.fecha_medicion,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error al cargar datos de sesión:", error);
    }
  };

  // ========================================
  // FUNCIONES DE VIDEO Y AUDIO
  // ========================================

  const inicializarSesionVideo = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamLocalRef.current = stream;

      if (videoLocalRef.current) {
        videoLocalRef.current.srcObject = stream;
      }

      console.log("✅ Sesión de video inicializada");
    } catch (error) {
      console.error("❌ Error al inicializar video:", error);
      alert("No se pudo acceder a la cámara/micrófono. Verifica los permisos.");
    }
  };

  const detenerSesionVideo = () => {
    if (streamLocalRef.current) {
      streamLocalRef.current.getTracks().forEach((track) => track.stop());
      streamLocalRef.current = null;
    }
  };

  const toggleAudio = () => {
    if (streamLocalRef.current) {
      const audioTrack = streamLocalRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioActivo(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamLocalRef.current) {
      const videoTrack = streamLocalRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoActivo(videoTrack.enabled);
      }
    }
  };

  const compartirPantalla = async () => {
    try {
      if (!compartiendoPantalla) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
          } as MediaTrackConstraints,
          audio: false,
        });

        setCompartiendoPantalla(true);

        stream.getVideoTracks()[0].onended = () => {
          setCompartiendoPantalla(false);
        };
      } else {
        setCompartiendoPantalla(false);
      }
    } catch (error) {
      console.error("Error al compartir pantalla:", error);
    }
  };

  // ========================================
  // FUNCIONES DE GRABACIÓN
  // ========================================

  const iniciarGrabacion = async () => {
    if (!streamLocalRef.current) return;

    try {
      const options = { mimeType: "video/webm;codecs=vp9" };
      mediaRecorderRef.current = new MediaRecorder(streamLocalRef.current, options);

      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        console.log("Grabación finalizada:", url);
      };

      mediaRecorderRef.current.start(1000);
      setEstadoGrabacion("recording");
      setTiempoGrabacion(0);
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
    }
  };

  const pausarGrabacion = () => {
    if (mediaRecorderRef.current && estadoGrabacion === "recording") {
      mediaRecorderRef.current.pause();
      setEstadoGrabacion("paused");
    } else if (mediaRecorderRef.current && estadoGrabacion === "paused") {
      mediaRecorderRef.current.resume();
      setEstadoGrabacion("recording");
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setEstadoGrabacion("idle");
      setTiempoGrabacion(0);
    }
  };

  // ========================================
  // FUNCIONES DE CHAT
  // ========================================

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || !sesionActiva) return;

    try {
      const response = await fetch("/api/telemedicina/sala/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_sesion: sesionActiva.id_sesion,
          mensaje: mensajeActual.trim(),
          tipo_mensaje: "texto",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const nuevoMensaje: MensajeChat = {
            id: result.id_mensaje,
            id_usuario: usuario?.id_usuario || 0,
            nombre_usuario: `Dr. ${usuario?.nombre} ${usuario?.apellido_paterno}`,
            tipo_usuario: "medico",
            mensaje: mensajeActual.trim(),
            fecha_hora: new Date().toISOString(),
            leido: false,
            tipo: "texto",
          };

          setMensajesChat((prev) => [...prev, nuevoMensaje]);
          setMensajeActual("");
        }
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  // ========================================
  // FUNCIONES DE NOTAS Y DOCUMENTACIÓN
  // ========================================

  const agregarNota = async (tipo: NotaSesion["tipo"]) => {
    if (!notaActual.trim() || !sesionActiva) return;

    try {
      const response = await fetch("/api/telemedicina/sala/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_paciente: sesionActiva.id_paciente,
          tipo_nota: tipo,
          contenido: notaActual,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const nuevaNota: NotaSesion = {
            id: result.id_nota,
            timestamp: new Date().toISOString(),
            tipo,
            contenido: notaActual,
            autor: `Dr. ${usuario?.nombre} ${usuario?.apellido_paterno}`,
          };

          setNotas((prev) => [...prev, nuevaNota]);
          setNotaActual("");
        }
      }
    } catch (error) {
      console.error("Error al agregar nota:", error);
    }
  };

  const agregarReceta = async (receta: Omit<RecetaDigital, "id" | "fecha_prescripcion">) => {
    if (!sesionActiva) return;

    try {
      const response = await fetch("/api/telemedicina/sala/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_paciente: sesionActiva.id_paciente,
          tipo_receta: "simple",
          medicamentos: [
            {
              nombre_medicamento: receta.medicamento,
              dosis: receta.dosis,
              frecuencia: receta.frecuencia,
              duracion: receta.duracion,
              instrucciones: receta.indicaciones,
              cantidad: 1,
              unidad: "caja",
              via_administracion: "oral",
              es_controlado: false,
            },
          ],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const nuevaReceta: RecetaDigital = {
            ...receta,
            id: result.id_receta,
            fecha_prescripcion: new Date().toISOString(),
          };

          setRecetas((prev) => [...prev, nuevaReceta]);
        }
      }
    } catch (error) {
      console.error("Error al agregar receta:", error);
    }
  };

  const solicitarExamen = async (examen: Omit<ExamenSolicitado, "id" | "fecha_solicitud">) => {
    if (!sesionActiva) return;

    try {
      const response = await fetch("/api/telemedicina/sala/examenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_paciente: sesionActiva.id_paciente,
          id_tipo_examen: 1, // Ajustar según tu catálogo
          prioridad: examen.prioridad,
          motivo_solicitud: examen.indicaciones,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const nuevoExamen: ExamenSolicitado = {
            ...examen,
            id: result.id_examen,
            fecha_solicitud: new Date().toISOString(),
          };

          setExamenes((prev) => [...prev, nuevoExamen]);
        }
      }
    } catch (error) {
      console.error("Error al solicitar examen:", error);
    }
  };

  // ========================================
  // FUNCIONES DE IA Y TRANSCRIPCIÓN
  // ========================================

  const activarTranscripcion = () => {
    setTranscripcionActiva(!transcripcionActiva);

    if (!transcripcionActiva) {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "es-ES";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTranscripcionTexto(transcript);
        };

        recognition.start();
      }
    }
  };

  const activarAsistenteIA = () => {
    setIaAsistenteActivo(!iaAsistenteActivo);

    if (!iaAsistenteActivo) {
      setTimeout(() => {
        setSugerenciasIA([
          "Considerar ajuste de dosis según presión arterial actual",
          "Solicitar hemoglobina glicosilada para control",
          "Revisar interacción entre medicamentos actuales",
          "Paciente podría beneficiarse de consulta con nutricionista",
        ]);
      }, 2000);
    } else {
      setSugerenciasIA([]);
    }
  };

  // ========================================
  // FUNCIONES DE ESTADÍSTICAS
  // ========================================

  const iniciarMonitoreoEstadisticas = () => {
    const interval = setInterval(() => {
      setEstadisticasSesion((prev) => ({
        ...prev,
        calidad_promedio: Math.floor(Math.random() * 10) + 90,
        paquetes_perdidos: Math.floor(Math.random() * 5),
        latencia_promedio: Math.floor(Math.random() * 30) + 30,
        ancho_banda_usado: parseFloat((Math.random() * 2 + 1).toFixed(2)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const formatearTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas.toString().padStart(2, "0")}:${minutos
        .toString()
        .padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
    }
    return `${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
  };

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    localStorage.setItem("tema_telemedicina", nuevoTema);
  };

  const finalizarSesion = async () => {
  if (!sesionActiva) return;

  const confirmar = confirm("¿Estás seguro de finalizar la consulta?");
  if (!confirmar) return;

  try {
    const response = await fetch("/api/telemedicina/sala/finalizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id_sesion: sesionActiva.id_sesion,
        motivo_finalizacion: "Consulta completada",
        notas_medico: notaActual,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      console.error("Error al finalizar sesión:", data);
      alert(data?.error || "No se pudo finalizar la sesión.");
      return;
    }

    // si todo bien:
    detenerSesionVideo();
    if (estadoGrabacion === "recording") {
      detenerGrabacion();
    }

    router.push("/medico/telemedicina");
  } catch (error) {
    console.error("Error al finalizar sesión:", error);
    alert("Ocurrió un error al finalizar la sesión.");
  }
};

  // ========================================
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}>
              <Video className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Iniciando Telemedicina Profesional
          </h2>
          <p className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}>
            Cargando módulos avanzados...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}>
          <div className={`w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6`}>
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Error</h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>{error}</p>
          <button
            onClick={() => router.push("/medico/telemedicina")}
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105`}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!sesionActiva) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className={`text-lg ${tema.colores.textoSecundario}`}>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - SESIÓN ACTIVA
  // ========================================

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${tema.colores.fondo} overflow-hidden`}>
      {/* BARRA SUPERIOR */}
      <header className={`${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra} px-6 py-3 flex items-center justify-between z-50`}>
        {/* Información del paciente */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}>
            {sesionActiva.paciente.foto_url ? (
              <Image
                src={sesionActiva.paciente.foto_url}
                alt={sesionActiva.paciente.nombre_completo}
                width={48}
                height={48}
                className="rounded-xl object-cover"
              />
            ) : (
              sesionActiva.paciente.nombre_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
            )}
          </div>
          <div>
            <h3 className={`text-lg font-black ${tema.colores.texto}`}>
              {sesionActiva.paciente.nombre_completo}
            </h3>
            <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
              {sesionActiva.paciente.edad} años • {sesionActiva.paciente.genero} •{" "}
              {sesionActiva.paciente.grupo_sanguineo}
            </p>
          </div>
        </div>

        {/* Controles centrales */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
              audioActivo ? `${tema.colores.secundario} ${tema.colores.texto}` : "bg-red-600 text-white"
            }`}
          >
            {audioActivo ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
              videoActivo ? `${tema.colores.secundario} ${tema.colores.texto}` : "bg-red-600 text-white"
            }`}
          >
            {videoActivo ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>

          <button
            onClick={compartirPantalla}
            className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
              compartiendoPantalla
                ? "bg-green-600 text-white"
                : `${tema.colores.secundario} ${tema.colores.texto}`
            }`}
          >
            <Monitor className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={estadoGrabacion === "idle" ? iniciarGrabacion : pausarGrabacion}
              className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
                estadoGrabacion === "recording"
                  ? "bg-red-600 text-white animate-pulse"
                  : estadoGrabacion === "paused"
                  ? "bg-yellow-600 text-white"
                  : `${tema.colores.secundario} ${tema.colores.texto}`
              }`}
            >
              {estadoGrabacion === "recording" ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Film className="w-5 h-5" />
              )}
            </button>
            {estadoGrabacion !== "idle" && (
              <button
                onClick={detenerGrabacion}
                className="p-3 rounded-xl bg-red-600 text-white font-bold transition-all duration-300 hover:scale-110"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={activarTranscripcion}
            className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
              transcripcionActiva
                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                : `${tema.colores.secundario} ${tema.colores.texto}`
            }`}
          >
            <FileText className="w-5 h-5" />
          </button>

          <button
            onClick={activarAsistenteIA}
            className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 ${
              iaAsistenteActivo
                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white animate-pulse`
                : `${tema.colores.secundario} ${tema.colores.texto}`
            }`}
          >
            <Brain className="w-5 h-5" />
          </button>

          <button
            onClick={() => setChatAbierto(!chatAbierto)}
            className={`p-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 relative ${
              chatAbierto
                ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                : `${tema.colores.secundario} ${tema.colores.texto}`
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {mensajesChat.filter((m) => !m.leido && m.tipo_usuario !== "medico").length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {mensajesChat.filter((m) => !m.leido && m.tipo_usuario !== "medico").length}
              </span>
            )}
          </button>

          <button
            onClick={finalizarSesion}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2 ml-2"
          >
            <PhoneOff className="w-5 h-5" />
            Finalizar
          </button>
        </div>

        {/* Información de sesión */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.secundario}`}>
            <Clock className={`w-5 h-5 ${tema.colores.acento}`} />
            <span className={`text-sm font-bold ${tema.colores.texto}`}>
              {formatearTiempo(estadisticasSesion.duracion_actual)}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.secundario}`}>
            <Signal className="w-5 h-5 text-green-500" />
            <span className={`text-sm font-bold ${tema.colores.texto}`}>
              {estadisticasSesion.calidad_promedio}%
            </span>
          </div>

          {estadoGrabacion !== "idle" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white animate-pulse">
              <Film className="w-5 h-5" />
              <span className="text-sm font-bold">{formatearTiempo(tiempoGrabacion)}</span>
            </div>
          )}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR IZQUIERDO */}
        <aside
          className={`${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra} transition-all duration-300 ${
            sidebarAbierto ? "w-80" : "w-16"
          } flex flex-col overflow-hidden`}
        >
          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className={`p-3 ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 flex items-center justify-center`}
          >
            {sidebarAbierto ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {sidebarAbierto && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Participantes */}
              <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                  <Users className="w-4 h-4" />
                  PARTICIPANTES ({participantes.length})
                </h3>
                <div className="space-y-2">
                  {participantes.map((participante) => (
                    <div
                      key={participante.id}
                      className={`p-3 rounded-lg ${tema.colores.secundario} transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-sm`}>
                          {participante.foto_url ? (
                            <Image
                              src={participante.foto_url}
                              alt={participante.nombre}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            participante.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                          )}
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              participante.calidad_conexion === "excelente"
                                ? "bg-green-500"
                                : participante.calidad_conexion === "buena"
                                ? "bg-blue-500"
                                : participante.calidad_conexion === "regular"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${tema.colores.texto} truncate`}>
                            {participante.nombre}
                          </p>
                          <p className={`text-xs ${tema.colores.textoSecundario} truncate`}>
                            {participante.tipo === "medico" ? "Médico" : "Paciente"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {participante.audio_activo ? (
                          <Mic className={`w-3 h-3 ${tema.colores.acento}`} />
                        ) : (
                          <MicOff className="w-3 h-3 text-red-500" />
                        )}
                        {participante.video_activo ? (
                          <Camera className={`w-3 h-3 ${tema.colores.acento}`} />
                        ) : (
                          <CameraOff className="w-3 h-3 text-red-500" />
                        )}
                        {participante.compartiendo_pantalla && (
                          <Monitor className="w-3 h-3 text-green-500" />
                        )}
                        <span className={`text-xs ${tema.colores.textoSecundario} ml-auto`}>
                          {participante.tiempo_conexion_minutos} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estadísticas */}
              <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                  <BarChart3 className="w-4 h-4" />
                  ESTADÍSTICAS EN VIVO
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Calidad de Video
                      </span>
                      <span className={`text-xs font-bold ${tema.colores.texto}`}>
                        {estadisticasSesion.calidad_promedio}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${estadisticasSesion.calidad_promedio}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Latencia</span>
                      <span className={`text-xs font-bold ${tema.colores.texto}`}>
                        {estadisticasSesion.latencia_promedio}ms
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          estadisticasSesion.latencia_promedio < 50
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : estadisticasSesion.latencia_promedio < 100
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                        }`}
                        style={{
                          width: `${Math.min((estadisticasSesion.latencia_promedio / 200) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                        Ancho de Banda
                      </span>
                      <span className={`text-xs font-bold ${tema.colores.texto}`}>
                        {estadisticasSesion.ancho_banda_usado} Mbps
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                        style={{
                          width: `${Math.min((estadisticasSesion.ancho_banda_usado / 5) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className={`p-2 rounded-lg ${tema.colores.secundario} text-center`}>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>FPS</p>
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        {estadisticasSesion.fps_video}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${tema.colores.secundario} text-center`}>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Pérdida</p>
                      <p className={`text-lg font-black ${tema.colores.texto}`}>
                        {estadisticasSesion.paquetes_perdidos}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sugerencias IA */}
              {iaAsistenteActivo && sugerenciasIA.length > 0 && (
                <div className="rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 p-4 animate-pulse-slow">
                  <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    SUGERENCIAS DE IA
                  </h3>
                  <div className="space-y-2">
                    {sugerenciasIA.map((sugerencia, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                      >
                        <p className="text-xs text-white leading-relaxed">{sugerencia}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button className="text-xs text-green-400 hover:text-green-300 font-semibold">
                            Aplicar
                          </button>
                          <button className="text-xs text-red-400 hover:text-red-300 font-semibold">
                            Descartar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcripción */}
              {transcripcionActiva && (
                <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                  <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                    <FileText className="w-4 h-4" />
                    TRANSCRIPCIÓN EN VIVO
                  </h3>
                  <div className={`p-3 rounded-lg ${tema.colores.secundario} max-h-40 overflow-y-auto`}>
                    <p className={`text-xs ${tema.colores.texto} leading-relaxed`}>
                      {transcripcionTexto || "Esperando audio..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={async () => {
                        if (transcripcionTexto && sesionActiva) {
                          try {
                            const response = await fetch("/api/telemedicina/sala/transcripcion", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify({
                                id_sesion_telemedicina: sesionActiva.id_sesion,
                                id_paciente: sesionActiva.id_paciente,
                                texto_transcripcion: transcripcionTexto,
                                analizar_con_ia: true,
                              }),
                            });

                            if (response.ok) {
                              alert("Transcripción guardada exitosamente");
                              setTranscripcionTexto("");
                            }
                          } catch (error) {
                            console.error("Error al guardar transcripción:", error);
                          }
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg ${tema.colores.primario} text-white text-xs font-bold`}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transcripcionTexto);
                        alert("Transcripción copiada al portapapeles");
                      }}
                      className={`px-3 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ÁREA DE VIDEO PRINCIPAL */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 relative bg-black">
            {/* Video remoto (Paciente) */}
            <video
              ref={videoRemotoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Video local (Médico) - Picture in Picture */}
            <div className="absolute bottom-6 right-6 w-80 h-60 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gray-900">
              <video
                ref={videoLocalRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!videoActivo && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-3xl`}>
                    {usuario?.nombre[0]}
                    {usuario?.apellido_paterno[0]}
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Tú</span>
                  <div className="flex items-center gap-2">
                    {audioActivo ? (
                      <Mic className="w-4 h-4 text-white" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-500" />
                    )}
                    {videoActivo ? (
                      <Camera className="w-4 h-4 text-white" />
                    ) : (
                      <CameraOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Indicadores de estado */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {compartiendoPantalla && (
                <div className="px-4 py-2 bg-green-600 text-white rounded-full font-bold flex items-center gap-2 shadow-2xl animate-pulse">
                  <Monitor className="w-5 h-5" />
                  Compartiendo pantalla
                </div>
              )}
              {estadoGrabacion === "recording" && (
                <div className="px-4 py-2 bg-red-600 text-white rounded-full font-bold flex items-center gap-2 shadow-2xl animate-pulse">
                  <Film className="w-5 h-5" />
                  GRABANDO • {formatearTiempo(tiempoGrabacion)}
                </div>
              )}
              {transcripcionActiva && (
                <div className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold flex items-center gap-2 shadow-2xl">
                  <FileText className="w-5 h-5" />
                  Transcribiendo...
                </div>
              )}
              {iaAsistenteActivo && (
                <div className="px-4 py-2 bg-purple-600 text-white rounded-full font-bold flex items-center gap-2 shadow-2xl animate-pulse">
                  <Brain className="w-5 h-5" />
                  IA Activa
                </div>
              )}
            </div>

            {/* Información del paciente (overlay) */}
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                  onClick={() => {
                    // Abrir modal de información del paciente
                    setTabActiva("info");
                    setPanelDerechoAbierto(true);
                  }}
                >
                  {sesionActiva.paciente.foto_url ? (
                    <Image
                      src={sesionActiva.paciente.foto_url}
                      alt={sesionActiva.paciente.nombre_completo}
                      width={48}
                      height={48}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    sesionActiva.paciente.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white cursor-pointer hover:text-cyan-400 transition-colors"
                    onClick={() => {
                      setTabActiva("info");
                      setPanelDerechoAbierto(true);
                    }}
                  >
                    {sesionActiva.paciente.nombre_completo}
                  </h3>
                  <p className="text-sm text-white/80">
                    {sesionActiva.paciente.edad} años • {sesionActiva.paciente.genero}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                  {sesionActiva.paciente.grupo_sanguineo}
                </span>
                {sesionActiva.paciente.alergias.map((alergia) => (
                  <span
                    key={alergia}
                    className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold"
                  >
                    ⚠️ {alergia}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Chat flotante */}
          {chatAbierto && (
            <div className="absolute bottom-6 right-6 w-96 h-[500px] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden z-50">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat
                </h3>
                <button
                  onClick={() => setChatAbierto(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mensajesChat.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-3" />
                      <p className="text-sm text-white/50">No hay mensajes aún</p>
                    </div>
                  </div>
                ) : (
                  mensajesChat.map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`flex ${
                        mensaje.tipo_usuario === "medico" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          mensaje.tipo_usuario === "medico"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                            : "bg-white/10"
                        } rounded-2xl px-4 py-3`}
                      >
                        <p className="text-xs font-bold text-white/80 mb-1">{mensaje.nombre_usuario}</p>
                        <p className="text-sm text-white">{mensaje.mensaje}</p>
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(mensaje.fecha_hora).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviarMensaje();
                }}
                className="p-4 border-t border-white/20 flex items-center gap-2"
              >
                <button
                  type="button"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={mensajeActual}
                  onChange={(e) => setMensajeActual(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </main>

        {/* PANEL DERECHO - INFORMACIÓN Y DOCUMENTACIÓN */}
        <aside
          className={`${tema.colores.sidebar} ${tema.colores.borde} border-l ${tema.colores.sombra} transition-all duration-300 ${
            panelDerechoAbierto ? "w-96" : "w-16"
          } flex flex-col overflow-hidden`}
        >
          <button
            onClick={() => setPanelDerechoAbierto(!panelDerechoAbierto)}
            className={`p-3 ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 flex items-center justify-center`}
          >
            {panelDerechoAbierto ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {panelDerechoAbierto && (
            <>
              {/* Tabs */}
              <div className={`flex items-center border-b ${tema.colores.borde} overflow-x-auto`}>
                {[
                  { id: "info", label: "Info", icon: User },
                  { id: "notas", label: "Notas", icon: FileText },
                  { id: "recetas", label: "Recetas", icon: ClipboardList },
                  { id: "examenes", label: "Exámenes", icon: Activity },
                  { id: "historial", label: "Historial", icon: History },
                  { id: "signos", label: "Signos", icon: HeartPulse },
                  { id: "transcripcion", label: "IA", icon: Brain },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id as any)}
                    className={`flex-1 min-w-fit px-4 py-3 font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
                      tabActiva === tab.id
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.texto} ${tema.colores.hover}`
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Contenido de tabs */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* TAB: INFORMACIÓN DEL PACIENTE */}
                {tabActiva === "info" && (
                  <div className="space-y-4">
                    <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                      <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                        <User className="w-4 h-4" />
                        DATOS DEL PACIENTE
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>Nombre completo</p>
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {sesionActiva.paciente.nombre_completo}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>Edad</p>
                            <p className={`text-sm font-bold ${tema.colores.texto}`}>
                              {sesionActiva.paciente.edad} años
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>Género</p>
                            <p className={`text-sm font-bold ${tema.colores.texto}`}>
                              {sesionActiva.paciente.genero}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>Grupo sanguíneo</p>
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {sesionActiva.paciente.grupo_sanguineo}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>Teléfono</p>
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {sesionActiva.paciente.telefono || "No registrado"}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>Email</p>
                          <p className={`text-sm font-bold ${tema.colores.texto}`}>
                            {sesionActiva.paciente.email || "No registrado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                      <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        ALERGIAS
                      </h3>
                      {sesionActiva.paciente.alergias.length > 0 ? (
                        <div className="space-y-2">
                          {sesionActiva.paciente.alergias.map((alergia) => (
                            <div
                              key={alergia}
                              className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
                            >
                              <p className="text-sm font-bold text-red-400">⚠️ {alergia}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>Sin alergias registradas</p>
                      )}
                    </div>

                    <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                      <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                        <HeartPulse className="w-4 h-4 text-orange-500" />
                        CONDICIONES CRÓNICAS
                      </h3>
                      {sesionActiva.paciente.condiciones_cronicas.length > 0 ? (
                        <div className="space-y-2">
                          {sesionActiva.paciente.condiciones_cronicas.map((condicion) => (
                            <div key={condicion} className={`px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                              <p className={`text-sm font-bold ${tema.colores.texto}`}>• {condicion}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Sin condiciones crónicas registradas
                        </p>
                      )}
                    </div>

                    <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                      <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                        <Calendar className="w-4 h-4" />
                        MOTIVO DE CONSULTA
                      </h3>
                      <p className={`text-sm ${tema.colores.texto} leading-relaxed`}>
                        {sesionActiva.cita.motivo || "No especificado"}
                      </p>
                      {sesionActiva.cita.notas_previas && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-xs font-bold text-blue-400 mb-1">Notas previas:</p>
                          <p className="text-sm text-blue-300">{sesionActiva.cita.notas_previas}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: NOTAS DE LA SESIÓN */}
                {tabActiva === "notas" && (
                  <div className="space-y-4">
                    <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                      <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                        <FileText className="w-4 h-4" />
                        NUEVA NOTA
                      </h3>
                      <textarea
                        value={notaActual}
                        onChange={(e) => setNotaActual(e.target.value)}
                        placeholder="Escribe tus observaciones aquí..."
                        className={`w-full px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                        rows={4}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={() => agregarNota("observacion")}
                          className={`px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-bold text-xs transition-all duration-300 hover:scale-105`}
                        >
                          Observación
                        </button>
                        <button
                          onClick={() => agregarNota("diagnostico")}
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-all duration-300 hover:scale-105"
                        >
                          Diagnóstico
                        </button>
                        <button
                          onClick={() => agregarNota("tratamiento")}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all duration-300 hover:scale-105"
                        >
                          Tratamiento
                        </button>
                        <button
                          onClick={() => agregarNota("recordatorio")}
                          className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs transition-all duration-300 hover:scale-105"
                        >
                          Recordatorio
                        </button>
                      </div>
                    </div>

                    <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
                      <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                        <List className="w-4 h-4" />
                        NOTAS DE LA SESIÓN ({notas.length})
                      </h3>
                      {notas.length === 0 ? (
                        <p className={`text-sm ${tema.colores.textoSecundario} text-center py-4`}>
                          No hay notas registradas
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {notas.map((nota) => (
                            <div
                              key={nota.id}
                              className={`p-3 rounded-lg ${tema.colores.secundario} border-l-4 ${
                                nota.tipo === "observacion"
                                  ? "border-indigo-500"
                                  : nota.tipo === "diagnostico"
                                  ? "border-green-500"
                                  : nota.tipo === "tratamiento"
                                  ? "border-blue-500"
                                  : "border-yellow-500"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-xs font-bold uppercase ${
                                    nota.tipo === "observacion"
                                      ? "text-indigo-400"
                                      : nota.tipo === "diagnostico"
                                      ? "text-green-400"
                                      : nota.tipo === "tratamiento"
                                      ? "text-blue-400"
                                      : "text-yellow-400"
                                  }`}
                                >
                                  {nota.tipo}
                                </span>
                                <span className={`text-xs ${tema.colores.textoSecundario}`}>
                                  {new Date(nota.timestamp).toLocaleTimeString("es-CL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className={`text-sm ${tema.colores.texto} leading-relaxed`}>{nota.contenido}</p>
                              <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>Por: {nota.autor}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: RECETAS DIGITALES */}
                {tabActiva === "recetas" && (
                  <RecetasPanel
                    recetas={recetas}
                    tema={tema}
                    onAgregarReceta={agregarReceta}
                  />
                )}

                {/* TAB: EXÁMENES SOLICITADOS */}
                {tabActiva === "examenes" && (
                  <ExamenesPanel
                    examenes={examenes}
                    tema={tema}
                    onSolicitarExamen={solicitarExamen}
                  />
                )}

                {/* TAB: SIGNOS VITALES */}
                {tabActiva === "signos" && (
                  <SignosVitalesPanel
                    signosVitales={signosVitales}
                    tema={tema}
                    sesionActiva={sesionActiva}
                    onActualizar={cargarDatosSesion}
                  />
                )}

                {/* TAB: HISTORIAL */}
                {tabActiva === "historial" && (
                  <HistorialPanel
                    sesionActiva={sesionActiva}
                    tema={tema}
                  />
                )}

                {/* TAB: TRANSCRIPCIÓN E IA */}
                {tabActiva === "transcripcion" && (
                  <TranscripcionPanel
                    transcripcionTexto={transcripcionTexto}
                    sugerenciasIA={sugerenciasIA}
                    tema={tema}
                    sesionActiva={sesionActiva}
                  />
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

// Componente para Recetas
function RecetasPanel({ recetas, tema, onAgregarReceta }: any) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaReceta, setNuevaReceta] = useState({
    medicamento: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    indicaciones: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAgregarReceta(nuevaReceta);
    setNuevaReceta({
      medicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      indicaciones: "",
    });
    setMostrarFormulario(false);
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-black ${tema.colores.texto} flex items-center gap-2`}>
            <ClipboardList className="w-4 h-4" />
            RECETAS PRESCRITAS ({recetas.length})
          </h3>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`p-2 rounded-lg ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-110`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Nombre del medicamento"
              value={nuevaReceta.medicamento}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, medicamento: e.target.value })}
              required
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Dosis (ej: 500mg)"
                value={nuevaReceta.dosis}
                onChange={(e) => setNuevaReceta({ ...nuevaReceta, dosis: e.target.value })}
                required
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="text"
                placeholder="Frecuencia"
                value={nuevaReceta.frecuencia}
                onChange={(e) => setNuevaReceta({ ...nuevaReceta, frecuencia: e.target.value })}
                required
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
            </div>
            <input
              type="text"
              placeholder="Duración (ej: 7 días)"
              value={nuevaReceta.duracion}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, duracion: e.target.value })}
              required
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
            />
            <textarea
              placeholder="Indicaciones especiales"
              value={nuevaReceta.indicaciones}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, indicaciones: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm`}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 px-4 py-3 rounded-lg ${tema.colores.primario} text-white font-bold text-sm transition-all duration-300 hover:scale-105`}
              >
                Agregar Receta
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className={`px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {recetas.length === 0 ? (
          <p className={`text-sm ${tema.colores.textoSecundario} text-center py-4`}>
            No hay recetas prescritas
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recetas.map((receta: RecetaDigital) => (
              <div
                key={receta.id}
                className={`p-4 rounded-lg ${tema.colores.secundario} border-l-4 border-green-500`}
              >
                <h4 className={`text-sm font-black ${tema.colores.texto} mb-2`}>{receta.medicamento}</h4>
                <div className="space-y-1">
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    <strong>Dosis:</strong> {receta.dosis}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    <strong>Frecuencia:</strong> {receta.frecuencia}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    <strong>Duración:</strong> {receta.duracion}
                  </p>
                  {receta.indicaciones && (
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>
                      <strong>Indicaciones:</strong> {receta.indicaciones}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para Exámenes
function ExamenesPanel({ examenes, tema, onSolicitarExamen }: any) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoExamen, setNuevoExamen] = useState({
    tipo: "",
    nombre: "",
    prioridad: "normal" as "urgente" | "normal" | "rutina",
    indicaciones: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSolicitarExamen(nuevoExamen);
    setNuevoExamen({
      tipo: "",
      nombre: "",
      prioridad: "normal",
      indicaciones: "",
    });
    setMostrarFormulario(false);
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-black ${tema.colores.texto} flex items-center gap-2`}>
            <Activity className="w-4 h-4" />
            EXÁMENES SOLICITADOS ({examenes.length})
          </h3>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`p-2 rounded-lg ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-110`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <select
              value={nuevoExamen.tipo}
              onChange={(e) => setNuevoExamen({ ...nuevoExamen, tipo: e.target.value })}
              required
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
            >
              <option value="">Seleccionar tipo</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Imagenología">Imagenología</option>
              <option value="Cardiología">Cardiología</option>
              <option value="Otros">Otros</option>
            </select>
            <input
              type="text"
              placeholder="Nombre del examen"
              value={nuevoExamen.nombre}
              onChange={(e) => setNuevoExamen({ ...nuevoExamen, nombre: e.target.value })}
              required
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
            />
            <select
              value={nuevoExamen.prioridad}
              onChange={(e) =>
                setNuevoExamen({ ...nuevoExamen, prioridad: e.target.value as any })
              }
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
            >
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
              <option value="rutina">Rutina</option>
            </select>
            <textarea
              placeholder="Indicaciones adicionales"
              value={nuevoExamen.indicaciones}
              onChange={(e) => setNuevoExamen({ ...nuevoExamen, indicaciones: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm`}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 px-4 py-3 rounded-lg ${tema.colores.primario} text-white font-bold text-sm transition-all duration-300 hover:scale-105`}
              >
                Solicitar Examen
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className={`px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {examenes.length === 0 ? (
          <p className={`text-sm ${tema.colores.textoSecundario} text-center py-4`}>
            No hay exámenes solicitados
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {examenes.map((examen: ExamenSolicitado) => (
              <div
                key={examen.id}
                className={`p-4 rounded-lg ${tema.colores.secundario} border-l-4 ${
                  examen.prioridad === "urgente"
                    ? "border-red-500"
                    : examen.prioridad === "normal"
                    ? "border-yellow-500"
                    : "border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`text-sm font-black ${tema.colores.texto}`}>{examen.nombre}</h4>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>{examen.tipo}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      examen.prioridad === "urgente"
                        ? "bg-red-500/20 text-red-400"
                        : examen.prioridad === "normal"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {examen.prioridad}
                  </span>
                </div>
                {examen.indicaciones && (
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>{examen.indicaciones}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para Signos Vitales
function SignosVitalesPanel({ signosVitales, tema, sesionActiva, onActualizar }: any) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevosSignos, setNuevosSignos] = useState({
    presion_sistolica: "",
    presion_diastolica: "",
    pulso: "",
    temperatura: "",
    saturacion_oxigeno: "",
    peso: "",
    talla: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/telemedicina/sala/signos-vitales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_paciente: sesionActiva.id_paciente,
          ...nuevosSignos,
        }),
      });

      if (response.ok) {
        alert("Signos vitales registrados exitosamente");
        setNuevosSignos({
          presion_sistolica: "",
          presion_diastolica: "",
          pulso: "",
          temperatura: "",
          saturacion_oxigeno: "",
          peso: "",
          talla: "",
        });
        setMostrarFormulario(false);
        onActualizar();
      }
    } catch (error) {
      console.error("Error al registrar signos vitales:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-black ${tema.colores.texto} flex items-center gap-2`}>
            <HeartPulse className="w-4 h-4" />
            SIGNOS VITALES ({signosVitales.length})
          </h3>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`p-2 rounded-lg ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-110`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Presión Sistólica"
                value={nuevosSignos.presion_sistolica}
                onChange={(e) =>
                  setNuevosSignos({ ...nuevosSignos, presion_sistolica: e.target.value })
                }
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="number"
                placeholder="Presión Diastólica"
                value={nuevosSignos.presion_diastolica}
                onChange={(e) =>
                  setNuevosSignos({ ...nuevosSignos, presion_diastolica: e.target.value })
                }
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="number"
                placeholder="Pulso (lpm)"
                value={nuevosSignos.pulso}
                onChange={(e) => setNuevosSignos({ ...nuevosSignos, pulso: e.target.value })}
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Temperatura (°C)"
                value={nuevosSignos.temperatura}
                onChange={(e) => setNuevosSignos({ ...nuevosSignos, temperatura: e.target.value })}
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="number"
                placeholder="Saturación O2 (%)"
                value={nuevosSignos.saturacion_oxigeno}
                onChange={(e) =>
                  setNuevosSignos({ ...nuevosSignos, saturacion_oxigeno: e.target.value })
                }
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={nuevosSignos.peso}
                onChange={(e) => setNuevosSignos({ ...nuevosSignos, peso: e.target.value })}
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
              <input
                type="number"
                placeholder="Talla (cm)"
                value={nuevosSignos.talla}
                onChange={(e) => setNuevosSignos({ ...nuevosSignos, talla: e.target.value })}
                className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm`}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex-1 px-4 py-3 rounded-lg ${tema.colores.primario} text-white font-bold text-sm transition-all duration-300 hover:scale-105`}
              >
                Registrar Signos
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className={`px-4 py-3 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold text-sm transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {signosVitales.length === 0 ? (
          <p className={`text-sm ${tema.colores.textoSecundario} text-center py-4`}>
            No hay signos vitales registrados
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {signosVitales.map((signos: SignosVitales) => (
              <div key={signos.id} className={`p-4 rounded-lg ${tema.colores.secundario}`}>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                  {new Date(signos.fecha_medicion).toLocaleString("es-CL")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>Presión Arterial</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {signos.presion_sistolica}/{signos.presion_diastolica} mmHg
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>Pulso</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>{signos.pulso} lpm</p>
                  </div>
                  <div>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>Temperatura</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>{signos.temperatura} °C</p>
                  </div>
                  <div>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>Saturación O2</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>
                      {signos.saturacion_oxigeno}%
                    </p>
                  </div>
                  {signos.peso && (
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Peso</p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>{signos.peso} kg</p>
                    </div>
                  )}
                  {signos.imc && (
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>IMC</p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>{signos.imc}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para Historial
function HistorialPanel({ sesionActiva, tema }: any) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
        <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
          <History className="w-4 h-4" />
          HISTORIAL CLÍNICO
        </h3>
        <p className={`text-sm ${tema.colores.textoSecundario} text-center py-8`}>
          Cargando historial del paciente...
        </p>
      </div>
    </div>
  );
}

// Componente para Transcripción e IA
function TranscripcionPanel({ transcripcionTexto, sugerenciasIA, tema, sesionActiva }: any) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
        <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
          <Brain className="w-4 h-4" />
          ASISTENTE INTELIGENTE
        </h3>
        <div className="space-y-3">
          {sugerenciasIA.length > 0 ? (
            sugerenciasIA.map((sugerencia: string, index: number) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30"
              >
                <p className="text-sm text-white leading-relaxed">{sugerencia}</p>
              </div>
            ))
          ) : (
            <p className={`text-sm ${tema.colores.textoSecundario} text-center py-4`}>
              Activa el asistente IA para obtener sugerencias
            </p>
          )}
        </div>
      </div>

      {transcripcionTexto && (
        <div className={`rounded-xl ${tema.colores.card} ${tema.colores.borde} border p-4`}>
          <h3 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
            <FileText className="w-4 h-4" />
            TRANSCRIPCIÓN ACTUAL
          </h3>
          <div className={`p-3 rounded-lg ${tema.colores.secundario}`}>
            <p className={`text-sm ${tema.colores.texto} leading-relaxed`}>{transcripcionTexto}</p>
          </div>
        </div>
      )}
    </div>
  );
}