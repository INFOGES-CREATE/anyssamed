// frontend/src/app/(dashboard)/admin/pacientes/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Edit, X, Search, UserCheck, Phone, Mail, Loader2, Download, Filter, Eye,
  Calendar, Activity, FileText, TrendingUp, Moon, Sun, BarChart3, List, Grid, RefreshCw,
  Printer, History, Shield, Trash2, MapPin, HeartPulse, User, UserPlus, ArrowLeft,
  AlertCircle, CheckCircle, Clock, Zap, MoreVertical, Copy, Share2, Lock, Unlock
} from "lucide-react";

/* ==================== TIPOS ==================== */
type Opcion = { value: number | string; label: string; [k: string]: any };
type ViewMode = "table" | "cards";
type Theme = "light" | "dark";
type GeneroType = "masculino" | "femenino" | "otro" | "prefiero_no_decir";
type EstadoCivilType = "soltero" | "casado" | "divorciado" | "viudo" | "union_libre" | "conviviente" | "separado";
type DocumentoTipo = "rut" | "dni" | "passport" | "ssn" | "nif" | "nie" | "cedula" | "curp" | "otros";
type SortField = "nombre" | "fecha_registro" | "edad" | "estado" | "prevision";
type SortOrder = "asc" | "desc";

type Paciente = {
  id_paciente: number;
  documento_tipo?: DocumentoTipo;
  rut: string;
  pasaporte?: string | null;
  nombre: string;
  segundo_nombre?: string | null;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_preferido?: string | null;
  pronombres?: string | null;
  fecha_nacimiento: string;
  genero: GeneroType;
  nacionalidad: string;
  estado_civil: EstadoCivilType | null;
  email: string | null;
  telefono: string | null;
  telefono_secundario: string | null;
  preferencia_contacto?: "email" | "telefono" | "sms" | "whatsapp" | "ninguno";
  direccion: string | null;
  comuna: string | null;
  region: string | null;
  ciudad: string | null;
  pais?: string | null;
  codigo_postal?: string | null;
  tipo_sangre: string | null;
  prevision_salud: string | null;
  ocupacion: string | null;
  activo: 0 | 1;
  fecha_registro: string;
  fecha_ultima_actualizacion: string;
  estado?: "activo" | "inactivo" | "bloqueado" | "fallecido";
  edad?: number;
  nombre_completo?: string;
  total_citas?: number;
  ultima_cita?: string;
  medico_tratante?: string;
  alergias?: string | null;
  condiciones_medicas?: string | null;
  contacto_emergencia?: string | null;
  telefono_emergencia?: string | null;
};

type Estadisticas = {
  total_pacientes: number;
  pacientes_activos: number;
  pacientes_nuevos_mes: number;
  promedio_edad: number;
  total_citas: number;
  pacientes_con_medico: number;
  pacientes_con_prevision: number;
  tasa_ocupacion?: number;
  crecimiento_mes?: number;
};

type FilterState = {
  search: string;
  activo: "" | "0" | "1";
  genero: "" | GeneroType;
  prevision: string;
  pais: string;
  edad_min: string;
  edad_max: string;
  region: string;
  comuna: string;
  con_medico: "" | "0" | "1";
  desde: string;
  hasta: string;
  estado_civil: string;
  tipo_sangre: string;
};

/* ==================== COMPONENTE PRINCIPAL ==================== */
export default function AdminPacientesPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>("fecha_registro");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [stats, setStats] = useState<Estadisticas>({
    total_pacientes: 0,
    pacientes_activos: 0,
    pacientes_nuevos_mes: 0,
    promedio_edad: 0,
    total_citas: 0,
    pacientes_con_medico: 0,
    pacientes_con_prevision: 0,
    tasa_ocupacion: 0,
    crecimiento_mes: 0,
  });

  const safeInt = (value: any): number => {
    const num = Number(value);
    return Number.isFinite(num) ? Math.round(num) : 0;
  };

  const safeFloat = (value: any): number => {
    const num = Number(value);
    return Number.isFinite(num) ? parseFloat(num.toFixed(2)) : 0;
  };

  // Filtros avanzados
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    activo: "",
    genero: "",
    prevision: "",
    pais: "",
    edad_min: "",
    edad_max: "",
    region: "",
    comuna: "",
    con_medico: "",
    desde: "",
    hasta: "",
    estado_civil: "",
    tipo_sangre: "",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Opciones (dinámicas)
  const [opPaises, setOpPaises] = useState<Opcion[]>([]);
  const [opRegiones, setOpRegiones] = useState<Opcion[]>([]);
  const [opComunas, setOpComunas] = useState<Opcion[]>([]);
  const [opPrevisiones, setOpPrevisiones] = useState<Opcion[]>([]);
  const [opMedicos, setOpMedicos] = useState<Opcion[]>([]);
  const [opEstadosCiviles, setOpEstadosCiviles] = useState<Opcion[]>([]);
  const [opTiposSangre, setOpTiposSangre] = useState<Opcion[]>([]);
  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);

  // Modales
  const [showModalCE, setShowModalCE] = useState(false);
  const [editPaciente, setEditPaciente] = useState<Paciente | null>(null);
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [pacienteDetalle, setPacienteDetalle] = useState<Paciente | null>(null);
  const [showModalHistorial, setShowModalHistorial] = useState(false);
  const [pacienteHistorial, setPacienteHistorial] = useState<Paciente | null>(null);

  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedPacientes, setSelectedPacientes] = useState<Set<number>>(new Set());

  // Notificaciones
  const [notifications, setNotifications] = useState<Array<{ id: string; type: "success" | "error" | "info"; message: string; timestamp: number }>>([]);

  const addNotification = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  /* ==================== THEME ==================== */
  useEffect(() => {
    const savedTheme = (typeof window !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  /* ==================== CARGA INICIAL ==================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/pacientes/opciones", { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          const paises: Opcion[] = data.geo?.paises || [];
          setOpPaises(paises);

          const chile = paises.find(
            (p: any) => p.codigo_iso2 === "CL" || p.codigo_iso3 === "CHL" || /chile/i.test(p.label)
          );
          if (chile) setFilters((f) => ({ ...f, pais: String(chile.value) }));

          setOpPrevisiones(data.catalogos?.previsiones_salud || data.previsiones || []);
          setOpMedicos(data.medicos || []);
          setOpEstadosCiviles([
            { value: "soltero", label: "Soltero/a" },
            { value: "casado", label: "Casado/a" },
            { value: "divorciado", label: "Divorciado/a" },
            { value: "viudo", label: "Viudo/a" },
            { value: "union_libre", label: "Unión libre" },
            { value: "conviviente", label: "Conviviente" },
            { value: "separado", label: "Separado/a" },
          ]);
          setOpTiposSangre([
            { value: "O+", label: "O+" },
            { value: "O-", label: "O-" },
            { value: "A+", label: "A+" },
            { value: "A-", label: "A-" },
            { value: "B+", label: "B+" },
            { value: "B-", label: "B-" },
            { value: "AB+", label: "AB+" },
            { value: "AB-", label: "AB-" },
          ]);
        }
      } catch (e) {
        console.error("Error cargando opciones:", e);
        addNotification("error", "Error al cargar opciones");
      }
    })();
  }, []);

  /* ==================== CASCADA: PAÍS -> REGIONES ==================== */
  const selectedPais = useMemo(
    () => opPaises.find((p) => String(p.value) === String(filters.pais)),
    [opPaises, filters.pais]
  );

  const isChileSelected =
    !!selectedPais &&
    (selectedPais.codigo_iso2 === "CL" || selectedPais.codigo_iso3 === "CHL" || /chile/i.test(selectedPais.label));

  useEffect(() => {
    (async () => {
      setOpRegiones([]);
      setOpComunas([]);
      setFilters((f) => ({ ...f, region: "", comuna: "" }));
      if (!filters.pais) return;

      setLoadingRegiones(true);
      try {
        const res = await fetch(`/api/admin/pacientes/opciones?pais=${encodeURIComponent(filters.pais)}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setOpRegiones(data.geo?.regiones || []);
        }
      } catch (e) {
        console.error("Error cargando regiones:", e);
      } finally {
        setLoadingRegiones(false);
      }
    })();
  }, [filters.pais]);

  /* ==================== CASCADA: REGIÓN -> COMUNAS ==================== */
  useEffect(() => {
    (async () => {
      setOpComunas([]);
      setFilters((f) => ({ ...f, comuna: "" }));
      if (!filters.region) return;

      setLoadingComunas(true);
      try {
        const res = await fetch(`/api/admin/pacientes/opciones?region=${encodeURIComponent(filters.region)}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setOpComunas(data.geo?.comunas || []);
        }
      } catch (e) {
        console.error("Error cargando comunas:", e);
      } finally {
        setLoadingComunas(false);
      }
    })();
  }, [filters.region]);

  /* ==================== PACIENTES (LISTADO) ==================== */
  const fetchPacientes = useCallback(
    async (page = pagina) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          pagina: String(page),
          pageSize: String(pageSize),
          sort: sortField,
          order: sortOrder,
        });

        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });

        const res = await fetch(`/api/admin/pacientes?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setPacientes(data.pacientes || []);
          setTotal(data.total || 0);
          setPagina(data.pagina || page);
          if (data.stats) {
            setStats({
              total_pacientes: safeInt(data.stats.total_pacientes),
              pacientes_activos: safeInt(data.stats.pacientes_activos),
              pacientes_nuevos_mes: safeInt(data.stats.pacientes_nuevos_mes),
              promedio_edad: safeInt(data.stats.promedio_edad),
              total_citas: safeInt(data.stats.total_citas),
              pacientes_con_medico: safeInt(data.stats.pacientes_con_medico),
              pacientes_con_prevision: safeInt(data.stats.pacientes_con_prevision),
              tasa_ocupacion: safeFloat(data.stats.tasa_ocupacion),
              crecimiento_mes: safeInt(data.stats.crecimiento_mes),
            });
          }
        }
      } catch (e) {
        console.error(e);
        addNotification("error", "Error al cargar pacientes");
      } finally {
        setLoading(false);
      }
    },
    [pagina, pageSize, filters, sortField, sortOrder]
  );

  useEffect(() => {
    fetchPacientes(1);
  }, [pageSize, filters, sortField, sortOrder, fetchPacientes]);

  const resetFiltros = () => {
    setFilters({
      search: "",
      activo: "",
      genero: "",
      prevision: "",
      pais: "",
      edad_min: "",
      edad_max: "",
      region: "",
      comuna: "",
      con_medico: "",
      desde: "",
      hasta: "",
      estado_civil: "",
      tipo_sangre: "",
    });
    setOpRegiones([]);
    setOpComunas([]);
    fetchPacientes(1);
  };

  // CRUD
  const onCreate = () => {
    setEditPaciente(null);
    setShowModalCE(true);
  };

  const onEdit = (p: Paciente) => {
    setEditPaciente(p);
    setShowModalCE(true);
  };

  const onVerDetalle = (p: Paciente) => {
    setPacienteDetalle(p);
    setShowModalDetalle(true);
  };

  const onVerHistorial = (p: Paciente) => {
    setPacienteHistorial(p);
    setShowModalHistorial(true);
  };

  const onDelete = async (p: Paciente) => {
    if (!confirm(`¿Eliminar permanentemente a ${p.nombre} ${p.apellido_paterno}?`)) return;
    try {
      const res = await fetch(`/api/admin/pacientes/${p.id_paciente}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        addNotification("success", "Paciente eliminado correctamente");
        fetchPacientes();
      } else {
        addNotification("error", data?.error || "No se pudo eliminar");
      }
    } catch (e) {
      addNotification("error", "Error al eliminar paciente");
    }
  };

  const onToggleActivo = async (p: Paciente) => {
    const nuevoEstado = p.activo === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? "activar" : "desactivar";
    if (!confirm(`¿${accion} a ${p.nombre} ${p.apellido_paterno}?`)) return;

    try {
      const res = await fetch(`/api/admin/pacientes/${p.id_paciente}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoEstado, estado: nuevoEstado === 1 ? "activo" : "inactivo" }),
      });
      const data = await res.json();
      if (data?.success) {
        addNotification("success", `Paciente ${accion}do correctamente`);
        fetchPacientes();
      } else {
        addNotification("error", data?.error || "No se pudo actualizar");
      }
    } catch (e) {
      addNotification("error", "Error al actualizar paciente");
    }
  };

  const toggleSelectPaciente = (id: number) => {
    setSelectedPacientes((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAllVisible = () => {
    setSelectedPacientes((curr) => {
      if (curr.size === pacientes.length) return new Set();
      return new Set(pacientes.map((p) => p.id_paciente));
    });
  };

  const exportarCSV = async () => {
    try {
      const ids = selectedPacientes.size > 0 ? Array.from(selectedPacientes) : undefined;
      const params = new URLSearchParams({ format: "csv" });
      if (ids) params.append("ids", ids.join(","));

      const res = await fetch(`/api/admin/pacientes/export?${params.toString()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pacientes_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      addNotification("success", "Exportación completada");
    } catch (e) {
      addNotification("error", "Error al exportar CSV");
    }
  };

  const exportarPDF = async () => {
    try {
      const ids = selectedPacientes.size > 0 ? Array.from(selectedPacientes) : undefined;
      const params = new URLSearchParams({ format: "pdf" });
      if (ids) params.append("ids", ids.join(","));

      const res = await fetch(`/api/admin/pacientes/export?${params.toString()}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pacientes_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      addNotification("success", "Exportación completada");
    } catch (e) {
      addNotification("error", "Error al exportar PDF");
    }
  };

  const imprimirLista = () => window.print();

  /* ==================== RENDER ==================== */
  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-6 space-y-6">
        {/* NOTIFICACIONES */}
        <div className="fixed top-6 right-6 space-y-2 z-[100]">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right duration-300 ${
                notif.type === "success"
                  ? "bg-green-500 text-white"
                  : notif.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {notif.type === "success" && <CheckCircle className="w-5 h-5" />}
              {notif.type === "error" && <AlertCircle className="w-5 h-5" />}
              {notif.type === "info" && <Clock className="w-5 h-5" />}
              <span className="font-medium">{notif.message}</span>
            </div>
          ))}
        </div>

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              title="Regresar"
              aria-label="Regresar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Regresar</span>
            </button>

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                Gestión de Pacientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Sistema avanzado de administración de pacientes</p>
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
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <Plus className="w-5 h-5" /> Nuevo paciente
            </button>
          </div>
        </header>

        {/* DASHBOARD MEJORADO */}
        {showDashboard && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <StatCard
              icon={Users}
              label="Total pacientes"
              value={safeInt(stats.total_pacientes)}
              color="blue"
              subtitle={`${safeInt(stats.pacientes_activos)} activos`}
              trend={stats.crecimiento_mes ? `${stats.crecimiento_mes > 0 ? "+" : ""}${stats.crecimiento_mes}%` : undefined}
            />
            <StatCard
              icon={UserPlus}
              label="Nuevos este mes"
              value={safeInt(stats.pacientes_nuevos_mes)}
              color="green"
              trend="+15%"
            />
            <StatCard
              icon={Activity}
              label="Edad promedio"
              value={`${safeInt(stats.promedio_edad)} años`}
              color="purple"
            />
            <StatCard
              icon={Calendar}
              label="Total de citas"
              value={safeInt(stats.total_citas)}
              color="orange"
              subtitle={`${safeFloat(stats.tasa_ocupacion)}% ocupación`}
            />
          </section>
        )}

        {/* FILTROS MEJORADOS */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
            <div className="grid md:grid-cols-7 gap-3">
              {/* BUSCAR */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Buscar</label>
                <div className="relative">
                  <input
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Nombre, RUT, email, teléfono..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* ESTADO */}
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  value={filters.activo}
                  onChange={(e) => setFilters((f) => ({ ...f, activo: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="1">Activos</option>
                  <option value="0">Inactivos</option>
                </select>
              </div>

              {/* GÉNERO */}
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Género</label>
                <select
                  value={filters.genero}
                  onChange={(e) => setFilters((f) => ({ ...f, genero: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>

              {/* PREVISIÓN */}
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Previsión</label>
                <select
                  value={filters.prevision}
                  onChange={(e) => setFilters((f) => ({ ...f, prevision: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todas</option>
                  {opPrevisiones.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* PAÍS */}
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">País</label>
                <select
                  value={filters.pais}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, pais: e.target.value, region: "", comuna: "" }));
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Todos</option>
                  {opPaises.map((o) => (
                    <option key={o.value} value={String(o.value)}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* BOTÓN FILTROS AVANZADOS */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex-1 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {showAdvancedFilters ? "Menos" : "Más"}
                </button>
              </div>
            </div>

            {/* FILTROS AVANZADOS */}
            {showAdvancedFilters && (
              <div className="grid md:grid-cols-6 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 p-4">
                {/* EDAD MÍNIMA */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Edad mínima</label>
                  <input
                    type="number"
                    value={filters.edad_min}
                    onChange={(e) => setFilters((f) => ({ ...f, edad_min: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>

                {/* EDAD MÁXIMA */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Edad máxima</label>
                  <input
                    type="number"
                    value={filters.edad_max}
                    onChange={(e) => setFilters((f) => ({ ...f, edad_max: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="120"
                  />
                </div>

                {/* REGIÓN */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                    {isChileSelected ? "Región" : "Provincia / Estado"}
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value, comuna: "" }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={!filters.pais || loadingRegiones}
                  >
                    <option value="">{!filters.pais ? "— Seleccione país —" : "Todas"}</option>
                    {opRegiones.map((o) => (
                      <option key={o.value} value={String(o.value)}>{o.label}</option>
                    ))}
                  </select>
                  {loadingRegiones && <p className="text-xs mt-1 text-gray-500">Cargando regiones…</p>}
                </div>

                {/* COMUNA */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                    {isChileSelected ? "Comuna" : "Ciudad / Localidad"}
                  </label>
                  {isChileSelected ? (
                    <select
                      value={filters.comuna}
                      onChange={(e) => setFilters((f) => ({ ...f, comuna: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={!filters.region || loadingComunas}
                    >
                      <option value="">{!filters.region ? "— Seleccione región —" : "Todas"}</option>
                      {opComunas.map((o) => (
                        <option key={o.value} value={String(o.value)}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={filters.comuna}
                      onChange={(e) => setFilters((f) => ({ ...f, comuna: e.target.value }))}
                      placeholder="Ciudad / Localidad"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  )}
                  {loadingComunas && isChileSelected && <p className="text-xs mt-1 text-gray-500">Cargando comunas…</p>}
                </div>

                {/* ESTADO CIVIL */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Estado civil</label>
                  <select
                    value={filters.estado_civil}
                    onChange={(e) => setFilters((f) => ({ ...f, estado_civil: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todos</option>
                    {opEstadosCiviles.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* TIPO SANGRE */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Tipo sangre</label>
                  <select
                    value={filters.tipo_sangre}
                    onChange={(e) => setFilters((f) => ({ ...f, tipo_sangre: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todos</option>
                    {opTiposSangre.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* DESDE */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Desde</label>
                  <input
                    type="date"
                    value={filters.desde}
                    onChange={(e) => setFilters((f) => ({ ...f, desde: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* HASTA */}
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Hasta</label>
                  <input
                    type="date"
                    value={filters.hasta}
                    onChange={(e) => setFilters((f) => ({ ...f, hasta: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            {/* BOTONES APLICAR Y LIMPIAR */}
            <div className="flex items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => fetchPacientes(1)}
                className="flex-1 rounded-xl px-4 py-2.5 bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700 transition-all font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Aplicar filtros
              </button>
              <button
                onClick={resetFiltros}
                className="flex-1 rounded-xl px-4 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300"
              >
                Limpiar
              </button>
            </div>
          </div>
        </section>

        {/* TOOLBAR MEJORADO */}
        <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mt-4">
          {/* LADO IZQUIERDO - VISTAS Y SELECCIONADOS */}
          <div className="flex items-center gap-3">
            {/* SELECTOR DE VISTA */}
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
            </div>

            {/* CONTADOR SELECCIONADOS */}
            {selectedPacientes.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">{selectedPacientes.size} seleccionados</span>
              </div>
            )}
          </div>

          {/* LADO DERECHO - ACCIONES */}
          <div className="flex items-center gap-2">
            {/* BOTONES ACCIONES MASIVAS */}
            {selectedPacientes.size > 0 && (
              <>
                {/* ACTIVAR */}
                <button
                  onClick={() => {
                    const ids = Array.from(selectedPacientes);
                    ids.forEach((id) => {
                      const p = pacientes.find((pac) => pac.id_paciente === id);
                      if (p) onToggleActivo(p);
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all flex items-center gap-2 font-medium text-sm"
                  title="Activar seleccionados"
                >
                  <Unlock className="w-4 h-4" />
                </button>

                {/* DESACTIVAR */}
                <button
                  onClick={() => {
                    const ids = Array.from(selectedPacientes);
                    ids.forEach((id) => {
                      const p = pacientes.find((pac) => pac.id_paciente === id);
                      if (p) onToggleActivo(p);
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all flex items-center gap-2 font-medium text-sm"
                  title="Desactivar seleccionados"
                >
                  <Lock className="w-4 h-4" />
                </button>

                {/* ELIMINAR */}
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar los pacientes seleccionados?")) {
                      const ids = Array.from(selectedPacientes);
                      ids.forEach((id) => {
                        const p = pacientes.find((pac) => pac.id_paciente === id);
                        if (p) onDelete(p);
                      });
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex items-center gap-2 font-medium text-sm"
                  title="Eliminar seleccionados"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {/* EXPORTAR CSV */}
            <button
              onClick={exportarCSV}
              className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" /> CSV
            </button>

            {/* EXPORTAR PDF */}
            <button
              onClick={exportarPDF}
              className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all flex items-center gap-2 font-medium"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>

            {/* IMPRIMIR */}
            <button
              onClick={imprimirLista}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* REFRESCAR */}
            <button
              onClick={() => fetchPacientes(pagina)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* CONTENIDO - VISTA TABLA */}
        {viewMode === "table" && (
          <TableView
            pacientes={pacientes}
            loading={loading}
            selectedPacientes={selectedPacientes}
            toggleSelectPaciente={toggleSelectPaciente}
            selectAllVisible={selectAllVisible}
            onEdit={onEdit}
            onDelete={onDelete}
            onVerDetalle={onVerDetalle}
            onVerHistorial={onVerHistorial}
            onToggleActivo={onToggleActivo}
          />
        )}

        {/* CONTENIDO - VISTA TARJETAS */}
        {viewMode === "cards" && (
          <CardsView
            pacientes={pacientes}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onVerDetalle={onVerDetalle}
            onVerHistorial={onVerHistorial}
            onToggleActivo={onToggleActivo}
          />
        )}

        {/* PAGINACIÓN */}
        {!loading && pacientes.length > 0 && (
          <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mt-4">
            {/* INFO REGISTROS */}
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Mostrando {(pagina - 1) * pageSize + 1} - {Math.min(pagina * pageSize, total)} de {total} pacientes
            </div>

            {/* CONTROLES PAGINACIÓN */}
            <div className="flex items-center gap-3">
              {/* BOTÓN ANTERIOR */}
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina <= 1}
                onClick={() => {
                  setPagina(pagina - 1);
                  fetchPacientes(pagina - 1);
                }}
              >
                Anterior
              </button>

              {/* INDICADOR PÁGINA */}
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
                Página {pagina} de {Math.ceil(total / pageSize)}
              </div>

              {/* BOTÓN SIGUIENTE */}
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-300"
                disabled={pagina * pageSize >= total}
                onClick={() => {
                  setPagina(pagina + 1);
                  fetchPacientes(pagina + 1);
                }}
              >
                Siguiente
              </button>

              {/* SELECTOR REGISTROS POR PÁGINA */}
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

        {/* MODALES */}
        {showModalCE && (
          <ModalCrearEditarPaciente
            onClose={() => setShowModalCE(false)}
            onSaved={() => {
              setShowModalCE(false);
              fetchPacientes();
              addNotification("success", "Paciente guardado correctamente");
            }}
            editPaciente={editPaciente}
            opciones={{
              opPaises,
              opPrevisiones,
              opMedicos,
              opEstadosCiviles,
              opTiposSangre,
            }}
            theme={theme}
          />
        )}
        {showModalDetalle && pacienteDetalle && (
          <ModalDetallePaciente paciente={pacienteDetalle} onClose={() => setShowModalDetalle(false)} theme={theme} />
        )}
        {showModalHistorial && pacienteHistorial && (
          <ModalHistorialPaciente paciente={pacienteHistorial} onClose={() => setShowModalHistorial(false)} theme={theme} />
        )}
      </div>
    </div>
  );
}

/* ==================== COMPONENTES AUXILIARES ==================== */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "orange";
  trend?: string;
  subtitle?: string;
}) {
  const colorClasses =
    { blue: "from-blue-500 to-blue-600", green: "from-green-500 to-green-600", purple: "from-purple-500 to-purple-600", orange: "from-orange-500 to-orange-600" }[color] ||
    "from-blue-500 to-blue-600";

  const trendColor = trend?.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

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
        <div className={`mt-3 flex items-center gap-1 ${trendColor} text-sm font-semibold`}>
          <TrendingUp className="w-4 h-4" /> {trend}
        </div>
      )}
    </div>
  );
}

function TableView({
  pacientes,
  loading,
  selectedPacientes,
  toggleSelectPaciente,
  selectAllVisible,
  onEdit,
  onDelete,
  onVerDetalle,
  onVerHistorial,
  onToggleActivo,
}: any) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-750 border-b border-gray-200 dark:border-gray-600">
            <tr className="text-left">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selectedPacientes.size === pacientes.length && pacientes.length > 0}
                  onChange={selectAllVisible}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Paciente</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Documento</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Contacto</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Edad</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Previsión</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Estado</th>
              <th className="px-4 py-4 font-bold text-gray-700 dark:text-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
                </td>
              </tr>
            ) : pacientes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron pacientes</p>
                </td>
              </tr>
            ) : (
              pacientes.map((p: Paciente) => {
                const activo = p.activo === 1 || p.estado === "activo";
                const doc =
                  p.documento_tipo && p.documento_tipo !== "rut"
                    ? `${p.documento_tipo?.toUpperCase()}: ${p.pasaporte || p.rut || "—"}`
                    : `RUT: ${p.rut}`;
                return (
                  <tr key={p.id_paciente} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPacientes.has(p.id_paciente)}
                        onChange={() => toggleSelectPaciente(p.id_paciente)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {p.nombre?.charAt(0)}
                          {p.apellido_paterno?.charAt(0)}
                                                  </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {p.nombre} {p.apellido_paterno} {p.apellido_materno ?? ""}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {p.id_paciente}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-gray-900 dark:text-white">{doc}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {p.email && (
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Mail className="w-3 h-3 text-blue-500" />
                            <span className="text-xs truncate">{p.email}</span>
                          </div>
                        )}
                        {p.telefono && (
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Phone className="w-3 h-3 text-green-500" />
                            <span className="text-xs">{p.telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-900 dark:text-white font-medium">{p.edad ?? "—"}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">años</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {p.prevision_salud || "Sin previsión"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          activo
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onVerDetalle(p)}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onVerHistorial(p)}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                          title="Historial"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleActivo(p)}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
                          title={activo ? "Desactivar" : "Activar"}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

function CardsView({ pacientes, loading, onEdit, onDelete, onVerDetalle, onVerHistorial, onToggleActivo }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (pacientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mt-4">
        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron pacientes</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {pacientes.map((p: Paciente) => {
        const activo = p.activo === 1 || p.estado === "activo";
        return (
          <div key={p.id_paciente} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {p.nombre?.charAt(0)}
                  {p.apellido_paterno?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    {p.nombre} {p.apellido_paterno}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.rut}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activo
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              {p.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{p.email}</span>
                </div>
              )}
              {p.telefono && (
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{p.telefono}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{p.edad ?? "—"}</span> años
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {p.prevision_salud || "Sin previsión"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onVerDetalle(p)}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Eye className="w-4 h-4" /> Ver
              </button>
              <button
                onClick={() => onEdit(p)}
                className="flex-1 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => onToggleActivo(p)}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center"
                title={activo ? "Desactivar" : "Activar"}
              >
                {activo ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==================== MODALES & UTILS ==================== */
type ModalSize = "default" | "large" | "xl";

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
  theme?: Theme;
  size?: ModalSize;
}) {
  const sizeClasses = ({ default: "max-w-3xl", large: "max-w-5xl", xl: "max-w-7xl" } as Record<ModalSize, string>)[size];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" aria-label="Cerrar modal">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ModalCrearEditarPaciente({ editPaciente, opciones, onClose, onSaved, theme }: any) {
  const [form, setForm] = useState<any>(() => {
    if (!editPaciente)
      return {
        documento_tipo: "rut" as DocumentoTipo,
        rut: "",
        pasaporte: "",
        nombre: "",
        segundo_nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        nombre_preferido: "",
        pronombres: "",
        fecha_nacimiento: "",
        genero: "masculino",
        nacionalidad: "Chilena",
        estado_civil: "",
        email: "",
        telefono: "",
        telefono_secundario: "",
        preferencia_contacto: "telefono",
        direccion: "",
        ciudad: "",
        comuna: "",
        region: "",
        pais: "",
        codigo_postal: "",
        tipo_sangre: "",
        prevision_salud: "",
        ocupacion: "",
        alergias: "",
        condiciones_medicas: "",
        contacto_emergencia: "",
        telefono_emergencia: "",
        activo: true,
      };
    return {
      documento_tipo: editPaciente.documento_tipo || "rut",
      rut: editPaciente.rut || "",
      pasaporte: editPaciente.pasaporte || "",
      nombre: editPaciente.nombre,
      segundo_nombre: editPaciente.segundo_nombre || "",
      apellido_paterno: editPaciente.apellido_paterno,
      apellido_materno: editPaciente.apellido_materno || "",
      nombre_preferido: editPaciente.nombre_preferido || "",
      pronombres: editPaciente.pronombres || "",
      fecha_nacimiento: editPaciente.fecha_nacimiento?.slice(0, 10),
      genero: editPaciente.genero,
      nacionalidad: editPaciente.nacionalidad || "Chilena",
      estado_civil: editPaciente.estado_civil || "",
      email: editPaciente.email || "",
      telefono: editPaciente.telefono || "",
      telefono_secundario: editPaciente.telefono_secundario || "",
      preferencia_contacto: editPaciente.preferencia_contacto || "telefono",
      direccion: editPaciente.direccion || "",
      ciudad: editPaciente.ciudad || "",
      comuna: editPaciente.comuna || "",
      region: editPaciente.region || "",
      pais: editPaciente.pais || "",
      codigo_postal: editPaciente.codigo_postal || "",
      tipo_sangre: editPaciente.tipo_sangre || "",
      prevision_salud: editPaciente.prevision_salud || "",
      ocupacion: editPaciente.ocupacion || "",
      alergias: editPaciente.alergias || "",
      condiciones_medicas: editPaciente.condiciones_medicas || "",
      contacto_emergencia: editPaciente.contacto_emergencia || "",
      telefono_emergencia: editPaciente.telefono_emergencia || "",
      activo: editPaciente.activo === 1 || editPaciente.estado === "activo",
    };
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "contacto" | "medico" | "emergencia">("personal");
  const [opRegionesForm, setOpRegionesForm] = useState<Opcion[]>([]);
  const [opComunasForm, setOpComunasForm] = useState<Opcion[]>([]);
  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);

  useEffect(() => {
    if (!form.pais && (opciones.opPaises || []).length) {
      const chile = opciones.opPaises.find(
        (p: any) => p.codigo_iso2 === "CL" || p.codigo_iso3 === "CHL" || /chile/i.test(p.label)
      );
      if (chile) setForm((f: any) => ({ ...f, pais: String(chile.value) }));
    }
  }, [opciones.opPaises?.length]);

  const selectedPais = useMemo(
    () => (opciones.opPaises || []).find((p: any) => String(p.value) === String(form.pais)),
    [opciones.opPaises, form.pais]
  );

  const isChile = !!selectedPais && (selectedPais.codigo_iso2 === "CL" || selectedPais.codigo_iso3 === "CHL" || /chile/i.test(selectedPais.label));

  useEffect(() => {
    (async () => {
      setOpRegionesForm([]);
      setOpComunasForm([]);
      if (!form.pais) return;
      setLoadingRegiones(true);
      try {
        const res = await fetch(`/api/admin/pacientes/opciones?pais=${encodeURIComponent(form.pais)}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) setOpRegionesForm(data.geo?.regiones || []);
      } catch (e) {
        console.error("Modal: error cargando regiones:", e);
      } finally {
        setLoadingRegiones(false);
      }
    })();
  }, [form.pais]);

  useEffect(() => {
    (async () => {
      setOpComunasForm([]);
      if (!form.region) return;
      setLoadingComunas(true);
      try {
        const res = await fetch(`/api/admin/pacientes/opciones?region=${encodeURIComponent(form.region)}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) setOpComunasForm(data.geo?.comunas || []);
      } catch (e) {
        console.error("Modal: error cargando comunas:", e);
      } finally {
        setLoadingComunas(false);
      }
    })();
  }, [form.region]);

  const handlePaisChange = (pais: string) => {
    setForm((f: any) => ({ ...f, pais, region: "", comuna: "" }));
  };

  const handleRegionChange = (region: string) => {
    setForm((f: any) => ({ ...f, region, comuna: "" }));
  };

  const submit = async () => {
    if (!form.nombre || !form.apellido_paterno) {
      alert("Por favor completa nombre y apellido");
      return;
    }

    if (form.documento_tipo === "rut" && !form.rut) {
      alert("Por favor ingresa el RUT");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        activo: form.activo ? 1 : 0,
        estado: form.activo ? "activo" : "inactivo",
        rut: form.documento_tipo === "rut" ? form.rut : form.rut || "",
        pasaporte: form.documento_tipo !== "rut" ? form.pasaporte : form.pasaporte || "",
      };

      const res = await fetch(editPaciente ? `/api/admin/pacientes/${editPaciente.id_paciente}` : "/api/admin/pacientes", {
        method: editPaciente ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data?.success) return alert(data?.error || "Error al guardar");
      onSaved();
    } catch (e) {
      alert("Error al guardar paciente");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all";

  const tabs = [
    { id: "personal", label: "Información Personal", icon: User },
    { id: "contacto", label: "Contacto", icon: Phone },
    { id: "medico", label: "Información Médica", icon: HeartPulse },
    { id: "emergencia", label: "Emergencia", icon: AlertCircle },
  ];

  return (
    <ModalBase title={editPaciente ? "Editar paciente" : "Nuevo paciente"} onClose={onClose} theme={theme} size="large">
      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO TABS */}
      <div className="space-y-4">
        {/* TAB: PERSONAL */}
        {activeTab === "personal" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Tipo de documento" required>
              <select
                value={form.documento_tipo}
                onChange={(e) => setForm((f: any) => ({ ...f, documento_tipo: e.target.value }))}
                className={inputClass}
              >
                {["rut", "dni", "passport", "cedula", "nif", "nie", "curp", "ssn", "otros"].map((t) => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </Field>

            {form.documento_tipo === "rut" ? (
              <Field label="RUT" required hint="Formato: 12.345.678-9">
                <input
                  value={form.rut}
                  onChange={(e) => setForm((f: any) => ({ ...f, rut: e.target.value }))}
                  className={inputClass}
                  placeholder="12.345.678-9"
                />
              </Field>
            ) : (
              <Field label="N° documento" required>
                <input
                  value={form.pasaporte}
                  onChange={(e) => setForm((f: any) => ({ ...f, pasaporte: e.target.value }))}
                  className={inputClass}
                  placeholder="AB1234567"
                />
              </Field>
            )}

            <Field label="País" required>
              <select value={form.pais} onChange={(e) => handlePaisChange(e.target.value)} className={inputClass}>
                <option value="">Seleccione…</option>
                {opciones.opPaises.map((o: any) => (
                  <option key={o.value} value={String(o.value)}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Nombre" required>
              <input value={form.nombre} onChange={(e) => setForm((f: any) => ({ ...f, nombre: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Segundo nombre">
              <input value={form.segundo_nombre} onChange={(e) => setForm((f: any) => ({ ...f, segundo_nombre: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Apellido paterno" required>
              <input value={form.apellido_paterno} onChange={(e) => setForm((f: any) => ({ ...f, apellido_paterno: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Apellido materno">
              <input value={form.apellido_materno} onChange={(e) => setForm((f: any) => ({ ...f, apellido_materno: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Nombre preferido">
              <input value={form.nombre_preferido} onChange={(e) => setForm((f: any) => ({ ...f, nombre_preferido: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Pronombres" hint="ej: él/ella/elle">
              <input value={form.pronombres} onChange={(e) => setForm((f: any) => ({ ...f, pronombres: e.target.value }))} className={inputClass} />
            </Field>

            <Field label="Fecha de nacimiento" required>
              <input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm((f: any) => ({ ...f, fecha_nacimiento: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Género" required>
              <select value={form.genero} onChange={(e) => setForm((f: any) => ({ ...f, genero: e.target.value }))} className={inputClass}>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </Field>
            <Field label="Estado civil">
              <select value={form.estado_civil} onChange={(e) => setForm((f: any) => ({ ...f, estado_civil: e.target.value }))} className={inputClass}>
                <option value="">Seleccione...</option>
                {opciones.opEstadosCiviles?.map((o: any) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Nacionalidad">
              <input value={form.nacionalidad} onChange={(e) => setForm((f: any) => ({ ...f, nacionalidad: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Ocupación">
              <input value={form.ocupacion} onChange={(e) => setForm((f: any) => ({ ...f, ocupacion: e.target.value }))} className={inputClass} />
            </Field>

            {/* DIRECCIÓN */}
            <div className="md:col-span-3">
              <Field label="Dirección">
                <input value={form.direccion} onChange={(e) => setForm((f: any) => ({ ...f, direccion: e.target.value }))} className={inputClass} placeholder="Calle, número, depto..." />
              </Field>
            </div>

            <Field label={isChile ? "Región" : "Provincia / Estado"}>
              {isChile ? (
                <select value={form.region} onChange={(e) => handleRegionChange(e.target.value)} className={inputClass} disabled={!form.pais || loadingRegiones}>
                  <option value="">{!form.pais ? "— Seleccione país —" : "Seleccione..."}</option>
                  {opRegionesForm.map((o: any) => (
                    <option key={o.value} value={String(o.value)}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className={inputClass}
                  placeholder="Provincia / Estado"
                />
              )}
              {loadingRegiones && <p className="text-xs mt-1 text-gray-500">Cargando regiones…</p>}
            </Field>

            <Field label={isChile ? "Comuna" : "Ciudad / Localidad"}>
              {isChile ? (
                <select value={form.comuna} onChange={(e) => setForm((f: any) => ({ ...f, comuna: e.target.value }))} className={inputClass} disabled={!form.region || loadingComunas}>
                  <option value="">{!form.region ? "— Seleccione región —" : "Seleccione..."}</option>
                  {opComunasForm.map((o: any) => (
                    <option key={o.value} value={String(o.value)}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input value={form.ciudad} onChange={(e) => setForm((f: any) => ({ ...f, ciudad: e.target.value }))} className={inputClass} placeholder="Ciudad / Localidad" />
              )}
              {loadingComunas && isChile && <p className="text-xs mt-1 text-gray-500">Cargando comunas…</p>}
            </Field>

            <Field label="Código postal">
              <input value={form.codigo_postal} onChange={(e) => setForm((f: any) => ({ ...f, codigo_postal: e.target.value }))} className={inputClass} />
            </Field>
          </div>
        )}

        {/* TAB: CONTACTO */}
        {activeTab === "contacto" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Teléfono">
              <input value={form.telefono} onChange={(e) => setForm((f: any) => ({ ...f, telefono: e.target.value }))} className={inputClass} placeholder="+56 9 1234 5678" />
            </Field>
            <Field label="Teléfono secundario">
              <input value={form.telefono_secundario} onChange={(e) => setForm((f: any) => ({ ...f, telefono_secundario: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Preferencia de contacto">
              <select
                value={form.preferencia_contacto}
                onChange={(e) => setForm((f: any) => ({ ...f, preferencia_contacto: e.target.value }))}
                className={inputClass}
              >
                <option value="telefono">Teléfono</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="ninguno">Ninguno</option>
              </select>
            </Field>
          </div>
        )}

        {/* TAB: MÉDICO */}
        {activeTab === "medico" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Tipo de sangre">
              <select value={form.tipo_sangre} onChange={(e) => setForm((f: any) => ({ ...f, tipo_sangre: e.target.value }))} className={inputClass}>
                <option value="">Seleccione...</option>
                {opciones.opTiposSangre?.map((o: any) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Previsión de salud">
              <select value={form.prevision_salud} onChange={(e) => setForm((f: any) => ({ ...f, prevision_salud: e.target.value }))} className={inputClass}>
                <option value="">Seleccione...</option>
                {(opciones.opPrevisiones || []).map((o: any) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Alergias" hint="Separa con comas">
                <textarea
                  value={form.alergias}
                  onChange={(e) => setForm((f: any) => ({ ...f, alergias: e.target.value }))}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Penicilina, Mariscos, etc..."
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Condiciones médicas" hint="Enfermedades crónicas, alergias, etc.">
                <textarea
                  value={form.condiciones_medicas}
                  onChange={(e) => setForm((f: any) => ({ ...f, condiciones_medicas: e.target.value }))}
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Diabetes, Hipertensión, etc..."
                />
              </Field>
            </div>
          </div>
        )}

        {/* TAB: EMERGENCIA */}
        {activeTab === "emergencia" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Contacto de emergencia">
              <input value={form.contacto_emergencia} onChange={(e) => setForm((f: any) => ({ ...f, contacto_emergencia: e.target.value }))} className={inputClass} placeholder="Nombre completo" />
            </Field>
            <Field label="Teléfono de emergencia">
              <input value={form.telefono_emergencia} onChange={(e) => setForm((f: any) => ({ ...f, telefono_emergencia: e.target.value }))} className={inputClass} placeholder="+56 9 1234 5678" />
            </Field>
          </div>
        )}

        {/* ESTADO */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Field label="Estado del paciente">
            <select
              value={form.activo ? "1" : "0"}
              onChange={(e) => setForm((f: any) => ({ ...f, activo: e.target.value === "1" }))}
              className={inputClass}
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </Field>
        </div>
      </div>

      {/* BOTONES */}
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-300">
          Cancelar
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Guardando..." : "Guardar paciente"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalDetallePaciente({ paciente, onClose, theme }: any) {
  const [activeTab, setActiveTab] = useState<"general" | "medico" | "contacto">("general");

  return (
    <ModalBase title="Detalle del paciente" onClose={onClose} theme={theme} size="large">
      <div className="space-y-4">
        {/* HEADER */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            {paciente.nombre?.charAt(0)}
            {paciente.apellido_paterno?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {paciente.documento_tipo && paciente.documento_tipo !== "rut"
                ? `${paciente.documento_tipo?.toUpperCase()}: ${paciente.pasaporte || "—"}`
                : `RUT: ${paciente.rut}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Registrado: {new Date(paciente.fecha_registro).toLocaleDateString("es-CL")}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "general", label: "General" },
            { id: "medico", label: "Médico" },
            { id: "contacto", label: "Contacto" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        {activeTab === "general" && (
          <div className="grid md:grid-cols-2 gap-4">
            <InfoBox title="Información Personal" icon={User}>
              <InfoItem label="Edad" value={`${paciente.edad ?? "—"} años`} />
              <InfoItem label="Género" value={paciente.genero} />
              <InfoItem label="Estado civil" value={paciente.estado_civil || "—"} />
              <InfoItem label="Nacionalidad" value={paciente.nacionalidad} />
              <InfoItem label="Ocupación" value={paciente.ocupacion || "—"} />
            </InfoBox>

            <InfoBox title="Ubicación" icon={MapPin}>
              <InfoItem label="Dirección" value={paciente.direccion || "—"} />
              <InfoItem label="Ciudad" value={paciente.ciudad || "—"} />
              <InfoItem label={paciente.pais === "CHL" ? "Comuna" : "Localidad"} value={paciente.comuna || "—"} />
              <InfoItem label={paciente.pais === "CHL" ? "Región" : "Provincia/Estado"} value={paciente.region || "—"} />
              <InfoItem label="País" value={paciente.pais || "—"} />
            </InfoBox>
          </div>
        )}

        {activeTab === "medico" && (
          <div className="grid md:grid-cols-2 gap-4">
            <InfoBox title="Información Médica" icon={HeartPulse}>
              <InfoItem label="Tipo de sangre" value={paciente.tipo_sangre || "—"} />
              <InfoItem label="Previsión" value={paciente.prevision_salud || "—"} />
              <InfoItem label="Médico tratante" value={paciente.medico_tratante || "Sin asignar"} />
            </InfoBox>

            {paciente.alergias && (
              <InfoBox title="Alergias" icon={AlertCircle}>
                <p className="text-sm text-gray-700 dark:text-gray-300">{paciente.alergias}</p>
              </InfoBox>
            )}

            {paciente.condiciones_medicas && (
              <div className="md:col-span-2">
                <InfoBox title="Condiciones Médicas" icon={HeartPulse}>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{paciente.condiciones_medicas}</p>
                </InfoBox>
              </div>
            )}
          </div>
        )}

        {activeTab === "contacto" && (
          <div className="grid md:grid-cols-2 gap-4">
            <InfoBox title="Contacto Principal" icon={Phone}>
              <InfoItem label="Email" value={paciente.email || "—"} icon={Mail} />
              <InfoItem label="Teléfono" value={paciente.telefono || "—"} icon={Phone} />
              <InfoItem label="Teléfono 2" value={paciente.telefono_secundario || "—"} />
              <InfoItem label="Preferencia" value={paciente.preferencia_contacto || "—"} />
            </InfoBox>

            {paciente.contacto_emergencia && (
              <InfoBox title="Contacto de Emergencia" icon={AlertCircle}>
                <InfoItem label="Nombre" value={paciente.contacto_emergencia} />
                <InfoItem label="Teléfono" value={paciente.telefono_emergencia || "—"} icon={Phone} />
              </InfoBox>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700 transition-all font-semibold shadow-lg">
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}

function ModalHistorialPaciente({ paciente, onClose, theme }: any) {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/pacientes/${paciente.id_paciente}/historial`, { cache: "no-store" });
        const data = await res.json();
        if (data?.success) {
          setHistorial(data.historial || []);
        }
      } catch (e) {
        console.error("Error cargando historial:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [paciente.id_paciente]);

  return (
    <ModalBase title={`Historial de ${paciente.nombre} ${paciente.apellido_paterno}`} onClose={onClose} theme={theme} size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      ) : historial.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay historial disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{item.tipo}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.descripcion}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(item.fecha).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalBase>
  );
}

function InfoBox({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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

                        
