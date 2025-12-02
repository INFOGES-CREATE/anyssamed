// src/app/(dashboard)/tecnico/equipos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarTecnico from "@/components/tecnico/SidebarTecnico";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  BarChart3,
  Bell,
  BellOff,
  Building2,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Cpu,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  HardDrive,
  Home,
  Lightbulb,
  LineChart,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  PieChart,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Target,
  User,
  Wrench,
  X,
  AlertTriangleIcon,
} from "lucide-react";

// ================================
// TIPOS
// ================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";

interface ConfiguracionTema {
  nombre: string;
  icono: any;
  colores: {
    fondo: string;
    fondoSecundario: string;
    texto: string;
    textoSecundario: string;
    primario: string;
    secundario: string;
    acento: string;
    borde: string;
    sombra: string;
    gradiente: string;
    sidebar: string;
    header: string;
    card: string;
    hover: string;
  };
}

interface UsuarioSesion {
  id_usuario: number;
  username: string;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  foto_perfil_url: string | null;
  rol: {
    id_rol: number;
    nombre: string;
    nivel_jerarquia: number;
  };
  tecnico?: {
    id_tecnico: number;
    id_centro: number;
    id_sucursal: number | null;
    id_departamento: number | null;
    area_tecnica: string;
    tipo_tecnico: "soporte" | "mantenimiento" | "ingenieria" | "biomedico";
    extension_telefonica: string | null;
    estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
    disponibilidad: "disponible" | "ocupado" | "fuera_servicio";
    turno: "matutino" | "vespertino" | "nocturno" | "rotativo";
    nivel_acceso: "basico" | "intermedio" | "avanzado" | "administrador";
    pais: string;
    region: string;
    zona_horaria: string;
    centro: {
      id_centro: number;
      nombre: string;
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
    es_global: boolean;
  };
}

type EstadoEquipo =
  | "operativo"
  | "en_mantenimiento"
  | "fuera_servicio"
  | "critico";

type CriticidadEquipo = "baja" | "media" | "alta" | "critica";

interface EquipoTecnico {
  id_equipo: number;
  codigo_interno: string;
  nombre: string;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  centro: string;
  sucursal: string | null;
  ubicacion: string;
  estado: EstadoEquipo;
  criticidad: CriticidadEquipo;
  ultima_mantencion: string | null;
  proxima_mantencion: string | null;
  responsable: string;
  telefono_responsable: string | null;
  riesgo_clinico: "bajo" | "medio" | "alto" | "critico";
  horas_uso_diario_promedio: number;
  tickets_abiertos: number;
}

interface ApiEquiposResponse {
  success: boolean;
  equipos?: EquipoTecnico[];
  error?: string;
}

interface EstadisticasTecnico {
  tickets_asignados_hoy: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos_hoy: number;
  tickets_pendientes_confirmacion: number;
  tiempo_promedio_resolucion: number;
  mensajes_sin_leer: number;
  calificacion_promedio: number;
  disponibilidad_porcentaje: number;
  llamadas_realizadas_hoy: number;
  equipos_mantenidos_semana: number;
  tareas_pendientes: number;
  alertas_activas: number;
}


// ================================
// TEMAS
// ================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
    icono: Sun,
    colores: {
      fondo: "from-slate-50 via-blue-50 to-indigo-50",
      fondoSecundario: "bg-white",
      texto: "text-gray-900",
      textoSecundario: "text-gray-600",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-200 hover:bg-gray-300",
      acento: "text-indigo-600",
      borde: "border-gray-200",
      sombra: "shadow-xl shadow-indigo-100/50",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-white/95 backdrop-blur-xl border-gray-200",
      header: "bg-white/80 backdrop-blur-xl border-gray-200",
      card: "bg-white border-gray-200 hover:border-indigo-300",
      hover: "hover:bg-gray-50",
    },
  },
  dark: {
    nombre: "Oscuro",
    icono: Moon,
    colores: {
      fondo: "from-slate-950 via-indigo-950 to-purple-950",
      fondoSecundario: "bg-gray-900",
      texto: "text-white",
      textoSecundario: "text-gray-400",
      primario: "bg-indigo-600 hover:bg-indigo-700",
      secundario: "bg-gray-800 hover:bg-gray-700",
      acento: "text-indigo-400",
      borde: "border-gray-800",
      sombra: "shadow-2xl shadow-indigo-500/20",
      gradiente: "from-indigo-500 via-purple-500 to-pink-500",
      sidebar: "bg-gray-900/95 backdrop-blur-xl border-gray-800",
      header: "bg-gray-900/80 backdrop-blur-xl border-gray-800",
      card: "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
      hover: "hover:bg-gray-800",
    },
  },
  blue: {
    nombre: "Azul Técnico",
    icono: Cpu,
    colores: {
      fondo: "from-blue-950 via-cyan-950 to-teal-950",
      fondoSecundario: "bg-blue-900",
      texto: "text-white",
      textoSecundario: "text-cyan-300",
      primario: "bg-cyan-600 hover:bg-cyan-700",
      secundario: "bg-blue-800 hover:bg-blue-700",
      acento: "text-cyan-400",
      borde: "border-cyan-800",
      sombra: "shadow-2xl shadow-cyan-500/20",
      gradiente: "from-cyan-500 via-blue-500 to-indigo-500",
      sidebar: "bg-blue-900/95 backdrop-blur-xl border-cyan-800",
      header: "bg-blue-900/80 backdrop-blur-xl border-cyan-800",
      card: "bg-blue-800/50 border-cyan-700 hover:border-cyan-500/50",
      hover: "hover:bg-blue-800",
    },
  },
  purple: {
    nombre: "Púrpura Industrial",
    icono: Sparkles,
    colores: {
      fondo: "from-purple-950 via-fuchsia-950 to-pink-950",
      fondoSecundario: "bg-purple-900",
      texto: "text-white",
      textoSecundario: "text-purple-300",
      primario: "bg-fuchsia-600 hover:bg-fuchsia-700",
      secundario: "bg-purple-800 hover:bg-purple-700",
      acento: "text-fuchsia-400",
      borde: "border-purple-800",
      sombra: "shadow-2xl shadow-fuchsia-500/20",
      gradiente: "from-fuchsia-500 via-purple-500 to-pink-500",
      sidebar: "bg-purple-900/95 backdrop-blur-xl border-purple-800",
      header: "bg-purple-900/80 backdrop-blur-xl border-purple-800",
      card: "bg-purple-800/50 border-purple-700 hover:border-fuchsia-500/50",
      hover: "hover:bg-purple-800",
    },
  },
  green: {
    nombre: "Verde Operacional",
    icono: AlertTriangle,
    colores: {
      fondo: "from-emerald-950 via-teal-950 to-cyan-950",
      fondoSecundario: "bg-emerald-900",
      texto: "text-white",
      textoSecundario: "text-emerald-300",
      primario: "bg-emerald-600 hover:bg-emerald-700",
      secundario: "bg-teal-800 hover:bg-teal-700",
      acento: "text-emerald-400",
      borde: "border-emerald-800",
      sombra: "shadow-2xl shadow-emerald-500/20",
      gradiente: "from-emerald-500 via-teal-500 to-cyan-500",
      sidebar: "bg-emerald-900/95 backdrop-blur-xl border-emerald-800",
      header: "bg-emerald-900/80 backdrop-blur-xl border-emerald-800",
      card: "bg-emerald-800/50 border-emerald-700 hover:border-emerald-500/50",
      hover: "hover:bg-emerald-800",
    },
  },
};

// ================================
// DATOS DE EJEMPLO (FALLBACK)
// ================================

const EQUIPOS_EJEMPLO: EquipoTecnico[] = [
  {
    id_equipo: 1,
    codigo_interno: "EQ-CT-001",
    nombre: "Monitor Multiparámetro",
    tipo_equipo: "Monitor biomédico",
    marca: "Philips",
    modelo: "IntelliVue MX450",
    numero_serie: "SN-123456",
    centro: "CESFAM COLÓN",
    sucursal: "BOX 01",
    ubicacion: "Urgencias - Box 1",
    estado: "operativo",
    criticidad: "alta",
    ultima_mantencion: "2025-10-01",
    proxima_mantencion: "2026-01-10",
    responsable: "Téc. Biomédico Juan Pérez",
    telefono_responsable: "+56 9 1234 5678",
    riesgo_clinico: "alto",
    horas_uso_diario_promedio: 18,
    tickets_abiertos: 1,
  },
  {
    id_equipo: 2,
    codigo_interno: "EQ-CT-002",
    nombre: "Electrocardiógrafo",
    tipo_equipo: "Diagnóstico",
    marca: "GE",
    modelo: "MAC 2000",
    numero_serie: "SN-654321",
    centro: "CESFAM CURICÓ CENTRO",
    sucursal: "BOX 02",
    ubicacion: "Consulta Médica - Box 2",
    estado: "en_mantenimiento",
    criticidad: "alta",
    ultima_mantencion: "2025-09-15",
    proxima_mantencion: "2025-12-01",
    responsable: "Téc. Soporte Ana López",
    telefono_responsable: "+56 9 9876 5432",
    riesgo_clinico: "medio",
    horas_uso_diario_promedio: 10,
    tickets_abiertos: 2,
  },
  {
    id_equipo: 3,
    codigo_interno: "EQ-CT-003",
    nombre: "Servidor de Aplicaciones",
    tipo_equipo: "Servidor",
    marca: "Dell",
    modelo: "PowerEdge R740",
    numero_serie: "SRV-998877",
    centro: "CURICÓ TOTAL COMUNAL",
    sucursal: null,
    ubicacion: "Sala de Servidores",
    estado: "operativo",
    criticidad: "critica",
    ultima_mantencion: "2025-08-20",
    proxima_mantencion: "2025-12-20",
    responsable: "Téc. Infraestructura Pedro Díaz",
    telefono_responsable: "+56 9 2222 3333",
    riesgo_clinico: "critico",
    horas_uso_diario_promedio: 24,
    tickets_abiertos: 0,
  },
  {
    id_equipo: 4,
    codigo_interno: "EQ-CT-004",
    nombre: "Impresora de Etiquetas",
    tipo_equipo: "Impresora",
    marca: "Zebra",
    modelo: "ZD420",
    numero_serie: "PRN-111222",
    centro: "CESFAM BETTY MUÑOZ",
    sucursal: "Recepción",
    ubicacion: "Admisión",
    estado: "fuera_servicio",
    criticidad: "media",
    ultima_mantencion: "2025-05-10",
    proxima_mantencion: "2025-11-10",
    responsable: "Téc. Soporte Carlos Ruiz",
    telefono_responsable: "+56 9 4444 5555",
    riesgo_clinico: "bajo",
    horas_uso_diario_promedio: 6,
    tickets_abiertos: 3,
  },
];

// ================================
// COMPONENTE PRINCIPAL
// ================================

export default function EquiposTecnicoPage() {
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loadingSesion, setLoadingSesion] = useState(true);
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [errorEquipos, setErrorEquipos] = useState<string | null>(null);
  

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    "disponible" | "ocupado" | "fuera_servicio"
  >("disponible");

  const [equipos, setEquipos] = useState<EquipoTecnico[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCentro, setFiltroCentro] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<EstadoEquipo | "todos">(
    "todos"
  );
  const [filtroCriticidad, setFiltroCriticidad] = useState<
    CriticidadEquipo | "todos"
  >("todos");
  const [soloCriticos, setSoloCriticos] = useState(false);

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<EquipoTecnico | null>(null);

  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnico | null>(null);
    


  // ================================
  // MENÚ LATERAL
  // ================================

 
  // ================================
  // EFECTOS: TEMA Y BODY
  // ================================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const temaGuardado = localStorage.getItem("tema_tecnico") as TemaColor | null;
      if (temaGuardado && TEMAS[temaGuardado]) {
        setTemaActual(temaGuardado);
      }
    }
  }, []);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

  // ================================
  // EFECTO: CARGAR SESIÓN
  // ================================

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoadingSesion(true);
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("No hay sesión activa");
        }

        const data = await res.json();
        if (!data.success || !data.usuario) {
          throw new Error("Sesión inválida");
        }

        const rolesUsuario: string[] = [];

        if (data.usuario.rol?.nombre) {
          rolesUsuario.push(
            data.usuario.rol.nombre
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const esTecnico = rolesUsuario.some((r) =>
          r.includes("TECNICO")
        );

        if (!esTecnico) {
          alert(
            `Acceso denegado. Módulo exclusivo para TÉCNICOS.\nRoles actuales: ${rolesUsuario.join(
              ", "
            )}`
          );
          window.location.href = "/";
          return;
        }

        if (!data.usuario.tecnico) {
          alert(
            "Tu usuario tiene rol de TÉCNICO pero no está vinculado a un registro de técnico. Contacta al administrador."
          );
          window.location.href = "/";
          return;
        }

        setUsuario(data.usuario);
        setDisponibilidad(data.usuario.tecnico.disponibilidad);
      } catch (err) {
        console.error("Error sesión técnico:", err);
        alert("Error al verificar sesión. Serás redirigido al login.");
        window.location.href = "/login";
      } finally {
        setLoadingSesion(false);
      }
    };

    cargarUsuario();
  }, []);

  // ================================
  // EFECTO: CARGAR EQUIPOS
  // ================================

  const cargarEquipos = async () => {
    try {
      setLoadingEquipos(true);
      setErrorEquipos(null);

      const res = await fetch("/api/tecnico/equipos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      let data: ApiEquiposResponse;
      try {
        data = (await res.json()) as ApiEquiposResponse;
      } catch {
        data = { success: false, error: "Respuesta inválida" };
      }

      if (!res.ok || !data.success || !data.equipos) {
        console.warn("Usando datos de ejemplo de equipos.");
        setEquipos(EQUIPOS_EJEMPLO);
        if (data.error) setErrorEquipos(data.error);
        return;
      }

      setEquipos(data.equipos);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
      setEquipos(EQUIPOS_EJEMPLO);
      setErrorEquipos("No se pudo cargar el inventario real. Mostrando ejemplo.");
    } finally {
      setLoadingEquipos(false);
    }
  };

  useEffect(() => {
    if (usuario?.tecnico?.id_tecnico) {
      cargarEquipos();
    }
  }, [usuario]);

  // ================================
  // CAMBIAR TEMA / DISPONIBILIDAD
  // ================================

  const cambiarTema = async (nuevoTema: TemaColor) => {
    setTemaActual(nuevoTema);
    if (typeof window !== "undefined") {
      localStorage.setItem("tema_tecnico", nuevoTema);
    }

    try {
      await fetch("/api/users/preferencias/tema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tema_color: nuevoTema }),
      });
    } catch (err) {
      console.error("No se pudo guardar el tema en BD:", err);
    }
  };

  const cambiarDisponibilidad = async (
    nuevoEstado: "disponible" | "ocupado" | "fuera_servicio"
  ) => {
    if (!usuario?.tecnico?.id_tecnico) return;

    try {
      const res = await fetch(
        `/api/tecnico/${usuario.tecnico.id_tecnico}/disponibilidad`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ disponibilidad: nuevoEstado }),
        }
      );

      if (!res.ok) {
        alert("No se pudo actualizar la disponibilidad.");
        return;
      }

      setDisponibilidad(nuevoEstado);
    } catch (err) {
      console.error("Error disponibilidad:", err);
      alert("Error al actualizar disponibilidad.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logout:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  // ================================
  // HELPERS
  // ================================

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin registro";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "Sin registro";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const diasHasta = (fecha: string | null) => {
    if (!fecha) return null;
    const hoy = new Date();
    const target = new Date(fecha);
    if (isNaN(target.getTime())) return null;
    const diffMs = target.getTime() - hoy.getTime();
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDias;
  };

  const obtenerBadgeEstado = (estado: EstadoEquipo) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (estado) {
      case "operativo":
        return isDark
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "en_mantenimiento":
        return isDark
          ? "bg-amber-500/15 text-amber-300 border border-amber-500/50"
          : "bg-amber-50 text-amber-700 border border-amber-200";
      case "fuera_servicio":
        return isDark
          ? "bg-slate-500/15 text-slate-300 border border-slate-500/50"
          : "bg-slate-50 text-slate-700 border border-slate-200";
      case "critico":
        return isDark
          ? "bg-rose-500/15 text-rose-300 border border-rose-500/50"
          : "bg-rose-50 text-rose-700 border border-rose-200";
    }
  };

  const obtenerBadgeCriticidad = (criticidad: CriticidadEquipo) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);

    switch (criticidad) {
      case "baja":
        return isDark
          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "media":
        return isDark
          ? "bg-sky-500/10 text-sky-300 border border-sky-500/40"
          : "bg-sky-50 text-sky-700 border border-sky-200";
      case "alta":
        return isDark
          ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
          : "bg-amber-50 text-amber-700 border border-amber-200";
      case "critica":
        return isDark
          ? "bg-red-500/10 text-red-300 border border-red-500/40"
          : "bg-red-50 text-red-700 border border-red-200";
    }
  };

  // ================================
  // FILTROS Y KPIs
  // ================================

  const centrosDisponibles = useMemo(() => {
    const nombres = Array.from(new Set(equipos.map((e) => e.centro))).sort();
    return nombres;
  }, [equipos]);

  const equiposFiltrados = useMemo(() => {
    let lista = [...equipos];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.codigo_interno.toLowerCase().includes(q) ||
          e.tipo_equipo.toLowerCase().includes(q) ||
          e.centro.toLowerCase().includes(q) ||
          (e.sucursal ?? "").toLowerCase().includes(q)
      );
    }

    if (filtroCentro !== "todos") {
      lista = lista.filter((e) => e.centro === filtroCentro);
    }

    if (filtroEstado !== "todos") {
      lista = lista.filter((e) => e.estado === filtroEstado);
    }

    if (filtroCriticidad !== "todos") {
      lista = lista.filter((e) => e.criticidad === filtroCriticidad);
    }

    if (soloCriticos) {
      lista = lista.filter(
        (e) =>
          e.estado === "critico" ||
          e.criticidad === "alta" ||
          e.criticidad === "critica"
      );
    }

    return lista;
  }, [equipos, busqueda, filtroCentro, filtroEstado, filtroCriticidad, soloCriticos]);

  const kpis = useMemo(() => {
    const total = equipos.length;
    const operativos = equipos.filter((e) => e.estado === "operativo").length;
    const mantenimiento = equipos.filter(
      (e) => e.estado === "en_mantenimiento"
    ).length;
    const criticos = equipos.filter(
      (e) => e.estado === "critico" || e.criticidad === "alta" || e.criticidad === "critica"
    ).length;

    const proximos = equipos.filter((e) => {
      const d = diasHasta(e.proxima_mantencion);
      return d !== null && d <= 30;
    }).length;

    return {
      total,
      operativos,
      mantenimiento,
      criticos,
      proximos,
    };
  }, [equipos]);

  // ================================
  // ESTADOS DE CARGA
  // ================================

  if (loadingSesion) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 border-4 border-indigo-500/40 border-t-transparent rounded-full animate-spin" />
            <div
              className={`absolute inset-2 rounded-full bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
            >
              <Cpu className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-3xl font-black mb-2 ${tema.colores.texto}`}>
            Cargando módulo de equipos
          </h2>
          <p className={`text-sm ${tema.colores.textoSecundario}`}>
            Verificando tu sesión de técnico...
          </p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.tecnico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}
      >
        <div
          className={`max-w-md w-full p-8 rounded-3xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center mb-2`}
            >
              <AlertOctagon className="w-10 h-10 text-white" />
            </div>
            <h2 className={`text-2xl font-black ${tema.colores.texto}`}>
              Acceso restringido
            </h2>
            <p className={`text-sm ${tema.colores.textoSecundario}`}>
              Este módulo es exclusivo para cuentas con rol <b>TÉCNICO</b>.
            </p>
            <Link
              href="/login"
              className={`mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${tema.colores.primario} text-white font-semibold ${tema.colores.sombra}`}
            >
              <LogOut className="w-4 h-4" />
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // RENDER
  // ================================

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo} transition-all duration-500`}
    >
      {/* SIDEBAR */}
        <SidebarTecnico
        usuario={usuario}
        tema={tema}
        sidebarAbierto={sidebarAbierto}
        setSidebarAbierto={setSidebarAbierto}
        estadisticas={estadisticas}
      />


      {/* HEADER */}
      <header
        className={`fixed top-0 right-0 z-30 transition-all duration-300 ${
          sidebarAbierto ? "left-72" : "left-20"
        } ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${tema.colores.textoSecundario}`}
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar equipo, código, tipo o centro..."
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl ${tema.colores.card} ${tema.colores.borde} border text-sm ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 ml-6">
            {/* Temas */}
            <div className="relative group">
              <button
                className={`p-2.5 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
              >
                <p className={`text-xs font-bold mb-2 ${tema.colores.texto}`}>
                  Tema visual
                </p>
                <div className="space-y-1">
                  {Object.entries(TEMAS).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => cambiarTema(key as TemaColor)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        temaActual === key
                          ? `bg-gradient-to-r ${t.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <t.icono className="w-4 h-4" />
                        {t.nombre}
                      </span>
                      {temaActual === key && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notificaciones (placeholder) */}
            <div className="relative">
              <button
                onClick={() =>
                  setNotificacionesAbiertas((v) => !v)
                }
                className={`relative p-2.5 rounded-xl ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 border border-white" />
              </button>
              {notificacionesAbiertas && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>
                    Notificaciones
                  </p>
                  <p className={`text-xs mt-2 ${tema.colores.textoSecundario}`}>
                    Aquí aparecerán las alertas de equipos críticos, mantenciones
                    vencidas y tickets asociados.
                  </p>
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => cambiarDisponibilidad("disponible")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  disponibilidad === "disponible"
                    ? "bg-emerald-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Disponible
              </button>
              <button
                onClick={() => cambiarDisponibilidad("ocupado")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  disponibilidad === "ocupado"
                    ? "bg-amber-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Ocupado
              </button>
              <button
                onClick={() => cambiarDisponibilidad("fuera_servicio")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  disponibilidad === "fuera_servicio"
                    ? "bg-rose-600 text-white"
                    : `${tema.colores.secundario} ${tema.colores.texto}`
                }`}
              >
                Fuera
              </button>
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                onClick={() => setPerfilAbierto((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${tema.colores.hover}`}
              >
                <div className="hidden md:block text-right">
                  <p
                    className={`text-xs font-bold ${tema.colores.texto}`}
                  >
                    {usuario.nombre} {usuario.apellido_paterno}
                  </p>
                  <p className={`text-[10px] ${tema.colores.textoSecundario}`}>
                    Técnico {usuario.tecnico?.tipo_tecnico}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {usuario.foto_perfil_url ? (
                    <Image
                      src={usuario.foto_perfil_url}
                      alt={usuario.nombre}
                      width={32}
                      height={32}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                  )}
                </div>
                <ChevronDown
                  className={`w-3 h-3 ${tema.colores.texto} transition-transform ${
                    perfilAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>
              {perfilAbierto && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-4`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {usuario.foto_perfil_url ? (
                        <Image
                          src={usuario.foto_perfil_url}
                          alt={usuario.nombre}
                          width={40}
                          height={40}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-bold ${tema.colores.texto}`}
                      >
                        {usuario.nombre} {usuario.apellido_paterno}
                      </p>
                      <p
                        className={`text-xs ${tema.colores.textoSecundario}`}
                      >
                        {usuario.tecnico?.centro?.nombre ?? "Sin centro"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <Link
                      href="/tecnico/perfil"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <User className="w-4 h-4" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/tecnico/configuracion"
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${tema.colores.hover} ${tema.colores.texto}`}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                    <button
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } pt-24 px-8 pb-10`}
      >
        {/* Encabezado */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 text-xs mb-1">
                <Link
                  href="/tecnico"
                  className={`font-semibold ${tema.colores.textoSecundario}`}
                >
                  Dashboard Técnico
                </Link>
                <span className={tema.colores.textoSecundario}>/</span>
                <span className={`font-bold ${tema.colores.texto}`}>
                  Equipos
                </span>
              </div>
              <h1
                className={`text-3xl md:text-4xl font-black flex items-center gap-3 ${tema.colores.texto}`}
              >
                Gestión de Equipos
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-black/10 text-[11px] font-semibold uppercase tracking-wider">
                  Inventario Premium
                </span>
              </h1>
              <p
                className={`text-xs md:text-sm mt-1 ${tema.colores.textoSecundario}`}
              >
                Control total de inventario biomédico, informático y
                operacional, con foco en equipos críticos y mantenciones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={cargarEquipos}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${tema.colores.primario} text-white ${tema.colores.sombra}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingEquipos ? "animate-spin" : ""
                  }`}
                />
                Actualizar
              </button>
              <button
                onClick={() =>
                  window.open("/api/tecnico/equipos/export-excel", "_blank")
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() =>
                  window.open("/api/tecnico/equipos/export-pdf", "_blank")
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => window.print()}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>

          {errorEquipos && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangleIcon className="w-4 h-4" />
              {errorEquipos}
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Equipos totales
              </p>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {kpis.total}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1">
              {kpis.operativos} operativos
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Críticos
              </p>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400">
              {kpis.criticos}
            </p>
            <p className="text-[11px] text-rose-300 mt-1">
              Riesgo clínico o infraestructura
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                En mantenimiento
              </p>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300">
              {kpis.mantenimiento}
            </p>
            <p className="text-[11px] text-amber-200 mt-1">
              En reparación o revisión
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Próx. mantención (≤ 30 días)
              </p>
              <CalendarClock className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-300">
              {kpis.proximos}
            </p>
            <p className="text-[11px] text-sky-200 mt-1">
              Priorizar programación
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wide ${tema.colores.textoSecundario}`}
              >
                Filtrados
              </p>
              <FilterMiniIcon />
            </div>
            <p className={`text-2xl font-black ${tema.colores.texto}`}>
              {equiposFiltrados.length}
            </p>
            <p className="text-[11px] text-indigo-300 mt-1">
              Aplicando filtros actuales
            </p>
          </div>
        </div>

        {/* Filtros + contenido */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Filtros laterales */}
          <aside
            className={`xl:col-span-1 rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
              >
                <FilterMiniIcon />
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${tema.colores.texto}`}
                >
                  Filtros de Inventario
                </p>
                <p
                  className={`text-[11px] ${tema.colores.textoSecundario}`}
                >
                  Combina filtros para encontrar equipos
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Centro */}
              <div>
                <p
                  className={`text-[11px] font-semibold mb-1 ${tema.colores.textoSecundario}`}
                >
                  Centro
                </p>
                <select
                  value={filtroCentro}
                  onChange={(e) => setFiltroCentro(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto}`}
                >
                  <option value="todos">Todos los centros</option>
                  {centrosDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <p
                  className={`text-[11px] font-semibold mb-1 ${tema.colores.textoSecundario}`}
                >
                  Estado
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroEstado("todos")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroEstado === "todos"
                        ? "bg-indigo-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroEstado("operativo")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroEstado === "operativo"
                        ? "bg-emerald-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Operativos
                  </button>
                  <button
                    onClick={() => setFiltroEstado("en_mantenimiento")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroEstado === "en_mantenimiento"
                        ? "bg-amber-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Mantención
                  </button>
                  <button
                    onClick={() => setFiltroEstado("critico")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroEstado === "critico"
                        ? "bg-rose-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Críticos
                  </button>
                </div>
              </div>

              {/* Criticidad */}
              <div>
                <p
                  className={`text-[11px] font-semibold mb-1 ${tema.colores.textoSecundario}`}
                >
                  Criticidad
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFiltroCriticidad("todos")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroCriticidad === "todos"
                        ? "bg-indigo-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFiltroCriticidad("baja")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroCriticidad === "baja"
                        ? "bg-emerald-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Baja
                  </button>
                  <button
                    onClick={() => setFiltroCriticidad("media")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroCriticidad === "media"
                        ? "bg-sky-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Media
                  </button>
                  <button
                    onClick={() => setFiltroCriticidad("alta")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                      filtroCriticidad === "alta"
                        ? "bg-amber-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Alta
                  </button>
                  <button
                    onClick={() => setFiltroCriticidad("critica")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold col-span-2 ${
                      filtroCriticidad === "critica"
                        ? "bg-rose-600 text-white"
                        : `${tema.colores.secundario} ${tema.colores.texto}`
                    }`}
                  >
                    Crítica
                  </button>
                </div>
              </div>

              {/* Solo críticos */}
              <div className="flex items-center justify-between pt-1">
                <label
                  className={`text-[11px] font-semibold ${tema.colores.textoSecundario}`}
                >
                  Mostrar solo riesgo alto/crítico
                </label>
                <button
                  onClick={() => setSoloCriticos((v) => !v)}
                  className={`w-9 h-5 rounded-full flex items-center px-0.5 ${
                    soloCriticos ? "bg-rose-500" : "bg-slate-500/40"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                      soloCriticos ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </aside>

          {/* Tabla + detalle */}
          <section className="xl:col-span-3 space-y-4">
            {/* Lista de equipos */}
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <p
                    className={`text-sm font-bold ${tema.colores.texto}`}
                  >
                    Inventario de Equipos
                  </p>
                  <span className="text-[11px] text-indigo-300">
                    {equiposFiltrados.length} resultados
                  </span>
                </div>
              </div>

              {loadingEquipos ? (
                <div className="py-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
                  <span
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Cargando inventario...
                  </span>
                </div>
              ) : equiposFiltrados.length === 0 ? (
                <div className="py-10 text-center">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${tema.colores.gradiente} mx-auto flex items-center justify-center mb-2`}
                  >
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <p
                    className={`text-sm font-semibold ${tema.colores.texto}`}
                  >
                    No se encontraron equipos
                  </p>
                  <p
                    className={`text-[11px] ${tema.colores.textoSecundario}`}
                  >
                    Ajusta filtros o busca por otro término.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full text-[11px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide text-gray-400">
                        <th className="text-left pb-2 pr-4">Equipo</th>
                        <th className="text-left pb-2 pr-4">Centro</th>
                        <th className="text-left pb-2 pr-4">Estado</th>
                        <th className="text-left pb-2 pr-4">Criticidad</th>
                        <th className="text-left pb-2 pr-4">
                          Próx. mantención
                        </th>
                        <th className="text-left pb-2 pr-4">Tickets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equiposFiltrados.map((e) => {
                        const d = diasHasta(e.proxima_mantencion);
                        const esVencido = d !== null && d < 0;
                        const esProximo = d !== null && d >= 0 && d <= 30;

                        return (
                          <tr
                            key={e.id_equipo}
                            className={`border-t ${tema.colores.borde} text-[11px] hover:bg-black/5 cursor-pointer`}
                            onClick={() => setEquipoSeleccionado(e)}
                          >
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                                >
                                  <Cpu className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p
                                    className={`font-semibold ${tema.colores.texto}`}
                                  >
                                    {e.nombre}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {e.codigo_interno} • {e.tipo_equipo}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 pr-4">
                              <p
                                className={`font-semibold ${tema.colores.texto}`}
                              >
                                {e.centro}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {e.ubicacion}
                              </p>
                            </td>
                            <td className="py-2 pr-4">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-semibold ${obtenerBadgeEstado(
                                  e.estado
                                )}`}
                              >
                                {e.estado.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-2 pr-4">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-semibold ${obtenerBadgeCriticidad(
                                  e.criticidad
                                )}`}
                              >
                                {e.criticidad}
                              </span>
                            </td>
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span
                                  className={`text-[10px] ${
                                    esVencido
                                      ? "text-rose-400"
                                      : esProximo
                                      ? "text-amber-300"
                                      : tema.colores.textoSecundario
                                  }`}
                                >
                                  {formatearFecha(e.proxima_mantencion)}
                                  {d !== null && (
                                    <>
                                      {" "}
                                      •{" "}
                                      {d >= 0 ? `en ${d} días` : `${-d} días atraso`}
                                    </>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-1">
                                <ClipboardList className="w-3 h-3 text-indigo-400" />
                                <span
                                  className={`text-[10px] font-semibold ${
                                    e.tickets_abiertos > 0
                                      ? "text-indigo-300"
                                      : tema.colores.textoSecundario
                                  }`}
                                >
                                  {e.tickets_abiertos} abiertos
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Panel de detalle */}
            <div
              className={`rounded-2xl p-4 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <p
                    className={`text-sm font-bold ${tema.colores.texto}`}
                  >
                    Detalle del equipo
                  </p>
                </div>
              </div>

              {equipoSeleccionado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Identificación
                    </p>
                    <p
                      className={`text-sm font-bold ${tema.colores.texto}`}
                    >
                      {equipoSeleccionado.nombre}
                    </p>
                    <p
                      className={`text-[11px] ${tema.colores.textoSecundario}`}
                    >
                      {equipoSeleccionado.tipo_equipo} •{" "}
                      {equipoSeleccionado.marca} {equipoSeleccionado.modelo}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Código interno:{" "}
                      <span className="font-mono">
                        {equipoSeleccionado.codigo_interno}
                      </span>{" "}
                      • Serie:{" "}
                      <span className="font-mono">
                        {equipoSeleccionado.numero_serie}
                      </span>
                    </p>

                    <div className="mt-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                        Ubicación
                      </p>
                      <p
                        className={`text-[11px] ${tema.colores.texto}`}
                      >
                        {equipoSeleccionado.centro} –{" "}
                        {equipoSeleccionado.sucursal ?? "Sin sucursal"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {equipoSeleccionado.ubicacion}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold ${obtenerBadgeEstado(
                          equipoSeleccionado.estado
                        )}`}
                      >
                        {equipoSeleccionado.estado.replace("_", " ")}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold ${obtenerBadgeCriticidad(
                          equipoSeleccionado.criticidad
                        )}`}
                      >
                        Criticidad {equipoSeleccionado.criticidad}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Última mantención
                        </p>
                        <p
                          className={`${tema.colores.texto}`}
                        >
                          {formatearFecha(
                            equipoSeleccionado.ultima_mantencion
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Próxima mantención
                        </p>
                        <p
                          className={`${tema.colores.texto}`}
                        >
                          {formatearFecha(
                            equipoSeleccionado.proxima_mantencion
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Riesgo clínico
                        </p>
                        <p className="text-[11px] text-rose-300">
                          {equipoSeleccionado.riesgo_clinico.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Uso diario
                        </p>
                        <p className={`${tema.colores.texto}`}>
                          {equipoSeleccionado.horas_uso_diario_promedio} h/día
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                        Responsable
                      </p>
                      <p
                        className={`text-[11px] ${tema.colores.texto}`}
                      >
                        {equipoSeleccionado.responsable}
                      </p>
                      {equipoSeleccionado.telefono_responsable && (
                        <p className="text-[11px] text-indigo-300">
                          {equipoSeleccionado.telefono_responsable}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Link
                        href={`/tecnico/tickets?nuevo=1&equipo=${equipoSeleccionado.id_equipo}`}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${tema.colores.primario} text-white`}
                      >
                        <ClipboardList className="w-3 h-3" />
                        Crear ticket
                      </Link>
                      <Link
                        href={`/tecnico/mantenimiento/programar?equipo=${equipoSeleccionado.id_equipo}`}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${tema.colores.secundario} ${tema.colores.texto}`}
                      >
                        <Calendar className="w-3 h-3" />
                        Programar mantención
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-[11px]">
                  <p
                    className={`text-xs font-semibold ${tema.colores.textoSecundario}`}
                  >
                    Selecciona un equipo en la tabla para ver el detalle completo.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className={`transition-all duration-300 ${
          sidebarAbierto ? "ml-72" : "ml-20"
        } ${tema.colores.card} ${tema.colores.borde} border-t py-4 px-8 mt-6`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[11px]">
          <p className={tema.colores.textoSecundario}>
            © 2025 AnyssaMed • Módulo de Equipos Técnicos.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/ayuda"
              className={`hover:${tema.colores.acento}`}
            >
              Ayuda
            </Link>
            <Link
              href="/privacidad"
              className={`hover:${tema.colores.acento}`}
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className={`hover:${tema.colores.acento}`}
            >
              Términos
            </Link>
          </div>
        </div>
      </footer>

      {/* ESTILOS GLOBALES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(129, 140, 248, 0.5);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(129, 140, 248, 0.9);
        }
      `}</style>
    </div>
  );
}

// Mini icono de filtro (solo para no importar otro)
function FilterMiniIcon() {
  return (
    <svg
      className="w-4 h-4 text-indigo-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="4 4 20 4 13 12 13 19 11 21 11 12 4 4" />
    </svg>
  );
}
