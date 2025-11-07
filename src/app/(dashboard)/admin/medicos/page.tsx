"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Stethoscope,
  Clock,
  Users,
  Star,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  UserCheck,
  Activity,
  TrendingUp,
  Heart,
  Video,
  Zap,
  SlidersHorizontal,
  Download,
  Sun,
  Moon,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// 🔽 IMPORT MODALES
import ModalCrearMedico from "@/components/admin/medicos/ModalCrearMedico";
import ModalEditarMedico from "@/components/admin/medicos/ModalEditarMedico";
import ModalEliminarMedico from "@/components/admin/medicos/ModalEliminarMedico";
import ModalDetallesMedico from "@/components/admin/medicos/ModalDetallesMedico";

// ========================================
// TIPOS - deben reflejar el backend (route.ts)
// ========================================

interface Medico {
  id_medico: number;
  id_usuario: number;
  id_centro_principal: number;
  numero_registro_medico: string;
  titulo_profesional: string;
  universidad: string;
  ano_graduacion: number;
  biografia: string | null;
  acepta_nuevos_pacientes: boolean;
  atiende_particular: boolean;
  atiende_fonasa: boolean;
  atiende_isapre: boolean;
  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;
  firma_digital_url: string | null;
  duracion_consulta_min: number;
  fecha_inicio_actividad: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;

  usuario: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    email: string;
    telefono: string | null;
    celular: string | null;
    foto_perfil_url: string | null;
    rut: string;
    fecha_nacimiento: string | null;
    genero: string | null;
  };

  centro_principal: {
    nombre: string;
    ciudad: string;
    region: string;
  };

  especialidades: Array<{
    id_especialidad: number;
    nombre: string;
    codigo: string;
    es_principal: boolean;
    anos_experiencia: number | null;
  }>;

  total_pacientes: number;
  consultas_mes_actual: number;
  consultas_ano_actual: number;
  calificacion_promedio: number;
  total_resenas: number;
  proxima_cita: string | null;
  disponibilidad_semanal: number;
}

interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  area_medica: string | null;
  activo: boolean;
}

interface CentroMedico {
  id_centro: number;
  nombre: string;
  ciudad: string;
  region: string;
  direccion: string;
}

interface Filtros {
  busqueda: string;
  estado: string;
  especialidad: string;
  centro: string;
  acepta_nuevos: string;
  atiende_fonasa: string;
  atiende_isapre: string;
  telemedicina: string;
  calificacion_min: number;
}

interface FormularioMedico {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rut: string;
  email: string;
  telefono: string;
  celular: string;
  fecha_nacimiento: string;
  genero: string;

  numero_registro_medico: string;
  titulo_profesional: string;
  universidad: string;
  ano_graduacion: number;
  biografia: string;
  id_centro_principal: number;
  especialidades: number[];
  especialidad_principal: number;
  anos_experiencia: { [key: number]: number };

  acepta_nuevos_pacientes: boolean;
  atiende_particular: boolean;
  atiende_fonasa: boolean;
  atiende_isapre: boolean;
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;
  duracion_consulta_min: number;
  fecha_inicio_actividad: string;
  estado: string;
}

interface Estadisticas {
  total_medicos: number;
  medicos_activos: number;
  medicos_inactivos: number;
  medicos_vacaciones: number;
  medicos_suspendidos: number;
  total_especialidades: number;
  total_consultas_mes: number;
  calificacion_promedio_general: number;
  medicos_aceptan_nuevos: number;
  medicos_telemedicina: number;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function GestionMedicosPage() {
  // Datos
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicosOriginal, setMedicosOriginal] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [centros, setCentros] = useState<CentroMedico[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [vistaActual, setVistaActual] = useState<"grid" | "list">("grid");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Menú contextual por tarjeta (los 3 puntos)
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Medico | null>(
    null
  );

  // Filtros
  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: "",
    estado: "todos",
    especialidad: "todas",
    centro: "todos",
    acepta_nuevos: "todos",
    atiende_fonasa: "todos",
    atiende_isapre: "todos",
    telemedicina: "todos",
    calificacion_min: 0,
  });

  // Paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(12); // fijo por ahora

  // Ordenamiento
  const [ordenarPor, setOrdenarPor] = useState<
    "nombre" | "calificacion" | "pacientes" | "consultas" | "fecha"
  >("nombre");
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("asc");

  // Formulario creación/edición
  const [formulario, setFormulario] = useState<FormularioMedico>({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    rut: "",
    email: "",
    telefono: "",
    celular: "",
    fecha_nacimiento: "",
    genero: "masculino",
    numero_registro_medico: "",
    titulo_profesional: "",
    universidad: "",
    ano_graduacion: new Date().getFullYear(),
    biografia: "",
    id_centro_principal: 0,
    especialidades: [],
    especialidad_principal: 0,
    anos_experiencia: {},
    acepta_nuevos_pacientes: true,
    atiende_particular: true,
    atiende_fonasa: false,
    atiende_isapre: false,
    consulta_presencial: true,
    consulta_telemedicina: false,
    duracion_consulta_min: 30,
    fecha_inicio_actividad: "",
    estado: "activo",
  });

  // Validación + guardado
  const [erroresFormulario, setErroresFormulario] = useState<{
    [key: string]: string;
  }>({});
  const [guardando, setGuardando] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================

  // Cargar data inicial
  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros/orden cuando cambian dependencias
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, medicosOriginal, ordenarPor, ordenDireccion]);

  // Cerrar menú contextual al click afuera
  useEffect(() => {
    function handleClickOutside() {
      if (menuAbiertoId !== null) {
        setMenuAbiertoId(null);
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuAbiertoId]);

  // ========================================
  // DATA FETCH
  // ========================================

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/medicos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setMedicosOriginal(result.medicos || []);
        setMedicos(result.medicos || []);
        setEspecialidades(result.especialidades || []);
        setCentros(result.centros || []);
        setEstadisticas(result.estadisticas || null);
      } else {
        throw new Error(result.error || "Error al cargar datos");
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar datos. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FILTROS + ORDEN
  // ========================================

  const aplicarFiltros = () => {
    let resultado = [...medicosOriginal];

    // Texto libre
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (medico) =>
          medico.usuario.nombre.toLowerCase().includes(busqueda) ||
          medico.usuario.apellido_paterno.toLowerCase().includes(busqueda) ||
          medico.usuario.apellido_materno?.toLowerCase().includes(busqueda) ||
          medico.numero_registro_medico.toLowerCase().includes(busqueda) ||
          medico.usuario.email.toLowerCase().includes(busqueda) ||
          medico.especialidades.some((esp) =>
            esp.nombre.toLowerCase().includes(busqueda)
          )
      );
    }

    // Estado
    if (filtros.estado !== "todos") {
      resultado = resultado.filter(
        (medico) => medico.estado === filtros.estado
      );
    }

    // Especialidad
    if (filtros.especialidad !== "todas") {
      resultado = resultado.filter((medico) =>
        medico.especialidades.some(
          (esp) => esp.id_especialidad?.toString() === filtros.especialidad
        )
      );
    }

    // Centro
    if (filtros.centro !== "todos") {
      resultado = resultado.filter(
        (medico) => medico.id_centro_principal?.toString() === filtros.centro
      );
    }

    // Nuevos pacientes
    if (filtros.acepta_nuevos !== "todos") {
      const requiere = filtros.acepta_nuevos === "si";
      resultado = resultado.filter(
        (medico) => medico.acepta_nuevos_pacientes === requiere
      );
    }

    // FONASA
    if (filtros.atiende_fonasa !== "todos") {
      const requiere = filtros.atiende_fonasa === "si";
      resultado = resultado.filter(
        (medico) => medico.atiende_fonasa === requiere
      );
    }

    // ISAPRE
    if (filtros.atiende_isapre !== "todos") {
      const requiere = filtros.atiende_isapre === "si";
      resultado = resultado.filter(
        (medico) => medico.atiende_isapre === requiere
      );
    }

    // Telemedicina
    if (filtros.telemedicina !== "todos") {
      const requiere = filtros.telemedicina === "si";
      resultado = resultado.filter(
        (medico) => medico.consulta_telemedicina === requiere
      );
    }

    // Calificación mínima
    if (filtros.calificacion_min > 0) {
      resultado = resultado.filter(
        (medico) => medico.calificacion_promedio >= filtros.calificacion_min
      );
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let comparacion = 0;

      switch (ordenarPor) {
        case "nombre": {
          const nameA = `${a.usuario.nombre} ${a.usuario.apellido_paterno}`;
          const nameB = `${b.usuario.nombre} ${b.usuario.apellido_paterno}`;
          comparacion = nameA.localeCompare(nameB);
          break;
        }
        case "calificacion":
          comparacion = a.calificacion_promedio - b.calificacion_promedio;
          break;
        case "pacientes":
          comparacion = a.total_pacientes - b.total_pacientes;
          break;
        case "consultas":
          comparacion = a.consultas_mes_actual - b.consultas_mes_actual;
          break;
        case "fecha":
          comparacion =
            new Date(a.fecha_creacion).getTime() -
            new Date(b.fecha_creacion).getTime();
          break;
      }

      return ordenDireccion === "asc" ? comparacion : -comparacion;
    });

    setMedicos(resultado);
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos",
      especialidad: "todas",
      centro: "todos",
      acepta_nuevos: "todos",
      atiende_fonasa: "todos",
      atiende_isapre: "todos",
      telemedicina: "todos",
      calificacion_min: 0,
    });
  };

  // ========================================
  // CRUD
  // ========================================

  const validarFormulario = (): { [key: string]: string } => {
    const errores: { [key: string]: string } = {};

    if (!formulario.nombre.trim()) errores.nombre = "El nombre es requerido";
    if (!formulario.apellido_paterno.trim())
      errores.apellido_paterno = "El apellido paterno es requerido";
    if (!formulario.rut.trim()) errores.rut = "El RUT es requerido";
    if (!formulario.email.trim()) errores.email = "El email es requerido";
    if (!formulario.numero_registro_medico.trim())
      errores.numero_registro_medico = "El número de registro es requerido";
    if (!formulario.titulo_profesional.trim())
      errores.titulo_profesional = "El título profesional es requerido";
    if (!formulario.universidad.trim())
      errores.universidad = "La universidad es requerida";
    if (formulario.id_centro_principal === 0)
      errores.id_centro_principal = "Debe seleccionar un centro médico";
    if (formulario.especialidades.length === 0)
      errores.especialidades = "Debe seleccionar al menos una especialidad";

    return errores;
  };

  const crearMedico = async () => {
    try {
      setGuardando(true);
      setErroresFormulario({});

      const errores = validarFormulario();
      if (Object.keys(errores).length > 0) {
        setErroresFormulario(errores);
        return;
      }

      // Nota: el backend necesita id_usuario válido
      const response = await fetch("/api/admin/medicos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formulario),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al crear médico");
      }

      await cargarDatos();

      setModalCrear(false);
      resetearFormulario();

      alert("Médico creado exitosamente");
    } catch (error: any) {
      console.error("Error al crear médico:", error);
      alert(error.message || "Error al crear médico");
    } finally {
      setGuardando(false);
    }
  };

  const editarMedico = async () => {
    try {
      setGuardando(true);
      setErroresFormulario({});

      const errores = validarFormulario();
      if (Object.keys(errores).length > 0) {
        setErroresFormulario(errores);
        return;
      }

      if (!medicoSeleccionado) {
        throw new Error("No hay médico seleccionado");
      }

      const response = await fetch(
        `/api/admin/medicos/${medicoSeleccionado.id_medico}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formulario),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al actualizar médico");
      }

      await cargarDatos();

      setModalEditar(false);
      setMedicoSeleccionado(null);
      resetearFormulario();

      alert("Médico actualizado exitosamente");
    } catch (error: any) {
      console.error("Error al editar médico:", error);
      alert(error.message || "Error al editar médico");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMedico = async () => {
    try {
      setGuardando(true);

      if (!medicoSeleccionado) {
        throw new Error("No hay médico seleccionado");
      }

      const response = await fetch(
        `/api/admin/medicos/${medicoSeleccionado.id_medico}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al eliminar médico");
      }

      await cargarDatos();

      setModalEliminar(false);
      setMedicoSeleccionado(null);

      alert("Médico eliminado exitosamente");
    } catch (error: any) {
      console.error("Error al eliminar médico:", error);
      alert(error.message || "Error al eliminar médico");
    } finally {
      setGuardando(false);
    }
  };

  const resetearFormulario = () => {
    setFormulario({
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      rut: "",
      email: "",
      telefono: "",
      celular: "",
      fecha_nacimiento: "",
      genero: "masculino",
      numero_registro_medico: "",
      titulo_profesional: "",
      universidad: "",
      ano_graduacion: new Date().getFullYear(),
      biografia: "",
      id_centro_principal: 0,
      especialidades: [],
      especialidad_principal: 0,
      anos_experiencia: {},
      acepta_nuevos_pacientes: true,
      atiende_particular: true,
      atiende_fonasa: false,
      atiende_isapre: false,
      consulta_presencial: true,
      consulta_telemedicina: false,
      duracion_consulta_min: 30,
      fecha_inicio_actividad: "",
      estado: "activo",
    });
    setErroresFormulario({});
  };

  const cargarDatosMedicoEnFormulario = (medico: Medico) => {
    setFormulario({
      nombre: medico.usuario.nombre,
      apellido_paterno: medico.usuario.apellido_paterno,
      apellido_materno: medico.usuario.apellido_materno || "",
      rut: medico.usuario.rut,
      email: medico.usuario.email,
      telefono: medico.usuario.telefono || "",
      celular: medico.usuario.celular || "",
      fecha_nacimiento: medico.usuario.fecha_nacimiento || "",
      genero: medico.usuario.genero || "masculino",
      numero_registro_medico: medico.numero_registro_medico,
      titulo_profesional: medico.titulo_profesional,
      universidad: medico.universidad,
      ano_graduacion: medico.ano_graduacion,
      biografia: medico.biografia || "",
      id_centro_principal: medico.id_centro_principal,
      especialidades: medico.especialidades.map((e) => e.id_especialidad),
      especialidad_principal:
        medico.especialidades.find((e) => e.es_principal)?.id_especialidad ||
        0,
      anos_experiencia: medico.especialidades.reduce((acc, e) => {
        acc[e.id_especialidad] = e.anos_experiencia || 0;
        return acc;
      }, {} as { [key: number]: number }),
      acepta_nuevos_pacientes: medico.acepta_nuevos_pacientes,
      atiende_particular: medico.atiende_particular,
      atiende_fonasa: medico.atiende_fonasa,
      atiende_isapre: medico.atiende_isapre,
      consulta_presencial: medico.consulta_presencial,
      consulta_telemedicina: medico.consulta_telemedicina,
      duracion_consulta_min: medico.duracion_consulta_min,
      fecha_inicio_actividad: medico.fecha_inicio_actividad || "",
      estado: medico.estado,
    });
  };

  // ========================================
  // UTILIDADES
  // ========================================

  const exportarDatos = () => {
    if (medicos.length === 0) return;

    const data = medicos.map((medico) => ({
      ID: medico.id_medico,
      Nombre: `${medico.usuario.nombre} ${medico.usuario.apellido_paterno}`,
      RUT: medico.usuario.rut,
      Email: medico.usuario.email,
      Registro: medico.numero_registro_medico,
      Especialidad: medico.especialidades[0]?.nombre || "",
      Centro: medico.centro_principal.nombre,
      Estado: medico.estado,
      Pacientes: medico.total_pacientes,
      Consultas: medico.consultas_mes_actual,
      Calificación: medico.calificacion_promedio.toFixed(1),
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medicos-${new Date().getTime()}.csv`;
    a.click();
  };

  const obtenerColorEstado = (estado: string) => {
    const colores = {
      activo: darkMode
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-100 text-green-800 border-green-200",
      inactivo: darkMode
        ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
        : "bg-gray-100 text-gray-800 border-gray-200",
      vacaciones: darkMode
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-100 text-blue-800 border-blue-200",
      suspendido: darkMode
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-red-100 text-red-800 border-red-200",
    };
    return colores[estado as keyof typeof colores] || colores.activo;
  };

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case "activo":
        return <CheckCircle2 className="w-4 h-4" />;
      case "inactivo":
        return <XCircle className="w-4 h-4" />;
      case "vacaciones":
        return <Clock className="w-4 h-4" />;
      case "suspendido":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Paginación calculada
  const indiceUltimo = paginaActual * elementosPorPagina;
  const indicePrimero = indiceUltimo - elementosPorPagina;
  const medicosPaginados = medicos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(medicos.length / elementosPorPagina);

  // ========================================
  // RENDER
  // ========================================

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
            : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        }`}
      >
        <div className="text-center">
          <div className="relative mb-8">
            <div
              className={`w-24 h-24 border-4 rounded-full animate-spin ${
                darkMode
                  ? "border-indigo-400 border-t-transparent"
                  : "border-indigo-600 border-t-transparent"
              }`}
            ></div>
            <Stethoscope
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${
                darkMode ? "text-indigo-400" : "text-indigo-600"
              } animate-pulse`}
            />
          </div>
          <h2
            className={`text-3xl font-black mb-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Cargando Médicos
          </h2>
          <p
            className={`text-base ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            } font-medium`}
          >
            Obteniendo información del sistema...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-2xl transition-colors duration-300 ${
          darkMode
            ? "bg-gray-900/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Izquierda: volver + título */}
            <div className="flex items-center gap-3 md:gap-6">
              <Link
                href="/admin"
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 group ${
                  darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <ArrowLeft
                  className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                    darkMode
                      ? "text-indigo-400 group-hover:text-white"
                      : "text-indigo-600 group-hover:text-indigo-800"
                  }`}
                />
                <span
                  className={`text-xs md:text-sm font-semibold hidden sm:inline transition-colors ${
                    darkMode
                      ? "text-indigo-400 group-hover:text-white"
                      : "text-indigo-600 group-hover:text-indigo-800"
                  }`}
                >
                  Volver
                </span>
              </Link>

              <div
                className={`h-6 md:h-8 w-px hidden sm:block ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              ></div>

              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                  <Stethoscope className="w-5 h-5 md:w-8 md:h-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
                <div className="hidden md:block">
                  <h1
                    className={`text-xl md:text-2xl font-black tracking-tight ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Gestión de Médicos
                  </h1>
                  <p
                    className={`text-xs font-medium ${
                      darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}
                  >
                    Control total del personal médico
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones Header */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 md:p-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:scale-110 ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Moon className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>

              <button
                onClick={() => setModalCrear(true)}
                className="px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 font-bold shadow-lg hover:scale-105 text-xs md:text-sm"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Nuevo Médico</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 mb-6 md:mb-8">
            {/* Total Médicos */}
            <div
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 border-indigo-500/20"
                  : "bg-white border-indigo-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Users
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}
                />
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
              <div
                className={`text-2xl md:text-3xl font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {estadisticas.total_medicos}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Total Médicos
              </div>
            </div>

            {/* Activos */}
            <div
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 border-green-500/20"
                  : "bg-white border-green-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <UserCheck
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div
                className={`text-2xl md:text-3xl font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {estadisticas.medicos_activos}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                Activos
              </div>
            </div>

            {/* Especialidades distintas */}
            <div
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 border-purple-500/20"
                  : "bg-white border-purple-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Star
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div
                className={`text-2xl md:text-3xl font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {estadisticas.total_especialidades}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              >
                Especialidades
              </div>
            </div>

            {/* Consultas/Mes */}
            <div
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 border-blue-500/20"
                  : "bg-white border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Activity
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div
                className={`text-2xl md:text-3xl font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {estadisticas.total_consultas_mes}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Consultas/Mes
              </div>
            </div>

            {/* Calificación promedio general */}
            <div
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 border-yellow-500/20"
                  : "bg-white border-yellow-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Star
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                />
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <div
                className={`text-2xl md:text-3xl font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {estadisticas.calificacion_promedio_general.toFixed(1)}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                Calificación
              </div>
            </div>

            {/* Telemedicina */}
            <div
              className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-gray-800/50 border-cyan-500/20"
                  : "bg-white border-cyan-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Video
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    darkMode ? "text-cyan-400" : "text-cyan-600"
                  }`}
                />
                <Zap className="w-4 h-4 text-cyan-500" />
              </div>
              <div
                className={`text-2xl md:text-3xl font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {estadisticas.medicos_telemedicina}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  darkMode ? "text-cyan-400" : "text-cyan-600"
                }`}
              >
                Telemedicina
              </div>
            </div>
          </div>
        )}

        {/* Barra de Búsqueda y Filtros */}
        <div
          className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border mb-6 ${
            darkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, RUT, email, especialidad..."
                value={filtros.busqueda}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    busqueda: e.target.value,
                  })
                }
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              />
            </div>

            {/* Acciones de filtros/export/vista */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                  mostrarFiltros
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent"
                    : darkMode
                    ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </button>

              <button
                onClick={limpiarFiltros}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Limpiar
              </button>

              <button
                onClick={exportarDatos}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border flex items-center gap-2 ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Exportar</span>
              </button>

              <select
                value={vistaActual}
                onChange={(e) =>
                  setVistaActual(e.target.value as "grid" | "list")
                }
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-gray-300"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                <option value="grid">Vista Grid</option>
                <option value="list">Vista Lista</option>
              </select>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          {mostrarFiltros && (
            <div
              className={`pt-4 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Estado */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Estado
                  </label>
                  <select
                    value={filtros.estado}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        estado: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>

                {/* Especialidad */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Especialidad
                  </label>
                  <select
                    value={filtros.especialidad}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        especialidad: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todas">Todas las especialidades</option>
                    {especialidades.map((esp) => (
                      <option
                        key={esp.id_especialidad}
                        value={esp.id_especialidad}
                      >
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Centro */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Centro Médico
                  </label>
                  <select
                    value={filtros.centro}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        centro: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todos">Todos los centros</option>
                    {centros.map((centro) => (
                      <option key={centro.id_centro} value={centro.id_centro}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Acepta nuevos pacientes */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Acepta Nuevos
                  </label>
                  <select
                    value={filtros.acepta_nuevos}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        acepta_nuevos: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* FONASA */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Atiende FONASA
                  </label>
                  <select
                    value={filtros.atiende_fonasa}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        atiende_fonasa: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* ISAPRE */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Atiende ISAPRE
                  </label>
                  <select
                    value={filtros.atiende_isapre}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        atiende_isapre: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Telemedicina */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Telemedicina
                  </label>
                  <select
                    value={filtros.telemedicina}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        telemedicina: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 rounded-xl border transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="todos">Todos</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Calificación mínima */}
                <div>
                  <label
                    className={`block text-sm font-bold mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Calificación Mínima: {filtros.calificacion_min}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filtros.calificacion_min}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        calificacion_min: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span
                      className={darkMode ? "text-gray-500" : "text-gray-400"}
                    >
                      0
                    </span>
                    <span
                      className={darkMode ? "text-gray-500" : "text-gray-400"}
                    >
                      5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ordenamiento y contador resultados */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div
            className={`text-sm font-semibold ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Mostrando {indicePrimero + 1} -{" "}
            {Math.min(indiceUltimo, medicos.length)} de {medicos.length} médicos
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <label
              className={`text-sm font-semibold ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Ordenar por:
            </label>
            <select
              value={ordenarPor}
              onChange={(e) =>
                setOrdenarPor(
                  e.target.value as
                    | "nombre"
                    | "calificacion"
                    | "pacientes"
                    | "consultas"
                    | "fecha"
                )
              }
              className={`px-4 py-2 rounded-xl border transition-all duration-300 text-sm font-semibold ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="nombre">Nombre</option>
              <option value="calificacion">Calificación</option>
              <option value="pacientes">Pacientes</option>
              <option value="consultas">Consultas</option>
              <option value="fecha">Fecha Registro</option>
            </select>

            <button
              onClick={() =>
                setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc")
              }
              className={`p-2 rounded-xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-900 border border-gray-700 text-white hover:bg-gray-800"
                  : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              }`}
            >
              {ordenDireccion === "asc" ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* GRID view */}
        {vistaActual === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
            {medicosPaginados.map((medico) => (
              <div
                key={medico.id_medico}
                className={`group relative overflow-hidden rounded-2xl p-6 shadow-xl border transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-indigo-500/50"
                    : "bg-white border-gray-200 hover:border-indigo-300"
                }`}
              >
                {/* highlight gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* contenido card */}
                <div className="relative z-10">
                  {/* header avatar + menú contextual */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Avatar + estado */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {medico.usuario.foto_perfil_url ? (
                          <Image
                            src={medico.usuario.foto_perfil_url}
                            alt={medico.usuario.nombre}
                            width={64}
                            height={64}
                            className="rounded-xl object-cover"
                          />
                        ) : (
                          `${medico.usuario.nombre[0]}${medico.usuario.apellido_paterno[0]}`
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${obtenerColorEstado(
                          medico.estado
                        )} border-2 ${
                          darkMode ? "border-gray-800" : "border-white"
                        }`}
                      >
                        {obtenerIconoEstado(medico.estado)}
                      </div>
                    </div>

                    {/* Botón 3 puntitos + dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAbiertoId((prev) =>
                            prev === medico.id_medico ? null : medico.id_medico
                          );
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuAbiertoId === medico.id_medico && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border z-50 ${
                            darkMode
                              ? "bg-gray-900 border-gray-700 text-gray-200"
                              : "bg-white border-gray-200 text-gray-800"
                          }`}
                        >
                          {/* Ver perfil */}
                          <button
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-left rounded-t-xl ${
                              darkMode
                                ? "hover:bg-gray-800 hover:text-indigo-400"
                                : "hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => {
                              setMedicoSeleccionado(medico);
                              setModalDetalles(true);
                              setMenuAbiertoId(null);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Ver perfil
                          </button>

                          {/* Editar */}
                          <button
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-left ${
                              darkMode
                                ? "hover:bg-gray-800 hover:text-indigo-400"
                                : "hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => {
                              setMedicoSeleccionado(medico);
                              cargarDatosMedicoEnFormulario(medico);
                              setModalEditar(true);
                              setMenuAbiertoId(null);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>

                          {/* Eliminar */}
                          <button
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-left rounded-b-xl ${
                              darkMode
                                ? "hover:bg-gray-800 text-red-400 hover:text-red-300"
                                : "hover:bg-red-50 text-red-600 hover:text-red-700"
                            }`}
                            onClick={() => {
                              setMedicoSeleccionado(medico);
                              setModalEliminar(true);
                              setMenuAbiertoId(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* info principal */}
                  <div className="mb-4">
                    <h3
                      className={`text-lg font-black mb-1 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Dr. {medico.usuario.nombre}{" "}
                      {medico.usuario.apellido_paterno}
                    </h3>
                    <p
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    >
                      {medico.especialidades[0]?.nombre || "—"}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {medico.numero_registro_medico}
                    </p>
                  </div>

                  {/* Centro */}
                  <div className="flex items-center gap-2 mb-3">
                    <Building2
                      className={`w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {medico.centro_principal.nombre}
                    </span>
                  </div>

                  {/* rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(medico.calificacion_promedio)
                            ? "fill-yellow-400 text-yellow-400"
                            : darkMode
                            ? "text-gray-600"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span
                      className={`text-xs font-bold ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {medico.calificacion_promedio.toFixed(1)} (
                      {medico.total_resenas})
                    </span>
                  </div>

                  {/* métricas */}
                  <div
                    className={`grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl ${
                      darkMode ? "bg-gray-900/50" : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Pacientes
                      </div>
                      <div
                        className={`text-lg font-black ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {medico.total_pacientes}
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Consultas
                      </div>
                      <div
                        className={`text-lg font-black ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {medico.consultas_mes_actual}
                      </div>
                    </div>
                  </div>

                  {/* chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {medico.acepta_nuevos_pacientes && (
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          darkMode
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        Nuevos pacientes
                      </span>
                    )}
                    {medico.consulta_telemedicina && (
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          darkMode
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        Telemedicina
                      </span>
                    )}
                  </div>

                  {/* acciones rápidas */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setMedicoSeleccionado(medico);
                        setModalDetalles(true);
                      }}
                      className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                        darkMode
                          ? "bg-gray-900 text-gray-300 hover:bg-gray-800"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setMedicoSeleccionado(medico);
                        cargarDatosMedicoEnFormulario(medico);
                        setModalEditar(true);
                      }}
                      className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                        darkMode
                          ? "bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setMedicoSeleccionado(medico);
                        setModalEliminar(true);
                      }}
                      className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                        darkMode
                          ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST view */}
        {vistaActual === "list" && (
          <div
            className={`rounded-2xl shadow-xl border overflow-hidden mb-8 ${
              darkMode
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? "bg-gray-900/50" : "bg-gray-50"}>
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Médico
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Especialidad
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Centro
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Estado
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Pacientes
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Consultas
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Calificación
                    </th>
                    <th
                      className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode ? "divide-gray-700" : "divide-gray-200"
                  }`}
                >
                  {medicosPaginados.map((medico) => (
                    <tr
                      key={medico.id_medico}
                      className={`transition-colors duration-200 ${
                        darkMode ? "hover:bg-gray-900/30" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Médico */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {medico.usuario.foto_perfil_url ? (
                              <Image
                                src={medico.usuario.foto_perfil_url}
                                alt={medico.usuario.nombre}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              `${medico.usuario.nombre[0]}${medico.usuario.apellido_paterno[0]}`
                            )}
                          </div>
                          <div>
                            <div
                              className={`text-sm font-bold ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Dr. {medico.usuario.nombre}{" "}
                              {medico.usuario.apellido_paterno}
                            </div>
                            <div
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {medico.numero_registro_medico}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Especialidad */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            darkMode ? "text-indigo-400" : "text-indigo-600"
                          }`}
                        >
                          {medico.especialidades[0]?.nombre || "—"}
                        </span>
                      </td>

                      {/* Centro */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {medico.centro_principal.nombre}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(
                            medico.estado
                          )}`}
                        >
                          {obtenerIconoEstado(medico.estado)}
                          {medico.estado.charAt(0).toUpperCase() +
                            medico.estado.slice(1)}
                        </span>
                      </td>

                      {/* Pacientes */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`text-sm font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {medico.total_pacientes}
                        </span>
                      </td>

                      {/* Consultas */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`text-sm font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {medico.consultas_mes_actual}
                        </span>
                      </td>

                      {/* Calificación */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span
                            className={`text-sm font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {medico.calificacion_promedio.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setMedicoSeleccionado(medico);
                              setModalDetalles(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setMedicoSeleccionado(medico);
                              cargarDatosMedicoEnFormulario(medico);
                              setModalEditar(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-indigo-900/30 text-indigo-400"
                                : "hover:bg-indigo-100 text-indigo-700"
                            }`}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setMedicoSeleccionado(medico);
                              setModalEliminar(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-red-900/30 text-red-400"
                                : "hover:bg-red-100 text-red-700"
                            }`}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Paginación local */}
        {totalPaginas > 1 && (
          <div
            className={`rounded-xl p-4 shadow-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              darkMode
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`text-sm font-semibold ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Página {paginaActual} de {totalPaginas}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? "bg-gray-900 border border-gray-700 text-white hover:bg-gray-800"
                    : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                Anterior
              </button>

              {/* Números de página */}
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
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
                      key={pageNum}
                      onClick={() => setPaginaActual(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300 ${
                        paginaActual === pageNum
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : darkMode
                          ? "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setPaginaActual(
                    Math.min(totalPaginas, paginaActual + 1)
                  )
                }
                disabled={paginaActual === totalPaginas}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? "bg-gray-900 border border-gray-700 text-white hover:bg-gray-800"
                    : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =======================
          MODALES
          ======================= */}

      {/* Crear Médico */}
      <ModalCrearMedico
        isOpen={modalCrear}
        darkMode={darkMode}
        onClose={() => {
          setModalCrear(false);
          resetearFormulario();
        }}
        onSave={crearMedico}
        formulario={formulario}
        setFormulario={setFormulario}
        errores={erroresFormulario}
        guardando={guardando}
        especialidades={especialidades}
        centros={centros}
      />

      {/* Editar Médico */}
      <ModalEditarMedico
        isOpen={modalEditar}
        darkMode={darkMode}
        medicoSeleccionado={
          medicoSeleccionado
            ? {
                usuario: {
                  nombre: medicoSeleccionado.usuario.nombre,
                  apellido_paterno:
                    medicoSeleccionado.usuario.apellido_paterno,
                  rut: medicoSeleccionado.usuario.rut,
                },
                numero_registro_medico:
                  medicoSeleccionado.numero_registro_medico,
              }
            : null
        }
        onClose={() => {
          setModalEditar(false);
          resetearFormulario();
          setMedicoSeleccionado(null);
        }}
        onUpdate={editarMedico}
        formulario={formulario}
        setFormulario={setFormulario}
        errores={erroresFormulario}
        guardando={guardando}
        especialidades={especialidades}
        centros={centros}
      />

      {/* Eliminar Médico */}
      <ModalEliminarMedico
        isOpen={modalEliminar}
        darkMode={darkMode}
        onClose={() => {
          setModalEliminar(false);
          setMedicoSeleccionado(null);
        }}
        onConfirm={eliminarMedico}
        medico={
          medicoSeleccionado
            ? {
                usuario: {
                  nombre: medicoSeleccionado.usuario.nombre,
                  apellido_paterno:
                    medicoSeleccionado.usuario.apellido_paterno,
                },
                numero_registro_medico:
                  medicoSeleccionado.numero_registro_medico,
              }
            : null
        }
        guardando={guardando}
      />

      {/* Detalles Médico */}
      <ModalDetallesMedico
        isOpen={modalDetalles}
        darkMode={darkMode}
        onClose={() => {
          setModalDetalles(false);
          setMedicoSeleccionado(null);
        }}
        medico={
          medicoSeleccionado
            ? {
                usuario: {
                  nombre: medicoSeleccionado.usuario.nombre,
                  apellido_paterno:
                    medicoSeleccionado.usuario.apellido_paterno,
                  apellido_materno:
                    medicoSeleccionado.usuario.apellido_materno,
                  email: medicoSeleccionado.usuario.email,
                  telefono: medicoSeleccionado.usuario.telefono,
                  celular: medicoSeleccionado.usuario.celular,
                  foto_perfil_url:
                    medicoSeleccionado.usuario.foto_perfil_url,
                  rut: medicoSeleccionado.usuario.rut,
                },
                numero_registro_medico:
                  medicoSeleccionado.numero_registro_medico,
                estado: medicoSeleccionado.estado,
                especialidades: medicoSeleccionado.especialidades.map(
                  (e) => ({
                    id_especialidad: e.id_especialidad,
                    nombre: e.nombre,
                    es_principal: e.es_principal,
                  })
                ),
                centro_principal: {
                  nombre: medicoSeleccionado.centro_principal.nombre,
                  ciudad: medicoSeleccionado.centro_principal.ciudad,
                  region: medicoSeleccionado.centro_principal.region,
                },
                acepta_nuevos_pacientes:
                  medicoSeleccionado.acepta_nuevos_pacientes,
                consulta_telemedicina:
                  medicoSeleccionado.consulta_telemedicina,
                total_pacientes: medicoSeleccionado.total_pacientes,
                consultas_mes_actual:
                  medicoSeleccionado.consultas_mes_actual,
                calificacion_promedio:
                  medicoSeleccionado.calificacion_promedio,
                total_resenas: medicoSeleccionado.total_resenas,
                biografia: medicoSeleccionado.biografia,
              }
            : null
        }
        obtenerColorEstado={obtenerColorEstado}
        obtenerIconoEstado={obtenerIconoEstado}
      />
    </div>
  );
}
