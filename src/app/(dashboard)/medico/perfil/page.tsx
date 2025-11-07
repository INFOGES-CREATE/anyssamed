// app/(dashboard)/medico/perfil/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, Award, Star, Camera, Edit, Save, X, Check, AlertCircle,
  Upload, Download, Trash2, Plus, Minus, Eye, EyeOff, Lock, Unlock, Shield, ShieldCheck, FileText,
  Image as ImageIcon, Loader2, RefreshCw, Settings, Bell, BellOff, Globe, Clock, TrendingUp, Activity,
  Heart, Stethoscope, GraduationCap, Building2, Users, MessageSquare, Video, Zap, Target, Sparkles,
  Sun, Moon, Wifi, HeartPulse, ChevronRight, ChevronDown, MoreVertical, Copy, Share2, ExternalLink,
  Info, HelpCircle, CheckCircle2, XCircle, AlertTriangle, Home, LogOut, ArrowLeft, Search, Filter,
  SlidersHorizontal, Maximize2, Minimize2, RotateCcw, Crop, ZoomIn, ZoomOut, Move, Scissors, Palette,
  Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Link2, Code, Hash, AtSign,
  DollarSign, Percent, Languages, Smartphone, Tablet, Monitor, Facebook, Twitter, Instagram, Linkedin,
  Youtube, Github, Printer, Send, Paperclip, Mic, MicOff, Volume2, VolumeX, PlayCircle, PauseCircle,
  StopCircle, SkipForward, SkipBack, Repeat, Shuffle, Radio, Podcast, Music, Film, Tv, Clapperboard,
  Headphones, Speaker, Airplay, Cast, Bluetooth, Wifi as WifiIcon, WifiOff, Signal, SignalHigh,
  SignalLow, SignalMedium, SignalZero, Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium,
  BatteryWarning, Power, PowerOff, Plug, PlugZap, Zap as ZapIcon, Flame, Droplet, Wind, CloudRain,
  CloudSnow, CloudLightning, CloudFog, CloudDrizzle, Sunrise, Sunset, Moon as MoonIcon, Sun as SunIcon,
  Stars, Star as StarIcon, Sparkle, Sparkles as SparklesIcon, TrendingDown, BarChart3, PieChart,
  LineChart, Package, CreditCard, Wallet, Receipt, FileCheck, FilePlus, FolderOpen, Archive, Bookmark,
  Tag, Layers, Grid, Layout, Columns, Rows, Square, Circle, Triangle, Hexagon, Pentagon, Octagon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Cropper, { type Point, type Area } from "react-easy-crop";
import { Trophy, UserPlus, Key } from "lucide-react";


// ========================================
// TIPOS DE DATOS EXTENDIDOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green" | "sunset" | "ocean" | "forest";
type SeccionPerfil =
  | "informacion"
  | "especialidades"
  | "credenciales"
  | "disponibilidad"
  | "configuracion"
  | "seguridad"
  | "notificaciones"
  | "privacidad"
  | "facturacion"
  | "estadisticas"
  | "documentos"
  | "certificaciones"
  | "experiencia"
  | "publicaciones"
  | "premios";

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
    success: string;
    warning: string;
    error: string;
    info: string;
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
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  autenticacion_doble_factor?: boolean;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_medico: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    universidad: string;
    ano_graduacion: number;
    anos_experiencia: number;
    biografia: string | null;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
      anos_experiencia: number | null;
      certificado_url: string | null;
      fecha_certificacion: string | null;
      institucion_certificadora: string | null;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
      direccion: string;
      telefono_principal: string;
      email_contacto: string;
      sitio_web: string | null;
    };
    calificacion_promedio: number;
    numero_opiniones: number;
    acepta_nuevos_pacientes: boolean;
    atiende_particular: boolean;
    atiende_fonasa: boolean;
    atiende_isapre: boolean;
    consulta_presencial: boolean;
    consulta_telemedicina: boolean;
    duracion_consulta_min: number;
    firma_digital: boolean;
    firma_digital_url: string | null;
    estado: string;
  };
}

interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  area_medica: string | null;
  icono_url: string | null;
  color: string;
}

interface Credencial {
  id_credencial: number;
  tipo_credencial: string;
  numero_credencial: string;
  entidad_emisora: string;
  fecha_emision: string;
  fecha_expiracion: string | null;
  documento_url: string | null;
  estado: string;
  observaciones: string | null;
}

interface DisponibilidadHoraria {
  id_disponibilidad: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_atencion: string;
  max_pacientes: number | null;
  estado: string;
}

interface EstadisticasPerfil {
  total_consultas: number;
  pacientes_atendidos: number;
  calificacion_promedio: number;
  total_resenas: number;
  tasa_asistencia: number;
  tiempo_promedio_consulta: number;
  especialidad_mas_demandada: string;
  ingresos_mes_actual: number;
  citas_proximas: number;
  pacientes_nuevos_mes: number;
  consultas_mes_actual: number;
  consultas_mes_anterior: number;
  crecimiento_mensual: number;
  satisfaccion_pacientes: number;
}

interface ConfiguracionNotificaciones {
  email_citas_nuevas: boolean;
  email_citas_canceladas: boolean;
  email_recordatorios: boolean;
  email_mensajes_pacientes: boolean;
  push_citas_nuevas: boolean;
  push_citas_canceladas: boolean;
  push_recordatorios: boolean;
  push_mensajes_pacientes: boolean;
  sms_recordatorios: boolean;
  sms_confirmaciones: boolean;
  whatsapp_recordatorios: boolean;
  whatsapp_confirmaciones: boolean;
}

interface ConfiguracionPrivacidad {
  mostrar_foto_perfil: boolean;
  mostrar_biografia: boolean;
  mostrar_especialidades: boolean;
  mostrar_calificaciones: boolean;
  mostrar_anos_experiencia: boolean;
  permitir_reserva_online: boolean;
  permitir_telemedicina: boolean;
  compartir_disponibilidad: boolean;
  aceptar_nuevos_pacientes: boolean;
}

interface DatosEdicion {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  ciudad: string;
  region: string;
  fecha_nacimiento: string;
  genero: string;
  biografia: string;
  titulo_profesional: string;
  universidad: string;
  ano_graduacion: number;
  numero_registro_medico: string;
  duracion_consulta_min: number;
  atiende_particular: boolean;
  atiende_fonasa: boolean;
  atiende_isapre: boolean;
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;
}

// ========================================
// CONFIGURACIONES DE TEMAS PREMIUM
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro Profesional",
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
      success: "bg-green-500/20 border-green-500/30 text-green-600",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-600",
      error: "bg-red-500/20 border-red-500/30 text-red-600",
      info: "bg-blue-500/20 border-blue-500/30 text-blue-600",
    },
  },
  dark: {
    nombre: "Oscuro Elegante",
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
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
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
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
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
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-purple-500/20 border-purple-500/30 text-purple-400",
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
      success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    },
  },
  sunset: {
    nombre: "Atardecer Cálido",
    icono: Sunset,
    colores: {
      fondo: "from-orange-950 via-red-950 to-pink-950",
      fondoSecundario: "bg-orange-900",
      texto: "text-white",
      textoSecundario: "text-orange-300",
      primario: "bg-orange-600 hover:bg-orange-700",
      secundario: "bg-red-800 hover:bg-red-700",
      acento: "text-orange-400",
      borde: "border-orange-800",
      sombra: "shadow-2xl shadow-orange-500/20",
      gradiente: "from-orange-500 via-red-500 to-pink-500",
      sidebar: "bg-orange-900/95 backdrop-blur-xl border-orange-800",
      header: "bg-orange-900/80 backdrop-blur-xl border-orange-800",
      card: "bg-orange-800/50 border-orange-700 hover:border-orange-500/50",
      hover: "hover:bg-orange-800",
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-orange-500/20 border-orange-500/30 text-orange-400",
    },
  },
  ocean: {
    nombre: "Océano Profundo",
    icono: Droplet,
    colores: {
      fondo: "from-blue-950 via-indigo-950 to-violet-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-blue-300",
      primario: "bg-blue-600 hover:bg-blue-700",
      secundario: "bg-indigo-800 hover:bg-indigo-700",
      acento: "text-blue-400",
      borde: "border-blue-800",
      sombra: "shadow-2xl shadow-blue-500/20",
      gradiente: "from-blue-500 via-indigo-500 to-violet-500",
      sidebar: "bg-blue-900/95 backdrop-blur-xl border-blue-800",
      header: "bg-blue-900/80 backdrop-blur-xl border-blue-800",
      card: "bg-blue-800/50 border-blue-700 hover:border-blue-500/50",
      hover: "hover:bg-blue-800",
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    },
  },
  forest: {
    nombre: "Bosque Místico",
    icono: Wind,
    colores: {
      fondo: "from-green-950 via-lime-950 to-emerald-950",
      fondoSecundario: "bg-green-900",
      texto: "text-white",
      textoSecundario: "text-green-300",
      primario: "bg-green-600 hover:bg-green-700",
      secundario: "bg-lime-800 hover:bg-lime-700",
      acento: "text-green-400",
      borde: "border-green-800",
      sombra: "shadow-2xl shadow-green-500/20",
      gradiente: "from-green-500 via-lime-500 to-emerald-500",
      sidebar: "bg-green-900/95 backdrop-blur-xl border-green-800",
      header: "bg-green-900/80 backdrop-blur-xl border-green-800",
      card: "bg-green-800/50 border-green-700 hover:border-green-500/50",
      hover: "hover:bg-green-800",
      success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-lime-500/20 border-lime-500/30 text-lime-400",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function PerfilMedicoPremiumPage() {
  // Estados principales
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [seccionActiva, setSeccionActiva] = useState<SeccionPerfil>("informacion");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilCompacto, setPerfilCompacto] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  // Datos del perfil
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadHoraria[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPerfil | null>(null);
  const [configuracionNotificaciones, setConfiguracionNotificaciones] =
    useState<ConfiguracionNotificaciones>({
      email_citas_nuevas: true,
      email_citas_canceladas: true,
      email_recordatorios: true,
      email_mensajes_pacientes: true,
      push_citas_nuevas: true,
      push_citas_canceladas: true,
      push_recordatorios: true,
      push_mensajes_pacientes: true,
      sms_recordatorios: false,
      sms_confirmaciones: false,
      whatsapp_recordatorios: true,
      whatsapp_confirmaciones: true,
    });
  const [configuracionPrivacidad, setConfiguracionPrivacidad] =
    useState<ConfiguracionPrivacidad>({
      mostrar_foto_perfil: true,
      mostrar_biografia: true,
      mostrar_especialidades: true,
      mostrar_calificaciones: true,
      mostrar_anos_experiencia: true,
      permitir_reserva_online: true,
      permitir_telemedicina: true,
      compartir_disponibilidad: true,
      aceptar_nuevos_pacientes: true,
    });

  // Edición de datos
  const [datosEdicion, setDatosEdicion] = useState<DatosEdicion | null>(null);

  // Foto de perfil
  const [modalFoto, setModalFoto] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // Modales
  const [modalEspecialidad, setModalEspecialidad] = useState(false);
  const [modalCredencial, setModalCredencial] = useState(false);
  const [modalDisponibilidad, setModalDisponibilidad] = useState(false);
  const [modalCambiarPassword, setModalCambiarPassword] = useState(false);
  const [modalEliminarCuenta, setModalEliminarCuenta] = useState(false);
  const [modalExportarDatos, setModalExportarDatos] = useState(false);
  const [modalCompartirPerfil, setModalCompartirPerfil] = useState(false);

  // Mensajes y notificaciones
  const [mensaje, setMensaje] = useState<{
    tipo: "success" | "error" | "warning" | "info";
    texto: string;
  } | null>(null);

  // Búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null);

  // Animaciones y efectos
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // ========================================
  // TEMA ACTUAL
  // ========================================

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
    cargarTemaGuardado();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosPerfil();
    }
  }, [usuario]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => {
        setMensaje(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // ========================================
  // FUNCIONES DE CARGA
  // ========================================

  const cargarTemaGuardado = () => {
    const temaGuardado = localStorage.getItem("tema_medico_premium");
    if (temaGuardado && temaGuardado in TEMAS) {
      setTemaActual(temaGuardado as TemaColor);
    }
  };

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("No hay sesión activa");

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

        if (Array.isArray(result.usuario.roles)) {
          result.usuario.roles.forEach((r: any) => {
            if (r?.nombre) {
              rolesUsuario.push(
                r.nombre
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .trim()
                  .toUpperCase()
              );
            }
          });
        }

        const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));

        if (!tieneRolMedico || !result.usuario.medico) {
          alert("Acceso denegado. Este panel es solo para médicos.");
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
        inicializarDatosEdicion(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión. Serás redirigido al login.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosPerfil = async () => {
    if (!usuario?.medico?.id_medico) return;

    try {
      setLoadingData(true);
      const res = await fetch(
        `/api/medico/perfil?id_medico=${usuario.medico.id_medico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        setEspecialidades(data.especialidades || []);
        setCredenciales(data.credenciales || []);
        setDisponibilidad(data.disponibilidad || []);
        setEstadisticas(data.estadisticas || null);
        if (data.configuracion_notificaciones) {
          setConfiguracionNotificaciones(data.configuracion_notificaciones);
        }
        if (data.configuracion_privacidad) {
          setConfiguracionPrivacidad(data.configuracion_privacidad);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos del perfil:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const inicializarDatosEdicion = (usr: UsuarioSesion) => {
    setDatosEdicion({
      nombre: usr.nombre,
      apellido_paterno: usr.apellido_paterno,
      apellido_materno: usr.apellido_materno || "",
      email: usr.email,
      telefono: usr.telefono || "",
      celular: usr.celular || "",
      direccion: usr.direccion || "",
      ciudad: usr.ciudad || "",
      region: usr.region || "",
      fecha_nacimiento: usr.fecha_nacimiento || "",
      genero: usr.genero || "",
      biografia: usr.medico?.biografia || "",
      titulo_profesional: usr.medico?.titulo_profesional || "",
      universidad: usr.medico?.universidad || "",
      ano_graduacion: usr.medico?.ano_graduacion || new Date().getFullYear(),
      numero_registro_medico: usr.medico?.numero_registro_medico || "",
      duracion_consulta_min: usr.medico?.duracion_consulta_min || 30,
      atiende_particular: usr.medico?.atiende_particular || false,
      atiende_fonasa: usr.medico?.atiende_fonasa || false,
      atiende_isapre: usr.medico?.atiende_isapre || false,
      consulta_presencial: usr.medico?.consulta_presencial || false,
      consulta_telemedicina: usr.medico?.consulta_telemedicina || false,
    });
  };

  // ========================================
  // FUNCIONES DE ACCIONES
  // ========================================

  const guardarCambios = async () => {
    if (!datosEdicion || !usuario) return;

    try {
      setGuardando(true);
      const response = await fetch("/api/medico/perfil/actualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_medico: usuario.medico?.id_medico,
          ...datosEdicion,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMensaje({
          tipo: "success",
          texto: "✅ Perfil actualizado correctamente",
        });
        setModoEdicion(false);
        await cargarDatosUsuario();
        await cargarDatosPerfil();
      } else {
        setMensaje({
          tipo: "error",
          texto: `❌ Error: ${result.message || "No se pudo actualizar"}`,
        });
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setMensaje({
        tipo: "error",
        texto: "❌ Error al guardar los cambios",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    if (usuario) {
      inicializarDatosEdicion(usuario);
    }
    setModoEdicion(false);
  };

  const cambiarTema = (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    localStorage.setItem("tema_medico_premium", nuevoTema);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMensaje({
          tipo: "error",
          texto: "❌ La imagen no debe superar 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagenSeleccionada(reader.result as string);
        setModalFoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const subirFotoPerfil = async () => {
    if (!imagenSeleccionada || !croppedAreaPixels || !usuario) return;

    try {
      setSubiendoFoto(true);
      const image = new window.Image();
      image.src = imagenSeleccionada;
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("foto", blob, "perfil.jpg");
        formData.append("id_usuario", usuario.id_usuario.toString());

        const response = await fetch("/api/medico/perfil/foto", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setMensaje({
            tipo: "success",
            texto: "✅ Foto de perfil actualizada",
          });
          setModalFoto(false);
          setImagenSeleccionada(null);
          await cargarDatosUsuario();
        } else {
          setMensaje({
            tipo: "error",
            texto: `❌ Error: ${result.message}`,
          });
        }
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Error al subir foto:", error);
      setMensaje({
        tipo: "error",
        texto: "❌ Error al subir la foto",
      });
    } finally {
      setSubiendoFoto(false);
    }
  };

  const eliminarFotoPerfil = async () => {
    if (!usuario) return;
    if (!confirm("¿Estás seguro de eliminar tu foto de perfil?")) return;

    try {
      const response = await fetch("/api/medico/perfil/foto", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id_usuario: usuario.id_usuario }),
      });

      const result = await response.json();

      if (result.success) {
        setMensaje({
          tipo: "success",
          texto: "✅ Foto de perfil eliminada",
        });
        await cargarDatosUsuario();
      } else {
        setMensaje({
          tipo: "error",
          texto: `❌ Error: ${result.message}`,
        });
      }
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      setMensaje({
        tipo: "error",
        texto: "❌ Error al eliminar la foto",
      });
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

  const exportarDatos = async () => {
    try {
      const response = await fetch("/api/medico/perfil/exportar", {
        method: "GET",
        credentials: "include",
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `perfil-medico-${usuario?.id_usuario}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMensaje({
        tipo: "success",
        texto: "✅ Datos exportados correctamente",
      });
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: "❌ Error al exportar datos",
      });
    }
  };

  const compartirPerfil = async () => {
    const url = `${window.location.origin}/medico/${usuario?.medico?.id_medico}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dr. ${usuario?.nombre} ${usuario?.apellido_paterno}`,
          text: `Conoce el perfil profesional del Dr. ${usuario?.nombre} ${usuario?.apellido_paterno}`,
          url: url,
        });
        setMensaje({
          tipo: "success",
          texto: "✅ Perfil compartido correctamente",
        });
      } catch (error) {
        console.log("Error al compartir:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      setMensaje({
        tipo: "success",
        texto: "✅ Enlace copiado al portapapeles",
      });
    }
  };

  // ========================================
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center`}
            >
              <Stethoscope className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <motion.h2
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-4xl font-black mb-4 ${tema.colores.texto}`}
          >
            Cargando Perfil Premium
          </motion.h2>
          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className={`text-lg font-semibold ${tema.colores.textoSecundario}`}
          >
            Preparando tu experiencia profesional...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6`}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder a este perfil premium
          </p>
          <Link
            href="/login"
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
          >
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // ========================================
  // RENDER - PERFIL PREMIUM COMPLETO
  // ========================================

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}>
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br ${tema.colores.gradiente} opacity-5 blur-3xl`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl ${tema.colores.gradiente} opacity-5 blur-3xl`}
        />
      </div>

      {/* SIDEBAR PREMIUM */}
      <AnimatePresence>
        {sidebarAbierto && (
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className={`fixed left-0 top-0 h-full z-50 w-20 ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
          >
            <div className="flex flex-col h-full items-center py-6 gap-4">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href="/medico"
                  className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Stethoscope className="w-6 h-6 text-white" />
                </Link>
              </motion.div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Navegación */}
              <div className="flex-1 flex flex-col gap-2 w-full px-2">
                {[
                  { href: "/medico", icon: Home, label: "Inicio" },
                  { href: "/medico/agenda", icon: Calendar, label: "Agenda" },
                  { href: "/medico/pacientes", icon: Users, label: "Pacientes" },
                  { href: "/medico/perfil", icon: User, label: "Perfil", active: true },
                  { href: "/medico/estadisticas", icon: BarChart3, label: "Estadísticas" },
                  { href: "/medico/configuracion", icon: Settings, label: "Configuración" },
                ].map((item) => (
                  <motion.div key={item.href} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={item.href}
                      className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 group relative ${
                        item.active
                          ? `bg-gradient-to-r ${tema.colores.gradiente} shadow-lg`
                          : tema.colores.hover
                      }`}
                    >
                      <item.icon
                        className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                          item.active ? "text-white" : tema.colores.texto
                        }`}
                      />
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

              {/* Cerrar sesión */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={cerrarSesion}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-red-500/20 group"
              >
                <LogOut className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-20" : "ml-0"
        } p-4 md:p-8 relative z-10`}
      >
        {/* HEADER PREMIUM CON ANIMACIONES */}
        <motion.div
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="mb-8"
        >
          <div className={`rounded-3xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Información del médico */}
              <div className="flex items-center gap-6 flex-1">
                {/* Foto de perfil con animación */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group cursor-pointer"
                  onClick={() => inputFileRef.current?.click()}
                >
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-3xl shadow-xl overflow-hidden ring-4 ring-white/10`}>
                    {usuario.foto_perfil_url ? (
                      <Image
                        src={usuario.foto_perfil_url}
                        alt={usuario.nombre}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </motion.div>
                  {/* Indicador de estado online */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"
                  />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className={`text-3xl md:text-4xl font-black ${tema.colores.texto}`}>
                      Dr. {usuario.nombre} {usuario.apellido_paterno}
                    </h1>
                    {usuario.medico.firma_digital && (
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {usuario.medico.especialidades
                      .filter((e) => e.es_principal)
                      .map((esp) => (
                        <motion.span
                          key={esp.id_especialidad}
                          whileHover={{ scale: 1.05 }}
                          className={`px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${tema.colores.gradiente} text-white shadow-lg`}
                        >
                          {esp.nombre}
                        </motion.span>
                      ))}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tema.colores.info} border`}>
                      {usuario.medico.anos_experiencia} años de experiencia
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className={`flex items-center gap-2 ${tema.colores.textoSecundario}`}>
                      <Building2 className="w-4 h-4" />
                      <span className="font-semibold">
                        {usuario.medico.centro_principal.nombre}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 ${tema.colores.textoSecundario}`}>
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">
                        {usuario.medico.centro_principal.ciudad}
                      </span>
                    </div>
                    {usuario.medico.calificacion_promedio > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(usuario.medico!.calificacion_promedio)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-yellow-400">
                          {usuario.medico.calificacion_promedio.toFixed(1)}
                        </span>
                        <span className={`text-xs ${tema.colores.textoSecundario}`}>
                          ({usuario.medico.numero_opiniones} reseñas)
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex flex-wrap items-center gap-3">
                {!modoEdicion ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setModoEdicion(true)}
                      className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 ${tema.colores.sombra}`}
                    >
                      <Edit className="w-5 h-5" />
                      Editar Perfil
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={compartirPerfil}
                      className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      <Share2 className="w-5 h-5" />
                      Compartir
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, rotate: 180 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setModalExportarDatos(true)}
                      className={`p-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelarEdicion}
                      disabled={guardando}
                      className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      <X className="w-5 h-5" />
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={guardarCambios}
                      disabled={guardando}
                      className={`flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Barra de progreso del perfil */}
            {estadisticas && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mt-6 pt-6 border-t border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    Completitud del Perfil
                  </span>
                  <span className={`text-sm font-bold ${tema.colores.acento}`}>
                    85%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 0.7 }}
                    className={`h-full bg-gradient-to-r ${tema.colores.gradiente} rounded-full`}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className={tema.colores.textoSecundario}>
                    Completa tu perfil para aumentar tu visibilidad
                  </span>
                  <Link
                    href="#"
                    className={`font-bold ${tema.colores.acento} hover:underline`}
                  >
                    Ver detalles →
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* MENSAJES Y NOTIFICACIONES PREMIUM */}
        <AnimatePresence>
          {mensaje && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="mb-6"
            >
              <div
                className={`p-5 rounded-2xl border backdrop-blur-xl ${
                  mensaje.tipo === "success"
                    ? tema.colores.success
                    : mensaje.tipo === "error"
                    ? tema.colores.error
                    : mensaje.tipo === "warning"
                    ? tema.colores.warning
                    : tema.colores.info
                } flex items-center justify-between shadow-2xl`}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                  >
                    {mensaje.tipo === "success" && <CheckCircle2 className="w-7 h-7" />}
                    {mensaje.tipo === "error" && <XCircle className="w-7 h-7" />}
                    {mensaje.tipo === "warning" && <AlertTriangle className="w-7 h-7" />}
                    {mensaje.tipo === "info" && <Info className="w-7 h-7" />}
                  </motion.div>
                  <div>
                    <p className="font-black text-lg">{mensaje.texto}</p>
                    <p className="text-sm opacity-80 mt-1">
                      {new Date().toLocaleTimeString("es-CL")}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMensaje(null)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SELECTOR DE TEMAS PREMIUM */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-black ${tema.colores.texto} flex items-center gap-3`}>
                <Palette className="w-6 h-6" />
                Personaliza tu Experiencia
              </h3>
              <span className={`text-sm font-bold ${tema.colores.textoSecundario}`}>
                {TEMAS[temaActual].nombre}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {(Object.keys(TEMAS) as TemaColor[]).map((temaKey) => {
                const temaConfig = TEMAS[temaKey];
                return (
                  <motion.button
                    key={temaKey}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cambiarTema(temaKey)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      temaActual === temaKey
                        ? `border-white shadow-2xl ${temaConfig.colores.card}`
                        : `border-transparent ${temaConfig.colores.card} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <div className={`w-full h-16 rounded-xl bg-gradient-to-br ${temaConfig.colores.gradiente} mb-3 shadow-lg`} />
                    <div className="flex items-center justify-center gap-2">
                      <temaConfig.icono className="w-5 h-5" />
                      <span className="text-xs font-bold">{temaConfig.nombre}</span>
                    </div>
                    {temaActual === temaKey && (
                      <motion.div
                        layoutId="tema-activo"
                        className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ESTADÍSTICAS RÁPIDAS PREMIUM */}
        {estadisticas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                {
                  label: "Consultas Totales",
                  value: estadisticas.total_consultas,
                  icon: Activity,
                  color: "from-indigo-500 to-purple-500",
                  change: "+12%",
                  trend: "up",
                },
                {
                  label: "Pacientes",
                  value: estadisticas.pacientes_atendidos,
                  icon: Users,
                  color: "from-blue-500 to-cyan-500",
                  change: "+8%",
                  trend: "up",
                },
                {
                  label: "Calificación",
                  value: estadisticas.calificacion_promedio.toFixed(1),
                  icon: Star,
                  color: "from-yellow-500 to-orange-500",
                  change: "+0.3",
                  trend: "up",
                },
                {
                  label: "Asistencia",
                  value: `${estadisticas.tasa_asistencia}%`,
                  icon: CheckCircle2,
                  color: "from-green-500 to-emerald-500",
                  change: "+5%",
                  trend: "up",
                },
                {
                  label: "Citas Próximas",
                  value: estadisticas.citas_proximas,
                  icon: Calendar,
                  color: "from-pink-500 to-rose-500",
                  change: "+3",
                  trend: "up",
                },
                {
                  label: "Nuevos Pacientes",
                  value: estadisticas.pacientes_nuevos_mes,
                  icon: UserPlus,
                  color: "from-violet-500 to-purple-500",
                  change: "+15%",
                  trend: "up",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl relative overflow-hidden group cursor-pointer`}
                >
                  {/* Fondo animado */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          stat.trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-xs font-bold">{stat.change}</span>
                      </motion.div>
                    </div>

                    <div className={`text-3xl font-black mb-1 ${tema.colores.texto}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm font-bold ${tema.colores.textoSecundario}`}>
                      {stat.label}
                    </div>
                  </div>

                  {/* Efecto de brillo */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* GRID PRINCIPAL CON NAVEGACIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR DE NAVEGACIÓN PREMIUM */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl sticky top-8`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                  Navegación
                </h3>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded-lg ${tema.colores.hover}`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Buscador */}
              <div className="mb-6">
                <div className={`relative rounded-xl ${tema.colores.secundario} overflow-hidden`}>
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                  <input
                    type="text"
                    placeholder="Buscar sección..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-transparent ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none`}
                  />
                </div>
              </div>

              {/* Secciones */}
              <div className="space-y-2">
                {[
                  { id: "informacion", label: "Información Personal", icon: User, badge: null },
                  { id: "especialidades", label: "Especialidades", icon: Award, badge: usuario.medico?.especialidades.length },
                  { id: "credenciales", label: "Credenciales", icon: ShieldCheck, badge: credenciales.length },
                  { id: "disponibilidad", label: "Disponibilidad", icon: Clock, badge: disponibilidad.length },
                  { id: "estadisticas", label: "Estadísticas", icon: Activity, badge: "NEW" },
                  { id: "documentos", label: "Documentos", icon: FileText, badge: null },
                  { id: "certificaciones", label: "Certificaciones", icon: Award, badge: null },
                  { id: "experiencia", label: "Experiencia", icon: Briefcase, badge: null },
                  { id: "publicaciones", label: "Publicaciones", icon: FileText, badge: null },
                  { id: "premios", label: "Premios y Reconocimientos", icon: Trophy, badge: null },
                  { id: "configuracion", label: "Configuración", icon: Settings, badge: null },
                  { id: "seguridad", label: "Seguridad", icon: Shield, badge: "!" },
                  { id: "notificaciones", label: "Notificaciones", icon: Bell, badge: null },
                  { id: "privacidad", label: "Privacidad", icon: Lock, badge: null },
                  { id: "facturacion", label: "Facturación", icon: DollarSign, badge: null },
                ].map((seccion) => (
                  <motion.button
                    key={seccion.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSeccionActiva(seccion.id as SeccionPerfil)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                      seccionActiva === seccion.id
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}`
                        : `${tema.colores.hover} ${tema.colores.texto}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <seccion.icon className="w-5 h-5" />
                      <span className="text-sm">{seccion.label}</span>
                    </div>
                    {seccion.badge && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          seccion.badge === "!"
                            ? "bg-red-500 text-white"
                            : seccion.badge === "NEW"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {seccion.badge}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Acciones rápidas */}
              <div className="mt-6 pt-6 border-t border-gray-700/50 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVistaPrevia(!vistaPrevia)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300`}
                >
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">Vista Previa Pública</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportarDatos}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300`}
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Exportar Datos</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.print()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300`}
                >
                  <Printer className="w-5 h-5" />
                  <span className="text-sm">Imprimir Perfil</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* CONTENIDO PRINCIPAL DINÁMICO */}
          <motion.div
            key={seccionActiva}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-3"
          >
            {/* INFORMACIÓN PERSONAL PREMIUM */}
            {seccionActiva === "informacion" && datosEdicion && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`w-16 h-16 bg-gradient-to-br ${tema.colores.gradiente} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <User className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                      Información Personal
                    </h2>
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Gestiona tus datos personales y profesionales
                    </p>
                  </div>
                </div>

                {/* FOTO DE PERFIL PREMIUM */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 pb-8 border-b border-gray-700/50"
                >
                  <h3 className={`text-xl font-black mb-6 ${tema.colores.texto} flex items-center gap-3`}>
                    <Camera className="w-6 h-6" />
                    Foto de Perfil Profesional
                  </h3>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative group cursor-pointer"
                      onClick={() => inputFileRef.current?.click()}
                    >
                      <div className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-5xl shadow-2xl overflow-hidden ring-8 ring-white/10`}>
                        {usuario.foto_perfil_url ? (
                          <Image
                            src={usuario.foto_perfil_url}
                            alt={usuario.nombre}
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                        )}
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center gap-2"
                      >
                        <Camera className="w-10 h-10 text-white" />
                        <span className="text-white font-bold text-sm">Cambiar Foto</span>
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center"
                      >
                        <Check className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>

                    <div className="flex-1">
                      <div className={`p-6 rounded-2xl ${tema.colores.secundario} mb-4`}>
                        <h4 className={`font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                          <Info className="w-5 h-5" />
                          Recomendaciones para tu foto profesional
                        </h4>
                        <ul className={`space-y-2 text-sm ${tema.colores.textoSecundario}`}>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Usa una foto reciente y profesional con buena iluminación</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Fondo neutro y vestimenta profesional (bata blanca recomendada)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Formato JPG o PNG, tamaño máximo 5MB</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>Resolución mínima recomendada: 800x800 píxeles</span>
                          </li>
                        </ul>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={inputFileRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => inputFileRef.current?.click()}
                          className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                        >
                          <Upload className="w-5 h-5" />
                          Subir Nueva Foto
                        </motion.button>
                        {usuario.foto_perfil_url && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={eliminarFotoPerfil}
                              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                              Eliminar
                            </motion.button>
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={usuario.foto_perfil_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                            >
                              <ExternalLink className="w-5 h-5" />
                              Ver Original
                            </motion.a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* FORMULARIO DE DATOS PERSONALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <User className="w-4 h-4" />
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.nombre}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, nombre: e.target.value })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Apellido Paterno */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <User className="w-4 h-4" />
                      Apellido Paterno *
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.apellido_paterno}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          apellido_paterno: e.target.value,
                        })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Apellido Materno */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <User className="w-4 h-4" />
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.apellido_materno}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          apellido_materno: e.target.value,
                        })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Mail className="w-4 h-4" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={datosEdicion.email}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, email: e.target.value })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Teléfono */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={datosEdicion.telefono}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, telefono: e.target.value })
                      }
                      disabled={!modoEdicion}
                      placeholder="+56 2 1234 5678"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Celular */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Smartphone className="w-4 h-4" />
                      Celular
                    </label>
                    <input
                      type="tel"
                      value={datosEdicion.celular}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, celular: e.target.value })
                      }
                      disabled={!modoEdicion}
                      placeholder="+56 9 1234 5678"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Dirección */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-2"
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <MapPin className="w-4 h-4" />
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.direccion}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, direccion: e.target.value })
                      }
                      disabled={!modoEdicion}
                      placeholder="Calle, número, depto/oficina"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Ciudad */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Building2 className="w-4 h-4" />
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.ciudad}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, ciudad: e.target.value })
                      }
                      disabled={!modoEdicion}
                      placeholder="Santiago, Valparaíso, etc."
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Región */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Globe className="w-4 h-4" />
                      Región
                    </label>
                    <select
                      value={datosEdicion.region}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, region: e.target.value })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seleccionar región...</option>
                      <option value="Región Metropolitana">Región Metropolitana</option>
                      <option value="Región de Valparaíso">Región de Valparaíso</option>
                      <option value="Región del Biobío">Región del Biobío</option>
                      <option value="Región de La Araucanía">Región de La Araucanía</option>
                      <option value="Región de Los Lagos">Región de Los Lagos</option>
                      <option value="Región de Antofagasta">Región de Antofagasta</option>
                      <option value="Región de Coquimbo">Región de Coquimbo</option>
                      <option value="Región de O'Higgins">Región de O'Higgins</option>
                      <option value="Región del Maule">Región del Maule</option>
                      <option value="Región de Ñuble">Región de Ñuble</option>
                      <option value="Región de Los Ríos">Región de Los Ríos</option>
                      <option value="Región de Aysén">Región de Aysén</option>
                      <option value="Región de Magallanes">Región de Magallanes</option>
                      <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
                      <option value="Región de Tarapacá">Región de Tarapacá</option>
                      <option value="Región de Atacama">Región de Atacama</option>
                    </select>
                  </motion.div>

                  {/* Fecha de Nacimiento */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Calendar className="w-4 h-4" />
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={datosEdicion.fecha_nacimiento}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          fecha_nacimiento: e.target.value,
                        })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Género */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Users className="w-4 h-4" />
                      Género
                    </label>
                    <select
                      value={datosEdicion.genero}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, genero: e.target.value })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="no_binario">No Binario</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                  </motion.div>

                  {/* Biografía Profesional */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="md:col-span-2"
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <FileText className="w-4 h-4" />
                      Biografía Profesional
                    </label>
                    <textarea
                      value={datosEdicion.biografia}
                      onChange={(e) =>
                        setDatosEdicion({ ...datosEdicion, biografia: e.target.value })
                      }
                      disabled={!modoEdicion}
                      rows={6}
                      maxLength={1000}
                      placeholder="Cuéntanos sobre tu trayectoria profesional, especialidades, logros destacados y enfoque médico..."
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 resize-none ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>
                        {datosEdicion.biografia.length}/1000 caracteres
                      </p>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className={`p-2 rounded-lg ${tema.colores.hover}`}
                        >
                          <Bold className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className={`p-2 rounded-lg ${tema.colores.hover}`}
                        >
                          <Italic className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className={`p-2 rounded-lg ${tema.colores.hover}`}
                        >
                          <List className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* DATOS PROFESIONALES */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="md:col-span-2 mt-6 pt-6 border-t border-gray-700/50"
                  >
                    <h3 className={`text-2xl font-black mb-6 ${tema.colores.texto} flex items-center gap-3`}>
                      <Briefcase className="w-7 h-7" />
                      Información Profesional
                    </h3>
                  </motion.div>

                  {/* Título Profesional */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <GraduationCap className="w-4 h-4" />
                      Título Profesional *
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.titulo_profesional}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          titulo_profesional: e.target.value,
                        })
                      }
                      disabled={!modoEdicion}
                      placeholder="Ej: Médico Cirujano"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Universidad */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Building2 className="w-4 h-4" />
                      Universidad *
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.universidad}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          universidad: e.target.value,
                        })
                      }
                      disabled={!modoEdicion}
                      placeholder="Ej: Universidad de Chile"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Año de Graduación */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Calendar className="w-4 h-4" />
                      Año de Graduación *
                    </label>
                    <input
                      type="number"
                      value={datosEdicion.ano_graduacion}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          ano_graduacion: parseInt(e.target.value),
                        })
                      }
                      disabled={!modoEdicion}
                      min="1950"
                      max={new Date().getFullYear()}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* Número de Registro Médico */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <ShieldCheck className="w-4 h-4" />
                      Número de Registro Médico *
                    </label>
                    <input
                      type="text"
                      value={datosEdicion.numero_registro_medico}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          numero_registro_medico: e.target.value,
                        })
                      }
                      disabled={!modoEdicion}
                      placeholder="Ej: 12345-6"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    />
                  </motion.div>

                  {/* CONFIGURACIÓN DE ATENCIÓN */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.95 }}
                    className="md:col-span-2 mt-6 pt-6 border-t border-gray-700/50"
                  >
                    <h3 className={`text-2xl font-black mb-6 ${tema.colores.texto} flex items-center gap-3`}>
                      <Settings className="w-7 h-7" />
                      Configuración de Atención
                    </h3>
                  </motion.div>

                  {/* Duración de Consulta */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Clock className="w-4 h-4" />
                      Duración de Consulta (minutos) *
                    </label>
                    <select
                      value={datosEdicion.duracion_consulta_min}
                      onChange={(e) =>
                        setDatosEdicion({
                          ...datosEdicion,
                          duracion_consulta_min: parseInt(e.target.value),
                        })
                      }
                      disabled={!modoEdicion}
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${
                        !modoEdicion && "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <option value="15">15 minutos</option>
                      <option value="20">20 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="45">45 minutos</option>
                      <option value="60">60 minutos</option>
                      <option value="90">90 minutos</option>
                      <option value="120">120 minutos</option>
                    </select>
                  </motion.div>

                  {/* Tipos de Atención */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.05 }}
                    className="md:col-span-2"
                  >
                    <label className={`block text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                      <DollarSign className="w-4 h-4" />
                      Tipos de Atención
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { key: "atiende_particular", label: "Particular", icon: Wallet },
                        { key: "atiende_fonasa", label: "FONASA", icon: Heart },
                        { key: "atiende_isapre", label: "ISAPRE", icon: Shield },
                      ].map((tipo) => (
                        <motion.label
                          key={tipo.key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            datosEdicion[tipo.key as keyof DatosEdicion]
                              ? `bg-gradient-to-r ${tema.colores.gradiente} border-transparent shadow-lg`
                              : `${tema.colores.card} ${tema.colores.borde}`
                          } ${!modoEdicion && "opacity-60 cursor-not-allowed"}`}
                        >
                          <input
                            type="checkbox"
                            checked={datosEdicion[tipo.key as keyof DatosEdicion] as boolean}
                            onChange={(e) =>
                              setDatosEdicion({
                                ...datosEdicion,
                                [tipo.key]: e.target.checked,
                              })
                            }
                            disabled={!modoEdicion}
                            className="w-5 h-5 rounded accent-indigo-600"
                          />
                          <tipo.icon className="w-5 h-5" />
                          <span className={`font-bold ${datosEdicion[tipo.key as keyof DatosEdicion] ? "text-white" : tema.colores.texto}`}>
                            {tipo.label}
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>

                  {/* Modalidades de Consulta */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="md:col-span-2"
                  >
                    <label className={`block text-sm font-bold mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                      <Video className="w-4 h-4" />
                      Modalidades de Consulta
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "consulta_presencial", label: "Presencial", icon: Building2 },
                        { key: "consulta_telemedicina", label: "Telemedicina", icon: Video },
                      ].map((modalidad) => (
                        <motion.label
                          key={modalidad.key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            datosEdicion[modalidad.key as keyof DatosEdicion]
                              ? `bg-gradient-to-r ${tema.colores.gradiente} border-transparent shadow-lg`
                              : `${tema.colores.card} ${tema.colores.borde}`
                          } ${!modoEdicion && "opacity-60 cursor-not-allowed"}`}
                        >
                          <input
                            type="checkbox"
                            checked={datosEdicion[modalidad.key as keyof DatosEdicion] as boolean}
                            onChange={(e) =>
                              setDatosEdicion({
                                ...datosEdicion,
                                [modalidad.key]: e.target.checked,
                              })
                            }
                            disabled={!modoEdicion}
                            className="w-5 h-5 rounded accent-indigo-600"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <modalidad.icon className="w-6 h-6" />
                            <span className={`font-bold text-lg ${datosEdicion[modalidad.key as keyof DatosEdicion] ? "text-white" : tema.colores.texto}`}>
                              {modalidad.label}
                            </span>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Botones de acción al final del formulario */}
                {modoEdicion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15 }}
                    className="flex items-center justify-end gap-4 mt-8 pt-8 border-t border-gray-700/50"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelarEdicion}
                      disabled={guardando}
                      className={`flex items-center gap-2 px-8 py-4  ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      <X className="w-5 h-5" />
                      Cancelar Cambios
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={guardarCambios}
                      disabled={guardando}
                      className={`flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 shadow-2xl`}
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Guardar Cambios
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}

            {/* ESPECIALIDADES PREMIUM */}
            {seccionActiva === "especialidades" && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className={`w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Award className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                        Especialidades Médicas
                      </h2>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        {usuario.medico?.especialidades.length || 0} especialidades registradas
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalEspecialidad(true)}
                    className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Especialidad
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {usuario.medico?.especialidades.map((esp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 ${tema.colores.sombra} relative overflow-hidden group`}
                    >
                      {/* Fondo animado */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />

                      {esp.es_principal && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-bl-xl shadow-lg"
                        >
                          ⭐ PRINCIPAL
                        </motion.div>
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                          >
                            <Award className="w-7 h-7 text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <h3 className={`text-xl font-black mb-2 ${tema.colores.texto}`}>
                              {esp.nombre}
                            </h3>
                            {esp.anos_experiencia && (
                              <p className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2 mb-2`}>
                                <Clock className="w-4 h-4" />
                                {esp.anos_experiencia} años de experiencia
                              </p>
                            )}
                            {esp.institucion_certificadora && (
                              <p className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-2`}>
                                <GraduationCap className="w-4 h-4" />
                                {esp.institucion_certificadora}
                              </p>
                            )}
                            {esp.fecha_certificacion && (
                              <p className={`text-xs ${tema.colores.textoSecundario} flex items-center gap-2 mt-2`}>
                                <Calendar className="w-3 h-3" />
                                Certificado: {new Date(esp.fecha_certificacion).toLocaleDateString("es-CL")}
                              </p>
                            )}
                          </div>
                        </div>

                        {esp.certificado_url && (
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={esp.certificado_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-semibold text-sm transition-all duration-300 w-fit mb-4`}
                          >
                            <FileText className="w-4 h-4" />
                            Ver Certificado
                            <ExternalLink className="w-4 h-4" />
                          </motion.a>
                        )}

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {(!usuario.medico?.especialidades || usuario.medico.especialidades.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="md:col-span-2 text-center py-16"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl`}
                      >
                        <Award className="w-12 h-12 text-white" />
                      </motion.div>
                      <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                        No tienes especialidades registradas
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario} mb-6`}>
                        Agrega tus especialidades médicas para completar tu perfil profesional
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalEspecialidad(true)}
                        className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                      >
                        <Plus className="w-5 h-5" />
                        Agregar Primera Especialidad
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* CREDENCIALES PREMIUM */}
            {seccionActiva === "credenciales" && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                        Credenciales Profesionales
                      </h2>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        {credenciales.length} credenciales registradas
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalCredencial(true)}
                    className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Credencial
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {credenciales.map((cred, index) => (
                    <motion.div
                      key={cred.id_credencial}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 ${tema.colores.sombra} relative overflow-hidden group`}
                    >
                      {/* Indicador de estado animado */}
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute top-0 left-0 w-2 h-full ${
                          cred.estado === "activo"
                            ? "bg-green-500"
                            : cred.estado === "pendiente_verificacion"
                            ? "bg-yellow-500"
                            : cred.estado === "expirado"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      />

                      <div className="flex items-start justify-between pl-4">
                        <div className="flex items-start gap-4 flex-1">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                          >
                            <ShieldCheck className="w-7 h-7 text-white" />
                          </motion.div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                                {cred.tipo_credencial}
                              </h3>
                              <motion.span
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  cred.estado === "activo"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : cred.estado === "pendiente_verificacion"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : cred.estado === "expirado"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                }`}
                              >
                                {cred.estado.toUpperCase()}
                              </motion.span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                                <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                                  Número de Credencial
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}>
                                  <Hash className="w-4 h-4" />
                                  {cred.numero_credencial}
                                </p>
                              </div>

                              <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                                <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                                  Entidad Emisora
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}>
                                  <Building2 className="w-4 h-4" />
                                  {cred.entidad_emisora}
                                </p>
                              </div>

                              <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                                <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                                  Fecha de Emisión
                                </p>
                                <p className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}>
                                  <Calendar className="w-4 h-4" />
                                  {new Date(cred.fecha_emision).toLocaleDateString("es-CL")}
                                </p>
                              </div>

                              {cred.fecha_expiracion && (
                                <div className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                                  <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                                    Fecha de Expiración
                                  </p>
                                  <p className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}>
                                    <AlertCircle className="w-4 h-4" />
                                    {new Date(cred.fecha_expiracion).toLocaleDateString("es-CL")}
                                  </p>
                                </div>
                              )}
                            </div>

                            {cred.observaciones && (
                              <div className={`p-3 rounded-xl ${tema.colores.secundario} mb-4`}>
                                <p className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                                  Observaciones
                                </p>
                                <p className={`text-sm ${tema.colores.texto}`}>
                                  {cred.observaciones}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              {cred.documento_url && (
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={cred.documento_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg`}
                                >
                                  <FileText className="w-4 h-4" />
                                  Ver Documento
                                  <ExternalLink className="w-4 h-4" />
                                </motion.a>
                              )}

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                              >
                                <Download className="w-4 h-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                              >
                                <Share2 className="w-4 h-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {credenciales.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl`}
                      >
                        <ShieldCheck className="w-12 h-12 text-white" />
                      </motion.div>
                      <p className={`text-xl font-bold ${tema.colores.texto} mb-2`}>
                        No tienes credenciales registradas
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario} mb-6`}>
                        Agrega tus certificaciones y credenciales profesionales
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalCredencial(true)}
                        className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                      >
                        <Plus className="w-5 h-5" />
                        Agregar Primera Credencial
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* DISPONIBILIDAD PREMIUM */}
            {seccionActiva === "disponibilidad" && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Clock className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                        Disponibilidad Horaria
                      </h2>
                      <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                        Configura tus horarios de atención semanales
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalDisponibilidad(true)}
                    className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Horario
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map((dia, diaIndex) => {
                    const horariosDelDia = disponibilidad.filter((d) => d.dia_semana === dia);
                    const tienHorarios = horariosDelDia.length > 0;

                    return (
                      <motion.div
                        key={dia}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: diaIndex * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 ${tema.colores.sombra} ${
                          tienHorarios ? "ring-2 ring-blue-500/30" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={tienHorarios ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                tienHorarios
                                  ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                                  : tema.colores.secundario
                              }`}
                            >
                              <Calendar className={`w-6 h-6 ${tienHorarios ? "text-white" : tema.colores.textoSecundario}`} />
                            </motion.div>
                            <div>
                              <h3 className={`text-xl font-black ${tema.colores.texto} capitalize`}>
                                {dia}
                              </h3>
                              <p className={`text-sm ${tema.colores.textoSecundario}`}>
                                {tienHorarios ? `${horariosDelDia.length} horario(s) configurado(s)` : "Sin horarios"}
                              </p>
                            </div>
                          </div>

                          {!tienHorarios && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setModalDisponibilidad(true)}
                              className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                            >
                              <Plus className="w-5 h-5" />
                            </motion.button>
                          )}
                        </div>

                        {tienHorarios && (
                          <div className="space-y-3">
                            {horariosDelDia.map((horario, horarioIndex) => (
                              <motion.div
                                key={horario.id_disponibilidad}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: horarioIndex * 0.05 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className={`flex items-center justify-between p-4 rounded-xl ${tema.colores.secundario} group`}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className={`w-5 h-5 ${tema.colores.acento}`} />
                                    <span className={`font-bold ${tema.colores.texto}`}>
                                      {horario.hora_inicio} - {horario.hora_fin}
                                    </span>
                                  </div>

                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      horario.tipo_atencion === "presencial"
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : horario.tipo_atencion === "telemedicina"
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    }`}
                                  >
                                    {horario.tipo_atencion === "presencial" && <Building2 className="w-3 h-3 inline mr-1" />}
                                    {horario.tipo_atencion === "telemedicina" && <Video className="w-3 h-3 inline mr-1" />}
                                    {horario.tipo_atencion.toUpperCase()}
                                  </motion.div>

                                  {horario.max_pacientes && (
                                    <span className={`text-sm ${tema.colores.textoSecundario} flex items-center gap-1`}>
                                      <Users className="w-4 h-4" />
                                      Max: {horario.max_pacientes}
                                    </span>
                                  )}

                                  <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      horario.estado === "activo"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-gray-500/20 text-gray-400"
                                    }`}
                                  >
                                    {horario.estado}
                                  </motion.span>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300`}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Resumen semanal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className={`mt-8 p-6 rounded-2xl ${tema.colores.secundario}`}
                >
                  <h3 className={`text-lg font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}>
                    <BarChart3 className="w-5 h-5" />
                    Resumen Semanal
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl ${tema.colores.card}`}>
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {disponibilidad.length}
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Horarios Totales
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${tema.colores.card}`}>
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {disponibilidad.filter(d => d.tipo_atencion === "presencial").length}
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Presenciales
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${tema.colores.card}`}>
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {disponibilidad.filter(d => d.tipo_atencion === "telemedicina").length}
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Telemedicina
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${tema.colores.card}`}>
                      <p className={`text-2xl font-black ${tema.colores.texto}`}>
                        {disponibilidad.reduce((sum, d) => sum + (d.max_pacientes || 0), 0)}
                      </p>
                      <p className={`text-sm ${tema.colores.textoSecundario}`}>
                        Capacidad Semanal
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* SEGURIDAD PREMIUM */}
            {seccionActiva === "seguridad" && (
              <div className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} backdrop-blur-xl`}>
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                      Seguridad de la Cuenta
                    </h2>
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      Protege tu cuenta y datos personales
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Cambiar Contraseña */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-2xl ${tema.colores.secundario} group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <Lock className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className={`text-xl font-black mb-2 ${tema.colores.texto}`}>
                            Contraseña
                          </h3>
                          <p className={`text-sm ${tema.colores.textoSecundario} mb-3`}>
                            Última modificación: hace 30 días
                          </p>
                          <div className={`flex items-center gap-2 text-xs ${tema.colores.textoSecundario}`}>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span>Contraseña fuerte</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalCambiarPassword(true)}
                        className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                      >
                        <Edit className="w-5 h-5" />
                        Cambiar
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Autenticación de Dos Factores */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-2xl ${tema.colores.secundario} group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className={`text-xl font-black mb-2 ${tema.colores.texto}`}>
                            Autenticación de Dos Factores (2FA)
                          </h3>
                          <p className={`text-sm ${tema.colores.textoSecundario} mb-3`}>
                            {usuario.autenticacion_doble_factor
                              ? "✅ Activada - Tu cuenta está protegida con un nivel adicional de seguridad"
                              : "❌ Desactivada - Te recomendamos activarla para mayor protección"}
                          </p>
                          {usuario.autenticacion_doble_factor && (
                            <div className={`flex items-center gap-2 text-xs ${tema.colores.textoSecundario}`}>
                              <Smartphone className="w-4 h-4" />
                              <span>Configurado con aplicación móvil</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-6 py-3 ${
                          usuario.autenticacion_doble_factor
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                      >
                        {usuario.autenticacion_doble_factor ? (
                          <>
                            <XCircle className="w-5 h-5" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Activar
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Sesiones Activas */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-2xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <Monitor className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className={`text-xl font-black mb-2 ${tema.colores.texto}`}>
                            Sesiones Activas
                          </h3>
                          <p className={`text-sm ${tema.colores.textoSecundario}`}>
                            Dispositivos donde has iniciado sesión recientemente
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 ${tema.colores.hover} ${tema.colores.texto} rounded-xl font-bold text-sm transition-all duration-300`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                      </motion.button>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          dispositivo: "Windows - Chrome",
                          ubicacion: "Santiago, Chile",
                          ip: "192.168.1.1",
                          fecha: "Activo ahora",
                          actual: true,
                        },
                        {
                          dispositivo: "iPhone - Safari",
                          ubicacion: "Santiago, Chile",
                          ip: "192.168.1.2",
                          fecha: "Hace 2 horas",
                          actual: false,
                        },
                        {
                          dispositivo: "MacBook - Safari",
                          ubicacion: "Valparaíso, Chile",
                          ip: "192.168.2.1",
                          fecha: "Hace 1 día",
                          actual: false,
                        },
                      ].map((sesion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className={`p-4 rounded-xl ${tema.colores.card} border ${tema.colores.borde} group`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {sesion.dispositivo.includes("Windows") && <Monitor className={`w-5 h-5 ${tema.colores.acento}`} />}
                              {sesion.dispositivo.includes("iPhone") && <Smartphone className={`w-5 h-5 ${tema.colores.acento}`} />}
                              {sesion.dispositivo.includes("MacBook") && <Monitor className={`w-5 h-5 ${tema.colores.acento}`} />}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={`font-bold ${tema.colores.texto}`}>
                                    {sesion.dispositivo}
                                  </p>
                                  {sesion.actual && (
                                    <motion.span
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30"
                                    >
                                      ACTUAL
                                    </motion.span>
                                  )}
                                </div>
                                <div className={`flex items-center gap-4 text-xs ${tema.colores.textoSecundario}`}>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {sesion.ubicacion}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {sesion.ip}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {sesion.fecha}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!sesion.actual && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                              >
                                <XCircle className="w-5 h-5 text-red-400" />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 ${tema.colores.hover} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar todas las sesiones excepto esta
                    </motion.button>
                  </motion.div>

                  {/* Historial de Seguridad */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-2xl ${tema.colores.secundario}`}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <Activity className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-black mb-2 ${tema.colores.texto}`}>
                          Historial de Seguridad
                        </h3>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          Actividad reciente relacionada con la seguridad de tu cuenta
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          accion: "Inicio de sesión exitoso",
                          fecha: "Hoy, 10:30 AM",
                          tipo: "success",
                        },
                        {
                          accion: "Cambio de contraseña",
                          fecha: "Hace 30 días",
                          tipo: "info",
                        },
                        {
                          accion: "Intento de inicio de sesión fallido",
                          fecha: "Hace 45 días",
                          tipo: "warning",
                        },
                      ].map((evento, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-xl ${tema.colores.card}`}
                        >
                          {evento.tipo === "success" && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                          {evento.tipo === "info" && <Info className="w-5 h-5 text-blue-400" />}
                          {evento.tipo === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                          <div className="flex-1">
                            <p className={`font-bold ${tema.colores.texto}`}>
                              {evento.accion}
                            </p>
                            <p className={`text-xs ${tema.colores.textoSecundario}`}>
                              {evento.fecha}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Eliminar Cuenta */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-6 rounded-2xl bg-red-500/10 border-2 border-red-500/30`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className={`text-xl font-black mb-2 text-red-400`}>
                            Zona de Peligro
                          </h3>
                          <p className={`text-sm text-red-300 mb-3`}>
                            Eliminar tu cuenta es una acción permanente e irreversible
                          </p>
                          <ul className="space-y-1 text-xs text-red-300">
                            <li className="flex items-center gap-2">
                              <XCircle className="w-3 h-3" />
                              Se eliminarán todos tus datos personales
                            </li>
                            <li className="flex items-center gap-2">
                              <XCircle className="w-3 h-3" />
                              Se cancelarán todas tus citas programadas
                            </li>
                            <li className="flex items-center gap-2">
                              <XCircle className="w-3 h-3" />
                              Perderás acceso a tu historial médico
                            </li>
                          </ul>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalEliminarCuenta(true)}
                        className={`flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg`}
                      >
                        <Trash2 className="w-5 h-5" />
                        Eliminar Cuenta
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* MODAL DE FOTO DE PERFIL CON CROPPER PREMIUM */}
      <AnimatePresence>
        {modalFoto && imagenSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => {
              setModalFoto(false);
              setImagenSeleccionada(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden`}
            >
              <div className={`p-6 border-b-2 ${tema.colores.borde} flex items-center justify-between bg-gradient-to-r ${tema.colores.gradiente}`}>
                <h3 className={`text-2xl font-black text-white flex items-center gap-3`}>
                  <Camera className="w-7 h-7" />
                  Editar Foto de Perfil
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setModalFoto(false);
                    setImagenSeleccionada(null);
                  }}
                  className={`p-2 rounded-xl hover:bg-white/20 transition-all duration-300`}
                >
                  <X className={`w-6 h-6 text-white`} />
                </motion.button>
              </div>

              <div className="p-6">
                {/* Cropper */}
                <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden mb-6 border-2 border-gray-700">
                  <Cropper
                    image={imagenSeleccionada}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={true}
                  />
                </div>

                {/* Controles de Zoom */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}>
                      <ZoomIn className="w-4 h-4" />
                      Zoom
                    </label>
                    <span className={`text-sm font-bold ${tema.colores.acento}`}>
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ZoomOut className={`w-5 h-5 ${tema.colores.textoSecundario}`} />
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <ZoomIn className={`w-5 h-5 ${tema.colores.textoSecundario}`} />
                  </div>
                </div>

                {/* Controles de Rotación */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-bold ${tema.colores.texto} flex items-center gap-2`}>
                      <RotateCcw className="w-4 h-4" />
                      Rotación
                    </label>
                    <span className={`text-sm font-bold ${tema.colores.acento}`}>
                      {rotation}°
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <RotateCcw className={`w-5 h-5 ${tema.colores.textoSecundario}`} />
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className={`text-sm ${tema.colores.textoSecundario}`}>360°</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setModalFoto(false);
                      setImagenSeleccionada(null);
                    }}
                    className={`flex-1 px-6 py-4 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setZoom(1);
                      setRotation(0);
                    }}
                    className={`px-6 py-4 ${tema.colores.hover} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 flex items-center gap-2`}
                  >
                    <RefreshCw className="w-5 h-5" />
                    Restablecer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={subirFotoPerfil}
                    disabled={subiendoFoto}
                    className={`flex-1 px-6 py-4 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 shadow-2xl flex items-center justify-center gap-2`}
                  >
                    {subiendoFoto ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Guardar Foto
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CAMBIAR CONTRASEÑA PREMIUM */}
      <AnimatePresence>
        {modalCambiarPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setModalCambiarPassword(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden`}
            >
              <div className={`p-6 border-b-2 ${tema.colores.borde} flex items-center justify-between bg-gradient-to-r ${tema.colores.gradiente}`}>
                <h3 className={`text-2xl font-black text-white flex items-center gap-3`}>
                  <Lock className="w-7 h-7" />
                  Cambiar Contraseña
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalCambiarPassword(false)}
                  className={`p-2 rounded-xl hover:bg-white/20 transition-all duration-300`}
                >
                  <X className={`w-6 h-6 text-white`} />
                </motion.button>
              </div>

              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const passwordActual = formData.get("password_actual") as string;
                    const passwordNueva = formData.get("password_nueva") as string;
                    const passwordConfirmar = formData.get("password_confirmar") as string;

                    if (passwordNueva !== passwordConfirmar) {
                      setMensaje({
                        tipo: "error",
                        texto: "❌ Las contraseñas no coinciden",
                      });
                      return;
                    }

                    if (passwordNueva.length < 8) {
                      setMensaje({
                        tipo: "error",
                        texto: "❌ La contraseña debe tener al menos 8 caracteres",
                      });
                      return;
                    }

                    try {
                      const response = await fetch("/api/medico/perfil/cambiar-password", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          id_usuario: usuario?.id_usuario,
                          password_actual: passwordActual,
                          password_nueva: passwordNueva,
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        setMensaje({
                          tipo: "success",
                          texto: "✅ Contraseña actualizada correctamente",
                        });
                        setModalCambiarPassword(false);
                      } else {
                        setMensaje({
                          tipo: "error",
                          texto: `❌ ${result.message}`,
                        });
                      }
                    } catch (error) {
                      setMensaje({
                        tipo: "error",
                        texto: "❌ Error al cambiar la contraseña",
                      });
                    }
                  }}
                  className="space-y-5"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Lock className="w-4 h-4" />
                      Contraseña Actual *
                    </label>
                    <input
                      type="password"
                      name="password_actual"
                      required
                      placeholder="Ingresa tu contraseña actual"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Key className="w-4 h-4" />
                      Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password_nueva"
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Nueva Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password_confirmar"
                      required
                      minLength={8}
                      placeholder="Repite la nueva contraseña"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-xl ${tema.colores.info} border`}
                  >
                    <p className={`text-sm font-bold mb-2 flex items-center gap-2`}>
                      <Shield className="w-4 h-4" />
                      Requisitos de seguridad:
                    </p>
                    <ul className={`text-xs space-y-1`}>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Mínimo 8 caracteres
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Al menos una letra mayúscula
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Al menos una letra minúscula
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Al menos un número
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Al menos un carácter especial (!@#$%^&*)
                      </li>
                    </ul>
                  </motion.div>

                  <div className="flex items-center gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setModalCambiarPassword(false)}
                      className={`flex-1 px-6 py-4 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`flex-1 px-6 py-4 bg-gradient-to-r ${tema.colores.gradiente} text-white rounded-xl font-bold transition-all duration-300 shadow-2xl`}
                    >
                      Cambiar Contraseña
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR CUENTA PREMIUM */}
      <AnimatePresence>
        {modalEliminarCuenta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setModalEliminarCuenta(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl bg-red-950 border-2 border-red-500 shadow-2xl shadow-red-500/20 overflow-hidden`}
            >
              <div className={`p-6 border-b-2 border-red-500/30 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700`}>
                <h3 className={`text-2xl font-black text-white flex items-center gap-3`}>
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                  ¡ADVERTENCIA CRÍTICA!
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalEliminarCuenta(false)}
                  className={`p-2 rounded-xl hover:bg-white/20 transition-all duration-300`}
                >
                  <X className={`w-6 h-6 text-white`} />
                </motion.button>
              </div>

              <div className="p-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6 p-4 rounded-xl bg-red-900/50 border-2 border-red-500/50"
                >
                  <p className="text-red-200 font-bold text-center text-lg">
                    ⚠️ Esta acción es PERMANENTE e IRREVERSIBLE ⚠️
                  </p>
                </motion.div>

                <div className="mb-6">
                  <p className="text-red-300 font-bold mb-4 text-lg">
                    Al eliminar tu cuenta:
                  </p>
                  <ul className="space-y-3 text-red-300">
                    {[
                      "Se eliminarán TODOS tus datos personales y profesionales",
                      "Se cancelarán TODAS tus citas programadas",
                      "Perderás acceso a tu historial médico completo",
                      "Se eliminarán todas tus credenciales y certificaciones",
                      "Tus pacientes no podrán contactarte nuevamente",
                      "No podrás recuperar esta información",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const confirmacion = formData.get("confirmacion") as string;

                    if (confirmacion !== "ELIMINAR MI CUENTA") {
                      setMensaje({
                        tipo: "error",
                        texto: "❌ Debes escribir exactamente: ELIMINAR MI CUENTA",
                      });
                      return;
                    }

                    try {
                      const response = await fetch("/api/medico/perfil/eliminar-cuenta", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          id_usuario: usuario?.id_usuario,
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        alert("Tu cuenta ha sido eliminada permanentemente. Serás redirigido al inicio.");
                        window.location.href = "/";
                      } else {
                        setMensaje({
                          tipo: "error",
                          texto: `❌ ${result.message}`,
                        });
                      }
                    } catch (error) {
                      setMensaje({
                        tipo: "error",
                        texto: "❌ Error al eliminar la cuenta",
                      });
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className={`block text-sm font-bold mb-2 text-red-300 flex items-center gap-2`}>
                      <AlertTriangle className="w-4 h-4" />
                      Para confirmar, escribe: <span className="text-white">ELIMINAR MI CUENTA</span>
                    </label>
                    <input
                      type="text"
                      name="confirmacion"
                      required
                      placeholder="ELIMINAR MI CUENTA"
                      className={`w-full px-4 py-3 rounded-xl bg-red-900/50 border-2 border-red-500/50 text-red-100 placeholder:text-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-bold`}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setModalEliminarCuenta(false)}
                      className={`flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all duration-300`}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2`}
                    >
                      <Trash2 className="w-5 h-5" />
                      Eliminar Permanentemente
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL AGREGAR ESPECIALIDAD PREMIUM */}
      <AnimatePresence>
        {modalEspecialidad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setModalEspecialidad(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border-2 ${tema.colores.sombra} overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar`}
            >
              <div className={`p-6 border-b-2 ${tema.colores.borde} flex items-center justify-between bg-gradient-to-r from-yellow-500 to-orange-500 sticky top-0 z-10`}>
                <h3 className={`text-2xl font-black text-white flex items-center gap-3`}>
                  <Award className="w-7 h-7" />
                  Agregar Nueva Especialidad
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalEspecialidad(false)}
                  className={`p-2 rounded-xl hover:bg-white/20 transition-all duration-300`}
                >
                  <X className={`w-6 h-6 text-white`} />
                </motion.button>
              </div>

              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);

                    try {
                      const response = await fetch("/api/medico/especialidades/agregar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          id_medico: usuario?.medico?.id_medico,
                          id_especialidad: formData.get("id_especialidad"),
                          es_principal: formData.get("es_principal") === "on",
                          anos_experiencia: formData.get("anos_experiencia"),
                          institucion_certificadora: formData.get("institucion_certificadora"),
                          fecha_certificacion: formData.get("fecha_certificacion"),
                        }),
                      });

                      const result = await response.json();

                      if (result.success) {
                        setMensaje({
                          tipo: "success",
                          texto: "✅ Especialidad agregada correctamente",
                        });
                        setModalEspecialidad(false);
                        await cargarDatosPerfil();
                      } else {
                        setMensaje({
                          tipo: "error",
                          texto: `❌ ${result.message}`,
                        });
                      }
                    } catch (error) {
                      setMensaje({
                        tipo: "error",
                        texto: "❌ Error al agregar especialidad",
                      });
                    }
                  }}
                  className="space-y-5"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Award className="w-4 h-4" />
                      Especialidad Médica *
                    </label>
                    <select
                      name="id_especialidad"
                      required
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300`}
                    >
                      <option value="">Seleccionar especialidad...</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id_especialidad} value={esp.id_especialidad}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Clock className="w-4 h-4" />
                      Años de Experiencia en esta Especialidad
                    </label>
                    <input
                      type="number"
                      name="anos_experiencia"
                      min="0"
                      max="50"
                      placeholder="Ej: 5"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300`}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Building2 className="w-4 h-4" />
                      Institución Certificadora
                    </label>
                    <input
                      type="text"
                      name="institucion_certificadora"
                      placeholder="Ej: CONACEM, Universidad de Chile"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300`}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className={`block text-sm font-bold mb-2 ${tema.colores.texto} flex items-center gap-2`}>
                      <Calendar className="w-4 h-4" />
                      Fecha de Certificación
                    </label>
                    <input
                      type="date"
                      name="fecha_certificacion"
                      className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300`}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className={`flex items-center gap-3 p-5 rounded-xl ${tema.colores.secundario} cursor-pointer transition-all duration-300 hover:scale-[1.02]`}>
                      <input
                        type="checkbox"
                        name="es_principal"
                        className="w-5 h-5 rounded accent-yellow-600"
                      />
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className={`font-bold ${tema.colores.texto}`}>
                          Marcar como especialidad principal
                        </span>
                      </div>
                    </label>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`p-4 rounded-xl ${tema.colores.info} border`}
                  >
                    <p className={`text-sm font-bold mb-2 flex items-center gap-2`}>
                      <Info className="w-4 h-4" />
                      Información importante:
                    </p>
                    <ul className={`text-xs space-y-1`}>
                      <li>• Solo puedes tener una especialidad marcada como principal</li>
                      <li>• La especialidad principal se mostrará destacada en tu perfil</li>
                      <li>• Puedes agregar múltiples especialidades secundarias</li>
                    </ul>
                  </motion.div>

                  <div className="flex items-center gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setModalEspecialidad(false)}
                      className={`flex-1 px-6 py-4 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300`}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold transition-all duration-300 shadow-2xl flex items-center justify-center gap-2`}
                    >
                      <Plus className="w-5 h-5" />
                      Agregar Especialidad
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESTILOS PERSONALIZADOS PREMIUM */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${["dark", "blue", "purple", "green", "sunset", "ocean", "forest"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            ${["dark", "blue", "purple", "green", "sunset", "ocean", "forest"].includes(temaActual)
              ? "rgba(99, 102, 241, 0.7)"
              : "rgba(99, 102, 241, 0.9)"},
            ${["dark", "blue", "purple", "green", "sunset", "ocean", "forest"].includes(temaActual)
              ? "rgba(139, 92, 246, 0.7)"
              : "rgba(139, 92, 246, 0.9)"}
          );
          border-radius: 10px;
          border: 2px solid ${["dark", "blue", "purple", "green", "sunset", "ocean", "forest"].includes(temaActual)
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            ${["dark", "blue", "purple", "green", "sunset", "ocean", "forest"].includes(temaActual)
              ? "rgba(99, 102, 241, 0.9)"
              : "rgba(99, 102, 241, 1)"},
            ${["dark", "blue", "purple", "green", "sunset", "ocean", "forest"].includes(temaActual)
              ? "rgba(139, 92, 246, 0.9)"
              : "rgba(139, 92, 246, 1)"}
          );
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }

        .animate-pulse-custom {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce-custom {
          animation: bounce 1s infinite;
        }

        /* Efectos de glassmorphism */
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Gradientes animados */
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        /* Efectos de hover premium */
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Efectos de texto brillante */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .text-shimmer {
          background: linear-gradient(
            to right,
            #ffffff 0%,
            #e0e0e0 10%,
            #ffffff 20%,
            #ffffff 100%
          );
          background-size: 1000px 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s infinite linear;
        }

        /* Efectos de partículas */
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(-10px) translateX(-10px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Efectos de loading premium */
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        /* Transiciones suaves */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Efectos de focus premium */
        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Efectos de selección de texto */
        ::selection {
          background-color: rgba(99, 102, 241, 0.3);
          color: inherit;
        }

        ::-moz-selection {
          background-color: rgba(99, 102, 241, 0.3);
          color: inherit;
        }
      `}</style>
    </div>
  );
}




