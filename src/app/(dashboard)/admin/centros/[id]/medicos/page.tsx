"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Award,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  X,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Users,
  Clock,
  Video,
  FileText,
  Shield,
  AlertCircle,
  Activity,
  Heart,
  Building,
  Zap,
  Target,
  BarChart3,
  PieChart,
  TrendingDown,
  Info,
  Grid,
  List,
  MoreVertical,
  Lock,
  Unlock,
  CheckCheck,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Home,
  DollarSign,
  Percent,
  Save,
  AlertCircle as AlertIcon,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Medico {
  id_medico: number;
  id_usuario?: number;
  id_centro?: number;
  id_sucursal?: number;
  id_centro_principal?: number;
  id_especialidad_principal?: number;
  numero_registro_medico?: string;
  especialidad_principal: string;
  titulo_profesional?: string;
  universidad?: string;
  ano_graduacion?: number;
  biografia?: string;
  acepta_nuevos_pacientes: boolean;
  atiende_particular: boolean;
  atiende_fonasa: boolean;
  atiende_isapre: boolean;
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  verificado_por_admin: boolean;
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;
  firma_digital: boolean;
  requiere_revision_credenciales: boolean;
  firma_digital_url?: string;
  duracion_consulta_min: number;
  anos_experiencia: number;
  calificacion_promedio: number;
  numero_opiniones: number;
  fecha_inicio_actividad?: string;
  fecha_actualizacion: string;
  fecha_creacion: string;
  
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  foto_perfil_url?: string;
  
  total_consultas?: number;
  consultas_mes?: number;
  pacientes_atendidos?: number;
}

interface Estadisticas {
  total: number;
  activos: number;
  inactivos: number;
  suspendidos: number;
  vacaciones: number;
  verificados: number;
  telemedicina: number;
  particular: number;
  fonasa: number;
  isapre: number;
  nuevos_pacientes: number;
  consultas_totales: number;
  consultas_mes: number;
  experiencia_promedio: number;
  calificacion_promedio: number;
}

interface FiltrosAvanzados {
  busqueda: string;
  estado: string;
  especialidad: string;
  atiende: string;
  modalidad: string;
  experiencia_min: number;
  calificacion_min: number;
  acepta_nuevos: boolean | null;
  verificado: boolean | null;
  ordenarPor: string;
  ordenDireccion: "asc" | "desc";
}

type VistaDisplay = "tabla" | "tarjetas";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function MedicosCentroPremiumPage() {
  const params = useParams();
  const router = useRouter();

  // Estados principales
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaDisplay>("tarjetas");

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({
    busqueda: "",
    estado: "todos",
    especialidad: "todas",
    atiende: "todos",
    modalidad: "todas",
    experiencia_min: 0,
    calificacion_min: 0,
    acepta_nuevos: null,
    verificado: null,
    ordenarPor: "calificacion_promedio",
    ordenDireccion: "desc",
  });

  // Estados de modales
  const [modalVerMedico, setModalVerMedico] = useState<Medico | null>(null);
  const [modalEditarMedico, setModalEditarMedico] = useState<Medico | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Medico | null>(null);
  const [modalEstadisticas, setModalEstadisticas] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);

  // Estados de edición
  const [formEditando, setFormEditando] = useState<Partial<Medico>>({});
  const [erroresFormulario, setErroresFormulario] = useState<Record<string, string>>({});

  // Estados de UI
  const [procesando, setProcesando] = useState(false);
  const [medicosSeleccionados, setMedicosSeleccionados] = useState<number[]>([]);
  const [expandirFiltros, setExpandirFiltros] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    tipo: "success" | "error" | "info" | "warning";
    mensaje: string;
  } | null>(null);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const cargarMedicos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/centros/${params.id}/medicos`);
      const data = await response.json();

      if (data.success) {
        setMedicos(data.data);
        mostrarNotificacion("success", "Médicos cargados exitosamente");
      } else {
        setError(data.error);
        mostrarNotificacion("error", data.error);
      }
    } catch (err: any) {
      setError(err.message);
      mostrarNotificacion("error", `Error al cargar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    cargarMedicos();
  }, [cargarMedicos]);

  // ============================================================================
  // CALCULAR ESTADÍSTICAS
  // ============================================================================

  const estadisticas = useMemo<Estadisticas>(() => {
    return {
      total: medicos.length,
      activos: medicos.filter((m) => m.estado === "activo").length,
      inactivos: medicos.filter((m) => m.estado === "inactivo").length,
      suspendidos: medicos.filter((m) => m.estado === "suspendido").length,
      vacaciones: medicos.filter((m) => m.estado === "vacaciones").length,
      verificados: medicos.filter((m) => m.verificado_por_admin).length,
      telemedicina: medicos.filter((m) => m.consulta_telemedicina).length,
      particular: medicos.filter((m) => m.atiende_particular).length,
      fonasa: medicos.filter((m) => m.atiende_fonasa).length,
      isapre: medicos.filter((m) => m.atiende_isapre).length,
      nuevos_pacientes: medicos.filter((m) => m.acepta_nuevos_pacientes).length,
      consultas_totales: medicos.reduce((sum, m) => sum + (m.total_consultas || 0), 0),
      consultas_mes: medicos.reduce((sum, m) => sum + (m.consultas_mes || 0), 0),
      experiencia_promedio:
        medicos.length > 0
          ? Math.round(
              medicos.reduce((sum, m) => sum + m.anos_experiencia, 0) / medicos.length
            )
          : 0,
      calificacion_promedio:
        medicos.length > 0
          ? parseFloat(
              (
                medicos.reduce((sum, m) => sum + m.calificacion_promedio, 0) /
                medicos.length
              ).toFixed(2)
            )
          : 0,
    };
  }, [medicos]);

  // ============================================================================
  // FILTRADO Y ORDENAMIENTO
  // ============================================================================

  const medicosFiltrados = useMemo(() => {
    let resultado = [...medicos];

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (m) =>
          m.nombre_completo?.toLowerCase().includes(busquedaLower) ||
          m.numero_registro_medico?.toLowerCase().includes(busquedaLower) ||
          m.especialidad_principal.toLowerCase().includes(busquedaLower) ||
          m.email?.toLowerCase().includes(busquedaLower) ||
          m.universidad?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtros.estado !== "todos") {
      resultado = resultado.filter((m) => m.estado === filtros.estado);
    }

    if (filtros.especialidad !== "todas") {
      resultado = resultado.filter(
        (m) => m.especialidad_principal === filtros.especialidad
      );
    }

    if (filtros.atiende !== "todos") {
      resultado = resultado.filter((m) => {
        switch (filtros.atiende) {
          case "particular":
            return m.atiende_particular;
          case "fonasa":
            return m.atiende_fonasa;
          case "isapre":
            return m.atiende_isapre;
          default:
            return true;
        }
      });
    }

    if (filtros.modalidad !== "todas") {
      resultado = resultado.filter((m) => {
        switch (filtros.modalidad) {
          case "presencial":
            return m.consulta_presencial;
          case "telemedicina":
            return m.consulta_telemedicina;
          default:
            return true;
        }
      });
    }

    if (filtros.experiencia_min > 0) {
      resultado = resultado.filter((m) => m.anos_experiencia >= filtros.experiencia_min);
    }

    if (filtros.calificacion_min > 0) {
      resultado = resultado.filter(
        (m) => m.calificacion_promedio >= filtros.calificacion_min
      );
    }

    if (filtros.acepta_nuevos !== null) {
      resultado = resultado.filter(
        (m) => m.acepta_nuevos_pacientes === filtros.acepta_nuevos
      );
    }

    if (filtros.verificado !== null) {
      resultado = resultado.filter((m) => m.verificado_por_admin === filtros.verificado);
    }

    resultado.sort((a, b) => {
      let valorA: any = a[filtros.ordenarPor as keyof Medico];
      let valorB: any = b[filtros.ordenarPor as keyof Medico];

      if (filtros.ordenarPor.includes("fecha")) {
        valorA = new Date(valorA || 0).getTime();
        valorB = new Date(valorB || 0).getTime();
      }

      if (typeof valorA === "string") {
        valorA = valorA.toLowerCase();
        valorB = valorB?.toLowerCase() || "";
      }

      if (filtros.ordenDireccion === "asc") {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return resultado;
  }, [medicos, filtros]);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "info" | "warning",
    mensaje: string
  ) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 5000);
  };

  const toggleSeleccionMedico = (id: number) => {
    setMedicosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (medicosSeleccionados.length === medicosFiltrados.length) {
      setMedicosSeleccionados([]);
    } else {
      setMedicosSeleccionados(medicosFiltrados.map((m) => m.id_medico));
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos",
      especialidad: "todas",
      atiende: "todos",
      modalidad: "todas",
      experiencia_min: 0,
      calificacion_min: 0,
      acepta_nuevos: null,
      verificado: null,
      ordenarPor: "calificacion_promedio",
      ordenDireccion: "desc",
    });
    mostrarNotificacion("info", "Filtros limpiados");
  };

  // ============================================================================
  // FUNCIONES DE EDICIÓN
  // ============================================================================

  const abrirModalEditar = (medico: Medico) => {
    setFormEditando({ ...medico });
    setErroresFormulario({});
    setModalEditarMedico(medico);
  };

  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};

    if (!formEditando.nombre_completo?.trim()) {
      errores.nombre_completo = "El nombre es requerido";
    }

    if (!formEditando.especialidad_principal?.trim()) {
      errores.especialidad_principal = "La especialidad es requerida";
    }

    if (formEditando.anos_experiencia !== undefined && formEditando.anos_experiencia < 0) {
      errores.anos_experiencia = "Los años de experiencia no pueden ser negativos";
    }

    if (formEditando.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEditando.email)) {
      errores.email = "Email inválido";
    }

    setErroresFormulario(errores);
    return Object.keys(errores).length === 0;
  };

  const guardarEdicion = async () => {
    if (!validarFormulario()) {
      mostrarNotificacion("error", "Por favor completa los campos requeridos");
      return;
    }

    try {
      setProcesando(true);
      const response = await fetch(
        `/api/admin/medicos/${formEditando.id_medico}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formEditando),
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarMedicos();
        setModalEditarMedico(null);
        setFormEditando({});
        mostrarNotificacion("success", "Médico actualizado exitosamente");
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error al guardar: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  // ============================================================================
  // FUNCIONES DE ACCIONES
  // ============================================================================

  const handleVerMedico = (medico: Medico) => {
    setModalVerMedico(medico);
  };

  const handleEliminarMedico = async () => {
    if (!modalEliminar) return;

    try {
      setProcesando(true);
      const response = await fetch(`/api/admin/medicos/${modalEliminar.id_medico}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await cargarMedicos();
        setModalEliminar(null);
        mostrarNotificacion("success", "Médico eliminado exitosamente");
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error al eliminar: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleCambiarEstado = async (medico: Medico, nuevoEstado: string) => {
    try {
      setProcesando(true);
      const response = await fetch(`/api/admin/medicos/${medico.id_medico}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        await cargarMedicos();
        mostrarNotificacion("success", `Estado cambiado a ${nuevoEstado}`);
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleNuevoMedico = () => {
    router.push(`/admin/centros/${params.id}/medicos/nuevo`);
  };

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================================================

  const exportarCSV = () => {
    try {
      const headers = [
        "ID",
        "Nombre",
        "Registro Médico",
        "Especialidad",
        "Email",
        "Estado",
        "Años Experiencia",
        "Calificación",
        "Particular",
        "FONASA",
        "ISAPRE",
        "Telemedicina",
      ];

      const rows = medicosFiltrados.map((m) => [
        m.id_medico,
        m.nombre_completo || "",
        m.numero_registro_medico || "",
        m.especialidad_principal,
        m.email || "",
        m.estado,
        m.anos_experiencia,
        m.calificacion_promedio,
        m.atiende_particular ? "Sí" : "No",
        m.atiende_fonasa ? "Sí" : "No",
        m.atiende_isapre ? "Sí" : "No",
        m.consulta_telemedicina ? "Sí" : "No",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `medicos_centro_${params.id}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      mostrarNotificacion("success", "Archivo CSV descargado");
    } catch (err: any) {
      mostrarNotificacion("error", `Error al exportar: ${err.message}`);
    }
  };

  const imprimirReporte = () => {
    const ventana = window.open("", "_blank");
    if (!ventana) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Médicos - Centro ${params.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #059669; color: white; }
          tr:nth-child(even) { background: #f9fafb; }
          .activo { color: #059669; font-weight: bold; }
          .inactivo { color: #6b7280; font-weight: bold; }
          .suspendido { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>📋 Reporte de Médicos - Centro ${params.id}</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-CL")}</p>
        <p><strong>Total médicos:</strong> ${medicosFiltrados.length}</p>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Experiencia</th>
              <th>Calificación</th>
            </tr>
          </thead>
          <tbody>
            ${medicosFiltrados
              .map(
                (m) => `
              <tr>
                <td>${m.nombre_completo || "N/A"}</td>
                <td>${m.especialidad_principal}</td>
                <td>${m.numero_registro_medico || "N/A"}</td>
                <td class="${m.estado}">${m.estado.toUpperCase()}</td>
                <td>${m.anos_experiencia} años</td>
                <td>⭐ ${m.calificacion_promedio.toFixed(1)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🖨️ Imprimir
          </button>
        </div>
      </body>
      </html>
    `;

    ventana.document.write(html);
    ventana.document.close();
    mostrarNotificacion("success", "Reporte generado");
  };

  // ============================================================================
  // COMPONENTES DE UI
  // ============================================================================

  const EstadoBadge = ({ estado }: { estado: string }) => {
    const estilos = {
      activo: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300",
      inactivo: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300",
      suspendido: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300",
      vacaciones: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300",
    };

    const iconos = {
      activo: <CheckCircle className="w-4 h-4" />,
      inactivo: <XCircle className="w-4 h-4" />,
      suspendido: <AlertCircle className="w-4 h-4" />,
      vacaciones: <Calendar className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border-2 transition-all duration-300 hover:scale-105 shadow-lg ${
          estilos[estado as keyof typeof estilos]
        }`}
      >
        {iconos[estado as keyof typeof iconos]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center relative overflow-hidden">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
        `}</style>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-green-400/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
          <div
            className="absolute w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Stethoscope className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <div className="mb-6">
            <RefreshCw className="w-16 h-16 animate-spin text-green-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-pulse">
            Cargando Médicos
          </h2>
          <p className="text-lg text-gray-600 font-semibold">
            Obteniendo información del equipo médico...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-6 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.6);
        }
      `}</style>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-green-300/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
        <div
          className="absolute w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/centros/${params.id}`}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-bold transition-all duration-300 hover:translate-x-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b-2 border-transparent group-hover:border-green-600">
              Volver al Centro
            </span>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl shadow-green-500/50 animate-gradient">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  Equipo Médico
                  <span className="text-2xl px-4 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 rounded-full font-bold border-2 border-green-200">
                    {estadisticas.total}
                  </span>
                </h1>
                <p className="text-gray-600 font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {medicosFiltrados.length} de {medicos.length} médicos • Centro #{params.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarMedicos}
                disabled={loading}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 font-bold group"
              >
                <RefreshCw
                  className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </button>

              <button
                onClick={() => setModalExportar(true)}
                disabled={medicosFiltrados.length === 0}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 font-bold"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>

              <button
                onClick={() => setModalEstadisticas(true)}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold"
              >
                <BarChart3 className="w-5 h-5" />
                Estadísticas
              </button>

              <button
                onClick={handleNuevoMedico}
                className="px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold border-2 border-green-400/50 animate-gradient"
              >
                <UserPlus className="w-5 h-5" />
                Nuevo Médico
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {notificacion && (
          <div
            className={`mb-6 p-5 rounded-xl shadow-xl flex items-center gap-3 font-bold animate-slide-in ${
              notificacion.tipo === "success"
                ? "bg-green-100 border-2 border-green-300 text-green-800"
                : notificacion.tipo === "error"
                ? "bg-red-100 border-2 border-red-300 text-red-800"
                : notificacion.tipo === "warning"
                ? "bg-yellow-100 border-2 border-yellow-300 text-yellow-800"
                : "bg-blue-100 border-2 border-blue-300 text-blue-800"
            }`}
          >
            {notificacion.tipo === "success" && <CheckCircle className="w-6 h-6" />}
            {notificacion.tipo === "error" && <XCircle className="w-6 h-6" />}
            {notificacion.tipo === "warning" && <AlertTriangle className="w-6 h-6" />}
            {notificacion.tipo === "info" && <Info className="w-6 h-6" />}
            <span className="flex-1">{notificacion.mensaje}</span>
            <button
              onClick={() => setNotificacion(null)}
              className="p-1 hover:bg-white/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {/* Total Médicos */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <Stethoscope className="w-8 h-8 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Total Médicos</p>
            <p className="text-4xl font-black text-gray-900">{estadisticas.total}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Equipo completo</p>
          </div>

          {/* Médicos Activos */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Activos</p>
            <p className="text-4xl font-black text-emerald-600">{estadisticas.activos}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">
              {((estadisticas.activos / estadisticas.total) * 100).toFixed(0)}% del total
            </p>
          </div>

          {/* Verificados */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <CheckCheck className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Verificados</p>
            <p className="text-4xl font-black text-blue-600">{estadisticas.verificados}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Credenciales validadas</p>
          </div>

          {/* Telemedicina */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Telemedicina</p>
            <p className="text-4xl font-black text-purple-600">{estadisticas.telemedicina}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Consultas virtuales</p>
          </div>

          {/* Experiencia Promedio */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Experiencia</p>
            <p className="text-4xl font-black text-orange-600">{estadisticas.experiencia_promedio}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Años promedio</p>
          </div>

          {/* Calificación */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Calificación</p>
            <p className="text-4xl font-black text-yellow-600">
              {estadisticas.calificacion_promedio.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Promedio de equipo</p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="glassmorphism p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex flex-col gap-4">
            {/* Primera fila */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, registro, especialidad, email..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 font-semibold"
                />
                {filtros.busqueda && (
                  <button
                    onClick={() => setFiltros({ ...filtros, busqueda: "" })}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex gap-3 flex-wrap">
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold bg-white"
                >
                  <option value="todos">📋 Todos los estados</option>
                  <option value="activo">✅ Activos</option>
                  <option value="inactivo">⚠️ Inactivos</option>
                  <option value="suspendido">🚫 Suspendidos</option>
                  <option value="vacaciones">🏖️ De Vacaciones</option>
                </select>

                <button
                  onClick={() => setExpandirFiltros(!expandirFiltros)}
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {expandirFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {(filtros.busqueda || filtros.estado !== "todos" || filtros.especialidad !== "todas") && (
                  <button
                    onClick={limpiarFiltros}
                    className="px-5 py-4 bg-red-100 text-red-700 border-2 border-red-300 rounded-xl hover:bg-red-200 transition-all font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Filtros expandidos */}
            {expandirFiltros && (
              <div className="pt-4 border-t-2 border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🩺 Tipo de Atención</label>
                  <select
                    value={filtros.atiende}
                    onChange={(e) => setFiltros({ ...filtros, atiende: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                  >
                    <option value="todos">Todos</option>
                    <option value="particular">Particular</option>
                    <option value="fonasa">FONASA</option>
                    <option value="isapre">ISAPRE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📹 Modalidad</label>
                  <select
                    value={filtros.modalidad}
                    onChange={(e) => setFiltros({ ...filtros, modalidad: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                  >
                    <option value="todas">Todas</option>
                    <option value="presencial">Presencial</option>
                    <option value="telemedicina">Telemedicina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">⭐ Calificación Mínima</label>
                  <select
                    value={filtros.calificacion_min}
                    onChange={(e) => setFiltros({ ...filtros, calificacion_min: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                  >
                    <option value="0">Todas</option>
                    <option value="3">⭐ 3.0+</option>
                    <option value="4">⭐ 4.0+</option>
                    <option value="4.5">⭐ 4.5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🎓 Experiencia Mínima</label>
                  <select
                    value={filtros.experiencia_min}
                    onChange={(e) => setFiltros({ ...filtros, experiencia_min: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                  >
                    <option value="0">Todos</option>
                    <option value="5">5+ años</option>
                    <option value="10">10+ años</option>
                    <option value="15">15+ años</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selector de Vista y Acciones */}
        <div className="glassmorphism p-4 rounded-2xl shadow-xl mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setVistaActual("tabla")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold ${
                  vistaActual === "tabla"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
                Tabla
              </button>
              <button
                onClick={() => setVistaActual("tarjetas")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold ${
                  vistaActual === "tarjetas"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
                Tarjetas
              </button>
            </div>

            {medicosSeleccionados.length > 0 && (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-bold border-2 border-green-300">
                {medicosSeleccionados.length} seleccionado(s)
              </div>
            )}
          </div>

          {medicosSeleccionados.length > 0 && (
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold">
                Activar
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all font-bold">
                Suspender
              </button>
              <button
                onClick={() => setMedicosSeleccionados([])}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all font-bold"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="glassmorphism p-6 rounded-2xl mb-6 border-l-4 border-red-500 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="font-black text-xl text-red-800">Error al Cargar Datos</p>
                <p className="text-sm text-red-600 font-semibold mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Tarjetas */}
        {vistaActual === "tarjetas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {medicosFiltrados.map((medico, index) => (
              <div
                key={medico.id_medico}
                className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-green-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header con checkbox y estado */}
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={medicosSeleccionados.includes(medico.id_medico)}
                    onChange={() => toggleSeleccionMedico(medico.id_medico)}
                    className="w-5 h-5 rounded border-2 border-gray-300"
                  />
                  <EstadoBadge estado={medico.estado} />
                </div>

                {/* Avatar y nombre */}
                <div className="text-center mb-4">
                  <div className="relative inline-block mb-3">
                    {medico.foto_perfil_url ? (
                      <img
                        src={medico.foto_perfil_url}
                        alt={medico.nombre_completo}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto">
                        {medico.nombre_completo?.split(" ")[0].charAt(0)}
                        {medico.nombre_completo?.split(" ")[1]?.charAt(0) || ""}
                      </div>
                    )}
                    {medico.verificado_por_admin && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <CheckCheck className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">
                    {medico.nombre_completo || "Sin nombre"}
                  </h3>
                  <p className="text-sm text-gray-600 font-bold">
                    {medico.especialidad_principal}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    ID: {medico.id_medico}
                  </p>
                </div>

                {/* Información clave */}
                <div className="space-y-2 mb-4">
                  {medico.numero_registro_medico && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-semibold">
                        Reg: {medico.numero_registro_medico}
                      </span>
                    </div>
                  )}
                  {medico.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-bold truncate">{medico.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-bold">
                      {medico.anos_experiencia} años de experiencia
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-gray-900 font-bold">
                      {Number(medico.calificacion_promedio || 0).toFixed(1)} ({medico.numero_opiniones || 0} opiniones)
                    </span>
                  </div>
                </div>

                {/* Badges de servicios */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {medico.atiende_particular && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                      💵 Particular
                    </span>
                  )}
                  {medico.atiende_fonasa && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                      🏥 FONASA
                    </span>
                  )}
                  {medico.atiende_isapre && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200">
                      🏢 ISAPRE
                    </span>
                  )}
                  {medico.consulta_telemedicina && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200">
                      📹 Tele
                    </span>
                  )}
                </div>

                {/* Estadísticas */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-black text-green-600">
                        {medico.total_consultas || 0}
                      </p>
                      <p className="text-xs text-gray-600 font-semibold">Consultas Totales</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600">
                        {medico.consultas_mes || 0}
                      </p>
                      <p className="text-xs text-gray-600 font-semibold">Este Mes</p>
                    </div>
                  </div>
                </div>

                               {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerMedico(medico)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => abrirModalEditar(medico)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-105"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista de Tabla */}
        {vistaActual === "tabla" && (
          <div className="glassmorphism rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <input
                        type="checkbox"
                        checked={
                          medicosSeleccionados.length === medicosFiltrados.length &&
                          medicosFiltrados.length > 0
                        }
                        onChange={seleccionarTodos}
                        className="w-5 h-5 rounded border-2 border-white"
                      />
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Experiencia
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Calificación
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Servicios
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-5 text-right text-sm font-black uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/95 backdrop-blur-xl divide-y divide-gray-200">
                  {medicosFiltrados.map((medico, index) => (
                    <tr
                      key={medico.id_medico}
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={medicosSeleccionados.includes(medico.id_medico)}
                          onChange={() => toggleSeleccionMedico(medico.id_medico)}
                          className="w-5 h-5 rounded border-2 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {medico.foto_perfil_url ? (
                              <img
                                src={medico.foto_perfil_url}
                                alt={medico.nombre_completo}
                                className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-xl"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-xl">
                                {medico.nombre_completo?.split(" ")[0].charAt(0)}
                                {medico.nombre_completo?.split(" ")[1]?.charAt(0) || ""}
                              </div>
                            )}
                            {medico.verificado_por_admin && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                <CheckCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-base font-black text-gray-900">
                              {medico.nombre_completo || "Sin nombre"}
                            </div>
                            <div className="text-xs text-gray-500 font-bold mt-1">
                              ID: {medico.id_medico}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {medico.especialidad_principal}
                        </div>
                        {medico.titulo_profesional && (
                          <div className="text-xs text-gray-500 font-semibold">
                            {medico.titulo_profesional}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-900">
                          {medico.numero_registro_medico || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-900">
                            {medico.anos_experiencia} años
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-gray-900">
                            {Number(medico.calificacion_promedio || 0).toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            ({medico.numero_opiniones})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {medico.atiende_particular && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded" title="Particular">
                              💵
                            </span>
                          )}
                          {medico.atiende_fonasa && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded" title="FONASA">
                              🏥
                            </span>
                          )}
                          {medico.atiende_isapre && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded" title="ISAPRE">
                              🏢
                            </span>
                          )}
                          {medico.consulta_telemedicina && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded" title="Telemedicina">
                              📹
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <EstadoBadge estado={medico.estado} />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerMedico(medico)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all hover:scale-110 font-bold"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(medico)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all hover:scale-110 font-bold"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setModalEliminar(medico)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all hover:scale-110 font-bold"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Sin resultados */}
              {medicosFiltrados.length === 0 && (
                <div className="text-center py-20 bg-gradient-to-br from-green-50 to-emerald-50">
                  <Stethoscope className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-gray-900 mb-3">
                    No se encontraron médicos
                  </h3>
                  <p className="text-gray-600 font-bold mb-6">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                  <button
                    onClick={handleNuevoMedico}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all hover:scale-105 font-bold inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Agregar Primer Médico
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Ver Detalles */}
      {modalVerMedico && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <Stethoscope className="w-8 h-8 text-green-600" />
                  Perfil del Médico
                </h2>
                <button
                  onClick={() => setModalVerMedico(null)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Avatar y nombre */}
              <div className="flex items-center gap-6 mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                <div className="relative">
                  {modalVerMedico.foto_perfil_url ? (
                    <img
                      src={modalVerMedico.foto_perfil_url}
                      alt={modalVerMedico.nombre_completo}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                      {modalVerMedico.nombre_completo?.split(" ")[0].charAt(0)}
                      {modalVerMedico.nombre_completo?.split(" ")[1]?.charAt(0) || ""}
                    </div>
                  )}
                  {modalVerMedico.verificado_por_admin && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                      <CheckCheck className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-gray-900 mb-2">
                    {modalVerMedico.nombre_completo || "Sin nombre"}
                  </h3>
                  <p className="text-lg text-gray-700 font-bold">
                    {modalVerMedico.especialidad_principal}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <EstadoBadge estado={modalVerMedico.estado} />
                    <span className="px-3 py-1 bg-white rounded-lg text-sm font-bold text-gray-700 shadow">
                      ID: {modalVerMedico.id_medico}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {modalVerMedico.numero_registro_medico && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200">
                    <label className="text-xs font-black text-blue-700 uppercase flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4" />
                      Registro Médico
                    </label>
                    <p className="text-gray-900 font-bold text-lg">
                      {modalVerMedico.numero_registro_medico}
                    </p>
                  </div>
                )}

                {modalVerMedico.email && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200">
                    <label className="text-xs font-black text-purple-700 uppercase flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-gray-900 font-bold text-lg truncate">
                      {modalVerMedico.email}
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border-2 border-orange-200">
                  <label className="text-xs font-black text-orange-700 uppercase flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Experiencia
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    {modalVerMedico.anos_experiencia} años
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-xl border-2 border-yellow-200">
                  <label className="text-xs font-black text-yellow-700 uppercase flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4" />
                    Calificación
                  </label>
                  <p className="text-gray-900 font-bold text-lg">
                    ⭐ {Number(modalVerMedico.calificacion_promedio || 0).toFixed(1)} ({modalVerMedico.numero_opiniones || 0} opiniones)
                  </p>
                </div>

                {modalVerMedico.universidad && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border-2 border-indigo-200">
                    <label className="text-xs font-black text-indigo-700 uppercase flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4" />
                      Universidad
                    </label>
                    <p className="text-gray-900 font-bold text-lg">
                      {modalVerMedico.universidad}
                    </p>
                  </div>
                )}

                {modalVerMedico.ano_graduacion && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-xl border-2 border-teal-200">
                    <label className="text-xs font-black text-teal-700 uppercase flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      Año Graduación
                    </label>
                    <p className="text-gray-900 font-bold text-lg">
                      {modalVerMedico.ano_graduacion}
                    </p>
                  </div>
                )}
              </div>

              {/* Servicios */}
              <div className="mb-8">
                <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  Servicios Disponibles
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl text-center ${modalVerMedico.atiende_particular ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100 border-2 border-gray-200 opacity-50'}`}>
                    <p className="text-2xl mb-2">💵</p>
                    <p className="text-sm font-bold">Particular</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${modalVerMedico.atiende_fonasa ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100 border-2 border-gray-200 opacity-50'}`}>
                    <p className="text-2xl mb-2">🏥</p>
                    <p className="text-sm font-bold">FONASA</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${modalVerMedico.atiende_isapre ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-100 border-2 border-gray-200 opacity-50'}`}>
                    <p className="text-2xl mb-2">🏢</p>
                    <p className="text-sm font-bold">ISAPRE</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${modalVerMedico.consulta_telemedicina ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-gray-100 border-2 border-gray-200 opacity-50'}`}>
                    <p className="text-2xl mb-2">📹</p>
                    <p className="text-sm font-bold">Telemedicina</p>
                  </div>
                </div>
              </div>

              {/* Biografía */}
              {modalVerMedico.biografia && (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <h4 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-gray-600" />
                    Biografía
                  </h4>
                  <p className="text-gray-700 font-semibold leading-relaxed">
                    {modalVerMedico.biografia}
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => setModalVerMedico(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setModalVerMedico(null);
                    abrirModalEditar(modalVerMedico);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Editar Médico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Médico - PREMIUM */}
      {modalEditarMedico && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <Edit className="w-8 h-8 text-green-600" />
                  Editar Médico
                </h2>
                <button
                  onClick={() => {
                    setModalEditarMedico(null);
                    setFormEditando({});
                    setErroresFormulario({});
                  }}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Información básica */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre completo */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="text-red-500">*</span>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formEditando.nombre_completo || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, nombre_completo: e.target.value })
                      }
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-200 transition-all font-bold ${
                        erroresFormulario.nombre_completo
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Ej: Dr. Juan Pérez"
                    />
                    {erroresFormulario.nombre_completo && (
                      <p className="text-red-600 text-sm font-bold mt-2 flex items-center gap-1">
                        <AlertIcon className="w-4 h-4" />
                        {erroresFormulario.nombre_completo}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formEditando.email || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, email: e.target.value })
                      }
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-200 transition-all font-bold ${
                        erroresFormulario.email
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                    {erroresFormulario.email && (
                      <p className="text-red-600 text-sm font-bold mt-2 flex items-center gap-1">
                        <AlertIcon className="w-4 h-4" />
                        {erroresFormulario.email}
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formEditando.telefono || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, telefono: e.target.value })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  {/* Especialidad */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="text-red-500">*</span>
                      Especialidad Principal
                    </label>
                    <input
                      type="text"
                      value={formEditando.especialidad_principal || ""}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          especialidad_principal: e.target.value,
                        })
                      }
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-200 transition-all font-bold ${
                        erroresFormulario.especialidad_principal
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Ej: Cardiología"
                    />
                    {erroresFormulario.especialidad_principal && (
                      <p className="text-red-600 text-sm font-bold mt-2 flex items-center gap-1">
                        <AlertIcon className="w-4 h-4" />
                        {erroresFormulario.especialidad_principal}
                      </p>
                    )}
                  </div>

                  {/* Registro Médico */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Award className="w-4 h-4" />
                      Número de Registro Médico
                    </label>
                    <input
                      type="text"
                      value={formEditando.numero_registro_medico || ""}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          numero_registro_medico: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                      placeholder="Ej: 12345678"
                    />
                  </div>

                  {/* Título Profesional */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      Título Profesional
                    </label>
                    <input
                      type="text"
                      value={formEditando.titulo_profesional || ""}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          titulo_profesional: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                      placeholder="Ej: Médico Cirujano"
                    />
                  </div>

                  {/* Universidad */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Building className="w-4 h-4" />
                      Universidad
                    </label>
                    <input
                      type="text"
                      value={formEditando.universidad || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, universidad: e.target.value })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                      placeholder="Ej: Universidad de Chile"
                    />
                  </div>

                  {/* Año Graduación */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Año de Graduación
                    </label>
                    <input
                      type="number"
                      value={formEditando.ano_graduacion || ""}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          ano_graduacion: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                      placeholder="Ej: 2015"
                    />
                  </div>

                  {/* Años de Experiencia */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Clock className="w-4 h-4" />
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      value={formEditando.anos_experiencia || ""}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          anos_experiencia: parseInt(e.target.value),
                        })
                      }
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-200 transition-all font-bold ${
                        erroresFormulario.anos_experiencia
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-green-500"
                      }`}
                      placeholder="Ej: 10"
                      min="0"
                    />
                    {erroresFormulario.anos_experiencia && (
                      <p className="text-red-600 text-sm font-bold mt-2 flex items-center gap-1">
                        <AlertIcon className="w-4 h-4" />
                        {erroresFormulario.anos_experiencia}
                      </p>
                    )}
                  </div>

                  {/* Duración Consulta */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Clock className="w-4 h-4" />
                      Duración Consulta (min)
                    </label>
                    <input
                      type="number"
                      value={formEditando.duracion_consulta_min || ""}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          duracion_consulta_min: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold"
                      placeholder="Ej: 30"
                      min="5"
                    />
                  </div>

                  {/* Estado */}
                  <div>
<label className="block text-sm font-bold text-gray-700 mb-2">
                      <Activity className="w-4 h-4" />
                      Estado
                    </label>
                    <select
                      value={formEditando.estado || "activo"}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          estado: e.target.value as any,
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold bg-white"
                    >
                      <option value="activo">✅ Activo</option>
                      <option value="inactivo">⚠️ Inactivo</option>
                      <option value="suspendido">🚫 Suspendido</option>
                      <option value="vacaciones">🏖️ De Vacaciones</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  Servicios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Particular */}
                  <label className="flex items-center gap-4 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formEditando.atiende_particular || false}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          atiende_particular: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded border-2 border-blue-300"
                    />
                    <div>
                      <p className="font-black text-gray-900">💵 Atiende Particular</p>
                      <p className="text-sm text-gray-600 font-semibold">Pacientes de pago directo</p>
                    </div>
                  </label>

                  {/* FONASA */}
                  <label className="flex items-center gap-4 p-5 bg-green-50 border-2 border-green-200 rounded-xl cursor-pointer hover:bg-green-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formEditando.atiende_fonasa || false}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          atiende_fonasa: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded border-2 border-green-300"
                    />
                    <div>
                      <p className="font-black text-gray-900">🏥 Atiende FONASA</p>
                      <p className="text-sm text-gray-600 font-semibold">Pacientes FONASA</p>
                    </div>
                  </label>

                  {/* ISAPRE */}
                  <label className="flex items-center gap-4 p-5 bg-purple-50 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formEditando.atiende_isapre || false}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          atiende_isapre: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded border-2 border-purple-300"
                    />
                    <div>
                      <p className="font-black text-gray-900">🏢 Atiende ISAPRE</p>
                      <p className="text-sm text-gray-600 font-semibold">Pacientes ISAPRE</p>
                    </div>
                  </label>

                  {/* Telemedicina */}
                  <label className="flex items-center gap-4 p-5 bg-indigo-50 border-2 border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formEditando.consulta_telemedicina || false}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          consulta_telemedicina: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded border-2 border-indigo-300"
                    />
                    <div>
                      <p className="font-black text-gray-900">📹 Consulta Telemedicina</p>
                      <p className="text-sm text-gray-600 font-semibold">Consultas virtuales</p>
                    </div>
                  </label>

                  {/* Presencial */}
                  <label className="flex items-center gap-4 p-5 bg-orange-50 border-2 border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formEditando.consulta_presencial || false}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          consulta_presencial: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded border-2 border-orange-300"
                    />
                    <div>
                      <p className="font-black text-gray-900">🏥 Consulta Presencial</p>
                      <p className="text-sm text-gray-600 font-semibold">Consultas en clínica</p>
                    </div>
                  </label>

                  {/* Acepta nuevos pacientes */}
                  <label className="flex items-center gap-4 p-5 bg-teal-50 border-2 border-teal-200 rounded-xl cursor-pointer hover:bg-teal-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formEditando.acepta_nuevos_pacientes || false}
                      onChange={(e) =>
                        setFormEditando({
                          ...formEditando,
                          acepta_nuevos_pacientes: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded border-2 border-teal-300"
                    />
                    <div>
                      <p className="font-black text-gray-900">👥 Acepta Nuevos Pacientes</p>
                      <p className="text-sm text-gray-600 font-semibold">Disponible para nuevos</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Biografía */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-gray-600" />
                  Información Adicional
                </h3>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3">
                    Biografía
                  </label>
                  <textarea
                    value={formEditando.biografia || ""}
                    onChange={(e) =>
                      setFormEditando({ ...formEditando, biografia: e.target.value })
                    }
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-semibold"
                    placeholder="Escribe información adicional sobre el médico..."
                    rows={5}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setModalEditarMedico(null);
                    setFormEditando({});
                    setErroresFormulario({});
                  }}
                  disabled={procesando}
                  className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-black text-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicion}
                  disabled={procesando}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center gap-2 font-black text-lg border-2 border-green-400/50"
                >
                  {procesando ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-xl">
                  <AlertTriangle className="w-9 h-9 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Confirmar Eliminación</h2>
                  <p className="text-gray-600 text-sm font-bold">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-2xl mb-6 border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-4 font-bold">
                  ¿Estás seguro de eliminar al médico?
                </p>
                <div className="bg-white p-4 rounded-xl">
                  <p className="font-black text-gray-900 text-xl mb-2">
                    {modalEliminar.nombre_completo || "Sin nombre"}
                  </p>
                  <p className="text-sm text-gray-600 font-bold">
                    {modalEliminar.especialidad_principal}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setModalEliminar(null)}
                  disabled={procesando}
                  className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-black"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarMedico}
                  disabled={procesando}
                  className="flex-1 px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-black"
                >
                  {procesando ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exportar */}
      {modalExportar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Download className="w-8 h-8 text-green-600" />
                  Exportar Datos
                </h2>
                <button
                  onClick={() => setModalExportar(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 font-bold mb-6">
                Selecciona el formato para exportar {medicosFiltrados.length} médico(s):
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    exportarCSV();
                    setModalExportar(false);
                  }}
                  className="w-full p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-xl transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-gray-900 text-lg">CSV</p>
                    <p className="text-sm text-gray-600 font-semibold">Compatible con Excel</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    imprimirReporte();
                    setModalExportar(false);
                  }}
                  className="w-full p-5 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl hover:shadow-xl transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-all">
                    <Printer className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-gray-900 text-lg">Imprimir</p>
                    <p className="text-sm text-gray-600 font-semibold">Reporte en PDF</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setModalExportar(false)}
                className="w-full mt-6 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
