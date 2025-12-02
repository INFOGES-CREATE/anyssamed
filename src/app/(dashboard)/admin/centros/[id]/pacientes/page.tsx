"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Heart,
  Activity,
  TrendingUp,
  AlertCircle,
  X,
  Grid,
  List,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  MoreVertical,
  User,
  Cake,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  AlertTriangle,
  Info,
  Save,
  BarChart3,
  PieChart,
  Zap,
  Target,
  Building,
  GraduationCap,
  Star,
} from "lucide-react";

// ============================================================================
// FUNCIONES DE UTILIDAD (MOVER ARRIBA)
// ============================================================================

const calcularEdad = (fechaNacimiento: string): number => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
};


// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  estado: "activo" | "inactivo" | "suspendido";
  fecha_registro: string;
  total_consultas: number;
  ultima_consulta: string;
  genero?: string;
  ciudad?: string;
  direccion?: string;
  foto_perfil_url?: string;
  numero_emergencia?: string;
  alergias?: string;
  condiciones_medicas?: string;
  medicamentos?: string;
  fecha_actualizacion?: string;
}

interface Estadisticas {
  total: number;
  activos: number;
  inactivos: number;
  suspendidos: number;
  consultas_totales: number;
  edad_promedio: number;
  nuevos_este_mes: number;
  genero_masculino: number;
  genero_femenino: number;
}

interface FiltrosAvanzados {
  busqueda: string;
  estado: string;
  edad_min: number;
  edad_max: number;
  genero: string;
  ordenarPor: string;
  ordenDireccion: "asc" | "desc";
}

type VistaDisplay = "tabla" | "tarjetas";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PacientesCentroPage() {
  const params = useParams();
  const router = useRouter();

  // Estados principales
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<VistaDisplay>("tarjetas");

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({
    busqueda: "",
    estado: "todos",
    edad_min: 0,
    edad_max: 120,
    genero: "todos",
    ordenarPor: "fecha_registro",
    ordenDireccion: "desc",
  });

  // Estados de modales
  const [modalVerPaciente, setModalVerPaciente] = useState<Paciente | null>(null);
  const [modalEditarPaciente, setModalEditarPaciente] = useState<Paciente | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Paciente | null>(null);
  const [modalEstadisticas, setModalEstadisticas] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);

  // Estados de edición
  const [formEditando, setFormEditando] = useState<Partial<Paciente>>({});
  const [erroresFormulario, setErroresFormulario] = useState<Record<string, string>>({});

  // Estados de UI
  const [procesando, setProcesando] = useState(false);
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState<number[]>([]);
  const [expandirFiltros, setExpandirFiltros] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    tipo: "success" | "error" | "info" | "warning";
    mensaje: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/centros/${params.id}/pacientes?page=${page}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setPacientes(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || data.data.length);
        mostrarNotificacion("success", "Pacientes cargados exitosamente");
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
  }, [params.id, page]);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  // ============================================================================
  // CALCULAR ESTADÍSTICAS
  // ============================================================================

  const estadisticas = useMemo<Estadisticas>(() => {
    return {
      total: pacientes.length,
      activos: pacientes.filter((p) => p.estado === "activo").length,
      inactivos: pacientes.filter((p) => p.estado === "inactivo").length,
      suspendidos: pacientes.filter((p) => p.estado === "suspendido").length,
      consultas_totales: pacientes.reduce((sum, p) => sum + p.total_consultas, 0),
      edad_promedio: Math.round(
        pacientes.reduce((sum, p) => sum + calcularEdad(p.fecha_nacimiento), 0) /
          (pacientes.length || 1)
      ),
      nuevos_este_mes: pacientes.filter((p) => {
        const registro = new Date(p.fecha_registro);
        const hoy = new Date();
        return (
          registro.getMonth() === hoy.getMonth() &&
          registro.getFullYear() === hoy.getFullYear()
        );
      }).length,
      genero_masculino: pacientes.filter((p) => p.genero === "M").length,
      genero_femenino: pacientes.filter((p) => p.genero === "F").length,
    };
  }, [pacientes]);

  // ============================================================================
  // FILTRADO Y ORDENAMIENTO
  // ============================================================================

  const pacientesFiltrados = useMemo(() => {
    let resultado = [...pacientes];

    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`
            .toLowerCase()
            .includes(busquedaLower) ||
          p.rut.toLowerCase().includes(busquedaLower) ||
          p.email.toLowerCase().includes(busquedaLower) ||
          p.telefono?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtros.estado !== "todos") {
      resultado = resultado.filter((p) => p.estado === filtros.estado);
    }

    if (filtros.genero !== "todos") {
      resultado = resultado.filter((p) => p.genero === filtros.genero);
    }

    resultado = resultado.filter((p) => {
      const edad = calcularEdad(p.fecha_nacimiento);
      return edad >= filtros.edad_min && edad <= filtros.edad_max;
    });

    resultado.sort((a, b) => {
      let valorA: any = a[filtros.ordenarPor as keyof Paciente];
      let valorB: any = b[filtros.ordenarPor as keyof Paciente];

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
  }, [pacientes, filtros]);

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

  const toggleSeleccionPaciente = (id: number) => {
    setPacientesSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const seleccionarTodos = () => {
    if (pacientesSeleccionados.length === pacientesFiltrados.length) {
      setPacientesSeleccionados([]);
    } else {
      setPacientesSeleccionados(pacientesFiltrados.map((p) => p.id_paciente));
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos",
      edad_min: 0,
      edad_max: 120,
      genero: "todos",
      ordenarPor: "fecha_registro",
      ordenDireccion: "desc",
    });
    mostrarNotificacion("info", "Filtros limpiados");
  };

  // ============================================================================
  // FUNCIONES DE EDICIÓN
  // ============================================================================

  const abrirModalEditar = (paciente: Paciente) => {
    setFormEditando({ ...paciente });
    setErroresFormulario({});
    setModalEditarPaciente(paciente);
  };

  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};

    if (!formEditando.nombre?.trim()) {
      errores.nombre = "El nombre es requerido";
    }

    if (!formEditando.apellido_paterno?.trim()) {
      errores.apellido_paterno = "El apellido paterno es requerido";
    }

    if (!formEditando.rut?.trim()) {
      errores.rut = "El RUT es requerido";
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
        `/api/admin/pacientes/${formEditando.id_paciente}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formEditando),
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarPacientes();
        setModalEditarPaciente(null);
        setFormEditando({});
        mostrarNotificacion("success", "Paciente actualizado exitosamente");
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

  const handleVerPaciente = (paciente: Paciente) => {
    setModalVerPaciente(paciente);
  };

  const handleEliminarPaciente = async () => {
    if (!modalEliminar) return;

    try {
      setProcesando(true);
      const response = await fetch(
        `/api/admin/pacientes/${modalEliminar.id_paciente}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarPacientes();
        setModalEliminar(null);
        mostrarNotificacion("success", "Paciente eliminado exitosamente");
      } else {
        mostrarNotificacion("error", `Error: ${data.error}`);
      }
    } catch (err: any) {
      mostrarNotificacion("error", `Error al eliminar: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================================================

  const exportarCSV = () => {
    try {
      const headers = [
        "ID",
        "Nombre",
        "Apellido Paterno",
        "Apellido Materno",
        "RUT",
        "Email",
        "Teléfono",
        "Edad",
        "Género",
        "Estado",
        "Total Consultas",
        "Última Consulta",
        "Fecha Registro",
      ];

      const rows = pacientesFiltrados.map((p) => [
        p.id_paciente,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.rut,
        p.email,
        p.telefono || "",
        calcularEdad(p.fecha_nacimiento),
        p.genero || "",
        p.estado,
        p.total_consultas,
        p.ultima_consulta
          ? new Date(p.ultima_consulta).toLocaleDateString("es-CL")
          : "Sin consultas",
        new Date(p.fecha_registro).toLocaleDateString("es-CL"),
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
        `pacientes_centro_${params.id}_${new Date().toISOString().split("T")[0]}.csv`
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
        <title>Reporte de Pacientes - Centro ${params.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #059669; color: white; }
          tr:nth-child(even) { background: #f9fafb; }
          .activo { color: #059669; font-weight: bold; }
          .inactivo { color: #6b7280; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>📋 Reporte de Pacientes - Centro ${params.id}</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-CL")}</p>
        <p><strong>Total pacientes:</strong> ${pacientesFiltrados.length}</p>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RUT</th>
              <th>Email</th>
              <th>Edad</th>
              <th>Estado</th>
              <th>Consultas</th>
            </tr>
          </thead>
          <tbody>
            ${pacientesFiltrados
              .map(
                (p) => `
              <tr>
                <td>${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}</td>
                <td>${p.rut}</td>
                <td>${p.email}</td>
                <td>${calcularEdad(p.fecha_nacimiento)}</td>
                <td class="${p.estado}">${p.estado.toUpperCase()}</td>
                <td>${p.total_consultas}</td>
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
    };

    const iconos = {
      activo: <CheckCircle className="w-4 h-4" />,
      inactivo: <XCircle className="w-4 h-4" />,
      suspendido: <AlertCircle className="w-4 h-4" />,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 flex items-center justify-center relative overflow-hidden">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
        `}</style>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
          <div
            className="absolute w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Users className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <div className="mb-6">
            <RefreshCw className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-pulse">
            Cargando Pacientes
          </h2>
          <p className="text-lg text-gray-600 font-semibold">
            Obteniendo información de los pacientes...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 p-6 relative overflow-hidden">
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
        <div className="absolute w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl top-0 left-0 animate-float"></div>
        <div
          className="absolute w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-3xl bottom-0 right-0 animate-float"
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
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-bold transition-all duration-300 hover:translate-x-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b-2 border-transparent group-hover:border-blue-600">
              Volver al Centro
            </span>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 rounded-2xl shadow-2xl shadow-blue-500/50 animate-gradient">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  Pacientes del Centro
                  <span className="text-2xl px-4 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 rounded-full font-bold border-2 border-blue-200">
                    {estadisticas.total}
                  </span>
                </h1>
                <p className="text-gray-600 font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {pacientesFiltrados.length} de {pacientes.length} pacientes • Centro #{params.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarPacientes}
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
                disabled={pacientesFiltrados.length === 0}
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
          {/* Total Pacientes */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Total Pacientes</p>
            <p className="text-4xl font-black text-gray-900">{estadisticas.total}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Base de datos completa</p>
          </div>

          {/* Pacientes Activos */}
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

          {/* Consultas Totales */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Consultas Totales</p>
            <p className="text-4xl font-black text-purple-600">{estadisticas.consultas_totales}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Historial completo</p>
          </div>

          {/* Nuevos Este Mes */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Nuevos Este Mes</p>
            <p className="text-4xl font-black text-orange-600">{estadisticas.nuevos_este_mes}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Registros recientes</p>
          </div>

          {/* Edad Promedio */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-pink-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl">
                <Cake className="w-8 h-8 text-pink-600" />
              </div>
              <Target className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Edad Promedio</p>
            <p className="text-4xl font-black text-pink-600">{estadisticas.edad_promedio}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Años</p>
          </div>

          {/* Género */}
          <div className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                <Heart className="w-8 h-8 text-indigo-600" />
              </div>
              <PieChart className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-1">Género</p>
            <p className="text-sm font-black text-indigo-600">
              👨 {estadisticas.genero_masculino} • 👩 {estadisticas.genero_femenino}
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-2">Distribución</p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="glassmorphism p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex flex-col gap-4">
            {/* Primera fila */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT, email o teléfono..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 font-semibold"
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
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold bg-white"
                >
                  <option value="todos">📋 Todos los estados</option>
                  <option value="activo">✅ Activos</option>
                  <option value="inactivo">⚠️ Inactivos</option>
                  <option value="suspendido">🚫 Suspendidos</option>
                </select>

                <button
                  onClick={() => setExpandirFiltros(!expandirFiltros)}
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {expandirFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {(filtros.busqueda || filtros.estado !== "todos" || filtros.genero !== "todos") && (
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">👥 Género</label>
                  <select
                    value={filtros.genero}
                    onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="todos">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🎂 Edad Mínima</label>
                  <input
                    type="number"
                    value={filtros.edad_min}
                    onChange={(e) => setFiltros({ ...filtros, edad_min: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                    min="0"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🎂 Edad Máxima</label>
                  <input
                    type="number"
                    value={filtros.edad_max}
                    onChange={(e) => setFiltros({ ...filtros, edad_max: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                    min="0"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📊 Ordenar Por</label>
                  <select
                    value={filtros.ordenarPor}
                    onChange={(e) => setFiltros({ ...filtros, ordenarPor: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold bg-white"
                  >
                    <option value="fecha_registro">Fecha Registro</option>
                    <option value="nombre">Nombre</option>
                    <option value="total_consultas">Consultas</option>
                    <option value="ultima_consulta">Última Consulta</option>
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
                    ? "bg-blue-600 text-white shadow-lg"
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
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
                Tarjetas
              </button>
            </div>

            {pacientesSeleccionados.length > 0 && (
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold border-2 border-blue-300">
                {pacientesSeleccionados.length} seleccionado(s)
              </div>
            )}
          </div>
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
            {pacientesFiltrados.map((paciente, index) => (
              <div
                key={paciente.id_paciente}
                className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header con checkbox y estado */}
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={pacientesSeleccionados.includes(paciente.id_paciente)}
                    onChange={() => toggleSeleccionPaciente(paciente.id_paciente)}
                    className="w-5 h-5 rounded border-2 border-gray-300"
                  />
                  <EstadoBadge estado={paciente.estado} />
                </div>

                {/* Avatar y nombre */}
                <div className="text-center mb-4">
                  <div className="relative inline-block mb-3">
                    {paciente.foto_perfil_url ? (
                      <img
                        src={paciente.foto_perfil_url}
                        alt={paciente.nombre}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto">
                        {paciente.nombre.charAt(0)}
                        {paciente.apellido_paterno.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-1">
                    {paciente.nombre} {paciente.apellido_paterno}
                  </h3>
                  <p className="text-sm text-gray-600 font-bold">
                    {paciente.rut}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    ID: {paciente.id_paciente}
                  </p>
                </div>

                {/* Información clave */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Cake className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 font-semibold">
                      {calcularEdad(paciente.fecha_nacimiento)} años
                    </span>
                  </div>
                  {paciente.genero && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-bold">
                        {paciente.genero === "M" ? "Masculino" : "Femenino"}
                      </span>
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-bold truncate">{paciente.email}</span>
                    </div>
                  )}
                  {paciente.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-bold">{paciente.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-black text-blue-600">
                        {paciente.total_consultas}
                      </p>
                      <p className="text-xs text-gray-600 font-semibold">Consultas</p>
                    </div>
                    <div>
                      <p className="text-sm font-black text-cyan-600">
                        {paciente.ultima_consulta
                          ? new Date(paciente.ultima_consulta).toLocaleDateString("es-CL")
                          : "Sin"}
                      </p>
                      <p className="text-xs text-gray-600 font-semibold">Última</p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerPaciente(paciente)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => abrirModalEditar(paciente)}
                    className="flex-1 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-105"
                  >
                    <FileText className="w-4 h-4" />
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
                <thead className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-5 text-left">
                      <input
                        type="checkbox"
                        checked={
                          pacientesSeleccionados.length === pacientesFiltrados.length &&
                          pacientesFiltrados.length > 0
                        }
                        onChange={seleccionarTodos}
                        className="w-5 h-5 rounded border-2 border-white"
                      />
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      RUT
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Consultas
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-black uppercase tracking-wider">
                      Última Consulta
                    </th>
                    <th className="px-6 py-5 text-right text-sm font-black uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/95 backdrop-blur-xl divide-y divide-gray-200">
                  {pacientesFiltrados.map((paciente, index) => (
                    <tr
                      key={paciente.id_paciente}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={pacientesSeleccionados.includes(paciente.id_paciente)}
                          onChange={() => toggleSeleccionPaciente(paciente.id_paciente)}
                          className="w-5 h-5 rounded border-2 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {paciente.foto_perfil_url ? (
                              <img
                                src={paciente.foto_perfil_url}
                                alt={paciente.nombre}
                                className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-xl"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-xl">
                                {paciente.nombre.charAt(0)}
                                {paciente.apellido_paterno.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-base font-black text-gray-900">
                              {paciente.nombre} {paciente.apellido_paterno}{" "}
                              {paciente.apellido_materno}
                            </div>
                            <div className="text-xs text-gray-500 font-bold mt-1">
                              ID: {paciente.id_paciente}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-900">
                          {paciente.rut}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {paciente.email}
                        </div>
                        {paciente.telefono && (
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {paciente.telefono}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-bold">
                          {calcularEdad(paciente.fecha_nacimiento)} años
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <EstadoBadge estado={paciente.estado} />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-semibold text-blue-600">
                          {paciente.total_consultas}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                        {paciente.ultima_consulta
                          ? new Date(paciente.ultima_consulta).toLocaleDateString("es-CL")
                          : "Sin consultas"}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerPaciente(paciente)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all hover:scale-110 font-bold"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => abrirModalEditar(paciente)}
                            className="p-2 text-cyan-600 hover:text-cyan-900 hover:bg-cyan-100 rounded-lg transition-all hover:scale-110 font-bold"
                            title="Editar"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setModalEliminar(paciente)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all hover:scale-110 font-bold"
                            title="Eliminar"
                          >
                            <AlertTriangle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                                     </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pacientesFiltrados.length === 0 && (
              <div className="text-center py-20 px-6">
                <div className="mb-6 flex justify-center">
                  <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl">
                    <Users className="w-20 h-20 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3">
                  No se encontraron pacientes
                </h3>
                <p className="text-gray-600 font-bold text-lg mb-6">
                  Intenta ajustar los filtros de búsqueda o crear nuevos registros
                </p>
                <button
                  onClick={limpiarFiltros}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all font-bold flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {pacientesFiltrados.length === 0 && vistaActual === "tarjetas" && (
          <div className="text-center py-20 px-6">
            <div className="mb-6 flex justify-center">
              <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl">
                <Users className="w-20 h-20 text-gray-400" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              No se encontraron pacientes
            </h3>
            <p className="text-gray-600 font-bold text-lg mb-6">
              Intenta ajustar los filtros de búsqueda o crear nuevos registros
            </p>
            <button
              onClick={limpiarFiltros}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all font-bold flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && pacientesFiltrados.length > 0 && (
          <div className="mt-8 glassmorphism p-6 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-6">
            <div className="text-sm text-gray-600 font-bold">
              Mostrando <span className="text-blue-600 font-black">{pacientesFiltrados.length}</span> de{" "}
              <span className="text-blue-600 font-black">{total}</span> pacientes • Página{" "}
              <span className="text-blue-600 font-black">{page}</span> de{" "}
              <span className="text-blue-600 font-black">{totalPages}</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold transition-all hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>

              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border-2 border-blue-300">
                <span className="text-sm font-black text-gray-600">Página</span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-black text-lg shadow-lg">
                  {page}
                </span>
                <span className="text-sm font-black text-gray-600">de {totalPages}</span>
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold transition-all hover:scale-105"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================================ */}
      {/* MODAL: VER PACIENTE */}
      {/* ============================================================================ */}

      {modalVerPaciente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white p-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">
                    {modalVerPaciente.nombre} {modalVerPaciente.apellido_paterno}
                  </h2>
                  <p className="text-sm font-bold opacity-90">ID: {modalVerPaciente.id_paciente}</p>
                </div>
              </div>
              <button
                onClick={() => setModalVerPaciente(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Estado y Datos Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                  <p className="text-sm text-gray-600 font-bold mb-2">Estado</p>
                  <EstadoBadge estado={modalVerPaciente.estado} />
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                  <p className="text-sm text-gray-600 font-bold mb-2">Edad</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {calcularEdad(modalVerPaciente.fecha_nacimiento)} años
                  </p>
                </div>
              </div>

              {/* Información Personal */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-purple-600" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">RUT</p>
                    <p className="text-lg font-black text-gray-900">{modalVerPaciente.rut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">Género</p>
                    <p className="text-lg font-black text-gray-900">
                      {modalVerPaciente.genero === "M" ? "👨 Masculino" : "👩 Femenino"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">Fecha Nacimiento</p>
                    <p className="text-lg font-black text-gray-900">
                      {new Date(modalVerPaciente.fecha_nacimiento).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">Apellido Materno</p>
                    <p className="text-lg font-black text-gray-900">
                      {modalVerPaciente.apellido_materno}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-orange-600" />
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Email</p>
                      <p className="text-lg font-black text-gray-900">{modalVerPaciente.email}</p>
                    </div>
                  </div>
                  {modalVerPaciente.telefono && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <Phone className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Teléfono</p>
                        <p className="text-lg font-black text-gray-900">
                          {modalVerPaciente.telefono}
                        </p>
                      </div>
                    </div>
                  )}
                  {modalVerPaciente.numero_emergencia && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-red-300">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Teléfono Emergencia</p>
                        <p className="text-lg font-black text-red-600">
                          {modalVerPaciente.numero_emergencia}
                        </p>
                      </div>
                    </div>
                  )}
                  {modalVerPaciente.ciudad && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Ciudad</p>
                        <p className="text-lg font-black text-gray-900">
                          {modalVerPaciente.ciudad}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Médica */}
              {(modalVerPaciente.alergias ||
                modalVerPaciente.condiciones_medicas ||
                modalVerPaciente.medicamentos) && (
                <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    Información Médica
                  </h3>
                  <div className="space-y-3">
                    {modalVerPaciente.alergias && (
                      <div className="p-3 bg-white rounded-xl border-l-4 border-red-600">
                        <p className="text-xs text-gray-600 font-bold mb-1">⚠️ Alergias</p>
                        <p className="text-sm font-bold text-gray-900">
                          {modalVerPaciente.alergias}
                        </p>
                      </div>
                    )}
                    {modalVerPaciente.condiciones_medicas && (
                      <div className="p-3 bg-white rounded-xl border-l-4 border-orange-600">
                        <p className="text-xs text-gray-600 font-bold mb-1">🏥 Condiciones Médicas</p>
                        <p className="text-sm font-bold text-gray-900">
                          {modalVerPaciente.condiciones_medicas}
                        </p>
                      </div>
                    )}
                    {modalVerPaciente.medicamentos && (
                      <div className="p-3 bg-white rounded-xl border-l-4 border-blue-600">
                        <p className="text-xs text-gray-600 font-bold mb-1">💊 Medicamentos</p>
                        <p className="text-sm font-bold text-gray-900">
                          {modalVerPaciente.medicamentos}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estadísticas de Consultas */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border-2 border-indigo-200">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-indigo-600" />
                  Estadísticas de Consultas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl text-center border-2 border-indigo-200">
                    <p className="text-3xl font-black text-indigo-600">
                      {modalVerPaciente.total_consultas}
                    </p>
                    <p className="text-xs text-gray-600 font-bold mt-2">Total Consultas</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl text-center border-2 border-blue-200">
                    <p className="text-2xl font-black text-blue-600">
                      {modalVerPaciente.ultima_consulta
                        ? new Date(modalVerPaciente.ultima_consulta).toLocaleDateString("es-CL")
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 font-bold mt-2">Última Consulta</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl text-center border-2 border-cyan-200">
                    <p className="text-2xl font-black text-cyan-600">
                      {new Date(modalVerPaciente.fecha_registro).toLocaleDateString("es-CL")}
                    </p>
                    <p className="text-xs text-gray-600 font-bold mt-2">Fecha Registro</p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="p-4 bg-gray-100 rounded-xl border-2 border-gray-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Registrado:
                  </span>
                  <span className="font-black text-gray-900">
                    {new Date(modalVerPaciente.fecha_registro).toLocaleString("es-CL")}
                  </span>
                </div>
                {modalVerPaciente.fecha_actualizacion && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600 font-bold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Actualizado:
                    </span>
                    <span className="font-black text-gray-900">
                      {new Date(modalVerPaciente.fecha_actualizacion).toLocaleString("es-CL")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-6 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setModalVerPaciente(null)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold transition-all hover:scale-105"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setModalVerPaciente(null);
                  abrirModalEditar(modalVerPaciente);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Editar Paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: EDITAR PACIENTE */}
      {/* ============================================================================ */}

      {modalEditarPaciente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Editar Paciente</h2>
                  <p className="text-sm font-bold opacity-90">
                    {modalEditarPaciente.nombre} {modalEditarPaciente.apellido_paterno}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalEditarPaciente(null);
                  setFormEditando({});
                  setErroresFormulario({});
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Información Personal */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <h3 className="text-xl font-black text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      👤 Nombre *
                    </label>
                    <input
                      type="text"
                      value={formEditando.nombre || ""}
                      onChange={(e) => setFormEditando({ ...formEditando, nombre: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 transition-all font-bold ${
                        erroresFormulario.nombre
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {erroresFormulario.nombre && (
                      <p className="text-red-600 text-xs font-bold mt-1">
                        {erroresFormulario.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      👤 Apellido Paterno *
                    </label>
                    <input
                      type="text"
                      value={formEditando.apellido_paterno || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, apellido_paterno: e.target.value })
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 transition-all font-bold ${
                        erroresFormulario.apellido_paterno
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {erroresFormulario.apellido_paterno && (
                      <p className="text-red-600 text-xs font-bold mt-1">
                        {erroresFormulario.apellido_paterno}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      👤 Apellido Materno
                    </label>
                    <input
                      type="text"
                      value={formEditando.apellido_materno || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, apellido_materno: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🆔 RUT *
                    </label>
                    <input
                      type="text"
                      value={formEditando.rut || ""}
                      onChange={(e) => setFormEditando({ ...formEditando, rut: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 transition-all font-bold ${
                        erroresFormulario.rut
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {erroresFormulario.rut && (
                      <p className="text-red-600 text-xs font-bold mt-1">{erroresFormulario.rut}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🎂 Fecha Nacimiento
                    </label>
                    <input
                      type="date"
                      value={
                        formEditando.fecha_nacimiento
                          ? formEditando.fecha_nacimiento.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, fecha_nacimiento: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      👥 Género
                    </label>
                    <select
                      value={formEditando.genero || ""}
                      onChange={(e) => setFormEditando({ ...formEditando, genero: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-bold bg-white"
                    >
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200">
                <h3 className="text-xl font-black text-gray-900 mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📧 Email *
                    </label>
                    <input
                      type="email"
                      value={formEditando.email || ""}
                      onChange={(e) => setFormEditando({ ...formEditando, email: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-200 transition-all font-bold ${
                        erroresFormulario.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-orange-500"
                      }`}
                    />
                    {erroresFormulario.email && (
                      <p className="text-red-600 text-xs font-bold mt-1">
                        {erroresFormulario.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📱 Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formEditando.telefono || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, telefono: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🚨 Teléfono Emergencia
                    </label>
                    <input
                      type="tel"
                      value={formEditando.numero_emergencia || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, numero_emergencia: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📍 Ciudad
                    </label>
                    <input
                      type="text"
                      value={formEditando.ciudad || ""}
                      onChange={(e) => setFormEditando({ ...formEditando, ciudad: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🏠 Dirección
                    </label>
                    <input
                      type="text"
                      value={formEditando.direccion || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, direccion: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <h3 className="text-xl font-black text-gray-900 mb-4">Información Médica</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ⚠️ Alergias
                    </label>
                    <textarea
                      value={formEditando.alergias || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, alergias: e.target.value })
                      }
                      placeholder="Ej: Penicilina, Mariscos..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all font-bold"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🏥 Condiciones Médicas
                    </label>
                    <textarea
                      value={formEditando.condiciones_medicas || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, condiciones_medicas: e.target.value })
                      }
                      placeholder="Ej: Diabetes, Hipertensión..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all font-bold"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      💊 Medicamentos
                    </label>
                    <textarea
                      value={formEditando.medicamentos || ""}
                      onChange={(e) =>
                        setFormEditando({ ...formEditando, medicamentos: e.target.value })
                      }
                      placeholder="Ej: Metformina 500mg, Atorvastatina 20mg..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all font-bold"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <h3 className="text-xl font-black text-gray-900 mb-4">Estado del Paciente</h3>
                <select
                  value={formEditando.estado || "activo"}
                  onChange={(e) => setFormEditando({ ...formEditando, estado: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all font-bold bg-white"
                >
                  <option value="activo">✅ Activo</option>
                  <option value="inactivo">⚠️ Inactivo</option>
                  <option value="suspendido">🚫 Suspendido</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-6 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => {
                  setModalEditarPaciente(null);
                  setFormEditando({});
                  setErroresFormulario({});
                }}
                disabled={procesando}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold transition-all hover:scale-105 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={procesando}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-xl font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
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
      )}

      {/* ============================================================================ */}
      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {/* ============================================================================ */}

      {modalEliminar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl shadow-2xl max-w-md w-full animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black">Eliminar Paciente</h2>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                <p className="text-gray-900 font-bold text-lg mb-4">
                  ¿Estás seguro de que deseas eliminar a este paciente?
                </p>
                <div className="p-4 bg-white rounded-xl border-l-4 border-red-600">
                  <p className="text-sm text-gray-600 font-bold mb-1">Paciente a eliminar:</p>
                  <p className="text-lg font-black text-gray-900">
                    {modalEliminar.nombre} {modalEliminar.apellido_paterno}
                  </p>
                  <p className="text-sm text-gray-500 font-bold mt-2">
                    RUT: {modalEliminar.rut}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-xl">
                <p className="text-sm text-yellow-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t-2 border-gray-200 p-6 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setModalEliminar(null)}
                disabled={procesando}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold transition-all hover:scale-105 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarPaciente}
                disabled={procesando}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:shadow-xl font-bold transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                {procesando ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Eliminar Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: ESTADÍSTICAS */}
      {/* ============================================================================ */}

      {modalEstadisticas && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black">Estadísticas Detalladas</h2>
              </div>
              <button
                onClick={() => setModalEstadisticas(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 font-bold mb-1">Total Pacientes</p>
                  <p className="text-4xl font-black text-blue-600">{estadisticas.total}</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl border-2 border-emerald-300">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                    <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-600 font-bold mb-1">Pacientes Activos</p>
                  <p className="text-4xl font-black text-emerald-600">{estadisticas.activos}</p>
                  <p className="text-xs text-gray-600 font-bold mt-2">
                    {((estadisticas.activos / estadisticas.total) * 100).toFixed(1)}% del total
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl border-2 border-orange-300">
                  <div className="flex items-center justify-between mb-3">
                    <XCircle className="w-8 h-8 text-orange-600" />
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-600 font-bold mb-1">Pacientes Inactivos</p>
                  <p className="text-4xl font-black text-orange-600">{estadisticas.inactivos}</p>
                  <p className="text-xs text-gray-600 font-bold mt-2">
                    {((estadisticas.inactivos / estadisticas.total) * 100).toFixed(1)}% del total
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl border-2 border-red-300">
                  <div className="flex items-center justify-between mb-3">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-600 font-bold mb-1">Pacientes Suspendidos</p>
                  <p className="text-4xl font-black text-red-600">{estadisticas.suspendidos}</p>
                  <p className="text-xs text-gray-600 font-bold mt-2">
                    {((estadisticas.suspendidos / estadisticas.total) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>

              {/* Estadísticas de Consultas */}
              <div className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl border-2 border-purple-300">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  Estadísticas de Consultas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
                    <p className="text-xs text-gray-600 font-bold mb-2">Total de Consultas</p>
                    <p className="text-3xl font-black text-purple-600">
                      {estadisticas.consultas_totales}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-indigo-200">
                    <p className="text-xs text-gray-600 font-bold mb-2">Promedio por Paciente</p>
                    <p className="text-3xl font-black text-indigo-600">
                      {(estadisticas.consultas_totales / (estadisticas.total || 1)).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Demográfica */}
              <div className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl border-2 border-pink-300">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                  Información Demográfica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-pink-200 text-center">
                    <p className="text-xs text-gray-600 font-bold mb-2">Edad Promedio</p>
                    <p className="text-3xl font-black text-pink-600">
                      {estadisticas.edad_promedio}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-2">años</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-blue-200 text-center">
                    <p className="text-xs text-gray-600 font-bold mb-2">Masculino</p>
                    <p className="text-3xl font-black text-blue-600">
                      {estadisticas.genero_masculino}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-2">
                      {((estadisticas.genero_masculino / estadisticas.total) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border-2 border-rose-200 text-center">
                    <p className="text-xs text-gray-600 font-bold mb-2">Femenino</p>
                    <p className="text-3xl font-black text-rose-600">
                      {estadisticas.genero_femenino}
                    </p>
                    <p className="text-xs text-gray-500 font-bold mt-2">
                      {((estadisticas.genero_femenino / estadisticas.total) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Nuevos Registros */}
              <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                  Registros Recientes
                </h3>
                <div className="p-4 bg-white rounded-xl border-2 border-green-200">
                  <p className="text-sm text-gray-600 font-bold mb-2">Nuevos pacientes este mes</p>
                  <p className="text-4xl font-black text-green-600">
                    {estadisticas.nuevos_este_mes}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-6 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setModalEstadisticas(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold transition-all hover:scale-105"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: EXPORTAR */}
      {/* ============================================================================ */}

      {modalExportar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glassmorphism rounded-3xl shadow-2xl max-w-md w-full animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Download className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black">Exportar Datos</h2>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-8 space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-gray-600 font-bold mb-3">
                  Selecciona el formato para exportar {pacientesFiltrados.length} pacientes:
                </p>
              </div>

              <button
                onClick={() => {
                  exportarCSV();
                  setModalExportar(false);
                }}
                className="w-full p-4 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-3 font-bold text-gray-900"
              >
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-black">Descargar CSV</p>
                  <p className="text-xs text-gray-600">Compatible con Excel</p>
                </div>
              </button>

              <button
                onClick={() => {
                  imprimirReporte();
                  setModalExportar(false);
                }}
                className="w-full p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-3 font-bold text-gray-900"
              >
                <Printer className="w-6 h-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-black">Imprimir Reporte</p>
                  <p className="text-xs text-gray-600">Formato PDF</p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t-2 border-gray-200 p-6 flex gap-3 justify-end rounded-b-3xl">
              <button
                onClick={() => setModalExportar(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-bold transition-all hover:scale-105"
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

