"use client";

import { useState, useEffect } from "react";
import MedicoLayout from "../../layout/MedicoLayout";
import {
  Search,
  Filter,
  X,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertCircle,
  Heart,
  Star,
  TrendingUp,
  Loader2,
  Eye,
  Edit,
  ChevronRight,
  FileText,
  Clock,
  Activity,
  Zap,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Download,
  Share2,
  Bookmark,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ========================================
// TIPOS DE DATOS
// ========================================

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

interface FiltrosBusqueda {
  texto_busqueda: string;
  buscar_en: string[];
  estados: string[];
  generos: string[];
  grupos_sanguineos: string[];
  edad_min: string;
  edad_max: string;
  con_alergias: boolean | null;
  con_cronicas: boolean | null;
  clasificacion_riesgo: string[];
  es_vip: boolean | null;
  ciudad: string;
  region: string;
  fecha_registro_desde: string;
  fecha_registro_hasta: string;
  ultima_consulta_desde: string;
  ultima_consulta_hasta: string;
  tiene_citas_pendientes: boolean | null;
  tiene_examenes_pendientes: boolean | null;
  tiene_documentos_pendientes: boolean | null;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function BuscarPacientesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    texto_busqueda: "",
    buscar_en: ["nombre", "rut", "email"],
    estados: [],
    generos: [],
    grupos_sanguineos: [],
    edad_min: "",
    edad_max: "",
    con_alergias: null,
    con_cronicas: null,
    clasificacion_riesgo: [],
    es_vip: null,
    ciudad: "",
    region: "",
    fecha_registro_desde: "",
    fecha_registro_hasta: "",
    ultima_consulta_desde: "",
    ultima_consulta_hasta: "",
    tiene_citas_pendientes: null,
    tiene_examenes_pendientes: null,
    tiene_documentos_pendientes: null,
  });

  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [pacientesGuardados, setPacientesGuardados] = useState<number[]>([]);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  // ========================================
  // FUNCIONES DE CARGA
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
          router.push("/");
          return;
        }

        if (!result.usuario.medico) {
          alert("Tu usuario no está vinculado a un registro médico.");
          router.push("/");
          return;
        }

        setUsuario(result.usuario);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al verificar sesión.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNCIONES DE BÚSQUEDA
  // ========================================

  const realizarBusqueda = async () => {
    if (!filtros.texto_busqueda.trim() && !tieneAlgunFiltroActivo()) {
      alert("Por favor ingrese un término de búsqueda o active algún filtro");
      return;
    }

    try {
      setBuscando(true);
      setBusquedaRealizada(true);

      const params = new URLSearchParams();

      if (filtros.texto_busqueda) {
        params.append("busqueda", filtros.texto_busqueda);
      }

      if (filtros.buscar_en.length > 0) {
        params.append("buscar_en", filtros.buscar_en.join(","));
      }

      if (filtros.estados.length > 0) {
        params.append("estados", filtros.estados.join(","));
      }

      if (filtros.generos.length > 0) {
        params.append("generos", filtros.generos.join(","));
      }

      if (filtros.grupos_sanguineos.length > 0) {
        params.append("grupos_sanguineos", filtros.grupos_sanguineos.join(","));
      }

      if (filtros.edad_min) {
        params.append("edad_min", filtros.edad_min);
      }

      if (filtros.edad_max) {
        params.append("edad_max", filtros.edad_max);
      }

      if (filtros.con_alergias !== null) {
        params.append("con_alergias", filtros.con_alergias.toString());
      }

      if (filtros.con_cronicas !== null) {
        params.append("con_cronicas", filtros.con_cronicas.toString());
      }

      if (filtros.clasificacion_riesgo.length > 0) {
        params.append("clasificacion_riesgo", filtros.clasificacion_riesgo.join(","));
      }

      if (filtros.es_vip !== null) {
        params.append("es_vip", filtros.es_vip.toString());
      }

      if (filtros.ciudad) {
        params.append("ciudad", filtros.ciudad);
      }

      if (filtros.region) {
        params.append("region", filtros.region);
      }

      if (filtros.fecha_registro_desde) {
        params.append("fecha_registro_desde", filtros.fecha_registro_desde);
      }

      if (filtros.fecha_registro_hasta) {
        params.append("fecha_registro_hasta", filtros.fecha_registro_hasta);
      }

      if (filtros.ultima_consulta_desde) {
        params.append("ultima_consulta_desde", filtros.ultima_consulta_desde);
      }

      if (filtros.ultima_consulta_hasta) {
        params.append("ultima_consulta_hasta", filtros.ultima_consulta_hasta);
      }

      if (filtros.tiene_citas_pendientes !== null) {
        params.append("tiene_citas_pendientes", filtros.tiene_citas_pendientes.toString());
      }

      if (filtros.tiene_examenes_pendientes !== null) {
        params.append("tiene_examenes_pendientes", filtros.tiene_examenes_pendientes.toString());
      }

      if (filtros.tiene_documentos_pendientes !== null) {
        params.append("tiene_documentos_pendientes", filtros.tiene_documentos_pendientes.toString());
      }

      const response = await fetch(`/api/medico/pacientes/buscar?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPacientes(data.pacientes || []);
        setTotalResultados(data.total || 0);
      } else {
        alert(data.error || "Error al buscar pacientes");
        setPacientes([]);
        setTotalResultados(0);
      }
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
      alert("Error al realizar la búsqueda");
      setPacientes([]);
      setTotalResultados(0);
    } finally {
      setBuscando(false);
    }
  };

  const tieneAlgunFiltroActivo = (): boolean => {
    return (
      filtros.estados.length > 0 ||
      filtros.generos.length > 0 ||
      filtros.grupos_sanguineos.length > 0 ||
      filtros.edad_min !== "" ||
      filtros.edad_max !== "" ||
      filtros.con_alergias !== null ||
      filtros.con_cronicas !== null ||
      filtros.clasificacion_riesgo.length > 0 ||
      filtros.es_vip !== null ||
      filtros.ciudad !== "" ||
      filtros.region !== "" ||
      filtros.fecha_registro_desde !== "" ||
      filtros.fecha_registro_hasta !== "" ||
      filtros.ultima_consulta_desde !== "" ||
      filtros.ultima_consulta_hasta !== "" ||
      filtros.tiene_citas_pendientes !== null ||
      filtros.tiene_examenes_pendientes !== null ||
      filtros.tiene_documentos_pendientes !== null
    );
  };

  const limpiarFiltros = () => {
    setFiltros({
      texto_busqueda: "",
      buscar_en: ["nombre", "rut", "email"],
      estados: [],
      generos: [],
      grupos_sanguineos: [],
      edad_min: "",
      edad_max: "",
      con_alergias: null,
      con_cronicas: null,
      clasificacion_riesgo: [],
      es_vip: null,
      ciudad: "",
      region: "",
      fecha_registro_desde: "",
      fecha_registro_hasta: "",
      ultima_consulta_desde: "",
      ultima_consulta_hasta: "",
      tiene_citas_pendientes: null,
      tiene_examenes_pendientes: null,
      tiene_documentos_pendientes: null,
    });
    setPacientes([]);
    setTotalResultados(0);
    setBusquedaRealizada(false);
  };

  const contarFiltrosActivos = (): number => {
    let count = 0;
    if (filtros.estados.length > 0) count++;
    if (filtros.generos.length > 0) count++;
    if (filtros.grupos_sanguineos.length > 0) count++;
    if (filtros.edad_min || filtros.edad_max) count++;
    if (filtros.con_alergias !== null) count++;
    if (filtros.con_cronicas !== null) count++;
    if (filtros.clasificacion_riesgo.length > 0) count++;
    if (filtros.es_vip !== null) count++;
    if (filtros.ciudad) count++;
    if (filtros.region) count++;
    if (filtros.fecha_registro_desde || filtros.fecha_registro_hasta) count++;
    if (filtros.ultima_consulta_desde || filtros.ultima_consulta_hasta) count++;
    if (filtros.tiene_citas_pendientes !== null) count++;
    if (filtros.tiene_examenes_pendientes !== null) count++;
    if (filtros.tiene_documentos_pendientes !== null) count++;
    return count;
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const obtenerColorEstado = (estado: string) => {
    const colores: { [key: string]: string } = {
      activo: "bg-green-100 text-green-800 border-green-200",
      inactivo: "bg-gray-100 text-gray-800 border-gray-200",
      bloqueado: "bg-red-100 text-red-800 border-red-200",
      fallecido: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colores[estado] || colores.activo;
  };

  const obtenerColorRiesgo = (riesgo: string | null) => {
    const colores: { [key: string]: string } = {
      bajo: "bg-green-100 text-green-800 border-green-200",
      medio: "bg-yellow-100 text-yellow-800 border-yellow-200",
      alto: "bg-orange-100 text-orange-800 border-orange-200",
      critico: "bg-red-100 text-red-800 border-red-200",
    };
    return colores[riesgo || ""] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const toggleGuardarPaciente = (id: number) => {
    if (pacientesGuardados.includes(id)) {
      setPacientesGuardados(pacientesGuardados.filter((p) => p !== id));
    } else {
      setPacientesGuardados([...pacientesGuardados, id]);
    }
  };

  const handleVerDetalle = (id: number) => {
    router.push(`/medico/pacientes/${id}`);
  };

  const handleEditarPaciente = (id: number) => {
    router.push(`/medico/pacientes/${id}/editar`);
  };

  // ========================================
  // RENDER LOADING
  // ========================================

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-black mb-4 text-gray-900">Cargando...</h2>
          </div>
        </div>
      </MedicoLayout>
    );
  }

  if (!usuario || !usuario.medico) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-white shadow-2xl border border-gray-200">
            <AlertTriangle className="w-16 h-16 md:w-24 md:h-24 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">
              Acceso No Autorizado
            </h2>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </MedicoLayout>
    );
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <MedicoLayout>
      <main className="min-h-screen bg-[#f3f5ff] pt-4 md:pt-6 pb-6 md:pb-10 px-4 md:px-6 lg:px-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* CABECERA */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">
                  Búsqueda Avanzada de Pacientes
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                  Encuentra pacientes con filtros personalizados
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA PRINCIPAL */}
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg mb-4 md:mb-6">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
              {/* Input de búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, RUT, email, teléfono..."
                    value={filtros.texto_busqueda}
                    onChange={(e) =>
                      setFiltros({ ...filtros, texto_busqueda: e.target.value })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        realizarBusqueda();
                      }
                    }}
                    className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-4 rounded-xl bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  {filtros.texto_busqueda && (
                    <button
                      onClick={() => setFiltros({ ...filtros, texto_busqueda: "" })}
                      className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={realizarBusqueda}
                  disabled={buscando}
                  className={`flex-1 lg:flex-none px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                    buscando ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {buscando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Buscar
                    </>
                  )}
                </button>

                <button
                  onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                  className="relative px-4 md:px-6 py-3 md:py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filtros</span>
                  {contarFiltrosActivos() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                      {contarFiltrosActivos()}
                    </span>
                  )}
                </button>

                {(busquedaRealizada || tieneAlgunFiltroActivo()) && (
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 md:px-6 py-3 md:py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Buscar en (checkboxes) */}
            <div className="mt-4 pt-4 border-t-2 border-gray-100">
              <label className="text-xs md:text-sm font-bold mb-2 block text-gray-900">
                Buscar en:
              </label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { value: "nombre", label: "Nombre" },
                  { value: "rut", label: "RUT" },
                  { value: "email", label: "Email" },
                  { value: "telefono", label: "Teléfono" },
                  { value: "direccion", label: "Dirección" },
                  { value: "notas", label: "Notas" },
                ].map((campo) => (
                  <label
                    key={campo.value}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer border-2 border-gray-200 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={filtros.buscar_en.includes(campo.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFiltros({
                            ...filtros,
                            buscar_en: [...filtros.buscar_en, campo.value],
                          });
                        } else {
                          setFiltros({
                            ...filtros,
                            buscar_en: filtros.buscar_en.filter((x) => x !== campo.value),
                          });
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs md:text-sm font-semibold text-gray-900">
                      {campo.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL DE FILTROS AVANZADOS */}
          {mostrarFiltrosAvanzados && (
            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-indigo-200 shadow-lg mb-4 md:mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-gray-900">
                      Filtros Avanzados
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 font-semibold">
                      Personaliza tu búsqueda con criterios específicos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarFiltrosAvanzados(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Estado */}
                <div>
  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Estado del Paciente
                  </label>
                  <div className="space-y-2">
                    {["activo", "inactivo", "bloqueado"].map((estado) => (
                      <label
                        key={estado}
                        className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all"
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
  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
    <Users className="w-4 h-4 text-purple-600" />
    Género
  </label>

  <div className="space-y-2">
    {["masculino", "femenino", "no_binario"].map((genero) => (
      <label
        key={genero}
        className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all"
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
          }}
          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <span className="text-xs md:text-sm font-semibold text-gray-900 capitalize">
          {genero.replace("_", " ")}
        </span>
      </label>
    ))}
  </div>
</div>

                {/* Grupo Sanguíneo */}
                <div>
  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Droplet className="w-4 h-4 text-red-600" />
                    Grupo Sanguíneo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((grupo) => (
                      <label
                        key={grupo}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.grupos_sanguineos.includes(grupo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                grupos_sanguineos: [...filtros.grupos_sanguineos, grupo],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                grupos_sanguineos: filtros.grupos_sanguineos.filter(
                                  (g) => g !== grupo
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs md:text-sm font-bold text-gray-900">{grupo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rango de Edad */}
                <div>
  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Rango de Edad
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Edad mínima"
                      value={filtros.edad_min}
                      onChange={(e) => setFiltros({ ...filtros, edad_min: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Edad máxima"
                      value={filtros.edad_max}
                      onChange={(e) => setFiltros({ ...filtros, edad_max: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Clasificación de Riesgo */}
                <div>
  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Clasificación de Riesgo
                  </label>
                  <div className="space-y-2">
                    {["bajo", "medio", "alto", "critico"].map((riesgo) => (
                      <label
                        key={riesgo}
                        className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={filtros.clasificacion_riesgo.includes(riesgo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltros({
                                ...filtros,
                                clasificacion_riesgo: [...filtros.clasificacion_riesgo, riesgo],
                              });
                            } else {
                              setFiltros({
                                ...filtros,
                                clasificacion_riesgo: filtros.clasificacion_riesgo.filter(
                                  (r) => r !== riesgo
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-xs md:text-sm font-semibold text-gray-900 capitalize">
                          {riesgo}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Condiciones Médicas */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Heart className="w-4 h-4 text-pink-600" />
                    Condiciones Médicas
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all">
                      <input
                        type="checkbox"
                        checked={filtros.con_alergias === true}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            con_alergias: e.target.checked ? true : null,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-xs md:text-sm font-semibold text-gray-900">
                        Con Alergias
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all">
                      <input
                        type="checkbox"
                        checked={filtros.con_cronicas === true}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            con_cronicas: e.target.checked ? true : null,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-xs md:text-sm font-semibold text-gray-900">
                        Condiciones Crónicas
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all">
                      <input
                        type="checkbox"
                        checked={filtros.es_vip === true}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            es_vip: e.target.checked ? true : null,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs md:text-sm font-semibold text-gray-900">
                          Solo VIP
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Ubicación
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Región"
                      value={filtros.region}
                      onChange={(e) => setFiltros({ ...filtros, region: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Ciudad"
                      value={filtros.ciudad}
                      onChange={(e) => setFiltros({ ...filtros, ciudad: e.target.value })}
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Fecha de Registro */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    Fecha de Registro
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filtros.fecha_registro_desde}
                      onChange={(e) =>
                        setFiltros({ ...filtros, fecha_registro_desde: e.target.value })
                      }
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="date"
                      value={filtros.fecha_registro_hasta}
                      onChange={(e) =>
                        setFiltros({ ...filtros, fecha_registro_hasta: e.target.value })
                      }
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Última Consulta */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4 text-teal-600" />
                    Última Consulta
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filtros.ultima_consulta_desde}
                      onChange={(e) =>
                        setFiltros({ ...filtros, ultima_consulta_desde: e.target.value })
                      }
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="date"
                      value={filtros.ultima_consulta_hasta}
                      onChange={(e) =>
                        setFiltros({ ...filtros, ultima_consulta_hasta: e.target.value })
                      }
                      className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-white border-2 border-gray-200 text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Pendientes */}
                <div>
                  <label className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2 text-gray-900">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Pendientes
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all">
                      <input
                        type="checkbox"
                        checked={filtros.tiene_citas_pendientes === true}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            tiene_citas_pendientes: e.target.checked ? true : null,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs md:text-sm font-semibold text-gray-900">
                        Citas Pendientes
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all">
                      <input
                        type="checkbox"
                        checked={filtros.tiene_examenes_pendientes === true}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            tiene_examenes_pendientes: e.target.checked ? true : null,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs md:text-sm font-semibold text-gray-900">
                        Exámenes Pendientes
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200 transition-all">
                      <input
                        type="checkbox"
                        checked={filtros.tiene_documentos_pendientes === true}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            tiene_documentos_pendientes: e.target.checked ? true : null,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs md:text-sm font-semibold text-gray-900">
                        Documentos Pendientes
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones de acción del panel */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={limpiarFiltros}
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Limpiar Todo
                </button>

                <button
                  onClick={() => {
                    setMostrarFiltrosAvanzados(false);
                    realizarBusqueda();
                  }}
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Aplicar Filtros y Buscar
                </button>
              </div>
            </div>
          )}

          {/* RESULTADOS */}
          {busquedaRealizada && (
            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg">
              {/* Header de resultados */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-gray-900">
                      Resultados de Búsqueda
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 font-semibold">
                      {totalResultados} paciente{totalResultados !== 1 ? "s" : ""} encontrado
                      {totalResultados !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {pacientes.length > 0 && (
                  <div className="flex gap-2">
                    <button className="px-4 md:px-6 py-2 md:py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button className="px-4 md:px-6 py-2 md:py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Lista de pacientes */}
              {pacientes.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                    No se encontraron resultados
                  </h4>
                  <p className="text-sm md:text-base text-gray-600 font-semibold mb-6">
                    Intenta ajustar los filtros de búsqueda o usar otros términos
                  </p>
                  <button
                    onClick={limpiarFiltros}
                    className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {pacientes.map((paciente) => (
                    <div
                      key={paciente.id_paciente}
                      className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-indigo-300 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                      onClick={() => handleVerDetalle(paciente.id_paciente)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {paciente.foto_url ? (
                              <Image
                                src={paciente.foto_url}
                                alt={paciente.nombre_completo}
                                width={80}
                                height={80}
                                className="rounded-xl md:rounded-2xl object-cover w-full h-full"
                              />
                            ) : (
                              `${paciente.nombre[0]}${paciente.apellido_paterno[0]}`
                            )}
                          </div>
                          {paciente.es_vip && (
                            <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <Star className="w-3 h-3 md:w-4 md:h-4 text-white fill-white" />
                            </div>
                          )}
                        </div>

                        {/* Información principal */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 gap-2 md:gap-4">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-lg md:text-xl font-black text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                                {paciente.nombre_completo}
                              </h4>
                              <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">
                                RUT: {paciente.rut} · {paciente.edad} años · {paciente.genero}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${obtenerColorEstado(
                                  paciente.estado
                                )}`}
                              >
                                {paciente.estado}
                              </span>
                              {paciente.clasificacion_riesgo && (
                                <span
                                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${obtenerColorRiesgo(
                                    paciente.clasificacion_riesgo
                                  )}`}
                                >
                                  {paciente.clasificacion_riesgo}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Datos de contacto */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-white border border-gray-200">
                              <Droplet className="w-4 h-4 text-red-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                {paciente.grupo_sanguineo}
                              </span>
                            </div>
                            {paciente.telefono && (
                              <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-white border border-gray-200">
                                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                  {paciente.telefono}
                                </span>
                              </div>
                            )}
                            {paciente.email && (
                              <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-white border border-gray-200 sm:col-span-2 lg:col-span-1">
                                <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                  {paciente.email}
                                </span>
                              </div>
                            )}
                            {paciente.ciudad && (
                              <div className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-white border border-gray-200">
                                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                  {paciente.ciudad}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Estadísticas y acciones */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                              <div className="text-center">
                                <div className="text-lg md:text-xl font-black text-gray-900">
                                                                      {paciente.total_consultas}
                                </div>
                                <div className="text-xs font-bold text-gray-600">Consultas</div>
                              </div>
                              <div className="w-px h-8 bg-gray-300"></div>
                              <div className="text-center">
                                <div className="text-lg md:text-xl font-black text-gray-900">
                                  {paciente.total_citas}
                                </div>
                                <div className="text-xs font-bold text-gray-600">Citas</div>
                              </div>
                              {paciente.alergias_criticas > 0 && (
                                <>
                                  <div className="w-px h-8 bg-gray-300"></div>
                                  <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-red-50 border border-red-200">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-bold text-red-900">
                                      {paciente.alergias_criticas} Alergias
                                    </span>
                                  </div>
                                </>
                              )}
                              {paciente.condiciones_cronicas > 0 && (
                                <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-orange-50 border border-orange-200">
                                  <Heart className="w-4 h-4 text-orange-600" />
                                  <span className="text-xs font-bold text-orange-900">
                                    {paciente.condiciones_cronicas} Crónicas
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGuardarPaciente(paciente.id_paciente);
                                }}
                                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                                  pacientesGuardados.includes(paciente.id_paciente)
                                    ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                                    : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-yellow-50"
                                }`}
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${
                                    pacientesGuardados.includes(paciente.id_paciente)
                                      ? "fill-yellow-700"
                                      : ""
                                  }`}
                                />
                                <span className="hidden sm:inline">
                                  {pacientesGuardados.includes(paciente.id_paciente)
                                    ? "Guardado"
                                    : "Guardar"}
                                </span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarPaciente(paciente.id_paciente);
                                }}
                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 border-2 border-blue-200"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerDetalle(paciente.id_paciente);
                                }}
                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Ver</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="px-2 md:px-3 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg md:rounded-xl font-bold transition-all duration-300 hover:scale-105 border-2 border-gray-200"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Alertas importantes */}
                          {(paciente.examenes_pendientes > 0 ||
                            paciente.documentos_pendientes > 0 ||
                            paciente.proxima_cita) && (
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
                              {paciente.proxima_cita && (
                                <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-green-50 border border-green-200">
                                  <Calendar className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-bold text-green-900">
                                    Próxima cita:{" "}
                                    {new Date(paciente.proxima_cita).toLocaleDateString("es-CL")}
                                  </span>
                                </div>
                              )}
                              {paciente.examenes_pendientes > 0 && (
                                <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-yellow-50 border border-yellow-200">
                                  <FileText className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs font-bold text-yellow-900">
                                    {paciente.examenes_pendientes} exámenes pendientes
                                  </span>
                                </div>
                              )}
                              {paciente.documentos_pendientes > 0 && (
                                <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-bold text-blue-900">
                                    {paciente.documentos_pendientes} documentos pendientes
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notas importantes */}
                          {paciente.notas_importantes && (
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                              <div className="flex items-start gap-2 p-2 md:p-3 rounded-lg bg-amber-50 border border-amber-200">
                                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-amber-900 mb-1">
                                    Nota Importante:
                                  </p>
                                  <p className="text-xs font-semibold text-amber-800 line-clamp-2">
                                    {paciente.notas_importantes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ESTADÍSTICAS DE BÚSQUEDA */}
          {busquedaRealizada && pacientes.length > 0 && (
            <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                  {totalResultados}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Total Encontrados
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                  {pacientes.filter((p) => p.estado === "activo").length}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Activos
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                  {pacientes.filter((p) => p.es_vip).length}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  VIP
                </div>
              </div>

              <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                  {
                    pacientes.filter(
                      (p) =>
                        p.clasificacion_riesgo === "alto" ||
                        p.clasificacion_riesgo === "critico"
                    ).length
                  }
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Alto Riesgo
                </div>
              </div>
            </div>
          )}

          {/* CONSEJOS Y AYUDA */}
          <div className="mt-4 md:mt-6 rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 shadow-lg">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-black text-gray-900 mb-2">
                  💡 Consejos de Búsqueda Avanzada
                </h3>
                <ul className="space-y-2 text-xs md:text-sm font-semibold text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Usa <strong>múltiples filtros</strong> para afinar tu búsqueda y encontrar
                      pacientes específicos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Los filtros de <strong>riesgo y condiciones</strong> te ayudan a priorizar
                      pacientes críticos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Guarda pacientes frecuentes con el botón{" "}
                      <strong className="inline-flex items-center gap-1">
                        <Bookmark className="w-3 h-3 inline" /> Guardar
                      </strong>{" "}
                      para acceso rápido
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Usa rangos de <strong>fechas</strong> para encontrar pacientes sin consultas
                      recientes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Exporta los resultados para análisis externos o reportes administrativos
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => {
                setFiltros({
                  ...filtros,
                  clasificacion_riesgo: ["alto", "critico"],
                  estados: ["activo"],
                });
                setMostrarFiltrosAvanzados(true);
              }}
              className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors">
                    Pacientes de Alto Riesgo
                  </h4>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">
                    Filtro rápido para casos críticos
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => {
                setFiltros({
                  ...filtros,
                  es_vip: true,
                  estados: ["activo"],
                });
                setMostrarFiltrosAvanzados(true);
              }}
              className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-black text-gray-900 group-hover:text-yellow-600 transition-colors">
                    Pacientes VIP
                  </h4>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">
                    Atención prioritaria y personalizada
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => {
                setFiltros({
                  ...filtros,
                  tiene_citas_pendientes: true,
                  estados: ["activo"],
                });
                setMostrarFiltrosAvanzados(true);
              }}
              className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                    Con Citas Pendientes
                  </h4>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">
                    Próximas consultas programadas
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* ESTILOS PERSONALIZADOS */}
      <style jsx global>{`
        /* Animación de entrada */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out;
        }

        /* Scrollbar personalizado */
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

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        /* Mejora de contraste en inputs */
        input:focus,
        select:focus,
        textarea:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Transiciones suaves */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Optimización para móviles */
        @media (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }

        /* Mejora de accesibilidad */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid #818cf8;
          outline-offset: 2px;
        }

        /* Prevenir zoom en iOS */
        @supports (-webkit-touch-callout: none) {
          input,
          select,
          textarea {
            font-size: 16px;
          }
        }

        /* Animación de carga */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Gradientes suaves */
        .bg-gradient-to-r,
        .bg-gradient-to-br {
          background-size: 200% 200%;
        }

        /* Mejora de sombras */
        .shadow-lg,
        .shadow-xl,
        .shadow-2xl {
          transition: box-shadow 0.3s ease;
        }

        /* Hover suave en cards */
        .hover\:shadow-2xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Optimización de rendimiento */
        .transform,
        .scale-105,
        .scale-110 {
          will-change: transform;
        }

        /* Mejora de legibilidad */
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Prevenir selección en elementos interactivos */
        button,
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Animación de escala suave */
        .hover\:scale-105:hover,
        .hover\:scale-110:hover {
          transform: scale(1.05) translateZ(0);
        }

        /* Truncado de texto con líneas múltiples */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
        a {
          min-height: 44px;
        }

        @media (max-width: 640px) {
          button,
          a {
            min-height: 48px;
          }
        }

        /* Animación de pulso para elementos importantes */
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Mejora de contraste en badges */
        .bg-yellow-100,
        .bg-green-100,
        .bg-blue-100,
        .bg-red-100 {
          border: 1px solid currentColor;
          border-opacity: 0.2;
        }

        /* Optimización para impresión */
        @media print {
          .no-print,
          button,
          nav {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }
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

        /* Mejora de contraste en estados disabled */
        button:disabled,
        input:disabled,
        select:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Optimización de backdrop-blur */
        .backdrop-blur-sm {
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
        }

        /* Prevenir layout shift */
        img[width][height] {
          height: auto;
        }

        /* Mejora de contraste en estados hover */
        @media (hover: hover) {
          .hover\:shadow:hover,
          .hover\:shadow-md:hover,
          .hover\:shadow-lg:hover {
            transition: box-shadow 0.2s ease-in-out;
          }
        }

        /* Animación de entrada suave */
        .fade-in {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Mejora de rendimiento en transformaciones */
        .transform {
          transform: translateZ(0);
        }

        /* Animación de éxito */
        @keyframes success-bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-success-bounce {
          animation: success-bounce 0.5s ease;
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

        /* Mejora de legibilidad en textos largos */
        p,
        li {
          line-height: 1.6;
        }

        /* Mejora de accesibilidad en controles de formulario */
        label {
          cursor: pointer;
        }

        /* Animación de shake para errores */
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease;
        }

        /* Optimización para dispositivos de alta densidad */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }

        /* Mejora de rendimiento en scroll */
        .overflow-x-auto,
        .overflow-y-auto {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Prevenir selección accidental */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Mejora de espaciado vertical */
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }

        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }

        .space-y-4 > * + * {
          margin-top: 1rem;
        }
      `}</style>
    </MedicoLayout>
  );
}               
