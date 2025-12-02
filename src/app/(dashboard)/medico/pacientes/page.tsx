"use client";

import { useState, useEffect, useMemo } from "react";
import MedicoLayout from "../layout/MedicoLayout";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Heart,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Star,
  TrendingUp,
  RefreshCw,
  Loader2,
  Grid,
  List,
  Columns,
  ArrowUpDown,
  UserCheck,
  Cake,
  Droplet,
  Save,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS
// ========================================

type TemaColor = "light" | "dark" | "blue" | "purple" | "green";
type VistaModo = "grid" | "lista" | "tabla";
type OrdenCampo = "nombre" | "fecha_registro" | "ultima_consulta" | "edad" | "estado";
type OrdenDireccion = "asc" | "desc";

interface ConfiguracionTema {
  nombre: string;
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
  medico?: {
    id_profesional: number;
    numero_registro_medico: string;
    titulo_profesional: string;
    especialidades: Array<{
      id_especialidad: number;
      nombre: string;
      es_principal: boolean;
    }>;
    id_centro_principal: number;
    centro_principal: {
      id_centro: number;
      nombre: string;
      plan: "basico" | "profesional" | "enterprise";
      logo_url: string | null;
      ciudad: string;
      region: string;
      direccion: string;
      telefono: string;
      email: string;
    };
    calificacion_promedio: number;
    anos_experiencia: number;
  };
}

interface Paciente {
  id_paciente: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad: number;
  genero: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  foto_url: string | null;
  grupo_sanguineo: string;
  estado: "activo" | "inactivo" | "bloqueado" | "fallecido";
  es_vip: boolean;
  fecha_registro: string;
  ultima_consulta: string | null;
  proxima_cita: string | null;
  total_consultas: number;
  total_citas: number;
  alergias_criticas: number;
  condiciones_cronicas: number;
  medicamentos_activos: number;
  examenes_pendientes: number;
  documentos_pendientes: number;
  clasificacion_riesgo: "bajo" | "medio" | "alto" | "critico" | null;
  imc: number | null;
  peso_kg: number | null;
  altura_cm: number | null;
  diagnostico_principal: string | null;
  notas_importantes: string | null;
  tags: string[];
}

interface EstadisticasPacientes {
  total_pacientes: number;
  pacientes_activos: number;
  pacientes_nuevos_mes: number;
  pacientes_vip: number;
  pacientes_criticos: number;
  promedio_edad: number;
  distribucion_genero: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  distribucion_grupo_sanguineo: Record<string, number>;
  pacientes_con_alergias: number;
  pacientes_con_cronicas: number;
  consultas_mes: number;
  citas_programadas: number;
}

interface FiltrosPacientes {
  busqueda: string;
  estados: string[];
  generos: string[];
  grupos_sanguineos: string[];
  edad_min: number | null;
  edad_max: number | null;
  con_alergias: boolean | null;
  con_cronicas: boolean | null;
  clasificacion_riesgo: string[];
  es_vip: boolean | null;
  ciudad: string;
  fecha_registro_desde: string;
  fecha_registro_hasta: string;
  ultima_consulta_desde: string;
  ultima_consulta_hasta: string;
  tags: string[];
}

interface Pais {
  id_pais: number;
  nombre: string;
  codigo_iso2: string;
  codigo_iso3: string | null;
}

interface RegionGeo {
  id_region: number;
  nombre: string;
  codigo?: string | null;
}

interface ComunaGeo {
  id_comuna: number;
  nombre: string;
  codigo?: string | null;
}

interface FormularioPaciente {
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: "masculino" | "femenino" | "no_binario" | "prefiero_no_decir";
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  ciudad: string;
  region: string;
  pais_id: number | null;
  pais_codigo: string;
  region_id: number | null;
  comuna_id: number | null;
  grupo_sanguineo:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | "desconocido";
  es_vip: boolean;
  clasificacion_riesgo: "bajo" | "medio" | "alto" | "critico" | null;
  peso_kg: string;
  altura_cm: string;
  estado_civil: "soltero" | "casado" | "viudo" | "divorciado" | "separado" | "conviviente" | "";
  ocupacion: string;
  notas_importantes: string;
}

// ========================================
// CONFIGURACIONES DE TEMAS
// ========================================

const TEMAS: Record<TemaColor, ConfiguracionTema> = {
  light: {
    nombre: "Claro",
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
    nombre: "Azul Océano",
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
    nombre: "Púrpura Real",
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
    nombre: "Verde Médico",
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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function PacientesPage() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPacientes | null>(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  // UI
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [vistaModo, setVistaModo] = useState<VistaModo>("grid");
  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo>("nombre");
  const [ordenDireccion, setOrdenDireccion] = useState<OrdenDireccion>("asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(20);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  // Modales
  const [modalNuevoPaciente, setModalNuevoPaciente] = useState(false);
  const [modalEditarPaciente, setModalEditarPaciente] = useState(false);
  const [guardandoPaciente, setGuardandoPaciente] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosPacientes>({
    busqueda: "",
    estados: [],
    generos: [],
    grupos_sanguineos: [],
    edad_min: null,
    edad_max: null,
    con_alergias: null,
    con_cronicas: null,
    clasificacion_riesgo: [],
    es_vip: null,
    ciudad: "",
    fecha_registro_desde: "",
    fecha_registro_hasta: "",
    ultima_consulta_desde: "",
    ultima_consulta_hasta: "",
    tags: [],
  });

  // Formulario
  const [formularioPaciente, setFormularioPaciente] = useState<FormularioPaciente>({
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    genero: "masculino",
    email: "",
    telefono: "",
    celular: "",
    direccion: "",
    ciudad: "",
    region: "",
    pais_id: null,
    pais_codigo: "",
    region_id: null,
    comuna_id: null,
    grupo_sanguineo: "desconocido",
    es_vip: false,
    clasificacion_riesgo: null,
    peso_kg: "",
    altura_cm: "",
    estado_civil: "",
    ocupacion: "",
    notas_importantes: "",
  });

  const [erroresFormulario, setErroresFormulario] = useState<Record<string, string>>({});

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // Estados de geo
  const [paises, setPaises] = useState<Pais[]>([]);
  const [regionesDisponibles, setRegionesDisponibles] = useState<RegionGeo[]>([]);
  const [comunasDisponibles, setComunasDisponibles] = useState<ComunaGeo[]>([]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
    cargarPaises();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosPacientes();
    }
  }, [usuario, filtros, ordenCampo, ordenDireccion, paginaActual, itemsPorPagina, busqueda]);

  useEffect(() => {
    if (formularioPaciente.pais_id) {
      cargarRegiones(formularioPaciente.pais_id);
    } else {
      setRegionesDisponibles([]);
      setComunasDisponibles([]);
    }
  }, [formularioPaciente.pais_id]);

  useEffect(() => {
    if (formularioPaciente.region_id) {
      cargarComunas(formularioPaciente.region_id);
    } else {
      setComunasDisponibles([]);
    }
  }, [formularioPaciente.region_id]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("No hay sesión activa");

      const result = await response.json();

      if (result.success && result.usuario) {
        const rolesUsuario: string[] = [];
        if (result.usuario.rol) {
          rolesUsuario.push(
            result.usuario.rol.nombre
              ?.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .trim()
              .toUpperCase()
          );
        }

        const tieneRolMedico = rolesUsuario.some((rol) => rol.includes("MEDICO"));
        if (!tieneRolMedico) {
          alert("Acceso denegado. Este panel es solo para médicos.");
          window.location.href = "/";
          return;
        }

        if (!result.usuario.medico) {
          alert("Tu usuario no está vinculado a un registro médico.");
          window.location.href = "/";
          return;
        }

        setUsuario(result.usuario);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión.");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const cargarDatosPacientes = async () => {
    if (!usuario?.medico?.id_profesional) return;

    try {
      setLoadingData(true);

      const params = new URLSearchParams({
        orden_campo: ordenCampo,
        orden_direccion: ordenDireccion,
        pagina: paginaActual.toString(),
        items_por_pagina: itemsPorPagina.toString(),
      });

      if (busqueda) params.append("busqueda", busqueda);
      if (filtros.estados.length > 0) params.append("estados", filtros.estados.join(","));
      if (filtros.generos.length > 0) params.append("generos", filtros.generos.join(","));
      if (filtros.grupos_sanguineos.length > 0)
        params.append("grupos_sanguineos", filtros.grupos_sanguineos.join(","));
      if (filtros.edad_min) params.append("edad_min", filtros.edad_min.toString());
      if (filtros.edad_max) params.append("edad_max", filtros.edad_max.toString());
      if (filtros.con_alergias !== null)
        params.append("con_alergias", filtros.con_alergias.toString());
      if (filtros.con_cronicas !== null)
        params.append("con_cronicas", filtros.con_cronicas.toString());
      if (filtros.es_vip !== null) params.append("es_vip", filtros.es_vip.toString());
      if (filtros.ciudad) params.append("ciudad", filtros.ciudad);

      const res = await fetch(`/api/medico/pacientes?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Error al cargar pacientes:", data);
        return;
      }

      setPacientes(data.pacientes || []);
      setEstadisticas(data.estadisticas || null);
      setTotalPacientes(data.total || 0);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const cargarPaises = async () => {
    try {
      const res = await fetch("/api/geo/paises", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPaises(data.paises || data || []);
      }
    } catch (error) {
      console.error("Error al cargar países:", error);
    }
  };

  const cargarRegiones = async (id_pais: number) => {
    try {
      const res = await fetch(`/api/geo/regiones?id_pais=${id_pais}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setRegionesDisponibles(data.regiones || data || []);
      } else {
        setRegionesDisponibles([]);
      }
      setFormularioPaciente((prev) => ({
        ...prev,
        region: "",
        region_id: null,
        ciudad: "",
        comuna_id: null,
      }));
    } catch (error) {
      console.error("Error al cargar regiones:", error);
      setRegionesDisponibles([]);
    }
  };

  const cargarComunas = async (id_region: number) => {
    try {
      const res = await fetch(`/api/geo/comunas?id_region=${id_region}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setComunasDisponibles(data.comunas || data || []);
      } else {
        setComunasDisponibles([]);
      }
      setFormularioPaciente((prev) => ({
        ...prev,
        ciudad: "",
        comuna_id: null,
      }));
    } catch (error) {
      console.error("Error al cargar comunas:", error);
      setComunasDisponibles([]);
    }
  };

  // ========================================
  // AUXILIARES
  // ========================================

  const formatearRut = (rut: string): string => {
    const valor = rut.replace(/[^0-9kK]/g, "");
    if (valor.length <= 1) return valor;
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
  };

  const validarRut = (rut: string): boolean => {
    const valor = rut.replace(/[^0-9kK]/g, "");
    if (valor.length < 2) return false;
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

    return dv === dvCalculado;
  };

  const calcularIMC = (peso: number, altura: number): number => {
    if (!peso || !altura || altura === 0) return 0;
    return parseFloat((peso / Math.pow(altura / 100, 2)).toFixed(2));
  };

  const obtenerColorEstado = (estado: string) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      activo: isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-800",
      inactivo: isDark ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-800",
      bloqueado: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-800",
      fallecido: isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-800",
    };
    return colores[estado] || colores.activo;
  };

  const obtenerColorRiesgo = (riesgo: string | null) => {
    const isDark = ["dark", "blue", "purple", "green"].includes(temaActual);
    const colores: { [key: string]: string } = {
      bajo: isDark
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      medio: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
      alto: isDark
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-100 text-orange-800 border-orange-200",
      critico: isDark
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
    };
    return (
      colores[riesgo || ""] ||
      (isDark
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200")
    );
  };

  const totalPaginas = Math.ceil(totalPacientes / itemsPorPagina);

  // ========================================
  // ACCIONES FORM
  // ========================================

  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};

    if (!formularioPaciente.rut.trim()) {
      errores.rut = "El RUT es obligatorio";
    } else if (!validarRut(formularioPaciente.rut)) {
      errores.rut = "RUT inválido";
    }

    if (!formularioPaciente.nombre.trim()) {
      errores.nombre = "El nombre es obligatorio";
    }

    if (!formularioPaciente.apellido_paterno.trim()) {
      errores.apellido_paterno = "El apellido paterno es obligatorio";
    }

    if (!formularioPaciente.fecha_nacimiento) {
      errores.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    }

    if (
      formularioPaciente.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formularioPaciente.email)
    ) {
      errores.email = "Email inválido";
    }

    if (!formularioPaciente.pais_id) {
      errores.pais_id = "El país es obligatorio";
    }
    if (formularioPaciente.pais_id && !formularioPaciente.region_id) {
      errores.region_id = "La región es obligatoria";
    }
    if (formularioPaciente.region_id && !formularioPaciente.comuna_id) {
      errores.comuna_id = "La comuna/ciudad es obligatoria";
    }

    setErroresFormulario(errores);
    return Object.keys(errores).length === 0;
  };

  const handleNuevoPaciente = () => {
    setFormularioPaciente({
      rut: "",
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      fecha_nacimiento: "",
      genero: "masculino",
      email: "",
      telefono: "",
      celular: "",
      direccion: "",
      ciudad: "",
      region: "",
      pais_id: null,
      pais_codigo: "",
      region_id: null,
      comuna_id: null,
      grupo_sanguineo: "desconocido",
      es_vip: false,
      clasificacion_riesgo: null,
      peso_kg: "",
      altura_cm: "",
      estado_civil: "",
      ocupacion: "",
      notas_importantes: "",
    });
    setErroresFormulario({});
    setPacienteSeleccionado(null);
    setModalNuevoPaciente(true);
  };

  const handleGuardarPaciente = async () => {
    if (!validarFormulario()) {
      alert("Por favor corrige los errores en el formulario");
      return;
    }

    try {
      setGuardandoPaciente(true);

      const imc = calcularIMC(
        parseFloat(formularioPaciente.peso_kg) || 0,
        parseFloat(formularioPaciente.altura_cm) || 0
      );

      const paisSel = paises.find((p) => p.id_pais === formularioPaciente.pais_id) || null;
      const regionSel =
        regionesDisponibles.find((r) => r.id_region === formularioPaciente.region_id) || null;
      const comunaSel =
        comunasDisponibles.find((c) => c.id_comuna === formularioPaciente.comuna_id) || null;

      const payload = {
        ...formularioPaciente,
        rut: formularioPaciente.rut.replace(/[^0-9kK]/g, ""),
        peso_kg: formularioPaciente.peso_kg ? parseFloat(formularioPaciente.peso_kg) : null,
        altura_cm: formularioPaciente.altura_cm ? parseFloat(formularioPaciente.altura_cm) : null,
        imc: imc > 0 ? imc : null,
        pais:
          (paisSel?.codigo_iso3 && paisSel.codigo_iso3) ||
          (paisSel?.codigo_iso2 && paisSel.codigo_iso2) ||
          null,
        region: regionSel ? regionSel.nombre : formularioPaciente.region,
        ciudad: comunaSel ? comunaSel.nombre : formularioPaciente.ciudad,
      };

      const url = pacienteSeleccionado
        ? `/api/medico/pacientes/${pacienteSeleccionado.id_paciente}`
        : `/api/medico/pacientes`;

      const method = pacienteSeleccionado ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(
          pacienteSeleccionado ? "Paciente actualizado" : "Paciente registrado correctamente"
        );
        setModalNuevoPaciente(false);
        setModalEditarPaciente(false);
        setPacienteSeleccionado(null);
        cargarDatosPacientes();
      } else {
        alert(data.error || "Error al guardar el paciente");
      }
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      alert("Error al guardar el paciente");
    } finally {
      setGuardandoPaciente(false);
    }
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    setFormularioPaciente({
      rut: formatearRut(paciente.rut),
      nombre: paciente.nombre,
      apellido_paterno: paciente.apellido_paterno,
      apellido_materno: paciente.apellido_materno || "",
      fecha_nacimiento: paciente.fecha_nacimiento,
      genero: paciente.genero as any,
      email: paciente.email || "",
      telefono: paciente.telefono || "",
      celular: paciente.celular || "",
      direccion: paciente.direccion || "",
      ciudad: paciente.ciudad || "",
      region: paciente.region || "",
      pais_id: null,
      pais_codigo: "",
      region_id: null,
      comuna_id: null,
      grupo_sanguineo: paciente.grupo_sanguineo as any,
      es_vip: paciente.es_vip,
      clasificacion_riesgo: paciente.clasificacion_riesgo,
      peso_kg: paciente.peso_kg?.toString() || "",
      altura_cm: paciente.altura_cm?.toString() || "",
      estado_civil: "",
      ocupacion: "",
      notas_importantes: paciente.notas_importantes || "",
    });
    setPacienteSeleccionado(paciente);
    setErroresFormulario({});
    setModalEditarPaciente(true);
  };

  const handleVerDetalle = (paciente: Paciente) => {
    window.location.href = `/medico/pacientes/${paciente.id_paciente}`;
  };

  const cambiarOrden = (campo: OrdenCampo) => {
    if (ordenCampo === campo) {
      setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc");
    } else {
      setOrdenCampo(campo);
      setOrdenDireccion("asc");
    }
  };

  // ========================================
  // RENDER LOADING / NO AUTORIZADO
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl md:text-4xl font-black mb-4 text-gray-900">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className="flex items-center justify-center min-h-screen py-20 px-4">
        <div className="text-center max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-white shadow-2xl border border-gray-200">
          <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">Acceso No Autorizado</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER PRINCIPAL CON MEDICOLAYOUT
  // ========================================

  return (
    <MedicoLayout>
      {/* Fondo y espacio para el header */}
       <main className="min-h-screen bg-[#f3f5ff] pt-20 md:pt-28 pb-6 md:pb-10 px-4 md:px-6 lg:px-6">
        {/* Contenedor central */}
        <div className="max-w-7xl mx-auto w-full">
          {/* CABECERA LISTA */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
                <Users className="w-8 h-8 md:w-10 md:h-10" />
                Mis Pacientes
              </h1>
              <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
                Gestión integral de pacientes del centro
              </p>
            </div>

            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <button
                onClick={cargarDatosPacientes}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white rounded-xl font-semibold text-sm md:text-base text-slate-700 shadow-sm hover:shadow transition"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={handleNuevoPaciente}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-[#4a3aff] text-white rounded-xl font-semibold text-sm md:text-base shadow hover:shadow-md transition"
              >
                <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Nuevo</span>
                <span className="sm:hidden">Agregar</span>
              </button>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          {estadisticas && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 text-gray-900">
                  {estadisticas.total_pacientes}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Total
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 text-gray-900">
                  {estadisticas.pacientes_activos}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Activos
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 text-gray-900">
                  {estadisticas.pacientes_nuevos_mes}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Nuevos
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 text-gray-900">
                  {estadisticas.pacientes_vip}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  VIP
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 text-gray-900">
                  {estadisticas.pacientes_criticos}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Críticos
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 text-gray-900">
                  {estadisticas.citas_programadas}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Citas
                </div>
              </div>
            </div>
          )}

          {/* CONTROLES Y BÚSQUEDA */}
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
              <div className="flex-1 w-full lg:max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setPaginaActual(1);
                    }}
                    className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  {busqueda && (
                    <button
                      onClick={() => {
                        setBusqueda("");
                        setPaginaActual(1);
                      }}
                      className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg md:rounded-xl p-1">
                  <button
                    onClick={() => setVistaModo("grid")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      vistaModo === "grid"
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Grid className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={() => setVistaModo("lista")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      vistaModo === "lista"
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <List className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={() => setVistaModo("tabla")}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      vistaModo === "tabla"
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Columns className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                  className="p-2.5 md:p-3 rounded-lg md:rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300 hover:scale-105 relative"
                >
                  <Filter className="w-4 h-4 md:w-5 md:h-5" />
                  {(filtros.estados.length > 0 || filtros.generos.length > 0) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {filtros.estados.length + filtros.generos.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* PANEL DE FILTROS */}
            {filtrosAbiertos && (
              <div className="mt-4 md:mt-6 p-4 md:p-6 rounded-lg md:rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="text-base md:text-lg font-black mb-3 md:mb-4 text-gray-900">
                  Filtros Avanzados
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Estado */}
                  <div>
                    <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                      Estado
                    </label>
                    <div className="space-y-2">
                      {["activo", "inactivo", "bloqueado"].map((estado) => (
                        <label
                          key={estado}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filtros.estados.includes(estado)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFiltros({
                                  ...filtros,
                                  estados: [...filtros.estados, estado],
                                });
                              } else {
                                setFiltros({
                                  ...filtros,
                                  estados: filtros.estados.filter((x) => x !== estado),
                                });
                              }
                              setPaginaActual(1);
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs md:text-sm font-semibold text-gray-900 capitalize">
                            {estado}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Género */}
                  <div>
                    <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                      Género
                    </label>
                    <div className="space-y-2">
                      {["masculino", "femenino"].map((genero) => (
                        <label
                          key={genero}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filtros.generos.includes(genero)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFiltros({
                                  ...filtros,
                                  generos: [...filtros.generos, genero],
                                });
                              } else {
                                setFiltros({
                                  ...filtros,
                                  generos: filtros.generos.filter((g) => g !== genero),
                                });
                              }
                              setPaginaActual(1);
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs md:text-sm font-semibold text-gray-900 capitalize">
                            {genero}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Características */}
                  <div>
                    <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                      Características
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.es_vip === true}
                          onChange={(e) =>
                            setFiltros({
                              ...filtros,
                              es_vip: e.target.checked ? true : null,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-900">
                          Solo VIP
                        </span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.con_alergias === true}
                          onChange={(e) =>
                            setFiltros({
                              ...filtros,
                              con_alergias: e.target.checked ? true : null,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-900">
                          Con Alergias
                        </span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.con_cronicas === true}
                          onChange={(e) =>
                            setFiltros({
                              ...filtros,
                              con_cronicas: e.target.checked ? true : null,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-900">
                          Condiciones Crónicas
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Rango de edad */}
                  <div>
                    <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                      Rango de Edad
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Edad mínima"
                        value={filtros.edad_min || ""}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            edad_min: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Edad máxima"
                        value={filtros.edad_max || ""}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            edad_max: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-6 flex-wrap">
                  <button
                    onClick={() => {
                      setFiltros({
                        busqueda: "",
                        estados: [],
                        generos: [],
                        grupos_sanguineos: [],
                        edad_min: null,
                        edad_max: null,
                        con_alergias: null,
                        con_cronicas: null,
                        clasificacion_riesgo: [],
                        es_vip: null,
                        ciudad: "",
                        fecha_registro_desde: "",
                        fecha_registro_hasta: "",
                        ultima_consulta_desde: "",
                        ultima_consulta_hasta: "",
                        tags: [],
                      });
                      setPaginaActual(1);
                    }}
                    className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105"
                  >
                    Limpiar
                  </button>

                  <button
                    onClick={() => setFiltrosAbiertos(false)}                    className="flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LISTAS DE PACIENTES */}
          {loadingData ? (
            <div className="flex items-center justify-center py-12 md:py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-indigo-500 mx-auto mb-4" />
                <p className="text-base md:text-lg font-semibold text-gray-600">
                  Cargando pacientes...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* VISTA GRID */}
              {vistaModo === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {pacientes.length === 0 ? (
                    <div className="col-span-full rounded-xl md:rounded-2xl p-8 md:p-12 bg-white border border-gray-200 shadow-lg text-center">
                      <Users className="w-16 h-16 md:w-24 md:h-24 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl md:text-2xl font-black mb-2 text-gray-900">
                        No hay pacientes
                      </h3>
                      <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
                        Comienza agregando tu primer paciente
                      </p>
                      <button
                        onClick={handleNuevoPaciente}
                        className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Nuevo Paciente
                      </button>
                    </div>
                  ) : (
                    pacientes.map((paciente) => (
                      <div
                        key={paciente.id_paciente}
                        className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
                        onClick={() => handleVerDetalle(paciente)}
                      >
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-lg">
                              {paciente.foto_url ? (
                                <Image
                                  src={paciente.foto_url}
                                  alt={paciente.nombre_completo}
                                  width={80}
                                  height={80}
                                  className="rounded-lg md:rounded-xl object-cover w-full h-full"
                                />
                              ) : (
                                `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`
                              )}
                            </div>
                            {paciente.es_vip && (
                              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${obtenerColorEstado(
                              paciente.estado
                            )}`}
                          >
                            {paciente.estado}
                          </span>
                        </div>

                        <h3 className="text-base md:text-xl font-black mb-1 text-gray-900 truncate">
                          {paciente.nombre_completo}
                        </h3>

                        <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                          <p className="text-xs md:text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <Cake className="w-3 h-3 md:w-4 md:h-4" />
                            {paciente.edad} años · {paciente.genero}
                          </p>
                          <p className="text-xs md:text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <Droplet className="w-3 h-3 md:w-4 md:h-4" />
                            {paciente.grupo_sanguineo}
                          </p>
                          {paciente.telefono && (
                            <p className="text-xs md:text-sm font-semibold text-gray-600 flex items-center gap-2 truncate">
                              <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate">{paciente.telefono}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-3 md:mb-4">
                          {paciente.alergias_criticas > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold">
                              <AlertCircle className="w-3 h-3" />
                              {paciente.alergias_criticas}
                            </span>
                          )}
                          {paciente.condiciones_cronicas > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold">
                              <Heart className="w-3 h-3" />
                              {paciente.condiciones_cronicas}
                            </span>
                          )}
                          {paciente.clasificacion_riesgo && (
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-bold border ${obtenerColorRiesgo(
                                paciente.clasificacion_riesgo
                              )}`}
                            >
                              {paciente.clasificacion_riesgo}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-3 md:mb-4">
                          <div className="text-center p-2 rounded-lg bg-gray-100">
                            <div className="text-base md:text-lg font-black text-gray-900">
                              {paciente.total_consultas}
                            </div>
                            <div className="text-xs font-semibold text-gray-600">
                              Consultas
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-gray-100">
                            <div className="text-base md:text-lg font-black text-gray-900">
                              {paciente.medicamentos_activos}
                            </div>
                            <div className="text-xs font-semibold text-gray-600">
                              Medicinas
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-gray-100">
                            <div className="text-base md:text-lg font-black text-gray-900">
                              {paciente.examenes_pendientes}
                            </div>
                            <div className="text-xs font-semibold text-gray-600">
                              Exámenes
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalle(paciente);
                            }}
                            className="flex-1 px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1.5 md:gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            Ver Ficha
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarPaciente(paciente);
                            }}
                            className="p-2 rounded-lg md:rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300 hover:scale-105"
                          >
                            <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VISTA LISTA */}
              {vistaModo === "lista" && (
                <div className="space-y-3 md:space-y-4">
                  {pacientes.length === 0 ? (
                    <div className="rounded-xl md:rounded-2xl p-8 md:p-12 bg-white border border-gray-200 shadow-lg text-center">
                      <Users className="w-16 h-16 md:w-24 md:h-24 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl md:text-2xl font-black mb-2 text-gray-900">
                        No hay pacientes
                      </h3>
                      <button
                        onClick={handleNuevoPaciente}
                        className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold inline-flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Nuevo Paciente
                      </button>
                    </div>
                  ) : (
                    pacientes.map((paciente) => (
                      <div
                        key={paciente.id_paciente}
                        className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-gray-200 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                        onClick={() => handleVerDetalle(paciente)}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                          <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg">
                              {paciente.foto_url ? (
                                <Image
                                  src={paciente.foto_url}
                                  alt={paciente.nombre_completo}
                                  width={96}
                                  height={96}
                                  className="rounded-lg md:rounded-xl object-cover w-full h-full"
                                />
                              ) : (
                                `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`
                              )}
                            </div>
                            {paciente.es_vip && (
                              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-white fill-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-2 md:mb-3 gap-2 md:gap-4">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-1 truncate">
                                  {paciente.nombre_completo}
                                </h3>
                                <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">
                                  RUT: {paciente.rut} · {paciente.edad} años · {paciente.genero}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${obtenerColorEstado(
                                    paciente.estado
                                  )}`}
                                >
                                  {paciente.estado}
                                </span>
                                {paciente.clasificacion_riesgo && (
                                  <span
                                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${obtenerColorRiesgo(
                                      paciente.clasificacion_riesgo
                                    )}`}
                                  >
                                    {paciente.clasificacion_riesgo}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
                              <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-gray-100">
                                <Droplet className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                  {paciente.grupo_sanguineo}
                                </span>
                              </div>
                              {paciente.telefono && (
                                <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-gray-100">
                                  <Phone className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                    {paciente.telefono}
                                  </span>
                                </div>
                              )}
                              {paciente.email && (
                                <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-gray-100 col-span-2 md:col-span-1">
                                  <Mail className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                    {paciente.email}
                                  </span>
                                </div>
                              )}
                              {paciente.ciudad && (
                                <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-gray-100">
                                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                    {paciente.ciudad}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                                <div className="text-center">
                                  <div className="text-xl md:text-2xl font-black text-gray-900">
                                    {paciente.total_consultas}
                                  </div>
                                  <div className="text-xs font-semibold text-gray-600">
                                    Consultas
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xl md:text-2xl font-black text-gray-900">
                                    {paciente.medicamentos_activos}
                                  </div>
                                  <div className="text-xs font-semibold text-gray-600">
                                    Medicinas
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xl md:text-2xl font-black text-gray-900">
                                    {paciente.examenes_pendientes}
                                  </div>
                                  <div className="text-xs font-semibold text-gray-600">
                                    Exámenes
                                  </div>
                                </div>
                                {paciente.alergias_criticas > 0 && (
                                  <span className="flex items-center gap-1 px-2 md:px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap">
                                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                                    {paciente.alergias_criticas} alergias
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerDetalle(paciente);
                                  }}
                                  className="flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  Ver Ficha
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditarPaciente(paciente);
                                  }}
                                  className="p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300 hover:scale-105"
                                >
                                  <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VISTA TABLA */}
              {vistaModo === "tabla" && (
                <div className="rounded-xl md:rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                            onClick={() => cambiarOrden("nombre")}
                          >
                            <div className="flex items-center gap-2">
                              Paciente
                              {ordenCampo === "nombre" && <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4" />}
                            </div>
                          </th>
                          <th
                            className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                            onClick={() => cambiarOrden("edad")}
                          >
                            <div className="flex items-center gap-2">
                              Edad
                              {ordenCampo === "edad" && <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4" />}
                            </div>
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Contacto
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Grupo
                          </th>
                          <th
                            className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                            onClick={() => cambiarOrden("estado")}
                          >
                            <div className="flex items-center gap-2">
                              Estado
                              {ordenCampo === "estado" && <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4" />}
                            </div>
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Consultas
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pacientes.map((paciente) => (
                          <tr
                            key={paciente.id_paciente}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleVerDetalle(paciente)}
                          >
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm md:text-base shadow flex-shrink-0">
                                  {paciente.foto_url ? (
                                    <Image
                                      src={paciente.foto_url}
                                      alt={paciente.nombre_completo}
                                      width={40}
                                      height={40}
                                      className="rounded-lg object-cover w-full h-full"
                                    />
                                  ) : (
                                    `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                    {paciente.nombre_completo}
                                  </div>
                                  <div className="text-xs font-semibold text-gray-600 truncate">
                                    {paciente.rut}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                              <div className="text-xs md:text-sm font-bold text-gray-900">
                                {paciente.edad} años
                              </div>
                              <div className="text-xs font-semibold text-gray-600">
                                {paciente.genero}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                              {paciente.telefono && (
                                <div className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-1 md:gap-2 mb-1">
                                  <Phone className="w-3 h-3" />
                                  {paciente.telefono}
                                </div>
                              )}
                              {paciente.email && (
                                <div className="text-xs font-semibold text-gray-600 flex items-center gap-1 md:gap-2 truncate max-w-[200px]">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{paciente.email}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                              <span className="px-2 md:px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                                {paciente.grupo_sanguineo}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                              <span
                                className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${obtenerColorEstado(
                                  paciente.estado
                                )}`}
                              >
                                {paciente.estado}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                              <div className="text-base md:text-lg font-black text-gray-900">
                                {paciente.total_consultas}
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1 md:gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerDetalle(paciente);
                                  }}
                                  className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                                >
                                  <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-900" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditarPaciente(paciente);
                                  }}
                                  className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                                >
                                  <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-900" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 rounded-xl md:rounded-2xl bg-white border border-gray-200 shadow-lg gap-4">
                  <div className="text-xs md:text-sm font-semibold text-gray-600 text-center sm:text-left">
                    Mostrando {(paginaActual - 1) * itemsPorPagina + 1} -{" "}
                    {Math.min(paginaActual * itemsPorPagina, totalPacientes)} de {totalPacientes}{" "}
                    pacientes
                  </div>

                  <div className="flex items-center gap-1 md:gap-2">
                    <button
                      onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                      disabled={paginaActual === 1}
                      className={`p-2 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold transition-all duration-300 ${
                        paginaActual === 1
                          ? "bg-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginaActual <= 3) {
                          pageNum = i + 1;
                        } else if (paginaActual >= totalPaginas - 2) {
                          pageNum = totalPaginas - 4 + i;
                        } else {
                          pageNum = paginaActual - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => setPaginaActual(pageNum)}
                            className={`px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 ${
                              paginaActual === pageNum
                                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                      disabled={paginaActual === totalPaginas}
                      className={`p-2 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold transition-all duration-300 ${
                        paginaActual === totalPaginas
                          ? "bg-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  <select
                    value={itemsPorPagina}
                    onChange={(e) => {
                      setItemsPorPagina(parseInt(e.target.value));
                      setPaginaActual(1);
                    }}
                    className="px-3 md:px-4 py-2 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value={10}>10 / página</option>
                    <option value={20}>20 / página</option>
                    <option value={50}>50 / página</option>
                    <option value={100}>100 / página</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL NUEVO / EDITAR PACIENTE */}
      {(modalNuevoPaciente || modalEditarPaciente) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl md:rounded-3xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
            {/* HEADER */}
            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl md:rounded-t-3xl">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-xl rounded-lg md:rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-3xl font-black text-white">
                    {pacienteSeleccionado ? "Editar Paciente" : "Nuevo Paciente"}
                  </h3>
                  <p className="text-xs md:text-sm text-white/80 font-semibold">Complete los datos del paciente</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalNuevoPaciente(false);
                  setModalEditarPaciente(false);
                  setPacienteSeleccionado(null);
                }}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* RUT */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    RUT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.rut}
                    onChange={(e) => {
                      const rutFormateado = formatearRut(e.target.value);
                      setFormularioPaciente({ ...formularioPaciente, rut: rutFormateado });
                    }}
                    placeholder="12.345.678-9"
                    disabled={!!pacienteSeleccionado}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.rut ? "border-red-500" : ""
                    } ${pacienteSeleccionado ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {erroresFormulario.rut && (
                    <p className="text-red-500 text-xs mt-1">{erroresFormulario.rut}</p>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.nombre}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, nombre: e.target.value })
                    }
                    placeholder="Juan"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.nombre ? "border-red-500" : ""
                    }`}
                  />
                  {erroresFormulario.nombre && (
                    <p className="text-red-500 text-xs mt-1">{erroresFormulario.nombre}</p>
                  )}
                </div>

                {/* Apellido paterno */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Apellido Paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.apellido_paterno}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        apellido_paterno: e.target.value,
                      })
                    }
                    placeholder="Pérez"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.apellido_paterno ? "border-red-500" : ""
                    }`}
                  />
                  {erroresFormulario.apellido_paterno && (
                    <p className="text-red-500 text-xs mt-1">
                      {erroresFormulario.apellido_paterno}
                    </p>
                  )}
                </div>

                {/* Apellido materno */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.apellido_materno}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        apellido_materno: e.target.value,
                      })
                    }
                    placeholder="González"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Fecha nacimiento */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formularioPaciente.fecha_nacimiento}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.fecha_nacimiento ? "border-red-500" : ""
                    }`}
                  />
                  {erroresFormulario.fecha_nacimiento && (
                    <p className="text-red-500 text-xs mt-1">
                      {erroresFormulario.fecha_nacimiento}
                    </p>
                  )}
                </div>

                {/* Género */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Género <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formularioPaciente.genero}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        genero: e.target.value as any,
                      })
                    }
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no_binario">No Binario</option>
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formularioPaciente.email}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, email: e.target.value })
                    }
                    placeholder="juan.perez@email.com"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.email ? "border-red-500" : ""
                    }`}
                  />
                  {erroresFormulario.email && (
                    <p className="text-red-500 text-xs mt-1">{erroresFormulario.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formularioPaciente.telefono}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, telefono: e.target.value })
                    }
                    placeholder="+56 2 1234 5678"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={formularioPaciente.celular}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, celular: e.target.value })
                    }
                    placeholder="+56 9 1234 5678"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.direccion}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, direccion: e.target.value })
                    }
                    placeholder="Av. Libertador 1234"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* País */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    País <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formularioPaciente.pais_id ?? ""}
                    onChange={(e) => {
                      const paisId = e.target.value ? parseInt(e.target.value) : null;
                      const paisSel = paises.find((p) => p.id_pais === paisId) || null;
                      setFormularioPaciente((prev) => ({
                        ...prev,
                        pais_id: paisId,
                        pais_codigo:
                          (paisSel?.codigo_iso3 as string) ||
                          (paisSel?.codigo_iso2 as string) ||
                          "",
                      }));
                    }}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.pais_id ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Seleccione un país</option>
                    {paises.map((p) => (
                      <option key={p.id_pais} value={p.id_pais}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  {erroresFormulario.pais_id && (
                    <p className="text-red-500 text-xs mt-1">{erroresFormulario.pais_id}</p>
                  )}
                </div>

                {/* Región */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Región <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formularioPaciente.region_id ?? ""}
                    onChange={(e) => {
                      const regionId = e.target.value ? parseInt(e.target.value) : null;
                      const regSel =
                        regionesDisponibles.find((r) => r.id_region === regionId) || null;
                      setFormularioPaciente((prev) => ({
                        ...prev,
                        region_id: regionId,
                        region: regSel ? regSel.nombre : "",
                        comuna_id: null,
                        ciudad: "",
                      }));
                    }}
                    disabled={!formularioPaciente.pais_id}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.region_id ? "border-red-500" : ""
                    } ${!formularioPaciente.pais_id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">
                      {formularioPaciente.pais_id
                        ? "Seleccione una región"
                        : "Primero seleccione un país"}
                    </option>
                    {regionesDisponibles.map((r) => (
                      <option key={r.id_region} value={r.id_region}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                  {erroresFormulario.region_id && (
                    <p className="text-red-500 text-xs mt-1">{erroresFormulario.region_id}</p>
                  )}
                </div>

                {/* Comuna / Ciudad */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Comuna / Ciudad <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formularioPaciente.comuna_id ?? ""}
                    onChange={(e) => {
                      const comunaId = e.target.value ? parseInt(e.target.value) : null;
                      const comunaSel =
                        comunasDisponibles.find((c) => c.id_comuna === comunaId) || null;
                      setFormularioPaciente((prev) => ({
                        ...prev,
                        comuna_id: comunaId,
                        ciudad: comunaSel ? comunaSel.nombre : "",
                      }));
                    }}
                    disabled={!formularioPaciente.region_id}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      erroresFormulario.comuna_id ? "border-red-500" : ""
                    } ${!formularioPaciente.region_id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">
                      {formularioPaciente.region_id
                        ? "Seleccione una comuna/ciudad"
                        : "Primero seleccione una región"}
                    </option>
                    {comunasDisponibles.map((c) => (
                      <option key={c.id_comuna} value={c.id_comuna}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {erroresFormulario.comuna_id && (
                    <p className="text-red-500 text-xs mt-1">{erroresFormulario.comuna_id}</p>
                  )}
                </div>

                {/* Grupo Sanguíneo */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={formularioPaciente.grupo_sanguineo}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        grupo_sanguineo: e.target.value as any,
                      })
                    }
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="desconocido">Desconocido</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Peso */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formularioPaciente.peso_kg}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, peso_kg: e.target.value })
                    }
                    placeholder="70.5"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Altura */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formularioPaciente.altura_cm}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, altura_cm: e.target.value })
                    }
                    placeholder="170"
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Riesgo */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Clasificación de Riesgo
                  </label>
                  <select
                    value={formularioPaciente.clasificacion_riesgo || ""}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        clasificacion_riesgo: (e.target.value as any) || null,
                      })
                    }
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">Sin clasificar</option>
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>

                {/* VIP */}
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <input
                    type="checkbox"
                    checked={formularioPaciente.es_vip}
                    onChange={(e) =>
                      setFormularioPaciente({ ...formularioPaciente, es_vip: e.target.checked })
                    }
                    className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <label className="font-bold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                    Paciente VIP
                  </label>
                </div>

                {/* Notas */}
                <div className="md:col-span-2">
                  <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                    Notas Importantes
                  </label>
                  <textarea
                    value={formularioPaciente.notas_importantes}
                    onChange={(e) =>
                      setFormularioPaciente({
                        ...formularioPaciente,
                        notas_importantes: e.target.value,
                      })
                    }
                    placeholder="Información adicional relevante..."
                    rows={4}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>
              </div>
            </div>

                      {/* FOOTER */}
            <div className="px-4 md:px-8 py-4 md:py-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3 md:gap-4 bg-gray-50 rounded-b-2xl md:rounded-b-3xl">
              <button
                onClick={() => {
                  setModalNuevoPaciente(false);
                  setModalEditarPaciente(false);
                  setPacienteSeleccionado(null);
                }}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarPaciente}
                disabled={guardandoPaciente}
                className={`w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg md:rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                  guardandoPaciente ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {guardandoPaciente ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 md:w-5 md:h-5" />
                    {pacienteSeleccionado ? "Actualizar" : "Guardar"} Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS PERSONALIZADOS PARA SCROLLBAR */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Estilos para Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        /* Animaciones suaves */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Mejoras para inputs en móviles */
        @media (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important; /* Evita zoom en iOS */
          }
        }

        /* Transiciones suaves globales */
        button,
        a,
        input,
        select,
        textarea {
          transition: all 0.2s ease-in-out;
        }

        /* Mejora de contraste para accesibilidad */
        ::selection {
          background-color: #818cf8;
          color: white;
        }

        /* Optimización para pantallas táctiles */
        @media (hover: none) and (pointer: coarse) {
          button:hover,
          a:hover {
            transform: none;
          }

          button:active,
          a:active {
            transform: scale(0.95);
          }
        }

        /* Prevenir scroll horizontal en móviles */
        body {
          overflow-x: hidden;
        }

        /* Mejora de rendimiento en animaciones */
        .hover\:scale-105,
        .hover\:scale-\[1\.01\],
        .hover\:scale-110 {
          will-change: transform;
        }

        /* Optimización de imágenes */
        img {
          max-width: 100%;
          height: auto;
        }

        /* Mejora de legibilidad en pantallas pequeñas */
        @media (max-width: 640px) {
          body {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
        }

        /* Mejora de espaciado en tablas responsive */
        @media (max-width: 1024px) {
          table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Animación de carga suave */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        /* Mejora de sombras en modo claro */
        @media (prefers-color-scheme: light) {
          .shadow-lg,
          .shadow-xl,
          .shadow-2xl {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
              0 8px 10px -6px rgba(0, 0, 0, 0.05);
          }
        }

        /* Mejora de contraste en modo oscuro */
        @media (prefers-color-scheme: dark) {
          .shadow-lg,
          .shadow-xl,
          .shadow-2xl {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5),
              0 8px 10px -6px rgba(0, 0, 0, 0.3);
          }
        }

        /* Optimización para impresión */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .bg-gradient-to-r,
          .bg-gradient-to-br {
            background: white !important;
            color: black !important;
          }
        }

        /* Mejora de accesibilidad para focus */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #818cf8;
          outline-offset: 2px;
        }

        /* Prevenir selección de texto en botones */
        button {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Mejora de rendimiento en gradientes */
        .bg-gradient-to-r,
        .bg-gradient-to-br,
        .from-indigo-500,
        .via-purple-500,
        .to-pink-500 {
          will-change: background;
        }

        /* Optimización de fuentes */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Mejora de espaciado en listas */
        ul,
        ol {
          padding-left: 1.5rem;
        }

        /* Prevenir overflow en contenedores flex */
        .flex,
        .inline-flex {
          min-width: 0;
        }

        /* Mejora de truncado de texto */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Optimización para dispositivos de alta densidad */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }

        /* Mejora de contraste para badges */
        .bg-green-100,
        .bg-red-100,
        .bg-yellow-100,
        .bg-blue-100,
        .bg-purple-100,
        .bg-gray-100 {
          border: 1px solid currentColor;
          border-opacity: 0.1;
        }

        /* Optimización de z-index */
        .z-\[100\] {
          z-index: 100;
        }

        /* Mejora de espaciado en modales */
        @media (max-height: 700px) {
          .max-h-\[90vh\] {
            max-height: 85vh;
          }
        }

        /* Prevenir zoom en inputs en iOS */
        @supports (-webkit-touch-callout: none) {
          input,
          select,
          textarea {
            font-size: 16px;
          }
        }

        /* Mejora de rendimiento en transiciones */
        .transition-all {
          transition-property: transform, opacity, background-color, border-color,
            color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        /* Optimización de hover en dispositivos táctiles */
        @media (hover: hover) and (pointer: fine) {
          .hover\:bg-gray-50:hover {
            background-color: rgb(249 250 251);
          }

          .hover\:bg-gray-100:hover {
            background-color: rgb(243 244 246);
          }

          .hover\:bg-gray-200:hover {
            background-color: rgb(229 231 235);
          }

          .hover\:bg-gray-300:hover {
            background-color: rgb(209 213 219);
          }

          .hover\:bg-indigo-700:hover {
            background-color: rgb(67 56 202);
          }
        }

        /* Mejora de legibilidad en textos pequeños */
        .text-xs,
        .text-sm {
          letter-spacing: 0.025em;
        }

        /* Optimización de sombras en cards */
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -4px rgba(0, 0, 0, 0.1);
        }

        /* Mejora de contraste en bordes */
        .border-gray-200 {
          border-color: rgb(229 231 235);
        }

        /* Prevenir layout shift */
        img[width][height] {
          height: auto;
        }

        /* Mejora de rendimiento en listas largas */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Optimización de animaciones */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Mejora de accesibilidad para lectores de pantalla */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Optimización de rendimiento en scroll */
        .overflow-x-auto,
        .overflow-y-auto {
          scroll-behavior: smooth;
        }

        /* Mejora de contraste en estados disabled */
        button:disabled,
        input:disabled,
        select:disabled,
        textarea:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Prevenir doble tap zoom en iOS */
        button,
        a {
          touch-action: manipulation;
        }

        /* Mejora de espaciado en grids responsive */
        @media (max-width: 640px) {
          .grid {
            gap: 0.75rem;
          }
        }

        /* Optimización de carga de fuentes */
        @font-face {
          font-display: swap;
        }

        /* Mejora de contraste en gradientes */
        .bg-gradient-to-r {
          background-image: linear-gradient(
            to right,
            var(--tw-gradient-stops)
          );
        }

        .bg-gradient-to-br {
          background-image: linear-gradient(
            to bottom right,
            var(--tw-gradient-stops)
          );
        }

        /* Optimización de rendimiento en backdrop-blur */
        .backdrop-blur-sm,
        .backdrop-blur-xl {
          -webkit-backdrop-filter: blur(var(--tw-backdrop-blur));
          backdrop-filter: blur(var(--tw-backdrop-blur));
        }

        /* Mejora de legibilidad en textos sobre gradientes */
        .text-white {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        /* Prevenir overflow en contenedores principales */
        main {
          overflow-x: hidden;
        }

        /* Mejora de espaciado en elementos interactivos */
        button,
        a,
        input[type="checkbox"],
        input[type="radio"] {
          min-height: 44px;
          min-width: 44px;
        }

        @media (max-width: 640px) {
          button,
          a {
            min-height: 48px;
          }
        }

        /* Optimización de rendimiento en sombras */
        .shadow-xl,
        .shadow-2xl {
          will-change: box-shadow;
        }

        /* Mejora de contraste en estados hover */
        @media (hover: hover) {
          .hover\:shadow:hover,
          .hover\:shadow-md:hover,
          .hover\:shadow-lg:hover {
            transition: box-shadow 0.2s ease-in-out;
          }
        }

        /* Prevenir selección accidental en elementos interactivos */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Mejora de rendimiento en transformaciones */
        .transform {
          transform: translateZ(0);
        }

        /* Optimización de carga de imágenes */
        img[loading="lazy"] {
          content-visibility: auto;
        }

        /* Mejora de espaciado en formularios */
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Prevenir flash de contenido sin estilo */
        html {
          visibility: visible;
          opacity: 1;
        }

        /* Mejora de contraste en estados focus */
        *:focus {
          outline-offset: 2px;
        }

        /* Optimización de rendimiento en animaciones de escala */
        .hover\:scale-105:hover,
        .hover\:scale-110:hover {
          transform: scale(var(--tw-scale-x, 1.05)) translateZ(0);
        }

        /* Mejora de legibilidad en textos largos */
        p,
        li {
          line-height: 1.6;
        }

        /* Prevenir overflow en tablas */
        table {
          table-layout: fixed;
          width: 100%;
        }

        /* Mejora de espaciado en badges */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Optimización de rendimiento en modales */
        .fixed {
          position: fixed;
          backface-visibility: hidden;
        }

        /* Mejora de contraste en estados activos */
        button:active,
        a:active {
          transform: scale(0.98);
        }

        /* Prevenir layout shift en imágenes */
        img {
          display: block;
          max-width: 100%;
          height: auto;
        }

        /* Mejora de rendimiento en listas virtualizadas */
        .virtualized-list {
          contain: layout style paint;
        }

        /* Optimización de carga crítica */
        .critical-css {
          content-visibility: auto;
          contain-intrinsic-size: auto 500px;
        }

        /* Mejora de accesibilidad en controles de formulario */
        label {
          cursor: pointer;
        }

        /* Prevenir zoom en inputs en Safari iOS */
        @supports (-webkit-touch-callout: none) {
          input[type="text"],
          input[type="email"],
          input[type="tel"],
          input[type="number"],
          input[type="date"],
          select,
          textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </MedicoLayout>
  );
}
