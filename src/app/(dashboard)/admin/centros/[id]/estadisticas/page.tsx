"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Stethoscope,
  UserCheck,
  DollarSign,
  Calendar,
  RefreshCw,
  X,
  Download,
  Printer,
  Activity,
  Heart,
  Target,
  Zap,
  PieChart,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Info,
  FileSpreadsheet,
  Eye,
  MapPin,
  Building,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Estadisticas {
  centro: {
    id_centro: number;
    nombre: string;
    ciudad?: string;
    direccion?: string;
  };
  usuarios: {
    total: number;
    activos: number;
    bloqueados: number;
    crecimiento_mes: number;
  };
  medicos: {
    total: number;
    activos: number;
    especialidades: number;
    crecimiento_mes: number;
  };
  pacientes: {
    total: number;
    activos: number;
    nuevos_mes: number;
    crecimiento_mes: number;
  };
  consultas_mes: Array<{
    mes: string;
    total: number;
  }>;
  ingresos_mes: Array<{
    mes: string;
    ingresos: number;
    facturas: number;
  }>;
  top_especialidades: Array<{
    nombre: string;
    consultas: number;
    porcentaje: number;
  }>;
  resumen_general: {
    consultas_totales: number;
    ingresos_totales: number;
    promedio_consultas_diarias: number;
    tasa_ocupacion: number;
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EstadisticasCentroPage() {
  const params = useParams();

  // Estados principales
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [modalDetalles, setModalDetalles] = useState<string | null>(null);
  const [filtroMeses, setFiltroMeses] = useState(6);
  const [notificacion, setNotificacion] = useState<{
    tipo: "success" | "error" | "info";
    mensaje: string;
  } | null>(null);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/centros/${params.id}/estadisticas`);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
        mostrarNotificacion("success", "Estadísticas cargadas exitosamente");
      } else {
        setError(data.error);
        mostrarNotificacion("error", data.error);
      }
    } catch (err: any) {
      setError(err.message);
      mostrarNotificacion("error", `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, [params.id]);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const mostrarNotificacion = (
    tipo: "success" | "error" | "info",
    mensaje: string
  ) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const toggleExpandCard = (cardId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // ============================================================================
  // CÁLCULOS DERIVADOS
  // ============================================================================

  const estadisticasDerivadas = useMemo(() => {
    if (!estadisticas) return null;

    const consultasPromedio =
      estadisticas.consultas_mes.reduce((sum, c) => sum + c.total, 0) /
      estadisticas.consultas_mes.length;

    const ingresosPromedio =
      estadisticas.ingresos_mes.reduce((sum, i) => sum + i.ingresos, 0) /
      estadisticas.ingresos_mes.length;

    const maxConsultas = Math.max(
      ...estadisticas.consultas_mes.map((c) => c.total)
    );
    const minConsultas = Math.min(
      ...estadisticas.consultas_mes.map((c) => c.total)
    );

    const maxIngresos = Math.max(
      ...estadisticas.ingresos_mes.map((i) => i.ingresos)
    );
    const minIngresos = Math.min(
      ...estadisticas.ingresos_mes.map((i) => i.ingresos)
    );

    return {
      consultasPromedio: Math.round(consultasPromedio),
      ingresosPromedio: Math.round(ingresosPromedio),
      maxConsultas,
      minConsultas,
      maxIngresos,
      minIngresos,
      variacionConsultas: (
        ((estadisticas.consultas_mes[0]?.total - minConsultas) / minConsultas) *
        100
      ).toFixed(1),
      variacionIngresos: (
        ((estadisticas.ingresos_mes[0]?.ingresos - minIngresos) / minIngresos) *
        100
      ).toFixed(1),
    };
  }, [estadisticas]);

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN
  // ============================================================================

  const exportarPDF = () => {
    if (!estadisticas) return;

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estadísticas - ${estadisticas.centro.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f9fafb; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0066cc; padding-bottom: 20px; }
          .header h1 { color: #0066cc; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0 0 0; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section h2 { color: #0066cc; border-left: 4px solid #0066cc; padding-left: 10px; margin-bottom: 15px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
          .card { background: #f0f7ff; border: 2px solid #0066cc; padding: 15px; border-radius: 8px; }
          .card-title { font-size: 12px; color: #666; font-weight: bold; margin-bottom: 5px; }
          .card-value { font-size: 24px; color: #0066cc; font-weight: bold; }
          .card-detail { font-size: 11px; color: #999; margin-top: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #0066cc; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { border-bottom: 1px solid #ddd; padding: 10px; font-size: 11px; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          .print-btn { text-align: center; margin: 20px 0; }
          .print-btn button { padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Estadísticas del Centro Médico</h1>
          <p>${estadisticas.centro.nombre}</p>
          <p>Generado: ${new Date().toLocaleString("es-CL")}</p>
        </div>

        <div class="section">
          <h2>📈 Resumen General</h2>
          <div class="grid">
            <div class="card">
              <div class="card-title">Total de Usuarios</div>
              <div class="card-value">${estadisticas.usuarios.total}</div>
              <div class="card-detail">✓ ${estadisticas.usuarios.activos} activos</div>
            </div>
            <div class="card">
              <div class="card-title">Total de Médicos</div>
              <div class="card-value">${estadisticas.medicos.total}</div>
              <div class="card-detail">✓ ${estadisticas.medicos.activos} activos</div>
            </div>
            <div class="card">
              <div class="card-title">Total de Pacientes</div>
              <div class="card-value">${estadisticas.pacientes.total}</div>
              <div class="card-detail">✓ ${estadisticas.pacientes.activos} activos</div>
            </div>
            <div class="card">
              <div class="card-title">Consultas Totales</div>
              <div class="card-value">${estadisticas.resumen_general.consultas_totales}</div>
              <div class="card-detail">Promedio: ${estadisticasDerivadas?.consultasPromedio || 0}/mes</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>💰 Ingresos</h2>
          <div class="card">
            <div class="card-title">Ingresos Totales</div>
            <div class="card-value">$${estadisticas.resumen_general.ingresos_totales.toLocaleString()}</div>
            <div class="card-detail">Promedio mensual: $${estadisticasDerivadas?.ingresosPromedio.toLocaleString() || 0}</div>
          </div>
        </div>

        <div class="section">
          <h2>🏥 Top 5 Especialidades</h2>
          <table>
            <thead>
              <tr>
                <th>Posición</th>
                <th>Especialidad</th>
                <th>Consultas</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${estadisticas.top_especialidades
                .map(
                  (item, index) => `
                <tr>
                  <td>#${index + 1}</td>
                  <td>${item.nombre}</td>
                  <td>${item.consultas}</td>
                  <td>${item.porcentaje}%</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Reporte confidencial - Centro Médico ${estadisticas.centro.nombre}</p>
          <p>Fecha: ${new Date().toLocaleDateString("es-CL")}</p>
        </div>

        <div class="print-btn">
          <button onclick="window.print()">🖨️ Imprimir Reporte</button>
        </div>
      </body>
      </html>
    `;

    ventana.document.write(html);
    ventana.document.close();
    mostrarNotificacion("success", "Reporte PDF generado");
  };

  const exportarCSV = () => {
    if (!estadisticas) return;

    try {
      const headers = [
        "Centro",
        "Métrica",
        "Valor",
        "Detalles",
      ];

      const rows = [
        ["", "USUARIOS", "", ""],
        [estadisticas.centro.nombre, "Total Usuarios", estadisticas.usuarios.total, `Activos: ${estadisticas.usuarios.activos}`],
        ["", "Usuarios Bloqueados", estadisticas.usuarios.bloqueados, ""],
        ["", "", "", ""],
        ["", "MÉDICOS", "", ""],
        ["", "Total Médicos", estadisticas.medicos.total, `Activos: ${estadisticas.medicos.activos}`],
        ["", "Especialidades", estadisticas.medicos.especialidades, ""],
        ["", "", "", ""],
        ["", "PACIENTES", "", ""],
        ["", "Total Pacientes", estadisticas.pacientes.total, `Activos: ${estadisticas.pacientes.activos}`],
        ["", "Nuevos Este Mes", estadisticas.pacientes.nuevos_mes, ""],
        ["", "", "", ""],
        ["", "CONSULTAS", "", ""],
        ["", "Total Consultas", estadisticas.resumen_general.consultas_totales, `Promedio: ${estadisticasDerivadas?.consultasPromedio || 0}/mes`],
        ["", "Promedio Diario", estadisticas.resumen_general.promedio_consultas_diarias, ""],
        ["", "", "", ""],
        ["", "INGRESOS", "", ""],
        ["", "Ingresos Totales", `$${estadisticas.resumen_general.ingresos_totales}`, `Promedio: $${estadisticasDerivadas?.ingresosPromedio || 0}/mes`],
      ];

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
        `estadisticas_centro_${params.id}_${new Date().toISOString().split("T")[0]}.csv`
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
              <BarChart3 className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <div className="mb-6">
            <RefreshCw className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-pulse">
            Cargando Estadísticas
          </h2>
          <p className="text-lg text-gray-600 font-semibold">
            Procesando datos del centro...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !estadisticas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/admin/centros/${params.id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-bold transition-all duration-300 hover:translate-x-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b-2 border-transparent group-hover:border-blue-600">
              Volver al Centro
            </span>
          </Link>

          <div className="glassmorphism p-8 rounded-2xl shadow-xl border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-100 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="font-black text-xl text-red-800">Error al Cargar Estadísticas</p>
                <p className="text-sm text-red-600 font-semibold mt-2">
                  {error || "No se pudieron cargar las estadísticas"}
                </p>
              </div>
            </div>
          </div>
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
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
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
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  Estadísticas
                  <span className="text-2xl px-4 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 rounded-full font-bold border-2 border-blue-200">
                    {estadisticas.centro.nombre}
                  </span>
                </h1>
                <p className="text-gray-600 font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Análisis detallado del centro médico • Centro #{params.id}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarEstadisticas}
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
                onClick={exportarPDF}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold"
              >
                <Printer className="w-5 h-5" />
                PDF
              </button>

              <button
                onClick={exportarCSV}
                className="px-6 py-3 glassmorphism rounded-xl hover:shadow-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 font-bold"
              >
                <FileSpreadsheet className="w-5 h-5" />
                CSV
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
                : "bg-blue-100 border-2 border-blue-300 text-blue-800"
            }`}
          >
            {notificacion.tipo === "success" && <CheckCircle className="w-6 h-6" />}
            {notificacion.tipo === "error" && <AlertCircle className="w-6 h-6" />}
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

        {/* Tarjetas de Resumen Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuarios */}
          <div
            className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-blue-500 group cursor-pointer"
            onClick={() => toggleExpandCard("usuarios")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                {estadisticas.usuarios.crecimiento_mes > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={`text-sm font-black ${
                    estadisticas.usuarios.crecimiento_mes > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(estadisticas.usuarios.crecimiento_mes)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-bold mb-2">Total Usuarios</p>
            <p className="text-4xl font-black text-gray-900 mb-3">
              {estadisticas.usuarios.total}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Activos
                </span>
                <span className="text-green-600">{estadisticas.usuarios.activos}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Bloqueados
                </span>
                <span className="text-red-600">{estadisticas.usuarios.bloqueados}</span>
              </div>
            </div>
            {expandedCards.usuarios && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <p className="text-xs text-gray-500 font-bold">
                  Tasa de actividad: {((estadisticas.usuarios.activos / estadisticas.usuarios.total) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Médicos */}
          <div
            className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-green-500 group cursor-pointer"
            onClick={() => toggleExpandCard("medicos")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform">
                <Stethoscope className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
{estadisticas.medicos?.crecimiento_mes > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={`text-sm font-black ${
(estadisticas.medicos?.crecimiento_mes ?? 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
{Math.abs(estadisticas.medicos?.crecimiento_mes ?? 0)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-bold mb-2">Total Médicos</p>
            <p className="text-4xl font-black text-gray-900 mb-3">
              {estadisticas.medicos.total}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Activos
                </span>
                <span className="text-green-600">{estadisticas.medicos.activos}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <Award className="w-4 h-4 text-blue-600" />
                  Especialidades
                </span>
                <span className="text-blue-600">{estadisticas.medicos.especialidades}</span>
              </div>
            </div>
            {expandedCards.medicos && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <p className="text-xs text-gray-500 font-bold">
                  Promedio especialidades por médico: {(estadisticas.medicos.especialidades / estadisticas.medicos.total).toFixed(1)}
                </p>
              </div>
            )}
          </div>

          {/* Pacientes */}
          <div
            className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-purple-500 group cursor-pointer"
            onClick={() => toggleExpandCard("pacientes")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex items-center gap-2">
                {estadisticas.pacientes.crecimiento_mes > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={`text-sm font-black ${
                    estadisticas.pacientes.crecimiento_mes > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(estadisticas.pacientes.crecimiento_mes)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-bold mb-2">Total Pacientes</p>
            <p className="text-4xl font-black text-gray-900 mb-3">
              {estadisticas.pacientes.total}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Activos
                </span>
                <span className="text-green-600">{estadisticas.pacientes.activos}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  Nuevos
                </span>
                <span className="text-yellow-600">+{estadisticas.pacientes.nuevos_mes}</span>
              </div>
            </div>
            {expandedCards.pacientes && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <p className="text-xs text-gray-500 font-bold">
                  Tasa de actividad: {((estadisticas.pacientes.activos / estadisticas.pacientes.total) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Consultas */}
          <div
            className="glassmorphism p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-l-4 border-orange-500 group cursor-pointer"
            onClick={() => toggleExpandCard("consultas")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>
            <p className="text-sm text-gray-600 font-bold mb-2">Consultas Totales</p>
            <p className="text-4xl font-black text-gray-900 mb-3">
              {estadisticas.resumen_general.consultas_totales}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Promedio/mes
                </span>
                <span className="text-blue-600">
                  {estadisticasDerivadas?.consultasPromedio || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Promedio/día
                </span>
                <span className="text-yellow-600">
                  {estadisticas.resumen_general.promedio_consultas_diarias}
                </span>
              </div>
            </div>
            {expandedCards.consultas && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <p className="text-xs text-gray-500 font-bold">
                  Variación: {estadisticasDerivadas?.variacionConsultas || 0}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gráficos de Consultas y Ingresos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Consultas por Mes */}
          <div className="glassmorphism p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-blue-600" />
                Consultas por Mes
              </h2>
              <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-xs font-bold border-2 border-blue-300">
                Últimos 6 meses
              </span>
            </div>

            <div className="space-y-4">
              {estadisticas.consultas_mes.map((item, index) => {
                const porcentaje =
                  (item.total / (estadisticasDerivadas?.maxConsultas || 1)) * 100;
                const esMayor = item.total > (estadisticasDerivadas?.consultasPromedio || 0);

                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(item.mes + "-01").toLocaleDateString("es-CL", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {item.total} consultas
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden border-2 border-gray-300 shadow-lg">
                      <div
                        className={`h-full flex items-center justify-end pr-4 text-white text-sm font-black transition-all duration-500 ${
                          esMayor
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-blue-500 to-cyan-600"
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      >
                        {porcentaje > 10 && `${Math.round(porcentaje)}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
                  <p className="text-xs text-gray-600 font-bold mb-1">Promedio</p>
                  <p className="text-2xl font-black text-blue-600">
                    {estadisticasDerivadas?.consultasPromedio || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
                  <p className="text-xs text-gray-600 font-bold mb-1">Máximo</p>
                  <p className="text-2xl font-black text-green-600">
                    {estadisticasDerivadas?.maxConsultas || 0}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200 text-center">
                  <p className="text-xs text-gray-600 font-bold mb-1">Mínimo</p>
                  <p className="text-2xl font-black text-orange-600">
                    {estadisticasDerivadas?.minConsultas || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ingresos por Mes */}
          <div className="glassmorphism p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <DollarSign className="w-7 h-7 text-green-600" />
                Ingresos por Mes
              </h2>
              <span className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-xs font-bold border-2 border-green-300">
                Últimos 6 meses
              </span>
            </div>

            <div className="space-y-4">
              {estadisticas.ingresos_mes.map((item, index) => {
                const porcentaje =
                  (item.ingresos / (estadisticasDerivadas?.maxIngresos || 1)) * 100;
                const esMayor = item.ingresos > (estadisticasDerivadas?.ingresosPromedio || 0);

                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(item.mes + "-01").toLocaleDateString("es-CL", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-900">
                          ${item.ingresos.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.facturas} fact.
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden border-2 border-gray-300 shadow-lg">
                      <div
                        className={`h-full flex items-center justify-end pr-4 text-white text-sm font-black transition-all duration-500 ${
                          esMayor
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                            : "bg-gradient-to-r from-green-500 to-lime-600"
                        }`}
                        style={{ width: `${porcentaje}%` }}
                      >
                        {porcentaje > 10 && `${Math.round(porcentaje)}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
                  <p className="text-xs text-gray-600 font-bold mb-1">Promedio</p>
                  <p className="text-lg font-black text-green-600">
                    ${(estadisticasDerivadas?.ingresosPromedio || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 text-center">
                  <p className="text-xs text-gray-600 font-bold mb-1">Máximo</p>
                  <p className="text-lg font-black text-emerald-600">
                    ${(estadisticasDerivadas?.maxIngresos || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-lime-50 rounded-xl border-2 border-lime-200 text-center">
                  <p className="text-xs text-gray-600 font-bold mb-1">Mínimo</p>
                  <p className="text-lg font-black text-lime-600">
                    ${(estadisticasDerivadas?.minIngresos || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Especialidades */}
        <div className="glassmorphism p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Stethoscope className="w-7 h-7 text-purple-600" />
              Top 5 Especialidades Más Consultadas
            </h2>
            <span className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-xs font-bold border-2 border-purple-300">
              Ranking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {estadisticas.top_especialidades.map((item, index) => (
              <div
                key={index}
                className="glassmorphism p-6 rounded-2xl border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-2xl font-black text-purple-600">
                          #{index + 1}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg shadow-lg animate-bounce">
                          ⭐
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-3">
                    {item.nombre}
                  </h3>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 mb-3">
                    <p className="text-3xl font-black text-purple-600">
                      {item.consultas}
                    </p>
                    <p className="text-xs text-gray-600 font-bold mt-1">
                      consultas
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border border-gray-300">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-full transition-all duration-500"
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-black text-gray-600 mt-2">
                    {item.porcentaje}% del total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información del Centro */}
        <div className="glassmorphism p-8 rounded-2xl shadow-xl border-l-4 border-blue-500">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <Building className="w-7 h-7 text-blue-600" />
            Información del Centro
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-gray-600 font-bold mb-2">Nombre del Centro</p>
              <p className="text-2xl font-black text-gray-900">
                {estadisticas.centro.nombre}
              </p>
            </div>

            {estadisticas.centro.ciudad && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-gray-600 font-bold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Ciudad
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {estadisticas.centro.ciudad}
                </p>
              </div>
            )}

            <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 md:col-span-2">
              <p className="text-sm text-gray-600 font-bold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Última Actualización
              </p>
              <p className="text-lg font-black text-gray-900">
                {new Date().toLocaleString("es-CL")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
