// frontend/src/app/(dashboard)/admin/historial-clinico/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar,
  Plus,
  Edit,
  Clock,
  X,
  Search,
  CheckSquare,
  Archive,
  Trash2,
  Building2,
  Stethoscope,
  User,
  Loader2,
  Download,
  Filter,
  Eye,
  Mail,
  Phone,
  FileText,
  Shield,
  ShieldCheck,
  Moon,
  Sun,
  List,
  Grid,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  FilePlus2,
  FileCheck2,
  Target,
  Bookmark,
} from "lucide-react";

/* ==================== TIPOS ==================== */
type Opcion = { value: number | string; label: string; [k: string]: any };
type ViewMode = "table" | "cards";
type Theme = "light" | "dark";
type EstadoHC = "borrador" | "firmado" | "bloqueado" | "archivado";

type HistorialClinico = {
  id_historial: number;
  id_paciente: number;
  id_medico: number;
  id_centro: number;
  fecha_atencion: string;
  titulo?: string | null;
  tipo_documento: string;
  resumen?: string | null;
  diagnostico?: string | null;
  procedimientos?: string | null;
  indicaciones?: string | null;
  recetas?: string | null;
  adjuntos?: number | null;
  confidencial?: 0 | 1;
  firmado?: 0 | 1;
  estado: EstadoHC;
  paciente_nombre: string;
  paciente_rut: string;
  paciente_email?: string | null;
  paciente_telefono?: string | null;
  medico_nombre: string;
  medico_especialidad?: string | null;
  centro_nombre: string;
  fecha_creacion?: string | null;
  fecha_modificacion?: string | null;
};

type EstadisticasHC = {
  total: number;
  firmados: number;
  borradores: number;
  archivados: number;
  bloqueados: number;
};

/* ==================== CONSTANTES ==================== */
const estadoBadge: Record<
  EstadoHC,
  { bg: string; text: string; icon: any; label: string }
> = {
  borrador: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: FileText,
    label: "Borrador",
  },
  firmado: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: ShieldCheck,
    label: "Firmado",
  },
  bloqueado: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: Shield,
    label: "Bloqueado",
  },
  archivado: {
    bg: "bg-gray-200 dark:bg-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    icon: Archive,
    label: "Archivado",
  },
};

const tipoBadge: Record<
  string,
  { bg: string; text: string; icon: any; fallback?: boolean }
> = {
  Consulta: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: Calendar,
  },
  Epicrisis: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    icon: FileCheck2,
  },
  "Indicación": {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
    icon: Target,
  },
  Procedimiento: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    icon: Stethoscope,
  },
  default: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    icon: Bookmark,
    fallback: true,
  },
};

/* ==================== PRINCIPAL ==================== */
export default function AdminHistorialClinicoPage() {
  // Tema / vista
  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Data
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState<HistorialClinico[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Estadísticas
  const [stats, setStats] = useState<EstadisticasHC>({
    total: 0,
    firmados: 0,
    borradores: 0,
    archivados: 0,
    bloqueados: 0,
  });

  // Filtros
  const [fCentro, setFCentro] = useState<number | "">("");
  const [fMedico, setFMedico] = useState<number | "">("");
  const [fPaciente, setFPaciente] = useState<number | "">("");
  const [fEstado, setFEstado] = useState<EstadoHC | "">("");
  const [fTipo, setFTipo] = useState<string>("");
  const [fConfidencial, setFConfidencial] = useState<"" | "0" | "1">("");
  const [fFirmado, setFFirmado] = useState<"" | "0" | "1">("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [fSearch, setFSearch] = useState("");

  // Opciones
  const [opCentros, setOpCentros] = useState<Opcion[]>([]);
  const [opMedicos, setOpMedicos] = useState<Opcion[]>([]);
  const [opPacientes, setOpPacientes] = useState<Opcion[]>([]);
  const [opTipos, setOpTipos] = useState<Opcion[]>([]);

  // Selección
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBulk, setShowBulk] = useState(false);

  // Modales
  const [showModalCE, setShowModalCE] = useState(false);
  const [editHC, setEditHC] = useState<HistorialClinico | null>(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [detalleHC, setDetalleHC] = useState<HistorialClinico | null>(null);
  const [showModalFirmar, setShowModalFirmar] = useState(false);
  const [firmarHC, setFirmarHC] = useState<HistorialClinico | null>(null);
  const [showModalArchivar, setShowModalArchivar] = useState(false);
  const [archivarHC, setArchivarHC] = useState<HistorialClinico | null>(null);

  /* ==================== HELPERS ==================== */
  const safeInt = (v: any, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : d;
  };

  /* ==================== EFECTOS ==================== */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cargar opciones dinámicas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/historial-clinico/opciones");
        const data = await res.json();
        if (data?.success) {
          setOpCentros(data.centros || []);
          setOpMedicos(data.medicos || []);
          setOpPacientes(data.pacientes || []);
          setOpTipos(data.tipos || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Listado
  const fetchRegistros = useCallback(
    async (page = pagina) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          pagina: String(page),
          pageSize: String(pageSize),
        });
        if (fCentro) params.append("id_centro", String(fCentro));
        if (fMedico) params.append("id_medico", String(fMedico));
        if (fPaciente) params.append("id_paciente", String(fPaciente));
        if (fEstado) params.append("estado", String(fEstado));
        if (fTipo) params.append("tipo_documento", String(fTipo));
        if (fConfidencial) params.append("confidencial", fConfidencial);
        if (fFirmado) params.append("firmado", fFirmado);
        if (fDesde) params.append("desde", fDesde);
        if (fHasta) params.append("hasta", fHasta);
        if (fSearch) params.append("search", fSearch);

        const res = await fetch(`/api/admin/historial-clinico?${params.toString()}`);
        const data = await res.json();

        if (data?.success) {
          setRegistros(data.items || []);
          setTotal(Number(data.total || 0));
          setPagina(Number(data.pagina || page));
          if (data.stats) {
            setStats({
              total: safeInt(data.stats.total),
              firmados: safeInt(data.stats.firmados),
              borradores: safeInt(data.stats.borradores),
              archivados: safeInt(data.stats.archivados),
              bloqueados: safeInt(data.stats.bloqueados),
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [
      pagina,
      pageSize,
      fCentro,
      fMedico,
      fPaciente,
      fEstado,
      fTipo,
      fConfidencial,
      fFirmado,
      fDesde,
      fHasta,
      fSearch,
    ]
  );

  useEffect(() => {
    fetchRegistros(1);
  }, [
    pageSize,
    fCentro,
    fMedico,
    fPaciente,
    fEstado,
    fTipo,
    fConfidencial,
    fFirmado,
    fDesde,
    fHasta,
  ]);

  /* ==================== ACCIONES ==================== */
  const resetFiltros = () => {
    setFCentro("");
    setFMedico("");
    setFPaciente("");
    setFEstado("");
    setFTipo("");
    setFConfidencial("");
    setFFirmado("");
    setFDesde("");
    setFHasta("");
    setFSearch("");
    fetchRegistros(1);
  };

  const onCreate = () => {
    setEditHC(null);
    setShowModalCE(true);
  };
  const onEdit = (r: HistorialClinico) => {
    setEditHC(r);
    setShowModalCE(true);
  };
  const onDetalle = (r: HistorialClinico) => {
    setDetalleHC(r);
    setShowModalDetalle(true);
  };
  const onFirmar = (r: HistorialClinico) => {
    setFirmarHC(r);
    setShowModalFirmar(true);
  };
  const onArchivar = (r: HistorialClinico) => {
    setArchivarHC(r);
    setShowModalArchivar(true);
  };
  const onDelete = async (r: HistorialClinico) => {
    if (!confirm("¿Eliminar este registro de historial clínico?")) return;
    const res = await fetch(`/api/admin/historial-clinico/${r.id_historial}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data?.success) return alert(data?.error || "No se pudo eliminar");
    fetchRegistros(pagina);
  };

  const toggleSelect = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    if (selected.size === registros.length) setSelected(new Set());
    else setSelected(new Set(registros.map((x) => x.id_historial)));
  };

  const bulkFirmar = async () => {
    if (selected.size === 0) return;
    alert("Funcionalidad de firma masiva en desarrollo");
  };

  const bulkArchivar = async () => {
    if (selected.size === 0) return;
    alert("Funcionalidad de archivado masivo en desarrollo");
  };

  const exportarCSV = () => alert("Exportando CSV...");
  const exportarPDF = () => alert("Exportando PDF...");
  const imprimir = () => window.print();

  /* ==================== RENDER ==================== */
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <FilePlus2 className="w-8 h-8 text-white" />
              </span>
              Historial Clínico
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestión avanzada de registros clínicos con firma, confidencialidad y auditoría.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title={theme === "light" ? "Modo oscuro" : "Modo claro"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            <button
              onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Cambiar vista"
            >
              {viewMode === "table" ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowBulk(!showBulk)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Acciones en lote"
            >
              <CheckSquare className="w-5 h-5" />
            </button>

            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Plus className="w-5 h-5" /> Nuevo registro
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
          <StatCard icon={FileText} label="Total" value={safeInt(stats.total)} color="blue" />
          <StatCard icon={ShieldCheck} label="Firmados" value={safeInt(stats.firmados)} color="green" />
          <StatCard icon={FileText} label="Borradores" value={safeInt(stats.borradores)} color="orange" />
          <StatCard icon={Archive} label="Archivados" value={safeInt(stats.archivados)} color="gray" />
          <StatCard icon={Shield} label="Bloqueados" value={safeInt(stats.bloqueados)} color="indigo" />
        </section>

        {/* FILTROS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80">
            <div className="grid md:grid-cols-6 gap-3">
              <SelectField label="Centro" value={String(fCentro)} onChange={(v) => setFCentro(v ? Number(v) : "")} options={opCentros} />
              <SelectField label="Médico" value={String(fMedico)} onChange={(v) => setFMedico(v ? Number(v) : "")} options={opMedicos} />
              <SelectField label="Paciente" value={String(fPaciente)} onChange={(v) => setFPaciente(v ? Number(v) : "")} options={opPacientes} />

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  value={String(fEstado)}
                  onChange={(e) => setFEstado(e.target.value as EstadoHC | "")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos</option>
                  {Object.keys(estadoBadge).map((es) => (
                    <option key={es} value={es}>
                      {estadoBadge[es as EstadoHC].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Tipo doc.</label>
                <select
                  value={String(fTipo)}
                  onChange={(e) => setFTipo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos</option>
                  {opTipos.map((o) => (
                    <option key={o.value} value={String(o.value)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowBulk((s) => !s)}
                  className="flex-1 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {showBulk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-6 gap-3 mt-3">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Buscar
                </label>
                <div className="relative">
                  <input
                    value={fSearch}
                    onChange={(e) => setFSearch(e.target.value)}
                    placeholder="Paciente, RUT, médico, título, diagnóstico..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <DateField label="Desde" value={fDesde} onChange={setFDesde} />
              <DateField label="Hasta" value={fHasta} onChange={setFHasta} />

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Confidencial
                </label>
                <select
                  value={fConfidencial}
                  onChange={(e) => setFConfidencial(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  <option value="1">Sí</option>
                  <option value="0">No</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => fetchRegistros(1)}
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
        </section>

        {/* TOOLBAR */}
        <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ToolbarBtn onClick={exportarCSV} title="Exportar CSV">
              <Download className="w-4 h-4" /> CSV
            </ToolbarBtn>
            <ToolbarBtn onClick={exportarPDF} title="Exportar PDF" variant="danger">
              <FileText className="w-4 h-4" /> PDF
            </ToolbarBtn>
            <ToolbarBtn onClick={imprimir} title="Imprimir" variant="neutral">
              <Printer className="w-4 h-4" />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => fetchRegistros(pagina)} title="Refrescar" variant="neutral">
              <RefreshCw className="w-4 h-4" />
            </ToolbarBtn>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {selected.size} seleccionados
              </span>
              <button
                onClick={bulkFirmar}
                className="ml-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-2 font-medium shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> Firmar
              </button>
              <button
                onClick={bulkArchivar}
                className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-all flex items-center gap-2 font-medium shadow-sm"
              >
                <Archive className="w-4 h-4" /> Archivar
              </button>
              <button
                onClick={() => {
                  setSelected(new Set());
                  setShowBulk(false);
                }}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          )}
        </section>

        {/* CONTENIDO */}
        {viewMode === "table" ? (
          <TableView
            registros={registros}
            loading={loading}
            selected={selected}
            toggleSelect={toggleSelect}
            selectAll={selectAll}
            onEdit={onEdit}
            onDetalle={onDetalle}
            onFirmar={onFirmar}
            onArchivar={onArchivar}
            onDelete={onDelete}
          />
        ) : (
          <CardsView
            registros={registros}
            loading={loading}
            onEdit={onEdit}
            onDetalle={onDetalle}
            onFirmar={onFirmar}
            onArchivar={onArchivar}
            onDelete={onDelete}
          />
        )}

        {/* PAGINACIÓN */}
        {!loading && registros.length > 0 && (
          <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Mostrando {Math.min((pagina - 1) * pageSize + 1, total)} -{" "}
              {Math.min(pagina * pageSize, total)} de {total} registros
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina <= 1}
                onClick={() => {
                  const p = pagina - 1;
                  setPagina(p);
                  fetchRegistros(p);
                }}
              >
                Anterior
              </button>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
                Página {pagina} de {Math.ceil(total / pageSize) || 1}
              </div>
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina * pageSize >= total}
                onClick={() => {
                  const p = pagina + 1;
                  setPagina(p);
                  fetchRegistros(p);
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
                  <option key={n} value={n}>
                    {n}/pág
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}
      </div>

      {/* MODALES */}
      {showModalCE && (
        <ModalCrearEditarHC
          onClose={() => setShowModalCE(false)}
          onSaved={() => {
            setShowModalCE(false);
            fetchRegistros(pagina);
          }}
          editHC={editHC}
          opciones={{ opCentros, opMedicos, opPacientes, opTipos }}
          theme={theme}
        />
      )}

      {showModalDetalle && detalleHC && (
        <ModalDetalleHC
          registro={detalleHC}
          onClose={() => setShowModalDetalle(false)}
          theme={theme}
        />
      )}

      {showModalFirmar && firmarHC && (
        <ModalFirmarHC
          registro={firmarHC}
          onClose={() => setShowModalFirmar(false)}
          onSigned={() => {
            setShowModalFirmar(false);
            fetchRegistros(pagina);
          }}
          theme={theme}
        />
      )}

      {showModalArchivar && archivarHC && (
        <ModalArchivarHC
          registro={archivarHC}
          onClose={() => setShowModalArchivar(false)}
          onArchived={() => {
            setShowModalArchivar(false);
            fetchRegistros(pagina);
          }}
          theme={theme}
        />
      )}
    </div>
  );
}

/* ==================== AUXILIARES UI ==================== */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: "blue" | "green" | "orange" | "gray" | "indigo";
}) {
  const colorClasses =
    {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      orange: "from-orange-500 to-orange-600",
      gray: "from-gray-500 to-gray-600",
      indigo: "from-indigo-500 to-indigo-600",
    }[color] || "from-gray-500 to-gray-600";

  const displayValue = value ?? "0";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{displayValue}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimos 30 días</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
  variant = "success",
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  variant?: "success" | "danger" | "neutral";
}) {
  const cls =
    variant === "success"
      ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
      : variant === "danger"
      ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 font-medium ${cls}`}
      title={title}
    >
      {children}
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Opcion[];
}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o.value} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

/* ==================== TABLE VIEW ==================== */
function TableView({
  registros,
  loading,
  selected,
  toggleSelect,
  selectAll,
  onEdit,
  onDetalle,
  onFirmar,
  onArchivar,
  onDelete,
}: {
  registros: HistorialClinico[];
  loading: boolean;
  selected: Set<number>;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  onEdit: (r: HistorialClinico) => void;
  onDetalle: (r: HistorialClinico) => void;
  onFirmar: (r: HistorialClinico) => void;
  onArchivar: (r: HistorialClinico) => void;
  onDelete: (r: HistorialClinico) => void;
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800/80 border-b border-gray-200 dark:border-gray-600">
            <tr className="text-left">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selected.size === registros.length && registros.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Fecha</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Paciente</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Médico</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Centro</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Tipo</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando historial...</p>
                  </div>
                </td>
              </tr>
            ) : registros.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron registros</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Intenta ajustar los filtros</p>
                  </div>
                </td>
              </tr>
            ) : (
              registros.map((r) => {
                const badge = estadoBadge[r.estado];
                const Tipo =
                  tipoBadge[r.tipo_documento]?.icon ?? tipoBadge.default.icon;
                const tipoBg =
                  tipoBadge[r.tipo_documento]?.bg ?? tipoBadge.default.bg;
                const tipoText =
                  tipoBadge[r.tipo_documento]?.text ?? tipoBadge.default.text;

                return (
                  <tr
                    key={r.id_historial}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id_historial)}
                        onChange={() => toggleSelect(r.id_historial)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {new Date(r.fecha_atencion).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(r.fecha_atencion).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {r.paciente_nombre}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {r.paciente_rut}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {r.medico_nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {r.centro_nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${tipoBg} ${tipoText}`}
                      >
                        <Tipo className="w-3.5 h-3.5" />
                        {r.tipo_documento}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${badge.bg} ${badge.text}`}
                      >
                        <badge.icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <IconBtn title="Ver detalle" onClick={() => onDetalle(r)} scheme="indigo">
                          <Eye className="w-4 h-4" />
                        </IconBtn>
                        <IconBtn
                          title="Editar"
                          onClick={() => onEdit(r)}
                          scheme="blue"
                          disabled={r.estado === "firmado" || r.estado === "archivado" || r.estado === "bloqueado"}
                        >
                          <Edit className="w-4 h-4" />
                        </IconBtn>
                        {r.estado === "borrador" && (
                          <IconBtn title="Firmar" onClick={() => onFirmar(r)} scheme="emerald">
                            <ShieldCheck className="w-4 h-4" />
                          </IconBtn>
                        )}
                        {r.estado !== "archivado" && (
                          <IconBtn title="Archivar" onClick={() => onArchivar(r)} scheme="neutral">
                            <Archive className="w-4 h-4" />
                          </IconBtn>
                        )}
                        <IconBtn title="Descargar PDF" onClick={() => window.alert("Descarga en desarrollo")} scheme="purple">
                          <Download className="w-4 h-4" />
                        </IconBtn>
                        <IconBtn title="Eliminar" onClick={() => onDelete(r)} scheme="red">
                          <Trash2 className="w-4 h-4" />
                        </IconBtn>
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

/* ==================== CARDS VIEW ==================== */
function CardsView({
  registros,
  loading,
  onEdit,
  onDetalle,
  onFirmar,
  onArchivar,
  onDelete,
}: {
  registros: HistorialClinico[];
  loading: boolean;
  onEdit: (r: HistorialClinico) => void;
  onDetalle: (r: HistorialClinico) => void;
  onFirmar: (r: HistorialClinico) => void;
  onArchivar: (r: HistorialClinico) => void;
  onDelete: (r: HistorialClinico) => void;
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );

  if (registros.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron registros</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {registros.map((r) => {
        const badge = estadoBadge[r.estado];
        const Tipo =
          tipoBadge[r.tipo_documento]?.icon ?? tipoBadge.default.icon;
        const tipoBg =
          tipoBadge[r.tipo_documento]?.bg ?? tipoBadge.default.bg;
        const tipoText =
          tipoBadge[r.tipo_documento]?.text ?? tipoBadge.default.text;

        return (
          <div
            key={r.id_historial}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(r.fecha_atencion).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {new Date(r.fecha_atencion).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${badge.bg} ${badge.text}`}
              >
                <badge.icon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            </div>

            {/* Body */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paciente</div>
                <div className="font-semibold text-gray-900 dark:text-white">{r.paciente_nombre}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{r.paciente_rut}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Médico</div>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{r.medico_nombre}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${tipoBg} ${tipoText}`}
                >
                  <Tipo className="w-3.5 h-3.5" />
                  {r.tipo_documento}
                </span>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Centro</div>
                  <div className="font-medium text-gray-900 dark:text-white">{r.centro_nombre}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <ButtonMini onClick={() => onDetalle(r)} scheme="indigo">
                <Eye className="w-4 h-4" /> Ver
              </ButtonMini>
              <ButtonMini
                onClick={() => onEdit(r)}
                scheme="blue"
                disabled={r.estado === "firmado" || r.estado === "archivado" || r.estado === "bloqueado"}
              >
                <Edit className="w-4 h-4" /> Editar
              </ButtonMini>
              {r.estado === "borrador" && (
                <ButtonMini onClick={() => onFirmar(r)} scheme="emerald">
                  <ShieldCheck className="w-4 h-4" /> Firmar
                </ButtonMini>
              )}
              {r.estado !== "archivado" && (
                <ButtonMini onClick={() => onArchivar(r)} scheme="neutral">
                  <Archive className="w-4 h-4" /> Archivar
                </ButtonMini>
              )}
              <ButtonMini onClick={() => onDelete(r)} scheme="red">
                <Trash2 className="w-4 h-4" /> Eliminar
              </ButtonMini>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==================== MODALES ==================== */
function ModalBase({
  title,
  children,
  onClose,
  theme,
  size = "default",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  theme: Theme;
  size?: "default" | "large" | "xl";
}) {
  const sizeClasses =
    {
      default: "max-w-3xl",
      large: "max-w-5xl",
      xl: "max-w-7xl",
    }[size] || "max-w-3xl";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalCrearEditarHC({
  editHC,
  opciones,
  onClose,
  onSaved,
  theme,
}: {
  editHC: HistorialClinico | null;
  opciones: { opCentros: Opcion[]; opMedicos: Opcion[]; opPacientes: Opcion[]; opTipos: Opcion[] };
  onClose: () => void;
  onSaved: () => void;
  theme: Theme;
}) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>(() => {
    if (!editHC)
      return {
        id_centro: "",
        id_medico: "",
        id_paciente: "",
        fecha_atencion: "",
        tipo_documento: "",
        titulo: "",
        resumen: "",
        diagnostico: "",
        procedimientos: "",
        indicaciones: "",
        recetas: "",
        confidencial: false,
      };
    return {
      id_centro: editHC.id_centro,
      id_medico: editHC.id_medico,
      id_paciente: editHC.id_paciente,
      fecha_atencion: editHC.fecha_atencion?.slice(0, 16),
      tipo_documento: editHC.tipo_documento,
      titulo: editHC.titulo ?? "",
      resumen: editHC.resumen ?? "",
      diagnostico: editHC.diagnostico ?? "",
      procedimientos: editHC.procedimientos ?? "",
      indicaciones: editHC.indicaciones ?? "",
      recetas: editHC.recetas ?? "",
      confidencial: !!editHC.confidencial,
    };
  });

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all";

  // Submit con mapeo REAL a columnas del backend
  const submit = async () => {
    setSaving(true);
    try {
      // Mapeo UI -> columnas reales del backend
      const mapped = {
        id_centro: Number(form.id_centro) || null,
        id_medico: Number(form.id_medico) || null,
        id_paciente: Number(form.id_paciente) || null,
        fecha_atencion: form.fecha_atencion || null,
        // columnas reales:
        tipo_atencion: form.tipo_documento || null,
        motivo_consulta: form.titulo || null,
        anamnesis: form.resumen || null,
        diagnostico_principal: form.diagnostico || null,
        examen_fisico: form.procedimientos || null,
        plan_tratamiento: form.indicaciones || null,
        // opcionales que no pedimos en el form:
        observaciones: null,
        codigo_cie10: null,
        duracion_minutos: null,
        es_ges: 0,
        es_cronica: 0,
        proximo_control: null,
        id_cita: null,
      };

      const res = await fetch(
        editHC
          ? `/api/admin/historial-clinico/${editHC.id_historial}`
          : "/api/admin/historial-clinico",
        {
          method: editHC ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editHC
              ? { ...mapped, modificado_por: 1 } // PUT usa columnas reales
              : { ...mapped, creado_por: 1 }      // POST idem
          ),
        }
      );
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "Error al guardar");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase
      title={editHC ? "Editar historial clínico" : "Nuevo historial clínico"}
      onClose={onClose}
      theme={theme}
      size="xl"
    >
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Centro" required>
          <select
            value={form.id_centro}
            onChange={(e) => setForm((f: any) => ({ ...f, id_centro: e.target.value }))}
            className={inputClass}
          >
            <option value="">Seleccione...</option>
            {opciones.opCentros.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Médico" required>
          <select
            value={form.id_medico}
            onChange={(e) => setForm((f: any) => ({ ...f, id_medico: e.target.value }))}
            className={inputClass}
          >
            <option value="">Seleccione...</option>
            {opciones.opMedicos.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Paciente" required>
          <select
            value={form.id_paciente}
            onChange={(e) => setForm((f: any) => ({ ...f, id_paciente: e.target.value }))}
            className={inputClass}
          >
            <option value="">Seleccione...</option>
            {opciones.opPacientes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha y hora de atención" required>
          <input
            type="datetime-local"
            value={form.fecha_atencion}
            onChange={(e) => setForm((f: any) => ({ ...f, fecha_atencion: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <Field label="Tipo de documento" required>
          <select
            value={form.tipo_documento}
            onChange={(e) => setForm((f: any) => ({ ...f, tipo_documento: e.target.value }))}
            className={inputClass}
          >
            <option value="">Seleccione...</option>
            {opciones.opTipos.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Título" required>
          <input
            value={form.titulo}
            onChange={(e) => setForm((f: any) => ({ ...f, titulo: e.target.value }))}
            className={inputClass}
            placeholder="Ej: Control mensual de paciente crónico"
          />
        </Field>

        <div className="md:col-span-3">
          <Field label="Resumen (visible)">
            <textarea
              value={form.resumen}
              onChange={(e) => setForm((f: any) => ({ ...f, resumen: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Resumen breve del episodio..."
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Diagnóstico">
            <textarea
              value={form.diagnostico}
              onChange={(e) => setForm((f: any) => ({ ...f, diagnostico: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Dx principal y secundarios..."
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Procedimientos">
            <textarea
              value={form.procedimientos}
              onChange={(e) => setForm((f: any) => ({ ...f, procedimientos: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Procedimientos realizados..."
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Indicaciones">
            <textarea
              value={form.indicaciones}
              onChange={(e) => setForm((f: any) => ({ ...f, indicaciones: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Indicaciones para el paciente..."
            />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Recetas">
            <textarea
              value={form.recetas}
              onChange={(e) => setForm((f: any) => ({ ...f, recetas: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Fármacos, dosis y duración..."
            />
          </Field>
        </div>

        <Field label="Confidencial">
          <select
            value={form.confidencial ? "1" : "0"}
            onChange={(e) => setForm((f: any) => ({ ...f, confidencial: e.target.value === "1" }))}
            className={inputClass}
          >
            <option value="0">No</option>
            <option value="1">Sí</option>
          </select>
        </Field>
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
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalDetalleHC({
  registro,
  onClose,
  theme,
}: {
  registro: HistorialClinico;
  onClose: () => void;
  theme: Theme;
}) {
  const badge = estadoBadge[registro.estado];

  return (
    <ModalBase title="Detalle del historial clínico" onClose={onClose} theme={theme} size="large">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 ${badge.bg} ${badge.text}`}
          >
            <badge.icon className="w-5 h-5" />
            {badge.label}
          </span>
          {registro.confidencial ? (
            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
              Confidencial
            </span>
          ) : (
            <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              Público interno
            </span>
          )}
        </div>

        {/* Paciente / Médico */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Paciente
            </h4>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">{registro.paciente_nombre}</p>
              <p className="text-gray-600 dark:text-gray-400">{registro.paciente_rut}</p>
              {registro.paciente_email && (
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {registro.paciente_email}
                </p>
              )}
              {registro.paciente_telefono && (
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {registro.paciente_telefono}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Médico
            </h4>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">{registro.medico_nombre}</p>
              {registro.medico_especialidad && (
                <p className="text-gray-600 dark:text-gray-400">{registro.medico_especialidad}</p>
              )}
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> {registro.centro_nombre}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles clínicos */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Documento
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <InfoItem label="Fecha" value={new Date(registro.fecha_atencion).toLocaleString()} />
            <InfoItem label="Tipo" value={registro.tipo_documento} />
            <InfoItem label="Título" value={registro.titulo ?? ""} />
          </div>

          {registro.resumen && (
            <div className="mt-4">
              <h5 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Resumen</h5>
              <p className="text-gray-800 dark:text-gray-200">{registro.resumen}</p>
            </div>
          )}
        </div>

        {(registro.diagnostico || registro.procedimientos || registro.indicaciones || registro.recetas) && (
          <div className="grid md:grid-cols-2 gap-6">
            {registro.diagnostico && (
              <Panel label="Diagnóstico" value={registro.diagnostico} />
            )}
            {registro.procedimientos && (
              <Panel label="Procedimientos" value={registro.procedimientos} />
            )}
            {registro.indicaciones && (
              <Panel label="Indicaciones" value={registro.indicaciones} />
            )}
            {registro.recetas && (
              <Panel label="Recetas" value={registro.recetas} />
            )}
          </div>
        )}

        {(registro.fecha_creacion || registro.fecha_modificacion) && (
          <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Historial</h5>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
              {registro.fecha_creacion && (
                <div>
                  <span>Creado:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(registro.fecha_creacion).toLocaleString()}
                  </p>
                </div>
              )}
              {registro.fecha_modificacion && (
                <div>
                  <span>Modificado:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(registro.fecha_modificacion).toLocaleString()}
                  </p>
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

function ModalFirmarHC({
  registro,
  onClose,
  onSigned,
  theme,
}: {
  registro: HistorialClinico;
  onClose: () => void;
  onSigned: () => void;
  theme: Theme;
}) {
  const [saving, setSaving] = useState(false);

  const firmar = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/historial-clinico/${registro.id_historial}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_registro: "firmado", modificado_por: 1 }),
      });
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "No se pudo firmar");
      onSigned();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase title="Firmar documento" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-emerald-800 dark:text-emerald-300">
              <p className="font-semibold mb-1">Confirmar firma</p>
              <p>
                Se aplicará la firma del profesional y el documento quedará en estado <strong>Firmado</strong>. Los campos
                quedarán bloqueados para edición.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1">{registro.titulo}</p>
          <p>
            Paciente: <strong>{registro.paciente_nombre}</strong> — Fecha:{" "}
            <strong>{new Date(registro.fecha_atencion).toLocaleString()}</strong>
          </p>
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
          onClick={firmar}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Firmando..." : "Firmar"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalArchivarHC({
  registro,
  onClose,
  onArchived,
  theme,
}: {
  registro: HistorialClinico;
  onClose: () => void;
  onArchived: () => void;
  theme: Theme;
}) {
  const [saving, setSaving] = useState(false);

  const archivar = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/historial-clinico/${registro.id_historial}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_registro: "archivado", modificado_por: 1 }),
      });
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "No se pudo archivar");
      onArchived();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase title="Archivar documento" onClose={onClose} theme={theme}>
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Archive className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-800 dark:text-gray-300">
              <p className="font-semibold mb-1">Confirmar archivado</p>
              <p>El registro quedará en estado <strong>Archivado</strong> y no será editable.</p>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1">{registro.titulo}</p>
          <p>
            Paciente: <strong>{registro.paciente_nombre}</strong> — Fecha:{" "}
            <strong>{new Date(registro.fecha_atencion).toLocaleString()}</strong>
          </p>
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
          onClick={archivar}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Archivando..." : "Archivar"}
        </button>
      </div>
    </ModalBase>
  );
}

/* ==================== PEQUEÑOS COMPONENTES ==================== */
function IconBtn({
  title,
  onClick,
  scheme = "indigo",
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  scheme?: "indigo" | "blue" | "emerald" | "neutral" | "purple" | "red";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const palette: Record<string, string> = {
    indigo:
      "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700",
    blue: "hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700",
    emerald:
      "hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700",
    neutral:
      "hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
    purple:
      "hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700",
    red: "hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-700",
  };
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 transition-all group ${
        palette[scheme]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">
        {children}
      </span>
    </button>
  );
}

function ButtonMini({
  onClick,
  children,
  scheme = "indigo",
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  scheme?: "indigo" | "blue" | "emerald" | "neutral" | "red";
  disabled?: boolean;
}) {
  const cls: Record<string, string> = {
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50",
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
    neutral:
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
    red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
        cls[scheme]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function Panel({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{label}</h5>
      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{value}</p>
    </div>
  );
}
