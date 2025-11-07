// app/(dashboard)/medico/recetas/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  X,
  Calendar,
  User,
  Pill,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  Printer,
  QrCode,
  ShieldAlert,
  Activity,
  TrendingUp,
  BarChart3,
  Package,
  Stethoscope,
  Users,
  Building2,
  Hash,
  Info,
  ChevronRight,
  MoreVertical,
  Save,
  Settings,
  LogOut,
  Home,
  MessageSquare,
  Sun,
  Moon,
  Sparkles,
  Wifi,
  HeartPulse,
  Loader2,
  Grid,
  List,
  FileCheck,
  Clipboard,
  Repeat,
  Clock,
  Mail,
  Phone,
  MapPin,
  Bell,
  Star,
  Target,
  Award,
  Zap,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import * as QRCodeLib from "qrcode";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type VistaModo = "lista" | "grid" | "timeline";
type TipoReceta = "simple" | "magistral" | "controlada" | "cheque";
type EstadoReceta = "emitida" | "dispensada" | "anulada" | "vencida";
type ViaAdministracion =
  | "oral"
  | "sublingual"
  | "topica"
  | "intravenosa"
  | "intramuscular"
  | "subcutanea"
  | "inhalatoria"
  | "rectal"
  | "oftalmologica"
  | "otica"
  | "nasal";

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
      direccion: string;
      telefono: string;
      email: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
  preferencias?: {
    tema_color: TemaColor;
    modo_compacto: boolean;
    animaciones_habilitadas: boolean;
    vista_agenda_default: string;
    idioma: string;
    zona_horaria: string;
  };
}

interface Medicamento {
  id_receta_medicamento?: number;
  id_medicamento: number | null;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  cantidad: number;
  unidad: string;
  via_administracion: ViaAdministracion;
  instrucciones: string;
  es_controlado: boolean;
  codigo_medicamento: string;
  dispensado: boolean;
  fecha_dispensacion: string | null;
  observaciones_dispensacion: string | null;
  precio_unitario?: number;
  precio_total?: number;
}

interface Receta {
  id_receta: number;
  id_centro: number;
  id_paciente: number;
  id_medico: number;
  id_plantilla: number | null;
  tipo_receta: TipoReceta;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: EstadoReceta;
  numero_receta: string;
  url_documento: string | null;
  codigo_verificacion: string;
  id_historial: number | null;
  diagnostico: string | null;
  codigo_cie10: string | null;
  es_cronica: boolean;
  observaciones: string | null;
  fecha_creacion: string;
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
    direccion?: string;
    comuna?: string;
    region?: string;
  };
  medicamentos: Medicamento[];
  medico: {
    id_medico: number;
    nombre_completo: string;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidad_principal: string;
    firma_digital_url?: string;
  };
  centro: {
    id_centro: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    logo_url: string | null;
    ciudad: string;
    region: string;
  };
}

interface EstadisticasRecetas {
  total_recetas: number;
  emitidas: number;
  dispensadas: number;
  anuladas: number;
  vencidas: number;
  cronicas: number;
  controladas: number;
  total_medicamentos: number;
  promedio_medicamentos_por_receta: number;
  recetas_mes_actual: number;
  recetas_mes_anterior: number;
  tendencia_mensual: number;
  medicamentos_mas_recetados: Array<{
    nombre: string;
    cantidad: number;
    porcentaje: number;
  }>;
  recetas_por_tipo: Array<{
    tipo: TipoReceta;
    cantidad: number;
    porcentaje: number;
  }>;
  diagnosticos_frecuentes: Array<{
    codigo_cie10: string;
    descripcion: string;
    cantidad: number;
  }>;
}

interface FiltrosRecetas {
  fechaInicio: string;
  fechaFin: string;
  estados: EstadoReceta[];
  tipos: TipoReceta[];
  paciente: string;
  es_cronica: boolean | null;
  es_controlada: boolean | null;
}

interface FormularioReceta {
  id_paciente: number | null;
  tipo_receta: TipoReceta;
  fecha_emision: string;
  fecha_vencimiento: string;
  diagnostico: string;
  codigo_cie10: string;
  es_cronica: boolean;
  observaciones: string;
  medicamentos: Medicamento[];
}

interface Paciente {
  id_paciente: number;
  nombre_completo: string;
  rut: string;
  telefono: string | null;
  email: string | null;
  prevision: string;
  edad: number;
  genero: string;
  foto_url: string | null;
  direccion?: string;
  comuna?: string;
  region?: string;
}

interface MedicamentoDisponible {
  id_medicamento: number;
  nombre: string;
  nombre_generico: string;
  presentacion: string;
  concentracion: string;
  laboratorio: string;
  es_controlado: boolean;
  requiere_receta: boolean;
  precio_referencia: number;
  codigo_registro_isp: string;
  categoria: string;
  via_administracion_principal: ViaAdministracion;
  stock_disponible?: number;
}

interface DiagnosticoCIE10 {
  codigo: string;
  descripcion: string;
  categoria: string;
}

interface Notificacion {
  id: number;
  tipo: "info" | "success" | "warning" | "error";
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
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
// COLORES POR ESTADO Y TIPO
// ========================================

const COLORES_ESTADO: Record<
  EstadoReceta,
  { bg: string; text: string; border: string; icon: any; label: string }
> = {
  emitida: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: FileCheck,
    label: "Emitida",
  },
  dispensada: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    icon: CheckCircle2,
    label: "Dispensada",
  },
  anulada: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: XCircle,
    label: "Anulada",
  },
  vencida: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    icon: AlertTriangle,
    label: "Vencida",
  },
};

const COLORES_TIPO: Record<TipoReceta, { color: string; icon: any; label: string }> = {
  simple: { color: "#3b82f6", icon: FileText, label: "Simple" },
  magistral: { color: "#8b5cf6", icon: Pill, label: "Magistral" },
  controlada: { color: "#ef4444", icon: ShieldAlert, label: "Controlada" },
  cheque: { color: "#10b981", icon: Package, label: "Cheque" },
};

const VIAS_ADMINISTRACION: Array<{ value: ViaAdministracion; label: string }> = [
  { value: "oral", label: "Oral" },
  { value: "sublingual", label: "Sublingual" },
  { value: "topica", label: "Tópica" },
  { value: "intravenosa", label: "Intravenosa (IV)" },
  { value: "intramuscular", label: "Intramuscular (IM)" },
  { value: "subcutanea", label: "Subcutánea (SC)" },
  { value: "inhalatoria", label: "Inhalatoria" },
  { value: "rectal", label: "Rectal" },
  { value: "oftalmologica", label: "Oftalmológica" },
  { value: "otica", label: "Ótica" },
  { value: "nasal", label: "Nasal" },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function RecetasMedicasPage() {
  // ========================================
  // ESTADOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasRecetas | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<MedicamentoDisponible[]>([]);
  const [diagnosticosCIE10, setDiagnosticosCIE10] = useState<DiagnosticoCIE10[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [vistaModo, setVistaModo] = useState<VistaModo>("lista");
  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosRecetas>({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fechaFin: new Date().toISOString().split("T")[0],
    estados: [],
    tipos: [],
    paciente: "",
    es_cronica: null,
    es_controlada: null,
  });

  const [modalNuevaReceta, setModalNuevaReceta] = useState(false);
  const [modalEditarReceta, setModalEditarReceta] = useState(false);
  const [modalDetallesReceta, setModalDetallesReceta] = useState(false);
  const [modalAgregarMedicamento, setModalAgregarMedicamento] = useState(false);
  const [modalSeleccionarPaciente, setModalSeleccionarPaciente] = useState(false);
  const [modalSelectorTema, setModalSelectorTema] = useState(false);
  const [modalQRCode, setModalQRCode] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [qrCodeURL, setQrCodeURL] = useState<string>("");

  const [formularioReceta, setFormularioReceta] = useState<FormularioReceta>({
    id_paciente: null,
    tipo_receta: "simple",
    fecha_emision: new Date().toISOString().split("T")[0],
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    diagnostico: "",
    codigo_cie10: "",
    es_cronica: false,
    observaciones: "",
    medicamentos: [],
  });

  const [medicamentoTemp, setMedicamentoTemp] = useState<Medicamento>({
    id_medicamento: null,
    nombre_medicamento: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    cantidad: 1,
    unidad: "comprimidos",
    via_administracion: "oral",
    instrucciones: "",
    es_controlado: false,
    codigo_medicamento: "",
    dispensado: false,
    fecha_dispensacion: null,
    observaciones_dispensacion: null,
  });

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [busquedaMedicamento, setBusquedaMedicamento] = useState("");
  const [busquedaDiagnostico, setBusquedaDiagnostico] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosIniciales();
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosRecetas();
    }
  }, [usuario, filtros]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (usuario?.medico) {
        cargarDatosRecetas();
        cargarNotificaciones();
      }
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, [usuario]);

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

        // Cargar preferencias de tema del usuario
        if (result.usuario.preferencias?.tema_color) {
          setTemaActual(result.usuario.preferencias.tema_color);
        }
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

  const cargarDatosIniciales = async () => {
    try {
      // Cargar pacientes
      await cargarPacientes();
      
      // Cargar medicamentos disponibles
      await cargarMedicamentosDisponibles();
      
      // Cargar diagnósticos CIE-10
      await cargarDiagnosticosCIE10();
      
      // Cargar notificaciones
      await cargarNotificaciones();
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const cargarPacientes = async () => {
    if (!usuario?.medico?.id_medico) return;

    try {
      const response = await fetch(
        `/api/medico/pacientes?id_medico=${usuario.medico.id_medico}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.pacientes) {
        setPacientes(data.pacientes);
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  };

  const cargarMedicamentosDisponibles = async () => {
    try {
      const response = await fetch("/api/medicamentos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.medicamentos) {
        setMedicamentosDisponibles(data.medicamentos);
      }
    } catch (error) {
      console.error("Error al cargar medicamentos:", error);
    }
  };

  const cargarDiagnosticosCIE10 = async () => {
    try {
      const response = await fetch("/api/diagnosticos/cie10", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.diagnosticos) {
        setDiagnosticosCIE10(data.diagnosticos);
      }
    } catch (error) {
      console.error("Error al cargar diagnósticos CIE-10:", error);
    }
  };

  const cargarNotificaciones = async () => {
    if (!usuario?.id_usuario) return;

    try {
      const response = await fetch(
        `/api/notificaciones?id_usuario=${usuario.id_usuario}&tipo=recetas`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.notificaciones) {
        setNotificaciones(data.notificaciones);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const cargarDatosRecetas = async () => {
    if (!usuario?.medico?.id_medico) return;

    try {
      setLoadingData(true);

      const params = new URLSearchParams({
        id_medico: usuario.medico.id_medico.toString(),
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin,
      });

      if (filtros.estados.length > 0) {
        params.append("estados", filtros.estados.join(","));
      }
      if (filtros.tipos.length > 0) {
        params.append("tipos", filtros.tipos.join(","));
      }
      if (filtros.paciente) {
        params.append("paciente", filtros.paciente);
      }
      if (filtros.es_cronica !== null) {
        params.append("es_cronica", filtros.es_cronica.toString());
      }
      if (filtros.es_controlada !== null) {
        params.append("es_controlada", filtros.es_controlada.toString());
      }

      const response = await fetch(`/api/medico/recetas?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setRecetas(data.recetas || []);
        setEstadisticas(data.estadisticas || null);
      } else {
        console.error("Error en respuesta de recetas:", data.message);
      }
    } catch (error) {
      console.error("Error al cargar recetas:", error);
    } finally {
      setLoadingData(false);
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

  const generarCodigoVerificacion = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 12; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 11) codigo += "-";
    }
    return codigo;
  };

  const generarNumeroReceta = () => {
    const año = new Date().getFullYear();
    const mes = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const numero = Math.floor(Math.random() * 999999) + 1;
    return `RX-${año}${mes}-${numero.toString().padStart(6, "0")}`;
  };

  const generarQRCode = async (receta: Receta) => {
    try {
      const datosQR = {
        numero_receta: receta.numero_receta,
        codigo_verificacion: receta.codigo_verificacion,
        paciente: receta.paciente.nombre_completo,
        paciente_rut: receta.paciente.rut,
        medico: receta.medico.nombre_completo,
        medico_rm: receta.medico.numero_registro_medico,
        fecha_emision: receta.fecha_emision,
        fecha_vencimiento: receta.fecha_vencimiento,
        tipo_receta: receta.tipo_receta,
        centro: receta.centro.nombre,
        url_verificacion: `${window.location.origin}/verificar/${receta.codigo_verificacion}`,
      };

      const qrDataURL = await QRCodeLib.toDataURL(JSON.stringify(datosQR), {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });

      setQrCodeURL(qrDataURL);
      setRecetaSeleccionada(receta);
      setModalQRCode(true);
    } catch (error) {
      console.error("Error al generar QR:", error);
      alert("Error al generar código QR");
    }
  };

  const recetasFiltradas = useMemo(() => {
    let resultado = [...recetas];

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (receta) =>
          receta.paciente.nombre_completo.toLowerCase().includes(termino) ||
          receta.paciente.rut.toLowerCase().includes(termino) ||
          receta.numero_receta.toLowerCase().includes(termino) ||
          receta.codigo_verificacion.toLowerCase().includes(termino) ||
          receta.diagnostico?.toLowerCase().includes(termino) ||
          receta.codigo_cie10?.toLowerCase().includes(termino) ||
          receta.medicamentos.some((m) =>
            m.nombre_medicamento.toLowerCase().includes(termino)
          )
      );
    }

    return resultado;
  }, [recetas, busqueda]);

  const pacientesFiltrados = useMemo(() => {
    if (!busquedaPaciente.trim()) return pacientes;

    const termino = busquedaPaciente.toLowerCase();
    return pacientes.filter(
      (p) =>
        p.nombre_completo.toLowerCase().includes(termino) ||
        p.rut.toLowerCase().includes(termino) ||
        p.email?.toLowerCase().includes(termino)
    );
  }, [pacientes, busquedaPaciente]);

  const medicamentosFiltrados = useMemo(() => {
    if (!busquedaMedicamento.trim()) return medicamentosDisponibles;

    const termino = busquedaMedicamento.toLowerCase();
    return medicamentosDisponibles.filter(
      (m) =>
        m.nombre.toLowerCase().includes(termino) ||
        m.nombre_generico.toLowerCase().includes(termino) ||
        m.laboratorio.toLowerCase().includes(termino) ||
        m.codigo_registro_isp.toLowerCase().includes(termino)
    );
  }, [medicamentosDisponibles, busquedaMedicamento]);

  const diagnosticosFiltrados = useMemo(() => {
    if (!busquedaDiagnostico.trim()) return diagnosticosCIE10.slice(0, 20);

    const termino = busquedaDiagnostico.toLowerCase();
    return diagnosticosCIE10.filter(
      (d) =>
        d.codigo.toLowerCase().includes(termino) ||
        d.descripcion.toLowerCase().includes(termino) ||
        d.categoria.toLowerCase().includes(termino)
    );
  }, [diagnosticosCIE10, busquedaDiagnostico]);

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (error) {
      console.error("Error al guardar preferencia de tema:", error);
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

  const handleNuevaReceta = () => {
    setFormularioReceta({
      id_paciente: null,
      tipo_receta: "simple",
      fecha_emision: new Date().toISOString().split("T")[0],
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      diagnostico: "",
      codigo_cie10: "",
      es_cronica: false,
      observaciones: "",
      medicamentos: [],
    });
    setPacienteSeleccionado(null);
    setModalNuevaReceta(true);
  };

  const handleSeleccionarPaciente = (paciente: Paciente) => {
    setPacienteSeleccionado(paciente);
    setFormularioReceta({
      ...formularioReceta,
      id_paciente: paciente.id_paciente,
    });
    setModalSeleccionarPaciente(false);
  };

  const handleSeleccionarMedicamento = (medicamento: MedicamentoDisponible) => {
    setMedicamentoTemp({
      ...medicamentoTemp,
      id_medicamento: medicamento.id_medicamento,
      nombre_medicamento: `${medicamento.nombre} ${medicamento.presentacion}`,
      es_controlado: medicamento.es_controlado,
      codigo_medicamento: medicamento.codigo_registro_isp,
      via_administracion: medicamento.via_administracion_principal,
      precio_unitario: medicamento.precio_referencia,
    });
  };

  const handleSeleccionarDiagnostico = (diagnostico: DiagnosticoCIE10) => {
    setFormularioReceta({
      ...formularioReceta,
      codigo_cie10: diagnostico.codigo,
      diagnostico: diagnostico.descripcion,
    });
  };

  const handleAgregarMedicamento = () => {
    setMedicamentoTemp({
      id_medicamento: null,
      nombre_medicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      cantidad: 1,
      unidad: "comprimidos",
      via_administracion: "oral",
      instrucciones: "",
      es_controlado: false,
      codigo_medicamento: "",
      dispensado: false,
      fecha_dispensacion: null,
      observaciones_dispensacion: null,
    });
    setModalAgregarMedicamento(true);
  };

  const handleGuardarMedicamento = () => {
    if (!medicamentoTemp.nombre_medicamento || !medicamentoTemp.dosis) {
      alert("Debe completar al menos el nombre y la dosis del medicamento");
      return;
    }

    // Calcular precio total si existe precio unitario
    const precioTotal = medicamentoTemp.precio_unitario
      ? medicamentoTemp.precio_unitario * medicamentoTemp.cantidad
      : undefined;

    const medicamentoCompleto = {
      ...medicamentoTemp,
      precio_total: precioTotal,
    };

    setFormularioReceta({
      ...formularioReceta,
      medicamentos: [...formularioReceta.medicamentos, medicamentoCompleto],
    });

    setModalAgregarMedicamento(false);
  };

  const handleEliminarMedicamento = (index: number) => {
    setFormularioReceta({
      ...formularioReceta,
      medicamentos: formularioReceta.medicamentos.filter((_, i) => i !== index),
    });
  };

  const handleEditarMedicamento = (index: number) => {
    setMedicamentoTemp(formularioReceta.medicamentos[index]);
    handleEliminarMedicamento(index);
    setModalAgregarMedicamento(true);
  };

  const handleGuardarReceta = async () => {
    if (!formularioReceta.id_paciente) {
      alert("Debe seleccionar un paciente");
      return;
    }

    if (formularioReceta.medicamentos.length === 0) {
      alert("Debe agregar al menos un medicamento");
      return;
    }

    if (!formularioReceta.diagnostico) {
      alert("Debe ingresar un diagnóstico");
      return;
    }

    try {
      const endpoint = modalEditarReceta && recetaSeleccionada
        ? `/api/medico/recetas/${recetaSeleccionada.id_receta}`
        : "/api/medico/recetas";

      const method = modalEditarReceta ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formularioReceta,
          id_medico: usuario?.medico?.id_medico,
          id_centro: usuario?.medico?.centro_principal.id_centro,
          numero_receta: generarNumeroReceta(),
          codigo_verificacion: generarCodigoVerificacion(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        await cargarDatosRecetas();
        setModalNuevaReceta(false);
        setModalEditarReceta(false);
        setRecetaSeleccionada(null);
        alert("Receta guardada exitosamente");
      } else {
        alert(data.message || "Error al guardar la receta");
      }
    } catch (error) {
      console.error("Error al guardar receta:", error);
      alert("Error al guardar la receta");
    }
  };

  const handleEditarReceta = (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setPacienteSeleccionado({
      id_paciente: receta.paciente.id_paciente,
      nombre_completo: receta.paciente.nombre_completo,
      rut: receta.paciente.rut,
      telefono: receta.paciente.telefono,
      email: receta.paciente.email,
      prevision: receta.paciente.prevision,
      edad: receta.paciente.edad,
      genero: receta.paciente.genero,
      foto_url: receta.paciente.foto_url,
    });
    setFormularioReceta({
      id_paciente: receta.id_paciente,
      tipo_receta: receta.tipo_receta,
      fecha_emision: receta.fecha_emision.split("T")[0],
      fecha_vencimiento: receta.fecha_vencimiento
        ? receta.fecha_vencimiento.split("T")[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      diagnostico: receta.diagnostico || "",
      codigo_cie10: receta.codigo_cie10 || "",
      es_cronica: receta.es_cronica,
      observaciones: receta.observaciones || "",
      medicamentos: receta.medicamentos,
    });
    setModalEditarReceta(true);
  };

  const handleVerDetalles = (receta: Receta) => {
    setRecetaSeleccionada(receta);
    setModalDetallesReceta(true);
  };

  const handleAnularReceta = async (idReceta: number) => {
    if (!confirm("¿Está seguro que desea anular esta receta?")) return;

    try {
      const response = await fetch(`/api/medico/recetas/${idReceta}/anular`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        await cargarDatosRecetas();
        alert("Receta anulada exitosamente");
      } else {
        alert(data.message || "Error al anular la receta");
      }
    } catch (error) {
      console.error("Error al anular receta:", error);
      alert("Error al anular la receta");
    }
  };

  const handleDescargarPDF = async (receta: Receta) => {
    try {
      const response = await fetch(`/api/medico/recetas/${receta.id_receta}/pdf`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receta-${receta.numero_receta}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error al descargar el PDF");
      }
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al descargar el PDF");
    }
  };

  const handleImprimirReceta = (receta: Receta) => {
    const ventanaImpresion = window.open("", "_blank");
    if (!ventanaImpresion) {
      alert("Por favor, permita las ventanas emergentes para imprimir");
      return;
    }

    ventanaImpresion.document.write(generarHTMLReceta(receta));
    ventanaImpresion.document.close();
    
    setTimeout(() => {
      ventanaImpresion.print();
    }, 500);
  };

  const generarHTMLReceta = (receta: Receta): string => {
    const fechaEmision = formatearFecha(receta.fecha_emision);
    const fechaVencimiento = receta.fecha_vencimiento
      ? formatearFecha(receta.fecha_vencimiento)
      : "Sin vencimiento";

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receta Médica - ${receta.numero_receta}</title>
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
          
          .receta-details {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #bfdbfe;
          }
          
          .receta-number {
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
          
          .medicamentos-section {
            padding: 30px;
          }
          
          .medicamentos-section h2 {
            font-size: 18px;
            color: #111827;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
          }
          
          .medicamento-item {
            background: #f9fafb;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
          }
          
          .medicamento-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .medicamento-title {
            flex: 1;
          }
          
          .medicamento-title h3 {
            font-size: 16px;
            color: #111827;
            margin-bottom: 5px;
            font-weight: 600;
          }
          
          .medicamento-codigo {
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .medicamento-badge {
            background: #2563eb;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .medicamento-details {
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
          
          .instrucciones-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
          }
          
          .instrucciones-box h4 {
            font-size: 12px;
            color: #92400e;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .instrucciones-box p {
            font-size: 11px;
            color: #78350f;
            line-height: 1.5;
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
          
          .controlado-badge {
            background: #fecaca;
            color: #991b1b;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .container {
              border: none;
              border-radius: 0;
            }
            
            .medicamento-item {
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
            <h1>RECETA MÉDICA</h1>
            <p>${receta.centro.nombre}</p>
            <p>${receta.centro.direccion}, ${receta.centro.ciudad}, ${receta.centro.region}</p>
            <p>Tel: ${receta.centro.telefono} | Email: ${receta.centro.email}</p>
          </div>
          
          <!-- INFORMACIÓN GENERAL -->
          <div class="info-section">
            <div class="info-grid">
              <div class="info-box">
                <h3>Paciente</h3>
                <p>${receta.paciente.nombre_completo}</p>
                <p class="secondary">RUT: ${receta.paciente.rut}</p>
                <p class="secondary">${receta.paciente.edad} años - ${receta.paciente.genero}</p>
                <p class="secondary">Previsión: ${receta.paciente.prevision}</p>
              </div>
              
              <div class="info-box">
                <h3>Médico Tratante</h3>
                <p>Dr(a). ${receta.medico.nombre_completo}</p>
                <p class="secondary">RM: ${receta.medico.numero_registro_medico}</p>
                <p class="secondary">${receta.medico.titulo_profesional}</p>
                <p class="secondary">${receta.medico.especialidad_principal}</p>
              </div>
              
              <div class="info-box">
                <h3>Fecha de Emisión</h3>
                <p>${fechaEmision}</p>
                <p class="secondary">Hora: ${formatearHora(receta.fecha_emision)}</p>
              </div>
              
              <div class="info-box">
                <h3>Fecha de Vencimiento</h3>
                <p>${fechaVencimiento}</p>
                <p class="secondary">Tipo: ${COLORES_TIPO[receta.tipo_receta].label}</p>
              </div>
            </div>
            
            <div class="receta-details">
              <div class="receta-number">
                N° RECETA: ${receta.numero_receta}
              </div>
              
              <div class="receta-number" style="font-size: 16px; margin-bottom: 0;">
                CÓDIGO VERIFICACIÓN: ${receta.codigo_verificacion}
              </div>
              
              ${receta.diagnostico ? `
                <div class="diagnostico-box" style="margin-top: 15px;">
                  <h4>Diagnóstico</h4>
                  <p><strong>${receta.codigo_cie10 ? `[${receta.codigo_cie10}]` : ""}</strong> ${receta.diagnostico}</p>
                </div>
              ` : ""}
              
              ${receta.es_cronica ? `
                <div style="margin-top: 15px; padding: 10px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; text-align: center;">
                  <strong style="color: #92400e;">⚠️ RECETA CRÓNICA - RENOVABLE</strong>
                </div>
              ` : ""}
            </div>
          </div>
          
          <!-- MEDICAMENTOS -->
          <div class="medicamentos-section">
            <h2>Medicamentos Prescritos (${receta.medicamentos.length})</h2>
            
            ${receta.medicamentos.map((med, index) => `
              <div class="medicamento-item">
                <div class="medicamento-header">
                  <div class="medicamento-title">
                    <h3>${index + 1}. ${med.nombre_medicamento}</h3>
                    ${med.codigo_medicamento ? `<span class="medicamento-codigo">Código: ${med.codigo_medicamento}</span>` : ""}
                  </div>
                  ${med.es_controlado ? `<div class="controlado-badge">CONTROLADO</div>` : ""}
                </div>
                
                <div class="medicamento-details">
                  <div class="detail-item">
                    <span class="detail-label">Dosis:</span>
                    <span class="detail-value">${med.dosis}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">Frecuencia:</span>
                    <span class="detail-value">${med.frecuencia}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">Duración:</span>
                    <span class="detail-value">${med.duracion}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">Cantidad:</span>
                    <span class="detail-value">${med.cantidad} ${med.unidad}</span>
                  </div>
                  
                  <div class="detail-item">
                    <span class="detail-label">Vía Admin.:</span>
                    <span class="detail-value">${VIAS_ADMINISTRACION.find(v => v.value === med.via_administracion)?.label || med.via_administracion}</span>
                  </div>
                  
                  ${med.precio_total ? `
                    <div class="detail-item">
                      <span class="detail-label">Valor Estimado:</span>
                      <span class="detail-value">${formatearMoneda(med.precio_total)}</span>
                    </div>
                  ` : ""}
                </div>
                
                ${med.instrucciones ? `
                  <div class="instrucciones-box">
                    <h4>📋 Instrucciones Especiales:</h4>
                    <p>${med.instrucciones}</p>
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>
          
          <!-- OBSERVACIONES -->
          ${receta.observaciones ? `
            <div style="padding: 30px; border-top: 2px solid #e5e7eb;">
              <h3 style="font-size: 16px; color: #111827; margin-bottom: 15px;">Observaciones Adicionales</h3>
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="font-size: 13px; color: #374151; line-height: 1.6;">${receta.observaciones}</p>
              </div>
            </div>
          ` : ""}
          
          <!-- FOOTER -->
          <div class="footer">
            <div class="firmas">
              <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-nombre">Dr(a). ${receta.medico.nombre_completo}</div>
                <div class="firma-cargo">RM: ${receta.medico.numero_registro_medico}</div>
                <div class="firma-cargo">${receta.medico.especialidad_principal}</div>
              </div>
              
              <div class="firma-box">
                <div class="firma-linea"></div>
                <div class="firma-nombre">Firma y Timbre</div>
                <div class="firma-cargo">Médico Tratante</div>
              </div>
            </div>
            
            <div class="notas-footer">
              <h4>Notas Importantes:</h4>
              <ul>
                <li>Esta receta tiene validez de ${receta.fecha_vencimiento ? "30 días" : "tiempo indefinido"} desde su emisión.</li>
                <li>Los medicamentos controlados requieren presentación de cédula de identidad.</li>
                <li>Verifique la autenticidad de esta receta en: ${window.location.origin}/verificar/${receta.codigo_verificacion}</li>
                <li>Conserve este documento para futuros controles médicos.</li>
                <li>Ante cualquier reacción adversa, consulte inmediatamente con su médico.</li>
                ${receta.es_cronica ? "<li><strong>RECETA CRÓNICA:</strong> Esta receta puede ser renovada según indicación médica.</li>" : ""}
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 10px; color: #9ca3af;">
                Documento generado electrónicamente por ${receta.centro.nombre}<br>
                Fecha de impresión: ${formatearFecha(new Date().toISOString())} - ${formatearHora(new Date().toISOString())}<br>
                Este documento es válido sin firma autógrafa según normativa vigente
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleEnviarPorEmail = async (receta: Receta) => {
    if (!receta.paciente.email) {
      alert("El paciente no tiene email registrado");
      return;
    }

    if (!confirm(`¿Desea enviar la receta al email ${receta.paciente.email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/medico/recetas/${receta.id_receta}/enviar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email_destino: receta.paciente.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Receta enviada exitosamente por email");
      } else {
        alert(data.message || "Error al enviar el email");
      }
    } catch (error) {
      console.error("Error al enviar email:", error);
      alert("Error al enviar el email");
    }
  };

  const handleDuplicarReceta = (receta: Receta) => {
    setPacienteSeleccionado({
      id_paciente: receta.paciente.id_paciente,
      nombre_completo: receta.paciente.nombre_completo,
      rut: receta.paciente.rut,
      telefono: receta.paciente.telefono,
      email: receta.paciente.email,
      prevision: receta.paciente.prevision,
      edad: receta.paciente.edad,
      genero: receta.paciente.genero,
      foto_url: receta.paciente.foto_url,
    });

    setFormularioReceta({
      id_paciente: receta.id_paciente,
      tipo_receta: receta.tipo_receta,
      fecha_emision: new Date().toISOString().split("T")[0],
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      diagnostico: receta.diagnostico || "",
      codigo_cie10: receta.codigo_cie10 || "",
      es_cronica: receta.es_cronica,
      observaciones: receta.observaciones || "",
      medicamentos: receta.medicamentos.map((m) => ({
        ...m,
        id_receta_medicamento: undefined,
        dispensado: false,
        fecha_dispensacion: null,
        observaciones_dispensacion: null,
      })),
    });

    setModalNuevaReceta(true);
  };

  const handleExportarRecetas = async (formato: "pdf" | "excel" | "csv") => {
    try {
      const params = new URLSearchParams({
        id_medico: usuario?.medico?.id_medico?.toString() || "",
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin,
        formato,
      });

      if (filtros.estados.length > 0) {
        params.append("estados", filtros.estados.join(","));
      }
      if (filtros.tipos.length > 0) {
        params.append("tipos", filtros.tipos.join(","));
      }

      const response = await fetch(
        `/api/medico/recetas/exportar?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recetas-${new Date().toISOString().split("T")[0]}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error al exportar recetas");
      }
    } catch (error) {
      console.error("Error al exportar recetas:", error);
      alert("Error al exportar recetas");
    }
  };

  const marcarNotificacionLeida = async (idNotificacion: number) => {
    try {
      await fetch(`/api/notificaciones/${idNotificacion}/marcar-leida`, {
        method: "PUT",
        credentials: "include",
      });

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === idNotificacion ? { ...n, leida: true } : n))
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
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
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>
            Cargando Sistema de Recetas
          </h2>
          <p
            className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}
          >
            Preparando el módulo de recetas médicas...
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
            No tienes permisos para acceder al sistema de recetas médicas
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
  // RENDER - SISTEMA DE RECETAS
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
                title="Inicio"
              >
                <Home
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/agenda"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
                title="Agenda"
              >
                <Calendar
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/recetas"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r ${tema.colores.gradiente} shadow-lg`}
                title="Recetas"
              >
                <FileText className="w-6 h-6 text-white" />
              </Link>

              <Link
                href="/medico/examenes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
                title="Exámenes"
              >
                <Activity
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/pacientes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
                title="Pacientes"
              >
                <Users
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>

              <Link
                href="/medico/mensajes"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group relative`}
                title="Mensajes"
              >
                <MessageSquare
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
                {notificaciones.filter((n) => !n.leida).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Link>

              <button
                onClick={() => setModalSelectorTema(true)}
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
                title="Cambiar Tema"
              >
                {React.createElement(tema.icono, {
                  className: `w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`,
                })}
              </button>

              <Link
                href="/medico/configuracion"
                className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}
                title="Configuración"
              >
                <Settings
                  className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`}
                />
              </Link>
            </div>

            <button
              onClick={cerrarSesion}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-red-500/20 group`}
              title="Cerrar Sesión"
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
              <button
                onClick={() => setSidebarAbierto(!sidebarAbierto)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
              >
                {sidebarAbierto ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5 rotate-180" />
                )}
              </button>

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
                  <FileText className="w-8 h-8" />
                  Sistema de Recetas Médicas
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

                  <span className={`text-base ${tema.colores.textoSecundario}`}>
                    •
                  </span>

                  <span
                    className={`text-base font-semibold ${tema.colores.textoSecundario}`}
                  >
                    {formatearFecha(new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                  className={`relative p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                >
                  <Bell className="w-5 h-5" />
                  {notificaciones.filter((n) => !n.leida).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {notificaciones.filter((n) => !n.leida).length}
                    </span>
                  )}
                </button>

                {mostrarNotificaciones && (
                  <div
                    className={`absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 z-50 custom-scrollbar`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-black ${tema.colores.texto}`}>
                        Notificaciones
                      </h3>
                      <button
                        onClick={() => setMostrarNotificaciones(false)}
                        className={`p-1 rounded-lg ${tema.colores.hover}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {notificaciones.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell
                          className={`w-12 h-12 ${tema.colores.textoSecundario} mx-auto mb-3 opacity-50`}
                        />
                        <p
                          className={`text-sm ${tema.colores.textoSecundario}`}
                        >
                          No hay notificaciones
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notificaciones.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => marcarNotificacionLeida(notif.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                              notif.leida
                                ? `${tema.colores.hover}`
                                : `${tema.colores.secundario} border-l-4 ${
                                    notif.tipo === "error"
                                      ? "border-red-500"
                                      : notif.tipo === "warning"
                                      ? "border-yellow-500"
                                      : notif.tipo === "success"
                                      ? "border-green-500"
                                      : "border-blue-500"
                                  }`
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  notif.tipo === "error"
                                    ? "bg-red-500/20"
                                    : notif.tipo === "warning"
                                    ? "bg-yellow-500/20"
                                    : notif.tipo === "success"
                                    ? "bg-green-500/20"
                                    : "bg-blue-500/20"
                                }`}
                              >
                                {notif.tipo === "error" ? (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                ) : notif.tipo === "warning" ? (
                                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                ) : notif.tipo === "success" ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Info className="w-4 h-4 text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-bold ${tema.colores.texto} mb-1`}
                                >
                                  {notif.titulo}
                                </p>
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario}`}
                                >
                                  {notif.mensaje}
                                </p>
                                <p
                                  className={`text-xs ${tema.colores.textoSecundario} mt-1`}
                                >
                                  {formatearHora(notif.fecha)}
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

              <button
                onClick={() => cargarDatosRecetas()}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
                Actualizar
              </button>

              <button
                onClick={handleNuevaReceta}
                className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
              >
                <Plus className="w-5 h-5" />
                Nueva Receta
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <FileCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.total_recetas}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Total Recetas
              </div>
              <div className="mt-2 flex items-center gap-1">
                {estadisticas.tendencia_mensual > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-bold text-green-400">
                      +{estadisticas.tendencia_mensual.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                    <span className="text-xs font-bold text-red-400">
                      {estadisticas.tendencia_mensual.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.dispensadas}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Dispensadas
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (estadisticas.dispensadas / estadisticas.total_recetas) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.total_medicamentos}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Medicamentos
              </div>
              <div className={`mt-2 text-xs font-semibold ${tema.colores.acento}`}>
                Promedio: {estadisticas.promedio_medicamentos_por_receta.toFixed(1)}/receta
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.controladas}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Controladas
              </div>
              <div className="mt-2">
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
                  Requiere control
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Repeat className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-yellow-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.cronicas}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Crónicas
              </div>
              <div className="mt-2">
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-yellow-500/20 text-yellow-400">
                  Renovables
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>
                {estadisticas.recetas_mes_actual}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}
              >
                Este Mes
              </div>
              <div className={`mt-2 text-xs font-semibold ${tema.colores.textoSecundario}`}>
                Anterior: {estadisticas.recetas_mes_anterior}
              </div>
            </div>
          </div>
        )}

        {/* CONTROLES */}
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
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 relative`}
              >
                <Filter className="w-5 h-5" />
                {(filtros.estados.length > 0 ||
                  filtros.tipos.length > 0 ||
                  filtros.es_cronica !== null ||
                  filtros.es_controlada !== null) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {filtros.estados.length +
                      filtros.tipos.length +
                      (filtros.es_cronica !== null ? 1 : 0) +
                      (filtros.es_controlada !== null ? 1 : 0)}
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
                    onClick={() => handleExportarRecetas("pdf")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => handleExportarRecetas("excel")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Exportar Excel
                  </button>
                  <button
                    onClick={() => handleExportarRecetas("csv")}
                    className={`w-full text-left px-4 py-2 rounded-lg ${tema.colores.hover} ${tema.colores.texto} font-semibold flex items-center gap-2`}
                  >
                    <FileText className="w-4 h-4" />
                    Exportar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                placeholder="Buscar por paciente, N° receta, diagnóstico, medicamento, RUT..."
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
            <div
              className={`mt-6 p-6 rounded-xl ${tema.colores.fondoSecundario} ${tema.colores.borde} border`}
            >
              <h4 className={`text-lg font-black mb-4 ${tema.colores.texto}`}>
                Filtros Avanzados
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Filtro por Estado */}
                <div>
                  <label
                    className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}
                  >
                    Estados
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(COLORES_ESTADO) as EstadoReceta[]).map((estado) => (
                      <label
                        key={estado}
                        className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                      >
                        <input
                          type="checkbox"
                          checked={filtros.estados.includes(estado)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                estados: [...filtros.estados, estado],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                estados: filtros.estados.filter((e) => e !== estado),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto} capitalize`}
                        >
                          {COLORES_ESTADO[estado].label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por Tipo */}
                <div>
                  <label
                    className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}
                  >
                    Tipos de Receta
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(COLORES_TIPO) as TipoReceta[]).map((tipo) => (
                      <label
                        key={tipo}
                        className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                      >
                        <input
                          type="checkbox"
                          checked={filtros.tipos.includes(tipo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                tipos: [...filtros.tipos, tipo],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                tipos: filtros.tipos.filter((t) => t !== tipo),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span
                          className={`text-sm font-semibold ${tema.colores.texto} capitalize`}
                        >
                          {COLORES_TIPO[tipo].label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro Recetas Crónicas */}
                <div>
                  <label
                    className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}
                  >
                    Recetas Crónicas
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                    >
                      <input
                        type="radio"
                        name="cronica"
                        checked={filtros.es_cronica === true}
                        onChange={() => setFiltros({ ...filtros, es_cronica: true })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Sí
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                    >
                      <input
                        type="radio"
                        name="cronica"
                        checked={filtros.es_cronica === false}
                        onChange={() => setFiltros({ ...filtros, es_cronica: false })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        No
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                    >
                      <input
                        type="radio"
                        name="cronica"
                        checked={filtros.es_cronica === null}
                        onChange={() => setFiltros({ ...filtros, es_cronica: null })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Todas
                      </span>
                    </label>
                  </div>
                </div>

                {/* Filtro Medicamentos Controlados */}
                <div>
                  <label
                    className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}
                  >
                    Medicamentos Controlados
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                    >
                      <input
                        type="radio"
                        name="controlada"
                        checked={filtros.es_controlada === true}
                        onChange={() =>
                          setFiltros({ ...filtros, es_controlada: true })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Sí
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                    >
                      <input
                        type="radio"
                        name="controlada"
                        checked={filtros.es_controlada === false}
                        onChange={() =>
                          setFiltros({ ...filtros, es_controlada: false })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        No
                      </span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer transition-all duration-200`}
                    >
                      <input
                        type="radio"
                        name="controlada"
                        checked={filtros.es_controlada === null}
                        onChange={() =>
                          setFiltros({ ...filtros, es_controlada: null })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>
                        Todas
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Filtro por Fechas */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <label
                    className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}
                  >
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaInicio: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                <div>
                  <label
                    className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}
                  >
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaFin: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() =>
                    setFiltros({
                      fechaInicio: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                      )
                        .toISOString()
                        .split("T")[0],
                      fechaFin: new Date().toISOString().split("T")[0],
                      estados: [],
                      tipos: [],
                      paciente: "",
                      es_cronica: null,
                      es_controlada: null,
                    })
                  }
                  className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                >
                  Limpiar Filtros
                </button>

                <button
                  onClick={() => setFiltrosAbiertos(false)}
                  className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO - RECETAS */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2
                className={`w-16 h-16 animate-spin ${tema.colores.acento} mx-auto mb-4`}
              />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>
                Cargando recetas médicas...
              </p>
            </div>
          </div>
        ) : recetasFiltradas.length === 0 ? (
          <div
            className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}
          >
            <div
              className={`w-24 h-24 bg-gradient-to-br ${tema.colores.gradiente} rounded-3xl flex items-center justify-center mx-auto mb-6`}
            >
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${tema.colores.texto}`}>
              No se encontraron recetas
            </h3>
            <p className={`text-lg mb-6 ${tema.colores.textoSecundario}`}>
              No hay recetas que coincidan con los filtros seleccionados
            </p>
            <button
              onClick={handleNuevaReceta}
              className={`inline-flex items-center gap-2 px-8 py-4 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}
            >
              <Plus className="w-5 h-5" />
              Crear Primera Receta
            </button>
          </div>
        ) : (
          <>
            {/* Continuaré con las vistas de recetas en el siguiente mensaje... */}
            {/* VISTA DE LISTA */}
{vistaModo === "lista" && (
  <div className="space-y-4">
    {recetasFiltradas.map((receta, index) => {
      const IconoEstado = COLORES_ESTADO[receta.estado].icon;
      const IconoTipo = COLORES_TIPO[receta.tipo_receta].icon;
      const tieneControlados = receta.medicamentos.some((m) => m.es_controlado);

      return (
        <div
          key={receta.id_receta}
          className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 animate-fadeIn`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start gap-6">
            {/* Avatar y Fecha */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`relative w-20 h-20 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
              >
                {receta.paciente.foto_url ? (
                  <Image
                    src={receta.paciente.foto_url}
                    alt={receta.paciente.nombre_completo}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  receta.paciente.nombre_completo
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                )}
                {receta.es_cronica && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Repeat className="w-4 h-4 text-white" />
                  </div>
                )}
                {tieneControlados && (
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <ShieldAlert className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className={`text-sm font-black ${tema.colores.texto}`}>
                  {formatearFechaCorta(receta.fecha_emision)}
                </div>
                <div className={`text-xs font-bold ${tema.colores.textoSecundario}`}>
                  {formatearHora(receta.fecha_emision)}
                </div>
              </div>
            </div>

            {/* Información de la Receta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-2xl font-black ${tema.colores.texto}`}>
                      {receta.paciente.nombre_completo}
                    </h3>
                    {receta.paciente.edad && (
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                      >
                        {receta.paciente.edad} años
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 flex-wrap text-sm font-semibold ${tema.colores.textoSecundario}`}
                  >
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      RUT: {receta.paciente.rut}
                    </span>
                    <span>•</span>
                    <span>{receta.paciente.genero}</span>
                    <span>•</span>
                    <span>{receta.paciente.prevision}</span>
                    {receta.paciente.telefono && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {receta.paciente.telefono}
                        </span>
                      </>
                    )}
                    {receta.paciente.email && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {receta.paciente.email}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                      COLORES_ESTADO[receta.estado].bg
                    } ${COLORES_ESTADO[receta.estado].text} ${
                      COLORES_ESTADO[receta.estado].border
                    }`}
                  >
                    <IconoEstado className="w-3 h-3" />
                    {COLORES_ESTADO[receta.estado].label}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                    style={{
                      backgroundColor: `${COLORES_TIPO[receta.tipo_receta].color}20`,
                      color: COLORES_TIPO[receta.tipo_receta].color,
                    }}
                  >
                    <IconoTipo className="w-3 h-3" />
                    {COLORES_TIPO[receta.tipo_receta].label}
                  </span>
                </div>
              </div>

              {/* Número de Receta */}
              <div
                className={`mb-4 p-3 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold opacity-90 mb-1">
                      N° RECETA
                    </div>
                    <div className="text-xl font-black">{receta.numero_receta}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold opacity-90 mb-1">
                      CÓDIGO VERIFICACIÓN
                    </div>
                    <div className="text-sm font-black font-mono">
                      {receta.codigo_verificacion}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              {receta.diagnostico && (
                <div
                  className={`mb-4 p-4 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clipboard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1 uppercase tracking-wider`}
                      >
                        Diagnóstico
                      </div>
                      <div className={`font-bold ${tema.colores.texto} text-base`}>
                        {receta.codigo_cie10 && (
                          <span className={`${tema.colores.acento} mr-2`}>
                            [{receta.codigo_cie10}]
                          </span>
                        )}
                        {receta.diagnostico}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medicamentos */}
              <div className="mb-4">
                <div
                  className={`text-xs font-bold ${tema.colores.textoSecundario} mb-3 flex items-center gap-2 uppercase tracking-wider`}
                >
                  <Pill className="w-4 h-4" />
                  Medicamentos Prescritos ({receta.medicamentos.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {receta.medicamentos.map((med, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                        med.es_controlado
                          ? "bg-red-500/10 border-red-500/30"
                          : `${tema.colores.secundario} ${tema.colores.borde}`
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          {med.es_controlado && (
                            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className={`font-bold ${tema.colores.texto} mb-1`}>
                              {med.nombre_medicamento}
                            </div>
                            {med.codigo_medicamento && (
                              <div
                                className={`text-xs ${tema.colores.textoSecundario} font-mono`}
                              >
                                Código: {med.codigo_medicamento}
                              </div>
                            )}
                          </div>
                        </div>
                        {med.dispensado && (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Dosis:
                          </span>
                          <span className={`text-xs font-bold ${tema.colores.texto}`}>
                            {med.dosis}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Frecuencia:
                          </span>
                          <span className={`text-xs font-bold ${tema.colores.texto}`}>
                            {med.frecuencia}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Duración:
                          </span>
                          <span className={`text-xs font-bold ${tema.colores.texto}`}>
                            {med.duracion}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Cantidad:
                          </span>
                          <span className={`text-xs font-bold ${tema.colores.texto}`}>
                            {med.cantidad} {med.unidad}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                          >
                            Vía:
                          </span>
                          <span className={`text-xs font-bold ${tema.colores.texto}`}>
                            {
                              VIAS_ADMINISTRACION.find(
                                (v) => v.value === med.via_administracion
                              )?.label
                            }
                          </span>
                        </div>
                        {med.precio_total && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                            <span
                              className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                            >
                              Valor Estimado:
                            </span>
                            <span className={`text-xs font-bold ${tema.colores.acento}`}>
                              {formatearMoneda(med.precio_total)}
                            </span>
                          </div>
                        )}
                      </div>

                      {med.instrucciones && (
                        <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                          <div className="text-xs font-bold text-yellow-400 mb-1">
                            📋 Instrucciones:
                          </div>
                          <div className="text-xs text-yellow-300">
                            {med.instrucciones}
                          </div>
                        </div>
                      )}

                      {med.dispensado && med.fecha_dispensacion && (
                        <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="text-xs font-bold text-green-400">
                            ✓ Dispensado el {formatearFechaCorta(med.fecha_dispensacion)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              {receta.observaciones && (
                <div
                  className={`mb-4 p-4 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1 uppercase tracking-wider`}
                      >
                        Observaciones
                      </div>
                      <div className={`text-sm ${tema.colores.texto}`}>
                        {receta.observaciones}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Médico */}
              <div
                className={`mb-4 p-4 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                      Médico Tratante
                    </div>
                    <div className={`font-bold ${tema.colores.texto}`}>
                      Dr(a). {receta.medico.nombre_completo}
                    </div>
                    <div className={`text-xs ${tema.colores.textoSecundario}`}>
                      RM: {receta.medico.numero_registro_medico} •{" "}
                      {receta.medico.especialidad_principal}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Centro */}
              <div
                className={`mb-4 p-4 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {receta.centro.logo_url ? (
                      <Image
                        src={receta.centro.logo_url}
                        alt={receta.centro.nombre}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                      Centro Médico
                    </div>
                    <div className={`font-bold ${tema.colores.texto}`}>
                      {receta.centro.nombre}
                    </div>
                    <div className={`text-xs ${tema.colores.textoSecundario}`}>
                      {receta.centro.direccion}, {receta.centro.ciudad}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fecha de Vencimiento */}
              {receta.fecha_vencimiento && (
                <div
                  className={`mb-4 p-3 rounded-xl ${
                    new Date(receta.fecha_vencimiento) < new Date()
                      ? "bg-red-500/20 border-red-500/30"
                      : "bg-blue-500/20 border-blue-500/30"
                  } border`}
                >
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`w-4 h-4 ${
                        new Date(receta.fecha_vencimiento) < new Date()
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-bold ${
                        new Date(receta.fecha_vencimiento) < new Date()
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {new Date(receta.fecha_vencimiento) < new Date()
                        ? "Vencida el"
                        : "Válida hasta el"}{" "}
                      {formatearFecha(receta.fecha_vencimiento)}
                    </span>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleVerDetalles(receta)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalles
                </button>

                <button
                  onClick={() => handleDescargarPDF(receta)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>

                <button
                  onClick={() => handleImprimirReceta(receta)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>

                <button
                  onClick={() => generarQRCode(receta)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Código QR
                </button>

                {receta.paciente.email && (
                  <button
                    onClick={() => handleEnviarPorEmail(receta)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Email
                  </button>
                )}

                {receta.estado === "emitida" && (
                  <>
                    <button
                      onClick={() => handleEditarReceta(receta)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => handleAnularReceta(receta.id_receta)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Anular
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDuplicarReceta(receta)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(receta.codigo_verificacion);
                    alert("Código de verificación copiado al portapapeles");
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 ${tema.colores.secundario} ${tema.colores.texto}`}
                >
                  <Hash className="w-4 h-4" />
                  Copiar Código
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}

{/* VISTA DE GRID */}
{vistaModo === "grid" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {recetasFiltradas.map((receta, index) => {
      const IconoEstado = COLORES_ESTADO[receta.estado].icon;
      const IconoTipo = COLORES_TIPO[receta.tipo_receta].icon;
      const tieneControlados = receta.medicamentos.some((m) => m.es_controlado);

      return (
        <div
          key={receta.id_receta}
          className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer animate-fadeIn`}
          onClick={() => handleVerDetalles(receta)}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg relative`}
            >
              {receta.paciente.foto_url ? (
                <Image
                  src={receta.paciente.foto_url}
                  alt={receta.paciente.nombre_completo}
                  width={56}
                  height={56}
                  className="rounded-xl object-cover"
                />
              ) : (
                receta.paciente.nombre_completo
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
              )}
              {receta.es_cronica && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Repeat className="w-3 h-3 text-white" />
                </div>
              )}
              {tieneControlados && (
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  COLORES_ESTADO[receta.estado].bg
                } ${COLORES_ESTADO[receta.estado].text}`}
              >
                <IconoEstado className="w-3 h-3" />
                {COLORES_ESTADO[receta.estado].label}
              </span>

              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}
                style={{
                  backgroundColor: `${COLORES_TIPO[receta.tipo_receta].color}20`,
                  color: COLORES_TIPO[receta.tipo_receta].color,
                }}
              >
                <IconoTipo className="w-3 h-3" />
                {COLORES_TIPO[receta.tipo_receta].label}
              </span>
            </div>
          </div>

          {/* Paciente */}
          <h3
            className={`text-lg font-black ${tema.colores.texto} mb-2 truncate`}
            title={receta.paciente.nombre_completo}
          >
            {receta.paciente.nombre_completo}
          </h3>

          {/* RUT y Edad */}
          <div className={`text-sm font-semibold ${tema.colores.textoSecundario} mb-4`}>
            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3" />
              {receta.paciente.rut}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-3 h-3" />
              {receta.paciente.edad} años • {receta.paciente.genero}
            </div>
          </div>

          {/* N° Receta */}
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${tema.colores.gradiente} text-white mb-4`}
          >
            <div className="text-xs font-bold opacity-90 mb-1">N° RECETA</div>
            <div className="text-sm font-black">{receta.numero_receta}</div>
          </div>

          {/* Diagnóstico */}
          {receta.diagnostico && (
            <div
              className={`p-3 rounded-lg ${tema.colores.secundario} mb-4`}
            >
              <div
                className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
              >
                Diagnóstico
              </div>
              <div
                className={`text-sm font-bold ${tema.colores.texto} line-clamp-2`}
                title={receta.diagnostico}
              >
                {receta.codigo_cie10 && (
                  <span className={`${tema.colores.acento} mr-1`}>
                    [{receta.codigo_cie10}]
                  </span>
                )}
                {receta.diagnostico}
              </div>
            </div>
          )}

          {/* Medicamentos */}
          <div className="mb-4">
            <div
              className={`text-xs font-bold ${tema.colores.textoSecundario} mb-2 flex items-center gap-1`}
            >
              <Pill className="w-3 h-3" />
              {receta.medicamentos.length} medicamento(s)
            </div>
            <div className="space-y-1">
              {receta.medicamentos.slice(0, 3).map((med, idx) => (
                <div
                  key={idx}
                  className={`text-sm ${tema.colores.texto} truncate flex items-center gap-1`}
                  title={med.nombre_medicamento}
                >
                  {med.es_controlado && (
                    <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{med.nombre_medicamento}</span>
                </div>
              ))}
              {receta.medicamentos.length > 3 && (
                <div className={`text-sm ${tema.colores.textoSecundario} italic`}>
                  +{receta.medicamentos.length - 3} más...
                </div>
              )}
            </div>
          </div>

          {/* Fecha */}
          <div
            className={`flex items-center justify-between text-xs ${tema.colores.textoSecundario} pt-4 border-t ${tema.colores.borde}`}
          >
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatearFechaCorta(receta.fecha_emision)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatearHora(receta.fecha_emision)}
            </div>
          </div>

          {/* Vencimiento */}
          {receta.fecha_vencimiento && (
            <div
              className={`mt-2 p-2 rounded-lg text-xs font-bold ${
                new Date(receta.fecha_vencimiento) < new Date()
                  ? "bg-red-500/20 text-red-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {new Date(receta.fecha_vencimiento) < new Date()
                ? "⚠️ Vencida"
                : "✓ Válida"}{" "}
              hasta {formatearFechaCorta(receta.fecha_vencimiento)}
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

{/* VISTA DE TIMELINE */}
{vistaModo === "timeline" && (
  <div
    className={`rounded-2xl p-8 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
  >
    <h3 className={`text-2xl font-black mb-6 ${tema.colores.texto} flex items-center gap-3`}>
      <Activity className="w-7 h-7" />
      Línea de Tiempo de Recetas
    </h3>

    <div className="space-y-6">
      {recetasFiltradas.map((receta, index) => {
        const IconoEstado = COLORES_ESTADO[receta.estado].icon;
        const IconoTipo = COLORES_TIPO[receta.tipo_receta].icon;
        const tieneControlados = receta.medicamentos.some((m) => m.es_controlado);

        return (
          <div key={receta.id_receta} className="flex gap-4 animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Timeline Bar */}
            <div className="flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg relative z-10`}
              >
                <IconoTipo className="w-7 h-7 text-white" />
                {receta.es_cronica && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <Repeat className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              {index < recetasFiltradas.length - 1 && (
                <div
                  className={`w-1 flex-1 bg-gradient-to-b ${tema.colores.gradiente} opacity-30 my-2 min-h-[40px]`}
                ></div>
              )}
            </div>

            {/* Contenido */}
            <div
              className={`flex-1 p-5 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border mb-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer`}
              onClick={() => handleVerDetalles(receta)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`text-xl font-black ${tema.colores.texto}`}>
                      {receta.paciente.nombre_completo}
                    </h4>
                    {tieneControlados && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Controlada
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2 flex-wrap`}>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {receta.numero_receta}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatearFecha(receta.fecha_emision)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatearHora(receta.fecha_emision)}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    COLORES_ESTADO[receta.estado].bg
                  } ${COLORES_ESTADO[receta.estado].text}`}
                >
                  <IconoEstado className="w-3 h-3" />
                  {COLORES_ESTADO[receta.estado].label}
                </span>
              </div>

              {receta.diagnostico && (
                <div className={`mb-3 p-3 rounded-lg ${tema.colores.hover}`}>
                  <div className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}>
                    Diagnóstico
                  </div>
                  <div className={`text-sm ${tema.colores.texto}`}>
                    {receta.codigo_cie10 && (
                      <span className={`${tema.colores.acento} mr-1`}>
                        [{receta.codigo_cie10}]
                      </span>
                    )}
                    {receta.diagnostico}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  <Pill className="w-3 h-3" />
                  {receta.medicamentos.length} medicamentos
                </span>

                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${tema.colores.hover} ${tema.colores.texto}`}
                >
                  <User className="w-3 h-3" />
                  {receta.paciente.prevision}
                </span>

                {receta.fecha_vencimiento && (
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                      new Date(receta.fecha_vencimiento) < new Date()
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {new Date(receta.fecha_vencimiento) < new Date()
                      ? "Vencida"
                      : "Vigente"}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerDetalles(receta);
                  }}
                  className={`ml-auto px-4 py-1 rounded-lg text-xs font-bold ${tema.colores.primario} text-white transition-all duration-300 hover:scale-105 flex items-center gap-1`}
                >
                  <Eye className="w-3 h-3" />
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

          </>
        )}
      </main>

      {/* Los modales continuarán en el siguiente mensaje */}
      {/* ========================================
    MODAL: NUEVA RECETA / EDITAR RECETA
    ======================================== */}
{(modalNuevaReceta || modalEditarReceta) && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div
      className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideUp custom-scrollbar`}
    >
      {/* Header del Modal */}
      <div className={`sticky top-0 z-10 p-6 ${tema.colores.header} ${tema.colores.borde} border-b backdrop-blur-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center shadow-lg`}
            >
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                {modalEditarReceta ? "Editar Receta" : "Nueva Receta Médica"}
              </h2>
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                Complete todos los campos requeridos para emitir la receta
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setModalNuevaReceta(false);
              setModalEditarReceta(false);
              setRecetaSeleccionada(null);
            }}
            className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110 hover:rotate-90`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Contenido del Modal */}
      <div className="p-6 space-y-6">
        {/* SECCIÓN 1: SELECCIÓN DE PACIENTE */}
        <div
          className={`p-6 rounded-2xl ${tema.colores.secundario} ${tema.colores.borde} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className={`text-xl font-black ${tema.colores.texto}`}>
              1. Seleccionar Paciente
            </h3>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
              * Requerido
            </span>
          </div>

          {pacienteSeleccionado ? (
            <div
              className={`p-5 rounded-xl ${tema.colores.hover} ${tema.colores.borde} border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                  >
                    {pacienteSeleccionado.foto_url ? (
                      <Image
                        src={pacienteSeleccionado.foto_url}
                        alt={pacienteSeleccionado.nombre_completo}
                        width={64}
                        height={64}
                        className="rounded-xl object-cover"
                      />
                    ) : (
                      pacienteSeleccionado.nombre_completo
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xl font-black ${tema.colores.texto} mb-1`}>
                      {pacienteSeleccionado.nombre_completo}
                    </h4>
                    <div
                      className={`flex items-center gap-3 text-sm font-semibold ${tema.colores.textoSecundario}`}
                    >
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        RUT: {pacienteSeleccionado.rut}
                      </span>
                      <span>•</span>
                      <span>{pacienteSeleccionado.edad} años</span>
                      <span>•</span>
                      <span>{pacienteSeleccionado.genero}</span>
                      <span>•</span>
                      <span>{pacienteSeleccionado.prevision}</span>
                    </div>
                    {pacienteSeleccionado.telefono && (
                      <div
                        className={`flex items-center gap-1 text-sm ${tema.colores.textoSecundario} mt-1`}
                      >
                        <Phone className="w-3 h-3" />
                        {pacienteSeleccionado.telefono}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setFormularioReceta({ ...formularioReceta, id_paciente: null });
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                >
                  Cambiar Paciente
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setModalSeleccionarPaciente(true)}
              className={`w-full p-6 rounded-xl border-2 border-dashed ${tema.colores.borde} ${tema.colores.hover} transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3`}
            >
              <Plus className={`w-6 h-6 ${tema.colores.acento}`} />
              <span className={`text-lg font-bold ${tema.colores.texto}`}>
                Seleccionar Paciente
              </span>
            </button>
          )}
        </div>

        {/* SECCIÓN 2: INFORMACIÓN DE LA RECETA */}
        <div
          className={`p-6 rounded-2xl ${tema.colores.secundario} ${tema.colores.borde} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className={`text-xl font-black ${tema.colores.texto}`}>
              2. Información de la Receta
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Receta */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                Tipo de Receta *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(COLORES_TIPO) as TipoReceta[]).map((tipo) => {
                  const IconoTipo = COLORES_TIPO[tipo].icon;
                  return (
                    <button
                      key={tipo}
                      onClick={() =>
                        setFormularioReceta({ ...formularioReceta, tipo_receta: tipo })
                      }
                      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        formularioReceta.tipo_receta === tipo
                          ? `border-[${COLORES_TIPO[tipo].color}] bg-[${COLORES_TIPO[tipo].color}]/20`
                          : `${tema.colores.borde} ${tema.colores.hover}`
                      }`}
                    >
                      <IconoTipo
                        className="w-6 h-6 mx-auto mb-2"
                        style={{ color: COLORES_TIPO[tipo].color }}
                      />
                      <div
                        className={`text-sm font-bold ${tema.colores.texto} text-center`}
                      >
                        {COLORES_TIPO[tipo].label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fecha de Emisión */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                Fecha de Emisión *
              </label>
              <input
                type="date"
                value={formularioReceta.fecha_emision}
                onChange={(e) =>
                  setFormularioReceta({
                    ...formularioReceta,
                    fecha_emision: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
            </div>

            {/* Fecha de Vencimiento */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formularioReceta.fecha_vencimiento}
                onChange={(e) =>
                  setFormularioReceta({
                    ...formularioReceta,
                    fecha_vencimiento: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
            </div>

            {/* Receta Crónica */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                ¿Es Receta Crónica?
              </label>
              <label
                className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} ${tema.colores.borde} border cursor-pointer transition-all duration-300 hover:scale-105`}
              >
                <input
                  type="checkbox"
                  checked={formularioReceta.es_cronica}
                  onChange={(e) =>
                    setFormularioReceta({
                      ...formularioReceta,
                      es_cronica: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-purple-400" />
                  <span className={`text-sm font-bold ${tema.colores.texto}`}>
                    Receta renovable (crónica)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DIAGNÓSTICO */}
        <div
          className={`p-6 rounded-2xl ${tema.colores.secundario} ${tema.colores.borde} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Clipboard className="w-5 h-5 text-green-400" />
            </div>
            <h3 className={`text-xl font-black ${tema.colores.texto}`}>
              3. Diagnóstico
            </h3>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
              * Requerido
            </span>
          </div>

          <div className="space-y-4">
            {/* Buscador de Diagnósticos CIE-10 */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                Buscar Diagnóstico CIE-10
              </label>
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
                />
                <input
                  type="text"
                  placeholder="Buscar por código o descripción..."
                  value={busquedaDiagnostico}
                  onChange={(e) => setBusquedaDiagnostico(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
                />
              </div>

              {busquedaDiagnostico && diagnosticosFiltrados.length > 0 && (
                <div
                  className={`mt-2 max-h-60 overflow-y-auto rounded-xl ${tema.colores.card} ${tema.colores.borde} border custom-scrollbar`}
                >
                  {diagnosticosFiltrados.map((diag) => (
                    <button
                      key={diag.codigo}
                      onClick={() => {
                        handleSeleccionarDiagnostico(diag);
                        setBusquedaDiagnostico("");
                      }}
                      className={`w-full p-4 text-left transition-all duration-300 ${tema.colores.hover} border-b ${tema.colores.borde} last:border-b-0`}
                    >
                      <div className={`font-bold ${tema.colores.acento} mb-1`}>
                        {diag.codigo}
                      </div>
                      <div className={`text-sm ${tema.colores.texto}`}>
                        {diag.descripcion}
                      </div>
                      <div
                        className={`text-xs ${tema.colores.textoSecundario} mt-1`}
                      >
                        Categoría: {diag.categoria}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Código CIE-10 */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                Código CIE-10
              </label>
              <input
                type="text"
                placeholder="Ej: J06.9"
                value={formularioReceta.codigo_cie10}
                onChange={(e) =>
                  setFormularioReceta({
                    ...formularioReceta,
                    codigo_cie10: e.target.value.toUpperCase(),
                  })
                }
                className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 font-mono`}
              />
            </div>

            {/* Descripción del Diagnóstico */}
            <div>
              <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                Descripción del Diagnóstico *
              </label>
              <textarea
                placeholder="Describa el diagnóstico del paciente..."
                value={formularioReceta.diagnostico}
                onChange={(e) =>
                  setFormularioReceta({
                    ...formularioReceta,
                    diagnostico: e.target.value,
                  })
                }
                rows={4}
                className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 resize-none`}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: MEDICAMENTOS */}
        <div
          className={`p-6 rounded-2xl ${tema.colores.secundario} ${tema.colores.borde} border`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className={`text-xl font-black ${tema.colores.texto}`}>
                4. Medicamentos ({formularioReceta.medicamentos.length})
              </h3>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">
                * Al menos 1 requerido
              </span>
            </div>
            <button
              onClick={handleAgregarMedicamento}
              className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
            >
              <Plus className="w-5 h-5" />
              Agregar Medicamento
            </button>
          </div>

          {formularioReceta.medicamentos.length === 0 ? (
            <div
              className={`p-8 rounded-xl border-2 border-dashed ${tema.colores.borde} text-center`}
            >
              <Pill
                className={`w-12 h-12 ${tema.colores.textoSecundario} mx-auto mb-3 opacity-50`}
              />
              <p className={`text-lg font-bold ${tema.colores.textoSecundario}`}>
                No hay medicamentos agregados
              </p>
              <p className={`text-sm ${tema.colores.textoSecundario} mt-1`}>
                Haga clic en "Agregar Medicamento" para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formularioReceta.medicamentos.map((med, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                    med.es_controlado
                      ? "bg-red-500/10 border-red-500/30"
                      : `${tema.colores.hover} ${tema.colores.borde}`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                        med.es_controlado
                          ? "bg-red-500"
                          : "bg-gradient-to-br from-blue-500 to-purple-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {med.es_controlado && (
                              <ShieldAlert className="w-5 h-5 text-red-400" />
                            )}
                            <h4 className={`text-lg font-black ${tema.colores.texto}`}>
                              {med.nombre_medicamento}
                            </h4>
                          </div>
                          {med.codigo_medicamento && (
                            <div
                              className={`text-xs ${tema.colores.textoSecundario} font-mono mb-2`}
                            >
                              Código: {med.codigo_medicamento}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditarMedicamento(index)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg transition-all duration-300 hover:scale-110"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarMedicamento(index)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <div
                            className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                          >
                            Dosis
                          </div>
                          <div className={`text-sm font-bold ${tema.colores.texto}`}>
                            {med.dosis}
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                          >
                            Frecuencia
                          </div>
                          <div className={`text-sm font-bold ${tema.colores.texto}`}>
                            {med.frecuencia}
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                          >
                            Duración
                          </div>
                          <div className={`text-sm font-bold ${tema.colores.texto}`}>
                            {med.duracion}
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${tema.colores.textoSecundario} mb-1`}
                          >
                            Cantidad
                          </div>
                          <div className={`text-sm font-bold ${tema.colores.texto}`}>
                            {med.cantidad} {med.unidad}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${tema.colores.secundario} ${tema.colores.texto}`}
                        >
                          Vía:{" "}
                          {
                            VIAS_ADMINISTRACION.find(
                              (v) => v.value === med.via_administracion
                            )?.label
                          }
                        </span>
                        {med.precio_total && (
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400`}
                          >
                            {formatearMoneda(med.precio_total)}
                          </span>
                        )}
                      </div>

                      {med.instrucciones && (
                        <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                          <div className="text-xs font-bold text-yellow-400 mb-1">
                            📋 Instrucciones:
                          </div>
                          <div className="text-xs text-yellow-300">
                            {med.instrucciones}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 5: OBSERVACIONES */}
        <div
          className={`p-6 rounded-2xl ${tema.colores.secundario} ${tema.colores.borde} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className={`text-xl font-black ${tema.colores.texto}`}>
              5. Observaciones Adicionales
            </h3>
          </div>

          <textarea
            placeholder="Agregue cualquier observación o indicación adicional..."
            value={formularioReceta.observaciones}
            onChange={(e) =>
              setFormularioReceta({
                ...formularioReceta,
                observaciones: e.target.value,
              })
            }
            rows={4}
            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 resize-none`}
          />
        </div>

        {/* RESUMEN */}
        <div
          className={`p-6 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} text-white`}
        >
          <h3 className="text-xl font-black mb-4">Resumen de la Receta</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-xs font-bold opacity-80 mb-1">Paciente</div>
              <div className="text-lg font-black">
                {pacienteSeleccionado?.nombre_completo || "No seleccionado"}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-xs font-bold opacity-80 mb-1">Tipo</div>
              <div className="text-lg font-black capitalize">
                {COLORES_TIPO[formularioReceta.tipo_receta].label}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-xs font-bold opacity-80 mb-1">Medicamentos</div>
              <div className="text-lg font-black">
                {formularioReceta.medicamentos.length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-xs font-bold opacity-80 mb-1">Crónica</div>
              <div className="text-lg font-black">
                {formularioReceta.es_cronica ? "Sí" : "No"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del Modal */}
      <div
        className={`sticky bottom-0 p-6 ${tema.colores.header} ${tema.colores.borde} border-t backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setModalNuevaReceta(false);
              setModalEditarReceta(false);
              setRecetaSeleccionada(null);
            }}
            className={`px-8 py-4 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
          >
            Cancelar
          </button>

          <button
            onClick={handleGuardarReceta}
            disabled={
              !formularioReceta.id_paciente ||
              !formularioReceta.diagnostico ||
              formularioReceta.medicamentos.length === 0
            }
            className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              !formularioReceta.id_paciente ||
              !formularioReceta.diagnostico ||
              formularioReceta.medicamentos.length === 0
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : `${tema.colores.primario} text-white ${tema.colores.sombra}`
            }`}
          >
            <Save className="w-5 h-5" />
            {modalEditarReceta ? "Actualizar Receta" : "Emitir Receta"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ========================================
    MODAL: AGREGAR MEDICAMENTO
    ======================================== */}
{modalAgregarMedicamento && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
    <div
      className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} animate-slideUp custom-scrollbar`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 p-6 ${tema.colores.header} ${tema.colores.borde} border-b backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg`}
            >
              <Pill className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-3xl font-black ${tema.colores.texto}`}>
                Agregar Medicamento
              </h2>
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                Complete la información del medicamento a prescribir
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalAgregarMedicamento(false)}
            className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-110 hover:rotate-90`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">
        {/* Buscador de Medicamentos */}
        <div>
          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
            Buscar Medicamento en Catálogo
          </label>
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, genérico, laboratorio o código ISP..."
              value={busquedaMedicamento}
              onChange={(e) => setBusquedaMedicamento(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
            />
          </div>

          {busquedaMedicamento && medicamentosFiltrados.length > 0 && (
            <div
              className={`mt-2 max-h-60 overflow-y-auto rounded-xl ${tema.colores.card} ${tema.colores.borde} border custom-scrollbar`}
            >
              {medicamentosFiltrados.map((med) => (
                <button
                  key={med.id_medicamento}
                  onClick={() => {
                    handleSeleccionarMedicamento(med);
                    setBusquedaMedicamento("");
                  }}
                  className={`w-full p-4 text-left transition-all duration-300 ${tema.colores.hover} border-b ${tema.colores.borde} last:border-b-0`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {med.es_controlado && (
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                        )}
                        <div className={`font-bold ${tema.colores.texto}`}>
                          {med.nombre}
                        </div>
                      </div>
                      <div className={`text-sm ${tema.colores.textoSecundario}`}>
                        {med.nombre_generico} • {med.presentacion}
                      </div>
                      <div
                        className={`text-xs ${tema.colores.textoSecundario} mt-1`}
                      >
                        Lab: {med.laboratorio} • ISP: {med.codigo_registro_isp}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${tema.colores.acento}`}>
                        {formatearMoneda(med.precio_referencia)}
                      </div>
                      {med.stock_disponible !== undefined && (
                        <div
                          className={`text-xs ${
                            med.stock_disponible > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          Stock: {med.stock_disponible}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nombre del Medicamento */}
        <div>
          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
            Nombre del Medicamento *
          </label>
          <input
            type="text"
            placeholder="Ej: Paracetamol 500mg comprimidos"
            value={medicamentoTemp.nombre_medicamento}
            onChange={(e) =>
              setMedicamentoTemp({
                ...medicamentoTemp,
                nombre_medicamento: e.target.value,
              })
            }
            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
          />
        </div>

        {/* Código del Medicamento */}
        <div>
          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
            Código de Medicamento (ISP)
          </label>
          <input
            type="text"
            placeholder="Ej: F-12345/20"
            value={medicamentoTemp.codigo_medicamento}
            onChange={(e) =>
              setMedicamentoTemp({
                ...medicamentoTemp,
                codigo_medicamento: e.target.value,
              })
            }
            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 font-mono`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dosis */}
          <div>
            <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
              Dosis *
            </label>
            <input
              type="text"
              placeholder="Ej: 500mg, 1 comprimido"
              value={medicamentoTemp.dosis}
              onChange={(e) =>
                setMedicamentoTemp({ ...medicamentoTemp, dosis: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
            />
          </div>

          {/* Frecuencia */}
          <div>
            <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
              Frecuencia *
            </label>
            <input
              type="text"
              placeholder="Ej: Cada 8 horas, 3 veces al día"
              value={medicamentoTemp.frecuencia}
              onChange={(e) =>
                setMedicamentoTemp({
                  ...medicamentoTemp,
                  frecuencia: e.target.value,
                })
              }
              className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
            />
          </div>

          {/* Duración */}
          <div>
            <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
              Duración *
            </label>
            <input
              type="text"
              placeholder="Ej: 7 días, 2 semanas"
              value={medicamentoTemp.duracion}
              onChange={(e) =>
                setMedicamentoTemp({
                  ...medicamentoTemp,
                  duracion: e.target.value,
                })
              }
              className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
            />
          </div>

          {/* Cantidad */}
          <div>
            <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
              Cantidad *
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder="Ej: 20"
                value={medicamentoTemp.cantidad}
                onChange={(e) =>
                  setMedicamentoTemp({
                    ...medicamentoTemp,
                    cantidad: parseInt(e.target.value) || 1,
                  })
                }
                className={`flex-1 px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              />
              <select
                value={medicamentoTemp.unidad}
                onChange={(e) =>
                  setMedicamentoTemp({
                    ...medicamentoTemp,
                    unidad: e.target.value,
                  })
                }
                className={`px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
              >
                <option value="comprimidos">Comprimidos</option>
                <option value="cápsulas">Cápsulas</option>
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="unidades">Unidades</option>
                <option value="sobres">Sobres</option>
                <option value="ampollas">Ampollas</option>
                <option value="frascos">Frascos</option>
                <option value="cajas">Cajas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vía de Administración */}
        <div>
          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
            Vía de Administración *
          </label>
          <select
            value={medicamentoTemp.via_administracion}
            onChange={(e) =>
              setMedicamentoTemp({
                ...medicamentoTemp,
                via_administracion: e.target.value as ViaAdministracion,
              })
            }
            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300`}
          >
            {VIAS_ADMINISTRACION.map((via) => (
              <option key={via.value} value={via.value}>
                {via.label}
              </option>
            ))}
          </select>
        </div>

        {/* Instrucciones Especiales */}
        <div>
          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
            Instrucciones Especiales
          </label>
          <textarea
            placeholder="Ej: Tomar con alimentos, evitar el alcohol, etc."
            value={medicamentoTemp.instrucciones}
            onChange={(e) =>
              setMedicamentoTemp({
                ...medicamentoTemp,
                instrucciones: e.target.value,
              })
            }
            rows={3}
            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 resize-none`}
          />
        </div>

        {/* Medicamento Controlado */}
        <div>
          <label
            className={`flex items-center gap-3 p-4 rounded-xl ${tema.colores.hover} ${tema.colores.borde} border cursor-pointer transition-all duration-300 hover:scale-[1.02]`}
          >
            <input
              type="checkbox"
              checked={medicamentoTemp.es_controlado}
              onChange={(e) =>
                setMedicamentoTemp({
                  ...medicamentoTemp,
                  es_controlado: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <div>
                <div className={`text-sm font-bold ${tema.colores.texto}`}>
                  Medicamento Controlado
                </div>
                <div className={`text-xs ${tema.colores.textoSecundario}`}>
                  Requiere control especial y registro
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Precio (si está disponible) */}
        {medicamentoTemp.precio_unitario && (
          <div
            className={`p-4 rounded-xl bg-green-500/10 border border-green-500/30`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-green-400 mb-1">
                  Precio Estimado
                </div>
                <div className="text-xs text-green-300">
                  Precio unitario: {formatearMoneda(medicamentoTemp.precio_unitario)}
                </div>
              </div>
              <div className="text-2xl font-black text-green-400">
                {formatearMoneda(
                  medicamentoTemp.precio_unitario * medicamentoTemp.cantidad
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`sticky bottom-0 p-6 ${tema.colores.header} ${tema.colores.borde} border-t backdrop-blur-xl`}
      >
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => setModalAgregarMedicamento(false)}
            className={`px-8 py-4 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
          >
            Cancelar
          </button>

          <button
            onClick={handleGuardarMedicamento}
            disabled={
              !medicamentoTemp.nombre_medicamento ||
              !medicamentoTemp.dosis ||
              !medicamentoTemp.frecuencia ||
              !medicamentoTemp.duracion
            }
            className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
              !medicamentoTemp.nombre_medicamento ||
              !medicamentoTemp.dosis ||
              !medicamentoTemp.frecuencia ||
              !medicamentoTemp.duracion
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : `${tema.colores.primario} text-white ${tema.colores.sombra}`
            }`}
          >
            <Plus className="w-5 h-5" />
            Agregar Medicamento
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
}
