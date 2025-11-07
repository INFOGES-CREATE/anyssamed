// app/(dashboard)/medico/consultas/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Users,
  User,
  Search,
  Filter,
  Calendar,
  Clock,
  Heart,
  Activity,
  FileText,
  Pill,
  TestTube,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Edit,
  Eye,
  MoreVertical,
  X,
  Plus,
  Star,
  TrendingUp,
  RefreshCw,
  Settings,
  LogOut,
  Home,
  Stethoscope,
  MessageSquare,
  Loader2,
  Save,
  Send,
  Printer,
  Download,
  Upload,
  Camera,
  Mic,
  Image as ImageIcon,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Cake,
  Droplet,
  Weight,
  Ruler,
  Thermometer,
  Wind,
  Gauge,
  Zap,
  Brain,
  Bone,
  Microscope,
  Syringe,
  Bandage,
  Clipboard,
  ClipboardList,
  BookOpen,
  BookMarked,
  History,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Award,
  Shield,
  Lock,
  Unlock,
  Archive,
  Folder,
  FolderOpen,
  File,
  FileCheck,
  FileX,
  ExternalLink,
  Maximize2,
  Minimize2,
  Copy,
  Share2,
  Info,
  HelpCircle,
  Wifi,
  WifiOff,
  Database,
  Server,
  Cloud,
  CloudOff,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Fingerprint,
  Scan,
  QrCode,
  CreditCard,
  DollarSign,
  Navigation,
  Compass,
  Map,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Speaker,
  Video,
  Play,
  Pause,
  StopCircle,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";


// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type VistaPaciente = "resumen" | "historia" | "examenes" | "recetas" | "documentos";
type TabConsulta = "anamnesis" | "examen" | "diagnostico" | "receta" | "orden" | "notas";

interface ConfiguracionTema {
  nombre: string;
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
    firma_digital: boolean;
    firma_digital_url: string | null;
  };
}

interface Paciente {
  id_paciente: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad: number;
  genero: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  foto_url: string | null;
  grupo_sanguineo: string;
  estado: "activo" | "inactivo" | "bloqueado" | "fallecido";
  es_vip: boolean;
  clasificacion_riesgo: "bajo" | "medio" | "alto" | "critico" | null;
  imc: number | null;
  peso_kg: number | null;
  altura_cm: number | null;
  alergias_count: number;
  condiciones_cronicas_count: number;
  medicamentos_activos_count: number;
}

interface SignoVital {
  id_signo_vital: number;
  fecha_medicion: string;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  pulso: number | null;
  frecuencia_respiratoria: number | null;
  temperatura: number | null;
  saturacion_oxigeno: number | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  dolor_eva: number | null;
  glucemia: number | null;
  observaciones: string | null;
}

interface Alergia {
  id_alergia: number;
  tipo_alergia: string;
  alergeno: string;
  severidad: "leve" | "moderada" | "severa" | "fatal";
  reaccion: string;
  fecha_diagnostico: string | null;
  estado: "activa" | "inactiva" | "sospecha";
}

interface CondicionCronica {
  id_condicion: number;
  nombre_condicion: string;
  codigo_cie10: string | null;
  fecha_diagnostico: string;
  severidad: "leve" | "moderada" | "severa" | "critica" | null;
  estado: "activa" | "controlada" | "resuelta" | "en_tratamiento";
  tratamiento_actual: string | null;
}

interface HistorialClinico {
  id_historial: number;
  fecha_atencion: string;
  motivo_consulta: string;
  diagnostico_principal: string | null;
  medico_nombre: string;
  especialidad: string | null;
  tipo_atencion: string;
}

interface FormularioConsulta {
  motivo_consulta: string;
  anamnesis: string;
  examen_fisico: string;
  diagnostico_principal: string;
  codigo_cie10: string;
  plan_tratamiento: string;
  observaciones: string;
  tipo_atencion: "consulta" | "control" | "urgencia" | "procedimiento" | "telemedicina";
  es_ges: boolean;
  es_cronica: boolean;
  proximo_control: string;
}

interface Medicamento {
  nombre: string;
  dosis: string;
  via: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
}

interface OrdenExamen {
  tipo_examen: string;
  nombre_examen: string;
  indicaciones: string;
  urgente: boolean;
}

// ========================================
// CONFIGURACIONES DE TEMAS
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
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
      card: "bg-white border-gray-200",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro",
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
      card: "bg-gray-800/50 border-gray-700",
      hover: "hover:bg-gray-800",
    },
  },
  blue: {
    nombre: "Azul Océano",
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
      card: "bg-blue-800/50 border-cyan-700",
      hover: "hover:bg-blue-800",
    },
  },
  purple: {
    nombre: "Púrpura Real",
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
      card: "bg-purple-800/50 border-purple-700",
      hover: "hover:bg-purple-800",
    },
  },
  green: {
    nombre: "Verde Médico",
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
      card: "bg-emerald-800/50 border-emerald-700",
      hover: "hover:bg-emerald-800",
    },
  },
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function ConsultasPage() {
  // Estados principales
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  
  // Estados de pacientes
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  
  // Estados de consulta
  const [vistaPaciente, setVistaPaciente] = useState<VistaPaciente>("resumen");
  const [tabConsulta, setTabConsulta] = useState<TabConsulta>("anamnesis");
  const [formularioConsulta, setFormularioConsulta] = useState<FormularioConsulta>({
    motivo_consulta: "",
    anamnesis: "",
    examen_fisico: "",
    diagnostico_principal: "",
    codigo_cie10: "",
    plan_tratamiento: "",
    observaciones: "",
    tipo_atencion: "consulta",
    es_ges: false,
    es_cronica: false,
    proximo_control: "",
  });
  
  // Estados de datos clínicos
  const [signosVitales, setSignosVitales] = useState<SignoVital[]>([]);
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [condicionesCronicas, setCondicionesCronicas] = useState<CondicionCronica[]>([]);
  const [historialClinico, setHistorialClinico] = useState<HistorialClinico[]>([]);
  
  // Estados de medicamentos y exámenes
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [ordenesExamen, setOrdenesExamen] = useState<OrdenExamen[]>([]);
  
  // Estados UI
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [panelLateralAbierto, setPanelLateralAbierto] = useState(true);
  const [guardandoConsulta, setGuardandoConsulta] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(true);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarPacientesRecientes();
    }
  }, [usuario]);

  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarDatosPaciente(pacienteSeleccionado.id_paciente);
    }
  }, [pacienteSeleccionado]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

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

        const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));
        if (!tieneRolMedico || !result.usuario.medico) {
          alert("Acceso denegado.");
          window.location.href = "/";
          return;
        }

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

  const cargarPacientesRecientes = async () => {
    try {
      const response = await fetch("/api/medico/pacientes?limit=20&orden_campo=ultima_consulta&orden_direccion=desc", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setPacientes(data.pacientes || []);
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  };

  const cargarDatosPaciente = async (idPaciente: number) => {
    try {
      setLoadingPaciente(true);

      // Cargar signos vitales
      const svRes = await fetch(`/api/medico/pacientes/${idPaciente}/signos-vitales`, { credentials: "include" });
      const svData = await svRes.json();
      if (svData.success) setSignosVitales(svData.signos || []);

      // Cargar alergias
      const alRes = await fetch(`/api/medico/pacientes/${idPaciente}/alergias`, { credentials: "include" });
      const alData = await alRes.json();
      if (alData.success) setAlergias(alData.alergias || []);

      // Cargar condiciones crónicas
      const ccRes = await fetch(`/api/medico/pacientes/${idPaciente}/condiciones-cronicas`, { credentials: "include" });
      const ccData = await ccRes.json();
      if (ccData.success) setCondicionesCronicas(ccData.condiciones || []);

      // Cargar historial clínico
      const hcRes = await fetch(`/api/medico/pacientes/${idPaciente}/historial-clinico`, { credentials: "include" });
      const hcData = await hcRes.json();
      if (hcData.success) setHistorialClinico(hcData.historial || []);

    } catch (error) {
      console.error("Error al cargar datos del paciente:", error);
    } finally {
      setLoadingPaciente(false);
    }
  };

  const buscarPacientes = async (termino: string) => {
    if (!termino.trim()) {
      cargarPacientesRecientes();
      return;
    }

    try {
      const response = await fetch(`/api/medico/pacientes?busqueda=${encodeURIComponent(termino)}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setPacientes(data.pacientes || []);
      }
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
    }
  };

  // ========================================
  // FUNCIONES DE ACCIONES
  // ========================================

  const guardarConsulta = async () => {
    if (!pacienteSeleccionado || !usuario?.medico) {
      alert("Seleccione un paciente");
      return;
    }

    if (!formularioConsulta.motivo_consulta.trim()) {
      alert("El motivo de consulta es obligatorio");
      return;
    }

    try {
      setGuardandoConsulta(true);

      const payload = {
        id_paciente: pacienteSeleccionado.id_paciente,
        id_medico: usuario.medico.id_medico,
        id_centro: usuario.medico.id_centro_principal,
        id_especialidad: usuario.medico.especialidades[0]?.id_especialidad || null,
        ...formularioConsulta,
        fecha_atencion: new Date().toISOString(),
        estado_registro: "completo",
        medicamentos: medicamentos,
        ordenes_examen: ordenesExamen,
      };

      const response = await fetch("/api/medico/consultas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Consulta guardada correctamente");
        // Limpiar formulario
        setFormularioConsulta({
          motivo_consulta: "",
          anamnesis: "",
          examen_fisico: "",
          diagnostico_principal: "",
          codigo_cie10: "",
          plan_tratamiento: "",
          observaciones: "",
          tipo_atencion: "consulta",
          es_ges: false,
          es_cronica: false,
          proximo_control: "",
        });
        setMedicamentos([]);
        setOrdenesExamen([]);
        // Recargar datos
        cargarDatosPaciente(pacienteSeleccionado.id_paciente);
      } else {
        alert(data.error || "Error al guardar la consulta");
      }
    } catch (error) {
      console.error("Error al guardar consulta:", error);
      alert("Error al guardar la consulta");
    } finally {
      setGuardandoConsulta(false);
    }
  };

  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      {
        nombre: "",
        dosis: "",
        via: "oral",
        frecuencia: "",
        duracion: "",
        indicaciones: "",
      },
    ]);
  };

  const agregarOrdenExamen = () => {
    setOrdenesExamen([
      ...ordenesExamen,
      {
        tipo_examen: "laboratorio",
        nombre_examen: "",
        indicaciones: "",
        urgente: false,
      },
    ]);
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

  const obtenerColorRiesgo = (riesgo: string | null) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      bajo: isDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-100 text-green-800 border-green-200",
      medio: isDark ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-yellow-100 text-yellow-800 border-yellow-200",
      alto: isDark ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-100 text-orange-800 border-orange-200",
      critico: isDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-100 text-red-800 border-red-200",
    };
    return colores[riesgo || ""] || (isDark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-800 border-gray-200");
  };

  const obtenerColorSeveridad = (severidad: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      leve: isDark ? "text-green-400" : "text-green-600",
      moderada: isDark ? "text-yellow-400" : "text-yellow-600",
      severa: isDark ? "text-orange-400" : "text-orange-600",
      fatal: isDark ? "text-red-400" : "text-red-600",
      critica: isDark ? "text-red-400" : "text-red-600",
    };
    return colores[severidad] || (isDark ? "text-gray-400" : "text-gray-600");
  };

  // ========================================
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}>
          <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Acceso No Autorizado</h2>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - MÓDULO DE CONSULTAS
  // ========================================

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* SIDEBAR IZQUIERDO */}
      <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${sidebarAbierto ? "w-20" : "w-0"} ${tema.colores.sidebar} ${tema.colores.borde} border-r`}>
        {sidebarAbierto && (
          <div className="flex flex-col h-full items-center py-6 gap-4">
            <Link href="/medico" className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}>
              <Stethoscope className="w-6 h-6 text-white" />
            </Link>

            <div className="flex-1 flex flex-col gap-2 w-full px-2">
              <Link href="/medico" className={`w-full h-12 rounded-xl flex items-center justify-center ${tema.colores.hover}`}>
                <Home className={`w-6 h-6 ${tema.colores.texto}`} />
              </Link>
              <Link href="/medico/agenda" className={`w-full h-12 rounded-xl flex items-center justify-center ${tema.colores.hover}`}>
                <Calendar className={`w-6 h-6 ${tema.colores.texto}`} />
              </Link>
              <Link href="/medico/pacientes" className={`w-full h-12 rounded-xl flex items-center justify-center ${tema.colores.hover}`}>
                <Users className={`w-6 h-6 ${tema.colores.texto}`} />
              </Link>
              <Link href="/medico/consultas" className={`w-full h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${tema.colores.gradiente}`}>
                <Stethoscope className="w-6 h-6 text-white" />
              </Link>
            </div>

            <button onClick={cerrarSesion} className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-red-500/20">
              <LogOut className="w-6 h-6 text-red-400" />
            </button>
          </div>
        )}
      </aside>

      {/* HEADER */}
      <header className={`fixed top-0 right-0 z-40 transition-all duration-300 ${sidebarAbierto ? "left-20" : "left-0"} ${tema.colores.header} ${tema.colores.borde} border-b`}>
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-black ${tema.colores.texto}`}>
              <Clipboard className="w-8 h-8 inline-block mr-2" />
              Consulta Médica
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => guardarConsulta()} disabled={guardandoConsulta} className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold ${guardandoConsulta ? "opacity-50" : ""}`}>
              {guardandoConsulta ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {guardandoConsulta ? "Guardando..." : "Guardar Consulta"}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className={`transition-all duration-300 ${sidebarAbierto ? "ml-20" : "ml-0"} pt-24`}>
        <div className="flex h-[calc(100vh-6rem)]">
          
          {/* PANEL IZQUIERDO - LISTA DE PACIENTES */}
          <div className={`transition-all duration-300 ${panelLateralAbierto ? "w-96" : "w-0"} overflow-hidden`}>
            <div className={`h-full ${tema.colores.card} ${tema.colores.borde} border-r p-6 overflow-y-auto`}>
              <div className="mb-6">
                <h3 className={`text-lg font-black ${tema.colores.texto} mb-4`}>Pacientes Recientes</h3>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={busquedaPaciente}
                    onChange={(e) => {
                      setBusquedaPaciente(e.target.value);
                      buscarPacientes(e.target.value);
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {pacientes.map((paciente) => (
                  <div
                    key={paciente.id_paciente}
                    onClick={() => setPacienteSeleccionado(paciente)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      pacienteSeleccionado?.id_paciente === paciente.id_paciente
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.hover} ${tema.colores.borde} border`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${pacienteSeleccionado?.id_paciente === paciente.id_paciente ? "bg-white/20" : `bg-gradient-to-br ${tema.colores.gradiente}`} flex items-center justify-center text-white font-bold shadow`}>
                        {paciente.foto_url ? (
                          <Image src={paciente.foto_url} alt={paciente.nombre_completo} width={48} height={48} className="rounded-xl" />
                        ) : (
                          `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate ${pacienteSeleccionado?.id_paciente === paciente.id_paciente ? "text-white" : tema.colores.texto}`}>
                          {paciente.nombre_completo}
                        </p>
                        <p className={`text-sm truncate ${pacienteSeleccionado?.id_paciente === paciente.id_paciente ? "text-white/80" : tema.colores.textoSecundario}`}>
                          {paciente.edad} años · {paciente.genero}
                        </p>
                      </div>
                      {paciente.es_vip && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL CENTRAL - CONSULTA */}
          <div className="flex-1 overflow-y-auto p-6">
            {!pacienteSeleccionado ? (
              <div className={`h-full flex items-center justify-center ${tema.colores.card} ${tema.colores.borde} border rounded-2xl`}>
                <div className="text-center">
                  <User className={`w-24 h-24 ${tema.colores.textoSecundario} mx-auto mb-4`} />
                  <h3 className={`text-2xl font-black ${tema.colores.texto} mb-2`}>Seleccione un Paciente</h3>
                  <p className={`${tema.colores.textoSecundario}`}>Seleccione un paciente de la lista para comenzar la consulta</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* TABS DE CONSULTA */}
                <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-2`}>
                  <div className="flex gap-2 overflow-x-auto">
                    <button
                      onClick={() => setTabConsulta("anamnesis")}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        tabConsulta === "anamnesis" ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      Anamnesis
                    </button>
                    <button
                      onClick={() => setTabConsulta("examen")}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        tabConsulta === "examen" ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <Activity className="w-5 h-5" />
                      Examen Físico
                    </button>
                    <button
                      onClick={() => setTabConsulta("diagnostico")}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        tabConsulta === "diagnostico" ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <Clipboard className="w-5 h-5" />
                      Diagnóstico
                    </button>
                    <button
                      onClick={() => setTabConsulta("receta")}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        tabConsulta === "receta" ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <Pill className="w-5 h-5" />
                      Receta
                    </button>
                    <button
                      onClick={() => setTabConsulta("orden")}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        tabConsulta === "orden" ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <TestTube className="w-5 h-5" />
                      Órdenes
                    </button>
                    <button
                      onClick={() => setTabConsulta("notas")}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        tabConsulta === "notas" ? `bg-gradient-to-r ${tema.colores.gradiente} text-white` : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      Notas
                    </button>
                  </div>
                </div>

                {/* CONTENIDO DE TABS */}
                <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-8`}>
                  {/* TAB ANAMNESIS */}
                  {tabConsulta === "anamnesis" && (
                    <div className="space-y-6">
                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Motivo de Consulta *</label>
                        <textarea
                          value={formularioConsulta.motivo_consulta}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, motivo_consulta: e.target.value })}
                          rows={3}
                          placeholder="Describa el motivo principal de la consulta..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Anamnesis</label>
                        <textarea
                          value={formularioConsulta.anamnesis}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, anamnesis: e.target.value })}
                          rows={10}
                          placeholder="Historia de la enfermedad actual, antecedentes relevantes..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Tipo de Atención</label>
                          <select
                            value={formularioConsulta.tipo_atencion}
                            onChange={(e) => setFormularioConsulta({ ...formularioConsulta, tipo_atencion: e.target.value as any })}
                            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                          >
                            <option value="consulta">Consulta</option>
                            <option value="control">Control</option>
                            <option value="urgencia">Urgencia</option>
                            <option value="procedimiento">Procedimiento</option>
                            <option value="telemedicina">Telemedicina</option>
                          </select>
                        </div>

                        <div>
                          <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Próximo Control</label>
                          <input
                            type="date"
                            value={formularioConsulta.proximo_control}
                            onChange={(e) => setFormularioConsulta({ ...formularioConsulta, proximo_control: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <label className={`flex items-center gap-2 cursor-pointer`}>
                          <input
                            type="checkbox"
                            checked={formularioConsulta.es_ges}
                            onChange={(e) => setFormularioConsulta({ ...formularioConsulta, es_ges: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>Patología GES</span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer`}>
                          <input
                            type="checkbox"
                            checked={formularioConsulta.es_cronica}
                            onChange={(e) => setFormularioConsulta({ ...formularioConsulta, es_cronica: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>Condición Crónica</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB EXAMEN FÍSICO */}
                  {tabConsulta === "examen" && (
                    <div className="space-y-6">
                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Examen Físico</label>
                        <textarea
                          value={formularioConsulta.examen_fisico}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, examen_fisico: e.target.value })}
                          rows={15}
                          placeholder="Descripción detallada del examen físico..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB DIAGNÓSTICO */}
                  {tabConsulta === "diagnostico" && (
                    <div className="space-y-6">
                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Diagnóstico Principal</label>
                        <input
                          type="text"
                          value={formularioConsulta.diagnostico_principal}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, diagnostico_principal: e.target.value })}
                          placeholder="Diagnóstico principal..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Código CIE-10</label>
                        <input
                          type="text"
                          value={formularioConsulta.codigo_cie10}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, codigo_cie10: e.target.value })}
                          placeholder="Ej: J06.9"
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Plan de Tratamiento</label>
                        <textarea
                          value={formularioConsulta.plan_tratamiento}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, plan_tratamiento: e.target.value })}
                          rows={8}
                          placeholder="Descripción del plan de tratamiento..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB RECETA */}
                  {tabConsulta === "receta" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-xl font-black ${tema.colores.texto}`}>Receta Médica</h3>
                        <button onClick={agregarMedicamento} className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold`}>
                          <Plus className="w-5 h-5" />
                          Agregar Medicamento
                        </button>
                      </div>

                      {medicamentos.length === 0 ? (
                        <div className="text-center py-12">
                          <Pill className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4`} />
                          <p className={`${tema.colores.textoSecundario}`}>No hay medicamentos agregados</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {medicamentos.map((med, index) => (
                            <div key={index} className={`p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Medicamento</label>
                                  <input
                                    type="text"
                                    value={med.nombre}
                                    onChange={(e) => {
                                      const newMeds = [...medicamentos];
                                      newMeds[index].nombre = e.target.value;
                                      setMedicamentos(newMeds);
                                    }}
                                    placeholder="Nombre del medicamento..."
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Dosis</label>
                                  <input
                                    type="text"
                                    value={med.dosis}
                                    onChange={(e) => {
                                      const newMeds = [...medicamentos];
                                      newMeds[index].dosis = e.target.value;
                                      setMedicamentos(newMeds);
                                    }}
                                    placeholder="Ej: 500mg"
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Vía</label>
                                  <select
                                    value={med.via}
                                    onChange={(e) => {
                                      const newMeds = [...medicamentos];
                                      newMeds[index].via = e.target.value;
                                      setMedicamentos(newMeds);
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  >
                                    <option value="oral">Oral</option>
                                    <option value="sublingual">Sublingual</option>
                                    <option value="intravenosa">Intravenosa</option>
                                    <option value="intramuscular">Intramuscular</option>
                                    <option value="subcutanea">Subcutánea</option>
                                    <option value="topica">Tópica</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Frecuencia</label>
                                  <input
                                    type="text"
                                    value={med.frecuencia}
                                    onChange={(e) => {
                                      const newMeds = [...medicamentos];
                                      newMeds[index].frecuencia = e.target.value;
                                      setMedicamentos(newMeds);
                                    }}
                                    placeholder="Ej: Cada 8 horas"
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Duración</label>
                                  <input
                                    type="text"
                                    value={med.duracion}
                                    onChange={(e) => {
                                      const newMeds = [...medicamentos];
                                      newMeds[index].duracion = e.target.value;
                                      setMedicamentos(newMeds);
                                    }}
                                    placeholder="Ej: 7 días"
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Indicaciones</label>
                                <textarea
                                  value={med.indicaciones}
                                  onChange={(e) => {
                                    const newMeds = [...medicamentos];
                                    newMeds[index].indicaciones = e.target.value;
                                    setMedicamentos(newMeds);
                                  }}
                                  rows={2}
                                  placeholder="Indicaciones especiales..."
                                  className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                                />
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => setMedicamentos(medicamentos.filter((_, i) => i !== index))}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30"
                                >
                                  <X className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB ÓRDENES */}
                  {tabConsulta === "orden" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-xl font-black ${tema.colores.texto}`}>Órdenes de Examen</h3>
                        <button onClick={agregarOrdenExamen} className={`flex items-center gap-2 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-bold`}>
                          <Plus className="w-5 h-5" />
                          Agregar Orden
                        </button>
                      </div>

                      {ordenesExamen.length === 0 ? (
                        <div className="text-center py-12">
                          <TestTube className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4`} />
                          <p className={`${tema.colores.textoSecundario}`}>No hay órdenes de examen</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ordenesExamen.map((orden, index) => (
                            <div key={index} className={`p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Tipo de Examen</label>
                                  <select
                                    value={orden.tipo_examen}
                                    onChange={(e) => {
                                      const newOrdenes = [...ordenesExamen];
                                      newOrdenes[index].tipo_examen = e.target.value;
                                      setOrdenesExamen(newOrdenes);
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  >
                                    <option value="laboratorio">Laboratorio</option>
                                    <option value="imagenologia">Imagenología</option>
                                    <option value="endoscopia">Endoscopia</option>
                                    <option value="cardiologia">Cardiología</option>
                                    <option value="otros">Otros</option>
                                  </select>
                                </div>
                                <div>
                                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Nombre del Examen</label>
                                  <input
                                    type="text"
                                    value={orden.nombre_examen}
                                    onChange={(e) => {
                                      const newOrdenes = [...ordenesExamen];
                                      newOrdenes[index].nombre_examen = e.target.value;
                                      setOrdenesExamen(newOrdenes);
                                    }}
                                    placeholder="Ej: Hemograma completo"
                                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Indicaciones</label>
                                <textarea
                                  value={orden.indicaciones}
                                  onChange={(e) => {
                                    const newOrdenes = [...ordenesExamen];
                                    newOrdenes[index].indicaciones = e.target.value;
                                    setOrdenesExamen(newOrdenes);
                                  }}
                                  rows={2}
                                  placeholder="Indicaciones para el examen..."
                                  className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={orden.urgente}
                                    onChange={(e) => {
                                      const newOrdenes = [...ordenesExamen];
                                      newOrdenes[index].urgente = e.target.checked;
                                      setOrdenesExamen(newOrdenes);
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                  <span className={`text-sm font-bold ${tema.colores.texto}`}>Urgente</span>
                                </label>

                                <button
                                  onClick={() => setOrdenesExamen(ordenesExamen.filter((_, i) => i !== index))}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30"
                                >
                                  <X className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB NOTAS */}
                  {tabConsulta === "notas" && (
                    <div className="space-y-6">
                      <div>
                        <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Notas y Observaciones</label>
                        <textarea
                          value={formularioConsulta.observaciones}
                          onChange={(e) => setFormularioConsulta({ ...formularioConsulta, observaciones: e.target.value })}
                          rows={15}
                          placeholder="Notas adicionales, observaciones importantes..."
                          className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO - INFORMACIÓN DEL PACIENTE */}
          {pacienteSeleccionado && (
            <div className="w-96 overflow-y-auto p-6 space-y-6">
              {/* CARD PACIENTE */}
              <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-6`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                    {pacienteSeleccionado.foto_url ? (
                      <Image src={pacienteSeleccionado.foto_url} alt={pacienteSeleccionado.nombre_completo} width={80} height={80} className="rounded-xl" />
                    ) : (
                      `${pacienteSeleccionado.nombre[0]}${pacienteSeleccionado.apellido_paterno[0]}`
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-black ${tema.colores.texto} mb-1`}>{pacienteSeleccionado.nombre_completo}</h3>
                    <p className={`text-sm ${tema.colores.textoSecundario}`}>
                      {pacienteSeleccionado.edad} años · {pacienteSeleccionado.genero}
                    </p>
                  </div>
                  {pacienteSeleccionado.es_vip && (
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplet className={`w-4 h-4 ${tema.colores.acento}`} />
                    <span className={`text-sm font-semibold ${tema.colores.texto}`}>Grupo: {pacienteSeleccionado.grupo_sanguineo}</span>
                  </div>
                  {pacienteSeleccionado.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className={`w-4 h-4 ${tema.colores.acento}`} />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>{pacienteSeleccionado.telefono}</span>
                    </div>
                  )}
                  {pacienteSeleccionado.email && (
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${tema.colores.acento}`} />
                      <span className={`text-sm font-semibold ${tema.colores.texto} truncate`}>{pacienteSeleccionado.email}</span>
                    </div>
                  )}
                  {pacienteSeleccionado.clasificacion_riesgo && (
                    <div className={`px-3 py-2 rounded-xl border ${obtenerColorRiesgo(pacienteSeleccionado.clasificacion_riesgo)}`}>
                      <span className="text-sm font-bold">Riesgo: {pacienteSeleccionado.clasificacion_riesgo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SIGNOS VITALES RECIENTES */}
              {signosVitales.length > 0 && (
                <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-6`}>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                    <Activity className="w-5 h-5" />
                    Signos Vitales
                  </h4>
                  <div className="space-y-3">
                    {signosVitales[0].presion_sistolica && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>Presión Arterial</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>
                          {signosVitales[0].presion_sistolica}/{signosVitales[0].presion_diastolica} mmHg
                        </span>
                      </div>
                    )}
                    {signosVitales[0].pulso && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>Pulso</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>{signosVitales[0].pulso} lpm</span>
                      </div>
                    )}
                    {signosVitales[0].temperatura && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>Temperatura</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>{signosVitales[0].temperatura} °C</span>
                      </div>
                    )}
                    {signosVitales[0].saturacion_oxigeno && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>Saturación O₂</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>{signosVitales[0].saturacion_oxigeno}%</span>
                      </div>
                    )}
                    {signosVitales[0].peso && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>Peso</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>{signosVitales[0].peso} kg</span>
                      </div>
                    )}
                    {signosVitales[0].imc && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${tema.colores.textoSecundario}`}>IMC</span>
                        <span className={`text-sm font-bold ${tema.colores.texto}`}>{signosVitales[0].imc}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ALERGIAS */}
              {alergias.length > 0 && (
                <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-6`}>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Alergias
                  </h4>
                  <div className="space-y-3">
                    {alergias.map((alergia) => (
                      <div key={alergia.id_alergia} className={`p-3 rounded-xl border ${alergia.severidad === "fatal" || alergia.severidad === "severa" ? "border-red-500 bg-red-500/10" : "border-yellow-500 bg-yellow-500/10"}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>{alergia.alergeno}</span>
                          <span className={`text-xs font-bold ${obtenerColorSeveridad(alergia.severidad)}`}>{alergia.severidad.toUpperCase()}</span>
                        </div>
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>{alergia.reaccion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONDICIONES CRÓNICAS */}
              {condicionesCronicas.length > 0 && (
                <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-6`}>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                    <Heart className="w-5 h-5 text-orange-500" />
                    Condiciones Crónicas
                  </h4>
                  <div className="space-y-3">
                    {condicionesCronicas.map((condicion) => (
                      <div key={condicion.id_condicion} className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>{condicion.nombre_condicion}</span>
                          <span className={`text-xs font-bold ${obtenerColorSeveridad(condicion.severidad || "")}`}>{condicion.estado}</span>
                        </div>
                        {condicion.codigo_cie10 && (
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>CIE-10: {condicion.codigo_cie10}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HISTORIAL RECIENTE */}
              {historialClinico.length > 0 && (
                <div className={`${tema.colores.card} ${tema.colores.borde} border rounded-2xl p-6`}>
                  <h4 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                    <History className="w-5 h-5" />
                    Historial Reciente
                  </h4>
                  <div className="space-y-3">
                    {historialClinico.slice(0, 5).map((hist) => (
                      <div key={hist.id_historial} className={`p-3 rounded-xl ${tema.colores.secundario}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-bold ${tema.colores.texto}`}>{hist.motivo_consulta}</span>
                          <span className={`text-xs ${tema.colores.textoSecundario}`}>
                            {new Date(hist.fecha_atencion).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        {hist.diagnostico_principal && (
                          <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>{hist.diagnostico_principal}</p>
                        )}
                        <p className={`text-xs ${tema.colores.textoSecundario}`}>Dr. {hist.medico_nombre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}