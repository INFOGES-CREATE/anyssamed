"use client";

import { useState, useEffect } from "react";
import MedicoLayout from "../../layout/MedicoLayout";
import {
  UserPlus,
  Save,
  X,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Star,
  User,
  Mail,
  Phone,
  ChevronRight,
  MapPin,
  Calendar,
  Droplet,
  Weight,
  Ruler,
  FileText,
  Shield,
  Heart,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  prevision: string;
  numero_prevision: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_relacion: string;
  notas_importantes: string;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function NuevoPacientePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados de geo
  const [paises, setPaises] = useState<Pais[]>([]);
  const [regionesDisponibles, setRegionesDisponibles] = useState<RegionGeo[]>([]);
  const [comunasDisponibles, setComunasDisponibles] = useState<ComunaGeo[]>([]);

  // Formulario
  const [formulario, setFormulario] = useState<FormularioPaciente>({
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
    prevision: "",
    numero_prevision: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    contacto_emergencia_relacion: "",
    notas_importantes: "",
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [pasoActual, setPasoActual] = useState(1);

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    cargarDatosUsuario();
    cargarPaises();
  }, []);

  useEffect(() => {
    if (formulario.pais_id) {
      cargarRegiones(formulario.pais_id);
    } else {
      setRegionesDisponibles([]);
      setComunasDisponibles([]);
    }
  }, [formulario.pais_id]);

  useEffect(() => {
    if (formulario.region_id) {
      cargarComunas(formulario.region_id);
    } else {
      setComunasDisponibles([]);
    }
  }, [formulario.region_id]);

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
      setFormulario((prev) => ({
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
      setFormulario((prev) => ({
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

  const calcularEdad = (fechaNacimiento: string): number => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // ========================================
  // VALIDACIONES
  // ========================================

  const validarPaso1 = (): boolean => {
    const erroresTemp: Record<string, string> = {};

    if (!formulario.rut.trim()) {
      erroresTemp.rut = "El RUT es obligatorio";
    } else if (!validarRut(formulario.rut)) {
      erroresTemp.rut = "RUT inválido";
    }

    if (!formulario.nombre.trim()) {
      erroresTemp.nombre = "El nombre es obligatorio";
    }

    if (!formulario.apellido_paterno.trim()) {
      erroresTemp.apellido_paterno = "El apellido paterno es obligatorio";
    }

    if (!formulario.fecha_nacimiento) {
      erroresTemp.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    }

    if (!formulario.genero) {
      erroresTemp.genero = "El género es obligatorio";
    }

    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  const validarPaso2 = (): boolean => {
    const erroresTemp: Record<string, string> = {};

    if (formulario.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      erroresTemp.email = "Email inválido";
    }

    if (!formulario.pais_id) {
      erroresTemp.pais_id = "El país es obligatorio";
    }

    if (formulario.pais_id && !formulario.region_id) {
      erroresTemp.region_id = "La región es obligatoria";
    }

    if (formulario.region_id && !formulario.comuna_id) {
      erroresTemp.comuna_id = "La comuna/ciudad es obligatoria";
    }

    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  const validarPaso3 = (): boolean => {
    const erroresTemp: Record<string, string> = {};

    if (!formulario.grupo_sanguineo) {
      erroresTemp.grupo_sanguineo = "El grupo sanguíneo es obligatorio";
    }

    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  // ========================================
  // ACCIONES
  // ========================================

  const handleSiguientePaso = () => {
    let valido = false;

    if (pasoActual === 1) {
      valido = validarPaso1();
    } else if (pasoActual === 2) {
      valido = validarPaso2();
    } else if (pasoActual === 3) {
      valido = validarPaso3();
    }

    if (valido && pasoActual < 4) {
      setPasoActual(pasoActual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGuardar = async () => {
    if (!validarPaso1() || !validarPaso2() || !validarPaso3()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setGuardando(true);

      const imc = calcularIMC(
        parseFloat(formulario.peso_kg) || 0,
        parseFloat(formulario.altura_cm) || 0
      );

      const paisSel = paises.find((p) => p.id_pais === formulario.pais_id) || null;
      const regionSel =
        regionesDisponibles.find((r) => r.id_region === formulario.region_id) || null;
      const comunaSel =
        comunasDisponibles.find((c) => c.id_comuna === formulario.comuna_id) || null;

      const payload = {
        ...formulario,
        rut: formulario.rut.replace(/[^0-9kK]/g, ""),
        peso_kg: formulario.peso_kg ? parseFloat(formulario.peso_kg) : null,
        altura_cm: formulario.altura_cm ? parseFloat(formulario.altura_cm) : null,
        imc: imc > 0 ? imc : null,
        pais:
          (paisSel?.codigo_iso3 && paisSel.codigo_iso3) ||
          (paisSel?.codigo_iso2 && paisSel.codigo_iso2) ||
          null,
        region: regionSel ? regionSel.nombre : formulario.region,
        ciudad: comunaSel ? comunaSel.nombre : formulario.ciudad,
      };

      const response = await fetch("/api/medico/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ Paciente registrado correctamente");
        router.push("/medico/pacientes");
      } else {
        alert(data.error || "Error al registrar el paciente");
      }
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      alert("Error al guardar el paciente");
    } finally {
      setGuardando(false);
    }
  };

  // ========================================
  // RENDER LOADING
  // ========================================

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center min-h-screen py-20">
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
        <div className="flex items-center justify-center min-h-screen py-20 px-4">
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
      <main className="min-h-screen bg-[#f3f5ff] pt-20 md:pt-28 pb-6 md:pb-10 px-4 md:px-6 lg:px-6">
        <div className="max-w-5xl mx-auto w-full">
          {/* CABECERA */}
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => router.push("/medico/pacientes")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4 transition-all hover:gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Pacientes
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900">
                  Nuevo Paciente
                </h1>
                <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
                  Complete el formulario para registrar un nuevo paciente
                </p>
              </div>
            </div>
          </div>

          {/* INDICADOR DE PASOS */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((paso) => (
                <div key={paso} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-base transition-all duration-300 ${
                        pasoActual >= paso
                          ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg scale-110"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {pasoActual > paso ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : paso}
                    </div>
                    <span
                      className={`text-xs md:text-sm font-bold mt-2 text-center ${
                        pasoActual >= paso ? "text-indigo-600" : "text-gray-500"
                      }`}
                    >
                      {paso === 1 && "Datos Básicos"}
                      {paso === 2 && "Contacto"}
                      {paso === 3 && "Datos Médicos"}
                      {paso === 4 && "Confirmación"}
                    </span>
                  </div>
                  {paso < 4 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                        pasoActual > paso ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="rounded-2xl md:rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
            {/* PASO 1: DATOS BÁSICOS */}
            {pasoActual === 1 && (
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                      Datos Básicos del Paciente
                    </h2>
                    <p className="text-sm text-gray-600 font-semibold">
                      Información personal del paciente
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* RUT */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      RUT <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formulario.rut}
                      onChange={(e) => {
                        const rutFormateado = formatearRut(e.target.value);
                        setFormulario({ ...formulario, rut: rutFormateado });
                      }}
                      placeholder="12.345.678-9"
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.rut ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errores.rut && <p className="text-red-500 text-xs mt-1 font-semibold">{errores.rut}</p>}
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                      placeholder="Juan"
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.nombre ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errores.nombre && <p className="text-red-500 text-xs mt-1 font-semibold">{errores.nombre}</p>}
                  </div>

                  {/* Apellido Paterno */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formulario.apellido_paterno}
                      onChange={(e) =>
                        setFormulario({ ...formulario, apellido_paterno: e.target.value })
                      }
                      placeholder="Pérez"
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.apellido_paterno ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errores.apellido_paterno && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errores.apellido_paterno}</p>
                    )}
                  </div>

                  {/* Apellido Materno */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      value={formulario.apellido_materno}
                      onChange={(e) =>
                        setFormulario({ ...formulario, apellido_materno: e.target.value })
                      }
                      placeholder="González"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formulario.fecha_nacimiento}
                      onChange={(e) =>
                        setFormulario({ ...formulario, fecha_nacimiento: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.fecha_nacimiento ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errores.fecha_nacimiento && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errores.fecha_nacimiento}</p>
                    )}
                    {formulario.fecha_nacimiento && (
                      <p className="text-xs text-indigo-600 font-semibold mt-1">
                        Edad: {calcularEdad(formulario.fecha_nacimiento)} años
                      </p>
                    )}
                  </div>

                  {/* Género */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formulario.genero}
                      onChange={(e) =>
                        setFormulario({ ...formulario, genero: e.target.value as any })
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.genero ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="no_binario">No Binario</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                    {errores.genero && <p className="text-red-500 text-xs mt-1 font-semibold">{errores.genero}</p>}
                  </div>

                  {/* Estado Civil */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Estado Civil
                    </label>
                    <select
                      value={formulario.estado_civil}
                      onChange={(e) =>
                        setFormulario({ ...formulario, estado_civil: e.target.value as any })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="">Seleccionar</option>
                      <option value="soltero">Soltero/a</option>
                      <option value="casado">Casado/a</option>
                      <option value="viudo">Viudo/a</option>
                      <option value="divorciado">Divorciado/a</option>
                      <option value="separado">Separado/a</option>
                      <option value="conviviente">Conviviente</option>
                    </select>
                  </div>

                  {/* Ocupación */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">Ocupación</label>
                    <input
                      type="text"
                      value={formulario.ocupacion}
                      onChange={(e) => setFormulario({ ...formulario, ocupacion: e.target.value })}
                      placeholder="Ingeniero, Profesor, etc."
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: CONTACTO */}
            {pasoActual === 2 && (
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                      Información de Contacto
                    </h2>
                    <p className="text-sm text-gray-600 font-semibold">
                      Datos de contacto y ubicación
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Email */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">Email</label>
                    <input
                      type="email"
                      value={formulario.email}
                      onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                      placeholder="juan.perez@email.com"
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.email ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errores.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errores.email}</p>}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">Teléfono</label>
                    <input
                      type="tel"
                      value={formulario.telefono}
                      onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                      placeholder="+56 2 1234 5678"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* Celular */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">Celular</label>
                    <input
                      type="tel"
                      value={formulario.celular}
                      onChange={(e) => setFormulario({ ...formulario, celular: e.target.value })}
                      placeholder="+56 9 1234 5678"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* País */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formulario.pais_id ?? ""}
                      onChange={(e) => {
                        const paisId = e.target.value ? parseInt(e.target.value) : null;
                        const paisSel = paises.find((p) => p.id_pais === paisId) || null;
                        setFormulario((prev) => ({
                          ...prev,
                          pais_id: paisId,
                          pais_codigo:
                            (paisSel?.codigo_iso3 as string) ||
                            (paisSel?.codigo_iso2 as string) ||
                            "",
                        }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.pais_id ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="">Seleccione un país</option>
                      {paises.map((p) => (
                        <option key={p.id_pais} value={p.id_pais}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.pais_id && <p className="text-red-500 text-xs mt-1 font-semibold">{errores.pais_id}</p>}
                  </div>

                  {/* Región */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Región <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formulario.region_id ?? ""}
                      onChange={(e) => {
                        const regionId = e.target.value ? parseInt(e.target.value) : null;
                        const regSel =
                          regionesDisponibles.find((r) => r.id_region === regionId) || null;
                        setFormulario((prev) => ({
                          ...prev,
                          region_id: regionId,
                          region: regSel ? regSel.nombre : "",
                          comuna_id: null,
                          ciudad: "",
                        }));
                      }}
                      disabled={!formulario.pais_id}
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.region_id ? "border-red-500" : "border-gray-200"
                      } ${!formulario.pais_id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formulario.pais_id
                          ? "Seleccione una región"
                          : "Primero seleccione un país"}
                      </option>
                      {regionesDisponibles.map((r) => (
                        <option key={r.id_region} value={r.id_region}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.region_id && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errores.region_id}</p>
                    )}
                  </div>

                  {/* Comuna */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Comuna/Ciudad <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formulario.comuna_id ?? ""}
                      onChange={(e) => {
                        const comunaId = e.target.value ? parseInt(e.target.value) : null;
                        const comunaSel =
                          comunasDisponibles.find((c) => c.id_comuna === comunaId) || null;
                        setFormulario((prev) => ({
                          ...prev,
                          comuna_id: comunaId,
                          ciudad: comunaSel ? comunaSel.nombre : "",
                        }));
                      }}
                      disabled={!formulario.region_id}
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.comuna_id ? "border-red-500" : "border-gray-200"
                      } ${!formulario.region_id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="">
                        {formulario.region_id
                          ? "Seleccione una comuna/ciudad"
                          : "Primero seleccione una región"}
                      </option>
                      {comunasDisponibles.map((c) => (
                        <option key={c.id_comuna} value={c.id_comuna}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.comuna_id && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errores.comuna_id}</p>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold mb-2 block text-gray-900">Dirección</label>
                    <input
                      type="text"
                      value={formulario.direccion}
                      onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
                      placeholder="Av. Libertador 1234, Depto 501"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* CONTACTO DE EMERGENCIA */}
                  <div className="md:col-span-2 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-black text-gray-900">Contacto de Emergencia</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-bold mb-2 block text-gray-900">Nombre</label>
                        <input
                          type="text"
                          value={formulario.contacto_emergencia_nombre}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              contacto_emergencia_nombre: e.target.value,
                            })
                          }
                          placeholder="Nombre completo"
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold mb-2 block text-gray-900">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formulario.contacto_emergencia_telefono}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              contacto_emergencia_telefono: e.target.value,
                            })
                          }
                          placeholder="+56 9 1234 5678"
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold mb-2 block text-gray-900">
                          Relación
                        </label>
                        <select
                          value={formulario.contacto_emergencia_relacion}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              contacto_emergencia_relacion: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        >
                          <option value="">Seleccionar</option>
                          <option value="padre">Padre</option>
                          <option value="madre">Madre</option>
                          <option value="hijo">Hijo/a</option>
                          <option value="conyuge">Cónyuge</option>
                          <option value="hermano">Hermano/a</option>
                          <option value="abuelo">Abuelo/a</option>
                          <option value="tio">Tío/a</option>
                          <option value="amigo">Amigo/a</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: DATOS MÉDICOS */}
            {pasoActual === 3 && (
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                      Datos Médicos
                    </h2>
                    <p className="text-sm text-gray-600 font-semibold">
                      Información clínica del paciente
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Grupo Sanguíneo */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Grupo Sanguíneo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formulario.grupo_sanguineo}
                      onChange={(e) =>
                        setFormulario({ ...formulario, grupo_sanguineo: e.target.value as any })
                      }
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                        errores.grupo_sanguineo ? "border-red-500" : "border-gray-200"
                      }`}
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
                    {errores.grupo_sanguineo && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">{errores.grupo_sanguineo}</p>
                    )}
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formulario.peso_kg}
                      onChange={(e) => setFormulario({ ...formulario, peso_kg: e.target.value })}
                      placeholder="70.5"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* Altura */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formulario.altura_cm}
                      onChange={(e) => setFormulario({ ...formulario, altura_cm: e.target.value })}
                      placeholder="170"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    {formulario.peso_kg && formulario.altura_cm && (
                      <p className="text-xs text-indigo-600 font-semibold mt-1">
                        IMC:{" "}
                        {calcularIMC(
                          parseFloat(formulario.peso_kg),
                          parseFloat(formulario.altura_cm)
                        ).toFixed(1)}
                      </p>
                    )}
                  </div>

                  {/* Previsión */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">Previsión</label>
                    <select
                      value={formulario.prevision}
                      onChange={(e) => setFormulario({ ...formulario, prevision: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="">Seleccionar</option>
                      <option value="FONASA">FONASA</option>
                      <option value="ISAPRE">ISAPRE</option>
                      <option value="PARTICULAR">Particular</option>
                      <option value="CAPREDENA">CAPREDENA</option>
                      <option value="DIPRECA">DIPRECA</option>
                      <option value="OTRA">Otra</option>
                    </select>
                  </div>

                  {/* Número de Previsión */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Número de Previsión
                    </label>
                    <input
                      type="text"
                      value={formulario.numero_prevision}
                      onChange={(e) =>
                        setFormulario({ ...formulario, numero_prevision: e.target.value })
                      }
                      placeholder="Número de afiliación"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* Clasificación de Riesgo */}
                  <div>
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Clasificación de Riesgo
                    </label>
                    <select
                      value={formulario.clasificacion_riesgo || ""}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          clasificacion_riesgo: (e.target.value as any) || null,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      <option value="">Sin clasificar</option>
                      <option value="bajo">Bajo</option>
                      <option value="medio">Medio</option>
                      <option value="alto">Alto</option>
                      <option value="critico">Crítico</option>
                    </select>
                  </div>

                  {/* Paciente VIP */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
                      <input
                        type="checkbox"
                        checked={formulario.es_vip}
                        onChange={(e) => setFormulario({ ...formulario, es_vip: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <label className="font-bold text-gray-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Marcar como Paciente VIP
                      </label>
                    </div>
                  </div>

                  {/* Notas Importantes */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold mb-2 block text-gray-900">
                      Notas Importantes
                    </label>
                    <textarea
                      value={formulario.notas_importantes}
                      onChange={(e) =>
                        setFormulario({ ...formulario, notas_importantes: e.target.value })
                      }
                      placeholder="Información relevante sobre el paciente (alergias conocidas, condiciones especiales, etc.)"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4: CONFIRMACIÓN */}
            {pasoActual === 4 && (
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                      Confirmar Datos
                    </h2>
                    <p className="text-sm text-gray-600 font-semibold">
                      Revise la información antes de guardar
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Datos Básicos */}
                  <div className="rounded-xl bg-gray-50 p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Datos Básicos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-600">RUT</p>
                        <p className="text-sm font-semibold text-gray-900">{formulario.rut}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-600">Nombre Completo</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formulario.nombre} {formulario.apellido_paterno}{" "}
                          {formulario.apellido_materno}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-600">Fecha de Nacimiento</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formulario.fecha_nacimiento} ({calcularEdad(formulario.fecha_nacimiento)}{" "}
                          años)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-600">Género</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {formulario.genero}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="rounded-xl bg-gray-50 p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contacto
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {formulario.email && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Email</p>
                          <p className="text-sm font-semibold text-gray-900">{formulario.email}</p>
                        </div>
                      )}
                      {formulario.telefono && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Teléfono</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formulario.telefono}
                          </p>
                        </div>
                      )}
                      {formulario.celular && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Celular</p>
                          <p className="text-sm font-semibold text-gray-900">{formulario.celular}</p>
                        </div>
                      )}
                      {formulario.ciudad && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Ciudad</p>
                          <p className="text-sm font-semibold text-gray-900">{formulario.ciudad}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Datos Médicos */}
                  <div className="rounded-xl bg-gray-50 p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Datos Médicos
                    </h3>
                               <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-600">Grupo Sanguíneo</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formulario.grupo_sanguineo}
                        </p>
                      </div>
                      {formulario.peso_kg && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Peso</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formulario.peso_kg} kg
                          </p>
                        </div>
                      )}
                      {formulario.altura_cm && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Altura</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formulario.altura_cm} cm
                          </p>
                        </div>
                      )}
                      {formulario.peso_kg && formulario.altura_cm && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">IMC</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {calcularIMC(
                              parseFloat(formulario.peso_kg),
                              parseFloat(formulario.altura_cm)
                            ).toFixed(1)}
                          </p>
                        </div>
                      )}
                      {formulario.prevision && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Previsión</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formulario.prevision}
                          </p>
                        </div>
                      )}
                      {formulario.clasificacion_riesgo && (
                        <div>
                          <p className="text-xs font-bold text-gray-600">Clasificación de Riesgo</p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {formulario.clasificacion_riesgo}
                          </p>
                        </div>
                      )}
                      {formulario.es_vip && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg border-2 border-yellow-300">
                            <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                            <span className="text-sm font-bold text-yellow-900">
                              Paciente VIP
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contacto de Emergencia */}
                  {(formulario.contacto_emergencia_nombre ||
                    formulario.contacto_emergencia_telefono) && (
                    <div className="rounded-xl bg-red-50 p-6 border-2 border-red-200">
                      <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Contacto de Emergencia
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {formulario.contacto_emergencia_nombre && (
                          <div>
                            <p className="text-xs font-bold text-gray-600">Nombre</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formulario.contacto_emergencia_nombre}
                            </p>
                          </div>
                        )}
                        {formulario.contacto_emergencia_telefono && (
                          <div>
                            <p className="text-xs font-bold text-gray-600">Teléfono</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formulario.contacto_emergencia_telefono}
                            </p>
                          </div>
                        )}
                        {formulario.contacto_emergencia_relacion && (
                          <div>
                            <p className="text-xs font-bold text-gray-600">Relación</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                              {formulario.contacto_emergencia_relacion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notas Importantes */}
                  {formulario.notas_importantes && (
                    <div className="rounded-xl bg-yellow-50 p-6 border-2 border-yellow-200">
                      <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-yellow-600" />
                        Notas Importantes
                      </h3>
                      <p className="text-sm font-semibold text-gray-900 whitespace-pre-wrap">
                        {formulario.notas_importantes}
                      </p>
                    </div>
                  )}

                  {/* Alerta de Confirmación */}
                  <div className="rounded-xl bg-blue-50 p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-base font-black text-blue-900 mb-2">
                          ⚠️ Verificación Final
                        </h4>
                        <p className="text-sm font-semibold text-blue-800">
                          Por favor revise cuidadosamente todos los datos antes de confirmar. Una
                          vez guardado, el paciente será registrado en el sistema y podrá comenzar
                          a gestionar su historial médico.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER CON BOTONES */}
            <div className="px-6 md:px-8 py-4 md:py-6 border-t-2 border-gray-200 bg-gray-50 rounded-b-2xl md:rounded-b-3xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                {/* Botón Anterior */}
                <div className="w-full sm:w-auto">
                  {pasoActual > 1 && (
                    <button
                      onClick={handlePasoAnterior}
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                      Anterior
                    </button>
                  )}
                </div>

                {/* Indicador de Paso */}
                <div className="text-center">
                  <p className="text-xs md:text-sm font-bold text-gray-600">
                    Paso {pasoActual} de 4
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4].map((paso) => (
                      <div
                        key={paso}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          pasoActual >= paso ? "w-8 bg-indigo-600" : "w-4 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Botón Siguiente/Guardar */}
                <div className="w-full sm:w-auto">
                  {pasoActual < 4 ? (
                    <button
                      onClick={handleSiguientePaso}
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleGuardar}
                      disabled={guardando}
                      className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                        guardando ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 md:w-5 md:h-5" />
                          Guardar Paciente
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Botón Cancelar (siempre visible) */}
              <div className="mt-3 md:mt-4 text-center">
                <button
                  onClick={() => router.push("/medico/pacientes")}
                  className="text-sm md:text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <X className="w-4 h-4" />
                  Cancelar y volver
                </button>
              </div>
            </div>
          </div>

          {/* TARJETA DE AYUDA */}
          <div className="mt-6 md:mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                  💡 Consejos para el Registro
                </h3>
                <ul className="space-y-2 text-sm md:text-base font-semibold text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Asegúrese de ingresar el <strong>RUT correctamente</strong> ya que no podrá
                      modificarse después
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Complete el <strong>contacto de emergencia</strong> para situaciones críticas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Las <strong>notas importantes</strong> se mostrarán destacadas en toda la
                      ficha médica
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Puede <strong>editar cualquier dato</strong> después del registro excepto el
                      RUT
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Los campos marcados con <span className="text-red-500 font-black">*</span> son{" "}
                      <strong>obligatorios</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS RÁPIDAS */}
          <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {pasoActual}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Paso Actual
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {Object.keys(errores).length === 0 ? "✓" : Object.keys(errores).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {Object.keys(errores).length === 0 ? "Sin Errores" : "Errores"}
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {[
                  formulario.rut,
                  formulario.nombre,
                  formulario.apellido_paterno,
                  formulario.fecha_nacimiento,
                  formulario.pais_id,
                  formulario.region_id,
                  formulario.comuna_id,
                ].filter(Boolean).length}
                /7
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Campos Obligatorios
              </div>
            </div>

            <div className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                {Math.round(((pasoActual - 1) / 4) * 100)}%
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Completado
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DE SEGURIDAD */}
          <div className="mt-6 md:mt-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-2">
                  🔒 Seguridad y Privacidad
                </h3>
                <p className="text-sm md:text-base font-semibold text-gray-700 mb-3">
                  Todos los datos ingresados están protegidos bajo las normativas de protección de
                  datos personales y confidencialidad médica vigentes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-bold text-gray-900">
                      Encriptación SSL
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-bold text-gray-900">
                      Cumplimiento HIPAA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-xs md:text-sm font-bold text-gray-900">
                      Auditoría Completa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ESTILOS PERSONALIZADOS */}
      <style jsx global>{`
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

        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }

        /* Animación de pulso para campos con error */
        @keyframes pulse-error {
          0%,
          100% {
            border-color: #ef4444;
          }
          50% {
            border-color: #f87171;
          }
        }

        .border-red-500 {
          animation: pulse-error 2s infinite;
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
        select:focus-visible,
        textarea:focus-visible {
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
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
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

        /* Animación de entrada para modales */
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal-fade-in {
          animation: modalFadeIn 0.2s ease-out;
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

        /* Optimización de backdrop-blur */
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
        a {
          min-height: 44px;
        }

        @media (max-width: 640px) {
          button,
          a {
            min-height: 48px;
          }
        }

        /* Animación de progreso */
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-progress {
          animation: progress 0.5s ease-out;
        }

        /* Mejora de contraste en indicadores de paso */
        .step-indicator {
          position: relative;
        }

        .step-indicator::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .step-indicator.active::after {
          width: 100%;
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

        /* Animación de éxito */
        @keyframes success-bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-success-bounce {
          animation: success-bounce 0.5s ease;
        }

        /* Mejora de legibilidad en textos largos */
        p,
        li {
          line-height: 1.6;
        }

        /* Optimización de rendimiento en listas virtualizadas */
        .virtualized-list {
          contain: layout style paint;
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

        /* Mejora de contraste en tooltips */
        .tooltip {
          position: relative;
        }

        .tooltip::before {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .tooltip:hover::before {
          opacity: 1;
        }

        /* Optimización para dispositivos de alta densidad */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }

        /* Mejora de contraste para badges */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Animación de carga de página */
        @keyframes page-load {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        main {
          animation: page-load 0.5s ease-out;
        }

        /* Mejora de rendimiento en scroll */
        .overflow-x-auto,
        .overflow-y-auto {
          scroll-behavior: smooth;
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

        /* Optimización de carga crítica */
        .critical-css {
          content-visibility: auto;
          contain-intrinsic-size: auto 500px;
        }

        /* Animación de entrada suave */
        .fade-in {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Mejora de rendimiento en transformaciones */
        .transform {
          transform: translateZ(0);
        }

        /* Prevenir selección accidental */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </MedicoLayout>
  );
}

