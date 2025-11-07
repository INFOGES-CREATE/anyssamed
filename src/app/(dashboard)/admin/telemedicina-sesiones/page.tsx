"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Video, Plus, Edit, X, Search, CheckSquare, Trash2, Building2, Stethoscope, User,
  Loader2, Download, Filter, Eye, FileText, RefreshCw, List, Grid, Printer,
  ChevronDown, ChevronUp, Link as LinkIcon, Clock, AlertTriangle, Check, Ban, Copy,
  Calendar, Bug, ExternalLink, Play, Pause, Mail, AlertOctagon, Link, Save,
  TrendingUp, TrendingDown, Activity, Zap, Settings, Bell, Users, BarChart3,
  PieChart, LineChart, Award, Shield, Star, MessageSquare, Phone, Maximize2,
  Minimize2, CloudDownload, FileSpreadsheet, FilePlus, Mic, MicOff, Video as VideoIcon,
  VideoOff, Monitor, Smartphone, Tablet, Globe, Wifi, WifiOff, Heart, Battery,
  Signal, Share2, Bookmark, Tag, FolderOpen, Archive, Repeat, ArrowRight,
  MousePointer, Target, Hash, DollarSign, Briefcase, GraduationCap, MapPin,
  Layers, Box, Package, Inbox, Send, Upload, Image as ImageIcon, Film, Music,
  Headphones, Radio, Tv, Camera, Layout, Type, AlignLeft, Lock, Unlock,
  EyeOff, UserPlus, UserMinus, UserCheck, UserX, ChevronLeft, ChevronRight,
  MoreVertical, MoreHorizontal, Maximize, Minimize, ZoomIn, ZoomOut, RotateCw,
  RotateCcw, SortAsc, SortDesc, ArrowUp, ArrowDown, ArrowLeft, ArrowDownRight,
  CornerDownRight, Minus, Sun, Moon, Sunrise, Sunset, CloudRain, Wind
} from "lucide-react";

/* =============== TIPOS AVANZADOS =============== */
type Opcion = { value: number | string; label: string; [k: string]: any };
type ViewMode = "table" | "cards" | "calendar" | "timeline" | "kanban";
type Theme = "light" | "dark";

type EstadoSesion =
  | "programada" | "en_espera" | "en_curso" | "finalizada"
  | "cancelada" | "no_asistio" | "problema_tecnico" | string;

type Sesion = {
  id_sesion: number;
  id_cita: number | null;
  id_paciente: number;
  id_medico: number;
  id_centro: number | null;
  proveedor_servicio: string | null;
  estado: EstadoSesion | null;
  fecha_hora_inicio_programada: string;
  fecha_hora_fin_programada: string;
  fecha_hora_inicio_real?: string | null;
  fecha_hora_fin_real?: string | null;
  duracion_segundos?: number | null;
  token_acceso?: string | null;
  url_sesion?: string | null;
  paciente_nombre: string;
  paciente_rut: string | null;
  medico_nombre: string;
  centro_nombre: string | null;
  calidad_conexion?: string | null;
  dispositivo_paciente?: string | null;
  navegador_paciente?: string | null;
  evaluacion_paciente?: number | null;
  evaluacion_medico?: number | null;
  grabacion_autorizada?: number;
  url_grabacion?: string | null;
};

type Stats = {
  total: number;
  programadas: number;
  en_espera: number;
  en_curso: number;
  finalizadas: number;
  canceladas: number;
  no_asistio: number;
  problema_tecnico: number;
  // Nuevas métricas premium
  tasa_completitud: number;
  duracion_promedio: number;
  satisfaccion_promedio: number;
  sesiones_hoy: number;
  sesiones_semana: number;
  crecimiento_semanal: number;
  tiempo_espera_promedio: number;
  calidad_conexion_promedio: number;
};

type CitaOption = Opcion & {
  id_centro?: number | null;
  id_medico?: number | null;
  id_paciente?: number | null;
  inicio?: string;
  fin?: string;
};

type OpcionesPayload = {
  success: boolean;
  centros?: Opcion[];
  medicos?: Opcion[];
  pacientes?: Opcion[];
  proveedores?: Opcion[];
  estados?: Opcion[];
  salas?: Opcion[];
  citas?: CitaOption[];
  schema?: { requires_id_cita?: boolean };
  calidad_conexion?: Opcion[];
  tipos_sala_virtual?: Opcion[];
  recordatorio_minutos?: Opcion[];
  duraciones_sugeridas?: Opcion[];
  slots_sugeridos?: Opcion[];
  features?: any;
  meta?: {
    pacientes_limit?: number;
    filtered_by_centro?: number | null;
    filtered_by_medico?: number | null;
    counts?: Record<string, number>;
  };
  opciones?: Partial<OpcionesPayload>;
  debug?: { errors?: string[]; env?: string };
};

type FilterPreset = {
  id: string;
  name: string;
  filters: Record<string, any>;
  icon?: React.ReactNode;
};

type ExportFormat = "csv" | "excel" | "pdf" | "json";

/* =============== UTILIDADES =============== */
const badgeEstado = (estado?: string | null) => {
  const configs = {
    programada: { bg: "bg-blue-500", text: "text-white", icon: Calendar, label: "Programada" },
    en_espera: { bg: "bg-indigo-500", text: "text-white", icon: Clock, label: "En espera" },
    en_curso: { bg: "bg-amber-500", text: "text-white", icon: Activity, label: "En curso" },
    finalizada: { bg: "bg-emerald-500", text: "text-white", icon: Check, label: "Finalizada" },
    cancelada: { bg: "bg-gray-500", text: "text-white", icon: Ban, label: "Cancelada" },
    no_asistio: { bg: "bg-rose-500", text: "text-white", icon: UserX, label: "No asistió" },
    problema_tecnico: { bg: "bg-red-600", text: "text-white", icon: AlertTriangle, label: "Problema técnico" },
  };
  return configs[estado as keyof typeof configs] || {
    bg: "bg-gray-400",
    text: "text-white",
    icon: HelpCircle,
    label: estado || "—"
  };
};

const safeInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const fmtDur = (s?: number | null) => {
  const n = Number(s || 0);
  const h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), ss = n % 60;
  return `${h}h ${m}m ${ss}s`;
};
const openNewTab = (url: string) => { try { window.open(url, "_blank", "noopener,noreferrer"); } catch { } };

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const getQualityColor = (quality?: string | null) => {
  switch (quality) {
    case "excelente": return "text-emerald-600 bg-emerald-50";
    case "buena": return "text-blue-600 bg-blue-50";
    case "regular": return "text-amber-600 bg-amber-50";
    case "mala": return "text-orange-600 bg-orange-50";
    case "muy_mala": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const HelpCircle = (props: any) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* =============== PÁGINA PRINCIPAL =============== */
export default function AdminTelemedicinaSesionesPremiumPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Funciones de navegación para todos los botones
  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleNavigation = (section: string) => {
    const routes: Record<string, string> = {
      'dashboard': '/admin/dashboard',
      'sesiones': '/admin/telemedicina-sesiones',
      'calendario': '/admin/calendario',
      'pacientes': '/admin/pacientes',
      'medicos': '/admin/medicos',
      'centros': '/admin/centros-medicos',
      'grabaciones': '/admin/telemedicina-grabaciones',
      'monitoreo': '/admin/monitoreo',
      'reportes': '/admin/reportes',
      'configuracion': '/admin/configuracion',
      'perfil': '/admin/perfil',
      'notificaciones': '/admin/notificaciones',
      'ayuda': '/admin/ayuda',
      'soporte': '/admin/soporte'
    };
    
    if (routes[section]) {
      navigateTo(routes[section]);
    } else {
      alert(`Navegando a: ${section}`);
    }
  };

  // Funciones de exportación reales
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Paciente', 'RUT', 'Médico', 'Centro', 'Estado', 'Inicio', 'Fin', 'Duración', 'Calidad'];
    const rows = items.map(r => [
      r.id_sesion,
      r.paciente_nombre,
      r.paciente_rut || '',
      r.medico_nombre,
      r.centro_nombre || '',
      r.estado || '',
      new Date(r.fecha_hora_inicio_programada).toLocaleString(),
      new Date(r.fecha_hora_fin_programada).toLocaleString(),
      r.duracion_segundos ? fmtDur(r.duracion_segundos) : '',
      r.calidad_conexion || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    downloadFile(csv, `sesiones-telemedicina-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    alert('✅ Archivo CSV descargado exitosamente');
  };

  const exportToJSON = () => {
    const json = JSON.stringify(items, null, 2);
    downloadFile(json, `sesiones-telemedicina-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    alert('✅ Archivo JSON descargado exitosamente');
  };

  const exportToPDF = () => {
    alert('📄 Generando PDF... Esta función requiere una librería como jsPDF o react-pdf');
    // Aquí integrarías jsPDF o similar
  };

  const exportToExcel = () => {
    alert('📊 Generando Excel... Esta función requiere una librería como xlsx o exceljs');
    // Aquí integrarías xlsx o similar
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sesiones de Telemedicina',
        text: `Reporte de ${items.length} sesiones`,
        url: window.location.href
      }).catch(() => {
        alert('❌ No se pudo compartir');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('🔗 Link copiado al portapapeles');
    }
  };

  // Estado de datos
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Sesion[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Estadísticas avanzadas
  const [stats, setStats] = useState<Stats>({
    total: 0, programadas: 0, en_espera: 0, en_curso: 0, finalizadas: 0,
    canceladas: 0, no_asistio: 0, problema_tecnico: 0,
    tasa_completitud: 0, duracion_promedio: 0, satisfaccion_promedio: 0,
    sesiones_hoy: 0, sesiones_semana: 0, crecimiento_semanal: 0,
    tiempo_espera_promedio: 0, calidad_conexion_promedio: 0
  });

  // Filtros principales
  const [fCentro, setFCentro] = useState<number | "">("");
  const [fMedico, setFMedico] = useState<number | "">("");
  const [fPaciente, setFPaciente] = useState<number | "">("");
  const [fEstado, setFEstado] = useState<string>("");
  const [fProv, setFProv] = useState<string>("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");
  const [fSearch, setFSearch] = useState("");

  // Filtros avanzados
  const [fCalidadConexion, setFCalidadConexion] = useState("");
  const [fEvaluacionMin, setFEvaluacionMin] = useState("");
  const [fConGrabacion, setFConGrabacion] = useState<boolean | "">("");
  const [fDispositivo, setFDispositivo] = useState("");
  const [fDuracionMin, setFDuracionMin] = useState("");
  const [fDuracionMax, setFDuracionMax] = useState("");

  // Opciones
  const [opCentros, setOpCentros] = useState<Opcion[]>([]);
  const [opMedicos, setOpMedicos] = useState<Opcion[]>([]);
  const [opPacientes, setOpPacientes] = useState<Opcion[]>([]);
  const [opProveedores, setOpProveedores] = useState<Opcion[]>([]);
  const [opEstados, setOpEstados] = useState<Opcion[]>([]);
  const [opSalas, setOpSalas] = useState<Opcion[]>([]);
  const [opCitas, setOpCitas] = useState<CitaOption[]>([]);
  const [requiresCita, setRequiresCita] = useState<boolean>(false);

  // Debug
  const [dbgOpen, setDbgOpen] = useState(false);
  const [dbgCounts, setDbgCounts] = useState<Record<string, number>>({});
  const [dbgErrors, setDbgErrors] = useState<string[]>([]);
  const [dbgEnv, setDbgEnv] = useState<string | undefined>(undefined);

  // Selección y acciones
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBulk, setShowBulk] = useState(false);

  // Modales
  const [showCE, setShowCE] = useState(false);
  const [editSesion, setEditSesion] = useState<Sesion | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [detalleSesion, setDetalleSesion] = useState<Sesion | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Presets de filtros
  const [filterPresets] = useState<FilterPreset[]>([
    {
      id: "hoy",
      name: "Hoy",
      filters: { desde: new Date().toISOString().split('T')[0] },
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: "semana",
      name: "Esta semana",
      filters: { desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: "activas",
      name: "Activas",
      filters: { estado: "en_curso" },
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: "pendientes",
      name: "Pendientes",
      filters: { estado: "programada" },
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: "problemas",
      name: "Con problemas",
      filters: { estado: "problema_tecnico" },
      icon: <AlertTriangle className="w-4 h-4" />
    }
  ]);

  // Notificaciones en tiempo real (simuladas)
  const [notifications, setNotifications] = useState<Array<{ id: number; type: string; message: string; time: string }>>([
    { id: 1, type: "success", message: "Nueva sesión iniciada con Dr. García", time: "Hace 2 min" },
    { id: 2, type: "warning", message: "Calidad de conexión baja detectada", time: "Hace 5 min" },
    { id: 3, type: "info", message: "10 sesiones programadas para hoy", time: "Hace 1 hora" }
  ]);

  // Tema
  useEffect(() => {
    const savedTheme = (typeof window !== "undefined") ? (localStorage.getItem("theme") as Theme | null) : null;
    if (savedTheme) setTheme(savedTheme);
    else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Cargar opciones
  const loadOpciones = useCallback(async () => {
    setDbgErrors([]);
    setDbgCounts({});
    setDbgEnv(undefined);

    const t = Date.now().toString();
    const url = `/api/admin/telemedicina-sesiones/opciones?__debug=1&t=${t}`;
    try {
      const res = await fetch(url, { cache: "no-store", headers: { "x-no-cache": t } });
      const data: OpcionesPayload = await res.json();

      const src = data || ({} as any);
      const mirror = src.opciones || {};
      const pick = <T extends any[]>(a?: T, b?: T): T => (Array.isArray(a) && a.length ? a : (Array.isArray(b) ? b : ([] as unknown as T)));

      setOpCentros(pick(src.centros, mirror.centros));
      setOpMedicos(pick(src.medicos, mirror.medicos));
      setOpPacientes(pick(src.pacientes, mirror.pacientes));
      setOpProveedores(pick(src.proveedores, mirror.proveedores));
      setOpEstados(pick(src.estados, mirror.estados));
      setOpSalas(pick(src.salas, mirror.salas));
      setOpCitas(pick(src.citas, mirror.citas) as unknown as CitaOption[]);
      setRequiresCita(!!(src.schema?.requires_id_cita));

      setDbgCounts(src.meta?.counts || {});
      setDbgErrors(src.debug?.errors || []);
      setDbgEnv(src.debug?.env);
    } catch (e: any) {
      setDbgErrors(prev => prev.concat([`Error: ${e?.message || String(e)}`]));
    }
  }, []);

  useEffect(() => { loadOpciones(); }, [loadOpciones]);

  // Recargar citas dinámicamente
  const reloadCitas = useCallback(async (filters: {
    id_centro?: number | "";
    id_medico?: number | "";
    id_paciente?: number | "";
    desde?: string;
    hasta?: string;
  }) => {
    const q = new URLSearchParams({ only: "citas", t: Date.now().toString() });
    if (filters.id_centro) q.append("id_centro", String(filters.id_centro));
    if (filters.id_medico) q.append("id_medico", String(filters.id_medico));
    if (filters.id_paciente) q.append("id_paciente", String(filters.id_paciente));
    if (filters.desde) q.append("desde", filters.desde);
    if (filters.hasta) q.append("hasta", filters.hasta);
    try {
      const res = await fetch(`/api/admin/telemedicina-sesiones/opciones?${q.toString()}`, { cache: "no-store" });
      const data: OpcionesPayload = await res.json();
      if (data?.success) setOpCitas((data.citas || []) as CitaOption[]);
    } catch (e) { console.error(e); }
  }, []);

  // Cargar datos
  const fetchData = useCallback(async (page = pagina) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        pagina: String(page),
        pageSize: String(pageSize),
        t: Date.now().toString()
      });

      // Filtros principales
      if (fCentro) q.append("id_centro", String(fCentro));
      if (fMedico) q.append("id_medico", String(fMedico));
      if (fPaciente) q.append("id_paciente", String(fPaciente));
      if (fEstado) q.append("estado", fEstado);
      if (fProv) q.append("proveedor", fProv);
      if (fDesde) q.append("desde", fDesde);
      if (fHasta) q.append("hasta", fHasta);
      if (fSearch) q.append("search", fSearch);

      // Filtros avanzados
      if (fCalidadConexion) q.append("calidad", fCalidadConexion);
      if (fEvaluacionMin) q.append("eval_min", fEvaluacionMin);
      if (fConGrabacion !== "") q.append("grabacion", String(fConGrabacion));
      if (fDispositivo) q.append("dispositivo", fDispositivo);
      if (fDuracionMin) q.append("dur_min", fDuracionMin);
      if (fDuracionMax) q.append("dur_max", fDuracionMax);

      const res = await fetch(`/api/admin/telemedicina-sesiones?${q.toString()}`, { cache: "no-store" });
      const data = await res.json();

      if (data?.success) {
        setItems(data.items || []);
        setTotal(Number(data.total || 0));
        setPagina(Number(data.pagina || page));
        
        if (data.stats) {
          setStats({
            total: safeInt(data.stats.total),
            programadas: safeInt(data.stats.programadas),
            en_espera: safeInt(data.stats.en_espera),
            en_curso: safeInt(data.stats.en_curso),
            finalizadas: safeInt(data.stats.finalizadas),
            canceladas: safeInt(data.stats.canceladas),
            no_asistio: safeInt(data.stats.no_asistio),
            problema_tecnico: safeInt(data.stats.problema_tecnico),
            tasa_completitud: Number(data.stats.tasa_completitud || 0),
            duracion_promedio: Number(data.stats.duracion_promedio || 0),
            satisfaccion_promedio: Number(data.stats.satisfaccion_promedio || 0),
            sesiones_hoy: safeInt(data.stats.sesiones_hoy),
            sesiones_semana: safeInt(data.stats.sesiones_semana),
            crecimiento_semanal: Number(data.stats.crecimiento_semanal || 0),
            tiempo_espera_promedio: Number(data.stats.tiempo_espera_promedio || 0),
            calidad_conexion_promedio: Number(data.stats.calidad_conexion_promedio || 0)
          });
        }
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pagina, pageSize, fCentro, fMedico, fPaciente, fEstado, fProv, fDesde, fHasta, fSearch,
    fCalidadConexion, fEvaluacionMin, fConGrabacion, fDispositivo, fDuracionMin, fDuracionMax]);

  useEffect(() => {
    fetchData(1);
  }, [pageSize, fCentro, fMedico, fPaciente, fEstado, fProv, fDesde, fHasta,
    fCalidadConexion, fEvaluacionMin, fConGrabacion, fDispositivo, fDuracionMin, fDuracionMax, fetchData]);

  const resetFiltros = () => {
    setFCentro(""); setFMedico(""); setFPaciente(""); setFEstado(""); setFProv("");
    setFDesde(""); setFHasta(""); setFSearch("");
    setFCalidadConexion(""); setFEvaluacionMin(""); setFConGrabacion("");
    setFDispositivo(""); setFDuracionMin(""); setFDuracionMax("");
    fetchData(1);
  };

  const applyPreset = (preset: FilterPreset) => {
    resetFiltros();
    Object.entries(preset.filters).forEach(([key, value]) => {
      switch (key) {
        case "desde": setFDesde(value); break;
        case "hasta": setFHasta(value); break;
        case "estado": setFEstado(value); break;
      }
    });
  };

  // Acciones CRUD
  const onCreate = () => { setEditSesion(null); setShowCE(true); };
  const onEdit = (r: Sesion) => { setEditSesion(r); setShowCE(true); };
  const onDetalle = (r: Sesion) => { setDetalleSesion(r); setShowDetalle(true); };

  const onDelete = async (r: Sesion) => {
    if (!confirm("¿Eliminar esta sesión? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/admin/telemedicina-sesiones/${r.id_sesion}?soft=0`, { method: "DELETE" });
    const data = await res.json();
    if (!data?.success) return alert(data?.error || "No se pudo eliminar");
    fetchData(pagina);
  };

  const toggleSelect = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id_sesion)));
    }
  };

  const callAction = async (id: number, action: string) => {
    try {
      const res = await fetch(`/api/admin/telemedicina-sesiones/${id}?action=${encodeURIComponent(action)}`, { method: "PUT" });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Acción no aplicada");
      fetchData(pagina);
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  };

  const bulk = async (action: "en_espera" | "en_curso" | "finalizada" | "cancelada") => {
    if (!selected.size) return;
    if (!confirm(`¿Aplicar "${action}" a ${selected.size} sesión(es)?`)) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => callAction(id, action)));
    setSelected(new Set());
  };

  const exportData = async (format: ExportFormat) => {
    setShowExport(false);
    
    switch (format) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      default:
        alert('Formato no soportado');
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === "dark" ? "dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-gray-50 via-white to-gray-100"}`}>
      <div className="flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-2xl`}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-lg rounded-xl">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">TeleMed Pro</h2>
                    <p className="text-xs text-indigo-100">Gestión Avanzada</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem icon={<BarChart3 />} label="Dashboard" active={false} collapsed={sidebarCollapsed} onClick={() => handleNavigation('dashboard')} />
            <NavItem icon={<Video />} label="Sesiones" active={true} collapsed={sidebarCollapsed} onClick={() => handleNavigation('sesiones')} />
            <NavItem icon={<Calendar />} label="Calendario" collapsed={sidebarCollapsed} onClick={() => handleNavigation('calendario')} />
            <NavItem icon={<Users />} label="Pacientes" collapsed={sidebarCollapsed} onClick={() => handleNavigation('pacientes')} />
            <NavItem icon={<Stethoscope />} label="Médicos" collapsed={sidebarCollapsed} onClick={() => handleNavigation('medicos')} />
            <NavItem icon={<Building2 />} label="Centros" collapsed={sidebarCollapsed} onClick={() => handleNavigation('centros')} />
            <NavItem icon={<Film />} label="Grabaciones" collapsed={sidebarCollapsed} onClick={() => handleNavigation('grabaciones')} />
            <NavItem icon={<Activity />} label="Monitoreo" collapsed={sidebarCollapsed} onClick={() => handleNavigation('monitoreo')} />
            <NavItem icon={<FileText />} label="Reportes" collapsed={sidebarCollapsed} onClick={() => handleNavigation('reportes')} />
            <NavItem icon={<Settings />} label="Configuración" collapsed={sidebarCollapsed} onClick={() => handleNavigation('configuracion')} />
          </nav>

          {/* User Profile */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleNavigation('perfil')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer">
                  AD
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Administrador</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@telemed.cl</p>
                </div>
              </button>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* HEADER */}
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Gestión de Sesiones
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Control total de telemedicina en tiempo real
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick Stats */}
                <QuickStat 
                  icon={<Activity />} 
                  value={stats.en_curso} 
                  label="En curso" 
                  color="amber"
                  onClick={() => {
                    setFEstado("en_curso");
                    fetchData(1);
                  }}
                />
                <QuickStat 
                  icon={<Clock />} 
                  value={stats.en_espera} 
                  label="En espera" 
                  color="blue"
                  onClick={() => {
                    setFEstado("en_espera");
                    fetchData(1);
                  }}
                />
                <QuickStat 
                  icon={<Calendar />} 
                  value={stats.sesiones_hoy} 
                  label="Hoy" 
                  color="indigo"
                  onClick={() => {
                    const hoy = new Date().toISOString().split('T')[0];
                    setFDesde(hoy);
                    setFHasta(hoy);
                    fetchData(1);
                  }}
                />

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
                >
                  {theme === "light" ? (
                    <Moon className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform" />
                  )}
                </button>

                {/* Notifications */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
                >
                  <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:animate-swing" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* View Mode Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                  {(['table', 'cards', 'calendar', 'timeline', 'kanban'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 rounded-lg transition-all ${viewMode === mode
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                    >
                      {mode === 'table' && <List className="w-5 h-5" />}
                      {mode === 'cards' && <Grid className="w-5 h-5" />}
                      {mode === 'calendar' && <Calendar className="w-5 h-5" />}
                      {mode === 'timeline' && <Activity className="w-5 h-5" />}
                      {mode === 'kanban' && <Layers className="w-5 h-5" />}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <button
                  onClick={() => setShowStats(true)}
                  className="px-5 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                >
                  <PieChart className="w-5 h-5" />
                  Estadísticas
                </button>

                <button
                  onClick={onCreate}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Sesión
                </button>
              </div>
            </header>

            {/* PREMIUM KPI DASHBOARD */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              <PremiumKpi
                icon={<FileText />}
                label="Total Sesiones"
                value={stats.total}
                trend={stats.crecimiento_semanal}
                color="from-blue-500 to-blue-600"
              />
              <PremiumKpi
                icon={<Calendar />}
                label="Programadas"
                value={stats.programadas}
                subtitle="Próximas"
                color="from-indigo-500 to-indigo-600"
              />
              <PremiumKpi
                icon={<Clock />}
                label="En Espera"
                value={stats.en_espera}
                subtitle="Sala virtual"
                color="from-amber-500 to-amber-600"
                pulse
              />
              <PremiumKpi
                icon={<Activity />}
                label="En Curso"
                value={stats.en_curso}
                subtitle="En vivo"
                color="from-emerald-500 to-emerald-600"
                pulse
              />
              <PremiumKpi
                icon={<Check />}
                label="Finalizadas"
                value={stats.finalizadas}
                subtitle={`${formatPercent(stats.tasa_completitud)} éxito`}
                color="from-green-500 to-green-600"
              />
              <PremiumKpi
                icon={<Ban />}
                label="Canceladas"
                value={stats.canceladas}
                subtitle="Este periodo"
                color="from-gray-500 to-gray-600"
              />
              <PremiumKpi
                icon={<AlertTriangle />}
                label="Incidencias"
                value={stats.no_asistio + stats.problema_tecnico}
                subtitle="Requieren atención"
                color="from-red-500 to-red-600"
              />
              <PremiumKpi
                icon={<Star />}
                label="Satisfacción"
                value={stats.satisfaccion_promedio.toFixed(1)}
                subtitle="Promedio"
                color="from-purple-500 to-purple-600"
              />
            </section>

            {/* ADVANCED METRICS */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Clock />}
                title="Tiempo Promedio"
                value={fmtDur(stats.duracion_promedio)}
                subtitle="Duración de sesiones"
                color="blue"
              />
              <MetricCard
                icon={<Wifi />}
                title="Calidad Conexión"
                value={`${stats.calidad_conexion_promedio.toFixed(1)}/5`}
                subtitle="Promedio de red"
                color="emerald"
              />
              <MetricCard
                icon={<Users />}
                title="Sesiones Semana"
                value={stats.sesiones_semana}
                subtitle={`${stats.crecimiento_semanal >= 0 ? '+' : ''}${formatPercent(stats.crecimiento_semanal)}`}
                color="indigo"
                trend={stats.crecimiento_semanal}
              />
              <MetricCard
                icon={<TrendingUp />}
                title="Tiempo Espera"
                value={`${Math.floor(stats.tiempo_espera_promedio)}min`}
                subtitle="Promedio de ingreso"
                color="amber"
              />
            </section>

            {/* FILTER PRESETS */}
            <section className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Filtros rápidos:</span>
              {filterPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {preset.icon}
                  {preset.name}
                </button>
              ))}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
              >
                <Settings className="w-4 h-4" />
                Filtros Avanzados
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </section>

            {/* ADVANCED FILTERS PANEL */}
            {showAdvancedFilters && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Filtros Avanzados
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Basic Filters */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <SelectLabeled label="Centro Médico" value={String(fCentro)} onChange={(v) => setFCentro(v ? Number(v) : "")} options={opCentros} />
                    <SelectLabeled label="Médico" value={String(fMedico)} onChange={(v) => setFMedico(v ? Number(v) : "")} options={opMedicos} />
                    <SelectLabeled label="Paciente" value={String(fPaciente)} onChange={(v) => setFPaciente(v ? Number(v) : "")} options={opPacientes} />
                    <SelectLabeled label="Estado" value={fEstado} onChange={setFEstado} options={opEstados} allowEmpty />
                  </div>

                  {/* Advanced Filters */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <SelectLabeled label="Proveedor" value={fProv} onChange={setFProv} options={opProveedores} allowEmpty />
                    <SelectLabeled
                      label="Calidad Conexión"
                      value={fCalidadConexion}
                      onChange={setFCalidadConexion}
                      options={[
                        { value: "excelente", label: "Excelente" },
                        { value: "buena", label: "Buena" },
                        { value: "regular", label: "Regular" },
                        { value: "mala", label: "Mala" },
                        { value: "muy_mala", label: "Muy Mala" }
                      ]}
                      allowEmpty
                    />
                    <InputLabeled
                      label="Evaluación Mínima"
                      type="number"
                      value={fEvaluacionMin}
                      onChange={setFEvaluacionMin}
                      placeholder="1-5"
                      min="1"
                      max="5"
                    />
                    <SelectLabeled
                      label="Con Grabación"
                      value={String(fConGrabacion)}
                      onChange={(v) => setFConGrabacion(v === "" ? "" : v === "true")}
                      options={[
                        { value: "true", label: "Sí" },
                        { value: "false", label: "No" }
                      ]}
                      allowEmpty
                    />
                  </div>

                  {/* Date and Duration Filters */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <InputDate label="Desde" value={fDesde} onChange={setFDesde} />
                    <InputDate label="Hasta" value={fHasta} onChange={setFHasta} />
                    <InputLabeled
                      label="Duración Mínima (min)"
                      type="number"
                      value={fDuracionMin}
                      onChange={setFDuracionMin}
                      placeholder="0"
                    />
                    <InputLabeled
                      label="Duración Máxima (min)"
                      type="number"
                      value={fDuracionMax}
                      onChange={setFDuracionMax}
                      placeholder="120"
                    />
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">
                      Búsqueda Global
                    </label>
                    <div className="relative">
                      <input
                        value={fSearch}
                        onChange={e => setFSearch(e.target.value)}
                        placeholder="Buscar por paciente, RUT, médico, token, URL..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetFiltros}
                        className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Limpiar Filtros
                      </button>
                      <button
                        onClick={() => fetchData(1)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <Search className="w-5 h-5" />
                        Aplicar Filtros
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {total} resultados encontrados
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* BULK ACTIONS TOOLBAR */}
            {selected.size > 0 && (
              <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                      <CheckSquare className="w-5 h-5" />
                      <span className="font-semibold">{selected.size} sesión(es) seleccionada(s)</span>
                    </div>
                    <div className="h-6 w-px bg-white/30" />
                    <div className="flex items-center gap-2">
                      <BulkActionBtn icon={<Clock />} label="En Espera" onClick={() => bulk("en_espera")} />
                      <BulkActionBtn icon={<Play />} label="Iniciar" onClick={() => bulk("en_curso")} />
                      <BulkActionBtn icon={<Check />} label="Finalizar" onClick={() => bulk("finalizada")} />
                      <BulkActionBtn icon={<Ban />} label="Cancelar" onClick={() => bulk("cancelada")} danger />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </section>
            )}

            {/* MAIN TOOLBAR */}
            <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <ToolbarBtn
                  icon={<CheckSquare />}
                  label={selected.size === items.length ? "Deseleccionar" : "Seleccionar Todo"}
                  onClick={selectAll}
                />
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <ToolbarBtn icon={<Download />} label="Exportar" onClick={() => setShowExport(true)} />
                <ToolbarBtn icon={<FileSpreadsheet />} label="Excel" onClick={exportToExcel} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" />
                <ToolbarBtn icon={<FileText />} label="CSV" onClick={exportToCSV} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
                <ToolbarBtn icon={<FilePlus />} label="JSON" onClick={exportToJSON} className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20" />
                <ToolbarBtn icon={<FileText />} label="PDF" onClick={exportToPDF} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" />
                <ToolbarBtn icon={<Printer />} title="Imprimir" onClick={handlePrint} />
                <ToolbarBtn icon={<RefreshCw />} title="Refrescar" onClick={() => fetchData(pagina)} />
                <ToolbarBtn icon={<Share2 />} title="Compartir" onClick={handleShare} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-750 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </button>
              </div>
            </section>

            {/* MAIN CONTENT AREA */}
            {viewMode === "table" ? (
              <TableViewPremium
                loading={loading}
                items={items}
                selected={selected}
                toggleSelect={toggleSelect}
                onEdit={onEdit}
                onDetalle={onDetalle}
                onDelete={onDelete}
                onAction={callAction}
              />
            ) : viewMode === "cards" ? (
              <CardsViewPremium
                loading={loading}
                items={items}
                onEdit={onEdit}
                onDetalle={onDetalle}
                onDelete={onDelete}
                onAction={callAction}
              />
            ) : viewMode === "calendar" ? (
              <CalendarView items={items} loading={loading} />
            ) : viewMode === "timeline" ? (
              <TimelineView items={items} loading={loading} />
            ) : (
              <KanbanView items={items} loading={loading} />
            )}

            {/* PAGINATION */}
            {!loading && items.length > 0 && (
              <section className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Mostrando <span className="font-bold text-gray-900 dark:text-white">{Math.min((pagina - 1) * pageSize + 1, total)}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagina * pageSize, total)}</span> de <span className="font-bold text-gray-900 dark:text-white">{total}</span>
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[10, 20, 50, 100, 200].map(n => <option key={n} value={n}>{n} por página</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    disabled={pagina <= 1}
                    onClick={() => { const p = pagina - 1; setPagina(p); fetchData(p); }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                      const pageNum = pagina - 2 + i;
                      if (pageNum < 1 || pageNum > Math.ceil(total / pageSize)) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => { setPagina(pageNum); fetchData(pageNum); }}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all ${pageNum === pagina
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    disabled={pagina * pageSize >= total}
                    onClick={() => { const p = pagina + 1; setPagina(p); fetchData(p); }}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {showCE && (
        <ModalCE
          theme={theme}
          onClose={() => setShowCE(false)}
          onSaved={() => { setShowCE(false); fetchData(pagina); }}
          editSesion={editSesion}
          opciones={{ opCentros, opMedicos, opPacientes, opProveedores, opSalas, opCitas }}
          requiresCita={requiresCita}
          reloadCitas={reloadCitas}
        />
      )}

      {showDetalle && detalleSesion && (
        <ModalDetallePremium theme={theme} sesion={detalleSesion} onClose={() => setShowDetalle(false)} />
      )}

      {showStats && (
        <ModalStats theme={theme} stats={stats} onClose={() => setShowStats(false)} />
      )}

      {showExport && (
        <ModalExport theme={theme} onClose={() => setShowExport(false)} onExport={exportData} />
      )}

      {showNotifications && (
        <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} theme={theme} />
      )}

      {showConfig && (
        <ModalConfiguracion 
          theme={theme} 
          onClose={() => setShowConfig(false)} 
          onSave={(config) => {
            console.log('Configuración guardada:', config);
            alert('✅ Configuración guardada exitosamente');
            setShowConfig(false);
          }} 
        />
      )}
    </div>
  );
}

/* =============== PREMIUM COMPONENTS =============== */
function NavItem({ icon, label, active, collapsed, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
      <span className="w-5 h-5">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function QuickStat({ icon, value, label, color, onClick }: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    amber: "from-amber-500 to-amber-600",
    blue: "from-blue-500 to-blue-600",
    indigo: "from-indigo-500 to-indigo-600"
  };
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
        <div className="w-5 h-5 text-white">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </button>
  );
}

function PremiumKpi({ icon, label, value, subtitle, trend, color, pulse }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all group relative overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg ${pulse ? 'animate-pulse' : ''}`}>
            <div className="w-6 h-6 text-white">{icon}</div>
          </div>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs font-bold">{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color, trend }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  trend?: number;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600"
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
          <div className="w-6 h-6 text-white">{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

function BulkActionBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${danger
        ? 'bg-red-500/20 hover:bg-red-500/30 text-white'
        : 'bg-white/20 hover:bg-white/30 text-white'
        } transition-all flex items-center gap-2 font-medium`}
    >
      <div className="w-4 h-4">{icon}</div>
      {label}
    </button>
  );
}

function ToolbarBtn({ icon, label, title, onClick, className }: { icon: React.ReactNode; label?: string; title?: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-lg transition-all flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 ${className || ""}`}
    >
      <div className="w-4 h-4">{icon}</div>
      {label}
    </button>
  );
}

function SelectLabeled({ label, value, onChange, options, allowEmpty }: { label: string; value: string; onChange: (v: string) => void; options: Opcion[]; allowEmpty?: boolean }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      >
        {allowEmpty !== false && <option value="">Todos</option>}
        {options.map(o => <option key={`${label}-${o.value}`} value={String(o.value)}>{o.label}</option>)}
      </select>
    </div>
  );
}

function InputLabeled({ label, type = "text", value, onChange, placeholder, min, max }: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

function InputDate({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

/* =============== VIEWS =============== */
function TableViewPremium({ loading, items, selected, toggleSelect, onEdit, onDetalle, onDelete, onAction }: {
  loading: boolean;
  items: Sesion[];
  selected: Set<number>;
  toggleSelect: (id: number) => void;
  onEdit: (r: Sesion) => void;
  onDetalle: (r: Sesion) => void;
  onDelete: (r: Sesion) => void;
  onAction: (id: number, action: string) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron sesiones</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-750 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={() => { }}
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Inicio
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Paciente
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Médico
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Centro
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Calidad
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Duración
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map(r => {
              const b = badgeEstado(r.estado);
              const IconComponent = b.icon;
              return (
                <tr
                  key={r.id_sesion}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id_sesion)}
                      onChange={() => toggleSelect(r.id_sesion)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {new Date(r.fecha_hora_inicio_programada).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(r.fecha_hora_inicio_programada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {r.paciente_nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{r.paciente_nombre}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{r.paciente_rut || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{r.medico_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{r.centro_nombre || "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${b.bg} ${b.text}`}>
                      <IconComponent className="w-3 h-3" />
                      {b.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.calidad_conexion ? (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold ${getQualityColor(r.calidad_conexion)}`}>
                        <Wifi className="w-3 h-3" />
                        {r.calidad_conexion.charAt(0).toUpperCase() + r.calidad_conexion.slice(1)}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{r.duracion_segundos ? fmtDur(r.duracion_segundos) : "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionBtn icon={<Eye />} onClick={() => onDetalle(r)} title="Ver detalle" color="blue" />
                      <ActionBtn icon={<Edit />} onClick={() => onEdit(r)} title="Editar" color="indigo" />
                      {r.url_sesion && <ActionBtn icon={<ExternalLink />} onClick={() => openNewTab(r.url_sesion!)} title="Abrir sala" color="emerald" />}
                      <ActionBtn icon={<Trash2 />} onClick={() => onDelete(r)} title="Eliminar" color="red" />
                      <div className="relative group/more">
                        <ActionBtn icon={<MoreVertical />} onClick={() => { }} title="Más" color="gray" />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-50">
                          <button onClick={() => onAction(r.id_sesion, "en_espera")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> En espera
                          </button>
                          <button onClick={() => onAction(r.id_sesion, "en_curso")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Play className="w-4 h-4" /> Iniciar
                          </button>
                          <button onClick={() => onAction(r.id_sesion, "finalizada")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Finalizar
                          </button>
                          <button onClick={() => onAction(r.id_sesion, "cancelada")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600">
                            <Ban className="w-4 h-4" /> Cancelar
                          </button>
                        </div>
                      </div>
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

function ActionBtn({ icon, onClick, title, color }: { icon: React.ReactNode; onClick: () => void; title: string; color: string }) {
  const colorClasses = {
    blue: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    indigo: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    emerald: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    red: "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400",
    gray: "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="w-4 h-4">{icon}</div>
    </button>
  );
}

function CardsViewPremium({ loading, items, onEdit, onDetalle, onDelete, onAction }: {
  loading: boolean;
  items: Sesion[];
  onEdit: (r: Sesion) => void;
  onDetalle: (r: Sesion) => void;
  onDelete: (r: Sesion) => void;
  onAction: (id: number, action: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No se encontraron sesiones</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(r => {
        const b = badgeEstado(r.estado);
        const IconComponent = b.icon;
        return (
          <div
            key={r.id_sesion}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(r.fecha_hora_inicio_programada).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(r.fecha_hora_inicio_programada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${b.bg} ${b.text}`}>
                <IconComponent className="w-3 h-3" />
                {b.label}
              </span>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {r.paciente_nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{r.paciente_nombre}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.paciente_rut || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span className="truncate">{r.medico_nombre}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="truncate">{r.centro_nombre || "—"}</span>
              </div>

              {r.calidad_conexion && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold ${getQualityColor(r.calidad_conexion)}`}>
                  <Wifi className="w-3 h-3" />
                  {r.calidad_conexion}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onDetalle(r)}
                className="flex-1 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              <button
                onClick={() => onEdit(r)}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ items, loading }: { items: Sesion[]; loading: boolean }) {
  if (loading) return <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center py-20">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Vista de calendario en desarrollo</p>
      </div>
    </div>
  );
}

function TimelineView({ items, loading }: { items: Sesion[]; loading: boolean }) {
  if (loading) return <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center py-20">
        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Vista de línea de tiempo en desarrollo</p>
      </div>
    </div>
  );
}

function KanbanView({ items, loading }: { items: Sesion[]; loading: boolean }) {
  if (loading) return <div className="text-center py-20"><Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center py-20">
        <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Vista Kanban en desarrollo</p>
      </div>
    </div>
  );
}

/* =============== MODALS =============== */
function ModalCE({ theme, onClose, onSaved, editSesion, opciones, requiresCita, reloadCitas }: {
  theme: Theme;
  onClose: () => void;
  onSaved: () => void;
  editSesion: Sesion | null;
  opciones: { opCentros: Opcion[]; opMedicos: Opcion[]; opPacientes: Opcion[]; opProveedores: Opcion[]; opSalas: Opcion[]; opCitas: CitaOption[] };
  requiresCita: boolean;
  reloadCitas: (filters: { id_centro?: number | ""; id_medico?: number | ""; id_paciente?: number | ""; desde?: string; hasta?: string }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(() => ({
    id_centro: editSesion?.id_centro ?? "",
    id_medico: editSesion?.id_medico ?? "",
    id_paciente: editSesion?.id_paciente ?? "",
    id_cita: editSesion?.id_cita ?? "",
    proveedor_servicio: editSesion?.proveedor_servicio ?? "",
    id_sala_virtual: "",
    fecha_hora_inicio_programada: editSesion?.fecha_hora_inicio_programada?.slice(0, 16) ?? "",
    fecha_hora_fin_programada: editSesion?.fecha_hora_fin_programada?.slice(0, 16) ?? "",
    grabacion_autorizada: editSesion?.grabacion_autorizada ?? 0,
  }));

  useEffect(() => {
    reloadCitas({
      id_centro: form.id_centro,
      id_medico: form.id_medico,
      id_paciente: form.id_paciente,
      desde: form.fecha_hora_inicio_programada || undefined,
      hasta: form.fecha_hora_fin_programada || undefined,
    });
  }, [form.id_centro, form.id_medico, form.id_paciente, form.fecha_hora_inicio_programada, form.fecha_hora_fin_programada, reloadCitas]);

  const onPickCita = (id: string) => {
    const c = opciones.opCitas.find(ci => String(ci.value) === String(id));
    setForm((f: any) => ({
      ...f,
      id_cita: id,
      fecha_hora_inicio_programada: f.fecha_hora_inicio_programada || (c?.inicio ? String(c.inicio).slice(0, 16) : ""),
      fecha_hora_fin_programada: f.fecha_hora_fin_programada || (c?.fin ? String(c.fin).slice(0, 16) : ""),
      id_centro: f.id_centro || (c?.id_centro ?? ""),
      id_medico: f.id_medico || (c?.id_medico ?? ""),
      id_paciente: f.id_paciente || (c?.id_paciente ?? ""),
    }));
  };

  const submit = async () => {
    if (requiresCita && !form.id_cita) {
      alert("Debes seleccionar una cita vinculada.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        id_centro: Number(form.id_centro) || null,
        id_medico: Number(form.id_medico) || null,
        id_paciente: Number(form.id_paciente) || null,
        id_cita: form.id_cita ? Number(form.id_cita) : undefined,
        proveedor_servicio: form.proveedor_servicio || null,
        id_sala_virtual: form.id_sala_virtual ? Number(form.id_sala_virtual) : null,
        fecha_hora_inicio_programada: form.fecha_hora_inicio_programada || null,
        fecha_hora_fin_programada: form.fecha_hora_fin_programada || null,
        grabacion_autorizada: form.grabacion_autorizada ? 1 : 0,
      };

      const url = editSesion ? `/api/admin/telemedicina-sesiones/${editSesion.id_sesion}` : `/api/admin/telemedicina-sesiones`;
      const method = editSesion ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data?.success) return alert(data?.error || "Error al guardar");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase title={editSesion ? "✏️ Editar Sesión" : "➕ Nueva Sesión"} theme={theme} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-3 gap-6">
        <SelectLabeled label="Centro Médico" value={String(form.id_centro)} onChange={(v) => setForm((f: any) => ({ ...f, id_centro: v }))} options={opciones.opCentros} />
        <SelectLabeled label="Médico" value={String(form.id_medico)} onChange={(v) => setForm((f: any) => ({ ...f, id_medico: v }))} options={opciones.opMedicos} />
        <SelectLabeled label="Paciente" value={String(form.id_paciente)} onChange={(v) => setForm((f: any) => ({ ...f, id_paciente: v }))} options={opciones.opPacientes} />

        <SelectLabeled label={requiresCita ? "Cita (requerida)" : "Cita (opcional)"} value={String(form.id_cita)} onChange={onPickCita} options={opciones.opCitas} allowEmpty={!requiresCita} />
        <SelectLabeled label="Proveedor" value={form.proveedor_servicio} onChange={(v) => setForm((f: any) => ({ ...f, proveedor_servicio: v }))} options={opciones.opProveedores} />
        <SelectLabeled label="Sala Virtual" value={form.id_sala_virtual} onChange={(v) => setForm((f: any) => ({ ...f, id_sala_virtual: v }))} options={opciones.opSalas} allowEmpty />

        <InputDate label="Inicio Programado" value={form.fecha_hora_inicio_programada} onChange={(v) => setForm((f: any) => ({ ...f, fecha_hora_inicio_programada: v }))} />
        <InputDate label="Fin Programado" value={form.fecha_hora_fin_programada} onChange={(v) => setForm((f: any) => ({ ...f, fecha_hora_fin_programada: v }))} />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={!!form.grabacion_autorizada}
            onChange={e => setForm((f: any) => ({ ...f, grabacion_autorizada: e.target.checked ? 1 : 0 }))}
            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Autorizar Grabación</label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold text-gray-700 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          {saving ? "Guardando..." : editSesion ? "Actualizar Sesión" : "Crear Sesión"}
        </button>
      </div>
    </ModalBase>
  );
}

function ModalDetallePremium({ theme, sesion, onClose }: { theme: Theme; sesion: Sesion; onClose: () => void }) {
  const b = badgeEstado(sesion.estado);
  const IconComponent = b.icon;

  return (
    <ModalBase title="📋 Detalle Completo de Sesión" theme={theme} onClose={onClose} size="large">
      <div className="space-y-6">
        {/* Header con estado */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${b.bg} shadow-lg`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sesión #{sesion.id_sesion}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Creada el {new Date(sesion.fecha_hora_inicio_programada).toLocaleString()}</p>
            </div>
          </div>
          <span className={`px-6 py-3 rounded-xl text-sm font-bold ${b.bg} ${b.text} flex items-center gap-2`}>
            <IconComponent className="w-4 h-4" />
            {b.label}
          </span>
        </div>

        {/* Grid de información */}
        <div className="grid md:grid-cols-2 gap-6">
          <InfoBoxPremium icon={<User />} title="Paciente" value={sesion.paciente_nombre} subtitle={sesion.paciente_rut || undefined} />
          <InfoBoxPremium icon={<Stethoscope />} title="Médico" value={sesion.medico_nombre} />
          <InfoBoxPremium icon={<Building2 />} title="Centro Médico" value={sesion.centro_nombre || "No especificado"} />
          <InfoBoxPremium icon={<Video />} title="Proveedor" value={sesion.proveedor_servicio || "No especificado"} />
        </div>

        {/* Horarios */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Programación y Tiempos
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Inicio Programado</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(sesion.fecha_hora_inicio_programada).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Fin Programado</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(sesion.fecha_hora_fin_programada).toLocaleString()}</p>
            </div>
            {sesion.fecha_hora_inicio_real && (
              <>
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Inicio Real</p>
                  <p className="text-lg font-bold text-emerald-600">{new Date(sesion.fecha_hora_inicio_real).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Fin Real</p>
                  <p className="text-lg font-bold text-emerald-600">{sesion.fecha_hora_fin_real ? new Date(sesion.fecha_hora_fin_real).toLocaleString() : "En curso"}</p>
                </div>
              </>
            )}
            {sesion.duracion_segundos && (
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Duración Total</p>
                <p className="text-2xl font-bold text-indigo-600">{fmtDur(sesion.duracion_segundos)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Calidad y Métricas */}
        {(sesion.calidad_conexion || sesion.dispositivo_paciente || sesion.evaluacion_paciente) && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Métricas de Calidad
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {sesion.calidad_conexion && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Calidad de Conexión</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${getQualityColor(sesion.calidad_conexion)}`}>
                    <Wifi className="w-4 h-4" />
                    {sesion.calidad_conexion.charAt(0).toUpperCase() + sesion.calidad_conexion.slice(1)}
                  </div>
                </div>
              )}
              {sesion.dispositivo_paciente && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Dispositivo</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Monitor className="w-4 h-4" />
                    <span className="font-medium">{sesion.dispositivo_paciente}</span>
                  </div>
                </div>
              )}
              {sesion.evaluacion_paciente && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Evaluación</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < sesion.evaluacion_paciente! ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accesos y Enlaces */}
        {(sesion.url_sesion || sesion.token_acceso || sesion.url_grabacion) && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              Enlaces y Accesos
            </h4>
            <div className="space-y-3">
              {sesion.url_sesion && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">URL de Sesión</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={sesion.url_sesion}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(sesion.url_sesion!)}
                      className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openNewTab(sesion.url_sesion!)}
                      className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {sesion.token_acceso && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Token de Acceso</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={sesion.token_acceso}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(sesion.token_acceso!)}
                      className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {sesion.url_grabacion && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Grabación</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={sesion.url_grabacion}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-mono"
                    />
                    <button
                      onClick={() => openNewTab(sesion.url_grabacion!)}
                      className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}

function InfoBoxPremium({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function ModalStats({ theme, stats, onClose }: { theme: Theme; stats: Stats; onClose: () => void }) {
  return (
    <ModalBase title="📊 Estadísticas Avanzadas" theme={theme} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Resumen General */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Total Sesiones" value={stats.total} icon={<FileText />} color="blue" />
          <StatCard label="Tasa de Éxito" value={`${formatPercent(stats.tasa_completitud)}`} icon={<TrendingUp />} color="emerald" />
          <StatCard label="Duración Promedio" value={fmtDur(stats.duracion_promedio)} icon={<Clock />} color="indigo" />
          <StatCard label="Satisfacción" value={`${stats.satisfaccion_promedio.toFixed(1)}/5`} icon={<Star />} color="amber" />
        </div>

        {/* Gráfico de Estados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribución por Estado</h3>
          <div className="space-y-3">
            <ProgressBar label="Programadas" value={stats.programadas} total={stats.total} color="blue" />
            <ProgressBar label="En Espera" value={stats.en_espera} total={stats.total} color="indigo" />
            <ProgressBar label="En Curso" value={stats.en_curso} total={stats.total} color="amber" />
            <ProgressBar label="Finalizadas" value={stats.finalizadas} total={stats.total} color="emerald" />
            <ProgressBar label="Canceladas" value={stats.canceladas} total={stats.total} color="gray" />
            <ProgressBar label="Incidencias" value={stats.no_asistio + stats.problema_tecnico} total={stats.total} color="red" />
          </div>
        </div>

        {/* Métricas de Rendimiento */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-blue-600 text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sesiones Hoy</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.sesiones_hoy}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-emerald-600 text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Esta Semana</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.sesiones_semana}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-purple-600 text-white">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Crecimiento</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.crecimiento_semanal >= 0 ? '+' : ''}{formatPercent(stats.crecimiento_semanal)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600"
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    gray: "bg-gray-500",
    red: "bg-red-500"
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ModalExport({ theme, onClose, onExport }: { theme: Theme; onClose: () => void; onExport: (format: ExportFormat) => void }) {
  return (
    <ModalBase title="📥 Exportar Datos" theme={theme} onClose={onClose} size="default">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Selecciona el formato de exportación:</p>
        <div className="grid grid-cols-2 gap-4">
          <ExportOption
            icon={<FileSpreadsheet />}
            label="CSV"
            description="Compatible con Excel"
            onClick={() => onExport('csv')}
            color="green"
          />
          <ExportOption
            icon={<FileSpreadsheet />}
            label="Excel"
            description="Formato XLSX"
            onClick={() => onExport('excel')}
            color="emerald"
          />
          <ExportOption
            icon={<FileText />}
            label="PDF"
            description="Documento portátil"
            onClick={() => onExport('pdf')}
            color="red"
          />
          <ExportOption
            icon={<FilePlus />}
            label="JSON"
            description="Datos estructurados"
            onClick={() => onExport('json')}
            color="purple"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold text-gray-700 dark:text-gray-300"
        >
          Cancelar
        </button>
      </div>
    </ModalBase>
  );
}

function ExportOption({ icon, label, description, onClick, color }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  const colorClasses = {
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    emerald: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
  };
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white hover:shadow-xl transition-all group`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
          <div className="w-8 h-8">{icon}</div>
        </div>
        <div>
          <p className="font-bold text-lg">{label}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </button>
  );
}

function ModalConfiguracion({ theme, onClose, onSave }: {
  theme: Theme;
  onClose: () => void;
  onSave: (config: any) => void;
}) {
  const [config, setConfig] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    defaultPageSize: 20,
    showNotifications: true,
    soundAlerts: false,
    emailNotifications: true,
    defaultView: 'table',
    compactMode: false,
    showStats: true,
    language: 'es',
  });

  return (
    <ModalBase title="⚙️ Configuración del Sistema" theme={theme} onClose={onClose} size="large">
      <div className="space-y-6">
        {/* Visualización */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Visualización
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">
                Vista predeterminada
              </label>
              <select
                value={config.defaultView}
                onChange={(e) => setConfig({ ...config, defaultView: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="table">Tabla</option>
                <option value="cards">Tarjetas</option>
                <option value="calendar">Calendario</option>
                <option value="timeline">Línea de tiempo</option>
                <option value="kanban">Kanban</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">
                Registros por página
              </label>
              <select
                value={config.defaultPageSize}
                onChange={(e) => setConfig({ ...config, defaultPageSize: Number(e.target.value) })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.compactMode}
                onChange={(e) => setConfig({ ...config, compactMode: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Modo compacto
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.showStats}
                onChange={(e) => setConfig({ ...config, showStats: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mostrar estadísticas
              </label>
            </div>
          </div>
        </div>

        {/* Actualización automática */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            Actualización Automática
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.autoRefresh}
                onChange={(e) => setConfig({ ...config, autoRefresh: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Activar actualización automática
              </label>
            </div>
            {config.autoRefresh && (
              <div>
                <label className="text-sm font-semibold block mb-2 text-gray-700 dark:text-gray-300">
                  Intervalo (segundos): {config.refreshInterval}
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={config.refreshInterval}
                  onChange={(e) => setConfig({ ...config, refreshInterval: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notificaciones
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.showNotifications}
                onChange={(e) => setConfig({ ...config, showNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-purple-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mostrar notificaciones en pantalla
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.soundAlerts}
                onChange={(e) => setConfig({ ...config, soundAlerts: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-purple-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Alertas sonoras
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.emailNotifications}
                onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-purple-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificaciones por email
              </label>
            </div>
          </div>
        </div>

        {/* Idioma */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-600" />
            Idioma
          </h3>
          <select
            value={config.language}
            onChange={(e) => setConfig({ ...config, language: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold text-gray-700 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(config)}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          Guardar Configuración
        </button>
      </div>
    </ModalBase>
  );
}

function NotificationsPanel({ notifications, onClose, theme }: {
  notifications: Array<{ id: number; type: string; message: string; time: string }>;
  onClose: () => void;
  theme: Theme;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notificaciones</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notifications.length} nuevas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                  {notif.type === 'success' && <Check className="w-4 h-4" />}
                  {notif.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                  {notif.type === 'info' && <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold">
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalBase({ title, children, onClose, theme, size = "default" }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  theme: Theme;
  size?: "default" | "large" | "xl";
}) {
  const sizeClasses = { default: "max-w-3xl", large: "max-w-5xl", xl: "max-w-7xl" }[size]!;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-800 w-full ${sizeClasses} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}