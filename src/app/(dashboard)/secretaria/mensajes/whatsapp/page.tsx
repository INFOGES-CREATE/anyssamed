"use client";

 

import { useState, useEffect, useMemo, useRef } from "react";

import {

  MessageSquare,

  Send,

  Search,

  Phone,

  Video,

  MoreVertical,

  Paperclip,

  Smile,

  Clock,

  Check,

  CheckCheck,

  AlertCircle,

  Calendar,

  User,

  Filter,

  ArrowLeft,

  X,

  Image as ImageIcon,

  FileText,

  Download,

  Star,

  Archive,

  Trash2,

  Settings,

  Users,

  TrendingUp,

  Bell,

  ChevronDown,

  ChevronRight,

  Plus,

  Copy,

  Edit,

  Zap,

  MessageCircle,

  UserPlus,

  RefreshCw,

  Loader2,

  Circle,

  Mic,

  MapPin,

  Link as LinkIcon,

  Hash,

  AtSign,

  Sparkles,

  Sun,

  Moon,

  Heart,

  ThumbsUp,

  Inbox,

  Send as SendIcon,

  CheckCircle2,

  XCircle,

  Info,

  Stethoscope,

  CalendarCheck,

  PhoneCall,

} from "lucide-react";

import Link from "next/link";

import Image from "next/image";

 

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

  rol: {

    id_rol: number;

    nombre: string;

    nivel_jerarquia: number;

  };

  secretaria?: {

    id_secretaria: number;

    id_centro: number;

    centro: {

      id_centro: number;

      nombre: string;

      logo_url: string | null;

    };

  };

}

 

interface Conversacion {

  id_conversacion: number;

  paciente: {

    id_paciente: number;

    nombre_completo: string;

    foto_url: string | null;

    telefono: string;

    whatsapp: string;

    email: string | null;

  };

  ultimo_mensaje: {

    contenido: string;

    fecha_hora: string;

    enviado_por_secretaria: boolean;

    leido: boolean;

    tipo: "texto" | "imagen" | "documento" | "audio" | "plantilla";

  };

  mensajes_sin_leer: number;

  estado: "activa" | "archivada" | "bloqueada";

  etiquetas: string[];

  prioridad: "normal" | "alta" | "urgente";

  tiene_cita_pendiente: boolean;

  proxima_cita: string | null;

}

 

interface Mensaje {

  id_mensaje: number;

  id_conversacion: number;

  contenido: string;

  fecha_hora: string;

  enviado_por_secretaria: boolean;

  leido: boolean;

  entregado: boolean;

  tipo: "texto" | "imagen" | "documento" | "audio" | "plantilla";

  archivo_url: string | null;

  archivo_nombre: string | null;

  metadata: {

    cita_id?: number;

    plantilla_id?: number;

    [key: string]: any;

  } | null;

}

 

interface PlantillaMensaje {

  id_plantilla: number;

  nombre: string;

  contenido: string;

  categoria: "cita" | "recordatorio" | "confirmacion" | "resultado" | "general";

  variables: string[];

  uso_frecuente: boolean;

  veces_usada: number;

}

 

interface EstadisticasWhatsApp {

  mensajes_enviados_hoy: number;

  mensajes_recibidos_hoy: number;

  conversaciones_activas: number;

  tasa_respuesta: number;

  tiempo_promedio_respuesta: number;

  plantillas_mas_usadas: PlantillaMensaje[];

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

    icono: MessageCircle,

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

    icono: Heart,

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

// DATOS DE EJEMPLO

// ========================================

 

const conversacionesEjemplo: Conversacion[] = [

  {

    id_conversacion: 1,

    paciente: {

      id_paciente: 1,

      nombre_completo: "María González",

      foto_url: null,

      telefono: "+56912345678",

      whatsapp: "+56912345678",

      email: "maria@example.com",

    },

    ultimo_mensaje: {

      contenido: "Perfecto, nos vemos mañana a las 10:00. ¡Muchas gracias!",

      fecha_hora: new Date().toISOString(),

      enviado_por_secretaria: false,

      leido: true,

      tipo: "texto",

    },

    mensajes_sin_leer: 0,

    estado: "activa",

    etiquetas: ["cita-confirmada"],

    prioridad: "normal",

    tiene_cita_pendiente: true,

    proxima_cita: new Date(Date.now() + 86400000).toISOString(),

  },

  {

    id_conversacion: 2,

    paciente: {

      id_paciente: 2,

      nombre_completo: "Juan Pérez",

      foto_url: null,

      telefono: "+56987654321",

      whatsapp: "+56987654321",

      email: null,

    },

    ultimo_mensaje: {

      contenido: "Buenos días, quería consultar por una hora para endodoncia",

      fecha_hora: new Date(Date.now() - 3600000).toISOString(),

      enviado_por_secretaria: false,

      leido: false,

      tipo: "texto",

    },

    mensajes_sin_leer: 2,

    estado: "activa",

    etiquetas: ["nuevo-paciente"],

    prioridad: "alta",

    tiene_cita_pendiente: false,

    proxima_cita: null,

  },

];

 

const plantillasEjemplo: PlantillaMensaje[] = [

  {

    id_plantilla: 1,

    nombre: "Recordatorio de Cita",

    contenido:

      "Hola {{nombre}}, te recordamos tu cita con {{medico}} el día {{fecha}} a las {{hora}}. Por favor confirma tu asistencia. ¡Te esperamos!",

    categoria: "recordatorio",

    variables: ["nombre", "medico", "fecha", "hora"],

    uso_frecuente: true,

    veces_usada: 245,

  },

  {

    id_plantilla: 2,

    nombre: "Confirmación de Cita",

    contenido:

      "¡Perfecto {{nombre}}! Tu cita ha sido confirmada para el {{fecha}} a las {{hora}}. Si necesitas reagendar, avísanos con anticipación.",

    categoria: "confirmacion",

    variables: ["nombre", "fecha", "hora"],

    uso_frecuente: true,

    veces_usada: 189,

  },

  {

    id_plantilla: 3,

    nombre: "Saludo Inicial",

    contenido:

      "Hola {{nombre}}, soy {{secretaria}} del Centro Médico {{centro}}. ¿En qué puedo ayudarte hoy?",

    categoria: "general",

    variables: ["nombre", "secretaria", "centro"],

    uso_frecuente: true,

    veces_usada: 156,

  },

  {

    id_plantilla: 4,

    nombre: "Resultados Disponibles",

    contenido:

      "Hola {{nombre}}, te informamos que tus resultados ya están disponibles. Puedes pasar a retirarlos en horario de {{horario}} o solicitar envío digital.",

    categoria: "resultado",

    variables: ["nombre", "horario"],

    uso_frecuente: false,

    veces_usada: 78,

  },

];

 

// ========================================

// COMPONENTE PRINCIPAL

// ========================================

 

export default function WhatsAppMessagingPage() {

  // ========================================

  // ESTADOS

  // ========================================

 

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadingConversaciones, setLoadingConversaciones] = useState(false);

 

  const [conversaciones, setConversaciones] =

    useState<Conversacion[]>(conversacionesEjemplo);

  const [conversacionActiva, setConversacionActiva] =

    useState<Conversacion | null>(null);

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  const [plantillas, setPlantillas] = useState<PlantillaMensaje[]>(plantillasEjemplo);

  const [estadisticas, setEstadisticas] = useState<EstadisticasWhatsApp | null>(

    null

  );

 

  const [busqueda, setBusqueda] = useState("");

  const [mensajeTexto, setMensajeTexto] = useState("");

  const [filtroEstado, setFiltroEstado] = useState<

    "todas" | "activas" | "archivadas"

  >("activas");

  const [filtroPrioridad, setFiltroPrioridad] = useState<

    "todas" | "normal" | "alta" | "urgente"

  >("todas");

  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);

  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  const [temaActual, setTemaActual] = useState<TemaColor>("green");

 

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);

 

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

    if (usuario?.secretaria) {

      cargarConversaciones();

      cargarEstadisticas();

    }

  }, [usuario]);

 

  useEffect(() => {

    if (conversacionActiva) {

      cargarMensajes(conversacionActiva.id_conversacion);

    }

  }, [conversacionActiva]);

 

  useEffect(() => {

    scrollToBottom();

  }, [mensajes]);

 

  useEffect(() => {

    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;

  }, [tema]);

 

  useEffect(() => {

    const cargarPreferenciaTema = async () => {

      try {

        const res = await fetch("/api/users/preferencias/tema", {

          method: "GET",

          credentials: "include",

        });

        const data = await res.json();

        if (data.success && data.tema_color) {

          setTemaActual(data.tema_color);

        }

      } catch (e) {

        console.error("No se pudo cargar la preferencia de tema:", e);

      }

    };

 

    cargarPreferenciaTema();

  }, []);

 

  // Auto-refresh cada 10 segundos

  useEffect(() => {

    const interval = setInterval(() => {

      if (usuario?.secretaria) {

        cargarConversaciones();

        if (conversacionActiva) {

          cargarMensajes(conversacionActiva.id_conversacion);

        }

      }

    }, 10000);

 

    return () => clearInterval(interval);

  }, [usuario, conversacionActiva]);

 

  // ========================================

  // FUNCIONES DE CARGA DE DATOS

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

        setUsuario(result.usuario);

      } else {

        window.location.href = "/login";

      }

    } catch (error) {

      console.error("Error al cargar usuario:", error);

      window.location.href = "/login";

    } finally {

      setLoading(false);

    }

  };

 

  const cargarConversaciones = async () => {

    if (!usuario?.secretaria?.id_secretaria) return;

 

    try {

      setLoadingConversaciones(true);

 

      const res = await fetch(

        `/api/secretaria/whatsapp/conversaciones?id_secretaria=${usuario.secretaria.id_secretaria}`,

        {

          method: "GET",

          headers: { "Content-Type": "application/json" },

          credentials: "include",

        }

      );

 

      const data = await res.json().catch(() => ({}));

 

      if (res.ok && data.success) {

        setConversaciones(data.conversaciones || conversacionesEjemplo);

      }

    } catch (err) {

      console.error("Error al cargar conversaciones:", err);

    } finally {

      setLoadingConversaciones(false);

    }

  };

 

  const cargarMensajes = async (idConversacion: number) => {

    try {

      const res = await fetch(

        `/api/secretaria/whatsapp/mensajes?id_conversacion=${idConversacion}`,

        {

          method: "GET",

          headers: { "Content-Type": "application/json" },

          credentials: "include",

        }

      );

 

      const data = await res.json().catch(() => ({}));

 

      if (res.ok && data.success) {

        setMensajes(data.mensajes || []);

      }

    } catch (err) {

      console.error("Error al cargar mensajes:", err);

    }

  };

 

  const cargarEstadisticas = async () => {

    if (!usuario?.secretaria?.id_secretaria) return;

 

    try {

      const res = await fetch(

        `/api/secretaria/whatsapp/estadisticas?id_secretaria=${usuario.secretaria.id_secretaria}`,

        {

          method: "GET",

          headers: { "Content-Type": "application/json" },

          credentials: "include",

        }

      );

 

      const data = await res.json().catch(() => ({}));

 

      if (res.ok && data.success) {

        setEstadisticas(data.estadisticas);

      }

    } catch (err) {

      console.error("Error al cargar estadísticas:", err);

    }

  };

 

  // ========================================

  // FUNCIONES DE ACCIONES

  // ========================================

 

  const enviarMensaje = async () => {

    if (!mensajeTexto.trim() || !conversacionActiva || enviandoMensaje) return;

 

    try {

      setEnviandoMensaje(true);

 

      const nuevoMensaje: Mensaje = {

        id_mensaje: Date.now(),

        id_conversacion: conversacionActiva.id_conversacion,

        contenido: mensajeTexto,

        fecha_hora: new Date().toISOString(),

        enviado_por_secretaria: true,

        leido: false,

        entregado: false,

        tipo: "texto",

        archivo_url: null,

        archivo_nombre: null,

        metadata: null,

      };

 

      setMensajes((prev) => [...prev, nuevoMensaje]);

      setMensajeTexto("");

 

      const res = await fetch("/api/secretaria/whatsapp/enviar", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({

          id_conversacion: conversacionActiva.id_conversacion,

          contenido: mensajeTexto,

          tipo: "texto",

        }),

      });

 

      if (!res.ok) {

        alert("Error al enviar mensaje");

        setMensajes((prev) =>

          prev.filter((m) => m.id_mensaje !== nuevoMensaje.id_mensaje)

        );

      } else {

        cargarConversaciones();

      }

    } catch (error) {

      console.error("Error al enviar mensaje:", error);

      alert("Error al enviar mensaje");

    } finally {

      setEnviandoMensaje(false);

    }

  };

 

  const usarPlantilla = (plantilla: PlantillaMensaje) => {

    let contenido = plantilla.contenido;

 

    if (conversacionActiva) {

      contenido = contenido.replace(

        /{{nombre}}/g,

        conversacionActiva.paciente.nombre_completo

      );

      contenido = contenido.replace(

        /{{secretaria}}/g,

        `${usuario?.nombre} ${usuario?.apellido_paterno}`

      );

      contenido = contenido.replace(

        /{{centro}}/g,

        usuario?.secretaria?.centro.nombre || ""

      );

    }

 

    setMensajeTexto(contenido);

    setMostrarPlantillas(false);

  };

 

  const marcarComoLeido = async (idConversacion: number) => {

    try {

      await fetch(`/api/secretaria/whatsapp/marcar-leido`, {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ id_conversacion: idConversacion }),

      });

 

      setConversaciones((prev) =>

        prev.map((conv) =>

          conv.id_conversacion === idConversacion

            ? { ...conv, mensajes_sin_leer: 0 }

            : conv

        )

      );

    } catch (error) {

      console.error("Error al marcar como leído:", error);

    }

  };

 

  const archivarConversacion = async (idConversacion: number) => {

    try {

      await fetch(`/api/secretaria/whatsapp/archivar`, {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ id_conversacion: idConversacion }),

      });

 

      cargarConversaciones();

      if (conversacionActiva?.id_conversacion === idConversacion) {

        setConversacionActiva(null);

      }

    } catch (error) {

      console.error("Error al archivar conversación:", error);

    }

  };

 

  const scrollToBottom = () => {

    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  };

 

  const cambiarTema = async (nuevoTema: TemaColor) => {

    setTemaActual(nuevoTema);

    if (typeof window !== "undefined") {

      localStorage.setItem("tema_secretaria", nuevoTema);

    }

 

    try {

      await fetch("/api/users/preferencias/tema", {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        credentials: "include",

        body: JSON.stringify({ tema_color: nuevoTema }),

      });

    } catch (err) {

      console.error("No se pudo guardar preferencia en BD:", err);

    }

  };

 

  // ========================================

  // FUNCIONES AUXILIARES

  // ========================================

 

  const formatearFecha = (fecha: string) => {

    const date = new Date(fecha);

    const ahora = new Date();

    const diff = ahora.getTime() - date.getTime();

    const minutos = Math.floor(diff / 60000);

    const horas = Math.floor(diff / 3600000);

    const dias = Math.floor(diff / 86400000);

 

    if (minutos < 1) return "Ahora";

    if (minutos < 60) return `Hace ${minutos} min`;

    if (horas < 24) return `Hace ${horas}h`;

    if (dias < 7) return `Hace ${dias}d`;

 

    return new Intl.DateTimeFormat("es-CL", {

      day: "2-digit",

      month: "short",

    }).format(date);

  };

 

  const formatearHora = (fecha: string) => {

    const date = new Date(fecha);

    return new Intl.DateTimeFormat("es-CL", {

      hour: "2-digit",

      minute: "2-digit",

    }).format(date);

  };

 

  const obtenerIniciales = (nombre: string) => {

    return nombre

      .split(" ")

      .map((n) => n[0])

      .join("")

      .substring(0, 2)

      .toUpperCase();

  };

 

  const conversacionesFiltradas = useMemo(() => {

    return conversaciones.filter((conv) => {

      const matchBusqueda =

        busqueda === "" ||

        conv.paciente.nombre_completo

          .toLowerCase()

          .includes(busqueda.toLowerCase()) ||

        conv.paciente.telefono.includes(busqueda);

 

      const matchEstado =

        filtroEstado === "todas" ||

        (filtroEstado === "activas" && conv.estado === "activa") ||

        (filtroEstado === "archivadas" && conv.estado === "archivada");

 

      const matchPrioridad =

        filtroPrioridad === "todas" || conv.prioridad === filtroPrioridad;

 

      return matchBusqueda && matchEstado && matchPrioridad;

    });

  }, [conversaciones, busqueda, filtroEstado, filtroPrioridad]);

 

  // ========================================

  // RENDER - LOADING

  // ========================================

 

  if (loading) {

    return (

      <div

        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}

      >

        <div className="text-center">

          <div className="relative mb-8">

            <div className="w-32 h-32 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>

            <div

              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}

            >

              <MessageSquare className="w-10 h-10 text-white" />

            </div>

          </div>

          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>

            Cargando WhatsApp

          </h2>

          <p

            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}

          >

            Preparando tus conversaciones...

          </p>

        </div>

      </div>

    );

  }

 

  // ========================================

  // RENDER - INTERFAZ PRINCIPAL

  // ========================================

 

  return (

    <div

      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}

    >

      {/* ========================================

          HEADER

          ======================================== */}

      <header

        className={`sticky top-0 z-40 ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}

      >

        <div className="flex items-center justify-between px-8 py-4">

          <div className="flex items-center gap-4">

            <Link

              href="/secretaria"

              className={`p-3 rounded-xl ${tema.colores.hover} transition-all duration-300 hover:scale-105`}

            >

              <ArrowLeft className={`w-5 h-5 ${tema.colores.texto}`} />

            </Link>

 

            <div className="flex items-center gap-3">

              <div

                className={`w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg`}

              >

                <MessageSquare className="w-7 h-7 text-white" />

              </div>

              <div>

                <h1 className={`text-2xl font-black ${tema.colores.texto}`}>

                  WhatsApp Business

                </h1>

                <p

                  className={`text-sm font-semibold ${tema.colores.textoSecundario}`}

                >

                  {conversaciones.filter((c) => c.mensajes_sin_leer > 0).length}{" "}

                  conversaciones sin leer

                </p>

              </div>

            </div>

          </div>

 

          <div className="flex items-center gap-3">

            {/* Selector de Temas */}

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

 

            <button

              onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}

              className={`p-3 rounded-xl font-semibold transition-all duration-300 ${

                mostrarEstadisticas

                  ? `${tema.colores.primario} text-white`

                  : `${tema.colores.secundario} ${tema.colores.texto}`

              }`}

            >

              <TrendingUp className="w-5 h-5" />

            </button>

 

            <button

              onClick={cargarConversaciones}

              className={`p-3 rounded-xl font-semibold transition-all duration-300 ${tema.colores.secundario} ${tema.colores.texto} ${

                loadingConversaciones ? "animate-spin" : ""

              }`}

            >

              <RefreshCw className="w-5 h-5" />

            </button>

          </div>

        </div>

 

        {/* Estadísticas desplegables */}

        {mostrarEstadisticas && estadisticas && (

          <div

            className={`px-8 pb-4 border-t ${tema.colores.borde} grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4 pt-4`}

          >

            <div

              className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}

            >

              <div className="flex items-center gap-2 mb-2">

                <SendIcon className="w-4 h-4 text-blue-400" />

                <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>

                  Enviados Hoy

                </span>

              </div>

              <p className={`text-2xl font-black ${tema.colores.texto}`}>

                {estadisticas.mensajes_enviados_hoy}

              </p>

            </div>

 

            <div

              className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}

            >

              <div className="flex items-center gap-2 mb-2">

                <Inbox className="w-4 h-4 text-green-400" />

                <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>

                  Recibidos Hoy

                </span>

              </div>

              <p className={`text-2xl font-black ${tema.colores.texto}`}>

                {estadisticas.mensajes_recibidos_hoy}

              </p>

            </div>

 

            <div

              className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}

            >

              <div className="flex items-center gap-2 mb-2">

                <MessageCircle className="w-4 h-4 text-purple-400" />

                <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>

                  Conversaciones

                </span>

              </div>

              <p className={`text-2xl font-black ${tema.colores.texto}`}>

                {estadisticas.conversaciones_activas}

              </p>

            </div>

 

            <div

              className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}

            >

              <div className="flex items-center gap-2 mb-2">

                <TrendingUp className="w-4 h-4 text-orange-400" />

                <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>

                  Tasa Respuesta

                </span>

              </div>

              <p className={`text-2xl font-black ${tema.colores.texto}`}>

                {estadisticas.tasa_respuesta}%

              </p>

            </div>

 

            <div

              className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}

            >

              <div className="flex items-center gap-2 mb-2">

                <Clock className="w-4 h-4 text-cyan-400" />

                <span className={`text-xs font-bold ${tema.colores.textoSecundario}`}>

                  T. Respuesta

                </span>

              </div>

              <p className={`text-2xl font-black ${tema.colores.texto}`}>

                {estadisticas.tiempo_promedio_respuesta}m

              </p>

            </div>

          </div>

        )}

      </header>

 

      {/* ========================================

          CONTENIDO PRINCIPAL - LAYOUT DE CHAT

          ======================================== */}

      <div className="flex h-[calc(100vh-140px)]">

        {/* ========================================

            SIDEBAR - LISTA DE CONVERSACIONES

            ======================================== */}

        <aside

          className={`w-96 ${tema.colores.card} ${tema.colores.borde} border-r flex flex-col`}

        >

          {/* Búsqueda y Filtros */}

          <div className="p-4 border-b border-gray-700/50">

            <div className="relative mb-3">

              <Search

                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}

              />

              <input

                type="text"

                placeholder="Buscar paciente..."

                value={busqueda}

                onChange={(e) => setBusqueda(e.target.value)}

                className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300`}

              />

            </div>

 

            <div className="flex items-center gap-2">

              <select

                value={filtroEstado}

                onChange={(e) =>

                  setFiltroEstado(

                    e.target.value as "todas" | "activas" | "archivadas"

                  )

                }

                className={`flex-1 px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}

              >

                <option value="todas">Todas</option>

                <option value="activas">Activas</option>

                <option value="archivadas">Archivadas</option>

              </select>

 

              <select

                value={filtroPrioridad}

                onChange={(e) =>

                  setFiltroPrioridad(

                    e.target.value as "todas" | "normal" | "alta" | "urgente"

                  )

                }

                className={`flex-1 px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} text-sm font-semibold`}

              >

                <option value="todas">Todas</option>

                <option value="normal">Normal</option>

                <option value="alta">Alta</option>

                <option value="urgente">Urgente</option>

              </select>

            </div>

          </div>

 

          {/* Lista de Conversaciones */}

          <div className="flex-1 overflow-y-auto custom-scrollbar">

            {conversacionesFiltradas.length === 0 ? (

              <div className="text-center py-16 px-4">

                <MessageSquare

                  className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario}`}

                />

                <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>

                  No hay conversaciones

                </p>

                <p className={`text-sm ${tema.colores.textoSecundario}`}>

                  Las conversaciones aparecerán aquí

                </p>

              </div>

            ) : (

              conversacionesFiltradas.map((conv) => (

                <div

                  key={conv.id_conversacion}

                  onClick={() => {

                    setConversacionActiva(conv);

                    if (conv.mensajes_sin_leer > 0) {

                      marcarComoLeido(conv.id_conversacion);

                    }

                  }}

                  className={`p-4 border-b border-gray-700/50 cursor-pointer transition-all duration-300 ${

                    conversacionActiva?.id_conversacion === conv.id_conversacion

                      ? `bg-green-500/10 border-l-4 border-l-green-500`

                      : tema.colores.hover

                  }`}

                >

                  <div className="flex items-start gap-3">

                    <div className="relative">

                      <div

                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-lg shadow-lg`}

                      >

                        {conv.paciente.foto_url ? (

                          <Image

                            src={conv.paciente.foto_url}

                            alt={conv.paciente.nombre_completo}

                            width={56}

                            height={56}

                            className="rounded-full object-cover"

                          />

                        ) : (

                          obtenerIniciales(conv.paciente.nombre_completo)

                        )}

                      </div>

                      {conv.mensajes_sin_leer > 0 && (

                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">

                          {conv.mensajes_sin_leer > 9

                            ? "9+"

                            : conv.mensajes_sin_leer}

                        </div>

                      )}

                      {conv.prioridad === "urgente" && (

                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">

                          <AlertCircle className="w-3 h-3 text-white" />

                        </div>

                      )}

                    </div>

 

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between mb-1">

                        <h4

                          className={`font-black ${tema.colores.texto} text-sm truncate`}

                        >

                          {conv.paciente.nombre_completo}

                        </h4>

                        <span

                          className={`text-xs font-medium ${tema.colores.textoSecundario} flex-shrink-0 ml-2`}

                        >

                          {formatearFecha(conv.ultimo_mensaje.fecha_hora)}

                        </span>

                      </div>

 

                      <p

                        className={`text-sm mb-2 truncate ${

                          conv.mensajes_sin_leer > 0

                            ? `${tema.colores.texto} font-bold`

                            : tema.colores.textoSecundario

                        }`}

                      >

                        {conv.ultimo_mensaje.enviado_por_secretaria && (

                          <span className="mr-1">

                            {conv.ultimo_mensaje.leido ? (

                              <CheckCheck className="w-4 h-4 text-blue-400 inline" />

                            ) : (

                              <Check className="w-4 h-4 text-gray-400 inline" />

                            )}

                          </span>

                        )}

                        {conv.ultimo_mensaje.contenido}

                      </p>

 

                      <div className="flex items-center gap-2 flex-wrap">

                        {conv.tiene_cita_pendiente && (

                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1">

                            <Calendar className="w-3 h-3" />

                            Cita pendiente

                          </span>

                        )}

                        {conv.etiquetas.map((etiqueta, idx) => (

                          <span

                            key={idx}

                            className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold"

                          >

                            {etiqueta}

                          </span>

                        ))}

                      </div>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </aside>

 

        {/* ========================================

            ÁREA DE CHAT PRINCIPAL

            ======================================== */}

        <main className="flex-1 flex flex-col">

          {!conversacionActiva ? (

            <div

              className={`flex-1 flex items-center justify-center ${tema.colores.card}`}

            >

              <div className="text-center">

                <div

                  className={`w-32 h-32 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}

                >

                  <MessageSquare className="w-16 h-16 text-white" />

                </div>

                <h3 className={`text-3xl font-black mb-3 ${tema.colores.texto}`}>

                  Selecciona una conversación

                </h3>

                <p className={`text-lg ${tema.colores.textoSecundario}`}>

                  Elige un paciente para comenzar a chatear

                </p>

              </div>

            </div>

          ) : (

            <>

              {/* Header del Chat */}

              <div

                className={`px-6 py-4 border-b ${tema.colores.borde} ${tema.colores.card} flex items-center justify-between`}

              >

                <div className="flex items-center gap-4">

                  <div

                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}

                  >

                    {conversacionActiva.paciente.foto_url ? (

                      <Image

                        src={conversacionActiva.paciente.foto_url}

                        alt={conversacionActiva.paciente.nombre_completo}

                        width={48}

                        height={48}

                        className="rounded-full object-cover"

                      />

                    ) : (

                      obtenerIniciales(

                        conversacionActiva.paciente.nombre_completo

                      )

                    )}

                  </div>

 

                  <div>

                    <h3

                      className={`text-xl font-black ${tema.colores.texto} mb-1`}

                    >

                      {conversacionActiva.paciente.nombre_completo}

                    </h3>

                    <div className="flex items-center gap-3">

                      <a

                        href={`tel:${conversacionActiva.paciente.telefono}`}

                        className={`text-sm font-medium ${tema.colores.acento} flex items-center gap-1 hover:underline`}

                      >

                        <Phone className="w-3 h-3" />

                        {conversacionActiva.paciente.telefono}

                      </a>

                      {conversacionActiva.tiene_cita_pendiente && (

                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1">

                          <Calendar className="w-3 h-3" />

                          Cita:{" "}

                          {formatearFecha(conversacionActiva.proxima_cita || "")}

                        </span>

                      )}

                    </div>

                  </div>

                </div>

 

                <div className="flex items-center gap-2">

                  <Link

                    href={`/secretaria/pacientes/${conversacionActiva.paciente.id_paciente}`}

                    className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}

                  >

                    <User className="w-5 h-5" />

                  </Link>

 

                  <button

                    onClick={() =>

                      archivarConversacion(conversacionActiva.id_conversacion)

                    }

                    className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}

                  >

                    <Archive className="w-5 h-5" />

                  </button>

 

                  <button

                    className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}

                  >

                    <MoreVertical className="w-5 h-5" />

                  </button>

                </div>

              </div>

 

              {/* Área de Mensajes */}

              <div

                className={`flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar ${tema.colores.fondoSecundario}`}

              >

                {mensajes.length === 0 ? (

                  <div className="text-center py-16">

                    <MessageCircle

                      className={`w-16 h-16 mx-auto mb-4 ${tema.colores.textoSecundario}`}

                    />

                    <p className={`text-lg font-bold ${tema.colores.texto} mb-2`}>

                      Sin mensajes aún

                    </p>

                    <p className={`text-sm ${tema.colores.textoSecundario}`}>

                      Envía el primer mensaje para iniciar la conversación

                    </p>

                  </div>

                ) : (

                  mensajes.map((mensaje) => (

                    <div

                      key={mensaje.id_mensaje}

                      className={`flex ${

                        mensaje.enviado_por_secretaria

                          ? "justify-end"

                          : "justify-start"

                      }`}

                    >

                      <div

                        className={`max-w-md px-4 py-3 rounded-2xl ${

                          mensaje.enviado_por_secretaria

                            ? "bg-green-600 text-white rounded-br-none"

                            : `${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} rounded-bl-none`

                        } shadow-lg`}

                      >

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">

                          {mensaje.contenido}

                        </p>

 

                        <div className="flex items-center justify-end gap-2 mt-2">

                          <span

                            className={`text-xs ${

                              mensaje.enviado_por_secretaria

                                ? "text-green-100"

                                : tema.colores.textoSecundario

                            }`}

                          >

                            {formatearHora(mensaje.fecha_hora)}

                          </span>

                          {mensaje.enviado_por_secretaria && (

                            <>

                              {mensaje.leido ? (

                                <CheckCheck className="w-4 h-4 text-blue-300" />

                              ) : mensaje.entregado ? (

                                <CheckCheck className="w-4 h-4 text-gray-300" />

                              ) : (

                                <Check className="w-4 h-4 text-gray-300" />

                              )}

                            </>

                          )}

                        </div>

                      </div>

                    </div>

                  ))

                )}

                <div ref={mensajesEndRef} />

              </div>

 

              {/* Input de Mensaje */}

              <div className={`p-4 border-t ${tema.colores.borde} ${tema.colores.card}`}>

                {mostrarPlantillas && (

                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">

                    <div className="flex items-center justify-between mb-3">

                      <h4

                        className={`text-lg font-black ${tema.colores.texto} flex items-center gap-2`}

                      >

                        <Zap className="w-5 h-5 text-purple-400" />

                        Plantillas Rápidas

                      </h4>

                      <button

                        onClick={() => setMostrarPlantillas(false)}

                        className={`p-2 rounded-lg ${tema.colores.hover}`}

                      >

                        <X className="w-5 h-5" />

                      </button>

                    </div>

 

                    <div className="grid grid-cols-2 gap-3">

                      {plantillas.map((plantilla) => (

                        <button

                          key={plantilla.id_plantilla}

                          onClick={() => usarPlantilla(plantilla)}

                          className={`p-4 rounded-xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 text-left group`}

                        >

                          <div className="flex items-start justify-between mb-2">

                            <h5

                              className={`font-bold ${tema.colores.texto} text-sm`}

                            >

                              {plantilla.nombre}

                            </h5>

                            <span className="text-xs text-purple-400 font-bold">

                              {plantilla.veces_usada} usos

                            </span>

                          </div>

                          <p

                            className={`text-xs ${tema.colores.textoSecundario} line-clamp-2`}

                          >

                            {plantilla.contenido}

                          </p>

                        </button>

                      ))}

                    </div>

                  </div>

                )}

 

                <div className="flex items-end gap-3">

                  <button

                    onClick={() => setMostrarPlantillas(!mostrarPlantillas)}

                    className={`p-3 rounded-xl ${

                      mostrarPlantillas

                        ? "bg-purple-600 text-white"

                        : `${tema.colores.secundario} ${tema.colores.texto}`

                    } transition-all duration-300 hover:scale-105`}

                  >

                    <Zap className="w-5 h-5" />

                  </button>

 

                  <button

                    onClick={() => inputFileRef.current?.click()}

                    className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}

                  >

                    <Paperclip className="w-5 h-5" />

                  </button>

                  <input

                    ref={inputFileRef}

                    type="file"

                    className="hidden"

                    accept="image/*,application/pdf"

                  />

 

                  <textarea

                    value={mensajeTexto}

                    onChange={(e) => setMensajeTexto(e.target.value)}

                    onKeyDown={(e) => {

                      if (e.key === "Enter" && !e.shiftKey) {

                        e.preventDefault();

                        enviarMensaje();

                      }

                    }}

                    placeholder="Escribe un mensaje..."

                    rows={1}

                    className={`flex-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none`}

                  />

 

                  <button

                    onClick={enviarMensaje}

                    disabled={!mensajeTexto.trim() || enviandoMensaje}

                    className={`p-3 rounded-xl transition-all duration-300 ${

                      mensajeTexto.trim() && !enviandoMensaje

                        ? "bg-green-600 hover:bg-green-700 text-white hover:scale-105 shadow-lg"

                        : "bg-gray-600 text-gray-400 cursor-not-allowed"

                    }`}

                  >

                    {enviandoMensaje ? (

                      <Loader2 className="w-5 h-5 animate-spin" />

                    ) : (

                      <Send className="w-5 h-5" />

                    )}

                  </button>

                </div>

 

                <p className={`text-xs ${tema.colores.textoSecundario} mt-2 text-center`}>

                  Presiona Enter para enviar, Shift + Enter para nueva línea

                </p>

              </div>

            </>

          )}

        </main>

      </div>

 

      {/* ========================================

          ESTILOS PERSONALIZADOS

          ======================================== */}

      <style jsx global>{`

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

            ? "rgba(16, 185, 129, 0.5)"

            : "rgba(16, 185, 129, 0.7)"};

          border-radius: 10px;

        }

 

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {

          background: ${["dark", "blue", "purple", "green"].includes(

            temaActual

          )

            ? "rgba(16, 185, 129, 0.7)"

            : "rgba(16, 185, 129, 0.9)"};

        }

 

        .line-clamp-2 {

          display: -webkit-box;

          -webkit-line-clamp: 2;

          -webkit-box-orient: vertical;

          overflow: hidden;

        }

      `}</style>

    </div>

  );

}