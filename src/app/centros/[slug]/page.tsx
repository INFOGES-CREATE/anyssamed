// frontend/src/app/centros/[slug]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  Stethoscope,
  Phone,
  Mail,
  Globe,
  Building2,
  Loader2,
  Navigation,
  HeartPulse,
  CheckCircle2,
  Moon,
  Sun,
  Calendar,
  Award,
  Star,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Video,
  Shield,
  Zap,
  TrendingUp,
  Heart,
  Activity,
  Gift,
  BookOpen,
  Camera,
  MapPinned,
  PhoneCall,
  Send,
  User,
  Sparkles,
  Home,
  Menu,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Clock3,
  UserCheck,
  FileText,
  Lock,
  Smartphone,
  Download,
  QrCode,
  ArrowRight,
  MonitorPlay,
  Building,
  CalendarCheck,
  ClipboardList,
  Eye,
  EyeOff,
  Filter,
  SlidersHorizontal,
  AlarmClock,
  BellRing,
  Fingerprint,
  ShieldCheck,
  CreditCard,
  Wallet,
} from "lucide-react";

// ============================================
// INTERFACES Y TIPOS
// ============================================

interface Sucursal {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  telefono: string;
  email_contacto: string;
  horario_apertura: string;
  horario_cierre: string;
  dias_atencion: string;
}

interface Servicio {
  nombre_servicio: string;
  descripcion_servicio: string;
}

interface Medico {
  id_medico: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  especialidad: string;
  foto_url: string;
  anos_experiencia: number;
  acepta_nuevos_pacientes: boolean;
  consulta_telemedicina: boolean;
  duracion_consulta_min: number;
  titulo_profesional: string;
  numero_registro_medico: string;
}

interface Especialidad {
  nombre: string;
  descripcion: string;
  icono_url: string;
  color: string;
}

interface Resena {
  id_resena: number;
  nombre_paciente: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

interface Promocion {
  id_promocion: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
}

interface Centro {
  id_centro: number;
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigo_postal: string;
  horario_apertura: string;
  horario_cierre: string;
  dias_atencion: string;
  capacidad_pacientes_dia: number;
  nivel_complejidad: string;
  especializacion_principal: string;
  telefono: string;
  email: string;
  sitio_web: string;
  logo_url: string;
  estado: string;
  fecha_inicio_operacion: string;
}

interface BloqueHorario {
  id_bloque: number;
  inicio: string; // siempre vamos a guardar algo aquí
  fin: string;
  duracion_minutos: number;
  disponible: boolean;
}


interface PacienteExistente {
  id_paciente: number;
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  celular: string;
  fecha_nacimiento: string;
}

interface FormularioCita {
  // Datos del paciente
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: string;
  email: string;
  telefono: string;
  celular: string;

  // Datos adicionales del paciente (opcionales, vienen del paciente existente)
  direccion?: string;
  ciudad?: string;
  region?: string;
  nacionalidad?: string;
  estado_civil?: string;
  ocupacion?: string;
  nivel_educacion?: string;
  grupo_sanguineo?: string;
  preferencia_contacto?: string;

  // Datos de la cita
  id_medico: number;
  id_especialidad: number;
  fecha_cita: string;    // "2025-10-30"
  hora_cita: string;     // "09:00"
  tipo_cita: string;     // 'primera_vez' | 'control' | ...
  tipo_atencion: "presencial" | "telemedicina";
  motivo: string;

  // Seguro
  tipo_seguro: string;   // "FONASA" | "ISAPRE" | ...
  numero_poliza?: string;

  // Términos
  acepta_terminos: boolean;
  acepta_notificaciones: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MicrositioCentro() {
  const { slug } = useParams();
  
  // Estados principales
  const [centro, setCentro] = useState<Centro | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados del modal de agendamiento
  const [showAgendarModal, setShowAgendarModal] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [pacienteExistente, setPacienteExistente] = useState<PacienteExistente | null>(null);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Medico | null>(null);
  const [bloquesDisponibles, setBloquesDisponibles] = useState<BloqueHorario[]>([]);
  const [loadingBloques, setLoadingBloques] = useState(false);
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [citaCreada, setCitaCreada] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const [filtroMedicos, setFiltroMedicos] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  
  // Formulario de cita
  const [formularioCita, setFormularioCita] = useState<FormularioCita>({
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    genero: "",
    email: "",
    telefono: "",
    celular: "",
    id_medico: 0,
    id_especialidad: 0,
    fecha_cita: "",
    hora_cita: "",
    tipo_cita: "primera_vez",
    tipo_atencion: "presencial",
    motivo: "",
    tipo_seguro: "PARTICULAR",
    numero_poliza: "",
    acepta_terminos: false,
    acepta_notificaciones: false,
  });

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    const cargarMicrositio = async () => {
      try {
        const id = slug?.toString().split("-").pop();
        const res = await fetch(`/api/centros/${id}/micrositio`);
        const data = await res.json();
        
        if (data.success) {
          setCentro(data.data.centro);
          setSucursales(data.data.sucursales || []);
          setServicios(data.data.servicios || []);
          setMedicos(data.data.medicos || []);
          setEspecialidades(data.data.especialidades || []);
          setResenas(data.data.resenas || []);
          setPromociones(data.data.promociones || []);
        }
      } catch (err) {
        console.error("Error al cargar el micrositio:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarMicrositio();
  }, [slug]);

  // Detectar tema del sistema
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  const handleScrollTo = (id: string) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};


  // ============================================
  // FUNCIONES DE AGENDAMIENTO
  // ============================================

  // Buscar paciente por RUT
  const buscarPacientePorRut = useCallback(async (rut: string) => {
  if (!rut || rut.length < 8) return;

  setLoadingPaciente(true);

  try {
    const res = await fetch(`/api/pacientes/buscar-rut?rut=${encodeURIComponent(rut)}`);
    const data = await res.json();

    if (data.success && data.paciente) {
      const p = data.paciente;

      // 🧩 Autocompleta todos los campos existentes del formulario
      setPacienteExistente(p);
      setFormularioCita(prev => ({
        ...prev,
        nombre: p.nombre || "",
        apellido_paterno: p.apellido_paterno || "",
        apellido_materno: p.apellido_materno || "",
        email: p.email || "",
        telefono: p.telefono || "",
        celular: p.celular || "",
        fecha_nacimiento: p.fecha_nacimiento
          ? new Date(p.fecha_nacimiento).toISOString().split("T")[0]
          : "",
        genero: p.genero || "",
        direccion: p.direccion || "",
        ciudad: p.ciudad || "",
        region: p.region || "",
        nacionalidad: p.nacionalidad || "",
        estado_civil: p.estado_civil || "",
        ocupacion: p.ocupacion || "",
        nivel_educacion: p.nivel_educacion || "",
        grupo_sanguineo: p.grupo_sanguineo || "",
        preferencia_contacto: p.preferencia_contacto || "",
      }));

      console.log("✅ Paciente encontrado:", p);
    } else {
      setPacienteExistente(null);
      console.warn("Paciente no encontrado");
    }
  } catch (error) {
    console.error("❌ Error al buscar paciente:", error);
    setErrorMensaje("Error al buscar paciente. Intenta nuevamente.");
    setPacienteExistente(null);
  } finally {
    setLoadingPaciente(false);
  }
}, []);

// ============================================================
// 🧩 Formateador automático de RUT chileno
// ============================================================
// ============================================================
// 🧩 Formateador automático de RUT chileno
// ============================================================
const formatearRut = (valor: string): string => {
  // deja solo números y k/K
  let rut = valor.replace(/[^\dkK]/g, "");

  // ej: si llevo "2", "26", etc, no intento formatear con guiones todavía
  if (rut.length <= 1) return rut;

  // cuerpo + dígito verificador
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();

  // agregar puntos cada 3 desde la derecha
  let cuerpoFormateado = "";
  let contador = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    contador++;
    if (contador % 3 === 0 && i !== 0) {
      cuerpoFormateado = "." + cuerpoFormateado;
    }
  }

  return `${cuerpoFormateado}-${dv}`;
};

// ============================================================
// ✅ Validador de RUT (cálculo del dígito verificador)
// ============================================================
const validarRut = (rutConFormato: string): boolean => {
  const limpio = rutConFormato.replace(/\./g, "").replace(/-/g, "").toUpperCase();

  if (limpio.length < 8) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvCalculadoNum = 11 - (suma % 11);
  const dvCalculado =
    dvCalculadoNum === 11 ? "0" : dvCalculadoNum === 10 ? "K" : dvCalculadoNum.toString();

  return dvIngresado === dvCalculado;
};



  // Abre el modal directo desde la tarjeta del doctor
const abrirModalAgendarConDoctor = (doc: Medico) => {
  // limpiamos todo para no arrastrar basura de otra cita
  resetearModal();

  // preseleccionamos el médico
  setMedicoSeleccionado(doc);
  setFormularioCita((prev) => ({
    ...prev,
    id_medico: doc.id_medico,
  }));

  // mostramos el modal
  setShowAgendarModal(true);

  // pasoActual ya queda en 1 porque resetearModal() lo pone en 1
};


 const obtenerBloquesDisponibles = useCallback(
  async (idMedico: number, fecha: string) => {
    try {
      setLoadingBloques(true);
      setErrorMensaje("");

      if (!idMedico || !fecha) {
        setBloquesDisponibles([]);
        setErrorMensaje("Selecciona un médico y una fecha válida.");
        return;
      }

      // usar la fecha directamente
      const fechaFormateada = fecha;

      const res = await fetch(
        `/api/bloques-horarios/disponibles?id_medico=${encodeURIComponent(
          idMedico.toString()
        )}&fecha=${encodeURIComponent(fechaFormateada)}`
      );

      if (!res.ok) {
        setBloquesDisponibles([]);
        setErrorMensaje("No hay horarios disponibles para esta fecha.");
        return;
      }

      const data = await res.json();
      console.log("🧾 Respuesta bloques API:", data);

      if (data.success && Array.isArray(data.bloques) && data.bloques.length > 0) {
       const normalizados: BloqueHorario[] = data.bloques.map((b: any) => ({
  id_bloque: b.id_bloque,
  inicio: b.inicio || b.fecha_inicio, // <-- tolerante
  fin: b.fin || b.fecha_fin,
  duracion_minutos: b.duracion_consulta_min || b.duracion_minutos,
  disponible:
    b.cupos?.disponible === null || b.cupos?.disponible > 0,
}));


        setBloquesDisponibles(normalizados);
      } else {
        setBloquesDisponibles([]);
        setErrorMensaje("No hay horarios disponibles para esta fecha.");
      }
    } catch (err) {
      console.error("❌ Error al obtener bloques:", err);
      setBloquesDisponibles([]);
      setErrorMensaje(
        "Error al cargar los horarios disponibles. Intenta nuevamente más tarde."
      );
    } finally {
      setLoadingBloques(false);
    }
  },
  []
);






  // Enviar formulario de cita
  const enviarFormularioCita = async () => {
  setLoadingEnvio(true);
  setErrorMensaje("");

  try {
    // Validaciones mínimas antes de mandar
    if (
      !formularioCita.rut ||
      !formularioCita.nombre ||
      !formularioCita.apellido_paterno ||
      !formularioCita.email ||
      !formularioCita.celular ||
      !formularioCita.genero
    ) {
      throw new Error("Complete todos los campos obligatorios del paciente");
    }

    if (
      !formularioCita.id_medico ||
      !formularioCita.fecha_cita ||
      !formularioCita.hora_cita
    ) {
      throw new Error("Complete todos los datos de la cita");
    }

    if (!formularioCita.acepta_terminos) {
      throw new Error("Debe aceptar los términos y condiciones");
    }

    // Armamos el payload que mandamos al backend
    const datosEnvio = {
      ...formularioCita,
      id_centro: centro?.id_centro,
      id_paciente_existente: pacienteExistente?.id_paciente,
    };

    const res = await fetch("/api/citas/agendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosEnvio),
    });

    // si por alguna razón Next respondió HTML/404, evitamos romper
    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(
        "El servidor no devolvió una respuesta válida. Intenta nuevamente."
      );
    }

    if (!res.ok || !data?.success) {
      throw new Error(
        data?.message || "No se pudo agendar la cita en este momento."
      );
    }

    // 🎉 Todo bien -> mostramos paso final
    setCitaCreada(true);
    setPasoActual(5);
  } catch (error: any) {
    console.error("Error al enviar formulario:", error);
    setErrorMensaje(
      error.message ||
        "Error al agendar la cita. Intente nuevamente."
    );
  } finally {
    setLoadingEnvio(false);
  }
};

  // Resetear modal
  // Resetear modal
// =======================
// HANDLERS / MODAL CITA
// =======================

// Resetear modal a estado inicial
const resetearModal = () => {
  setPasoActual(1);
  setPacienteExistente(null);
  setMedicoSeleccionado(null);
  setBloquesDisponibles([]);
  setCitaCreada(false);
  setErrorMensaje("");
  setFormularioCita({
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    genero: "",
    email: "",
    telefono: "",
    celular: "",
    id_medico: 0,
    id_especialidad: 0,
    fecha_cita: "",
    hora_cita: "",
    tipo_cita: "primera_vez",
    tipo_atencion: "presencial",
    motivo: "",
    tipo_seguro: "PARTICULAR",
    numero_poliza: "",
    acepta_terminos: false,
    acepta_notificaciones: false,
  });
};

// Abrir modal normal (sin médico preseleccionado)
const abrirModalAgendar = () => {
  resetearModal();
  setShowAgendarModal(true);
};

// Abrir modal desde la tarjeta de un médico específico

// Cerrar modal
const cerrarModalAgendar = () => {
  setShowAgendarModal(false);
  resetearModal();
};




  // ============================================
  // HANDLERS
  // ============================================

const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputRaw = e.target.value;

  // 1. Formatear visualmente
  const rutFormateado = formatearRut(inputRaw);

  // 2. Guardar en el formulario con el formato listo
  setFormularioCita((prev) => ({
    ...prev,
    rut: rutFormateado,
  }));

  // 3. Cada vez que el usuario llega a mínimo 8 chars,
  //    intentamos validar y buscar paciente
  if (rutFormateado.replace(/[^\dkK]/g, "").length >= 8) {
    if (validarRut(rutFormateado)) {
      // rut válido → limpiamos mensaje de error y buscamos
      setErrorMensaje("");
      buscarPacientePorRut(rutFormateado);
    } else {
      // rut inválido → mostramos error y NO buscamos
      setPacienteExistente(null);
      setErrorMensaje("El RUT ingresado no es válido.");
    }
  } else {
    // menos de 8 chars -> limpiamos estados relacionados
    setPacienteExistente(null);
    setErrorMensaje("");
  }
};


const [guardandoPaciente, setGuardandoPaciente] = useState(false);
const [bloqueSeleccionadoId, setBloqueSeleccionadoId] = useState<number | null>(null);

  // Continuar desde Paso 1 (datos del paciente)
// Si ya hay médico preseleccionado, saltamos directo al Paso 3 (fecha/hora)
const continuarDesdePaso1 = async () => {
  // validación básica igual que el disabled del botón
  const datosCompletos =
    formularioCita.rut &&
    formularioCita.nombre &&
    formularioCita.apellido_paterno &&
    formularioCita.email &&
    formularioCita.celular &&
    formularioCita.genero &&
    formularioCita.fecha_nacimiento;

  if (!datosCompletos) return;

  try {
    setGuardandoPaciente(true);
    setErrorMensaje("");

    // 🔄 Guardar o actualizar paciente real en la base de datos
    const res = await fetch("/api/pacientes/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rut: formularioCita.rut,
        nombre: formularioCita.nombre,
        apellido_paterno: formularioCita.apellido_paterno,
        apellido_materno: formularioCita.apellido_materno,
        fecha_nacimiento: formularioCita.fecha_nacimiento,
        genero: formularioCita.genero,
        email: formularioCita.email,
        telefono: formularioCita.telefono,
        celular: formularioCita.celular,
        direccion: (formularioCita as any).direccion,
        ciudad: (formularioCita as any).ciudad,
        region: (formularioCita as any).region,
        codigo_postal: (formularioCita as any).codigo_postal,
        nacionalidad: (formularioCita as any).nacionalidad,
        estado_civil: (formularioCita as any).estado_civil,
        ocupacion: (formularioCita as any).ocupacion,
        nivel_educacion: (formularioCita as any).nivel_educacion,
        grupo_sanguineo: (formularioCita as any).grupo_sanguineo,
        preferencia_contacto: (formularioCita as any).preferencia_contacto,
        acepta_notificaciones: formularioCita.acepta_notificaciones,
        acepta_telemedicina:
          formularioCita.tipo_atencion === "telemedicina" ? 1 : 0,
        id_centro_registro: centro?.id_centro || null,
        id_sucursal_registro: null,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "No se pudo guardar el paciente.");
    }

    // 🧠 Guardar el paciente en memoria con su id_paciente
    setPacienteExistente(data.paciente);

    // flujo igual que antes
    if (medicoSeleccionado) {
      // El usuario vino desde "Agendar con Dr. X"
      // entonces no le voy a volver a pedir elegir profesional
      setPasoActual(3);
    } else {
      // flujo normal: tiene que elegir médico
      setPasoActual(2);
    }
  } catch (err: any) {
    console.error("Error guardando paciente:", err);
    setErrorMensaje(
      err.message || "No se pudo guardar tus datos de paciente."
    );
  } finally {
    setGuardandoPaciente(false);
  }
};

const handleMedicoSelect = (medico: Medico) => {
  setMedicoSeleccionado(medico);
  setFormularioCita((prev) => ({
    ...prev,
    id_medico: medico.id_medico,
  }));
  setPasoActual(3);
};

const handleFechaSelect = (fecha: string) => {
  setFormularioCita((prev) => ({ ...prev, fecha_cita: fecha }));
  if (medicoSeleccionado) {
    obtenerBloquesDisponibles(medicoSeleccionado.id_medico, fecha);
  }
};

// 🔁 Nueva versión: guarda id_bloque y hora seleccionada real
const handleHoraSelect = (bloque: BloqueHorario) => {
  // Formateamos la hora que se mostrará/guardará en el resumen
  const horaFormateada = new Date(bloque.inicio).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  setFormularioCita((prev) => ({
    ...prev,
    hora_cita: horaFormateada,
  }));

  // guardamos qué bloque se eligió (lo usaremos para resaltar el botón)
  setBloqueSeleccionadoId(bloque.id_bloque);
};


  // ============================================
  // RENDERS CONDICIONALES
  // ============================================

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="relative mb-8">
          <div className={`w-24 h-24 border-4 rounded-full animate-spin ${darkMode ? 'border-indigo-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'}`}></div>
          <Sparkles className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} animate-pulse`} />
        </div>
        <h2 className={`text-2xl md:text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Cargando centro médico...
        </h2>
        <p className={`text-sm md:text-base ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
          Preparando la mejor experiencia para ti
        </p>
      </div>
    );
  }

  if (!centro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50">
        <Building2 className="w-24 h-24 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Centro no encontrado
        </h1>
        <p className="text-gray-600">Verifica la URL o el ID del centro.</p>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    `${centro.direccion}, ${centro.ciudad}, ${centro.region}`
  )}&output=embed`;

  const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${centro.direccion}, ${centro.ciudad}, ${centro.region}`
  )}`;

  const promedioCalificacion = resenas.length > 0
    ? (resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length).toFixed(1)
    : "5.0";

  // Filtrar médicos
  const medicosFiltrados = medicos.filter(medico => {
    const nombreCompleto = `${medico.nombre} ${medico.apellido_paterno} ${medico.apellido_materno}`.toLowerCase();
    const cumpleBusqueda = nombreCompleto.includes(filtroMedicos.toLowerCase());
    const cumpleEspecialidad = !filtroEspecialidad || medico.especialidad === filtroEspecialidad;
    return cumpleBusqueda && cumpleEspecialidad;
  });

  const especialidadesUnicas = Array.from(new Set(medicos.map(m => m.especialidad)));

  // ============================================
  // RENDER DEL MODAL DE AGENDAMIENTO
  // ============================================

  const renderModalAgendar = () => {
    if (!showAgendarModal) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
          darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-white'
        }`}>
          {/* Header del Modal */}
          <div className={`sticky top-0 z-10 px-8 py-6 border-b ${
            darkMode ? 'bg-gray-900/95 border-gray-700 backdrop-blur-xl' : 'bg-white/95 border-gray-200 backdrop-blur-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                  <CalendarCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl md:text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {citaCreada ? "¡Cita Agendada!" : "Agendar Cita Médica"}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {!citaCreada && `Paso ${pasoActual} de 4`}
                  </p>
                </div>
              </div>
              <button
                onClick={cerrarModalAgendar}
                className={`p-2 rounded-xl transition-all ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Barra de progreso */}
            {!citaCreada && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  {[1, 2, 3, 4].map((paso) => (
                    <div key={paso} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                        paso <= pasoActual
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                          : darkMode
                          ? 'bg-gray-800 text-gray-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {paso < pasoActual ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          paso
                        )}
                      </div>
                      {paso < 4 && (
                        <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                          paso < pasoActual
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                            : darkMode
                            ? 'bg-gray-800'
                            : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={pasoActual >= 1 ? 'text-indigo-600' : darkMode ? 'text-gray-600' : 'text-gray-400'}>
                    Tus Datos
                  </span>
                  <span className={pasoActual >= 2 ? 'text-indigo-600' : darkMode ? 'text-gray-600' : 'text-gray-400'}>
                    Profesional
                  </span>
                  <span className={pasoActual >= 3 ? 'text-indigo-600' : darkMode ? 'text-gray-600' : 'text-gray-400'}>
                    Fecha y Hora
                  </span>
                  <span className={pasoActual >= 4 ? 'text-indigo-600' : darkMode ? 'text-gray-600' : 'text-gray-400'}>
                    Confirmación
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Contenido del Modal */}
          <div className="px-8 py-6">
            {errorMensaje && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-500 font-medium">Error</p>
                  <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {errorMensaje}
                  </p>
                </div>
              </div>
            )}

            {/* PASO 1: Datos del Paciente */}
            {pasoActual === 1 && (
  <div className="space-y-6 animate-fadeIn">
    {/* Bloque: Información del Paciente */}
    <div
      className={`p-6 rounded-2xl ${
        darkMode ? "bg-gray-800/50" : "bg-indigo-50/50"
      } border ${darkMode ? "border-gray-700" : "border-indigo-100"}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <ShieldCheck
          className={`w-6 h-6 ${
            darkMode ? "text-indigo-400" : "text-indigo-600"
          }`}
        />
        <div>
          <h3
            className={`font-black text-lg mb-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Información del Paciente
          </h3>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Si ya tienes una cuenta, ingresa tu RUT y autocompletaremos tus
            datos de forma segura.
          </p>
        </div>
      </div>

      {/* SI YA HAY MÉDICO PRESELECCIONADO, LO MOSTRAMOS AQUÍ */}
      {medicoSeleccionado && (
        <div
          className={`mt-6 rounded-2xl border-2 p-4 md:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center ${
            darkMode
              ? "bg-gray-900/50 border-gray-700"
              : "bg-white border-indigo-200"
          }`}
        >
          {/* Avatar del doctor */}
          <div className="flex-shrink-0">
            {medicoSeleccionado.foto_url ? (
              <img
                src={medicoSeleccionado.foto_url}
                alt={`Dr. ${medicoSeleccionado.nombre} ${medicoSeleccionado.apellido_paterno}`}
                className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Info doctor */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p
                className={`text-sm font-bold uppercase tracking-wide ${
                  darkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                Profesional seleccionado
              </p>

              {/* Chips Disponibilidad / Telemedicina */}
              {medicoSeleccionado.acepta_nuevos_pacientes && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Disponible
                </span>
              )}
              {medicoSeleccionado.consulta_telemedicina && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Online
                </span>
              )}
            </div>

            <p
              className={`font-black text-base md:text-lg ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Dr. {medicoSeleccionado.nombre}{" "}
              {medicoSeleccionado.apellido_paterno}
            </p>

            <p
              className={`text-sm font-bold ${
                darkMode ? "text-purple-400" : "text-purple-600"
              }`}
            >
              {medicoSeleccionado.especialidad}
            </p>

            <p
              className={`text-xs mt-2 flex items-center gap-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {medicoSeleccionado.anos_experiencia}+ años de experiencia
              </span>
            </p>
          </div>

          {/* Botón Cambiar Profesional */}
          <div className="w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => {
                // mandamos al paso 2 para que pueda elegir otro
                setPasoActual(2);
              }}
              className={`w-full md:w-auto px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                darkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              Cambiar profesional
            </button>
          </div>
        </div>
      )}
    </div>

    {/* FORM CAMPOS PACIENTE */}
<div className="grid md:grid-cols-2 gap-6">
  {/* RUT */}
  <div className="md:col-span-2">
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      RUT <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type="text"
        value={formularioCita.rut}
        onChange={handleRutChange}
        placeholder="12.345.678-9"
        className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
            : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
        } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
      />
      {loadingPaciente && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        </div>
      )}
      {pacienteExistente && !loadingPaciente && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      )}
    </div>
    {pacienteExistente && (
      <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        ¡Paciente encontrado! Tus datos han sido autocompletados. Puedes
        editarlos si cambiaron.
      </p>
    )}
  </div>

  {/* Nombre */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Nombre <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formularioCita.nombre}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          nombre: e.target.value,
        }))
      }
      placeholder="Juan"
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>

  {/* Apellido Paterno */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Apellido Paterno <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={formularioCita.apellido_paterno}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          apellido_paterno: e.target.value,
        }))
      }
      placeholder="Pérez"
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>

  {/* Apellido Materno */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Apellido Materno
    </label>
    <input
      type="text"
      value={formularioCita.apellido_materno}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          apellido_materno: e.target.value,
        }))
      }
      placeholder="González"
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>

  {/* Fecha de Nacimiento */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Fecha de Nacimiento <span className="text-red-500">*</span>
    </label>
    <input
      type="date"
      value={formularioCita.fecha_nacimiento}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          fecha_nacimiento: e.target.value,
        }))
      }
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>

  {/* Género */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Género <span className="text-red-500">*</span>
    </label>
    <select
      value={formularioCita.genero}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          genero: e.target.value,
        }))
      }
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    >
      <option value="">Seleccionar</option>
      <option value="masculino">Masculino</option>
      <option value="femenino">Femenino</option>
      <option value="no_binario">No Binario</option>
      <option value="prefiero_no_decir">Prefiero no decir</option>
    </select>
  </div>

  {/* Email */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Email <span className="text-red-500">*</span>
    </label>
    <input
      type="email"
      value={formularioCita.email}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          email: e.target.value,
        }))
      }
      placeholder="juan.perez@ejemplo.com"
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>

  {/* Teléfono */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Teléfono
    </label>
    <input
      type="tel"
      value={formularioCita.telefono}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          telefono: e.target.value,
        }))
      }
      placeholder="+56 2 2345 6789"
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>

  {/* Celular */}
  <div>
    <label
      className={`block text-sm font-bold mb-2 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Celular <span className="text-red-500">*</span>
    </label>
    <input
      type="tel"
      value={formularioCita.celular}
      onChange={(e) =>
        setFormularioCita((prev) => ({
          ...prev,
          celular: e.target.value,
        }))
      }
      placeholder="+56 9 8765 4321"
      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
          : "bg-white border-gray-200 text-gray-900 focus:border-indigo-600"
      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
    />
  </div>
</div>

    {/* Botón Continuar */}
    <div className="flex justify-end pt-6">
      <button
        onClick={continuarDesdePaso1}
        disabled={
          !formularioCita.rut ||
          !formularioCita.nombre ||
          !formularioCita.apellido_paterno ||
          !formularioCita.email ||
          !formularioCita.celular ||
          !formularioCita.genero
        }
        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Continuar
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  </div>
)}


            {/* PASO 2: Seleccionar Profesional */}
            {pasoActual === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800/50' : 'bg-indigo-50/50'
                } border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <UserCheck className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <div>
                      <h3 className={`font-black text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Selecciona un Profesional
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Elige el médico con quien deseas agendar tu cita.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tipo de Atención */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Atención <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormularioCita(prev => ({ ...prev, tipo_atencion: "presencial" }))}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formularioCita.tipo_atencion === "presencial"
                          ? 'border-indigo-600 bg-indigo-600/10'
                          : darkMode
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building className={`w-8 h-8 ${
                        formularioCita.tipo_atencion === "presencial"
                          ? 'text-indigo-600'
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <div className="text-center">
                        <p className={`font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Presencial
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          En nuestras instalaciones
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setFormularioCita(prev => ({ ...prev, tipo_atencion: "telemedicina" }))}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        formularioCita.tipo_atencion === "telemedicina"
                          ? 'border-indigo-600 bg-indigo-600/10'
                          : darkMode
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MonitorPlay className={`w-8 h-8 ${
                        formularioCita.tipo_atencion === "telemedicina"
                          ? 'text-indigo-600'
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <div className="text-center">
                        <p className={`font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Telemedicina
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Consulta online por video
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Filtros de Búsqueda */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Buscar por nombre
                    </label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={filtroMedicos}
                        onChange={(e) => setFiltroMedicos(e.target.value)}
                        placeholder="Buscar médico..."
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Filtrar por especialidad
                    </label>
                    <select
                      value={filtroEspecialidad}
                      onChange={(e) => setFiltroEspecialidad(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                    >
                      <option value="">Todas las especialidades</option>
                      {especialidadesUnicas.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lista de Médicos */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {medicosFiltrados.length > 0 ? (
                    medicosFiltrados
                      .filter(medico => 
                        formularioCita.tipo_atencion === "presencial" ? true : medico.consulta_telemedicina
                      )
                      .map((medico) => (
                        <button
                          key={medico.id_medico}
                          onClick={() => handleMedicoSelect(medico)}
                          className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-105 ${
                            medicoSeleccionado?.id_medico === medico.id_medico
                              ? 'ring-4 ring-indigo-600'
                              : ''
                          } ${
                            darkMode 
                              ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' 
                              : 'bg-white hover:shadow-xl border border-gray-200'
                          }`}
                        >
                          {/* Badge de disponibilidad */}
                          {medico.acepta_nuevos_pacientes && (
                            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              Disponible
                            </div>
                          )}

                          {/* Badge de telemedicina */}
                          {medico.consulta_telemedicina && (
                            <div className="absolute top-12 right-4 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Online
                            </div>
                          )}

                          {/* Foto del médico */}
                          <div className="mb-4">
                            {medico.foto_url ? (
                              <img
                                src={medico.foto_url}
                                alt={`Dr. ${medico.nombre} ${medico.apellido_paterno}`}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Información del médico */}
                          <h3 className={`text-lg font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Dr. {medico.nombre} {medico.apellido_paterno}
                          </h3>
                          <p className={`text-sm font-bold mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {medico.especialidad}
                          </p>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              <span>{medico.anos_experiencia}+ años de experiencia</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Consulta: {medico.duracion_consulta_min} min</span>
                            </div>
                          </div>

                          {/* Botón de selección */}
                          <div className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-center group-hover:shadow-lg transition-all">
                            Seleccionar
                          </div>
                        </button>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Users className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formularioCita.tipo_atencion === "telemedicina"
                          ? "No hay médicos disponibles para telemedicina con estos filtros"
                          : "No se encontraron médicos con estos filtros"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones de navegación */}
                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setPasoActual(1)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Atrás
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Fecha y Hora */}
            {pasoActual === 3 && medicoSeleccionado && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800/50' : 'bg-indigo-50/50'
                } border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
                  <div className="flex items-start gap-4">
                    <Calendar className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <div className="flex-1">
                      <h3 className={`font-black text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Selecciona Fecha y Hora
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Con Dr. {medicoSeleccionado.nombre} {medicoSeleccionado.apellido_paterno} - {medicoSeleccionado.especialidad}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Selección de Fecha */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Selecciona una Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formularioCita.fecha_cita}
                      onChange={(e) => handleFechaSelect(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                    />
                  </div>

                  {/* Tipo de Cita */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Cita <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formularioCita.tipo_cita}
                      onChange={(e) => setFormularioCita(prev => ({ ...prev, tipo_cita: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                    >
                      <option value="primera_vez">Primera Vez</option>
                      <option value="control">Control</option>
                      <option value="procedimiento">Procedimiento</option>
                      <option value="urgencia">Urgencia</option>
                    </select>
                  </div>
                </div>

                {/* Horarios Disponibles */}
{formularioCita.fecha_cita && (
  <div>
    <label
      className={`block text-sm font-bold mb-3 ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      Horarios Disponibles
    </label>

    {loadingBloques ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span
          className={`ml-3 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Cargando horarios disponibles...
        </span>
      </div>
    ) : bloquesDisponibles.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {bloquesDisponibles.map((bloque) => {
          const hora = new Date(bloque.inicio).toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const seleccionado = bloqueSeleccionadoId === bloque.id_bloque;

          return (
            <button
              key={bloque.id_bloque}
              onClick={() => handleHoraSelect(bloque)}
              disabled={!bloque.disponible}
              className={
                !bloque.disponible
                  ? "p-4 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : seleccionado
                  ? // estado seleccionado (resaltado)
                    "p-4 rounded-xl font-bold text-white bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/30 ring-4 ring-purple-500/30 transition-all"
                  : // disponible pero no seleccionado
                  darkMode
                  ? "p-4 rounded-xl font-bold bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700 hover:border-indigo-500 hover:text-white transition-all"
                  : "p-4 rounded-xl font-bold bg-white text-gray-900 border-2 border-gray-200 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg transition-all"
              }
            >
              {hora}
            </button>
          );
        })}
      </div>
    ) : (
      <div
        className={`text-center py-12 rounded-2xl ${
          darkMode ? "bg-gray-800/50" : "bg-gray-50"
        }`}
      >
        <AlarmClock
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg font-bold ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          No hay horarios disponibles para esta fecha
        </p>
        <p
          className={`text-sm mt-2 ${
            darkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          Por favor, selecciona otra fecha
        </p>
      </div>
    )}
  </div>
)}


                {/* Motivo de Consulta */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Motivo de Consulta <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formularioCita.motivo}
                    onChange={(e) => setFormularioCita(prev => ({ ...prev, motivo: e.target.value }))}
                    placeholder="Describe brevemente el motivo de tu consulta..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all resize-none ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                  />
                </div>

                {/* Botones de navegación */}
                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setPasoActual(2)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Atrás
                  </button>

                  <button
                    onClick={() => setPasoActual(4)}
                    disabled={
                      !formularioCita.fecha_cita ||
                      !formularioCita.hora_cita ||
                      !formularioCita.motivo
                    }
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Continuar
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: Confirmación */}
            {pasoActual === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800/50' : 'bg-indigo-50/50'
                } border ${darkMode ? 'border-gray-700' : 'border-indigo-100'}`}>
                  <div className="flex items-start gap-4">
                    <ClipboardList className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <div>
                      <h3 className={`font-black text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Confirma tu Cita
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Revisa que todos los datos sean correctos antes de confirmar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumen de la Cita */}
                <div className={`p-6 rounded-2xl ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-50'
                } space-y-4`}>
                  {/* Datos del Paciente */}
                  <div>
                    <h4 className={`font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Datos del Paciente
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Nombre:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.nombre} {formularioCita.apellido_paterno} {formularioCita.apellido_materno}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          RUT:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.rut}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Email:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.email}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Celular:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.celular}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} my-4`} />

                  {/* Datos de la Cita */}
                  <div>
                    <h4 className={`font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Datos de la Cita
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Profesional:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Dr. {medicoSeleccionado?.nombre} {medicoSeleccionado?.apellido_paterno}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Especialidad:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {medicoSeleccionado?.especialidad}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Fecha:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(formularioCita.fecha_cita).toLocaleDateString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Hora:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.hora_cita}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tipo de Atención:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                          {formularioCita.tipo_atencion === "presencial" ? (
                            <>
                              <Building className="w-4 h-4" />
                              Presencial
                            </>
                          ) : (
                            <>
                              <MonitorPlay className="w-4 h-4" />
                              Telemedicina
                            </>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tipo de Cita:
                        </span>
                        <p className={`${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                          {formularioCita.tipo_cita.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} my-4`} />

                  {/* Motivo */}
                  <div>
                    <h4 className={`font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Motivo de Consulta
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formularioCita.motivo}
                    </p>
                  </div>
                </div>

                {/* Información de Seguro */}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Seguro <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["PARTICULAR", "FONASA", "ISAPRE", "OTRO"].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setFormularioCita(prev => ({ ...prev, tipo_seguro: tipo }))}
                        className={`p-4 rounded-xl font-bold transition-all ${
                          formularioCita.tipo_seguro === tipo
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                            : darkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                            : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>

                  {(formularioCita.tipo_seguro === "ISAPRE" || formularioCita.tipo_seguro === "OTRO") && (
                    <div className="mt-4">
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Número de Póliza (opcional)
                      </label>
                      <input
                        type="text"
                        value={formularioCita.numero_poliza}
                        onChange={(e) => setFormularioCita(prev => ({ ...prev, numero_poliza: e.target.value }))}
                        placeholder="Ingresa el número de póliza"
                        className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-indigo-600'
                        } focus:outline-none focus:ring-4 focus:ring-indigo-500/20`}
                      />
                    </div>
                  )}
                </div>

                {/* Términos y Condiciones */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formularioCita.acepta_terminos}
                      onChange={(e) => setFormularioCita(prev => ({ ...prev, acepta_terminos: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} group-hover:text-indigo-600 transition-colors`}>
                      Acepto los <span className="font-bold underline">términos y condiciones</span> y la <span className="font-bold underline">política de privacidad</span> del centro médico <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formularioCita.acepta_notificaciones}
                      onChange={(e) => setFormularioCita(prev => ({ ...prev, acepta_notificaciones: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} group-hover:text-indigo-600 transition-colors`}>
                      Acepto recibir recordatorios y notificaciones sobre mi cita por email, SMS o WhatsApp
                    </span>
                  </label>
                </div>

                {/* Información de Seguridad */}
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'
                }`}>
                  <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                      Tu información está segura
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Utilizamos encriptación de grado bancario para proteger tus datos personales y médicos. Cumplimos con todas las normativas de privacidad vigentes.
                    </p>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setPasoActual(3)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={loadingEnvio}
                  >
                    Atrás
                  </button>

                  <button
                    onClick={enviarFormularioCita}
                    disabled={!formularioCita.acepta_terminos || loadingEnvio}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loadingEnvio ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirmar Cita
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 5: Confirmación Final */}
            {pasoActual === 5 && citaCreada && (
              <div className="py-12 text-center animate-fadeIn">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full shadow-2xl mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className={`text-3xl md:text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¡Cita Agendada Exitosamente!
                  </h3>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto`}>
                    Tu cita ha sido confirmada. Recibirás un email y un SMS con los detalles de tu cita.
                  </p>
                </div>

                {/* Detalles de la Cita Confirmada */}
                <div className={`max-w-2xl mx-auto p-8 rounded-3xl mb-8 ${
                  darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
                } border-2 ${darkMode ? 'border-gray-700' : 'border-indigo-200'}`}>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Profesional
                        </p>
                        <p className={`font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Dr. {medicoSeleccionado?.nombre} {medicoSeleccionado?.apellido_paterno}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {medicoSeleccionado?.especialidad}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Fecha y Hora
                        </p>
                        <p className={`font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(formularioCita.fecha_cita).toLocaleDateString('es-CL', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {formularioCita.hora_cita}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                        {formularioCita.tipo_atencion === "presencial" ? (
                          <Building className="w-6 h-6 text-white" />
                        ) : (
                          <MonitorPlay className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Tipo de Atención
                        </p>
                        <p className={`font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.tipo_atencion === "presencial" ? "Presencial" : "Telemedicina"}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          {formularioCita.tipo_atencion === "presencial" 
                            ? `${centro.direccion}, ${centro.ciudad}`
                            : "Recibirás el enlace por email"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          Prevision
                        </p>
                        <p className={`font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formularioCita.tipo_seguro}
                        </p>
                        {formularioCita.numero_poliza && (
                          <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Póliza: {formularioCita.numero_poliza}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={cerrarModalAgendar}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Volver al Inicio
                  </button>

                  <a
                    href={`tel:${centro.telefono}`}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ${
                      darkMode
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-white text-gray-900 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <PhoneCall className="w-5 h-5" />
                    Llamar al Centro
                  </a>
                </div>

                {/* Información Adicional */}
                <div className={`mt-8 max-w-2xl mx-auto p-6 rounded-2xl ${
                  darkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <BellRing className={`w-5 h-5 flex-shrink-0 mt-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <div className="text-left">
                      <p className={`text-sm font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mb-2`}>
                        ¿Qué sigue ahora?
                      </p>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                        <li>• Recibirás un correo de confirmación con todos los detalles</li>
                        <li>• Te enviaremos un recordatorio 24 horas antes de tu cita</li>
                        <li>• Si es telemedicina, el enlace llegará 1 hora antes</li>
                        <li>• Puedes cancelar o reagendar llamando al {centro.telefono}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Descarga la App */}
                <div className={`mt-8 max-w-2xl mx-auto p-6 rounded-2xl ${
                  darkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <Smartphone className={`w-8 h-8 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <div className="text-left flex-1">
                      <p className={`font-black text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ¡Descarga nuestra App!
                      </p>
                      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Gestiona tus citas, accede a tu historial médico y recibe notificaciones en tiempo real.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          App Store
                        </button>
                        <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Google Play
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Navbar Premium con Glassmorphism */}
      <nav
  className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
    darkMode
      ? "bg-gray-900/80 border-gray-800"
      : "bg-white/80 border-white/50"
  } shadow-lg`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20">
      {/* Logo */}
      <div className="flex items-center gap-3">
        {centro.logo_url ? (
          <img
            src={centro.logo_url}
            alt={centro.nombre}
            className="h-12 w-auto object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        )}
        <div>
          <h1
            className={`text-lg md:text-xl font-black ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {centro.nombre}
          </h1>
          <p
            className={`text-xs ${
              darkMode ? "text-indigo-400" : "text-indigo-600"
            } font-bold`}
          >
            {centro.especializacion_principal}
          </p>
        </div>
      </div>

      {/* Función de Scroll */}
      {/* Coloca esto dentro del mismo componente, arriba del return */}
      {/* 
      const handleScrollTo = (id: string) => {
  const section = document.getElementById(id);
  if (section) {
    const yOffset = -80; // altura aprox del navbar
    const y =
      section.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

      }

      {/* Menu Desktop */}
      <div className="hidden lg:flex items-center gap-2">
        {["Inicio", "Servicios", "Profesionales", "Promociones", "Reseñas", "Contacto"].map(
          (item) => (
            <button
              key={item}
              onClick={() => {
                setActiveSection(item.toLowerCase());
                handleScrollTo(item.toLowerCase());
              }}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeSection === item.toLowerCase()
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          )
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl transition-all duration-300 ${
            darkMode
              ? "bg-gray-800 text-yellow-400"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={abrirModalAgendar}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <CalendarCheck className="w-5 h-5" />
          Agendar Cita
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`lg:hidden p-2 rounded-xl ${
          darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
        }`}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </div>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="lg:hidden py-4 space-y-2">
        {["Inicio", "Servicios", "Profesionales", "Promociones", "Reseñas", "Contacto"].map(
          (item) => (
            <button
              key={item}
              onClick={() => {
                setActiveSection(item.toLowerCase());
                handleScrollTo(item.toLowerCase());
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeSection === item.toLowerCase()
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          )
        )}
        <button
          onClick={() => {
            abrirModalAgendar();
            setMobileMenuOpen(false);
          }}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <CalendarCheck className="w-5 h-5" />
          Agendar Cita
        </button>
      </div>
    )}
  </div>
</nav>

      {/* Hero Section Premium */}
      <section id="inicio" className="relative overflow-hidden py-20 md:py-32">
        {/* Patrón de fondo animado */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tOCAwTDE4IDBoMnYzMGgtOHptMTYgMGgtMlYwaDJ2MzB6bTggMGgtMlYwaDJ2MzB6bS0yNCAwTDEwIDBoMnYzMGgtOHptMzIgMGgtMlYwaDJ2MzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Sparkles className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={`text-sm font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Centro Médico Premium
                </span>
              </div>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {centro.nombre}
              </h1>

              <p className={`text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                {centro.descripcion || `Especialistas en ${centro.especializacion_principal} con tecnología de última generación y atención personalizada.`}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {promedioCalificacion}
                    </span>
                  </div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Calificación
                  </p>
                </div>

                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {medicos.length}+
                    </span>
                  </div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Especialistas
                  </p>
                </div>

                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="w-5 h-5 text-pink-500" />
                    <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {servicios.length}+
                    </span>
                  </div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Servicios
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={abrirModalAgendar}
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Hora
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>

                <a
                  href={`tel:${centro.telefono}`}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <PhoneCall className="w-5 h-5" />
                  Llamar Ahora
                </a>
              </div>
            </div>

            {/* Imagen/Card Premium */}
            <div className="relative">
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'} p-8`}>
                {centro.logo_url ? (
                  <img
                    src={centro.logo_url}
                    alt={centro.nombre}
                    className="w-full h-auto rounded-2xl shadow-xl"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-32 h-32 text-white" />
                  </div>
                )}

                {/* Badges Flotantes */}
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Verificado
                  </div>
                  {centro.estado === 'activo' && (
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Abierto
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

       {/* Servicios Premium */}
            <section id="servicios" className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-4">
                    <Stethoscope className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Nuestros Servicios
                    </span>
                  </div>
                  <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Atención Médica Integral
                  </h2>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto`}>
                    Contamos con una amplia gama de servicios médicos especializados
                  </p>
                </div>
      
                {servicios.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.map((servicio, index) => (
                      <div
                        key={index}
                        className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' 
                            : 'bg-white/50 backdrop-blur-xl border border-white/50'
                        } shadow-xl hover:shadow-2xl`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                        
                        <div className="relative z-10">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          
                          <h3 className={`text-xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {servicio.nombre_servicio}
                          </h3>
                          
                          <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {servicio.descripcion_servicio}
                          </p>
      
                          <button className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all duration-300">
                            Más información
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center p-12 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border ${darkMode ? 'border-gray-700' : 'border-white/50'}`}>
                    <Stethoscope className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Información de servicios próximamente disponible
                    </p>
                  </div>
                )}
              </div>
            </section>
      
            {/* Profesionales Premium */}
<section
  id="profesionales"
  className={`py-20 ${darkMode ? "bg-gray-900/30" : "bg-white/30"}`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
        <Award
          className={`w-4 h-4 ${
            darkMode ? "text-purple-400" : "text-purple-600"
          }`}
        />
        <span
          className={`text-sm font-bold ${
            darkMode ? "text-purple-400" : "text-purple-600"
          }`}
        >
          Nuestro Equipo
        </span>
      </div>
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Profesionales Destacados
      </h2>
      <p
        className={`text-lg ${
          darkMode ? "text-gray-300" : "text-gray-700"
        } max-w-2xl mx-auto`}
      >
        Médicos especialistas con amplia experiencia y dedicación
      </p>
    </div>

    {medicos.length > 0 ? (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {medicos.map((medico) => (
          <div
            key={medico.id_medico}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 ${
              darkMode
                ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700"
                : "bg-white/50 backdrop-blur-xl border border-white/50"
            } shadow-xl hover:shadow-2xl`}
          >
            {/* Imagen */}
            <div className="relative h-64 overflow-hidden">
              {medico.foto_url ? (
                <img
                  src={medico.foto_url}
                  alt={`Dr. ${medico.nombre} ${medico.apellido_paterno}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <User className="w-24 h-24 text-white" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 right-4 space-y-2">
                {medico.acepta_nuevos_pacientes && (
                  <div className="px-3 py-1 bg-green-500 text-white rounded-full font-bold text-xs shadow-lg">
                    Disponible
                  </div>
                )}
                {medico.consulta_telemedicina && (
                  <div className="px-3 py-1 bg-blue-500 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    Online
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              <h3
                className={`text-lg font-black mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Dr. {medico.nombre} {medico.apellido_paterno}
              </h3>
              <p
                className={`text-sm font-bold mb-3 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}
              >
                {medico.especialidad}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Award
                  className={`w-4 h-4 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                />
                <span
                  className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {medico.anos_experiencia}+ años de experiencia
                </span>
              </div>

              <button
                onClick={() => abrirModalAgendarConDoctor(medico)}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Agendar con Dr. {medico.apellido_paterno}
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div
        className={`text-center p-12 rounded-2xl ${
          darkMode ? "bg-gray-800/50" : "bg-white/50"
        } backdrop-blur-xl border ${
          darkMode ? "border-gray-700" : "border-white/50"
        }`}
      >
        <Users
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg font-bold ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Información de profesionales próximamente disponible
        </p>
      </div>
    )}
  </div>
</section>

{/* Promociones */}
<section id="promociones" className="py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-4">
        <Gift
          className={`w-4 h-4 ${
            darkMode ? "text-orange-400" : "text-orange-600"
          }`}
        />
        <span
          className={`text-sm font-bold ${
            darkMode ? "text-orange-400" : "text-orange-600"
          }`}
        >
          Ofertas Especiales
        </span>
      </div>

      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Promociones Activas
      </h2>
    </div>

    {promociones.length > 0 ? (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promociones.map((promo) => (
          <div
            key={promo.id_promocion}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 ${
              darkMode
                ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700"
                : "bg-white/50 backdrop-blur-xl border border-white/50"
            } shadow-xl hover:shadow-2xl`}
          >
            {promo.imagen_url && (
              <img
                src={promo.imagen_url}
                alt={promo.titulo}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />
            )}

            {/* Badge de descuento */}
            <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-black text-lg shadow-lg">
              {promo.descuento}% OFF
            </div>

            <div className="p-6">
              <h3
                className={`text-xl font-black mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {promo.titulo}
              </h3>
              <p
                className={`text-sm mb-4 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {promo.descripcion}
              </p>
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Válido hasta:{" "}
                {new Date(promo.fecha_fin).toLocaleDateString("es-CL")}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div
        className={`text-center p-12 rounded-2xl ${
          darkMode ? "bg-gray-800/50" : "bg-white/50"
        } backdrop-blur-xl border ${
          darkMode ? "border-gray-700" : "border-white/50"
        } shadow-xl`}
      >
        <Gift
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg font-bold ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          No hay promociones activas en este momento
        </p>
        <p
          className={`text-sm mt-2 ${
            darkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          Vuelve pronto 😉
        </p>
      </div>
    )}
  </div>
</section>


{/* Reseñas */}
<section
  id="reseñas"
  className={`py-20 ${darkMode ? "bg-gray-900/30" : "bg-white/30"}`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-4">
        <Star
          className={`w-4 h-4 ${
            darkMode ? "text-yellow-400" : "text-yellow-600"
          }`}
        />
        <span
          className={`text-sm font-bold ${
            darkMode ? "text-yellow-400" : "text-yellow-600"
          }`}
        >
          Testimonios
        </span>
      </div>
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-black mb-4 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Lo Que Dicen Nuestros Pacientes
      </h2>
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="w-6 h-6 fill-yellow-500 text-yellow-500"
            />
          ))}
        </div>
        <span
          className={`text-2xl font-black ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {promedioCalificacion}
        </span>
        <span
          className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          ({resenas.length} reseñas)
        </span>
      </div>
    </div>

    {resenas.length > 0 ? (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resenas.slice(0, 6).map((resena) => (
          <div
            key={resena.id_resena}
            className={`p-6 rounded-2xl ${
              darkMode
                ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700"
                : "bg-white/50 backdrop-blur-xl border border-white/50"
            } shadow-xl hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < resena.calificacion
                      ? "fill-yellow-500 text-yellow-500"
                      : darkMode
                      ? "text-gray-600"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p
              className={`text-sm mb-4 italic ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              "{resena.comentario}"
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {resena.nombre_paciente}
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {new Date(resena.fecha).toLocaleDateString("es-CL")}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div
        className={`text-center p-12 rounded-2xl ${
          darkMode ? "bg-gray-800/50" : "bg-white/50"
        } backdrop-blur-xl border ${
          darkMode ? "border-gray-700" : "border-white/50"
        }`}
      >
        <Star
          className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? "text-gray-600" : "text-gray-400"
          }`}
        />
        <p
          className={`text-lg font-bold ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Sé el primero en dejar una reseña
        </p>
      </div>
    )}
  </div>
</section>

            {/* Contacto y Mapa */}
            <section id="contacto" className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Información de Contacto */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
                      <MapPin className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className={`text-sm font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Contacto
                      </span>
                    </div>
                    
                    <h2 className={`text-3xl md:text-4xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Visítanos o Contáctanos
                    </h2>
      
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dirección</h3>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {centro.direccion}<br />
                            {centro.ciudad}, {centro.region}
                          </p>
                        </div>
                      </div>
      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg flex-shrink-0">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teléfono</h3>
                          <a href={`tel:${centro.telefono}`} className="text-indigo-600 hover:underline font-bold">
                            {centro.telefono}
                          </a>
                        </div>
                      </div>
      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg flex-shrink-0">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                          <a href={`mailto:${centro.email}`} className="text-indigo-600 hover:underline font-bold">
                            {centro.email}
                          </a>
                        </div>
                      </div>
      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg flex-shrink-0">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`font-black mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Horario</h3>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {centro.dias_atencion}<br />
                            {centro.horario_apertura} - {centro.horario_cierre}
                          </p>
                        </div>
                      </div>
                    </div>
      
                    {/* Redes Sociales */}
                    <div className="flex gap-3">
                      <a href="#" className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:scale-110 transition-transform duration-300">
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a href="#" className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform duration-300">
                        <Instagram className="w-5 h-5" />
                      </a>
                      <a href="#" className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform duration-300">
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a href="#" className="p-3 bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg hover:scale-110 transition-transform duration-300">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
      
                  {/* Mapa */}
                  <div className="relative">
                    <iframe
                      src={mapsUrl}
                      className="w-full h-[450px] rounded-2xl border-0 shadow-2xl"
                      loading="lazy"
                      allowFullScreen
                    />
                    <a
                      href={mapsDirections}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Cómo llegar
                    </a>
                  </div>
                </div>
              </div>
            </section>
      {/* Footer Premium */}
            <footer className={`border-t ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-200'} backdrop-blur-xl`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                  {/* Logo y Descripción */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      {centro.logo_url ? (
                        <img src={centro.logo_url} alt={centro.nombre} className="h-10 w-auto" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {centro.nombre}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md`}>
                      {centro.descripcion?.substring(0, 150) || `Centro médico especializado en ${centro.especializacion_principal}`}...
                    </p>
                  </div>
      
                  {/* Enlaces Rápidos */}
                  <div>
                    <h3 className={`text-sm font-black uppercase mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Enlaces Rápidos
                    </h3>
                    <ul className="space-y-2">
                      {["Inicio", "Servicios", "Profesionales", "Promociones"].map((link) => (
                        <li key={link}>
                          <button
                            onClick={() => document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                            className={`text-sm hover:text-indigo-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {link}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
      
                  {/* Contacto */}
                  <div>
                    <h3 className={`text-sm font-black uppercase mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Contacto
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {centro.telefono}
                      </li>
                      <li className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {centro.email}
                      </li>
                      <li className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {centro.ciudad}, {centro.region}
                      </li>
                    </ul>
                  </div>
                </div>
      
                {/* Copyright */}
                <div className={`pt-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} text-center`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    © {new Date().getFullYear()} {centro.nombre}. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </footer>

      {/* Resto de las secciones (Servicios, Profesionales, etc.) */}
      {/* ... código existente ... */}

      {/* Modal de Agendamiento */}
      {renderModalAgendar()}

      {/* Botón Flotante de WhatsApp */}
      <a
        href={`https://wa.me/${centro.telefono.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 animate-bounce"
      >
        <MessageCircle className="w-8 h-8" />
      </a>

      {/* Botón Flotante de Agendar Cita (Mobile) */}
      <button
        onClick={abrirModalAgendar}
        className="lg:hidden fixed bottom-24 right-8 p-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        <Calendar className="w-8 h-8" />
      </button>
    </div>
  );
}

