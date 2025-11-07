"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar, Plus, Edit, X, Search, CheckSquare, Archive, Trash2, Building2, Stethoscope,
  User, Loader2, Download, Filter, Eye, FileText, ShieldCheck, RefreshCw, List, Grid,
  Printer, ChevronDown, ChevronUp, Pill, Check, Package, Syringe, ClipboardCheck, Wrench, Repeat, Ban,
  FileSignature, ClipboardList, Undo2, Lock
} from "lucide-react";

/* ==================== TIPOS ==================== */
type Opcion = { value: number | string; label: string; [k: string]: any };
type ViewMode = "table" | "cards";
type Theme = "light" | "dark";

type RecetaItem = {
  id_receta_medicamento?: number;
  id_medicamento?: number | null;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion?: string | null;
  cantidad: number;
  unidad: string;
  via_administracion: string;
  instrucciones?: string | null;
  es_controlado?: 0 | 1;
  codigo_medicamento?: string | null;
  dispensado?: 0 | 1;
  fecha_dispensacion?: string | null;
  dispensado_por?: number | null;
  observaciones_dispensacion?: string | null;
};

type EstadoReceta = "emitida" | "parcial" | "dispensada" | "anulada" | string;

type Receta = {
  id_receta: number;
  id_paciente: number;
  id_medico: number;
  id_centro: number;
  fecha_emision: string;
  numero_receta?: string | null;
  tipo_receta?: string | null;
  estado: EstadoReceta | null;
  titulo?: string | null;

  paciente_nombre: string;
  paciente_rut: string;
  medico_nombre: string;
  centro_nombre: string;

  items_total: number;
  items_controlados: number;
  items_dispensados: number;
};

type Stats = {
  total: number;
  emitidas: number;
  parciales: number;
  dispensadas: number;
  anuladas: number;
};

type AccionMasiva =
  | "emitir" | "dispensar" | "anular" | "reactivar"
  | "cerrar" | "borrador" | "set_estado" | "set_estado_map";

type HistEntry = {
  ids: number[];
  prevEstados: Record<number, EstadoReceta | null>;
  label: string;
};

/* ==================== UI HELPERS ==================== */
const badgeEstado = (estado?: string | null) => {
  switch (estado) {
    case "emitida":
      return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", label: "Emitida" };
    case "parcial":
      return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "Parcial" };
    case "dispensada":
      return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", label: "Dispensada" };
    case "anulada":
      return { bg: "bg-gray-200 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-300", label: "Anulada" };
    default:
      return { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-300", label: (estado ?? "—") };
  }
};

const safeInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/* ==================== PÁGINA ==================== */
export default function AdminRecetasMedicasPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Receta[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [stats, setStats] = useState<Stats>({ total: 0, emitidas: 0, parciales: 0, dispensadas: 0, anuladas: 0 });

  // Filtros
  const [fCentro, setFCentro] = useState<number | "">("");
  const [fMedico, setFMedico] = useState<number | "">("");
  const [fPaciente, setFPaciente] = useState<number | "">("");
  const [fEstado, setFEstado] = useState<string>("");
  const [fTipo, setFTipo] = useState<string>("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [fSearch, setFSearch] = useState("");

  // Opciones
  const [opCentros, setOpCentros] = useState<Opcion[]>([]);
  const [opMedicos, setOpMedicos] = useState<Opcion[]>([]);
  const [opPacientes, setOpPacientes] = useState<Opcion[]>([]);
  const [opMedicamentos, setOpMedicamentos] = useState<Opcion[]>([]);
  const [opTipos, setOpTipos] = useState<Opcion[]>([]);
  const [opEstados, setOpEstados] = useState<Opcion[]>([]);

  // Selección
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBulk, setShowBulk] = useState(false);

  // Modales
  const [showCE, setShowCE] = useState(false);
  const [editReceta, setEditReceta] = useState<Receta | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleReceta, setDetalleReceta] = useState<Receta | null>(null);
  const [showTipos, setShowTipos] = useState(false);

  // Historial para UNDO
  const [history, setHistory] = useState<HistEntry[]>([]);

  const snapshotEstados = (ids: number[]) => {
    const prev: Record<number, EstadoReceta | null> = {};
    ids.forEach(id => {
      const r = items.find(x => x.id_receta === id);
      if (r) prev[id] = r.estado ?? null;
    });
    return prev;
  };
  const pushHistory = (ids: number[], label: string) => {
    setHistory(h => [...h, { ids, prevEstados: snapshotEstados(ids), label }]);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Carga opciones (todo dinámico)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/recetas-medicas/opciones", { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          const op = data.opciones || {};
          setOpCentros(data.centros || op.centros || []);
          setOpMedicos(data.medicos || op.medicos || []);
          setOpPacientes(data.pacientes || op.pacientes || []);
          setOpMedicamentos(data.medicamentos || op.medicamentos || []);

          const tipos = data.tiposReceta || data.tipos_receta || op.tiposReceta || op.tipos || [];
          setOpTipos(tipos);

          setOpEstados(
            data.estados || [
              { value: "emitida", label: "Emitida" },
              { value: "parcial", label: "Parcial" },
              { value: "dispensada", label: "Dispensada" },
              { value: "anulada", label: "Anulada" },
            ]
          );
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  const fetchData = useCallback(async (page = pagina) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ pagina: String(page), pageSize: String(pageSize) });
      if (fCentro) q.append("id_centro", String(fCentro));
      if (fMedico) q.append("id_medico", String(fMedico));
      if (fPaciente) q.append("id_paciente", String(fPaciente));
      if (fEstado) q.append("estado", fEstado);
      if (fTipo) q.append("tipo_receta", fTipo);
      if (fDesde) q.append("desde", fDesde);
      if (fHasta) q.append("hasta", fHasta);
      if (fSearch) q.append("search", fSearch);

      const res = await fetch(`/api/admin/recetas-medicas?${q.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.success) {
        setItems(data.items || []);
        setTotal(Number(data.total || 0));
        setPagina(Number(data.pagina || page));
        if (data.stats) {
          setStats({
            total: safeInt(data.stats.total),
            emitidas: safeInt(data.stats.emitidas),
            parciales: safeInt(data.stats.parciales),
            dispensadas: safeInt(data.stats.dispensadas),
            anuladas: safeInt(data.stats.anuladas),
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [pagina, pageSize, fCentro, fMedico, fPaciente, fEstado, fTipo, fDesde, fHasta, fSearch]);

  useEffect(() => { fetchData(1); }, [pageSize, fCentro, fMedico, fPaciente, fEstado, fTipo, fDesde, fHasta]);

  const resetFiltros = () => {
    setFCentro(""); setFMedico(""); setFPaciente(""); setFEstado(""); setFTipo("");
    setFDesde(""); setFHasta(""); setFSearch(""); fetchData(1);
  };

  const onCreate = () => { setEditReceta(null); setShowCE(true); };
  const onEdit   = (r: Receta) => { setEditReceta(r); setShowCE(true); };
  const onDetalle = (r: Receta) => { setDetalleReceta(r); setShowDetalle(true); };

  const onDelete = async (r: Receta) => {
    if (!confirm("¿Eliminar esta receta?")) return;
    const res = await fetch(`/api/admin/recetas-medicas/${r.id_receta}`, { method: "DELETE" });
    const data = await res.json();
    if (!data?.success) return alert(data?.error || "No se pudo eliminar");
    fetchData(pagina);
  };

  /* ===== Acciones masivas y UNDO ===== */
  const bulkAction = useCallback(
    async (action: AccionMasiva, ids: number[], extra: any = {}) => {
      const res = await fetch("/api/admin/recetas-medicas/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids, ...extra }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Operación no aplicada");
      await fetchData(pagina);
      setSelected(new Set());
      return data;
    },
    [fetchData, pagina]
  );

  const setEstado = async (ids: number[], estado: EstadoReceta | null, label = `Estado → ${estado ?? "borrador"}`) => {
    if (!ids.length) return;
    pushHistory(ids, label);
    await bulkAction("set_estado", ids, { estado });
  };

  const undoLast = async () => {
    const last = history[history.length - 1];
    if (!last) return alert("Nada para deshacer");
    try {
      await fetch("/api/admin/recetas-medicas/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_estado_map", map: last.prevEstados }),
      });
    } finally {
      await fetchData(pagina);
      setHistory(h => h.slice(0, -1));
    }
  };

  const anularUna    = async (id: number) => { if (!confirm("¿Anular esta receta?")) return; pushHistory([id], "Anular"); await bulkAction("anular", [id]); };
  const reactivarUna = async (id: number) => { pushHistory([id], "Reactivar"); await bulkAction("reactivar", [id]); };
  const cerrarUna    = async (id: number) => { pushHistory([id], "Cerrar"); await bulkAction("cerrar", [id]); };
  const borradorUna  = async (id: number) => { pushHistory([id], "Borrador"); await setEstado([id], null, "Borrador"); };

  const duplicarUna = async (r: Receta) => {
    try {
      const res = await fetch(`/api/admin/recetas-medicas/${r.id_receta}`, { cache: "no-store" });
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "No se pudo obtener el detalle");
      const payload = {
        id_centro: r.id_centro,
        id_medico: r.id_medico,
        id_paciente: r.id_paciente,
        fecha_emision: new Date().toISOString().slice(0, 19).replace("T", " "),
        numero_receta: null,
        tipo_receta: r.tipo_receta ?? null,
        titulo: data?.titulo ?? r.titulo ?? null,
        items: (data.items || []).map((it: any) => ({
          id_medicamento: it.id_medicamento ?? null,
          nombre_medicamento: it.nombre_medicamento ?? "",
          dosis: it.dosis ?? "",
          frecuencia: it.frecuencia ?? "",
          duracion: it.duracion ?? null,
          cantidad: Number(it.cantidad ?? 0),
          unidad: it.unidad ?? "",
          via_administracion: it.via_administracion ?? "",
          instrucciones: it.instrucciones ?? null,
          es_controlado: it.es_controlado ? 1 : 0,
          codigo_medicamento: it.codigo_medicamento ?? null,
          dispensado: 0,
          fecha_dispensacion: null,
          dispensado_por: null,
          observaciones_dispensacion: null,
        })),
      };
      const post = await fetch(`/api/admin/recetas-medicas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const out = await post.json();
      if (!out?.success) return alert(out?.error || "No se pudo duplicar");
      alert("Receta duplicada");
      fetchData(pagina);
    } catch (e) {
      console.error(e);
      alert("Error duplicando");
    }
  };

  const toggleSelect = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Pill className="w-8 h-8 text-white" />
              </span>
              Recetas médicas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Emisión, control y dispensación de recetas.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              {theme === "light" ? "🌙" : "🌞"}
            </button>
            <button onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              {viewMode === "table" ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowBulk(!showBulk)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </button>
            <button onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-semibold">
              <Plus className="w-5 h-5" /> Nueva receta
            </button>
          </div>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Kpi icon={FileText} label="Total" value={stats.total} color="blue" />
          <Kpi icon={ClipboardCheck} label="Emitidas" value={stats.emitidas} color="indigo" />
          <Kpi icon={Syringe} label="Parciales" value={stats.parciales} color="amber" />
          <Kpi icon={Check} label="Dispensadas" value={stats.dispensadas} color="green" />
          <Kpi icon={Archive} label="Anuladas" value={stats.anuladas} color="gray" />
        </section>

        {/* FILTROS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
            <div className="grid md:grid-cols-6 gap-3">
              <SelectLabeled label="Centro" value={String(fCentro)} onChange={v=>setFCentro(v?Number(v):"")} options={opCentros} />
              <SelectLabeled label="Médico" value={String(fMedico)} onChange={v=>setFMedico(v?Number(v):"")} options={opMedicos} />
              <SelectLabeled label="Paciente" value={String(fPaciente)} onChange={v=>setFPaciente(v?Number(v):"")} options={opPacientes} />
              <SelectLabeled label="Estado" value={fEstado} onChange={setFEstado} options={opEstados} allowEmpty />
              <SelectLabeled label="Tipo" value={fTipo} onChange={setFTipo} options={opTipos} allowEmpty />
              <div className="flex items-end gap-2">
                <button onClick={() => setShowBulk(s => !s)} className="flex-1 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                  <Filter className="w-4 h-4" />
                  {showBulk ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-6 gap-3 mt-3">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Buscar</label>
                <div className="relative">
                  <input value={fSearch} onChange={e=>setFSearch(e.target.value)} placeholder="Paciente, RUT, N° receta, médico..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"/>
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <InputDate label="Desde" value={fDesde} onChange={setFDesde}/>
              <InputDate label="Hasta" value={fHasta} onChange={setFHasta}/>
              <div className="flex items-end gap-2">
                <button onClick={()=>fetchData(1)} className="flex-1 rounded-xl px-4 py-2.5 bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all font-semibold shadow-md">Aplicar</button>
                <button onClick={resetFiltros} className="flex-1 rounded-xl px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300">Limpiar</button>
              </div>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ToolbarBtn icon={<Download className="w-4 h-4" />} label="CSV" onClick={()=>alert("Export CSV")} />
            <ToolbarBtn icon={<FileText className="w-4 h-4" />} label="PDF" onClick={()=>alert("Export PDF")} className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"/>
            <ToolbarBtn icon={<Printer className="w-4 h-4" />} label="" title="Imprimir" onClick={()=>window.print()} />
            <ToolbarBtn icon={<RefreshCw className="w-4 h-4" />} label="" title="Refrescar" onClick={()=>fetchData(pagina)} />
            <ToolbarBtn icon={<Wrench className="w-4 h-4" />} label="Tipos" title="Gestionar tipos de receta" onClick={() => setShowTipos(true)} />

            <ToolbarBtn icon={<Repeat className="w-4 h-4" />} label="Masivo: Emitir" onClick={async()=>{
              if (!selected.size) return alert("Selecciona recetas");
              pushHistory([...selected], "Emitir (masivo)");
              await bulkAction("emitir", [...selected]);
            }} />
            <ToolbarBtn icon={<ClipboardList className="w-4 h-4" />} label="Masivo: Dispensar" onClick={async()=>{
              if (!selected.size) return alert("Selecciona recetas");
              pushHistory([...selected], "Dispensar (masivo)");
              await bulkAction("dispensar", [...selected]);
            }} />
            <ToolbarBtn icon={<Ban className="w-4 h-4" />} label="Masivo: Anular" onClick={async()=>{
              if (!selected.size) return alert("Selecciona recetas");
              if (!confirm("¿Anular recetas seleccionadas?")) return;
              pushHistory([...selected], "Anular (masivo)");
              await bulkAction("anular", [...selected]);
            }} />

            {/* Nuevas */}
            <ToolbarBtn icon={<ShieldCheck className="w-4 h-4" />} label="Masivo: Reactivar" onClick={async()=>{
              if (!selected.size) return alert("Selecciona recetas");
              pushHistory([...selected], "Reactivar (masivo)");
              await bulkAction("reactivar", [...selected]);
            }} />
            <ToolbarBtn icon={<Lock className="w-4 h-4" />} label="Masivo: Cerrar" onClick={async()=>{
              if (!selected.size) return alert("Selecciona recetas");
              pushHistory([...selected], "Cerrar (masivo)");
              await bulkAction("cerrar", [...selected]);
            }} />
            <ToolbarBtn icon={<FileText className="w-4 h-4" />} label="Masivo: Borrador" onClick={async()=>{
              if (!selected.size) return alert("Selecciona recetas");
              await setEstado([...selected], null, "Borrador (masivo)");
            }} />

            {/* UNDO */}
            <ToolbarBtn icon={<Undo2 className="w-4 h-4" />} label="Deshacer" onClick={undoLast}
              className={`${history.length ? "" : "opacity-50 pointer-events-none"}`} />
          </div>
        </section>

        {/* CONTENIDO */}
        {viewMode==="table" ? (
          <TableView
            loading={loading} items={items} selected={selected}
            toggleSelect={toggleSelect}
            onEdit={onEdit} onDetalle={onDetalle} onDelete={onDelete}
            onDuplicate={duplicarUna} onAnular={anularUna}
            cerrarUna={cerrarUna} reactivarUna={reactivarUna} borradorUna={borradorUna}
          />
        ) : (
          <CardsView loading={loading} items={items} onEdit={onEdit} onDetalle={onDetalle} onDelete={onDelete}/>
        )}

        {/* PAGINACIÓN */}
        {!loading && items.length>0 && (
          <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Mostrando {Math.min((pagina-1)*pageSize+1, total)} - {Math.min(pagina*pageSize, total)} de {total}
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                disabled={pagina<=1}
                onClick={()=>{ const p=pagina-1; setPagina(p); fetchData(p);}}>Anterior</button>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
                Página {pagina} de {Math.ceil(total/pageSize) || 1}
              </div>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                disabled={pagina*pageSize>=total}
                onClick={()=>{ const p=pagina+1; setPagina(p); fetchData(p);}}>Siguiente</button>
              <select className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                value={pageSize} onChange={(e)=>setPageSize(Number(e.target.value))}>
                {[10,20,50,100].map(n=><option key={n} value={n}>{n}/pág</option>)}
              </select>
            </div>
          </section>
        )}
      </div>

      {/* MODALES */}
      {showCE && (
        <ModalCE
          theme={theme}
          onClose={()=>setShowCE(false)}
          onSaved={()=>{ setShowCE(false); fetchData(pagina); }}
          editReceta={editReceta}
          opciones={{ opCentros, opMedicos, opPacientes, opMedicamentos, opTipos }}
        />
      )}

      {showDetalle && detalleReceta && (
        <ModalDetalle theme={theme} receta={detalleReceta} onClose={()=>setShowDetalle(false)} />
      )}

      {showTipos && (
        <ModalTipos
          onClose={()=>setShowTipos(false)}
          onSaved={async ()=>{
            // recarga tipos en selects tras CRUD
            const res = await fetch("/api/admin/recetas-medicas/opciones", { cache: "no-store" });
            const data = await res.json();
            if (data?.success) {
              const op = data.opciones || {};
              const tipos = data.tiposReceta || data.tipos_receta || op.tiposReceta || op.tipos || [];
              setOpTipos(tipos);
            }
            setShowTipos(false);
          }}
        />
      )}
    </div>
  );
}

/* ==================== SUBCOMPONENTES ==================== */
function Kpi({icon:Icon, label, value, color}:{icon:any; label:string; value:number; color:"blue"|"indigo"|"amber"|"green"|"gray"}) {
  const cls = {
    blue:"from-blue-500 to-blue-600", indigo:"from-indigo-500 to-indigo-600",
    amber:"from-amber-500 to-amber-600", green:"from-green-500 to-green-600", gray:"from-gray-500 to-gray-600"
  }[color];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimos 30 días</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${cls} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({icon, label, title, onClick, className}:{icon:any; label?:string; title?:string; onClick:()=>void; className?:string}) {
  return (
    <button onClick={onClick} title={title}
      className={`px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 ${className||""}`}>
      {icon}{label}
    </button>
  );
}

function SelectLabeled({label, value, onChange, options, allowEmpty}:{label:string; value:string; onChange:(v:string)=>void; options:Opcion[]; allowEmpty?:boolean}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
        {allowEmpty !== false && <option value="">Todos</option>}
        {options.map(o=><option key={o.value} value={String(o.value)}>{o.label}</option>)}
      </select>
    </div>
  );
}

function InputDate({label, value, onChange}:{label:string; value:string; onChange:(v:string)=>void}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      <input type="date" value={value} onChange={e=>onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"/>
    </div>
  );
}

function TableView({
  loading, items, selected, toggleSelect, onEdit, onDetalle, onDelete, onDuplicate, onAnular,
  cerrarUna, reactivarUna, borradorUna
}:{
  loading:boolean; items:Receta[]; selected:Set<number>; toggleSelect:(id:number)=>void;
  onEdit:(r:Receta)=>void; onDetalle:(r:Receta)=>void; onDelete:(r:Receta)=>void;
  onDuplicate:(r:Receta)=>void; onAnular:(id:number)=>void;
  cerrarUna:(id:number)=>void; reactivarUna:(id:number)=>void; borradorUna:(id:number)=>void;
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-750 border-b border-gray-200 dark:border-gray-600">
            <tr className="text-left">
              <th className="px-4 py-4"></th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Fecha</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Paciente</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Médico</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Centro</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">N° Receta</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Ítems</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-20 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando recetas...</p>
                </div>
              </td></tr>
            ) : items.length===0 ? (
              <tr><td colSpan={9} className="px-4 py-20 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron recetas</p>
                </div>
              </td></tr>
            ) : (
              items.map(r=>{
                const b = badgeEstado(r.estado);
                return (
                  <tr key={r.id_receta} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selected.has(r.id_receta)} onChange={()=>toggleSelect(r.id_receta)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"/>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{new Date(r.fecha_emision).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{r.paciente_nombre}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.paciente_rut}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400"/><span className="font-medium text-gray-900 dark:text-white">{r.medico_nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400"/><span>{r.centro_nombre}</span></div></td>
                    <td className="px-4 py-4">{r.numero_receta ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Package className="w-4 h-4"/>{r.items_dispensados}/{r.items_total}
                        {r.items_controlados>0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">Controlados: {r.items_controlados}</span>}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${b.bg} ${b.text}`}>{b.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <IconBtn title="Ver" icon={<Eye className="w-4 h-4"/>} onClick={()=>onDetalle(r)}/>
                        <IconBtn title="Editar" icon={<Edit className="w-4 h-4"/>} onClick={()=>onEdit(r)}/>
                        <IconBtn title="Duplicar" icon={<FileSignature className="w-4 h-4"/>} onClick={()=>onDuplicate(r)}/>

                        {r.estado === "anulada" ? (
                          <>
                            <IconBtn title="Reactivar" icon={<ShieldCheck className="w-4 h-4" />} onClick={()=>reactivarUna(r.id_receta)} />
                            <IconBtn title="Borrador" icon={<FileText className="w-4 h-4" />} onClick={()=>borradorUna(r.id_receta)} />
                          </>
                        ) : (
                          <>
                            <IconBtn title="Anular" icon={<Ban className="w-4 h-4"/>} onClick={()=>onAnular(r.id_receta)}/>
                            <IconBtn title="Cerrar" icon={<Lock className="w-4 h-4" />} onClick={()=>cerrarUna(r.id_receta)} />
                            <IconBtn title="Borrador" icon={<FileText className="w-4 h-4" />} onClick={()=>borradorUna(r.id_receta)} />
                          </>
                        )}

                        <IconBtn title="Eliminar" icon={<Trash2 className="w-4 h-4"/>} onClick={()=>onDelete(r)}/>
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

function CardsView({loading, items, onEdit, onDetalle, onDelete}:{loading:boolean; items:Receta[]; onEdit:(r:Receta)=>void; onDetalle:(r:Receta)=>void; onDelete:(r:Receta)=>void;}) {
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400"/></div>;
  if (!items.length) return <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"><FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"/><p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron recetas</p></div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(r=>{
        const b = badgeEstado(r.estado);
        return (
          <div key={r.id_receta} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2"><Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/><span className="font-bold">{new Date(r.fecha_emision).toLocaleDateString()}</span></div>
                <div className="text-xs text-gray-600 dark:text-gray-400">N° receta: <strong>{r.numero_receta ?? "—"}</strong></div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${b.bg} ${b.text}`}>{b.label}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-700 dark:text-gray-300"><User className="inline w-4 h-4 mr-1"/>{r.paciente_nombre} · {r.paciente_rut}</div>
              <div className="text-gray-700 dark:text-gray-300"><Stethoscope className="inline w-4 h-4 mr-1"/>{r.medico_nombre}</div>
              <div className="text-gray-700 dark:text-gray-300"><Building2 className="inline w-4 h-4 mr-1"/>{r.centro_nombre}</div>
              <div className="text-gray-700 dark:text-gray-300"><Package className="inline w-4 h-4 mr-1"/>Ítems: {r.items_dispensados}/{r.items_total}{r.items_controlados>0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">Controlados: {r.items_controlados}</span>}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Btn onClick={()=>onDetalle(r)}><Eye className="w-4 h-4"/> Ver</Btn>
              <Btn onClick={()=>onEdit(r)}><Edit className="w-4 h-4"/> Editar</Btn>
              <Btn danger onClick={()=>onDelete(r)}><Trash2 className="w-4 h-4"/> Eliminar</Btn>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IconBtn({title, icon, onClick}:{title:string; icon:React.ReactNode; onClick:()=>void;}) {
  return (
    <button onClick={onClick} title={title}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300">
      {icon}
    </button>
  );
}

function Btn({children, onClick, danger}:{children:React.ReactNode; onClick:()=>void; danger?:boolean}) {
  return (
    <button onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg ${danger?'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50':'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'} transition-all flex items-center justify-center gap-2 font-medium`}>{children}</button>
  );
}

/* ==================== MODAL CREAR/EDITAR ==================== */
function ModalCE({ theme, onClose, onSaved, editReceta, opciones }:{
  theme: Theme; onClose:()=>void; onSaved:()=>void; editReceta:Receta|null;
  opciones:{ opCentros:Opcion[]; opMedicos:Opcion[]; opPacientes:Opcion[]; opMedicamentos:Opcion[]; opTipos:Opcion[]; }
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(()=>({
    id_centro: editReceta?.id_centro ?? "",
    id_medico: editReceta?.id_medico ?? "",
    id_paciente: editReceta?.id_paciente ?? "",
    fecha_emision: editReceta?.fecha_emision?.slice(0,16) ?? "",
    numero_receta: editReceta?.numero_receta ?? "",
    tipo_receta: editReceta?.tipo_receta ?? "",
    titulo: editReceta?.titulo ?? "",
  }));

  const [items, setItems] = useState<RecetaItem[]>([]);
  useEffect(()=>{
    (async ()=>{
      if (editReceta) {
        const res = await fetch(`/api/admin/recetas-medicas/${editReceta.id_receta}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) setItems((data.items||[]).map((it:any)=>({...it, es_controlado: it.es_controlado?1:0, dispensado: it.dispensado?1:0 })));
      } else {
        setItems([]);
      }
    })();
  }, [editReceta]);

  const input = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all";

  const addItem = () => setItems(prev => [...prev, {
    id_medicamento: null, nombre_medicamento: "", dosis:"", frecuencia:"",
    cantidad: 1, unidad:"", via_administracion:"", es_controlado:0
  }]);

  const updItem = (idx:number, patch:Partial<RecetaItem>) => {
    setItems(prev => prev.map((it, i)=> i===idx ? {...it, ...patch} : it));
  };
  const delItem = (idx:number) => setItems(prev => prev.filter((_,i)=>i!==idx));

  const submit = async () => {
    setSaving(true);
    try {
      const payload:any = {
        id_centro: Number(form.id_centro) || null,
        id_medico: Number(form.id_medico) || null,
        id_paciente: Number(form.id_paciente) || null,
        fecha_emision: form.fecha_emision || null,
        numero_receta: form.numero_receta || null,
        tipo_receta: form.tipo_receta || null,
        titulo: form.titulo || null,
        items: items.map(it=>({
          id_medicamento: it.id_medicamento ?? null,
          nombre_medicamento: it.nombre_medicamento ?? "",
          dosis: it.dosis ?? "",
          frecuencia: it.frecuencia ?? "",
          duracion: it.duracion ?? null,
          cantidad: Number.isFinite(Number(it.cantidad)) ? Number(it.cantidad) : 0,
          unidad: it.unidad ?? "",
          via_administracion: it.via_administracion ?? "",
          instrucciones: it.instrucciones ?? null,
          es_controlado: it.es_controlado ? 1 : 0,
          codigo_medicamento: it.codigo_medicamento ?? null,
          dispensado: it.dispensado ? 1 : 0,
          fecha_dispensacion: it.fecha_dispensacion ?? null,
          dispensado_por: it.dispensado_por ?? null,
          observaciones_dispensacion: it.observaciones_dispensacion ?? null,
        })),
      };

      const url = editReceta ? `/api/admin/recetas-medicas/${editReceta.id_receta}` : `/api/admin/recetas-medicas`;
      const method = editReceta ? "PUT" : "POST";
      if (editReceta) payload.items_replace = true;

      const res = await fetch(url, { method, headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "Error al guardar");
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <ModalBase title={editReceta ? "Editar receta" : "Nueva receta"} theme={theme} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Centro" required>
          <select value={form.id_centro} onChange={e=>setForm((f:any)=>({...f,id_centro:e.target.value}))} className={input}>
            <option value="">Seleccione...</option>
            {opciones.opCentros.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Médico" required>
          <select value={form.id_medico} onChange={e=>setForm((f:any)=>({...f,id_medico:e.target.value}))} className={input}>
            <option value="">Seleccione...</option>
            {opciones.opMedicos.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Paciente" required>
          <select value={form.id_paciente} onChange={e=>setForm((f:any)=>({...f,id_paciente:e.target.value}))} className={input}>
            <option value="">Seleccione...</option>
            {opciones.opPacientes.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Fecha emisión">
          <input type="datetime-local" value={form.fecha_emision} onChange={e=>setForm((f:any)=>({...f,fecha_emision:e.target.value}))} className={input}/>
        </Field>
        <Field label="Tipo de receta">
          <select value={form.tipo_receta} onChange={e=>setForm((f:any)=>({...f,tipo_receta:e.target.value}))} className={input}>
            <option value="">Seleccione...</option>
            {opciones.opTipos.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Nº Receta">
          <input value={form.numero_receta} onChange={e=>setForm((f:any)=>({...f,numero_receta:e.target.value}))} className={input} placeholder="Auto/consecutivo si tu BD lo genera"/>
        </Field>
        <div className="md:col-span-3">
          <Field label="Título / Observación">
            <input value={form.titulo} onChange={e=>setForm((f:any)=>({...f,titulo:e.target.value}))} className={input} placeholder="Opcional"/>
          </Field>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Package className="w-5 h-5"/> Medicamentos</h4>
          <button onClick={addItem} className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Agregar</button>
        </div>

        {items.length===0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No hay ítems. Agrega al menos uno.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx)=>(
              <div key={idx} className="grid md:grid-cols-6 gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Medicamento</label>
                  <div className="flex gap-2">
                    <select value={String(it.id_medicamento ?? "")}
                      onChange={(e)=>{
                        const v = e.target.value? Number(e.target.value): null;
                        const found = opciones.opMedicamentos.find(x=>String(x.value)===e.target.value);
                        updItem(idx, { id_medicamento: v, nombre_medicamento: found?.label || it.nombre_medicamento });
                      }}
                      className={input}>
                      <option value="">(Catálogo)…</option>
                      {opciones.opMedicamentos.map(o=><option key={o.value} value={String(o.value)}>{o.label}</option>)}
                    </select>
                    <input value={it.nombre_medicamento} onChange={e=>updItem(idx,{nombre_medicamento:e.target.value})} className={input} placeholder="o escribe el nombre exacto"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Dosis</label>
                  <input value={it.dosis} onChange={e=>updItem(idx,{dosis:e.target.value})} className={input} placeholder="500 mg"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Frecuencia</label>
                  <input value={it.frecuencia} onChange={e=>updItem(idx,{frecuencia:e.target.value})} className={input} placeholder="cada 8 horas"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Cantidad</label>
                  <input type="number" value={it.cantidad} onChange={e=>updItem(idx,{cantidad:Number(e.target.value)})} className={input}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Unidad</label>
                  <input value={it.unidad} onChange={e=>updItem(idx,{unidad:e.target.value})} className={input} placeholder="tabla, ml, mg"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Vía</label>
                  <input value={it.via_administracion} onChange={e=>updItem(idx,{via_administracion:e.target.value})} className={input} placeholder="oral, IM, IV…"/>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Instrucciones</label>
                  <input value={it.instrucciones ?? ""} onChange={e=>updItem(idx,{instrucciones:e.target.value})} className={input} placeholder="Tomar después de comidas…"/>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Controlado</label>
                  <input type="checkbox" checked={!!it.es_controlado} onChange={e=>updItem(idx,{es_controlado: e.target.checked?1:0})}/>
                </div>
                <div className="md:col-span-1">
                  <button onClick={()=>delItem(idx)} className="mt-6 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300">Cancelar</button>
        <button disabled={saving} onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50">
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}{saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </ModalBase>
  );
}

/* ==================== MODAL DETALLE ==================== */
function ModalDetalle({ theme, receta, onClose }:{ theme:Theme; receta:Receta; onClose:()=>void; }) {
  const b = badgeEstado(receta.estado);
  return (
    <ModalBase title="Detalle de receta" theme={theme} onClose={onClose} size="large">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${b.bg} ${b.text}`}>{b.label}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoBox title="Paciente" value={`${receta.paciente_nombre} · ${receta.paciente_rut}`}/>
          <InfoBox title="Médico" value={receta.medico_nombre}/>
          <InfoBox title="Centro" value={receta.centro_nombre}/>
          <InfoBox title="Fecha" value={new Date(receta.fecha_emision).toLocaleString()}/>
          <InfoBox title="N° receta" value={receta.numero_receta ?? "—"}/>
          <InfoBox title="Tipo" value={receta.tipo_receta ?? "—"}/>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300"><Package className="inline w-4 h-4 mr-1"/> Ítems: <strong>{receta.items_dispensados}/{receta.items_total}</strong> {receta.items_controlados>0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">Controlados: {receta.items_controlados}</span>}</div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 text-white hover:bg-gray-800 dark:hover:bg-indigo-700 transition-all font-semibold shadow-lg">Cerrar</button>
      </div>
    </ModalBase>
  );
}

/* ==================== MODAL TIPOS (CRUD) ==================== */
function ModalTipos({ onClose, onSaved }:{ onClose:()=>void; onSaved:()=>void }) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any|null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async ()=>{
    setLoading(true);
    const res = await fetch("/api/admin/recetas-medicas/tipos", { cache: "no-store" });
    const data = await res.json();
    if (data?.success) setItems(data.items||[]);
    setLoading(false);
  },[]);
  useEffect(()=>{ load(); },[load]);

  const save = async () => {
    if (!editing?.codigo || !editing?.nombre) return alert("Código y nombre requeridos");
    const res = await fetch("/api/admin/recetas-medicas/tipos", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ action:"upsert", ...editing, controlado: editing.controlado?1:0, requiere_rut: editing.requiere_rut?1:0, exige_firma: editing.exige_firma?1:0 })
    });
    const data = await res.json();
    if (!data?.success) return alert(data?.error || "Error");
    setEditing(null); await load(); onSaved();
  };

  const del = async (codigo:string) => {
    if (!confirm("¿Eliminar tipo?")) return;
    const res = await fetch("/api/admin/recetas-medicas/tipos", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ action:"delete", codigo })
    });
    const data = await res.json();
    if (!data?.success) return alert(data?.error || "Error");
    await load(); onSaved();
  };

  const input = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  return (
    <ModalBase title="Gestionar tipos de receta" onClose={onClose} theme={"light"} size="large">
      <div className="mb-4 flex gap-2">
        <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={()=>setEditing({ codigo:"", nombre:"", controlado:0, validez_dias:30, requiere_rut:1, exige_firma:1 })}>Nuevo tipo</button>
        <button className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600" onClick={load}>Refrescar</button>
      </div>

      {loading ? <div className="py-10 text-center text-gray-500">Cargando…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Controlado</th>
              <th className="px-3 py-2 text-left">Validez (días)</th>
              <th className="px-3 py-2 text-left">Requiere RUT</th>
              <th className="px-3 py-2 text-left">Exige firma</th>
              <th className="px-3 py-2"></th>
            </tr></thead>
            <tbody>
              {items.map((t:any)=>(
                <tr key={t.codigo} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2">{t.codigo}</td>
                  <td className="px-3 py-2">{t.nombre}</td>
                  <td className="px-3 py-2">{t.controlado ? "Sí" : "No"}</td>
                  <td className="px-3 py-2">{t.validez_dias ?? "—"}</td>
                  <td className="px-3 py-2">{t.requiere_rut ? "Sí" : "No"}</td>
                  <td className="px-3 py-2">{t.exige_firma ? "Sí" : "No"}</td>
                  <td className="px-3 py-2 text-right">
                    <button className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 mr-2" onClick={()=>setEditing(t)}>Editar</button>
                    <button className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-red-600" onClick={()=>del(t.codigo)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {items.length===0 && <tr><td className="px-3 py-10 text-center text-gray-500" colSpan={7}>No hay tipos</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Código</label>
              <input className={input} value={editing.codigo} onChange={e=>setEditing((s:any)=>({ ...s, codigo:e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nombre</label>
              <input className={input} value={editing.nombre} onChange={e=>setEditing((s:any)=>({ ...s, nombre:e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Validez (días)</label>
              <input type="number" className={input} value={editing.validez_dias ?? ""} onChange={e=>setEditing((s:any)=>({ ...s, validez_dias: e.target.value===""?null:Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!editing.controlado} onChange={e=>setEditing((s:any)=>({ ...s, controlado:e.target.checked }))} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Controlado</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!editing.requiere_rut} onChange={e=>setEditing((s:any)=>({ ...s, requiere_rut:e.target.checked }))} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Requiere RUT</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!editing.exige_firma} onChange={e=>setEditing((s:any)=>({ ...s, exige_firma:e.target.checked }))} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Exige firma</span>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Descripción</label>
              <textarea className={input} value={editing.descripcion ?? ""} onChange={e=>setEditing((s:any)=>({ ...s, descripcion:e.target.value }))}/>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600" onClick={()=>setEditing(null)}>Cancelar</button>
            <button className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={save}>Guardar</button>
          </div>
        </div>
      )}
    </ModalBase>
  );
}

/* ======== UI bits ======== */
function ModalBase({title, children, onClose, theme, size="default"}:{title:string; children:React.ReactNode; onClose:()=>void; theme:Theme; size?:"default"|"large"|"xl"}) {
  const sizeClasses = { default:"max-w-3xl", large:"max-w-5xl", xl:"max-w-7xl" }[size]!;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5 text-gray-600 dark:text-gray-400"/></button>
        </div>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
function Field({label, children, required}:{label:string; children:React.ReactNode; required?:boolean}) {
  return <div><label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">{label} {required && <span className="text-red-500">*</span>}</label>{children}</div>;
}
function InfoBox({title, value}:{title:string; value:any}) {
  return <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"><div className="text-xs text-gray-500 dark:text-gray-400">{title}</div><div className="font-semibold text-gray-900 dark:text-white">{value}</div></div>;
}
