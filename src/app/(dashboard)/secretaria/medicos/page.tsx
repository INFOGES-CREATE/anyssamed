"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  Star,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";

// ========================================
// TIPOS
// ========================================

type EstadoProfesional = "activo" | "inactivo" | "suspendido" | "vacaciones";

interface CentroInfo {
  id_centro: number;
  nombre: string;
  ciudad?: string | null;
  region?: string | null;
}

interface SucursalInfo {
  id_sucursal: number | null;
  nombre: string | null;
}

interface Medico {
  id_profesional: number;
  id_usuario: number;
  nombre_completo: string;
  tipo_profesional: string;
  especialidad_principal: string | null;

  centro: CentroInfo;
  sucursal?: SucursalInfo | null;

  foto_url?: string | null;
  telefono?: string | null;
  email?: string | null;

  atiende_fonasa: boolean;
  atiende_isapre: boolean;
  acepta_nuevos_pacientes: boolean;
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;

  calificacion_promedio: number;
  numero_opiniones: number;
  badge_destacado: boolean;
  score_profesional: number;

  estado: EstadoProfesional;

  idiomas?: string[]; // derivado de JSON si lo quieres
  proxima_cita?: string | null;
  pacientes_en_espera?: number;
}

interface ApiMedicosResponse {
  success: boolean;
  medicos: Medico[];
}

// ========================================
// MENÚ LATERAL (MISMO ESTILO SECRETARIA)
// ========================================

interface MenuItem {
  titulo: string;
  icono: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  url: string;
}

const menuItems: MenuItem[] = [
  { titulo: "Dashboard", icono: Activity, url: "/secretaria" },
  { titulo: "Agenda", icono: Activity, url: "/secretaria/agenda" },
  { titulo: "Confirmaciones", icono: CheckCircle2, url: "/secretaria/confirmaciones" },
  { titulo: "Llamadas", icono: Phone, url: "/secretaria/llamadas" },
  { titulo: "Pacientes", icono: Users, url: "/secretaria/pacientes" },
  { titulo: "Médicos", icono: Stethoscope, url: "/secretaria/medicos" },
  { titulo: "Recordatorios", icono: Activity, url: "/secretaria/recordatorios" },
  { titulo: "Documentos", icono: Activity, url: "/secretaria/documentos" },
  // aquí puedes sumar más módulos si ya los tienes
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function SecretariaMedicosPage() {
  const pathname = usePathname();

  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");
  const [filtroModalidad, setFiltroModalidad] = useState<string>("todos");
  const [soloNuevosPacientes, setSoloNuevosPacientes] = useState<boolean>(false);

  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Medico | null>(
    null
  );

  // ============================
  // CARGA DE DATOS REALES
  // ============================

  async function cargarMedicos() {
    try {
      setCargando(true);
      setError(null);

      const res = await fetch("/api/secretaria/medicos", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const data: ApiMedicosResponse = await res.json();

      if (!data.success) {
        throw new Error("La API devolvió success = false");
      }

      setMedicos(data.medicos || []);
    } catch (err: any) {
      console.error("Error al cargar médicos:", err);
      setError(
        err?.message || "No se pudieron cargar los médicos. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMedicos();
  }, []);

  // ============================
  // DERIVADOS / ESTADÍSTICAS
  // ============================

  const estadisticas = useMemo(() => {
    const total = medicos.length;

    const activos = medicos.filter((m) => m.estado === "activo").length;
    const telemedicina = medicos.filter((m) => m.consulta_telemedicina).length;
    const presenciales = medicos.filter((m) => m.consulta_presencial).length;
    const aceptanNuevos = medicos.filter((m) => m.acepta_nuevos_pacientes).length;

    const fonasa = medicos.filter((m) => m.atiende_fonasa).length;
    const isapre = medicos.filter((m) => m.atiende_isapre).length;

    const promedioScore =
      medicos.length > 0
        ? medicos.reduce((acc, m) => acc + (m.score_profesional || 0), 0) /
          medicos.length
        : 0;

    return {
      total,
      activos,
      telemedicina,
      presenciales,
      aceptanNuevos,
      fonasa,
      isapre,
      promedioScore: Math.round(promedioScore * 10) / 10,
    };
  }, [medicos]);

  const especialidadesDisponibles = useMemo(() => {
    const set = new Set<string>();
    medicos.forEach((m) => {
      if (m.especialidad_principal) {
        set.add(m.especialidad_principal);
      }
    });
    return Array.from(set).sort();
  }, [medicos]);

  const tiposProfesionalDisponibles = useMemo(() => {
    const set = new Set<string>();
    medicos.forEach((m) => set.add(m.tipo_profesional));
    return Array.from(set).sort();
  }, [medicos]);

  const medicosFiltrados = useMemo(() => {
    return medicos
      .filter((m) => {
        // Estado
        if (filtroEstado === "activos" && m.estado !== "activo") return false;
        if (filtroEstado === "todos") {
          // no filtra
        }

        // Especialidad
        if (
          filtroEspecialidad !== "todos" &&
          m.especialidad_principal !== filtroEspecialidad
        ) {
          return false;
        }

        // Tipo profesional
        if (filtroTipo !== "todos" && m.tipo_profesional !== filtroTipo) {
          return false;
        }

        // Modalidad
        if (filtroModalidad === "presencial" && !m.consulta_presencial) {
          return false;
        }
        if (filtroModalidad === "telemedicina" && !m.consulta_telemedicina) {
          return false;
        }

        // Solo acepta nuevos pacientes
        if (soloNuevosPacientes && !m.acepta_nuevos_pacientes) {
          return false;
        }

        // Búsqueda general
        if (busqueda.trim().length > 0) {
          const term = busqueda.toLowerCase();
          const nombre = m.nombre_completo.toLowerCase();
          const especialidad = (m.especialidad_principal || "").toLowerCase();
          const centro = (m.centro?.nombre || "").toLowerCase();
          const sucursal = (m.sucursal?.nombre || "").toLowerCase();

          if (
            !nombre.includes(term) &&
            !especialidad.includes(term) &&
            !centro.includes(term) &&
            !sucursal.includes(term)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Orden: destacados primero, luego score, luego nombre
        if (a.badge_destacado && !b.badge_destacado) return -1;
        if (!a.badge_destacado && b.badge_destacado) return 1;

        if (b.score_profesional !== a.score_profesional) {
          return b.score_profesional - a.score_profesional;
        }

        return a.nombre_completo.localeCompare(b.nombre_completo);
      });
  }, [
    medicos,
    filtroEstado,
    filtroEspecialidad,
    filtroTipo,
    filtroModalidad,
    soloNuevosPacientes,
    busqueda,
  ]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 border-r border-slate-800 bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/80 backdrop-blur-xl">
        <div className="flex flex-col w-full h-full">
          <div className="px-6 pt-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/80">
                  Secretaria · INFOGES
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  Módulo Médicos
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icono;
              const activo = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activo
                      ? "bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 text-slate-950 shadow-lg shadow-emerald-500/40"
                      : "text-slate-300/85 hover:bg-slate-800/70 hover:text-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      activo ? "text-slate-950" : "text-emerald-300/90"
                    }`}
                  />
                  <span className="flex-1 truncate">{item.titulo}</span>
                  {activo ? (
                    <ChevronRight className="w-4 h-4 opacity-80" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-slate-800 text-[11px] text-slate-400/80">
            <p>INFOGES Curicó · Medisuite-Pro</p>
            <p className="text-[10px] text-slate-500/80">
              Panel optimizado para secretarias.
            </p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        {/* HEADER SUPERIOR */}
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Secretaría</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-emerald-300">Médicos</span>
              </div>
              <h1 className="mt-1 text-lg sm:text-xl font-semibold text-slate-50 flex items-center gap-2">
                Gestión de Médicos y Profesionales
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Vista premium en tiempo real
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cargarMedicos}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-100 hover:border-emerald-500/60 hover:bg-slate-900 transition-all"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Actualizar
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-4 sm:px-6 pt-4 space-y-4 sm:space-y-6">
            {/* ESTADO DE CARGA / ERROR */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-3.5 py-3 text-xs sm:text-sm text-red-50">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Error al cargar médicos</p>
                  <p className="text-red-100/90">{error}</p>
                  <button
                    onClick={cargarMedicos}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-400/60 bg-red-500/20 px-2 py-1 text-[11px] font-medium text-red-50 hover:bg-red-500/30"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* TARJETAS RESUMEN */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950/90 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Total Profesionales
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-50">
                      {estadisticas.total}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {estadisticas.activos} activos en este centro
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <Stethoscope className="w-5 h-5 text-slate-950" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-emerald-700/60 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-slate-950/90 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/90">
                      Modalidad
                    </p>
                    <p className="mt-1 text-xl font-semibold text-emerald-50">
                      {estadisticas.telemedicina} en telemedicina
                    </p>
                    <p className="mt-0.5 text-[11px] text-emerald-100/80">
                      {estadisticas.presenciales} con consulta presencial
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/90 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <Video className="w-5 h-5 text-slate-950" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-700/60 bg-gradient-to-br from-cyan-600/15 via-cyan-500/10 to-slate-950/90 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/90">
                      Previsión
                    </p>
                    <p className="mt-1 text-xl font-semibold text-cyan-50">
                      FONASA {estadisticas.fonasa}
                    </p>
                    <p className="mt-0.5 text-[11px] text-cyan-100/80">
                      ISAPRE {estadisticas.isapre}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/90 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <Globe className="w-5 h-5 text-slate-950" />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-amber-700/60 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-slate-950/90 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-amber-100/90">
                      Calidad percibida
                    </p>
                    <p className="mt-1 text-xl font-semibold text-amber-50 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {estadisticas.promedioScore.toFixed(1)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-100/80">
                      {estadisticas.aceptanNuevos} aceptan nuevos pacientes
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-400/90 flex items-center justify-center shadow-lg shadow-amber-400/50">
                    <Star className="w-5 h-5 text-slate-950" />
                  </div>
                </div>
              </div>
            </section>

            {/* FILTROS Y BUSCADOR */}
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3.5 py-3.5 sm:px-4 sm:py-4">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, especialidad o centro..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 pl-9 text-xs sm:text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90">
                    <Filter className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-slate-200 hidden sm:inline">
                      Filtros:
                    </span>
                    <span className="text-slate-400">
                      {medicosFiltrados.length}/{medicos.length}
                    </span>
                  </div>

                  <select
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-[11px] text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="todos">Todas las especialidades</option>
                    {especialidadesDisponibles.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-[11px] text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="todos">Todos los tipos</option>
                    {tiposProfesionalDisponibles.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-[11px] text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="activos">Sólo activos</option>
                    <option value="todos">Todos los estados</option>
                  </select>

                  <select
                    value={filtroModalidad}
                    onChange={(e) => setFiltroModalidad(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-[11px] text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="todos">Todas las modalidades</option>
                    <option value="presencial">Presencial</option>
                    <option value="telemedicina">Telemedicina</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setSoloNuevosPacientes((prev) => !prev)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 ${
                      soloNuevosPacientes
                        ? "border-emerald-500/80 bg-emerald-500/15 text-emerald-100"
                        : "border-slate-700 bg-slate-900/90 text-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Nuevos pacientes
                  </button>
                </div>
              </div>
            </section>

            {/* LISTADO DE MÉDICOS */}
            <section className="grid grid-cols-1 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-4 sm:gap-5">
              {/* LISTA */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-medium text-slate-200">
                      Profesionales encontrados
                    </p>
                    <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">
                      {medicosFiltrados.length} resultado
                      {medicosFiltrados.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                {cargando && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando médicos en tiempo real...
                    </div>
                  </div>
                )}

                {!cargando && medicosFiltrados.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">
                    No se encontraron médicos con los filtros actuales.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
                  {medicosFiltrados.map((medico) => {
                    const seleccionado =
                      medicoSeleccionado?.id_profesional ===
                      medico.id_profesional;

                    const estadoColor =
                      medico.estado === "activo"
                        ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/40"
                        : medico.estado === "suspendido"
                        ? "bg-amber-500/15 text-amber-200 border-amber-500/40"
                        : "bg-slate-700/30 text-slate-200 border-slate-600/60";

                    return (
                      <button
                        key={medico.id_profesional}
                        type="button"
                        onClick={() => setMedicoSeleccionado(medico)}
                        className={`group flex flex-col items-stretch rounded-2xl border bg-slate-900/80 p-3 text-left transition-all ${
                          seleccionado
                            ? "border-emerald-500/70 shadow-lg shadow-emerald-500/30"
                            : "border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-11 w-11 shrink-0">
                            {medico.foto_url ? (
                              <Image
                                src={medico.foto_url}
                                alt={medico.nombre_completo}
                                fill
                                className="rounded-2xl object-cover border border-slate-700"
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-semibold text-slate-950 border border-emerald-400/70">
                                {medico.nombre_completo
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((p) => p[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                            {medico.badge_destacado && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-400/95 flex items-center justify-center shadow-md shadow-amber-400/60">
                                <Star className="w-2.5 h-2.5 text-slate-950" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-50 truncate">
                                  {medico.nombre_completo}
                                </p>
                                <p className="text-[11px] text-emerald-200/90 truncate">
                                  {medico.especialidad_principal ||
                                    "Sin especialidad principal"}
                                </p>
                              </div>

                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${estadoColor}`}
                              >
                                {medico.estado}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
                                <Stethoscope className="w-3 h-3 text-emerald-300" />
                                {medico.tipo_profesional}
                              </span>

                              {medico.consulta_presencial && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
                                  <MapPin className="w-3 h-3 text-cyan-300" />
                                  Presencial
                                </span>
                              )}

                              {medico.consulta_telemedicina && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
                                  <Video className="w-3 h-3 text-emerald-300" />
                                  Telemedicina
                                </span>
                              )}

                              {medico.atiende_fonasa && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-emerald-200">
                                  FONASA
                                </span>
                              )}

                              {medico.atiende_isapre && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-cyan-200">
                                  ISAPRE
                                </span>
                              )}

                              {medico.acepta_nuevos_pacientes && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-100 border border-emerald-500/40">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Nuevos pacientes
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span>
                                  {medico.calificacion_promedio?.toFixed(1) ||
                                    "0.0"}
                                </span>
                                <span className="text-slate-500">
                                  ({medico.numero_opiniones || 0})
                                </span>
                              </div>

                              {medico.centro && (
                                <p className="text-[10px] text-slate-400 text-right truncate">
                                  {medico.centro.nombre}
                                  {medico.sucursal?.nombre
                                    ? ` · ${medico.sucursal.nombre}`
                                    : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PANEL DETALLE */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 sm:p-4">
                {!medicoSeleccionado ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 text-sm text-slate-400">
                    <div className="mb-3 h-10 w-10 rounded-2xl bg-slate-900/90 flex items-center justify-center border border-slate-700">
                      <Stethoscope className="w-5 h-5 text-emerald-300" />
                    </div>
                    <p className="font-medium text-slate-100">
                      Selecciona un médico para ver más detalles
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Aquí verás datos de contacto, modalidades, previsión y
                      métricas clave para agendar más rápido.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative h-12 w-12 shrink-0">
                        {medicoSeleccionado.foto_url ? (
                          <Image
                            src={medicoSeleccionado.foto_url}
                            alt={medicoSeleccionado.nombre_completo}
                            fill
                            className="rounded-2xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-semibold text-slate-950 border border-emerald-400/70">
                            {medicoSeleccionado.nombre_completo
                              .split(" ")
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm sm:text-base font-semibold text-slate-50">
                              {medicoSeleccionado.nombre_completo}
                            </p>
                            <p className="text-[11px] text-emerald-200/90">
                              {medicoSeleccionado.especialidad_principal ||
                                "Sin especialidad registrada"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {medicoSeleccionado.tipo_profesional}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                              medicoSeleccionado.estado === "activo"
                                ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/40"
                                : "bg-slate-800/60 text-slate-200 border-slate-600/60"
                            }`}
                          >
                            {medicoSeleccionado.estado}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>
                            {medicoSeleccionado.calificacion_promedio?.toFixed(
                              1
                            ) || "0.0"}
                          </span>
                          <span className="text-slate-500">
                            ({medicoSeleccionado.numero_opiniones || 0} valoraciones)
                          </span>
                          <span className="text-slate-500">·</span>
                          <span>Score IA: {medicoSeleccionado.score_profesional}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                          Centro / Sucursal
                        </p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-300 mt-0.5" />
                          <div>
                            <p className="text-slate-100">
                              {medicoSeleccionado.centro?.nombre}
                            </p>
                            <p className="text-slate-400">
                              {medicoSeleccionado.sucursal?.nombre
                                ? medicoSeleccionado.sucursal.nombre
                                : "Sin sucursal específica"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                          Modalidad de atención
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {medicoSeleccionado.consulta_presencial && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
                              <MapPin className="w-3 h-3 text-cyan-300" />
                              Presencial
                            </span>
                          )}
                          {medicoSeleccionado.consulta_telemedicina && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
                              <Video className="w-3 h-3 text-emerald-300" />
                              Telemedicina
                            </span>
                          )}
                          {medicoSeleccionado.acepta_nuevos_pacientes && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-100 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              Acepta nuevos
                            </span>
                          )}
                          {(medicoSeleccionado.atiende_fonasa ||
                            medicoSeleccionado.atiende_isapre) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-200">
                              Fonasa/Isapre
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                        Contacto rápido
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {medicoSeleccionado.telefono && (
                          <a
                            href={`tel:${medicoSeleccionado.telefono}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Llamar
                          </a>
                        )}
                        {medicoSeleccionado.telefono && (
                          <a
                            href={`https://wa.me/${medicoSeleccionado.telefono?.replace(
                              /[^0-9]/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-slate-900 px-2.5 py-1.5 text-[11px] text-emerald-100 hover:border-emerald-400"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
                        {medicoSeleccionado.email && (
                          <a
                            href={`mailto:${medicoSeleccionado.email}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] text-slate-100 hover:border-emerald-400"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Email
                          </a>
                        )}
                      </div>
                    </div>

                    {typeof medicoSeleccionado.pacientes_en_espera ===
                      "number" ||
                    medicoSeleccionado.proxima_cita ? (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-[11px] sm:text-xs">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                          Flujo de agenda
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {typeof medicoSeleccionado.pacientes_en_espera ===
                            "number" && (
                            <p className="text-slate-200">
                              Pacientes en espera:{" "}
                              <span className="font-semibold">
                                {medicoSeleccionado.pacientes_en_espera}
                              </span>
                            </p>
                          )}
                          {medicoSeleccionado.proxima_cita && (
                            <p className="text-slate-200">
                              Próxima cita:{" "}
                              <span className="font-semibold">
                                {medicoSeleccionado.proxima_cita}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
