// frontend/src/app/(dashboard)/admin/examenes-medicos/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Edit, X, Search, UserCheck, Loader2, Download, Filter, Eye,
  Calendar, Activity, FileText, TrendingUp, Moon, Sun, BarChart3, List, Grid, RefreshCw,
  Printer, History, Shield, Trash2, Building2, Beaker, Microscope, ArrowLeft, Minus, CopyPlus
} from "lucide-react";

/* ==================== TIPOS ==================== */
type Theme = "light" | "dark";
type ViewMode = "table" | "cards";

type EstadoExamen =
  | "solicitado"
  | "programado"
  | "realizado"
  | "cancelado"
  | "resultados_disponibles"
  | "anulado"
  | (string & {});

type Prioridad = "normal" | "urgente" | "critica" | (string & {});

type Opcion = { value: number | string; label: string; [k: string]: any };

type Examen = {
  id_examen: number;
  id_paciente: number;
  id_tipo_examen: number;
  id_medico_solicitante: number;
  id_centro: number;
  fecha_solicitud: string;
  fecha_programada?: string | null;
  fecha_realizacion?: string | null;
  estado: EstadoExamen;
  prioridad: Prioridad;
  motivo_solicitud?: string | null;
  diagnostico?: string | null;
  codigo_cie10?: string | null;
  instrucciones_especificas?: string | null;
  notas_tecnicas?: string | null;
  id_profesional_realiza?: number | null;
  id_laboratorio?: number | null;
  numero_orden?: string | null;
  requiere_preparacion?: 0 | 1 | boolean;
  confirmacion_preparacion?: 0 | 1 | boolean;
  lugar_realizacion?: string | null;
  id_cita?: number | null;
  id_historial?: number | null;
  id_orden?: number | null;
  pagado?: 0 | 1 | boolean;
  costo?: number | null;
  cubierto_seguro?: 0 | 1 | boolean;

  // joined/calculados
  paciente_rut?: string;
  paciente_nombre?: string;
  tipo_examen_nombre?: string;
  tipo_examen_codigo?: string;
  tipo_examen_categoria?: string;
  medico_nombre?: string;
  centro_nombre?: string;
  nombre_laboratorio?: string;
  resultados_count?: number;
};

type Stats = {
  total_examenes: number;
  s_solicitado: number;
  s_programado: number;
  s_realizado: number;
  s_resultados: number;
  s_cancelado: number;
  s_anulado: number;
  p_normal: number;
  p_urgente: number;
  p_critica: number;
  pagados: number;
  requieren_preparacion: number;
  prep_confirmada: number;
  con_resultados: number;
} | null;

type BatchItem = {
  id_tipo_examen: string | number;
  fecha_programada?: string;
  requiere_preparacion?: boolean;
  confirmacion_preparacion?: boolean;
  id_laboratorio?: string | number;
  costo?: string | number;
  instrucciones_especificas?: string;
  notas_tecnicas?: string;
};

/* ==================== COMPONENTE PRINCIPAL ==================== */
export default function AdminExamenesPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showDashboard, setShowDashboard] = useState(true);

  const [loading, setLoading] = useState(true);
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [stats, setStats] = useState<Stats>(null);

  // filtros
  const [fSearch, setFSearch] = useState("");
  const [fEstado, setFEstado] = useState<"" | EstadoExamen>("");
  const [fPrioridad, setFPrioridad] = useState<"" | Prioridad>("");
  const [fTipo, setFTipo] = useState<string>("");
  const [fCentro, setFCentro] = useState<string>("");
  const [fMedico, setFMedico] = useState<string>("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [fConResultados, setFConResultados] = useState<"" | "0" | "1">("");
  const [fPagado, setFPagado] = useState<"" | "0" | "1">("");
  const [fReqPrep, setFReqPrep] = useState<"" | "0" | "1">("");
  const [fPrepConf, setFPrepConf] = useState<"" | "0" | "1">("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // opciones
  const [opTipos, setOpTipos] = useState<Opcion[]>([]);
  const [opCentros, setOpCentros] = useState<Opcion[]>([]);
  const [opMedicos, setOpMedicos] = useState<Opcion[]>([]);
  const [opLabs, setOpLabs] = useState<Opcion[]>([]);
const [enums, setEnums] = useState<{ estados: any[]; prioridades: any[] } | null>(null);

  // modales
  const [showCE, setShowCE] = useState(false);
  const [editExamen, setEditExamen] = useState<Examen | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleExamen, setDetalleExamen] = useState<Examen | null>(null);

  // selección
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const safeInt = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  /* ============ THEME ============ */
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    if (saved) setTheme(saved);
    else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  /* ============ NORMALIZADORES DE OPCIONES ============ */
  const toValueLabel = (arr: any[]): Opcion[] =>
    (Array.isArray(arr) ? arr : [])
      .map((r) => {
        const rawValue =
          r?.value ??
          r?.id ??
          r?.id_tipo_examen ??
          r?.id_centro ??
          r?.id_medico ??
          r?.id_laboratorio ??
          r?.id_paciente ??
          r?.id_integracion ??
          r?.codigo ??
          r?.rut ??
          null;

        const rawLabel =
          r?.label ??
          r?.nombre ??
          r?.titulo ??
          r?.descripcion ??
          (r?.codigo && r?.nombre ? `${r.codigo} — ${r.nombre}` : r?.codigo ?? null) ??
          (rawValue != null ? `- ${rawValue}` : null);

        if (rawValue == null || rawLabel == null) return null;

        const value =
          typeof rawValue === "object"
            ? rawValue.value ?? rawValue.id ?? JSON.stringify(rawValue)
            : rawValue;

        const label =
          typeof rawLabel === "object"
            ? rawLabel.label ??
              rawLabel.nombre ??
              rawLabel.titulo ??
              rawLabel.descripcion ??
              JSON.stringify(rawLabel)
            : rawLabel;

        return { value, label: String(label), ...r };
      })
      .filter(Boolean) as Opcion[];

  const normalizeEnums = (data: any) => {
    const estados: string[] =
      data?.enums?.estados ??
      data?.estados ??
      data?.estados_examen ??
      data?.opciones?.estados ??
      data?.opciones?.estados_examen ??
      [];

    const prioridades: string[] =
      data?.enums?.prioridades ??
      data?.prioridades ??
      data?.opciones?.prioridades ??
      [];

    return { estados, prioridades };
  };

  const normalizeOpcionesPayload = (data: any) => {
    const source = data?.opciones ?? data ?? {};
    const tipos =
      source?.tiposExamen ??
      source?.tipos_examenes ??
      data?.tiposExamen ??
      data?.tipos_examenes ??
      source?.tipos ??
      data?.tipos ??
      [];
    const centros = source?.centros ?? data?.centros ?? [];
    const medicos = source?.medicos ?? data?.medicos ?? [];
    const laboratorios = source?.laboratorios ?? data?.laboratorios ?? [];
    const enumsObj = normalizeEnums(data);
    return {
      opTipos: toValueLabel(tipos),
      opCentros: toValueLabel(centros),
      opMedicos: toValueLabel(medicos),
      opLabs: toValueLabel(laboratorios),
      enums: enumsObj,
    };
  };

  /* ============ OPCIONES (DINÁMICO) ============ */
  const fetchOpciones = useCallback(
    async (idCentro?: string) => {
      try {
        const url = new URL(`/api/admin/examenes-medicos/opciones`, window.location.origin);
        if (idCentro) url.searchParams.set("id_centro", idCentro);

        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();

        if (data?.success) {
          const { opTipos, opCentros, opMedicos, opLabs, enums } = normalizeOpcionesPayload(data);
          setOpCentros(opCentros);
          setOpMedicos(opMedicos);
          setOpLabs(opLabs);
          setEnums(enums);

          if (opTipos.length === 0) {
            try {
              const r2 = await fetch(`/api/admin/examenes-medicos/tipos?limit=10000`, { cache: "no-store" });
              const d2 = await r2.json();
              if (d2?.success) {
                const tipos2 =
                  d2?.tiposExamen ??
                  d2?.tipos_examen ??
                  d2?.tipos_examenes ??
                  d2?.opciones?.tiposExamen ??
                  [];
                setOpTipos(toValueLabel(tipos2));
              } else {
                setOpTipos([]);
              }
            } catch {
              setOpTipos([]);
            }
          } else {
            setOpTipos(opTipos);
          }
        } else {
          setOpTipos([]);
          setOpCentros([]);
          setOpMedicos([]);
          setOpLabs([]);
          setEnums({ estados: [], prioridades: [] });
        }
      } catch {
        setOpTipos([]);
        setOpCentros([]);
        setOpMedicos([]);
        setOpLabs([]);
        setEnums({ estados: [], prioridades: [] });
      }
    },
    []
  );

  // Carga inicial
  useEffect(() => {
    fetchOpciones();
  }, [fetchOpciones]);

  // Al cambiar Centro, refrescar médicos
  useEffect(() => {
    if (fCentro) fetchOpciones(fCentro);
  }, [fCentro, fetchOpciones]);

  /* ============ LISTADO ============ */
  const fetchExamenes = useCallback(
    async (page = pagina) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          pagina: String(page),
          pageSize: String(pageSize),
        });
        if (fSearch) qs.set("search", fSearch);
        if (fEstado) qs.set("estado", fEstado);
        if (fPrioridad) qs.set("prioridad", fPrioridad);
        if (fTipo) qs.set("id_tipo_examen", fTipo);
        if (fCentro) qs.set("id_centro", fCentro);
        if (fMedico) qs.set("id_medico", fMedico);
        if (fDesde) qs.set("desde", fDesde);
        if (fHasta) qs.set("hasta", fHasta);
        if (fConResultados) qs.set("con_resultados", fConResultados);
        if (fPagado) qs.set("pagado", fPagado);
        if (fReqPrep) qs.set("requiere_preparacion", fReqPrep);
        if (fPrepConf) qs.set("confirmacion_preparacion", fPrepConf);

        const res = await fetch(`/api/admin/examenes-medicos?${qs.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setExamenes(Array.isArray(data.examenes) ? data.examenes : []);
          setTotal(Number(data.total || 0));
          setPagina(Number(data.pagina || page));
          setStats(data.stats || null);
        } else {
          setExamenes([]);
          setTotal(0);
          setStats(null);
        }
      } catch {
        setExamenes([]);
        setTotal(0);
        setStats(null);
      } finally {
        setLoading(false);
      }
    },
    [
      pagina,
      pageSize,
      fSearch,
      fEstado,
      fPrioridad,
      fTipo,
      fCentro,
      fMedico,
      fDesde,
      fHasta,
      fConResultados,
      fPagado,
      fReqPrep,
      fPrepConf,
    ]
  );

  useEffect(() => {
    fetchExamenes(1);
  }, [
    pageSize,
    fEstado,
    fPrioridad,
    fTipo,
    fCentro,
    fMedico,
    fDesde,
    fHasta,
    fConResultados,
    fPagado,
    fReqPrep,
    fPrepConf,
    fetchExamenes,
  ]);

  const resetFiltros = () => {
    setFSearch("");
    setFEstado("");
    setFPrioridad("");
    setFTipo("");
    setFCentro("");
    setFMedico("");
    setFDesde("");
    setFHasta("");
    setFConResultados("");
    setFPagado("");
    setFReqPrep("");
    setFPrepConf("");
    fetchExamenes(1);
    fetchOpciones();
  };

  /* ============ CRUD ============ */
  const onCreate = () => {
    setEditExamen(null);
    setShowCE(true);
  };
  const onEdit = (e: Examen) => {
    setEditExamen(e);
    setShowCE(true);
  };
  const onDetalle = async (e: Examen) => {
    setDetalleExamen(e);
    setShowDetalle(true);
  };
  const onDelete = async (e: Examen) => {
    if (!confirm(`¿Eliminar el examen #${e.id_examen} (${e.tipo_examen_nombre || "sin tipo"})?`)) return;
    const res = await fetch(`/api/admin/examenes-medicos/${e.id_examen}`, { method: "DELETE" });
    const data = await res.json();
    if (data?.success) fetchExamenes();
    else alert(data?.error || "No se pudo eliminar");
  };
  const onToggleEstado = async (e: Examen, nuevoEstado: EstadoExamen) => {
    const res = await fetch(`/api/admin/examenes-medicos/${e.id_examen}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    const data = await res.json();
    if (data?.success) fetchExamenes();
  };

  const toggleSelect = (id: number) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectAllVisible = () => {
    setSelected((curr) => {
      if (curr.size === examenes.length) return new Set();
      return new Set(examenes.map((e) => e.id_examen));
    });
  };

  /* ============ EXPORT PLACEHOLDERS ============ */
  const exportCSV = () => alert("Exportando CSV…");
  const exportPDF = () => alert("Exportando PDF…");
  const printPage = () => window.print();

  /* ============ RENDER ============ */
  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botón Regresar */}
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Regresar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Beaker className="w-8 h-8 text-white" />
                </div>
                Exámenes Médicos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión premium de órdenes, realización y resultados</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>

            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`p-3 rounded-xl border transition-all shadow-sm ${
                showDashboard
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              title="Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Plus className="w-5 h-5" /> Nueva orden
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {showDashboard && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <StatCard icon={Beaker} label="Total exámenes" value={safeInt(stats?.total_examenes)} color="blue" subtitle={`${safeInt(stats?.con_resultados)} con resultados`} />
            <StatCard icon={Activity} label="En proceso" value={safeInt((stats?.s_solicitado ?? 0) + (stats?.s_programado ?? 0))} color="purple" trend={stats ? `Urgentes: ${safeInt(stats.p_urgente)}` : undefined} />
            <StatCard icon={Calendar} label="Realizados" value={safeInt(stats?.s_realizado)} color="green" />
            <StatCard icon={FileText} label="Resultados listos" value={safeInt(stats?.s_resultados)} color="orange" />
          </section>
        )}

        {/* FILTROS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80">
            <div className="grid md:grid-cols-7 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Buscar</label>
                <div className="relative">
                  <input
                    value={fSearch}
                    onChange={(e) => setFSearch(e.target.value)}
                    placeholder="N° orden, RUT, nombre paciente, código/nombre examen…"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  value={fEstado}
                  onChange={(e) => setFEstado(e.target.value as EstadoExamen | "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {(enums?.estados || []).map((x) => <option key={x} value={x}>{String(x)}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Prioridad</label>
                <select
                  value={fPrioridad}
                  onChange={(e) => setFPrioridad(e.target.value as Prioridad | "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas</option>
                  {(enums?.prioridades || []).map((x) => <option key={x} value={x}>{String(x)}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Tipo examen</label>
                <select
                  value={fTipo}
                  onChange={(e) => setFTipo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {opTipos.map((o) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Centro</label>
                <select
                  value={fCentro}
                  onChange={(e) => setFCentro(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {opCentros.map((o) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Médico</label>
                <select
                  value={fMedico}
                  onChange={(e) => setFMedico(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {opMedicos.map((o) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" /> {showAdvanced ? "Menos" : "Más"}
                </button>
              </div>
            </div>

            {showAdvanced && (
              <div className="grid md:grid-cols-7 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Desde</label>
                  <input type="date" value={fDesde} onChange={(e) => setFDesde(e.target.value)}
                         className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"/>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Hasta</label>
                  <input type="date" value={fHasta} onChange={(e) => setFHasta(e.target.value)}
                         className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"/>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Con resultados</label>
                  <select value={fConResultados} onChange={(e) => setFConResultados(e.target.value as any)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Pagado</label>
                  <select value={fPagado} onChange={(e) => setFPagado(e.target.value as any)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Req. preparación</label>
                  <select value={fReqPrep} onChange={(e) => setFReqPrep(e.target.value as any)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Prep. confirmada</label>
                  <select value={fPrepConf} onChange={(e) => setFPrepConf(e.target.value as any)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFiltros}
                    className="w-full rounded-xl px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => fetchExamenes(1)}
                className="flex-1 rounded-xl px-4 py-2.5 bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all font-semibold shadow-md"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-600 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-lg transition-all ${viewMode === "cards" ? "bg-white dark:bg-gray-600 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-600"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>

            {selected.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">{selected.size} seleccionados</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={exportPDF} className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={printPage} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={() => fetchExamenes(pagina)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* CONTENIDO */}
        {viewMode === "table" ? (
          <TableView
            examenes={examenes}
            loading={loading}
            selected={selected}
            toggleSelect={toggleSelect}
            selectAllVisible={selectAllVisible}
            onEdit={onEdit}
            onDelete={onDelete}
            onDetalle={onDetalle}
            onToggleEstado={onToggleEstado}
          />
        ) : (
          <CardsView
            examenes={examenes}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onDetalle={onDetalle}
          />
        )}

        {/* PAGINACIÓN */}
        {!loading && examenes.length > 0 && (
          <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Mostrando {(pagina - 1) * pageSize + 1} - {Math.min(pagina * pageSize, total)} de {total} exámenes
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina <= 1}
                onClick={() => {
                  setPagina(pagina - 1);
                  fetchExamenes(pagina - 1);
                }}
              >
                Anterior
              </button>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
                Página {pagina} de {Math.ceil(total / pageSize)}
              </div>
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina * pageSize >= total}
                onClick={() => {
                  setPagina(pagina + 1);
                  fetchExamenes(pagina + 1);
                }}
              >
                Siguiente
              </button>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}/pág</option>
                ))}
              </select>
            </div>
          </section>
        )}
      </div>

      {/* MODALES */}
      {showCE && (
        <ModalCrearEditarExamen
          onClose={() => setShowCE(false)}
          onSaved={() => {
            setShowCE(false);
            fetchExamenes();
          }}
          editExamen={editExamen}
          opciones={{ opTipos, opCentros, opMedicos, opLabs, enums }}
          theme={theme}
        />
      )}

      {showDetalle && detalleExamen && (
        <ModalDetalleExamen examen={detalleExamen} onClose={() => setShowDetalle(false)} theme={theme} />
      )}
    </div>
  );
}

/* ==================== AUX: UI ==================== */
function StatCard({
  icon: Icon, label, value, color, trend, subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "orange";
  trend?: string;
  subtitle?: string;
}) {
  const colorClasses =
    { blue: "from-cyan-600 to-indigo-600", green: "from-green-500 to-green-600", purple: "from-purple-500 to-purple-600", orange: "from-orange-500 to-orange-600" }[color] ||
    "from-cyan-600 to-indigo-600";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
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

function TableView({
  examenes, loading, selected, toggleSelect, selectAllVisible, onEdit, onDelete, onDetalle, onToggleEstado,
}: any) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
            <tr className="text-left">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selected.size === examenes.length && examenes.length > 0}
                  onChange={selectAllVisible}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">N° Orden</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Paciente</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Tipo</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Centro</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Prioridad</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Fechas</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Resultados</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" /></td></tr>
            ) : examenes.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-20 text-center">
                <Microscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron exámenes</p>
              </td></tr>
            ) : (
              examenes.map((e: Examen) => {
                const badgeEstado =
                  e.estado === "resultados_disponibles" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" :
                  e.estado === "realizado" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                  e.estado === "programado" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                  e.estado === "cancelado" || e.estado === "anulado" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" :
                  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";

                const badgePrior =
                  e.prioridad === "critica" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                  e.prioridad === "urgente" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" :
                  "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";

                return (
                  <tr key={e.id_examen} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(e.id_examen)} onChange={() => toggleSelect(e.id_examen)}
                             className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"/>
                    </td>
                    <td className="px-4 py-4 font-mono">{e.numero_orden || `#${e.id_examen}`}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {(e.paciente_nombre || "?").charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{e.paciente_nombre}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">RUT: {e.paciente_rut}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900 dark:text-white">{e.tipo_examen_nombre}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{e.tipo_examen_codigo} · {e.tipo_examen_categoria}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Building2 className="w-4 h-4" /> <span className="text-sm">{e.centro_nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgePrior}`}>{e.prioridad}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeEstado}`}>{String(e.estado).replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        <div><b>Solicitud:</b> {e.fecha_solicitud ? new Date(e.fecha_solicitud).toLocaleString() : "—"}</div>
                        {e.fecha_programada && <div><b>Programada:</b> {new Date(e.fecha_programada).toLocaleString()}</div>}
                        {e.fecha_realizacion && <div><b>Realizada:</b> {new Date(e.fecha_realizacion).toLocaleString()}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{e.resultados_count ?? 0} archivo(s)</div>
                      {e.nombre_laboratorio && <div className="text-xs text-gray-500 dark:text-gray-400">{e.nombre_laboratorio}</div>}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => onDetalle(e)} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(e)} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        {e.estado !== "realizado" && e.estado !== "resultados_disponibles" && (
                          <button onClick={() => onToggleEstado(e, "realizado")} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all" title="Marcar realizado">
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => onDelete(e)} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title="Eliminar">
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CardsView({ examenes, loading, onEdit, onDelete, onDetalle }: any) {
  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div>;
  }
  if (examenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <Microscope className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron exámenes</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {examenes.map((e: Examen) => (
        <div key={e.id_examen} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {(e.paciente_nombre || "?").charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {e.paciente_nombre}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{e.paciente_rut}</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {e.prioridad}
            </span>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Beaker className="w-4 h-4" /> <span>{e.tipo_examen_nombre}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Building2 className="w-4 h-4" /> <span>{e.centro_nombre}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4" /> <span>Solicitud: {e.fecha_solicitud ? new Date(e.fecha_solicitud).toLocaleString() : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4" /> <span>Resultados: {e.resultados_count ?? 0}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => onDetalle(e)} className="flex-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 font-medium text-sm">
              <Eye className="w-4 h-4" /> Ver
            </button>
            <button onClick={() => onEdit(e)} className="flex-1 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all flex items-center justify-center gap-2 font-medium text-sm">
              <Edit className="w-4 h-4" /> Editar
            </button>
            <button onClick={() => onDelete(e)} className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex items-center justify-center font-medium text-sm">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==================== MODALES ==================== */
function ModalBase({
  title, children, onClose, theme, size = "default",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  theme?: Theme;
  size?: "default" | "large" | "xl";
}) {
  const sizeClasses = ({ default: "max-w-3xl", large: "max-w-5xl", xl: "max-w-7xl" } as Record<string, string>)[size];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
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

function ModalCrearEditarExamen({ editExamen, opciones, onClose, onSaved, theme }: any) {
  const [saving, setSaving] = useState(false);
  const [multiMode, setMultiMode] = useState<boolean>(!editExamen ? false : false);
  const [items, setItems] = useState<BatchItem[]>([]);

  const [form, setForm] = useState<any>(() => {
    if (!editExamen)
      return {
        id_paciente: "",
        id_tipo_examen: "",
        id_medico_solicitante: "",
        id_centro: "",
        fecha_solicitud: new Date().toISOString().slice(0, 16),
        fecha_programada: "",
        estado: "solicitado",
        prioridad: "normal",
        motivo_solicitud: "",
        diagnostico: "",
        codigo_cie10: "",
        instrucciones_especificas: "",
        notas_tecnicas: "",
        id_profesional_realiza: "",
        id_laboratorio: "",
        numero_orden: "",
        requiere_preparacion: 0,
        confirmacion_preparacion: 0,
        lugar_realizacion: "",
        id_cita: "",
        id_historial: "",
        id_orden: "",
        pagado: 0,
        costo: "",
        cubierto_seguro: 0,
      };
    const e = editExamen;
    return {
      ...e,
      fecha_solicitud: e.fecha_solicitud ? e.fecha_solicitud.slice(0, 16) : "",
      fecha_programada: e.fecha_programada ? e.fecha_programada.slice(0, 16) : "",
      fecha_realizacion: e.fecha_realizacion ? e.fecha_realizacion.slice(0, 16) : "",
    };
  });

  const input = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all";

  const addItem = () => {
    setItems((arr) => [
      ...arr,
      {
        id_tipo_examen: "",
        fecha_programada: "",
        requiere_preparacion: Boolean(form.requiere_preparacion),
        confirmacion_preparacion: Boolean(form.confirmacion_preparacion),
        id_laboratorio: form.id_laboratorio || "",
        costo: "",
        instrucciones_especificas: "",
        notas_tecnicas: "",
      },
    ]);
  };
  const removeItem = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<BatchItem>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const submit = async () => {
    setSaving(true);
    try {
      // PUT si edición
      if (editExamen) {
        const payload = {
          ...form,
          id_paciente: Number(form.id_paciente || 0),
          id_tipo_examen: Number(form.id_tipo_examen || 0),
          id_medico_solicitante: Number(form.id_medico_solicitante || 0),
          id_centro: Number(form.id_centro || 0),
          id_profesional_realiza: form.id_profesional_realiza ? Number(form.id_profesional_realiza) : null,
          id_laboratorio: form.id_laboratorio ? Number(form.id_laboratorio) : null,
          id_cita: form.id_cita ? Number(form.id_cita) : null,
          id_historial: form.id_historial ? Number(form.id_historial) : null,
          id_orden: form.id_orden ? Number(form.id_orden) : null,
          pagado: form.pagado ? 1 : 0,
          requiere_preparacion: form.requiere_preparacion ? 1 : 0,
          confirmacion_preparacion: form.confirmacion_preparacion ? 1 : 0,
          cubierto_seguro: form.cubierto_seguro ? 1 : 0,
        };
        const url = `/api/admin/examenes-medicos/${editExamen.id_examen}`;
        const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!data?.success) {
          alert(data?.error || "Error al guardar");
          return;
        }
        onSaved();
        return;
      }

      // POST (crear 1 o muchos)
      const header = {
        id_paciente: Number(form.id_paciente || 0),
        id_medico_solicitante: Number(form.id_medico_solicitante || 0),
        id_centro: Number(form.id_centro || 0),
        estado: form.estado,
        prioridad: form.prioridad,
        numero_orden: form.numero_orden || undefined,
        fecha_solicitud: form.fecha_solicitud,
        motivo_solicitud: form.motivo_solicitud || null,
        diagnostico: form.diagnostico || null,
        codigo_cie10: form.codigo_cie10 || null,
        instrucciones_especificas: form.instrucciones_especificas || null,
        notas_tecnicas: form.notas_tecnicas || null,
        requiere_preparacion: !!form.requiere_preparacion,
        confirmacion_preparacion: !!form.confirmacion_preparacion,
        id_profesional_realiza: form.id_profesional_realiza ? Number(form.id_profesional_realiza) : null,
        id_laboratorio: form.id_laboratorio ? Number(form.id_laboratorio) : null,
        lugar_realizacion: form.lugar_realizacion || null,
        id_cita: form.id_cita ? Number(form.id_cita) : null,
        id_historial: form.id_historial ? Number(form.id_historial) : null,
        id_orden: form.id_orden ? Number(form.id_orden) : null,
        pagado: !!form.pagado,
        costo: form.costo !== "" && form.costo != null ? Number(form.costo) : null,
        cubierto_seguro: !!form.cubierto_seguro,
      };

      let body: any;

      if (multiMode) {
        const itemsPayload = items
          .filter((it) => it.id_tipo_examen !== "" && it.id_tipo_examen != null)
          .map((it) => ({
            id_tipo_examen: Number(it.id_tipo_examen),
            fecha_programada: it.fecha_programada ? String(it.fecha_programada) : null,
            requiere_preparacion: it.requiere_preparacion ?? header.requiere_preparacion,
            confirmacion_preparacion: it.confirmacion_preparacion ?? header.confirmacion_preparacion,
            instrucciones_especificas: it.instrucciones_especificas || header.instrucciones_especificas,
            notas_tecnicas: it.notas_tecnicas || header.notas_tecnicas,
            id_laboratorio: it.id_laboratorio ? Number(it.id_laboratorio) : header.id_laboratorio,
            costo: it.costo !== "" && it.costo != null ? Number(it.costo) : header.costo,
          }));

        if (!itemsPayload.length) {
          alert("Agrega al menos 1 examen en el listado.");
          return;
        }
        body = { ...header, items: itemsPayload };
      } else {
        const single = {
          ...header,
          id_tipo_examen: Number(form.id_tipo_examen || 0),
          fecha_programada: form.fecha_programada || null,
          fecha_realizacion: form.fecha_realizacion || null,
        };
        if (!single.id_tipo_examen) {
          alert("Selecciona el tipo de examen.");
          return;
        }
        body = single;
      }

      const url = `/api/admin/examenes-medicos`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data?.success) {
        alert(data?.error || "Error al guardar");
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase title={editExamen ? "Editar examen" : "Nueva orden de examen"} onClose={onClose} theme={theme} size="large">
      {/* Switch multi */}
      {!editExamen && (
        <div className="mb-4 flex items-center gap-3">
          <input
            id="multiMode"
            type="checkbox"
            className="w-5 h-5 accent-indigo-600"
            checked={multiMode}
            onChange={(e) => setMultiMode(e.target.checked)}
          />
          <label htmlFor="multiMode" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Crear varios exámenes con una sola orden
          </label>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Paciente (ID)" required>
          <input value={form.id_paciente} onChange={(e) => setForm((f: any) => ({ ...f, id_paciente: e.target.value }))} className={input} placeholder="ID de paciente" />
        </Field>

        {/* si NO es multi: selector único de tipo */}
        {!multiMode && (
          <Field label="Tipo de examen" required>
            <select value={form.id_tipo_examen} onChange={(e) => setForm((f: any) => ({ ...f, id_tipo_examen: e.target.value }))} className={input}>
              <option value="">Seleccione…</option>
              {opciones.opTipos.map((o: Opcion) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
            </select>
          </Field>
        )}

        <Field label="Médico solicitante" required>
          <select value={form.id_medico_solicitante} onChange={(e) => setForm((f: any) => ({ ...f, id_medico_solicitante: e.target.value }))} className={input}>
            <option value="">Seleccione…</option>
            {opciones.opMedicos.map((o: Opcion) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
          </select>
        </Field>

        <Field label="Centro" required>
          <select value={form.id_centro} onChange={(e) => setForm((f: any) => ({ ...f, id_centro: e.target.value }))} className={input}>
            <option value="">Seleccione…</option>
            {opciones.opCentros.map((o: Opcion) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
          </select>
        </Field>

        {/* Campos comunes del encabezado */}
        <Field label="Laboratorio (por defecto)">
          <select value={form.id_laboratorio} onChange={(e) => setForm((f: any) => ({ ...f, id_laboratorio: e.target.value }))} className={input}>
            <option value="">—</option>
            {opciones.opLabs.map((o: Opcion) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
          </select>
        </Field>
        <Field label="Lugar de realización">
          <input value={form.lugar_realizacion} onChange={(e) => setForm((f: any) => ({ ...f, lugar_realizacion: e.target.value }))} className={input} placeholder="Ej. Laboratorio central" />
        </Field>

        <Field label="Fecha de solicitud" required>
          <input type="datetime-local" value={form.fecha_solicitud} onChange={(e) => setForm((f: any) => ({ ...f, fecha_solicitud: e.target.value }))} className={input} />
        </Field>

        {/* si NO es multi: programada/realización individuales */}
        {!multiMode && (
          <>
            <Field label="Fecha programada">
              <input type="datetime-local" value={form.fecha_programada} onChange={(e) => setForm((f: any) => ({ ...f, fecha_programada: e.target.value }))} className={input} />
            </Field>
            {editExamen && (
              <Field label="Fecha realización">
                <input type="datetime-local" value={form.fecha_realizacion || ""} onChange={(e) => setForm((f: any) => ({ ...f, fecha_realizacion: e.target.value }))} className={input} />
              </Field>
            )}
          </>
        )}

        <Field label="Estado" required>
          <select value={form.estado} onChange={(e) => setForm((f: any) => ({ ...f, estado: e.target.value }))} className={input}>
            {(opciones.enums?.estados || []).map((x: string) => <option key={x} value={x}>{String(x)}</option>)}
          </select>
        </Field>
        <Field label="Prioridad" required>
          <select value={form.prioridad} onChange={(e) => setForm((f: any) => ({ ...f, prioridad: e.target.value }))} className={input}>
            {(opciones.enums?.prioridades || []).map((x: string) => <option key={x} value={x}>{String(x)}</option>)}
          </select>
        </Field>
        <Field label="Número de orden">
          <input value={form.numero_orden} onChange={(e) => setForm((f: any) => ({ ...f, numero_orden: e.target.value }))} className={input} placeholder="Se puede autogenerar" />
        </Field>

        <Field label="Motivo / Indicación">
          <input value={form.motivo_solicitud} onChange={(e) => setForm((f: any) => ({ ...f, motivo_solicitud: e.target.value }))} className={input} />
        </Field>
        <Field label="Diagnóstico">
          <input value={form.diagnostico} onChange={(e) => setForm((f: any) => ({ ...f, diagnostico: e.target.value }))} className={input} />
        </Field>
        <Field label="CIE-10">
          <input value={form.codigo_cie10} onChange={(e) => setForm((f: any) => ({ ...f, codigo_cie10: e.target.value }))} className={input} />
        </Field>

        <Field label="Requiere preparación (por defecto)">
          <select value={form.requiere_preparacion ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, requiere_preparacion: e.target.value === "1" }))} className={input}>
            <option value="0">No</option><option value="1">Sí</option>
          </select>
        </Field>
        <Field label="Preparación confirmada (por defecto)">
          <select value={form.confirmacion_preparacion ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, confirmacion_preparacion: e.target.value === "1" }))} className={input}>
            <option value="0">No</option><option value="1">Sí</option>
          </select>
        </Field>
        <Field label="Costo (por defecto, CLP)">
          <input type="number" value={form.costo} onChange={(e) => setForm((f: any) => ({ ...f, costo: e.target.value }))} className={input} />
        </Field>

        <Field label="Pagado">
          <select value={form.pagado ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, pagado: e.target.value === "1" }))} className={input}>
            <option value="0">No</option><option value="1">Sí</option>
          </select>
        </Field>
        <Field label="Cubierto por seguro">
          <select value={form.cubierto_seguro ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, cubierto_seguro: e.target.value === "1" }))} className={input}>
            <option value="0">No</option><option value="1">Sí</option>
          </select>
        </Field>
        <Field label="Instrucciones específicas (por defecto)">
          <input value={form.instrucciones_especificas} onChange={(e) => setForm((f: any) => ({ ...f, instrucciones_especificas: e.target.value }))} className={input} />
        </Field>
        <div className="md:col-span-3">
          <Field label="Notas técnicas (por defecto)">
            <textarea value={form.notas_tecnicas} onChange={(e) => setForm((f: any) => ({ ...f, notas_tecnicas: e.target.value }))} className={input} rows={3} />
          </Field>
        </div>
      </div>

      {/* Editor de items cuando es multi */}
      {multiMode && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <CopyPlus className="w-4 h-4" /> Exámenes a crear
            </h4>
            <button
              onClick={addItem}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-700 hover:to-indigo-700 transition-all flex items-center gap-2 text-sm shadow"
            >
              <Plus className="w-4 h-4" /> Agregar examen
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm">
              No hay exámenes agregados. Usa “Agregar examen”.
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-xs md:text-sm bg-white dark:bg-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700/60">
                  <tr>
                    <th className="p-2 text-left">Tipo examen</th>
                    <th className="p-2 text-left">Fecha programada</th>
                    <th className="p-2 text-left">Req. prep</th>
                    <th className="p-2 text-left">Prep ok</th>
                    <th className="p-2 text-left">Laboratorio</th>
                    <th className="p-2 text-left">Costo</th>
                    <th className="p-2 text-left">Instrucciones</th>
                    <th className="p-2 text-left">Notas</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="p-2 min-w-[220px]">
                        <select
                          value={String(it.id_tipo_examen ?? "")}
                          onChange={(e) => updateItem(idx, { id_tipo_examen: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        >
                          <option value="">Seleccione…</option>
                          {opciones.opTipos.map((o: Opcion) => (
                            <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="datetime-local"
                          value={it.fecha_programada || ""}
                          onChange={(e) => updateItem(idx, { fecha_programada: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={it.requiere_preparacion ? "1" : "0"}
                          onChange={(e) => updateItem(idx, { requiere_preparacion: e.target.value === "1" })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        >
                          <option value="0">No</option><option value="1">Sí</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={it.confirmacion_preparacion ? "1" : "0"}
                          onChange={(e) => updateItem(idx, { confirmacion_preparacion: e.target.value === "1" })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        >
                          <option value="0">No</option><option value="1">Sí</option>
                        </select>
                      </td>
                      <td className="p-2 min-w-[200px]">
                        <select
                          value={String(it.id_laboratorio ?? "")}
                          onChange={(e) => updateItem(idx, { id_laboratorio: e.target.value })}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        >
                          <option value="">—</option>
                          {opciones.opLabs.map((o: Opcion) => (
                            <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={String(it.costo ?? "")}
                          onChange={(e) => updateItem(idx, { costo: e.target.value })}
                          className="w-28 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={it.instrucciones_especificas || ""}
                          onChange={(e) => updateItem(idx, { instrucciones_especificas: e.target.value })}
                          className="w-56 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={it.notas_tecnicas || ""}
                          onChange={(e) => updateItem(idx, { notas_tecnicas: e.target.value })}
                          className="w-56 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                          title="Quitar"
                        >
                          <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300">
          Cancelar
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-700 hover:to-indigo-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalDetalleExamen({ examen, onClose, theme }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/examenes-medicos/${examen.id_examen}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success) setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, [examen?.id_examen]);

  return (
    <ModalBase title={`Detalle examen #${examen.id_examen}`} onClose={onClose} theme={theme} size="large">
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div>
      ) : !data ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No se pudo cargar</p>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <InfoBox title="Paciente" icon={Users}>
              <InfoItem label="Nombre" value={data.examen.paciente_nombre} />
              <InfoItem label="RUT" value={data.examen.paciente_rut} />
              <InfoItem label="Centro" value={data.examen.centro_nombre} icon={Building2} />
            </InfoBox>
            <InfoBox title="Examen" icon={Beaker}>
              <InfoItem label="Tipo" value={data.examen.tipo_examen_nombre} />
              <InfoItem label="Código" value={data.examen.tipo_examen_codigo} />
              <InfoItem label="Categoría" value={data.examen.tipo_examen_categoria} />
            </InfoBox>
            <InfoBox title="Estado" icon={History}>
              <InfoItem label="Estado" value={data.examen.estado} />
              <InfoItem label="Prioridad" value={data.examen.prioridad} />
              <InfoItem label="N° Orden" value={data.examen.numero_orden || "—"} />
            </InfoBox>
            <InfoBox title="Fechas" icon={Calendar}>
              <InfoItem label="Solicitud" value={data.examen.fecha_solicitud ? new Date(data.examen.fecha_solicitud).toLocaleString() : "—"} />
              <InfoItem label="Programada" value={data.examen.fecha_programada ? new Date(data.examen.fecha_programada).toLocaleString() : "—"} />
              <InfoItem label="Realización" value={data.examen.fecha_realizacion ? new Date(data.examen.fecha_realizacion).toLocaleString() : "—"} />
            </InfoBox>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Resultados ({data.resultados?.length || 0})
            </h3>
            {data.resultados?.length ? (
              <ul className="space-y-2 text-sm">
                {data.resultados.map((r: any) => (
                  <li key={r.id_resultado} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{r.titulo}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {r.formato} · {r.estado} · {r.fecha_resultado ? new Date(r.fecha_resultado).toLocaleString() : "—"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {r.es_critico ? <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">Crítico</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Sin resultados aún.</p>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all font-semibold shadow-lg">
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}

function InfoBox({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function InfoItem({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
        {Icon && <Icon className="w-4 h-4" />}
        {label}:
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
