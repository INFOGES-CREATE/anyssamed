"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Sun,
  Moon,
  Wifi,
  Sparkles,
  Shield,
  Bell,
  Save,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Heart,
  Link as LinkIcon,
  Settings,
  Globe,
  MessageSquare,
  FileText,
  ArrowLeft,
  Monitor,
  Smartphone,
  Zap,
  Award,
  Users,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  FileCheck,
  Camera,
  X,
  Lock,
  Key,
  Database,
  Code,
  Palette,
  DollarSign,
  Calendar,
  BarChart3,
  Sliders,
  Mic,
  Volume2,
  Wifi as WifiIcon,
  HardDrive,
  Cloud,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Copy,
  ExternalLink,
  Info,
  HelpCircle,
  Star,
  TrendingUp,
  Activity,
  Cpu,
  Server,
  Radio,
  Headphones,
  VideoOff,
  MicOff,
  ScreenShare,
  Layout,
  Grid,
  List,
  Maximize2,
  Minimize2,
  RotateCw,
  Power,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume,
  VolumeX,
  Image as ImageIcon,
  Film,
  Music,
  FileVideo,
  FileAudio,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Layers,
  Box,
  Inbox,
  Send,
  Paperclip,
  AtSign,
  Hash,
  Percent,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Columns,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ====================
// TIPOS
// ====================
type TemaColor =
  | "aurora"
  | "midnight"
  | "ocean"
  | "royal"
  | "emerald"
  | "crimson"
  | "platinum"
  | "sunset"
  | "forest"
  | "lavender";

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
    danger: string;
    info: string;
    glass: string;
    glow: string;
  };
}

interface UsuarioSesion {
  id_usuario: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  email: string;
  foto_perfil_url: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  medico?: {
    id_medico: number;
    id_centro_principal: number;
    titulo_profesional: string;
    numero_registro_medico?: string;
  };
}

interface ConfigTelemedicina {
  // Proveedor
  proveedor_video: string;
  proveedor_video_backup: string;
  prefijo_sala: string;
  zona_horaria: string;
  
  // Seguridad
  nivel_seguridad: "normal" | "alto" | "maximo";
  requerir_consentimiento: boolean;
  forzar_2fa_acceso: boolean;
  politica_encriptacion: "auto" | "e2ee" | "hipaa";
  auditoria_detallada: boolean;
  
  // Video y Audio
  calidad_video: "auto" | "sd" | "hd" | "fullhd" | "4k";
  calidad_audio: "auto" | "low" | "medium" | "high" | "studio";
  bitrate_video: number;
  bitrate_audio: number;
  fps_video: number;
  codec_video: string;
  codec_audio: string;
  
  // Grabación
  permitir_grabacion: boolean;
  grabacion_automatica: boolean;
  retencion_grabaciones_dias: number;
  visibilidad_grabacion: "solo_medico" | "medico_paciente" | "equipo_clinico";
  formato_grabacion: "mp4" | "webm" | "mkv";
  calidad_grabacion: "sd" | "hd" | "fullhd";
  
  // Transcripción e IA
  transcripcion_automatica: boolean;
  guardar_transcripcion: boolean;
  generar_resumen_ia: boolean;
  idioma_resumen_ia: string;
  proveedor_ia: string;
  analisis_sentimiento: boolean;
  deteccion_keywords: boolean;
  
  // Sesión
  duracion_sesion_default: number;
  tiempo_buffer_entre_sesiones: number;
  max_participantes: number;
  tiempo_espera_minutos: number;
  permitir_entrada_tardia: boolean;
  minutos_entrada_tardia: number;
  
  // Sala de espera
  sala_espera_virtual: boolean;
  sala_espera_media_url: string;
  mensaje_sala_espera: string;
  permitir_autotest_dispositivo: boolean;
  mostrar_tiempo_espera_estimado: boolean;
  
  // Funcionalidades
  permite_compartir_pantalla: boolean;
  permitir_chat_seguro: boolean;
  permitir_telefono_respaldo: boolean;
  telefono_respaldo_numero: string;
  permitir_pizarra_virtual: boolean;
  permitir_anotaciones: boolean;
  permitir_subir_archivos: boolean;
  tamanio_maximo_archivo: number;
  
  // Notificaciones
  enviar_recordatorios: boolean;
  minutos_recordatorio: number;
  recordatorio_minutos_antes: number;
  notificar_por_email: boolean;
  notificar_por_sms: boolean;
  notificar_por_whatsapp: boolean;
  notificar_por_push: boolean;
  reintentos_notificacion: number;
  prioridad_notificacion: "email" | "sms" | "ambos" | "todos";
  
  // Integraciones
  webhook_eventos: string;
  webhook_eventos_secundario: string;
  api_key_externa: string;
  integracion_calendario: boolean;
  integracion_ehr: boolean;
  integracion_facturacion: boolean;
  
  // Branding
  branding_logo_url: string;
  branding_color_primario: string;
  branding_color_secundario: string;
  branding_fuente: string;
  personalizar_interfaz: boolean;
  
  // Accesibilidad
  idioma_interfaz: string;
  idioma_paciente_preferido: string;
  subtitulos_automaticos: boolean;
  alto_contraste: boolean;
  tamanio_fuente: "small" | "medium" | "large" | "xlarge";
  
  // Rendimiento
  optimizar_ancho_banda: boolean;
  modo_bajo_consumo: boolean;
  precarga_recursos: boolean;
  compresion_datos: boolean;
  
  // Reportes y Analytics
  generar_reportes_automaticos: boolean;
  frecuencia_reportes: "diario" | "semanal" | "mensual";
  metricas_detalladas: boolean;
  exportar_datos: boolean;
  
  // Avanzado
  modo_mantenimiento: boolean;
  motivo_mantenimiento: string;
  consulta_telemedicina_habilitada: boolean;
  publicar_en_portal_paciente: boolean;
  precio_consulta_telemedicina: number;
  horario_atencion: any;
  dias_disponibles: string[];
  configuracion_avanzada: any;
}

interface ProveedorVideo {
  id_proveedor: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  caracteristicas?: string[] | null;
  color?: string | null;
  es_default?: 0 | 1;
  activo?: 0 | 1;
}

// ====================
// TEMAS EXPANDIDOS
// ====================
const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  aurora: {
    nombre: "Aurora Borealis",
    icono: Sparkles,
    colores: {
      fondo: "from-indigo-950 via-purple-950 to-pink-950",
      fondoSecundario: "bg-slate-950",
      texto: "text-white",
      textoSecundario: "text-indigo-300",
      primario:
        "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-indigo-400",
      borde: "border-white/10",
      sombra: "shadow-2xl shadow-indigo-500/30",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-slate-950/50 backdrop-blur-3xl border-white/10",
      header: "bg-slate-950/80 backdrop-blur-3xl border-white/10",
      card: "bg-slate-900/40 backdrop-blur-2xl border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-indigo-500/50",
    },
  },
  midnight: {
    nombre: "Midnight Elegance",
    icono: Moon,
    colores: {
      fondo: "from-gray-950 via-slate-950 to-zinc-950",
      fondoSecundario: "bg-black",
      texto: "text-gray-100",
      textoSecundario: "text-gray-400",
      primario:
        "bg-gradient-to-r from-gray-700 via-slate-700 to-zinc-700 hover:from-gray-600 hover:via-slate-600 hover:to-zinc-600",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-gray-300",
      borde: "border-white/10",
      sombra: "shadow-2xl shadow-black/60",
      gradiente: "from-gray-600 via-slate-600 to-zinc-600",
      sidebar: "bg-black/50 backdrop-blur-3xl border-white/10",
      header: "bg-black/80 backdrop-blur-3xl border-white/10",
      card: "bg-zinc-900/40 backdrop-blur-2xl border-white/10 hover:border-gray-500/50 hover:shadow-2xl hover:shadow-gray-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-gray-500/50",
    },
  },
  ocean: {
    nombre: "Deep Ocean",
    icono: Wifi,
    colores: {
      fondo: "from-cyan-950 via-blue-950 to-indigo-950",
      fondoSecundario: "bg-blue-950",
      texto: "text-cyan-50",
      textoSecundario: "text-cyan-300",
      primario:
        "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-cyan-400",
      borde: "border-cyan-900/50",
      sombra: "shadow-2xl shadow-cyan-500/30",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-950/50 backdrop-blur-3xl border-cyan-900/50",
      header: "bg-blue-950/80 backdrop-blur-3xl border-cyan-900/50",
      card: "bg-blue-900/40 backdrop-blur-2xl border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-cyan-500/50",
    },
  },
  royal: {
    nombre: "Royal Purple",
    icono: Award,
    colores: {
      fondo: "from-purple-950 via-violet-950 to-fuchsia-950",
      fondoSecundario: "bg-purple-950",
      texto: "text-purple-50",
      textoSecundario: "text-purple-300",
      primario:
        "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:via-violet-500 hover:to-fuchsia-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-purple-400",
      borde: "border-purple-900/50",
      sombra: "shadow-2xl shadow-purple-500/30",
      gradiente: "from-purple-500 via-violet-500 to-fuchsia-500",
      sidebar: "bg-purple-950/50 backdrop-blur-3xl border-purple-900/50",
      header: "bg-purple-950/80 backdrop-blur-3xl border-purple-900/50",
      card: "bg-purple-900/40 backdrop-blur-2xl border-purple-900/50 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-purple-500/50",
    },
  },
  emerald: {
    nombre: "Emerald Garden",
    icono: Heart,
    colores: {
      fondo: "from-emerald-950 via-green-950 to-teal-950",
      fondoSecundario: "bg-emerald-950",
      texto: "text-emerald-50",
      textoSecundario: "text-emerald-300",
      primario:
        "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-emerald-400",
      borde: "border-emerald-900/50",
      sombra: "shadow-2xl shadow-emerald-500/30",
      gradiente: "from-emerald-500 via-green-500 to-teal-500",
      sidebar: "bg-emerald-950/50 backdrop-blur-3xl border-emerald-900/50",
      header: "bg-emerald-950/80 backdrop-blur-3xl border-emerald-900/50",
      card: "bg-emerald-900/40 backdrop-blur-2xl border-emerald-900/50 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-teal-500/10 text-teal-300 border-teal-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-emerald-500/50",
    },
  },
  crimson: {
    nombre: "Crimson Passion",
    icono: Heart,
    colores: {
      fondo: "from-rose-950 via-red-950 to-pink-950",
      fondoSecundario: "bg-rose-950",
      texto: "text-rose-50",
      textoSecundario: "text-rose-300",
      primario:
        "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:via-red-500 hover:to-pink-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-rose-400",
      borde: "border-rose-900/50",
      sombra: "shadow-2xl shadow-rose-500/30",
      gradiente: "from-rose-500 via-red-500 to-pink-500",
      sidebar: "bg-rose-950/50 backdrop-blur-3xl border-rose-900/50",
      header: "bg-rose-950/80 backdrop-blur-3xl border-rose-900/50",
      card: "bg-rose-900/40 backdrop-blur-2xl border-rose-900/50 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-rose-500/50",
    },
  },
  platinum: {
    nombre: "Platinum White",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-gray-50 to-zinc-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario:
        "bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 hover:from-slate-700 hover:via-gray-700 hover:to-zinc-700",
      secundario: "bg-black/5 hover:bg-black/10 backdrop-blur-xl",
      acento: "text-slate-700",
      borde: "border-gray-200",
      sombra: "shadow-2xl shadow-gray-400/30",
      gradiente: "from-slate-700 via-gray-700 to-zinc-700",
      sidebar: "bg-white/90 backdrop-blur-3xl border-gray-200",
      header: "bg-white/95 backdrop-blur-3xl border-gray-200",
      card: "bg-white/80 backdrop-blur-2xl border-gray-200 hover:border-slate-400 hover:shadow-2xl hover:shadow-gray-400/20",
      hover: "hover:bg-black/5",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
      glass: "bg-white/60 backdrop-blur-2xl",
      glow: "shadow-lg shadow-gray-400/50",
    },
  },
  sunset: {
    nombre: "Sunset Paradise",
    icono: Sun,
    colores: {
      fondo: "from-orange-950 via-amber-950 to-yellow-950",
      fondoSecundario: "bg-orange-950",
      texto: "text-orange-50",
      textoSecundario: "text-orange-300",
      primario:
        "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-orange-400",
      borde: "border-orange-900/50",
      sombra: "shadow-2xl shadow-orange-500/30",
      gradiente: "from-orange-500 via-amber-500 to-yellow-500",
      sidebar: "bg-orange-950/50 backdrop-blur-3xl border-orange-900/50",
      header: "bg-orange-950/80 backdrop-blur-3xl border-orange-900/50",
      card: "bg-orange-900/40 backdrop-blur-2xl border-orange-900/50 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-orange-500/10 text-orange-300 border-orange-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-orange-500/50",
    },
  },
  forest: {
    nombre: "Forest Mystic",
    icono: Heart,
    colores: {
      fondo: "from-green-950 via-lime-950 to-emerald-950",
      fondoSecundario: "bg-green-950",
      texto: "text-green-50",
      textoSecundario: "text-green-300",
      primario:
        "bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 hover:from-green-500 hover:via-lime-500 hover:to-emerald-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-green-400",
      borde: "border-green-900/50",
      sombra: "shadow-2xl shadow-green-500/30",
      gradiente: "from-green-500 via-lime-500 to-emerald-500",
      sidebar: "bg-green-950/50 backdrop-blur-3xl border-green-900/50",
      header: "bg-green-950/80 backdrop-blur-3xl border-green-900/50",
      card: "bg-green-900/40 backdrop-blur-2xl border-green-900/50 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-green-500/10 text-green-300 border-green-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-green-500/50",
    },
  },
  lavender: {
    nombre: "Lavender Dream",
    icono: Sparkles,
    colores: {
      fondo: "from-violet-950 via-purple-950 to-indigo-950",
      fondoSecundario: "bg-violet-950",
      texto: "text-violet-50",
      textoSecundario: "text-violet-300",
      primario:
        "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500",
      secundario: "bg-white/5 hover:bg-white/10 backdrop-blur-xl",
      acento: "text-violet-400",
      borde: "border-violet-900/50",
      sombra: "shadow-2xl shadow-violet-500/30",
      gradiente: "from-violet-500 via-purple-500 to-indigo-500",
      sidebar: "bg-violet-950/50 backdrop-blur-3xl border-violet-900/50",
      header: "bg-violet-950/80 backdrop-blur-3xl border-violet-900/50",
      card: "bg-violet-900/40 backdrop-blur-2xl border-violet-900/50 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20",
      hover: "hover:bg-white/5",
      success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      danger: "bg-red-500/10 text-red-300 border-red-500/30",
      info: "bg-violet-500/10 text-violet-300 border-violet-500/30",
      glass: "bg-white/5 backdrop-blur-2xl",
      glow: "shadow-lg shadow-violet-500/50",
    },
  },
};

// ====================
// DEFAULTS EXPANDIDOS
// ====================
const CONFIG_DEFAULT: ConfigTelemedicina = {
  // Proveedor
  proveedor_video: "",
  proveedor_video_backup: "",
  prefijo_sala: "med",
  zona_horaria: "America/Santiago",
  
  // Seguridad
  nivel_seguridad: "alto",
  requerir_consentimiento: true,
  forzar_2fa_acceso: false,
  politica_encriptacion: "auto",
  auditoria_detallada: true,
  
  // Video y Audio
  calidad_video: "auto",
  calidad_audio: "auto",
  bitrate_video: 2500,
  bitrate_audio: 128,
  fps_video: 30,
  codec_video: "VP9",
  codec_audio: "Opus",
  
  // Grabación
  permitir_grabacion: false,
  grabacion_automatica: false,
  retencion_grabaciones_dias: 90,
  visibilidad_grabacion: "solo_medico",
  formato_grabacion: "mp4",
  calidad_grabacion: "hd",
  
  // Transcripción e IA
  transcripcion_automatica: false,
  guardar_transcripcion: false,
  generar_resumen_ia: false,
  idioma_resumen_ia: "es",
  proveedor_ia: "openai",
  analisis_sentimiento: false,
  deteccion_keywords: false,
  
  // Sesión
  duracion_sesion_default: 30,
  tiempo_buffer_entre_sesiones: 10,
  max_participantes: 2,
  tiempo_espera_minutos: 15,
  permitir_entrada_tardia: true,
  minutos_entrada_tardia: 10,
  
  // Sala de espera
  sala_espera_virtual: true,
  sala_espera_media_url: "",
  mensaje_sala_espera: "Por favor espere, el médico lo atenderá pronto",
  permitir_autotest_dispositivo: true,
  mostrar_tiempo_espera_estimado: true,
  
  // Funcionalidades
  permite_compartir_pantalla: true,
  permitir_chat_seguro: true,
  permitir_telefono_respaldo: true,
  telefono_respaldo_numero: "",
  permitir_pizarra_virtual: true,
  permitir_anotaciones: true,
  permitir_subir_archivos: true,
  tamanio_maximo_archivo: 10,
  
  // Notificaciones
  enviar_recordatorios: true,
  minutos_recordatorio: 30,
  recordatorio_minutos_antes: 30,
  notificar_por_email: true,
  notificar_por_sms: false,
  notificar_por_whatsapp: false,
  notificar_por_push: true,
  reintentos_notificacion: 3,
  prioridad_notificacion: "email",
  
  // Integraciones
  webhook_eventos: "",
  webhook_eventos_secundario: "",
  api_key_externa: "",
  integracion_calendario: false,
  integracion_ehr: false,
  integracion_facturacion: false,
  
  // Branding
  branding_logo_url: "",
  branding_color_primario: "#6366f1",
  branding_color_secundario: "#8b5cf6",
  branding_fuente: "Inter",
  personalizar_interfaz: false,
  
  // Accesibilidad
  idioma_interfaz: "es",
  idioma_paciente_preferido: "es",
  subtitulos_automaticos: false,
  alto_contraste: false,
  tamanio_fuente: "medium",
  
  // Rendimiento
  optimizar_ancho_banda: true,
  modo_bajo_consumo: false,
  precarga_recursos: true,
  compresion_datos: true,
  
  // Reportes y Analytics
  generar_reportes_automaticos: false,
  frecuencia_reportes: "semanal",
  metricas_detalladas: false,
  exportar_datos: false,
  
  // Avanzado
  modo_mantenimiento: false,
  motivo_mantenimiento: "",
  consulta_telemedicina_habilitada: true,
  publicar_en_portal_paciente: true,
  precio_consulta_telemedicina: 0,
  horario_atencion: {},
  dias_disponibles: [],
  configuracion_avanzada: {},
};

// ====================
// ICONOS DE PROVEEDORES
// ====================
function getProveedorIcon(codigo: string) {
  switch (codigo) {
    case "anyssa_video":
      return Video;
    case "jitsi":
      return Shield;
    case "daily":
      return Zap;
    case "agora":
      return Award;
    case "zoom":
      return Camera;
    case "teams":
      return Users;
    case "webex":
      return Globe;
    default:
      return Video;
  }
}

export default function ConfiguracionTelemedicinaPremium() {
  const router = useRouter();
  const [temaActual, setTemaActual] = useState<TemaColor>("platinum");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [config, setConfig] = useState<ConfigTelemedicina>(CONFIG_DEFAULT);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [seccionExpandida, setSeccionExpandida] = useState<string | null>("proveedor");
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [proveedores, setProveedores] = useState<ProveedorVideo[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");

  // Cargar tema de localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("tema_telemedicina");
      if (t && t in TEMAS) setTemaActual(t as TemaColor);
    }
  }, []);

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setLoading(true);
        // 1. Usuario
        const respUser = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!respUser.ok) throw new Error("No hay sesión activa");
        const dataUser = await respUser.json();
        if (!dataUser.success || !dataUser.usuario) {
          router.push("/login");
          return;
        }
        const rol = dataUser.usuario?.rol?.nombre ?? "";
        const norm = rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        if (!norm.includes("MEDICO") || !dataUser.usuario.medico) {
          router.push("/");
          return;
        }
        setUsuario(dataUser.usuario);

        // 2. Configuración
        const respConf = await fetch("/api/telemedicina/configuracion", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (respConf.ok) {
          const dataConf = await respConf.json();
          if (dataConf.success && dataConf.configuracion) {
            const confRemota = dataConf.configuracion as Partial<ConfigTelemedicina>;
            setConfig((prev) => ({
              ...prev,
              ...confRemota,
            }));
          }
        }

        // 3. Proveedores
        setCargandoProveedores(true);
        const respProv = await fetch("/api/telemedicina/proveedores", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (respProv.ok) {
          const dataProv = await respProv.json();
          if (dataProv.success && Array.isArray(dataProv.proveedores)) {
            setProveedores(dataProv.proveedores);
            if (!config.proveedor_video) {
              const def = dataProv.proveedores.find((p: ProveedorVideo) => p.es_default === 1);
              if (def) {
                setConfig((prev) => ({ ...prev, proveedor_video: def.codigo }));
              }
            }
          } else {
            setProveedores([]);
          }
        } else {
          setProveedores([]);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "No se pudo cargar la configuración");
      } finally {
        setCargandoProveedores(false);
        setLoading(false);
      }
    };
    cargarTodo();
  }, [router]);

  const handleChange = useCallback(
    <K extends keyof ConfigTelemedicina>(key: K, value: ConfigTelemedicina[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);
      const payload: ConfigTelemedicina = {
        ...config,
        proveedor_video: config.proveedor_video,
      };

      const resp = await fetch("/api/telemedicina/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "No se pudo guardar");
      }
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarTema = useCallback((nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_telemedicina", nuevoTema);
    }
  }, []);

  const toggleSeccion = useCallback((seccion: string) => {
    setSeccionExpandida((prev) => (prev === seccion ? null : seccion));
  }, []);

  // Stats mejorados
  const stats = useMemo(() => {
    const configuraciones_activas = Object.values(config).filter((v) => v === true).length;
    const notificaciones_habilitadas =
      (config.enviar_recordatorios ? 1 : 0) +
      (config.notificar_por_email ? 1 : 0) +
      (config.notificar_por_sms ? 1 : 0) +
      (config.notificar_por_whatsapp ? 1 : 0) +
      (config.notificar_por_push ? 1 : 0);
    const funciones_premium = [
      config.permitir_grabacion,
      config.transcripcion_automatica,
      config.permite_compartir_pantalla,
      config.generar_resumen_ia,
      config.permitir_pizarra_virtual,
      config.analisis_sentimiento,
    ].filter(Boolean).length;
    const integraciones_activas = [
      config.integracion_calendario,
      config.integracion_ehr,
      config.integracion_facturacion,
      config.webhook_eventos ? true : false,
    ].filter(Boolean).length;
    return {
      configuraciones_activas,
      notificaciones_habilitadas,
      funciones_premium,
      integraciones_activas,
    };
  }, [config]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
      >
        <div className="text-center relative z-10">
          <div className="relative mb-10">
            <div
              className="w-40 h-40 rounded-full border-4 border-transparent bg-gradient-to-r from-transparent via-indigo-500 to-transparent bg-clip-border animate-spin mx-auto absolute inset-0"
              aria-hidden
            ></div>
            <div className={`w-40 h-40 rounded-full border-4 ${tema.colores.borde} animate-spin mx-auto`}></div>
            <div
              className={`w-28 h-28 rounded-3xl ${tema.colores.glass} ${tema.colores.borde} border-2 flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${tema.colores.sombra}`}
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl animate-pulse`}
              >
                <Settings className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h2
            className={`text-4xl font-black mb-2 ${tema.colores.texto} bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}
          >
            Cargando configuración
          </h2>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>Telemedicina premium…</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo} p-6`}
      >
        <div
          className={`text-center max-w-md mx-auto p-12 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border-2`}
        >
          <div
            className={`w-24 h-24 rounded-3xl ${tema.colores.danger} ${tema.colores.borde} border-2 flex items-center justify-center mx-auto mb-6 shadow-xl`}
          >
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Sesión no válida</h2>
          <p className={`${tema.colores.textoSecundario} mb-6`}>Por favor, inicia sesión nuevamente.</p>
          <button
            onClick={() => router.push("/login")}
            className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold shadow-lg`}
          >
            Ir a login
          </button>
        </div>
      </div>
    );
  }

  const proveedorSeleccionado = proveedores.find(
    (p) => p.codigo === config.proveedor_video
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} relative overflow-hidden`}
    >
      {/* HEADER */}
      <header
        className={`${tema.colores.header} ${tema.colores.borde} border-b sticky top-0 z-50 ${tema.colores.sombra}`}
      >
        <div className="max-w-[1920px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/medico/telemedicina")}
                className={`p-4 rounded-2xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 ${tema.colores.borde} border`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-2xl`}
                >
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1
                      className={`text-3xl font-black bg-gradient-to-r ${tema.colores.gradiente} bg-clip-text text-transparent`}
                    >
                      Configuración de Telemedicina
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold border border-white/20 shadow-lg">
                      PREMIUM PRO
                    </span>
                  </div>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Proveedor: {proveedorSeleccionado?.nombre ?? "sin asignar"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar configuración..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={`pl-10 pr-4 py-3 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border ${tema.colores.texto} text-sm w-64`}
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => setMostrarVistaPrevia((p) => !p)}
                className={`px-4 py-3 rounded-2xl ${
                  mostrarVistaPrevia
                    ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                } text-sm font-bold flex items-center gap-2 ${tema.colores.borde} border transition-all duration-300`}
              >
                {mostrarVistaPrevia ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Vista previa
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${tema.colores.gradiente} text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60 transition-all duration-300 hover:scale-105 shadow-lg ${tema.colores.glow}`}
              >
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
              <div
                className={`hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl ${tema.colores.glass} ${tema.colores.borde} border`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold">{usuario.nombre}</p>
                  <p className="text-[10px] text-gray-400">
                    {usuario.medico?.titulo_profesional || "Médico"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats mejorados */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-5">
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-indigo-500" />
                <p className="text-[10px] text-gray-400 uppercase font-bold">Proveedor</p>
              </div>
              <p className="text-sm font-bold">{proveedorSeleccionado?.nombre ?? "No asignado"}</p>
              <p className="text-[10px] text-emerald-500 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Activo
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <p className="text-[10px] text-gray-400 uppercase font-bold">Seguridad</p>
              </div>
              <p className="text-sm font-bold">{config.nivel_seguridad.toUpperCase()}</p>
              <p className="text-[10px] text-purple-500 mt-2">{config.politica_encriptacion}</p>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <p className="text-[10px] text-gray-400 uppercase font-bold">Notificaciones</p>
              </div>
              <p className="text-sm font-bold">{stats.notificaciones_habilitadas}/5</p>
              <p className="text-[10px] text-amber-500 mt-2">Canales activos</p>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-pink-500" />
                <p className="text-[10px] text-gray-400 uppercase font-bold">Premium</p>
              </div>
              <p className="text-sm font-bold">{stats.funciones_premium}/6</p>
              <p className="text-[10px] text-pink-500 mt-2">Funciones activas</p>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] text-gray-400 uppercase font-bold">Integraciones</p>
              </div>
              <p className="text-sm font-bold">{stats.integraciones_activas}/4</p>
              <p className="text-[10px] text-blue-500 mt-2">Conectadas</p>
            </div>
            <div className={`p-4 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-500" />
                <p className="text-[10px] text-gray-400 uppercase font-bold">Estado</p>
              </div>
              <p className="text-sm font-bold">Operativo</p>
              <p className="text-[10px] text-green-500 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% uptime
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-[1920px] mx-auto px-8 py-8">
        {/* Barra de temas expandida */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Paleta de apariencia premium
            </p>
            <button
              className={`px-3 py-1.5 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold flex items-center gap-2`}
            >
              <RefreshCw className="w-3 h-3" />
              Restablecer
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {Object.entries(TEMAS).map(([key, t]) => {
              const Icono = t.icono;
              const activo = temaActual === key;
              return (
                <button
                  key={key}
                  onClick={() => cambiarTema(key as TemaColor)}
                  className={`min-w-[180px] rounded-2xl border px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
                    activo
                      ? `bg-gradient-to-r ${tema.colores.gradiente} text-white border-transparent shadow-lg scale-105`
                      : `${tema.colores.card} ${tema.colores.borde} border hover:border-slate-300 hover:scale-102`
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.colores.gradiente} flex items-center justify-center text-white shadow`}
                  >
                    <Icono className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">{t.nombre}</p>
                    <p
                      className={`text-[9px] ${
                        activo ? "text-white/80" : "text-gray-400"
                      } leading-tight`}
                    >
                      {key === "platinum"
                        ? "Blanco premium"
                        : key === "aurora"
                        ? "Vibrante"
                        : key === "midnight"
                        ? "Oscuro"
                        : key === "ocean"
                        ? "Sereno"
                        : key === "royal"
                        ? "Lujo"
                        : key === "emerald"
                        ? "Natural"
                        : key === "crimson"
                        ? "Intenso"
                        : key === "sunset"
                        ? "Cálido"
                        : key === "forest"
                        ? "Místico"
                        : "Soñador"}
                    </p>
                  </div>
                  {activo && <CheckCircle2 className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl ${tema.colores.danger} ${tema.colores.borde} border px-6 py-4 mb-6 flex items-start gap-4`}
            >
              <AlertTriangle className="w-5 h-5 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-bold">Error</p>
                <p className="text-xs">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {exito && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl ${tema.colores.success} ${tema.colores.borde} border px-6 py-4 mb-6 flex items-center gap-4`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-xs font-bold">Configuración guardada exitosamente.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`grid grid-cols-1 ${
            mostrarVistaPrevia ? "lg:grid-cols-3" : "lg:grid-cols-12"
          } gap-8`}
        >
          {/* Contenido principal */}
          <div className={`${mostrarVistaPrevia ? "lg:col-span-2" : "lg:col-span-9"} space-y-6`}>
            {/* SECCIÓN: PROVEEDOR DE VIDEO */}
            <SeccionConfig
              id="proveedor"
              titulo="Proveedor de Video"
              descripcion="Configuración del servicio de videollamadas"
              icono={Video}
                            tema={tema}
              expandida={seccionExpandida === "proveedor"}
              onToggle={() => toggleSeccion("proveedor")}
            >
              {cargandoProveedores ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <p className="ml-3 text-sm text-gray-400">Cargando proveedores...</p>
                </div>
              ) : proveedores.length === 0 ? (
                <div className={`p-6 rounded-xl ${tema.colores.warning} ${tema.colores.borde} border`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-2">No hay proveedores disponibles</p>
                      <p className="text-xs opacity-80">
                        Debe configurar al menos un proveedor en la tabla{" "}
                        <code className="px-2 py-0.5 bg-white/20 rounded">telemedicina_proveedores</code>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                    {proveedores.map((p) => {
                      const Icono = getProveedorIcon(p.codigo);
                      const seleccionado = config.proveedor_video === p.codigo;
                      return (
                        <motion.button
                          key={p.id_proveedor}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChange("proveedor_video", p.codigo)}
                          className={`rounded-2xl p-5 text-left border-2 transition-all duration-300 ${
                            seleccionado
                              ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl"
                              : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                                p.color || "from-indigo-500 to-blue-600"
                              } flex items-center justify-center text-white shadow-lg`}
                            >
                              <Icono className="w-6 h-6" />
                            </div>
                            {seleccionado ? (
                              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold shadow-lg">
                                ✓ Activo
                              </span>
                            ) : p.es_default ? (
                              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <p className="text-base font-bold mb-2 text-gray-900">{p.nombre}</p>
                          {p.descripcion && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.descripcion}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {(p.caracteristicas || []).map((f) => (
                              <span
                                key={f}
                                className="px-2 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 text-[9px] text-gray-600 font-medium border border-gray-200"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CampoConfig
                      label="Prefijo de sala"
                      icono={LinkIcon}
                      descripcion="Identificador único para las salas"
                      tema={tema}
                    >
                      <input
                        value={config.prefijo_sala}
                        onChange={(e) =>
                          handleChange("prefijo_sala", e.target.value.replace(/\s/g, "").toLowerCase())
                        }
                        placeholder="med"
                        className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Ejemplo: {config.prefijo_sala || "med"}-{Math.floor(Math.random() * 999999)}
                      </p>
                    </CampoConfig>

                    <CampoConfig
                      label="Proveedor de respaldo"
                      icono={Shield}
                      descripcion="Alternativa en caso de fallo"
                      tema={tema}
                    >
                      <select
                        value={config.proveedor_video_backup}
                        onChange={(e) => handleChange("proveedor_video_backup", e.target.value)}
                        className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                      >
                        <option value="">Sin respaldo</option>
                        {proveedores
                          .filter((p) => p.codigo !== config.proveedor_video)
                          .map((p) => (
                            <option key={p.id_proveedor} value={p.codigo}>
                              {p.nombre}
                            </option>
                          ))}
                      </select>
                    </CampoConfig>

                    <CampoConfig
                      label="Zona horaria"
                      icono={Globe}
                      descripcion="Horario para las sesiones"
                      tema={tema}
                    >
                      <select
                        value={config.zona_horaria}
                        onChange={(e) => handleChange("zona_horaria", e.target.value)}
                        className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                      >
                        <option value="America/Santiago">Santiago (GMT-3)</option>
                        <option value="America/Lima">Lima (GMT-5)</option>
                        <option value="America/Bogota">Bogotá (GMT-5)</option>
                        <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                        <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                        <option value="America/Caracas">Caracas (GMT-4)</option>
                        <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      </select>
                    </CampoConfig>
                  </div>
                </>
              )}
            </SeccionConfig>

            {/* SECCIÓN: VIDEO Y AUDIO */}
            <SeccionConfig
              id="video-audio"
              titulo="Calidad de Video y Audio"
              descripcion="Configuración avanzada de multimedia"
              icono={Monitor}
              tema={tema}
              expandida={seccionExpandida === "video-audio"}
              onToggle={() => toggleSeccion("video-audio")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CampoConfig
                  label="Calidad de video"
                  icono={Video}
                  descripcion="Resolución de transmisión"
                  tema={tema}
                >
                  <select
                    value={config.calidad_video}
                    onChange={(e) => handleChange("calidad_video", e.target.value as any)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="auto">Automática (Recomendado)</option>
                    <option value="sd">SD - 480p</option>
                    <option value="hd">HD - 720p</option>
                    <option value="fullhd">Full HD - 1080p</option>
                    <option value="4k">4K - 2160p (Premium)</option>
                  </select>
                </CampoConfig>

                <CampoConfig
                  label="Calidad de audio"
                  icono={Headphones}
                  descripcion="Bitrate de audio"
                  tema={tema}
                >
                  <select
                    value={config.calidad_audio}
                    onChange={(e) => handleChange("calidad_audio", e.target.value as any)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="auto">Automática</option>
                    <option value="low">Baja (64 kbps)</option>
                    <option value="medium">Media (128 kbps)</option>
                    <option value="high">Alta (256 kbps)</option>
                    <option value="studio">Estudio (320 kbps)</option>
                  </select>
                </CampoConfig>

                <CampoConfig
                  label="Frames por segundo"
                  icono={Activity}
                  descripcion="Fluidez del video"
                  tema={tema}
                >
                  <select
                    value={config.fps_video}
                    onChange={(e) => handleChange("fps_video", Number(e.target.value))}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value={15}>15 FPS</option>
                    <option value={24}>24 FPS</option>
                    <option value={30}>30 FPS (Recomendado)</option>
                    <option value={60}>60 FPS (Premium)</option>
                  </select>
                </CampoConfig>

                <CampoConfig
                  label="Bitrate de video (kbps)"
                  icono={TrendingUp}
                  descripcion="Calidad vs. ancho de banda"
                  tema={tema}
                >
                  <input
                    type="range"
                    min={500}
                    max={8000}
                    step={100}
                    value={config.bitrate_video}
                    onChange={(e) => handleChange("bitrate_video", Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>500</span>
                    <span className="font-bold text-indigo-600">{config.bitrate_video} kbps</span>
                    <span>8000</span>
                  </div>
                </CampoConfig>

                <CampoConfig
                  label="Codec de video"
                  icono={Code}
                  descripcion="Algoritmo de compresión"
                  tema={tema}
                >
                  <select
                    value={config.codec_video}
                    onChange={(e) => handleChange("codec_video", e.target.value)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="VP9">VP9 (Recomendado)</option>
                    <option value="VP8">VP8</option>
                    <option value="H264">H.264</option>
                    <option value="H265">H.265 (HEVC)</option>
                    <option value="AV1">AV1 (Experimental)</option>
                  </select>
                </CampoConfig>

                <CampoConfig
                  label="Codec de audio"
                  icono={Mic}
                  descripcion="Formato de audio"
                  tema={tema}
                >
                  <select
                    value={config.codec_audio}
                    onChange={(e) => handleChange("codec_audio", e.target.value)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="Opus">Opus (Recomendado)</option>
                    <option value="AAC">AAC</option>
                    <option value="MP3">MP3</option>
                    <option value="FLAC">FLAC (Sin pérdida)</option>
                  </select>
                </CampoConfig>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <OpcionToggle
                  label="Optimizar ancho de banda"
                  descripcion="Ajuste automático según conexión"
                  icono={WifiIcon}
                  checked={config.optimizar_ancho_banda}
                  onChange={(v) => handleChange("optimizar_ancho_banda", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Modo bajo consumo"
                  descripcion="Reduce calidad para ahorrar datos"
                  icono={Zap}
                  checked={config.modo_bajo_consumo}
                  onChange={(v) => handleChange("modo_bajo_consumo", v)}
                  tema={tema}
                />
              </div>
            </SeccionConfig>

            {/* SECCIÓN: SEGURIDAD Y PRIVACIDAD */}
            <SeccionConfig
              id="seguridad"
              titulo="Seguridad y Privacidad"
              descripcion="Protección de datos y cumplimiento normativo"
              icono={Shield}
              tema={tema}
              expandida={seccionExpandida === "seguridad"}
              onToggle={() => toggleSeccion("seguridad")}
            >
              <div className="mb-6">
                <p className="text-xs font-bold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  Nivel de seguridad
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: "normal",
                      label: "Normal",
                      desc: "Protección estándar",
                      icon: Shield,
                      color: "from-blue-500 to-cyan-500",
                    },
                    {
                      id: "alto",
                      label: "Alto",
                      desc: "Recomendado para uso médico",
                      icon: Lock,
                      color: "from-indigo-500 to-purple-500",
                    },
                    {
                      id: "maximo",
                      label: "Máximo",
                      desc: "Cumplimiento HIPAA/GDPR",
                      icon: Key,
                      color: "from-purple-500 to-pink-500",
                    },
                  ].map((nivel) => {
                    const seleccionado = config.nivel_seguridad === nivel.id;
                    return (
                      <motion.button
                        key={nivel.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChange("nivel_seguridad", nivel.id as any)}
                        className={`rounded-xl p-4 border-2 text-left transition-all duration-300 ${
                          seleccionado
                            ? `border-transparent bg-gradient-to-br ${nivel.color} text-white shadow-xl`
                            : "border-gray-200 bg-white hover:border-indigo-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              seleccionado ? "bg-white/20" : `bg-gradient-to-br ${nivel.color}`
                            }`}
                          >
                            <nivel.icon className={`w-5 h-5 ${seleccionado ? "text-white" : "text-white"}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${seleccionado ? "text-white" : "text-gray-900"}`}>
                              {nivel.label}
                            </p>
                            <p
                              className={`text-[10px] ${
                                seleccionado ? "text-white/80" : "text-gray-500"
                              }`}
                            >
                              {nivel.desc}
                            </p>
                          </div>
                        </div>
                        {seleccionado && (
                          <div className="flex items-center gap-1 text-xs font-bold text-white/90">
                            <CheckCircle2 className="w-3 h-3" />
                            Activo
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  Política de encriptación
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "auto", label: "Automática", desc: "Adaptativa según nivel" },
                    { id: "e2ee", label: "End-to-End", desc: "Encriptación punto a punto" },
                    { id: "hipaa", label: "HIPAA Compliant", desc: "Cumplimiento normativo" },
                  ].map((pol) => {
                    const seleccionado = config.politica_encriptacion === pol.id;
                    return (
                      <button
                        key={pol.id}
                        onClick={() => handleChange("politica_encriptacion", pol.id as any)}
                        className={`rounded-xl p-3 border-2 text-left transition-all ${
                          seleccionado
                            ? "border-purple-400 bg-purple-50"
                            : "border-gray-200 bg-white hover:border-purple-200"
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-900">{pol.label}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{pol.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OpcionToggle
                  label="Requerir consentimiento informado"
                  descripcion="Obligatorio antes de iniciar sesión"
                  icono={FileCheck}
                  checked={config.requerir_consentimiento}
                  onChange={(v) => handleChange("requerir_consentimiento", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Forzar autenticación 2FA"
                  descripcion="Doble factor para acceso"
                  icono={Key}
                  checked={config.forzar_2fa_acceso}
                  onChange={(v) => handleChange("forzar_2fa_acceso", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Auditoría detallada"
                  descripcion="Registro completo de eventos"
                  icono={Database}
                  checked={config.auditoria_detallada}
                  onChange={(v) => handleChange("auditoria_detallada", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Permitir grabación"
                  descripcion="Grabar sesiones de telemedicina"
                  icono={Camera}
                  checked={config.permitir_grabacion}
                  onChange={(v) => handleChange("permitir_grabacion", v)}
                  tema={tema}
                />
              </div>

              {config.permitir_grabacion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <CampoConfig
                    label="Formato de grabación"
                    icono={FileVideo}
                    descripcion="Formato del archivo"
                    tema={tema}
                  >
                    <select
                      value={config.formato_grabacion}
                      onChange={(e) => handleChange("formato_grabacion", e.target.value as any)}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    >
                      <option value="mp4">MP4 (Recomendado)</option>
                      <option value="webm">WebM</option>
                      <option value="mkv">MKV</option>
                    </select>
                  </CampoConfig>

                  <CampoConfig
                    label="Calidad de grabación"
                    icono={Monitor}
                    descripcion="Resolución del video"
                    tema={tema}
                  >
                    <select
                      value={config.calidad_grabacion}
                      onChange={(e) => handleChange("calidad_grabacion", e.target.value as any)}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    >
                      <option value="sd">SD (480p)</option>
                      <option value="hd">HD (720p)</option>
                      <option value="fullhd">Full HD (1080p)</option>
                    </select>
                  </CampoConfig>

                  <CampoConfig
                    label="Retención (días)"
                    icono={Clock}
                    descripcion="Tiempo de almacenamiento"
                    tema={tema}
                  >
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={config.retencion_grabaciones_dias}
                      onChange={(e) => handleChange("retencion_grabaciones_dias", Number(e.target.value))}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </CampoConfig>

                  <div className="md:col-span-3">
                    <OpcionToggle
                      label="Grabación automática"
                      descripcion="Iniciar grabación al comenzar sesión"
                      icono={PlayCircle}
                      checked={config.grabacion_automatica}
                      onChange={(v) => handleChange("grabacion_automatica", v)}
                      tema={tema}
                    />
                  </div>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: TRANSCRIPCIÓN E IA */}
            <SeccionConfig
              id="ia"
              titulo="Inteligencia Artificial y Transcripción"
              descripcion="Análisis automático y procesamiento de lenguaje"
              icono={Cpu}
              tema={tema}
              expandida={seccionExpandida === "ia"}
              onToggle={() => toggleSeccion("ia")}
              premium
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <OpcionToggle
                  label="Transcripción automática"
                  descripcion="Convertir audio a texto en tiempo real"
                  icono={FileText}
                  checked={config.transcripcion_automatica}
                  onChange={(v) => handleChange("transcripcion_automatica", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Guardar transcripción"
                  descripcion="Almacenar texto en base de datos"
                  icono={Database}
                  checked={config.guardar_transcripcion}
                  onChange={(v) => handleChange("guardar_transcripcion", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Generar resumen con IA"
                  descripcion="Resumen automático de la consulta"
                  icono={Sparkles}
                  checked={config.generar_resumen_ia}
                  onChange={(v) => handleChange("generar_resumen_ia", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Análisis de sentimiento"
                  descripcion="Detectar emociones del paciente"
                  icono={Heart}
                  checked={config.analisis_sentimiento}
                  onChange={(v) => handleChange("analisis_sentimiento", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Detección de palabras clave"
                  descripcion="Identificar síntomas y diagnósticos"
                  icono={Search}
                  checked={config.deteccion_keywords}
                  onChange={(v) => handleChange("deteccion_keywords", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Subtítulos automáticos"
                  descripcion="Para accesibilidad"
                  icono={Type}
                  checked={config.subtitulos_automaticos}
                  onChange={(v) => handleChange("subtitulos_automaticos", v)}
                  tema={tema}
                />
              </div>

              {(config.generar_resumen_ia || config.transcripcion_automatica) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <CampoConfig
                    label="Proveedor de IA"
                    icono={Cpu}
                    descripcion="Servicio de inteligencia artificial"
                    tema={tema}
                  >
                    <select
                      value={config.proveedor_ia}
                      onChange={(e) => handleChange("proveedor_ia", e.target.value)}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    >
                      <option value="openai">OpenAI GPT-4</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="google">Google Gemini</option>
                      <option value="azure">Azure OpenAI</option>
                      <option value="local">Modelo local</option>
                    </select>
                  </CampoConfig>

                  <CampoConfig
                    label="Idioma del resumen"
                    icono={Globe}
                    descripcion="Idioma de salida"
                    tema={tema}
                  >
                    <select
                      value={config.idioma_resumen_ia}
                      onChange={(e) => handleChange("idioma_resumen_ia", e.target.value)}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </CampoConfig>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: SESIÓN Y PARTICIPANTES */}
            <SeccionConfig
              id="sesion"
              titulo="Configuración de Sesión"
              descripcion="Duración, participantes y tiempos de espera"
              icono={Clock}
              tema={tema}
              expandida={seccionExpandida === "sesion"}
              onToggle={() => toggleSeccion("sesion")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CampoConfig
                  label="Duración por defecto (min)"
                  icono={Clock}
                  descripcion="Tiempo estándar de consulta"
                  tema={tema}
                >
                  <input
                    type="number"
                    min={5}
                    max={180}
                    step={5}
                    value={config.duracion_sesion_default}
                    onChange={(e) => handleChange("duracion_sesion_default", Number(e.target.value))}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                </CampoConfig>

                <CampoConfig
                  label="Buffer entre sesiones (min)"
                  icono={Calendar}
                  descripcion="Tiempo de preparación"
                  tema={tema}
                >
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={5}
                    value={config.tiempo_buffer_entre_sesiones}
                    onChange={(e) => handleChange("tiempo_buffer_entre_sesiones", Number(e.target.value))}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                </CampoConfig>

                <CampoConfig
                  label="Máximo de participantes"
                  icono={Users}
                  descripcion="Incluye médico y paciente"
                  tema={tema}
                >
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={config.max_participantes}
                    onChange={(e) => handleChange("max_participantes", Number(e.target.value))}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                </CampoConfig>

                <CampoConfig
                  label="Tiempo de espera (min)"
                  icono={Clock}
                  descripcion="Antes de cancelar automáticamente"
                  tema={tema}
                >
                  <input
                    type="number"
                    min={5}
                    max={60}
                    step={5}
                    value={config.tiempo_espera_minutos}
                    onChange={(e) => handleChange("tiempo_espera_minutos", Number(e.target.value))}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                </CampoConfig>

                <CampoConfig
                  label="Entrada tardía (min)"
                  icono={Clock}
                  descripcion="Tiempo permitido de retraso"
                  tema={tema}
                >
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={5}
                    value={config.minutos_entrada_tardia}
                    onChange={(e) => handleChange("minutos_entrada_tardia", Number(e.target.value))}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    disabled={!config.permitir_entrada_tardia}
                  />
                </CampoConfig>

                <div className="flex items-center">
                  <OpcionToggle
                    label="Permitir entrada tardía"
                    descripcion="Unirse después del inicio"
                    icono={Clock}
                    checked={config.permitir_entrada_tardia}
                    onChange={(v) => handleChange("permitir_entrada_tardia", v)}
                    tema={tema}
                  />
                </div>
              </div>
            </SeccionConfig>

            {/* SECCIÓN: SALA DE ESPERA */}
            <SeccionConfig
              id="sala-espera"
              titulo="Sala de Espera Virtual"
              descripcion="Experiencia del paciente antes de la consulta"
              icono={Users}
              tema={tema}
              expandida={seccionExpandida === "sala-espera"}
              onToggle={() => toggleSeccion("sala-espera")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <OpcionToggle
                  label="Habilitar sala de espera"
                  descripcion="Pacientes esperan antes de entrar"
                  icono={Users}
                  checked={config.sala_espera_virtual}
                  onChange={(v) => handleChange("sala_espera_virtual", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Autotest de dispositivos"
                  descripcion="Verificar cámara y micrófono"
                  icono={Camera}
                  checked={config.permitir_autotest_dispositivo}
                  onChange={(v) => handleChange("permitir_autotest_dispositivo", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Mostrar tiempo estimado"
                  descripcion="Informar tiempo de espera"
                  icono={Clock}
                  checked={config.mostrar_tiempo_espera_estimado}
                  onChange={(v) => handleChange("mostrar_tiempo_espera_estimado", v)}
                  tema={tema}
                />
              </div>

              {config.sala_espera_virtual && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <CampoConfig
                    label="URL de multimedia"
                    icono={Film}
                    descripcion="Video o imagen para la sala de espera"
                    tema={tema}
                  >
                    <input
                      type="url"
                      value={config.sala_espera_media_url}
                      onChange={(e) => handleChange("sala_espera_media_url", e.target.value)}
                      placeholder="https://ejemplo.com/video-espera.mp4"
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </CampoConfig>

                  <CampoConfig
                    label="Mensaje de bienvenida"
                    icono={MessageSquare}
                    descripcion="Texto mostrado en la sala de espera"
                    tema={tema}
                  >
                    <textarea
                      value={config.mensaje_sala_espera}
                      onChange={(e) => handleChange("mensaje_sala_espera", e.target.value)}
                      placeholder="Bienvenido a su consulta médica virtual..."
                      rows={3}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
                    />
                  </CampoConfig>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: FUNCIONALIDADES */}
            <SeccionConfig
              id="funcionalidades"
              titulo="Funcionalidades Avanzadas"
              descripcion="Herramientas y características adicionales"
              icono={Sliders}
              tema={tema}
              expandida={seccionExpandida === "funcionalidades"}
              onToggle={() => toggleSeccion("funcionalidades")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OpcionToggle
                  label="Compartir pantalla"
                  descripcion="Mostrar documentos y resultados"
                  icono={ScreenShare}
                  checked={config.permite_compartir_pantalla}
                  onChange={(v) => handleChange("permite_compartir_pantalla", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Chat seguro"
                  descripcion="Mensajería encriptada"
                  icono={MessageSquare}
                  checked={config.permitir_chat_seguro}
                  onChange={(v) => handleChange("permitir_chat_seguro", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Pizarra virtual"
                  descripcion="Dibujar y anotar en tiempo real"
                  icono={Layout}
                  checked={config.permitir_pizarra_virtual}
                  onChange={(v) => handleChange("permitir_pizarra_virtual", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Anotaciones"
                  descripcion="Marcar y comentar documentos"
                  icono={FileText}
                  checked={config.permitir_anotaciones}
                  onChange={(v) => handleChange("permitir_anotaciones", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Subir archivos"
                  descripcion="Compartir documentos médicos"
                  icono={Upload}
                  checked={config.permitir_subir_archivos}
                  onChange={(v) => handleChange("permitir_subir_archivos", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Teléfono de respaldo"
                  descripcion="Alternativa si falla el video"
                  icono={Phone}
                  checked={config.permitir_telefono_respaldo}
                  onChange={(v) => handleChange("permitir_telefono_respaldo", v)}
                  tema={tema}
                />
              </div>

              {config.permitir_subir_archivos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <CampoConfig
                    label="Tamaño máximo de archivo (MB)"
                    icono={HardDrive}
                    descripcion="Límite de carga por archivo"
                    tema={tema}
                  >
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={config.tamanio_maximo_archivo}
                      onChange={(e) => handleChange("tamanio_maximo_archivo", Number(e.target.value))}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </CampoConfig>
                </motion.div>
              )}

              {config.permitir_telefono_respaldo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <CampoConfig
                    label="Número de teléfono de respaldo"
                    icono={Phone}
                    descripcion="Mostrado si falla la videollamada"
                    tema={tema}
                  >
                    <input
                      type="tel"
                      value={config.telefono_respaldo_numero}
                      onChange={(e) => handleChange("telefono_respaldo_numero", e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </CampoConfig>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: NOTIFICACIONES */}
            <SeccionConfig
              id="notificaciones"
              titulo="Notificaciones y Recordatorios"
              descripcion="Comunicación automática con pacientes"
              icono={Bell}
              tema={tema}
              expandida={seccionExpandida === "notificaciones"}
              onToggle={() => toggleSeccion("notificaciones")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <OpcionToggle
                  label="Enviar recordatorios"
                  descripcion="Notificar antes de la consulta"
                  icono={Bell}
                  checked={config.enviar_recordatorios}
                  onChange={(v) => handleChange("enviar_recordatorios", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Notificar por email"
                  descripcion="Correo electrónico"
                  icono={Mail}
                  checked={config.notificar_por_email}
                  onChange={(v) => handleChange("notificar_por_email", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Notificar por SMS"
                  descripcion="Mensaje de texto"
                  icono={Smartphone}
                  checked={config.notificar_por_sms}
                  onChange={(v) => handleChange("notificar_por_sms", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Notificar por WhatsApp"
                  descripcion="Mensaje de WhatsApp"
                  icono={MessageSquare}
                  checked={config.notificar_por_whatsapp}
                  onChange={(v) => handleChange("notificar_por_whatsapp", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Notificaciones push"
                  descripcion="Notificaciones en la app"
                  icono={Bell}
                  checked={config.notificar_por_push}
                  onChange={(v) => handleChange("notificar_por_push", v)}
                  tema={tema}
                />
              </div>

              {config.enviar_recordatorios && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <CampoConfig
                    label="Minutos antes del recordatorio"
                    icono={Clock}
                    descripcion="Tiempo de anticipación"
                    tema={tema}
                  >
                    <input
                      type="range"
                      min={5}
                      max={1440}
                      step={5}
                      value={config.minutos_recordatorio}
                      onChange={(e) => handleChange("minutos_recordatorio", Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>5 min</span>
                      <span className="font-bold text-indigo-600">
                        {config.minutos_recordatorio >= 60
                          ? `${Math.floor(config.minutos_recordatorio / 60)}h ${
                              config.minutos_recordatorio % 60
                            }min`
                          : `${config.minutos_recordatorio} min`}
                      </span>
                      <span>24h</span>
                    </div>
                  </CampoConfig>

                  <CampoConfig
                    label="Reintentos de notificación"
                    icono={RefreshCw}
                    descripcion="Si falla el envío"
                    tema={tema}
                  >
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={config.reintentos_notificacion}
                      onChange={(e) => handleChange("reintentos_notificacion", Number(e.target.value))}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </CampoConfig>

                  <CampoConfig
                    label="Prioridad de notificación"
                    icono={Star}
                    descripcion="Canal preferido"
                    tema={tema}
                  >
                    <select
                      value={config.prioridad_notificacion}
                      onChange={(e) => handleChange("prioridad_notificacion", e.target.value as any)}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    >
                      <option value="email">Solo Email</option>
                      <option value="sms">Solo SMS</option>
                      <option value="ambos">Email + SMS</option>
                      <option value="todos">Todos los canales</option>
                    </select>
                  </CampoConfig>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: INTEGRACIONES */}
            <SeccionConfig
              id="integraciones"
              titulo="Integraciones y Webhooks"
              descripcion="Conectar con sistemas externos"
              icono={LinkIcon}
              tema={tema}
              expandida={seccionExpandida === "integraciones"}
              onToggle={() => toggleSeccion("integraciones")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <OpcionToggle
                  label="Integración con calendario"
                  descripcion="Sincronizar con Google/Outlook"
                  icono={Calendar}
                  checked={config.integracion_calendario}
                  onChange={(v) => handleChange("integracion_calendario", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Integración con EHR"
                  descripcion="Historia clínica electrónica"
                  icono={Database}
                  checked={config.integracion_ehr}
                  onChange={(v) => handleChange("integracion_ehr", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Integración con facturación"
                  descripcion="Sistema de cobros automático"
                  icono={DollarSign}
                  checked={config.integracion_facturacion}
                  onChange={(v) => handleChange("integracion_facturacion", v)}
                  tema={tema}
                  premium
                />
              </div>

              <div className="space-y-4">
                <CampoConfig
                  label="Webhook principal"
                  icono={Globe}
                  descripcion="URL para eventos de telemedicina"
                  tema={tema}
                >
                  <input
                    type="url"
                    value={config.webhook_eventos}
                    onChange={(e) => handleChange("webhook_eventos", e.target.value)}
                    placeholder="https://tu-dominio.com/webhooks/telemedicina"
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Eventos: sesion.creada, sesion.iniciada, sesion.finalizada, grabacion.completada
                  </p>
                </CampoConfig>

                <CampoConfig
                  label="Webhook secundario (respaldo)"
                  icono={Server}
                  descripcion="URL alternativa"
                  tema={tema}
                >
                  <input
                    type="url"
                    value={config.webhook_eventos_secundario}
                    onChange={(e) => handleChange("webhook_eventos_secundario", e.target.value)}
                    placeholder="https://backup.tu-dominio.com/webhooks"
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  />
                </CampoConfig>

                <CampoConfig
                  label="API Key externa"
                  icono={Key}
                  descripcion="Para autenticación de webhooks"
                  tema={tema}
                >
                  <div className="relative">
                    <input
                      type="password"
                      value={config.api_key_externa}
                      onChange={(e) => handleChange("api_key_externa", e.target.value)}
                      placeholder="sk_live_..."
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 pr-10 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </CampoConfig>
              </div>
            </SeccionConfig>

            {/* SECCIÓN: BRANDING */}
            <SeccionConfig
              id="branding"
              titulo="Personalización y Branding"
              descripcion="Adaptar la interfaz a tu marca"
              icono={Palette}
              tema={tema}
              expandida={seccionExpandida === "branding"}
              onToggle={() => toggleSeccion("branding")}
              premium
            >
              <div className="mb-6">
                <OpcionToggle
                  label="Personalizar interfaz"
                  descripcion="Aplicar colores y logo personalizados"
                  icono={Palette}
                  checked={config.personalizar_interfaz}
                  onChange={(v) => handleChange("personalizar_interfaz", v)}
                  tema={tema}
                  premium
                />
              </div>

              {config.personalizar_interfaz && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <CampoConfig
                    label="URL del logo"
                    icono={ImageIcon}
                    descripcion="Logo mostrado en la sala de videollamada"
                    tema={tema}
                  >
                    <input
                      type="url"
                      value={config.branding_logo_url}
                      onChange={(e) => handleChange("branding_logo_url", e.target.value)}
                      placeholder="https://tu-dominio.com/logo.png"
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </CampoConfig>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CampoConfig
                      label="Color primario"
                      icono={Palette}
                      descripcion="Color principal de la interfaz"
                      tema={tema}
                    >
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.branding_color_primario}
                          onChange={(e) => handleChange("branding_color_primario", e.target.value)}
                          className="w-14 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.branding_color_primario}
                          onChange={(e) => handleChange("branding_color_primario", e.target.value)}
                          className={`flex-1 rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                        />
                      </div>
                    </CampoConfig>

                    <CampoConfig
                      label="Color secundario"
                      icono={Palette}
                      descripcion="Color de acentos"
                      tema={tema}
                    >
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.branding_color_secundario}
                          onChange={(e) => handleChange("branding_color_secundario", e.target.value)}
                          className="w-14 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.branding_color_secundario}
                          onChange={(e) => handleChange("branding_color_secundario", e.target.value)}
                          className={`flex-1 rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                        />
                      </div>
                    </CampoConfig>

                    <CampoConfig
                      label="Fuente tipográfica"
                      icono={Type}
                      descripcion="Familia de fuente"
                      tema={tema}
                    >
                      <select
                        value={config.branding_fuente}
                        onChange={(e) => handleChange("branding_fuente", e.target.value)}
                        className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </CampoConfig>
                  </div>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: ACCESIBILIDAD */}
            <SeccionConfig
              id="accesibilidad"
              titulo="Accesibilidad"
              descripcion="Opciones para usuarios con necesidades especiales"
              icono={Eye}
              tema={tema}
              expandida={seccionExpandida === "accesibilidad"}
              onToggle={() => toggleSeccion("accesibilidad")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <OpcionToggle
                  label="Alto contraste"
                  descripcion="Mejorar legibilidad"
                  icono={Eye}
                  checked={config.alto_contraste}
                  onChange={(v) => handleChange("alto_contraste", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Subtítulos automáticos"
                  descripcion="Para personas con discapacidad auditiva"
                  icono={Type}
                  checked={config.subtitulos_automaticos}
                  onChange={(v) => handleChange("subtitulos_automaticos", v)}
                  tema={tema}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoConfig
                  label="Idioma de interfaz"
                  icono={Globe}
                  descripcion="Idioma del médico"
                  tema={tema}
                >
                  <select
                    value={config.idioma_interfaz}
                    onChange={(e) => handleChange("idioma_interfaz", e.target.value)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </CampoConfig>

                <CampoConfig
                  label="Idioma preferido del paciente"
                  icono={Users}
                  descripcion="Idioma por defecto para pacientes"
                  tema={tema}
                >
                  <select
                    value={config.idioma_paciente_preferido}
                    onChange={(e) => handleChange("idioma_paciente_preferido", e.target.value)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </CampoConfig>

                <CampoConfig
                  label="Tamaño de fuente"
                  icono={Type}
                  descripcion="Tamaño del texto"
                  tema={tema}
                >
                  <select
                    value={config.tamanio_fuente}
                    onChange={(e) => handleChange("tamanio_fuente", e.target.value as any)}
                    className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                    <option value="xlarge">Extra Grande</option>
                  </select>
                </CampoConfig>
              </div>
            </SeccionConfig>

            {/* SECCIÓN: RENDIMIENTO */}
            <SeccionConfig
              id="rendimiento"
              titulo="Rendimiento y Optimización"
              descripcion="Configuración de recursos y velocidad"
              icono={Zap}
              tema={tema}
              expandida={seccionExpandida === "rendimiento"}
              onToggle={() => toggleSeccion("rendimiento")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OpcionToggle
                  label="Optimizar ancho de banda"
                  descripcion="Ajuste automático de calidad"
                  icono={WifiIcon}
                  checked={config.optimizar_ancho_banda}
                  onChange={(v) => handleChange("optimizar_ancho_banda", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Modo bajo consumo"
                  descripcion="Reducir uso de recursos"
                  icono={Zap}
                  checked={config.modo_bajo_consumo}
                  onChange={(v) => handleChange("modo_bajo_consumo", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Precarga de recursos"
                  descripcion="Cargar anticipadamente"
                  icono={Download}
                  checked={config.precarga_recursos}
                  onChange={(v) => handleChange("precarga_recursos", v)}
                  tema={tema}
                />
                <OpcionToggle
                  label="Compresión de datos"
                  descripcion="Reducir transferencia de datos"
                  icono={Archive}
                  checked={config.compresion_datos}
                  onChange={(v) => handleChange("compresion_datos", v)}
                  tema={tema}
                />
              </div>
            </SeccionConfig>

            {/* SECCIÓN: REPORTES Y ANALYTICS */}
            <SeccionConfig
              id="reportes"
              titulo="Reportes y Analytics"
              descripcion="Análisis de uso y estadísticas"
              icono={BarChart3}
              tema={tema}
              expandida={seccionExpandida === "reportes"}
              onToggle={() => toggleSeccion("reportes")}
              premium
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <OpcionToggle
                  label="Generar reportes automáticos"
                  descripcion="Informes periódicos de actividad"
                  icono={FileText}
                  checked={config.generar_reportes_automaticos}
                  onChange={(v) => handleChange("generar_reportes_automaticos", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Métricas detalladas"
                  descripcion="Análisis profundo de sesiones"
                  icono={Activity}
                  checked={config.metricas_detalladas}
                  onChange={(v) => handleChange("metricas_detalladas", v)}
                  tema={tema}
                  premium
                />
                <OpcionToggle
                  label="Exportar datos"
                  descripcion="Descargar información en CSV/Excel"
                  icono={Download}
                  checked={config.exportar_datos}
                  onChange={(v) => handleChange("exportar_datos", v)}
                  tema={tema}
                />
              </div>

              {config.generar_reportes_automaticos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CampoConfig
                    label="Frecuencia de reportes"
                    icono={Calendar}
                    descripcion="Periodicidad de generación"
                    tema={tema}
                  >
                    <select
                      value={config.frecuencia_reportes}
                      onChange={(e) => handleChange("frecuencia_reportes", e.target.value as any)}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </CampoConfig>
                </motion.div>
              )}
            </SeccionConfig>

            {/* SECCIÓN: FACTURACIÓN */}
            <SeccionConfig
              id="facturacion"
              titulo="Facturación y Precios"
              descripcion="Configuración de cobros por telemedicina"
              icono={DollarSign}
              tema={tema}
              expandida={seccionExpandida === "facturacion"}
              onToggle={() => toggleSeccion("facturacion")}
            >
              <div className="mb-6">
                <OpcionToggle
                  label="Publicar en portal de pacientes"
                  descripcion="Disponible para reserva online"
                  icono={Globe}
                  checked={config.publicar_en_portal_paciente}
                  onChange={(v) => handleChange("publicar_en_portal_paciente", v)}
                  tema={tema}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoConfig
                  label="Precio de consulta"
                  icono={DollarSign}
                  descripcion="Valor por sesión de telemedicina"
                  tema={tema}
                >
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={config.precio_consulta_telemedicina}
                      onChange={(e) => handleChange("precio_consulta_telemedicina", Number(e.target.value))}
                      className={`w-full rounded-xl border ${tema.colores.borde} pl-8 pr-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    />
                  </div>
                </CampoConfig>

                <CampoConfig
                  label="Habilitar telemedicina"
                  icono={Power}
                  descripcion="Activar servicio"
                  tema={tema}
                >
                  <div className="flex items-center h-full">
                    <OpcionToggle
                      label=""
                      descripcion=""
                      icono={Video}
                      checked={config.consulta_telemedicina_habilitada}
                      onChange={(v) => handleChange("consulta_telemedicina_habilitada", v)}
                      tema={tema}
                    />
                  </div>
                </CampoConfig>
              </div>
            </SeccionConfig>

            {/* SECCIÓN: MANTENIMIENTO */}
            <SeccionConfig
              id="mantenimiento"
              titulo="Mantenimiento y Estado"
              descripcion="Control del sistema"
              icono={Settings}
              tema={tema}
              expandida={seccionExpandida === "mantenimiento"}
              onToggle={() => toggleSeccion("mantenimiento")}
            >
              <div className="mb-6">
                <OpcionToggle
                  label="Modo mantenimiento"
                  descripcion="Desactivar temporalmente el servicio"
                  icono={AlertTriangle}
                  checked={config.modo_mantenimiento}
                  onChange={(v) => handleChange("modo_mantenimiento", v)}
                  tema={tema}
                />
              </div>

              {config.modo_mantenimiento && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CampoConfig
                    label="Motivo del mantenimiento"
                    icono={FileText}
                    descripcion="Mensaje mostrado a los usuarios"
                    tema={tema}
                  >
                    <textarea
                      value={config.motivo_mantenimiento}
                      onChange={(e) => handleChange("motivo_mantenimiento", e.target.value)}
                      placeholder="Estamos realizando mejoras en el sistema. Volveremos pronto."
                      rows={3}
                      className={`w-full rounded-xl border ${tema.colores.borde} px-4 py-2.5 text-sm ${tema.colores.texto} bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
                    />
                  </CampoConfig>
                </motion.div>
              )}
            </SeccionConfig>
          </div>

          {/* SIDEBAR DERECHO */}
          <div className={`${mostrarVistaPrevia ? "lg:col-span-1" : "lg:col-span-3"} space-y-6`}>
            {/* Panel de estado */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6 sticky top-24`}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Estado del Sistema
                </p>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold shadow-lg">
                  ● Operativo
                </span>
              </div>

              <div className="space-y-4">
                <ItemEstado
                  icono={Video}
                  label="Proveedor de video"
                  valor={proveedorSeleccionado?.nombre ?? "No asignado"}
                  color="indigo"
                  tema={tema}
                />
                <ItemEstado
                  icono={Shield}
                  label="Nivel de seguridad"
                  valor={config.nivel_seguridad.toUpperCase()}
                  color="purple"
                  tema={tema}
                />
                <ItemEstado
                  icono={Lock}
                  label="Encriptación"
                  valor={config.politica_encriptacion.toUpperCase()}
                  color="pink"
                  tema={tema}
                />
                <ItemEstado
                  icono={Bell}
                  label="Notificaciones"
                  valor={`${stats.notificaciones_habilitadas}/5 activas`}
                  color="amber"
                  tema={tema}
                />
                <ItemEstado
                  icono={Star}
                  label="Funciones premium"
                  valor={`${stats.funciones_premium}/6 activas`}
                  color="rose"
                  tema={tema}
                />
                <ItemEstado
                  icono={LinkIcon}
                  label="Integraciones"
                  valor={`${stats.integraciones_activas}/4 conectadas`}
                  color="blue"
                  tema={tema}
                />
                <ItemEstado
                  icono={Camera}
                  label="Grabación"
                  valor={config.permitir_grabacion ? "Habilitada" : "Deshabilitada"}
                  color={config.permitir_grabacion ? "green" : "gray"}
                  tema={tema}
                />
                <ItemEstado
                  icono={Cpu}
                  label="IA y transcripción"
                  valor={config.generar_resumen_ia ? "Activa" : "Inactiva"}
                  color={config.generar_resumen_ia ? "violet" : "gray"}
                  tema={tema}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 mb-3 uppercase font-bold">Persistencia</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-emerald-500" />
                    <code className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">
                      telemedicina_configuraciones
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-emerald-500" />
                    <code className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">
                      telemedicina_proveedores
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Panel de ayuda */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">¿Necesitas ayuda?</p>
                  <p className="text-xs text-white/80">Soporte técnico 24/7</p>
                </div>
              </div>
              <p className="text-xs text-white/90 mb-4 leading-relaxed">
                Nuestro equipo puede ayudarte a configurar integraciones avanzadas, personalizar tu
                experiencia y optimizar el rendimiento.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => (window.location.href = "mailto:soporte@anyssa.cl?subject=Soporte%20Telemedicina%20Premium")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Contactar por email
                </button>
                <button
                  onClick={() => window.open("https://wa.me/56912345678", "_blank")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp soporte
                </button>
                <button
                  onClick={() => window.open("https://docs.anyssa.cl/telemedicina", "_blank")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Ver documentación
                </button>
              </div>
            </motion.div>

            {/* Panel de estadísticas avanzadas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6`}
            >
              <p className="text-sm font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Resumen de Configuración
              </p>
              <div className="space-y-3">
                <EstadisticaItem
                  label="Total de opciones"
                  valor={stats.configuraciones_activas}
                  total={Object.keys(config).length}
                  color="indigo"
                  tema={tema}
                />
                <EstadisticaItem
                  label="Seguridad"
                  valor={
                    config.nivel_seguridad === "maximo"
                      ? 100
                      : config.nivel_seguridad === "alto"
                      ? 75
                      : 50
                  }
                  total={100}
                  color="purple"
                  tema={tema}
                  suffix="%"
                />
                <EstadisticaItem
                  label="Funciones premium"
                  valor={stats.funciones_premium}
                  total={6}
                  color="pink"
                  tema={tema}
                />
                <EstadisticaItem
                  label="Integraciones"
                  valor={stats.integraciones_activas}
                  total={4}
                  color="blue"
                  tema={tema}
                />
              </div>
            </motion.div>

            {/* Panel de acciones rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border p-6`}
            >
              <p className="text-sm font-bold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Acciones Rápidas
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setConfig(CONFIG_DEFAULT);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-102`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Restablecer valores por defecto
                </button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(config, null, 2);
                    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
                    const exportFileDefaultName = `config-telemedicina-${new Date().toISOString().split("T")[0]}.json`;
                    const linkElement = document.createElement("a");
                    linkElement.setAttribute("href", dataUri);
                    linkElement.setAttribute("download", exportFileDefaultName);
                    linkElement.click();
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-102`}
                >
                  <Download className="w-4 h-4" />
                  Exportar configuración
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                    alert("Configuración copiada al portapapeles");
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-102`}
                >
                  <Copy className="w-4 h-4" />
                  Copiar como JSON
                </button>
              </div>
            </motion.div>

            {/* Panel de tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl ${tema.colores.info} ${tema.colores.borde} border p-6`}
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold mb-2">💡 Consejo profesional</p>
                  <p className="text-xs leading-relaxed opacity-90">
                    Para obtener el mejor rendimiento, recomendamos usar{" "}
                    <strong>nivel de seguridad Alto</strong>, habilitar{" "}
                    <strong>transcripción automática</strong> y configurar{" "}
                    <strong>recordatorios por múltiples canales</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Botón flotante de guardado */}
        <AnimatePresence>
          {JSON.stringify(config) !== JSON.stringify(CONFIG_DEFAULT) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${tema.colores.gradiente} text-white font-bold flex items-center gap-3 shadow-2xl ${tema.colores.glow} disabled:opacity-60 transition-all duration-300 hover:scale-105`}
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar configuración
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
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

// ====================
// COMPONENTES AUXILIARES
// ====================

interface SeccionConfigProps {
  id: string;
  titulo: string;
  descripcion: string;
  icono: any;
  tema: ConfiguracionTema;
  expandida: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  premium?: boolean;
}

function SeccionConfig({
  id,
  titulo,
  descripcion,
  icono: Icono,
  tema,
  expandida,
  onToggle,
  children,
  premium,
}: SeccionConfigProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border-2 p-6 transition-all duration-300 hover:shadow-xl`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <Icono className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`text-base font-bold ${tema.colores.texto}`}>{titulo}</p>
              {premium && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold shadow-md">
                  PREMIUM
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{descripcion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expandida ? (
            <ChevronUp className="w-5 h-5 text-gray-400 transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {expandida && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

interface CampoConfigProps {
  label: string;
  icono: any;
  descripcion: string;
  tema: ConfiguracionTema;
  children: React.ReactNode;
}

function CampoConfig({ label, icono: Icono, descripcion, tema, children }: CampoConfigProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold flex items-center gap-2 text-gray-700">
        <Icono className="w-4 h-4 text-indigo-500" />
        {label}
      </label>
      {children}
      <p className="text-[10px] text-gray-400 leading-relaxed">{descripcion}</p>
    </div>
  );
}

interface OpcionToggleProps {
  label: string;
  descripcion: string;
  icono: any;
  checked: boolean;
  onChange: (value: boolean) => void;
  tema: ConfiguracionTema;
  premium?: boolean;
}

function OpcionToggle({
  label,
  descripcion,
  icono: Icono,
  checked,
  onChange,
  tema,
  premium,
}: OpcionToggleProps) {
  return (
    <label
      className={`flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        checked
          ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icono className={`w-4 h-4 ${checked ? "text-indigo-600" : "text-gray-400"}`} />
          <p className={`text-sm font-bold ${checked ? "text-indigo-900" : "text-gray-900"}`}>
            {label}
          </p>
          {premium && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-bold">
              PRO
            </span>
          )}
        </div>
        <p className={`text-xs ${checked ? "text-indigo-600" : "text-gray-500"}`}>
          {descripcion}
        </p>
      </div>
    </label>
  );
}

interface ItemEstadoProps {
  icono: any;
  label: string;
  valor: string;
  color: string;
  tema: ConfiguracionTema;
}

function ItemEstado({ icono: Icono, label, valor, color, tema }: ItemEstadoProps) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    purple: "bg-purple-100 text-purple-700",
    pink: "bg-pink-100 text-pink-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-700",
    violet: "bg-violet-100 text-violet-700",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
        <Icono className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
        <p className="text-xs font-bold text-gray-900 truncate">{valor}</p>
      </div>
    </div>
  );
}

interface EstadisticaItemProps {
  label: string;
  valor: number;
  total: number;
  color: string;
  tema: ConfiguracionTema;
  suffix?: string;
}

function EstadisticaItem({ label, valor, total, color, tema, suffix = "" }: EstadisticaItemProps) {
  const porcentaje = (valor / total) * 100;

  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-500 to-purple-500",
    purple: "from-purple-500 to-pink-500",
    pink: "from-pink-500 to-rose-500",
    blue: "from-blue-500 to-cyan-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        <p className="text-xs font-bold text-gray-900">
          {valor}
          {suffix || `/${total}`}
        </p>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
}