"use client";

import { useState, useEffect } from "react";
import MedicoLayout from "../../layout/MedicoLayout";
import {
  AlertTriangle,
  Users,
  Heart,
  Activity,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Calendar,
  FileText,
  Eye,
  Loader2,
  ChevronRight,
  Star,
  AlertCircle,
  Zap,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
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

interface PacienteCritico {
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
  clasificacion_riesgo: "alto" | "critico";
  alergias_criticas: number;
  condiciones_cronicas: number;
  medicamentos_activos: number;
  ultima_consulta: string | null;
  proxima_cita: string | null;
  dias_sin_consulta: number;
  notas_importantes: string | null;
  diagnostico_principal: string | null;
  nivel_urgencia: 1 | 2 | 3 | 4 | 5;
  requiere_seguimiento: boolean;
  hospitalizaciones_recientes: number;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function PacientesCriticosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargandoPacientes, setCargandoPacientes] = useState(false);
  const [pacientesCriticos, setPacientesCriticos] = useState<PacienteCritico[]>([]);
  const [totalCriticos, setTotalCriticos] = useState(0);
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "critico" | "alto">("todos");

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarPacientesCriticos();
    }
  }, [usuario, filtroActivo]);

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

  const cargarPacientesCriticos = async () => {
    try {
      setCargandoPacientes(true);

      const params = new URLSearchParams();
      if (filtroActivo !== "todos") {
        params.append("clasificacion_riesgo", filtroActivo);
      } else {
        params.append("clasificacion_riesgo", "alto,critico");
      }
      params.append("estados", "activo");

      const response = await fetch(`/api/medico/pacientes/criticos?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPacientesCriticos(data.pacientes || []);
        setTotalCriticos(data.total || 0);
      } else {
        console.error("Error al cargar pacientes críticos:", data.error);
        setPacientesCriticos([]);
        setTotalCriticos(0);
      }
    } catch (error) {
      console.error("Error al cargar pacientes críticos:", error);
      setPacientesCriticos([]);
      setTotalCriticos(0);
    } finally {
      setCargandoPacientes(false);
    }
  };

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const obtenerColorRiesgo = (riesgo: "alto" | "critico") => {
    return riesgo === "critico"
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-orange-100 text-orange-800 border-orange-300";
  };

  const obtenerIconoUrgencia = (nivel: number) => {
    if (nivel >= 4) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (nivel >= 3) return <AlertCircle className="w-5 h-5 text-orange-600" />;
    return <Activity className="w-5 h-5 text-yellow-600" />;
  };

  const handleVerDetalle = (id: number) => {
    router.push(`/medico/pacientes/${id}`);
  };

  // ========================================
  // RENDER LOADING
  // ========================================

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-red-500 mx-auto mb-4" />
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
              className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all"
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
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">
                  Pacientes Críticos
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                  Monitoreo de pacientes de alto riesgo y críticos
                </p>
              </div>
            </div>
          </div>

          {/* ALERTA DE PRIORIDAD */}
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-red-200 shadow-lg mb-4 md:mb-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-black text-gray-900 mb-2">
                  ⚠️ Atención Prioritaria Requerida
                </h3>
                <p className="text-xs md:text-sm font-semibold text-gray-700">
                  Estos pacientes requieren seguimiento inmediato y atención especializada. Revise
                  regularmente su estado y mantenga comunicación constante.
                </p>
              </div>
            </div>
          </div>

          {/* FILTROS RÁPIDOS */}
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                <h3 className="text-base md:text-lg font-black text-gray-900">
                  Filtrar por Nivel de Riesgo
                </h3>
              </div>
              <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setFiltroActivo("todos")}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 ${
                    filtroActivo === "todos"
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos ({totalCriticos})
                </button>
                <button
                  onClick={() => setFiltroActivo("critico")}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 ${
                    filtroActivo === "critico"
                      ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Críticos
                </button>
                <button
                  onClick={() => setFiltroActivo("alto")}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 ${
                    filtroActivo === "alto"
                      ? "bg-gradient-to-r from-orange-600 to-yellow-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Alto Riesgo
                </button>
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS RÁPIDAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {totalCriticos}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Total Críticos
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {pacientesCriticos.filter((p) => p.condiciones_cronicas > 0).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Con Crónicas
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {pacientesCriticos.filter((p) => p.es_vip).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                VIP
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {pacientesCriticos.filter((p) => p.requiere_seguimiento).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Seguimiento
              </div>
            </div>
          </div>

          {/* LISTA DE PACIENTES CRÍTICOS */}
          <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 md:pb-6 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900">
                    Pacientes Requieren Atención
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 font-semibold">
                    {pacientesCriticos.length} paciente{pacientesCriticos.length !== 1 ? "s" : ""}{" "}
                    en lista
                  </p>
                </div>
              </div>
            </div>

            {cargandoPacientes ? (
              <div className="text-center py-12 md:py-16">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-red-500 mx-auto mb-4" />
                <p className="text-sm md:text-base font-semibold text-gray-600">
                  Cargando pacientes críticos...
                </p>
              </div>
            ) : pacientesCriticos.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                  ¡Excelente! No hay pacientes críticos
                </h4>
                <p className="text-sm md:text-base text-gray-600 font-semibold">
                  Todos los pacientes están en condición estable
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {pacientesCriticos.map((paciente) => (
                  <div
                    key={paciente.id_paciente}
                    className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-white to-red-50 border-2 border-red-200 hover:border-red-300 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                    onClick={() => handleVerDetalle(paciente.id_paciente)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2">
                          {obtenerIconoUrgencia(paciente.nivel_urgencia)}
                        </div>
                      </div>

                      {/* Información principal */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 gap-2 md:gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-1 truncate group-hover:text-red-600 transition-colors">
                              {paciente.nombre_completo}
                            </h4>
                            <p className="text-xs md:text-sm font-semibold text-gray-600 truncate">
                              RUT: {paciente.rut} · {paciente.edad} años · {paciente.genero}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border-2 whitespace-nowrap ${obtenerColorRiesgo(
                                paciente.clasificacion_riesgo
                              )}`}
                            >
                              {paciente.clasificacion_riesgo.toUpperCase()}
                            </span>
                            <span className="px-2 md:px-3 py-1 rounded-full text-xs font-bold border-2 bg-purple-100 text-purple-800 border-purple-300 whitespace-nowrap">
                              Urgencia {paciente.nivel_urgencia}/5
                            </span>
                          </div>
                        </div>

                        {/* Diagnóstico principal */}
                        {paciente.diagnostico_principal && (
                          <div className="mb-3 p-2 md:p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-xs font-bold text-red-900 mb-1">
                              Diagnóstico Principal:
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-red-800">
                              {paciente.diagnostico_principal}
                            </p>
                          </div>
                        )}

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

                        {/* Estadísticas médicas */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                          {paciente.alergias_criticas > 0 && (
                            <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-red-50 border border-red-200">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-xs font-bold text-red-900">
                                {paciente.alergias_criticas} Alergias
                              </span>
                            </div>
                          )}
                          {paciente.condiciones_cronicas > 0 && (
                            <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-orange-50 border border-orange-200">
                              <Heart className="w-4 h-4 text-orange-600" />
                              <span className="text-xs font-bold text-orange-900">
                                {paciente.condiciones_cronicas} Crónicas
                              </span>
                            </div>
                          )}
                          {paciente.medicamentos_activos > 0 && (
                            <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-bold text-blue-900">
                                {paciente.medicamentos_activos} Medicamentos
                              </span>
                            </div>
                          )}
                          {paciente.hospitalizaciones_recientes > 0 && (
                            <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-purple-50 border border-purple-200">
                              <Activity className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-bold text-purple-900">
                                {paciente.hospitalizaciones_recientes} Hospitalizaciones
                              </span>
                            </div>
                          )}
                          {paciente.requiere_seguimiento && (
                            <div className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-yellow-50 border border-yellow-200">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-xs font-bold text-yellow-900">
                                Requiere Seguimiento
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Última consulta y próxima cita */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                            {paciente.ultima_consulta && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700">
                                  Última consulta:{" "}
                                  {new Date(paciente.ultima_consulta).toLocaleDateString("es-CL")} (
                                  {paciente.dias_sin_consulta} días)
                                </span>
                              </div>
                            )}
                            {paciente.proxima_cita && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">
                                  Próxima cita:{" "}
                                  {new Date(paciente.proxima_cita).toLocaleDateString("es-CL")}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerDetalle(paciente.id_paciente);
                            }}
                            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 hover:from-red-700 hover:via-orange-700 hover:to-pink-700 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalle Completo
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Notas importantes */}
                        {paciente.notas_importantes && (
                          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200">
                            <div className="flex items-start gap-2 p-2 md:p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-amber-900 mb-1">
                                  ⚠️ Nota Importante:
                                </p>
                                <p className="text-xs font-semibold text-amber-800">
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

          {/* INFORMACIÓN DE AYUDA */}
          <div className="mt-4 md:mt-6 rounded-xl md:rounded-2xl p-4 md:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-lg">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-black text-gray-900 mb-2">
                  📋 Protocolo de Atención a Pacientes Críticos
                </h3>
                <ul className="space-y-2 text-xs md:text-sm font-semibold text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Revise <strong>diariamente</strong> el estado de los pacientes críticos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Mantenga <strong>comunicación constante</strong> con pacientes de nivel de
                      urgencia 4 y 5
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Programe <strong>consultas de seguimiento</strong> para pacientes sin citas
                      pendientes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Verifique la <strong>adherencia al tratamiento</strong> y medicamentos
                      activos
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ESTILOS */}
      <style jsx global>{`
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #818cf8;
          outline-offset: 2px;
        }

        .hover\:scale-105:hover {
          transform: scale(1.05) translateZ(0);
        }

        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </MedicoLayout>
  );
}
