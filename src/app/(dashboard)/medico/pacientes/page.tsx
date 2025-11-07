// app/(dashboard)/medico/pacientes/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  User,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Activity,
  FileText,
  Pill,
  TestTube,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  LogOut,
  Home,
  Stethoscope,
  MessageSquare,
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
    id_medico: number;
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
  grupo_sanguineo: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "desconocido";
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
  // ========================================
  // ESTADOS
  // ========================================

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPacientes | null>(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);

  // UI States
  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [vistaModo, setVistaModo] = useState<VistaModo>("grid");
  const [busqueda, setBusqueda] = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo>("nombre");
  const [ordenDireccion, setOrdenDireccion] = useState<OrdenDireccion>("asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(20);
  const [totalPacientes, setTotalPacientes] = useState(0);

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

  // Formulario nuevo paciente
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

  // Sidebar
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario?.medico) {
      cargarDatosPacientes();
    }
  }, [usuario, filtros, ordenCampo, ordenDireccion, paginaActual, itemsPorPagina]);

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${tema.colores.fondo} min-h-screen transition-all duration-500`;
  }, [tema]);

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
    if (!usuario?.medico?.id_medico) return;

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

  // ========================================
  // FUNCIONES AUXILIARES
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

  const cerrarSesion = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ========================================
  // FUNCIONES DE ACCIONES
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

    if (formularioPaciente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formularioPaciente.email)) {
      errores.email = "Email inválido";
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

    const payload = {
      ...formularioPaciente,
      rut: formularioPaciente.rut.replace(/[^0-9kK]/g, ""),
      peso_kg: formularioPaciente.peso_kg ? parseFloat(formularioPaciente.peso_kg) : null,
      altura_cm: formularioPaciente.altura_cm ? parseFloat(formularioPaciente.altura_cm) : null,
      imc: imc > 0 ? imc : null,
      id_centro_registro: usuario?.medico?.id_centro_principal,
    };

    const url = pacienteSeleccionado
      ? `/api/medico/pacientes/${pacienteSeleccionado.id_paciente}`
      : "/api/medico/pacientes/crear";

    const response = await fetch(url, {
      method: pacienteSeleccionado ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(
        pacienteSeleccionado
          ? "Paciente actualizado correctamente"
          : "Paciente registrado correctamente"
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
      rut: paciente.rut,
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
  // RENDER - LOADING
  // ========================================

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}>
          <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-4" />
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Acceso No Autorizado</h2>
          <Link href="/login" className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold`}>
            <LogOut className="w-5 h-5" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER - MÓDULO COMPLETO
  // ========================================

  return (
    <div className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${sidebarAbierto ? "w-20" : "w-0"} ${tema.colores.sidebar} ${tema.colores.borde} border-r ${tema.colores.sombra}`}>
        {sidebarAbierto && (
          <div className="flex flex-col h-full items-center py-6 gap-4">
            <Link href="/medico" className={`w-12 h-12 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110`}>
              <Stethoscope className="w-6 h-6 text-white" />
            </Link>

            <div className="flex-1 flex flex-col gap-2 w-full px-2">
              <Link href="/medico" className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}>
                <Home className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>

              <Link href="/medico/agenda" className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}>
                <Calendar className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>

              <Link href="/medico/pacientes" className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r ${tema.colores.gradiente} shadow-lg`}>
                <Users className="w-6 h-6 text-white" />
              </Link>

              <Link href="/medico/mensajes" className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}>
                <MessageSquare className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>

              <Link href="/medico/configuracion" className={`w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${tema.colores.hover} group`}>
                <Settings className={`w-6 h-6 ${tema.colores.texto} group-hover:scale-110 transition-transform`} />
              </Link>
            </div>

            <button onClick={cerrarSesion} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-red-500/20 group`}>
              <LogOut className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </aside>

      {/* HEADER */}
      <header className={`fixed top-0 right-0 z-40 transition-all duration-300 ${sidebarAbierto ? "left-20" : "left-0"} ${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra}`}>
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            {usuario.medico.centro_principal.logo_url ? (
              <Image src={usuario.medico.centro_principal.logo_url} alt={usuario.medico.centro_principal.nombre} width={64} height={64} className="rounded-xl" />
            ) : (
              <div className={`w-16 h-16 bg-gradient-to-br ${tema.colores.gradiente} rounded-xl flex items-center justify-center shadow-lg`}>
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h2 className={`text-xl font-black ${tema.colores.texto}`}>{usuario.medico.centro_principal.nombre}</h2>
              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                {usuario.medico.centro_principal.ciudad}, {usuario.medico.centro_principal.region}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-sm font-bold ${tema.colores.texto}`}>
                Dr. {usuario.nombre} {usuario.apellido_paterno}
              </p>
              <p className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>
                {usuario.medico.especialidades[0]?.nombre || "Médico"}
              </p>
            </div>

            <button onClick={() => setPerfilAbierto(!perfilAbierto)} className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
              {usuario.foto_perfil_url ? (
                <Image src={usuario.foto_perfil_url} alt={usuario.nombre} width={56} height={56} className="rounded-xl object-cover" />
              ) : (
                `${usuario.nombre[0]}${usuario.apellido_paterno[0]}`
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className={`transition-all duration-300 ${sidebarAbierto ? "ml-20" : "ml-0"} pt-24 p-8`}>
        {/* TÍTULO */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-5xl font-black mb-2 ${tema.colores.texto} flex items-center gap-3`}>
                <Users className="w-12 h-12" />
                Mis Pacientes
              </h1>
              <p className={`text-xl font-semibold ${tema.colores.textoSecundario}`}>
                Gestión integral de pacientes del centro
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => cargarDatosPacientes()} className={`flex items-center gap-2 px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}>
                <RefreshCw className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`} />
                Actualizar
              </button>

              <button onClick={handleNuevoPaciente} className={`flex items-center gap-2 px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 ${tema.colores.sombra}`}>
                <UserPlus className="w-5 h-5" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <UserCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>{estadisticas.total_pacientes}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>Total Pacientes</div>
            </div>

            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>{estadisticas.pacientes_activos}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>Activos</div>
            </div>

            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <Plus className="w-5 h-5 text-purple-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>{estadisticas.pacientes_nuevos_mes}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>Nuevos Este Mes</div>
            </div>

            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>{estadisticas.pacientes_vip}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>VIP</div>
            </div>

            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>{estadisticas.pacientes_criticos}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>Críticos</div>
            </div>

            <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className={`text-4xl font-black mb-1 ${tema.colores.texto}`}>{estadisticas.citas_programadas}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${tema.colores.textoSecundario}`}>Citas Próximas</div>
            </div>
          </div>
        )}

        {/* CONTROLES Y BÚSQUEDA */}
        <div className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} mb-8`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 w-full lg:max-w-2xl">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${tema.colores.textoSecundario}`} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, RUT, email, teléfono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} placeholder:${tema.colores.textoSecundario} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                />
                {busqueda && (
                  <button onClick={() => setBusqueda("")} className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg ${tema.colores.hover}`}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-800/30 rounded-xl p-1">
                <button onClick={() => setVistaModo("grid")} className={`p-2 rounded-lg transition-all duration-300 ${vistaModo === "grid" ? `${tema.colores.primario} text-white` : `${tema.colores.hover} ${tema.colores.texto}`}`}>
                  <Grid className="w-5 h-5" />
                </button>
                <button onClick={() => setVistaModo("lista")} className={`p-2 rounded-lg transition-all duration-300 ${vistaModo === "lista" ? `${tema.colores.primario} text-white` : `${tema.colores.hover} ${tema.colores.texto}`}`}>
                  <List className="w-5 h-5" />
                </button>
                <button onClick={() => setVistaModo("tabla")} className={`p-2 rounded-lg transition-all duration-300 ${vistaModo === "tabla" ? `${tema.colores.primario} text-white` : `${tema.colores.hover} ${tema.colores.texto}`}`}>
                  <Columns className="w-5 h-5" />
                </button>
              </div>

              <button onClick={() => setFiltrosAbiertos(!filtrosAbiertos)} className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105 relative`}>
                <Filter className="w-5 h-5" />
                {(filtros.estados.length > 0 || filtros.generos.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {filtros.estados.length + filtros.generos.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* PANEL DE FILTROS */}
          {filtrosAbiertos && (
            <div className={`mt-6 p-6 rounded-xl ${tema.colores.card} ${tema.colores.borde} border`}>
              <h4 className={`text-lg font-black mb-4 ${tema.colores.texto}`}>Filtros Avanzados</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Estado</label>
                  <div className="space-y-2">
                    {["activo", "inactivo", "bloqueado"].map((estado) => (
                      <label key={estado} className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={filtros.estados.includes(estado)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({ ...filtros, estados: [...filtros.estados, estado] });
                            } else {
                              setFiltros({ ...filtros, estados: filtros.estados.filter((e) => e !== estado) });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto} capitalize`}>{estado}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Género</label>
                  <div className="space-y-2">
                    {["masculino", "femenino"].map((genero) => (
                      <label key={genero} className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={filtros.generos.includes(genero)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({ ...filtros, generos: [...filtros.generos, genero] });
                            } else {
                              setFiltros({ ...filtros, generos: filtros.generos.filter((g) => g !== genero) });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-semibold ${tema.colores.texto} capitalize`}>{genero}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Características</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}>
                      <input type="checkbox" checked={filtros.es_vip === true} onChange={(e) => setFiltros({ ...filtros, es_vip: e.target.checked ? true : null })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>Solo VIP</span>
                    </label>
                    <label className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}>
                      <input type="checkbox" checked={filtros.con_alergias === true} onChange={(e) => setFiltros({ ...filtros, con_alergias: e.target.checked ? true : null })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>Con Alergias</span>
                    </label>
                    <label className={`flex items-center gap-2 p-2 rounded-lg ${tema.colores.hover} cursor-pointer`}>
                      <input type="checkbox" checked={filtros.con_cronicas === true} onChange={(e) => setFiltros({ ...filtros, con_cronicas: e.target.checked ? true : null })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className={`text-sm font-semibold ${tema.colores.texto}`}>Condiciones Crónicas</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Rango de Edad</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Edad mínima"
                      value={filtros.edad_min || ""}
                      onChange={(e) => setFiltros({ ...filtros, edad_min: e.target.value ? parseInt(e.target.value) : null })}
                      className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    />
                    <input
                      type="number"
                      placeholder="Edad máxima"
                      value={filtros.edad_max || ""}
                      onChange={(e) => setFiltros({ ...filtros, edad_max: e.target.value ? parseInt(e.target.value) : null })}
                      className={`w-full px-3 py-2 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() =>
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
                    })
                  }
                  className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
                >
                  Limpiar Filtros
                </button>

                <button onClick={() => setFiltrosAbiertos(false)} className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}>
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE PACIENTES */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className={`text-lg font-semibold ${tema.colores.textoSecundario}`}>Cargando pacientes...</p>
            </div>
          </div>
        ) : (
          <>
            {/* VISTA GRID */}
            {vistaModo === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pacientes.length === 0 ? (
                  <div className={`col-span-full rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}>
                    <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>No hay pacientes</h3>
                    <p className={`text-lg ${tema.colores.textoSecundario} mb-6`}>Comienza agregando tu primer paciente</p>
                    <button onClick={handleNuevoPaciente} className={`px-8 py-4 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105`}>
                      <UserPlus className="w-5 h-5 inline-block mr-2" />
                      Nuevo Paciente
                    </button>
                  </div>
                ) : (
                  pacientes.map((paciente) => (
                    <div key={paciente.id_paciente} className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-105 cursor-pointer group`} onClick={() => handleVerDetalle(paciente)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                            {paciente.foto_url ? <Image src={paciente.foto_url} alt={paciente.nombre_completo} width={80} height={80} className="rounded-xl object-cover" /> : `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`}
                          </div>
                          {paciente.es_vip && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <Star className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerColorEstado(paciente.estado)}`}>{paciente.estado}</span>
                      </div>

                      <h3 className={`text-xl font-black mb-1 ${tema.colores.texto} truncate`}>{paciente.nombre_completo}</h3>

                      <div className="space-y-2 mb-4">
                        <p className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}>
                          <Cake className="w-4 h-4" />
                          {paciente.edad} años · {paciente.genero}
                        </p>
                        <p className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}>
                          <Droplet className="w-4 h-4" />
                          {paciente.grupo_sanguineo}
                        </p>
                        {paciente.telefono && (
                          <p className={`text-sm font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}>
                            <Phone className="w-4 h-4" />
                            {paciente.telefono}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {paciente.alergias_criticas > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {paciente.alergias_criticas} alergias
                          </span>
                        )}
                        {paciente.condiciones_cronicas > 0 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold">
                            <Heart className="w-3 h-3" />
                            {paciente.condiciones_cronicas} crónicas
                          </span>
                        )}
                        {paciente.clasificacion_riesgo && <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${obtenerColorRiesgo(paciente.clasificacion_riesgo)}`}>{paciente.clasificacion_riesgo}</span>}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className={`text-center p-2 rounded-lg ${tema.colores.secundario}`}>
                          <div className={`text-lg font-black ${tema.colores.texto}`}>{paciente.total_consultas}</div>
                          <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Consultas</div>
                        </div>
                        <div className={`text-center p-2 rounded-lg ${tema.colores.secundario}`}>
                          <div className={`text-lg font-black ${tema.colores.texto}`}>{paciente.medicamentos_activos}</div>
                          <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Medicinas</div>
                        </div>
                        <div className={`text-center p-2 rounded-lg ${tema.colores.secundario}`}>
                          <div className={`text-lg font-black ${tema.colores.texto}`}>{paciente.examenes_pendientes}</div>
                          <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Exámenes</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerDetalle(paciente);
                          }}
                          className={`flex-1 px-4 py-2 ${tema.colores.primario} text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
                        >
                          <Eye className="w-4 h-4" />
                          Ver Ficha
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarPaciente(paciente);
                          }}
                          className={`p-2 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* VISTA LISTA - Similar estructura */}
            {vistaModo === "lista" && (
              <div className="space-y-4">
                {pacientes.length === 0 ? (
                  <div className={`rounded-2xl p-12 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} text-center`}>
                    <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-2xl font-black mb-2 ${tema.colores.texto}`}>No hay pacientes</h3>
                    <button onClick={handleNuevoPaciente} className={`px-8 py-4 ${tema.colores.primario} text-white rounded-xl font-bold`}>
                      <UserPlus className="w-5 h-5 inline-block mr-2" />
                      Nuevo Paciente
                    </button>
                  </div>
                ) : (
                  pacientes.map((paciente) => (
                    <div key={paciente.id_paciente} className={`rounded-2xl p-6 ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} transition-all duration-300 hover:scale-[1.01] cursor-pointer`} onClick={() => handleVerDetalle(paciente)}>
                      <div className="flex items-center gap-6">
                        <div className="relative flex-shrink-0">
                          <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-3xl shadow-lg`}>
                            {paciente.foto_url ? <Image src={paciente.foto_url} alt={paciente.nombre_completo} width={96} height={96} className="rounded-xl object-cover" /> : `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`}
                          </div>
                          {paciente.es_vip && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                              <Star className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className={`text-2xl font-black ${tema.colores.texto} mb-1`}>{paciente.nombre_completo}</h3>
                              <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                                RUT: {paciente.rut} · {paciente.edad} años · {paciente.genero}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerColorEstado(paciente.estado)}`}>{paciente.estado}</span>
                              {paciente.clasificacion_riesgo && <span className={`px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorRiesgo(paciente.clasificacion_riesgo)}`}>Riesgo: {paciente.clasificacion_riesgo}</span>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                              <Droplet className={`w-4 h-4 ${tema.colores.acento}`} />
                              <span className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.grupo_sanguineo}</span>
                            </div>
                            {paciente.telefono && (
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                <Phone className={`w-4 h-4 ${tema.colores.acento}`} />
                                <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>{paciente.telefono}</span>
                              </div>
                            )}
                            {paciente.email && (
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                <Mail className={`w-4 h-4 ${tema.colores.acento}`} />
                                <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>{paciente.email}</span>
                              </div>
                            )}
                            {paciente.ciudad && (
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tema.colores.secundario}`}>
                                <MapPin className={`w-4 h-4 ${tema.colores.acento}`} />
                                <span className={`text-sm font-bold ${tema.colores.texto} truncate`}>{paciente.ciudad}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className={`text-2xl font-black ${tema.colores.texto}`}>{paciente.total_consultas}</div>
                                <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Consultas</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-2xl font-black ${tema.colores.texto}`}>{paciente.medicamentos_activos}</div>
                                <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Medicinas</div>
                              </div>
                              <div className="text-center">
                                <div className={`text-2xl font-black ${tema.colores.texto}`}>{paciente.examenes_pendientes}</div>
                                <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>Exámenes</div>
                              </div>
                              {paciente.alergias_criticas > 0 && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold">
                                  <AlertCircle className="w-4 h-4" />
                                  {paciente.alergias_criticas} alergias
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerDetalle(paciente);
                                }}
                                className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
                              >
                                <Eye className="w-4 h-4" />
                                Ver Ficha
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarPaciente(paciente);
                                }}
                                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} transition-all duration-300 hover:scale-105`}
                              >
                                <Edit className="w-5 h-5" />
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
              <div className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${tema.colores.secundario}`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-bold ${tema.colores.texto} uppercase tracking-wider cursor-pointer hover:bg-indigo-500/10`} onClick={() => cambiarOrden("nombre")}>
                          <div className="flex items-center gap-2">
                            Paciente
                            {ordenCampo === "nombre" && <ArrowUpDown className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-bold ${tema.colores.texto} uppercase tracking-wider cursor-pointer hover:bg-indigo-500/10`} onClick={() => cambiarOrden("edad")}>
                          <div className="flex items-center gap-2">
                            Edad
                            {ordenCampo === "edad" && <ArrowUpDown className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-bold ${tema.colores.texto} uppercase tracking-wider`}>Contacto</th>
                        <th className={`px-6 py-4 text-left text-xs font-bold ${tema.colores.texto} uppercase tracking-wider`}>Grupo Sanguíneo</th>
                        <th className={`px-6 py-4 text-left text-xs font-bold ${tema.colores.texto} uppercase tracking-wider cursor-pointer hover:bg-indigo-500/10`} onClick={() => cambiarOrden("estado")}>
                          <div className="flex items-center gap-2">
                            Estado
                            {ordenCampo === "estado" && <ArrowUpDown className="w-4 h-4" />}
                          </div>
                        </th>
                        <th className={`px-6 py-4 text-center text-xs font-bold ${tema.colores.texto} uppercase tracking-wider`}>Consultas</th>
                        <th className={`px-6 py-4 text-right text-xs font-bold ${tema.colores.texto} uppercase tracking-wider`}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tema.colores.borde}`}>
                      {pacientes.map((paciente) => (
                        <tr key={paciente.id_paciente} className={`${tema.colores.hover} transition-colors cursor-pointer`} onClick={() => handleVerDetalle(paciente)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold shadow`}>{paciente.foto_url ? <Image src={paciente.foto_url} alt={paciente.nombre_completo} width={40} height={40} className="rounded-lg object-cover" /> : `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`}</div>
                              <div>
                                <div className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.nombre_completo}</div>
                                <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>{paciente.rut}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.edad} años</div>
                            <div className={`text-xs font-semibold ${tema.colores.textoSecundario}`}>{paciente.genero}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {paciente.telefono && (
                              <div className={`text-sm font-semibold ${tema.colores.texto} flex items-center gap-2 mb-1`}>
                                <Phone className="w-3 h-3" />
                                {paciente.telefono}
                              </div>
                            )}
                            {paciente.email && (
                              <div className={`text-xs font-semibold ${tema.colores.textoSecundario} flex items-center gap-2`}>
                                <Mail className="w-3 h-3" />
                                {paciente.email}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400`}>{paciente.grupo_sanguineo}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${obtenerColorEstado(paciente.estado)}`}>{paciente.estado}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className={`text-lg font-black ${tema.colores.texto}`}>{paciente.total_consultas}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerDetalle(paciente);
                                }}
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                              >
                                <Eye className={`w-4 h-4 ${tema.colores.texto}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarPaciente(paciente);
                                }}
                                className={`p-2 rounded-lg ${tema.colores.hover} transition-all duration-300 hover:scale-110`}
                              >
                                <Edit className={`w-4 h-4 ${tema.colores.texto}`} />
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
              <div className={`mt-8 flex items-center justify-between p-6 rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra}`}>
                <div className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                  Mostrando {(paginaActual - 1) * itemsPorPagina + 1} - {Math.min(paginaActual * itemsPorPagina, totalPacientes)} de {totalPacientes} pacientes
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1} className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${paginaActual === 1 ? `${tema.colores.secundario} opacity-50 cursor-not-allowed` : `${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}`}>
                    <ChevronLeft className="w-5 h-5" />
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
                        <button key={i} onClick={() => setPaginaActual(pageNum)} className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${paginaActual === pageNum ? `bg-gradient-to-r ${tema.colores.gradiente} text-white ${tema.colores.sombra}` : `${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} disabled={paginaActual === totalPaginas} className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${paginaActual === totalPaginas ? `${tema.colores.secundario} opacity-50 cursor-not-allowed` : `${tema.colores.secundario} ${tema.colores.texto} hover:scale-105`}`}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <select value={itemsPorPagina} onChange={(e) => {setItemsPorPagina(parseInt(e.target.value));setPaginaActual(1);}} className={`px-4 py-2 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL NUEVO/EDITAR PACIENTE */}
      {(modalNuevoPaciente || modalEditarPaciente) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className={`${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
            {/* HEADER DEL MODAL */}
            <div className={`px-8 py-6 border-b ${tema.colores.borde} flex items-center justify-between bg-gradient-to-r ${tema.colores.gradiente}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white">{pacienteSeleccionado ? "Editar Paciente" : "Nuevo Paciente"}</h3>
                  <p className="text-white/80 font-semibold">Complete los datos del paciente</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalNuevoPaciente(false);
                  setModalEditarPaciente(false);
                  setPacienteSeleccionado(null);
                }}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* CONTENIDO DEL MODAL */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RUT */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
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
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${erroresFormulario.rut ? "border-red-500" : ""} ${pacienteSeleccionado ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {erroresFormulario.rut && <p className="text-red-500 text-xs mt-1">{erroresFormulario.rut}</p>}
                </div>

                {/* NOMBRE */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.nombre}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, nombre: e.target.value })}
                    placeholder="Juan"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${erroresFormulario.nombre ? "border-red-500" : ""}`}
                  />
                  {erroresFormulario.nombre && <p className="text-red-500 text-xs mt-1">{erroresFormulario.nombre}</p>}
                </div>

                {/* APELLIDO PATERNO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Apellido Paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formularioPaciente.apellido_paterno}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, apellido_paterno: e.target.value })}
                    placeholder="Pérez"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${erroresFormulario.apellido_paterno ? "border-red-500" : ""}`}
                  />
                  {erroresFormulario.apellido_paterno && <p className="text-red-500 text-xs mt-1">{erroresFormulario.apellido_paterno}</p>}
                </div>

                {/* APELLIDO MATERNO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Apellido Materno</label>
                  <input
                    type="text"
                    value={formularioPaciente.apellido_materno}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, apellido_materno: e.target.value })}
                    placeholder="González"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* FECHA DE NACIMIENTO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formularioPaciente.fecha_nacimiento}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, fecha_nacimiento: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${erroresFormulario.fecha_nacimiento ? "border-red-500" : ""}`}
                  />
                  {erroresFormulario.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{erroresFormulario.fecha_nacimiento}</p>}
                </div>

                {/* GÉNERO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>
                    Género <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formularioPaciente.genero}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, genero: e.target.value as any })}
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no_binario">No Binario</option>
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                  </select>
                </div>

                {/* EMAIL */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Email</label>
                  <input
                    type="email"
                    value={formularioPaciente.email}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, email: e.target.value })}
                    placeholder="juan.perez@email.com"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${erroresFormulario.email ? "border-red-500" : ""}`}
                  />
                  {erroresFormulario.email && <p className="text-red-500 text-xs mt-1">{erroresFormulario.email}</p>}
                </div>

                {/* TELÉFONO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Teléfono</label>
                  <input
                    type="tel"
                    value={formularioPaciente.telefono}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, telefono: e.target.value })}
                    placeholder="+56 2 1234 5678"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* CELULAR */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Celular</label>
                  <input
                    type="tel"
                    value={formularioPaciente.celular}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, celular: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* DIRECCIÓN */}
                <div className="md:col-span-2">
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Dirección</label>
                  <input
                    type="text"
                    value={formularioPaciente.direccion}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, direccion: e.target.value })}
                    placeholder="Av. Libertador 1234"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* CIUDAD */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Ciudad</label>
                  <input
                    type="text"
                    value={formularioPaciente.ciudad}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, ciudad: e.target.value })}
                    placeholder="Santiago"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* REGIÓN */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Región</label>
                  <input
                    type="text"
                    value={formularioPaciente.region}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, region: e.target.value })}
                    placeholder="Región Metropolitana"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* GRUPO SANGUÍNEO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Grupo Sanguíneo</label>
                  <select
                    value={formularioPaciente.grupo_sanguineo}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, grupo_sanguineo: e.target.value as any })}
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
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

                {/* PESO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formularioPaciente.peso_kg}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, peso_kg: e.target.value })}
                    placeholder="70.5"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* ALTURA */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Altura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formularioPaciente.altura_cm}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, altura_cm: e.target.value })}
                    placeholder="170"
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                {/* CLASIFICACIÓN DE RIESGO */}
                <div>
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Clasificación de Riesgo</label>
                  <select
                    value={formularioPaciente.clasificacion_riesgo || ""}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, clasificacion_riesgo: e.target.value as any || null })}
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  >
                    <option value="">Sin clasificar</option>
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>

                {/* ES VIP */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <input
                    type="checkbox"
                    checked={formularioPaciente.es_vip}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, es_vip: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <label className={`font-bold ${tema.colores.texto} flex items-center gap-2`}>
                    <Star className="w-5 h-5 text-yellow-500" />
                    Paciente VIP
                  </label>
                </div>

                {/* NOTAS IMPORTANTES */}
                <div className="md:col-span-2">
                  <label className={`text-sm font-bold mb-2 block ${tema.colores.texto}`}>Notas Importantes</label>
                  <textarea
                    value={formularioPaciente.notas_importantes}
                    onChange={(e) => setFormularioPaciente({ ...formularioPaciente, notas_importantes: e.target.value })}
                    placeholder="Información adicional relevante..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.texto} focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER DEL MODAL */}
            <div className={`px-8 py-6 border-t ${tema.colores.borde} flex items-center justify-end gap-4`}>
              <button
                onClick={() => {
                  setModalNuevoPaciente(false);
                  setModalEditarPaciente(false);
                  setPacienteSeleccionado(null);
                }}
                className={`px-6 py-3 ${tema.colores.secundario} ${tema.colores.texto} rounded-xl font-bold transition-all duration-300 hover:scale-105`}
              >
                Cancelar
              </button>
              <button onClick={handleGuardarPaciente} disabled={guardandoPaciente} className={`px-6 py-3 ${tema.colores.primario} text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${guardandoPaciente ? "opacity-50 cursor-not-allowed" : ""}`}>
                {guardandoPaciente ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {pacienteSeleccionado ? "Actualizar" : "Guardar"} Paciente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}