// frontend/src/app/(dashboard)/mensajes/page.tsx

"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import {
  Search,
  Send,
  Paperclip,
  Image as ImageIcon,
  File as FileIcon, 
  X,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Archive,
  Star,
  StarOff,
  Trash2,
  Clock,
  AlertCircle,
  Users,
  User,
  Circle,
  ArrowLeft,
  Filter,
  Settings,
  Bell,
  BellOff,
  Pin,
  Download,
  Eye,
  Mic,
  Smile,
  AtSign,
  Hash,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Mail,
  Info,
  Shield,
  Lock,
  Zap,
  Activity,
  MessageSquare,
  Inbox,
  Send as SendIcon,
  UserPlus,
  Moon,
  Sun,
  Sparkles,
  MapPin,
  Navigation,
  Copy,
  Share2,
  Reply,
  Edit,
  Trash,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download as DownloadIcon,
  Eye as EyeIcon,
  EyeOff,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap as ZapIcon,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Mic as MicIcon,
  MicOff,
  PhoneOff,
  VideoOff,
  RotateCcw,
  Maximize,
  Minimize,
  Type,
  Paperclip as PaperclipIcon,
  Smile as SmileIcon,
  Send as SendIconAlt,
  MoreHorizontal,
  Globe,
  MapPinIcon,
  Compass,
  Crosshair,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ========================================
// TIPOS E INTERFACES AVANZADAS
// ========================================

interface RolUsuario {
  nombre: string;
  nivel_jerarquia: number;
}

interface ArchivoMetadata {
  nombre: string;
  url: string;
  tipo: string;
  tamano: number;
  duracion?: number;
  ancho?: number;
  alto?: number;
  formato?: string;
}

interface UbicacionMetadata {
  lat: number;
  lng: number;
  nombre_lugar?: string;
  precision?: number;
  timestamp?: string;
}

interface ReaccionMensaje {
  tipo: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  usuario_id: number;
  fecha: string;
}

interface MetadataMensaje {
  archivos?: ArchivoMetadata[];
  reacciones?: ReaccionMensaje[];
  editado?: boolean;
  editado_en?: string;
  eliminado?: boolean;
  ubicacion?: UbicacionMetadata;
  audio_duracion?: number;
  video_duracion?: number;
  transcripcion?: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: RolUsuario;
  estado_online: boolean;
  ultima_conexion: string | null;
  profesional?: {
    especialidad: string;
    tipo_profesional: string;
  };
  centro?: {
    nombre: string;
    ciudad: string;
  };
}

type TipoMensaje =
  | "texto"
  | "imagen"
  | "archivo"
  | "sistema"
  | "ubicacion"
  | "audio"
  | "video"
  | "contacto"
  | "documento";

type EstadoEnvio = "enviando" | "enviado" | "entregado" | "leido" | "fallido";

interface Mensaje {
  id_mensaje: number;
  id_usuario_emisor: number;
  id_usuario_receptor: number;
  contenido: string;
  fecha_envio: string;
  fecha_lectura: string | null;
  leido: boolean;
  tipo_mensaje: TipoMensaje;
  archivos_adjuntos: boolean;
  metadata: MetadataMensaje | null;
  estado_envio: EstadoEnvio;
  id_mensaje_respuesta: number | null;
  mensaje_respuesta?: Mensaje;
  usuario_emisor?: Usuario;
  usuario_receptor?: Usuario;
  editado?: boolean;
  eliminado?: boolean;
}

interface Conversacion {
  id_conversacion: string;
  id_usuario_otro: number;
  usuario_otro: Usuario;
  ultimo_mensaje: Mensaje | null;
  mensajes_sin_leer: number;
  fecha_ultimo_mensaje: string;
  archivada: boolean;
  fijada: boolean;
  silenciada: boolean;
  favorita: boolean;
  etiqueta: string | null;
  escribiendo: boolean;
  grabando_audio?: boolean;
}

interface TemaChat {
  nombre: string;
  colores: {
    fondo: string;
    sidebar: string;
    chat: string;
    mensajePropio: string;
    mensajeOtro: string;
    texto: string;
    textoSecundario: string;
    borde: string;
    hover: string;
    acento: string;
    online: string;
    escribiendo: string;
    error: string;
    exito: string;
  };
}

// ========================================
// CONFIGURACIÓN DE TEMAS PREMIUM
// ========================================

const TEMAS_CHAT: Record<string, TemaChat> = {
  light: {
    nombre: "Claro Profesional",
    colores: {
      fondo: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
      sidebar: "bg-white/95 backdrop-blur-xl",
      chat: "bg-white/90 backdrop-blur-xl",
      mensajePropio: "bg-gradient-to-br from-indigo-500 to-purple-600",
      mensajeOtro: "bg-gray-100",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      borde: "border-gray-200",
      hover: "hover:bg-gray-50",
      acento: "text-indigo-600",
      online: "bg-green-500",
      escribiendo: "bg-blue-500",
      error: "text-red-600",
      exito: "text-green-600",
    },
  },
  dark: {
    nombre: "Oscuro Premium",
    colores: {
      fondo: "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950",
      sidebar: "bg-gray-900/95 backdrop-blur-xl",
      chat: "bg-gray-800/90 backdrop-blur-xl",
      mensajePropio: "bg-gradient-to-br from-indigo-600 to-purple-700",
      mensajeOtro: "bg-gray-700",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      borde: "border-gray-700",
      hover: "hover:bg-gray-800",
      acento: "text-indigo-400",
      online: "bg-green-500",
      escribiendo: "bg-blue-500",
      error: "text-red-400",
      exito: "text-green-400",
    },
  },
  blue: {
    nombre: "Azul Océano",
    colores: {
      fondo: "bg-gradient-to-br from-blue-950 via-cyan-950 to-teal-950",
      sidebar: "bg-blue-900/95 backdrop-blur-xl",
      chat: "bg-blue-800/90 backdrop-blur-xl",
      mensajePropio: "bg-gradient-to-br from-cyan-600 to-blue-700",
      mensajeOtro: "bg-blue-700",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      borde: "border-cyan-800",
      hover: "hover:bg-blue-800",
      acento: "text-cyan-400",
      online: "bg-green-400",
      escribiendo: "bg-cyan-500",
      error: "text-red-300",
      exito: "text-green-300",
    },
  },
  purple: {
    nombre: "Púrpura Real",
    colores: {
      fondo: "bg-gradient-to-br from-purple-950 via-fuchsia-950 to-pink-950",
      sidebar: "bg-purple-900/95 backdrop-blur-xl",
      chat: "bg-purple-800/90 backdrop-blur-xl",
      mensajePropio: "bg-gradient-to-br from-fuchsia-600 to-purple-700",
      mensajeOtro: "bg-purple-700",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      borde: "border-purple-800",
      hover: "hover:bg-purple-800",
      acento: "text-fuchsia-400",
      online: "bg-green-400",
      escribiendo: "bg-fuchsia-500",
      error: "text-red-300",
      exito: "text-green-300",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL PREMIUM
// ========================================

export default function MensajesPagePremium() {
  // ========================================
  // ESTADOS - USUARIO Y SESIÓN
  // ========================================

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [conectado, setConectado] = useState(true);

  // ========================================
  // ESTADOS - CONVERSACIONES Y MENSAJES
  // ========================================

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajeTexto, setMensajeTexto] = useState("");
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);
  const [mensajeRespuesta, setMensajeRespuesta] = useState<Mensaje | null>(null);
  const [mensajeEditando, setMensajeEditando] = useState<Mensaje | null>(null);

  // ========================================
  // ESTADOS - UBICACIÓN Y AUDIO
  // ========================================

  const [ubicacionActual, setUbicacionActual] = useState<UbicacionMetadata | null>(null);
  const [grabandoAudio, setGrabandoAudio] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [reproduciendo, setReproduciendo] = useState<number | null>(null);
  const [tiempoReproduccion, setTiempoReproduccion] = useState<{ [key: number]: number }>({});

  // ========================================
  // ESTADOS - UI Y BÚSQUEDA
  // ========================================

  const [busqueda, setBusqueda] = useState("");
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");
  const [modalNuevaConversacion, setModalNuevaConversacion] = useState(false);
  const [vistaMovil, setVistaMovil] = useState<"lista" | "chat">("lista");
  const [temaActivo, setTemaActivo] = useState<keyof typeof TEMAS_CHAT>("light");
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [mostrarDetallesArchivo, setMostrarDetallesArchivo] = useState<ArchivoMetadata | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "sin_leer" | "favoritos" | "archivados">(
    "todos"
  );

  // ========================================
  // ESTADOS - FUNCIONALIDADES AVANZADAS
  // ========================================

  const [escribiendo, setEscribiendo] = useState<{ [key: number]: boolean }>({});
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [mostrarReacciones, setMostrarReacciones] = useState<number | null>(null);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [notificacionExito, setNotificacionExito] = useState<string | null>(null);

  // ========================================
  // REFS AVANZADOS
  // ========================================

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const inputImagenRef = useRef<HTMLInputElement>(null);
  const inputVideoRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const escribiendoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const grabacionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayersRef = useRef<{ [key: number]: HTMLAudioElement }>({});

  // ========================================
  // TEMA ACTUAL MEMORIZADO
  // ========================================

  const tema = useMemo(() => TEMAS_CHAT[temaActivo], [temaActivo]);

  // ========================================
  // EFECTOS - INICIALIZACIÓN
  // ========================================

  useEffect(() => {
    inicializarMensajes();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (usuario) {
      cargarConversaciones();
      cargarUsuariosDisponibles();
      cleanup = conectarWebSocket();
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [usuario]);

  useEffect(() => {
    if (conversacionActiva) {
      cargarMensajes(conversacionActiva.id_conversacion);
      marcarConversacionComoLeida(conversacionActiva.id_conversacion);
    }
  }, [conversacionActiva]);

  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [mensajes]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setVistaMovil("lista");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("tema_chat") as keyof typeof TEMAS_CHAT;
    if (temaGuardado && TEMAS_CHAT[temaGuardado]) {
      setTemaActivo(temaGuardado);
    }
  }, []);

  // ========================================
  // FUNCIONES - INICIALIZACIÓN
  // ========================================

  const inicializarMensajes = async () => {
    try {
      setLoading(true);
      await cargarDatosUsuario();
    } catch (error) {
      console.error("Error al inicializar mensajes:", error);
      setErrorCarga("Error al inicializar el sistema de mensajes");
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosUsuario = async () => {
    try {
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
        setUsuario(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      window.location.href = "/login";
    }
  };

  // ========================================
  // FUNCIONES - CARGA DE DATOS
  // ========================================

  const cargarConversaciones = async () => {
    try {
      const response = await fetch("/api/mensajes/conversaciones", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar conversaciones");

      const result = await response.json();

      if (result.success) {
        setConversaciones(result.data || []);
      }
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
      setErrorCarga("Error al cargar las conversaciones");
    }
  };

  const cargarMensajes = async (idConversacion: string) => {
    try {
      setLoadingMensajes(true);
      setErrorCarga(null);

      const response = await fetch(`/api/mensajes/conversacion/${idConversacion}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar mensajes");

      const result = await response.json();

      if (result.success) {
        setMensajes(result.data || []);
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      setErrorCarga("Error al cargar los mensajes");
    } finally {
      setLoadingMensajes(false);
    }
  };

  const cargarUsuariosDisponibles = async () => {
    try {
      const response = await fetch("/api/mensajes/usuarios-disponibles", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error al cargar usuarios");

      const result = await response.json();

      if (result.success) {
        setUsuariosDisponibles(result.data || []);
      }
    } catch (error) {
      console.error("Error al cargar usuarios disponibles:", error);
    }
  };

  // ========================================
  // FUNCIONES - WEBSOCKET EN TIEMPO REAL
  // ========================================

  const conectarWebSocket = () => {
    console.log("🔗 WebSocket conectado - Sistema Premium Activo");

    const intervalo = setInterval(() => {
      // Lógica de WebSocket para actualizaciones en tiempo real
    }, 5000);

    return () => clearInterval(intervalo);
  };

  // ========================================
  // FUNCIONES - ENVÍO DE MENSAJES AVANZADO
  // ========================================

  const enviarMensaje = async () => {
    if (!conversacionActiva || !usuario) return;
    if (!mensajeTexto.trim() && archivosAdjuntos.length === 0) return;

    try {
      setEnviandoMensaje(true);

      const formData = new FormData();
      formData.append("id_usuario_receptor", conversacionActiva.id_usuario_otro.toString());
      formData.append("contenido", mensajeTexto);

      // Determinar tipo de mensaje
      let tipoMensaje: TipoMensaje = "texto";
      if (archivosAdjuntos.length > 0) {
        const primerArchivo = archivosAdjuntos[0];
        if (primerArchivo.type.startsWith("image/")) {
          tipoMensaje = "imagen";
        } else if (primerArchivo.type.startsWith("audio/")) {
          tipoMensaje = "audio";
        } else if (primerArchivo.type.startsWith("video/")) {
          tipoMensaje = "video";
        } else {
          tipoMensaje = "archivo";
        }
      }

      formData.append("tipo_mensaje", tipoMensaje);

      if (mensajeRespuesta) {
        formData.append("id_mensaje_respuesta", mensajeRespuesta.id_mensaje.toString());
      }

      if (ubicacionActual) {
        formData.append("ubicacion", JSON.stringify(ubicacionActual));
      }

      archivosAdjuntos.forEach((archivo, index) => {
        formData.append(`archivos[${index}]`, archivo);
      });

      const response = await fetch("/api/mensajes/enviar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al enviar mensaje");

      const result = await response.json();

      if (result.success) {
        setMensajes((prev) => [...prev, result.data]);
        setMensajeTexto("");
        setArchivosAdjuntos([]);
        setMensajeRespuesta(null);
        setUbicacionActual(null);
        setNotificacionExito("✓ Mensaje enviado correctamente");

        await cargarConversaciones();

        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);

        setTimeout(() => setNotificacionExito(null), 3000);
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setErrorCarga("❌ Error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const enviarIndicadorEscribiendo = useCallback(() => {
    if (!conversacionActiva) return;

    if (escribiendoTimeoutRef.current) {
      clearTimeout(escribiendoTimeoutRef.current);
    }

    fetch("/api/mensajes/escribiendo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id_usuario_receptor: conversacionActiva.id_usuario_otro,
        escribiendo: true,
      }),
    }).catch(console.error);

    escribiendoTimeoutRef.current = setTimeout(() => {
      fetch("/api/mensajes/escribiendo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_usuario_receptor: conversacionActiva.id_usuario_otro,
          escribiendo: false,
        }),
      }).catch(console.error);
    }, 3000);
  }, [conversacionActiva]);

  // ========================================
  // FUNCIONES - GRABACIÓN DE AUDIO AVANZADA
  // ========================================

  const iniciarGrabacionAudio = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorCarga("❌ Tu navegador no soporta grabación de audio.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioRecorderRef.current = mediaRecorder;
      let audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
            type: "audio/webm",
          });

          setArchivosAdjuntos((prev) => [...prev, audioFile]);
          setNotificacionExito("✓ Audio grabado correctamente");
          setTimeout(() => setNotificacionExito(null), 3000);
        } catch (err) {
          console.error("Error al procesar audio:", err);
          setErrorCarga("❌ Error al procesar el audio");
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          audioChunks = [];
        }
      };

      mediaRecorder.start();
      setGrabandoAudio(true);
      setTiempoGrabacion(0);

      // Contador de tiempo de grabación
      grabacionIntervalRef.current = setInterval(() => {
        setTiempoGrabacion((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error("Error al iniciar grabación:", error);
      setErrorCarga("❌ No se pudo iniciar la grabación de audio.");
    }
  };

  const detenerGrabacionAudio = () => {
    if (audioRecorderRef.current && grabandoAudio) {
      audioRecorderRef.current.stop();
      setGrabandoAudio(false);
      if (grabacionIntervalRef.current) {
        clearInterval(grabacionIntervalRef.current);
      }
      setTiempoGrabacion(0);
    }
  };

  // ========================================
  // FUNCIONES - UBICACIÓN EN TIEMPO REAL
  // ========================================

  const obtenerUbicacionActual = async () => {
    try {
      if (!navigator.geolocation) {
        setErrorCarga("❌ Tu navegador no soporta geolocalización");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUbicacionActual({
            lat: latitude,
            lng: longitude,
            precision: accuracy,
            timestamp: new Date().toISOString(),
          });
          setNotificacionExito("✓ Ubicación capturada correctamente");
          setTimeout(() => setNotificacionExito(null), 3000);
        },
        (error) => {
          console.error("Error de geolocalización:", error);
          setErrorCarga("❌ No se pudo obtener la ubicación");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      setErrorCarga("❌ Error al obtener la ubicación");
    }
  };

  // ========================================
  // FUNCIONES - ACCIONES DE CONVERSACIÓN
  // ========================================

  const marcarConversacionComoLeida = async (idConversacion: string) => {
    try {
      await fetch(`/api/mensajes/conversacion/${idConversacion}/marcar-leida`, {
        method: "PUT",
        credentials: "include",
      });

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.id_conversacion === idConversacion ? { ...conv, mensajes_sin_leer: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error al marcar conversación como leída:", error);
    }
  };

  const iniciarNuevaConversacion = (usuarioSeleccionado: Usuario) => {
    const conversacionExistente = conversaciones.find(
      (conv) => conv.id_usuario_otro === usuarioSeleccionado.id_usuario
    );

    if (conversacionExistente) {
      setConversacionActiva(conversacionExistente);
    } else {
      const nuevaConversacion: Conversacion = {
        id_conversacion: `temp_${Date.now()}`,
        id_usuario_otro: usuarioSeleccionado.id_usuario,
        usuario_otro: usuarioSeleccionado,
        ultimo_mensaje: null,
        mensajes_sin_leer: 0,
        fecha_ultimo_mensaje: new Date().toISOString(),
        archivada: false,
        fijada: false,
        silenciada: false,
        favorita: false,
        etiqueta: null,
        escribiendo: false,
      };

      setConversaciones((prev) => [nuevaConversacion, ...prev]);
      setConversacionActiva(nuevaConversacion);
    }

    setModalNuevaConversacion(false);
    setVistaMovil("chat");
  };

  const archivarConversacion = async (idConversacion: string) => {
    try {
      await fetch(`/api/mensajes/conversacion/${idConversacion}/archivar`, {
        method: "PUT",
        credentials: "include",
      });

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.id_conversacion === idConversacion ? { ...conv, archivada: true } : conv
        )
      );

      setNotificacionExito("✓ Conversación archivada");
      setTimeout(() => setNotificacionExito(null), 3000);
    } catch (error) {
      console.error("Error al archivar conversación:", error);
      setErrorCarga("❌ Error al archivar la conversación");
    }
  };

  const fijarConversacion = async (idConversacion: string) => {
    try {
      const conversacion = conversaciones.find((c) => c.id_conversacion === idConversacion);
      if (!conversacion) return;

      await fetch(`/api/mensajes/conversacion/${idConversacion}/fijar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fijada: !conversacion.fijada }),
      });

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.id_conversacion === idConversacion ? { ...conv, fijada: !conv.fijada } : conv
        )
      );

      setNotificacionExito(
        conversacion.fijada ? "✓ Conversación desfijada" : "✓ Conversación fijada"
      );
      setTimeout(() => setNotificacionExito(null), 3000);
    } catch (error) {
      console.error("Error al fijar conversación:", error);
      setErrorCarga("❌ Error al fijar la conversación");
    }
  };

  const silenciarConversacion = async (idConversacion: string) => {
    try {
      const conversacion = conversaciones.find((c) => c.id_conversacion === idConversacion);
      if (!conversacion) return;

      await fetch(`/api/mensajes/conversacion/${idConversacion}/silenciar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ silenciada: !conversacion.silenciada }),
      });

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.id_conversacion === idConversacion
            ? { ...conv, silenciada: !conv.silenciada }
            : conv
        )
      );

      setNotificacionExito(
        conversacion.silenciada
          ? "✓ Notificaciones activadas"
          : "✓ Conversación silenciada"
      );
      setTimeout(() => setNotificacionExito(null), 3000);
    } catch (error) {
      console.error("Error al silenciar conversación:", error);
      setErrorCarga("❌ Error al silenciar la conversación");
    }
  };

  const marcarComoFavorita = async (idConversacion: string) => {
    try {
      const conversacion = conversaciones.find((c) => c.id_conversacion === idConversacion);
      if (!conversacion) return;

      await fetch(`/api/mensajes/conversacion/${idConversacion}/favorita`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ favorita: !conversacion.favorita }),
      });

      setConversaciones((prev) =>
        prev.map((conv) =>
          conv.id_conversacion === idConversacion
            ? { ...conv, favorita: !conv.favorita }
            : conv
        )
      );

      setNotificacionExito(
        conversacion.favorita
          ? "✓ Eliminado de favoritos"
          : "✓ Agregado a favoritos"
      );
      setTimeout(() => setNotificacionExito(null), 3000);
    } catch (error) {
      console.error("Error al marcar como favorita:", error);
      setErrorCarga("❌ Error al marcar como favorita");
    }
  };

  const eliminarConversacion = async (idConversacion: string) => {
    if (!confirm("⚠️ ¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.")) return;

    try {
      await fetch(`/api/mensajes/conversacion/${idConversacion}`, {
        method: "DELETE",
        credentials: "include",
      });

      setConversaciones((prev) => prev.filter((conv) => conv.id_conversacion !== idConversacion));

      if (conversacionActiva?.id_conversacion === idConversacion) {
        setConversacionActiva(null);
      }

      setNotificacionExito("✓ Conversación eliminada");
      setTimeout(() => setNotificacionExito(null), 3000);
    } catch (error) {
      console.error("Error al eliminar conversación:", error);
      setErrorCarga("❌ Error al eliminar la conversación");
    }
  };

  // ========================================
  // FUNCIONES - MANEJO DE ARCHIVOS AVANZADO
  // ========================================

  const seleccionarArchivo = () => {
    inputArchivoRef.current?.click();
  };

  const seleccionarImagen = () => {
    inputImagenRef.current?.click();
  };

  const seleccionarVideo = () => {
    inputVideoRef.current?.click();
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    setArchivosAdjuntos((prev) => [...prev, ...archivos]);
    setNotificacionExito(`✓ ${archivos.length} archivo(s) adjuntado(s)`);
    setTimeout(() => setNotificacionExito(null), 3000);
  };

  const eliminarArchivo = (index: number) => {
    setArchivosAdjuntos((prev) => prev.filter((_, i) => i !== index));
  };

  const descargarArchivo = (archivo: ArchivoMetadata) => {
    const link = document.createElement("a");
    link.href = archivo.url;
    link.download = archivo.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========================================
  // FUNCIONES - REPRODUCCIÓN DE AUDIO/VIDEO
  // ========================================

  const reproducirAudio = (idMensaje: number, url: string) => {
    if (reproduciendo === idMensaje) {
      audioPlayersRef.current[idMensaje]?.pause();
      setReproduciendo(null);
    } else {
      // Pausar otros audios
      Object.values(audioPlayersRef.current).forEach((audio) => audio.pause());

      const audio = new Audio(url);
      audioPlayersRef.current[idMensaje] = audio;

      audio.onplay = () => setReproduciendo(idMensaje);
      audio.onpause = () => setReproduciendo(null);
      audio.onended = () => setReproduciendo(null);

      audio.ontimeupdate = () => {
        setTiempoReproduccion((prev) => ({
          ...prev,
          [idMensaje]: audio.currentTime,
        }));
      };

      audio.play().catch(console.error);
    }
  };

  // ========================================
  // FUNCIONES - REACCIONES A MENSAJES
  // ========================================

  const agregarReaccion = async (idMensaje: number, tipo: "like" | "love" | "haha" | "wow" | "sad" | "angry") => {
    try {
      await fetch(`/api/mensajes/${idMensaje}/reaccionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tipo }),
      });

      setMensajes((prev) =>
        prev.map((msg) => {
          if (msg.id_mensaje === idMensaje) {
            const reacciones = msg.metadata?.reacciones || [];
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                reacciones: [
                  ...reacciones,
                  {
                    tipo,
                    usuario_id: usuario?.id_usuario || 0,
                    fecha: new Date().toISOString(),
                  },
                ],
              },
            };
          }
          return msg;
        })
      );

      setMostrarReacciones(null);
    } catch (error) {
      console.error("Error al agregar reacción:", error);
      setErrorCarga("❌ Error al agregar reacción");
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) {
      return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
    } else if (dias === 1) {
      return "Ayer";
    } else if (dias < 7) {
      return date.toLocaleDateString("es-CL", { weekday: "short" });
    } else {
      return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
    }
  };

  const formatearHoraMensaje = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  };

  const formatearTiempoGrabacion = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatearTamanoArchivo = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const obtenerNombreCompleto = (user: Usuario) => {
    return `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ""}`.trim();
  };

  const obtenerIniciales = (user: Usuario) => {
    return `${user.nombre[0]}${user.apellido_paterno[0]}`.toUpperCase();
  };

  const obtenerColorAvatar = (userId: number) => {
    const colores = [
      "from-indigo-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-yellow-500 to-orange-600",
      "from-pink-500 to-rose-600",
      "from-purple-500 to-fuchsia-600",
      "from-cyan-500 to-teal-600",
      "from-orange-500 to-red-600",
    ];
    return colores[userId % colores.length];
  };

  const obtenerIconoEstadoMensaje = (mensaje: Mensaje) => {
    if (mensaje.estado_envio === "fallido") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (mensaje.leido) {
      return <CheckCheck className="w-4 h-4 text-blue-400" />;
    }
    if (mensaje.estado_envio === "entregado") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    }
    if (mensaje.estado_envio === "enviando") {
      return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
    }
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  const cambiarTema = (nuevoTema: keyof typeof TEMAS_CHAT) => {
    setTemaActivo(nuevoTema);
    localStorage.setItem("tema_chat", nuevoTema);
  };

  // ========================================
  // CONVERSACIONES FILTRADAS
  // ========================================

  const conversacionesFiltradas = useMemo(() => {
    let resultado = [...conversaciones];

    if (busqueda) {
      resultado = resultado.filter((conv) => {
        const nombreCompleto = obtenerNombreCompleto(conv.usuario_otro).toLowerCase();
        return nombreCompleto.includes(busqueda.toLowerCase());
      });
    }

    switch (filtroActivo) {
      case "sin_leer":
        resultado = resultado.filter((conv) => conv.mensajes_sin_leer > 0);
        break;
      case "favoritos":
        resultado = resultado.filter((conv) => conv.favorita);
        break;
      case "archivados":
        resultado = resultado.filter((conv) => conv.archivada);
        break;
      default:
        resultado = resultado.filter((conv) => !conv.archivada);
    }

    resultado.sort((a, b) => {
      if (a.fijada && !b.fijada) return -1;
      if (!a.fijada && b.fijada) return 1;
      return (
        new Date(b.fecha_ultimo_mensaje).getTime() - new Date(a.fecha_ultimo_mensaje).getTime()
      );
    });

    return resultado;
  }, [conversaciones, busqueda, filtroActivo]);

  // ========================================
  // USUARIOS DISPONIBLES FILTRADOS
  // ========================================

  const usuariosFiltrados = useMemo(() => {
    if (!busquedaUsuarios) return usuariosDisponibles;

    return usuariosDisponibles.filter((user) => {
      const nombreCompleto = obtenerNombreCompleto(user).toLowerCase();
      const rol = user.rol.nombre.toLowerCase();
      return (
        nombreCompleto.includes(busquedaUsuarios.toLowerCase()) ||
        rol.includes(busquedaUsuarios.toLowerCase())
      );
    });
  }, [usuariosDisponibles, busquedaUsuarios]);

  // ========================================
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative w-24 h-24 mb-6 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <p className={`text-xl font-bold ${tema.colores.texto}`}>Cargando mensajería premium...</p>
          <p className={`text-sm ${tema.colores.textoSecundario} mt-2`}>
            Conectando con el servidor
          </p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${tema.colores.fondo}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className={`text-xl font-bold ${tema.colores.texto}`}>Error al cargar usuario</p>
          <p className={`text-sm ${tema.colores.textoSecundario} mt-2`}>
            Por favor, intenta recargar la página
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - INTERFAZ PRINCIPAL PREMIUM
  // ========================================

  return (
    <div className={`min-h-screen ${tema.colores.fondo} transition-all duration-500 flex flex-col`}>
      {/* Header Premium */}
      <header
        className={`sticky top-0 z-40 ${tema.colores.sidebar} ${tema.colores.borde} border-b shadow-2xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-full">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link
              href="/dashboard"
              className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 flex-shrink-0`}
              title="Volver al dashboard"
            >
              <ArrowLeft className={`w-6 h-6 ${tema.colores.texto}`} />
            </Link>

            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl font-black ${tema.colores.texto} flex items-center gap-2 truncate`}>
                <MessageSquare className="w-7 h-7 flex-shrink-0" />
                <span className="truncate">Mensajería Premium</span>
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 ${conectado ? "bg-green-500" : "bg-red-500"} rounded-full animate-pulse`}></div>
                <p className={`font-semibold ${tema.colores.textoSecundario}`}>
                  {conectado ? "Sistema en línea" : "Sin conexión"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Selector de Temas */}
            <div className="relative group">
              <button
                className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                title="Cambiar tema"
              >
                <Sparkles className={`w-5 h-5 ${tema.colores.texto}`} />
              </button>

              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl ${tema.colores.chat} ${tema.colores.borde} border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-3 space-y-2 z-50`}
              >
                <p className={`text-xs font-black ${tema.colores.textoSecundario} px-2 mb-2`}>
                  TEMAS DISPONIBLES
                </p>
                {Object.entries(TEMAS_CHAT).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => cambiarTema(key as keyof typeof TEMAS_CHAT)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                      temaActivo === key
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <span>{t.nombre}</span>
                    {temaActivo === key && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Notificaciones */}
            <button
              className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 relative`}
              title="Notificaciones"
            >
              <Bell className={`w-5 h-5 ${tema.colores.texto}`} />
              {conversaciones.some((c) => c.mensajes_sin_leer > 0) && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-black rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  {Math.min(
                    conversaciones.reduce((sum, c) => sum + c.mensajes_sin_leer, 0),
                    99
                  )}
                </span>
              )}
            </button>

            {/* Configuración */}
            <Link
              href="/configuracion"
              className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
              title="Configuración"
            >
              <Settings className={`w-5 h-5 ${tema.colores.texto}`} />
            </Link>
          </div>
        </div>
      </header>

      {/* Notificaciones Flotantes */}
      {errorCarga && (
        <div className="fixed top-24 right-6 z-50 animate-fadeIn">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${tema.colores.error} bg-red-500/10 border-2 border-red-500/30 shadow-2xl`}>
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="font-bold">{errorCarga}</p>
            <button
              onClick={() => setErrorCarga(null)}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {notificacionExito && (
        <div className="fixed top-24 right-6 z-50 animate-fadeIn">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${tema.colores.exito} bg-green-500/10 border-2 border-green-500/30 shadow-2xl`}>
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-bold">{notificacionExito}</p>
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - LISTA DE CONVERSACIONES */}
        <aside
          className={`${
            vistaMovil === "lista" || typeof window === "undefined" || window.innerWidth >= 768
              ? "flex"
              : "hidden"
          } md:flex flex-col w-full md:w-96 ${tema.colores.sidebar} ${tema.colores.borde} border-r overflow-hidden`}
        >
          {/* Búsqueda y Filtros */}
          <div className="p-4 space-y-3 border-b border-gray-700/30 flex-shrink-0">
            {/* Búsqueda */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario} pointer-events-none`}
              />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 font-medium`}
              />
            </div>

            {/* Filtros Rápidos */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "todos", label: "Todos", icon: null },
                { id: "sin_leer", label: "Sin leer", icon: null },
                { id: "favoritos", label: "Favoritos", icon: Star },
              ].map((filtro) => (
                <button
                  key={filtro.id}
                  onClick={() => setFiltroActivo(filtro.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    filtroActivo === filtro.id
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                      : `${tema.colores.hover} ${tema.colores.texto}`
                  }`}
                >
                  {filtro.icon && <filtro.icon className="w-4 h-4" />}
                  {filtro.label}
                </button>
              ))}
            </div>

            {/* Botón Nueva Conversación */}
            <button
              onClick={() => setModalNuevaConversacion(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Nueva Conversación
            </button>
          </div>

          {/* Lista de Conversaciones */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversacionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className={`w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse`}>
                  <Inbox className="w-10 h-10 text-white" />
                </div>
                <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>
                  No hay conversaciones
                </p>
                <p className={`text-sm ${tema.colores.textoSecundario}`}>
                  Inicia una nueva conversación para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversacionesFiltradas.map((conversacion) => (
                  <button
                    key={conversacion.id_conversacion}
                    onClick={() => {
                      setConversacionActiva(conversacion);
                      setVistaMovil("chat");
                    }}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all duration-300 group ${
                      conversacionActiva?.id_conversacion === conversacion.id_conversacion
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-l-4 border-indigo-500 shadow-lg"
                        : `${tema.colores.hover}`
                    } ${conversacion.mensajes_sin_leer > 0 ? "font-bold" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${obtenerColorAvatar(
                          conversacion.id_usuario_otro
                        )} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        {conversacion.usuario_otro.foto_perfil_url ? (
                          <Image
                            src={conversacion.usuario_otro.foto_perfil_url}
                            alt={obtenerNombreCompleto(conversacion.usuario_otro)}
                            width={56}
                            height={56}
                            className="rounded-xl object-cover"
                          />
                        ) : (
                          obtenerIniciales(conversacion.usuario_otro)
                        )}
                      </div>
                      {conversacion.usuario_otro.estado_online && (
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${tema.colores.online} rounded-full border-2 ${tema.colores.sidebar} animate-pulse shadow-lg`}
                        ></div>
                      )}
                      {conversacion.fijada && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <Pin className="w-3 h-3 text-gray-900" />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3
                            className={`text-sm font-bold truncate ${tema.colores.texto} ${
                              conversacion.mensajes_sin_leer > 0 ? "font-black" : ""
                            }`}
                          >
                            {obtenerNombreCompleto(conversacion.usuario_otro)}
                          </h3>
                          {conversacion.favorita && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                          )}
                          {conversacion.silenciada && (
                            <BellOff
                              className={`w-4 h-4 ${tema.colores.textoSecundario} flex-shrink-0`}
                            />
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${tema.colores.textoSecundario} flex-shrink-0`}>
                          {formatearFecha(conversacion.fecha_ultimo_mensaje)}
                                                  </span>
                      </div>

                      <p
                        className={`text-xs ${tema.colores.textoSecundario} mb-1 ${
                          conversacion.usuario_otro.profesional
                            ? "font-semibold"
                            : "font-medium"
                        }`}
                      >
                        {conversacion.usuario_otro.profesional
                          ? `${conversacion.usuario_otro.profesional.tipo_profesional} · ${conversacion.usuario_otro.profesional.especialidad}`
                          : conversacion.usuario_otro.rol.nombre}
                      </p>

                      {conversacion.ultimo_mensaje && (
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate flex-1 ${
                              conversacion.mensajes_sin_leer > 0
                                ? `${tema.colores.texto} font-bold`
                                : tema.colores.textoSecundario
                            }`}
                          >
                            {conversacion.ultimo_mensaje.id_usuario_emisor ===
                              usuario.id_usuario && "Tú: "}
                            {conversacion.ultimo_mensaje.tipo_mensaje === "imagen"
                              ? "📷 Imagen"
                              : conversacion.ultimo_mensaje.tipo_mensaje === "archivo"
                              ? "📎 Archivo"
                              : conversacion.ultimo_mensaje.tipo_mensaje === "audio"
                              ? "🎤 Audio"
                              : conversacion.ultimo_mensaje.tipo_mensaje === "video"
                              ? "🎬 Video"
                              : conversacion.ultimo_mensaje.tipo_mensaje === "ubicacion"
                              ? "📍 Ubicación"
                              : conversacion.ultimo_mensaje.contenido}
                          </p>
                          {conversacion.mensajes_sin_leer > 0 && (
                            <span className="ml-2 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-black rounded-full flex-shrink-0 animate-pulse shadow-lg">
                              {conversacion.mensajes_sin_leer > 99
                                ? "99+"
                                : conversacion.mensajes_sin_leer}
                            </span>
                          )}
                        </div>
                      )}

                      {conversacion.escribiendo && (
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full ${tema.colores.escribiendo} bg-opacity-20`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${tema.colores.escribiendo} animate-bounce`}
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className={`w-2 h-2 rounded-full ${tema.colores.escribiendo} animate-bounce`}
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className={`w-2 h-2 rounded-full ${tema.colores.escribiendo} animate-bounce`}
                              style={{ animationDelay: "300ms" }}
                            ></div>
                            <span
                              className={`text-xs font-semibold ml-1 ${tema.colores.textoSecundario}`}
                            >
                              escribiendo...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ÁREA DE CHAT PRINCIPAL */}
        <main
          className={`${
            vistaMovil === "chat" || typeof window === "undefined" || window.innerWidth >= 768
              ? "flex"
              : "hidden"
          } md:flex flex-1 flex-col ${tema.colores.chat} overflow-hidden`}
        >
          {conversacionActiva ? (
            <>
              {/* Header del Chat */}
              <div
                className={`flex items-center justify-between px-6 py-4 ${tema.colores.sidebar} ${tema.colores.borde} border-b shadow-lg flex-shrink-0`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Botón Volver (Móvil) */}
                  <button
                    onClick={() => setVistaMovil("lista")}
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar y Info */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${obtenerColorAvatar(
                        conversacionActiva.id_usuario_otro
                      )} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {conversacionActiva.usuario_otro.foto_perfil_url ? (
                        <Image
                          src={conversacionActiva.usuario_otro.foto_perfil_url}
                          alt={obtenerNombreCompleto(conversacionActiva.usuario_otro)}
                          width={48}
                          height={48}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        obtenerIniciales(conversacionActiva.usuario_otro)
                      )}
                    </div>
                    {conversacionActiva.usuario_otro.estado_online && (
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${tema.colores.online} rounded-full border-2 ${tema.colores.sidebar} animate-pulse shadow-lg`}
                      ></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className={`text-lg font-black ${tema.colores.texto} truncate`}>
                      {obtenerNombreCompleto(conversacionActiva.usuario_otro)}
                    </h2>
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      {conversacionActiva.usuario_otro.estado_online ? (
                        <span className="flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          En línea ahora
                        </span>
                      ) : conversacionActiva.usuario_otro.ultima_conexion ? (
                        `Última vez: ${formatearFecha(
                          conversacionActiva.usuario_otro.ultima_conexion
                        )}`
                      ) : (
                        "Desconectado"
                      )}
                    </p>
                  </div>
                </div>

                {/* Acciones del Header */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => marcarComoFavorita(conversacionActiva.id_conversacion)}
                    className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                    title={
                      conversacionActiva.favorita
                        ? "Quitar de favoritos"
                        : "Agregar a favoritos"
                    }
                  >
                    {conversacionActiva.favorita ? (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className={`w-5 h-5 ${tema.colores.texto}`} />
                    )}
                  </button>

                  <button
                    className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                    title="Llamada de voz"
                  >
                    <Phone className={`w-5 h-5 ${tema.colores.texto}`} />
                  </button>

                  <button
                    className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                    title="Videollamada"
                  >
                    <Video className={`w-5 h-5 ${tema.colores.texto}`} />
                  </button>

                  <button
                    onClick={() => setMostrarInfo(!mostrarInfo)}
                    className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                    title="Información"
                  >
                    <Info className={`w-5 h-5 ${tema.colores.texto}`} />
                  </button>

                  {/* Menú de opciones */}
                  <div className="relative group">
                    <button
                      className={`p-2 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                    >
                      <MoreVertical className={`w-5 h-5 ${tema.colores.texto}`} />
                    </button>

                    <div
                      className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.sidebar} ${tema.colores.borde} border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2 z-50`}
                    >
                      <button
                        onClick={() => fijarConversacion(conversacionActiva.id_conversacion)}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-semibold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                      >
                        <Pin className="w-4 h-4" />
                        {conversacionActiva.fijada ? "Desfijar conversación" : "Fijar conversación"}
                      </button>

                      <button
                        onClick={() => silenciarConversacion(conversacionActiva.id_conversacion)}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-semibold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                      >
                        {conversacionActiva.silenciada ? (
                          <>
                            <Bell className="w-4 h-4" />
                            Activar notificaciones
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4" />
                            Silenciar notificaciones
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => archivarConversacion(conversacionActiva.id_conversacion)}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-semibold ${tema.colores.hover} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                      >
                        <Archive className="w-4 h-4" />
                        Archivar conversación
                      </button>

                      <div className={`my-2 h-px ${tema.colores.borde}`}></div>

                      <button
                        onClick={() => eliminarConversacion(conversacionActiva.id_conversacion)}
                        className="w-full flex items-center gap-3 px-4 py-3 font-semibold hover:bg-red-500/10 text-red-500 transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar conversación
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área de Mensajes */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              >
                {loadingMensajes ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mb-4 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${tema.colores.texto}`}>
                        Cargando mensajes...
                      </p>
                    </div>
                  </div>
                ) : mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse`}>
                      <MessageSquare className="w-12 h-12 text-white" />
                    </div>
                    <p className={`text-2xl font-black ${tema.colores.texto} mb-2`}>
                      Inicia una conversación
                    </p>
                    <p className={`text-sm ${tema.colores.textoSecundario} mb-6`}>
                      Envía el primer mensaje a{" "}
                      {obtenerNombreCompleto(conversacionActiva.usuario_otro)}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setMensajeTexto("Hola, ¿cómo estás?")}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105"
                      >
                        Enviar saludo
                      </button>
                    </div>
                  </div>
                ) : (
                  mensajes.map((mensaje, index) => {
                    const esMensajePropio = mensaje.id_usuario_emisor === usuario.id_usuario;
                    const mostrarAvatar =
                      index === 0 ||
                      mensajes[index - 1].id_usuario_emisor !== mensaje.id_usuario_emisor;
                    const mostrarFecha =
                      index === 0 ||
                      new Date(mensajes[index - 1].fecha_envio).toDateString() !==
                        new Date(mensaje.fecha_envio).toDateString();

                    return (
                      <div key={mensaje.id_mensaje}>
                        {/* Separador de Fecha */}
                        {mostrarFecha && (
                          <div className="flex items-center justify-center my-6">
                            <div
                              className={`px-4 py-2 rounded-full ${tema.colores.sidebar} ${tema.colores.borde} border shadow-lg`}
                            >
                              <p
                                className={`text-xs font-black ${tema.colores.textoSecundario}`}
                              >
                                {new Date(mensaje.fecha_envio).toLocaleDateString("es-CL", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Mensaje */}
                        <div
                          className={`flex items-end gap-3 group ${
                            esMensajePropio ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          {!esMensajePropio && mostrarAvatar && (
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${obtenerColorAvatar(
                                mensaje.id_usuario_emisor
                              )} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}
                            >
                              {mensaje.usuario_emisor?.foto_perfil_url ? (
                                <Image
                                  src={mensaje.usuario_emisor.foto_perfil_url}
                                  alt={obtenerNombreCompleto(mensaje.usuario_emisor)}
                                  width={40}
                                  height={40}
                                  className="rounded-xl object-cover"
                                />
                              ) : mensaje.usuario_emisor ? (
                                obtenerIniciales(mensaje.usuario_emisor)
                              ) : (
                                "?"
                              )}
                            </div>
                          )}

                          {!esMensajePropio && !mostrarAvatar && <div className="w-10"></div>}

                          {/* Contenido del Mensaje */}
                          <div
                            className={`max-w-[70%] ${
                              esMensajePropio
                                ? `${tema.colores.mensajePropio} text-white ml-auto`
                                : `${tema.colores.mensajeOtro} ${tema.colores.texto}`
                            } px-4 py-3 rounded-2xl ${
                              esMensajePropio ? "rounded-br-none" : "rounded-bl-none"
                            } shadow-lg group-hover:shadow-xl transition-all duration-300 relative`}
                          >
                            {/* Mensaje de Respuesta */}
                            {mensaje.mensaje_respuesta && (
                              <div
                                className={`mb-3 p-3 rounded-lg ${
                                  esMensajePropio
                                    ? "bg-white/20 border-l-4 border-white/50"
                                    : "bg-gray-200 dark:bg-gray-700 border-l-4 border-indigo-500"
                                }`}
                              >
                                <p
                                  className={`text-xs font-black mb-1 ${
                                    esMensajePropio
                                      ? "text-white/90"
                                      : "text-indigo-600 dark:text-indigo-400"
                                  }`}
                                >
                                  ↳ {mensaje.mensaje_respuesta.id_usuario_emisor ===
                                  usuario.id_usuario
                                    ? "Tú"
                                    : obtenerNombreCompleto(
                                        conversacionActiva.usuario_otro
                                      ).split(" ")[0]}
                                </p>
                                <p
                                  className={`text-xs line-clamp-2 ${
                                    esMensajePropio
                                      ? "text-white/80"
                                      : tema.colores.textoSecundario
                                  }`}
                                >
                                  {mensaje.mensaje_respuesta.contenido}
                                </p>
                              </div>
                            )}

                            {/* ============================================================ */}
                            {/* CONTENIDO DEL MENSAJE - PREMIUM AVANZADO                    */}
                            {/* ============================================================ */}

                            {/* ===================== ● TEXTO ● ========================== */}
                            {mensaje.tipo_mensaje === "texto" && (
                              <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                                {mensaje.contenido}
                              </p>
                            )}

                            {/* ===================== ● IMAGEN ● ========================= */}
                            {mensaje.tipo_mensaje === "imagen" && (
                              <div className="space-y-2">
                                {mensaje.metadata?.archivos?.map((archivo, idx) => (
                                  <div
                                    key={idx}
                                    className="relative rounded-lg overflow-hidden group/imagen"
                                  >
                                    <Image
                                      src={archivo.url}
                                      alt={archivo.nombre}
                                      width={350}
                                      height={250}
                                      className="rounded-lg object-cover shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
                                      onClick={() => setMostrarDetallesArchivo(archivo)}
                                    />

                                    {/* Overlay con acciones */}
                                    <div className="absolute inset-0 bg-black/0 group-hover/imagen:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover/imagen:opacity-100">
                                      <button
                                        onClick={() => descargarArchivo(archivo)}
                                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-all duration-300 hover:scale-110"
                                        title="Descargar"
                                      >
                                        <DownloadIcon className="w-5 h-5 text-indigo-600" />
                                      </button>
                                      <button
                                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-all duration-300 hover:scale-110"
                                        title="Ver a tamaño completo"
                                      >
                                        <Maximize className="w-5 h-5 text-indigo-600" />
                                      </button>
                                    </div>

                                    {/* Información del archivo */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                      <p className="text-xs text-white font-semibold truncate">
                                        {archivo.nombre}
                                      </p>
                                      <p className="text-xs text-white/80">
                                        {archivo.ancho && archivo.alto
                                          ? `${archivo.ancho}x${archivo.alto}px`
                                          : ""}
                                      </p>
                                    </div>
                                  </div>
                                ))}

                                {mensaje.contenido && (
                                  <p className="text-sm font-medium mt-2">
                                    {mensaje.contenido}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ===================== ● ARCHIVO ● ======================== */}
                            {mensaje.tipo_mensaje === "archivo" && (
                              <div className="space-y-2">
                                {mensaje.metadata?.archivos?.map((archivo, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => descargarArchivo(archivo)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-lg shadow-sm transition-all duration-300 hover:scale-105 ${
                                      esMensajePropio
                                        ? "bg-white/20 hover:bg-white/30"
                                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                    } group/archivo`}
                                  >
                                    <div className="flex-shrink-0">
                                      <FileIcon className="w-6 h-6 text-indigo-500" />
                                    </div>


                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="text-sm font-semibold truncate">
                                        {archivo.nombre}
                                      </p>
                                      <p className="text-xs opacity-70">
                                        {formatearTamanoArchivo(archivo.tamano)}
                                      </p>
                                    </div>

                                    <div className="flex-shrink-0 opacity-0 group-hover/archivo:opacity-100 transition-opacity">
                                      <DownloadIcon className="w-5 h-5" />
                                    </div>
                                  </button>
                                ))}

                                {mensaje.contenido && (
                                  <p className="text-sm font-medium mt-2">
                                    {mensaje.contenido}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ===================== ● AUDIO ● ========================== */}
                            {mensaje.tipo_mensaje === "audio" && (
                              <div className="space-y-2">
                                {mensaje.metadata?.archivos?.map((archivo, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-4 rounded-xl shadow-sm ${
                                      esMensajePropio
                                        ? "bg-white/20"
                                        : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => reproducirAudio(mensaje.id_mensaje, archivo.url)}
                                        className="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                                      >
                                        {reproduciendo === mensaje.id_mensaje ? (
                                          <Pause className="w-5 h-5" />
                                        ) : (
                                          <Play className="w-5 h-5" />
                                        )}
                                      </button>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Mic className="w-3 h-3 opacity-70" />
                                          <span className="text-xs font-semibold opacity-70">
                                            Mensaje de audio
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                              style={{
                                                width: `${
                                                  (tiempoReproduccion[mensaje.id_mensaje] || 0) /
                                                  (archivo.duracion || 1) *
                                                  100
                                                }%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-xs font-semibold opacity-70 whitespace-nowrap">
                                            {formatearTiempoGrabacion(
                                              Math.round(
                                                tiempoReproduccion[mensaje.id_mensaje] || 0
                                              )
                                            )}
                                            {" / "}
                                            {formatearTiempoGrabacion(archivo.duracion || 0)}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => descargarArchivo(archivo)}
                                        className="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                                        title="Descargar audio"
                                      >
                                        <DownloadIcon className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {archivo.nombre && (
                                      <p className="text-xs opacity-70 mt-2 truncate">
                                        📁 {archivo.nombre}
                                      </p>
                                    )}
                                  </div>
                                ))}

                                {mensaje.contenido && (
                                  <p className="text-sm font-medium mt-1">
                                    {mensaje.contenido}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ===================== ● VIDEO ● ========================= */}
                            {mensaje.tipo_mensaje === "video" && (
                              <div className="space-y-2">
                                {mensaje.metadata?.archivos?.map((archivo, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg overflow-hidden shadow-md"
                                  >
                                    <video
                                      controls
                                      className="w-full rounded-lg bg-black"
                                      controlsList="nodownload"
                                    >
                                      <source
                                        src={archivo.url}
                                        type={archivo.tipo || "video/mp4"}
                                      />
                                      Tu navegador no soporta video HTML5.
                                    </video>

                                   {archivo.nombre && (
  <div className="p-2 bg-gray-900/50 text-white">
    <p className="text-xs font-semibold truncate">
      {archivo.nombre}
    </p>
    {archivo.duracion && (
      <p className="text-xs opacity-70">
        ⏱ {formatearTiempoGrabacion(archivo.duracion)}
      </p>
    )}
  </div>
)}

                                  </div>
                                ))}

                                {mensaje.contenido && (
                                  <p className="text-sm font-medium mt-1">
                                    {mensaje.contenido}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ===================== ● UBICACIÓN ● ====================== */}
                            {mensaje.tipo_mensaje === "ubicacion" &&
                              mensaje.metadata?.ubicacion && (
                                <div className="space-y-2">
                                  <div className="rounded-lg overflow-hidden shadow-md">
                                    <iframe
                                      className="w-full h-56 rounded-lg"
                                      loading="lazy"
                                      allowFullScreen
                                      src={`https://www.google.com/maps?q=${mensaje.metadata.ubicacion.lat},${mensaje.metadata.ubicacion.lng}&hl=es&z=16&output=embed`}
                                    ></iframe>
                                  </div>

                                  <div className={`p-3 rounded-lg ${
                                    esMensajePropio
                                      ? "bg-white/20"
                                      : "bg-gray-200 dark:bg-gray-700"
                                  }`}>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold mb-1">
                                          Ubicación compartida
                                        </p>
                                        <p className="text-xs opacity-70 mb-2">
                                          Lat: {mensaje.metadata.ubicacion.lat.toFixed(6)} | Lng:{" "}
                                          {mensaje.metadata.ubicacion.lng.toFixed(6)}
                                        </p>
                                        {mensaje.metadata.ubicacion.nombre_lugar && (
                                          <p className="text-xs opacity-70">
                                            📍 {mensaje.metadata.ubicacion.nombre_lugar}
                                          </p>
                                        )}
                                        {mensaje.metadata.ubicacion.precision && (
                                          <p className="text-xs opacity-70 mt-1">
                                            Precisión: ±{Math.round(
                                              mensaje.metadata.ubicacion.precision
                                            )}m
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {mensaje.contenido && (
                                    <p className="text-sm font-medium mt-1">
                                      {mensaje.contenido}
                                    </p>
                                  )}
                                </div>
                              )}

                            {/* ===================== ● SISTEMA ● ======================== */}
                            {mensaje.tipo_mensaje === "sistema" && (
                              <div className="text-center text-xs opacity-80 italic py-1">
                                <Activity className="w-4 h-4 inline mr-1 opacity-70" />
                                {mensaje.contenido}
                              </div>
                            )}

                            {/* Hora, Estado y Reacciones */}
                            <div className="flex items-center gap-2 justify-between mt-2 pt-2 border-t border-white/10">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-xs font-semibold ${
                                    esMensajePropio
                                      ? "text-white/70"
                                      : tema.colores.textoSecundario
                                  }`}
                                >
                                  {formatearHoraMensaje(mensaje.fecha_envio)}
                                </span>
                                {esMensajePropio && obtenerIconoEstadoMensaje(mensaje)}
                              </div>

                              {mensaje.editado && (
                                <span
                                  className={`text-xs opacity-70 italic ${
                                    esMensajePropio
                                      ? "text-white/70"
                                      : tema.colores.textoSecundario
                                  }`}
                                >
                                  (editado)
                                </span>
                              )}
                            </div>

                            {/* Reacciones */}
                            {mensaje.metadata?.reacciones &&
                              mensaje.metadata.reacciones.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/10">
                                  {mensaje.metadata.reacciones.map((reaccion, idx) => (
                                    <span
                                      key={idx}
                                      className="text-lg hover:scale-125 transition-transform cursor-pointer"
                                      title={`${reaccion.tipo}`}
                                    >
                                      {reaccion.tipo === "like"
                                        ? "👍"
                                        : reaccion.tipo === "love"
                                        ? "❤️"
                                        : reaccion.tipo === "haha"
                                        ? "😂"
                                        : reaccion.tipo === "wow"
                                        ? "😮"
                                        : reaccion.tipo === "sad"
                                        ? "😢"
                                        : "😠"}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {/* Botones de acción (hover) */}
                            <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-gray-900/90 rounded-lg p-1">
                              <button
                                onClick={() => setMensajeRespuesta(mensaje)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Responder"
                              >
                                <Reply className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setMostrarReacciones(mensaje.id_mensaje)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Reaccionar"
                              >
                                <Smile className="w-4 h-4" />
                              </button>

                              {esMensajePropio && (
                                <>
                                  <button
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Editar"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Panel de Reacciones */}
                          {mostrarReacciones === mensaje.id_mensaje && (
                            <div className="absolute -top-12 right-0 bg-gray-900/95 rounded-xl p-2 flex items-center gap-1 shadow-2xl z-50 animate-fadeIn">
                              {[
                                { tipo: "like", emoji: "👍" },
                                { tipo: "love", emoji: "❤️" },
                                { tipo: "haha", emoji: "😂" },
                                { tipo: "wow", emoji: "😮" },
                                { tipo: "sad", emoji: "😢" },
                                { tipo: "angry", emoji: "😠" },
                              ].map((reaccion) => (
                                <button
                                  key={reaccion.tipo}
                                  onClick={() => {
                                    agregarReaccion(
                                      mensaje.id_mensaje,
                                      reaccion.tipo as any
                                    );
                                  }}
                                  className="text-2xl hover:scale-125 transition-transform"
                                >
                                  {reaccion.emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Indicador de "Escribiendo..." */}
                {conversacionActiva.escribiendo && (
                  <div className="flex items-end gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${obtenerColorAvatar(
                        conversacionActiva.id_usuario_otro
                      )} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {conversacionActiva.usuario_otro.foto_perfil_url ? (
                        <Image
                          src={conversacionActiva.usuario_otro.foto_perfil_url}
                          alt={obtenerNombreCompleto(conversacionActiva.usuario_otro)}
                          width={40}
                          height={40}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        obtenerIniciales(conversacionActiva.usuario_otro)
                      )}
                    </div>

                    <div
                      className={`px-4 py-3 rounded-2xl rounded-bl-none ${tema.colores.mensajeOtro} shadow-lg`}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${tema.colores.escribiendo} animate-bounce`}
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${tema.colores.escribiendo} animate-bounce`}
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${tema.colores.escribiendo} animate-bounce`}
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Área de Entrada de Mensajes PREMIUM */}
              <div className={`px-6 py-4 ${tema.colores.sidebar} ${tema.colores.borde} border-t flex-shrink-0`}>
                {/* Mensaje de Respuesta */}
                {mensajeRespuesta && (
                  <div
                    className={`mb-3 p-4 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border flex items-start justify-between animate-fadeIn`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className={`w-4 h-4 ${tema.colores.acento} flex-shrink-0`} />
                        <p className={`text-xs font-black ${tema.colores.acento}`}>
                          Respondiendo a{" "}
                          {mensajeRespuesta.id_usuario_emisor === usuario.id_usuario
                            ? "tu mensaje"
                            : obtenerNombreCompleto(
                                conversacionActiva.usuario_otro
                              ).split(" ")[0]}
                        </p>
                      </div>
                      <p
                        className={`text-sm truncate ${tema.colores.textoSecundario} pl-6 font-medium`}
                      >
                        {mensajeRespuesta.contenido}
                      </p>
                    </div>
                    <button
                      onClick={() => setMensajeRespuesta(null)}
                      className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110 flex-shrink-0`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Ubicación Capturada */}
                {ubicacionActual && (
                  <div
                    className={`mb-3 p-4 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border flex items-start justify-between animate-fadeIn`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className={`w-4 h-4 ${tema.colores.acento} flex-shrink-0`} />
                        <p className={`text-xs font-black ${tema.colores.acento}`}>
                          Ubicación capturada
                        </p>
                      </div>
                      <p
                        className={`text-sm ${tema.colores.textoSecundario} pl-6 font-medium`}
                      >
                        Lat: {ubicacionActual.lat.toFixed(6)} | Lng:{" "}
                        {ubicacionActual.lng.toFixed(6)}
                      </p>
                    </div>
                    <button
                      onClick={() => setUbicacionActual(null)}
                      className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110 flex-shrink-0`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Archivos Adjuntos Preview */}
                {archivosAdjuntos.length > 0 && (
                  <div
                    className={`mb-3 p-4 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border animate-fadeIn`}
                  >
                    <p className={`text-xs font-black ${tema.colores.texto} mb-3`}>
                      📎 Archivos adjuntos ({archivosAdjuntos.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {archivosAdjuntos.map((archivo, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.hover} group relative`}
                        >
                          {archivo.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          ) : archivo.type.startsWith("audio/") ? (
                            <Mic className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          ) : archivo.type.startsWith("video/") ? (
                            <Video className="w-4 h-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <FileIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm font-semibold ${tema.colores.texto} truncate max-w-[150px]`}
                          >
                            {archivo.name}
                          </span>
                          <span className={`text-xs ${tema.colores.textoSecundario}`}>
                            {formatearTamanoArchivo(archivo.size)}
                          </span>
                          <button
                            onClick={() => eliminarArchivo(index)}
                            className="p-1 rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input de Mensaje PREMIUM */}
                <div className="flex items-end gap-3">
                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Adjuntar Archivo */}
                    <button
                      onClick={seleccionarArchivo}
                      className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 relative group`}
                      title="Adjuntar archivo"
                    >
                      <PaperclipIcon className={`w-5 h-5 ${tema.colores.texto}`} />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Archivo (Ctrl+A)
                      </div>
                    </button>

                    {/* Adjuntar Imagen */}
                    <button
                      onClick={seleccionarImagen}
                      className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 relative group`}
                      title="Adjuntar imagen"
                    >
                      <ImageIcon className={`w-5 h-5 ${tema.colores.texto}`} />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Imagen (Ctrl+I)
                      </div>
                    </button>

                    {/* Adjuntar Video */}
                    <button
                      onClick={seleccionarVideo}
                      className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 relative group`}
                      title="Adjuntar video"
                    >
                      <Video className={`w-5 h-5 ${tema.colores.texto}`} />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Video (Ctrl+V)
                      </div>
                    </button>

                    {/* Grabar Audio */}
                    <button
                      onClick={grabandoAudio ? detenerGrabacionAudio : iniciarGrabacionAudio}
                      className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 relative group ${
                        grabandoAudio
                          ? "bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse shadow-lg"
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                      title={grabandoAudio ? "Detener grabación" : "Grabar audio"}
                    >
                      {grabandoAudio ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <MicIcon className="w-5 h-5" />
                      )}
                      {grabandoAudio && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                          ⏱ {formatearTiempoGrabacion(tiempoGrabacion)}
                        </span>
                      )}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {grabandoAudio ? "Grabando..." : "Audio (Ctrl+M)"}
                      </div>
                    </button>

                    {/* Compartir Ubicación */}
                    <button
                      onClick={obtenerUbicacionActual}
                      className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-110 relative group ${
                        ubicacionActual ? "bg-indigo-500/20" : ""
                      }`}
                      title="Compartir ubicación"
                    >
                      <Navigation className={`w-5 h-5 ${tema.colores.texto}`} />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ubicación (Ctrl+L)
                      </div>
                    </button>
                  </div>

                  {/* Textarea de Mensaje */}
                  <div className="flex-1 relative">
                    <textarea
                      value={mensajeTexto}
                      onChange={(e) => {
                        setMensajeTexto(e.target.value);
                        enviarIndicadorEscribiendo();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          enviarMensaje();
                        }
                      }}
                      placeholder="Escribe un mensaje... (Shift+Enter para nueva línea)"
                      rows={1}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none custom-scrollbar max-h-32 font-medium transition-all duration-300`}
                      style={{
                        minHeight: "48px",
                        maxHeight: "128px",
                      }}
                    />
                    <span className={`absolute right-3 bottom-3 text-xs ${tema.colores.textoSecundario}`}>
                      {mensajeTexto.length}/500
                    </span>
                  </div>

                  {/* Botón Enviar */}
                  <button
                    onClick={enviarMensaje}
                    disabled={
                      enviandoMensaje ||
                      (!mensajeTexto.trim() && archivosAdjuntos.length === 0)
                    }
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0 ${
                      mensajeTexto.trim() || archivosAdjuntos.length > 0
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl"
                        : `${tema.colores.hover} ${tema.colores.texto} opacity-50 cursor-not-allowed`
                    }`}
                    title="Enviar mensaje (Enter)"
                  >
                    {enviandoMensaje ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <SendIconAlt className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Input oculto para archivos */}
                <input
                  ref={inputArchivoRef}
                  type="file"
                  multiple
                  accept="application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.pptx"
                  onChange={handleArchivoSeleccionado}
                  className="hidden"
                />
                <input
                  ref={inputImagenRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleArchivoSeleccionado}
                  className="hidden"
                />
                <input
                  ref={inputVideoRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleArchivoSeleccionado}
                  className="hidden"
                />

                {/* Indicador de escritura */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <p className={`${tema.colores.textoSecundario}`}>
                    {grabandoAudio && "🎤 Grabando audio..."}
                    {ubicacionActual && "📍 Ubicación capturada"}
                    {archivosAdjuntos.length > 0 &&
                      `📎 ${archivosAdjuntos.length} archivo(s)`}
                  </p>
                  <p className={`${tema.colores.textoSecundario}`}>
                    Presiona Enter para enviar
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Estado Vacío - Sin Conversación Seleccionada
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div
                className={`w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-pulse`}
              >
                <MessageSquare className="w-16 h-16 text-white" />
              </div>
              <h2 className={`text-3xl font-black ${tema.colores.texto} mb-3`}>
                Mensajería Premium
              </h2>
              <p className={`text-lg ${tema.colores.textoSecundario} mb-8 max-w-md`}>
                Selecciona una conversación o inicia una nueva para comenzar a comunicarte con tu
                equipo
              </p>
              <button
                onClick={() => setModalNuevaConversacion(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl flex items-center gap-3"
              >
                <UserPlus className="w-6 h-6" />
                Iniciar Nueva Conversación
              </button>

              {/* Características */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
                <div
                  className={`p-6 rounded-xl ${tema.colores.sidebar} ${tema.colores.borde} border shadow-lg`}
                >
                  <MessageSquare className={`w-8 h-8 ${tema.colores.acento} mx-auto mb-2`} />
                  <p className={`text-3xl font-black ${tema.colores.texto}`}>
                    {conversaciones.length}
                  </p>
                  <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Conversaciones
                  </p>
                </div>

                <div
                  className={`p-6 rounded-xl ${tema.colores.sidebar} ${tema.colores.borde} border shadow-lg`}
                >
                  <Bell className={`w-8 h-8 ${tema.colores.acento} mx-auto mb-2`} />
                  <p className={`text-3xl font-black ${tema.colores.texto}`}>
                    {conversaciones.reduce((sum, c) => sum + c.mensajes_sin_leer, 0)}
                  </p>
                  <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Sin leer
                  </p>
                </div>

                <div
                  className={`p-6 rounded-xl ${tema.colores.sidebar} ${tema.colores.borde} border shadow-lg`}
                >
                  <Users className={`w-8 h-8 ${tema.colores.acento} mx-auto mb-2`} />
                  <p className={`text-3xl font-black ${tema.colores.texto}`}>
                    {usuariosDisponibles.length}
                  </p>
                  <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Disponibles
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL - NUEVA CONVERSACIÓN PREMIUM */}
      {modalNuevaConversacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-2xl max-h-[80vh] rounded-3xl ${tema.colores.sidebar} ${tema.colores.borde} border shadow-2xl overflow-hidden flex flex-col`}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Nueva Conversación
                </h3>
                <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                  Selecciona un usuario para iniciar
                </p>
              </div>
              <button
                onClick={() => setModalNuevaConversacion(false)}
                className={`p-2 rounded-xl ${tema.colores.hover} transition-colors hover:scale-110`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-6 border-b border-gray-700/30">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, rol o especialidad..."
                  value={busquedaUsuarios}
                  onChange={(e) => setBusquedaUsuarios(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 font-medium`}
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Usuarios */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {usuariosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Users className={`w-16 h-16 ${tema.colores.textoSecundario} mb-4 opacity-50`} />
                  <p className={`text-lg font-bold ${tema.colores.texto}`}>
                    No se encontraron usuarios
                  </p>
                  <p className={`text-sm ${tema.colores.textoSecundario}`}>
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {usuariosFiltrados.map((usuarioDisponible) => (
                    <button
                      key={usuarioDisponible.id_usuario}
                      onClick={() => iniciarNuevaConversacion(usuarioDisponible)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${tema.colores.hover} hover:shadow-lg group`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${obtenerColorAvatar(
                            usuarioDisponible.id_usuario
                          )} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          {usuarioDisponible.foto_perfil_url ? (
                            <Image
                              src={usuarioDisponible.foto_perfil_url}
                              alt={obtenerNombreCompleto(usuarioDisponible)}
                              width={64}
                              height={64}
                              className="rounded-xl object-cover"
                            />
                          ) : (
                            obtenerIniciales(usuarioDisponible)
                          )}
                        </div>
                        {usuarioDisponible.estado_online && (
                          <div
                            className={`absolute -bottom-1 -right-1 w-5 h-5 ${tema.colores.online} rounded-full border-2 ${tema.colores.sidebar} animate-pulse shadow-lg`}
                          ></div>
                        )}
                      </div>

                      {/* Información del Usuario */}
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className={`text-lg font-black ${tema.colores.texto} mb-1`}>
                          {obtenerNombreCompleto(usuarioDisponible)}
                        </h4>

                        <p className={`text-sm font-semibold ${tema.colores.acento} mb-1`}>
                          {usuarioDisponible.profesional
                            ? `${usuarioDisponible.profesional.tipo_profesional} · ${usuarioDisponible.profesional.especialidad}`
                            : usuarioDisponible.rol.nombre}
                        </p>

                        {usuarioDisponible.centro && (
                          <p className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-1`}>
                            <MapPin className="w-3 h-3" />
                            {usuarioDisponible.centro.nombre} - {usuarioDisponible.centro.ciudad}
                          </p>
                        )}

                        <p className={`text-xs ${tema.colores.textoSecundario} mt-1 flex items-center gap-1`}>
                          {usuarioDisponible.estado_online ? (
                            <>
                              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                              En línea
                            </>
                          ) : (
                            <>
                              <Circle className="w-2 h-2 fill-gray-500 text-gray-500" />
                              Desconectado
                            </>
                          )}
                        </p>
                      </div>

                      {/* Flecha */}
                      <ChevronRight
                        className={`w-5 h-5 ${tema.colores.textoSecundario} group-hover:${tema.colores.acento} transition-all duration-300 group-hover:translate-x-1 flex-shrink-0`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className={`p-6 border-t ${tema.colores.borde} flex items-center justify-between`}>
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                {usuariosFiltrados.length} usuario(s) disponible(s)
              </p>
              <button
                onClick={() => setModalNuevaConversacion(false)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.hover} ${tema.colores.texto}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - DETALLES DE ARCHIVO */}
      {mostrarDetallesArchivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-3xl ${tema.colores.sidebar} ${tema.colores.borde} border shadow-2xl overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div>
                <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Detalles del Archivo
                </h3>
              </div>
              <button
                onClick={() => setMostrarDetallesArchivo(null)}
                className={`p-2 rounded-xl ${tema.colores.hover} transition-colors hover:scale-110`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {mostrarDetallesArchivo.tipo.startsWith("image/") && (
                <div className="space-y-6">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={mostrarDetallesArchivo.url}
                      alt={mostrarDetallesArchivo.nombre}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div className={`p-6 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border space-y-4`}>
                    <div>
                      <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                        NOMBRE
                      </p>
                      <p className={`text-lg font-bold ${tema.colores.texto}`}>
                        {mostrarDetallesArchivo.nombre}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          TAMAÑO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {formatearTamanoArchivo(mostrarDetallesArchivo.tamano)}
                        </p>
                      </div>

                      {mostrarDetallesArchivo.ancho && mostrarDetallesArchivo.alto && (
                        <div>
                          <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                            RESOLUCIÓN
                          </p>
                          <p className={`text-lg font-bold ${tema.colores.texto}`}>
                            {mostrarDetallesArchivo.ancho}x{mostrarDetallesArchivo.alto}px
                          </p>
                        </div>
                      )}
                    </div>

                    {mostrarDetallesArchivo.formato && (
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          FORMATO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {mostrarDetallesArchivo.formato.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mostrarDetallesArchivo.tipo.startsWith("audio/") && (
                <div className="space-y-6">
                  <div className={`p-8 rounded-2xl ${tema.colores.chat} flex flex-col items-center justify-center`}>
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                    <p className={`text-xl font-black ${tema.colores.texto} text-center`}>
                      Archivo de Audio
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border space-y-4`}>
                    <div>
                      <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                        NOMBRE
                      </p>
                      <p className={`text-lg font-bold ${tema.colores.texto}`}>
                        {mostrarDetallesArchivo.nombre}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          TAMAÑO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {formatearTamanoArchivo(mostrarDetallesArchivo.tamano)}
                        </p>
                      </div>

                      {mostrarDetallesArchivo.duracion && (
                        <div>
                          <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                            DURACIÓN
                          </p>
                          <p className={`text-lg font-bold ${tema.colores.texto}`}>
                            {formatearTiempoGrabacion(mostrarDetallesArchivo.duracion)}
                          </p>
                        </div>
                      )}
                    </div>

                    {mostrarDetallesArchivo.formato && (
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          FORMATO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {mostrarDetallesArchivo.formato.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => reproducirAudio(0, mostrarDetallesArchivo.url)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                  >
                    <Play className="w-5 h-5" />
                    Reproducir
                  </button>
                </div>
              )}

              {mostrarDetallesArchivo.tipo.startsWith("video/") && (
                <div className="space-y-6">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <video
                      controls
                      className="w-full bg-black"
                      controlsList="nodownload"
                    >
                      <source
                        src={mostrarDetallesArchivo.url}
                        type={mostrarDetallesArchivo.tipo}
                      />
                      Tu navegador no soporta video HTML5.
                    </video>
                  </div>

                  <div className={`p-6 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border space-y-4`}>
                    <div>
                      <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                        NOMBRE
                      </p>
                      <p className={`text-lg font-bold ${tema.colores.texto}`}>
                        {mostrarDetallesArchivo.nombre}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          TAMAÑO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {formatearTamanoArchivo(mostrarDetallesArchivo.tamano)}
                        </p>
                      </div>

                    {mostrarDetallesArchivo.duracion && (
  <div>
    <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
      DURACIÓN
    </p>
    <p className={`text-lg font-bold ${tema.colores.texto}`}>
      {formatearTiempoGrabacion(mostrarDetallesArchivo.duracion)}
    </p>
  </div>
)}

                    </div>

                    {mostrarDetallesArchivo.ancho && mostrarDetallesArchivo.alto && (
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          RESOLUCIÓN
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {mostrarDetallesArchivo.ancho}x{mostrarDetallesArchivo.alto}px
                        </p>
                      </div>
                    )}

                    {mostrarDetallesArchivo.formato && (
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          FORMATO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {mostrarDetallesArchivo.formato.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!mostrarDetallesArchivo.tipo.startsWith("image/") &&
                !mostrarDetallesArchivo.tipo.startsWith("audio/") &&
                !mostrarDetallesArchivo.tipo.startsWith("video/") && (
                  <div className="space-y-6">
                    <div className={`p-8 rounded-2xl ${tema.colores.chat} flex flex-col items-center justify-center`}>
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <FileIcon className="w-12 h-12 text-white" />
                      </div>
                      <p className={`text-xl font-black ${tema.colores.texto} text-center`}>
                        Archivo
                      </p>
                    </div>

                    <div className={`p-6 rounded-xl ${tema.colores.chat} ${tema.colores.borde} border space-y-4`}>
                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          NOMBRE
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto} break-all`}>
                          {mostrarDetallesArchivo.nombre}
                        </p>
                      </div>

                      <div>
                        <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                          TAMAÑO
                        </p>
                        <p className={`text-lg font-bold ${tema.colores.texto}`}>
                          {formatearTamanoArchivo(mostrarDetallesArchivo.tamano)}
                        </p>
                      </div>

                      {mostrarDetallesArchivo.formato && (
                        <div>
                          <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                            FORMATO
                          </p>
                          <p className={`text-lg font-bold ${tema.colores.texto}`}>
                            {mostrarDetallesArchivo.formato.toUpperCase()}
                          </p>
                        </div>
                      )}

                      {mostrarDetallesArchivo.tipo && (
                        <div>
                          <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                            TIPO MIME
                          </p>
                          <p className={`text-sm font-semibold ${tema.colores.texto} font-mono`}>
                            {mostrarDetallesArchivo.tipo}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${tema.colores.borde} flex items-center justify-between gap-3`}>
              <button
                onClick={() => descargarArchivo(mostrarDetallesArchivo)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <DownloadIcon className="w-5 h-5" />
                Descargar
              </button>
              <button
                onClick={() => setMostrarDetallesArchivo(null)}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.hover} ${tema.colores.texto}`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL DE INFORMACIÓN - DETALLES DE CONVERSACIÓN */}
      {mostrarInfo && conversacionActiva && (
        <div
          className={`fixed right-0 top-0 h-screen w-full md:w-96 ${tema.colores.sidebar} ${tema.colores.borde} border-l shadow-2xl z-40 overflow-y-auto custom-scrollbar animate-slideInRight`}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-700/30 bg-gradient-to-b from-indigo-500/10 to-transparent">
            <h3 className={`text-xl font-black ${tema.colores.texto}`}>Información</h3>
            <button
              onClick={() => setMostrarInfo(false)}
              className={`p-2 rounded-xl ${tema.colores.hover} transition-colors hover:scale-110`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Perfil del Usuario */}
            <div className="text-center">
              <div
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${obtenerColorAvatar(
                  conversacionActiva.id_usuario_otro
                )} flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-4`}
              >
                {conversacionActiva.usuario_otro.foto_perfil_url ? (
                  <Image
                    src={conversacionActiva.usuario_otro.foto_perfil_url}
                    alt={obtenerNombreCompleto(conversacionActiva.usuario_otro)}
                    width={96}
                    height={96}
                    className="rounded-2xl object-cover"
                  />
                ) : (
                  obtenerIniciales(conversacionActiva.usuario_otro)
                )}
              </div>

              <h4 className={`text-2xl font-black ${tema.colores.texto} mb-1`}>
                {obtenerNombreCompleto(conversacionActiva.usuario_otro)}
              </h4>

              <p className={`text-sm font-semibold ${tema.colores.acento} mb-2`}>
                {conversacionActiva.usuario_otro.profesional
                  ? `${conversacionActiva.usuario_otro.profesional.tipo_profesional}`
                  : conversacionActiva.usuario_otro.rol.nombre}
              </p>

              {conversacionActiva.usuario_otro.profesional && (
                <p className={`text-xs ${tema.colores.textoSecundario} mb-3`}>
                  {conversacionActiva.usuario_otro.profesional.especialidad}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mb-4">
                <Circle
                  className={`w-3 h-3 ${
                    conversacionActiva.usuario_otro.estado_online
                      ? "fill-green-500 text-green-500"
                      : "fill-gray-500 text-gray-500"
                  }`}
                />
                <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                  {conversacionActiva.usuario_otro.estado_online
                    ? "En línea"
                    : "Desconectado"}
                </span>
              </div>

              {conversacionActiva.usuario_otro.centro && (
                <div
                  className={`p-3 rounded-lg ${tema.colores.chat} ${tema.colores.borde} border`}
                >
                  <p className={`text-xs font-black ${tema.colores.textoSecundario} mb-1`}>
                    CENTRO
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {conversacionActiva.usuario_otro.centro.nombre}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    📍 {conversacionActiva.usuario_otro.centro.ciudad}
                  </p>
                </div>
              )}
            </div>

            {/* Estadísticas de Conversación */}
            <div className="space-y-3">
              <h5 className={`text-sm font-black ${tema.colores.texto} uppercase`}>
                Estadísticas
              </h5>

              <div className={`p-4 rounded-lg ${tema.colores.chat} ${tema.colores.borde} border`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Total de mensajes
                  </p>
                  <p className={`text-2xl font-black ${tema.colores.acento}`}>
                    {mensajes.length}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${tema.colores.chat} ${tema.colores.borde} border`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    Última actividad
                  </p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    {formatearFecha(conversacionActiva.fecha_ultimo_mensaje)}
                  </p>
                </div>
              </div>
            </div>

            {/* Opciones de Conversación */}
            <div className="space-y-3">
              <h5 className={`text-sm font-black ${tema.colores.texto} uppercase`}>
                Opciones
              </h5>

              <button
                onClick={() => marcarComoFavorita(conversacionActiva.id_conversacion)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  conversacionActiva.favorita
                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                    : `${tema.colores.hover} ${tema.colores.texto}`
                }`}
              >
                {conversacionActiva.favorita ? (
                  <Star className="w-5 h-5 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5" />
                )}
                {conversacionActiva.favorita
                  ? "Quitar de favoritos"
                  : "Agregar a favoritos"}
              </button>

              <button
                onClick={() => silenciarConversacion(conversacionActiva.id_conversacion)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  conversacionActiva.silenciada
                    ? "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                    : `${tema.colores.hover} ${tema.colores.texto}`
                }`}
              >
                {conversacionActiva.silenciada ? (
                  <Bell className="w-5 h-5" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
                {conversacionActiva.silenciada
                  ? "Activar notificaciones"
                  : "Silenciar notificaciones"}
              </button>

              <button
                onClick={() => fijarConversacion(conversacionActiva.id_conversacion)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  conversacionActiva.fijada
                    ? "bg-purple-500/20 text-purple-500 border border-purple-500/30"
                    : `${tema.colores.hover} ${tema.colores.texto}`
                }`}
              >
                <Pin className="w-5 h-5" />
                {conversacionActiva.fijada ? "Desfijar" : "Fijar conversación"}
              </button>

              <button
                onClick={() => archivarConversacion(conversacionActiva.id_conversacion)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto}`}
              >
                <Archive className="w-5 h-5" />
                Archivar conversación
              </button>

              <button
                onClick={() => eliminarConversacion(conversacionActiva.id_conversacion)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-red-500/20 text-red-500"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar conversación
              </button>
            </div>

            {/* Acciones Rápidas */}
            <div className="space-y-3">
              <h5 className={`text-sm font-black ${tema.colores.texto} uppercase`}>
                Acciones Rápidas
              </h5>

              <button className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}>
                <Phone className="w-5 h-5" />
                Llamada de voz
              </button>

              <button className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${tema.colores.hover} ${tema.colores.texto} hover:scale-105`}>
                <Video className="w-5 h-5" />
                Videollamada
              </button>
            </div>

            {/* Información Técnica */}
            <div className="space-y-3 pt-6 border-t border-gray-700/30">
              <h5 className={`text-sm font-black ${tema.colores.texto} uppercase`}>
                Información Técnica
              </h5>

              <div className={`p-4 rounded-lg ${tema.colores.chat} ${tema.colores.borde} border space-y-2 text-xs`}>
                <div className="flex items-center justify-between">
                  <span className={tema.colores.textoSecundario}>ID Conversación:</span>
                  <span className={`${tema.colores.texto} font-mono font-bold`}>
                    {conversacionActiva.id_conversacion.substring(0, 12)}...
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={tema.colores.textoSecundario}>ID Usuario:</span>
                  <span className={`${tema.colores.texto} font-mono font-bold`}>
                    {conversacionActiva.id_usuario_otro}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={tema.colores.textoSecundario}>Mensajes:</span>
                  <span className={`${tema.colores.texto} font-mono font-bold`}>
                    {mensajes.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar panel de información */}
      {mostrarInfo && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setMostrarInfo(false)}
        ></div>
      )}

      {/* CSS Personalizado */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}                       
