"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Plus, Edit, X, Search, UserCheck, Loader2, Download, Filter, Eye,
  Calendar, Activity, FileText, TrendingUp, Moon, Sun, BarChart3, List, Grid, RefreshCw,
  Printer, Shield, Trash2, Building2, Link as LinkIcon, Lock, Globe
} from "lucide-react";

/* ==================== TIPOS ==================== */
type Theme = "light" | "dark";
type ViewMode = "table" | "cards";

type TipoDashboard =
  | "operativo"
  | "clinico"
  | "financiero"
  | "administrativo"
  | "ejecutivo"
  | "personalizado"
  | (string & {});

type Opcion = { value: number | string; label: string; [k: string]: any };

type Dashboard = {
  id_dashboard: number;
  id_centro: number;
  nombre: string;
  descripcion?: string | null;
  tipo: TipoDashboard;
  configuracion_json: any;
  url_acceso?: string | null;
  activo: 0 | 1 | boolean;
  publico: 0 | 1 | boolean;
  requiere_autenticacion: 0 | 1 | boolean;
  periodicidad_actualizacion?: string | null;
  fecha_ultima_actualizacion?: string | null;
  categorias?: string | null;
  version: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  creado_por?: number | null;

  // joined
  centro_nombre?: string;
  creador_nombre?: string;
};

type Stats = {
  total: number;
  por_tipo: Record<string, number>;
  activos: number;
  publicos: number;
  privados: number;
  con_auth: number;
} | null;

/* ==================== COMPONENTE PRINCIPAL ==================== */
export default function AdminBIDashboardsPage() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showDashboard, setShowDashboard] = useState(true);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Dashboard[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [stats, setStats] = useState<Stats>(null);

  // filtros
  const [fSearch, setFSearch] = useState("");
  const [fTipo, setFTipo] = useState<string>("");
  const [fCentro, setFCentro] = useState<string>("");
  const [fActivo, setFActivo] = useState<"" | "0" | "1">("");
  const [fPublico, setFPublico] = useState<"" | "0" | "1">("");
  const [fAuth, setFAuth] = useState<"" | "0" | "1">("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // opciones
  const [opCentros, setOpCentros] = useState<Opcion[]>([]);
  const [enums, setEnums] = useState<{ tipos: any[] } | null>(null);

  // modales
  const [showCE, setShowCE] = useState(false);
  const [editItem, setEditItem] = useState<Dashboard | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleItem, setDetalleItem] = useState<Dashboard | null>(null);

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

  /* ============ AUX NORMALIZADORES ============ */
  const toValueLabel = (arr: any[]): Opcion[] =>
    (Array.isArray(arr) ? arr : [])
      .map((r) => {
        const rawValue = r?.value ?? r?.id ?? r?.id_centro ?? r?.codigo ?? r?.rut ?? null;
        const rawLabel =
          r?.label ??
          r?.nombre ??
          r?.titulo ??
          r?.descripcion ??
          (r?.codigo && r?.nombre ? `${r.codigo} — ${r.nombre}` : r?.codigo ?? null) ??
          (rawValue != null ? `- ${rawValue}` : null);
        if (rawValue == null || rawLabel == null) return null;
        const value = typeof rawValue === "object" ? rawValue.value ?? rawValue.id ?? JSON.stringify(rawValue) : rawValue;
        const label =
          typeof rawLabel === "object"
            ? rawLabel.label ?? rawLabel.nombre ?? rawLabel.titulo ?? rawLabel.descripcion ?? JSON.stringify(rawLabel)
            : rawLabel;
        return { value, label: String(label), ...r };
      })
      .filter(Boolean) as Opcion[];

  /** Convierte datos arbitrarios a {value,label} seguros para <option> */
  const asOptions = (arr: any[] = []): { value: string; label: string }[] =>
    (Array.isArray(arr) ? arr : []).map((it: any) => {
      if (it && typeof it === "object") {
        const v = it.value ?? it.key ?? it.tipo ?? it.nombre ?? it.id ?? it.codigo ?? String(it);
        const l = it.label ?? it.nombre ?? it.titulo ?? it.descripcion ?? v;
        return { value: String(v), label: String(l) };
      }
      return { value: String(it), label: String(it) };
    });

  /* ============ OPCIONES ============ */
  const fetchOpciones = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/bi-dashboards/opciones`, { cache: "no-store" });
      const data = await res.json();
      if (data?.success) {
        setOpCentros(toValueLabel(data?.centros || []));
        setEnums({ tipos: data?.tipos || [] });
      } else {
        setOpCentros([]);
        setEnums({ tipos: [] });
      }
    } catch {
      setOpCentros([]);
      setEnums({ tipos: [] });
    }
  }, []);

  useEffect(() => {
    fetchOpciones();
  }, [fetchOpciones]);

  /* ============ LISTADO ============ */
  const fetchItems = useCallback(
    async (page = pagina) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          pagina: String(page),
          pageSize: String(pageSize),
        });
        if (fSearch) qs.set("search", fSearch);
        if (fTipo) qs.set("tipo", fTipo);
        if (fCentro) qs.set("id_centro", fCentro);
        if (fActivo) qs.set("activo", fActivo);
        if (fPublico) qs.set("publico", fPublico);
        if (fAuth) qs.set("requiere_autenticacion", fAuth);
        if (fDesde) qs.set("desde", fDesde);
        if (fHasta) qs.set("hasta", fHasta);

        const res = await fetch(`/api/admin/bi-dashboards?${qs.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setTotal(Number(data.total || 0));
          setPagina(Number(data.pagina || page));
          setStats(data.stats || null);
        } else {
          setItems([]);
          setTotal(0);
          setStats(null);
        }
      } catch {
        setItems([]);
        setTotal(0);
        setStats(null);
      } finally {
        setLoading(false);
      }
    },
    [pagina, pageSize, fSearch, fTipo, fCentro, fActivo, fPublico, fAuth, fDesde, fHasta]
  );

  useEffect(() => {
    fetchItems(1);
  }, [pageSize, fTipo, fCentro, fActivo, fPublico, fAuth, fDesde, fHasta, fetchItems]);

  const resetFiltros = () => {
    setFSearch("");
    setFTipo("");
    setFCentro("");
    setFActivo("");
    setFPublico("");
    setFAuth("");
    setFDesde("");
    setFHasta("");
    fetchItems(1);
    fetchOpciones();
  };

  /* ============ CRUD HANDLERS ============ */
  const onCreate = () => {
    setEditItem(null);
    setShowCE(true);
  };
  const onEdit = (e: Dashboard) => {
    setEditItem(e);
    setShowCE(true);
  };
  const onDetalle = async (e: Dashboard) => {
    setDetalleItem(e);
    setShowDetalle(true);
  };
  const onDelete = async (e: Dashboard) => {
    if (!confirm(`¿Eliminar el dashboard "${e.nombre}" (#${e.id_dashboard})?`)) return;
    const res = await fetch(`/api/admin/bi-dashboards/${e.id_dashboard}`, { method: "DELETE" });
    const data = await res.json();
    if (data?.success) fetchItems();
    else alert(data?.error || "No se pudo eliminar");
  };
  const onToggleActivo = async (e: Dashboard, nuevo: boolean) => {
    const res = await fetch(`/api/admin/bi-dashboards/${e.id_dashboard}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: nuevo ? 1 : 0 }),
    });
    const data = await res.json();
    if (data?.success) fetchItems();
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
      if (curr.size === items.length) return new Set();
      return new Set(items.map((e) => e.id_dashboard));
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
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Regresar"
            >
              <ArrowLeftIcon />
            </button>

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl shadow-lg">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
                BI Dashboards
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Configuración, visibilidad y acceso a tableros</p>
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
              <Plus className="w-5 h-5" /> Nuevo dashboard
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {showDashboard && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <StatCard icon={LayoutDashboard} label="Total" value={safeInt(stats?.total)} color="blue" />
            <StatCard icon={Activity} label="Activos" value={safeInt(stats?.activos)} color="green" subtitle={`Públicos: ${safeInt(stats?.publicos)}`} />
            <StatCard icon={Lock} label="Requieren login" value={safeInt(stats?.con_auth)} color="purple" />
            <StatCard icon={Globe} label="Públicos" value={safeInt(stats?.publicos)} color="orange" subtitle={`Privados: ${safeInt(stats?.privados)}`} />
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
                    placeholder="Nombre, descripción, categoría…"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Tipo</label>
                <select
                  value={fTipo}
                  onChange={(e) => setFTipo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {asOptions(enums?.tipos || []).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
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
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Activo</label>
                <select
                  value={fActivo}
                  onChange={(e) => setFActivo(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  <option value="1">Sí</option>
                  <option value="0">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Público</label>
                <select
                  value={fPublico}
                  onChange={(e) => setFPublico(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  <option value="1">Sí</option>
                  <option value="0">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Requiere login</label>
                <select
                  value={fAuth}
                  onChange={(e) => setFAuth(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  <option value="1">Sí</option>
                  <option value="0">No</option>
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
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Actualizado desde</label>
                  <input type="date" value={fDesde} onChange={(e) => setFDesde(e.target.value)}
                         className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"/>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Actualizado hasta</label>
                  <input type="date" value={fHasta} onChange={(e) => setFHasta(e.target.value)}
                         className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"/>
                </div>
                <div className="md:col-span-3 flex items-end">
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
                onClick={() => fetchItems(1)}
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
            <button onClick={() => fetchItems(pagina)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* CONTENIDO */}
        {viewMode === "table" ? (
          <TableView
            items={items}
            loading={loading}
            selected={selected}
            toggleSelect={toggleSelect}
            selectAllVisible={selectAllVisible}
            onEdit={onEdit}
            onDelete={onDelete}
            onDetalle={onDetalle}
            onToggleActivo={onToggleActivo}
          />
        ) : (
          <CardsView
            items={items}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onDetalle={onDetalle}
          />
        )}

        {/* PAGINACIÓN */}
        {!loading && items.length > 0 && (
          <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Mostrando {(pagina - 1) * pageSize + 1} - {Math.min(pagina * pageSize, total)} de {total} dashboards
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina <= 1}
                onClick={() => {
                  setPagina(pagina - 1);
                  fetchItems(pagina - 1);
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
                  fetchItems(pagina + 1);
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
        <ModalCrearEditar
          onClose={() => setShowCE(false)}
          onSaved={() => {
            setShowCE(false);
            fetchItems();
          }}
          editItem={editItem}
          opciones={{ opCentros, enums }}
          theme={theme}
        />
      )}

      {showDetalle && detalleItem && (
        <ModalDetalle item={detalleItem} onClose={() => setShowDetalle(false)} theme={theme} />
      )}
    </div>
  );
}

/* ==================== AUX: UI ==================== */
function ArrowLeftIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/><path d="M21 12H9"/></svg>;
}

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
  items, loading, selected, toggleSelect, selectAllVisible, onEdit, onDelete, onDetalle, onToggleActivo,
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
                  checked={selected.size === items.length && items.length > 0}
                  onChange={selectAllVisible}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">ID</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Nombre</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Tipo</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Centro</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acceso</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Actualización</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-20 text-center text-gray-500 dark:text-gray-400">No hay dashboards</td></tr>
            ) : (
              items.map((e: Dashboard) => {
                const badgeActivo = e.activo ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
                const acceso = e.publico ? "Público" : (e.requiere_autenticacion ? "Privado (login)" : "Privado");
                return (
                  <tr key={e.id_dashboard} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(e.id_dashboard)} onChange={() => toggleSelect(e.id_dashboard)}
                             className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"/>
                    </td>
                    <td className="px-4 py-4 font-mono">#{e.id_dashboard}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{e.nombre}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{e.descripcion || "—"}</div>
                    </td>
                    <td className="px-4 py-4 capitalize">{e.tipo}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Building2 className="w-4 h-4" /> <span className="text-sm">{e.centro_nombre || e.id_centro}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        {e.publico ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {acceso}
                        {e.url_acceso && (
                          <a className="inline-flex items-center gap-1 underline hover:no-underline text-blue-600 dark:text-blue-400" href={e.url_acceso} target="_blank" rel="noreferrer">
                            <LinkIcon className="w-3 h-3" /> Link
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                        <div><b>Freq:</b> {e.periodicidad_actualizacion || "—"}</div>
                        <div><b>Última:</b> {e.fecha_ultima_actualizacion ? new Date(e.fecha_ultima_actualizacion).toLocaleString() : "—"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeActivo}`}>{e.activo ? "Activo" : "Inactivo"}</span>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => onDetalle(e)} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => onEdit(e)} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onToggleActivo(e, !e.activo)} className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all" title={e.activo ? "Desactivar" : "Activar"}>
                          <Shield className="w-4 h-4" />
                        </button>
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

function CardsView({ items, loading, onEdit, onDelete, onDetalle }: any) {
  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div>;
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <LayoutDashboard className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No hay dashboards</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((e: Dashboard) => (
        <div key={e.id_dashboard} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{e.nombre}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{e.centro_nombre || `Centro #${e.id_centro}`}</p>
            </div>
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
              {e.tipo}
            </span>
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="line-clamp-2">{e.descripcion || "—"}</p>
            <div className="flex items-center gap-2 text-xs">
              {e.publico ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {e.publico ? "Público" : (e.requiere_autenticacion ? "Privado (login)" : "Privado")}
              {e.url_acceso && (
                <a className="inline-flex items-center gap-1 underline hover:no-underline text-blue-600 dark:text-blue-400" href={e.url_acceso} target="_blank" rel="noreferrer">
                  <LinkIcon className="w-3 h-3" /> Link
                </a>
              )}
            </div>
            <div className="text-xs">
              <b>Versión:</b> {e.version} · <b>Freq:</b> {e.periodicidad_actualizacion || "—"}
            </div>
            <div className="text-xs">
              <b>Última actualización:</b> {e.fecha_ultima_actualizacion ? new Date(e.fecha_ultima_actualizacion).toLocaleString() : "—"}
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

function ModalCrearEditar({ editItem, opciones, onClose, onSaved, theme }: any) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>(() => {
    if (!editItem)
      return {
        id_centro: "",
        nombre: "",
        descripcion: "",
        tipo: "operativo",
        configuracion_json: "{}",
        url_acceso: "",
        activo: 1,
        publico: 0,
        requiere_autenticacion: 1,
        periodicidad_actualizacion: "",
        fecha_ultima_actualizacion: "",
        categorias: "",
        version: "1.0",
        creado_por: "",
      };
    const e = editItem;
    return {
      ...e,
      configuracion_json: JSON.stringify(e.configuracion_json ?? {}, null, 2),
      fecha_ultima_actualizacion: e.fecha_ultima_actualizacion ? e.fecha_ultima_actualizacion.slice(0, 16) : "",
    };
  });

  const input = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all";

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        id_centro: Number(form.id_centro || 0),
        activo: form.activo ? 1 : 0,
        publico: form.publico ? 1 : 0,
        requiere_autenticacion: form.requiere_autenticacion ? 1 : 0,
        creado_por: form.creado_por ? Number(form.creado_por) : null,
        configuracion_json: parseSafeJSON(form.configuracion_json),
        fecha_ultima_actualizacion: form.fecha_ultima_actualizacion || null,
      };

      const isEdit = !!editItem?.id_dashboard;
      const url = isEdit ? `/api/admin/bi-dashboards/${editItem.id_dashboard}` : `/api/admin/bi-dashboards`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
    <ModalBase title={editItem ? "Editar dashboard" : "Crear dashboard"} onClose={onClose} theme={theme} size="large">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Centro" required>
          <select value={form.id_centro} onChange={(e) => setForm((f: any) => ({ ...f, id_centro: e.target.value }))} className={input}>
            <option value="">Seleccione…</option>
            {opciones.opCentros.map((o: Opcion) => <option key={String(o.value)} value={String(o.value)}>{String(o.label)}</option>)}
          </select>
        </Field>
        <Field label="Nombre" required>
          <input value={form.nombre} onChange={(e) => setForm((f: any) => ({ ...f, nombre: e.target.value }))} className={input} placeholder="Ej. Ejecutivo semanal" />
        </Field>
        <Field label="Tipo" required>
          <select value={String(form.tipo ?? "")} onChange={(e) => setForm((f: any) => ({ ...f, tipo: e.target.value }))} className={input}>
            {["operativo","clinico","financiero","administrativo","ejecutivo","personalizado"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-3">
          <Field label="Descripción">
            <textarea value={form.descripcion} onChange={(e) => setForm((f: any) => ({ ...f, descripcion: e.target.value }))} className={input} rows={2} />
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Configuración JSON">
            <textarea value={form.configuracion_json} onChange={(e) => setForm((f: any) => ({ ...f, configuracion_json: e.target.value }))} className={input} rows={6} />
          </Field>
        </div>

        <Field label="URL de acceso">
          <input value={form.url_acceso} onChange={(e) => setForm((f: any) => ({ ...f, url_acceso: e.target.value }))} className={input} placeholder="https://…" />
        </Field>
        <Field label="Periodicidad actualización">
          <input value={form.periodicidad_actualizacion} onChange={(e) => setForm((f: any) => ({ ...f, periodicidad_actualizacion: e.target.value }))} className={input} placeholder="diario, semanal, cron, etc." />
        </Field>
        <Field label="Última actualización">
          <input type="datetime-local" value={form.fecha_ultima_actualizacion} onChange={(e) => setForm((f: any) => ({ ...f, fecha_ultima_actualizacion: e.target.value }))} className={input} />
        </Field>

        <Field label="Categorías (coma)">
          <input value={form.categorias} onChange={(e) => setForm((f: any) => ({ ...f, categorias: e.target.value }))} className={input} placeholder="ejecutivo, financiero" />
        </Field>
        <Field label="Versión">
          <input value={form.version} onChange={(e) => setForm((f: any) => ({ ...f, version: e.target.value }))} className={input} />
        </Field>
        <Field label="Creador (ID)">
          <input value={form.creado_por ?? ""} onChange={(e) => setForm((f: any) => ({ ...f, creado_por: e.target.value }))} className={input} placeholder="Opcional" />
        </Field>

        <Field label="Activo">
          <select value={form.activo ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, activo: e.target.value === "1" }))} className={input}>
            <option value="1">Sí</option><option value="0">No</option>
          </select>
        </Field>
        <Field label="Público">
          <select value={form.publico ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, publico: e.target.value === "1" }))} className={input}>
            <option value="1">Sí</option><option value="0">No</option>
          </select>
        </Field>
        <Field label="Requiere autenticación">
          <select value={form.requiere_autenticacion ? "1" : "0"} onChange={(e) => setForm((f: any) => ({ ...f, requiere_autenticacion: e.target.value === "1" }))} className={input}>
            <option value="1">Sí</option><option value="0">No</option>
          </select>
        </Field>
      </div>

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

function ModalDetalle({ item, onClose, theme }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/bi-dashboards/${item.id_dashboard}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.success) setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, [item?.id_dashboard]);

  return (
    <ModalBase title={`Detalle dashboard #${item.id_dashboard}`} onClose={onClose} theme={theme} size="large">
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" /></div>
      ) : !data ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No se pudo cargar</p>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <InfoBox title="General" icon={LayoutDashboard}>
              <InfoItem label="Nombre" value={data.item.nombre} />
              <InfoItem label="Tipo" value={data.item.tipo} />
              <InfoItem label="Centro" value={data.item.centro_nombre || data.item.id_centro} icon={Building2} />
            </InfoBox>
            <InfoBox title="Acceso" icon={LinkIcon}>
              <InfoItem label="Público" value={data.item.publico ? "Sí" : "No"} />
              <InfoItem label="Requiere login" value={data.item.requiere_autenticacion ? "Sí" : "No"} />
              <InfoItem label="URL" value={data.item.url_acceso || "—"} />
            </InfoBox>
            <InfoBox title="Actualización" icon={Calendar}>
              <InfoItem label="Periodicidad" value={data.item.periodicidad_actualizacion || "—"} />
              <InfoItem label="Última act." value={data.item.fecha_ultima_actualizacion ? new Date(data.item.fecha_ultima_actualizacion).toLocaleString() : "—"} />
              <InfoItem label="Versión" value={data.item.version} />
            </InfoBox>
            <InfoBox title="Estado" icon={Shield}>
              <InfoItem label="Activo" value={data.item.activo ? "Sí" : "No"} />
              <InfoItem label="Creador" value={data.item.creador_nombre || data.item.creado_por || "—"} />
              <InfoItem label="ID" value={`#${data.item.id_dashboard}`} />
            </InfoBox>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Configuración JSON
            </h3>
            <pre className="text-xs whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
              {JSON.stringify(data.item.configuracion_json, null, 2)}
            </pre>
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

/* ==================== HELPERS ==================== */
function parseSafeJSON(txt: string) {
  try {
    const v = JSON.parse(txt);
    return v;
  } catch {
    return {};
  }
}
