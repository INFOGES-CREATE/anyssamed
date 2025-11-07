// frontend/src/app/(dashboard)/admin/roles/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, Edit, X, Search, CheckSquare, Archive, Trash2, RefreshCw, List, Grid,
  Printer, ChevronDown, ChevronUp, Check, Shield, ShieldCheck, ShieldAlert, 
  Loader2, Filter, Copy, Download, Upload, Eye, Settings, Users, Activity,
  TrendingUp, AlertTriangle, Lock, Unlock, FileText, History, GitCompare,
  Sparkles, Zap, Target, BarChart3, PieChart, Database, Clock, Calendar,
  Star, BookOpen, Layers, Box, Package, Shuffle, RotateCw, Save, FileEdit,
  ListChecks, SlidersHorizontal, Tags, Boxes, Network, GitBranch, Workflow,
  FolderTree, LucideIcon, MousePointer2, Maximize2, Minimize2, ArrowUpDown
} from "lucide-react";

type Theme = "light" | "dark";
type ViewMode = "table" | "cards" | "matrix" | "hierarchy" | "analytics";

type Rol = {
  id_rol: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  permisos: string[];
  activo: 0 | 1;
  orden: number;
  nivel_jerarquia?: number;
  es_predefinido?: 0 | 1;
  usuarios_count?: number;
  created_at?: string;
  updated_at?: string;
};

type Opcion = { value: string | number; label: string; modulo?: string; tipo?: string; critico?: boolean };

type PermisosAgrupados = {
  [modulo: string]: Opcion[];
};

type RolTemplate = {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  icono: LucideIcon;
  color: string;
};

type AuditLog = {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  detalles: string;
};

// ===================== SORT SAFE HELPER =====================
const toSortable = (val: Rol[keyof Rol]): number | string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "number") return val;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (Array.isArray(val)) return val.length;
  return String(val).toLowerCase();
};

export default function AdminRolesPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Rol[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filtros avanzados
  const [fSearch, setFSearch] = useState("");
  const [fActivo, setFActivo] = useState<"" | "1" | "0">("");
  const [fPermisos, setFPermisos] = useState<string[]>([]);
  const [fModulo, setFModulo] = useState("");
  const [fJerarquia, setFJerarquia] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selección / Modales
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBulk, setShowBulk] = useState(false);
  const [showCE, setShowCE] = useState(false);
  const [editRol, setEditRol] = useState<Rol | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [compareRoles, setCompareRoles] = useState<Rol[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Opciones y configuración
  const [opPermisos, setOpPermisos] = useState<Opcion[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Funcionalidades avanzadas
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: keyof Rol; direction: 'asc' | 'desc'} | null>(null);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [fullscreen, setFullscreen] = useState(false);

  // Theme initialization
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cargar opciones y estadísticas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/roles/opciones", { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          const perms = data.permisos || data.opciones?.permisos || [];
          setOpPermisos(perms);
        }
      } catch (e) { console.error(e); }

      // Cargar estadísticas
      try {
        const res = await fetch("/api/admin/roles/stats", { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setStats(data.stats);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Agrupar permisos por módulo
  const permisosAgrupados = useMemo((): PermisosAgrupados => {
    const grupos: PermisosAgrupados = {};
    opPermisos.forEach(p => {
      const modulo = p.modulo || "Otros";
      if (!grupos[modulo]) grupos[modulo] = [];
      grupos[modulo].push(p);
    });
    return grupos;
  }, [opPermisos]);

  const fetchData = useCallback(async (page = pagina) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ pagina: String(page), pageSize: String(pageSize) });
      if (fSearch) q.append("q", fSearch);
      if (fActivo !== "") q.append("activo", fActivo);
      if (fPermisos.length > 0) q.append("permisos", fPermisos.join(","));
      if (fModulo) q.append("modulo", fModulo);
      if (fJerarquia) q.append("jerarquia", fJerarquia);

      const res = await fetch(`/api/admin/roles?${q.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.success) {
        setItems(data.items || []);
        setTotal(Number(data.total || 0));
        setPagina(Number(data.pagina || page));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [pagina, pageSize, fSearch, fActivo, fPermisos, fModulo, fJerarquia]);

  useEffect(() => { fetchData(1); }, [pageSize, fActivo, fPermisos, fModulo, fJerarquia]);

  const resetFiltros = () => {
    setFSearch("");
    setFActivo("");
    setFPermisos([]);
    setFModulo("");
    setFJerarquia("");
    fetchData(1);
  };

  const onCreate = () => { setEditRol(null); setShowCE(true); };
  const onEdit = (r: Rol) => { setEditRol(r); setShowCE(true); };

  const onDelete = async (r: Rol) => {
    if (r.es_predefinido) {
      return alert("No se puede eliminar un rol predefinido del sistema");
    }
    if (r.usuarios_count && r.usuarios_count > 0) {
      if (!confirm(`Este rol tiene ${r.usuarios_count} usuarios asignados. ¿Está seguro de eliminarlo?`)) return;
    }
    if (!confirm("¿Eliminar este rol? Esta acción no se puede deshacer.")) return;
    
    const res = await fetch(`/api/admin/roles/${r.id_rol}`, { method: "DELETE" });
    const data = await res.json();
    if (!data?.success) return alert(data?.error || "No se pudo eliminar");
    fetchData(pagina);
  };

  const onClone = async (r: Rol) => {
    const newNombre = prompt(`Crear copia de "${r.nombre}". Ingrese el nombre:`, `${r.nombre} (Copia)`);
    if (!newNombre) return;

    const payload = {
      codigo: `${r.codigo}_COPY_${Date.now()}`,
      nombre: newNombre,
      descripcion: `Copia de: ${r.descripcion || r.nombre}`,
      permisos: r.permisos,
      activo: r.activo,
      orden: r.orden + 1,
      nivel_jerarquia: r.nivel_jerarquia
    };

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data?.success) return alert(data?.error || "Error al clonar");
    alert("Rol clonado exitosamente");
    fetchData(pagina);
  };

  const bulkAction = useCallback(async (action: string, ids: number[], extraData?: any) => {
    const res = await fetch("/api/admin/roles/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids, ...extraData })
    });
    const data = await res.json();
    if (!data?.success) throw new Error(data?.error || "Operación no aplicada");
    await fetchData(pagina);
    setSelected(new Set());
    return data;
  }, [fetchData, pagina]);

  const activarUno = async (id: number) => { await bulkAction("activar", [id]); };
  const desactivarUno = async (id: number) => { await bulkAction("desactivar", [id]); };

  const toggleSelect = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(r => r.id_rol)));
    }
  };

  // Exportar roles
  const exportRoles = async (format: 'json' | 'csv' | 'excel') => {
    try {
      const ids = selected.size > 0 ? Array.from(selected) : items.map(r => r.id_rol);
      const res = await fetch(`/api/admin/roles/export?format=${format}&ids=${ids.join(',')}`, {
        method: "GET"
      });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roles_export_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error al exportar: " + e);
    }
  };

  // Importar roles
  const importRoles = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch("/api/admin/roles/import", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Error al importar");
      
      alert(`Importación exitosa: ${data.imported} roles importados`);
      fetchData(1);
      setShowImport(false);
    } catch (e: any) {
      alert("Error al importar: " + e.message);
    }
  };

  // Comparar roles
  const openCompare = () => {
    if (selected.size < 2) {
      return alert("Seleccione al menos 2 roles para comparar");
    }
    const rolesToCompare = items.filter(r => selected.has(r.id_rol));
    setCompareRoles(rolesToCompare);
    setShowCompare(true);
  };

  // ===================== ORDENAMIENTO SEGURO =====================
  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    const { key, direction } = sortConfig;

    return [...items].sort((a, b) => {
      const va = toSortable(a[key]);
      const vb = toSortable(b[key]);

      if (va === "" && vb !== "") return 1;
      if (vb === "" && va !== "") return -1;

      let cmp: number;
      if (typeof va === "number" && typeof vb === "number") {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: "base" });
      }
      return direction === "asc" ? cmp : -cmp;
    });
  }, [items, sortConfig]);

  const requestSort = (key: keyof Rol) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Plantillas de roles
  const roleTemplates: RolTemplate[] = [
    {
      id: "super_admin",
      nombre: "Super Administrador",
      descripcion: "Acceso total al sistema",
      permisos: opPermisos.map(p => String(p.value)),
      icono: Shield,
      color: "bg-red-500"
    },
    {
      id: "admin",
      nombre: "Administrador",
      descripcion: "Administración general sin permisos críticos",
      permisos: opPermisos.filter(p => !p.critico).map(p => String(p.value)),
      icono: ShieldCheck,
      color: "bg-blue-500"
    },
    {
      id: "medico",
      nombre: "Médico",
      descripcion: "Acceso a consultas y pacientes",
      permisos: opPermisos.filter(p => p.modulo === "pacientes" || p.modulo === "consultas").map(p => String(p.value)),
      icono: Users,
      color: "bg-green-500"
    },
    {
      id: "recepcion",
      nombre: "Recepción",
      descripcion: "Gestión de citas y registro de pacientes",
      permisos: opPermisos.filter(p => p.modulo === "citas" || p.tipo === "lectura").map(p => String(p.value)),
      icono: BookOpen,
      color: "bg-purple-500"
    },
    {
      id: "farmacia",
      nombre: "Farmacia",
      descripcion: "Gestión de medicamentos y recetas",
      permisos: opPermisos.filter(p => p.modulo === "farmacia" || p.modulo === "medicamentos").map(p => String(p.value)),
      icono: Package,
      color: "bg-teal-500"
    },
    {
      id: "solo_lectura",
      nombre: "Solo Lectura",
      descripcion: "Acceso de solo visualización",
      permisos: opPermisos.filter(p => p.tipo === "lectura").map(p => String(p.value)),
      icono: Eye,
      color: "bg-gray-500"
    }
  ];

  const applyTemplate = (template: RolTemplate) => {
    setEditRol({
      id_rol: 0,
      codigo: template.id.toUpperCase(),
      nombre: template.nombre,
      descripcion: template.descripcion,
      permisos: template.permisos,
      activo: 1,
      orden: 100
    });
    setShowTemplates(false);
    setShowCE(true);
  };

  // Drag and drop para reordenar
  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: number) => {
    if (!draggedItem || draggedItem === targetId) return;
    
    const draggedIdx = items.findIndex(r => r.id_rol === draggedItem);
    const targetIdx = items.findIndex(r => r.id_rol === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    // Reordenar localmente
    const newItems = [...items];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);
    
    // Actualizar órdenes
    const updates = newItems.map((item, idx) => ({
      id_rol: item.id_rol,
      orden: idx + 1
    }));

    setItems(newItems);
    setDraggedItem(null);

    // Guardar en servidor
    try {
      await fetch("/api/admin/roles/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
    } catch (e) {
      console.error("Error al reordenar:", e);
      fetchData(pagina); // Recargar en caso de error
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${fullscreen ? 'fixed inset-0 z-50' : ''} ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-6 space-y-6">
        {/* HEADER PROFESIONAL */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                Gestión de Roles
                <span className="text-sm font-normal px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  Administración Avanzada
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                Control total de roles y permisos del sistema
                {stats && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    {stats.total_roles} roles • {stats.total_permisos} permisos
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Stats */}
            {stats && (
              <div className="hidden lg:flex items-center gap-3 mr-4">
                <StatBadge icon={<Users className="w-4 h-4" />} label="Usuarios" value={stats.total_usuarios} color="blue" />
                <StatBadge icon={<Activity className="w-4 h-4" />} label="Activos" value={stats.roles_activos} color="green" />
                <StatBadge icon={<AlertTriangle className="w-4 h-4" />} label="Críticos" value={stats.permisos_criticos} color="red" />
              </div>
            )}

            {/* Toolbar Actions */}
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              {theme === "light" ? "🌙" : "🌞"}
            </button>

            <div className="relative group">
              <button
                className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                <Settings className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => setViewMode("table")} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <List className="w-4 h-4" /> Vista Tabla
                </button>
                <button onClick={() => setViewMode("cards")} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Grid className="w-4 h-4" /> Vista Tarjetas
                </button>
                <button onClick={() => setViewMode("matrix")} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Network className="w-4 h-4" /> Matriz de Permisos
                </button>
                <button onClick={() => setViewMode("hierarchy")} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <FolderTree className="w-4 h-4" /> Vista Jerárquica
                </button>
                <button onClick={() => setViewMode("analytics")} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Analytics
                </button>
              </div>
            </div>

            <button onClick={() => setFullscreen(!fullscreen)}
              className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button onClick={() => setShowBulk(!showBulk)}
              className={`p-3 rounded-xl border transition-all shadow-sm ${showBulk ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <CheckSquare className="w-5 h-5" />
            </button>

            <button onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all font-semibold">
              <Plus className="w-5 h-5" /> Nuevo Rol
            </button>
          </div>
        </header>

        {/* FILTROS AVANZADOS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
            <div className="grid md:grid-cols-6 gap-3">
              {/* Búsqueda principal */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Búsqueda Rápida
                </label>
                <div className="relative">
                  <input 
                    value={fSearch} 
                    onChange={e => setFSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchData(1)}
                    placeholder="Código, nombre, descripción..." 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Estado</label>
                <select 
                  value={fActivo} 
                  onChange={e => setFActivo(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Activos</option>
                  <option value="0">Inactivos</option>
                </select>
              </div>

              {/* Módulo */}
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Módulo</label>
                <select 
                  value={fModulo} 
                  onChange={e => setFModulo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos los módulos</option>
                  {Object.keys(permisosAgrupados).map(modulo => (
                    <option key={modulo} value={modulo}>{modulo}</option>
                  ))}
                </select>
              </div>

              {/* Acciones */}
              <div className="md:col-span-2 flex items-end gap-2">
                <button 
                  onClick={() => fetchData(1)} 
                  className="flex-1 rounded-xl px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> Buscar
                </button>
                <button 
                  onClick={resetFiltros} 
                  className="flex-1 rounded-xl px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Limpiar
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filtros avanzados colapsables */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Nivel de Jerarquía</label>
                  <select 
                    value={fJerarquia} 
                    onChange={e => setFJerarquia(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="0">Nivel 0 - Super Admin</option>
                    <option value="1">Nivel 1 - Admin</option>
                    <option value="2">Nivel 2 - Gestor</option>
                    <option value="3">Nivel 3 - Usuario</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Permisos Específicos</label>
                  <select 
                    multiple
                    value={fPermisos}
                    onChange={e => setFPermisos(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 h-24"
                  >
                    {opPermisos.slice(0, 20).map(p => (
                      <option key={String(p.value)} value={String(p.value)}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Filtros Guardados</label>
                  <div className="flex flex-col gap-2">
                    <button className="text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-left">
                      💾 Guardar filtro actual
                    </button>
                    {savedFilters.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {savedFilters.length} filtros guardados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* TOOLBAR DE ACCIONES MASIVAS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Acciones básicas */}
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarBtn 
                icon={<RefreshCw className="w-4 h-4" />} 
                label="Refrescar" 
                onClick={() => fetchData(pagina)} 
              />
              <ToolbarBtn 
                icon={<Sparkles className="w-4 h-4" />} 
                label="Plantillas" 
                onClick={() => setShowTemplates(true)}
                highlight
              />
              <ToolbarBtn 
                icon={<GitCompare className="w-4 h-4" />} 
                label="Comparar" 
                onClick={openCompare}
                disabled={selected.size < 2}
              />
              <ToolbarBtn 
                icon={<Network className="w-4 h-4" />} 
                label="Matriz" 
                onClick={() => setShowPermissionMatrix(true)} 
              />
              <ToolbarBtn 
                icon={<BarChart3 className="w-4 h-4" />} 
                label="Analytics" 
                onClick={() => setShowAnalytics(true)} 
              />
              <ToolbarBtn 
                icon={<History className="w-4 h-4" />} 
                label="Auditoría" 
                onClick={() => setShowAudit(true)} 
              />
            </div>

            {/* Acciones de exportación/importación */}
            <div className="flex items-center gap-2">
              <div className="relative group">
                <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                  <Download className="w-4 h-4" /> Exportar
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button onClick={() => exportRoles('json')} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700">JSON</button>
                  <button onClick={() => exportRoles('csv')} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700">CSV</button>
                  <button onClick={() => exportRoles('excel')} className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700">Excel</button>
                </div>
              </div>

              <button 
                onClick={() => setShowImport(true)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
              >
                <Upload className="w-4 h-4" /> Importar
              </button>

              <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          </div>

          {/* Acciones masivas cuando hay selección */}
          {selected.size > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">
                {selected.size} seleccionado{selected.size > 1 ? 's' : ''}:
              </span>
              <ToolbarBtn 
                icon={<ShieldCheck className="w-4 h-4" />} 
                label="Activar" 
                onClick={async () => {
                  if (!selected.size) return alert("Selecciona roles");
                  await bulkAction("activar", [...selected]);
                }}
                size="sm"
              />
              <ToolbarBtn 
                icon={<ShieldAlert className="w-4 h-4" />} 
                label="Desactivar" 
                onClick={async () => {
                  if (!selected.size) return alert("Selecciona roles");
                  await bulkAction("desactivar", [...selected]);
                }}
                size="sm"
              />
              <ToolbarBtn 
                icon={<Copy className="w-4 h-4" />} 
                label="Clonar" 
                onClick={async () => {
                  if (!selected.size) return alert("Selecciona roles");
                  if (!confirm(`¿Clonar ${selected.size} rol(es)?`)) return;
                  await bulkAction("clone", [...selected]);
                }}
                size="sm"
              />
              <ToolbarBtn 
                icon={<Tags className="w-4 h-4" />} 
                label="Asignar Permisos" 
                onClick={() => {
                  // Abrir modal de asignación masiva
                  alert("Función en desarrollo");
                }}
                size="sm"
              />
              <ToolbarBtn 
                icon={<Trash2 className="w-4 h-4" />} 
                label="Eliminar" 
                onClick={async () => {
                  if (!selected.size) return alert("Selecciona roles");
                  if (!confirm(`¿Eliminar ${selected.size} rol(es)? Esta acción no se puede deshacer.`)) return;
                  await bulkAction("delete", [...selected]);
                }}
                size="sm"
                danger
              />
            </div>
          )}
        </section>

        {/* CONTENIDO SEGÚN MODO DE VISTA */}
        {viewMode === "table" && (
          <TableView
            loading={loading} 
            items={sortedItems} 
            selected={selected} 
            toggleSelect={toggleSelect}
            selectAll={selectAll}
            onEdit={onEdit}
            onDelete={onDelete}
            onClone={onClone}
            onActivar={activarUno} 
            onDesactivar={desactivarUno}
            sortConfig={sortConfig}
            requestSort={requestSort}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            showBulk={showBulk}
          />
        )}

        {viewMode === "cards" && (
          <CardsView 
            loading={loading} 
            items={items} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onClone={onClone}
          />
        )}

        {viewMode === "matrix" && (
          <MatrixView 
            items={items}
            permisos={opPermisos}
            permisosAgrupados={permisosAgrupados}
            loading={loading}
          />
        )}

        {viewMode === "hierarchy" && (
          <HierarchyView 
            items={items}
            loading={loading}
          />
        )}

        {viewMode === "analytics" && (
          <AnalyticsView 
            items={items}
            stats={stats}
            loading={loading}
          />
        )}

        {/* PAGINACIÓN */}
        {!loading && items.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Mostrando {Math.min((pagina - 1) * pageSize + 1, total)} - {Math.min(pagina * pageSize, total)} de {total} roles
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
                  disabled={pagina <= 1}
                  onClick={() => { const p = pagina - 1; setPagina(p); fetchData(p); }}
                >
                  Anterior
                </button>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
                  Página {pagina} de {Math.ceil(total / pageSize) || 1}
                </div>
                <button 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
                  disabled={pagina * pageSize >= total}
                  onClick={() => { const p = pagina + 1; setPagina(p); fetchData(p); }}
                >
                  Siguiente
                </button>
                <select 
                  className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pág</option>)}
                </select>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* MODALES */}
      {showCE && (
        <ModalCE
          theme={theme}
          onClose={() => setShowCE(false)}
          onSaved={() => { setShowCE(false); fetchData(pagina); }}
          editRol={editRol}
          permisosDisponibles={opPermisos}
          permisosAgrupados={permisosAgrupados}
        />
      )}

      {showTemplates && (
        <ModalTemplates
          theme={theme}
          onClose={() => setShowTemplates(false)}
          templates={roleTemplates}
          onApply={applyTemplate}
        />
      )}

      {showCompare && (
        <ModalCompare
          theme={theme}
          onClose={() => setShowCompare(false)}
          roles={compareRoles}
          permisos={opPermisos}
        />
      )}

      {showPermissionMatrix && (
        <ModalPermissionMatrix
          theme={theme}
          onClose={() => setShowPermissionMatrix(false)}
          roles={items}
          permisos={opPermisos}
          permisosAgrupados={permisosAgrupados}
        />
      )}

      {showAnalytics && (
        <ModalAnalytics
          theme={theme}
          onClose={() => setShowAnalytics(false)}
          items={items}
          stats={stats}
        />
      )}

      {showAudit && (
        <ModalAudit
          theme={theme}
          onClose={() => setShowAudit(false)}
          logs={auditLogs}
        />
      )}

      {showImport && (
        <ModalImport
          theme={theme}
          onClose={() => setShowImport(false)}
          onImport={importRoles}
        />
      )}
    </div>
  );
}

// ==================== COMPONENTES DE UTILIDAD ====================

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      {icon}
      <div className="flex flex-col">
        <span className="text-xs font-medium opacity-80">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
}

function ToolbarBtn({ icon, label, title, onClick, disabled, danger, highlight, size = "md" }: { 
  icon: any; 
  label?: string; 
  title?: string; 
  onClick: () => void; 
  disabled?: boolean;
  danger?: boolean;
  highlight?: boolean;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  
  let colorClasses = "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300";
  
  if (danger) {
    colorClasses = "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300";
  } else if (highlight) {
    colorClasses = "bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg";
  }

  return (
    <button 
      onClick={onClick} 
      title={title}
      disabled={disabled}
      className={`${sizeClasses} rounded-xl border transition-all flex items-center gap-2 font-medium ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}

// ==================== VISTA DE TABLA ====================

function TableView({
  loading, items, selected, toggleSelect, selectAll, onEdit, onDelete, onClone,
  onActivar, onDesactivar, sortConfig, requestSort, onDragStart, onDragOver, onDrop, showBulk
}: {
  loading: boolean; 
  items: Rol[]; 
  selected: Set<number>; 
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  onEdit: (r: Rol) => void; 
  onDelete: (r: Rol) => void;
  onClone: (r: Rol) => void;
  onActivar: (id: number) => void; 
  onDesactivar: (id: number) => void;
  sortConfig: {key: keyof Rol; direction: 'asc' | 'desc'} | null;
  requestSort: (key: keyof Rol) => void;
  onDragStart: (id: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: number) => void;
  showBulk: boolean;
}) {
  const getSortIcon = (key: keyof Rol) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : 
      <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />;
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-750 border-b-2 border-gray-200 dark:border-gray-600">
            <tr className="text-left">
              {showBulk && (
                <th className="px-4 py-4">
                  <input 
                    type="checkbox" 
                    checked={selected.size === items.length && items.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="px-4 py-4">
                <button 
                  onClick={() => requestSort('orden')}
                  className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <MousePointer2 className="w-4 h-4" />
                  Orden
                  {getSortIcon('orden')}
                </button>
              </th>
              <th className="px-4 py-4">
                <button 
                  onClick={() => requestSort('codigo')}
                  className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Código
                  {getSortIcon('codigo')}
                </button>
              </th>
              <th className="px-4 py-4">
                <button 
                  onClick={() => requestSort('nombre')}
                  className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Nombre
                  {getSortIcon('nombre')}
                </button>
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Descripción</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Permisos</th>
              <th className="px-4 py-4">
                <button 
                  onClick={() => requestSort('nivel_jerarquia')}
                  className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Jerarquía
                  {getSortIcon('nivel_jerarquia')}
                </button>
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuarios
                </div>
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={showBulk ? 10 : 9} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando roles...</p>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={showBulk ? 10 : 9} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron roles</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                    >
                      Refrescar
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              items.map(r => (
                <tr 
                  key={r.id_rol} 
                  draggable
                  onDragStart={() => onDragStart(r.id_rol)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(r.id_rol)}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-750 dark:hover:to-gray-700 transition-all cursor-move group"
                >
                  {showBulk && (
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        checked={selected.has(r.id_rol)} 
                        onChange={() => toggleSelect(r.id_rol)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MousePointer2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="font-mono text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {r.orden}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
  <div className="flex items-center gap-2">
    <code className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold">
      {r.codigo}
    </code>
    {r.es_predefinido === 1 && (
      <span
        title="Rol predefinido del sistema"
        aria-label="Rol predefinido del sistema"
        className="inline-flex"
      >
        <Lock className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
      </span>
    )}
  </div>
</td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{r.nombre}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {r.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(r.permisos || []).slice(0, 3).map(p => (
                        <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                          {p}
                        </span>
                      ))}
                      {r.permisos && r.permisos.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold">
                          +{r.permisos.length - 3}
                        </span>
                      )}
                      {(!r.permisos || r.permisos.length === 0) && (
                        <span className="text-xs text-gray-400 italic">Sin permisos</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Nivel {r.nivel_jerarquia ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {r.usuarios_count || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {r.activo ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                        <X className="w-3.5 h-3.5" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <IconBtn title="Editar rol" icon={<Edit className="w-4 h-4" />} onClick={() => onEdit(r)} />
                      <IconBtn title="Clonar rol" icon={<Copy className="w-4 h-4" />} onClick={() => onClone(r)} color="blue" />
                      {r.activo ? (
                        <IconBtn title="Desactivar" icon={<Archive className="w-4 h-4" />} onClick={() => onDesactivar(r.id_rol)} color="amber" />
                      ) : (
                        <IconBtn title="Activar" icon={<ShieldCheck className="w-4 h-4" />} onClick={() => onActivar(r.id_rol)} color="green" />
                      )}
                      <IconBtn title="Eliminar rol" icon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(r)} color="red" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ==================== VISTA DE TARJETAS ====================

function CardsView({ loading, items, onEdit, onDelete, onClone }: { 
  loading: boolean; 
  items: Rol[]; 
  onEdit: (r: Rol) => void; 
  onDelete: (r: Rol) => void;
  onClone: (r: Rol) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron roles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(r => (
        <div 
          key={r.id_rol} 
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
  <code className="px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
    {r.codigo}
  </code>

  {r.es_predefinido === 1 && (
    <span
      title="Rol predefinido"
      aria-label="Rol predefinido"
      className="inline-flex"
    >
      <Lock className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
    </span>
  )}
</div>

              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{r.nombre}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {r.descripcion || <span className="italic">Sin descripción</span>}
              </p>
            </div>
            {r.activo ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Activo
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Inactivo
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-600 dark:text-gray-400">Nivel {r.nivel_jerarquia ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">{r.usuarios_count || 0} usuarios</span>
            </div>
          </div>

          {/* Permisos */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Permisos ({r.permisos?.length || 0})
            </div>
            <div className="flex flex-wrap gap-1">
              {(r.permisos || []).slice(0, 6).map(p => (
                <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                  {p.length > 12 ? p.substring(0, 12) + '...' : p}
                </span>
              ))}
              {r.permisos && r.permisos.length > 6 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold">
                  +{r.permisos.length - 6}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Btn onClick={() => onEdit(r)} icon={<Edit className="w-4 h-4" />}>
              Editar
            </Btn>
            <Btn onClick={() => onClone(r)} icon={<Copy className="w-4 h-4" />} secondary>
              Clonar
            </Btn>
            <button
              onClick={() => onDelete(r)}
              className="p-2 rounded-lg border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all text-red-600 dark:text-red-400"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== VISTA DE MATRIZ ====================

function MatrixView({ items, permisos, permisosAgrupados, loading }: {
  items: Rol[];
  permisos: Opcion[];
  permisosAgrupados: PermisosAgrupados;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-750 dark:to-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Matriz de Permisos por Rol
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Vista completa de todos los permisos asignados a cada rol
        </p>
      </div>

      <div className="overflow-x-auto p-6">
        <div className="min-w-max">
          {Object.entries(permisosAgrupados).map(([modulo, permsModulo]) => (
            <div key={modulo} className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{modulo}</h4>
                <span className="text-sm text-gray-500">({permsModulo.length} permisos)</span>
              </div>

              <div className="grid gap-2">
                {permsModulo.map(permiso => (
                  <div key={String(permiso.value)} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
  {permiso.label}
  {permiso.critico && (
    <span
      title="Permiso crítico"
      aria-label="Permiso crítico"
      className="inline-flex"
    >
      <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
    </span>
  )}
</div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {permiso.tipo && <span className="capitalize">{permiso.tipo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {items.map(rol => {
                        const tienePermiso = rol.permisos?.includes(String(permiso.value));
                        return (
                          <div
                            key={rol.id_rol}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all ${
                              tienePermiso
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }`}
                            title={`${rol.nombre} - ${tienePermiso ? 'Tiene' : 'No tiene'} este permiso`}
                          >
                            {tienePermiso ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Permiso concedido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <X className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Permiso denegado</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Permiso crítico</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== VISTA JERÁRQUICA ====================

function HierarchyView({ items, loading }: { items: Rol[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // Agrupar por nivel de jerarquía
  const itemsPorNivel = items.reduce((acc, rol) => {
    const nivel = rol.nivel_jerarquia ?? 99;
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(rol);
    return acc;
  }, {} as Record<number, Rol[]>);

  const niveles = Object.keys(itemsPorNivel).sort((a, b) => Number(a) - Number(b));

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-750 dark:to-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FolderTree className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Vista Jerárquica de Roles
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Organización de roles por nivel de jerarquía
        </p>
      </div>

      <div className="p-6 space-y-8">
        {niveles.map(nivel => (
          <div key={nivel} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white ${
                Number(nivel) === 0 ? 'bg-red-500' :
                Number(nivel) === 1 ? 'bg-orange-500' :
                Number(nivel) === 2 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                {nivel}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  Nivel {nivel} - {
                    Number(nivel) === 0 ? 'Super Administrador' :
                    Number(nivel) === 1 ? 'Administrador' :
                    Number(nivel) === 2 ? 'Gestor' :
                    'Usuario'
                  }
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {itemsPorNivel[Number(nivel)].length} rol(es) en este nivel
                </p>
              </div>
            </div>

            <div className="ml-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsPorNivel[Number(nivel)].map(rol => (
                <div key={rol.id_rol} className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all bg-white dark:bg-gray-750">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <code className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                        {rol.codigo}
                      </code>
                      <h5 className="font-bold text-gray-900 dark:text-white mt-2">{rol.nombre}</h5>
                    </div>
                    {rol.activo ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      {rol.permisos?.length || 0} permisos
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {rol.usuarios_count || 0} usuarios
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==================== VISTA DE ANALYTICS ====================

function AnalyticsView({ items, stats, loading }: {
  items: Rol[];
  stats: any;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // Calcular métricas
  const rolesActivos = items.filter(r => r.activo === 1).length;
  const rolesInactivos = items.filter(r => r.activo === 0).length;
  const totalUsuarios = items.reduce((acc, r) => acc + (r.usuarios_count || 0), 0);
  const promedioPermisosPorRol = items.length > 0 ? Math.round(items.reduce((acc, r) => acc + (r.permisos?.length || 0), 0) / items.length) : 0;

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          icon={<Shield className="w-8 h-8" />}
          title="Total Roles"
          value={items.length}
          subtitle="En el sistema"
          color="blue"
        />
        <AnalyticsCard
          icon={<Check className="w-8 h-8" />}
          title="Roles Activos"
          value={rolesActivos}
          subtitle={`${Math.round((rolesActivos / items.length) * 100)}% del total`}
          color="green"
        />
        <AnalyticsCard
          icon={<Users className="w-8 h-8" />}
          title="Total Usuarios"
          value={totalUsuarios}
          subtitle="Con roles asignados"
          color="purple"
        />
        <AnalyticsCard
          icon={<Activity className="w-8 h-8" />}
          title="Promedio Permisos"
          value={promedioPermisosPorRol}
          subtitle="Por rol"
          color="orange"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top roles por usuarios */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Top Roles por Usuarios
          </h3>
          <div className="space-y-3">
            {items
              .sort((a, b) => (b.usuarios_count || 0) - (a.usuarios_count || 0))
              .slice(0, 5)
              .map(rol => {
                const maxUsuarios = Math.max(...items.map(r => r.usuarios_count || 0));
                const percentage = maxUsuarios > 0 ? ((rol.usuarios_count || 0) / maxUsuarios) * 100 : 0;
                
                return (
                  <div key={rol.id_rol} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">{rol.nombre}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{rol.usuarios_count || 0} usuarios</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Distribución de permisos */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Distribución de Permisos
          </h3>
          <div className="space-y-3">
            {items
              .sort((a, b) => (b.permisos?.length || 0) - (a.permisos?.length || 0))
              .slice(0, 5)
              .map(rol => {
                const maxPermisos = Math.max(...items.map(r => r.permisos?.length || 0));
                const percentage = maxPermisos > 0 ? ((rol.permisos?.length || 0) / maxPermisos) * 100 : 0;
                
                return (
                  <div key={rol.id_rol} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">{rol.nombre}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{rol.permisos?.length || 0} permisos</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {/* Estado y tendencias */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Estado y Distribución
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {rolesActivos}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Roles Activos
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gray-100 dark:bg-gray-700">
            <div className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              {rolesInactivos}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Roles Inactivos
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {Math.round((rolesActivos / items.length) * 100)}%
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Tasa de Actividad
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AnalyticsCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

function IconBtn({ title, icon, onClick, color = "gray" }: { 
  title: string; 
  icon: React.ReactNode; 
  onClick: () => void;
  color?: 'gray' | 'blue' | 'green' | 'amber' | 'red';
}) {
  const colorClasses = {
    gray: "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
    blue: "border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "border-emerald-300 dark:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    red: "border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
  };

  return (
    <button 
      onClick={onClick} 
      title={title}
      className={`p-2 rounded-lg border transition-all ${colorClasses[color]}`}
    >
      {icon}
    </button>
  );
}

function Btn({ children, onClick, icon, secondary }: { 
  children: React.ReactNode; 
  onClick: () => void; 
  icon?: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
        secondary
          ? 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ==================== MODAL CREAR/EDITAR ====================

function ModalCE({
  theme, onClose, onSaved, editRol, permisosDisponibles, permisosAgrupados
}: {
  theme: Theme;
  onClose: () => void;
  onSaved: () => void;
  editRol: Rol | null;
  permisosDisponibles: Opcion[];
  permisosAgrupados: PermisosAgrupados;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(() => ({
    codigo: editRol?.codigo ?? "",
    nombre: editRol?.nombre ?? "",
    descripcion: editRol?.descripcion ?? "",
    activo: editRol?.activo ?? 1,
    orden: editRol?.orden ?? 100,
    nivel_jerarquia: editRol?.nivel_jerarquia ?? 3,
  }));
  const [perms, setPerms] = useState<string[]>(editRol?.permisos ?? []);
  const [selectedModule, setSelectedModule] = useState<string>("");

  const input = "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all";

  const togglePerm = (code: string) => {
    setPerms(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);
  };

  const toggleModulePerms = (modulo: string) => {
    const permsModulo = permisosAgrupados[modulo].map(p => String(p.value));
    const allSelected = permsModulo.every(p => perms.includes(p));
    
    if (allSelected) {
      setPerms(prev => prev.filter(p => !permsModulo.includes(p)));
    } else {
      setPerms(prev => [...new Set([...prev, ...permsModulo])]);
    }
  };

  const submit = async () => {
    if (!form.codigo || !form.nombre) return alert("Código y nombre son requeridos");
    setSaving(true);
    try {
      const payload = { ...form, permisos: perms };
      const url = editRol ? `/api/admin/roles/${editRol.id_rol}` : `/api/admin/roles`;
      const method = editRol ? "PUT" : "POST";
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "Error al guardar");
      onSaved();
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <ModalBase title={editRol ? "Editar Rol" : "Crear Nuevo Rol"} theme={theme} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Código" required>
            <input 
              value={form.codigo} 
              onChange={e => setForm((f: any) => ({ ...f, codigo: e.target.value.toUpperCase() }))} 
              className={input} 
              placeholder="ADMIN, MEDICO, FARMACIA…"
              disabled={editRol?.es_predefinido === 1}
            />
          </Field>
          <Field label="Nombre" required>
            <input 
              value={form.nombre} 
              onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} 
              className={input} 
              placeholder="Administrador"
            />
          </Field>
          <Field label="Nivel de Jerarquía" required>
            <select 
              value={form.nivel_jerarquia} 
              onChange={e => setForm((f: any) => ({ ...f, nivel_jerarquia: Number(e.target.value) }))}
              className={input}
            >
              <option value={0}>Nivel 0 - Super Admin</option>
              <option value={1}>Nivel 1 - Administrador</option>
              <option value={2}>Nivel 2 - Gestor</option>
              <option value={3}>Nivel 3 - Usuario</option>
            </select>
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Orden">
            <input 
              type="number" 
              value={form.orden} 
              onChange={e => setForm((f: any) => ({ ...f, orden: Number(e.target.value || 0) }))} 
              className={input}
            />
          </Field>
          <Field label="Estado">
            <select 
              className={input} 
              value={form.activo} 
              onChange={e => setForm((f: any) => ({ ...f, activo: Number(e.target.value) }))}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea 
            value={form.descripcion} 
            onChange={e => setForm((f: any) => ({ ...f, descripcion: e.target.value }))} 
            className={input} 
            rows={3}
            placeholder="Descripción detallada del rol y sus responsabilidades (opcional)"
          />
        </Field>

        {/* Selector de permisos avanzado */}
        <div>
          <label className="text-sm font-semibold block mb-3 text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permisos Asignados ({perms.length})
            </span>
            <span className="text-xs font-normal text-gray-500">
              {permisosDisponibles.length} permisos disponibles
            </span>
          </label>

          {/* Filtro por módulo */}
          <div className="mb-4">
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className={input}
            >
              <option value="">Todos los módulos</option>
              {Object.keys(permisosAgrupados).map(modulo => (
                <option key={modulo} value={modulo}>{modulo}</option>
              ))}
            </select>
          </div>

          {/* Lista de permisos por módulo */}
          <div className="max-h-[400px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/40">
            {Object.entries(permisosAgrupados)
              .filter(([modulo]) => !selectedModule || modulo === selectedModule)
              .map(([modulo, permsModulo]) => {
                const allSelected = permsModulo.every(p => perms.includes(String(p.value)));
                const someSelected = permsModulo.some(p => perms.includes(String(p.value)));

                return (
                  <div key={modulo} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div 
                      className="p-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-750 dark:to-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      onClick={() => toggleModulePerms(modulo)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleModulePerms(modulo);
                          }}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-gray-900 dark:text-white">{modulo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {permsModulo.filter(p => perms.includes(String(p.value))).length} de {permsModulo.length}
                        </span>
                        {someSelected && !allSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Selección parcial" />
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 grid md:grid-cols-2 gap-3">
                      {permsModulo.map(p => (
                        <label 
                          key={String(p.value)} 
                          className="flex items-start gap-3 text-sm text-gray-800 dark:text-gray-200 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-750 transition-all cursor-pointer group"
                        >
                          <input 
                            type="checkbox" 
                            checked={perms.includes(String(p.value))} 
                            onChange={() => togglePerm(String(p.value))}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                           <div className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
  {p.label}
  {p.critico && (
    <span
      title="Permiso crítico"
      aria-label="Permiso crítico"
      className="inline-flex"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
    </span>
  )}
</div>

                            {p.tipo && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {p.tipo}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {editRol?.es_predefinido === 1 && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Lock className="w-4 h-4" />
              <span>Rol predefinido del sistema - algunos campos no se pueden modificar</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button 
            disabled={saving} 
            onClick={submit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saving ? "Guardando..." : (editRol ? "Actualizar Rol" : "Crear Rol")}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ==================== MODAL DE PLANTILLAS ====================

function ModalTemplates({
  theme, onClose, templates, onApply
}: {
  theme: Theme;
  onClose: () => void;
  templates: RolTemplate[];
  onApply: (template: RolTemplate) => void;
}) {
  return (
    <ModalBase title="Plantillas de Roles" theme={theme} onClose={onClose} size="large">
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona una plantilla predefinida para crear rápidamente un nuevo rol con permisos preconfigurados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => {
          const Icon = template.icono;
          return (
            <div
              key={template.id}
              onClick={() => onApply(template)}
              className="p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all hover:shadow-xl group bg-white dark:bg-gray-750"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${template.color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {template.nombre}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.descripcion}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>{template.permisos.length} permisos</span>
                </div>
                <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all">
                  Usar plantilla
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ModalBase>
  );
}

// ==================== MODAL DE COMPARACIÓN ====================

function ModalCompare({
  theme, onClose, roles, permisos
}: {
  theme: Theme;
  onClose: () => void;
  roles: Rol[];
  permisos: Opcion[];
}) {
  // Obtener todos los permisos únicos
  const allPermisos = Array.from(new Set(roles.flatMap(r => r.permisos || [])));

  return (
    <ModalBase title="Comparación de Roles" theme={theme} onClose={onClose} size="xl">
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Comparando {roles.length} roles seleccionados
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-750">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-700 z-10">
                Permiso
              </th>
              {roles.map(rol => (
                <th key={rol.id_rol} className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-200">
                  <div className="flex flex-col items-center">
                    <code className="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mb-1">
                      {rol.codigo}
                    </code>
                    <span>{rol.nombre}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPermisos.map((permiso, idx) => {
              const permisoData = permisos.find(p => String(p.value) === permiso);
              return (
                <tr key={permiso} className={`border-t border-gray-200 dark:border-gray-700 ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-center gap-2">
  {permisoData?.label ?? permiso}
  {permisoData?.critico && (
    <span
      title="Permiso crítico"
      aria-label="Permiso crítico"
      className="inline-flex"
    >
      <AlertTriangle
        className="w-3.5 h-3.5 text-red-500"
        aria-hidden="true"
      />
    </span>
  )}
</div>

                  </td>
                  {roles.map(rol => {
                    const tiene = rol.permisos?.includes(permiso);
                    return (
                      <td key={rol.id_rol} className="px-4 py-3 text-center">
                        {tiene ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(rol => (
          <div key={rol.id_rol} className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-750 dark:to-gray-700 border border-indigo-200 dark:border-gray-600">
            <div className="font-bold text-gray-900 dark:text-white mb-2">{rol.nombre}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Total permisos: {rol.permisos?.length || 0}</div>
              <div>Permisos únicos: {rol.permisos?.filter(p => !roles.some(r => r.id_rol !== rol.id_rol && r.permisos?.includes(p))).length || 0}</div>
            </div>
          </div>
        ))}
      </div>
    </ModalBase>
  );
}

// ==================== MODAL MATRIZ DE PERMISOS ====================

function ModalPermissionMatrix({
  theme, onClose, roles, permisos, permisosAgrupados
}: {
  theme: Theme;
  onClose: () => void;
  roles: Rol[];
  permisos: Opcion[];
  permisosAgrupados: PermisosAgrupados;
}) {
  return (
    <ModalBase title="Matriz Completa de Permisos" theme={theme} onClose={onClose} size="xl">
      <div className="space-y-6">
        {Object.entries(permisosAgrupados).map(([modulo, permsModulo]) => (
          <div key={modulo} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-750 dark:to-gray-700">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {modulo}
                <span className="text-sm font-normal text-gray-500">({permsModulo.length})</span>
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-200">Permiso</th>
                    {roles.map(rol => (
                      <th key={rol.id_rol} className="px-3 py-2 text-center font-bold text-gray-700 dark:text-gray-200">
                        {rol.codigo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permsModulo.map(permiso => (
                    <tr key={String(permiso.value)} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {permiso.label}
                          {permiso.critico && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        </div>
                      </td>
                      {roles.map(rol => {
                        const tiene = rol.permisos?.includes(String(permiso.value));
                        return (
                          <td key={rol.id_rol} className="px-3 py-2 text-center">
                            <div className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center ${
                              tiene ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                              {tiene ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-gray-400" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </ModalBase>
  );
}

// ==================== MODAL ANALYTICS ====================

function ModalAnalytics({
  theme, onClose, items, stats
}: {
  theme: Theme;
  onClose: () => void;
  items: Rol[];
  stats: any;
}) {
  return (
    <ModalBase title="Analytics y Estadísticas" theme={theme} onClose={onClose} size="xl">
      <AnalyticsView items={items} stats={stats} loading={false} />
    </ModalBase>
  );
}

// ==================== MODAL AUDITORÍA ====================

function ModalAudit({
  theme, onClose, logs
}: {
  theme: Theme;
  onClose: () => void;
  logs: AuditLog[];
}) {
  return (
    <ModalBase title="Registro de Auditoría" theme={theme} onClose={onClose} size="large">
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No hay registros de auditoría disponibles</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{log.fecha}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {log.usuario}
                </span>
              </div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">{log.accion}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{log.detalles}</div>
            </div>
          ))
        )}
      </div>
    </ModalBase>
  );
}

// ==================== MODAL IMPORTACIÓN ====================

function ModalImport({
  theme, onClose, onImport
}: {
  theme: Theme;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleSubmit = async () => {
    if (!file) return alert("Selecciona un archivo");
    setImporting(true);
    try {
      await onImport(file);
    } finally {
      setImporting(false);
    }
  };

  return (
    <ModalBase title="Importar Roles" theme={theme} onClose={onClose}>
      <div className="space-y-6">
        <div className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all bg-gray-50 dark:bg-gray-750">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <div className="mb-4">
              <label className="cursor-pointer">
                <span className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all inline-flex items-center gap-2 font-semibold">
                  <Upload className="w-5 h-5" />
                  Seleccionar archivo
                </span>
                <input
                  type="file"
                  accept=".json,.csv,.xlsx"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
            {file && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                <FileText className="w-5 h-5 inline mr-2" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Formatos soportados
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-7">
            <li>• JSON (.json)</li>
            <li>• CSV (.csv)</li>
            <li>• Excel (.xlsx)</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium">
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || importing}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {importing && <Loader2 className="w-5 h-5 animate-spin" />}
            {importing ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

// ==================== MODAL BASE ====================

function ModalBase({ 
  title, 
  children, 
  onClose, 
  theme, 
  size = "default" 
}: { 
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
  }[size]!;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-750 dark:to-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }: { 
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
