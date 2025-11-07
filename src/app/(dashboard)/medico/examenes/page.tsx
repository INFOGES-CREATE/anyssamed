"use client";

import React from "react"; // 👈 para React.createElement(...)
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  Award,
  BarChart3,
  Beaker,
  Bell,
  BellOff,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Clipboard,
  ClipboardCheck,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileClock,
  FileText,
  FileWarning,
  FileX,
  Filter,
  Grid,
  Hash,
  HeartPulse,
  Home,
  Image as ImageIcon,
  Info,
  Layers,
  LineChart,
  List,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Microscope,
  Moon,
  MoreVertical,
  Package,
  Phone,
  PieChart,
  Pill,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Scan,
  ScanLine,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Tag,
  Tags,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  Users,
  Wifi,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import QRCodeLib from "qrcode";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ========================================
// TIPOS DE DATOS COMPLETOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type VistaModo = "lista" | "grid" | "timeline" | "calendario" | "graficos" | "kanban";
type EstadoExamen =
  | "solicitado"
  | "programado"
  | "realizado"
  | "cancelado"
  | "resultados_disponibles"
  | "anulado";
type TipoOrden = "laboratorio" | "imagen" | "procedimiento" | "multidisciplinaria" | "externa";
type Prioridad = "normal" | "urgente" | "critica";
type ComplejidadExamen = "baja" | "media" | "alta" | "critica";
type FormatoResultado =
  | "texto"
  | "valor_numerico"
  | "positivo_negativo"
  | "imagen"
  | "archivo"
  | "estructura"
  | "json";
type EstadoResultado = "preliminar" | "final" | "corregido" | "anulado";
type EstadoOrden = "emitida" | "en_proceso" | "completada" | "cancelada" | "anulada";

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

interface TipoExamen {
  id_tipo_examen: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  subcategoria: string | null;
  especialidad_relacionada: string | null;
  requiere_ayuno: boolean;
  requiere_preparacion: boolean;
  instrucciones_preparacion: string | null;
  tiempo_resultado_horas: number | null;
  codigo_fonasa: string | null;
  valor_fonasa: number | null;
  complejidad: ComplejidadExamen;
  activo: boolean;
}

interface ValorReferencia {
  id_valor_referencia: number;
  id_tipo_examen: number;
  parametro: string;
  sexo: "todos" | "masculino" | "femenino";
  edad_minima: number | null;
  edad_maxima: number | null;
  unidad_edad: string | null;
  valor_minimo: number | null;
  valor_maximo: number | null;
  valor_texto: string | null;
  unidad_medida: string | null;
  interpretacion: string | null;
  nivel_alerta_bajo: number | null;
  nivel_alerta_alto: number | null;
  nivel_critico_bajo: number | null;
  nivel_critico_alto: number | null;
  activo: boolean;
  fecha_actualizacion: string;
  fuente: string | null;
  notas: string | null;
}

interface ResultadoExamen {
  id_resultado: number;
  id_examen: number;
  id_paciente: number;
  fecha_resultado: string;
  profesional_id: number | null;
  titulo: string;
  formato: FormatoResultado;
  resultado_texto: string | null;
  resultado_numerico: number | null;
  unidad_medida: string | null;
  resultado_positivo: boolean | null;
  url_resultado: string | null;
  resultado_json: any | null;
  interpretacion: string | null;
  observaciones: string | null;
  estado: EstadoResultado;
  es_critico: boolean;
  notificado_medico: boolean;
  fecha_notificacion_medico: string | null;
  validado: boolean;
  validado_por: number | null;
  fecha_validacion: string | null;
  requiere_seguimiento: boolean;
  valores_referencia: ValorReferencia | null;
}

interface ExamenMedico {
  id_examen: number;
  id_paciente: number;
  id_tipo_examen: number;
  id_medico_solicitante: number;
  id_centro: number;
  fecha_solicitud: string;
  fecha_programada: string | null;
  fecha_realizacion: string | null;
  estado: EstadoExamen;
  prioridad: Prioridad;
  motivo_solicitud: string | null;
  diagnostico: string | null;
  codigo_cie10: string | null;
  instrucciones_especificas: string | null;
  notas_tecnicas: string | null;
  id_profesional_realiza: number | null;
  id_laboratorio: number | null;
  numero_orden: string;
  requiere_preparacion: boolean;
  confirmacion_preparacion: boolean;
  lugar_realizacion: string | null;
  id_cita: number | null;
  id_historial: number | null;
  id_orden: number | null;
  pagado: boolean;
  costo: number | null;
  cubierto_seguro: boolean | null;
  tipo_examen: TipoExamen;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    genero: string;
    telefono: string | null;
    email: string | null;
    foto_url: string | null;
    rut: string;
    prevision: string;
  };
  resultados: ResultadoExamen[];
}

interface OrdenExamen {
  id_orden: number;
  id_centro: number;
  id_paciente: number;
  id_medico: number;
  numero_orden: string;
  fecha_emision: string;
  estado: EstadoOrden;
  tipo_orden: TipoOrden;
  prioridad: Prioridad;
  diagnostico: string | null;
  codigo_cie10: string | null;
  comentarios: string | null;
  id_laboratorio: number | null;
  id_historial: number | null;
  id_cita: number | null;
  fecha_entrega_estimada: string | null;
  url_documento: string | null;
  cantidad_examenes: number;
  pagada: boolean;
  valor_total: number | null;
  paciente: {
    id_paciente: number;
    nombre_completo: string;
    edad: number;
    genero: string;
    rut: string;
    prevision: string;
    telefono: string | null;
    email: string | null;
    foto_url: string | null;
  };
  examenes: ExamenMedico[];
}

interface EstadisticasExamenes {
  total_examenes: number;
  solicitados: number;
  programados: number;
  realizados: number;
  con_resultados: number;
  cancelados: number;
  pendientes_resultado: number;
  resultados_criticos: number;
  examenes_mes_actual: number;
  examenes_mes_anterior: number;
  tendencia_mensual: number;
  promedio_tiempo_resultado: number;
  tasa_cumplimiento: number;
  examenes_por_categoria: Array<{ categoria: string; cantidad: number; color: string }>;
  examenes_mas_solicitados: Array<{ nombre: string; cantidad: number; valor: number }>;
  examenes_por_estado: Array<{ estado: string; cantidad: number; porcentaje: number }>;
  examenes_por_prioridad: Array<{ prioridad: string; cantidad: number }>;
  evolucion_mensual: Array<{ mes: string; cantidad: number; completados: number }>;
  tiempo_promedio_por_tipo: Array<{ tipo: string; horas: number }>;
}

interface FiltrosExamenes {
  fechaInicio: string;
  fechaFin: string;
  estados: EstadoExamen[];
  tipos: string[];
  categorias: string[];
  prioridades: Prioridad[];
  paciente: string;
  con_resultados: boolean | null;
  resultados_criticos: boolean | null;
  pendiente_pago: boolean | null;
  requiere_preparacion: boolean | null;
}

interface FormularioOrden {
  id_paciente: number | null;
  tipo_orden: TipoOrden;
  prioridad: Prioridad;
  diagnostico: string;
  codigo_cie10: string;
  comentarios: string;
  fecha_programada: string;
  examenes_seleccionados: number[];
  instrucciones_especiales: string;
}

interface FormularioResultado {
  id_examen: number;
  titulo: string;
  formato: FormatoResultado;
  resultado_texto: string;
  resultado_numerico: string;
  unidad_medida: string;
  resultado_positivo: boolean | null;
  interpretacion: string;
  observaciones: string;
  es_critico: boolean;
  requiere_seguimiento: boolean;
  archivo: File | null;
}

interface IntegracionLaboratorio {
  id_integracion: number;
  id_centro: number;
  nombre_laboratorio: string;
  codigo_laboratorio: string | null;
  descripcion: string | null;
  url_api: string | null;
  activo: boolean;
  estado_conexion: "activo" | "inactivo" | "error" | "mantenimiento";
  fecha_ultima_sincronizacion: string | null;
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

// ========================================
// COLORES Y CONFIGURACIONES
// ========================================

const COLORES_ESTADO: Record<
  EstadoExamen,
  { bg: string; text: string; border: string; icon: any; label: string }
> = {
  solicitado: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    icon: FileClock,
    label: "Solicitado",
  },
  programado: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: Calendar,
    label: "Programado",
  },
  realizado: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: CheckCircle2,
    label: "Realizado",
  },
  cancelado: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: XCircle,
    label: "Cancelado",
  },
  resultados_disponibles: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    icon: FileCheck,
    label: "Resultados Disponibles",
  },
  anulado: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    icon: FileX,
    label: "Anulado",
  },
};

const COLORES_TIPO_ORDEN: Record<TipoOrden, { color: string; icon: any; label: string }> = {
  laboratorio: { color: "#3b82f6", icon: Beaker, label: "Laboratorio" },
  imagen: { color: "#8b5cf6", icon: Camera, label: "Imagen" },
  procedimiento: { color: "#10b981", icon: Activity, label: "Procedimiento" },
  multidisciplinaria: { color: "#f59e0b", icon: Layers, label: "Multidisciplinaria" },
  externa: { color: "#ec4899", icon: Share2, label: "Externa" },
};

const COLORES_PRIORIDAD: Record<Prioridad, { bg: string; text: string; icon: any; label: string }> = {
  normal: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Info, label: "Normal" },
  urgente: { bg: "bg-orange-500/20", text: "text-orange-400", icon: AlertCircle, label: "Urgente" },
  critica: { bg: "bg-red-500/20", text: "text-red-400", icon: AlertTriangle, label: "Crítica" },
};

const COLORES_GRAFICO = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

// ========================================
// DATOS MOCK
// ========================================

const PACIENTES_MOCK = [
  {
    id: 1,
    nombre: "Juan Pérez González",
    rut: "12.345.678-9",
    edad: 45,
    genero: "Masculino",
    telefono: "+56912345678",
    email: "juan@email.com",
    prevision: "Fonasa A",
    foto_url: null,
  },
  {
    id: 2,
    nombre: "María Silva Rojas",
    rut: "23.456.789-0",
    edad: 32,
    genero: "Femenino",
    telefono: "+56987654321",
    email: "maria@email.com",
    prevision: "Isapre Consalud",
    foto_url: null,
  },
  {
    id: 3,
    nombre: "Carlos Muñoz López",
    rut: "34.567.890-1",
    edad: 58,
    genero: "Masculino",
    telefono: "+56911111111",
    email: "carlos@email.com",
    prevision: "Fonasa B",
    foto_url: null,
  },
  {
    id: 4,
    nombre: "Ana Torres Fernández",
    rut: "45.678.901-2",
    edad: 28,
    genero: "Femenino",
    telefono: "+56922222222",
    email: "ana@email.com",
    prevision: "Isapre Banmédica",
    foto_url: null,
  },
  {
    id: 5,
    nombre: "Pedro Ramírez Castro",
    rut: "56.789.012-3",
    edad: 65,
    genero: "Masculino",
    telefono: "+56933333333",
    email: "pedro@email.com",
    prevision: "Fonasa C",
    foto_url: null,
  },
];

const CATEGORIAS_EXAMENES = [
  "Hematología",
  "Bioquímica",
  "Inmunología",
  "Microbiología",
  "Hormonas",
  "Orina",
  "Coagulación",
  "Radiología",
  "Ecografía",
  "Tomografía",
  "Resonancia Magnética",
  "Electrocardiograma",
  "Endoscopía",
  "Cardiología",
  "Neurología",
];

const TIPOS_EXAMENES_MOCK: TipoExamen[] = [
  {
    id_tipo_examen: 1,
    codigo: "HEM001",
    nombre: "Hemograma Completo",
    descripcion: "Análisis completo de células sanguíneas",
    categoria: "Hematología",
    subcategoria: "Básico",
    especialidad_relacionada: "Medicina Interna",
    requiere_ayuno: false,
    requiere_preparacion: false,
    instrucciones_preparacion: null,
    tiempo_resultado_horas: 24,
    codigo_fonasa: "0301001",
    valor_fonasa: 4500,
    complejidad: "baja",
    activo: true,
  },
  {
    id_tipo_examen: 2,
    codigo: "BIO001",
    nombre: "Glicemia",
    descripcion: "Medición de glucosa en sangre",
    categoria: "Bioquímica",
    subcategoria: "Glucosa",
    especialidad_relacionada: "Endocrinología",
    requiere_ayuno: true,
    requiere_preparacion: true,
    instrucciones_preparacion: "Ayuno de 8-12 horas",
    tiempo_resultado_horas: 12,
    codigo_fonasa: "0302001",
    valor_fonasa: 2500,
    complejidad: "baja",
    activo: true,
  },
  {
    id_tipo_examen: 3,
    codigo: "BIO002",
    nombre: "Perfil Lipídico",
    descripcion: "Colesterol total, HDL, LDL y triglicéridos",
    categoria: "Bioquímica",
    subcategoria: "Lípidos",
    especialidad_relacionada: "Cardiología",
    requiere_ayuno: true,
    requiere_preparacion: true,
    instrucciones_preparacion: "Ayuno de 12 horas",
    tiempo_resultado_horas: 24,
    codigo_fonasa: "0302010",
    valor_fonasa: 8500,
    complejidad: "media",
    activo: true,
  },
  {
    id_tipo_examen: 4,
    codigo: "HOR001",
    nombre: "TSH - Hormona Estimulante Tiroides",
    descripcion: "Evaluación de función tiroidea",
    categoria: "Hormonas",
    subcategoria: "Tiroides",
    especialidad_relacionada: "Endocrinología",
    requiere_ayuno: false,
    requiere_preparacion: false,
    instrucciones_preparacion: null,
    tiempo_resultado_horas: 48,
    codigo_fonasa: "0305001",
    valor_fonasa: 12000,
    complejidad: "media",
    activo: true,
  },
  {
    id_tipo_examen: 5,
    codigo: "IMG001",
    nombre: "Radiografía de Tórax",
    descripcion: "Imagen radiológica del tórax",
    categoria: "Radiología",
    subcategoria: "Tórax",
    especialidad_relacionada: "Radiología",
    requiere_ayuno: false,
    requiere_preparacion: false,
    instrucciones_preparacion: null,
    tiempo_resultado_horas: 48,
    codigo_fonasa: "0401001",
    valor_fonasa: 15000,
    complejidad: "media",
    activo: true,
  },
  {
    id_tipo_examen: 6,
    codigo: "IMG002",
    nombre: "Ecografía Abdominal",
    descripcion: "Estudio ecográfico de abdomen completo",
    categoria: "Ecografía",
    subcategoria: "Abdomen",
    especialidad_relacionada: "Radiología",
    requiere_ayuno: true,
    requiere_preparacion: true,
    instrucciones_preparacion: "Ayuno de 6 horas y vejiga llena",
    tiempo_resultado_horas: 72,
    codigo_fonasa: "0402001",
    valor_fonasa: 25000,
    complejidad: "media",
    activo: true,
  },
  {
    id_tipo_examen: 7,
    codigo: "IMG003",
    nombre: "TAC de Cerebro",
    descripcion: "Tomografía computarizada de cerebro",
    categoria: "Tomografía",
    subcategoria: "Neurología",
    especialidad_relacionada: "Neurología",
    requiere_ayuno: false,
    requiere_preparacion: true,
    instrucciones_preparacion: "Informar alergias a contrastes",
    tiempo_resultado_horas: 96,
    codigo_fonasa: "0403001",
    valor_fonasa: 95000,
    complejidad: "alta",
    activo: true,
  },
  {
    id_tipo_examen: 8,
    codigo: "CAR001",
    nombre: "Electrocardiograma",
    descripcion: "Registro de actividad eléctrica del corazón",
    categoria: "Electrocardiograma",
    subcategoria: "Cardiología",
    especialidad_relacionada: "Cardiología",
    requiere_ayuno: false,
    requiere_preparacion: false,
    instrucciones_preparacion: null,
    tiempo_resultado_horas: 24,
    codigo_fonasa: "0404001",
    valor_fonasa: 8000,
    complejidad: "baja",
    activo: true,
  },
  {
    id_tipo_examen: 9,
    codigo: "BIO003",
    nombre: "Hemoglobina Glicosilada (HbA1c)",
    descripcion: "Control de diabetes",
    categoria: "Bioquímica",
    subcategoria: "Glucosa",
    especialidad_relacionada: "Endocrinología",
    requiere_ayuno: false,
    requiere_preparacion: false,
    instrucciones_preparacion: null,
    tiempo_resultado_horas: 48,
    codigo_fonasa: "0302015",
    valor_fonasa: 15000,
    complejidad: "media",
    activo: true,
  },
  {
    id_tipo_examen: 10,
    codigo: "BIO004",
    nombre: "Creatinina",
    descripcion: "Evaluación de función renal",
    categoria: "Bioquímica",
    subcategoria: "Función Renal",
    especialidad_relacionada: "Nefrología",
    requiere_ayuno: false,
    requiere_preparacion: false,
    instrucciones_preparacion: null,
    tiempo_resultado_horas: 24,
    codigo_fonasa: "0302020",
    valor_fonasa: 3500,
    complejidad: "baja",
    activo: true,
  },
];

const DIAGNOSTICOS_FRECUENTES = [
  { codigo: "E11", descripcion: "Diabetes mellitus tipo 2" },
  { codigo: "I10", descripcion: "Hipertensión esencial (primaria)" },
  { codigo: "E78.5", descripcion: "Hiperlipidemia no especificada" },
  { codigo: "E03.9", descripcion: "Hipotiroidismo no especificado" },
  { codigo: "J00", descripcion: "Rinofaringitis aguda [resfriado común]" },
  { codigo: "K21.9", descripcion: "Enfermedad por reflujo gastroesofágico sin esofagitis" },
  { codigo: "M54.5", descripcion: "Lumbago no especificado" },
  { codigo: "F41.1", descripcion: "Trastorno de ansiedad generalizada" },
  { codigo: "J06.9", descripcion: "Infección aguda de las vías respiratorias superiores" },
  { codigo: "N39.0", descripcion: "Infección de vías urinarias" },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ExamenesMedicosPage() {
  // ========================================
  // ESTADOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [ordenes, setOrdenes] = useState<OrdenExamen[]>([]);
  const [examenes, setExamenes] = useState<ExamenMedico[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasExamenes | null>(null);
  const [laboratorios, setLaboratorios] = useState<IntegracionLaboratorio[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("dark");
  const [vistaModo, setVistaModo] = useState<VistaModo>("lista");
  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosExamenes>({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    estados: [],
    tipos: [],
    categorias: [],
    prioridades: [],
    paciente: "",
    con_resultados: null,
    resultados_criticos: null,
    pendiente_pago: null,
    requiere_preparacion: null,
  });

  // Modales
  const [modalNuevaOrden, setModalNuevaOrden] = useState(false);
  const [modalEditarOrden, setModalEditarOrden] = useState(false);
  const [modalDetallesOrden, setModalDetallesOrden] = useState(false);
  const [modalResultados, setModalResultados] = useState(false);
  const [modalRegistrarResultado, setModalRegistrarResultado] = useState(false);
  const [modalSelectorTema, setModalSelectorTema] = useState(false);
  const [modalQRCode, setModalQRCode] = useState(false);
  const [modalGraficos, setModalGraficos] = useState(false);
  const [modalSeleccionarExamenes, setModalSeleccionarExamenes] = useState(false);
  const [modalSeleccionarPaciente, setModalSeleccionarPaciente] = useState(false);
  const [modalValoresReferencia, setModalValoresReferencia] = useState(false);
  const [modalHistorialExamenes, setModalHistorialExamenes] = useState(false);
  const [modalComparativaResultados, setModalComparativaResultados] = useState(false);
  const [modalIntegracionLaboratorio, setModalIntegracionLaboratorio] = useState(false);

  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenExamen | null>(null);
  const [examenSeleccionado, setExamenSeleccionado] = useState<ExamenMedico | null>(null);
  const [qrCodeURL, setQrCodeURL] = useState<string>("");

  const [formularioOrden, setFormularioOrden] = useState<FormularioOrden>({
    id_paciente: null,
    tipo_orden: "laboratorio",
    prioridad: "normal",
    diagnostico: "",
    codigo_cie10: "",
    comentarios: "",
    fecha_programada: new Date().toISOString().split("T")[0],
    examenes_seleccionados: [],
    instrucciones_especiales: "",
  });

  const [formularioResultado, setFormularioResultado] = useState<FormularioResultado>({
    id_examen: 0,
    titulo: "",
    formato: "texto",
    resultado_texto: "",
    resultado_numerico: "",
    unidad_medida: "",
    resultado_positivo: null,
    interpretacion: "",
    observaciones: "",
    es_critico: false,
    requiere_seguimiento: false,
    archivo: null,
  });

  const [examenesSeleccionados, setExamenesSeleccionados] = useState<TipoExamen[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState(PACIENTES_MOCK);
  const [busquedaExamen, setBusquedaExamen] = useState("");
  const [examenesFiltrados, setExamenesFiltrados] = useState(TIPOS_EXAMENES_MOCK);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");

  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosExamenes();
      cargarLaboratorios();
      cargarNotificaciones();
    }
  }, [usuario, filtros]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.medico) {
        cargarDatosExamenes();
        cargarNotificaciones();
      }
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, [usuario]);

  useEffect(() => {
    const cargarPreferenciaTema = async () => {
      try {
        const temaGuardado = localStorage.getItem("tema_medico");
        if (temaGuardado && TEMAS[temaGuardado as TemaColor]) {
          setTemaActual(temaGuardado as TemaColor);
        }
      } catch (e) {
        console.error("Error al cargar tema:", e);
      }
    };
    cargarPreferenciaTema();
  }, []);

  useEffect(() => {
    const resultados = PACIENTES_MOCK.filter((p) =>
      p.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
      p.rut.includes(busquedaPaciente)
    );
    setPacientesFiltrados(resultados);
  }, [busquedaPaciente]);

  useEffect(() => {
    let resultados = TIPOS_EXAMENES_MOCK.filter(
      (e) =>
        (e.nombre.toLowerCase().includes(busquedaExamen.toLowerCase()) ||
        e.categoria.toLowerCase().includes(busquedaExamen.toLowerCase()) ||
        e.codigo.toLowerCase().includes(busquedaExamen.toLowerCase())) &&
        (categoriaSeleccionada === "todas" || e.categoria === categoriaSeleccionada)
    );
    setExamenesFiltrados(resultados);
  }, [busquedaExamen, categoriaSeleccionada]);

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

        if (!tieneRolMedico) {
          alert("Acceso denegado. Este panel es solo para médicos.");
          window.location.href = "/";
          return;
        }

        if (!result.usuario.medico) {
          alert("Tu usuario no está vinculado a un registro médico.");
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
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

  const cargarDatosExamenes = async () => {
    if (!usuario?.medico?.id_medico) return;

    try {
      setLoadingData(true);

      // Simular datos mientras se implementa la API
      const datosSimulados = generarDatosSimulados();
      
      setOrdenes(datosSimulados.ordenes);
      setExamenes(datosSimulados.examenes);
      setEstadisticas(datosSimulados.estadisticas);

      // TODO: Implementar llamada real a la API
      /*
      const params = new URLSearchParams({
        id_medico: usuario.medico.id_medico.toString(),
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin,
      });

      if (filtros.estados.length > 0) {
        params.append("estados", filtros.estados.join(","));
      }
      if (filtros.categorias.length > 0) {
        params.append("categorias", filtros.categorias.join(","));
      }
      if (filtros.paciente) {
        params.append("paciente", filtros.paciente);
      }

      const res = await fetch(`/api/medico/examenes?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrdenes(data.ordenes || []);
        setExamenes(data.examenes || []);
        setEstadisticas(data.estadisticas || null);
      }
      */
    } catch (err) {
      console.error("Error al cargar exámenes:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const cargarLaboratorios = async () => {
    try {
      // TODO: Implementar llamada a la API
      const labsSimulados: IntegracionLaboratorio[] = [
        {
          id_integracion: 1,
          id_centro: usuario?.medico?.centro_principal.id_centro || 1,
          nombre_laboratorio: "LabChile",
          codigo_laboratorio: "LAB001",
          descripcion: "Laboratorio principal",
          url_api: "https://api.labchile.cl",
          activo: true,
          estado_conexion: "activo",
          fecha_ultima_sincronizacion: new Date().toISOString(),
        },
        {
          id_integracion: 2,
          id_centro: usuario?.medico?.centro_principal.id_centro || 1,
          nombre_laboratorio: "Bionet",
          codigo_laboratorio: "LAB002",
          descripcion: "Laboratorio secundario",
          url_api: "https://api.bionet.cl",
          activo: true,
          estado_conexion: "activo",
          fecha_ultima_sincronizacion: new Date().toISOString(),
        },
      ];
      setLaboratorios(labsSimulados);
    } catch (error) {
      console.error("Error al cargar laboratorios:", error);
    }
  };

  const cargarNotificaciones = async () => {
    try {
      // TODO: Implementar llamada a la API
      const notificacionesSimuladas = [
        {
          id: 1,
          tipo: "resultado_critico",
          mensaje: "Resultado crítico disponible para Juan Pérez",
          fecha: new Date().toISOString(),
          leida: false,
        },
        {
          id: 2,
          tipo: "examen_programado",
          mensaje: "Examen programado para mañana - María Silva",
          fecha: new Date().toISOString(),
          leida: false,
        },
      ];
      setNotificaciones(notificacionesSimuladas);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const formatearFecha = (fecha: string) => {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(fecha));
  };

  const formatearFechaCorta = (fecha: string) => {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(fecha));
  };

  const formatearHora = (fecha: string) => {
    return new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(fecha));
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(valor);
  };

  const generarNumeroOrden = () => {
    const año = new Date().getFullYear();
    const mes = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const numero = Math.floor(Math.random() * 9999) + 1;
    return `ORD-${año}${mes}-${numero.toString().padStart(4, "0")}`;
  };

  const calcularDiasTranscurridos = (fecha: string) => {
    const hoy = new Date();
    const fechaExamen = new Date(fecha);
    const diferencia = hoy.getTime() - fechaExamen.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  const generarQRCode = async (orden: OrdenExamen) => {
    try {
      const datosQR = {
        numero_orden: orden.numero_orden,
        paciente: orden.paciente.nombre_completo,
        rut: orden.paciente.rut,
        fecha_emision: orden.fecha_emision,
        cantidad_examenes: orden.cantidad_examenes,
        url_verificacion: `https://medisuite.cl/verificar/orden/${orden.id_orden}`,
      };

      const qrDataURL = await QRCodeLib.toDataURL(JSON.stringify(datosQR), {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeURL(qrDataURL);
      setOrdenSeleccionada(orden);
      setModalQRCode(true);
    } catch (error) {
      console.error("Error al generar QR:", error);
      alert("Error al generar código QR");
    }
  };

  const ordenesFiltradas = useMemo(() => {
    let resultado = [...ordenes];

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (orden) =>
          orden.paciente.nombre_completo.toLowerCase().includes(termino) ||
          orden.numero_orden.toLowerCase().includes(termino) ||
          orden.paciente.rut.includes(termino) ||
          orden.diagnostico?.toLowerCase().includes(termino)
      );
    }

    if (filtros.estados.length > 0) {
      resultado = resultado.filter((orden) =>
        orden.examenes.some((ex) => filtros.estados.includes(ex.estado))
      );
    }

    if (filtros.prioridades.length > 0) {
      resultado = resultado.filter((orden) =>
        filtros.prioridades.includes(orden.prioridad)
      );
    }

    if (filtros.categorias.length > 0) {
      resultado = resultado.filter((orden) =>
        orden.examenes.some((ex) =>
          filtros.categorias.includes(ex.tipo_examen.categoria)
        )
      );
    }

    if (filtros.con_resultados !== null) {
      resultado = resultado.filter((orden) =>
        orden.examenes.some((ex) =>
          filtros.con_resultados
            ? ex.resultados.length > 0
            : ex.resultados.length === 0
        )
      );
    }

    if (filtros.resultados_criticos) {
      resultado = resultado.filter((orden) =>
        orden.examenes.some((ex) =>
          ex.resultados.some((r) => r.es_critico)
        )
      );
    }

    if (filtros.pendiente_pago) {
      resultado = resultado.filter((orden) => !orden.pagada);
    }

    if (filtros.requiere_preparacion) {
      resultado = resultado.filter((orden) =>
        orden.examenes.some((ex) => ex.requiere_preparacion)
      );
    }

    return resultado;
  }, [ordenes, busqueda, filtros]);

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_medico", nuevoTema);
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

  // ========================================
  // FUNCIONES DE ACCIONES
  // ========================================

  const handleNuevaOrden = () => {
    setFormularioOrden({
      id_paciente: null,
      tipo_orden: "laboratorio",
      prioridad: "normal",
      diagnostico: "",
      codigo_cie10: "",
      comentarios: "",
      fecha_programada: new Date().toISOString().split("T")[0],
      examenes_seleccionados: [],
      instrucciones_especiales: "",
    });
    setExamenesSeleccionados([]);
    setPacienteSeleccionado(null);
    setModalNuevaOrden(true);
  };

  const handleSeleccionarPaciente = (paciente: any) => {
    setPacienteSeleccionado(paciente);
    setFormularioOrden({
      ...formularioOrden,
      id_paciente: paciente.id,
    });
    setModalSeleccionarPaciente(false);
  };

  const handleAgregarExamen = (examen: TipoExamen) => {
    if (!examenesSeleccionados.find((e) => e.id_tipo_examen === examen.id_tipo_examen)) {
      const nuevosExamenes = [...examenesSeleccionados, examen];
      setExamenesSeleccionados(nuevosExamenes);
      setFormularioOrden({
        ...formularioOrden,
        examenes_seleccionados: nuevosExamenes.map((e) => e.id_tipo_examen),
      });
    }
  };

  const handleEliminarExamen = (idExamen: number) => {
    const nuevosExamenes = examenesSeleccionados.filter(
      (e) => e.id_tipo_examen !== idExamen
    );
    setExamenesSeleccionados(nuevosExamenes);
    setFormularioOrden({
      ...formularioOrden,
      examenes_seleccionados: nuevosExamenes.map((e) => e.id_tipo_examen),
    });
  };

  const handleGuardarOrden = async () => {
    // Validaciones
    if (!formularioOrden.id_paciente) {
      alert("Debe seleccionar un paciente");
      return;
    }

    if (formularioOrden.examenes_seleccionados.length === 0) {
      alert("Debe agregar al menos un examen");
      return;
    }

    if (!formularioOrden.diagnostico.trim()) {
      alert("Debe ingresar un diagnóstico");
      return;
    }

    try {
      const endpoint = modalEditarOrden && ordenSeleccionada
        ? `/api/medico/ordenes/${ordenSeleccionada.id_orden}`
        : "/api/medico/ordenes";

      const method = modalEditarOrden ? "PUT" : "POST";

      const valorTotal = examenesSeleccionados.reduce(
        (sum, ex) => sum + (ex.valor_fonasa || 0),
        0
      );

      const payload = {
        ...formularioOrden,
        id_medico: usuario?.medico?.id_medico,
        id_centro: usuario?.medico?.centro_principal.id_centro,
        numero_orden: generarNumeroOrden(),
        cantidad_examenes: formularioOrden.examenes_seleccionados.length,
        valor_total: valorTotal,
        fecha_emision: new Date().toISOString(),
      };

      // TODO: Implementar llamada real a la API
      console.log("Guardando orden:", payload);

      // Simular éxito
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Orden guardada exitosamente");
      await cargarDatosExamenes();
      setModalNuevaOrden(false);
      setModalEditarOrden(false);
      setOrdenSeleccionada(null);

      /*
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await cargarDatosExamenes();
        setModalNuevaOrden(false);
        setModalEditarOrden(false);
        setOrdenSeleccionada(null);
        alert("Orden guardada exitosamente");
      } else {
        const error = await response.json();
        alert(error.message || "Error al guardar la orden");
      }
      */
    } catch (error) {
      console.error("Error al guardar orden:", error);
      alert("Error al guardar la orden");
    }
  };

  const handleEditarOrden = (orden: OrdenExamen) => {
    setOrdenSeleccionada(orden);
    setFormularioOrden({
      id_paciente: orden.id_paciente,
      tipo_orden: orden.tipo_orden,
      prioridad: orden.prioridad,
      diagnostico: orden.diagnostico || "",
      codigo_cie10: orden.codigo_cie10 || "",
      comentarios: orden.comentarios || "",
      fecha_programada: orden.examenes[0]?.fecha_programada?.split("T")[0] || "",
      examenes_seleccionados: orden.examenes.map((e) => e.id_tipo_examen),
      instrucciones_especiales: "",
    });
    setExamenesSeleccionados(orden.examenes.map((e) => e.tipo_examen));
    setPacienteSeleccionado(orden.paciente);
    setModalEditarOrden(true);
  };

  const handleVerDetalles = (orden: OrdenExamen) => {
    setOrdenSeleccionada(orden);
    setModalDetallesOrden(true);
  };

  const handleCancelarOrden = async (idOrden: number) => {
    if (!confirm("¿Está seguro que desea cancelar esta orden?")) return;

    try {
      // TODO: Implementar llamada a la API
      console.log("Cancelando orden:", idOrden);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Orden cancelada exitosamente");
      await cargarDatosExamenes();

      /*
      const response = await fetch(`/api/medico/ordenes/${idOrden}/cancelar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        await cargarDatosExamenes();
        alert("Orden cancelada exitosamente");
      } else {
        alert("Error al cancelar la orden");
      }
      */
    } catch (error) {
      console.error("Error al cancelar orden:", error);
      alert("Error al cancelar la orden");
    }
  };

  const handleVerResultados = (examen: ExamenMedico) => {
    setExamenSeleccionado(examen);
    setModalResultados(true);
  };

  const handleRegistrarResultado = (examen: ExamenMedico) => {
    setExamenSeleccionado(examen);
    setFormularioResultado({
      id_examen: examen.id_examen,
      titulo: `Resultado ${examen.tipo_examen.nombre}`,
      formato: "texto",
      resultado_texto: "",
      resultado_numerico: "",
      unidad_medida: "",
      resultado_positivo: null,
      interpretacion: "",
      observaciones: "",
      es_critico: false,
      requiere_seguimiento: false,
      archivo: null,
    });
    setModalRegistrarResultado(true);
  };

  const handleGuardarResultado = async () => {
    if (!formularioResultado.titulo.trim()) {
      alert("Debe ingresar un título para el resultado");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id_examen", formularioResultado.id_examen.toString());
      formData.append("titulo", formularioResultado.titulo);
      formData.append("formato", formularioResultado.formato);
      formData.append("resultado_texto", formularioResultado.resultado_texto);
      formData.append("resultado_numerico", formularioResultado.resultado_numerico);
      formData.append("unidad_medida", formularioResultado.unidad_medida);
      formData.append("interpretacion", formularioResultado.interpretacion);
      formData.append("observaciones", formularioResultado.observaciones);
      formData.append("es_critico", formularioResultado.es_critico.toString());
      formData.append("requiere_seguimiento", formularioResultado.requiere_seguimiento.toString());
      
      if (formularioResultado.archivo) {
        formData.append("archivo", formularioResultado.archivo);
      }

      // TODO: Implementar llamada a la API
      console.log("Guardando resultado:", formularioResultado);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Resultado registrado exitosamente");
      await cargarDatosExamenes();
      setModalRegistrarResultado(false);

      /*
      const response = await fetch("/api/medico/examenes/resultados", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        await cargarDatosExamenes();
        setModalRegistrarResultado(false);
        alert("Resultado registrado exitosamente");
      } else {
        alert("Error al registrar el resultado");
      }
      */
    } catch (error) {
      console.error("Error al guardar resultado:", error);
      alert("Error al guardar el resultado");
    }
  };

  const handleDescargarPDF = async (orden: OrdenExamen) => {
    try {
      // Abrir ventana de impresión
      const ventanaImpresion = window.open("", "_blank");
      if (!ventanaImpresion) {
        alert("Por favor, permita las ventanas emergentes para imprimir");
        return;
      }

      ventanaImpresion.document.write(generarHTMLOrden(orden));
      ventanaImpresion.document.close();
      
      setTimeout(() => {
        ventanaImpresion.print();
      }, 500);

      /*
      // TODO: Implementar generación de PDF en el servidor
      const response = await fetch(`/api/medico/ordenes/${orden.id_orden}/pdf`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orden-${orden.numero_orden}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      */
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al generar el PDF");
    }
  };

  const handleImprimirOrden = (orden: OrdenExamen) => {
    const ventanaImpresion = window.open("", "_blank");
    if (!ventanaImpresion) {
      alert("Por favor, permita las ventanas emergentes para imprimir");
      return;
    }

    ventanaImpresion.document.write(generarHTMLOrden(orden));
    ventanaImpresion.document.close();
    
    setTimeout(() => {
      ventanaImpresion.print();
    }, 500);
  };

  const generarHTMLOrden = (orden: OrdenExamen): string => {
    const fechaEmision = formatearFecha(orden.fecha_emision);
    const valorTotal = orden.valor_total || orden.examenes.reduce((sum, ex) => sum + (ex.costo || 0), 0);

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orden de Exámenes - ${orden.numero_orden}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            background: white;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #2563eb;
            border-radius: 10px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .info-section {
            padding: 30px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          
          .info-box h3 {
            font-size: 11px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          .info-box p {
            font-size: 14px;
            color: #111827;
            font-weight: 600;
          }
          
          .info-box .secondary {
            font-size: 12px;
            color: #6b7280;
            font-weight: normal;
            margin-top: 4px;
          }
          
          .orden-details {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #bfdbfe;
          }
          
          .orden-details h2 {
            font-size: 16px;
            color: #1e40af;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .orden-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px dashed #2563eb;
            margin-bottom: 15px;
          }
          
          .diagnostico-box {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #bfdbfe;
          }
          
          .diagnostico-box h4 {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: 600;
          }
          
          .diagnostico-box p {
            font-size: 13px;
            color: #111827;
            line-height: 1.5;
          }
          
          .examenes-section {
            padding: 30px;
          }
          
          .examenes-section h2 {
            font-size: 18px;
            color: #111827;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
          }
          
          .examen-item {
            background: #f9fafb;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
          }
          
          .examen-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .examen-title {
            flex: 1;
          }
          
          .examen-title h3 {
            font-size: 16px;
            color: #111827;
            margin-bottom: 5px;
            font-weight: 600;
          }
          
          .examen-codigo {
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .examen-badge {
            background: #2563eb;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .examen-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          
          .detail-item {
            display: flex;
            align-items: start;
            gap: 10px;
          }
          
          .detail-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 600;
            min-width: 100px;
          }
          
          .detail-value {
            font-size: 12px;
            color: #111827;
            font-weight: 500;
          }
          
          .preparacion-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
          }
          
          .preparacion-box h4 {
            font-size: 12px;
            color: #92400e;
            margin-bottom: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .preparacion-box p {
            font-size: 11px;
            color: #78350f;
            line-height: 1.5;
          }
          
          .instrucciones-section {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .instrucciones-section h3 {
            font-size: 14px;
            color: #166534;
            margin-bottom: 12px;
            font-weight: 600;
          }
          
          .instrucciones-section p {
            font-size: 12px;
            color: #14532d;
            line-height: 1.6;
          }
          
          .resumen-section {
            background: #f9fafb;
            padding: 20px;
            border-top: 2px solid #e5e7eb;
          }
          
          .resumen-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .resumen-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .resumen-item h4 {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: 600;
          }
          
          .resumen-item p {
            font-size: 20px;
            color: #111827;
            font-weight: bold;
          }
          
          .valor-total {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          
          .valor-total h3 {
            font-size: 14px;
            margin-bottom: 10px;
            opacity: 0.9;
          }
          
          .valor-total p {
            font-size: 32px;
            font-weight: bold;
          }
          
          .footer {
            padding: 30px;
            background: #f9fafb;
            border-top: 2px solid #e5e7eb;
          }
          
          .firmas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
          }
          
          .firma-box {
            text-align: center;
          }
          
          .firma-linea {
            border-top: 2px solid #111827;
            margin-bottom: 10px;
            padding-top: 60px;
          }
          
          .firma-nombre {
            font-size: 13px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
          }
          
          .firma-cargo {
            font-size: 11px;
            color: #6b7280;
          }
          
          .notas-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          
          .notas-footer h4 {
            font-size: 12px;
            color: #111827;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .notas-footer ul {
            list-style: none;
            padding-left: 0;
          }
          
          .notas-footer li {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 6px;
            padding-left: 20px;
            position: relative;
          }
          
          .notas-footer li:before {
            content: "•";
            position: absolute;
            left: 8px;
            color: #2563eb;
            font-weight: bold;
          }
          
          .prioridad-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .prioridad-normal {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .prioridad-urgente {
            background: #fed7aa;
            color: #9a3412;
          }
          
          .prioridad-critica {
            background: #fecaca;
            color: #991b1b;
          }
          
          .qr-section {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 2px dashed #e5e7eb;
            margin-top: 20px;
          }
          
          .qr-section p {
            font-size: 10px;
            color: #6b7280;
            margin-top: 10px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .container {
              border: none;
              border-radius: 0;
            }
            
            .examen-item {
              page-break-inside: avoid;
            }
            
            @page {
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <h1>ORDEN DE EXÁMENES MÉDICOS</h1>
            <p>${usuario?.medico?.centro_principal.nombre || "Centro Médico"}</p>
            <p>${usuario?.medico?.centro_principal.ciudad || ""}, ${usuario?.medico?.centro_principal.region || "Chile"}</p>
          </div>
          
          <!-- INFORMACIÓN GENERAL -->
          <div class="info-section">
            <div class="info-grid">
              <div class="info-box">
                <h3>Paciente</h3>
                <p>${orden.paciente.nombre_completo}</p>
                <p class="secondary">RUT: ${orden.paciente.rut}</p>
                <p class="secondary">${orden.paciente.edad} años - ${orden.paciente.genero}</p>
                <p class="secondary">Previsión: ${orden.paciente.prevision}</p>
              </div>
              
              <div class="info-box">
                <h3>Médico Solicitante</h3>
                <p>Dr(a). ${usuario?.nombre} ${usuario?.apellido_paterno}</p>
                <p class="secondary">RM: ${usuario?.medico?.numero_registro_medico}</p>
                <p class="secondary">${usuario?.medico?.especialidades.find(e => e.es_principal)?.nombre || ""}</p>
              </div>
              
              <div class="info-box">
                <h3>Fecha de Emisión</h3>
                <p>${fechaEmision}</p>
                <p class="secondary">Hora: ${formatearHora(orden.fecha_emision)}</p>
              </div>
              
              <div class="info-box">
                <h3>Prioridad</h3>
                <p>
                  <span class="prioridad-badge prioridad-${orden.prioridad}">
                    ${COLORES_PRIORIDAD[orden.prioridad].label}
                  </span>
                </p>
              </div>
            </div>
            
            <div class="orden-details">
              <div class="orden-number">
                N° ORDEN: ${orden.numero_orden}
              </div>
              
              ${orden.diagnostico ? `
                <div class="diagnostico-box">
                  <h4>Diagnóstico / Indicación Clínica</h4>
                  <p><strong>${orden.codigo_cie10 ? `[${orden.codigo_cie10}]` : ""}</strong> ${orden.diagnostico}</p>
                </div>
              ` : ""}
              
              ${orden.comentarios ? `
                <div class="diagnostico-box" style="margin-top: 15px;">
                  <h4>Comentarios Adicionales</h4>
                  <p>${orden.comentarios}</p>
                </div>
              ` : ""}
            </div>
          </div>
          
          <!-- EXÁMENES SOLICITADOS -->
          <div class="examenes-section">
            <h2>Exámenes Solicitados (${orden.examenes.length})</h2>
            
            ${orden.examenes.map((examen, index) => `
              <div class="examen-item">
                <div class="examen-header">
                  <div class="examen-title">
                    <h3>${index + 1}. ${examen.tipo_examen.nombre}</h3>
                    <span class="examen-codigo">Código: ${examen.tipo_examen.codigo} ${examen.tipo_examen.codigo_fonasa ? `| FONASA: ${examen.tipo_examen.codigo_fonasa}` : ""}</span>
                  </div>
                  <div class="examen-badge">${examen.tipo_examen.categoria}</div>
                </div>
                
                <div class="examen-details">
                  ${examen.tipo_examen.descripcion ? `
                    <div class="detail-item" style="grid-column: 1 / -1;">
                      <span class="detail-label">Descripción:</span>
                      <span class="detail-value">${examen.tipo_examen.descripcion}</span>
                    </div>
                  ` : ""}
                  
                  <div class="detail-item">
                    <span class="detail-label">Complejidad:</span>
                    <span class="detail-value">${examen.tipo_examen.complejidad.toUpperCase()}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">Tiempo Resultado:</span>
                    <span class="detail-value">${examen.tipo_examen.tiempo_resultado_horas || "N/A"} horas</span>
                  </div>
                  
                  ${examen.tipo_examen.especialidad_relacionada ? `
                    <div class="detail-item">
                      <span class="detail-label">Especialidad:</span>
                      <span class="detail-value">${examen.tipo_examen.especialidad_relacionada}</span>
                    </div>
                  ` : ""}
                  
                  ${examen.costo ? `
                    <div class="detail-item">
                      <span class="detail-label">Valor:</span>
                      <span class="detail-value">${formatearMoneda(examen.costo)}</span>
                    </div>
                  ` : ""}
                </div>
                
                ${examen.tipo_examen.requiere_preparacion && examen.tipo_examen.instrucciones_preparacion ? `
                  <div class="preparacion-box">
                    <h4>⚠️ REQUIERE PREPARACIÓN</h4>
                    <p>${examen.tipo_examen.instrucciones_preparacion}</p>
                  </div>
                ` : ""}
                
                ${examen.instrucciones_especificas ? `
                  <div class="instrucciones-section">
                    <h3>Instrucciones Específicas</h3>
                    <p>${examen.instrucciones_especificas}</p>
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>
          
          <!-- RESUMEN -->
          <div class="resumen-section">
            <div class="resumen-grid">
              <div class="resumen-item">
                <h4>Total Exámenes</h4>
                <p>${orden.examenes.length}</p>
              </div>
              
              <div class="resumen-item">
                <h4>Tipo de Orden</h4>
                <p style="font-size: 14px;">${COLORES_TIPO_ORDEN[orden.tipo_orden].label}</p>
              </div>
              
              <div class="resumen-item">
                <h4>Estado</h4>
                <p style="font-size: 14px;">${orden.estado.toUpperCase()}</p>
              </div>
            </div>
            
            ${valorTotal > 0 ? `
              <div class="valor-total">
                <h3>Valor Total Estimado</h3>
                <p>${formatearMoneda(valorTotal)}</p>
              </div>
            ` : ""}
          </div>
          
          <!-- FOOTER -->
          <div class="footer">
            <div class="firmas">
              <div class="firma-box">
                <div class="firma-linea"></div>
                <p class="firma-nombre">Dr(a). ${usuario?.nombre} ${usuario?.apellido_paterno}</p>
                <p class="firma-cargo">Médico Solicitante</p>
                <p class="firma-cargo">RM: ${usuario?.medico?.numero_registro_medico}</p>
              </div>
              
              <div class="firma-box">
                <div class="firma-linea"></div>
                <p class="firma-nombre">${orden.paciente.nombre_completo}</p>
                <p class="firma-cargo">Paciente</p>
                <p class="firma-cargo">RUT: ${orden.paciente.rut}</p>
              </div>
            </div>
            
            <div class="notas-footer">
              <h4>Notas Importantes:</h4>
              <ul>
                <li>Esta orden tiene validez por 30 días desde su emisión</li>
                <li>El paciente debe presentar esta orden junto con su cédula de identidad</li>
                <li>Los resultados serán enviados directamente al médico tratante</li>
                <li>En caso de dudas, contactar al centro médico</li>
                <li>Conserve este documento hasta recibir los resultados</li>
              </ul>
            </div>
            
            <div class="qr-section">
              <div id="qrcode"></div>
              <p>Escanee este código QR para verificar la autenticidad de la orden</p>
            </div>
          </div>
        </div>
        
        <script>
          // Generar QR Code si está disponible
          if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById("qrcode"), {
              text: "${orden.numero_orden}",
              width: 128,
              height: 128
            });
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleExportarOrdenes = async (formato: "pdf" | "excel" | "csv") => {
    try {
      if (formato === "csv") {
        exportarCSV();
      } else if (formato === "excel") {
        alert("Exportación a Excel en desarrollo");
      } else {
        alert("Exportación a PDF en desarrollo");
      }
    } catch (error) {
      console.error("Error al exportar órdenes:", error);
      alert("Error al exportar");
    }
  };

  const exportarCSV = () => {
    const headers = [
      "Número Orden",
      "Fecha",
      "Paciente",
      "RUT",
      "Diagnóstico",
      "Cantidad Exámenes",
      "Estado",
      "Prioridad",
      "Valor Total",
    ];

    const rows = ordenesFiltradas.map((orden) => [
      orden.numero_orden,
      formatearFechaCorta(orden.fecha_emision),
      orden.paciente.nombre_completo,
      orden.paciente.rut,
      orden.diagnostico || "",
      orden.examenes.length,
      orden.estado,
      orden.prioridad,
      orden.valor_total || 0,
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ordenes-examenes-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEnviarPorEmail = async (orden: OrdenExamen) => {
    if (!orden.paciente.email) {
      alert("El paciente no tiene email registrado");
      return;
    }

    if (!confirm(`¿Enviar orden por email a ${orden.paciente.email}?`)) {
      return;
    }

    try {
      // TODO: Implementar envío de email
      console.log("Enviando email a:", orden.paciente.email);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Orden enviada por email exitosamente");

      /*
      const response = await fetch(`/api/medico/ordenes/${orden.id_orden}/enviar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: orden.paciente.email,
        }),
      });

      if (response.ok) {
        alert("Orden enviada por email exitosamente");
      } else {
        alert("Error al enviar el email");
      }
      */
    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el email");
    }
  };

  const handleDuplicarOrden = (orden: OrdenExamen) => {
    setFormularioOrden({
      id_paciente: orden.id_paciente,
      tipo_orden: orden.tipo_orden,
      prioridad: orden.prioridad,
      diagnostico: orden.diagnostico || "",
      codigo_cie10: orden.codigo_cie10 || "",
      comentarios: `Duplicado de orden ${orden.numero_orden}`,
      fecha_programada: new Date().toISOString().split("T")[0],
      examenes_seleccionados: orden.examenes.map((e) => e.id_tipo_examen),
      instrucciones_especiales: "",
    });
    setExamenesSeleccionados(orden.examenes.map((e) => e.tipo_examen));
    setPacienteSeleccionado(orden.paciente);
    setModalNuevaOrden(true);
  };

  // ========================================
  // FUNCIÓN PARA GENERAR DATOS SIMULADOS
  // ========================================

  const generarDatosSimulados = () => {
    const ordenesSimuladas: OrdenExamen[] = [];
    const examenesSimulados: ExamenMedico[] = [];

    // Generar 10 órdenes de ejemplo
    for (let i = 0; i < 10; i++) {
      const paciente = PACIENTES_MOCK[i % PACIENTES_MOCK.length];
      const tipoOrden: TipoOrden = ["laboratorio", "imagen", "procedimiento"][i % 3] as TipoOrden;
      const prioridad: Prioridad = ["normal", "urgente", "critica"][i % 3] as Prioridad;
      const estado: EstadoOrden = ["emitida", "en_proceso", "completada"][i % 3] as EstadoOrden;
      
      const cantidadExamenes = Math.floor(Math.random() * 3) + 1;
      const examenesOrden: ExamenMedico[] = [];
      
      for (let j = 0; j < cantidadExamenes; j++) {
        const tipoExamen = TIPOS_EXAMENES_MOCK[Math.floor(Math.random() * TIPOS_EXAMENES_MOCK.length)];
        const estadoExamen: EstadoExamen = ["solicitado", "programado", "realizado", "resultados_disponibles"][Math.floor(Math.random() * 4)] as EstadoExamen;
        
        const examen: ExamenMedico = {
          id_examen: i * 10 + j,
          id_paciente: paciente.id,
          id_tipo_examen: tipoExamen.id_tipo_examen,
          id_medico_solicitante: usuario?.medico?.id_medico || 1,
          id_centro: usuario?.medico?.centro_principal.id_centro || 1,
          fecha_solicitud: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          fecha_programada: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          fecha_realizacion: estadoExamen === "realizado" || estadoExamen === "resultados_disponibles" 
            ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
            : null,
          estado: estadoExamen,
          prioridad: prioridad,
          motivo_solicitud: "Control de salud",
          diagnostico: DIAGNOSTICOS_FRECUENTES[i % DIAGNOSTICOS_FRECUENTES.length].descripcion,
          codigo_cie10: DIAGNOSTICOS_FRECUENTES[i % DIAGNOSTICOS_FRECUENTES.length].codigo,
          instrucciones_especificas: tipoExamen.requiere_preparacion ? tipoExamen.instrucciones_preparacion : null,
          notas_tecnicas: null,
          id_profesional_realiza: null,
          id_laboratorio: null,
          numero_orden: generarNumeroOrden(),
          requiere_preparacion: tipoExamen.requiere_preparacion,
          confirmacion_preparacion: false,
          lugar_realizacion: null,
          id_cita: null,
          id_historial: null,
          id_orden: i + 1,
          pagado: Math.random() > 0.3,
          costo: tipoExamen.valor_fonasa,
          cubierto_seguro: Math.random() > 0.5,
          tipo_examen: tipoExamen,
          paciente: {
            id_paciente: paciente.id,
            nombre_completo: paciente.nombre,
            edad: paciente.edad,
            genero: paciente.genero,
            telefono: paciente.telefono,
            email: paciente.email,
            foto_url: paciente.foto_url,
            rut: paciente.rut,
            prevision: paciente.prevision,
          },
          resultados: estadoExamen === "resultados_disponibles" ? [{
            id_resultado: i * 10 + j,
            id_examen: i * 10 + j,
            id_paciente: paciente.id,
            fecha_resultado: new Date().toISOString(),
            profesional_id: null,
            titulo: `Resultado ${tipoExamen.nombre}`,
            formato: "texto",
            resultado_texto: "Valores dentro de rangos normales",
            resultado_numerico: null,
            unidad_medida: null,
            resultado_positivo: null,
            url_resultado: null,
            resultado_json: null,
            interpretacion: "Normal",
            observaciones: null,
            estado: "final",
            es_critico: false,
            notificado_medico: true,
            fecha_notificacion_medico: new Date().toISOString(),
            validado: true,
            validado_por: null,
            fecha_validacion: new Date().toISOString(),
            requiere_seguimiento: false,
            valores_referencia: null,
          }] : [],
        };
        
        examenesOrden.push(examen);
        examenesSimulados.push(examen);
      }
      
      const orden: OrdenExamen = {
        id_orden: i + 1,
        id_centro: usuario?.medico?.centro_principal.id_centro || 1,
        id_paciente: paciente.id,
        id_medico: usuario?.medico?.id_medico || 1,
        numero_orden: generarNumeroOrden(),
        fecha_emision: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        estado: estado,
        tipo_orden: tipoOrden,
        prioridad: prioridad,
        diagnostico: DIAGNOSTICOS_FRECUENTES[i % DIAGNOSTICOS_FRECUENTES.length].descripcion,
        codigo_cie10: DIAGNOSTICOS_FRECUENTES[i % DIAGNOSTICOS_FRECUENTES.length].codigo,
        comentarios: i % 2 === 0 ? "Control de rutina" : null,
        id_laboratorio: null,
        id_historial: null,
        id_cita: null,
        fecha_entrega_estimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        url_documento: null,
        cantidad_examenes: examenesOrden.length,
        pagada: Math.random() > 0.3,
        valor_total: examenesOrden.reduce((sum, ex) => sum + (ex.costo || 0), 0),
        paciente: {
          id_paciente: paciente.id,
          nombre_completo: paciente.nombre,
          edad: paciente.edad,
          genero: paciente.genero,
          rut: paciente.rut,
          prevision: paciente.prevision,
          telefono: paciente.telefono,
          email: paciente.email,
          foto_url: paciente.foto_url,
        },
        examenes: examenesOrden,
      };
      
      ordenesSimuladas.push(orden);
    }

    // Generar estadísticas
    const estadisticas: EstadisticasExamenes = {
      total_examenes: examenesSimulados.length,
      solicitados: examenesSimulados.filter(e => e.estado === "solicitado").length,
      programados: examenesSimulados.filter(e => e.estado === "programado").length,
      realizados: examenesSimulados.filter(e => e.estado === "realizado").length,
      con_resultados: examenesSimulados.filter(e => e.estado === "resultados_disponibles").length,
      cancelados: examenesSimulados.filter(e => e.estado === "cancelado").length,
      pendientes_resultado: examenesSimulados.filter(e => e.estado === "realizado" && e.resultados.length === 0).length,
      resultados_criticos: examenesSimulados.filter(e => e.resultados.some(r => r.es_critico)).length,
      examenes_mes_actual: examenesSimulados.length,
      examenes_mes_anterior: Math.floor(examenesSimulados.length * 0.8),
      tendencia_mensual: 20,
      promedio_tiempo_resultado: 48,
      tasa_cumplimiento: 92,
      examenes_por_categoria: CATEGORIAS_EXAMENES.slice(0, 6).map((cat, i) => ({
        categoria: cat,
        cantidad: Math.floor(Math.random() * 20) + 5,
        color: COLORES_GRAFICO[i % COLORES_GRAFICO.length],
      })),
      examenes_mas_solicitados: TIPOS_EXAMENES_MOCK.slice(0, 5).map((tipo, i) => ({
        nombre: tipo.nombre,
        cantidad: Math.floor(Math.random() * 15) + 5,
        valor: tipo.valor_fonasa || 0,
      })),
      examenes_por_estado: Object.keys(COLORES_ESTADO).map((estado) => ({
        estado: COLORES_ESTADO[estado as EstadoExamen].label,
        cantidad: examenesSimulados.filter(e => e.estado === estado).length,
        porcentaje: (examenesSimulados.filter(e => e.estado === estado).length / examenesSimulados.length) * 100,
      })),
      examenes_por_prioridad: Object.keys(COLORES_PRIORIDAD).map((prioridad) => ({
        prioridad: COLORES_PRIORIDAD[prioridad as Prioridad].label,
        cantidad: examenesSimulados.filter(e => e.prioridad === prioridad).length,
      })),
      evolucion_mensual: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"].map((mes, i) => ({
        mes,
        cantidad: Math.floor(Math.random() * 30) + 20,
        completados: Math.floor(Math.random() * 25) + 15,
      })),
      tiempo_promedio_por_tipo: TIPOS_EXAMENES_MOCK.slice(0, 5).map((tipo) => ({
        tipo: tipo.nombre,
        horas: tipo.tiempo_resultado_horas || 24,
      })),
    };

    return {
      ordenes: ordenesSimuladas,
      examenes: examenesSimulados,
      estadisticas,
    };
  };

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
            <div className="w-32 h-32 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <Beaker className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Sistema de Exámenes
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando el sistema profesional de exámenes médicos...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
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
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>
            Acceso No Autorizado
          </h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            No tienes permisos para acceder al sistema de exámenes médicos
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
  // RENDER - SISTEMA COMPLETO
  // ========================================

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarAbierto ? "w-20" : "w-0"
        } ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}
      >
        {sidebarAbierto && (
          <div className="flex flex-col h-full items-center py-6 gap-4">
            <Link
              href="/medico"
              className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110`}
            >
              <Stethoscope className="w-6 h-6 text-white" />
            </Link>

            <div className="flex-1 flex flex-col gap-2 w-full px-2">
              <Link
                href="/medico"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Home
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/agenda"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Calendar
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/recetas"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <FileText
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/examenes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r ${tema.colores.gradiente} shadow-lg`}
              >
                <Beaker className="w-6 h-6 text-white" />
              </Link>

              <Link
                href="/medico/pacientes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Users
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/mensajes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group relative`}
              >
                <MessageSquare
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
                {notificaciones.filter(n => !n.leida).length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Link>

              <button
                onClick={() => setModalSelectorTema(true)}
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                {React.createElement(tema.icono, {
                  className: `w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`,
                })}
              </button>

              <Link
                href="/medico/configuracion"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
              >
                <Settings
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>
            </div>

            <button
              onClick={cerrarSesion}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-red-500/20 group`}
            >
              <LogOut className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-20" : "ml-0"
        } p-8`}
      >
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-white/10`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={64}
                      height={64}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>

              <div>
                <h1
                  className={`text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}
                >
                  <Microscope className="w-8 h-8" />
                  Sistema de Exámenes Médicos
                  {usuario.medico.especialidades.find((e) => e.es_principal) && (
                    <span
                      className={`text-base font-semibold px-3 py-1 rounded-full ${tema.colores.secundario} ${tema.colores.texto}`}
                    >
                      {
                        usuario.medico.especialidades.find((e) => e.es_principal)
                          ?.nombre
                      }
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-2">
                    {usuario.medico.centro_principal.logo_url ? (
                      <Image
                        src={usuario.medico.centro_principal.logo_url}
                        alt={usuario.medico.centro_principal.nombre}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    ) : (
                      <Building2
                        className={`w-5 h-5 ${tema.colores.acento}`}
                      />
                    )}
                    <span
                      className={`text-base font-semibold ${tema.colores.textoSecundario}`}
                    >
                      {usuario.medico.centro_principal.nombre}
                    </span>
                  </div>

                  <span className={`text-base ${tema.colores.textoSecundario}`}>
                    •
                  </span>

                  <span
                    className={`text-base font-semibold ${tema.colores.textoSecundario}`}
                  >
                    RM: {usuario.medico.numero_registro_medico}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                className={`relative p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              >
                <Bell className="w-5 h-5" />
                {notificaciones.filter(n => !n.leida).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notificaciones.filter(n => !n.leida).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => cargarDatosExamenes()}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              <button
                onClick={handleNuevaOrden}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <Plus className="w-5 h-5" />
                Nueva Orden
              </button>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Beaker className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.total_examenes}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Total Exámenes
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.con_resultados}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Con Resultados
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileClock className="w-6 h-6 text-white" />
                </div>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.pendientes_resultado}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Pendientes
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.resultados_criticos}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Críticos
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.tasa_cumplimiento.toFixed(0)}%
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Cumplimiento
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.promedio_tiempo_resultado}h
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Tiempo Promedio
              </div>
            </div>
          </div>
        )}

        {/* CONTROLES Y BÚSQUEDA */}
        <div
          className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setVistaModo("lista")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "lista"
                    ? `${tema.colores.primario} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title="Vista Lista"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVistaModo("grid")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "grid"
                    ? `${tema.colores.primario} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title="Vista Grid"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVistaModo("timeline")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "timeline"
                    ? `${tema.colores.primario} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title="Vista Timeline"
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVistaModo("calendario")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "calendario"
                    ? `${tema.colores.primario} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title="Vista Calendario"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setModalGraficos(true);
                  setVistaModo("graficos");
                }}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "graficos"
                    ? `${tema.colores.primario} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title="Vista Gráficos"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVistaModo("kanban")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  vistaModo === "kanban"
                    ? `${tema.colores.primario} text-white shadow-lg`
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
                title="Vista Kanban"
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 relative`}
              >
                <Filter className="w-5 h-5" />
                {(filtros.estados.length > 0 ||
                  filtros.categorias.length > 0 ||
                  filtros.prioridades.length > 0 ||
                  filtros.con_resultados !== null ||
                  filtros.resultados_criticos !== null ||
                  filtros.pendiente_pago !== null) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {filtros.estados.length +
                      filtros.categorias.length +
                      filtros.prioridades.length +
                      (filtros.con_resultados !== null ? 1 : 0) +
                      (filtros.resultados_criticos !== null ? 1 : 0) +
                      (filtros.pendiente_pago !== null ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="relative group">
                <button
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                >
                  <Download className="w-5 h-5" />
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1 z-50`}
                >
                  <button
                    onClick={() => handleExportarOrdenes("pdf")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => handleExportarOrdenes("excel")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Exportar Excel
                  </button>
                  <button
                    onClick={() => handleExportarOrdenes("csv")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Exportar CSV
                  </button>
                </div>
              </div>

              <button
                onClick={() => setModalIntegracionLaboratorio(true)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                title="Integraciones"
              >
                <Database className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar por paciente, N° orden, RUT, diagnóstico..."
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

          {/* PANEL DE FILTROS */}
          {filtrosAbiertos && (
            <div className={`mt-6 p-6 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Filtro por Estado */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Estados
                  </label>
                  <div className="space-y-2">
                    {Object.entries(COLORES_ESTADO).map(([estado, config]) => (
                      <label key={estado} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.estados.includes(estado as EstadoExamen)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                estados: [...filtros.estados, estado as EstadoExamen],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                estados: filtros.estados.filter((s) => s !== estado),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                          {config.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por Prioridad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Prioridades
                  </label>
                  <div className="space-y-2">
                    {Object.entries(COLORES_PRIORIDAD).map(([prioridad, config]) => (
                      <label key={prioridad} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.prioridades.includes(prioridad as Prioridad)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                prioridades: [...filtros.prioridades, prioridad as Prioridad],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                prioridades: filtros.prioridades.filter((p) => p !== prioridad),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                          {config.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por Categoría */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Categorías
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {CATEGORIAS_EXAMENES.map((categoria) => (
                      <label key={categoria} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.categorias.includes(categoria)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                categorias: [...filtros.categorias, categoria],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                categorias: filtros.categorias.filter((c) => c !== categoria),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                          {categoria}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtros Adicionales */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Filtros Adicionales
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.con_resultados === true}
                        onChange={(e) => {
                          setFiltros({
                            ...filtros,
                            con_resultados: e.target.checked ? true : null,
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Con Resultados
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.resultados_criticos === true}
                        onChange={(e) => {
                          setFiltros({
                            ...filtros,
                            resultados_criticos: e.target.checked ? true : null,
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Resultados Críticos
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.pendiente_pago === true}
                        onChange={(e) => {
                          setFiltros({
                            ...filtros,
                            pendiente_pago: e.target.checked ? true : null,
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Pendiente de Pago
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.requiere_preparacion === true}
                        onChange={(e) => {
                          setFiltros({
                            ...filtros,
                            requiere_preparacion: e.target.checked ? true : null,
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Requiere Preparación
                      </span>
                    </label>
                  </div>
                </div>

                {/* Filtro por Fechas */}
                <div className="lg:col-span-2">
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Rango de Fechas
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${tema.colores.textoSecundario}`}>
                        Desde
                      </label>
                      <input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) =>
                          setFiltros({ ...filtros, fechaInicio: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${tema.colores.textoSecundario}`}>
                        Hasta
                      </label>
                      <input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) =>
                          setFiltros({ ...filtros, fechaFin: e.target.value })
                        }
                        className={`w-full px-4 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setFiltros({
                      fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        .toISOString()
                        .split("T")[0],
                      fechaFin: new Date().toISOString().split("T")[0],
                      estados: [],
                      tipos: [],
                      categorias: [],
                      prioridades: [],
                      paciente: "",
                      con_resultados: null,
                      resultados_criticos: null,
                      pendiente_pago: null,
                      requiere_preparacion: null,
                    });
                  }}
                  className={`px-6 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-semibold transition-all duration-300 hover:scale-105`}
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={() => setFiltrosAbiertos(false)}
                  className={`px-6 py-2 rounded-lg ${tema.colores.primario} text-white font-semibold transition-all duration-300 hover:scale-105`}
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO SEGÚN VISTA */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className={`w-16 h-16 animate-spin ${tema.colores.acento} mx-auto mb-4`} />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando órdenes de exámenes...
              </p>
            </div>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div
            className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6`}
            >
              <FileX className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${tema.colores.texto}`}>
              No se encontraron órdenes
            </h3>
            <p className={`text-lg mb-6 ${tema.colores.textoSecundario}`}>
              No hay órdenes de exámenes que coincidan con los filtros seleccionados
            </p>
            <button
              onClick={handleNuevaOrden}
              className={`inline-flex items-center gap-2 px-8 py-4 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <Plus className="w-5 h-5" />
              Crear Primera Orden
            </button>
          </div>
        ) : (
          <>
            {/* VISTA LISTA */}
            {vistaModo === "lista" && (
              <div className="space-y-4">
                {ordenesFiltradas.map((orden) => (
                  <div
                    key={orden.id_orden}
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                        >
                          {orden.paciente.foto_url ? (
                            <Image
                              src={orden.paciente.foto_url}
                              alt={orden.paciente.nombre_completo}
                              width={64}
                              height={64}
                              className="rounded-xl object-cover"
                            />
                          ) : (
                            orden.paciente.nombre_completo.split(" ").map((n) => n[0]).join("").slice(0, 2)
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                              {orden.paciente.nombre_completo}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                COLORES_PRIORIDAD[orden.prioridad].bg
                              } ${COLORES_PRIORIDAD[orden.prioridad].text}`}
                            >
                              {COLORES_PRIORIDAD[orden.prioridad].label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                              RUT: {orden.paciente.rut}
                            </span>
                            <span className={`text-sm ${tema.colores.textoSecundario}`}>•</span>
                            <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                              {orden.paciente.edad} años
                            </span>
                            <span className={`text-sm ${tema.colores.textoSecundario}`}>•</span>
                            <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                              {orden.paciente.prevision}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <Hash className={`w-4 h-4 ${tema.colores.acento}`} />
                              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                                {orden.numero_orden}
                              </span>
                            </div>
                            <span className={`text-sm ${tema.colores.textoSecundario}`}>•</span>
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                              <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                                {formatearFechaCorta(orden.fecha_emision)}
                              </span>
                            </div>
                            <span className={`text-sm ${tema.colores.textoSecundario}`}>•</span>
                            <div className="flex items-center gap-2">
                              {React.createElement(COLORES_TIPO_ORDEN[orden.tipo_orden].icon, {
                                className: `w-4 h-4 ${tema.colores.textoSecundario}`,
                              })}
                              <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                                {COLORES_TIPO_ORDEN[orden.tipo_orden].label}
                              </span>
                            </div>
                          </div>

                          {orden.diagnostico && (
                            <div className={`p-3 rounded-lg ${tema.colores.fondoSecundario} ${tema.colores.borde} border mb-3`}>
                              <p className={`text-sm font-semibold ${tema.colores.texto}`}>
                                <strong className={tema.colores.acento}>
                                  {orden.codigo_cie10 && `[${orden.codigo_cie10}]`}
                                </strong>{" "}
                                {orden.diagnostico}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {orden.examenes.slice(0, 3).map((examen) => (
                              <span
                                key={examen.id_examen}
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                              >
                                {examen.tipo_examen.nombre}
                              </span>
                            ))}
                            {orden.examenes.length > 3 && (
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.acento} bg-indigo-500/20`}
                              >
                                +{orden.examenes.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerDetalles(orden)}
                            className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                            title="Ver Detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditarOrden(orden)}
                            className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleImprimirOrden(orden)}
                            className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                            title="Imprimir"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => generarQRCode(orden)}
                            className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                            title="Código QR"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                          <div className="relative group">
                            <button
                              className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            <div
                              className={`absolute right-0 mt-2 w-48 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1 z-50`}
                            >
                              <button
                                onClick={() => handleDuplicarOrden(orden)}
                                className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                              >
                                <Copy className="w-4 h-4" />
                                Duplicar
                              </button>
                              <button
                                onClick={() => handleEnviarPorEmail(orden)}
                                className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                              >
                                <Mail className="w-4 h-4" />
                                Enviar Email
                              </button>
                              <button
                                onClick={() => handleDescargarPDF(orden)}
                                className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                              >
                                <Download className="w-4 h-4" />
                                Descargar PDF
                              </button>
                              <button
                                onClick={() => handleCancelarOrden(orden.id_orden)}
                                className={`w-full text-left px-4 py-2 rounded-lg hover:bg-red-500/20 text-red-400 font-semibold flex items-center gap-2`}
                              >
                                <XCircle className="w-4 h-4" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>

                        {orden.valor_total && (
                          <div className="text-right">
                            <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                              Valor Total
                            </p>
                            <p className={`text-2xl font-black ${tema.colores.acento}`}>
                              {formatearMoneda(orden.valor_total)}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {!orden.pagada && (
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
                              Pendiente Pago
                            </span>
                          )}
                          {orden.examenes.some((e) => e.resultados.some((r) => r.es_critico)) && (
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 animate-pulse">
                              ⚠️ Crítico
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Beaker className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            {orden.examenes.length} exámenes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileCheck className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            {orden.examenes.filter((e) => e.resultados.length > 0).length} con resultados
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {orden.examenes.map((examen) => {
                          const EstadoIcon = COLORES_ESTADO[examen.estado].icon;
                          return (
                            <div
                              key={examen.id_examen}
                              className={`p-2 rounded-lg ${COLORES_ESTADO[examen.estado].bg} ${COLORES_ESTADO[examen.estado].border} border`}
                              title={COLORES_ESTADO[examen.estado].label}
                            >
                              <EstadoIcon className={`w-4 h-4 ${COLORES_ESTADO[examen.estado].text}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA GRID */}
            {vistaModo === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ordenesFiltradas.map((orden) => (
                  <div
                    key={orden.id_orden}
                    className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow-lg`}
                      >
                        {orden.paciente.nombre_completo.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          COLORES_PRIORIDAD[orden.prioridad].bg
                        } ${COLORES_PRIORIDAD[orden.prioridad].text}`}
                      >
                        {COLORES_PRIORIDAD[orden.prioridad].label}
                      </span>
                    </div>

                    <h3 className={`text-lg font-black mb-2 ${tema.colores.texto}`}>
                      {orden.paciente.nombre_completo}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Hash className={`w-4 h-4 ${tema.colores.acento}`} />
                        <span className={`text-sm font-bold ${tema.colores.acento}`}>
                          {orden.numero_orden}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>
                          {formatearFechaCorta(orden.fecha_emision)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Beaker className={`w-4 h-4 ${tema.colores.textoSecundario}`} />
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>
                          {orden.examenes.length} exámenes
                        </span>
                      </div>
                    </div>

                    {orden.valor_total && (
                      <div className={`p-3 rounded-lg ${tema.colores.fondoSecundario} mb-4`}>
                        <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                          Valor Total
                        </p>
                        <p className={`text-xl font-black ${tema.colores.acento}`}>
                          {formatearMoneda(orden.valor_total)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerDetalles(orden)}
                        className={`flex-1 py-2 rounded-lg ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-105`}
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleImprimirOrden(orden)}
                        className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA KANBAN */}
            {vistaModo === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(COLORES_ESTADO).map(([estado, config]) => {
                  const ordenesEstado = ordenesFiltradas.filter((orden) =>
                    orden.examenes.some((e) => e.estado === estado)
                  );

                  return (
                    <div key={estado} className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border`}>
                      <div className="flex items-center gap-3 mb-4">
                        {React.createElement(config.icon, {
                          className: `w-5 h-5 ${config.text}`,
                        })}
                        <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                          {config.label}
                        </h3>
                        <span className={`ml-auto px-2 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.text}`}>
                          {ordenesEstado.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {ordenesEstado.map((orden) => (
                          <div
                            key={orden.id_orden}
                            className={`p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border cursor-pointer transition-all duration-300 hover:scale-105`}
                            onClick={() => handleVerDetalles(orden)}
                          >
                            <p className={`text-sm font-bold ${tema.colores.texto} mb-2`}>
                              {orden.paciente.nombre_completo}
                            </p>
                            <p className={`text-xs ${tema.colores.textoSecundario} mb-2`}>
                              {orden.numero_orden}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                                {orden.examenes.length} exámenes
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold ${
                                  COLORES_PRIORIDAD[orden.prioridad].bg
                                } ${COLORES_PRIORIDAD[orden.prioridad].text}`}
                              >
                                {COLORES_PRIORIDAD[orden.prioridad].label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODALES - Continuará en el siguiente mensaje... */}
      
      {/* MODAL NUEVA ORDEN */}
      {modalNuevaOrden && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className={`sticky top-0 z-10 p-6 border-b ${tema.colores.borde} ${tema.colores.card} flex items-center justify-between`}>
              <h2 className={`text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}>
                <Plus className="w-8 h-8" />
                Nueva Orden de Exámenes
              </h2>
              <button
                onClick={() => setModalNuevaOrden(false)}
                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Selección de Paciente */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Paciente *
                </label>
                {pacienteSeleccionado ? (
                  <div className={`p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold`}
                      >
                        {pacienteSeleccionado.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className={`font-bold ${tema.colores.texto}`}>
                          {pacienteSeleccionado.nombre}
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          RUT: {pacienteSeleccionado.rut} | {pacienteSeleccionado.prevision}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPacienteSeleccionado(null);
                        setFormularioOrden({ ...formularioOrden, id_paciente: null });
                      }}
                      className={`p-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setModalSeleccionarPaciente(true)}
                    className={`w-full p-4 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
                  >
                    <User className="w-5 h-5" />
                    Seleccionar Paciente
                  </button>
                )}
              </div>

              {/* Tipo de Orden y Prioridad */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Tipo de Orden *
                  </label>
                  <select
                    value={formularioOrden.tipo_orden}
                    onChange={(e) =>
                      setFormularioOrden({
                        ...formularioOrden,
                        tipo_orden: e.target.value as TipoOrden,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  >
                    {Object.entries(COLORES_TIPO_ORDEN).map(([tipo, config]) => (
                      <option key={tipo} value={tipo}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                    Prioridad *
                  </label>
                  <select
                    value={formularioOrden.prioridad}
                    onChange={(e) =>
                      setFormularioOrden({
                        ...formularioOrden,
                        prioridad: e.target.value as Prioridad,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  >
                    {Object.entries(COLORES_PRIORIDAD).map(([prioridad, config]) => (
                      <option key={prioridad} value={prioridad}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diagnóstico */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Diagnóstico / Indicación Clínica *
                </label>
                <div className="relative">
                  <textarea
                    value={formularioOrden.diagnostico}
                    onChange={(e) =>
                      setFormularioOrden({
                        ...formularioOrden,
                        diagnostico: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Ingrese el diagnóstico o indicación clínica..."
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                  />
                  <div className="absolute bottom-3 right-3">
                    <select
                      onChange={(e) => {
                        const diagnostico = DIAGNOSTICOS_FRECUENTES.find(
                          (d) => d.codigo === e.target.value
                        );
                        if (diagnostico) {
                          setFormularioOrden({
                            ...formularioOrden,
                            diagnostico: diagnostico.descripcion,
                            codigo_cie10: diagnostico.codigo,
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} text-sm font-semibold focus:outline-none`}
                    >
                      <option value="">Diagnósticos frecuentes...</option>
                      {DIAGNOSTICOS_FRECUENTES.map((diag) => (
                        <option key={diag.codigo} value={diag.codigo}>
                          [{diag.codigo}] {diag.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Código CIE-10 */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Código CIE-10
                </label>
                <input
                  type="text"
                  value={formularioOrden.codigo_cie10}
                  onChange={(e) =>
                    setFormularioOrden({
                      ...formularioOrden,
                      codigo_cie10: e.target.value,
                    })
                  }
                  placeholder="Ej: E11, I10, etc."
                  className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
              </div>

              {/* Exámenes Seleccionados */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-bold ${tema.colores.texto}`}>
                    Exámenes Seleccionados ({examenesSeleccionados.length})
                  </label>
                  <button
                    onClick={() => setModalSeleccionarExamenes(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-105`}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Exámenes
                  </button>
                </div>

                {examenesSeleccionados.length === 0 ? (
                  <div className={`p-8 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border text-center`}>
                    <Beaker className={`w-12 h-12 ${tema.colores.textoSecundario} mx-auto mb-3`} />
                    <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                      No hay exámenes seleccionados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {examenesSeleccionados.map((examen) => (
                      <div
                        key={examen.id_tipo_examen}
                        className={`p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border flex items-center justify-between`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`font-bold ${tema.colores.texto}`}>
                              {examen.nombre}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}>
                              {examen.categoria}
                            </span>
                            {examen.requiere_preparacion && (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400">
                                Requiere Preparación
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${tema.colores.textoSecundario} mb-2`}>
                            {examen.descripcion}
                          </p>
                          {examen.requiere_preparacion && examen.instrucciones_preparacion && (
                            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                              <p className="text-xs text-yellow-400">
                                <strong>Preparación:</strong> {examen.instrucciones_preparacion}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-xs ${tema.colores.textoSecundario}`}>
                              Código: {examen.codigo}
                            </span>
                            {examen.valor_fonasa && (
                              <span className={`text-xs font-bold ${tema.colores.acento}`}>
                                {formatearMoneda(examen.valor_fonasa)}
                              </span>
                            )}
                            {examen.tiempo_resultado_horas && (
                              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                                Resultado en {examen.tiempo_resultado_horas}h
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEliminarExamen(examen.id_tipo_examen)}
                          className={`p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all duration-300 hover:scale-110`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comentarios */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Comentarios Adicionales
                </label>
                <textarea
                  value={formularioOrden.comentarios}
                  onChange={(e) =>
                    setFormularioOrden({
                      ...formularioOrden,
                      comentarios: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Comentarios adicionales sobre la orden..."
                  className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                />
              </div>

              {/* Fecha Programada */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${tema.colores.texto}`}>
                  Fecha Programada
                </label>
                <input
                  type="date"
                  value={formularioOrden.fecha_programada}
                  onChange={(e) =>
                    setFormularioOrden({
                      ...formularioOrden,
                      fecha_programada: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
              </div>

              {/* Resumen */}
              {examenesSeleccionados.length > 0 && (
                <div className={`p-6 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} text-white`}>
                  <h3 className="text-xl font-black mb-4">Resumen de la Orden</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Total Exámenes</p>
                      <p className="text-3xl font-black">{examenesSeleccionados.length}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Requieren Preparación</p>
                      <p className="text-3xl font-black">
                        {examenesSeleccionados.filter((e) => e.requiere_preparacion).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Valor Total Estimado</p>
                      <p className="text-3xl font-black">
                        {formatearMoneda(
                          examenesSeleccionados.reduce((sum, e) => sum + (e.valor_fonasa || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`sticky bottom-0 p-6 border-t ${tema.colores.borde} ${tema.colores.card} flex items-center justify-end gap-3`}>
              <button
                onClick={() => setModalNuevaOrden(false)}
                className={`px-8 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarOrden}
                disabled={!formularioOrden.id_paciente || examenesSeleccionados.length === 0}
                className={`px-8 py-3 rounded-xl ${
                  !formularioOrden.id_paciente || examenesSeleccionados.length === 0
                    ? "bg-gray-600 cursor-not-allowed"
                    : tema.colores.primario
                } text-white font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              >
                <Save className="w-5 h-5" />
                Guardar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SELECCIONAR PACIENTE */}
      {modalSeleccionarPaciente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className={`sticky top-0 z-10 p-6 border-b ${tema.colores.borde} ${tema.colores.card}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Seleccionar Paciente
                </h2>
                <button
                  onClick={() => setModalSeleccionarPaciente(false)}
                  className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={busquedaPaciente}
                  onChange={(e) => setBusquedaPaciente(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
              </div>
            </div>

            <div className="p-6 space-y-3">
              {pacientesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <User className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4`} />
                  <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                    No se encontraron pacientes
                  </p>
                </div>
              ) : (
                pacientesFiltrados.map((paciente) => (
                  <button
                    key={paciente.id}
                    onClick={() => handleSeleccionarPaciente(paciente)}
                    className={`w-full p-4 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500 text-left`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {paciente.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${tema.colores.texto} mb-1`}>
                          {paciente.nombre}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${tema.colores.textoSecundario}`}>
                            RUT: {paciente.rut}
                          </span>
                          <span className={`text-sm ${tema.colores.textoSecundario}`}>
                            {paciente.edad} años
                          </span>
                          <span className={`text-sm ${tema.colores.textoSecundario}`}>
                            {paciente.prevision}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-6 h-6 ${tema.colores.textoSecundario}`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SELECCIONAR EXÁMENES */}
      {modalSeleccionarExamenes && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className={`sticky top-0 z-10 p-6 border-b ${tema.colores.borde} ${tema.colores.card}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
                  Seleccionar Exámenes
                </h2>
                <button
                  onClick={() => setModalSeleccionarExamenes(false)}
                  className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
                  />
                  <input
                    type="text"
                    placeholder="Buscar exámenes por nombre, código o categoría..."
                    value={busquedaExamen}
                    onChange={(e) => setBusquedaExamen(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCategoriaSeleccionada("todas")}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                      categoriaSeleccionada === "todas"
                        ? `${tema.colores.primario} text-white`
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIAS_EXAMENES.slice(0, 8).map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => setCategoriaSeleccionada(categoria)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                        categoriaSeleccionada === categoria
                          ? `${tema.colores.primario} text-white`
                          : `${tema.colores.secundario} ${tema.colores.texto}`
                      }`}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examenesFiltrados.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <Beaker className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4`} />
                    <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                      No se encontraron exámenes
                    </p>
                  </div>
                ) : (
                  examenesFiltrados.map((examen) => {
                    const yaSeleccionado = examenesSeleccionados.some(
                      (e) => e.id_tipo_examen === examen.id_tipo_examen
                    );

                    return (
                      <button
                        key={examen.id_tipo_examen}
                        onClick={() => {
                          if (yaSeleccionado) {
                            handleEliminarExamen(examen.id_tipo_examen);
                          } else {
                            handleAgregarExamen(examen);
                          }
                        }}
                        className={`p-4 rounded-xl text-left transition-all duration-300 ${
                          yaSeleccionado
                            ? `bg-indigo-500/20 border-2 border-indigo-500 ${tema.colores.sombra}`
                            : `${tema.colores.fondoSecundario} ${tema.colores.borde} border hover:border-indigo-500/50`
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`font-bold ${tema.colores.texto}`}>
                                {examen.nombre}
                              </h3>
                              {yaSeleccionado && (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}>
                                {examen.categoria}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}>
                                {examen.codigo}
                              </span>
                              {examen.requiere_ayuno && (
                                <span className="px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400">
                                  Ayuno
                                </span>
                              )}
                              {examen.requiere_preparacion && (
                                <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400">
                                  Preparación
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {examen.descripcion && (
                          <p className={`text-sm ${tema.colores.textoSecundario} mb-3 line-clamp-2`}>
                            {examen.descripcion}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {examen.valor_fonasa && (
                              <span className={`text-sm font-bold ${tema.colores.acento}`}>
                                {formatearMoneda(examen.valor_fonasa)}
                              </span>
                            )}
                            {examen.tiempo_resultado_horas && (
                              <span className={`text-xs ${tema.colores.textoSecundario}`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {examen.tiempo_resultado_horas}h
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              examen.complejidad === "baja"
                                ? "bg-green-500/20 text-green-400"
                                : examen.complejidad === "media"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : examen.complejidad === "alta"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {examen.complejidad.toUpperCase()}
                          </span>
                        </div>

                        {examen.requiere_preparacion && examen.instrucciones_preparacion && (
                          <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-xs text-yellow-400">
                              <strong>Preparación:</strong> {examen.instrucciones_preparacion}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className={`sticky bottom-0 p-6 border-t ${tema.colores.borde} ${tema.colores.card} flex items-center justify-between`}>
              <div className={`text-lg font-bold ${tema.colores.texto}`}>
                {examenesSeleccionados.length} exámenes seleccionados
                {examenesSeleccionados.length > 0 && (
                  <span className={`ml-3 ${tema.colores.acento}`}>
                    Total: {formatearMoneda(
                      examenesSeleccionados.reduce((sum, e) => sum + (e.valor_fonasa || 0), 0)
                    )}
                  </span>
                )}
              </div>
              <button
                onClick={() => setModalSeleccionarExamenes(false)}
                className={`px-8 py-3 rounded-xl ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-105`}
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES ORDEN */}
      {modalDetallesOrden && ordenSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className={`sticky top-0 z-10 p-6 border-b ${tema.colores.borde} ${tema.colores.card}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}>
                  <FileText className="w-8 h-8" />
                  Detalles de la Orden
                </h2>
                <button
                  onClick={() => setModalDetallesOrden(false)}
                  className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
                  <h3 className={`text-lg font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}>
                    <User className="w-5 h-5" />
                    Información del Paciente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl`}
                      >
                        {ordenSeleccionada.paciente.nombre_completo.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className={`text-xl font-bold ${tema.colores.texto}`}>
                          {ordenSeleccionada.paciente.nombre_completo}
                        </p>
                        <p className={`text-sm ${tema.colores.textoSecundario}`}>
                          {ordenSeleccionada.paciente.edad} años - {ordenSeleccionada.paciente.genero}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>RUT:</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>
                          {ordenSeleccionada.paciente.rut}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Previsión:</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>
                          {ordenSeleccionada.paciente.prevision}
                        </span>
                      </div>
                      {ordenSeleccionada.paciente.telefono && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Teléfono:</span>
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            {ordenSeleccionada.paciente.telefono}
                          </span>
                        </div>
                      )}
                      {ordenSeleccionada.paciente.email && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Email:</span>
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>
                            {ordenSeleccionada.paciente.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
                  <h3 className={`text-lg font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}>
                    <FileText className="w-5 h-5" />
                    Información de la Orden
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>N° Orden:</span>
                      <span className={`text-sm font-bold ${tema.colores.acento}`}>
                        {ordenSeleccionada.numero_orden}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Fecha Emisión:</span>
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        {formatearFecha(ordenSeleccionada.fecha_emision)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Tipo:</span>
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        {COLORES_TIPO_ORDEN[ordenSeleccionada.tipo_orden].label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Prioridad:</span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          COLORES_PRIORIDAD[ordenSeleccionada.prioridad].bg
                        } ${COLORES_PRIORIDAD[ordenSeleccionada.prioridad].text}`}
                      >
                        {COLORES_PRIORIDAD[ordenSeleccionada.prioridad].label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Estado:</span>
                      <span className={`text-sm font-bold ${tema.colores.texto}`}>
                        {ordenSeleccionada.estado.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Estado Pago:</span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          ordenSeleccionada.pagada
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {ordenSeleccionada.pagada ? "Pagado" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              {ordenSeleccionada.diagnostico && (
                <div className={`p-6 rounded-2xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
                  <h3 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <Clipboard className="w-5 h-5" />
                    Diagnóstico / Indicación Clínica
                  </h3>
                  <p className={`text-base ${tema.colores.texto}`}>
                    {ordenSeleccionada.codigo_cie10 && (
                      <strong className={tema.colores.acento}>
                        [{ordenSeleccionada.codigo_cie10}]
                      </strong>
                    )}{" "}
                    {ordenSeleccionada.diagnostico}
                  </p>
                </div>
              )}

              {/* Comentarios */}
              {ordenSeleccionada.comentarios && (
                <div className={`p-6 rounded-2xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}>
                  <h3 className={`text-lg font-black mb-3 ${tema.colores.texto} flex items-center gap-2`}>
                    <MessageSquare className="w-5 h-5" />
                    Comentarios Adicionales
                  </h3>
                  <p className={`text-base ${tema.colores.texto}`}>
                    {ordenSeleccionada.comentarios}
                  </p>
                </div>
              )}

              {/* Exámenes */}
              <div>
                <h3 className={`text-2xl font-black mb-4 ${tema.colores.texto} flex items-center gap-2`}>
                  <Beaker className="w-6 h-6" />
                  Exámenes Solicitados ({ordenSeleccionada.examenes.length})
                </h3>
                <div className="space-y-4">
                  {ordenSeleccionada.examenes.map((examen, index) => {
                    const EstadoIcon = COLORES_ESTADO[examen.estado].icon;
                    const tieneResultados = examen.resultados.length > 0;
                    const tieneResultadosCriticos = examen.resultados.some((r) => r.es_critico);

                    return (
                      <div
                        key={examen.id_examen}
                        className={`p-6 rounded-2xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border transition-all duration-300 hover:border-indigo-500/50`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-2xl font-black ${tema.colores.acento}`}>
                                {index + 1}.
                              </span>
                              <h4 className={`text-xl font-black ${tema.colores.texto}`}>
                                {examen.tipo_examen.nombre}
                              </h4>
                              {tieneResultadosCriticos && (
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 animate-pulse">
                                  ⚠️ CRÍTICO
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}>
                                {examen.tipo_examen.categoria}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}>
                                {examen.tipo_examen.codigo}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  COLORES_ESTADO[examen.estado].bg
                                } ${COLORES_ESTADO[examen.estado].text}`}
                              >
                                <EstadoIcon className="w-3 h-3 inline mr-1" />
                                {COLORES_ESTADO[examen.estado].label}
                              </span>
                            </div>
                            {examen.tipo_examen.descripcion && (
                              <p className={`text-sm ${tema.colores.textoSecundario} mb-3`}>
                                {examen.tipo_examen.descripcion}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {tieneResultados && (
                              <button
                                onClick={() => handleVerResultados(examen)}
                                className={`px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                              >
                                <Eye className="w-4 h-4" />
                                Ver Resultados
                              </button>
                            )}
                            {!tieneResultados && examen.estado === "realizado" && (
                              <button
                                onClick={() => handleRegistrarResultado(examen)}
                                className={`px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                              >
                                <Plus className="w-4 h-4" />
                                Registrar Resultado
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {examen.fecha_programada && (
                            <div>
                              <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                                Fecha Programada
                              </p>
                              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                {formatearFechaCorta(examen.fecha_programada)}
                              </p>
                            </div>
                          )}
                          {examen.fecha_realizacion && (
                            <div>
                              <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                                Fecha Realización
                              </p>
                              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                {formatearFechaCorta(examen.fecha_realizacion)}
                              </p>
                            </div>
                          )}
                          {examen.costo && (
                            <div>
                              <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                                Valor
                              </p>
                              <p className={`text-sm font-bold ${tema.colores.acento}`}>
                                {formatearMoneda(examen.costo)}
                              </p>
                            </div>
                          )}
                          {examen.tipo_examen.tiempo_resultado_horas && (
                            <div>
                              <p className={`text-xs font-semibold ${tema.colores.textoSecundario} mb-1`}>
                                Tiempo Resultado
                              </p>
                              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                                {examen.tipo_examen.tiempo_resultado_horas}h
                              </p>
                            </div>
                          )}
                        </div>

                        {examen.requiere_preparacion && examen.tipo_examen.instrucciones_preparacion && (
                          <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Requiere Preparación
                            </p>
                            <p className="text-sm text-yellow-300">
                              {examen.tipo_examen.instrucciones_preparacion}
                            </p>
                          </div>
                        )}

                        {examen.instrucciones_especificas && (
                          <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <p className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              Instrucciones Específicas
                            </p>
                            <p className="text-sm text-blue-300">
                              {examen.instrucciones_especificas}
                            </p>
                          </div>
                        )}

                        {tieneResultados && (
                          <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                            <p className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Resultados Disponibles ({examen.resultados.length})
                            </p>
                            <div className="space-y-2">
                              {examen.resultados.map((resultado) => (
                                <div key={resultado.id_resultado} className="flex items-center justify-between">
                                  <span className="text-sm text-green-300">
                                    {resultado.titulo} - {formatearFechaCorta(resultado.fecha_resultado)}
                                  </span>
                                  {resultado.es_critico && (
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">
                                      CRÍTICO
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen Final */}
              {ordenSeleccionada.valor_total && (
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} text-white`}>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Total Exámenes</p>
                      <p className="text-4xl font-black">{ordenSeleccionada.examenes.length}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Con Resultados</p>
                      <p className="text-4xl font-black">
                        {ordenSeleccionada.examenes.filter((e) => e.resultados.length > 0).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Valor Total</p>
                      <p className="text-4xl font-black">
                        {formatearMoneda(ordenSeleccionada.valor_total)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`sticky bottom-0 p-6 border-t ${tema.colores.borde} ${tema.colores.card} flex items-center justify-end gap-3`}>
              <button
                onClick={() => handleImprimirOrden(ordenSeleccionada)}
                className={`px-6 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <button
                onClick={() => handleEnviarPorEmail(ordenSeleccionada)}
                className={`px-6 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              >
                <Mail className="w-5 h-5" />
                Enviar Email
              </button>
              <button
                onClick={() => generarQRCode(ordenSeleccionada)}
                className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
              >
                <QrCode className="w-5 h-5" />
                Generar QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR CODE */}
      {modalQRCode && qrCodeURL && ordenSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-8 text-center`}
          >
            <button
              onClick={() => setModalQRCode(false)}
              className={`absolute top-4 right-4 p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
            >
              <X className="w-6 h-6" />
            </button>

            <div className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
              <QrCode className="w-12 h-12 text-white" />
            </div>

            <h2 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>
              Código QR Generado
            </h2>
            <p className={`text-sm ${tema.colores.textoSecundario} mb-6`}>
              Orden N° {ordenSeleccionada.numero_orden}
            </p>

            <div className={`p-6 rounded-2xl ${tema.colores.fondoSecundario} mb-6`}>
              <Image
                src={qrCodeURL}
                alt="QR Code"
                width={300}
                height={300}
                className="mx-auto"
              />
            </div>

            <p className={`text-sm ${tema.colores.textoSecundario} mb-6`}>
              Escanee este código para verificar la autenticidad de la orden
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.download = `qr-orden-${ordenSeleccionada.numero_orden}.png`;
                  link.href = qrCodeURL;
                  link.click();
                }}
                className={`flex-1 px-6 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
              >
                <Download className="w-5 h-5" />
                Descargar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className={`flex-1 px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SELECTOR DE TEMA */}
      {modalSelectorTema && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-8`}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-3xl font-black ${tema.colores.texto} flex items-center gap-3`}>
                <Sparkles className="w-8 h-8" />
                Seleccionar Tema
              </h2>
              <button
                onClick={() => setModalSelectorTema(false)}
                className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(TEMAS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    cambiarTema(key as TemaColor);
                    setModalSelectorTema(false);
                  }}
                  className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                    temaActual === key
                      ? `bg-gradient-to-br ${config.colores.gradiente} text-white shadow-2xl ring-4 ring-white/20`
                      : `${config.colores.card} ${config.colores.borde} border`
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    {React.createElement(config.icono, {
                      className: `w-8 h-8 ${temaActual === key ? "text-white" : config.colores.acento}`,
                    })}
                    {temaActual === key && (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${temaActual === key ? "text-white" : config.colores.texto}`}>
                    {config.nombre}
                  </h3>
                  <div className={`h-20 rounded-xl bg-gradient-to-br ${config.colores.gradiente} shadow-lg`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
