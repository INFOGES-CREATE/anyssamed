"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Stethoscope,
  Shield,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
  XCircle,
  RefreshCw,
  Trash2,
  Moon,
  Sun,
  Video,
  HeartHandshake,
  Star,
  Phone,
  Mail,
} from "lucide-react";

interface Especialidad {
  id_especialidad: number;
  nombre: string;
  es_principal: boolean;
  anos_experiencia?: number | null;
  institucion_certificadora?: string | null;
  fecha_certificacion?: string | null;
}

interface Disponibilidad {
  id_disponibilidad: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_atencion: string;
  estado: string;
  sucursal_nombre?: string | null;
}

interface RolAsignado {
  id_rol: number;
  nombre: string;
  nivel_jerarquia: number;
}

interface MedicoFull {
  id_medico: number;
  id_usuario: number;
  nombre_completo: string;
  rut?: string | null;
  email?: string | null;
  telefono?: string | null;

  numero_registro_medico: string;
  titulo_profesional: string;
  universidad: string;
  ano_graduacion: number;
  biografia?: string | null;

  acepta_nuevos_pacientes: boolean;
  atiende_particular: boolean;
  atiende_fonasa: boolean;
  atiende_isapre: boolean;

  estado: "activo" | "inactivo" | "suspendido" | "vacaciones";
  consulta_presencial: boolean;
  consulta_telemedicina: boolean;
  duracion_consulta_min: number;
  fecha_inicio_actividad?: string | null;

  firma_digital_url?: string | null;

  centro_principal: {
    id_centro: number;
    nombre: string;
    ciudad?: string | null;
    region?: string | null;
  };

  especialidades: Especialidad[];
  disponibilidad: Disponibilidad[];

  permisos: {
    roles: RolAsignado[];
    activo: boolean;
    autenticacion_2fa: boolean;
    requiere_cambio_password: boolean;
  };

  auditoria: {
    fecha_creacion: string;
    fecha_modificacion: string;
    ultimo_login: string | null;
  };
}

interface ApiMedicoDetailResponse {
  success: boolean;
  data?: MedicoFull;
  error?: string;
}

interface RolOption {
  id_rol: number;
  nombre: string;
  nivel_jerarquia: number;
  descripcion?: string;
}

interface ApiRolesResponse {
  success: boolean;
  data?: RolOption[];
  error?: string;
}

export default function MedicoEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const medicoId = params?.id;

  // ========== dark mode persistente ==========
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedDark);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString());
    }
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // ========== tokens UI / colores reutilizables ==========
  const primaryGradient = "from-indigo-500 via-purple-500 to-pink-500";

  const bgClass = darkMode
    ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
    : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";

  const cardBg = darkMode
    ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl"
    : "bg-white/95 backdrop-blur-xl";

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-300" : "text-slate-600";
  const textMuted = darkMode ? "text-slate-400" : "text-slate-500";

  const borderColor = darkMode ? "border-slate-700/50" : "border-slate-200";
  const hoverBg = darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  // ========== estado de datos/backend ==========
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // banner superior (éxito / error)
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [medico, setMedico] = useState<MedicoFull | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = useState<RolOption[]>([]);

  // ========== estado del formulario ==========
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [tituloProfesional, setTituloProfesional] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [anoGraduacion, setAnoGraduacion] = useState<number | string>("");
  const [biografia, setBiografia] = useState("");

  const [aceptaNuevosPacientes, setAceptaNuevosPacientes] = useState(false);
  const [presencial, setPresencial] = useState(false);
  const [telemedicina, setTelemedicina] = useState(false);
  const [duracionConsulta, setDuracionConsulta] = useState<number | string>("");

  const [atiendeParticular, setAtiendeParticular] = useState(false);
  const [atiendeFonasa, setAtiendeFonasa] = useState(false);
  const [atiendeIsapre, setAtiendeIsapre] = useState(false);

  const [requiereCambioPassword, setRequiereCambioPassword] = useState(false);
  const [autenticacion2FA, setAutenticacion2FA] = useState(false);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<number[]>([]);

  // ========== helpers UI ==========
  const getEstadoStyles = (estado: string) => {
    if (darkMode) {
      switch (estado) {
        case "activo":
          return "bg-green-500/20 text-green-400 border border-green-500/30";
        case "inactivo":
          return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
        case "suspendido":
          return "bg-red-500/20 text-red-400 border border-red-500/30";
        case "vacaciones":
          return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
        default:
          return "bg-slate-600/20 text-slate-300 border border-slate-600/30";
      }
    } else {
      switch (estado) {
        case "activo":
          return "bg-green-100 text-green-700 border border-green-300";
        case "inactivo":
          return "bg-gray-100 text-gray-700 border border-gray-300";
        case "suspendido":
          return "bg-red-100 text-red-700 border border-red-300";
        case "vacaciones":
          return "bg-yellow-100 text-yellow-800 border border-yellow-300";
        default:
          return "bg-slate-100 text-slate-700 border border-slate-300";
      }
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // ========== cargar datos iniciales ==========
  const fetchMedico = useCallback(async () => {
    if (!medicoId) return;
    try {
      setLoading(true);
      setError(null);

      const [medRes, rolesRes] = await Promise.all([
        fetch(`/api/admin/medicos/${medicoId}`, {
          method: "GET",
          credentials: "include",
        }),
        fetch(`/api/admin/roles?tipo=profesional`, {
          method: "GET",
          credentials: "include",
        }),
      ]);

      if (!medRes.ok) {
        throw new Error(`Error al cargar el médico (${medRes.status})`);
      }
      const medJson: ApiMedicoDetailResponse = await medRes.json();
      if (!medJson.success || !medJson.data) {
        throw new Error(
          medJson.error || "No se encontró información del médico"
        );
      }

      let rolesJson: ApiRolesResponse = { success: true, data: [] };
      if (rolesRes.ok) {
        rolesJson = await rolesRes.json();
      }

      setMedico(medJson.data);
      setRolesDisponibles(rolesJson.data || []);

      // Prefill form desde backend
      const m = medJson.data;

      setNombreCompleto(m.nombre_completo || "");
      setEmail(m.email || "");
      setTelefono(m.telefono || "");

      setTituloProfesional(m.titulo_profesional || "");
      setUniversidad(m.universidad || "");
      setAnoGraduacion(m.ano_graduacion || "");
      setBiografia(m.biografia || "");

      setAceptaNuevosPacientes(m.acepta_nuevos_pacientes || false);
      setPresencial(m.consulta_presencial || false);
      setTelemedicina(m.consulta_telemedicina || false);
      setDuracionConsulta(m.duracion_consulta_min || "");

      setAtiendeParticular(m.atiende_particular || false);
      setAtiendeFonasa(m.atiende_fonasa || false);
      setAtiendeIsapre(m.atiende_isapre || false);

      setRequiereCambioPassword(
        m.permisos.requiere_cambio_password || false
      );
      setAutenticacion2FA(m.permisos.autenticacion_2fa || false);
      setRolesSeleccionados(m.permisos.roles.map((r) => r.id_rol));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [medicoId]);

  useEffect(() => {
    fetchMedico();
  }, [fetchMedico]);

  // ========== handlers ==========
  const toggleRole = (idRol: number) => {
    setRolesSeleccionados((prev) =>
      prev.includes(idRol)
        ? prev.filter((r) => r !== idRol)
        : [...prev, idRol]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!medico) return;

    try {
      setSaving(true);
      setBanner(null);

      const bodyPayload = {
        medico: {
          titulo_profesional: tituloProfesional,
          universidad,
          ano_graduacion: Number(anoGraduacion),
          biografia,
          acepta_nuevos_pacientes: aceptaNuevosPacientes,
          consulta_presencial: presencial,
          consulta_telemedicina: telemedicina,
          duracion_consulta_min: Number(duracionConsulta),
          atiende_particular: atiendeParticular,
          atiende_fonasa: atiendeFonasa,
          atiende_isapre: atiendeIsapre,
          email,
          telefono,
        },
        permisos: {
          requiere_cambio_password: requiereCambioPassword,
          autenticacion_2fa: autenticacion2FA,
          roles: rolesSeleccionados,
        },
      };

      const res = await fetch(`/api/admin/medicos/${medico.id_medico}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setBanner({
          type: "success",
          msg: "Cambios guardados correctamente.",
        });
        fetchMedico();
      } else {
        setBanner({
          type: "error",
          msg: json.error || "No se pudieron guardar los cambios.",
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        msg: err.message || "Error inesperado al guardar.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!medico) return;
    const ok = window.confirm(
      `Esta acción eliminará al médico ${medico.nombre_completo} y su acceso al sistema. ¿Confirmas?`
    );
    if (!ok) return;

    try {
      setDeleting(true);
      setBanner(null);

      const res = await fetch(`/api/admin/medicos/${medico.id_medico}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setBanner({
          type: "success",
          msg: "Médico eliminado.",
        });
        router.push("/admin/medicos");
      } else {
        setBanner({
          type: "error",
          msg: json.error || "No se pudo eliminar al médico.",
        });
      }
    } catch (err: any) {
      setBanner({
        type: "error",
        msg: err.message || "Error inesperado al eliminar.",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ========== pantallas de carga / error ==========
  if (loading && !medico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${bgClass}`}
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
            className={`text-2xl md:text-3xl font-black mb-3 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Cargando datos del médico
          </h2>
          <p
            className={`text-sm md:text-base ${
              darkMode ? "text-indigo-300" : "text-indigo-600"
            } font-medium`}
          >
            Preparando el formulario de edición segura...
          </p>
        </div>
      </div>
    );
  }

  if (error && !medico) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${bgClass}`}
      >
        <div
          className={`rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border ${
            darkMode
              ? "bg-slate-900/60 backdrop-blur-xl border-red-500/30"
              : "bg-white border-red-200"
          }`}
        >
          <div
            className={`flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6 ${
              darkMode ? "bg-red-500/20" : "bg-red-100"
            }`}
          >
            <XCircle
              className={`w-10 h-10 ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            />
          </div>
          <h2
            className={`text-2xl md:text-3xl font-black text-center mb-3 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Error
          </h2>
          <p
            className={`text-center mb-8 ${
              darkMode ? "text-red-300" : "text-red-600"
            } font-medium`}
          >
            {error}
          </p>
          <button
            onClick={fetchMedico}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:scale-105"
          >
            <RefreshCw className="w-6 h-6" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!medico) {
    return null;
  }

  // ========== UI principal ==========
  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* toggle dark mode flotante */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-xl font-semibold text-xs transition-all duration-300 shadow-xl hover:scale-110 ${
            darkMode
              ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
              : "bg-white/80 text-slate-700 hover:bg-white shadow-slate-400/20 border border-slate-200"
          }`}
          title={darkMode ? "Modo claro" : "Modo oscuro"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-[1600px] mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6 md:space-y-8"
      >
        {/* banner feedback */}
        {banner && (
          <div
            className={`rounded-2xl border p-4 flex items-start gap-4 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              banner.type === "success"
                ? darkMode
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : "bg-green-50 border-green-200 text-green-700"
                : darkMode
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex-shrink-0">
              {banner.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="text-sm font-medium flex-1">{banner.msg}</div>
            <button
              onClick={() => setBanner(null)}
              type="button"
              className="text-xs font-bold opacity-70 hover:opacity-100 transition"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ENCABEZADO DEL FORM */}
        <section
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-2xl overflow-hidden relative`}
        >
          <div
            className={`h-28 md:h-32 bg-gradient-to-r ${primaryGradient} relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>

          <div className="p-6 md:p-8 -mt-16 relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Info principal izquierda */}
              <div className="flex items-end gap-6">
                {/* avatar / estado */}
                <div className="relative group">
                  <div className="relative">
                    <div
                      className={`absolute -inset-1 bg-gradient-to-r ${primaryGradient} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>
                    <div
                      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br ${primaryGradient} flex items-center justify-center border-4 ${
                        darkMode ? "border-slate-800" : "border-white"
                      } shadow-2xl`}
                    >
                      <Stethoscope className="w-9 h-9 md:w-10 md:h-10 text-white" />
                    </div>
                  </div>

                  {/* badge de estado */}
                  <div className="absolute -bottom-2 -right-2 text-[10px] font-bold">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ${getEstadoStyles(
                        medico.estado
                      )}`}
                    >
                      {medico.estado === "activo" && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {medico.estado === "suspendido" && (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{medico.estado}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div
                      className={`text-xl md:text-2xl font-black tracking-tight ${textPrimary}`}
                    >
                      {nombreCompleto || medico.nombre_completo}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        darkMode ? "text-indigo-300" : "text-indigo-600"
                      }`}
                    >
                      {tituloProfesional || medico.titulo_profesional}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
                    {email && (
                      <span
                        className={`flex items-center gap-1 ${textSecondary}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {email}
                      </span>
                    )}
                    {telefono && (
                      <span
                        className={`flex items-center gap-1 ${textSecondary}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {telefono}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-semibold ${
                      darkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <div
                      className={`px-2.5 py-1 rounded-lg border ${
                        telemedicina && presencial
                          ? darkMode
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-purple-50 text-purple-700 border-purple-300"
                          : telemedicina
                          ? darkMode
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            : "bg-cyan-50 text-cyan-700 border-cyan-300"
                          : darkMode
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-blue-50 text-blue-700 border-blue-300"
                      } flex items-center gap-1`}
                    >
                      {telemedicina && <Video className="w-3.5 h-3.5" />}
                      <span>
                        {telemedicina
                          ? presencial
                            ? "Telemedicina y presencial"
                            : "Telemedicina"
                          : "Sólo presencial"}
                      </span>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg border ${
                        aceptaNuevosPacientes
                          ? darkMode
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-green-50 text-green-600 border-green-200"
                          : darkMode
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          : "bg-slate-50 text-slate-600 border-slate-300"
                      } flex items-center gap-1`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>
                        {aceptaNuevosPacientes
                          ? "Acepta nuevos pacientes"
                          : "No acepta nuevos pacientes"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* acciones header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <Link
                  href={`/admin/medicos/${medico.id_medico}`}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xl transition-all duration-300 hover:scale-[1.03] px-4 py-3 text-center border ${borderColor} ${hoverBg} ${
                    darkMode ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver Perfil</span>
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xl transition-all duration-300 hover:scale-[1.03] bg-gradient-to-r ${primaryGradient} text-white px-4 py-3 text-center disabled:opacity-50`}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                </button>
              </div>
            </div>

            {/* meta rápida */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
              <div
                className={`rounded-2xl p-4 border ${borderColor} ${hoverBg} transition-colors`}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  <Users
                    className={`w-4 h-4 ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <span className={textSecondary}>Acceso</span>
                </div>
                <div
                  className={`text-lg font-black leading-none ${textPrimary}`}
                >
                  {medico?.permisos.activo ? "Activo" : "Inactivo"}
                </div>
                <div className={`text-[10px] ${textMuted}`}>
                  Cuenta habilitada
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 border ${borderColor} ${hoverBg} transition-colors`}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  <Shield
                    className={`w-4 h-4 ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                  <span className={textSecondary}>2FA</span>
                </div>
                <div
                  className={`text-lg font-black leading-none ${textPrimary}`}
                >
                  {autenticacion2FA ? "Habilitado" : "No activo"}
                </div>
                <div className={`text-[10px] ${textMuted}`}>
                  Seguridad login
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 border ${borderColor} ${hoverBg} transition-colors`}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  <Clock
                    className={`w-4 h-4 ${
                      darkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                  <span className={textSecondary}>Último login</span>
                </div>
                <div
                  className={`text-[11px] font-bold leading-tight ${textPrimary}`}
                >
                  {formatDateTime(medico.auditoria.ultimo_login)}
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 border ${borderColor} ${hoverBg} transition-colors`}
              >
                <div className="font-bold text-xs flex items-center gap-2">
                  <Star
                    className={`w-4 h-4 ${
                      darkMode ? "text-yellow-400" : "text-yellow-500"
                    }`}
                  />
                  <span className={textSecondary}>Estado</span>
                </div>
                <div
                  className={`text-lg font-black leading-none capitalize ${textPrimary}`}
                >
                  {medico.estado}
                </div>
                <div className={`text-[10px] ${textMuted}`}>
                  Control administrativo
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === INFO PROFESIONAL === */}
        <section
          id="info-profesional"
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-2xl p-6 md:p-8`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div
                className={`text-lg font-black flex items-center gap-2 ${textPrimary}`}
              >
                <Stethoscope className="w-5 h-5 text-cyan-400" />
                Información Profesional
              </div>
              <div className={`text-xs font-medium ${textSecondary}`}>
                Datos visibles al paciente
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Título Profesional
                </label>
                <input
                  type="text"
                  value={tituloProfesional}
                  onChange={(e) => setTituloProfesional(e.target.value)}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${hoverBg} placeholder-slate-400`}
                  placeholder="Ej: Médico Cirujano"
                />
              </div>

              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Universidad
                </label>
                <input
                  type="text"
                  value={universidad}
                  onChange={(e) => setUniversidad(e.target.value)}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${hoverBg} placeholder-slate-400`}
                  placeholder="Ej: Universidad de Chile"
                />
              </div>

              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Año de Graduación
                </label>
                <input
                  type="number"
                  value={anoGraduacion}
                  onChange={(e) => setAnoGraduacion(e.target.value)}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${hoverBg}`}
                  placeholder="2015"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Biografía pública / Presentación
                </label>
                <textarea
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                  rows={6}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-medium leading-relaxed outline-none ${textPrimary} ${hoverBg} placeholder-slate-400`}
                  placeholder="Ej: Médico especialista en salud familiar, con 8+ años de experiencia, enfoque humano y preventivo..."
                />
                <div className={`text-[10px] mt-1 ${textMuted}`}>
                  Esto aparece en agenda en línea y telemedicina.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === MODALIDAD / AGENDA === */}
        <section
          id="disponibilidad"
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-2xl p-6 md:p-8`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div
                className={`text-lg font-black flex items-center gap-2 ${textPrimary}`}
              >
                <Clock className="w-5 h-5 text-emerald-400" />
                Modalidad de Atención
              </div>
              <div className={`text-xs font-medium ${textSecondary}`}>
                Canales habilitados y duración de consulta
              </div>
            </div>
            <Link
              href={`/admin/medicos/${medico.id_medico}`}
              className={`inline-flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl border ${borderColor} ${hoverBg} ${textSecondary} transition-all duration-300`}
            >
              <Clock className="w-3.5 h-3.5" />
              Ver agenda detallada
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              {/* acepta nuevos pacientes */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-2 ${textMuted}`}
                >
                  ¿Acepta nuevos pacientes?
                </label>
                <button
                  type="button"
                  onClick={() => setAceptaNuevosPacientes(!aceptaNuevosPacientes)}
                  className={`w-full flex items-center justify-between rounded-xl border ${borderColor} px-4 py-3 font-bold text-xs shadow-inner transition-all ${hoverBg} ${
                    aceptaNuevosPacientes
                      ? darkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : darkMode
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" />
                    {aceptaNuevosPacientes
                      ? "Sí, puede agendar"
                      : "No acepta nuevos pacientes"}
                  </span>
                  <span
                    className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                      aceptaNuevosPacientes
                        ? darkMode
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-green-50 text-green-600 border border-green-200"
                        : darkMode
                        ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                        : "bg-slate-100 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {aceptaNuevosPacientes ? "ACTIVO" : "CERRADO"}
                  </span>
                </button>
              </div>

              {/* telemedicina */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-2 ${textMuted}`}
                >
                  Telemedicina
                </label>
                <button
                  type="button"
                  onClick={() => setTelemedicina(!telemedicina)}
                  className={`w-full flex items-center justify-between rounded-xl border ${borderColor} px-4 py-3 font-bold text-xs shadow-inner transition-all ${hoverBg} ${
                    telemedicina
                      ? darkMode
                        ? "text-cyan-300"
                        : "text-cyan-700"
                      : darkMode
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {telemedicina
                      ? "Sí, ofrece teleconsulta"
                      : "No ofrece teleconsulta"}
                  </span>
                  <span
                    className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                      telemedicina
                        ? darkMode
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-cyan-50 text-cyan-700 border border-cyan-300"
                        : darkMode
                        ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                        : "bg-slate-100 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {telemedicina ? "ACTIVO" : "OFF"}
                  </span>
                </button>
              </div>

              {/* presencial */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-2 ${textMuted}`}
                >
                  Atención presencial
                </label>
                <button
                  type="button"
                  onClick={() => setPresencial(!presencial)}
                  className={`w-full flex items-center justify-between rounded-xl border ${borderColor} px-4 py-3 font-bold text-xs shadow-inner transition-all ${hoverBg} ${
                    presencial
                      ? darkMode
                        ? "text-blue-300"
                        : "text-blue-700"
                      : darkMode
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {presencial
                      ? "Sí, recibe pacientes presencialmente"
                      : "No atiende presencialmente"}
                  </span>
                  <span
                    className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                      presencial
                        ? darkMode
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-blue-50 text-blue-700 border border-blue-300"
                        : darkMode
                        ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                        : "bg-slate-100 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {presencial ? "ACTIVO" : "OFF"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* duración consulta */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Duración estándar de la consulta (minutos)
                </label>
                <input
                  type="number"
                  value={duracionConsulta}
                  onChange={(e) => setDuracionConsulta(e.target.value)}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${hoverBg}`}
                  placeholder="30"
                />
                <div className={`text-[10px] mt-1 ${textMuted}`}>
                  Se usa para agenda y disponibilidad.
                </div>
              </div>

              {/* coberturas */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-2 ${textMuted}`}
                >
                  Coberturas aceptadas
                </label>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  {/* Particular */}
                  <button
                    type="button"
                    onClick={() => setAtiendeParticular(!atiendeParticular)}
                    className={`flex items-center justify-between w-full rounded-xl border ${borderColor} ${hoverBg} px-4 py-3 font-bold shadow-inner ${
                      atiendeParticular
                        ? darkMode
                          ? "text-emerald-300"
                          : "text-emerald-700"
                        : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    <span>Particular / Pago Directo</span>
                    <span
                      className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                        atiendeParticular
                          ? darkMode
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                          : darkMode
                          ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {atiendeParticular ? "ACEPTA" : "NO"}
                    </span>
                  </button>

                  {/* Fonasa */}
                  <button
                    type="button"
                    onClick={() => setAtiendeFonasa(!atiendeFonasa)}
                    className={`flex items-center justify-between w-full rounded-xl border ${borderColor} ${hoverBg} px-4 py-3 font-bold shadow-inner ${
                      atiendeFonasa
                        ? darkMode
                          ? "text-sky-300"
                          : "text-sky-700"
                        : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    <span>FONASA</span>
                    <span
                      className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                        atiendeFonasa
                          ? darkMode
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-sky-50 text-sky-700 border border-sky-300"
                          : darkMode
                          ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {atiendeFonasa ? "ACEPTA" : "NO"}
                    </span>
                  </button>

                  {/* Isapre */}
                  <button
                    type="button"
                    onClick={() => setAtiendeIsapre(!atiendeIsapre)}
                    className={`flex items-center justify-between w-full rounded-xl border ${borderColor} ${hoverBg} px-4 py-3 font-bold shadow-inner ${
                      atiendeIsapre
                        ? darkMode
                          ? "text-purple-300"
                          : "text-purple-700"
                        : darkMode
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    <span>ISAPRE</span>
                    <span
                      className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                        atiendeIsapre
                          ? darkMode
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-purple-50 text-purple-700 border border-purple-300"
                          : darkMode
                          ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {atiendeIsapre ? "ACEPTA" : "NO"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === PERMISOS / SEGURIDAD === */}
        <section
          id="permisos"
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-2xl p-6 md:p-8`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div
                className={`text-lg font-black flex items-center gap-2 ${textPrimary}`}
              >
                <Shield className="w-5 h-5 text-purple-400" />
                Permisos y Seguridad
              </div>
              <div className={`text-xs font-medium ${textSecondary}`}>
                Control de acceso interno
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
            {/* Roles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label
                  className={`text-[11px] font-bold block ${textMuted}`}
                >
                  Roles asignados
                </label>
                <div
                  className={`text-[10px] font-semibold rounded-lg px-2 py-1 border ${borderColor} ${textSecondary}`}
                >
                  La jerarquía define el alcance
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {rolesDisponibles.length === 0 && (
                  <div
                    className={`text-[11px] font-medium ${textSecondary}`}
                  >
                    No hay roles disponibles.
                  </div>
                )}

                {rolesDisponibles.map((rol) => {
                  const active = rolesSeleccionados.includes(rol.id_rol);
                  return (
                    <button
                      key={rol.id_rol}
                      type="button"
                      onClick={() => toggleRole(rol.id_rol)}
                      className={`rounded-xl border px-3 py-2 text-[11px] font-bold flex flex-col shadow-inner transition-all ${
                        active
                          ? darkMode
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : `${borderColor} ${hoverBg} ${
                              darkMode
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{rol.nombre}</span>
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Nivel {rol.nivel_jerarquia}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seguridad */}
            <div className="space-y-6">
              {/* Forzar cambio password */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-2 ${textMuted}`}
                >
                  Forzar cambio de contraseña
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRequiereCambioPassword(!requiereCambioPassword)
                  }
                  className={`w-full flex items-center justify-between rounded-xl border ${borderColor} ${hoverBg} px-4 py-3 font-bold text-xs shadow-inner transition-all ${
                    requiereCambioPassword
                      ? darkMode
                        ? "text-red-300"
                        : "text-red-600"
                      : darkMode
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {requiereCambioPassword
                      ? "Sí, debe cambiar la clave"
                      : "No forzar por ahora"}
                  </span>
                  <span
                    className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                      requiereCambioPassword
                        ? darkMode
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-red-50 text-red-600 border border-red-300"
                        : darkMode
                        ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                        : "bg-slate-100 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {requiereCambioPassword ? "FORZAR" : "NO"}
                  </span>
                </button>
              </div>

              {/* 2FA */}
              <div>
                <label
                  className={`text-[11px] font-bold block mb-2 ${textMuted}`}
                >
                  Autenticación de Doble Factor (2FA)
                </label>
                <button
                  type="button"
                  onClick={() => setAutenticacion2FA(!autenticacion2FA)}
                  className={`w-full flex items-center justify-between rounded-xl border ${borderColor} ${hoverBg} px-4 py-3 font-bold text-xs shadow-inner transition-all ${
                    autenticacion2FA
                      ? darkMode
                        ? "text-purple-300"
                        : "text-purple-700"
                      : darkMode
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {autenticacion2FA
                      ? "2FA habilitado"
                      : "2FA deshabilitado"}
                  </span>
                  <span
                    className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                      autenticacion2FA
                        ? darkMode
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-purple-50 text-purple-700 border border-purple-300"
                        : darkMode
                        ? "bg-slate-700/60 text-slate-300 border border-slate-600"
                        : "bg-slate-100 text-slate-600 border border-slate-300"
                    }`}
                  >
                    {autenticacion2FA ? "ON" : "OFF"}
                  </span>
                </button>
              </div>

              {/* Último login */}
              <div>
                <div
                  className={`text-[10px] font-semibold rounded-lg px-3 py-2 border ${borderColor} ${textSecondary}`}
                >
                  Último login:{" "}
                  <span className="font-bold text-xs text-indigo-500">
                    {formatDateTime(medico.auditoria.ultimo_login)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === CONTACTO / LOGIN === */}
        <section
          id="contacto"
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-2xl p-6 md:p-8`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div
                className={`text-lg font-black flex items-center gap-2 ${textPrimary}`}
              >
                <Users className="w-5 h-5 text-indigo-400" />
                Datos de Cuenta
              </div>
              <div className={`text-xs font-medium ${textSecondary}`}>
                Información de contacto y login
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Nombre (solo lectura) */}
            <div className="space-y-4 md:col-span-1">
              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Nombre Completo (solo lectura)
                </label>
                <input
                  disabled
                  value={nombreCompleto}
                  className={`w-full rounded-xl border ${borderColor} bg-slate-500/10 px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                />
                <div className={`text-[10px] mt-1 ${textMuted}`}>
                  Para actualizar nombre legal, edita el usuario base.
                </div>
              </div>
            </div>

            {/* email + tel */}
            <div className="space-y-4 md:col-span-1">
              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Email de contacto / login
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${hoverBg}`}
                  placeholder="doctor@centro.cl"
                />
              </div>

              <div>
                <label
                  className={`text-[11px] font-bold block mb-1 ${textMuted}`}
                >
                  Teléfono móvil
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className={`w-full rounded-xl border ${borderColor} bg-transparent px-3 py-2.5 text-sm font-semibold outline-none ${textPrimary} ${hoverBg}`}
                  placeholder="+56 9 8765 4321"
                />
              </div>
            </div>

            {/* nota seguridad */}
            <div className="space-y-4 md:col-span-1">
              <div
                className={`rounded-xl border ${borderColor} ${hoverBg} px-4 py-4 text-[11px] font-medium flex flex-col gap-2`}
              >
                <div className="flex items-start gap-2">
                  <Shield
                    className={`w-4 h-4 flex-shrink-0 ${
                      darkMode ? "text-yellow-300" : "text-yellow-600"
                    }`}
                  />
                  <div className={`${textSecondary}`}>
                    Sospecha actividad rara? Forza cambio de clave en “Permisos
                    y Seguridad”.
                  </div>
                </div>
                <div className={`text-[10px] ${textMuted}`}>
                  ID Usuario interno: #{medico.id_usuario}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === ZONA PELIGRO === */}
        <section
          id="danger"
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-2xl p-6 md:p-8`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div
                className={`text-lg font-black flex items-center gap-2 ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                <Trash2 className="w-5 h-5" />
                Zona Peligrosa
              </div>
              <div
                className={`text-xs font-medium ${
                  darkMode ? "text-red-300" : "text-red-500"
                }`}
              >
                Acciones irreversibles / alto impacto
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Suspender / Reactivar */}
            <div
              className={`rounded-xl border ${
                medico.estado === "activo"
                  ? darkMode
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-red-300 bg-red-50"
                  : darkMode
                  ? "border-green-500/40 bg-green-500/10"
                  : "border-green-300 bg-green-50"
              } p-4 flex flex-col gap-3`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 ${
                    medico.estado === "activo"
                      ? darkMode
                        ? "text-red-300"
                        : "text-red-600"
                      : darkMode
                      ? "text-green-300"
                      : "text-green-600"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`text-[13px] font-extrabold leading-tight ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {medico.estado === "activo"
                      ? "Suspender acceso inmediato"
                      : "Reactivar cuenta médica"}
                  </div>
                  <div
                    className={`text-[11px] font-medium leading-snug ${
                      darkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {medico.estado === "activo"
                      ? "El profesional no podrá iniciar sesión ni figurar en agenda."
                      : "Restablece el acceso y vuelve a habilitar agenda/telemedicina."}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[11px] px-3 py-3 shadow-xl transition-all duration-300 hover:scale-[1.03] ${
                  medico.estado === "activo"
                    ? darkMode
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-red-600 text-white border border-red-600 hover:bg-red-700"
                    : darkMode
                    ? "bg-green-500/20 text-green-300 border border-green-500/40"
                    : "bg-green-600 text-white border border-green-600 hover:bg-green-700"
                }`}
                onClick={async () => {
                  const nuevoEstado =
                    medico.estado === "activo" ? "suspendido" : "activo";

                  const ok = window.confirm(
                    `¿Seguro? El estado pasará a "${nuevoEstado}".`
                  );
                  if (!ok) return;

                  try {
                    setSaving(true);
                    const res = await fetch(
                      `/api/admin/medicos/${medico.id_medico}/estado`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ estado: nuevoEstado }),
                      }
                    );
                    const json = await res.json();
                    if (res.ok && json.success) {
                      setBanner({
                        type: "success",
                        msg: "Estado actualizado.",
                      });
                      fetchMedico();
                    } else {
                      setBanner({
                        type: "error",
                        msg:
                          json.error ||
                          "No se pudo actualizar el estado del médico.",
                      });
                    }
                  } catch (err: any) {
                    setBanner({
                      type: "error",
                      msg: err.message || "Error al cambiar estado.",
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {medico.estado === "activo"
                    ? "Suspender Ahora"
                    : "Reactivar Profesional"}
                </span>
              </button>
            </div>

            {/* Eliminar médico */}
            <div
              className={`rounded-xl border ${
                darkMode
                  ? "border-red-500/40 bg-red-500/10"
                  : "border-red-300 bg-red-50"
              } p-4 flex flex-col gap-3`}
            >
              <div className="flex items-start gap-3">
                <Trash2
                  className={`w-5 h-5 flex-shrink-0 ${
                    darkMode ? "text-red-300" : "text-red-600"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`text-[13px] font-extrabold leading-tight ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Eliminar Definitivamente
                  </div>
                  <div
                    className={`text-[11px] font-medium leading-snug ${
                      darkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Quita al profesional del sistema. Se elimina su acceso.
                    Historial clínico y registros médicos quedan auditables.
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[11px] px-3 py-3 shadow-xl transition-all duration-300 hover:scale-[1.03] ${
                  darkMode
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "bg-red-600 text-white border border-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? "Eliminando..." : "Eliminar Médico"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER ACCIONES */}
        <div
          className={`${cardBg} ${borderColor} border rounded-3xl shadow-xl p-4 md:p-6 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
        >
          <div
            className={`flex flex-wrap items-center gap-2 font-medium ${textSecondary}`}
          >
            <span>Última modificación:</span>
            <span
              className={`font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {formatDateTime(medico.auditoria.fecha_modificacion)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/medicos/${medico.id_medico}`}
              className={`inline-flex items-center gap-2 rounded-xl font-bold text-[11px] px-3 py-2 border ${borderColor} ${hoverBg} ${textSecondary} transition-all duration-300`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancelar / Volver</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-xl font-bold text-[11px] px-3 py-2 bg-gradient-to-r ${primaryGradient} text-white shadow-xl hover:scale-[1.03] transition-transform disabled:opacity-50`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
