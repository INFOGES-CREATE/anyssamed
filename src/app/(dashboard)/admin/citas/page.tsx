"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar, Plus, Edit, Clock, X, Search, CheckCircle2, AlarmClock, RotateCcw,
  Trash2, Building2, Stethoscope, User, MapPin, Loader2, AlertCircle, Download,
  Filter, Eye, EyeOff, Bell, Phone, Mail, MessageSquare, Video, FileText,
  TrendingUp, Users, DollarSign, Activity, ChevronDown, ChevronUp, Settings,
  Moon, Sun, BarChart3, PieChart, Calendar as CalendarIcon, List, Grid,
  RefreshCw, Archive, CheckSquare, Square, MoreVertical, Copy, Share2,
  Printer, XCircle, CheckCircle, AlertTriangle, Info, Zap, Target
} from "lucide-react";

// ==================== TIPOS ====================
type Opcion = { value: number | string; label: string; [k: string]: any; };
type Estado = "programada" | "confirmada" | "en_sala_espera" | "en_atencion" | "completada" | "cancelada" | "no_asistio" | "reprogramada";
type ViewMode = "table" | "calendar" | "cards";
type Theme = "light" | "dark";

type Cita = {
  id_cita: number;
  id_paciente: number;
  id_medico: number;
  id_centro: number;
  id_sucursal: number | null;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion_minutos: number;
  tipo_cita: string;
  motivo: string | null;
  estado: Estado;
  prioridad: "normal" | "alta" | "urgente";
  origen: string;
  pagada: 0 | 1;
  monto: number | null;
  id_especialidad: number | null;
  id_sala: number | null;
  notas: string | null;
  notas_privadas: string | null;
  paciente_nombre: string;
  paciente_rut: string;
  paciente_email?: string;
  paciente_telefono?: string;
  medico_nombre: string;
  medico_especialidad?: string;
  centro_nombre: string;
  sucursal_nombre: string | null;
  sala_nombre?: string | null;
  recordatorio_enviado?: 0 | 1;
  confirmado_por_paciente?: 0 | 1;
  fecha_creacion?: string;
  fecha_modificacion?: string;
};

type Estadisticas = {
  total_citas: number;
  programadas: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  no_asistio: number;
  ingresos_total: number;
  ingresos_pendientes: number;
  tasa_asistencia: number;
  promedio_duracion: number;
};

// ==================== CONSTANTES ====================
const estadoBadge: Record<Estado, { bg: string; text: string; icon: any }> = {
  programada: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", icon: Calendar },
  confirmada: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", icon: CheckCircle },
  en_sala_espera: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", icon: Clock },
  en_atencion: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", icon: Activity },
  completada: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
  cancelada: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", icon: XCircle },
  no_asistio: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", icon: AlertTriangle },
  reprogramada: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", icon: RefreshCw },
};

const prioridadBadge: Record<"normal" | "alta" | "urgente", { bg: string; text: string }> = {
  normal: { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-300" },
  alta: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  urgente: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function AdminCitasPage() {
  // Estados principales
  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Estadísticas con valores por defecto seguros
  const [stats, setStats] = useState<Estadisticas>({
    total_citas: 0, programadas: 0, confirmadas: 0, completadas: 0,
    canceladas: 0, no_asistio: 0, ingresos_total: 0, ingresos_pendientes: 0,
    tasa_asistencia: 0, promedio_duracion: 0
  });

  // Función helper para asegurar valores numéricos
  const toNumber = (value: any, defaultValue = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Helper para formatear números de forma segura
  const safeNumber = (value: any, decimals: number = 0): string => {
    const num = Number(value);
    return isNaN(num) ? "0" : num.toFixed(decimals);
  };

  const safeInt = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : Math.round(num);
  };

  // Filtros básicos
  const [fCentro, setFCentro] = useState<number | "">("");
  const [fMedico, setFMedico] = useState<number | "">("");
  const [fSucursal, setFSucursal] = useState<number | "">("");
  const [fEstado, setFEstado] = useState<Estado | "">("");
  const [fSearch, setFSearch] = useState("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");

  // Filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [fPrioridad, setFPrioridad] = useState<"" | "normal" | "alta" | "urgente">("");
  const [fOrigen, setFOrigen] = useState("");
  const [fPagada, setFPagada] = useState<"" | "0" | "1">("");
  const [fTipoCita, setFTipoCita] = useState("");
  const [fSala, setFSala] = useState<number | "">("");
  const [fRecordatorio, setFRecordatorio] = useState<"" | "0" | "1">("");
  const [fConfirmada, setFConfirmada] = useState<"" | "0" | "1">("");

  // Opciones de selects
  const [opCentros, setOpCentros] = useState<Opcion[]>([]);
  const [opSucursales, setOpSucursales] = useState<Opcion[]>([]);
  const [opMedicos, setOpMedicos] = useState<Opcion[]>([]);
  const [opPacientes, setOpPacientes] = useState<Opcion[]>([]);
  const [opTipos, setOpTipos] = useState<Opcion[]>([]);
  const [opSalas, setOpSalas] = useState<Opcion[]>([]);

  // Modales
  const [showModalCE, setShowModalCE] = useState(false);
  const [editCita, setEditCita] = useState<Cita | null>(null);
  const [showModalRepro, setShowModalRepro] = useState(false);
  const [citaRepro, setCitaRepro] = useState<Cita | null>(null);
  const [showModalCancel, setShowModalCancel] = useState(false);
  const [citaCancel, setCitaCancel] = useState<Cita | null>(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState<Cita | null>(null);
  const [showModalRecordatorio, setShowModalRecordatorio] = useState(false);
  const [citaRecordatorio, setCitaRecordatorio] = useState<Cita | null>(null);

  // Selección múltiple
  const [selectedCitas, setSelectedCitas] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Dashboard
  const [showDashboard, setShowDashboard] = useState(true);

  // ==================== EFECTOS ====================
  // Tema
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cargar opciones
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/citas/opciones");
        const data = await res.json();
        if (data.success) {
          setOpCentros(data.centros || []);
          setOpSucursales(data.sucursales || []);
          setOpMedicos(data.medicos || []);
          setOpPacientes(data.pacientes || []);
          setOpTipos(data.tipos || []);
          setOpSalas(data.salas || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Cargar citas y estadísticas
  const fetchCitas = useCallback(async (page = pagina) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pagina: String(page),
        pageSize: String(pageSize),
      });
      if (fCentro) params.append("id_centro", String(fCentro));
      if (fMedico) params.append("id_medico", String(fMedico));
      if (fSucursal) params.append("id_sucursal", String(fSucursal));
      if (fEstado) params.append("estado", String(fEstado));
      if (fSearch) params.append("search", fSearch);
      if (fDesde) params.append("desde", fDesde);
      if (fHasta) params.append("hasta", fHasta);
      if (fPrioridad) params.append("prioridad", fPrioridad);
      if (fOrigen) params.append("origen", fOrigen);
      if (fPagada) params.append("pagada", fPagada);
      if (fTipoCita) params.append("tipo_cita", fTipoCita);
      if (fSala) params.append("id_sala", String(fSala));
      if (fRecordatorio) params.append("recordatorio_enviado", fRecordatorio);
      if (fConfirmada) params.append("confirmado_por_paciente", fConfirmada);

      const res = await fetch(`/api/admin/citas?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCitas(data.citas || []);
        setTotal(data.total || 0);
        setPagina(data.pagina);
        
        // Procesar estadísticas de forma segura
        if (data.stats) {
          setStats({
            total_citas: Number(data.stats.total_citas) || 0,
            programadas: Number(data.stats.programadas) || 0,
            confirmadas: Number(data.stats.confirmadas) || 0,
            completadas: Number(data.stats.completadas) || 0,
            canceladas: Number(data.stats.canceladas) || 0,
            no_asistio: Number(data.stats.no_asistio) || 0,
            ingresos_total: Number(data.stats.ingresos_total) || 0,
            ingresos_pendientes: Number(data.stats.ingresos_pendientes) || 0,
            tasa_asistencia: Number(data.stats.tasa_asistencia) || 0,
            promedio_duracion: Number(data.stats.promedio_duracion) || 0,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pagina, pageSize, fCentro, fMedico, fSucursal, fEstado, fSearch, fDesde, fHasta, fPrioridad, fOrigen, fPagada, fTipoCita, fSala, fRecordatorio, fConfirmada]);

  useEffect(() => {
    fetchCitas(1);
  }, [pageSize, fCentro, fMedico, fSucursal, fEstado, fDesde, fHasta, fPrioridad, fOrigen, fPagada, fTipoCita, fSala, fRecordatorio, fConfirmada]);

  // ==================== FUNCIONES ====================
  const resetFiltros = () => {
    setFCentro(""); setFMedico(""); setFSucursal(""); setFEstado(""); setFSearch("");
    setFDesde(""); setFHasta(""); setFPrioridad(""); setFOrigen(""); setFPagada("");
    setFTipoCita(""); setFSala(""); setFRecordatorio(""); setFConfirmada("");
    fetchCitas(1);
  };

  const currentSucursales = useMemo(
    () => opSucursales.filter(s => !fCentro || s.id_centro === fCentro),
    [opSucursales, fCentro]
  );

  const currentMedicos = useMemo(
    () => opMedicos.filter(m => !fCentro || m.id_centro === fCentro),
    [opMedicos, fCentro]
  );

  const currentSalas = useMemo(
    () => opSalas.filter(s => !fCentro || s.id_centro === fCentro),
    [opSalas, fCentro]
  );

  // CRUD
  const onCreate = () => { setEditCita(null); setShowModalCE(true); };
  const onEdit = (c: Cita) => { setEditCita(c); setShowModalCE(true); };
  const onReprogramar = (c: Cita) => { setCitaRepro(c); setShowModalRepro(true); };
  const onCancelar = (c: Cita) => { setCitaCancel(c); setShowModalCancel(true); };
  const onVerDetalle = (c: Cita) => { setCitaDetalle(c); setShowModalDetalle(true); };
  const onEnviarRecordatorio = (c: Cita) => { setCitaRecordatorio(c); setShowModalRecordatorio(true); };

  const onDelete = async (c: Cita) => {
    if (!confirm("¿Eliminar esta cita permanentemente?")) return;
    const res = await fetch(`/api/admin/citas/${c.id_cita}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchCitas();
    else alert(data.error || "No se pudo eliminar");
  };

  // Selección múltiple
  const toggleSelectCita = (id: number) => {
    const newSet = new Set(selectedCitas);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCitas(newSet);
  };

  const selectAllVisible = () => {
    if (selectedCitas.size === citas.length) setSelectedCitas(new Set());
    else setSelectedCitas(new Set(citas.map(c => c.id_cita)));
  };

  const bulkConfirmar = async () => {
    if (selectedCitas.size === 0) return;
    if (!confirm(`¿Confirmar ${selectedCitas.size} citas seleccionadas?`)) return;
    // TODO: implementar endpoint de confirmación masiva
    alert("Funcionalidad en desarrollo");
  };

  const bulkCancelar = async () => {
    if (selectedCitas.size === 0) return;
    if (!confirm(`¿Cancelar ${selectedCitas.size} citas seleccionadas?`)) return;
    // TODO: implementar endpoint de cancelación masiva
    alert("Funcionalidad en desarrollo");
  };

  const bulkEnviarRecordatorios = async () => {
    if (selectedCitas.size === 0) return;
    if (!confirm(`¿Enviar recordatorios a ${selectedCitas.size} citas?`)) return;
    // TODO: implementar endpoint
    alert("Funcionalidad en desarrollo");
  };

  // Exportar
  const exportarCSV = () => {
    // TODO: implementar exportación
    alert("Exportando a CSV...");
  };

  const exportarPDF = () => {
    // TODO: implementar exportación
    alert("Exportando a PDF...");
  };

  const imprimirLista = () => {
    window.print();
  };

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              Gestión de Citas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sistema avanzado de administración de citas médicas
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>

            {/* Dashboard toggle */}
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`p-3 rounded-xl border transition-all shadow-sm ${
                showDashboard
                  ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title="Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* Nueva cita */}
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Plus className="w-5 h-5" /> Nueva cita
            </button>
          </div>
        </header>

        {/* DASHBOARD DE ESTADÍSTICAS */}
        {showDashboard && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <StatCard
              icon={Calendar}
              label="Total de citas"
              value={safeInt(stats.total_citas)}
              color="blue"
              trend="+12%"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completadas"
              value={safeInt(stats.completadas)}
              color="green"
              subtitle={`${safeNumber(stats.tasa_asistencia, 1)}% asistencia`}
            />
            <StatCard
              icon={DollarSign}
              label="Ingresos"
              value={`$${safeInt(stats.ingresos_total).toLocaleString()}`}
              color="purple"
              subtitle={`$${safeInt(stats.ingresos_pendientes).toLocaleString()} pendientes`}
            />
            <StatCard
              icon={Clock}
              label="Duración promedio"
              value={`${safeInt(stats.promedio_duracion)} min`}
              color="orange"
              subtitle="Por consulta"
            />
          </section>
        )}

        {/* FILTROS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Barra de filtros básicos */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
            <div className="grid md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Centro médico</label>
                <select
                  value={String(fCentro)}
                  onChange={e => setFCentro(e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                >
                  <option value="">Todos los centros</option>
                  {opCentros.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Sucursal</label>
                <select
                  value={String(fSucursal)}
                  onChange={e => setFSucursal(e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Todas</option>
                  {currentSucursales.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Médico</label>
                <select
                  value={String(fMedico)}
                  onChange={e => setFMedico(e.target.value ? Number(e.target.value) : "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Todos</option>
                  {currentMedicos.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  value={String(fEstado)}
                  onChange={e => setFEstado(e.target.value as Estado | "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Todos</option>
                  {Object.keys(estadoBadge).map(es => <option key={es} value={es}>{es.replace(/_/g, " ")}</option>)}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex-1 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Búsqueda y fechas */}
            <div className="grid md:grid-cols-6 gap-3 mt-3">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Buscar</label>
                <div className="relative">
                  <input
                    value={fSearch}
                    onChange={e => setFSearch(e.target.value)}
                    placeholder="Paciente, RUT, médico..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Desde</label>
                <input
                  type="date"
                  value={fDesde}
                  onChange={e => setFDesde(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Hasta</label>
                <input
                  type="date"
                  value={fHasta}
                  onChange={e => setFHasta(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-end gap-2 md:col-span-2">
                <button
                  onClick={() => fetchCitas(1)}
                  className="flex-1 rounded-xl px-4 py-2.5 bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all font-semibold shadow-md"
                >
                  Aplicar filtros
                </button>
                <button
                  onClick={resetFiltros}
                  className="flex-1 rounded-xl px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Filtros avanzados */}
          {showAdvancedFilters && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-200">
              <div className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Prioridad</label>
                  <select
                    value={fPrioridad}
                    onChange={e => setFPrioridad(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todas</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Origen</label>
                  <select
                    value={fOrigen}
                    onChange={e => setFOrigen(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todos</option>
                    {["presencial", "telefono", "web", "whatsapp", "chatbot", "app_movil"].map(o =>
                      <option key={o} value={o}>{o}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Tipo de cita</label>
                  <select
                    value={fTipoCita}
                    onChange={e => setFTipoCita(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todos</option>
                    {opTipos.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Sala</label>
                  <select
                    value={String(fSala)}
                    onChange={e => setFSala(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todas</option>
                    {currentSalas.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Pagada</label>
                  <select
                    value={fPagada}
                    onChange={e => setFPagada(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todas</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Recordatorio</label>
                  <select
                    value={fRecordatorio}
                    onChange={e => setFRecordatorio(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todos</option>
                    <option value="1">Enviado</option>
                    <option value="0">No enviado</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Confirmada</label>
                  <select
                    value={fConfirmada}
                    onChange={e => setFConfirmada(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todas</option>
                    <option value="1">Confirmada</option>
                    <option value="0">Sin confirmar</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* TOOLBAR */}
        <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {/* Vista */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-600 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                title="Vista tabla"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-lg transition-all ${viewMode === "cards" ? "bg-white dark:bg-gray-600 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                title="Vista tarjetas"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded-lg transition-all ${viewMode === "calendar" ? "bg-white dark:bg-gray-600 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                title="Vista calendario"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Selección múltiple */}
            {selectedCitas.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  {selectedCitas.size} seleccionadas
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Exportar */}
            <button
              onClick={exportarCSV}
              className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all flex items-center gap-2 font-medium"
              title="Exportar CSV"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={exportarPDF}
              className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex items-center gap-2 font-medium"
              title="Exportar PDF"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={imprimirLista}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchCitas(pagina)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ACCIONES EN LOTE */}
        {showBulkActions && selectedCitas.size > 0 && (
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 shadow-lg border border-indigo-200 dark:border-indigo-800 animate-in slide-in-from-top duration-200">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Acciones en lote ({selectedCitas.size} citas)
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={bulkConfirmar}
                className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 font-medium shadow-md"
              >
                <CheckCircle className="w-4 h-4" /> Confirmar todas
              </button>
              <button
                onClick={bulkCancelar}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all flex items-center gap-2 font-medium shadow-md"
              >
                <XCircle className="w-4 h-4" /> Cancelar todas
              </button>
              <button
                onClick={bulkEnviarRecordatorios}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-2 font-medium shadow-md"
              >
                <Bell className="w-4 h-4" /> Enviar recordatorios
              </button>
              <button
                onClick={() => {
                  setSelectedCitas(new Set());
                  setShowBulkActions(false);
                }}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </section>
        )}

        {/* CONTENIDO PRINCIPAL */}
        {viewMode === "table" && (
          <TableView
            citas={citas}
            loading={loading}
            selectedCitas={selectedCitas}
            toggleSelectCita={toggleSelectCita}
            selectAllVisible={selectAllVisible}
            onEdit={onEdit}
            onReprogramar={onReprogramar}
            onCancelar={onCancelar}
            onDelete={onDelete}
            onVerDetalle={onVerDetalle}
            onEnviarRecordatorio={onEnviarRecordatorio}
          />
        )}

        {viewMode === "cards" && (
          <CardsView
            citas={citas}
            loading={loading}
            onEdit={onEdit}
            onReprogramar={onReprogramar}
            onCancelar={onCancelar}
            onDelete={onDelete}
            onVerDetalle={onVerDetalle}
          />
        )}

        {viewMode === "calendar" && (
          <CalendarView citas={citas} loading={loading} />
        )}

        {/* PAGINACIÓN */}
        {!loading && citas.length > 0 && (
          <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Mostrando {((pagina - 1) * pageSize) + 1} - {Math.min(pagina * pageSize, total)} de {total} citas
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina <= 1}
                onClick={() => { setPagina(pagina - 1); fetchCitas(pagina - 1); }}
              >
                Anterior
              </button>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
                Página {pagina} de {Math.ceil(total / pageSize)}
              </div>
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={(pagina * pageSize) >= total}
                onClick={() => { setPagina(pagina + 1); fetchCitas(pagina + 1); }}
              >
                Siguiente
              </button>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pág</option>)}
              </select>
            </div>
          </section>
        )}
      </div>

      {/* MODALES */}
      {showModalCE && (
        <ModalCrearEditarCita
          onClose={() => setShowModalCE(false)}
          onSaved={() => { setShowModalCE(false); fetchCitas(); }}
          editCita={editCita}
          opciones={{
            opCentros,
            opSucursales: currentSucursales,
            opMedicos: currentMedicos,
            opPacientes,
            opTipos,
            opSalas: currentSalas
          }}
          theme={theme}
        />
      )}
      {showModalRepro && citaRepro && (
        <ModalReprogramar
          cita={citaRepro}
          onClose={() => setShowModalRepro(false)}
          onSaved={() => { setShowModalRepro(false); fetchCitas(); }}
          theme={theme}
        />
      )}
      {showModalCancel && citaCancel && (
        <ModalCancelar
          cita={citaCancel}
          onClose={() => setShowModalCancel(false)}
          onSaved={() => { setShowModalCancel(false); fetchCitas(); }}
          theme={theme}
        />
      )}
      {showModalDetalle && citaDetalle && (
        <ModalDetalleCita
          cita={citaDetalle}
          onClose={() => setShowModalDetalle(false)}
          theme={theme}
        />
      )}
      {showModalRecordatorio && citaRecordatorio && (
        <ModalEnviarRecordatorio
          cita={citaRecordatorio}
          onClose={() => setShowModalRecordatorio(false)}
          onSaved={() => { setShowModalRecordatorio(false); fetchCitas(); }}
          theme={theme}
        />
      )}
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

function StatCard({ icon: Icon, label, value, color, trend, subtitle }: {
  icon: any; label: string; value: string | number; color: string; trend?: string; subtitle?: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  }[color] || "from-gray-500 to-gray-600";

  // Asegurar que el valor siempre sea válido
  const displayValue = value !== null && value !== undefined ? value : "0";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{displayValue}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" /> {trend}
        </div>
      )}
    </div>
  );
}

function TableView({ citas, loading, selectedCitas, toggleSelectCita, selectAllVisible, onEdit, onReprogramar, onCancelar, onDelete, onVerDetalle, onEnviarRecordatorio }: {
  citas: Cita[];
  loading: boolean;
  selectedCitas: Set<number>;
  toggleSelectCita: (id: number) => void;
  selectAllVisible: () => void;
  onEdit: (c: Cita) => void;
  onReprogramar: (c: Cita) => void;
  onCancelar: (c: Cita) => void;
  onDelete: (c: Cita) => void;
  onVerDetalle: (c: Cita) => void;
  onEnviarRecordatorio: (c: Cita) => void;
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-750 border-b border-gray-200 dark:border-gray-600">
            <tr className="text-left">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedCitas.size === citas.length && citas.length > 0}
                  onChange={selectAllVisible}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Fecha/Hora</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Paciente</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Médico</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Centro</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Tipo</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Prioridad</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Monto</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando citas...</p>
                  </div>
                </td>
              </tr>
            ) : citas.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron citas</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Intenta ajustar los filtros</p>
                  </div>
                </td>
              </tr>
            ) : citas.map((c) => {
              const EstadoIcon = estadoBadge[c.estado].icon;
              return (
                <tr
                  key={c.id_cita}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCitas.has(c.id_cita)}
                      onChange={() => toggleSelectCita(c.id_cita)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {new Date(c.fecha_hora_inicio).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({c.duracion_minutos}m)
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{c.paciente_nombre}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.paciente_rut}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{c.medico_nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{c.centro_nombre}</span>
                    </div>
                    {c.sucursal_nombre && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {c.sucursal_nombre}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gray-900 dark:text-white">{c.tipo_cita}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${estadoBadge[c.estado].bg} ${estadoBadge[c.estado].text}`}>
                      <EstadoIcon className="w-3.5 h-3.5" />
                      {c.estado.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${prioridadBadge[c.prioridad].bg} ${prioridadBadge[c.prioridad].text}`}>
                      {c.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {c.monto ? (
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">${c.monto.toLocaleString()}</div>
                        <div className={`text-xs ${c.pagada ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                          {c.pagada ? "Pagada" : "Pendiente"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => onVerDetalle(c)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                      </button>
                      <button
                        onClick={() => onEdit(c)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => onEnviarRecordatorio(c)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                        title="Recordatorio"
                      >
                        <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                      </button>
                      <button
                        onClick={() => onReprogramar(c)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all group"
                        title="Reprogramar"
                      >
                        <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                      </button>
                      <button
                        onClick={() => onCancelar(c)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 transition-all group"
                        title="Cancelar"
                      >
                        <AlarmClock className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700 transition-all group"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CardsView({ citas, loading, onEdit, onReprogramar, onCancelar, onDelete, onVerDetalle }: {
  citas: Cita[];
  loading: boolean;
  onEdit: (c: Cita) => void;
  onReprogramar: (c: Cita) => void;
  onCancelar: (c: Cita) => void;
  onDelete: (c: Cita) => void;
  onVerDetalle: (c: Cita) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (citas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron citas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {citas.map((c) => {
        const EstadoIcon = estadoBadge[c.estado].icon;
        return (
          <div
            key={c.id_cita}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(c.fecha_hora_inicio).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {new Date(c.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {c.duracion_minutos}m
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${estadoBadge[c.estado].bg} ${estadoBadge[c.estado].text}`}>
                <EstadoIcon className="w-3.5 h-3.5" />
                {c.estado.replace(/_/g, " ")}
              </span>
            </div>

            {/* Body */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paciente</div>
                <div className="font-semibold text-gray-900 dark:text-white">{c.paciente_nombre}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{c.paciente_rut}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Médico</div>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{c.medico_nombre}</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Centro</div>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{c.centro_nombre}</span>
                </div>
                {c.sucursal_nombre && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    {c.sucursal_nombre}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${prioridadBadge[c.prioridad].bg} ${prioridadBadge[c.prioridad].text}`}>
                  {c.prioridad}
                </span>
                {c.monto && (
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">${c.monto.toLocaleString()}</div>
                    <div className={`text-xs ${c.pagada ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                      {c.pagada ? "Pagada" : "Pendiente"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onVerDetalle(c)}
                className="flex-1 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Eye className="w-4 h-4" /> Ver
              </button>
              <button
                onClick={() => onEdit(c)}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ citas, loading }: { citas: Cita[]; loading: boolean; }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // Agrupar citas por fecha
  const citasPorFecha = citas.reduce((acc, cita) => {
    const fecha = new Date(cita.fecha_hora_inicio).toLocaleDateString();
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(cita);
    return acc;
  }, {} as Record<string, Cita[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vista de Calendario</h2>
      </div>

      {Object.keys(citasPorFecha).length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay citas para mostrar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(citasPorFecha).map(([fecha, citasDia]) => (
            <div key={fecha} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{fecha}</h3>
                <span className="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  {citasDia.length} cita{citasDia.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2">
                {citasDia
                  .sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime())
                  .map((cita) => {
                    const EstadoIcon = estadoBadge[cita.estado].icon;
                    return (
                      <div
                        key={cita.id_cita}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2 w-24">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(cita.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{cita.paciente_nombre}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{cita.medico_nombre} • {cita.tipo_cita}</div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${estadoBadge[cita.estado].bg} ${estadoBadge[cita.estado].text}`}>
                          <EstadoIcon className="w-3 h-3" />
                          {cita.estado.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MODALES ====================

function ModalBase({ title, children, onClose, theme, size = "default" }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  theme: Theme;
  size?: "default" | "large" | "xl";
}) {
  const sizeClasses = {
    default: "max-w-3xl",
    large: "max-w-5xl",
    xl: "max-w-7xl"
  }[size];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalCrearEditarCita({ editCita, opciones, onClose, onSaved, theme }: {
  editCita: Cita | null;
  opciones: { opCentros: Opcion[]; opSucursales: Opcion[]; opMedicos: Opcion[]; opPacientes: Opcion[]; opTipos: Opcion[]; opSalas: Opcion[] };
  onClose: () => void;
  onSaved: () => void;
  theme: Theme;
}) {
  const [form, setForm] = useState<any>(() => {
    if (!editCita) return {
      id_centro: "", id_sucursal: "", id_medico: "", id_paciente: "", tipo_cita: "",
      fecha_hora_inicio: "", duracion_minutos: "", prioridad: "normal", origen: "web",
      id_sala: "", motivo: "", notas: "", notas_privadas: "", pagada: false, monto: ""
    };
    return {
      id_centro: editCita.id_centro, id_sucursal: editCita.id_sucursal || "",
      id_medico: editCita.id_medico, id_paciente: editCita.id_paciente, tipo_cita: editCita.tipo_cita,
      fecha_hora_inicio: editCita.fecha_hora_inicio?.slice(0, 16),
      duracion_minutos: editCita.duracion_minutos, prioridad: editCita.prioridad, origen: editCita.origen,
      id_sala: editCita.id_sala || "", motivo: editCita.motivo || "", notas: editCita.notas || "",
      notas_privadas: editCita.notas_privadas || "",
      pagada: !!editCita.pagada, monto: editCita.monto ?? ""
    };
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        id_centro: Number(form.id_centro) || null,
        id_sucursal: form.id_sucursal ? Number(form.id_sucursal) : null,
        id_medico: Number(form.id_medico),
        id_paciente: Number(form.id_paciente),
        duracion_minutos: form.duracion_minutos ? Number(form.duracion_minutos) : undefined,
        id_sala: form.id_sala ? Number(form.id_sala) : null,
        pagada: form.pagada ? 1 : 0,
        creado_por: 1,
      };

      const res = await fetch(editCita ? `/api/admin/citas/${editCita.id_cita}` : "/api/admin/citas", {
        method: editCita ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCita ? { ...payload, estado: editCita.estado, modificado_por: 1 } : payload),
      });
      const data = await res.json();
      if (!data.success) return alert(data.error || "Error al guardar");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <ModalBase title={editCita ? "Editar cita" : "Nueva cita"} onClose={onClose} theme={theme} size="large">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Centro médico" required>
          <select value={form.id_centro} onChange={e => setForm((f: any) => ({ ...f, id_centro: e.target.value }))} className={inputClass}>
            <option value="">Seleccione...</option>
            {opciones.opCentros.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Sucursal">
          <select value={form.id_sucursal} onChange={e => setForm((f: any) => ({ ...f, id_sucursal: e.target.value }))} className={inputClass}>
            <option value="">— Ninguna —</option>
            {opciones.opSucursales.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Sala">
          <select value={form.id_sala} onChange={e => setForm((f: any) => ({ ...f, id_sala: e.target.value }))} className={inputClass}>
            <option value="">— Ninguna —</option>
            {opciones.opSalas.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Médico" required>
          <select value={form.id_medico} onChange={e => setForm((f: any) => ({ ...f, id_medico: e.target.value }))} className={inputClass}>
            <option value="">Seleccione...</option>
            {opciones.opMedicos.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Paciente" required>
          <select value={form.id_paciente} onChange={e => setForm((f: any) => ({ ...f, id_paciente: e.target.value }))} className={inputClass}>
            <option value="">Seleccione...</option>
            {opciones.opPacientes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Tipo de cita" required>
          <select value={form.tipo_cita} onChange={e => setForm((f: any) => ({ ...f, tipo_cita: e.target.value }))} className={inputClass}>
            <option value="">Seleccione...</option>
            {opciones.opTipos.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Fecha y hora de inicio" required>
          <input
            type="datetime-local"
            value={form.fecha_hora_inicio}
            onChange={e => setForm((f: any) => ({ ...f, fecha_hora_inicio: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field label="Duración (minutos)">
          <input
            type="number"
            min={5}
            step={5}
            value={form.duracion_minutos}
            onChange={e => setForm((f: any) => ({ ...f, duracion_minutos: e.target.value }))}
            className={inputClass}
            placeholder="Vacío = usar predeterminada"
          />
        </Field>

        <Field label="Prioridad" required>
          <select value={form.prioridad} onChange={e => setForm((f: any) => ({ ...f, prioridad: e.target.value }))} className={inputClass}>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </Field>

        <Field label="Origen" required>
          <select value={form.origen} onChange={e => setForm((f: any) => ({ ...f, origen: e.target.value }))} className={inputClass}>
            {["presencial", "telefono", "web", "whatsapp", "chatbot", "app_movil"].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Estado de pago">
          <select value={form.pagada ? "1" : "0"} onChange={e => setForm((f: any) => ({ ...f, pagada: e.target.value === "1" }))} className={inputClass}>
            <option value="0">No pagada</option>
            <option value="1">Pagada</option>
          </select>
        </Field>

        <Field label="Monto">
          <input
            type="number"
            value={form.monto}
            onChange={e => setForm((f: any) => ({ ...f, monto: e.target.value }))}
            className={inputClass}
            placeholder="0"
          />
        </Field>

        <div className="md:col-span-3">
          <Field label="Motivo de la cita">
            <input
              value={form.motivo}
              onChange={e => setForm((f: any) => ({ ...f, motivo: e.target.value }))}
              className={inputClass}
              placeholder="Ej: Control mensual, revisión..."
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Notas (visibles)">
            <textarea
              value={form.notas}
              onChange={e => setForm((f: any) => ({ ...f, notas: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Notas que el paciente puede ver..."
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Notas privadas (solo personal médico)">
            <textarea
              value={form.notas_privadas}
              onChange={e => setForm((f: any) => ({ ...f, notas_privadas: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Notas internas que solo el equipo médico verá..."
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Guardando..." : "Guardar cita"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalReprogramar({ cita, onClose, onSaved, theme }: {
  cita: Cita;
  onClose: () => void;
  onSaved: () => void;
  theme: Theme;
}) {
  const [inicio, setInicio] = useState(cita.fecha_hora_inicio.slice(0, 16));
  const [dur, setDur] = useState(String(cita.duracion_minutos));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/citas/${cita.id_cita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reprogramar: true,
          nueva_fecha_hora_inicio: inicio,
          nueva_duracion_minutos: Number(dur),
          id_medico: cita.id_medico,
          modificado_por: 1,
        }),
      });
      const data = await res.json();
      if (!data.success) return alert(data.error || "No se pudo reprogramar");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500";

  return (
    <ModalBase title="Reprogramar cita" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">¿Cómo funciona la reprogramación?</p>
              <p>Se creará una nueva cita con la fecha y hora seleccionada. La cita actual quedará marcada como <strong>reprogramada</strong> y se mantendrá el historial.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nueva fecha y hora de inicio" required>
            <input
              type="datetime-local"
              value={inicio}
              onChange={e => setInicio(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Duración (minutos)" required>
            <input
              type="number"
              min={5}
              step={5}
              value={dur}
              onChange={e => setDur(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Datos actuales</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Paciente:</span>
              <p className="font-medium text-gray-900 dark:text-white">{cita.paciente_nombre}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Médico:</span>
              <p className="font-medium text-gray-900 dark:text-white">{cita.medico_nombre}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Fecha actual:</span>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(cita.fecha_hora_inicio).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Duración:</span>
              <p className="font-medium text-gray-900 dark:text-white">{cita.duracion_minutos} minutos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Reprogramando..." : "Reprogramar cita"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalCancelar({ cita, onClose, onSaved, theme }: {
  cita: Cita;
  onClose: () => void;
  onSaved: () => void;
  theme: Theme;
}) {
  const [motivo, setMotivo] = useState("reprogramacion");
  const [detalle, setDetalle] = useState("");
  const [tipo, setTipo] = useState("administrativo");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/citas/${cita.id_cita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "cancelada",
          cancelacion_motivo: motivo,
          cancelacion_detalle: detalle,
          cancelado_por: 1,
          cancelado_por_tipo: tipo,
          modificado_por: 1,
        }),
      });
      const data = await res.json();
      if (!data.success) return alert(data.error || "No se pudo cancelar");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500";

  return (
    <ModalBase title="Cancelar cita" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-300">
              <p className="font-semibold mb-1">Atención</p>
              <p>La cita quedará con estado <strong>cancelada</strong> y se registrará en el historial de cancelaciones. Esta acción se puede revertir editando la cita posteriormente.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Motivo de cancelación" required>
            <select value={motivo} onChange={e => setMotivo(e.target.value)} className={inputClass}>
              <option value="paciente_solicita">Paciente solicita</option>
              <option value="medico_no_disponible">Médico no disponible</option>
              <option value="error_programacion">Error de programación</option>
              <option value="reprogramacion">Reprogramación</option>
              <option value="otro">Otro motivo</option>
            </select>
          </Field>

          <Field label="Cancelado por" required>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputClass}>
              <option value="medico">Médico</option>
              <option value="secretaria">Secretaría</option>
              <option value="administrativo">Administrativo</option>
              <option value="paciente">Paciente</option>
              <option value="sistema">Sistema</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Detalles adicionales">
              <textarea
                value={detalle}
                onChange={e => setDetalle(e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Proporcione más información sobre la cancelación..."
              />
            </Field>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Información de la cita</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Paciente:</span>
              <p className="font-medium text-gray-900 dark:text-white">{cita.paciente_nombre}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Médico:</span>
              <p className="font-medium text-gray-900 dark:text-white">{cita.medico_nombre}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(cita.fecha_hora_inicio).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Estado actual:</span>
              <p className="font-medium text-gray-900 dark:text-white">{cita.estado}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
        >
          Volver
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Cancelando..." : "Cancelar cita"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalDetalleCita({ cita, onClose, theme }: {
  cita: Cita;
  onClose: () => void;
  theme: Theme;
}) {
  const EstadoIcon = estadoBadge[cita.estado].icon;

  return (
    <ModalBase title="Detalle de la cita" onClose={onClose} theme={theme} size="large">
      <div className="space-y-6">
        {/* Estado y prioridad */}
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 ${estadoBadge[cita.estado].bg} ${estadoBadge[cita.estado].text}`}>
            <EstadoIcon className="w-5 h-5" />
            {cita.estado.replace(/_/g, " ")}
          </span>
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${prioridadBadge[cita.prioridad].bg} ${prioridadBadge[cita.prioridad].text}`}>
            Prioridad: {cita.prioridad}
          </span>
          {cita.pagada ? (
            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              ✓ Pagada
            </span>
          ) : (
            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
              Pago pendiente
            </span>
          )}
        </div>

        {/* Información principal */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Información del Paciente
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nombre</span>
                <p className="font-semibold text-gray-900 dark:text-white">{cita.paciente_nombre}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">RUT</span>
                <p className="font-medium text-gray-900 dark:text-white">{cita.paciente_rut}</p>
              </div>
              {cita.paciente_email && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {cita.paciente_email}
                  </p>
                </div>
              )}
              {cita.paciente_telefono && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Teléfono</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {cita.paciente_telefono}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Información del Médico
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nombre</span>
                <p className="font-semibold text-gray-900 dark:text-white">{cita.medico_nombre}</p>
              </div>
              {cita.medico_especialidad && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Especialidad</span>
                  <p className="font-medium text-gray-900 dark:text-white">{cita.medico_especialidad}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la cita */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Detalles de la Cita
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Fecha</span>
              <p className="font-semibold text-gray-900 dark:text-white">{new Date(cita.fecha_hora_inicio).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Hora de inicio</span>
              <p className="font-semibold text-gray-900 dark:text-white">{new Date(cita.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Duración</span>
              <p className="font-semibold text-gray-900 dark:text-white">{cita.duracion_minutos} minutos</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tipo de cita</span>
              <p className="font-semibold text-gray-900 dark:text-white">{cita.tipo_cita}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Origen</span>
              <p className="font-semibold text-gray-900 dark:text-white">{cita.origen}</p>
            </div>
            {cita.monto && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Monto</span>
                <p className="font-bold text-gray-900 dark:text-white">${cita.monto.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Ubicación
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Centro médico</span>
              <p className="font-semibold text-gray-900 dark:text-white">{cita.centro_nombre}</p>
            </div>
            {cita.sucursal_nombre && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sucursal</span>
                <p className="font-semibold text-gray-900 dark:text-white">{cita.sucursal_nombre}</p>
              </div>
            )}
            {cita.sala_nombre && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sala</span>
                <p className="font-semibold text-gray-900 dark:text-white">{cita.sala_nombre}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notas */}
        {(cita.motivo || cita.notas || cita.notas_privadas) && (
          <div className="space-y-3">
            {cita.motivo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Motivo de la cita</h5>
                <p className="text-gray-700 dark:text-gray-300">{cita.motivo}</p>
              </div>
            )}
            {cita.notas && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <h5 className="font-semibold text-green-900 dark:text-green-300 mb-2">Notas</h5>
                <p className="text-gray-700 dark:text-gray-300">{cita.notas}</p>
              </div>
            )}
            {cita.notas_privadas && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <h5 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <EyeOff className="w-4 h-4" /> Notas privadas (solo personal médico)
                </h5>
                <p className="text-gray-700 dark:text-gray-300">{cita.notas_privadas}</p>
              </div>
            )}
          </div>
        )}

        {/* Estado de recordatorios */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`rounded-xl p-4 border ${cita.recordatorio_enviado ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700"}`}>
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${cita.recordatorio_enviado ? "text-green-600 dark:text-green-400" : "text-gray-400"}`} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Recordatorio</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cita.recordatorio_enviado ? "Enviado" : "No enviado"}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-4 border ${cita.confirmado_por_paciente ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700"}`}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`w-5 h-5 ${cita.confirmado_por_paciente ? "text-green-600 dark:text-green-400" : "text-gray-400"}`} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Confirmación</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cita.confirmado_por_paciente ? "Confirmada por paciente" : "Sin confirmar"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadatos */}
        {(cita.fecha_creacion || cita.fecha_modificacion) && (
          <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Historial</h5>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
              {cita.fecha_creacion && (
                <div>
                  <span>Creada el:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(cita.fecha_creacion).toLocaleString()}</p>
                </div>
              )}
              {cita.fecha_modificacion && (
                <div>
                  <span>Última modificación:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{new Date(cita.fecha_modificacion).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all font-semibold shadow-lg"
        >
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}

function ModalEnviarRecordatorio({ cita, onClose, onSaved, theme }: {
  cita: Cita;
  onClose: () => void;
  onSaved: () => void;
  theme: Theme;
}) {
  const [tipo, setTipo] = useState<"email" | "sms" | "whatsapp">("email");
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      // TODO: implementar endpoint de envío de recordatorios
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Recordatorio enviado correctamente");
      onSaved();
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500";

  return (
    <ModalBase title="Enviar recordatorio" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800 dark:text-purple-300">
              <p className="font-semibold mb-1">Enviar recordatorio de cita</p>
              <p>Se enviará un recordatorio al paciente <strong>{cita.paciente_nombre}</strong> para su cita del <strong>{new Date(cita.fecha_hora_inicio).toLocaleString()}</strong>.</p>
            </div>
          </div>
        </div>

        <Field label="Tipo de recordatorio" required>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTipo("email")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                tipo === "email"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              <Mail className={`w-6 h-6 ${tipo === "email" ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
              <span className={`text-sm font-semibold ${tipo === "email" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`}>
                Email
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTipo("sms")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                tipo === "sms"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              <MessageSquare className={`w-6 h-6 ${tipo === "sms" ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
              <span className={`text-sm font-semibold ${tipo === "sms" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`}>
                SMS
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTipo("whatsapp")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                tipo === "whatsapp"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              <Phone className={`w-6 h-6 ${tipo === "whatsapp" ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
              <span className={`text-sm font-semibold ${tipo === "whatsapp" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`}>
                WhatsApp
              </span>
            </button>
          </div>
        </Field>

        <Field label="Mensaje personalizado (opcional)">
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            className={inputClass}
            rows={4}
            placeholder="Agregue un mensaje personalizado o deje en blanco para usar la plantilla predeterminada..."
          />
        </Field>

        <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Vista previa del mensaje</h5>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>Hola {cita.paciente_nombre},</p>
            <p>Le recordamos su cita médica:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Fecha: {new Date(cita.fecha_hora_inicio).toLocaleDateString()}</li>
              <li>Hora: {new Date(cita.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
              <li>Médico: {cita.medico_nombre}</li>
              <li>Centro: {cita.centro_nombre}</li>
            </ul>
            {mensaje && (
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <p>{mensaje}</p>
              </div>
            )}
            <p className="mt-3">¡Le esperamos!</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          disabled={sending}
          onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {sending && <Loader2 className="w-5 h-5 animate-spin" />}
          {sending ? "Enviando..." : "Enviar recordatorio"}
        </button>
      </div>
    </ModalBase>
  );
}