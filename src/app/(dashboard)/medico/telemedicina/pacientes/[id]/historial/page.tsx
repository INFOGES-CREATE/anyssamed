//frontend\src\app\(dashboard)\medico\telemedicina\pacientes\[id]\historial\page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ClipboardList,
  Download,
  FileText,
  Film,
  Folder,
  HeartPulse,
  History,
  List,
  Phone,
  Pill,
  Printer,
  Share2,
  Shield,
  Sparkles,
  Stethoscope,
  Sun,
  Moon,
  User,
  Video,
} from "lucide-react";
import Image from "next/image";

// ========================================
// TIPOS
// ========================================

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
      plan: "basico" | "profesional" | "premium" | "empresarial";
      logo_url: string | null;
      ciudad: string;
      region: string;
    };
  };
}

// OJO: marcamos alergias y condiciones_cronicas como opcionales
interface PacienteAPI {
  id_paciente: number;
  nombre_completo: string;
  rut: string;
  edad: number;
  genero: string;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  grupo_sanguineo: string;
  direccion: string | null;
  ciudad: string | null;
  region: string | null;
  alergias?: string[];
  condiciones_cronicas?: string[];
}

interface NotaClinica {
  id_nota: number;
  fecha_nota: string;
  tipo_nota: string;
  contenido: string;
  autor_nombre: string;
  nivel_privacidad: string;
  estado: string;
  etiquetas: string | null;
}

interface RecetaMedica {
  id_receta: number;
  tipo_receta: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: string;
  numero_receta: string | null;
  diagnostico: string | null;
  codigo_cie10: string | null;
  es_cronica: boolean;
  observaciones: string | null;
  medicamentos: Array<{
    id_receta_medicamento: number;
    nombre_medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string | null;
    cantidad: number;
    unidad: string;
    via_administracion: string;
    instrucciones: string | null;
    es_controlado: boolean;
    dispensado: boolean;
  }>;
}

interface ExamenSolicitado {
  id_examen: number;
  tipo_examen_nombre: string;
  tipo_examen_categoria: string;
  fecha_solicitud: string;
  fecha_programada: string | null;
  estado: string;
  prioridad: string;
  motivo_solicitud: string | null;
  diagnostico: string | null;
  numero_orden: string | null;
  resultados: Array<{
    id_resultado: number;
    fecha_resultado: string;
    titulo: string;
    formato: string;
    resultado_texto: string | null;
    resultado_numerico: number | null;
    unidad_medida: string | null;
    url_resultado: string | null;
    interpretacion: string | null;
    estado: string;
    es_critico: boolean;
  }>;
}

interface SignosVitales {
  id_signo_vital: number;
  fecha_medicion: string;
  presion_sistolica: number | null;
  presion_diastolica: number | null;
  pulso: number | null;
  frecuencia_respiratoria: number | null;
  temperatura: number | null;
  saturacion_oxigeno: number | null;
  peso: number | null;
  talla: number | null;
  imc: number | null;
  registrado_por_nombre: string;
}

interface ContactoEmergencia {
  id_contacto: number;
  nombre: string;
  apellido: string;
  relacion: string;
  telefono: string;
  celular: string | null;
  email: string | null;
  es_contacto_principal: boolean;
}

// ========================================
// TEMAS
// ========================================

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
    nombre: "Azul Océano",
    icono: Activity,
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
    nombre: "Verde Médico",
    icono: HeartPulse,
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

export default function HistorialClinicoPage() {
  const router = useRouter();
  const params = useParams();
  const idPaciente = params.id as string;

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paciente, setPaciente] = useState<PacienteAPI | null>(null);
  const [notas, setNotas] = useState<NotaClinica[]>([]);
  const [recetas, setRecetas] = useState<RecetaMedica[]>([]);
  const [examenes, setExamenes] = useState<ExamenSolicitado[]>([]);
  const [signosVitales, setSignosVitales] = useState<SignosVitales[]>([]);
  const [contactosEmergencia, setContactosEmergencia] = useState<ContactoEmergencia[]>([]);

  const [temaActual, setTemaActual] = useState<TemaColor>("light");
  const [tabActiva, setTabActiva] = useState<
    "resumen" | "notas" | "recetas" | "examenes" | "signos" | "documentos" | "timeline"
  >("resumen");

  const tema = useMemo(() => TEMAS[temaActual], [temaActual]);

  // cargar sesión
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const resp = await fetch("/api/auth/session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!resp.ok) {
          throw new Error("No hay sesión activa");
        }

        const data = await resp.json();

        if (data.success && data.usuario) {
          const roles: string[] = [];
          if (data.usuario.rol) {
            roles.push(
              data.usuario.rol.nombre?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
            );
          }
          const esMedico = roles.some((r) => r.includes("MEDICO"));
          if (!esMedico || !data.usuario.medico) {
            alert("Acceso denegado. Este módulo es solo para médicos.");
            router.push("/");
            return;
          }
          setUsuario(data.usuario);
        } else {
          router.push("/login");
          return;
        }
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        router.push("/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [router]);

  // cargar historial paciente
  useEffect(() => {
    const cargarHistorialPaciente = async () => {
      if (!idPaciente) return;
      try {
        setLoading(true);
        const resp = await fetch(`/api/telemedicina/pacientes/${idPaciente}/historial`, {
          method: "GET",
          credentials: "include",
        });

        if (!resp.ok) {
          const errJson = await resp.json().catch(() => null);
          console.error("Error backend historial:", errJson);
          throw new Error("No se pudo cargar el historial");
        }

        const data = await resp.json();
        if (!data.success) {
          throw new Error(data.error || "No se pudo cargar el historial");
        }

        // normalizar para evitar undefined
        const pacienteNormalizado: PacienteAPI = {
          ...data.paciente,
          alergias: (data.paciente?.alergias ?? []) as string[],
          condiciones_cronicas: (data.paciente?.condiciones_cronicas ?? []) as string[],
        };

        setPaciente(pacienteNormalizado);
        setNotas(data.historial?.notas ?? []);
        setRecetas(data.historial?.recetas ?? []);
        setExamenes(data.historial?.examenes ?? []);
        setSignosVitales(data.historial?.signos_vitales ?? []);
        setContactosEmergencia(data.historial?.contactos_emergencia ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al cargar el historial clínico");
      } finally {
        setLoading(false);
      }
    };

    if (usuario) {
      cargarHistorialPaciente();
    }
  }, [usuario, idPaciente]);

  // acciones
  const descargarPDF = async () => {
    try {
      const response = await fetch(`/api/telemedicina/pacientes/${idPaciente}/historial/pdf`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `historial_paciente_${idPaciente}_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("No se pudo generar el PDF (revisa que exista el endpoint /pdf)");
      }
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al generar el PDF");
    }
  };

  const imprimirHistorial = () => {
    window.print();
  };

  const compartirHistorial = async () => {
    const url = window.location.href;
    const texto = `Historial Clínico - Paciente #${idPaciente}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: texto, url });
      } catch (error) {
        console.error("Error al compartir:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    }
  };

  // loading
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br ${tema.colores.gradiente} rounded-full flex items-center justify-center animate-pulse`}
            >
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className={`text-4xl font-black mb-4 ${tema.colores.texto}`}>Cargando Historial Clínico</h2>
          <p className={`text-lg font-semibold ${tema.colores.textoSecundario} animate-pulse`}>
            Obteniendo información del paciente...
          </p>
        </div>
      </div>
    );
  }

  // error
  if (error || !paciente) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tema.colores.fondo}`}>
        <div
          className={`text-center max-w-md mx-auto p-8 rounded-3xl ${tema.colores.card} ${tema.colores.sombra} ${tema.colores.borde} border`}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-3xl font-black mb-4 ${tema.colores.texto}`}>Error</h2>
          <p className={`text-lg mb-8 ${tema.colores.textoSecundario}`}>
            {error || "No se pudo cargar el historial clínico"}
          </p>
          <button
            onClick={() => router.push("/medico/telemedicina")}
            className={`inline-flex items-center gap-3 px-8 py-4 ${tema.colores.primario} text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105`}
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  // render principal
  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.colores.fondo}`}>
      {/* HEADER */}
      <header
        className={`${tema.colores.header} ${tema.colores.borde} border-b ${tema.colores.sombra} sticky top-0 z-50`}
      >
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Paciente */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
              >
                {paciente.foto_url ? (
                    <Image
                      src={paciente.foto_url}
                      alt={paciente.nombre_completo}
                      width={64}
                      height={64}
                      className="rounded-2xl object-cover"
                    />
                  ) : (
                    paciente.nombre_completo
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                  )}
              </div>

              <div>
                <h1 className={`text-2xl font-black ${tema.colores.texto}`}>{paciente.nombre_completo}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>
                    {paciente.edad} años • {paciente.genero}
                  </span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                    {paciente.grupo_sanguineo}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                    HISTORIAL ACTIVO
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              {/* Tema */}
              <div className="relative group">
                <button
                  className={`p-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110`}
                >
                  <tema.icono className="w-5 h-5" />
                </button>
                <div
                  className={`absolute top-full right-0 mt-2 w-48 rounded-xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1`}
                >
                  {Object.entries(TEMAS).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => setTemaActual(key as TemaColor)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        temaActual === key
                          ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                          : `${tema.colores.hover} ${tema.colores.texto}`
                      }`}
                    >
                      <t.icono className="w-4 h-4" />
                      <span className="text-sm">{t.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={descargarPDF}
                className={`px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2`}
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">PDF</span>
              </button>

              <button
                onClick={imprimirHistorial}
                className={`px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2`}
              >
                <Printer className="w-5 h-5" />
                <span className="hidden md:inline">Imprimir</span>
              </button>

              <button
                onClick={compartirHistorial}
                className={`px-4 py-3 rounded-xl ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2`}
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden md:inline">Compartir</span>
              </button>

              <button
                onClick={() => router.push(`/medico/telemedicina?paciente=${idPaciente}`)}
                className={`px-6 py-3 rounded-xl ${tema.colores.primario} text-white font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2`}
              >
                <Video className="w-5 h-5" />
                Ver Sesiones
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <aside className="lg:col-span-3 space-y-6">
            {/* info básica */}
            <div
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-6`}
            >
              <h3 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                <User className="w-5 h-5" />
                INFORMACIÓN BÁSICA
              </h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>RUT</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.rut}</p>
                </div>
                <div>
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Edad</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.edad} años</p>
                </div>
                <div>
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Género</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.genero}</p>
                </div>
                <div>
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Grupo Sanguíneo</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.grupo_sanguineo}</p>
                </div>
                <div>
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Teléfono</p>
                  <p className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.telefono || "No registrado"}</p>
                </div>
                <div>
                  <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Email</p>
                  <p className={`text-sm font-bold ${tema.colores.texto} break-all`}>
                    {paciente.email || "No registrado"}
                  </p>
                </div>
                {paciente.direccion && (
                  <div>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Dirección</p>
                    <p className={`text-sm font-bold ${tema.colores.texto}`}>{paciente.direccion}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>
                      {paciente.ciudad}, {paciente.region}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Alergias */}
            {(paciente?.alergias ?? []).length > 0 && (
              <div
                className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-6`}
              >
                <h3 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  ALERGIAS
                </h3>
                <div className="space-y-2">
                  {(paciente?.alergias ?? []).map((alergia, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                      <p className="text-sm font-bold text-red-400">⚠️ {alergia}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Condiciones crónicas */}
            {(paciente?.condiciones_cronicas ?? []).length > 0 && (
              <div
                className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-6`}
              >
                <h3 className={`text-lg font-black ${tema.colores.texto} mb-4`}>Condiciones crónicas</h3>
                <div className="space-y-2">
                  {(paciente?.condiciones_cronicas ?? []).map((condicion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                    >
                      <p className="text-sm font-medium text-amber-400">{condicion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contactos de emergencia */}
            {contactosEmergencia.length > 0 && (
              <div
                className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-6`}
              >
                <h3 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
                  <Phone className="w-5 h-5" />
                  CONTACTOS DE EMERGENCIA
                </h3>
                <div className="space-y-3">
                  {contactosEmergencia.map((c) => (
                    <div key={c.id_contacto} className={`p-3 rounded-lg ${tema.colores.secundario}`}>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {c.nombre} {c.apellido}
                      </p>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>{c.relacion}</p>
                      <p className={`text-xs ${tema.colores.textoSecundario} mt-1`}>📞 {c.telefono}</p>
                      {c.es_contacto_principal && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* MAIN */}
          <div className="lg:col-span-9 space-y-6">
            {/* cards de arriba */}
            <div
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} p-6`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Última actividad</p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>
                        {(() => {
                          const fechas: Date[] = [];
                          if (notas[0]) fechas.push(new Date(notas[0].fecha_nota));
                          if (recetas[0]) fechas.push(new Date(recetas[0].fecha_emision));
                          if (examenes[0]) fechas.push(new Date(examenes[0].fecha_solicitud));
                          if (signosVitales[0]) fechas.push(new Date(signosVitales[0].fecha_medicion));
                          if (fechas.length === 0) return "Sin registros";
                          const ultima = fechas.sort((a, b) => b.getTime() - a.getTime())[0];
                          return ultima.toLocaleDateString("es-CL");
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Notas Clínicas</p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>{notas.length}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Recetas</p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>{recetas.length}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${tema.colores.secundario}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                    >
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-xs ${tema.colores.textoSecundario}`}>Exámenes</p>
                      <p className={`text-sm font-bold ${tema.colores.texto}`}>{examenes.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className={`rounded-2xl ${tema.colores.card} ${tema.colores.borde} border ${tema.colores.sombra} overflow-hidden`}
            >
              <div className="flex items-center overflow-x-auto">
                {[
                  { id: "resumen", label: "Resumen", icon: FileText },
                  { id: "notas", label: `Notas (${notas.length})`, icon: ClipboardList },
                  { id: "recetas", label: `Recetas (${recetas.length})`, icon: Pill },
                  { id: "examenes", label: `Exámenes (${examenes.length})`, icon: Activity },
                  { id: "signos", label: `Signos Vitales (${signosVitales.length})`, icon: HeartPulse },
                  { id: "documentos", label: "Documentos", icon: Folder },
                  { id: "timeline", label: "Línea de Tiempo", icon: History },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id as any)}
                    className={`flex-1 min-w-fit px-6 py-4 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      tabActiva === tab.id
                        ? `bg-gradient-to-r ${tema.colores.gradiente} text-white`
                        : `${tema.colores.texto} ${tema.colores.hover}`
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tabActiva === "resumen" && (
                  <ResumenTab
                    paciente={paciente}
                    notas={notas}
                    recetas={recetas}
                    examenes={examenes}
                    signosVitales={signosVitales}
                    tema={tema}
                  />
                )}
                {tabActiva === "notas" && <NotasTab notas={notas} tema={tema} />}
                {tabActiva === "recetas" && <RecetasTab recetas={recetas} tema={tema} />}
                {tabActiva === "examenes" && <ExamenesTab examenes={examenes} tema={tema} />}
                {tabActiva === "signos" && <SignosVitalesTab signosVitales={signosVitales} tema={tema} />}
                {tabActiva === "documentos" && (
                  <DocumentosTab paciente={paciente} tema={tema} onDescargarPDF={descargarPDF} />
                )}
                {tabActiva === "timeline" && (
                  <TimelineTab
                    notas={notas}
                    recetas={recetas}
                    examenes={examenes}
                    signosVitales={signosVitales}
                    tema={tema}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ========================================
// TABS
// ========================================

function ResumenTab({
  paciente,
  notas,
  recetas,
  examenes,
  signosVitales,
  tema,
}: {
  paciente: PacienteAPI;
  notas: NotaClinica[];
  recetas: RecetaMedica[];
  examenes: ExamenSolicitado[];
  signosVitales: SignosVitales[];
  tema: ConfiguracionTema;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
          <div className="flex items-center justify-between mb-2">
            <ClipboardList className={`w-8 h-8 ${tema.colores.acento}`} />
            <span className={`text-3xl font-black ${tema.colores.texto}`}>{notas.length}</span>
          </div>
          <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Notas Clínicas</p>
        </div>

        <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
          <div className="flex items-center justify-between mb-2">
            <Pill className={`w-8 h-8 ${tema.colores.acento}`} />
            <span className={`text-3xl font-black ${tema.colores.texto}`}>{recetas.length}</span>
          </div>
          <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Recetas Emitidas</p>
        </div>

        <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
          <div className="flex items-center justify-between mb-2">
            <Activity className={`w-8 h-8 ${tema.colores.acento}`} />
            <span className={`text-3xl font-black ${tema.colores.texto}`}>{examenes.length}</span>
          </div>
          <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Exámenes Solicitados</p>
        </div>

        <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
          <div className="flex items-center justify-between mb-2">
            <HeartPulse className={`w-8 h-8 ${tema.colores.acento}`} />
            <span className={`text-3xl font-black ${tema.colores.texto}`}>{signosVitales.length}</span>
          </div>
          <p className={`text-sm font-semibold ${tema.colores.textoSecundario}`}>Registros Vitales</p>
        </div>
      </div>

      {/* Últimas notas */}
      {notas.length > 0 && (
        <div className={`rounded-xl ${tema.colores.secundario} p-6`}>
          <h3 className={`text-lg font-black ${tema.colores.texto} mb-4`}>Últimas Notas Clínicas</h3>
          <div className="space-y-3">
            {notas.slice(0, 3).map((nota) => (
              <div key={nota.id_nota} className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border`}>
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      nota.tipo_nota === "diagnostico"
                        ? "bg-green-500/20 text-green-400"
                        : nota.tipo_nota === "tratamiento"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    {nota.tipo_nota}
                  </span>
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    {new Date(nota.fecha_nota).toLocaleDateString("es-CL")}
                  </span>
                </div>
                <p className={`text-sm ${tema.colores.texto} leading-relaxed`}>{nota.contenido}</p>
                <p className={`text-xs ${tema.colores.textoSecundario} mt-2`}>Por: {nota.autor_nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimos signos vitales */}
      {signosVitales.length > 0 && (
        <div className={`rounded-xl ${tema.colores.secundario} p-6`}>
          <h3 className={`text-lg font-black ${tema.colores.texto} mb-4`}>Últimos Signos Vitales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {signosVitales[0].presion_sistolica && (
              <div className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Presión Arterial</p>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>
                  {signosVitales[0].presion_sistolica}/{signosVitales[0].presion_diastolica}
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>mmHg</p>
              </div>
            )}
            {signosVitales[0].pulso && (
              <div className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Pulso</p>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>{signosVitales[0].pulso}</p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>lpm</p>
              </div>
            )}
            {signosVitales[0].temperatura && (
              <div className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Temperatura</p>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>{signosVitales[0].temperatura}</p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>°C</p>
              </div>
            )}
            {signosVitales[0].saturacion_oxigeno && (
              <div className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Saturación O2</p>
                <p className={`text-2xl font-black ${tema.colores.texto}`}>{signosVitales[0].saturacion_oxigeno}</p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotasTab({ notas, tema }: { notas: NotaClinica[]; tema: ConfiguracionTema }) {
  return (
    <div className="space-y-4">
      {notas.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4 opacity-50`} />
          <p className={`text-lg ${tema.colores.textoSecundario}`}>No hay notas clínicas registradas</p>
        </div>
      ) : (
        notas.map((nota) => (
          <div
            key={nota.id_nota}
            className={`p-6 rounded-xl ${tema.colores.secundario} border-l-4 ${
              nota.tipo_nota === "diagnostico"
                ? "border-green-500"
                : nota.tipo_nota === "tratamiento"
                ? "border-blue-500"
                : nota.tipo_nota === "observacion"
                ? "border-indigo-500"
                : "border-yellow-500"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                    nota.tipo_nota === "diagnostico"
                      ? "bg-green-500/20 text-green-400"
                      : nota.tipo_nota === "tratamiento"
                      ? "bg-blue-500/20 text-blue-400"
                      : nota.tipo_nota === "observacion"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {nota.tipo_nota.toUpperCase()}
                </span>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  {new Date(nota.fecha_nota).toLocaleString("es-CL")}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  nota.estado === "activo"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {nota.estado}
              </span>
            </div>
            <p className={`text-sm ${tema.colores.texto} leading-relaxed mb-3`}>{nota.contenido}</p>
            <div className="flex items-center justify-between">
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                <strong>Por:</strong> {nota.autor_nombre}
              </p>
              {nota.etiquetas && (
                <div className="flex gap-2">
                  {nota.etiquetas.split(",").map((e, i) => (
                    <span key={i} className={`px-2 py-1 rounded-full text-xs font-bold ${tema.colores.secundario}`}>
                      #{e.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RecetasTab({ recetas, tema }: { recetas: RecetaMedica[]; tema: ConfiguracionTema }) {
  return (
    <div className="space-y-4">
      {recetas.length === 0 ? (
        <div className="text-center py-12">
          <Pill className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4 opacity-50`} />
          <p className={`text-lg ${tema.colores.textoSecundario}`}>No hay recetas emitidas</p>
        </div>
      ) : (
        recetas.map((receta) => (
          <div
            key={receta.id_receta}
            className={`p-6 rounded-xl ${tema.colores.secundario} border-l-4 border-green-500`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      receta.tipo_receta === "controlada"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {receta.tipo_receta.toUpperCase()}
                  </span>
                  {receta.es_cronica && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                      CRÓNICA
                    </span>
                  )}
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  <strong>Nº Receta:</strong> {receta.numero_receta || "Sin número"}
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  <strong>Fecha:</strong> {new Date(receta.fecha_emision).toLocaleDateString("es-CL")}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  receta.estado === "emitida"
                    ? "bg-blue-500/20 text-blue-400"
                    : receta.estado === "dispensada"
                    ? "bg-green-500/20 text-green-400"
                    : receta.estado === "anulada"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {receta.estado.toUpperCase()}
              </span>
            </div>

            {receta.diagnostico && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs font-bold text-blue-400 mb-1">Diagnóstico:</p>
                <p className={`text-sm ${tema.colores.texto}`}>
                  {receta.diagnostico}
                  {receta.codigo_cie10 && (
                    <span className="ml-2 text-xs text-blue-400">({receta.codigo_cie10})</span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className={`text-sm font-black ${tema.colores.texto} mb-2`}>Medicamentos:</h4>
              {receta.medicamentos.map((med) => (
                <div
                  key={med.id_receta_medicamento}
                  className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className={`text-sm font-black ${tema.colores.texto} mb-1`}>
                        {med.nombre_medicamento}
                        {med.es_controlado && (
                          <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                            CONTROLADO
                          </span>
                        )}
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p className={tema.colores.textoSecundario}>
                          <strong>Dosis:</strong> {med.dosis}
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          <strong>Frecuencia:</strong> {med.frecuencia}
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          <strong>Duración:</strong> {med.duracion || "No especificada"}
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          <strong>Cantidad:</strong> {med.cantidad} {med.unidad}
                        </p>
                        <p className={tema.colores.textoSecundario}>
                          <strong>Vía:</strong> {med.via_administracion}
                        </p>
                      </div>
                    </div>
                    {med.dispensado && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-xs font-bold text-green-400">DISPENSADO</span>
                      </div>
                    )}
                  </div>
                  {med.instrucciones && (
                    <div className="mt-2 p-2 rounded bg-indigo-500/10 border border-indigo-500/30">
                      <p className="text-xs font-bold text-indigo-400 mb-1">Instrucciones:</p>
                      <p className={`text-xs ${tema.colores.texto}`}>{med.instrucciones}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {receta.observaciones && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-xs font-bold text-yellow-400 mb-1">Observaciones:</p>
                <p className={`text-sm ${tema.colores.texto}`}>{receta.observaciones}</p>
              </div>
            )}

            {receta.fecha_vencimiento && (
              <div className="mt-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <p className={`text-xs ${tema.colores.textoSecundario}`}>
                  <strong>Vence:</strong>{" "}
                  {new Date(receta.fecha_vencimiento).toLocaleDateString("es-CL")}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function ExamenesTab({ examenes, tema }: { examenes: ExamenSolicitado[]; tema: ConfiguracionTema }) {
  return (
    <div className="space-y-4">
      {examenes.length === 0 ? (
        <div className="text-center py-12">
          <Activity className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4 opacity-50`} />
          <p className={`text-lg ${tema.colores.textoSecundario}`}>No hay exámenes solicitados</p>
        </div>
      ) : (
        examenes.map((examen) => (
          <div
            key={examen.id_examen}
            className={`p-6 rounded-xl ${tema.colores.secundario} border-l-4 ${
              examen.prioridad === "urgente"
                ? "border-red-500"
                : examen.prioridad === "alta"
                ? "border-orange-500"
                : "border-blue-500"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`text-lg font-black ${tema.colores.texto}`}>{examen.tipo_examen_nombre}</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      examen.prioridad === "urgente"
                        ? "bg-red-500/20 text-red-400"
                        : examen.prioridad === "alta"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {examen.prioridad.toUpperCase()}
                  </span>
                </div>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>
                  <strong>Categoría:</strong> {examen.tipo_examen_categoria}
                </p>
                <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>
                  <strong>Solicitado:</strong>{" "}
                  {new Date(examen.fecha_solicitud).toLocaleDateString("es-CL")}
                </p>
                {examen.fecha_programada && (
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    <strong>Programado:</strong>{" "}
                    {new Date(examen.fecha_programada).toLocaleDateString("es-CL")}
                  </p>
                )}
                {examen.numero_orden && (
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    <strong>Nº Orden:</strong> {examen.numero_orden}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  examen.estado === "completado"
                    ? "bg-green-500/20 text-green-400"
                    : examen.estado === "en_proceso"
                    ? "bg-blue-500/20 text-blue-400"
                    : examen.estado === "pendiente"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {examen.estado.toUpperCase()}
              </span>
            </div>

            {examen.motivo_solicitud && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs font-bold text-blue-400 mb-1">Motivo de Solicitud:</p>
                <p className={`text-sm ${tema.colores.texto}`}>{examen.motivo_solicitud}</p>
              </div>
            )}

            {examen.diagnostico && (
              <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-xs font-bold text-purple-400 mb-1">Diagnóstico Asociado:</p>
                <p className={`text-sm ${tema.colores.texto}`}>{examen.diagnostico}</p>
              </div>
            )}

            {examen.resultados && examen.resultados.length > 0 && (
              <div className="mt-4">
                <h5 className={`text-sm font-black ${tema.colores.texto} mb-3 flex items-center gap-2`}>
                  <FileText className="w-4 h-4" />
                  Resultados ({examen.resultados.length})
                </h5>
                <div className="space-y-3">
                  {examen.resultados.map((resultado) => (
                    <div
                      key={resultado.id_resultado}
                      className={`p-4 rounded-lg ${tema.colores.card} ${tema.colores.borde} border ${
                        resultado.es_critico ? "border-red-500 bg-red-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h6 className={`text-sm font-bold ${tema.colores.texto} mb-1`}>
                            {resultado.titulo}
                            {resultado.es_critico && (
                              <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                                ⚠️ CRÍTICO
                              </span>
                            )}
                          </h6>
                          <p className={`text-xs ${tema.colores.textoSecundario}`}>
                            {new Date(resultado.fecha_resultado).toLocaleDateString("es-CL")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            resultado.estado === "validado"
                              ? "bg-green-500/20 text-green-400"
                              : resultado.estado === "preliminar"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {resultado.estado.toUpperCase()}
                        </span>
                      </div>

                      {resultado.resultado_numerico !== null && (
                        <div className="mb-2">
                          <p className={`text-2xl font-black ${tema.colores.texto}`}>
                            {resultado.resultado_numerico} {resultado.unidad_medida}
                          </p>
                        </div>
                      )}

                      {resultado.resultado_texto && (
                        <div className="mb-2 p-2 rounded bg-gray-500/10">
                          <p className={`text-sm ${tema.colores.texto}`}>{resultado.resultado_texto}</p>
                        </div>
                      )}

                      {resultado.interpretacion && (
                        <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/30">
                          <p className="text-xs font-bold text-indigo-400 mb-1">Interpretación:</p>
                          <p className={`text-xs ${tema.colores.texto}`}>{resultado.interpretacion}</p>
                        </div>
                      )}

                      {resultado.url_resultado && (
                        <div className="mt-3">
                          <a
                            href={resultado.url_resultado}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-bold text-xs transition-all duration-300 hover:scale-105`}
                          >
                            <Download className="w-4 h-4" />
                            Descargar Resultado
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function SignosVitalesTab({ signosVitales, tema }: { signosVitales: SignosVitales[]; tema: ConfiguracionTema }) {
  const [vistaGrafica, setVistaGrafica] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-black ${tema.colores.texto}`}>
          Registro de Signos Vitales ({signosVitales.length})
        </h3>
        <button
          onClick={() => setVistaGrafica(!vistaGrafica)}
          className={`px-4 py-2 rounded-lg ${tema.colores.secundario} ${tema.colores.texto} font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2`}
        >
          {vistaGrafica ? <List className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
          {vistaGrafica ? "Vista Lista" : "Vista Gráfica"}
        </button>
      </div>

      {signosVitales.length === 0 ? (
        <div className="text-center py-12">
          <HeartPulse className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4 opacity-50`} />
          <p className={`text-lg ${tema.colores.textoSecundario}`}>No hay signos vitales registrados</p>
        </div>
      ) : vistaGrafica ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* presión */}
          <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
            <h4 className={`text-sm font-black ${tema.colores.texto} mb-4`}>Presión Arterial</h4>
            <div className="space-y-2">
              {signosVitales
                .slice(0, 10)
                .reverse()
                .map((signo) => (
                  <div key={signo.id_signo_vital} className="flex items-center gap-2">
                    <span className={`text-xs ${tema.colores.textoSecundario} w-20`}>
                      {new Date(signo.fecha_medicion).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${(signo.presion_sistolica || 0) / 2}%` }}
                      >
                        {signo.presion_sistolica}
                      </div>
                      <span className={`text-xs ${tema.colores.texto}`}>/</span>
                      <div
                        className="h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${(signo.presion_diastolica || 0) / 2}%` }}
                      >
                        {signo.presion_diastolica}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* pulso */}
          <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
            <h4 className={`text-sm font-black ${tema.colores.texto} mb-4`}>Frecuencia Cardíaca</h4>
            <div className="space-y-2">
              {signosVitales
                .slice(0, 10)
                .reverse()
                .map((signo) => (
                  <div key={signo.id_signo_vital} className="flex items-center gap-2">
                    <span className={`text-xs ${tema.colores.textoSecundario} w-20`}>
                      {new Date(signo.fecha_medicion).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${((signo.pulso || 0) / 150) * 100}%` }}
                      >
                        {signo.pulso} lpm
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* temperatura */}
          <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
            <h4 className={`text-sm font-black ${tema.colores.texto} mb-4`}>Temperatura Corporal</h4>
            <div className="space-y-2">
              {signosVitales
                .slice(0, 10)
                .reverse()
                .map((signo) => (
                  <div key={signo.id_signo_vital} className="flex items-center gap-2">
                    <span className={`text-xs ${tema.colores.textoSecundario} w-20`}>
                      {new Date(signo.fecha_medicion).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <div className="flex-1">
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          (signo.temperatura || 0) > 37.5
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                        }`}
                        style={{ width: `${((signo.temperatura || 0) / 42) * 100}%` }}
                      >
                        {signo.temperatura}°C
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* saturación */}
          <div className={`p-6 rounded-xl ${tema.colores.secundario}`}>
            <h4 className={`text-sm font-black ${tema.colores.texto} mb-4`}>Saturación de Oxígeno</h4>
            <div className="space-y-2">
              {signosVitales
                .slice(0, 10)
                .reverse()
                .map((signo) => (
                  <div key={signo.id_signo_vital} className="flex items-center gap-2">
                    <span className={`text-xs ${tema.colores.textoSecundario} w-20`}>
                      {new Date(signo.fecha_medicion).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <div className="flex-1">
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          (signo.saturacion_oxigeno || 0) < 95
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                        style={{ width: `${signo.saturacion_oxigeno}%` }}
                      >
                        {signo.saturacion_oxigeno}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {signosVitales.map((signo) => (
            <div
              key={signo.id_signo_vital}
              className={`p-6 rounded-xl ${tema.colores.secundario} border-l-4 border-green-500`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-sm font-black ${tema.colores.texto}`}>
                    {new Date(signo.fecha_medicion).toLocaleString("es-CL")}
                  </p>
                  <p className={`text-xs ${tema.colores.textoSecundario}`}>
                    Registrado por: {signo.registrado_por_nombre}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
                >
                  <HeartPulse className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {signo.presion_sistolica && signo.presion_diastolica && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Presión Arterial</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>
                      {signo.presion_sistolica}/{signo.presion_diastolica}
                    </p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>mmHg</p>
                  </div>
                )}

                {signo.pulso && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Pulso</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.pulso}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>lpm</p>
                  </div>
                )}

                {signo.frecuencia_respiratoria && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Frec. Respiratoria</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.frecuencia_respiratoria}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>rpm</p>
                  </div>
                )}

                {signo.temperatura && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Temperatura</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.temperatura}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>°C</p>
                  </div>
                )}

                {signo.saturacion_oxigeno && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Saturación O2</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.saturacion_oxigeno}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>%</p>
                  </div>
                )}

                {signo.peso && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Peso</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.peso}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>kg</p>
                  </div>
                )}

                {signo.talla && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>Talla</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.talla}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>cm</p>
                  </div>
                )}

                {signo.imc && (
                  <div className={`p-3 rounded-lg ${tema.colores.card} ${tema.colores.borde} border text-center`}>
                    <p className={`text-xs ${tema.colores.textoSecundario} mb-1`}>IMC</p>
                    <p className={`text-lg font-black ${tema.colores.texto}`}>{signo.imc}</p>
                    <p className={`text-xs ${tema.colores.textoSecundario}`}>kg/m²</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentosTab({
  paciente,
  tema,
  onDescargarPDF,
}: {
  paciente: PacienteAPI;
  tema: ConfiguracionTema;
  onDescargarPDF: () => void;
}) {
  const documentos = [
    {
      id: 1,
      nombre: "Historial Clínico (PDF)",
      tipo: "PDF",
      fecha: new Date().toISOString(),
      action: onDescargarPDF,
      icono: FileText,
      disponible: true,
    },
    {
      id: 2,
      nombre: "Consentimiento Informado",
      tipo: "PDF",
      fecha: new Date().toISOString(),
      action: () => alert("Aquí puedes enlazar el consentimiento del paciente."),
      icono: Shield,
      disponible: true,
    },
    {
      id: 3,
      nombre: "Adjuntos / Imágenes",
      tipo: "OTRO",
      fecha: new Date().toISOString(),
      action: () => alert("Aquí puedes abrir el visor de documentos / imágenes."),
      icono: Film,
      disponible: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentos.map((doc) => (
          <div
            key={doc.id}
            className={`p-6 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tema.colores.gradiente} flex items-center justify-center`}
              >
                <doc.icono className="w-6 h-6 text-white" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  doc.tipo === "PDF" ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
                }`}
              >
                {doc.tipo}
              </span>
            </div>

            <h4 className={`text-sm font-black ${tema.colores.texto} mb-2`}>{doc.nombre}</h4>
            <p className={`text-xs ${tema.colores.textoSecundario} mb-4`}>
              {new Date(doc.fecha).toLocaleDateString("es-CL")}
            </p>

            {doc.disponible ? (
              <button
                onClick={doc.action}
                className={`w-full px-4 py-2 rounded-lg ${tema.colores.primario} text-white font-bold text-xs transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2`}
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            ) : (
              <div className="w-full px-4 py-2 rounded-lg bg-gray-500/20 text-gray-400 font-bold text-xs text-center">
                No Disponible
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`p-6 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border`}>
        <h3 className={`text-lg font-black ${tema.colores.texto} mb-4 flex items-center gap-2`}>
          <Shield className="w-5 h-5" />
          Información Legal
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>Paciente identificado</p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Historial cargado para: {paciente.nombre_completo}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-bold ${tema.colores.texto}`}>Protección de Datos</p>
              <p className={`text-xs ${tema.colores.textoSecundario}`}>
                Toda la información está protegida según normativa vigente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineTab({
  notas,
  recetas,
  examenes,
  signosVitales,
  tema,
}: {
  notas: NotaClinica[];
  recetas: RecetaMedica[];
  examenes: ExamenSolicitado[];
  signosVitales: SignosVitales[];
  tema: ConfiguracionTema;
}) {
  const eventos = [
    ...notas.map((nota) => ({
      tipo: "nota" as const,
      fecha: nota.fecha_nota,
      titulo: `Nota Clínica: ${nota.tipo_nota}`,
      descripcion: nota.contenido,
      icono: ClipboardList,
      color: "from-indigo-500 to-purple-500",
    })),
    ...recetas.map((rec) => ({
      tipo: "receta" as const,
      fecha: rec.fecha_emision,
      titulo: `Receta Médica ${rec.tipo_receta}`,
      descripcion: `${rec.medicamentos.length} medicamento(s) prescrito(s)`,
      icono: Pill,
      color: "from-green-500 to-emerald-500",
    })),
    ...examenes.map((ex) => ({
      tipo: "examen" as const,
      fecha: ex.fecha_solicitud,
      titulo: `Examen: ${ex.tipo_examen_nombre}`,
      descripcion: ex.motivo_solicitud || "Sin motivo especificado",
      icono: Activity,
      color: "from-blue-500 to-cyan-500",
    })),
    ...signosVitales.map((sv) => ({
      tipo: "signos" as const,
      fecha: sv.fecha_medicion,
      titulo: "Signos Vitales Registrados",
      descripcion: `PA: ${sv.presion_sistolica ?? "-"} / ${sv.presion_diastolica ?? "-"} mmHg, FC: ${
        sv.pulso ?? "-"
      } lpm`,
      icono: HeartPulse,
      color: "from-red-500 to-pink-500",
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${tema.colores.borde}`}></div>
        <div className="space-y-6">
          {eventos.map((evento, index) => (
            <div key={index} className="relative pl-16">
              <div
                className={`absolute left-0 w-12 h-12 rounded-xl bg-gradient-to-br ${evento.color} flex items-center justify-center shadow-lg`}
              >
                <evento.icono className="w-6 h-6 text-white" />
              </div>
              <div className={`p-6 rounded-xl ${tema.colores.secundario} ${tema.colores.borde} border`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`text-sm font-black ${tema.colores.texto}`}>{evento.titulo}</h4>
                  <span className={`text-xs ${tema.colores.textoSecundario}`}>
                    {new Date(evento.fecha).toLocaleString("es-CL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className={`text-sm ${tema.colores.texto}`}>{evento.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {eventos.length === 0 && (
        <div className="text-center py-12">
          <History className={`w-16 h-16 ${tema.colores.textoSecundario} mx-auto mb-4 opacity-50`} />
          <p className={`text-lg ${tema.colores.textoSecundario}`}>No hay eventos registrados</p>
        </div>
      )}
    </div>
  );
}
